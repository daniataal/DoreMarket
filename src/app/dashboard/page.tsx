import { prisma } from "@/lib/prisma";
import ClientBuyButton from "@/components/ClientBuyWrapper";
import { auth } from "@/auth";
import Navbar from "@/components/Navbar";
import { getWalletData } from "@/actions/wallet";
import { WalletCard } from "@/components/WalletCard";
import { RefreshCcw } from "lucide-react";
import { GoldPriceService } from "@/lib/services/gold-price";
import { MarketIntelligence } from "@/components/MarketIntelligence";

export const dynamic = 'force-dynamic';

export default async function Dashboard() {
    const session = await auth();
    const walletData = await getWalletData();
    const dealsData = await prisma.deal.findMany({
        orderBy: { createdAt: 'desc' },
        where: { status: 'OPEN' }
    });

    // Recalculate prices for Dynamic deals
    const livePrice = await GoldPriceService.getLivePricePerKg();

    const deals = dealsData.map((d: any) => {
        const deal = d as any;
        if (deal.pricingModel === 'DYNAMIC') {
            return {
                ...deal,
                pricePerKg: GoldPriceService.calculateDealPrice(livePrice, deal.purity, deal.discount),
                marketPrice: livePrice // Update ref for UI
            };
        }
        return deal;
    });

    // Get Seller Configuration for SPA
    const sellerConfig = {
        companyName: process.env.SELLER_COMPANY_NAME || "FONKEM GROUP LLC-FZ",
        address: process.env.SELLER_ADDRESS || "Meydan Grandstand, Dubai, UAE",
        tradeLicense: process.env.SELLER_TRADE_LICENSE || "2537157.01",
        representative: process.env.SELLER_REPRESENTATIVE || "Thalefo Moshanyana",
        passportNumber: process.env.SELLER_PASSPORT_NUMBER || "A11611955",
        passportExpiry: process.env.SELLER_PASSPORT_EXPIRY || "13/11/2034",
        country: process.env.SELLER_COUNTRY || "UAE",
        telephone: process.env.SELLER_TELEPHONE || "(+27) 063 638 9245",
        email: process.env.SELLER_EMAIL || ""
    };

    return (
        <div className="min-h-screen bg-background relative overflow-hidden">
            {/* Ambient Lighting Engine */}
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-accent/5 via-background/0 to-background/0 pointer-events-none z-0" />
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[600px] bg-primary/20 rounded-full blur-[120px] pointer-events-none z-0 opacity-40 mix-blend-screen" />

            <Navbar user={session?.user} />

            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
                {/* Wallet Section */}
                <div className="space-y-6">
                    <WalletCard initialData={walletData} />
                </div>

                {/* Secondary Stats Row */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                    <div className="md:col-span-3">
                        <MarketIntelligence currentPrice={livePrice} />
                    </div>

                    <div className="md:col-span-1 bg-card/10 backdrop-blur-xl border border-white/5 rounded-[2.5rem] p-8 flex flex-col items-center justify-center text-center space-y-6 relative overflow-hidden group">
                        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent pointer-events-none" />
                        <div className="absolute -bottom-10 -right-10 w-32 h-32 bg-primary/10 rounded-full blur-3xl group-hover:bg-primary/20 transition-all duration-700" />

                        <div className="p-4 rounded-2xl bg-primary/10 text-primary border border-primary/20 group-hover:scale-110 transition-transform duration-500 shadow-2xl">
                            <span className="text-3xl">💎</span>
                        </div>

                        <div className="space-y-1">
                            <p className="text-5xl font-black text-white tabular-nums tracking-tighter drop-shadow-[0_0_15px_rgba(255,255,255,0.1)]">{deals.length}</p>
                            <p className="text-[11px] font-black text-zinc-500 uppercase tracking-[0.3em]">Active Listings</p>
                        </div>

                        <div className="pt-2">
                            <div className="px-4 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 backdrop-blur-md">
                                <span className="text-[10px] font-black text-emerald-500 uppercase tracking-widest">Market Open</span>
                            </div>
                        </div>
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
                                <ClientBuyButton
                                    key={deal.id}
                                    deal={deal}
                                    userBalance={walletData.balance}
                                    sellerConfig={sellerConfig}
                                    userInfo={session?.user}
                                />
                            ))
                        )}
                    </div>
                </div>
            </main>
        </div>
    );
}
