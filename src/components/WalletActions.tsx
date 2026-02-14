'use client';

import { useState } from 'react';
import { depositFunds, withdrawFunds } from '@/actions/wallet';
import { Plus, Minus, X, CreditCard, Banknote } from 'lucide-react';

export function WalletActions() {
    const [isDepositOpen, setIsDepositOpen] = useState(false);
    const [isWithdrawOpen, setIsWithdrawOpen] = useState(false);

    return (
        <div className="mt-6">
            <button
                onClick={() => setIsDepositOpen(true)}
                className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-zinc-800 hover:bg-zinc-700 text-white rounded-xl font-semibold transition-all shadow-lg active:scale-95 border border-white/10"
            >
                <div className="flex gap-1">
                    <div className="p-1 bg-primary/20 rounded-full text-primary">
                        <Plus className="w-3 h-3" />
                    </div>
                    <div className="p-1 bg-secondary/20 rounded-full text-secondary-foreground">
                        <Minus className="w-3 h-3" />
                    </div>
                </div>
                Manage Funds
            </button>

            <WalletModal
                isOpen={isDepositOpen}
                onClose={() => setIsDepositOpen(false)}
                initialTab="deposit"
            />
        </div>
    );
}

function WalletModal({ isOpen, onClose, initialTab }: { isOpen: boolean; onClose: () => void; initialTab: 'deposit' | 'withdraw' }) {
    const [activeTab, setActiveTab] = useState<'deposit' | 'withdraw'>(initialTab);

    // Deposit State
    const [depositAmount, setDepositAmount] = useState('');
    const [depositLoading, setDepositLoading] = useState(false);
    const [depositError, setDepositError] = useState('');

    // Withdraw State
    const [withdrawAmount, setWithdrawAmount] = useState('');
    const [iban, setIban] = useState('');
    const [withdrawLoading, setWithdrawLoading] = useState(false);
    const [withdrawError, setWithdrawError] = useState('');

    // Reset state on open
    if (!isOpen) return null;

    const handleDeposit = async (e: React.FormEvent) => {
        e.preventDefault();
        setDepositLoading(true);
        setDepositError('');
        try {
            await depositFunds(Number(depositAmount));
            onClose();
            setDepositAmount('');
        } catch (err) {
            setDepositError('Failed to deposit funds. Please try again.');
        } finally {
            setDepositLoading(false);
        }
    };

    const handleWithdraw = async (e: React.FormEvent) => {
        e.preventDefault();
        setWithdrawLoading(true);
        setWithdrawError('');
        try {
            await withdrawFunds(Number(withdrawAmount), iban);
            onClose();
            setWithdrawAmount('');
            setIban('');
        } catch (err: any) {
            setWithdrawError(err.message || 'Failed to withdraw funds.');
        } finally {
            setWithdrawLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center z-[100] p-4 transition-all animate-in fade-in duration-200">
            <div
                className="bg-zinc-950 border border-zinc-800 rounded-2xl shadow-2xl w-full max-w-md overflow-hidden relative z-[101] animate-in zoom-in-95 duration-200"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header with Tabs */}
                <div className="bg-zinc-900/50 border-b border-zinc-800">
                    <div className="flex justify-between items-center p-4">
                        <h3 className="text-lg font-bold text-white flex items-center gap-2">
                            Manage Wallet
                        </h3>
                        <button onClick={onClose} className="text-zinc-400 hover:text-white transition-colors p-1 hover:bg-zinc-800 rounded-full">
                            <X className="w-5 h-5" />
                        </button>
                    </div>

                    <div className="flex p-2 gap-2">
                        <button
                            onClick={() => setActiveTab('deposit')}
                            className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-semibold transition-all ${activeTab === 'deposit'
                                    ? 'bg-zinc-800 text-white shadow-sm'
                                    : 'text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800/50'
                                }`}
                        >
                            <CreditCard className="w-4 h-4" />
                            Deposit
                        </button>
                        <button
                            onClick={() => setActiveTab('withdraw')}
                            className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-semibold transition-all ${activeTab === 'withdraw'
                                    ? 'bg-zinc-800 text-white shadow-sm'
                                    : 'text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800/50'
                                }`}
                        >
                            <Banknote className="w-4 h-4" />
                            Withdraw
                        </button>
                    </div>
                </div>

                <div className="p-6">
                    {activeTab === 'deposit' ? (
                        <form onSubmit={handleDeposit} className="space-y-6 animate-in slide-in-from-left-4 duration-200">
                            <div className="space-y-2">
                                <label className="block text-sm font-medium text-zinc-400">Deposit Amount ($)</label>
                                <div className="relative">
                                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500 text-lg">$</span>
                                    <input
                                        type="number"
                                        min="100"
                                        step="100"
                                        required
                                        value={depositAmount}
                                        onChange={(e) => setDepositAmount(e.target.value)}
                                        className="w-full p-4 pl-8 bg-zinc-900/50 rounded-xl text-white border border-zinc-800 focus:border-primary focus:ring-1 focus:ring-primary outline-none text-2xl font-mono transition-all placeholder:text-zinc-700"
                                        placeholder="0.00"
                                        autoFocus
                                    />
                                </div>
                            </div>

                            <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-sm text-emerald-400">
                                <p className="flex gap-2">
                                    <span className="text-lg">💡</span>
                                    <span>Simulated Payment Gateway. Funds added instantly for testing.</span>
                                </p>
                            </div>

                            {depositError && (
                                <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-sm text-red-400">
                                    {depositError}
                                </div>
                            )}

                            <button
                                type="submit"
                                disabled={depositLoading}
                                className="w-full py-3.5 bg-primary text-primary-foreground rounded-xl font-bold text-lg hover:bg-primary/90 transition-all shadow-lg hover:shadow-primary/20 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {depositLoading ? 'Processing...' : 'Confirm Deposit'}
                            </button>
                        </form>
                    ) : (
                        <form onSubmit={handleWithdraw} className="space-y-6 animate-in slide-in-from-right-4 duration-200">
                            <div className="space-y-4">
                                <div className="space-y-2">
                                    <label className="block text-sm font-medium text-zinc-400">Withdraw Amount ($)</label>
                                    <div className="relative">
                                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500 text-lg">$</span>
                                        <input
                                            type="number"
                                            min="100"
                                            step="0.01"
                                            required
                                            value={withdrawAmount}
                                            onChange={(e) => setWithdrawAmount(e.target.value)}
                                            className="w-full p-4 pl-8 bg-zinc-900/50 rounded-xl text-white border border-zinc-800 focus:border-primary focus:ring-1 focus:ring-primary outline-none text-2xl font-mono transition-all placeholder:text-zinc-700"
                                            placeholder="0.00"
                                            autoFocus
                                        />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="block text-sm font-medium text-zinc-400">IBAN / Bank Details</label>
                                    <input
                                        type="text"
                                        required
                                        value={iban}
                                        onChange={(e) => setIban(e.target.value)}
                                        className="w-full p-4 bg-zinc-900/50 rounded-xl text-white border border-zinc-800 focus:border-primary focus:ring-1 focus:ring-primary outline-none uppercase font-mono text-sm placeholder:text-zinc-700"
                                        placeholder="IBAN / ACCOUNT NUMBER"
                                    />
                                </div>
                            </div>

                            {withdrawError && (
                                <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-sm text-red-400">
                                    {withdrawError}
                                </div>
                            )}

                            <button
                                type="submit"
                                disabled={withdrawLoading}
                                className="w-full py-3.5 bg-zinc-800 text-white rounded-xl font-bold text-lg hover:bg-zinc-700 transition-all shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {withdrawLoading ? 'Processing...' : 'Request Withdrawal'}
                            </button>
                        </form>
                    )}
                </div>
            </div>
            {/* Click outside to close */}
            <div className="absolute inset-0 z-[99]" onClick={onClose} />
        </div>
    );
}
