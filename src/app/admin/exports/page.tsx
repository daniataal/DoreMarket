import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import ExportsTabView from "@/components/admin/ExportsTabView";

export default async function ExportsPage({
    searchParams
}: {
    searchParams: Promise<{ status?: string }>
}) {
    const session = await auth();
    if (session?.user?.role !== 'ADMIN') {
        redirect('/');
    }

    const params = await searchParams;
    const statusFilter = params.status || 'PENDING';

    // Fetch exports based on status filter
    const exports = await prisma.pendingExport.findMany({
        where: {
            status: statusFilter
        },
        include: {
            deal: {
                select: {
                    company: true,
                    commodity: true,
                    type: true,
                    purity: true
                }
            },
            purchase: {
                select: {
                    id: true,
                    quantity: true,
                    totalPrice: true,
                    createdAt: true,
                    buyer: {
                        select: {
                            id: true,
                            name: true,
                            email: true
                        }
                    }
                }
            }
        },
        orderBy: {
            createdAt: 'desc'
        }
    });

    // Get counts for all statuses
    const statusCounts = await prisma.pendingExport.groupBy({
        by: ['status'],
        _count: true
    });

    const counts = {
        PENDING: statusCounts.find(s => s.status === 'PENDING')?._count || 0,
        APPROVED: statusCounts.find(s => s.status === 'APPROVED')?._count || 0,
        REJECTED: statusCounts.find(s => s.status === 'REJECTED')?._count || 0,
        EXPORTED: statusCounts.find(s => s.status === 'EXPORTED')?._count || 0,
    };

    return (
        <div className="max-w-7xl mx-auto">
            <div className="mb-6">
                <Link
                    href="/admin"
                    className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground transition-colors mb-4"
                >
                    <ArrowLeft className="w-4 h-4 mr-1" />
                    Back to Dashboard
                </Link>
                <h1 className="text-3xl font-bold text-foreground">Crowdfunding Exports</h1>
                <p className="text-muted-foreground mt-1">
                    Review and manage purchase exports to the crowdfunding platform
                </p>
            </div>

            <ExportsTabView
                exports={exports}
                counts={counts}
                currentStatus={statusFilter}
            />
        </div>
    );
}
