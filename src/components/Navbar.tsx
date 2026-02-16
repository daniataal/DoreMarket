'use client';

import Link from "next/link";
import { usePathname } from "next/navigation";
import { User, LogOut, LayoutDashboard, Settings, ShoppingBag, ShieldCheck } from "lucide-react";
import { useState } from "react";
import { signOut } from "next-auth/react";
import { NotificationBell } from "./NotificationBell";

export default function Navbar({ user }: { user: any }) {
    const pathname = usePathname();
    const [isProfileOpen, setIsProfileOpen] = useState(false);

    return (
        <nav className="bg-card/80 backdrop-blur-md border-b border-border sticky top-0 z-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
                <Link href="/dashboard" className="flex items-center gap-2 hover:opacity-80 transition-opacity h-10 group">
                    <div className="flex items-center font-dancing text-4xl font-bold tracking-tight">
                        <span className="text-primary/90">Dore</span>
                        <span className="mx-2 text-white/30">&</span>
                        <span className="text-white">Market</span>
                    </div>
                </Link>

                <div className="flex items-center gap-6 h-16">
                    <div className="hidden lg:flex flex-col text-right border-r border-white/10 pr-6 h-10 justify-center">
                        <span className="text-[13px] font-black text-white capitalize leading-none mb-1.5">{user?.name || "Trader"}</span>
                        <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest leading-none">{user?.email}</span>
                    </div>

                    <div className="flex items-center gap-3 h-16">
                        <NotificationBell />

                        <div className="relative h-16 flex items-center">
                            <button
                                onClick={() => setIsProfileOpen(!isProfileOpen)}
                                className="w-10 h-10 bg-white/5 border border-white/10 rounded-full flex items-center justify-center hover:bg-white/10 hover:ring-2 hover:ring-primary/50 transition-all shadow-xl group"
                            >
                                <User className="w-5 h-5 text-zinc-400 group-hover:text-white" />
                            </button>

                            {isProfileOpen && (
                                <div className="absolute right-0 top-full mt-2 w-56 bg-card border border-border rounded-xl shadow-xl py-2 animate-in fade-in slide-in-from-top-2">
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
