"use client";
import React, { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function AgreementForm({ deal, defaultData }: any) {
    const router = useRouter();
    const [formData, setFormData] = useState({
        buyerName: defaultData.buyerName,
        sellerName: defaultData.sellerName,
        date: defaultData.date,
        additionalTerms: "Standard marketplace terms apply. Delivery upon full payment verification."
    });
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        const terms = `
SALE AND PURCHASE AGREEMENT

Ref: ${defaultData.dealId}
Date: ${formData.date}

BETWEEN:
Seller: ${formData.sellerName}
AND
Buyer: ${formData.buyerName}

1. COMMODITY
   Product: ${defaultData.commodity}
   Quantity: ${defaultData.quantity} kg
   Origin: [Origin Pending]
   Purity: 99.9% (Standard)

2. PRICE AND PAYMENT
   Unit Price: $${defaultData.pricePerKg.toLocaleString()} / kg
   Discount: ${defaultData.discount}%
   Total Contract Value: $${defaultData.totalPrice.toLocaleString()}

3. DELIVERY
   Incoterms: CIF Dubai (or as specified)
   Destination: Dubai International Airport Free Zone (or as specified)

4. TERMS
   ${formData.additionalTerms}

IN WITNESS WHEREOF, the parties have executed this Agreement on the date first above written.

SELLER: ________________________ (Digital Confirmation)
BUYER:  ________________________ (Digital Confirmation)
        `.trim();

        try {
            const res = await fetch(`/api/deals/${deal.id}/agreement`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ ...formData, terms })
            });
            if (res.ok) {
                router.refresh();
            }
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="bg-card border border-border rounded-xl p-8 shadow-sm max-w-2xl mx-auto space-y-6">
            <h2 className="text-xl font-semibold">Review & Sign Agreement</h2>
            <div className="grid grid-cols-2 gap-4">
                <div>
                    <label className="text-sm font-medium text-muted-foreground">Buyer Name</label>
                    <input
                        className="w-full mt-1 p-2 bg-background border border-input rounded-md"
                        value={formData.buyerName}
                        onChange={e => setFormData({ ...formData, buyerName: e.target.value })}
                    />
                </div>
                <div>
                    <label className="text-sm font-medium text-muted-foreground">Seller Name</label>
                    <input
                        className="w-full mt-1 p-2 bg-background border border-input rounded-md"
                        value={formData.sellerName}
                        readOnly // Usually fixed from Deal
                    />
                </div>
            </div>
            <div>
                <label className="text-sm font-medium text-muted-foreground">Agreement Date</label>
                <input
                    type="date"
                    className="w-full mt-1 p-2 bg-background border border-input rounded-md"
                    value={formData.date}
                    onChange={e => setFormData({ ...formData, date: e.target.value })}
                />
            </div>
            <div>
                <label className="text-sm font-medium text-muted-foreground">Additional Terms</label>
                <textarea
                    className="w-full mt-1 p-2 bg-background border border-input rounded-md h-32"
                    value={formData.additionalTerms}
                    onChange={e => setFormData({ ...formData, additionalTerms: e.target.value })}
                />
            </div>

            <div className="pt-4 border-t border-border">
                <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-primary text-primary-foreground py-3 rounded-lg font-bold hover:opacity-90 transition disabled:opacity-50"
                >
                    {loading ? "Generating Agreement..." : "Generate & Sign Agreement"}
                </button>
            </div>
        </form>
    );
}
