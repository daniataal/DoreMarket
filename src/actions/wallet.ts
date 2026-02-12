'use server';

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export async function getWalletData() {
    const session = await auth();
    if (!session?.user?.email) {
        return { balance: 0, portfolioValue: 0, dealsCount: 0 };
    }

    const user = await prisma.user.findUnique({
        where: { email: session.user.email },
        include: { deals: true }
    });

    if (!user) {
        return { balance: 0, portfolioValue: 0, dealsCount: 0 };
    }

    // Calculate portfolio value based on deals owned
    const portfolioValue = user.deals.reduce((sum, deal) => {
        return sum + (deal.quantity * deal.pricePerKg);
    }, 0);

    return {
        balance: user.balance,
        portfolioValue,
        dealsCount: user.deals.length
    };
}
