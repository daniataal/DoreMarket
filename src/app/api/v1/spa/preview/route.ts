import { NextRequest, NextResponse } from "next/server";
import { SpaGeneratorService } from "@/lib/services/spa-generator";
import { prisma } from "@/lib/prisma"; // Assuming you need to fetch deal details

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { dealId, quantity, deliveryLocation, buyerName, sellerName, pricePerKg, totalCost, commodity, purity } = body;

        // Ensure all required fields are present
        if (!dealId || !quantity || !buyerName || !sellerName) {
            return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
        }

        // Use a dummy ID for preview purposes or the actual user ID if available in context
        // Since this is a preview, we might not want to save it permanently yet, 
        // or we save it to a temporary location.
        // For now, let's generate it and return the path.

        const previewPath = await SpaGeneratorService.generateSpa({
            sellerName,
            buyerName,
            quantity,
            pricePerKg,
            totalCost,
            commodity,
            purity,
            deliveryLocation,
            date: new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
        }, dealId, "preview-user");


        return NextResponse.json({ previewUrl: previewPath });

    } catch (error) {
        console.error("Error generating SPA preview:", error);
        return NextResponse.json({ error: "Failed to generate preview" }, { status: 500 });
    }
}
