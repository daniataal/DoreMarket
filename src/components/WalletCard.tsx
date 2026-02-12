'use client';

import { Wallet, TrendingUp, CreditCard } from "lucide-react";

interface WalletData {
    balance: number;
    portfolioValue: number;
    dealsCount: number;
}

export function WalletCard({ initialData }: { initialData: WalletData }) {
    const totalValue = initialData.balance + initialData.portfolioValue;

    return (
        <div className="bg-card/50 backdrop-blur-xl border border-border/50 rounded-2xl p-6 shadow-xl relative overflow-hidden group">
            {/* Background Glow */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 group-hover:bg-primary/20 transition-all duration-500" />

            <div className="flex items-start justify-between mb-8 relative z-10">
                <div>
                    <p className="text-sm font-medium text-muted-foreground mb-1">Total Net Worth</p>
                    <h2 className="text-3xl font-bold text-foreground">
                        ${totalValue.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                    </h2>
                </div>
                <div className="p-3 bg-primary/10 rounded-xl text-primary">
                    <Wallet className="w-6 h-6" />
                </div>
            </div>

            <div className="grid grid-cols-2 gap-4 relative z-10">
                <div className="p-4 rounded-xl bg-background/50 border border-border/50 hover:bg-background/80 transition-colors">
                    <div className="flex items-center gap-2 mb-2">
                        <CreditCard className="w-4 h-4 text-emerald-500" />
                        <span className="text-xs font-medium text-muted-foreground">Available Balance</span>
                    </div>
                    <p className="text-lg font-semibold text-foreground">
                        ${initialData.balance.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                    </p>
                </div>

                <div className="p-4 rounded-xl bg-background/50 border border-border/50 hover:bg-background/80 transition-colors">
                    <div className="flex items-center gap-2 mb-2">
                        <TrendingUp className="w-4 h-4 text-amber-500" />
                        <span className="text-xs font-medium text-muted-foreground">Portfolio Value</span>
                    </div>
                    <p className="text-lg font-semibold text-foreground">
                        ${initialData.portfolioValue.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                    </p>
                </div>
            </div>
        </div>
    );
}
