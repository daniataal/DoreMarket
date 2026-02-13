export class GoldPriceService {
    // Base price per kg in USD (approximate current market rate)
    private static BASE_PRICE_PER_KG = 75000;

    // Call duration in ms
    private static CACHE_DURATION = 5 * 60 * 1000; // 5 minutes
    private static lastFetchTime: number = 0;
    private static cachedPrice: number = 0;

    /**
     * Fetches the current live gold price per kg.
     * Uses GoldAPI.io if API key is present.
     * Fallback to simulation if API fails or key is missing.
     */
    static async getLivePricePerKg(): Promise<number> {
        // Return cached price if valid
        if (Date.now() - this.lastFetchTime < this.CACHE_DURATION && this.cachedPrice > 0) {
            return this.cachedPrice;
        }

        const apiKey = process.env.GOLD_API_KEY;

        // Try fetching from API if key exists (and is not placeholder)
        if (apiKey && apiKey !== 'REPLACE_WITH_YOUR_KEY') {
            try {
                const response = await fetch('https://www.goldapi.io/api/XAU/USD', {
                    headers: {
                        'x-access-token': apiKey,
                        'Content-Type': 'application/json'
                    },
                    next: { revalidate: 300 } // Next.js caching
                });

                if (response.ok) {
                    const data = await response.json();
                    if (data.price) {
                        // API returns price per Ounce. 1 Ounce = 0.0311035 kg => 1kg = 32.1507 Ounces
                        // Price per Kg = Price per Ounce * 32.1507
                        const pricePerOunce = data.price;
                        const pricePerKg = pricePerOunce * 32.1507;

                        this.cachedPrice = pricePerKg;
                        this.lastFetchTime = Date.now();
                        return pricePerKg;
                    }
                }
            } catch (error) {
                console.error("Failed to fetch gold price:", error);
            }
        }

        // Fallback: Simulation
        console.warn("Using simulated gold price (Missing API Key or Fetch Failed)");

        // Simulate API latency
        await new Promise(resolve => setTimeout(resolve, 500));

        // Fluctuate price by +/- 0.5%
        const randomFactor = 1 + (Math.random() * 0.01 - 0.005);
        const simulatedPrice = this.BASE_PRICE_PER_KG * randomFactor;

        // Update cache for simulation too to avoid jitter
        this.cachedPrice = simulatedPrice;
        this.lastFetchTime = Date.now();

        return simulatedPrice;
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
