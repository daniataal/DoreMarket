import Link from "next/link"

export default function LandingPage() {
    return (
        <div className="flex flex-col min-h-screen bg-background text-foreground">
            <header className="px-6 lg:px-8 h-16 flex items-center justify-between border-b border-white/5">
                <div className="flex items-center gap-2 group">
                    <div className="px-2 h-8 bg-primary/10 rounded-lg flex items-center justify-center border border-primary/20 group-hover:rotate-6 transition-transform">
                        <span className="text-primary font-serif font-black text-xs">Dore & Market</span>
                    </div>
                    <span className="text-2xl font-dancing font-bold leading-none text-primary">Dore & Market</span>
                </div>
                <nav className="flex gap-4">
                    <Link href="/login" className="text-sm font-medium hover:text-primary transition-colors">
                        Login
                    </Link>
                    <Link href="/register" className="text-sm font-medium bg-primary text-primary-foreground px-4 py-2 rounded-md hover:bg-primary/90 transition-colors">
                        Get Started
                    </Link>
                </nav>
            </header>

            <main className="flex-1">
                <section className="py-20 px-6 lg:px-8 max-w-7xl mx-auto text-center">
                    <h1 className="text-5xl md:text-7xl font-bold tracking-tight mb-6 bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                        Premium Commodity Trading
                    </h1>
                    <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-10">
                        Direct access to verified gold mines in Africa. Secure transactions, transparent sourcing, and seamless crowdfunding integration.
                    </p>
                    <div className="flex justify-center gap-4">
                        <Link href="/register" className="px-8 py-3 bg-primary text-primary-foreground rounded-lg font-semibold hover:bg-primary/90 transition-all shadow-lg shadow-primary/20">
                            Start Trading
                        </Link>
                        <Link href="/login" className="px-8 py-3 bg-secondary text-secondary-foreground rounded-lg font-semibold hover:bg-secondary/80 transition-all">
                            Member Login
                        </Link>
                    </div>
                </section>

                <section className="py-16 bg-muted/30 border-y border-white/5">
                    <div className="max-w-7xl mx-auto px-6 lg:px-8 grid md:grid-cols-3 gap-8">
                        <div className="p-6 rounded-2xl bg-card border border-white/5 shadow-sm">
                            <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center mb-4">
                                <svg className="w-6 h-6 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                            </div>
                            <h3 className="text-xl font-semibold mb-2">Verified Sources</h3>
                            <p className="text-muted-foreground">Every deal comes from deeply vetted operating mines with full documentation.</p>
                        </div>
                        <div className="p-6 rounded-2xl bg-card border border-white/5 shadow-sm">
                            <div className="w-12 h-12 bg-accent/10 rounded-xl flex items-center justify-center mb-4">
                                <svg className="w-6 h-6 text-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                                </svg>
                            </div>
                            <h3 className="text-xl font-semibold mb-2">Instant Liquidity</h3>
                            <p className="text-muted-foreground">Close deals instantly and export to our crowdfunding network for financing.</p>
                        </div>
                        <div className="p-6 rounded-2xl bg-card border border-white/5 shadow-sm">
                            <div className="w-12 h-12 bg-blue-500/10 rounded-xl flex items-center justify-center mb-4">
                                <svg className="w-6 h-6 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                                </svg>
                            </div>
                            <h3 className="text-xl font-semibold mb-2">Secure Platform</h3>
                            <p className="text-muted-foreground">Enterprise-grade security with NextAuth v5 and role-based access control.</p>
                        </div>
                    </div>
                </section>
            </main>

            <footer className="py-8 border-t border-white/5 text-center text-sm text-muted-foreground">
                © 2026 DoreMarket Platform. All rights reserved.
            </footer>
        </div>
    )
}
