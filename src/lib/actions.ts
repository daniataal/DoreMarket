'use server';

import { signIn, auth } from '@/auth';
import { AuthError } from 'next-auth';
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { GoldPriceService } from "./services/gold-price";

// Helper for UI to get current price
export async function getLiveGoldPrice() {
    try {
        return await GoldPriceService.getLivePricePerKg();
    } catch (error) {
        console.error("Failed to fetch live gold price:", error);
        return 0; // Return 0 to indicate failure gracefully
    }
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
            initialPricePerKg = GoldPriceService.calculateDealPrice(currentMarketPrice, purity, discount);
        } else {
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
        revalidatePath("/admin/deals");
        revalidatePath("/dashboard");
    } catch (error) {
        console.error("Delete deal error:", error);
        throw new Error("Failed to delete deal");
    }
}

export async function updateDeal(
    id: string,
    prevState: string | undefined,
    formData: FormData,
): Promise<string | undefined> {
    const session = await auth();
    if (session?.user?.role !== 'ADMIN') {
        return "Unauthorized";
    }

    const company = formData.get("company") as string;
    const commodity = formData.get("commodity") as string;
    const type = formData.get("type") as string;
    const pricingModel = formData.get("pricingModel") as string;
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
        const currentMarketPrice = await GoldPriceService.getLivePricePerKg();
        let pricePerKg = 0;

        // Recalculate pricePerKg based on new params
        pricePerKg = GoldPriceService.calculateDealPrice(currentMarketPrice, purity, discount);

        await prisma.deal.update({
            where: { id },
            data: {
                company,
                commodity,
                type,
                pricingModel,
                quantity,
                purity,
                discount,
                pricePerKg: pricingModel === 'FIXED' ? pricePerKg : 0, // 0 or placeholder
            },
        });

        revalidatePath("/admin");
        revalidatePath("/dashboard");
    } catch (error) {
        console.error("Update deal error:", error);
        return "Failed to update deal";
    }

    redirect("/admin/deals");
}

export async function updateUserRole(userId: string, newRole: 'USER' | 'ADMIN') {
    const session = await auth();
    if (session?.user?.role !== 'ADMIN') {
        throw new Error("Unauthorized");
    }

    try {
        await prisma.user.update({
            where: { id: userId },
            data: { role: newRole }
        });
        revalidatePath("/admin/users");
    } catch (error) {
        throw new Error("Failed to update role");
    }
}

export async function adminAdjustBalance(userId: string, amount: number, reason: string) {
    const session = await auth();
    if (session?.user?.role !== 'ADMIN') {
        throw new Error("Unauthorized");
    }

    try {
        await prisma.$transaction(async (tx) => {
            await tx.user.update({
                where: { id: userId },
                data: { balance: { increment: amount } }
            });

            await tx.transaction.create({
                data: {
                    userId: userId,
                    type: amount >= 0 ? "DEPOSIT" : "WITHDRAWAL",
                    amount: Math.abs(amount),
                    status: "COMPLETED",
                    reference: `Admin Adjustment: ${reason}`
                }
            });
        });
        revalidatePath("/admin/users");
    } catch (error) {
        throw new Error("Failed to adjust balance");
    }
}

export async function updateKycStatus(userId: string, status: 'PENDING' | 'APPROVED' | 'REJECTED') {
    const session = await auth();
    if (session?.user?.role !== 'ADMIN') {
        throw new Error("Unauthorized");
    }

    try {
        await prisma.user.update({
            where: { id: userId },
            data: { kycStatus: status }
        });
        revalidatePath(`/admin/users`);
        revalidatePath(`/admin/users/${userId}`);
    } catch (error) {
        console.error("KYC update error:", error);
        throw new Error("Failed to update KYC status");
    }
}

export async function getUserDetails(userId: string) {
    const session = await auth();
    if (session?.user?.role !== 'ADMIN') {
        throw new Error("Unauthorized");
    }

    const user = await prisma.user.findUnique({
        where: { id: userId },
        include: {
            transactions: {
                orderBy: { createdAt: 'desc' }
            },
            purchases: {
                include: {
                    deal: true
                },
                orderBy: { createdAt: 'desc' }
            },
            _count: {
                select: { deals: true }
            }
        }
    });

    if (!user) {
        throw new Error("User not found");
    }

    return user;
}

export async function adminCreateUser(
    prevState: string | undefined,
    formData: FormData,
): Promise<string | undefined> {
    const session = await auth();
    if (session?.user?.role !== 'ADMIN') {
        return "Unauthorized";
    }

    const name = formData.get("name") as string;
    const email = (formData.get("email") as string).toLowerCase();
    const password = formData.get("password") as string;
    const role = (formData.get("role") as string) || "USER";

    if (!email || !password || password.length < 6) {
        return "Invalid input data. Password must be at least 6 characters.";
    }

    try {
        const existingUser = await prisma.user.findUnique({
            where: { email },
        });

        if (existingUser) {
            return "User with this email already exists.";
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        await prisma.user.create({
            data: {
                name,
                email,
                password: hashedPassword,
                role: role as 'USER' | 'ADMIN',
                // Default settings for manually created users
                kycStatus: 'PENDING'
            },
        });

        revalidatePath("/admin/users");
    } catch (error) {
        console.error("Admin create user error:", error);
        return "Failed to create user.";
    }

    redirect("/admin/users");
}

export async function adminResetPassword(userId: string, newPassword: string) {
    const session = await auth();
    if (session?.user?.role !== 'ADMIN') {
        throw new Error("Unauthorized");
    }

    if (!newPassword || newPassword.length < 6) {
        throw new Error("Password must be at least 6 characters long");
    }

    try {
        const hashedPassword = await bcrypt.hash(newPassword, 10);

        await prisma.user.update({
            where: { id: userId },
            data: { password: hashedPassword }
        });

        revalidatePath("/admin/users");
    } catch (error) {
        throw new Error("Failed to reset password");
    }
}
