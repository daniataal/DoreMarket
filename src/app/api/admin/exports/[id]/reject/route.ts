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
        const body = await request.json();
        const rejectionReason = body.reason || 'No reason provided';

        // Get the pending export
        const pendingExport = await prisma.pendingExport.findUnique({
            where: { id: exportId }
        });

        if (!pendingExport) {
            return NextResponse.json({ error: 'Export not found' }, { status: 404 });
        }

        if (pendingExport.status !== 'PENDING') {
            return NextResponse.json({ error: 'Export has already been processed' }, { status: 400 });
        }

        // Update pending export status to REJECTED
        await prisma.pendingExport.update({
            where: { id: exportId },
            data: {
                status: 'REJECTED',
                rejectionReason: rejectionReason,
                reviewedBy: session.user.email || 'admin',
                reviewedAt: new Date()
            }
        });

        console.log(`[Admin] Export ${exportId} rejected by ${session.user.email}. Reason: ${rejectionReason}`);

        return NextResponse.json({
            success: true,
            message: 'Export rejected'
        });

    } catch (error) {
        console.error('[Admin] Reject export error:', error);
        return NextResponse.json({
            error: 'Internal server error'
        }, { status: 500 });
    }
}
