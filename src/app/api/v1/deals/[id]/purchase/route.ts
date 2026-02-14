import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";

export async function POST(
    request: NextRequest,
    props: { params: Promise<{ id: string }> }
) {
    try {
        const session = await auth();
        if (!session?.user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const params = await props.params;
        const dealId = params.id;
        const body = await request.json();
        const { quantity, deliveryLocation, agreementTerms } = body;

        if (!quantity || quantity <= 0) {
            return NextResponse.json({ error: "Invalid quantity" }, { status: 400 });
        }

        // 1. Verify Deal exists and is OPEN
        const deal = await prisma.deal.findUnique({
            where: { id: dealId }
        });

        if (!deal) {
            return NextResponse.json({ error: "Deal not found" }, { status: 404 });
        }

        if (deal.status !== "OPEN") {
            return NextResponse.json({ error: "Deal is not available" }, { status: 400 });
        }

        // 2. Check available quantity
        if (quantity > deal.availableQuantity) {
            return NextResponse.json({
                error: `Only ${deal.availableQuantity} kg available`
            }, { status: 400 });
        }

        // 3. Calculate cost
        const finalPrice = deal.pricePerKg * (1 - deal.discount / 100);
        const totalCost = quantity * finalPrice;

        // 4. Check user balance
        const buyer = await prisma.user.findUnique({
            where: { id: session.user.id }
        });

        if (!buyer || buyer.balance < totalCost) {
            return NextResponse.json({
                error: "Insufficient balance"
            }, { status: 400 });
        }

        // 5. Create Purchase record and update deal/user in a transaction
        const result = await prisma.$transaction(async (tx) => {
            // Deduct from user balance
            await tx.user.update({
                where: { id: session.user.id },
                data: { balance: { decrement: totalCost } }
            });

            // Create Purchase record
            const purchase = await tx.purchase.create({
                data: {
                    dealId: deal.id,
                    buyerId: session.user.id,
                    quantity,
                    pricePerKg: finalPrice,
                    totalPrice: totalCost,
                    deliveryLocation: deliveryLocation || deal.deliveryLocation,
                    status: "CONFIRMED"
                }
            });

            // Update deal's available quantity
            const updatedDeal = await tx.deal.update({
                where: { id: dealId },
                data: {
                    availableQuantity: { decrement: quantity }
                }
            });

            // If deal is now fully sold, update status to CLOSED
            if (updatedDeal.availableQuantity <= 0) {
                await tx.deal.update({
                    where: { id: dealId },
                    data: {
                        status: "CLOSED",
                        buyerId: session.user.id // Last buyer becomes the deal owner
                    }
                });
            }

            return { purchase, updatedDeal, soldOut: updatedDeal.availableQuantity <= 0 };
        });

        // 6. Create Pending Export for Admin Review
        // Instead of immediately exporting, create a pending export record
        try {
            await prisma.pendingExport.create({
                data: {
                    purchaseId: result.purchase.id,
                    dealId: deal.id,
                    cfType: "Metals",
                    cfName: `${deal.company} - ${deal.commodity} ${deal.type} (${quantity}kg)`,
                    cfIcon: deal.cfIcon,
                    cfRisk: deal.cfRisk,
                    cfTargetApy: deal.cfTargetApy,
                    cfDuration: deal.cfDuration,
                    cfMinInvestment: deal.cfMinInvestment,
                    cfAmountRequired: totalCost,
                    cfDescription: `Secured ${deal.commodity} ${deal.type} purchase from ${deal.company}. Purity: ${(deal.purity * 100).toFixed(2)}%. Quantity: ${quantity}kg. Delivery: ${deliveryLocation || deal.deliveryLocation}.`,
                    cfOrigin: deal.cfOrigin,
                    cfDestination: deliveryLocation || deal.deliveryLocation,
                    cfTransportMethod: deal.cfTransportMethod,
                    cfMetalForm: deal.type,
                    cfPurityPercent: deal.purity * 100,
                    status: "PENDING"
                }
            });

            console.log(`[Marketplace] Created pending export for purchase ${result.purchase.id}. Awaiting admin review.`);
        } catch (err: any) {
            console.error(`[Marketplace] Failed to create pending export:`, err.message);
        }

        // 7. Create Agreement (SPA) if terms provided
        if (agreementTerms) {
            try {
                // Extract buyer name from agreement terms (it's in the format "BUYER: Name")
                const buyerMatch = agreementTerms.match(/BUYER:\s*(.+)/);
                const sellerMatch = agreementTerms.match(/SELLER:\s*(.+)/);
                const buyerName = buyerMatch ? buyerMatch[1].trim() : buyer.name || 'Buyer';
                const sellerName = sellerMatch ? sellerMatch[1].trim() : deal.company;

                await prisma.agreement.create({
                    data: {
                        dealId: deal.id,
                        buyerName: buyerName,
                        sellerName: sellerName,
                        agreementDate: new Date(),
                        terms: agreementTerms,
                        status: 'SIGNED'
                    }
                });

                console.log(`[Marketplace] Created signed SPA for deal ${deal.id}`);
            } catch (err: any) {
                console.error(`[Marketplace] Failed to create agreement:`, err.message);
                // Don't fail the purchase if agreement creation fails
            }
        }

        return NextResponse.json({
            success: true,
            purchase: result.purchase,
            availableQuantity: result.updatedDeal.availableQuantity,
            soldOut: result.soldOut,
            message: `Purchase confirmed! Export pending admin review before being sent to crowdfunding platform.`
        });

    } catch (error) {
        console.error("Purchase error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
