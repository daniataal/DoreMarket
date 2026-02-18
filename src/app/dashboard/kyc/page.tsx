import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import SettingsForm from "@/components/SettingsForm";
import Navbar from "@/components/Navbar";
import { ShieldCheck, Info } from "lucide-react";

export default async function KYCPage() {
    const session = await auth();
    const user = session?.user?.email
        ? await prisma.user.findUnique({ where: { email: session.user.email } })
        : null;

    return (
        <div className="min-h-screen bg-background relative overflow-hidden">
            {/* Ambient Lighting */}
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-primary/5 via-background/0 to-background/0 pointer-events-none z-0" />
            <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-primary/10 rounded-full blur-[120px] pointer-events-none z-0 opacity-30" />

            <Navbar user={session?.user} />

            <main className="max-w-4xl mx-auto px-4 py-8 md:py-16 relative z-10 transition-all">
                <div className="mb-12 text-center">
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-primary/10 mb-6 border border-primary/20 shadow-inner">
                        <ShieldCheck className="w-8 h-8 text-primary" />
                    </div>
                    <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-4 tracking-tight">Identity Verification</h1>
                    <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
                        To ensure a secure trading environment and comply with global regulations,
                        please complete your KYC verification.
                    </p>
                </div>

                {user?.kycStatus === 'PENDING' && (
                    <div className="mb-8 p-4 bg-primary/10 border border-primary/20 rounded-xl flex items-start gap-4 animate-in fade-in slide-in-from-top-4 duration-500">
                        <Info className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                        <div className="text-sm text-primary/90 leading-relaxed">
                            <span className="font-bold">Important:</span> You need to provide either a Passport or National ID.
                            If you are trading as a company, please select the "Company" option below and upload your Trade License.
                        </div>
                    </div>
                )}

                <div className="bg-card/50 backdrop-blur-2xl border border-white/10 rounded-3xl shadow-2xl overflow-hidden">
                    <div className="p-6 md:p-12">
                        <SettingsForm user={user} />
                    </div>
                </div>

                <div className="mt-12 text-center text-sm text-muted-foreground">
                    <p>Protected by industry-leading encryption. Your data is handled securely.</p>
                </div>
            </main>
        </div>
    );
}

