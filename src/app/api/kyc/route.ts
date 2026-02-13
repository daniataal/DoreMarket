import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";

export async function POST(req: NextRequest) {
    try {
        const session = await auth();
        if (!session?.user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const data = await req.json();

        // Basic validation
        if (!data.firstName || !data.lastName || !data.passportNumber) {
            return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
        }

        const updatedUser = await prisma.user.update({
            where: { id: session.user.id },
            data: {
                firstName: data.firstName,
                lastName: data.lastName,
                passportNumber: data.passportNumber,
                address: data.address,
                nationality: data.nationality,
                kycStatus: "SUBMITTED"
            }
        });

        return NextResponse.json({ success: true, user: updatedUser });
    } catch (error) {
        console.error("KYC submission error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
