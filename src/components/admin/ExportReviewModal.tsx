'use client';

import { useState } from 'react';
import { X, CheckCircle, XCircle, Edit2, Loader2, AlertCircle, FileText } from 'lucide-react';
import { useRouter } from 'next/navigation';
import SpaViewButton from '@/components/SpaViewButton';

type ExportData = {
    id: string;
    cfType: string;
    cfName: string;
    cfIcon: string;
    cfRisk: string;
    cfTargetApy: number;
    cfDuration: number;
    cfMinInvestment: number;
    cfAmountRequired: number;
    cfDescription: string;
    cfOrigin: string;
    cfDestination: string;
    cfTransportMethod: string;
    cfMetalForm: string;
    cfPurityPercent: number;
    cfFrequency: string;
    status: string;
    crowdfundingId?: string | null;
    reviewedBy?: string | null;
    reviewedAt?: Date | null;
    rejectionReason?: string | null;
    exportedAt?: Date | null;
    purchase: {
        id: string;
        quantity: number;
        totalPrice: number;
        buyer: {
            id: string;
            name: string | null;
            email: string;
        };
    };
    deal: {
        company: string;
        commodity: string;
    };
};

export default function ExportReviewModal({
    exportData,
    onClose,
    readOnly = false
}: {
    exportData: ExportData;
    onClose: () => void;
    readOnly?: boolean;
}) {
    const router = useRouter();
    const [isEditing, setIsEditing] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [formData, setFormData] = useState(exportData);
    const [rejectionReason, setRejectionReason] = useState('');
    const [showRejectModal, setShowRejectModal] = useState(false);

    const canEdit = !readOnly && exportData.status === 'PENDING';

    const handleUpdate = async () => {
        setIsSubmitting(true);
        try {
            const response = await fetch(`/api/admin/exports/${exportData.id}/update`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });

            if (response.ok) {
                setIsEditing(false);
                alert('Parameters updated successfully!');
            } else {
                alert('Failed to update parameters');
            }
        } catch (error) {
            console.error('Update error:', error);
            alert('An error occurred');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleApprove = async () => {
        if (!confirm('Approve and export this purchase to crowdfunding?')) return;

        setIsSubmitting(true);
        try {
            const response = await fetch(`/api/admin/exports/${exportData.id}/approve`, {
                method: 'POST'
            });

            if (response.ok) {
                alert('Export approved and sent to crowdfunding platform!');
                router.refresh();
                onClose();
            } else {
                const data = await response.json();
                alert(`Failed to approve: ${data.error || 'Unknown error'}`);
            }
        } catch (error) {
            console.error('Approve error:', error);
            alert('An error occurred');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleReject = async () => {
        if (!rejectionReason.trim()) {
            alert('Please provide a reason for rejection');
            return;
        }

        setIsSubmitting(true);
        try {
            const response = await fetch(`/api/admin/exports/${exportData.id}/reject`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ reason: rejectionReason })
            });

            if (response.ok) {
                alert('Export rejected');
                router.refresh();
                onClose();
            } else {
                alert('Failed to reject export');
            }
        } catch (error) {
            console.error('Reject error:', error);
            alert('An error occurred');
        } finally {
            setIsSubmitting(false);
            setShowRejectModal(false);
        }
    };

    return (
        <>
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                <div className="bg-card border border-border rounded-xl shadow-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
                    {/* Header */}
                    <div className="sticky top-0 bg-card border-b border-border p-6 flex items-center justify-between">
                        <div>
                            <h2 className="text-2xl font-bold text-foreground">
                                {readOnly ? 'View Export' : 'Review Export'}
                            </h2>
                            <p className="text-sm text-muted-foreground mt-1">
                                Status: <span className={`font-medium ${exportData.status === 'EXPORTED' ? 'text-green-500' :
                                    exportData.status === 'REJECTED' ? 'text-red-500' :
                                        exportData.status === 'APPROVED' ? 'text-blue-500' :
                                            'text-yellow-500'
                                    }`}>{exportData.status}</span>
                            </p>
                        </div>
                        <div className="flex items-center gap-3">
                            <SpaViewButton
                                purchase={exportData.purchase as any}
                                sellerConfig={{
                                    companyName: process.env.NEXT_PUBLIC_SELLER_COMPANY_NAME || "FONKEM GROUP LLC-FZ",
                                    address: process.env.NEXT_PUBLIC_SELLER_ADDRESS || "Meydan Grandstand, Dubai, UAE",
                                    tradeLicense: process.env.NEXT_PUBLIC_SELLER_TRADE_LICENSE || "2537157.01",
                                    representative: process.env.NEXT_PUBLIC_SELLER_REPRESENTATIVE || "Thalefo Moshanyana",
                                    passportNumber: process.env.NEXT_PUBLIC_SELLER_PASSPORT_NUMBER || "A11611955",
                                    passportExpiry: process.env.NEXT_PUBLIC_SELLER_PASSPORT_EXPIRY || "13/11/2034",
                                    country: process.env.NEXT_PUBLIC_SELLER_COUNTRY || "UAE",
                                    telephone: process.env.NEXT_PUBLIC_SELLER_TELEPHONE || "(+27) 063 638 9245",
                                    email: process.env.NEXT_PUBLIC_SELLER_EMAIL || ""
                                }}
                            />
                            <button
                                onClick={onClose}
                                className="p-2 hover:bg-secondary rounded-lg transition-colors"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                    </div>

                    {/* Content */}
                    <div className="p-6 space-y-6">
                        {/* Purchase &Buyer Info */}
                        <div className="bg-secondary/30 rounded-lg p-4">
                            <h3 className="font-semibold text-foreground mb-3">Purchase & Buyer Details</h3>
                            <div className="grid grid-cols-2 gap-4 text-sm">
                                <div>
                                    <p className="text-muted-foreground">Buyer Name</p>
                                    <p className="font-medium text-foreground">{exportData.purchase.buyer.name || 'N/A'}</p>
                                </div>
                                <div>
                                    <p className="text-muted-foreground">Buyer Email</p>
                                    <p className="font-medium text-foreground">{exportData.purchase.buyer.email}</p>
                                </div>
                                <div>
                                    <p className="text-muted-foreground">Company</p>
                                    <p className="font-medium text-foreground">{exportData.deal.company}</p>
                                </div>
                                <div>
                                    <p className="text-muted-foreground">Commodity</p>
                                    <p className="font-medium text-foreground">{exportData.deal.commodity}</p>
                                </div>
                                <div>
                                    <p className="text-muted-foreground">Quantity</p>
                                    <p className="font-medium text-foreground">{exportData.purchase.quantity} kg</p>
                                </div>
                                <div>
                                    <p className="text-muted-foreground">Total Price</p>
                                    <p className="font-medium text-foreground">${exportData.purchase.totalPrice.toLocaleString()}</p>
                                </div>
                            </div>
                        </div>

                        {/* Status Info for completed exports */}
                        {exportData.status !== 'PENDING' && (
                            <div className={`rounded-lg p-4 ${exportData.status === 'EXPORTED' ? 'bg-green-500/10 border border-green-500/20' :
                                exportData.status === 'REJECTED' ? 'bg-red-500/10 border border-red-500/20' :
                                    'bg-blue-500/10 border border-blue-500/20'
                                }`}>
                                <div className="flex items-start gap-3">
                                    {exportData.status === 'EXPORTED' && <CheckCircle className="w-5 h-5 text-green-500 mt-0.5" />}
                                    {exportData.status === 'REJECTED' && <XCircle className="w-5 h-5 text-red-500 mt-0.5" />}
                                    {exportData.status === 'APPROVED' && <AlertCircle className="w-5 h-5 text-blue-500 mt-0.5" />}
                                    <div className="flex-1">
                                        <p className="font-semibold text-foreground">
                                            {exportData.status === 'EXPORTED' && 'Successfully Exported'}
                                            {exportData.status === 'REJECTED' && 'Export Rejected'}
                                            {exportData.status === 'APPROVED' && 'Approved - Awaiting Export'}
                                        </p>
                                        {exportData.reviewedBy && (
                                            <p className="text-sm text-muted-foreground mt-1">
                                                By: {exportData.reviewedBy} • {exportData.reviewedAt ? new Date(exportData.reviewedAt).toLocaleString() : ''}
                                            </p>
                                        )}
                                        {exportData.status === 'EXPORTED' && exportData.crowdfundingId && (
                                            <p className="text-sm mt-2">
                                                <span className="text-muted-foreground">Campaign ID:</span>{' '}
                                                <span className="font-mono text-foreground">{exportData.crowdfundingId}</span>
                                            </p>
                                        )}
                                        {exportData.status === 'REJECTED' && exportData.rejectionReason && (
                                            <p className="text-sm mt-2 text-red-600">
                                                <span className="font-medium">Reason:</span> {exportData.rejectionReason}
                                            </p>
                                        )}
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Crowdfunding Parameters */}
                        <div>
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="font-semibold text-foreground">Crowdfunding Parameters</h3>
                                {canEdit && !isEditing && (
                                    <button
                                        onClick={() => setIsEditing(true)}
                                        className="inline-flex items-center gap-2 px-3 py-1.5 bg-secondary hover:bg-secondary/80 rounded-lg text-sm font-medium transition-colors"
                                    >
                                        <Edit2 className="w-4 h-4" />
                                        Edit
                                    </button>
                                )}
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-muted-foreground mb-1">Campaign Name</label>
                                    {isEditing ? (
                                        <input
                                            type="text"
                                            value={formData.cfName}
                                            onChange={(e) => setFormData({ ...formData, cfName: e.target.value })}
                                            className="w-full p-2 bg-secondary/30 rounded-lg text-foreground border border-transparent focus:border-primary outline-none"
                                        />
                                    ) : (
                                        <p className="text-foreground p-2">{formData.cfName}</p>
                                    )}
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-muted-foreground mb-1">Risk Level</label>
                                    {isEditing ? (
                                        <select
                                            value={formData.cfRisk}
                                            onChange={(e) => setFormData({ ...formData, cfRisk: e.target.value })}
                                            className="w-full p-2 bg-secondary/30 rounded-lg text-foreground border border-transparent focus:border-primary outline-none"
                                        >
                                            <option value="Low">Low</option>
                                            <option value="Medium">Medium</option>
                                            <option value="High">High</option>
                                        </select>
                                    ) : (
                                        <p className="text-foreground p-2">{formData.cfRisk}</p>
                                    )}
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-muted-foreground mb-1">Target APY (%)</label>
                                    {isEditing ? (
                                        <input
                                            type="number"
                                            value={formData.cfTargetApy}
                                            onChange={(e) => setFormData({ ...formData, cfTargetApy: parseFloat(e.target.value) })}
                                            className="w-full p-2 bg-secondary/30 rounded-lg text-foreground border border-transparent focus:border-primary outline-none"
                                        />
                                    ) : (
                                        <p className="text-foreground p-2">{formData.cfTargetApy}%</p>
                                    )}
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-muted-foreground mb-1">Duration (months)</label>
                                    {isEditing ? (
                                        <input
                                            type="number"
                                            value={formData.cfDuration}
                                            onChange={(e) => setFormData({ ...formData, cfDuration: parseInt(e.target.value) })}
                                            className="w-full p-2 bg-secondary/30 rounded-lg text-foreground border border-transparent focus:border-primary outline-none"
                                        />
                                    ) : (
                                        <p className="text-foreground p-2">{formData.cfDuration} months</p>
                                    )}
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-muted-foreground mb-1">Min Investment ($)</label>
                                    {isEditing ? (
                                        <input
                                            type="number"
                                            value={formData.cfMinInvestment}
                                            onChange={(e) => setFormData({ ...formData, cfMinInvestment: parseFloat(e.target.value) })}
                                            className="w-full p-2 bg-secondary/30 rounded-lg text-foreground border border-transparent focus:border-primary outline-none"
                                        />
                                    ) : (
                                        <p className="text-foreground p-2">${formData.cfMinInvestment.toLocaleString()}</p>
                                    )}
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-muted-foreground mb-1">Origin</label>
                                    {isEditing ? (
                                        <input
                                            type="text"
                                            value={formData.cfOrigin}
                                            onChange={(e) => setFormData({ ...formData, cfOrigin: e.target.value })}
                                            className="w-full p-2 bg-secondary/30 rounded-lg text-foreground border border-transparent focus:border-primary outline-none"
                                        />
                                    ) : (
                                        <p className="text-foreground p-2">{formData.cfOrigin}</p>
                                    )}
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-muted-foreground mb-1">Destination</label>
                                    {isEditing ? (
                                        <input
                                            type="text"
                                            value={formData.cfDestination}
                                            onChange={(e) => setFormData({ ...formData, cfDestination: e.target.value })}
                                            className="w-full p-2 bg-secondary/30 rounded-lg text-foreground border border-transparent focus:border-primary outline-none"
                                        />
                                    ) : (
                                        <p className="text-foreground p-2">{formData.cfDestination}</p>
                                    )}
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-muted-foreground mb-1">Transport Method</label>
                                    {isEditing ? (
                                        <select
                                            value={formData.cfTransportMethod}
                                            onChange={(e) => setFormData({ ...formData, cfTransportMethod: e.target.value })}
                                            className="w-full p-2 bg-secondary/30 rounded-lg text-foreground border border-transparent focus:border-primary outline-none"
                                        >
                                            <option value="Air Freight">Air Freight</option>
                                            <option value="Sea Freight">Sea Freight</option>
                                            <option value="Road Transport">Road Transport</option>
                                            <option value="Rail Transport">Rail Transport</option>
                                        </select>
                                    ) : (
                                        <p className="text-foreground p-2">{formData.cfTransportMethod}</p>
                                    )}
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-muted-foreground mb-1">Deal Frequency</label>
                                    {isEditing ? (
                                        <select
                                            value={formData.cfFrequency}
                                            onChange={(e) => setFormData({ ...formData, cfFrequency: e.target.value })}
                                            className="w-full p-2 bg-secondary/30 rounded-lg text-foreground border border-transparent focus:border-primary outline-none"
                                        >
                                            <option value="SPOT">SPOT</option>
                                            <option value="WEEKLY">WEEKLY</option>
                                            <option value="BIWEEKLY">BIWEEKLY</option>
                                            <option value="MONTHLY">MONTHLY</option>
                                            <option value="QUARTERLY">QUARTERLY</option>
                                        </select>
                                    ) : (
                                        <p className="text-foreground p-2 font-bold text-accent">{formData.cfFrequency}</p>
                                    )}
                                </div>

                                <div className="md:col-span-2">
                                    <label className="block text-sm font-medium text-muted-foreground mb-1">Description</label>
                                    {isEditing ? (
                                        <textarea
                                            value={formData.cfDescription}
                                            onChange={(e) => setFormData({ ...formData, cfDescription: e.target.value })}
                                            rows={3}
                                            className="w-full p-2 bg-secondary/30 rounded-lg text-foreground border border-transparent focus:border-primary outline-none"
                                        />
                                    ) : (
                                        <p className="text-foreground p-2">{formData.cfDescription}</p>
                                    )}
                                </div>
                            </div>

                            {isEditing && (
                                <div className="flex gap-3 mt-4">
                                    <button
                                        onClick={handleUpdate}
                                        disabled={isSubmitting}
                                        className="px-4 py-2 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 transition-colors disabled:opacity-50"
                                    >
                                        {isSubmitting ? 'Saving...' : 'Save Changes'}
                                    </button>
                                    <button
                                        onClick={() => {
                                            setFormData(exportData);
                                            setIsEditing(false);
                                        }}
                                        className="px-4 py-2 bg-secondary hover:bg-secondary/80 rounded-lg font-medium transition-colors"
                                    >
                                        Cancel
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Footer Actions - only for PENDING */}
                    {canEdit && (
                        <div className="sticky bottom-0 bg-card border-t border-border p-6 flex gap-3">
                            <button
                                onClick={handleApprove}
                                disabled={isSubmitting || isEditing}
                                className="flex-1 inline-flex items-center justify-center gap-2 px-6 py-3 bg-green-600 text-white rounded-lg font-bold hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {isSubmitting ? (
                                    <><Loader2 className="w-5 h-5 animate-spin" /> Processing...</>
                                ) : (
                                    <><CheckCircle className="w-5 h-5" /> Approve & Export</>
                                )}
                            </button>
                            <button
                                onClick={() => setShowRejectModal(true)}
                                disabled={isSubmitting || isEditing}
                                className="flex-1 inline-flex items-center justify-center gap-2 px-6 py-3 bg-red-600 text-white rounded-lg font-bold hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                <XCircle className="w-5 h-5" /> Reject
                            </button>
                        </div>
                    )}
                </div>
            </div>

            {/* Rejection Reason Modal */}
            {showRejectModal && (
                <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-[60] p-4">
                    <div className="bg-card border border-border rounded-xl shadow-xl max-w-md w-full p-6">
                        <h3 className="text-xl font-bold text-foreground mb-4">Reject Export</h3>
                        <p className="text-sm text-muted-foreground mb-4">
                            Please provide a reason for rejecting this export. This will be recorded for future reference.
                        </p>
                        <textarea
                            value={rejectionReason}
                            onChange={(e) => setRejectionReason(e.target.value)}
                            placeholder="Enter rejection reason..."
                            rows={4}
                            className="w-full p-3 bg-secondary/30 rounded-lg text-foreground border border-border focus:border-red-500 outline-none mb-4"
                            autoFocus
                        />
                        <div className="flex gap-3">
                            <button
                                onClick={handleReject}
                                disabled={isSubmitting || !rejectionReason.trim()}
                                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 transition-colors disabled:opacity-50"
                            >
                                {isSubmitting ? 'Rejecting...' : 'Confirm Rejection'}
                            </button>
                            <button
                                onClick={() => {
                                    setShowRejectModal(false);
                                    setRejectionReason('');
                                }}
                                className="px-4 py-2 bg-secondary hover:bg-secondary/80 rounded-lg font-medium transition-colors"
                            >
                                Cancel
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
