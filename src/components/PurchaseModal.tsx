"use client";
import React, { useState, useEffect } from 'react';
import { X, MapPin, Package, DollarSign, AlertCircle, Warehouse, FileText, Eye } from 'lucide-react';
import SpaPreviewModal from './SpaPreviewModal';
import { generateSpaVariables } from '@/lib/spa-utils';

interface PurchaseModalProps {
    isOpen: boolean;
    onClose: () => void;
    deal: {
        id: string;
        company: string;
        commodity: string;
        type?: string;
        purity?: number;
        pricingModel?: string;
        availableQuantity: number;
        pricePerKg: number;
        discount: number;
        deliveryLocation: string;
        externalId?: string;
        origin?: string;
        originPort?: string;
        cfOrigin?: string;
        cfOriginPort?: string;
        incoterms?: string;
        productType?: string;
        frequency?: string;
        quantity: number;
        totalQuantity?: number;
        annualValue?: number;
    };
    userBalance: number;
    userInfo?: {
        name?: string | null;
        firstName?: string | null;
        lastName?: string | null;
        email?: string | null;
        address?: string | null;
        nationality?: string | null;
        passportNumber?: string | null;
        passportExpiry?: string | null;
        phoneNumber?: string | null;
    };
    sellerConfig: {
        companyName: string;
        address: string;
        tradeLicense: string;
        representative: string;
        passportNumber: string;
        passportExpiry: string;
        country: string;
        telephone: string;
        email: string;
    };
    onPurchase: (quantity: number, deliveryLocation: string, agreementTerms: string) => Promise<void>;
}

const DELIVERY_LOCATIONS = [
    { value: 'Dubai', label: 'Dubai, UAE', icon: '🇦🇪' },
    { value: 'Johannesburg', label: 'Johannesburg, South Africa', icon: '🇿🇦' },
    { value: 'London', label: 'London, United Kingdom', icon: '🇬🇧' },
    { value: 'Singapore', label: 'Singapore', icon: '🇸🇬' },
    { value: 'Mumbai', label: 'Mumbai, India', icon: '🇮🇳' },
    { value: 'Other', label: 'Other / Custom Location', icon: '🌍' },
];

const REFINERIES_BY_LOCATION: { [key: string]: string[] } = {
    'Dubai': ['Al Etihad Gold', 'Emirates Gold', 'PAMP', 'Valcambi', 'Brinks Global Services', 'Transguard', 'Other / Custom'],
    'Johannesburg': ['Rand Refinery', 'Metal Concentrators', 'Other / Custom'],
    'London': ['Brinks', 'Malca-Amit', 'G4S', 'Loomis International', 'Other / Custom'],
    'Singapore': ['Metalor Technologies Singapore', "Brink's Singapore", 'Other / Custom'],
    'Mumbai': ['MMTC-PAMP', 'RiddiSiddhi Bullions', "Brink's India", 'Other / Custom'],
};

