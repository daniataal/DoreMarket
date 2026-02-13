'use server';

import { signIn, auth } from '@/auth';
import { AuthError } from 'next-auth';

// Helper for UI to get current price
export async function getLiveGoldPrice() {
    return await GoldPriceService.getLivePricePerKg();
}

export async function authenticate(
    prevState: string | undefined,
    formData: FormData,
): Promise<string | undefined> {
    try {
        await signIn('credentials', formData);
        return undefined;
    } catch (error) {
        if (error instanceof AuthError) {
            switch (error.type) {
                case 'CredentialsSignin':
                    return 'Invalid credentials.';
                default:
                    return 'Something went wrong.';
            }
        }
        throw error;
    }
}

import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { redirect } from "next/navigation";

export async function register(
    prevState: string | undefined,
    formData: FormData,
): Promise<string | undefined> {
    const name = formData.get("name") as string;
    const email = (formData.get("email") as string).toLowerCase();
    const password = formData.get("password") as string;

    if (!email || !password || password.length < 6) {
        return "Invalid input data.";
    }

    try {
        const existingUser = await prisma.user.findUnique({
            where: { email },
        });

        if (existingUser) {
            return "User already exists.";
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        await prisma.user.create({
            data: {
                name,
                email,
                password: hashedPassword,
                role: "USER"
            },
        });

    } catch (error) {
        console.error("Registration error:", error);
        return "Failed to create user.";
    }

    redirect("/login");
}

export async function updateProfile(
    prevState: string | undefined,
    formData: FormData,
): Promise<string | undefined> {
    const session = await auth();
    if (!session?.user?.email) {
        return "Not authenticated";
    }

    const name = formData.get("name") as string;
    const password = formData.get("password") as string;
    const currentEmail = session.user.email;

    try {
        const data: { name?: string; password?: string } = {};

        if (name && name.length > 0) {
            data.name = name;
        }

        if (password && password.length > 0) {
            if (password.length < 6) return "Password must be at least 6 characters";
            data.password = await bcrypt.hash(password, 10);
        }

        if (Object.keys(data).length === 0) {
            return "No changes made";
        }

        await prisma.user.update({
            where: { email: currentEmail },
            data,
        });

        return "Profile updated successfully";
    } catch (error) {
        console.error("Profile update error:", error);
        return "Failed to update profile";
    }
}

import { GoldPriceService } from "./services/gold-price";

export async function createDeal(
    prevState: string | undefined,
    formData: FormData,
): Promise<string | undefined> {
    const session = await auth();
    if (session?.user?.role !== 'ADMIN') {
        return "Unauthorized";
    }

    const company = formData.get("company") as string;
    const commodity = formData.get("commodity") as string;
    const type = formData.get("type") as string || "BULLION";
    const pricingModel = formData.get("pricingModel") as string || "FIXED";
    const quantity = parseFloat(formData.get("quantity") as string);
    const discount = parseFloat(formData.get("discount") as string);

    // Check if purity is manually provided, otherwise derive from type
    let purity = 0.9999;
    const purityInput = formData.get("purity");
    if (purityInput) {
        purity = parseFloat(purityInput as string);
    } else {
        purity = GoldPriceService.getPurity(type);
    }

    if (!company || !commodity || isNaN(quantity) || isNaN(discount)) {
        return "Invalid input data";
    }

    try {
        // Fetch current market price for reference
        const currentMarketPrice = await GoldPriceService.getLivePricePerKg();

        let initialPricePerKg = 0;

        if (pricingModel === 'FIXED') {
            // For fixed pricing, we calculate it once and store it
            // Or the user might assume "Price per Kg" input is manual. 
            // BUT requirements say "calculate the price per kg...". 
            // So we will calculate it based on current market + discount.
            initialPricePerKg = GoldPriceService.calculateDealPrice(currentMarketPrice, purity, discount);
        } else {
            // For dynamic, we store the current price as a baseline/reference
            // But the UI will recalculate it. Ideally dealing with "pricePerKg" in the DB.
            // We'll store the current calculated price so sorting/filtering works, 
            // but UI will override it.
            initialPricePerKg = GoldPriceService.calculateDealPrice(currentMarketPrice, purity, discount);
        }

        await prisma.deal.create({
            data: {
                externalId: `MANUAL-${Date.now()}`,
                company,
                commodity,
                type,
                purity,
                pricingModel,
                quantity,
                availableQuantity: quantity,
                discount,
                marketPrice: currentMarketPrice,
                pricePerKg: initialPricePerKg, // This is the starting price
                status: "OPEN",
            },
        });
    } catch (error) {
        console.error("Create deal error:", error);
        return "Failed to create deal";
    }

    redirect("/admin");
}

import { revalidatePath } from "next/cache";

export async function deleteDeal(id: string) {
    const session = await auth();
    if (session?.user?.role !== 'ADMIN') {
        throw new Error("Unauthorized");
    }

    try {
        await prisma.deal.delete({
            where: { id },
        });
        revalidatePath("/admin");
        revalidatePath("/dashboard");
    } catch (error) {
        console.error("Delete deal error:", error);
        throw new Error("Failed to delete deal");
    }
}
