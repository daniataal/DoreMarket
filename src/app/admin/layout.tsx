import Link from "next/link";
import { LayoutDashboard, PlusCircle, LogOut, Settings, FileCheck } from "lucide-react";
import { signOut } from "@/auth";

export default function AdminLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="min-h-screen bg-background flex">
            {/* Sidebar */}
            <aside className="w-64 bg-card border-r border-border flex flex-col">
                <div className="p-6 border-b border-border">
                    <div className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center border border-primary/20">
                            <span className="text-primary font-serif font-black">Dore & Market</span>
                        </div>
                        <span className="text-xl font-dancing font-bold text-primary">Dore & Market</span>
                    </div>
                </div>

                <nav className="flex-1 p-4 space-y-2">
                    <Link
                        href="/admin"
                        className="flex items-center gap-3 px-4 py-3 text-muted-foreground hover:bg-secondary/50 hover:text-foreground rounded-lg transition-colors"
                    >
                        <LayoutDashboard className="w-5 h-5" />
                        Dashboard
                    </Link>
                    <Link
                        href="/admin/deals/create"
                        className="flex items-center gap-3 px-4 py-3 text-muted-foreground hover:bg-secondary/50 hover:text-foreground rounded-lg transition-colors"
                    >
                        <PlusCircle className="w-5 h-5" />
                        Create Deal
                    </Link>
                    <Link
                        href="/admin/exports"
                        className="flex items-center gap-3 px-4 py-3 text-muted-foreground hover:bg-secondary/50 hover:text-foreground rounded-lg transition-colors"
                    >
                        <FileCheck className="w-5 h-5" />
                        Pending Exports
                    </Link>
                    <Link
                        href="/admin/users"
                        className="flex items-center gap-3 px-4 py-3 text-muted-foreground hover:bg-secondary/50 hover:text-foreground rounded-lg transition-colors"
                    >
                        <LayoutDashboard className="w-5 h-5" />
                        Manage Users
                    </Link>
                    <Link
                        href="/settings"
                        className="flex items-center gap-3 px-4 py-3 text-muted-foreground hover:bg-secondary/50 hover:text-foreground rounded-lg transition-colors"
                    >
                        <Settings className="w-5 h-5" />
                        Settings
                    </Link>
                    <Link
                        href="/dashboard"
                        className="flex items-center gap-3 px-4 py-3 text-primary hover:bg-primary/10 transition-colors mt-4 border-t border-border pt-4"
                    >
                        <LayoutDashboard className="w-5 h-5" />
                        Back to Dore & Market
                    </Link>
                </nav>

                <div className="p-4 border-t border-border">
                    <form
                        action={async () => {
                            "use server";
                            await signOut();
                        }}
                    >
                        <button className="flex items-center gap-3 px-4 py-3 text-destructive hover:bg-destructive/10 rounded-lg transition-colors w-full">
                            <LogOut className="w-5 h-5" />
                            Sign Out
                        </button>
                    </form>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 p-8 overflow-y-auto">
                <div className="max-w-7xl mx-auto">
                    {children}
                </div>
            </main>
        </div>
    );
}
