import React from 'react';
import { Share2, ShoppingCart, MapPin, FileText, Activity } from 'lucide-react';

interface DealProps {
    deal: {
        id: string;
        company: string;
        commodity: string;
        type?: string; // BULLION, DORE
        purity?: number;
        pricingModel?: string; // FIXED, DYNAMIC
        quantity: number;
        availableQuantity: number;
        pricePerKg: number;
        discount: number;
        status: string;
        deliveryLocation: string;
        incoterms: string;
        origin?: string;
        cfOrigin?: string;
        originport?: string;
        frequency?: string;
        totalQuantity?: number;
        contractDuration?: number;
        extensionYears?: number;
        totalValue?: number;
        annualValue?: number;
    };
    onBuy: (deal: any) => void;
}

export function DealCard({ deal, onBuy }: DealProps) {
    // Price for Dynamic deals is already calculated and passed as pricePerKg by the parent
    const finalPrice = deal.pricePerKg; // calculated price

    const availabilityPercent = (deal.availableQuantity / deal.quantity) * 100;

    const getUnitLabel = () => {
        switch (deal.frequency) {
            case 'WEEKLY': return 'kg / week';
            case 'BIWEEKLY': return 'kg / 2 weeks';
            case 'MONTHLY': return 'kg / month';
            case 'QUARTERLY': return 'kg / quarter';
            default: return 'kg';
        }
    };

    const getPurityLabel = () => {
        if (!deal.purity) return '';
        if (deal.type === 'BULLION') return '99.99% Pure';
        // For Dore, show Karats if possible, or percentage
        const percentage = (deal.purity * 100).toFixed(1);
        if (deal.type?.includes('K')) return `${deal.type} (${percentage}%)`;
        return `${percentage}% Purity`;
    };

    return (
        <div className="group relative rounded-xl transition-all duration-300 hover:shadow-2xl hover:shadow-primary/10 hover:-translate-y-1">
            {/* Gradient Border Effect */}
            <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-primary via-accent to-secondary opacity-20 group-hover:opacity-40 transition-opacity" />

            <div className="relative h-full bg-card rounded-xl p-1 m-[1px] overflow-hidden">
                <div className="h-full bg-gradient-to-br from-background to-secondary/30 rounded-lg p-5 flex flex-col">
                    <div className="flex justify-between items-start mb-4">
                        <div>
                            <div className="flex gap-2 mb-3">
                                <div className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-primary/10 text-primary border border-primary/20 shadow-[0_0_10px_rgba(220,38,38,0.2)]">
                                    {deal.commodity}
                                </div>
                                {deal.frequency && deal.frequency !== 'SPOT' && (
                                    <div className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-[10px] font-bold bg-amber-500/10 text-amber-500 border border-amber-500/20 uppercase tracking-wider">
                                        {deal.frequency}
                                    </div>
                                )}
                                {deal.pricingModel === 'DYNAMIC' && (
                                    <div className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-[10px] font-bold bg-blue-500/10 text-blue-500 border border-blue-500/20 animate-pulse">
                                        <Activity className="w-3 h-3" />
                                        LIVE
                                    </div>
                                )}
                            </div>
                            <h3 className="text-xl font-bold text-foreground tracking-tight">{deal.company}</h3>
                            <div className="text-sm text-muted-foreground mt-1 font-medium">
                                {deal.type || 'Bullion'} • {getPurityLabel()}
                            </div>
                        </div>
                        <div className="text-right">
                            <span className="block text-2xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                                ${finalPrice.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                            </span>
                            <div className="flex items-center justify-end gap-2 text-sm">
                                <span className="text-muted-foreground text-xs">per {getUnitLabel()}</span>
                                <span className="text-accent font-medium">-{deal.discount}%</span>
                            </div>
                        </div>
                    </div>

                    {/* Availability Bar */}
                    <div className="mb-4">
                        <div className="flex justify-between text-xs text-muted-foreground mb-2">
                            <span>
                                {deal.frequency === 'SPOT'
                                    ? `Available: ${deal.availableQuantity} ${getUnitLabel()} / ${deal.quantity} ${getUnitLabel()}`
                                    : `${deal.quantity} ${getUnitLabel()}`
                                }
                            </span>
                            {deal.frequency === 'SPOT' && <span>{availabilityPercent.toFixed(0)}%</span>}
                        </div>
                        {deal.frequency === 'SPOT' && (
                            <div className="w-full h-2 bg-secondary/50 rounded-full overflow-hidden">
                                <div
                                    className="h-full bg-gradient-to-r from-primary to-accent transition-all duration-500"
                                    style={{ width: `${availabilityPercent}%` }}
                                />
                            </div>
                        )}
                    </div>

                    <div className="grid grid-cols-2 gap-3 mb-4">
                        <div className="p-3 bg-secondary/30 rounded-lg border border-white/5 flex flex-col justify-center">
                            <span className="block text-[10px] text-muted-foreground uppercase tracking-wider mb-1">
                                {deal.frequency === 'SPOT' ? 'Total Value' : 'Periodic Value'}
                            </span>
                            <div className="flex flex-col">
                                <span className="font-mono text-lg text-foreground truncate leading-none">
                                    ${(deal.quantity * finalPrice).toLocaleString(undefined, { maximumFractionDigits: 0 })}
                                </span>
                                {deal.frequency !== 'SPOT' && (
                                    <span className="text-[10px] text-accent font-bold mt-1">
                                        Annual: ${(deal.annualValue || (deal.totalQuantity || deal.quantity * 12) * finalPrice).toLocaleString(undefined, { maximumFractionDigits: 0 })}
                                    </span>
                                )}
                            </div>
                        </div>
                        <div className="p-3 bg-secondary/30 rounded-lg border border-white/5">
                            <span className="block text-[10px] text-muted-foreground uppercase tracking-wider mb-1">
                                {deal.frequency === 'SPOT' ? 'Pricing Model' : 'Annual Quantity'}
                            </span>
                            <span className="font-mono text-sm text-foreground flex items-center gap-1 h-7">
                                {deal.frequency === 'SPOT'
                                    ? (deal.pricingModel === 'DYNAMIC' ? 'Live LBMA' : 'Fixed Rate')
                                    : `${deal.totalQuantity?.toLocaleString() || (deal.quantity * (deal.frequency === 'WEEKLY' ? 52 : deal.frequency === 'BIWEEKLY' ? 26 : deal.frequency === 'MONTHLY' ? 12 : 4)).toLocaleString()} kg`
                                }
                            </span>
                            {deal.frequency !== 'SPOT' && (
                                <div className="text-[9px] text-muted-foreground mt-0.5 whitespace-nowrap opacity-70">
                                    {deal.quantity}kg x {deal.frequency === 'WEEKLY' ? 52 : deal.frequency === 'BIWEEKLY' ? 26 : deal.frequency === 'MONTHLY' ? 12 : 4}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Delivery & Incoterms */}
                    <div className="flex flex-wrap gap-2 mb-6 mt-auto">
                        <div className="flex items-center gap-1 px-2 py-1 bg-secondary/50 rounded text-[10px] text-muted-foreground">
                            <MapPin className="w-3 h-3" />
                            Origin: {deal.cfOrigin || deal.origin || 'Unknown'}
                        </div>
                        <div className="flex items-center gap-1 px-2 py-1 bg-secondary/50 rounded text-[10px] text-muted-foreground">
                            <FileText className="w-3 h-3" />
                            {deal.incoterms}
                        </div>
                        {deal.frequency !== 'SPOT' && (
                            <div className="flex items-center gap-1 px-2 py-1 bg-primary/10 border border-primary/20 rounded text-[10px] text-primary font-bold">
                                🗓️ {deal.contractDuration || 1} Year + {deal.extensionYears || 5}Y Rolls
                            </div>
                        )}
                    </div>

                    <button
                        onClick={() => onBuy(deal)}
                        disabled={deal.status !== 'OPEN' || deal.availableQuantity <= 0}
                        className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-primary to-primary/80 hover:to-primary text-white py-3 px-4 rounded-lg font-bold transition-all shadow-lg shadow-primary/20 hover:shadow-primary/40 disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none"
                    >
                        <ShoppingCart className="w-4 h-4" />
                        {deal.availableQuantity <= 0 ? 'Sold Out' : deal.status === 'OPEN' ? 'Purchase Deal' : deal.status}
                    </button>
                </div>
            </div>
        </div>
    );
}
