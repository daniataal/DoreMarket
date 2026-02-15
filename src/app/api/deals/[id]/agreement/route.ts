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

        // Deprecated: Agreement is now linked to Purchase.
        // This route is obsolete and should be removed.
        return NextResponse.json({ success: true, message: "Obsolete route" });
        /*
        const agreement = await prisma.agreement.upsert({
            where: { purchaseId: dealId }, // This is doubly wrong now
            update: {
                buyerName: data.buyerName,
                sellerName: data.sellerName,
                agreementDate: new Date(data.date),
                terms: data.terms,
                status: "SIGNED"
            },
            create: {
                purchaseId: dealId,
                buyerName: data.buyerName,
                sellerName: data.sellerName,
                agreementDate: new Date(data.date),
                terms: data.terms,
                status: "SIGNED"
            }
        });
        */

        return NextResponse.json({ success: true, agreement: null });

    } catch (error) {
        console.error("Agreement error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
