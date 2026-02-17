'use client';

import { useActionState, useState, useEffect } from 'react';
import { createDeal, getLiveGoldPrice, getSellerIdentities } from '@/lib/actions';
import Link from 'next/link';
import { ArrowLeft, Calculator, RefreshCw, Info, Plus, ChevronRight, User, Globe, MapPin, Pencil, ChevronDown, ChevronUp } from 'lucide-react';

export default function CreateDealPage() {
    const initialState = { message: '' };
    const [state, dispatch] = useActionState(createDeal, initialState);

    const [step, setStep] = useState<'SELECT_SELLER' | 'CREATE_DEAL'>('SELECT_SELLER');
    const [showSellerDetails, setShowSellerDetails] = useState(false);

    // Form State
    const [type, setType] = useState('BULLION');
    const [pricingModel, setPricingModel] = useState('FIXED');
    const [purity, setPurity] = useState(0.9999);
    const [discount, setDiscount] = useState(0);
    const [fixedPrice, setFixedPrice] = useState<number | ''>('');
    const [quantity, setQuantity] = useState<number | ''>('');
    const [incoterms, setIncoterms] = useState('CIF');
    const [frequency, setFrequency] = useState('SPOT');

    // Market Data
    const [marketPrice, setMarketPrice] = useState(0);
    const [isLoadingPrice, setIsLoadingPrice] = useState(false);
    const [priceError, setPriceError] = useState(false);

    // Seller Data
    const [sellers, setSellers] = useState<any[]>([]);
    const [sellerDetails, setSellerDetails] = useState({
        companyName: '',
        originCountry: '',
        originPort: '',
        address: '',
        tradeLicense: '',
        representative: '',
        passportNumber: '',
        passportExpiry: '',
        country: '',
        telephone: '',
        email: '',
        id: ''
    });

    // Derived Values
    const calculatedPrice = pricingModel === 'FIXED'
        ? (fixedPrice === '' ? 0 : fixedPrice)
        : (marketPrice * purity) * (1 - discount / 100);

    const multipliers = { SPOT: 1, WEEKLY: 52, BIWEEKLY: 26, MONTHLY: 12, QUARTERLY: 4 };
    const totalAnnualQuantity = typeof quantity === 'number' ? quantity * (multipliers[frequency as keyof typeof multipliers] || 1) : 0;

    // Fetch initial market price and sellers
    useEffect(() => {
        refreshPrice();
        const interval = setInterval(refreshPrice, 10000);

        // Fetch sellers
        getSellerIdentities().then(setSellers).catch(console.error);

        return () => clearInterval(interval);
    }, []);

    const handleSellerSelect = (seller: any) => {
        setSellerDetails({
            companyName: seller.companyName,
            originCountry: seller.originCountry || '',
            originPort: seller.originPort || '',
            address: seller.address || '',
            tradeLicense: seller.tradeLicense || '',
            representative: seller.representative || '',
            passportNumber: seller.passportNumber || '',
            passportExpiry: seller.passportExpiry || '',
            country: seller.country || '',
            telephone: seller.telephone || '',
            email: seller.email || '',
            id: seller.id || ''
        });
        setStep('CREATE_DEAL');
    };

    // Update purity when type changes
    useEffect(() => {
        switch (type) {
            case 'BULLION': setPurity(0.9999); break;
            case '24K': setPurity(0.999); break; // Dore 24k
            case '23K': setPurity(0.958); break; // Dore 23k
            case '22K': setPurity(0.916); break; // Dore 22k
            case '21K': setPurity(0.875); break; // Dore 21k
            case '18K': setPurity(0.750); break; // Dore 18k
            default: setPurity(0.9999); // Keep manual if custom
        }
    }, [type]);

    const refreshPrice = async () => {
        setIsLoadingPrice(true);
        setPriceError(false);
        try {
            const price = await getLiveGoldPrice();
            if (price > 0) {
                setMarketPrice(price);
            } else {
                setPriceError(true);
            }
        } catch (error) {
            console.error("Failed to fetch price", error);
            setPriceError(true);
        } finally {
            setIsLoadingPrice(false);
        }
    };

    if (step === 'SELECT_SELLER') {
        return (
            <div className="container mx-auto p-6 max-w-5xl">
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <Link
                            href="/admin/deals"
                            className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground transition-colors mb-4"
                        >
                            <ArrowLeft className="w-4 h-4 mr-1" />
                            Back to Deals
                        </Link>
                        <h1 className="text-3xl font-bold text-foreground">Select Seller</h1>
                        <p className="text-muted-foreground mt-1">Choose a seller profile to start a new deal</p>
                    </div>
                    <Link
                        href="/admin/sellers/create"
                        className="inline-flex items-center px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors text-sm font-medium"
                    >
                        <Plus className="w-4 h-4 mr-2" />
                        New Seller Profile
                    </Link>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {sellers.map((seller) => (
                        <div
                            key={seller.id}
                            className="group relative bg-card border border-border hover:border-primary/50 hover:shadow-md transition-all rounded-xl p-6 overflow-hidden flex flex-col"
                        >
                            <div className="absolute top-4 right-4 z-20">
                                <Link
                                    href={`/admin/sellers/${seller.id}/edit`}
                                    className="p-2 bg-secondary/80 hover:bg-primary text-muted-foreground hover:text-primary-foreground rounded-lg transition-colors inline-flex items-center justify-center opacity-0 group-hover:opacity-100 focus:opacity-100"
                                    title="Edit Seller"
                                    onClick={(e) => e.stopPropagation()}
                                >
                                    <Pencil className="w-4 h-4" />
                                </Link>
                            </div>

                            <button
                                onClick={() => handleSellerSelect(seller)}
                                className="text-left w-full h-full flex flex-col focus:outline-none"
                                type="button"
                            >
                                <div className="flex items-start justify-between mb-4 w-full pr-10">
                                    <div className="p-3 bg-secondary/50 rounded-lg group-hover:bg-primary/10 transition-colors">
                                        {seller.logo ? (
                                            <img src={seller.logo} alt={seller.companyName} className="w-10 h-10 object-contain" />
                                        ) : (
                                            <User className="w-10 h-10 text-muted-foreground group-hover:text-primary transition-colors" />
                                        )}
                                    </div>
                                    {seller.alias && (
                                        <span className="text-xs font-medium px-2 py-1 bg-secondary rounded-full text-muted-foreground whitespace-nowrap">
                                            {seller.alias}
                                        </span>
                                    )}
                                </div>

                                <h3 className="text-lg font-semibold text-foreground mb-1 group-hover:text-primary transition-colors">{seller.companyName}</h3>

                                <div className="space-y-2 mt-4 text-sm text-muted-foreground">
                                    {seller.originCountry && (
                                        <div className="flex items-center gap-2">
                                            <Globe className="w-3.5 h-3.5" />
                                            <span>{seller.originCountry}</span>
                                        </div>
                                    )}
                                    {seller.originPort && (
                                        <div className="flex items-center gap-2">
                                            <MapPin className="w-3.5 h-3.5" />
                                            <span>{seller.originPort}</span>
                                        </div>
                                    )}
                                </div>

                                <div className="absolute right-4 bottom-4 opacity-0 group-hover:opacity-100 transition-all transform translate-x-2 group-hover:translate-x-0">
                                    <div className="p-2 bg-primary text-primary-foreground rounded-full shadow-lg">
                                        <ChevronRight className="w-4 h-4" />
                                    </div>
                                </div>
                            </button>
                        </div>
                    ))}

                    <Link
                        href="/admin/sellers/create"
                        className="flex flex-col items-center justify-center text-center bg-secondary/20 border-2 border-dashed border-border hover:border-primary/50 hover:bg-secondary/30 transition-all rounded-xl p-6 min-h-[200px]"
                    >
                        <div className="p-4 bg-background rounded-full mb-4 shadow-sm">
                            <Plus className="w-6 h-6 text-muted-foreground" />
                        </div>
                        <h3 className="font-medium text-foreground">Create New Seller</h3>
                        <p className="text-xs text-muted-foreground mt-1 px-4">Register a new mining company or supplier</p>
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto">
            <div className="mb-6 flex items-center justify-between">
                <div>
                    <button
                        onClick={() => setStep('SELECT_SELLER')}
                        className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground transition-colors mb-4"
                    >
                        <ArrowLeft className="w-4 h-4 mr-1" />
                        Change Seller
                    </button>
                    <h1 className="text-3xl font-bold text-foreground">Create New Deal</h1>
                    <p className="text-muted-foreground mt-1">For {sellerDetails.companyName}</p>
                </div>

                {/* Live Market Price Widget */}
                <div className="bg-card border border-border rounded-xl p-4 shadow-sm flex items-center gap-4">
                    <div>
                        <div className="text-xs text-muted-foreground font-medium uppercase tracking-wider">LBMA Gold Price</div>
                        <div className="text-2xl font-mono font-bold text-foreground">
                            {isLoadingPrice ? (
                                'Loading...'
                            ) : priceError ? (
                                <span className="text-destructive text-lg">API Error</span>
                            ) : marketPrice > 0 ? (
                                `$${marketPrice.toLocaleString()}`
                            ) : (
                                'Waiting...'
                            )}
                            {marketPrice > 0 && !priceError && <span className="text-sm text-muted-foreground font-normal ml-1">/kg</span>}
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
                            <input type="hidden" name="sellerId" value={sellerDetails.id} />

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {/* Basic Info */}
                                <div className="col-span-full">
                                    <label className="block text-sm font-medium text-muted-foreground mb-1" htmlFor="company">Company Name</label>
                                    <input
                                        type="text"
                                        name="company"
                                        id="company"
                                        required
                                        value={sellerDetails.companyName}
                                        onChange={(e) => setSellerDetails({ ...sellerDetails, companyName: e.target.value })}
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
                                    <label className="block text-sm font-medium text-muted-foreground mb-1" htmlFor="incoterms">Transaction Terms</label>
                                    <select
                                        name="incoterms"
                                        id="incoterms"
                                        value={incoterms}
                                        onChange={(e) => setIncoterms(e.target.value)}
                                        className="w-full p-3 bg-secondary/30 rounded-lg text-foreground border border-transparent focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all appearance-none"
                                    >
                                        <option value="CIF">CIF - Cost, Insurance & Freight (Delivery to Buyer)</option>
                                        <option value="FOB">FOB - Free On Board (Buyer arranges Shipping)</option>
                                        <option value="EXW">EXW - Ex Works / Cash & Carry (Buyer picks up)</option>
                                    </select>
                                    <p className="text-xs text-muted-foreground mt-1">
                                        {incoterms === 'CIF' && "Seller covers insurance and freight to buyer's destination."}
                                        {incoterms === 'FOB' && "Seller delivers to port; Buyer handles shipping."}
                                        {incoterms === 'EXW' && "Buyer collects directly from the trading hub."}
                                    </p>
                                </div>

                                {incoterms !== 'CIF' ? (
                                    <div>
                                        <label className="block text-sm font-medium text-muted-foreground mb-1">
                                            {incoterms === 'FOB' ? 'FOB Point / Trading Hub' : 'Pickup Location / Trading Hub'}
                                        </label>
                                        <div className="relative">
                                            <input
                                                type="text"
                                                name="deliveryLocation"
                                                id="deliveryLocation"
                                                required
                                                defaultValue="Dubai"
                                                className="w-full p-3 bg-secondary/30 rounded-lg text-foreground border border-transparent focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all placeholder:text-muted-foreground/50 pl-10"
                                                placeholder="e.g. Dubai, Ghana, London"
                                            />
                                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">📍</span>
                                        </div>
                                    </div>
                                ) : (
                                    <input type="hidden" name="deliveryLocation" value="Dubai" />
                                )}

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

                                <div>
                                    <label className="block text-sm font-medium text-muted-foreground mb-1" htmlFor="frequency">Deal Frequency</label>
                                    <select
                                        name="frequency"
                                        id="frequency"
                                        value={frequency}
                                        onChange={(e) => setFrequency(e.target.value)}
                                        className="w-full p-3 bg-secondary/30 rounded-lg text-foreground border border-transparent focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all appearance-none cursor-pointer"
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
                                            <p className="text-[10px] text-muted-foreground mt-2 pt-2 border-t border-primary/10">
                                                * 1 Year Contract with 5 Years rolling extensions
                                            </p>
                                        </div>
                                    )}
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
                                            max="0.9999"
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
                                        {pricingModel === 'FIXED' ? (
                                            <>
                                                <label className="block text-sm font-medium text-muted-foreground mb-1" htmlFor="fixedPrice">Fixed Price ($/kg)</label>
                                                <input
                                                    type="number"
                                                    name="fixedPrice"
                                                    id="fixedPrice"
                                                    required
                                                    min="0"
                                                    step="0.01"
                                                    value={fixedPrice}
                                                    onChange={(e) => {
                                                        const val = e.target.value === '' ? '' : parseFloat(e.target.value);
                                                        setFixedPrice(val);
                                                        if (typeof val === 'number' && marketPrice > 0) {
                                                            const baseValue = marketPrice * purity;
                                                            // fixed = base * (1 - discount/100)
                                                            // fixed/base = 1 - discount/100
                                                            // discount/100 = 1 - fixed/base
                                                            // discount = (1 - fixed/base) * 100
                                                            const impliedDiscount = (1 - val / baseValue) * 100;
                                                            setDiscount(parseFloat(impliedDiscount.toFixed(4)));
                                                        } else {
                                                            setDiscount(0);
                                                        }
                                                    }}
                                                    className="w-full p-3 bg-secondary/30 rounded-lg text-foreground border border-transparent focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all placeholder:text-muted-foreground/50"
                                                    placeholder="0.00"
                                                />
                                                {fixedPrice && marketPrice > 0 ? (
                                                    (() => {
                                                        const baseValue = marketPrice * purity;
                                                        const percentage = (Number(fixedPrice) / baseValue * 100) - 100;
                                                        const isPremium = percentage > 0;
                                                        const displayPercentage = Math.abs(percentage).toFixed(2);

                                                        // Example: Fixed=110, Base=100. Pct = 10%. Premium.
                                                        // Display: Premium +10.00%
                                                        // Hidden Discount: -10 (which means premium in our backend logic where discount is usually positive reduction)

                                                        // Example: Fixed=90, Base=100. Pct = -10%. Discount.
                                                        // Display: Discount -10.00% (or just 10%?)
                                                        // User asked: "IF ITS DISCOUNT IT STAYS MINUS (-)"
                                                        // Wait, user said: "IF ITS DISCOUNT IT STAYS MINUS (-) IF ITS PREMIUM IT WILL SAY PREMIUM AND ADD THE (+) AND THE PERCENTAGE"
                                                        // Example 90/100*100 - 100 = -10.
                                                        // So display "-10.00%".
                                                        // Hidden Discount: 10.

                                                        return (
                                                            <div className="flex items-center justify-between mt-1 text-xs">
                                                                <span className={isPremium ? "text-amber-500 font-medium" : "text-green-500 font-medium"}>
                                                                    {isPremium ? `Premium +${displayPercentage}%` : `Discount ${percentage.toFixed(2)}%`}
                                                                </span>
                                                                <input type="hidden" name="discount" value={(-percentage).toFixed(4)} />
                                                            </div>
                                                        );
                                                    })()
                                                ) : (
                                                    <input type="hidden" name="discount" value="0" />
                                                )}
                                                <p className="text-xs text-muted-foreground mt-1">Set a fixed price per kilogram. Base Value: ${(marketPrice * purity).toLocaleString(undefined, { maximumFractionDigits: 2 })}</p>
                                            </>
                                        ) : (
                                            <>
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
                                            </>
                                        )}
                                    </div>
                                </div>
                            </div>

                            <div className="h-px bg-border/50 my-6" />

                            <div className="space-y-4 bg-secondary/10 p-4 rounded-xl border border-border/50">
                                <button
                                    type="button"
                                    className="w-full flex items-center justify-between cursor-pointer focus:outline-none select-none py-1"
                                    onClick={() => setShowSellerDetails(!showSellerDetails)}
                                >
                                    <h3 className="text-lg font-semibold text-foreground flex items-center gap-2">
                                        <Info className="w-5 h-5 text-primary" />
                                        Seller & Origin Details
                                    </h3>
                                    <div className="flex items-center gap-2 text-sm text-primary font-medium bg-background/50 px-3 py-1.5 rounded-full border border-border hover:border-primary transition-colors">
                                        {showSellerDetails ? 'Collapse' : 'Expand Details'}
                                        {showSellerDetails ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                                    </div>
                                </button>

                                <div className={`grid grid-cols-1 md:grid-cols-2 gap-6 pt-6 border-t border-border/50 mt-4 animate-in fade-in slide-in-from-top-1 duration-200 ${!showSellerDetails ? 'hidden' : ''}`}>
                                    <div>
                                        <label className="block text-sm font-medium text-muted-foreground mb-1" htmlFor="cfOrigin">Country of Origin (Mined)</label>
                                        <input
                                            type="text"
                                            name="cfOrigin"
                                            id="cfOrigin"
                                            value={sellerDetails.originCountry}
                                            onChange={(e) => setSellerDetails({ ...sellerDetails, originCountry: e.target.value })}
                                            placeholder="e.g. Uganda"
                                            className="w-full p-3 bg-secondary/30 rounded-lg text-foreground border border-transparent focus:border-primary outline-none"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-muted-foreground mb-1" htmlFor="cfOriginPort">Port of Origin (Export)</label>
                                        <input
                                            type="text"
                                            name="cfOriginPort"
                                            id="cfOriginPort"
                                            value={sellerDetails.originPort}
                                            onChange={(e) => setSellerDetails({ ...sellerDetails, originPort: e.target.value })}
                                            placeholder="e.g. Kampala"
                                            className="w-full p-3 bg-secondary/30 rounded-lg text-foreground border border-transparent focus:border-primary outline-none"
                                        />
                                    </div>

                                    <div className="col-span-full">
                                        <label className="block text-sm font-medium text-muted-foreground mb-1" htmlFor="sellerAddress">Seller Address</label>
                                        <input
                                            type="text"
                                            name="sellerAddress"
                                            id="sellerAddress"
                                            value={sellerDetails.address}
                                            onChange={(e) => setSellerDetails({ ...sellerDetails, address: e.target.value })}
                                            placeholder="Business Address"
                                            className="w-full p-3 bg-secondary/30 rounded-lg text-foreground border border-transparent focus:border-primary outline-none"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-muted-foreground mb-1" htmlFor="sellerTradeLicense">Trade License No.</label>
                                        <input
                                            type="text"
                                            name="sellerTradeLicense"
                                            id="sellerTradeLicense"
                                            value={sellerDetails.tradeLicense}
                                            onChange={(e) => setSellerDetails({ ...sellerDetails, tradeLicense: e.target.value })}
                                            placeholder="License Number"
                                            className="w-full p-3 bg-secondary/30 rounded-lg text-foreground border border-transparent focus:border-primary outline-none"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-muted-foreground mb-1" htmlFor="sellerRepresentative">Representative Name</label>
                                        <input
                                            type="text"
                                            name="sellerRepresentative"
                                            id="sellerRepresentative"
                                            value={sellerDetails.representative}
                                            onChange={(e) => setSellerDetails({ ...sellerDetails, representative: e.target.value })}
                                            placeholder="Full Name"
                                            className="w-full p-3 bg-secondary/30 rounded-lg text-foreground border border-transparent focus:border-primary outline-none"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-muted-foreground mb-1" htmlFor="sellerPassportNumber">Passport Number</label>
                                        <input
                                            type="text"
                                            name="sellerPassportNumber"
                                            id="sellerPassportNumber"
                                            value={sellerDetails.passportNumber}
                                            onChange={(e) => setSellerDetails({ ...sellerDetails, passportNumber: e.target.value })}
                                            placeholder="Passport No."
                                            className="w-full p-3 bg-secondary/30 rounded-lg text-foreground border border-transparent focus:border-primary outline-none"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-muted-foreground mb-1" htmlFor="sellerPassportExpiry">Passport Expiry</label>
                                        <input
                                            type="text"
                                            name="sellerPassportExpiry"
                                            id="sellerPassportExpiry"
                                            value={sellerDetails.passportExpiry}
                                            onChange={(e) => setSellerDetails({ ...sellerDetails, passportExpiry: e.target.value })}
                                            placeholder="DD/MM/YYYY"
                                            className="w-full p-3 bg-secondary/30 rounded-lg text-foreground border border-transparent focus:border-primary outline-none"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-muted-foreground mb-1" htmlFor="sellerCountry">Seller Country</label>
                                        <input
                                            type="text"
                                            name="sellerCountry"
                                            id="sellerCountry"
                                            value={sellerDetails.country}
                                            onChange={(e) => setSellerDetails({ ...sellerDetails, country: e.target.value })}
                                            placeholder="Country"
                                            className="w-full p-3 bg-secondary/30 rounded-lg text-foreground border border-transparent focus:border-primary outline-none"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-muted-foreground mb-1" htmlFor="sellerTelephone">Seller Phone</label>
                                        <input
                                            type="text"
                                            name="sellerTelephone"
                                            id="sellerTelephone"
                                            value={sellerDetails.telephone}
                                            onChange={(e) => setSellerDetails({ ...sellerDetails, telephone: e.target.value })}
                                            placeholder="+123..."
                                            className="w-full p-3 bg-secondary/30 rounded-lg text-foreground border border-transparent focus:border-primary outline-none"
                                        />
                                    </div>
                                    <div className="col-span-full">
                                        <label className="block text-sm font-medium text-muted-foreground mb-1" htmlFor="sellerEmail">Seller Email</label>
                                        <input
                                            type="email"
                                            name="sellerEmail"
                                            id="sellerEmail"
                                            value={sellerDetails.email}
                                            onChange={(e) => setSellerDetails({ ...sellerDetails, email: e.target.value })}
                                            placeholder="email@company.com"
                                            className="w-full p-3 bg-secondary/30 rounded-lg text-foreground border border-transparent focus:border-primary outline-none"
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="pt-4 border-t border-border">
                                {state?.message && (
                                    <p className={`mt-4 text-center font-medium ${state.message.includes('Error') ? 'text-destructive' : 'text-green-500'}`}>
                                        {state.message}
                                    </p>
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
                                {Number(discount) !== 0 && (
                                    <div className="flex justify-between text-sm">
                                        <span className="text-muted-foreground">{Number(discount) < 0 ? 'Premium' : 'Discount'}</span>
                                        <span className={`font-mono ${Number(discount) < 0 ? 'text-amber-500' : 'text-accent'}`}>
                                            {Number(discount) < 0 ? '+' : '-'}{Math.abs(Number(discount)).toFixed(2)}%
                                        </span>
                                    </div>
                                )}
                                <div className="flex justify-between items-end pt-2 border-t border-primary/20">
                                    <div>
                                        <span className="block text-xs text-muted-foreground uppercase tracking-wider mb-1">Final Price (per kg)</span>
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
                        </div>

                        {quantity !== '' && (
                            <div className="p-4 bg-secondary/30 rounded-lg border border-border/50">
                                <div className="flex justify-between items-center mb-1">
                                    <span className="text-sm text-muted-foreground">Total Value ({quantity}kg)</span>
                                </div>
                                <div className="text-right flex flex-col items-end">
                                    <div className="text-2xl font-mono font-bold text-foreground relative">
                                        ${(calculatedPrice * Number(quantity)).toLocaleString(undefined, { maximumFractionDigits: 0 })}
                                        {pricingModel === 'DYNAMIC' && (
                                            <span className="absolute -top-1 -right-2 w-2 h-2 bg-blue-500 rounded-full animate-pulse" />
                                        )}
                                    </div>
                                    {frequency !== 'SPOT' && (
                                        <div className="text-sm font-bold text-accent mt-1">
                                            Annual: ${(totalAnnualQuantity * calculatedPrice).toLocaleString(undefined, { maximumFractionDigits: 0 })}
                                        </div>
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

    );
}
