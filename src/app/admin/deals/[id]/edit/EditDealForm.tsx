'use client';

import { useActionState, useEffect, useState } from 'react';
import { updateDeal } from '@/lib/actions';
import { Calculator, RefreshCw, Info, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

// Mock Service for Client Side (or use server action, passing it down)
// Since GoldPriceService is likely server-side (fs/etc?), we should fetch live price via server action or API.
import { getLiveGoldPrice } from '@/lib/actions';

const GOLD_TYPES = [
    { label: 'Bullion (99.99%)', value: 'BULLION', purity: 0.9999 },
    { label: 'Dore (24K)', value: 'DORE_24K', purity: 0.999 },
    { label: 'Dore (23K)', value: 'DORE_23K', purity: 0.958 },
    { label: 'Dore (22K)', value: 'DORE_22K', purity: 0.916 },
    { label: 'Dore (21K)', value: 'DORE_21K', purity: 0.875 },
    { label: 'Dore (18K)', value: 'DORE_18K', purity: 0.750 },
];

export default function EditDealForm({ deal }: { deal: any }) {
    const updateDealWithId = updateDeal.bind(null, deal.id);
    const [state, dispatch, isPending] = useActionState(updateDealWithId, undefined);

    const [type, setType] = useState(deal.type || 'BULLION');
    const [purity, setPurity] = useState(deal.purity || 0.9999);
    const [pricingModel, setPricingModel] = useState(deal.pricingModel || 'FIXED');
    const [discount, setDiscount] = useState(deal.discount || 0);
    const [fixedPrice, setFixedPrice] = useState<number | ''>(deal.pricingModel === 'FIXED' ? deal.pricePerKg : '');
    const [marketPrice, setMarketPrice] = useState(0);
    const [quantity, setQuantity] = useState(deal.quantity || 0);
    const [incoterms, setIncoterms] = useState(deal.incoterms || 'CIF');
    const [frequency, setFrequency] = useState(deal.frequency || 'SPOT');

    const fetchPrice = async () => {
        const price = await getLiveGoldPrice();
        setMarketPrice(price);
    };

    useEffect(() => {
        fetchPrice();
    }, []);

    // Auto-update purity when type changes
    useEffect(() => {
        const selectedType = GOLD_TYPES.find(t => t.value === type);
        if (selectedType) {
            setPurity(selectedType.purity);
        }
    }, [type]);

    const calculatedPrice = pricingModel === 'FIXED'
        ? (fixedPrice === '' ? 0 : fixedPrice)
        : (marketPrice * purity) * (1 - discount / 100);

    const multipliers = { SPOT: 1, WEEKLY: 52, BIWEEKLY: 26, MONTHLY: 12, QUARTERLY: 4 };
    const totalAnnualQuantity = quantity * (multipliers[frequency as keyof typeof multipliers] || 1);

    return (
        <div className="max-w-5xl mx-auto pb-10">
            <div className="flex items-center gap-4 mb-6">
                <Link href="/admin/deals" className="p-2 hover:bg-secondary rounded-full transition-colors">
                    <ArrowLeft className="w-5 h-5 text-muted-foreground" />
                </Link>
                <div>
                    <h1 className="text-3xl font-bold text-foreground">Edit Deal</h1>
                    <p className="text-muted-foreground mt-1">Update deal configurations and pricing</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Main Form */}
                <div className="lg:col-span-2 space-y-6">
                    <form action={dispatch} className="space-y-6">
                        {/* Hidden inputs for server action if needed, though bind passes ID */}
                        <div className="bg-card border border-border rounded-xl p-6 shadow-sm space-y-6">
                            <h2 className="text-xl font-semibold mb-4">Deal Information</h2>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-sm font-medium mb-2 text-muted-foreground">Company Name</label>
                                    <input
                                        name="company"
                                        defaultValue={deal.company}
                                        type="text"
                                        required
                                        className="w-full p-3 bg-secondary/50 rounded-lg text-foreground border border-transparent focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all"
                                        placeholder="e.g. Gold Corp Ltd."
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-2 text-muted-foreground">Commodity</label>
                                    <input
                                        name="commodity"
                                        defaultValue={deal.commodity}
                                        type="text"
                                        required
                                        className="w-full p-3 bg-secondary/50 rounded-lg text-foreground border border-transparent focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all"
                                        placeholder="e.g. Gold Bars"
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-sm font-medium mb-2 text-muted-foreground">Transaction Terms</label>
                                    <select
                                        name="incoterms"
                                        value={incoterms}
                                        onChange={(e) => setIncoterms(e.target.value)}
                                        className="w-full p-3 bg-secondary/50 rounded-lg text-foreground border border-transparent focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all appearance-none cursor-pointer"
                                    >
                                        <option value="CIF">CIF - Cost, Insurance & Freight</option>
                                        <option value="FOB">FOB - Free On Board</option>
                                        <option value="EXW">EXW - Ex Works / Cash & Carry</option>
                                    </select>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {incoterms !== 'CIF' ? (
                                    <div>
                                        <label className="block text-sm font-medium mb-2 text-muted-foreground">
                                            {incoterms === 'FOB' ? 'FOB Point / Trading Hub' : 'Pickup Location / Trading Hub'}
                                        </label>
                                        <div className="relative">
                                            <input
                                                name="deliveryLocation"
                                                defaultValue={deal.deliveryLocation || 'Dubai'}
                                                type="text"
                                                required
                                                className="w-full p-3 bg-secondary/50 rounded-lg text-foreground border border-transparent focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all pl-10"
                                                placeholder="e.g. Dubai, Ghana, London"
                                            />
                                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">📍</span>
                                        </div>
                                        <p className="text-xs text-muted-foreground mt-1">Where the commodity is currently located</p>
                                    </div>
                                ) : (
                                    <input type="hidden" name="deliveryLocation" value={deal.deliveryLocation || 'Dubai'} />
                                )}

                                <div>
                                    <label className="block text-sm font-medium mb-2 text-muted-foreground">Quantity (kg)</label>
                                    <input
                                        name="quantity"
                                        value={quantity}
                                        onChange={(e) => setQuantity(parseFloat(e.target.value) || 0)}
                                        type="number"
                                        step="0.01"
                                        required
                                        className="w-full p-3 bg-secondary/50 rounded-lg text-foreground border border-transparent focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all font-mono"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium mb-2 text-muted-foreground">Deal Frequency</label>
                                    <select
                                        name="frequency"
                                        value={frequency}
                                        onChange={(e) => setFrequency(e.target.value)}
                                        className="w-full p-3 bg-secondary/50 rounded-lg text-foreground border border-transparent focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all appearance-none cursor-pointer"
                                    >
                                        <option value="SPOT">One-time Deal (Spot)</option>
                                        <option value="WEEKLY">Weekly Supply</option>
                                        <option value="BIWEEKLY">Bi-weekly Supply</option>
                                        <option value="MONTHLY">Monthly Supply</option>
                                        <option value="QUARTERLY">Quarterly Supply</option>
                                    </select>
                                    {frequency !== 'SPOT' && (
                                        <div className="mt-2 p-3 bg-primary/5 rounded-lg border border-primary/20">
                                            <div className="text-xs font-bold text-primary flex justify-between items-center">
                                                <span>Annual Commitment</span>
                                                <span className="text-sm">{totalAnnualQuantity.toLocaleString()} kg / Year</span>
                                            </div>
                                            <div className="text-xs font-bold text-primary flex justify-between items-center mt-1">
                                                <span>Estimated Annual Value</span>
                                                <span className="text-sm">${(totalAnnualQuantity * (calculatedPrice || 0)).toLocaleString(undefined, { maximumFractionDigits: 0 })}</span>
                                            </div>
                                            <div className="text-[10px] text-primary/70 mt-1 font-medium">
                                                Breakdown: {quantity} kg x {multipliers[frequency as keyof typeof multipliers]} periods per year
                                            </div>
                                            <p className="text-[10px] text-muted-foreground mt-2 pt-2 border-t border-primary/10 text-center">
                                                * 1 Year Contract with 5 Years rolling extensions
                                            </p>
                                        </div>
                                    )}
                                </div>
                            </div>

                        </div>

                        {/* Config Panel */}
                        <div className="bg-card border border-border rounded-xl p-6 shadow-sm space-y-6">
                            <div className="flex items-center justify-between mb-4">
                                <h2 className="text-xl font-semibold">Pricing Configuration</h2>
                                <div className="flex items-center gap-2 bg-secondary/50 px-3 py-1.5 rounded-lg border border-border/50">
                                    <span className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Live Market Price</span>
                                    <div className="flex items-center gap-2">
                                        <span className="font-mono font-bold text-foreground">
                                            ${marketPrice.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                                        </span>
                                        <button type="button" onClick={fetchPrice} className="p-1 hover:bg-background rounded-full transition-colors" title="Refresh Price">
                                            <RefreshCw className="w-3 h-3 text-muted-foreground" />
                                        </button>
                                    </div>
                                </div>
                            </div>

                            <div className="p-4 bg-blue-500/5 border border-blue-500/10 rounded-lg flex gap-3 text-sm text-blue-400 mb-6">
                                <Info className="w-5 h-5 flex-shrink-0" />
                                <p>
                                    Configure the gold type and pricing model. Dynamic pricing will automatically adjust based on market rates. Assumes standard purity calculation.
                                </p>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {/* Type Selector */}
                                <div>
                                    <label className="block text-sm font-medium mb-2 text-muted-foreground">Gold Type</label>
                                    <div className="relative">
                                        <select
                                            name="type"
                                            value={type}
                                            onChange={(e) => setType(e.target.value)}
                                            className="w-full p-3 bg-secondary/50 rounded-lg text-foreground border border-transparent focus:border-primary focus:ring-1 focus:ring-primary outline-none appearance-none cursor-pointer"
                                        >
                                            {GOLD_TYPES.map(t => (
                                                <option key={t.value} value={t.value}>{t.label}</option>
                                            ))}
                                        </select>
                                    </div>
                                </div>

                                {/* Purity Input (Read-only mostly) */}
                                <div>
                                    <label className="block text-sm font-medium mb-2 text-muted-foreground">Purity Factor (0-1)</label>
                                    <input
                                        name="purity"
                                        type="number"
                                        step="0.0001"
                                        max="1"
                                        min="0"
                                        value={purity}
                                        onChange={(e) => setPurity(parseFloat(e.target.value))}
                                        className="w-full p-3 bg-secondary/50 rounded-lg text-foreground border border-transparent focus:border-primary focus:ring-1 focus:ring-primary outline-none font-mono"
                                    />
                                    <p className="text-xs text-muted-foreground mt-1">{(purity * 100).toFixed(2)}% Pure Gold</p>
                                </div>

                                {/* Pricing Model */}
                                <div>
                                    <label className="block text-sm font-medium mb-2 text-muted-foreground">Pricing Model</label>
                                    <div className="flex bg-secondary/50 p-1 rounded-lg">
                                        {['FIXED', 'DYNAMIC'].map(model => (
                                            <button
                                                key={model}
                                                type="button"
                                                onClick={() => setPricingModel(model)}
                                                className={`flex-1 py-2 text-sm font-medium rounded-md transition-all ${pricingModel === model
                                                    ? 'bg-background text-foreground shadow-sm'
                                                    : 'text-muted-foreground hover:text-foreground'
                                                    }`}
                                            >
                                                {model === 'FIXED' ? 'Fixed Rate' : 'Live / Dynamic'}
                                            </button>
                                        ))}
                                    </div>
                                    <input type="hidden" name="pricingModel" value={pricingModel} />
                                </div>

                                {/* Discount or Fixed Price */}
                                <div>
                                    {pricingModel === 'FIXED' ? (
                                        <>
                                            <label className="block text-sm font-medium mb-2 text-muted-foreground">Fixed Price ($/kg)</label>
                                            <input
                                                name="fixedPrice"
                                                type="number"
                                                step="0.01"
                                                value={fixedPrice}
                                                onChange={(e) => setFixedPrice(e.target.value === '' ? '' : parseFloat(e.target.value))}
                                                className="w-full p-3 bg-secondary/50 rounded-lg text-foreground border border-transparent focus:border-primary focus:ring-1 focus:ring-primary outline-none font-mono"
                                                placeholder="0.00"
                                            />
                                            <input type="hidden" name="discount" value="0" />
                                            <p className="text-xs text-muted-foreground mt-1">Set a fixed price per kilogram</p>
                                        </>
                                    ) : (
                                        <>
                                            <label className="block text-sm font-medium mb-2 text-muted-foreground">Discount (%)</label>
                                            <div className="relative">
                                                <input
                                                    name="discount"
                                                    type="number"
                                                    step="0.1"
                                                    value={discount}
                                                    onChange={(e) => setDiscount(parseFloat(e.target.value) || 0)}
                                                    className="w-full p-3 bg-secondary/50 rounded-lg text-foreground border border-transparent focus:border-primary focus:ring-1 focus:ring-primary outline-none font-mono pr-8"
                                                    placeholder="2.0"
                                                />
                                                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">%</span>
                                            </div>
                                        </>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Seller & Origin Config */}
                        <div className="bg-card border border-border rounded-xl p-6 shadow-sm space-y-6">
                            <h2 className="text-xl font-semibold mb-4">Seller & Origin Details (SPA)</h2>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-sm font-medium mb-2 text-muted-foreground">Country of Origin (Mined)</label>
                                    <input
                                        name="cfOrigin"
                                        defaultValue={deal.cfOrigin}
                                        type="text"
                                        className="w-full p-3 bg-secondary/50 rounded-lg text-foreground border border-transparent focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all"
                                        placeholder="e.g. Uganda"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-2 text-muted-foreground">Port of Origin (Export)</label>
                                    <input
                                        name="cfOriginPort"
                                        defaultValue={deal.cfOriginPort}
                                        type="text"
                                        className="w-full p-3 bg-secondary/50 rounded-lg text-foreground border border-transparent focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all"
                                        placeholder="e.g. Kampala"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium mb-2 text-muted-foreground" htmlFor="cfType">Crowdfunding Type</label>
                                    <input
                                        type="text"
                                        name="cfType"
                                        id="cfType"
                                        defaultValue={deal.cfType || "Metals"}
                                        placeholder="e.g. Metals, Commodities"
                                        className="w-full p-3 bg-secondary/50 rounded-lg text-foreground border border-transparent focus:border-primary outline-none"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-2 text-muted-foreground" htmlFor="cfIcon">Crowdfunding Icon</label>
                                    <select
                                        name="cfIcon"
                                        id="cfIcon"
                                        defaultValue={deal.cfIcon || "gold-bar"}
                                        className="w-full p-3 bg-secondary/50 rounded-lg text-foreground border border-transparent focus:border-primary outline-none appearance-none"
                                    >
                                        <option value="gold-bar">Gold Bar</option>
                                        <option value="coins">Coins</option>
                                        <option value="factory">Factory/Dore</option>
                                        <option value="ship">Ship/Logistics</option>
                                    </select>
                                </div>

                                <div className="col-span-full">
                                    <label className="block text-sm font-medium mb-2 text-muted-foreground">Seller Address</label>
                                    <input
                                        name="sellerAddress"
                                        defaultValue={deal.sellerAddress}
                                        type="text"
                                        className="w-full p-3 bg-secondary/50 rounded-lg text-foreground border border-transparent focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all"
                                        placeholder="Business Address"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium mb-2 text-muted-foreground">Trade License No.</label>
                                    <input
                                        name="sellerTradeLicense"
                                        defaultValue={deal.sellerTradeLicense}
                                        type="text"
                                        className="w-full p-3 bg-secondary/50 rounded-lg text-foreground border border-transparent focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all"
                                        placeholder="License Number"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-2 text-muted-foreground">Representative Name</label>
                                    <input
                                        name="sellerRepresentative"
                                        defaultValue={deal.sellerRepresentative}
                                        type="text"
                                        className="w-full p-3 bg-secondary/50 rounded-lg text-foreground border border-transparent focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all"
                                        placeholder="Full Name"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium mb-2 text-muted-foreground">Passport Number</label>
                                    <input
                                        name="sellerPassportNumber"
                                        defaultValue={deal.sellerPassportNumber}
                                        type="text"
                                        className="w-full p-3 bg-secondary/50 rounded-lg text-foreground border border-transparent focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all"
                                        placeholder="Passport No."
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-2 text-muted-foreground">Passport Expiry</label>
                                    <input
                                        name="sellerPassportExpiry"
                                        defaultValue={deal.sellerPassportExpiry}
                                        type="text"
                                        className="w-full p-3 bg-secondary/50 rounded-lg text-foreground border border-transparent focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all"
                                        placeholder="DD/MM/YYYY"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium mb-2 text-muted-foreground">Seller Country</label>
                                    <input
                                        name="sellerCountry"
                                        defaultValue={deal.sellerCountry}
                                        type="text"
                                        className="w-full p-3 bg-secondary/50 rounded-lg text-foreground border border-transparent focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all"
                                        placeholder="Country"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-2 text-muted-foreground">Seller Phone</label>
                                    <input
                                        name="sellerTelephone"
                                        defaultValue={deal.sellerTelephone}
                                        type="text"
                                        className="w-full p-3 bg-secondary/50 rounded-lg text-foreground border border-transparent focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all"
                                        placeholder="+123..."
                                    />
                                </div>
                                <div className="col-span-full">
                                    <label className="block text-sm font-medium mb-2 text-muted-foreground">Seller Email</label>
                                    <input
                                        name="sellerEmail"
                                        defaultValue={deal.sellerEmail}
                                        type="email"
                                        className="w-full p-3 bg-secondary/50 rounded-lg text-foreground border border-transparent focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all"
                                        placeholder="email@company.com"
                                    />
                                </div>
                            </div>
                        </div>

                        {state && <p className="text-sm text-destructive font-medium">{state}</p>}

                        <button
                            type="submit"
                            disabled={isPending}
                            className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-bold py-4 rounded-xl shadow-lg shadow-primary/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {isPending ? 'Updating Deal...' : 'Save Changes'}
                        </button>
                    </form>
                </div>

                {/* Live Preview Panel */}
                <div className="lg:col-span-1">
                    <div className="sticky top-6 bg-card border border-border rounded-xl p-6 shadow-lg">
                        <div className="flex items-center gap-2 mb-6 text-foreground">
                            <Calculator className="w-5 h-5 text-primary" />
                            <h3 className="font-bold text-lg">New Price Preview</h3>
                        </div>

                        <div className="space-y-4">
                            <div className="flex justify-between items-center text-sm">
                                <span className="text-muted-foreground">Market Price</span>
                                <span className="font-mono text-foreground">${marketPrice.toLocaleString()}/kg</span>
                            </div>

                            <div className="flex justify-between items-center text-sm">
                                <span className="text-muted-foreground">Purity ({GOLD_TYPES.find(t => t.value === type)?.label.split(' ')[0] || 'Custom'})</span>
                                <span className="font-mono text-foreground">{(purity * 100).toFixed(2)}%</span>
                            </div>

                            <div className="flex justify-between items-center text-sm">
                                <span className="text-muted-foreground">Discount</span>
                                <span className="font-mono text-accent">-{discount}%</span>
                            </div>

                            <div className="h-px bg-border my-2" />

                            <div className="space-y-1">
                                <span className="block text-xs text-muted-foreground uppercase tracking-wider">Calculated Price</span>
                                <div className="font-mono text-3xl font-bold text-foreground">
                                    ${calculatedPrice.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                </div>
                                <span className="text-xs text-muted-foreground">per kg</span>
                            </div>

                            <div className="p-3 bg-secondary/30 rounded-lg border border-border/50 mt-4">
                                <div className="flex justify-between items-center mb-1">
                                    <span className="text-xs text-muted-foreground">Total Deal Value</span>
                                </div>
                                <div className="font-mono text-lg font-semibold text-foreground leading-none">
                                    ${(quantity * calculatedPrice).toLocaleString(undefined, { maximumFractionDigits: 0 })}
                                </div>
                                {frequency !== 'SPOT' && (
                                    <div className="text-xs font-bold text-accent mt-1">
                                        Annual: ${(totalAnnualQuantity * calculatedPrice).toLocaleString(undefined, { maximumFractionDigits: 0 })}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
