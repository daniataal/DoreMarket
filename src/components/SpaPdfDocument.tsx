"use client";
import React from 'react';
import { Document, Page, Text, View, StyleSheet, PDFViewer, pdf } from '@react-pdf/renderer';

// Define styles
const styles = StyleSheet.create({
    page: {
        flexDirection: 'column',
        backgroundColor: '#FFFFFF',
        padding: 40,
        fontFamily: 'Helvetica',
        fontSize: 10,
        lineHeight: 1.5,
    },
    header: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 20,
        textAlign: 'center',
        textTransform: 'uppercase',
    },
    section: {
        margin: 10,
        padding: 10,
    },
    title: {
        fontSize: 12,
        fontWeight: 'bold',
        marginTop: 10,
        marginBottom: 5,
        textTransform: 'uppercase',
        backgroundColor: '#f0f0f0',
        padding: 4,
    },
    row: {
        flexDirection: 'row',
        marginBottom: 4,
    },
    label: {
        width: 150,
        fontWeight: 'bold',
        color: '#444',
    },
    value: {
        flex: 1,
    },
    text: {
        fontSize: 10,
        marginBottom: 5,
        textAlign: 'justify',
    },
    footer: {
        position: 'absolute',
        bottom: 30,
        left: 40,
        right: 40,
        fontSize: 8,
        textAlign: 'center',
        color: 'grey',
        borderTopWidth: 1,
        borderColor: '#ccc',
        paddingTop: 10,
    },
    signatureBlock: {
        marginTop: 50,
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    signatureLine: {
        width: 200,
        borderTopWidth: 1,
        borderColor: '#000',
        paddingTop: 5,
        textAlign: 'center',
    },
});

interface SpaPdfProps {
    dealId: string;
    date: string;
    sellerName: string;
    sellerAddress: string;
    sellerLicense: string;
    sellerRep: string;
    sellerPassport: string;
    sellerExpiry: string;
    sellerCountry: string;
    sellerPhone: string;
    sellerEmail: string;
    buyerName: string;
    buyerAddress?: string;
    buyerLicense?: string;
    buyerRep?: string;
    buyerPassport?: string;
    buyerCountry?: string;
    buyerEmail?: string;
    commodity: string;
    purity: string;
    quantity: number;
    pricePerKg: number;
    totalCost: number;
    deliveryLocation: string;
    sellerBankName: string;
    sellerBankAddress: string;
    sellerAccountName: string;
    sellerAccountNumber: string;
    sellerSwift: string;
}

