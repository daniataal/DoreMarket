import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { Plus, Pencil } from "lucide-react";
import { DeleteDealButton } from "@/components/admin/DeleteDealButton";

export const dynamic = 'force-dynamic';

export default async function AdminDealsPage() {
    const deals = await prisma.deal.findMany({
        orderBy: { createdAt: 'desc' },
        include: { _count: { select: { purchases: true } } }
    });

    return (
        <div className="max-w-7xl mx-auto">
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h1 className="text-3xl font-bold text-foreground">Manage Deals</h1>
                    <p className="text-muted-foreground mt-1">View, edit, and delete commodity listings</p>
                </div>
                <Link href="/admin/deals/create" className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 transition-colors">
                    <Plus className="w-4 h-4" />
                    Create New Deal
                </Link>
            </div>

            <div className="bg-card border border-border rounded-xl shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-secondary/50 text-muted-foreground text-xs uppercase tracking-wider">
                            <tr>
                                <th className="px-6 py-4 font-semibold">Deal Info</th>
                                <th className="px-6 py-4 font-semibold">Type/Pricing</th>
                                <th className="px-6 py-4 font-semibold">Availability</th>
                                <th className="px-6 py-4 font-semibold">Status</th>
                                <th className="px-6 py-4 font-semibold text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border">
                            {deals.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="px-6 py-12 text-center text-muted-foreground">
                                        No deals found. Create one to get started.
                                    </td>
                                </tr>
                            ) : (
                                deals.map((deal: any) => (
                                    <tr key={deal.id} className="hover:bg-secondary/20 transition-colors">
                                        <td className="px-6 py-4">
                                            <div className="font-medium text-foreground">{deal.company}</div>
                                            <div className="text-sm text-muted-foreground flex items-center gap-2">
                                                {deal.commodity}
                                                <span className={`text-[10px] px-1.5 py-0.5 rounded ${deal.frequency === 'SPOT' ? 'bg-secondary text-muted-foreground' : 'bg-primary/10 text-primary'}`}>
                                                    {deal.frequency || 'SPOT'}
                                                </span>
                                            </div>
                                            <div className="text-xs font-mono text-muted-foreground mt-1">{deal.externalId}</div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="text-sm font-medium">{deal.type || 'BULLION'}</div>
                                            <div className="text-xs text-muted-foreground">
                                                {deal.pricingModel === 'DYNAMIC' ? (
                                                    <span className="text-blue-500 font-bold flex items-center gap-1">
                                                        LIVE LBMA
                                                    </span>
                                                ) : (
                                                    <span>Fixed: ${deal.pricePerKg.toLocaleString()}/kg</span>
                                                )}
                                            </div>
                                            {deal.pricingModel !== 'FIXED' && (
                                                <div className="text-xs text-accent mt-0.5">-{deal.discount}% Desc</div>
                                            )}
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-2">
                                                <div className="w-full max-w-[100px] h-1.5 bg-secondary rounded-full overflow-hidden">
                                                    <div
                                                        className="h-full bg-primary"
                                                        style={{ width: `${(deal.availableQuantity / deal.quantity) * 100}%` }}
                                                    />
                                                </div>
                                                <span className="text-xs text-muted-foreground whitespace-nowrap">
                                                    {deal.availableQuantity} / {deal.quantity} kg
                                                </span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${deal.status === 'OPEN' ? 'bg-emerald-500/10 text-emerald-500' :
                                                deal.status === 'CLOSED' ? 'bg-secondary text-muted-foreground' :
                                                    'bg-yellow-500/10 text-yellow-500'
                                                }`}>
                                                {deal.status}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <div className="flex items-center justify-end gap-2">
                                                <Link
                                                    href={`/admin/deals/${deal.id}/edit`}
                                                    className="p-2 text-muted-foreground hover:text-foreground hover:bg-secondary rounded-lg transition-colors"
                                                    title="Edit Deal"
                                                >
                                                    <Pencil className="w-4 h-4" />
                                                </Link>
                                                <DeleteDealButton id={deal.id} title={deal.company} hasPurchases={deal._count.purchases > 0} />
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}


