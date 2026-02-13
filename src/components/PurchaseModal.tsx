"use client";
import React, { useState, useEffect } from 'react';
import { X, MapPin, Package, DollarSign, AlertCircle, Warehouse } from 'lucide-react';

interface PurchaseModalProps {
    isOpen: boolean;
    onClose: () => void;
    deal: {
        id: string;
        company: string;
        commodity: string;
        availableQuantity: number;
        pricePerKg: number;
        discount: number;
        deliveryLocation: string;
    };
    userBalance: number;
    onPurchase: (quantity: number, deliveryLocation: string) => Promise<void>;
}

const DELIVERY_LOCATIONS = [
    { value: 'Dubai', label: 'Dubai, UAE', icon: '🇦🇪' },
    { value: 'Johannesburg', label: 'Johannesburg, South Africa', icon: '🇿🇦' },
    { value: 'London', label: 'London, United Kingdom', icon: '🇬🇧' },
    { value: 'Singapore', label: 'Singapore', icon: '🇸🇬' },
    { value: 'Mumbai', label: 'Mumbai, India', icon: '🇮🇳' },
    { value: 'Other', label: 'Other / Custom Location', icon: '🌍' },
];

export function PurchaseModal({ isOpen, onClose, deal, userBalance, onPurchase }: PurchaseModalProps) {
    const [quantity, setQuantity] = useState(1);
    const [deliveryLocation, setDeliveryLocation] = useState(deal.deliveryLocation || 'Dubai');
    const [customLocation, setCustomLocation] = useState('');
    const [refinery, setRefinery] = useState('');
    const [agreedToTerms, setAgreedToTerms] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const finalPrice = deal.pricePerKg * (1 - deal.discount / 100);
    const totalCost = quantity * finalPrice;
    const isInsufficient = totalCost > userBalance;

    // Determine actual location string for validation and display
    const finalLocation = deliveryLocation === 'Other' ? customLocation : deliveryLocation;

    // Validation
    const isLocationValid = deliveryLocation !== 'Other' || customLocation.trim().length > 0;
    const canPurchase = agreedToTerms && !isInsufficient && quantity > 0 && quantity <= deal.availableQuantity && isLocationValid;

    useEffect(() => {
        if (isOpen) {
            // Reset state when modal opens
            setQuantity(Math.min(1, deal.availableQuantity));
            setDeliveryLocation(deal.deliveryLocation || 'Dubai');
            setCustomLocation('');
            setRefinery('');
            setAgreedToTerms(false);
            setError('');
        }
    }, [isOpen, deal]);

    const handleSubmit = async () => {
        if (!canPurchase) return;

        setLoading(true);
        setError('');

        try {
            const location = deliveryLocation === 'Other' ? customLocation : deliveryLocation;

            // Construct full delivery info
            // If refinery is provided, append it. Otherwise just use the location.
            const fullDeliveryLocation = refinery.trim()
                ? `${location} - ${refinery.trim()}`
                : location;

            await onPurchase(quantity, fullDeliveryLocation);
            onClose();
        } catch (err: any) {
            setError(err.message || 'Purchase failed. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
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
                        <label className="block text-sm font-medium text-foreground mb-3 flex items-center gap-2">
                            <Package className="w-4 h-4" />
                            Quantity (kg)
                        </label>
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
                                        onClick={() => setDeliveryLocation(loc.value)}
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
                                    Refinery / Secure Storage (Optional)
                                </label>
                                <input
                                    type="text"
                                    value={refinery}
                                    onChange={(e) => setRefinery(e.target.value)}
                                    placeholder="e.g. Al Etihad Gold Refinery, Brinks Secure Storage..."
                                    className="w-full px-4 py-3 bg-secondary/30 border border-transparent rounded-lg focus:bg-background focus:border-primary/50 focus:ring-1 focus:ring-primary outline-none transition-all"
                                />
                                <p className="text-xs text-muted-foreground">Specify the refinery or secure facility where you wish to receive the bullion.</p>
                            </div>
                        </div>
                    </div>

                    {/* Price Summary */}
                    <div className="bg-secondary/30 rounded-xl p-5 border border-border space-y-3">
                        <div className="flex items-center gap-2 text-foreground font-medium mb-3">
                            <DollarSign className="w-4 h-4" />
                            Price Summary
                        </div>
                        <div className="space-y-2 text-sm">
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">Unit Price</span>
                                <span className="font-mono text-foreground">${deal.pricePerKg.toLocaleString()}/kg</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">Discount</span>
                                <span className="font-mono text-accent">-{deal.discount}%</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">Final Unit Price</span>
                                <span className="font-mono text-foreground">${finalPrice.toLocaleString()}/kg</span>
                            </div>
                            <div className="h-px bg-border my-2"></div>
                            <div className="flex justify-between text-base">
                                <span className="text-muted-foreground">Quantity</span>
                                <span className="font-mono text-foreground">{quantity} kg</span>
                            </div>
                            <div className="flex justify-between text-lg font-bold pt-2 border-t border-border">
                                <span className="text-foreground">Total Cost</span>
                                <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent font-mono">
                                    ${totalCost.toLocaleString()}
                                </span>
                            </div>
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
                        {loading ? 'Processing...' : 'Confirm Purchase'}
                    </button>
                </div>
            </div>
        </div>
    );
}