// Create Document Component
export const SpaDocument = ({
    dealId,
    date,
    sellerName,
    sellerAddress,
    sellerLicense,
    sellerRep,
    sellerPassport,
    sellerExpiry,
    sellerCountry,
    sellerPhone,
    sellerEmail,
    buyerName,
    buyerAddress,
    buyerLicense,
    buyerRep,
    buyerPassport,
    buyerCountry,
    buyerEmail,
    commodity,
    purity,
    quantity,
    pricePerKg,
    totalCost,
    deliveryLocation,
    sellerBankName,
    sellerBankAddress,
    sellerAccountName,
    sellerAccountNumber,
    sellerSwift
}: SpaPdfProps) => (
    <Document>
        <Page size="A4" style={styles.page}>
            <Text style={styles.header}>Sale and Purchase Agreement (SPA)</Text>

            <View style={{ marginBottom: 20 }}>
                <Text style={styles.text}>
                    This Sale and Purchase Agreement ("Agreement") is entered into on {date} by and between:
                </Text>
            </View>

            <View>
                <Text style={styles.title}>1. SELLER</Text>
                <View style={styles.row}><Text style={styles.label}>Company Name:</Text><Text style={styles.value}>{sellerName}</Text></View>
                <View style={styles.row}><Text style={styles.label}>Address:</Text><Text style={styles.value}>{sellerAddress}</Text></View>
                <View style={styles.row}><Text style={styles.label}>Trade License:</Text><Text style={styles.value}>{sellerLicense}</Text></View>
                <View style={styles.row}><Text style={styles.label}>Representative:</Text><Text style={styles.value}>{sellerRep}</Text></View>
                <View style={styles.row}><Text style={styles.label}>Passport No:</Text><Text style={styles.value}>{sellerPassport} (Exp: {sellerExpiry})</Text></View>
                <View style={styles.row}><Text style={styles.label}>Country:</Text><Text style={styles.value}>{sellerCountry}</Text></View>
                <View style={styles.row}><Text style={styles.label}>Contact:</Text><Text style={styles.value}>{sellerPhone} | {sellerEmail}</Text></View>
            </View>

            <View>
                <Text style={styles.title}>2. BUYER</Text>
                <View style={styles.row}><Text style={styles.label}>Name / Company:</Text><Text style={styles.value}>{buyerName}</Text></View>
                <View style={styles.row}><Text style={styles.label}>Address:</Text><Text style={styles.value}>{buyerAddress || 'N/A'}</Text></View>
                <View style={styles.row}><Text style={styles.label}>Passport / ID:</Text><Text style={styles.value}>{buyerPassport || 'N/A'}</Text></View>
                <View style={styles.row}><Text style={styles.label}>Contact:</Text><Text style={styles.value}>{buyerEmail || 'N/A'}</Text></View>
            </View>

            <View>
                <Text style={styles.title}>3. COMMODITY & PRICING</Text>
                <View style={styles.row}><Text style={styles.label}>Commodity:</Text><Text style={styles.value}>{commodity}</Text></View>
                <View style={styles.row}><Text style={styles.label}>Purity:</Text><Text style={styles.value}>{purity}</Text></View>
                <View style={styles.row}><Text style={styles.label}>Quantity:</Text><Text style={styles.value}>{quantity} kg</Text></View>
                <View style={styles.row}><Text style={styles.label}>Price Per Kg:</Text><Text style={styles.value}>${pricePerKg.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</Text></View>
                <View style={styles.row}><Text style={styles.label}>Total Cost:</Text><Text style={styles.value}>${totalCost.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</Text></View>
            </View>

            <View>
                <Text style={styles.title}>4. DELIVERY & LOGISTICS</Text>
                <View style={styles.row}><Text style={styles.label}>Incoterms:</Text><Text style={styles.value}>CIF (Cost, Insurance, and Freight)</Text></View>
                <View style={styles.row}><Text style={styles.label}>Delivery Location:</Text><Text style={styles.value}>{deliveryLocation}</Text></View>
                <Text style={styles.text}>The Seller agrees to deliver the specificed commodity to the Delivery Location via secure industry-standard logistics.</Text>
            </View>

            <View>
                <Text style={styles.title}>5. PAYMENT TERMS</Text>
                <Text style={styles.text}>Payment shall be made in full via bank transfer to the Seller's designated account below:</Text>
                <View style={styles.row}><Text style={styles.label}>Bank Name:</Text><Text style={styles.value}>{sellerBankName}</Text></View>
                <View style={styles.row}><Text style={styles.label}>Bank Address:</Text><Text style={styles.value}>{sellerBankAddress}</Text></View>
                <View style={styles.row}><Text style={styles.label}>Account Name:</Text><Text style={styles.value}>{sellerAccountName}</Text></View>
                <View style={styles.row}><Text style={styles.label}>Account Number:</Text><Text style={styles.value}>{sellerAccountNumber}</Text></View>
                <View style={styles.row}><Text style={styles.label}>SWIFT Code:</Text><Text style={styles.value}>{sellerSwift}</Text></View>
            </View>

            <View style={styles.signatureBlock}>
                <View style={styles.signatureLine}>
                    <Text>Seller Signature</Text>
                    <Text style={{ fontSize: 8, marginTop: 4 }}>{sellerName}</Text>
                </View>
                <View style={styles.signatureLine}>
                    <Text>Buyer Signature</Text>
                    <Text style={{ fontSize: 8, marginTop: 4 }}>{buyerName}</Text>
                </View>
            </View>

            <Text style={styles.footer}>
                Deal Reference: {dealId} | Generated on {date} | This document is electronically generated and acts as a preliminary draft.
            </Text>
        </Page>
    </Document>
);

// Helper function to generate PDF blob URL
export const generateSpaPdfUrl = async (props: SpaPdfProps): Promise<string> => {
    const blob = await pdf(<SpaDocument {...props} />).toBlob();
    return URL.createObjectURL(blob);
};
