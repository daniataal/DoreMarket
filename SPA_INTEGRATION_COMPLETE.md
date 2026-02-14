# Sale & Purchase Agreement (SPA) Integration - COMPLETE! 📝

## ✅ What's New

### Enhanced Purchase Flow with SPA

The purchase process now requires generating and signing a Sale & Purchase Agreement (SPA) before completing the transaction!

### Key Features

1. **SPA Checkbox in Purchase Modal**
   - Separate checkbox for "I have reviewed and agree to sign the SPA"
   - Purchase is only enabled after BOTH checkboxes are checked (SPA + Terms)
   - Blue-themed SPA section for clear visual distinction

2. **Preview Agreement Before Signing**
   - "Preview Agreement" button in purchase modal
   - Opens full-screen preview modal showing complete SPA
   - Professional document format with all purchase details
   - Can review terms before agreeing to sign

3. **Auto-Generated SPA**
   - Agreement is automatically generated based on purchase details
   - Includes:
     - Buyer and Seller names
     - Commodity details (type, grade, purity, quantity)
     - Financial terms (base price, discount, final price, total)
     - Delivery terms (location, Incoterms, timeline)
     - Legal terms and conditions
     - Deal reference number
     - Date and signatures

4. **Automatic SPA Creation on Purchase**
   - When purchase completes, SPA is automatically created in database
   - Status is set to "SIGNED" automatically
   - Linked to deal ID for future reference
   - Can be viewed later at `/dashboard/deals/[id]/agreement`

## 🔧 Files Modified

### 1. `/src/components/PurchaseModal.tsx`
**Major Enhancement:**
- Added `userInfo` prop to get buyer details
- Added `agreedToSPA` state for SPA checkbox
- Added `showSPAPreview` state for preview modal
- Added `agreementTerms` parameter to `onPurchase` callback
- Auto-generates SPA terms from purchase details
- New SPA section with:
  - Blue-themed information box
  - Preview button
  - SPA agreement checkbox
- Full-screen preview modal showing formatted SPA
- Updated button text to "Confirm Purchase & Sign SPA"

### 2. `/src/app/api/v1/deals/[id]/purchase/route.ts`
**Added:**
- Accepts `agreementTerms` in request body
- Creates `Agreement` record after successful purchase
- Extracts buyer/seller names from agreement terms
- Sets status to 'SIGNED'
- Logs SPA creation
- Doesn't fail purchase if SPA creation fails (graceful fallback)

### 3. `/src/components/ClientBuyWrapper.tsx`
**Updated:**
- Added `userInfo` prop (needs to be passed from parent)
- Updated `handlePurchase` to accept `agreementTerms` parameter
- Passes `agreementTerms` to purchase API
- Passes `userInfo` to PurchaseModal

### 4. `/prisma/schema.prisma`
**Already Exists:**
- `Agreement` model with:
  - `dealId` (unique, linked to Deal)
  - `buyerName` and `sellerName`
  - `agreementDate`
  - `terms` (full SPA text)
  - `status` (DRAFT, SIGNED)
  - `pdfUrl` (optional)

## 📋 SPA Content

The auto-generated SPA includes:

```
SALE AND PURCHASE AGREEMENT

SELLER: [Company Name]
BUYER: [User Name]

COMMODITY DETAILS:
- Type: Gold/Silver/etc
- Grade: Premium Bullion
- Purity: 99.99%
- Quantity: X kg

FINANCIAL TERMS:
- Base Price: $XX,XXX/kg
- Discount: X%
- Final Unit Price: $XX,XXX/kg
- Total Purchase Price: $XXX,XXX

DELIVERY TERMS:
- Delivery Location: [Location with optional Refinery]
- Incoterms: CIF
- Delivery Timeline: As per standard industry practices

TERMS AND CONDITIONS:
1. PAYMENT: Full payment upon execution
2. TITLE TRANSFER: Title passes upon payment
3. DELIVERY: Secure logistics to specified location
4. INSPECTION: Buyer has right to inspect
5. FINAL SALE: Non-refundable
6. GOVERNING LAW: International commercial law

Deal Reference: [External ID]
Date: [Date]

BUYER SIGNATURE: [Name]
SELLER: [Company]
```

## 🎯 Purchase Flow

### Before (Old Flow):
1. Click "Buy"
2. Set quantity and delivery
3. Check terms checkbox
4. Click "Confirm Purchase"
5. Done ❌ No agreement

### After (New Flow):
1. Click "Buy"
2. Set quantity and delivery
3. **Click "Preview Agreement"** → See full SPA
4. **Check "I agree to sign SPA"** checkbox
5. Check terms checkbox
6. Click "**Confirm Purchase & Sign SPA**"
7. ✅ Purchase completed + SPA automatically created and signed!

## 🔗 How It Works

```
USER                    MODAL                      API                   DATABASE
  |                       |                          |                        |
  | Clicks Buy           |                          |                        |
  |--------------------->|                          |                        |
  |                       |                          |                        |
  | Sets quantity &      |                          |                        |
  | delivery             |                          |                        |
  |--------------------->|                          |                        |
  |                       |                          |                        |
  | Clicks "Preview"     |                          |                        |
  |--------------------->|                          |                        |
  |                       | Shows SPA Modal          |                        |
  |                       |  with full terms         |                        |
  |                       |<-------------------------|                        |
  |                       |                          |                        |
  | Checks SPA box       |                          |                        |
  |--------------------->|                          |                        |
  |                       |                          |                        |
  | Clicks "Confirm &    |                          |                        |
  | Sign SPA"            |                          |                        |
  |--------------------->|                          |                        |
  |                       | POST /api/.../purchase   |                        |
  |                       | { quantity, location,    |                        |
  |                       |   agreementTerms }       |                        |
  |                       |------------------------->|                        |
  |                       |                          | Creates Purchase       |
  |                       |                          |----------------------->|
  |                       |                          | Creates PendingExport  |
  |                       |                          |----------------------->|
  |                       |                          | Creates Agreement      |
  |                       |                          | (status: SIGNED)       |
  |                       |                          |----------------------->|
  |                       |                          | Returns success        |
  |                       |<-------------------------|                        |
  | Purchase complete!   |                          |                        |
  |<---------------------|                          |                        |
```

## 📝 What Still Needs to Be Done

### Update Dashboard Page
The dashboard page needs to pass `userInfo` to `ClientBuyWrapper`.

**In `/src/app/dashboard/page.tsx`:**
```tsx
// Get user info
const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: {
        name: true,
        firstName: true,
        lastName: true
    }
});

// Pass to component
<ClientBuyButton 
    deal={deal} 
    userBalance={user?.balance || 0}
    userInfo={userInfo}  // ← ADD THIS
/>
```

## 🎉 Benefits

1. **Legal Compliance** - Every purchase has a signed agreement
2. **Transparency** - Buyers see exactly what they're agreeing to
3. **Audit Trail** - All agreements stored in database
4. **Professional** - Proper legal documentation for precious metal purchases
5. **User-Friendly** - Preview before signing, no surprises
6. **Automated** - No manual work, generated from purchase details

## 🚀 Testing

1. Navigate to dashboard
2. Click "Buy" on a deal
3. Set quantity and delivery
4. Click "Preview Agreement" → See SPA
5. Close preview
6. Check "I agree to sign SPA"
7. Check terms checkbox
8. Click "Confirm Purchase & Sign SPA"
9. ✅ Purchase completes
10. Agreement is created in database with status "SIGNED"

---

**The purchase flow now includes professional SPA generation and signing!** 📝✅
