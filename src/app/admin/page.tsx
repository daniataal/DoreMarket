import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { PlusCircle, Trash2 } from "lucide-react";
import { Deal } from "@prisma/client";

export const dynamic = 'force-dynamic';

export default async function AdminDashboard() {
    const deals = await prisma.deal.findMany({
        orderBy: { createdAt: 'desc' }
    });

    return (
        <div>
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-foreground">Admin Dashboard</h1>
                    <p className="text-muted-foreground mt-1">Manage platform deals and users</p>
                </div>
                <Link
                    href="/admin/deals/create"
                    className="flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2 rounded-lg hover:bg-primary/90 transition-colors"
                >
                    <PlusCircle className="w-4 h-4" />
                    New Deal
                </Link>
            </div>

            <div className="bg-card border border-border rounded-xl shadow-sm overflow-hidden">
                <table className="w-full text-left text-sm">
                    <thead className="bg-secondary/30 border-b border-border">
                        <tr>
                            <th className="px-6 py-4 font-medium text-muted-foreground">Company</th>
                            <th className="px-6 py-4 font-medium text-muted-foreground">Commodity</th>
                            <th className="px-6 py-4 font-medium text-muted-foreground">Quantity</th>
                            <th className="px-6 py-4 font-medium text-muted-foreground">Price/kg</th>
                            <th className="px-6 py-4 font-medium text-muted-foreground">Status</th>
                            <th className="px-6 py-4 font-medium text-muted-foreground text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                        {deals.map((deal: Deal) => (
                            <tr key={deal.id} className="hover:bg-secondary/10 transition-colors">
                                <td className="px-6 py-4 font-medium text-foreground">{deal.company}</td>
                                <td className="px-6 py-4 text-foreground">
                                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary/10 text-primary">
                                        {deal.commodity}
                                    </span>
                                </td>
                                <td className="px-6 py-4 text-muted-foreground">{deal.quantity} kg</td>
                                <td className="px-6 py-4 text-muted-foreground">${deal.pricePerKg.toLocaleString()}</td>
                                <td className="px-6 py-4">
                                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${deal.status === 'OPEN'
                                        ? 'bg-emerald-500/10 text-emerald-500'
                                        : 'bg-muted text-muted-foreground'
                                        }`}>
                                        {deal.status}
                                    </span>
                                </td>
                                <td className="px-6 py-4 text-right">
                                    <button className="text-muted-foreground hover:text-destructive transition-colors">
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </td>
                            </tr>
                        ))}
                        {deals.length === 0 && (
                            <tr>
                                <td colSpan={6} className="px-6 py-12 text-center text-muted-foreground">
                                    No deals found. Create one to get started.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
