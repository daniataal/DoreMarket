'use server';

import { signIn, auth } from '@/auth';
import { AuthError } from 'next-auth';
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { GoldPriceService } from "./services/gold-price";
import { writeFile, mkdir } from 'fs/promises';
import path from 'path';

// Helper for UI to get current price
export async function getLiveGoldPrice() {
    // GoldPriceService now handles errors gracefully with fallback
    return await GoldPriceService.getLivePricePerKg();
}

export async function authenticate(
    prevState: string | undefined,
    formData: FormData,
): Promise<string | undefined> {
    try {
        console.log("[Actions] Starting authentication process...");
        await signIn('credentials', {
            ...Object.fromEntries(formData),
            redirectTo: '/dashboard',
        });
        console.log("[Actions] Authentication call completed (should have redirected)");
        return undefined;
    } catch (error: any) {
        if (error instanceof AuthError) {
            console.log(`[Actions] Auth Error: ${error.type}`);
            switch (error.type) {
                case 'CredentialsSignin':
                    return 'Invalid credentials.';
                default:
                    return 'Something went wrong.';
            }
        }
        console.log("[Actions] Sign-in error/redirect:", error?.name || "Unknown");
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
    const userType = formData.get("userType") as string;
    const firstName = formData.get("firstName") as string;
    const lastName = formData.get("lastName") as string;
    const companyName = formData.get("companyName") as string;
    const companyRegistration = formData.get("companyRegistration") as string;
    const address = formData.get("address") as string;
    const nationality = formData.get("nationality") as string;
    const passportNumber = formData.get("passportNumber") as string;
    const passportExpiry = formData.get("passportExpiry") as string;
    const phoneNumber = formData.get("phoneNumber") as string;
    const password = formData.get("password") as string;

    // File uploads
    const idPassportFile = formData.get("idPassportFile") as any;
    const companyDocFile = formData.get("companyDocFile") as any;

    const currentEmail = session.user.email;

    try {
        const data: any = {};

        if (name) data.name = name;
        if (userType) data.userType = userType;
        if (firstName) data.firstName = firstName;
        if (lastName) data.lastName = lastName;
        if (companyName) data.companyName = companyName;
        if (companyRegistration) data.companyRegistration = companyRegistration;
        if (address) data.address = address;
        if (phoneNumber) data.phoneNumber = phoneNumber;
        if (nationality) data.nationality = nationality;
        if (passportNumber) data.passportNumber = passportNumber;
        if (passportExpiry) data.passportExpiry = passportExpiry;

        // Handle File Uploads
        const uploadDir = path.join(process.cwd(), 'public/uploads/kyc');
        await mkdir(uploadDir, { recursive: true });

        if (idPassportFile && typeof idPassportFile === 'object' && idPassportFile.size > 0) {
            const buffer = Buffer.from(await idPassportFile.arrayBuffer());
            const filename = `id-${Date.now()}-${idPassportFile.name.replace(/[^a-zA-Z0-9.-]/g, '')}`;
            await writeFile(path.join(uploadDir, filename), buffer);
            data.idPassportUrl = `/uploads/kyc/${filename}`;
        }

        if (companyDocFile && typeof companyDocFile === 'object' && companyDocFile.size > 0) {
            const buffer = Buffer.from(await companyDocFile.arrayBuffer());
            const filename = `company-${Date.now()}-${companyDocFile.name.replace(/[^a-zA-Z0-9.-]/g, '')}`;
            await writeFile(path.join(uploadDir, filename), buffer);
            data.companyDocUrl = `/uploads/kyc/${filename}`;
        }

        // If files were uploaded or key info changed, set status to SUBMITTED if currently PENDING
        const currentUser = await prisma.user.findUnique({ where: { email: currentEmail } });
        if (currentUser?.kycStatus === 'PENDING' && (data.idPassportUrl || data.passportNumber)) {
            data.kycStatus = 'SUBMITTED';
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

        revalidatePath("/settings");
        return "Profile and KYC data updated successfully";
    } catch (error) {
        console.error("Profile update error:", error);
        return "Failed to update profile";
    }
}


export async function getSellerIdentities() {
    const session = await auth();
    if (session?.user?.role !== 'ADMIN') {
        throw new Error("Unauthorized");
    }

    try {
        const sellers = await prisma.sellerIdentity.findMany({
            orderBy: { companyName: 'asc' }
        });
        return sellers;
    } catch (error) {
        console.error("Failed to fetch seller identities", error);
        return [];
    }
}

export async function createSeller(prevState: string | undefined, formData: FormData) {
    const session = await auth();
    if (session?.user?.role !== 'ADMIN') {
        return "Unauthorized";
    }

    try {
        let logo = formData.get('logo') as string;
        const logoFile = formData.get('logoFile') as any;

        if (logoFile && typeof logoFile === 'object' && logoFile.size > 0) {
            const buffer = Buffer.from(await logoFile.arrayBuffer());
            const filename = `${Date.now()}-${logoFile.name.replace(/[^a-zA-Z0-9.-]/g, '')}`;
            const uploadDir = path.join(process.cwd(), 'public/uploads/sellers');

            await mkdir(uploadDir, { recursive: true });
            await writeFile(path.join(uploadDir, filename), buffer);

            logo = `/uploads/sellers/${filename}`;
        }

        await prisma.sellerIdentity.create({
            data: {
                companyName: formData.get('companyName') as string,
                alias: formData.get('alias') as string,
                logo: logo,
                originCountry: formData.get('originCountry') as string,
                originPort: formData.get('originPort') as string,
                address: formData.get('address') as string,
                tradeLicense: formData.get('tradeLicense') as string,
                representative: formData.get('representative') as string,
                passportNumber: formData.get('passportNumber') as string,
                passportExpiry: formData.get('passportExpiry') as string,
                country: formData.get('country') as string,
                telephone: formData.get('telephone') as string,
                email: formData.get('email') as string,
            }
        });
    } catch (error) {
        console.error("Failed to create seller:", error);
        return "Failed to create seller profile.";
    }

    redirect('/admin/deals/create');
}

export async function getSellerIdentity(id: string) {
    const session = await auth();
    if (session?.user?.role !== 'ADMIN') return null;
    try {
        return await prisma.sellerIdentity.findUnique({ where: { id } });
    } catch (error) {
        console.error("Failed to fetch seller:", error);
        return null;
    }
}

export async function updateSeller(id: string, prevState: any, formData: FormData) {
    const session = await auth();
    if (session?.user?.role !== 'ADMIN') {
        return "Unauthorized";
    }

    try {
        let logo = formData.get('logo') as string;
        const logoFile = formData.get('logoFile') as any;

        if (logoFile && typeof logoFile === 'object' && logoFile.size > 0) {
            const buffer = Buffer.from(await logoFile.arrayBuffer());
            const filename = `${Date.now()}-${logoFile.name.replace(/[^a-zA-Z0-9.-]/g, '')}`;
            const uploadDir = path.join(process.cwd(), 'public/uploads/sellers');

            await mkdir(uploadDir, { recursive: true });
            await writeFile(path.join(uploadDir, filename), buffer);

            logo = `/uploads/sellers/${filename}`;
        }

        await prisma.sellerIdentity.update({
            where: { id },
            data: {
                companyName: formData.get('companyName') as string,
                alias: formData.get('alias') as string,
                logo: logo,
                originCountry: formData.get('originCountry') as string,
                originPort: formData.get('originPort') as string,
                address: formData.get('address') as string,
                tradeLicense: formData.get('tradeLicense') as string,
                representative: formData.get('representative') as string,
                passportNumber: formData.get('passportNumber') as string,
                passportExpiry: formData.get('passportExpiry') as string,
                country: formData.get('country') as string,
                telephone: formData.get('telephone') as string,
                email: formData.get('email') as string,
            }
        });
    } catch (error) {
        console.error("Failed to update seller:", error);
        return "Failed to update seller profile.";
    }

    redirect('/admin/deals/create');
}

export async function deleteSeller(id: string, prevState: any, formData: FormData) {
    const session = await auth();
    if (session?.user?.role !== 'ADMIN') {
        return { message: "Unauthorized" };
    }

    try {
        await prisma.sellerIdentity.delete({ where: { id } });
    } catch (error) {
        console.error("Failed to delete seller:", error);
        return { message: "Failed to delete seller profile." };
    }

    redirect('/admin/deals/create');
}

export async function createDeal(
    prevState: any,
    formData: FormData,
) {
    const session = await auth();
    if (session?.user?.role !== 'ADMIN') {
        return { message: "Unauthorized" };
    }

    const company = formData.get("company") as string;
    const commodity = formData.get("commodity") as string;
    const deliveryLocation = formData.get("deliveryLocation") as string || "Dubai";
    const type = formData.get("type") as string || "BULLION";
    const pricingModel = formData.get("pricingModel") as string || "FIXED";
    const quantity = parseFloat(formData.get("quantity") as string);
    const discount = parseFloat(formData.get("discount") as string);

    // Crowdfunding parameters (with defaults)
    const cfRisk = (formData.get("cfRisk") as string) || "Low";
    const cfTargetApy = parseFloat((formData.get("cfTargetApy") as string) || "12.5");
    const cfDuration = parseInt((formData.get("cfDuration") as string) || "12");
    const cfMinInvestment = parseFloat((formData.get("cfMinInvestment") as string) || "500");
    const cfOrigin = (formData.get("cfOrigin") as string) || "";
    const cfTransportMethod = (formData.get("cfTransportMethod") as string) || "Air Freight";
    const cfIcon = (formData.get("cfIcon") as string) || "gold-bar";
    const cfOriginPort = (formData.get("cfOriginPort") as string) || "Kampala";
    const incoterms = (formData.get("incoterms") as string) || "CIF";
    const frequency = (formData.get("frequency") as string) || "SPOT";
    const cfType = (formData.get("cfType") as string) || "Metals";
    const contractDuration = parseInt(formData.get("contractDuration") as string) || (frequency === 'SPOT' ? 0 : 1);
    const extensionYears = parseInt(formData.get("extensionYears") as string) || 5;

    let totalQuantity = quantity;
    if (frequency !== 'SPOT') {
        const multipliers: { [key: string]: number } = {
            'WEEKLY': 52,
            'BIWEEKLY': 26,
            'MONTHLY': 12,
            'QUARTERLY': 4
        };
        totalQuantity = quantity * (multipliers[frequency] || 1) * contractDuration;
    }

    // Seller fields
    const sellerAddress = formData.get("sellerAddress") as string;
    const sellerTradeLicense = formData.get("sellerTradeLicense") as string;
    const sellerRepresentative = formData.get("sellerRepresentative") as string;
    const sellerPassportNumber = formData.get("sellerPassportNumber") as string;
    const sellerPassportExpiry = formData.get("sellerPassportExpiry") as string;
    const sellerCountry = formData.get("sellerCountry") as string;
    const sellerTelephone = formData.get("sellerTelephone") as string;
    const sellerEmail = formData.get("sellerEmail") as string;

    // Check if purity is manually provided, otherwise derive from type
    let purity = 0.9999;
    const purityInput = formData.get("purity");
    if (purityInput) {
        purity = parseFloat(purityInput as string);
    } else {
        purity = GoldPriceService.getPurity(type);
    }

    if (!company || !commodity || isNaN(quantity) || isNaN(discount)) {
        return { message: "Invalid input data" };
    }

    try {
        // Fetch current market price for reference
        const currentMarketPrice = await GoldPriceService.getLivePricePerKg();

        let initialPricePerKg = 0;

        if (pricingModel === 'FIXED') {
            const fixedPrice = parseFloat(formData.get("fixedPrice") as string);
            if (!isNaN(fixedPrice)) {
                initialPricePerKg = fixedPrice;
            } else {
                // Fallback if fixedPrice is missing but model is FIXED (should not happen with valid form)
                initialPricePerKg = GoldPriceService.calculateDealPrice(currentMarketPrice, purity, discount);
            }
        } else {
            initialPricePerKg = GoldPriceService.calculateDealPrice(currentMarketPrice, purity, discount);
        }

        const totalValue = quantity * initialPricePerKg;
        const annualValue = (totalQuantity || quantity) * initialPricePerKg;

        await prisma.deal.create({
            data: {
                externalId: `MANUAL-${Date.now()}`,
                company,
                commodity,
                deliveryLocation,
                type,
                purity,
                pricingModel,
                quantity,
                availableQuantity: quantity,
                discount,
                marketPrice: currentMarketPrice,
                pricePerKg: initialPricePerKg, // This is the starting price
                status: "OPEN",
                // Crowdfunding export parameters
                cfRisk,
                cfTargetApy,
                cfDuration,
                cfMinInvestment,
                cfOrigin,
                cfTransportMethod,
                cfIcon,
                cfOriginPort,
                incoterms,
                frequency,
                totalQuantity,
                contractDuration,
                extensionYears,
                totalValue,
                annualValue,
                // Seller fields
                sellerAddress,
                sellerTradeLicense,
                sellerRepresentative,
                sellerPassportNumber,
                sellerPassportExpiry,
                sellerCountry,
                sellerTelephone,
                sellerEmail,
                sellerId: (formData.get("sellerId") as string) || null,
                cfType,
            },
        });
    } catch (error) {
        console.error("Create deal error:", error);
        return { message: "Failed to create deal" };
    }

    redirect("/admin/deals");
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
    const deliveryLocation = formData.get("deliveryLocation") as string || 'Dubai';
    const type = formData.get("type") as string;
    const pricingModel = formData.get("pricingModel") as string;
    const quantity = parseFloat(formData.get("quantity") as string);
    const discount = parseFloat(formData.get("discount") as string);
    const incoterms = (formData.get("incoterms") as string) || "CIF";
    const frequency = (formData.get("frequency") as string) || "SPOT";
    const cfType = (formData.get("cfType") as string) || "Metals";
    const contractDuration = parseInt(formData.get("contractDuration") as string) || (frequency === 'SPOT' ? 0 : 1);
    const extensionYears = parseInt(formData.get("extensionYears") as string) || 5;

    let totalQuantity = quantity;
    if (frequency !== 'SPOT') {
        const multipliers: { [key: string]: number } = {
            'WEEKLY': 52,
            'BIWEEKLY': 26,
            'MONTHLY': 12,
            'QUARTERLY': 4
        };
        totalQuantity = quantity * (multipliers[frequency] || 1) * contractDuration;
    }

    // Crowdfunding params
    const cfRisk = formData.get("cfRisk") as string;
    const cfTargetApy = parseFloat(formData.get("cfTargetApy") as string);
    const cfDuration = parseInt(formData.get("cfDuration") as string);
    const cfMinInvestment = parseFloat(formData.get("cfMinInvestment") as string);
    const cfOrigin = formData.get("cfOrigin") as string;
    const cfOriginPort = formData.get("cfOriginPort") as string;
    const cfTransportMethod = formData.get("cfTransportMethod") as string;
    const cfIcon = formData.get("cfIcon") as string;

    // Seller fields
    const sellerAddress = formData.get("sellerAddress") as string;
    const sellerTradeLicense = formData.get("sellerTradeLicense") as string;
    const sellerRepresentative = formData.get("sellerRepresentative") as string;
    const sellerPassportNumber = formData.get("sellerPassportNumber") as string;
    const sellerPassportExpiry = formData.get("sellerPassportExpiry") as string;
    const sellerCountry = formData.get("sellerCountry") as string;
    const sellerTelephone = formData.get("sellerTelephone") as string;
    const sellerEmail = formData.get("sellerEmail") as string;

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
        if (pricingModel === 'FIXED') {
            const fixedPrice = parseFloat(formData.get("fixedPrice") as string);
            if (!isNaN(fixedPrice)) {
                pricePerKg = fixedPrice;
            } else {
                pricePerKg = GoldPriceService.calculateDealPrice(currentMarketPrice, purity, discount);
            }
        } else {
            pricePerKg = GoldPriceService.calculateDealPrice(currentMarketPrice, purity, discount);
        }

        const totalValue = quantity * (pricePerKg || (pricingModel === 'DYNAMIC' ? GoldPriceService.calculateDealPrice(currentMarketPrice, purity, discount) : 0));
        const annualValue = (totalQuantity || quantity) * (pricePerKg || (pricingModel === 'DYNAMIC' ? GoldPriceService.calculateDealPrice(currentMarketPrice, purity, discount) : 0));

        await prisma.deal.update({
            where: { id },
            data: {
                company,
                commodity,
                deliveryLocation,
                type,
                pricingModel,
                quantity,
                purity,
                discount,
                incoterms,
                pricePerKg: pricingModel === 'FIXED' ? pricePerKg : 0, // 0 for dynamic (calculated live), stored for fixed
                // Update CF params
                cfRisk,
                cfTargetApy,
                cfDuration,
                cfMinInvestment,
                cfOrigin,
                cfOriginPort,
                cfTransportMethod,
                cfIcon,
                frequency,
                totalQuantity,
                contractDuration,
                extensionYears,
                totalValue,
                annualValue,
                // Update Seller fields
                sellerAddress,
                sellerTradeLicense,
                sellerRepresentative,
                sellerPassportNumber,
                sellerPassportExpiry,
                sellerCountry,
                sellerTelephone,
                sellerEmail,
                sellerId: (formData.get("sellerId") as string) || null,
                cfType,
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

            // Create Notification for the user
            await (tx as any).notification.create({
                data: {
                    userId,
                    title: amount >= 0 ? "Balance Credited" : "Balance Debited",
                    message: `Admin has adjusted your balance by ${amount >= 0 ? '+' : ''}$${Math.abs(amount).toLocaleString()}. Reason: ${reason}`,
                    type: amount >= 0 ? "SUCCESS" : "WARNING",
                    link: "/dashboard"
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

        // Create Notification
        await (prisma as any).notification.create({
            data: {
                userId,
                title: status === 'APPROVED' ? "KYC Approved" : "KYC Rejected",
                message: status === 'APPROVED'
                    ? "Congratulations! Your KYC verification has been approved. You can now trade on the platform."
                    : "Your KYC verification has been rejected. Please check your documents and try again.",
                type: status === 'APPROVED' ? "SUCCESS" : "ERROR",
                link: "/dashboard/kyc"
            }
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
export async function signPurchaseAgreement(purchaseId: string, spaData: any) {
    const session = await auth();
    if (!session) throw new Error("Unauthorized");

    try {
        const purchase = await prisma.purchase.findUnique({
            where: { id: purchaseId },
            include: { buyer: true }
        });

        if (!purchase) throw new Error("Purchase not found");

        // Only buyer or admin can sign
        if (session.user.role !== 'ADMIN' && session.user.id !== purchase.buyerId) {
            throw new Error("Unauthorized to sign this agreement");
        }

        const buyerName = `${purchase.buyer?.firstName || purchase.buyer?.name || ''} ${purchase.buyer?.lastName || ''}`.trim() || 'Buyer';

        await (prisma as any).agreement.upsert({
            where: { purchaseId },
            create: {
                purchaseId,
                buyerName,
                sellerName: (spaData as any).SELLER_NAME || "Seller",
                status: "SIGNED",
                spaData: spaData as any,
                agreementDate: new Date()
            },
            update: {
                status: "SIGNED",
                spaData: spaData as any,
                agreementDate: new Date()
            }
        });

        // Notify user about signed agreement
        await (prisma as any).notification.create({
            data: {
                userId: purchase.buyerId,
                title: "Agreement Signed",
                message: `The Sales & Purchase Agreement for your purchase of ${purchase.quantity}kg of gold has been signed.`,
                type: "SUCCESS",
                link: "/orders"
            }
        });

        revalidatePath("/orders");
        revalidatePath("/admin/purchases");
        return { success: true };
    } catch (error) {
        console.error("Sign agreement error:", error);
        throw error;
    }
}
