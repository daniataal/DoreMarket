'use client';

import { DealCard } from "./DealCard";
import { PurchaseModal } from "./PurchaseModal";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function ClientBuyButton({ deal, userBalance, userInfo }: { deal: any; userBalance: number; userInfo?: any }) {
    const router = useRouter();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedDeal, setSelectedDeal] = useState<any>(null);

    const handleBuyClick = (deal: any) => {
        setSelectedDeal(deal);
        setIsModalOpen(true);
    };

    const handlePurchase = async (quantity: number, deliveryLocation: string) => {
        if (!selectedDeal) return;

        const res = await fetch(`/api/v1/deals/${selectedDeal.id}/purchase`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ quantity, deliveryLocation })
        });

        const data = await res.json();

        if (!res.ok) {
            throw new Error(data.error || 'Purchase failed');
        }

        // Success - refresh the page to show updated availability
        router.refresh();
    };

    return (
        <>
            <DealCard deal={deal} onBuy={handleBuyClick} />
            {selectedDeal && (
                <PurchaseModal
                    isOpen={isModalOpen}
                    onClose={() => setIsModalOpen(false)}
                    deal={selectedDeal}
                    userBalance={userBalance}
                    onPurchase={handlePurchase}
                />
            )}
        </>
    );
}
