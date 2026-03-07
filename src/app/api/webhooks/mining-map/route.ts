import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import crypto from 'crypto';

export async function POST(request: Request) {
    try {
        const payload = await request.json();

        // Create the deal automatically!
        const externalId = `MM-${payload.listing_id.substring(0, 8)}-${Date.now()}`;

        // The Mining Map will only send deals when they are officially 'PURCHASED'
        const newDeal = await prisma.deal.create({
            data: {
                externalId: externalId,
                company: "Mining Map Artisanal Network",
                commodity: payload.product || 'Gold',
                quantity: payload.tested_weight,
                availableQuantity: payload.tested_weight,
                pricePerKg: payload.tested_purity ? (payload.final_offer / payload.tested_weight) : payload.price_per_kg,
                discount: 0,
                status: "OPEN",
                type: payload.product === 'Dore' ? "DORE" : "BULLION",
                purity: payload.tested_purity || 0.90, // reasonable default if unsent
                deliveryLocation: "Mining Map Local Vault",
                cfOrigin: payload.origin || "Artisanal Mine",
                cfTransportMethod: "Secure Ground Transfer",
                totalValue: payload.final_offer,
                marketPrice: payload.final_offer / payload.tested_weight,
            }
        });

        return NextResponse.json({ success: true, dealId: newDeal.id, externalId: externalId });
    } catch (error) {
        console.error("Mining Map Webhook Error:", error);
        return NextResponse.json({ success: false, error: String(error) }, { status: 500 });
    }
}
