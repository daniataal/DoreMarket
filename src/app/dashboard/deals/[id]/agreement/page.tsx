import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { notFound, redirect } from "next/navigation";
import AgreementForm from "./AgreementForm";
import AgreementView from "./AgreementView"; // Client component

export default async function AgreementPage(props: { params: Promise<{ id: string }> }) {
    const params = await props.params;
    const session = await auth();
    if (!session?.user) redirect("/login");

    const deal = await prisma.deal.findUnique({
        where: { id: params.id },
        include: { agreement: true, buyer: true }
    });

    if (!deal) notFound();

    // Ensure only the buyer can view/generate this agreement
    if (deal.buyerId !== session.user.id) {
        return <div className="p-8 text-center text-red-500">Access Denied</div>;
    }

    // Prepare default data if agreement doesn't exist
    const defaultData = {
        buyerName: `${deal.buyer?.firstName || session.user.name || ""} ${deal.buyer?.lastName || ""}`.trim(),
        sellerName: deal.company, // Assuming company is the seller
        commodity: deal.commodity,
        quantity: deal.quantity,
        pricePerKg: deal.pricePerKg,
        discount: deal.discount,
        totalPrice: deal.quantity * deal.pricePerKg * (1 - deal.discount / 100),
        dealId: deal.externalId,
        date: new Date().toISOString().split('T')[0]
    };

    return (
        <div className="max-w-4xl mx-auto py-8 px-4">
            <h1 className="text-3xl font-bold mb-6">Sale and Purchase Agreement (SPA)</h1>

            {deal.agreement ? (
                <AgreementView agreement={deal.agreement} deal={deal} />
            ) : (
                <AgreementForm deal={deal} defaultData={defaultData} />
            )}
        </div>
    );
}
