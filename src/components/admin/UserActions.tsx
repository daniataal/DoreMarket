'use client';

import { useState } from 'react';
import { updateUserRole, adminAdjustBalance, adminResetPassword } from '@/lib/actions';
import { Settings, DollarSign, X, Check, Lock, Snowflake } from 'lucide-react';

interface UserActionsProps {
    userId: string;
    currentRole: string;
    userName: string;
    walletFrozen?: boolean; // Optional until Prisma migration is run
}

export function UserActions({ userId, currentRole, userName, walletFrozen = false }: UserActionsProps) {
    const [isBalanceModalOpen, setIsBalanceModalOpen] = useState(false);
    const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const [isFrozen, setIsFrozen] = useState(walletFrozen);

    const handleRoleChange = async (newRole: string) => {
        if (newRole === currentRole) return;
        if (!confirm(`Are you sure you want to change ${userName}'s role to ${newRole}?`)) return;

        setLoading(true);
        try {
            await updateUserRole(userId, newRole as 'USER' | 'ADMIN');
        } catch (error) {
            alert("Failed to update role");
        } finally {
            setLoading(false);
        }
    };

    const handleFreezeToggle = async () => {
        const action = isFrozen ? 'unfreeze' : 'freeze';
        if (!confirm(`Are you sure you want to ${action} ${userName}'s wallet?`)) return;

        setLoading(true);
        try {
            const res = await fetch(`/api/admin/users/${userId}/freeze`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ frozen: !isFrozen })
            });

            if (!res.ok) throw new Error('Failed to update wallet status');

            setIsFrozen(!isFrozen);
            window.location.reload(); // Refresh to show updated status
        } catch (error) {
            alert(`Failed to ${action} wallet`);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex items-center justify-end gap-2">
            <select
                disabled={loading}
                value={currentRole}
                onChange={(e) => handleRoleChange(e.target.value)}
                className="bg-secondary/50 border border-border rounded-lg text-xs py-1 px-2 focus:ring-1 focus:ring-primary outline-none cursor-pointer"
            >
                <option value="USER">USER</option>
                <option value="ADMIN">ADMIN</option>
            </select>

            <button
                onClick={() => setIsBalanceModalOpen(true)}
                className="p-1.5 text-muted-foreground hover:text-primary hover:bg-primary/10 rounded-lg transition-colors"
                title="Adjust Balance"
            >
                <DollarSign className="w-4 h-4" />
            </button>

            <button
                onClick={handleFreezeToggle}
                className={`p-1.5 rounded-lg transition-colors ${isFrozen
                    ? 'text-blue-500 bg-blue-500/10 hover:bg-blue-500/20'
                    : 'text-muted-foreground hover:text-blue-500 hover:bg-blue-500/10'
                    }`}
                title={isFrozen ? "Unfreeze Wallet" : "Freeze Wallet"}
                disabled={loading}
            >
                <Snowflake className="w-4 h-4" />
            </button>

            <button
                onClick={() => setIsPasswordModalOpen(true)}
                className="p-1.5 text-muted-foreground hover:text-amber-500 hover:bg-amber-500/10 rounded-lg transition-colors"
                title="Reset Password"
            >
                <Lock className="w-4 h-4" />
            </button>

            <AdjustBalanceModal
                isOpen={isBalanceModalOpen}
                onClose={() => setIsBalanceModalOpen(false)}
                userId={userId}
                userName={userName}
            />

            <ResetPasswordModal
                isOpen={isPasswordModalOpen}
                onClose={() => setIsPasswordModalOpen(false)}
                userId={userId}
                userName={userName}
            />
        </div>
    );
}

