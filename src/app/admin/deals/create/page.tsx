'use client';

import { useActionState, useState, useEffect } from 'react';
import { createDeal, getLiveGoldPrice } from '@/lib/actions';
import Link from 'next/link';
import { ArrowLeft, Calculator, RefreshCw, Info } from 'lucide-react';

export default function CreateDealPage() {
    const [errorMessage, dispatch] = useActionState(createDeal, undefined);

    // Form State
    const [type, setType] = useState('BULLION');
    const [pricingModel, setPricingModel] = useState('FIXED');
    const [purity, setPurity] = useState(0.9999);
    const [discount, setDiscount] = useState(0);
    const [quantity, setQuantity] = useState<number | ''>('');

    // Market Data
    const [marketPrice, setMarketPrice] = useState(0);
    const [isLoadingPrice, setIsLoadingPrice] = useState(false);

    // Derived Values
    const calculatedPrice = (marketPrice * purity) * (1 - discount / 100);

    // Fetch initial market price and poll every 10 seconds
    useEffect(() => {
        refreshPrice();
        const interval = setInterval(refreshPrice, 10000);
        return () => clearInterval(interval);
    }, []);

    // Update purity when type changes
    useEffect(() => {
        switch (type) {
            case 'BULLION': setPurity(0.9999); break;
            case '24K': setPurity(0.999); break; // Dore 24k
            case '23K': setPurity(0.958); break; // Dore 23k
            case '22K': setPurity(0.916); break; // Dore 22k
            case '21K': setPurity(0.875); break; // Dore 21k
            case '18K': setPurity(0.750); break; // Dore 18k
            default: break; // Keep manual if custom
        }
    }, [type]);

    const refreshPrice = async () => {
        setIsLoadingPrice(true);
        try {
            const price = await getLiveGoldPrice();
            setMarketPrice(price);
        } catch (error) {
            console.error("Failed to fetch price", error);
        } finally {
            setIsLoadingPrice(false);
        }
    };

    return (
        <div className="max-w-4xl mx-auto">
            <div className="mb-6 flex items-center justify-between">
                <div>
                    <Link href="/admin" className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground transition-colors mb-4">
                        <ArrowLeft className="w-4 h-4 mr-1" />
                        Back to Dashboard
                    </Link>
                    <h1 className="text-3xl font-bold text-foreground">Create New Deal</h1>
                    <p className="text-muted-foreground mt-1">List a commodity deal with dynamic pricing options</p>
                </div>

                {/* Live Market Price Widget */}
                <div className="bg-card border border-border rounded-xl p-4 shadow-sm flex items-center gap-4">
                    <div>
                        <div className="text-xs text-muted-foreground font-medium uppercase tracking-wider">LBMA Gold Price</div>
                        <div className="text-2xl font-mono font-bold text-foreground">
                            {marketPrice > 0 ? `$${marketPrice.toLocaleString()}` : 'Loading...'}
                            <span className="text-sm text-muted-foreground font-normal ml-1">/kg</span>
                        </div>
                    </div>
                    <button
                        onClick={refreshPrice}
                        disabled={isLoadingPrice}
                        className="p-2 bg-secondary hover:bg-secondary/80 rounded-lg transition-colors"
                        title="Refresh Base Market Price"
                    >
                        <RefreshCw className={`w-4 h-4 ${isLoadingPrice ? 'animate-spin' : ''}`} />
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Main Form */}
                <div className="lg:col-span-2 space-y-6">
                    <div className="bg-card border border-border rounded-xl shadow-sm p-6">
                        <form action={dispatch} className="space-y-6">
                            {/* Hidden fields for calculated/derived values if needed, mostly for server action */}
                            <input type="hidden" name="marketPriceSnapshot" value={marketPrice} />

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {/* Basic Info */}
                                <div className="col-span-full">
                                    <label className="block text-sm font-medium text-muted-foreground mb-1" htmlFor="company">Company Name</label>
                                    <input
                                        type="text"
                                        name="company"
                                        id="company"
                                        required
                                        className="w-full p-3 bg-secondary/30 rounded-lg text-foreground border border-transparent focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all placeholder:text-muted-foreground/50"
                                        placeholder="e.g. Acme Mining Corp"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-muted-foreground mb-1" htmlFor="commodity">Commodity</label>
                                    <select
                                        name="commodity"
                                        id="commodity"
                                        className="w-full p-3 bg-secondary/30 rounded-lg text-foreground border border-transparent focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all appearance-none"
                                    >
                                        <option value="Gold">Gold</option>
                                        <option value="Silver">Silver</option>
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-muted-foreground mb-1" htmlFor="quantity">Quantity (kg)</label>
                                    <input
                                        type="number"
                                        name="quantity"
                                        id="quantity"
                                        required
                                        min="0.1"
                                        step="0.1"
                                        value={quantity}
                                        onChange={(e) => setQuantity(e.target.value === '' ? '' : parseFloat(e.target.value))}
                                        className="w-full p-3 bg-secondary/30 rounded-lg text-foreground border border-transparent focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all placeholder:text-muted-foreground/50"
                                        placeholder="0.00"
                                    />
                                </div>
                            </div>

                            <div className="h-px bg-border/50 my-6" />

                            <div className="space-y-4">
                                <h3 className="text-lg font-semibold text-foreground flex items-center gap-2">
                                    <Calculator className="w-5 h-5 text-primary" />
                                    Pricing Configuration
                                </h3>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <label className="block text-sm font-medium text-muted-foreground mb-1" htmlFor="type">Gold Type</label>
                                        <select
                                            name="type"
                                            id="type"
                                            value={type}
                                            onChange={(e) => setType(e.target.value)}
                                            className="w-full p-3 bg-secondary/30 rounded-lg text-foreground border border-transparent focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all appearance-none"
                                        >
                                            <option value="BULLION">Bullion (99.99%)</option>
                                            <optgroup label="Dore (Unrefined)">
                                                <option value="24K">24K (99.9%)</option>
                                                <option value="23K">23K (95.8%)</option>
                                                <option value="22K">22K (91.6%)</option>
                                                <option value="21K">21K (87.5%)</option>
                                                <option value="18K">18K (75.0%)</option>
                                            </optgroup>
                                        </select>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-muted-foreground mb-1" htmlFor="purity">Purity Factor (0-1)</label>
                                        <input
                                            type="number"
                                            name="purity"
                                            id="purity"
                                            required
                                            min="0"
                                            max="1"
                                            step="0.0001"
                                            value={purity}
                                            onChange={(e) => setPurity(parseFloat(e.target.value))}
                                            className="w-full p-3 bg-secondary/30 rounded-lg text-foreground border border-transparent focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all"
                                        />
                                        <p className="text-xs text-muted-foreground mt-1">
                                            {type === 'BULLION' ? 'Standard Bullion Purity' : 'Based on Karat selection'}
                                        </p>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-muted-foreground mb-1" htmlFor="pricingModel">Pricing Model</label>
                                        <div className="flex p-1 bg-secondary/30 rounded-lg border border-transparent">
                                            <button
                                                type="button"
                                                onClick={() => setPricingModel('FIXED')}
                                                className={`flex-1 py-1.5 px-3 rounded text-sm font-medium transition-all ${pricingModel === 'FIXED'
                                                    ? 'bg-background shadow-sm text-foreground'
                                                    : 'text-muted-foreground hover:text-foreground'
                                                    }`}
                                            >
                                                Fixed Price
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => setPricingModel('DYNAMIC')}
                                                className={`flex-1 py-1.5 px-3 rounded text-sm font-medium transition-all ${pricingModel === 'DYNAMIC'
                                                    ? 'bg-background shadow-sm text-foreground'
                                                    : 'text-muted-foreground hover:text-foreground'
                                                    }`}
                                            >
                                                Dynamic (LBMA)
                                            </button>
                                        </div>
                                        <input type="hidden" name="pricingModel" value={pricingModel} />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-muted-foreground mb-1" htmlFor="discount">Discount (%)</label>
                                        <input
                                            type="number"
                                            name="discount"
                                            id="discount"
                                            required
                                            min="0"
                                            max="100"
                                            step="0.01"
                                            value={discount}
                                            onChange={(e) => setDiscount(parseFloat(e.target.value) || 0)}
                                            className="w-full p-3 bg-secondary/30 rounded-lg text-foreground border border-transparent focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all placeholder:text-muted-foreground/50"
                                            placeholder="0.00"
                                        />
                                        <p className="text-xs text-muted-foreground mt-1">Discount applied to Purity-Adjusted Price</p>
                                    </div>
                                </div>
                            </div>

                            <div className="pt-4 border-t border-border">
                                {errorMessage && (
                                    <p className="text-sm text-destructive mb-4">{errorMessage}</p>
                                )}
                                <button
                                    type="submit"
                                    className="w-full bg-primary text-primary-foreground py-3 rounded-lg font-bold hover:bg-primary/90 transition-colors"
                                >
                                    Create Deal
                                </button>
                            </div>
                        </form>
                    </div>
                </div>

                {/* Preview Panel */}
                <div className="lg:col-span-1">
                    <div className="bg-card border border-border rounded-xl shadow-sm p-6 sticky top-6">
                        <h3 className="text-lg font-semibold text-foreground mb-4">Deal Preview</h3>

                        <div className="space-y-4">
                            <div className="p-4 bg-secondary/30 rounded-lg border border-border/50 space-y-3">
                                <div className="flex justify-between text-sm">
                                    <span className="text-muted-foreground">Market Rate</span>
                                    <span className="font-mono text-foreground">${marketPrice.toLocaleString()}/kg</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="text-muted-foreground">Purity ({type})</span>
                                    <span className="font-mono text-foreground">{(purity * 100).toFixed(2)}%</span>
                                </div>
                                <div className="flex justify-between text-sm font-medium pt-2 border-t border-border/50">
                                    <span className="text-foreground">Base Value</span>
                                    <span className="font-mono text-foreground">${(marketPrice * purity).toLocaleString(undefined, { maximumFractionDigits: 2 })}/kg</span>
                                </div>
                            </div>

                            <div className="p-4 bg-primary/5 rounded-lg border border-primary/20 space-y-3">
                                <div className="flex justify-between text-sm">
                                    <span className="text-muted-foreground">Discount</span>
                                    <span className="font-mono text-accent">-{discount}%</span>
                                </div>
                                <div className="flex justify-between items-end pt-2 border-t border-primary/20">
                                    <div>
                                        <span className="block text-xs text-muted-foreground uppercase tracking-wider mb-1">Final Price</span>
                                        <div className="flex items-center gap-2">
                                            {pricingModel === 'DYNAMIC' && (
                                                <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-blue-500/20 text-blue-500 border border-blue-500/30">
                                                    LIVE
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                    <span className="font-mono text-xl font-bold text-foreground">
                                        ${calculatedPrice.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                    </span>
                                </div>
                            </div>

                            {quantity !== '' && (
                                <div className="p-4 bg-secondary/30 rounded-lg border border-border/50">
                                    <div className="flex justify-between items-center mb-1">
                                        <span className="text-sm text-muted-foreground">Total Value ({quantity}kg)</span>
                                    </div>
                                    <div className="text-2xl font-mono font-bold text-foreground text-right relative">
                                        ${(calculatedPrice * Number(quantity)).toLocaleString(undefined, { maximumFractionDigits: 0 })}
                                        {pricingModel === 'DYNAMIC' && (
                                            <span className="absolute -top-1 -right-2 w-2 h-2 bg-blue-500 rounded-full animate-pulse" />
                                        )}
                                    </div>
                                </div>
                            )}

                            <div className="text-xs text-muted-foreground flex gap-2 p-3 bg-muted/50 rounded-lg">
                                <Info className="w-4 h-4 flex-shrink-0 mt-0.5" />
                                <p>
                                    {pricingModel === 'FIXED'
                                        ? "This deal will be locked at the current calculated price regardless of future market changes."
                                        : "This deal's price will automatically update as the LBMA market price fluctuates, maintaining the discount percentage."
                                    }
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
