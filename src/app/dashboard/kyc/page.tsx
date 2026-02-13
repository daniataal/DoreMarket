"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function KYCPage() {
    const router = useRouter();
    const [formData, setFormData] = useState({
        firstName: "",
        lastName: "",
        address: "",
        nationality: "",
        passportNumber: ""
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError("");

        try {
            const res = await fetch("/api/kyc", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(formData)
            });

            if (!res.ok) {
                const json = await res.json();
                throw new Error(json.error || "Failed to submit");
            }

            alert("KYC Submitted Successfully! Your details are now pending review.");
            router.push("/dashboard");
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4">
            <div className="w-full max-w-lg bg-card border border-border rounded-xl p-8 shadow-xl">
                <h1 className="text-2xl font-bold mb-6 text-foreground">KYC / AML Verification</h1>
                <p className="text-sm text-muted-foreground mb-8">
                    To comply with international regulations, please complete your identity verification before making high-value purchases.
                </p>

                {error && <div className="p-3 mb-4 bg-red-500/10 text-red-500 rounded-md text-sm">{error}</div>}

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-foreground">First Name</label>
                            <input
                                name="firstName"
                                value={formData.firstName}
                                onChange={handleChange}
                                required
                                className="w-full px-3 py-2 bg-background border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-foreground">Last Name</label>
                            <input
                                name="lastName"
                                value={formData.lastName}
                                onChange={handleChange}
                                required
                                className="w-full px-3 py-2 bg-background border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium text-foreground">Nationality</label>
                        <input
                            name="nationality"
                            value={formData.nationality}
                            onChange={handleChange}
                            required
                            className="w-full px-3 py-2 bg-background border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium text-foreground">Passport / ID Number</label>
                        <input
                            name="passportNumber"
                            value={formData.passportNumber}
                            onChange={handleChange}
                            required
                            className="w-full px-3 py-2 bg-background border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium text-foreground">Residential Address</label>
                        <input
                            name="address"
                            value={formData.address}
                            onChange={handleChange}
                            required
                            className="w-full px-3 py-2 bg-background border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                        />
                    </div>

                    <div className="pt-4">
                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-primary text-primary-foreground py-2 rounded-md font-medium hover:bg-primary/90 transition disabled:opacity-50"
                        >
                            {loading ? "Submitting..." : "Submit Verification"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
