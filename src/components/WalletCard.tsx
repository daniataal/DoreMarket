'use client';

import { Wallet, TrendingUp, CreditCard } from "lucide-react";
import { WalletActions } from "./WalletActions";

interface WalletData {
    balance: number;
    portfolioValue: number;
    dealsCount: number;
}

export function WalletCard({ initialData }: { initialData: WalletData }) {
    const totalValue = initialData.balance + initialData.portfolioValue;

    return (
        <div className="bg-zinc-900/50 backdrop-blur-xl border border-white/5 rounded-3xl p-6 sm:p-8 shadow-2xl relative overflow-hidden group">
            {/* Background Effects */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-primary/20 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/2 group-hover:bg-primary/30 transition-all duration-700" />
            <div className="absolute bottom-0 left-0 w-48 h-48 bg-secondary/20 rounded-full blur-[80px] translate-y-1/2 -translate-x-1/2" />

            <div className="relative z-10">
                <div className="flex flex-col sm:flex-row sm:items-start justify-between mb-8 gap-4">
                    <div className="space-y-2 min-w-0 flex-1">
                        <p className="text-sm font-medium text-zinc-400 uppercase tracking-wider">Total Net Worth</p>
                        <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white tracking-tight tabular-nums break-words leading-tight">
                            ${totalValue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </h2>
                    </div>
                    <div className="p-3 bg-zinc-800/80 backdrop-blur-md rounded-2xl border border-white/5 text-primary shadow-lg self-start">
                        <Wallet className="w-6 h-6 sm:w-8 sm:h-8" />
                    </div>
                </div>

                <div className="mb-8">
                    <WalletActions />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="p-4 sm:p-5 rounded-2xl bg-zinc-800/40 border border-white/5 hover:bg-zinc-800/60 transition-colors group/card">
                        <div className="flex items-center gap-2 mb-3">
                            <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-500 group-hover/card:scale-110 transition-transform">
                                <CreditCard className="w-4 h-4" />
                            </div>
                            <span className="text-xs font-semibold text-zinc-400 uppercase tracking-wide whitespace-nowrap">Available Balance</span>
                        </div>
                        <p className="text-lg sm:text-xl font-bold text-white tabular-nums truncate" title={`$${initialData.balance.toLocaleString('en-US', { minimumFractionDigits: 2 })}`}>
                            ${initialData.balance.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                        </p>
                    </div>

                    <div className="p-4 sm:p-5 rounded-2xl bg-zinc-800/40 border border-white/5 hover:bg-zinc-800/60 transition-colors group/card">
                        <div className="flex items-center gap-2 mb-3">
                            <div className="p-2 rounded-lg bg-amber-500/10 text-amber-500 group-hover/card:scale-110 transition-transform">
                                <TrendingUp className="w-4 h-4" />
                            </div>
                            <span className="text-xs font-semibold text-zinc-400 uppercase tracking-wide whitespace-nowrap">Portfolio Value</span>
                        </div>
                        <p className="text-lg sm:text-xl font-bold text-white tabular-nums truncate" title={`$${initialData.portfolioValue.toLocaleString('en-US', { minimumFractionDigits: 2 })}`}>
                            ${initialData.portfolioValue.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
