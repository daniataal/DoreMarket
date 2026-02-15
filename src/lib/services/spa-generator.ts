import PizZip from 'pizzip';
import Docxtemplater from 'docxtemplater';
import fs from 'fs';
import path from 'path';

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
        },
        dealId: string,
        buyerId: string
    ): Promise<string> {
        try {
            // Load the template
            const templatePath = path.resolve('./public/documents/spa_template.docx');

            if (!fs.existsSync(templatePath)) {
                throw new Error('SPA Template not found');
            }

            const content = fs.readFileSync(templatePath, 'binary');
            const zip = new PizZip(content);

            const doc = new Docxtemplater(zip, {
                paragraphLoop: true,
                linebreaks: true,
            });

            // Set the data
            // We use uppercase keys as convention for placeholders in Word docs
            doc.render({
                SELLER_NAME: data.sellerName,
                BUYER_NAME: data.buyerName,
                QUANTITY: data.quantity.toFixed(2),
                PRICE: data.pricePerKg.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }),
                TOTAL_COST: data.totalCost.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }),
                COMMODITY: data.commodity,
                PURITY: data.purity,
                DELIVERY_LOCATION: data.deliveryLocation,
                DATE: data.date,
                DEAL_ID: dealId,
                BUYER_ID: buyerId
            });

            // Generate the document
            const buf = doc.getZip().generate({
                type: 'nodebuffer',
                compression: 'DEFLATE',
            });

            // Save the document
            const fileName = `agreement_${dealId}_${Date.now()}.docx`;
            const relativePath = `/documents/agreements/${fileName}`;
            const outputPath = path.resolve(`./public${relativePath}`);

            fs.writeFileSync(outputPath, buf);

            console.log(`[SPA Generator] Generated agreement at ${relativePath}`);
            return relativePath;

        } catch (error) {
            console.error('[SPA Generator] Error generating SPA:', error);
            // Fallback to template if generation fails
            return '/documents/spa_template.docx';
        }
    }
}
