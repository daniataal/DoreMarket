import React from 'react';
import { GoldPriceService } from '@/lib/services/gold-price';

export const dynamic = 'force-dynamic';

export default async function DebugGoldPage() {
    let serviceResult = null;
    let serviceError = null;

    // Test the service
    try {
        serviceResult = await GoldPriceService.getLivePricePerKg();
    } catch (e) {
        serviceError = e instanceof Error ? e.message : String(e);
    }

    // specific manual fetch to debug
    let directFetch = null;
    let directError = null;
    let status = 0;
    let statusText = '';
    let headers: Record<string, string> = {};

    try {
        const res = await fetch('https://api.gold-api.com/price/XAU', {
            cache: 'no-store',
            headers: {
                'User-Agent': 'Mozilla/5.0 (compatible; GoldTracker/1.0)',
                'Accept': 'application/json'
            }
        });
        status = res.status;
        statusText = res.statusText;
        res.headers.forEach((v, k) => headers[k] = v);

        const text = await res.text();
        try {
            directFetch = JSON.parse(text);
        } catch {
            directFetch = text;
        }
    } catch (e) {
        directError = e instanceof Error ? e.message : String(e);
    }

    return (
        <div className="p-10 max-w-4xl mx-auto space-y-8">
            <h1 className="text-3xl font-bold">Gold API Debugger</h1>

            <section className="p-6 border rounded-xl bg-card">
                <h2 className="text-xl font-semibold mb-4">Service Call</h2>
                <div className="space-y-2">
                    <p><strong>Result:</strong> {serviceResult ? `$${serviceResult.toLocaleString()}/kg` : 'null'}</p>
                    <p><strong>Error:</strong> {serviceError || 'None'}</p>
                </div>
            </section>

            <section className="p-6 border rounded-xl bg-card">
                <h2 className="text-xl font-semibold mb-4">Direct Fetch (Server-Side)</h2>
                <div className="space-y-4 font-mono text-sm bg-secondary/50 p-4 rounded-lg overflow-auto">
                    <div>
                        <strong>Status:</strong> {status} {statusText}
                    </div>
                    <div>
                        <strong>Headers:</strong>
                        <pre>{JSON.stringify(headers, null, 2)}</pre>
                    </div>
                    <div>
                        <strong>Body:</strong>
                        <pre className="whitespace-pre-wrap text-wrap">
                            {typeof directFetch === 'string' ? directFetch : JSON.stringify(directFetch, null, 2)}
                        </pre>
                    </div>
                    {directError && (
                        <div className="text-destructive">
                            <strong>Fetch Error:</strong> {directError}
                        </div>
                    )}
                </div>
            </section>
        </div>
    );
}
