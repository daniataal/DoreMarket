'use client';

import Link from "next/link";
import { usePathname } from "next/navigation";
import { User, LogOut, LayoutDashboard, Settings, ShoppingBag, ShieldCheck } from "lucide-react";
import { useState } from "react";
import { signOut } from "next-auth/react";

export default function Navbar({ user }: { user: any }) {
    const pathname = usePathname();
    const [isProfileOpen, setIsProfileOpen] = useState(false);

    return (
        <nav className="bg-card/80 backdrop-blur-md border-b border-border sticky top-0 z-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <Link href="/dashboard" className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                            <span className="text-white font-bold">M</span>
                        </div>
                        <span className="text-xl font-bold text-foreground">Marketplace</span>
                    </Link>
                </div>

                <div className="flex items-center gap-6">
                    <div className="flex items-center gap-3 pl-6 border-l border-border relative">
                        <div className="text-right hidden sm:block">
                            <div className="text-sm font-medium text-foreground">{user?.name || "Trader"}</div>
                            <div className="text-xs text-muted-foreground">{user?.email}</div>
                        </div>

                        <div className="relative">
                            <button
                                onClick={() => setIsProfileOpen(!isProfileOpen)}
                                className="w-10 h-10 bg-secondary rounded-full flex items-center justify-center hover:ring-2 hover:ring-primary transition-all"
                            >
                                <User className="w-5 h-5 text-secondary-foreground" />
                            </button>

                            {isProfileOpen && (
                                <div className="absolute right-0 mt-2 w-56 bg-card border border-border rounded-xl shadow-xl py-2 animate-in fade-in slide-in-from-top-2">
                                    <div className="px-4 py-2 border-b border-border mb-2">
                                        <p className="text-sm font-medium text-foreground">My Account</p>
                                    </div>

                                    <Link
                                        href="/dashboard"
                                        className="flex items-center gap-3 px-4 py-2 text-muted-foreground hover:bg-secondary/50 hover:text-foreground transition-colors"
                                        onClick={() => setIsProfileOpen(false)}
                                    >
                                        <LayoutDashboard className="w-4 h-4" />
                                        Dashboard
                                    </Link>

                                    <Link
                                        href="/orders"
                                        className="flex items-center gap-3 px-4 py-2 text-muted-foreground hover:bg-secondary/50 hover:text-foreground transition-colors"
                                        onClick={() => setIsProfileOpen(false)}
                                    >
                                        <ShoppingBag className="w-4 h-4" />
                                        My Orders
                                    </Link>

                                    <Link
                                        href="/settings"
                                        className="flex items-center gap-3 px-4 py-2 text-muted-foreground hover:bg-secondary/50 hover:text-foreground transition-colors"
                                        onClick={() => setIsProfileOpen(false)}
                                    >
                                        <Settings className="w-4 h-4" />
                                        Settings
                                    </Link>

                                    <Link
                                        href="/dashboard/kyc"
                                        className="flex items-center gap-3 px-4 py-2 text-muted-foreground hover:bg-secondary/50 hover:text-foreground transition-colors"
                                        onClick={() => setIsProfileOpen(false)}
                                    >
                                        <ShieldCheck className="w-4 h-4" />
                                        KYC Verification
                                    </Link>

                                    {user?.role === 'ADMIN' && (
                                        <Link
                                            href="/admin"
                                            className="flex items-center gap-3 px-4 py-2 text-primary hover:bg-primary/10 transition-colors mt-1"
                                            onClick={() => setIsProfileOpen(false)}
                                        >
                                            <ShieldCheck className="w-4 h-4" />
                                            Admin Panel
                                        </Link>
                                    )}

                                    <div className="border-t border-border mt-2 pt-2">
                                        <button
                                            onClick={() => signOut({ callbackUrl: "/login" })}
                                            className="flex w-full items-center gap-3 px-4 py-2 text-destructive hover:bg-destructive/10 transition-colors"
                                        >
                                            <LogOut className="w-4 h-4" />
                                            Sign Out
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Click outside to close */}
            {isProfileOpen && (
                <div
                    className="fixed inset-0 z-40 bg-transparent"
                    onClick={() => setIsProfileOpen(false)}
                />
            )}
        </nav>
    );
}
