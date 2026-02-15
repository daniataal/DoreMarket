'use client';

import React, { useState } from 'react';
import { FileText, Eye, Loader2, CheckCircle } from 'lucide-react';
import SpaPreviewModal from './SpaPreviewModal';
import { signPurchaseAgreement } from '@/lib/actions';
import { useRouter } from 'next/navigation';

interface SpaViewButtonProps {
    purchase: any;
    sellerConfig: any;
}

export default function SpaViewButton({ purchase, sellerConfig }: SpaViewButtonProps) {
    const [loading, setLoading] = useState(false);
    const [signing, setSigning] = useState(false);
    const [showPreview, setShowPreview] = useState(false);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const router = useRouter();

    const isSigned = purchase.agreement?.status === 'SIGNED';

    const getSpaVariables = () => {
        // If already signed and we have saved data, use it!
        if (isSigned && purchase.agreement.spaData) {
            return purchase.agreement.spaData;
        }

        // Otherwise generate from live data (Draft)
        const buyerName = `${purchase.buyer?.firstName || purchase.buyer?.name || ''} ${purchase.buyer?.lastName || ''}`.trim() || 'Buyer';

        const getDeliveryCountry = () => {
            const locationMap: { [key: string]: string } = {
                'Dubai': 'UAE',
                'Johannesburg': 'ZAF',
                'London': 'UK',
                'Singapore': 'SGP',
                'Mumbai': 'IND'
            };

            if (purchase.deliveryLocation.includes(' - ')) {
                const baseCity = purchase.deliveryLocation.split(' - ')[0];
                return locationMap[baseCity] || 'UAE';
            }

            return locationMap[purchase.deliveryLocation] || 'UAE';
        };

        return {
            DEAL_ID: purchase.deal?.externalId || purchase.deal?.id,
            DATE: new Date(purchase.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }),
            SELLER_NAME: sellerConfig.companyName,
            SELLER_ADDRESS: sellerConfig.address,
            SELLER_TRADE_LICENCE: sellerConfig.tradeLicense,
            SELLER_REPRESENTATIVE: sellerConfig.representative,
            SELLER_PASSPORT_NUMBER: sellerConfig.passportNumber,
            SELLER_PASSPORT_EXPIRY: sellerConfig.passportExpiry,
            SELLER_COUNTRY: sellerConfig.country,
            SELLER_TELEPHONE: sellerConfig.telephone,
            SELLER_EMAIL: sellerConfig.email,
            BUYER_NAME: buyerName,
            BUYER_ADDRESS: purchase.buyer?.address || "[Buyer Address to be provided]",
            BUYER_TRADE_LICENCE: "[Buyer Trade Licence to be provided]",
            BUYER_REPRESENTED_BY: buyerName,
            BUYER_COUNTRY: purchase.buyer?.nationality || "[Buyer Country to be provided]",
            BUYER_TELEPHONE: "[Buyer Telephone to be provided]",
            BUYER_EMAIL: purchase.buyer?.email || "",
            AU_PURITY: `${((purchase.deal?.purity || 0.9999) * 100).toFixed(2)}%`,
            AU_FINESSE: purchase.deal?.purity && purchase.deal?.purity >= 0.9999 ? "24 Carat" : "+23 Carats",
            AU_ORIGIN: "Uganda",
            AU_ORIGIN_PORT: "Kampala",
            AU_DELIVERY_PORT: "DXB – Dubai International Airport",
            AU_DESTINATION: purchase.deliveryLocation,
            QUANTITY: purchase.quantity.toString(),
            PRICE: `$${(purchase.deal?.pricePerKg || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} USD/kg`,
            DELIVERY_COUNTRY: getDeliveryCountry()
        };
    };

    const handlePreview = async () => {
        try {
            setLoading(true);
            const { generateSpaPdfUrl } = await import('@/components/SpaPdfDocument');
            const variables = getSpaVariables();
            const url = await generateSpaPdfUrl(variables);
            setPreviewUrl(url);
            setShowPreview(true);
        } catch (e) {
            console.error(e);
            alert('Failed to generate SPA preview');
        } finally {
            setLoading(false);
        }
    };

    const handleSign = async () => {
        if (!confirm('Are you sure you want to sign this SPA? This will freeze the document details.')) return;

        try {
            setSigning(true);
            const variables = getSpaVariables();
            await signPurchaseAgreement(purchase.id, variables);
            alert('SPA signed and saved successfully!');
            router.refresh();
        } catch (e) {
            console.error(e);
            alert('Failed to sign SPA');
        } finally {
            setSigning(false);
        }
    };

    return (
        <>
            <div className="flex items-center gap-2">
                <button
                    onClick={handlePreview}
                    disabled={loading}
                    className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors disabled:opacity-50 ${isSigned
                        ? "bg-green-600 hover:bg-green-700 text-white"
                        : "bg-blue-600 hover:bg-blue-700 text-white"
                        }`}
                    title={isSigned ? "View Signed SPA" : "View Draft SPA"}
                >
                    {loading ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                        <FileText className="w-4 h-4" />
                    )}
                    {isSigned ? 'View SPA (Signed)' : 'Preview SPA'}
                </button>

            </div>

            <SpaPreviewModal
                isOpen={showPreview}
                onClose={() => setShowPreview(false)}
                pdfUrl={previewUrl}
                title={isSigned ? "Signed Sale & Purchase Agreement" : "Draft Sale & Purchase Agreement"}
            />
        </>
    );
}
