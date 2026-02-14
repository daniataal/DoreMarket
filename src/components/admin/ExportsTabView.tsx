'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Clock, CheckCircle, XCircle, FileCheck } from 'lucide-react';
import ExportsTable from './ExportsTable';

type ExportWithDetails = {
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

type StatusCounts = {
    PENDING: number;
    APPROVED: number;
    REJECTED: number;
    EXPORTED: number;
};

export default function ExportsTabView({
    exports,
    counts,
    currentStatus
}: {
    exports: ExportWithDetails[];
    counts: StatusCounts;
    currentStatus: string;
}) {
    const tabs = [
        { key: 'PENDING', label: 'Pending Review', icon: Clock, color: 'text-yellow-500', count: counts.PENDING },
        { key: 'APPROVED', label: 'Approved', icon: CheckCircle, color: 'text-blue-500', count: counts.APPROVED },
        { key: 'EXPORTED', label: 'Exported', icon: FileCheck, color: 'text-green-500', count: counts.EXPORTED },
        { key: 'REJECTED', label: 'Rejected', icon: XCircle, color: 'text-red-500', count: counts.REJECTED },
    ];

    return (
        <div className="space-y-6">
            {/* Status Tabs */}
            <div className="flex gap-2 border-b border-border">
                {tabs.map((tab) => {
                    const Icon = tab.icon;
                    const isActive = currentStatus === tab.key;

                    return (
                        <Link
                            key={tab.key}
                            href={`/admin/exports?status=${tab.key}`}
                            className={`flex items-center gap-2 px-4 py-3 border-b-2 transition-colors ${isActive
                                    ? 'border-primary text-foreground font-semibold'
                                    : 'border-transparent text-muted-foreground hover:text-foreground'
                                }`}
                        >
                            <Icon className={`w-4 h-4 ${isActive ? tab.color : ''}`} />
                            <span>{tab.label}</span>
                            <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${isActive
                                    ? 'bg-primary/10 text-primary'
                                    : 'bg-secondary text-muted-foreground'
                                }`}>
                                {tab.count}
                            </span>
                        </Link>
                    );
                })}
            </div>

            {/* Exports Table */}
            <div className="bg-card border border-border rounded-xl shadow-sm">
                <ExportsTable exports={exports} status={currentStatus} />
            </div>
        </div>
    );
}
