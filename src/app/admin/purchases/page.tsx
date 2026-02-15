import { prisma } from "@/lib/prisma";
import { Package, Truck, Calendar, User as UserIcon } from "lucide-react";
import PurchaseLogisticsActions from "@/components/admin/PurchaseLogisticsActions";
import SpaViewButton from "@/components/SpaViewButton";

export const dynamic = 'force-dynamic';

export default async function AdminPurchasesPage() {
    const purchases = await (prisma as any).purchase.findMany({
        orderBy: { createdAt: 'desc' },
        include: {
            buyer: true,
            deal: true,
            agreement: true
        }
    });

    // Get Seller Configuration for SPA
    const sellerConfig = {
        companyName: process.env.SELLER_COMPANY_NAME || "FONKEM GROUP LLC-FZ",
        address: process.env.SELLER_ADDRESS || "Meydan Grandstand, Dubai, UAE",
        tradeLicense: process.env.SELLER_TRADE_LICENSE || "2537157.01",
        representative: process.env.SELLER_REPRESENTATIVE || "Thalefo Moshanyana",
        passportNumber: process.env.SELLER_PASSPORT_NUMBER || "A11611955",
        passportExpiry: process.env.SELLER_PASSPORT_EXPIRY || "13/11/2034",
        country: process.env.SELLER_COUNTRY || "UAE",
        telephone: process.env.SELLER_TELEPHONE || "(+27) 063 638 9245",
        email: process.env.SELLER_EMAIL || ""
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'DELIVERED':
                return 'bg-green-500/10 text-green-500';
            case 'SHIPPED':
                return 'bg-blue-500/10 text-blue-500';
            case 'CONFIRMED':
                return 'bg-yellow-500/10 text-yellow-500';
            default:
                return 'bg-gray-500/10 text-gray-500';
        }
    };

    return (
        <div className="max-w-7xl mx-auto">
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h1 className="text-3xl font-bold text-foreground">Manage Purchases & Logistics</h1>
                    <p className="text-muted-foreground mt-1">Track and update delivery status for all purchases</p>
                </div>
                <div className="text-right">
                    <div className="text-2xl font-bold text-foreground">{purchases.length}</div>
                    <div className="text-xs text-muted-foreground">Total Purchases</div>
                </div>
            </div>

            <div className="bg-card border border-border rounded-xl shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-secondary/50 text-muted-foreground text-xs uppercase tracking-wider">
                            <tr>
                                <th className="px-6 py-4 font-semibold">Purchase Info</th>
                                <th className="px-6 py-4 font-semibold">Buyer</th>
                                <th className="px-6 py-4 font-semibold">Quantity & Price</th>
                                <th className="px-6 py-4 font-semibold">Status</th>
                                <th className="px-6 py-4 font-semibold">Logistics</th>
                                <th className="px-6 py-4 font-semibold text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border">
                            {purchases.map((p: any) => {
                                const purchase = p as any;
                                return (
                                    <tr key={purchase.id} className="hover:bg-secondary/20 transition-colors">
                                        <td className="px-6 py-4">
                                            <div>
                                                <div className="font-medium text-foreground flex items-center gap-2">
                                                    <Package className="w-4 h-4 text-primary" />
                                                    {purchase.deal?.company}
                                                </div>
                                                <div className="text-sm text-muted-foreground mt-0.5">
                                                    {purchase.deal?.commodity}
                                                </div>
                                                <div className="text-xs font-mono text-muted-foreground mt-1">
                                                    ID: {purchase.id.slice(0, 8)}...
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div>
                                                <div className="font-medium text-foreground">
                                                    {purchase.buyer?.name || 'Unknown'}
                                                </div>
                                                <div className="text-sm text-muted-foreground">
                                                    {purchase.buyer?.email}
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div>
                                                <div className="font-medium text-foreground">
                                                    {purchase.quantity} kg
                                                </div>
                                                <div className="text-sm font-mono text-muted-foreground">
                                                    ${purchase.totalPrice?.toLocaleString()}
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${getStatusColor(purchase.status)}`}>
                                                {purchase.status}
                                            </span>
                                            <div className="text-xs text-muted-foreground mt-1">
                                                {new Date(purchase.createdAt).toLocaleDateString()}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            {purchase.logisticsCompany ? (
                                                <div className="space-y-1">
                                                    <div className="flex items-center gap-1.5 text-xs font-medium text-foreground">
                                                        <Truck className="w-3 h-3" />
                                                        {purchase.logisticsCompany}
                                                    </div>
                                                    {purchase.trackingNumber && (
                                                        <div className="text-xs font-mono text-muted-foreground">
                                                            {purchase.trackingNumber}
                                                        </div>
                                                    )}
                                                    {purchase.shippedAt && (
                                                        <div className="text-xs text-muted-foreground flex items-center gap-1">
                                                            <Calendar className="w-3 h-3" />
                                                            Shipped: {new Date(purchase.shippedAt).toLocaleDateString()}
                                                        </div>
                                                    )}
                                                    {purchase.deliveredAt && (
                                                        <div className="text-xs text-green-500 flex items-center gap-1">
                                                            <Calendar className="w-3 h-3" />
                                                            Delivered: {new Date(purchase.deliveredAt).toLocaleDateString()}
                                                        </div>
                                                    )}
                                                </div>
                                            ) : (
                                                <span className="text-xs text-muted-foreground italic">
                                                    Not assigned
                                                </span>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <div className="flex items-center justify-end gap-2">
                                                <SpaViewButton
                                                    purchase={purchase}
                                                    sellerConfig={sellerConfig}
                                                />
                                                <PurchaseLogisticsActions
                                                    purchaseId={purchase.id}
                                                    currentStatus={purchase.status}
                                                    currentLogistics={{
                                                        company: purchase.logisticsCompany,
                                                        trackingNumber: purchase.trackingNumber,
                                                        shippedAt: purchase.shippedAt,
                                                        deliveredAt: purchase.deliveredAt,
                                                        notes: purchase.logisticsNotes
                                                    }}
                                                />
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
