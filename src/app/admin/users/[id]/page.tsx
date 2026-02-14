import { getUserDetails } from "@/lib/actions";
import { ArrowLeft, User, DollarSign, Shield, FileText, CheckCircle, XCircle, Clock, Ban } from "lucide-react";
import Link from "next/link";
import { UserActions } from "@/components/admin/UserActions";
import { KycActions } from "@/components/admin/KycActions";

export const dynamic = 'force-dynamic';

export default async function AdminUserDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const user = await getUserDetails(id);

    return (
        <div className="max-w-7xl mx-auto space-y-6">
            <div className="flex items-center gap-4">
                <Link href="/admin/users" className="p-2 bg-secondary/50 rounded-lg hover:bg-secondary transition-colors">
                    <ArrowLeft className="w-5 h-5 text-muted-foreground" />
                </Link>
                <div>
                    <h1 className="text-3xl font-bold text-foreground">{user.name || 'Unknown User'}</h1>
                    <p className="text-muted-foreground text-sm font-mono">{user.email} • ID: {user.id}</p>
                </div>
                <div className="ml-auto">
                    <UserActions
                        userId={user.id}
                        currentRole={user.role}
                        userName={user.name || 'User'}
                    />
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Profile Card */}
                <div className="bg-card border border-border rounded-xl p-6 shadow-sm">
                    <div className="flex items-center gap-3 mb-4">
                        <User className="w-5 h-5 text-primary" />
                        <h2 className="font-semibold text-foreground">Profile Overview</h2>
                    </div>
                    <div className="space-y-3 text-sm">
                        <div className="flex justify-between py-2 border-b border-border/50">
                            <span className="text-muted-foreground">KyC Status</span>
                            <span className={`font-medium ${user.kycStatus === 'APPROVED' ? 'text-emerald-500' :
                                user.kycStatus === 'REJECTED' ? 'text-destructive' : 'text-amber-500'
                                }`}>{user.kycStatus}</span>
                        </div>
                        <div className="flex justify-between py-2 border-b border-border/50">
                            <span className="text-muted-foreground">Joined</span>
                            <span className="font-medium text-foreground">{new Date(user.createdAt).toLocaleDateString()}</span>
                        </div>
                        <div className="flex justify-between py-2 border-b border-border/50">
                            <span className="text-muted-foreground">Role</span>
                            <span className="font-medium text-foreground">{user.role}</span>
                        </div>
                        <div className="flex justify-between py-2">
                            <span className="text-muted-foreground">Total Deals</span>
                            <span className="font-medium text-foreground">{//@ts-ignore 
                                user._count?.deals || 0}</span>
                        </div>
                    </div>
                </div>

                {/* Wallet Card */}
                <div className="bg-card border border-border rounded-xl p-6 shadow-sm">
                    <div className="flex items-center gap-3 mb-4">
                        <DollarSign className="w-5 h-5 text-primary" />
                        <h2 className="font-semibold text-foreground">Financial Status</h2>
                    </div>
                    <div className="mb-6">
                        <div className="text-3xl font-bold text-foreground font-mono">
                            ${user.balance.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">Current Wallet Balance</p>
                    </div>
                    <div className="space-y-3 text-sm">
                        {/* Stats could be calculated from transactions if needed */}
                        <div className="p-3 bg-secondary/30 rounded-lg text-center">
                            <span className="block text-xs text-muted-foreground">Total Transactions</span>
                            {/* @ts-ignore */}
                            <span className="font-medium text-foreground">{user.transactions?.length || 0}</span>
                        </div>
                    </div>
                </div>

                {/* KYC Actions Card */}
                <div className="bg-card border border-border rounded-xl p-6 shadow-sm">
                    <div className="flex items-center gap-3 mb-4">
                        <Shield className="w-5 h-5 text-primary" />
                        <h2 className="font-semibold text-foreground">KYC Management</h2>
                    </div>
                    <div className="space-y-4">
                        {user.kycDocuments ? (
                            <div className="p-3 bg-secondary/30 rounded-lg border border-border/50 text-sm">
                                <p className="text-muted-foreground mb-2">Documents Submitted:</p>
                                <pre className="text-xs overflow-x-auto whitespace-pre-wrap text-foreground/80">
                                    {JSON.stringify(user.kycDocuments, null, 2)}
                                </pre>
                            </div>
                        ) : (
                            <div className="text-sm text-muted-foreground italic p-4 text-center border border-dashed border-border rounded-lg">
                                No documents submitted
                            </div>
                        )}

                        <KycActions userId={user.id} currentStatus={user.kycStatus} />
                    </div>
                </div>
            </div>

            {/* Transactions History */}
            <div className="bg-card border border-border rounded-xl shadow-sm overflow-hidden">
                <div className="p-6 border-b border-border flex justify-between items-center">
                    <h3 className="font-bold text-foreground">Transaction History</h3>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                        <thead className="bg-secondary/50 text-muted-foreground text-xs uppercase tracking-wider">
                            <tr>
                                <th className="px-6 py-3 font-semibold">Date</th>
                                <th className="px-6 py-3 font-semibold">Type</th>
                                <th className="px-6 py-3 font-semibold">Amount</th>
                                <th className="px-6 py-3 font-semibold">Status</th>
                                <th className="px-6 py-3 font-semibold">Reference</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border">
                            {/* @ts-ignore */}
                            {user.transactions?.length > 0 ? (
                                // @ts-ignore
                                user.transactions.map((tx) => (
                                    <tr key={tx.id} className="hover:bg-secondary/20 transition-colors">
                                        <td className="px-6 py-4 whitespace-nowrap text-muted-foreground">
                                            {new Date(tx.createdAt).toLocaleString()}
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${tx.type === 'DEPOSIT' ? 'bg-emerald-500/10 text-emerald-500' :
                                                tx.type === 'WITHDRAWAL' ? 'bg-amber-500/10 text-amber-500' :
                                                    'bg-blue-500/10 text-blue-500'
                                                }`}>
                                                {tx.type}
                                            </span>
                                        </td>
                                        <td className={`px-6 py-4 font-mono font-medium ${tx.type === 'DEPOSIT' ? 'text-emerald-500' :
                                            tx.type === 'WITHDRAWAL' ? 'text-foreground' : 'text-foreground'
                                            }`}>
                                            {tx.type === 'WITHDRAWAL' || tx.type === 'PURCHASE' ? '-' : '+'}
                                            ${Math.abs(tx.amount).toLocaleString()}
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="text-xs">{tx.status}</span>
                                        </td>
                                        <td className="px-6 py-4 text-muted-foreground max-w-xs truncate">
                                            {tx.reference || '-'}
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan={5} className="px-6 py-8 text-center text-muted-foreground italic">
                                        No transactions found
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
