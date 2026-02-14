'use client';

import { useState } from 'react';
import { Eye, User, DollarSign, Calendar, Package } from 'lucide-react';
import ExportReviewModal from './ExportReviewModal';
import { useRouter } from 'next/navigation';

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
    status: string;
    crowdfundingId: string | null;
    reviewedBy: string | null;
    reviewedAt: Date | null;
    rejectionReason: string | null;
    exportedAt: Date | null;
    createdAt: Date;
    deal: {
        company: string;
        commodity: string;
        type: string;
        purity: number;
    };
    purchase: {
        id: string;
        quantity: number;
        totalPrice: number;
        createdAt: Date;
        buyer: {
            id: string;
            name: string | null;
            email: string;
        };
    };
};

export default function ExportsTable({ exports, status }: { exports: ExportData[]; status: string }) {
    const [selectedExport, setSelectedExport] = useState<ExportData | null>(null);
    const router = useRouter();

    if (exports.length === 0) {
        return (
            <div className="text-center py-12">
                <Package className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">No {status.toLowerCase()} exports found</p>
            </div>
        );
    }

    return (
        <>
            <div className="overflow-x-auto">
                <table className="w-full">
                    <thead>
                        <tr className="border-b border-border">
                            <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Campaign</th>
                            <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Buyer</th>
                            <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Amount</th>
                            <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Risk/APY</th>
                            <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Status Details</th>
                            <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Date</th>
                            <th className="text-right py-3 px-4 text-sm font-medium text-muted-foreground">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {exports.map((exp) => (
                            <tr key={exp.id} className="border-b border-border/50 hover:bg-secondary/20 transition-colors">
                                <td className="py-4 px-4">
                                    <div>
                                        <p className="font-medium text-foreground">{exp.cfName}</p>
                                        <p className="text-xs text-muted-foreground mt-0.5">
                                            {exp.deal.company} • {exp.purchase.quantity}kg
                                        </p>
                                    </div>
                                </td>
                                <td className="py-4 px-4">
                                    <div className="flex items-center gap-2">
                                        <User className="w-4 h-4 text-muted-foreground" />
                                        <div>
                                            <p className="text-sm text-foreground font-medium">
                                                {exp.purchase.buyer.name || 'N/A'}
                                            </p>
                                            <p className="text-xs text-muted-foreground">{exp.purchase.buyer.email}</p>
                                        </div>
                                    </div>
                                </td>
                                <td className="py-4 px-4">
                                    <div className="flex items-center gap-1">
                                        <DollarSign className="w-4 h-4 text-muted-foreground" />
                                        <p className="font-mono text-sm text-foreground font-medium">
                                            {exp.cfAmountRequired.toLocaleString()}
                                        </p>
                                    </div>
                                </td>
                                <td className="py-4 px-4">
                                    <div>
                                        <span className={`inline-block px-2 py-0.5 rounded text-xs font-medium ${exp.cfRisk === 'Low' ? 'bg-green-500/20 text-green-500' :
                                                exp.cfRisk === 'Medium' ? 'bg-yellow-500/20 text-yellow-500' :
                                                    'bg-red-500/20 text-red-500'
                                            }`}>
                                            {exp.cfRisk}
                                        </span>
                                        <p className="text-xs text-muted-foreground mt-1">{exp.cfTargetApy}% APY</p>
                                    </div>
                                </td>
                                <td className="py-4 px-4">
                                    {status === 'EXPORTED' && exp.crowdfundingId && (
                                        <div className="text-xs">
                                            <p className="text-muted-foreground">Campaign ID</p>
                                            <p className="font-mono text-foreground">{exp.crowdfundingId}</p>
                                            <p className="text-muted-foreground mt-1">
                                                {exp.exportedAt ? new Date(exp.exportedAt).toLocaleDateString() : ''}
                                            </p>
                                        </div>
                                    )}
                                    {status === 'REJECTED' && exp.rejectionReason && (
                                        <div className="text-xs max-w-xs">
                                            <p className="text-muted-foreground">Reason:</p>
                                            <p className="text-foreground text-red-600">{exp.rejectionReason}</p>
                                            <p className="text-muted-foreground mt-1">
                                                By: {exp.reviewedBy || 'N/A'}
                                            </p>
                                        </div>
                                    )}
                                    {status === 'APPROVED' && (
                                        <div className="text-xs">
                                            <p className="text-blue-600 font-medium">Awaiting Export</p>
                                            <p className="text-muted-foreground">
                                                Approved by: {exp.reviewedBy || 'N/A'}
                                            </p>
                                            {exp.reviewedAt && (
                                                <p className="text-muted-foreground">
                                                    {new Date(exp.reviewedAt).toLocaleDateString()}
                                                </p>
                                            )}
                                        </div>
                                    )}
                                    {status === 'PENDING' && (
                                        <div className="text-xs">
                                            <p className="text-yellow-600 font-medium">Awaiting Review</p>
                                        </div>
                                    )}
                                </td>
                                <td className="py-4 px-4">
                                    <div className="flex items-center gap-1">
                                        <Calendar className="w-3 h-3 text-muted-foreground" />
                                        <p className="text-sm text-muted-foreground">
                                            {new Date(exp.createdAt).toLocaleDateString()}
                                        </p>
                                    </div>
                                </td>
                                <td className="py-4 px-4 text-right">
                                    <button
                                        onClick={() => setSelectedExport(exp)}
                                        className="inline-flex items-center gap-2 px-3 py-1.5 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors"
                                    >
                                        <Eye className="w-4 h-4" />
                                        {status === 'PENDING' ? 'Review' : 'View'}
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {selectedExport && (
                <ExportReviewModal
                    exportData={selectedExport}
                    onClose={() => {
                        setSelectedExport(null);
                        router.refresh();
                    }}
                    readOnly={status !== 'PENDING'}
                />
            )}
        </>
    );
}
