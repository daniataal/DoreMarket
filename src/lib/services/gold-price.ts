import axios from 'axios';

export class GoldPriceService {
    // Call duration in ms
    private static CACHE_DURATION = 10 * 1000; // 10 seconds
    private static lastFetchTime: number = 0;
    private static cachedPrice: number = 0;

    /**
     * Fetches the current live gold price per kg.
     * Uses api.gold-api.com (Free, no key required).
     * THROWS ERROR if API fails (No fallback).
     */
    static async getLivePricePerKg(): Promise<number> {
        // Return cached price if valid
        if (Date.now() - this.lastFetchTime < this.CACHE_DURATION && this.cachedPrice > 0) {
            console.log("Using cached price:", this.cachedPrice);
            return this.cachedPrice;
        }

        try {
            console.log("Fetching live gold price from API via Axios...");

            // Use axios to bypass Next.js native fetch caching quirks
            const response = await axios.get('https://api.gold-api.com/price/XAU', {
                headers: {
                    'User-Agent': 'Mozilla/5.0 (compatible; GoldTracker/1.0)',
                    'Accept': 'application/json',
                    'Cache-Control': 'no-cache',
                    'Pragma': 'no-cache',
                    'Expires': '0'
                },
                timeout: 5000 // 5s timeout
            });

            if (response.status === 200 && response.data) {
                const data = response.data;
                if (data.price) {
                    const pricePerOunce = Number(data.price);

                    // Conversion: 1 Troy Ounce = 0.0311034768 kg
                    // Price/Kg = Price/Oz * 32.1507466
                    const pricePerKg = pricePerOunce * 32.1507466;

                    console.log(`API SUCCESS: $${pricePerOunce}/oz -> $${pricePerKg.toFixed(2)}/kg`);

                    this.cachedPrice = pricePerKg;
                    this.lastFetchTime = Date.now();
                    return pricePerKg;
                }
            }
            throw new Error("Invalid API response format");

        } catch (error) {
            if (axios.isAxiosError(error)) {
                console.error(`Gold API Error: ${error.message}`, error.response?.status, error.response?.data);
                throw new Error(`Gold API Error: ${error.message}`);
            } else {
                console.error("Failed to fetch gold price from gold-api.com:", error);
                throw error;
            }
        }
    }

    /**
     * Calculates the price for a specific deal based on the market price,
     * purity, and discount.
     */
    static calculateDealPrice(marketPrice: number, purity: number, discountPercentage: number): number {
        // 1. Calculate the pure gold value
        const pureValue = marketPrice * purity;

        // 2. Apply discount
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
