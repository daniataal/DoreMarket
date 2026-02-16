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
    const formatPremiumCurrency = (value: number, wholeSize: string, decimalSize: string, opacity: string = "opacity-40") => {
        const parts = value.toLocaleString('en-US', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        }).split('.');

        return (
            <span className="inline-flex items-baseline gap-1">
                <span className={wholeSize}>${parts[0]}</span>
                <span className={`${decimalSize} ${opacity} font-medium tracking-normal`}>.{parts[1]}</span>
                <span className={`text-[10px] ml-1 uppercase tracking-widest ${opacity} font-black`}>USD</span>
            </span>
        );
    };

    return (
        <div className="bg-card/10 backdrop-blur-xl border border-white/5 rounded-[3rem] p-8 sm:p-10 shadow-2xl relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-primary/10 rounded-full blur-[120px] -translate-y-1/2 translate-x-1/2 group-hover:bg-primary/20 transition-all duration-1000" />
            <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-secondary/10 rounded-full blur-[100px] translate-y-1/2 -translate-x-1/2" />

            <div className="relative z-10 space-y-10">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-10">
                    <div className="space-y-2 min-w-0">
                        <div className="flex items-center gap-3 mb-2">
                            <div className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse shadow-[0_0_8px_#f59e0b]" />
                            <p className="text-[11px] font-black text-zinc-500 uppercase tracking-[0.4em]">Total Net Worth</p>
                        </div>
                        <h2 className="text-white tabular-nums leading-none tracking-tight">
                            {formatPremiumCurrency(totalValue, "text-5xl sm:text-6xl lg:text-8xl font-black", "text-3xl sm:text-4xl lg:text-5xl")}
                        </h2>
                    </div>

                    <div className="flex items-center gap-4 bg-zinc-950/40 backdrop-blur-2xl p-2.5 rounded-[2.5rem] border border-white/5 shadow-2xl">
                        <WalletActions />
                        <div className="p-4 bg-primary text-white rounded-3xl shadow-[0_0_30px_rgba(244,63,94,0.4)] shrink-0 group-hover:scale-105 transition-all duration-500 hidden sm:flex items-center justify-center border border-white/10">
                            <Wallet className="w-7 h-7" />
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="p-8 rounded-[2.5rem] bg-card/20 border border-white/5 hover:bg-card/30 transition-all duration-500 group/card overflow-hidden flex flex-col justify-center">
                        <div className="flex items-center gap-4 mb-4">
                            <div className="p-3 rounded-2xl bg-amber-500/10 text-amber-500 group-hover/card:scale-110 transition-transform shrink-0 border border-amber-500/20">
                                <CreditCard className="w-5 h-5" />
                            </div>
                            <span className="text-[11px] font-black text-zinc-400 uppercase tracking-[0.2em] whitespace-nowrap">Available Balance</span>
                        </div>
                        <div className="text-white tabular-nums">
                            {formatPremiumCurrency(initialData.balance, "text-3xl sm:text-4xl font-black", "text-lg sm:text-xl", "opacity-30")}
                        </div>
                    </div>

                    <div className="p-8 rounded-[2.5rem] bg-card/20 border border-white/5 hover:bg-card/30 transition-all duration-500 group/card overflow-hidden flex flex-col justify-center">
                        <div className="flex items-center gap-4 mb-4">
                            <div className="p-3 rounded-2xl bg-amber-500/10 text-amber-500 group-hover/card:scale-110 transition-transform shrink-0 border border-amber-500/20">
                                <TrendingUp className="w-5 h-5" />
                            </div>
                            <span className="text-[11px] font-black text-zinc-400 uppercase tracking-[0.2em] whitespace-nowrap">Portfolio Value</span>
                        </div>
                        <div className="text-white tabular-nums">
                            {formatPremiumCurrency(initialData.portfolioValue, "text-3xl sm:text-4xl font-black", "text-lg sm:text-xl", "opacity-30")}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
