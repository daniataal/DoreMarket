// const fetch = require('node-fetch'); // Use native fetch


async function testGoldApi() {
    console.log("Fetching live gold price from API...");
    try {
        const response = await fetch('https://api.gold-api.com/price/XAU', {
            headers: { 'Cache-Control': 'no-cache' }
        });

        console.log("Status:", response.status);
        console.log("StatusText:", response.statusText);

        if (response.ok) {
            const data = await response.json();
            console.log("Data:", JSON.stringify(data, null, 2));
            if (data.price) {
                const pricePerOunce = data.price;
                const pricePerKg = pricePerOunce * 32.1507466;
                console.log("Calculated Price per Kg:", pricePerKg);
            } else {
                console.error("Missing price in data");
            }
        } else {
            console.error("Response not OK");
            const text = await response.text();
            console.error("Body:", text);
        }
    } catch (error) {
        console.error("Fetch failed:", error);
    }
}

testGoldApi();
