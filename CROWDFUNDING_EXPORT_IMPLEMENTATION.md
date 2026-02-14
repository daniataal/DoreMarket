# Crowdfunding Export System - Implementation Plan

## Overview
This system allows admins to:
1. Set default crowdfunding parameters when creating deals
2. Review and modify parameters before each purchase is exported to crowdfunding

## Phase 1: Database Changes ✅ COMPLETED

### Schema Updates
- ✅ Added crowdfunding fields to `Deal` model (cf prefix fields)
- ✅ Created `PendingExport` model for approval queue
- ✅ Added relations between Purchase, Deal, and PendingExport

### Next Steps
**On Ubuntu VM, run:**
```bash
docker exec marketplace_app npx prisma generate
docker exec marketplace_app npx prisma db push
```

This will apply the schema changes to your database.

---

## Phase 2: Update Deal Creation/Edit Forms

### Files to Modify:
1. `/src/app/admin/deals/create/page.tsx` - Add crowdfunding param inputs
2. `/src/app/admin/deals/[id]/edit/EditDealForm.tsx` - Add crowdfunding param inputs
3. `/src/lib/actions.ts` - Update `createDeal` and `updateDeal` to accept new fields

### New Fields for Deal Forms:
- Risk Level (dropdown: Low, Medium, High)
- Target APY (number input, default: 12.5)
- Duration (months) (number input, default: 12)
- Minimum Investment (number input, default: 500)
- Origin (text input, default: "Africa")
- Transport Method (dropdown: Air Freight, Sea Freight, Road)
- Icon (dropdown: gold-bar, diamond, copper, etc.)

---

## Phase 3: Modify Purchase Flow to Queue Exports

### File to Modify:
`/src/app/api/v1/deals/[id]/purchase/route.ts`

### Changes:
Instead of immediately exporting to crowdfunding:
1. Create a `PendingExport` record with deal's default parameters
2. Return success message indicating export is pending admin review

### Example Code:
```typescript
// Replace lines 102-150 with:
// Create pending export for admin review
await prisma.pendingExport.create({
    data: {
        purchaseId: result.purchase.id,
        dealId: deal.id,
        cfName: `${deal.company} - ${deal.commodity} ${deal.type} (${quantity}kg)`,
        cfIcon: deal.cfIcon,
        cfRisk: deal.cfRisk,
        cfTargetApy: deal.cfTargetApy,
        cfDuration: deal.cfDuration,
        cfMinInvestment: deal.cfMinInvestment,
        cfAmountRequired: totalCost,
        cfDescription: `Secured ${deal.commodity} ${deal.type} purchase from ${deal.company}. Purity: ${(deal.purity * 100).toFixed(2)}%. Quantity: ${quantity}kg.`,
        cfOrigin: deal.cfOrigin,
        cfDestination: deliveryLocation || deal.deliveryLocation,
        cfTransportMethod: deal.cfTransportMethod,
        cfMetalForm: deal.type,
        cfPurityPercent: deal.purity * 100,
        status: "PENDING"
    }
});
```

---

## Phase 4: Create Admin Export Review Page

### Create New Page:
`/src/app/admin/exports/page.tsx`

### Features:
- List all pending exports
- Show purchase details, deal info, buyer info
- Display crowdfunding parameters (editable)
- Actions: Approve, Reject, Edit & Approve

### Create Components:
1. `/src/components/admin/PendingExportsList.tsx` - Table of pending exports
2. `/src/components/admin/ExportReviewModal.tsx` - Edit parameters modal
3. `/src/components/admin/ExportActions.tsx` - Approve/Reject buttons

---

## Phase 5: Create Export Actions API

### Create New API Routes:

#### 1. `/src/app/api/admin/exports/[id]/approve/route.ts`
- Validates export parameters
- Calls crowdfunding API
- Updates PendingExport status to "EXPORTED"
- Sets `crowdfundingId`, `exportedAt`, `reviewedBy`

#### 2. `/src/app/api/admin/exports/[id]/reject/route.ts`
- Updates status to "REJECTED"
- Sets `reviewedBy`, `reviewedAt`

#### 3. `/src/app/api/admin/exports/[id]/update/route.ts`
- Updates crowdfunding parameters
- Allows editing before approval

---

## Phase 6: Add Navigation & Notifications

### 1. Update Admin Navbar
Add "Pending Exports" link to admin navigation with badge showing count

### 2. Add Dashboard Widget
Show pending exports count on admin dashboard

### 3. Email Notifications (Optional)
Email admins when new purchases need review

---

## Testing Checklist

### Deal Creation:
- [ ] Create deal with custom crowdfunding parameters
- [ ] Verify parameters are saved correctly
- [ ] Edit deal and update crowdfunding parameters

### Purchase Flow:
- [ ] Make a purchase
- [ ] Verify PendingExport record is created
- [ ] Check parameters match deal defaults

### Export Review:
- [ ] View pending exports list
- [ ] Edit crowdfunding parameters
- [ ] Approve export
- [ ] Verify export succeeds in crowdfunding app
- [ ] Check crowdfundingId is saved
- [ ] Reject an export
- [ ] Verify status updates correctly

---

## Estimated Timeline

- Phase 1: ✅ **DONE** (15 mins)
- Phase 2: 1-2 hours (forms & actions)
- Phase 3: 30 mins (modify purchase flow)
- Phase 4: 2-3 hours (admin UI)
- Phase 5: 1-2 hours (API routes)
- Phase 6: 30 mins (navigation & polish)

**Total: ~5-7 hours of development**

---

## Benefits

✅ **Quality Control** - Admin reviews every export
✅ **Flexibility** - Adjust parameters per purchase
✅ **Audit Trail** - Track who approved what and when
✅ **Error Prevention** - Catch issues before going live
✅ **Customization** - Fine-tune each crowdfunding campaign

---

## Next Immediate Steps

1. **Apply schema changes** (run Prisma commands above)
2. **Let me know if you want me to continue implementing** Phase 2-6
3. **Or we can test Phase 1 first** to ensure the database changes work correctly

Which would you prefer?