export function PurchaseModal({ isOpen, onClose, deal, userBalance, userInfo, sellerConfig, onPurchase }: PurchaseModalProps) {
    const [quantity, setQuantity] = useState(1);
    const [deliveryLocation, setDeliveryLocation] = useState(deal.deliveryLocation || 'Dubai');
    const [customLocation, setCustomLocation] = useState('');
    const [refinery, setRefinery] = useState('');
    const [showCustomRefinery, setShowCustomRefinery] = useState(false);
    const [agreedToTerms, setAgreedToTerms] = useState(false);
    const [agreedToSPA, setAgreedToSPA] = useState(false);
    const [showSPAPreview, setShowSPAPreview] = useState(false);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const finalPrice = deal.pricePerKg;
    const totalCost = quantity * finalPrice;
    const isInsufficient = totalCost > userBalance;

    // Determine actual location string for validation and display
    const finalLocation = deliveryLocation === 'Other' ? customLocation : deliveryLocation;
    const fullDeliveryLocation = refinery.trim()
        ? `${finalLocation} - ${refinery.trim()}`
        : finalLocation;

    // Validation
    const isLocationValid = deliveryLocation !== 'Other' || customLocation.trim().length > 0;
    const isRefineryValid = refinery.trim().length > 0;
    const canPurchase = agreedToTerms && agreedToSPA && !isInsufficient && quantity > 0 && quantity <= deal.availableQuantity && isLocationValid && isRefineryValid;

    // Generate SPA terms
    const buyerName = `${userInfo?.firstName || userInfo?.name || ''} ${userInfo?.lastName || ''}`.trim() || 'Buyer';
    const sellerName = deal.company;

    const getDeliveryCountry = () => {
        if (deliveryLocation === 'Other') {
            const parts = customLocation.split(',');
            return parts[parts.length - 1].trim().toUpperCase() || 'UAE';
        }
        const locationMap: { [key: string]: string } = {
            'Dubai': 'UAE',
            'Johannesburg': 'ZAF',
            'London': 'UK',
            'Singapore': 'SGP',
            'Mumbai': 'IND'
        };
        return locationMap[deliveryLocation] || 'UAE';
    };
    const agreementDate = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });

    const spaTerms = `SALE AND PURCHASE AGREEMENT

This Sale and Purchase Agreement ("Agreement") is entered into on ${agreementDate} by and between:

SELLER: ${sellerName}
BUYER: ${buyerName}

RECITALS:
The Seller agrees to sell and the Buyer agrees to purchase the following precious metal:

COMMODITY DETAILS:
- Type: ${deal.commodity}
- Grade: ${deal.type || 'Premium Bullion'}
- Purity: ${deal.purity ? (deal.purity * 100).toFixed(2) : '99.99'}%
- Quantity: ${quantity} kilogram(s)

FINANCIAL TERMS:
- Base Price per Kilogram: $${(deal.pricePerKg / (1 - deal.discount / 100)).toLocaleString(undefined, { maximumFractionDigits: 2 })}
- Discount: ${deal.discount}%
- Final Unit Price: $${deal.pricePerKg.toLocaleString(undefined, { maximumFractionDigits: 2 })}/kg
- Total Purchase Price: $${totalCost.toLocaleString(undefined, { maximumFractionDigits: 2 })}

DELIVERY TERMS:
- Delivery Location: ${fullDeliveryLocation}
- Incoterms: CIF (Cost, Insurance, and Freight)
- Delivery Timeline: As per standard industry practices

TERMS AND CONDITIONS:
1. PAYMENT: Full payment shall be made upon execution of this Agreement.
2. TITLE TRANSFER: Title to the commodity passes to the Buyer upon complete payment.
3. DELIVERY: The Seller shall deliver the commodity to the specified location using industry-standard secure logistics.
4. INSPECTION: The Buyer has the right to inspect the commodity upon delivery.
5. FINAL SALE: This purchase is final and non-refundable, subject to delivery as specified.
6. GOVERNING LAW: This Agreement shall be governed by international commercial law.

ACKNOWLEDGMENT:
By signing this Agreement, both parties acknowledge that they have read, understood, and agree to be bound by all terms and conditions set forth herein.

Deal Reference: ${deal.externalId || deal.id}
Date: ${agreementDate}

BUYER SIGNATURE: ${buyerName}
SELLER: ${sellerName}

---END OF AGREEMENT---`;

    useEffect(() => {
        if (isOpen) {
            // Reset state when modal opens
            // For periodic deals, quantity is fixed to the deal's per-period quantity
            if (deal.frequency && deal.frequency !== 'SPOT') {
                setQuantity(deal.quantity);
            } else {
                setQuantity(Math.min(1, deal.availableQuantity));
            }
            setDeliveryLocation(deal.deliveryLocation || 'Dubai');
            setCustomLocation('');
            setRefinery('');
            setShowCustomRefinery(false);
            setAgreedToTerms(false);
            setAgreedToSPA(false);
            setError('');
        }
    }, [isOpen, deal]);

    const handleSubmit = async () => {
        if (!canPurchase) return;

        setLoading(true);
        setError('');

        try {
            await onPurchase(quantity, fullDeliveryLocation, spaTerms);
            onClose();
        } catch (err: any) {
            setError(err.message || 'Purchase failed. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <>
            <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                <div className="bg-card border border-border rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                    {/* Header */}
                    <div className="sticky top-0 bg-card border-b border-border p-6 flex justify-between items-start z-10">
                        <div>
                            <div className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-primary/10 text-primary border border-primary/20 mb-2">
                                {deal.commodity}
                            </div>
                            <h2 className="text-2xl font-bold text-foreground">{deal.company}</h2>
                            <p className="text-sm text-muted-foreground mt-1">Configure your purchase</p>
                        </div>
                        <button
                            onClick={onClose}
                            className="p-2 hover:bg-secondary rounded-lg transition-colors"
                        >
                            <X className="w-5 h-5" />
                        </button>
                    </div>

                    {/* Content */}
                    <div className="p-6 space-y-6">
                        {/* Quantity Selection */}
                        <div>
                            <label className="block text-sm font-medium text-foreground mb-3 flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <Package className="w-4 h-4" />
                                    Quantity (kg)
                                </div>
                                {deal.frequency !== 'SPOT' && (
                                    <span className="text-[10px] font-bold bg-amber-500/20 text-amber-600 px-2 py-0.5 rounded border border-amber-500/30 uppercase tracking-tighter">
                                        Fixed Contract Size
                                    </span>
                                )}
                            </label>
                            {deal.frequency === 'SPOT' ? (
                                <div className="space-y-3">
                                    <input
                                        type="range"
                                        min="1"
                                        max={deal.availableQuantity}
                                        step="0.1"
                                        value={quantity}
                                        onChange={(e) => setQuantity(parseFloat(e.target.value))}
                                        className="w-full h-2 bg-secondary rounded-lg appearance-none cursor-pointer accent-primary"
                                    />
                                    <div className="flex gap-3">
                                        <input
                                            type="number"
                                            min="1"
                                            max={deal.availableQuantity}
                                            step="0.1"
                                            value={quantity}
                                            onChange={(e) => setQuantity(parseFloat(e.target.value) || 0)}
                                            className="flex-1 px-4 py-3 bg-background border border-input rounded-lg text-lg font-mono focus:outline-none focus:ring-2 focus:ring-primary"
                                        />
                                        <div className="px-4 py-3 bg-secondary/50 border border-border rounded-lg text-sm text-muted-foreground flex items-center">
                                            Max: {deal.availableQuantity} kg
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <div className="relative">
                                    <div className="flex items-center justify-between px-4 py-4 bg-secondary/30 border border-border rounded-xl">
                                        <div className="flex flex-col">
                                            <span className="text-2xl font-mono font-bold text-foreground">{deal.quantity} kg</span>
                                            <span className="text-xs text-muted-foreground">Applied per {deal.frequency?.toLowerCase().replace('ly', '')} supply period</span>
                                        </div>
                                        <div className="p-2 bg-white/5 rounded-full">
                                            <Package className="w-6 h-6 text-muted-foreground/50" />
                                        </div>
                                    </div>
                                    <p className="text-[10px] text-muted-foreground mt-2 px-1 italic">
                                        * Periodic contracts require commitment to the full quantity specified per shipment.
                                    </p>
                                </div>
                            )}
                        </div>

                        {/* Delivery Location */}
                        <div>
                            <label className="block text-sm font-medium text-foreground mb-3 flex items-center gap-2">
                                <MapPin className="w-4 h-4" />
                                Destination & Logistics
                            </label>
                            <div className="space-y-4">
                                <div className="grid grid-cols-2 gap-2">
                                    {DELIVERY_LOCATIONS.map((loc) => (
                                        <button
                                            key={loc.value}
                                            onClick={() => {
                                                setDeliveryLocation(loc.value);
                                                setRefinery('');
                                                setShowCustomRefinery(false);
                                            }}
                                            className={`px-3 py-2 rounded-lg border text-left text-sm transition-all flex items-center ${deliveryLocation === loc.value
                                                ? 'border-primary bg-primary/10 text-foreground ring-1 ring-primary/20'
                                                : 'border-border bg-background hover:bg-secondary/50 text-muted-foreground'
                                                }`}
                                        >
                                            <span className="mr-2 text-base">{loc.icon}</span>
                                            {loc.label}
                                        </button>
                                    ))}
                                </div>

                                {/* Custom Location Input */}
                                {deliveryLocation === 'Other' && (
                                    <div className="space-y-2 animate-in fade-in slide-in-from-top-2 duration-200">
                                        <label className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">Specify Custom Location</label>
                                        <input
                                            type="text"
                                            value={customLocation}
                                            onChange={(e) => setCustomLocation(e.target.value)}
                                            placeholder="Enter City, Country"
                                            className="w-full px-4 py-3 bg-background border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                                        />
                                    </div>
                                )}

                                {/* Refinery Input */}
                                <div className="space-y-2 pt-2 border-t border-border/50">
                                    <label className="text-xs text-muted-foreground uppercase tracking-wider font-semibold flex items-center gap-2">
                                        <Warehouse className="w-3 h-3" />
                                        Refinery / Secure Storage <span className="text-destructive">*</span>
                                    </label>

                                    {REFINERIES_BY_LOCATION[deliveryLocation] ? (
                                        <div className="space-y-2">
                                            <select
                                                value={showCustomRefinery ? 'Other / Custom' : (refinery || '')}
                                                onChange={(e) => {
                                                    const val = e.target.value;
                                                    if (val === 'Other / Custom') {
                                                        setShowCustomRefinery(true);
                                                        setRefinery('');
                                                    } else {
                                                        setShowCustomRefinery(false);
                                                        setRefinery(val);
                                                    }
                                                }}
                                                className="w-full px-4 py-3 bg-secondary/30 border border-transparent rounded-lg focus:bg-background focus:border-primary/50 focus:ring-1 focus:ring-primary outline-none transition-all appearance-none cursor-pointer"
                                            >
                                                <option value="" disabled>Select a facility...</option>
                                                {REFINERIES_BY_LOCATION[deliveryLocation].map((r) => (
                                                    <option key={r} value={r}>{r}</option>
                                                ))}
                                            </select>
                                        </div>
                                    ) : null}

                                    {/* Custom Input: Show if location is 'Other' OR user selected 'Other' from dropdown */}
                                    {(deliveryLocation === 'Other' || showCustomRefinery) && (
                                        <div className={REFINERIES_BY_LOCATION[deliveryLocation] ? "animate-in fade-in slide-in-from-top-2 duration-200" : ""}>
                                            <input
                                                type="text"
                                                value={refinery}
                                                onChange={(e) => setRefinery(e.target.value)}
                                                placeholder="e.g. Al Etihad Gold Refinery, Brinks Secure Storage..."
                                                className={`w-full px-4 py-3 bg-secondary/30 border rounded-lg focus:bg-background outline-none transition-all ${refinery.trim() ? "border-transparent focus:border-primary/50 focus:ring-1 focus:ring-primary" : "border-destructive/30 focus:border-destructive/50 focus:ring-1 focus:ring-destructive/30"
                                                    }`}
                                            />
                                        </div>
                                    )}

                                    <p className="text-xs text-muted-foreground">Specify the refinery or secure facility where you wish to receive the {deal.productType || 'product'}.</p>
                                </div>
                            </div>
                        </div>

                        {/* Price Summary */}
                        <div className="bg-secondary/30 rounded-xl p-5 border border-border space-y-3">
                            <div className="flex items-center justify-between text-foreground font-medium mb-3">
                                <div className="flex items-center gap-2">
                                    <DollarSign className="w-4 h-4" />
                                    Price Summary
                                </div>
                                {deal.pricingModel === 'DYNAMIC' && (
                                    <span className="text-[10px] font-bold bg-blue-500/20 text-blue-500 px-2 py-0.5 rounded border border-blue-500/30 animate-pulse">
                                        LIVE LBMA
                                    </span>
                                )}
                            </div>
                            <div className="space-y-2 text-sm">
                                {deal.pricingModel === 'DYNAMIC' && (
                                    <>
                                        <div className="flex justify-between">
                                            <span className="text-muted-foreground">Market Price (LBMA)</span>
                                            <span className="font-mono text-foreground">${(deal.pricePerKg / (1 - deal.discount / 100) / (deal.purity || 1)).toLocaleString(undefined, { maximumFractionDigits: 0 })}/kg</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-muted-foreground">Purity ({deal.type || 'Bullion'})</span>
                                            <span className="font-mono text-foreground">{deal.purity ? (deal.purity * 100).toFixed(2) : '99.99'}%</span>
                                        </div>
                                        <div className="h-px bg-border/50 my-1"></div>
                                    </>
                                )}

                                <div className="flex justify-between">
                                    <span className="text-muted-foreground">Base Price (Purity Adj.)</span>
                                    <span className="font-mono text-foreground">
                                        ${(deal.pricePerKg / (1 - deal.discount / 100)).toLocaleString(undefined, { maximumFractionDigits: 2 })}/kg
                                    </span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-muted-foreground">Discount</span>
                                    <span className="font-mono text-accent">-{deal.discount}%</span>
                                </div>
                                <div className="flex justify-between font-medium">
                                    <span className="text-foreground">Final Unit Price</span>
                                    <span className="font-mono text-foreground">${deal.pricePerKg.toLocaleString(undefined, { maximumFractionDigits: 2 })}/kg</span>
                                </div>
                                <div className="h-px bg-border my-2"></div>
                                <div className="flex justify-between text-base">
                                    <span className="text-muted-foreground">Quantity</span>
                                    <span className="font-mono text-foreground">{quantity} kg</span>
                                </div>
                                <div className="flex justify-between text-lg font-bold pt-2 border-t border-border">
                                    <span className="text-foreground">{deal.frequency === 'SPOT' ? 'Total Cost' : 'Periodic Cost'}</span>
                                    <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent font-mono">
                                        ${totalCost.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                                    </span>
                                </div>
                                {deal.frequency !== 'SPOT' && (
                                    <div className="flex justify-between text-sm font-bold text-accent pt-1">
                                        <span>Estimated Annual Total</span>
                                        <span className="font-mono">
                                            ${(totalCost * (deal.frequency === 'WEEKLY' ? 52 : deal.frequency === 'BIWEEKLY' ? 26 : deal.frequency === 'MONTHLY' ? 12 : 4)).toLocaleString(undefined, { maximumFractionDigits: 0 })}
                                        </span>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Wallet Balance */}
                        <div className={`flex items-center gap-2 p-4 rounded-lg border ${isInsufficient ? 'bg-destructive/10 border-destructive/50 text-destructive' : 'bg-secondary/30 border-border'
                            }`}>
                            <AlertCircle className="w-4 h-4" />
                            <span className="text-sm">
                                Your Balance: <span className="font-mono font-bold">${userBalance.toLocaleString()}</span>
                                {isInsufficient && <span className="ml-2">(Insufficient funds)</span>}
                            </span>
                        </div>

                        {/* SPA Agreement Section */}
                        <div className="bg-blue-500/5 border border-blue-500/20 rounded-xl p-4 space-y-3">
                            <div className="flex items-center gap-2 text-blue-600 dark:text-blue-400 font-semibold">
                                <FileText className="w-5 h-5" />
                                Sale & Purchase Agreement (SPA)
                            </div>
                            <p className="text-sm text-muted-foreground">
                                This purchase requires a legally binding Sale and Purchase Agreement. A standard draft agreement will be generated for your review.
                            </p>

                            <button
                                onClick={async () => {
                                    try {
                                        setLoading(true);
                                        // Dynamic import to avoid SSR issues with react-pdf
                                        const { generateSpaPdfUrl } = await import('@/components/SpaPdfDocument');

                                        const variables = generateSpaVariables({
                                            deal,
                                            buyer: userInfo,
                                            sellerConfig,
                                            quantity,
                                            deliveryLocation: finalLocation,
                                            refinery,
                                            incoterms: deal.incoterms || 'CIF',
                                        });

                                        const url = await generateSpaPdfUrl(variables);

                                        setPreviewUrl(url);
                                        setShowSPAPreview(true);
                                    } catch (e) {
                                        console.error(e);
                                        setError('Failed to generate preview');
                                    } finally {
                                        setLoading(false);
                                    }
                                }}
                                disabled={loading || !isLocationValid || !isRefineryValid}
                                title={!isLocationValid || !isRefineryValid ? "Please fill all required fields first" : "Preview Draft SPA"}
                                className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                <Eye className="w-4 h-4" />
                                {loading ? 'Generating...' : 'Preview Draft SPA'}
                            </button>

                            <label className="flex items-start gap-3 cursor-pointer group mt-3">
                                <div className="mt-1 relative flex items-center justify-center">
                                    <input
                                        type="checkbox"
                                        checked={agreedToSPA}
                                        onChange={(e) => setAgreedToSPA(e.target.checked)}
                                        className="peer appearance-none w-5 h-5 border-2 border-blue-600 rounded checked:bg-blue-600 checked:border-blue-600 transition-colors cursor-pointer"
                                    />
                                    <svg className="w-3 h-3 text-white absolute pointer-events-none opacity-0 peer-checked:opacity-100 transition-opacity" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                                    </svg>
                                </div>
                                <span className="text-sm text-foreground group-hover:text-blue-600 transition-colors font-medium">
                                    I have reviewed and agree to the Draft Sale & Purchase Agreement
                                </span>
                            </label>
                        </div>

                        {/* Terms */}
                        <label className="flex items-start gap-3 cursor-pointer group">
                            <div className="mt-1 relative flex items-center justify-center">
                                <input
                                    type="checkbox"
                                    checked={agreedToTerms}
                                    onChange={(e) => setAgreedToTerms(e.target.checked)}
                                    className="peer appearance-none w-5 h-5 border-2 border-muted-foreground rounded checked:bg-primary checked:border-primary transition-colors cursor-pointer"
                                />
                                <svg className="w-3 h-3 text-white absolute pointer-events-none opacity-0 peer-checked:opacity-100 transition-opacity" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                                </svg>
                            </div>
                            <span className="text-sm text-muted-foreground group-hover:text-foreground transition-colors">
                                I agree to the terms and conditions. Delivery requested to
                                <span className="font-bold text-foreground mx-1">
                                    {finalLocation || "..."} {refinery ? `(${refinery})` : ""}
                                </span>
                                via CIF Incoterms. I understand that this purchase is final.
                            </span>
                        </label>

                        {error && (
                            <div className="p-4 bg-destructive/10 border border-destructive/50 rounded-lg text-destructive text-sm flex items-center gap-2">
                                <AlertCircle className="w-4 h-4" />
                                {error}
                            </div>
                        )}
                    </div>

                    {/* Footer */}
                    <div className="sticky bottom-0 bg-card border-t border-border p-6 flex gap-3 z-10">
                        <button
                            onClick={onClose}
                            disabled={loading}
                            className="flex-1 px-6 py-3 bg-secondary hover:bg-secondary/80 text-foreground rounded-lg font-medium transition-colors disabled:opacity-50"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={handleSubmit}
                            disabled={!canPurchase || loading}
                            className="flex-1 px-6 py-3 bg-gradient-to-r from-primary to-primary/80 hover:to-primary text-white rounded-lg font-bold transition-all shadow-lg shadow-primary/20 hover:shadow-primary/40 disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none"
                        >
                            {loading ? 'Processing...' : 'Confirm Purchase & Sign SPA'}
                        </button>
                    </div>
                </div>
            </div>

            <SpaPreviewModal
                isOpen={showSPAPreview}
                onClose={() => setShowSPAPreview(false)}
                pdfUrl={previewUrl}
                title={deal.purity && deal.purity >= 0.9999 ? "Bullion Sale & Purchase Agreement" : "Gold Dore Sale & Purchase Agreement"}
            />
        </>
    );
}
