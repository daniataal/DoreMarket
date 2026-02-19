import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { event, shipmentId, commodityId, amount } = body;

        console.log(`[Webhook] Received crowdfunding event: ${event} for shipment ${shipmentId}`);

        if (event === "COMMODITY_FUNDED") {
            // Find the purchase by ID
            const purchaseId = shipmentId;
            const purchase = await prisma.purchase.findUnique({
                where: { id: purchaseId },
                include: { deal: true }
            });

            if (!purchase) {
                return NextResponse.json({ error: "Purchase not found" }, { status: 404 });
            }

            // Automate: Update status to CONFIRMED (if it was PENDING)
            // This signifies it's now funded and ready for logistics processing
            if (purchase.status === "PENDING") {
                await prisma.purchase.update({
                    where: { id: purchaseId },
                    data: {
                        status: "CONFIRMED",
                        logisticsNotes: (purchase.logisticsNotes || "") + "\n[System] Automatically confirmed: Tranche fully funded on Crowdfunding."
                    }
                });
                console.log(`[Webhook] Purchase ${purchaseId} automatically CONFIRMED via funding webhook.`);
            }

            // Also update the PendingExport status if it exists
            await prisma.pendingExport.updateMany({
                where: { purchaseId: purchaseId },
                data: {
                    status: "EXPORTED",
                    crowdfundingId: commodityId
                }
            });

            return NextResponse.json({ success: true, message: "Webhook processed" });
        }

        return NextResponse.json({ success: false, error: "Unknown event" }, { status: 400 });

    } catch (error) {
        console.error("[Webhook] Error processing crowdfunding webhook:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
