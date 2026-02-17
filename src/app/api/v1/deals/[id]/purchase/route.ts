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
        const d = deal as any;
        if (quantity > d.availableQuantity) {
            return NextResponse.json({
                error: `Only ${d.availableQuantity} kg available`
            }, { status: 400 });
        }

        // 3. Calculate cost
        const { GoldPriceService } = await import("@/lib/services/gold-price");
        let finalPrice = d.pricePerKg;

        if (d.pricingModel === 'DYNAMIC') {
            const livePrice = await GoldPriceService.getLivePricePerKg();
            finalPrice = GoldPriceService.calculateDealPrice(livePrice, d.purity, d.discount);
        }

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

            // 4. Create Notification
            await (tx as any).notification.create({
                data: {
                    userId: session.user.id,
                    title: "Purchase Successful",
                    message: `You have successfully purchased ${quantity}kg of gold for $${totalCost.toLocaleString()}.`,
                    type: "SUCCESS",
                    link: "/orders"
                }
            });

            return { purchase, updatedDeal, soldOut: updatedDeal.availableQuantity <= 0 };
        });

        // 6. Create Pending Export for Admin Review
        // Instead of immediately exporting, create a pending export record
        try {
            await (prisma as any).pendingExport.create({
                data: {
                    purchaseId: result.purchase.id,
                    dealId: deal.id,
                    cfType: "Metals",
                    cfName: `${d.company} - ${d.commodity} ${d.type} (${quantity}kg)`,
                    cfIcon: d.cfIcon,
                    cfRisk: d.cfRisk,
                    cfTargetApy: d.cfTargetApy,
                    cfDuration: d.cfDuration,
                    cfMinInvestment: d.cfMinInvestment,
                    cfAmountRequired: totalCost,
                    cfDescription: `Secured ${d.commodity} ${d.type} purchase from ${d.company}. Purity: ${(d.purity * 100).toFixed(2)}%. Quantity: ${quantity}kg. Delivery: ${deliveryLocation || d.deliveryLocation}.`,
                    cfOrigin: d.cfOrigin,
                    cfDestination: deliveryLocation || d.deliveryLocation,
                    cfTransportMethod: d.cfTransportMethod,
                    cfMetalForm: d.type,
                    cfPurityPercent: d.purity * 100,
                    status: "PENDING"
                }
            });

            console.log(`[DoreMarket] Created pending export for purchase ${result.purchase.id}. Awaiting admin review.`);
        } catch (err: any) {
            console.error(`[DoreMarket] Failed to create pending export:`, err.message);
        }

        // 7. Create Agreement (SPA) record if terms provided
        if (agreementTerms) {
            try {
                // Extract buyer name from agreement terms (it's in the format "BUYER: Name")
                const buyerMatch = agreementTerms.match(/BUYER:\s*(.+)/);
                const sellerMatch = agreementTerms.match(/SELLER:\s*(.+)/);
                const buyerName = buyerMatch ? buyerMatch[1].trim() : `${buyer?.firstName || buyer?.name || ''} ${buyer?.lastName || ''}`.trim() || 'Buyer';
                const sellerName = sellerMatch ? sellerMatch[1].trim() : deal.company;

                // Create a snapshot of SPA variables to "freeze" the agreement
                const spaData = {
                    DEAL_ID: deal.externalId || deal.id,
                    DATE: new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }),
                    SELLER_NAME: sellerName,
                    SELLER_ADDRESS: process.env.SELLER_ADDRESS || "Meydan Grandstand, Dubai, UAE",
                    SELLER_TRADE_LICENCE: process.env.SELLER_TRADE_LICENSE || "2537157.01",
                    SELLER_REPRESENTATIVE: process.env.SELLER_REPRESENTATIVE || "Thalefo Moshanyana",
                    SELLER_PASSPORT_NUMBER: process.env.SELLER_PASSPORT_NUMBER || "A11611955",
                    SELLER_PASSPORT_EXPIRY: process.env.SELLER_PASSPORT_EXPIRY || "13/11/2034",
                    SELLER_COUNTRY: process.env.SELLER_COUNTRY || "UAE",
                    SELLER_TELEPHONE: process.env.SELLER_TELEPHONE || "(+27) 063 638 9245",
                    SELLER_EMAIL: process.env.SELLER_EMAIL || "",
                    BUYER_NAME: buyerName,
                    BUYER_ADDRESS: buyer?.address || "[Buyer Address to be provided]",
                    BUYER_TRADE_LICENCE: "[Buyer Trade Licence to be provided]",
                    BUYER_REPRESENTED_BY: buyerName,
                    BUYER_COUNTRY: buyer?.nationality || "[Buyer Country to be provided]",
                    BUYER_TELEPHONE: "[Buyer Telephone to be provided]",
                    BUYER_EMAIL: buyer?.email || "",
                    AU_PURITY: `${(d.purity * 100).toFixed(2)}%`,
                    AU_FINESSE: d.purity >= 0.9999 ? "24 Carat" : "+23 Carats",
                    AU_ORIGIN: d.cfOrigin || "Not Specified",
                    AU_ORIGIN_PORT: d.cfOriginPort || "Not Specified",
                    AU_DELIVERY_PORT: "DXB – Dubai International Airport",
                    AU_DESTINATION: deliveryLocation || deal.deliveryLocation,
                    QUANTITY: quantity.toString(),
                    PRICE: `$${deal.pricePerKg.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} USD/kg`,
                    DELIVERY_COUNTRY: "UAE", // Simplified or derived from location
                    DURATION: d.frequency === 'SPOT' ? "One-time" : `${d.contractDuration || 1} Year`,
                    EXTENSIONS: d.frequency === 'SPOT' ? "None" : `${d.extensionYears || 5} Years Rolling`,
                    TOTAL_QUANTITY: `${(d.totalQuantity || (d.frequency === 'SPOT' ? quantity : quantity * 12)).toLocaleString()} kg`,
                    FREQUENCY: d.frequency || 'SPOT'
                };

                // Create Agreement record linked to Purchase
                await (prisma as any).agreement.create({
                    data: {
                        purchaseId: result.purchase.id,
                        buyerName: buyerName,
                        sellerName: sellerName,
                        agreementDate: new Date(),
                        terms: agreementTerms,
                        spaData: spaData,
                        status: 'SIGNED',
                        pdfUrl: null
                    }
                });

                console.log(`[DoreMarket] Created and SIGNED Agreement record for deal ${deal.id}`);
            } catch (err: any) {
                console.error(`[DoreMarket] Failed to create agreement record:`, err.message);
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
