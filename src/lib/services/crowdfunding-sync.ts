import { prisma } from "@/lib/prisma";

export class CrowdfundingSyncService {
    /**
     * Enqueues a sync job in the database
     */
    static async enqueueJob(type: 'CROWDFUNDING_POST' | 'CROWDFUNDING_PATCH', payload: any) {
        console.log(`[SyncService] Enqueueing job ${type}`);
        return await prisma.syncJob.create({
            data: {
                type,
                payload: payload as any,
                status: 'PENDING'
            }
        });
    }

    /**
     * Processing logic for individual jobs
     */
    static async processJob(jobId: string) {
        const job = await prisma.syncJob.findUnique({ where: { id: jobId } });
        if (!job || job.status === 'COMPLETED') return;

        await prisma.syncJob.update({
            where: { id: jobId },
            data: { status: 'PROCESSING', attempts: { increment: 1 } }
        });

        try {
            const CROWDFUNDING_API = process.env.CROWDFUNDING_API_URL || "http://localhost:3000/api/marketplace/commodities";
            const method = job.type === 'CROWDFUNDING_POST' ? 'POST' : 'PATCH';

            const response = await fetch(CROWDFUNDING_API, {
                method,
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(job.payload)
            });

            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`API error (${response.status}): ${errorText}`);
            }

            await prisma.syncJob.update({
                where: { id: jobId },
                data: { status: 'COMPLETED', updatedAt: new Date() }
            });

            console.log(`[SyncService] Job ${jobId} (${job.type}) completed successfully.`);
        } catch (error: any) {
            console.error(`[SyncService] Job ${jobId} failed:`, error.message);
            const isFinalAttempt = job.attempts + 1 >= job.maxAttempts;
            await prisma.syncJob.update({
                where: { id: jobId },
                data: {
                    status: isFinalAttempt ? 'FAILED' : 'PENDING',
                    lastError: error.message,
                    updatedAt: new Date()
                }
            });
        }
    }

    /**
     * Background worker trigger (can be called by a cron or manually)
     */
    static async runWorker() {
        const pendingJobs = await prisma.syncJob.findMany({
            where: { status: 'PENDING' },
            orderBy: { createdAt: 'asc' },
            take: 10
        });

        if (pendingJobs.length === 0) return;

        console.log(`[SyncService] Worker starting. Processing ${pendingJobs.length} jobs...`);
        for (const job of pendingJobs) {
            await this.processJob(job.id);
        }
    }

    /**
     * Marks a shipment as ARRIVED in the crowdfunding platform (via Queue)
     */
    static async syncDeliveryToCrowdfunding(purchaseId: string) {
        const payload = { shipmentId: purchaseId, status: "ARRIVED" };
        const job = await this.enqueueJob('CROWDFUNDING_PATCH', payload);
        // Fire and forget processing (or wait for cron)
        this.processJob(job.id).catch(e => console.error("Async job processing failed", e));
    }

    /**
     * Re-pushes a periodic deal by either queueing a direct push or creating a pending export
     */
    static async repushPeriodicDeal(lastPurchaseId: string) {
        try {
            // 1. Sync current delivery
            await this.syncDeliveryToCrowdfunding(lastPurchaseId);

            const lastPurchase = await prisma.purchase.findUnique({
                where: { id: lastPurchaseId },
                include: { deal: true }
            });

            if (!lastPurchase) return;
            const { deal } = lastPurchase;
            const d = deal as any;

            if (d.frequency === 'SPOT') return;

            // 2. Validation
            const allPurchases = await prisma.purchase.findMany({
                where: { dealId: d.id, status: 'DELIVERED' }
            });
            const totalDelivered = allPurchases.reduce((acc, p) => acc + p.quantity, 0);

            if (d.totalQuantity && totalDelivered >= d.totalQuantity) return;
            const expiryDate = new Date(d.createdAt);
            expiryDate.setFullYear(expiryDate.getFullYear() + (d.contractDuration || 1));
            if (new Date() > expiryDate) return;

            // 3. Create next purchase
            const nextPurchase = await prisma.purchase.create({
                data: {
                    dealId: d.id,
                    buyerId: lastPurchase.buyerId,
                    quantity: lastPurchase.quantity,
                    pricePerKg: lastPurchase.pricePerKg,
                    totalPrice: lastPurchase.totalPrice,
                    deliveryLocation: lastPurchase.deliveryLocation,
                    status: "CONFIRMED"
                }
            });

            const exportData = {
                purchaseId: nextPurchase.id,
                dealId: d.id,
                cfType: d.commodity,
                cfName: `${d.company} - ${d.commodity} ${d.type === 'BULLION' ? 'Bullion' : 'Dore'} (${nextPurchase.quantity}kg)`,
                cfIcon: d.cfIcon,
                cfRisk: d.cfRisk,
                cfTargetApy: d.cfTargetApy,
                cfDuration: d.cfDuration,
                cfMinInvestment: d.cfMinInvestment,
                cfAmountRequired: nextPurchase.totalPrice,
                cfDescription: `Secured ${d.commodity} ${d.type === 'BULLION' ? 'Bullion' : 'Dore'} from ${d.company}. Purity: ${(d.purity * 100).toFixed(2)}%. Quantity: ${nextPurchase.quantity}kg. Delivery: ${nextPurchase.deliveryLocation}.`,
                cfOrigin: d.cfOrigin,
                cfDestination: nextPurchase.deliveryLocation,
                cfTransportMethod: d.cfTransportMethod,
                cfMetalForm: d.type === 'BULLION' ? 'Bullion' : 'Dore',
                cfPurityPercent: d.purity * 100
            };

            // 4. Decision: Auto-Push or Manual
            if (d.autoSync) {
                console.log(`[SyncService] Deal ${d.id} has Auto-Sync enabled. Queueing direct push.`);

                // Properly map payload for the Crowdfunding API
                const apiPayload = {
                    type: exportData.cfType,
                    name: exportData.cfName,
                    icon: exportData.cfIcon,
                    risk: exportData.cfRisk,
                    targetApy: exportData.cfTargetApy,
                    duration: exportData.cfDuration,
                    minInvestment: exportData.cfMinInvestment,
                    amountRequired: exportData.cfAmountRequired,
                    description: exportData.cfDescription,
                    origin: exportData.cfOrigin,
                    destination: exportData.cfDestination,
                    transportMethod: exportData.cfTransportMethod,
                    metalForm: exportData.cfMetalForm,
                    purityPercent: exportData.cfPurityPercent,
                    shipmentId: exportData.purchaseId
                };

                const job = await this.enqueueJob('CROWDFUNDING_POST', apiPayload);

                // Track in PendingExport table for history
                await (prisma as any).pendingExport.create({
                    data: {
                        ...exportData,
                        status: "EXPORTED", // We mark it exported because it's queued
                        reviewedBy: "SYSTEM-AUTO"
                    }
                });

                // Immediate attempt
                this.processJob(job.id).catch(e => console.error("Async job processing failed", e));
            } else {
                console.log(`[SyncService] Deal ${d.id} requires manual approval. Creating PENDING export.`);
                await (prisma as any).pendingExport.create({
                    data: { ...exportData, status: "PENDING" }
                });
            }

        } catch (error) {
            console.error('[SyncService] Error in repushPeriodicDeal:', error);
        }
    }
}
