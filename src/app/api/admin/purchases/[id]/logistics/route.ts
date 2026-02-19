import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";

export async function POST(
    req: NextRequest,
    props: { params: Promise<{ id: string }> }
) {
    const params = await props.params;
    try {
        const session = await auth();

        // Check if user is admin
        if (!session?.user || session.user.role !== 'ADMIN') {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const purchaseId = params.id;
        const body = await req.json();
        const {
            status,
            logisticsCompany,
            trackingNumber,
            shippedAt,
            deliveredAt,
            logisticsNotes
        } = body;

        // Validate status
        const validStatuses = ['PENDING', 'CONFIRMED', 'SHIPPED', 'DELIVERED'];
        if (status && !validStatuses.includes(status)) {
            return NextResponse.json({ error: "Invalid status" }, { status: 400 });
        }

        // 1. Get current purchase to check status change
        const currentPurchase = await prisma.purchase.findUnique({
            where: { id: purchaseId }
        });

        if (!currentPurchase) {
            return NextResponse.json({ error: "Purchase not found" }, { status: 404 });
        }

        // 2. Update purchase logistics
        const purchase = await prisma.purchase.update({
            where: { id: purchaseId },
            data: {
                status: status || undefined,
                logisticsCompany: logisticsCompany,
                trackingNumber: trackingNumber,
                shippedAt: shippedAt ? new Date(shippedAt) : null,
                deliveredAt: deliveredAt ? new Date(deliveredAt) : null,
                logisticsNotes: logisticsNotes
            },
            include: {
                buyer: {
                    select: {
                        id: true,
                        name: true,
                        email: true
                    }
                },
                deal: true
            }
        });

        // 3. If status JUST changed to DELIVERED and deal is periodic, trigger repush
        if (status === 'DELIVERED' && currentPurchase.status !== 'DELIVERED') {
            const { CrowdfundingSyncService } = await import("@/lib/services/crowdfunding-sync");
            // Run in background
            CrowdfundingSyncService.repushPeriodicDeal(purchase.id).catch(err => {
                console.error('[Admin] Failed to trigger periodic repush:', err);
            });
        }

        return NextResponse.json({
            success: true,
            purchase,
            message: "Logistics updated successfully"
        });

    } catch (error) {
        console.error("Logistics update error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
