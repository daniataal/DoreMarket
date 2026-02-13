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
        if (!session?.user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const dealId = params.id;
        const data = await req.json();

        // Verify ownership
        const deal = await prisma.deal.findUnique({
            where: { id: dealId },
            include: { agreement: true }
        });

        if (!deal) return NextResponse.json({ error: "Deal not found" }, { status: 404 });
        if (deal.buyerId !== session.user.id) return NextResponse.json({ error: "Unauthorized" }, { status: 403 });

        // Update or Create Agreement
        // We expect the frontend to send the 'terms' or 'htmlContent' (though storing HTML in DB is risky, usually we store data points)
        // For this MVP, we store the full text terms.

        const agreement = await prisma.agreement.upsert({
            where: { dealId: dealId },
            update: {
                buyerName: data.buyerName,
                sellerName: data.sellerName,
                agreementDate: new Date(data.date),
                terms: data.terms,
                status: "SIGNED" // Auto-sign for now
            },
            create: {
                dealId: dealId,
                buyerName: data.buyerName,
                sellerName: data.sellerName,
                agreementDate: new Date(data.date),
                terms: data.terms,
                status: "SIGNED"
            }
        });

        return NextResponse.json({ success: true, agreement });

    } catch (error) {
        console.error("Agreement error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
