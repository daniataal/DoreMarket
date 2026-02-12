import { prisma } from "@/lib/prisma";
import ClientBuyButton from "@/components/ClientBuyWrapper";
import { auth } from "@/auth";
import Navbar from "@/components/Navbar";
import { getWalletData } from "@/actions/wallet";
import { WalletCard } from "@/components/WalletCard";
import { RefreshCcw } from "lucide-react";

export const dynamic = 'force-dynamic';

export default async function Dashboard() {
    const session = await auth();
    const walletData = await getWalletData();
    const deals = await prisma.deal.findMany({
        orderBy: { createdAt: 'desc' },
        where: { status: 'OPEN' } // Only show open deals
    });

    return (
        <div className="min-h-screen bg-background relative overflow-hidden">
            {/* Ambient Lighting Engine */}
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-accent/5 via-background/0 to-background/0 pointer-events-none z-0" />
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[600px] bg-primary/20 rounded-full blur-[120px] pointer-events-none z-0 opacity-40 mix-blend-screen" />

            <Navbar user={session?.user} />

            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
                {/* Wallet Section */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="md:col-span-1">
                        <WalletCard initialData={walletData} />
                    </div>

                    {/* Placeholder for future Chart/Stats */}
                    <div className="md:col-span-2 bg-card/30 backdrop-blur-md border border-border/50 rounded-2xl p-6 min-h-[200px] flex items-center justify-center text-muted-foreground">
                        Market Trends Chart (Coming Soon)
                    </div>
                </div>

                <div>
                    <div className="flex justify-between items-center mb-6">
                        <div>
                            <h2 className="text-2xl font-bold text-foreground">Live Market</h2>
                            <p className="text-muted-foreground">Real-time commodity listings</p>
                        </div>
                        <button className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-primary bg-primary/10 rounded-lg hover:bg-primary/20 transition-colors">
                            <RefreshCcw className="w-4 h-4" />
                            Refresh
                        </button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {deals.length === 0 ? (
                            <div className="col-span-full py-12 text-center border border-dashed border-border rounded-xl bg-card/30">
                                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-secondary mb-4">
                                    <RefreshCcw className="w-8 h-8 text-muted-foreground" />
                                </div>
                                <h3 className="text-lg font-medium text-foreground">No active deals</h3>
                                <p className="text-muted-foreground mt-1">Waiting for new listings...</p>
                            </div>
                        ) : (
                            deals.map((deal) => (
                                <ClientBuyButton key={deal.id} deal={deal} />
                            ))
                        )}
                    </div>
                </div>
            </main>
        </div>
    );
}
