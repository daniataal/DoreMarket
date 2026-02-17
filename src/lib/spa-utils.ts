export interface SpaVariables {
    YEAR: string;
    DATE: string;
    SELLER_NAME: string;
    SELLER_ADDRESS: string;
    SELLER_TRADE_LICENCE: string;
    SELLER_REPRESENTATIVE: string;
    SELLER_PASSPORT_NUMBER: string;
    SELLER_PASSPORT_EXPIRY: string;
    SELLER_COUNTRY: string;
    SELLER_TELEPHONE: string;
    SELLER_EMAIL: string;
    BUYER_NAME: string;
    BUYER_ADDRESS: string;
    BUYER_TRADE_LICENCE: string;
    BUYER_REPRESENTED_BY: string;
    BUYER_PASSPORT_NUMBER: string;
    BUYER_PASSPORT_EXPIRY: string;
    BUYER_COUNTRY: string;
    BUYER_TELEPHONE: string;
    BUYER_EMAIL: string;
    AU_PURITY: string;
    AU_FINESSE: string;
    AU_ORIGIN: string;
    AU_ORIGIN_PORT: string;
    AU_DELIVERY_PORT: string;
    AU_DESTINATION: string;
    QUANTITY: string;
    PRICE: string;
    DEAL_ID: string;
    DELIVERY_COUNTRY: string;
    DURATION: string;
    EXTENSIONS: string;
    TOTAL_QUANTITY: string;
    FREQUENCY: string;
}

interface GenerateSpaParams {
    deal: any;
    buyer: any;
    sellerConfig: any;
    quantity: number;
    deliveryLocation: string;
    incoterms?: string;
    refinery?: string;
    customDate?: Date;
}

export function generateSpaVariables({
    deal,
    buyer,
    sellerConfig,
    quantity,
    deliveryLocation,
    refinery,
    customDate
}: GenerateSpaParams): SpaVariables {
    const date = customDate || new Date();

    // Buyer Details
    const buyerName = `${buyer?.firstName || buyer?.name || ''} ${buyer?.lastName || ''}`.trim() || 'Buyer';

    // Delivery Location Logic
    const fullDeliveryLocation = refinery?.trim()
        ? `${deliveryLocation} - ${refinery.trim()}`
        : deliveryLocation;

    const getDeliveryCountry = () => {
        // Simple heuristic: if deliveryLocation contains comma, take last part
        if (deliveryLocation.includes(',')) {
            const parts = deliveryLocation.split(',');
            return parts[parts.length - 1].trim().toUpperCase();
        }

        const locationMap: { [key: string]: string } = {
            'Dubai': 'UAE',
            'Johannesburg': 'ZAF',
            'London': 'UK',
            'Singapore': 'SGP',
            'Mumbai': 'IND'
        };

        // Handle "City - Refinery" format if passed directly as location
        const baseCity = deliveryLocation.split(' - ')[0];
        return locationMap[baseCity] || locationMap[deliveryLocation] || 'UAE';
    };

    const getDeliveryPort = () => {
        const portMap: { [key: string]: string } = {
            'Dubai': 'DXB – Dubai International Airport',
            'Johannesburg': 'JNB – O.R. Tambo International Airport',
            'London': 'LHR – London Heathrow Airport',
            'Singapore': 'SIN – Singapore Changi Airport',
            'Mumbai': 'BOM – Chhatrapati Shivaji Maharaj International Airport'
        };
        const baseCity = deliveryLocation.split(' - ')[0];
        return portMap[baseCity] || portMap[deliveryLocation] || 'International Airport';
    };

    return {
        DEAL_ID: deal.externalId || deal.id,
        YEAR: date.getFullYear().toString(),
        DATE: date.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }),

        // Seller Details
        SELLER_NAME: deal.company || sellerConfig.companyName,
        SELLER_ADDRESS: deal.sellerAddress || sellerConfig.address,
        SELLER_TRADE_LICENCE: deal.sellerTradeLicense || sellerConfig.tradeLicense,
        SELLER_REPRESENTATIVE: deal.sellerRepresentative || sellerConfig.representative,
        SELLER_PASSPORT_NUMBER: deal.sellerPassportNumber || sellerConfig.passportNumber,
        SELLER_PASSPORT_EXPIRY: deal.sellerPassportExpiry || sellerConfig.passportExpiry,
        SELLER_COUNTRY: deal.sellerCountry || sellerConfig.country,
        SELLER_TELEPHONE: deal.sellerTelephone || sellerConfig.telephone,
        SELLER_EMAIL: deal.sellerEmail || sellerConfig.email,

        // Buyer Details
        BUYER_NAME: buyerName,
        BUYER_ADDRESS: buyer?.address || "[Buyer Address to be provided]",
        BUYER_TRADE_LICENCE: "[Buyer Trade Licence to be provided]",
        BUYER_REPRESENTED_BY: buyerName,
        BUYER_PASSPORT_NUMBER: buyer?.passportNumber || "[Buyer Passport Number to be provided]",
        BUYER_PASSPORT_EXPIRY: buyer?.passportExpiry || "[Buyer Passport Expiry to be provided]",
        BUYER_COUNTRY: buyer?.nationality || "[Buyer Country to be provided]",
        BUYER_TELEPHONE: buyer?.phoneNumber || "[Buyer Telephone to be provided]",
        BUYER_EMAIL: buyer?.email || "",

        // Deal Details
        AU_PURITY: `${((deal.purity || 0.9999) * 100).toFixed(2)}%`,
        AU_FINESSE: deal.purity && deal.purity >= 0.9999 ? "24 Carat" : "+23 Carats",
        AU_ORIGIN: deal.cfOrigin || deal.origin || "Not Specified",
        AU_ORIGIN_PORT: deal.cfOriginPort || deal.originPort || "Not Specified",
        AU_DELIVERY_PORT: getDeliveryPort(),
        AU_DESTINATION: fullDeliveryLocation,
        QUANTITY: quantity.toString(),
        PRICE: `$${(deal.pricePerKg || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} USD/kg`,
        DELIVERY_COUNTRY: getDeliveryCountry(),
        DURATION: deal.frequency === 'SPOT' ? "One-time" : `${deal.contractDuration || 1} Year${(deal.contractDuration || 1) > 1 ? 's' : ''}`,
        EXTENSIONS: deal.frequency === 'SPOT' ? "None" : `${deal.extensionYears || 5} Years Rolling`,
        TOTAL_QUANTITY: `${(deal.totalQuantity || quantity).toLocaleString()} kg`,
        FREQUENCY: deal.frequency || 'SPOT'
    };
}
