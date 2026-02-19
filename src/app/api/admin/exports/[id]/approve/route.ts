import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function POST(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const session = await auth();
        if (session?.user?.role !== 'ADMIN') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { id: exportId } = await params;

        // Get the pending export
        const pendingExport = await prisma.pendingExport.findUnique({
            where: { id: exportId },
            include: {
                deal: true,
                purchase: true
            }
        });

        if (!pendingExport) {
            return NextResponse.json({ error: 'Export not found' }, { status: 404 });
        }

        if (pendingExport.status !== 'PENDING') {
            return NextResponse.json({ error: 'Export has already been processed' }, { status: 400 });
        }

        // Export to crowdfunding platform
        const CROWDFUNDING_API = process.env.CROWDFUNDING_API_URL || "http://localhost:3000/api/marketplace/commodities";

        const exportPayload = {
            type: pendingExport.cfType,
            name: pendingExport.cfName,
            icon: pendingExport.cfIcon,
            risk: pendingExport.cfRisk,
            targetApy: pendingExport.cfTargetApy,
            duration: pendingExport.cfDuration,
            minInvestment: pendingExport.cfMinInvestment,
            amountRequired: pendingExport.cfAmountRequired,
            description: pendingExport.cfDescription,
            origin: pendingExport.cfOrigin,
            destination: pendingExport.cfDestination,
            transportMethod: pendingExport.cfTransportMethod,
            metalForm: pendingExport.cfMetalForm,
            purityPercent: pendingExport.cfPurityPercent,
            frequency: (pendingExport as any).cfFrequency || "SPOT",
            shipmentId: pendingExport.purchaseId
        };

        console.log('[Admin] Exporting to crowdfunding:', exportPayload);

        const response = await fetch(CROWDFUNDING_API, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(exportPayload)
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.error('[Admin] Crowdfunding export failed:', errorText);
            return NextResponse.json({
                error: 'Crowdfunding API error',
                details: errorText
            }, { status: 500 });
        }

        const crowdfundingData = await response.json();
        const crowdfundingId = crowdfundingData?.data?.id || null;

        // Update pending export status
        await prisma.pendingExport.update({
            where: { id: exportId },
            data: {
                status: 'EXPORTED',
                crowdfundingId: crowdfundingId,
                exportedAt: new Date(),
                reviewedBy: session.user.email || 'admin',
                reviewedAt: new Date()
            }
        });

        console.log(`[Admin] Successfully exported to crowdfunding. Campaign ID: ${crowdfundingId}`);

        return NextResponse.json({
            success: true,
            crowdfundingId,
            message: 'Export approved and sent to crowdfunding platform'
        });

    } catch (error) {
        console.error('[Admin] Approve export error:', error);
        return NextResponse.json({
            error: 'Internal server error',
            details: error instanceof Error ? error.message : 'Unknown error'
        }, { status: 500 });
    }
}
