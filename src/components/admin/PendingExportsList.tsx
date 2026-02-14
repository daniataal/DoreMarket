'use client';

import { useState } from 'react';
import { Eye } from 'lucide-react';
import ExportReviewModal from '@/components/admin/ExportReviewModal';

type PendingExport = {
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

export default function PendingExportsList({ exports }: { exports: PendingExport[] }) {
    const [selectedExport, setSelectedExport] = useState<PendingExport | null>(null);

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
                            <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Duration</th>
                            <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Created</th>
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
                                    <div>
                                        <p className="text-sm text-foreground">{exp.purchase.buyer.name || 'N/A'}</p>
                                        <p className="text-xs text-muted-foreground">{exp.purchase.buyer.email}</p>
                                    </div>
                                </td>
                                <td className="py-4 px-4">
                                    <p className="font-mono text-sm text-foreground">
                                        ${exp.cfAmountRequired.toLocaleString()}
                                    </p>
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
                                    <p className="text-sm text-foreground">{exp.cfDuration} months</p>
                                </td>
                                <td className="py-4 px-4">
                                    <p className="text-sm text-muted-foreground">
                                        {new Date(exp.createdAt).toLocaleDateString()}
                                    </p>
                                </td>
                                <td className="py-4 px-4 text-right">
                                    <button
                                        onClick={() => setSelectedExport(exp)}
                                        className="inline-flex items-center gap-2 px-3 py-1.5 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors"
                                    >
                                        <Eye className="w-4 h-4" />
                                        Review
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
                    onClose={() => setSelectedExport(null)}
                />
            )}
        </>
    );
}
