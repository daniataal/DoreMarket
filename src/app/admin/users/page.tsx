import { prisma } from "@/lib/prisma";
import { User, DollarSign, Shield, CheckCircle, XCircle, UserPlus } from "lucide-react";
import { revalidatePath } from "next/cache";
import Link from "next/link";
import { UserActions } from "@/components/admin/UserActions"; // Import

export const dynamic = 'force-dynamic';

export default async function AdminUsersPage() {
    const users = await prisma.user.findMany({
        orderBy: { createdAt: 'desc' },
        include: {
            _count: { select: { deals: true } },
            transactions: {
                take: 1,
                orderBy: { createdAt: 'desc' }
            }
        }
    });

    return (
        <div className="max-w-7xl mx-auto">
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h1 className="text-3xl font-bold text-foreground">Manage Users</h1>
                    <p className="text-muted-foreground mt-1">View user details, balances, and manage roles</p>
                </div>
                <Link
                    href="/admin/users/create"
                    className="flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2 rounded-lg font-medium hover:bg-primary/90 transition-colors"
                >
                    <UserPlus className="w-4 h-4" />
                    Create User
                </Link>
            </div>

            <div className="bg-card border border-border rounded-xl shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-secondary/50 text-muted-foreground text-xs uppercase tracking-wider">
                            <tr>
                                <th className="px-6 py-4 font-semibold">User Info</th>
                                <th className="px-6 py-4 font-semibold">Role & Status</th>
                                <th className="px-6 py-4 font-semibold">Wallet Balance</th>
                                <th className="px-6 py-4 font-semibold">Activity</th>
                                <th className="px-6 py-4 font-semibold text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border">
                            {users.map((user: any) => (
                                <tr key={user.id} className="hover:bg-secondary/20 transition-colors">
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold">
                                                {user.name?.[0]?.toUpperCase() || 'U'}
                                            </div>
                                            <div>
                                                <div className="font-medium text-foreground">{user.name || 'Unknown'}</div>
                                                <div className="text-sm text-muted-foreground">{user.email}</div>
                                                <div className="text-xs font-mono text-muted-foreground mt-0.5 max-w-[150px] truncate">{user.id}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="space-y-1">
                                            <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium ${user.role === 'ADMIN' ? 'bg-purple-500/10 text-purple-500' : 'bg-secondary text-muted-foreground'
                                                }`}>
                                                <Shield className="w-3 h-3" />
                                                {user.role}
                                            </span>
                                            <div className="flex items-center gap-1.5 text-xs">
                                                {user.kycStatus === 'APPROVED' ? (
                                                    <span className="flex items-center gap-1 text-emerald-500">
                                                        <CheckCircle className="w-3 h-3" /> Verified
                                                    </span>
                                                ) : (
                                                    <span className="flex items-center gap-1 text-muted-foreground">
                                                        <XCircle className="w-3 h-3" /> Unverified
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="font-mono font-medium text-foreground">
                                            ${user.balance.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                                        </div>
                                        {user.transactions[0] && (
                                            <div className="text-xs text-muted-foreground mt-1">
                                                Last: {user.transactions[0].type} (${user.transactions[0].amount})
                                            </div>
                                        )}
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="text-sm">
                                            <span className="font-medium">{user._count.deals}</span> deals purchased
                                        </div>
                                        <div className="text-xs text-muted-foreground mt-1">
                                            Joined {new Date(user.createdAt).toLocaleDateString()}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <div className="flex items-center justify-end gap-3">
                                            <Link
                                                href={`/admin/users/${user.id}`}
                                                className="text-xs text-primary hover:text-primary/80 font-medium transition-colors"
                                            >
                                                View Profile
                                            </Link>
                                            <div className="h-4 w-px bg-border/50"></div>
                                            <UserActions
                                                userId={user.id}
                                                currentRole={user.role}
                                                userName={user.name || 'User'}
                                            />
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}

