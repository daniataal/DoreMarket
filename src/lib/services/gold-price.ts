export class GoldPriceService {
    // Base price per kg in USD (approximate current market rate)
    private static BASE_PRICE_PER_KG = 75000;

    /**
     * Fetches the current live gold price per kg.
     * In a real app, this would call an external API (e.g., Metals-API, GoldAPI).
     * For now, it returns a simulated price that fluctuates slightly.
     */
    static async getLivePricePerKg(): Promise<number> {
        // Simulate API latency
        await new Promise(resolve => setTimeout(resolve, 500));

        // Fluctuate price by +/- 0.5%
        const randomFactor = 1 + (Math.random() * 0.01 - 0.005);
        return this.BASE_PRICE_PER_KG * randomFactor;
    }

    /**
     * Calculates the price for a specific deal based on the market price,
     * purity, and discount.
     */
    static calculateDealPrice(marketPrice: number, purity: number, discountPercentage: number): number {
        // 1. Calculate the pure gold value
        const pureValue = marketPrice * purity;

        // 2. Apply discount
        // Discount is usually applied to the LBMA price, so we subtract it.
        // Formula: (Market Price * Purity) * (1 - Discount/100)
        const discountedPrice = pureValue * (1 - discountPercentage / 100);

        return Number(discountedPrice.toFixed(2));
    }

    /**
     * Helper to get purity value from Karats or Standard types
     */
    static getPurity(type: string): number {
        switch (type.toUpperCase()) {
            case 'BULLION':
            case '9999':
                return 0.9999;
            case '24K':
                return 0.999;
            case '23K':
                return 0.958;
            case '22K':
                return 0.916;
            case '21K':
                return 0.875;
            case '18K':
                return 0.750;
            default:
                return 0.9999; // Default to pure
        }
    }
}
