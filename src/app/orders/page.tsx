import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import Navbar from "@/components/Navbar";
import { Package, Calendar, DollarSign, Weight } from "lucide-react";

export const dynamic = 'force-dynamic';

export default async function OrdersPage() {
    const session = await auth();

    if (!session?.user?.id) {
        return <div>Please log in to view orders.</div>;
    }

    const orders = await prisma.deal.findMany({
        where: {
            buyerId: session.user.id,
            status: { in: ['CLOSED', 'EXPORTED'] }
        },
        orderBy: { updatedAt: 'desc' }
    });

    return (
        <div className="min-h-screen bg-background relative overflow-hidden">
            {/* Ambient Lighting Engine */}
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-accent/5 via-background/0 to-background/0 pointer-events-none z-0" />
            <div className="absolute top-[20%] left-[10%] w-[300px] h-[300px] bg-primary/10 rounded-full blur-[80px] pointer-events-none z-0 opacity-40" />

            <Navbar user={session?.user} />

            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 relative z-10">
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-foreground">My Orders</h1>
                    <p className="text-muted-foreground mt-1">Track your purchased commodities</p>
                </div>

                <div className="space-y-4">
                    {orders.length === 0 ? (
                        <div className="bg-card border border-dashed border-border rounded-xl p-12 text-center">
                            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-secondary mb-4">
                                <Package className="w-8 h-8 text-muted-foreground" />
                            </div>
                            <h3 className="text-lg font-medium text-foreground">No orders yet</h3>
                            <p className="text-muted-foreground mt-1">Visit the dashboard to start trading.</p>
                        </div>
                    ) : (
                        orders.map((deal) => (
                            <div key={deal.id} className="bg-card border border-border rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow flex flex-col md:flex-row md:items-center justify-between gap-6">
                                <div className="flex-1">
                                    <div className="flex items-center gap-3 mb-2">
                                        <span className="text-xs font-bold px-2 py-1 rounded bg-primary/10 text-primary uppercase tracking-wider">
                                            {deal.commodity}
                                        </span>
                                        <span className="text-xs text-muted-foreground flex items-center gap-1">
                                            <Calendar className="w-3 h-3" />
                                            {new Date(deal.updatedAt).toLocaleDateString()}
                                        </span>
                                    </div>
                                    <h3 className="text-xl font-bold text-foreground">{deal.company}</h3>
                                    <p className="text-sm text-muted-foreground">ID: {deal.externalId}</p>
                                </div>

                                <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
                                    <div>
                                        <p className="text-xs text-muted-foreground mb-1 flex items-center gap-1">
                                            <Weight className="w-3 h-3" /> Quantity
                                        </p>
                                        <p className="font-mono text-foreground font-medium">{deal.quantity} kg</p>
                                    </div>
                                    <div>
                                        <p className="text-xs text-muted-foreground mb-1 flex items-center gap-1">
                                            <DollarSign className="w-3 h-3" /> Total Value
                                        </p>
                                        <p className="font-mono text-accent font-bold">
                                            ${(deal.quantity * deal.pricePerKg * (1 - deal.discount / 100)).toLocaleString()}
                                        </p>
                                    </div>
                                    <div className="flex flex-col gap-2">
                                        <div>
                                            <p className="text-xs text-muted-foreground mb-1">Status</p>
                                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
                                                Purchased
                                            </span>
                                        </div>
                                        <a
                                            href={`/dashboard/deals/${deal.id}/agreement`}
                                            className="text-xs text-center border border-primary text-primary hover:bg-primary/10 px-3 py-1.5 rounded-md transition-colors"
                                        >
                                            View Agreement
                                        </a>
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </main>
        </div>
    );
}