function AdjustBalanceModal({ isOpen, onClose, userId, userName }: { isOpen: boolean; onClose: () => void; userId: string; userName: string }) {
    const [amount, setAmount] = useState('');
    const [reason, setReason] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            await adminAdjustBalance(userId, Number(amount), reason || "Admin Adjustment");
            onClose();
            setAmount('');
            setReason('');
        } catch (error) {
            alert("Failed to adjust balance");
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-card border border-border rounded-xl shadow-xl w-full max-w-sm p-6">
                <div className="flex justify-between items-center mb-4">
                    <h3 className="font-bold text-foreground">Adjust Balance</h3>
                    <button onClick={onClose} className="text-muted-foreground hover:text-foreground">
                        <X className="w-4 h-4" />
                    </button>
                </div>

                <p className="text-sm text-muted-foreground mb-4">
                    Adjusting wallet balance for <span className="font-semibold text-foreground">{userName}</span>.
                    Use negative values to deduct funds.
                </p>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-xs font-medium text-muted-foreground mb-1">Amount ($)</label>
                        <input
                            type="number"
                            step="0.01"
                            required
                            value={amount}
                            onChange={(e) => setAmount(e.target.value)}
                            className="w-full p-2 bg-secondary/30 rounded-lg text-foreground border border-transparent focus:border-primary focus:ring-1 focus:ring-primary outline-none"
                            placeholder="e.g. 1000 or -500"
                        />
                    </div>
                    <div>
                        <label className="block text-xs font-medium text-muted-foreground mb-1">Reason / Reference</label>
                        <input
                            type="text"
                            required
                            value={reason}
                            onChange={(e) => setReason(e.target.value)}
                            className="w-full p-2 bg-secondary/30 rounded-lg text-foreground border border-transparent focus:border-primary focus:ring-1 focus:ring-primary outline-none"
                            placeholder="e.g. Correction, Bonus"
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full py-2 bg-primary text-primary-foreground rounded-lg font-bold hover:bg-primary/90 transition-colors disabled:opacity-50 text-sm"
                    >
                        {loading ? 'Processing...' : 'Confirm Adjustment'}
                    </button>
                </form>
            </div>
        </div>
    );
}

function ResetPasswordModal({ isOpen, onClose, userId, userName }: { isOpen: boolean; onClose: () => void; userId: string; userName: string }) {
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            await adminResetPassword(userId, password);
            setSuccess(true);
            setPassword('');
            // Close after a brief delay or let user close
            setTimeout(() => {
                onClose();
                setSuccess(false);
            }, 2000);
        } catch (error) {
            alert("Failed to reset password");
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-card border border-border rounded-xl shadow-xl w-full max-w-sm p-6">
                <div className="flex justify-between items-center mb-4">
                    <h3 className="font-bold text-foreground">Reset Password</h3>
                    <button onClick={onClose} className="text-muted-foreground hover:text-foreground">
                        <X className="w-4 h-4" />
                    </button>
                </div>

                {success ? (
                    <div className="text-center py-6 text-emerald-500">
                        <Check className="w-12 h-12 mx-auto mb-2" />
                        <p className="font-medium">Password Reset Successfully</p>
                    </div>
                ) : (
                    <>
                        <p className="text-sm text-muted-foreground mb-4">
                            Set a new password for <span className="font-semibold text-foreground">{userName}</span>.
                        </p>

                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label className="block text-xs font-medium text-muted-foreground mb-1">New Password</label>
                                <input
                                    type="text" // Visible for admin to see what they are setting
                                    minLength={6}
                                    required
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="w-full p-2 bg-secondary/30 rounded-lg text-foreground border border-transparent focus:border-primary focus:ring-1 focus:ring-primary outline-none font-mono"
                                    placeholder="Minimum 6 chars"
                                />
                            </div>

                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full py-2 bg-destructive text-destructive-foreground rounded-lg font-bold hover:bg-destructive/90 transition-colors disabled:opacity-50 text-sm"
                            >
                                {loading ? 'Resetting...' : 'Reset Password'}
                            </button>
                        </form>
                    </>
                )}
            </div>
        </div>
    );
}
