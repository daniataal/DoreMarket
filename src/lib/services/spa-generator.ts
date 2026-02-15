import fs from 'fs';
import path from 'path';
import { mdToPdf } from 'md-to-pdf';

export class SpaGeneratorService {
    /**
     * Generates a filled SPA document from the template.
     * @param data The data to fill into the template.
     * @param dealId The ID of the deal.
     * @param buyerId The ID of the buyer.
     * @returns The relative path to the generated document.
     */
    static async generateSpa(
        data: {
            sellerName: string;
            buyerName: string;
            quantity: number;
            pricePerKg: number;
            totalCost: number;
            commodity: string;
            purity: string;
            deliveryLocation: string;
            date: string;
            buyerAddress?: string; // Optional fields for fuller template
            buyerLicense?: string;
            buyerRep?: string;
            buyerPassport?: string;
            buyerCountry?: string;
            buyerEmail?: string;
        },
        dealId: string,
        buyerId: string
    ): Promise<string> {
        try {
            // Load the template
            // Note: Updated to use Markdown template
            const templatePath = path.resolve('./src/lib/templates/spa_template.md');

            if (!fs.existsSync(templatePath)) {
                throw new Error('SPA Template not found');
            }

            let content = fs.readFileSync(templatePath, 'utf-8');

            // Set the data
            const replacements: { [key: string]: string } = {
                '{SELLER_NAME}': process.env.SELLER_COMPANY_NAME || data.sellerName || "Default Seller",
                '{SELLER_ADDRESS}': process.env.SELLER_ADDRESS || "Meydan Grandstand, Xth Floor, Meydan Road, Nad Al Sheba, Dubai, UAE",
                '{SELLER_LICENSE}': process.env.SELLER_TRADE_LICENSE || "XXX7157.01",
                '{SELLER_REP}': process.env.SELLER_REPRESENTATIVE || "Xxxlefo Moshanyana",
                '{SELLER_PASSPORT}': process.env.SELLER_PASSPORT_NUMBER || "A11611XXX",
                '{SELLER_PASSPORT_EXPIRY}': process.env.SELLER_PASSPORT_EXPIRY || "13/11/2034",
                '{SELLER_COUNTRY}': process.env.SELLER_COUNTRY || "South Africa - ZAF",
                '{SELLER_PHONE}': process.env.SELLER_TELEPHONE || "XXX 638 9245",
                '{SELLER_EMAIL}': process.env.SELLER_EMAIL || "[Email]",

                '{SELLER_BANK_NAME}': process.env.SELLER_BANK_NAME || "[Bank Name]",
                '{SELLER_BANK_ADDRESS}': process.env.SELLER_BANK_ADDRESS || "[Bank Address]",
                '{SELLER_ACCOUNT_NAME}': process.env.SELLER_ACCOUNT_NAME || "[Account Name]",
                '{SELLER_ACCOUNT_NUMBER}': process.env.SELLER_ACCOUNT_NUMBER || "[Account Number]",
                '{SELLER_SWIFT}': process.env.SELLER_SWIFT_CODE || "[SWIFT Code]",

                '{BUYER_NAME}': data.buyerName,
                '{QUANTITY}': data.quantity.toFixed(2),
                '{PRICE}': data.pricePerKg.toLocaleString('en-US', { style: 'currency', currency: 'USD' }),
                '{TOTAL_COST}': data.totalCost.toLocaleString('en-US', { style: 'currency', currency: 'USD' }),
                '{COMMODITY}': data.commodity,
                '{PURITY}': data.purity,
                '{DELIVERY_LOCATION}': data.deliveryLocation,
                '{DATE}': data.date,
                '{DEAL_ID}': dealId,
                '{BUYER_ADDRESS}': data.buyerAddress || "[Buyer Address]",
                '{BUYER_LICENSE}': data.buyerLicense || "[Buyer License]",
                '{BUYER_REP}': data.buyerRep || data.buyerName,
                '{BUYER_PASSPORT}': data.buyerPassport || "[Passport No]",
                '{BUYER_COUNTRY}': data.buyerCountry || "[Country]",
                '{BUYER_EMAIL}': data.buyerEmail || "[Email]"
            };

            for (const [key, value] of Object.entries(replacements)) {
                // Escape special regex characters in the key if necessary, though our keys are simple
                content = content.replace(new RegExp(key, 'g'), value);
            }

            // Generate the document
            const fileName = `agreement_${dealId}_${Date.now()}.pdf`;
            const relativePath = `/documents/agreements/${fileName}`;
            const outputPath = path.resolve(`./public${relativePath}`);

            const launchOptions: any = {
                args: ['--no-sandbox', '--disable-setuid-sandbox']
            };

            if (process.env.PUPPETEER_EXECUTABLE_PATH) {
                launchOptions.executablePath = process.env.PUPPETEER_EXECUTABLE_PATH;
            }

            await mdToPdf({ content: content }, {
                dest: outputPath,
                launch_options: launchOptions
            });

            console.log(`[SPA Generator] Generated agreement at ${relativePath}`);
            return relativePath;

        } catch (error) {
            console.error('[SPA Generator] Error generating SPA:', error);
            // Fallback to template if generation fails
            // Since we switched to MD, we can't fallback to the docx easily unless we return that path
            // But the user wants MD basis.
            throw error; // Re-throw to be handled by the caller
        }
    }
}
