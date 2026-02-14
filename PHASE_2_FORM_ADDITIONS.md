# Phase 2: Add Crowdfunding Fields to Forms

## For Create Deal Form
Add this section BEFORE the submit button (around line 249):

```tsx
<div className="h-px bg-border/50 my-6" />

<div className="space-y-4">
    <h3 className="text-lg font-semibold text-foreground flex items-center gap-2">
        <Info className="w-5 h-5 text-primary" />
        Crowdfunding Export Settings
    </h3>
    <p className="text-sm text-muted-foreground">
        Default parameters for when purchases are exported to crowdfunding platform
    </p>

    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
            <label className="block text-sm font-medium text-muted-foreground mb-1" htmlFor="cfRisk">Risk Level</label>
            <select name="cfRisk" id="cfRisk" defaultValue="Low" className="w-full p-3 bg-secondary/30 rounded-lg text-foreground border border-transparent focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all appearance-none">
                <option value="Low">Low</option>
                <option value="Medium">Medium</option>
                <option value="High">High</option>
            </select>
        </div>

        <div>
            <label className="block text-sm font-medium text-muted-foreground mb-1" htmlFor="cfTargetApy">Target APY (%)</label>
            <input type="number" name="cfTargetApy" id="cfTargetApy" defaultValue="12.5" min="0" max="100" step="0.1" className="w-full p-3 bg-secondary/30 rounded-lg text-foreground border border-transparent focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all" />
        </div>

        <div>
            <label className="block text-sm font-medium text-muted-foreground mb-1" htmlFor="cfDuration">Duration (months)</label>
            <input type="number" name="cfDuration" id="cfDuration" defaultValue="12" min="1" max="60" className="w-full p-3 bg-secondary/30 rounded-lg text-foreground border border-transparent focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all" />
        </div>

        <div>
            <label className="block text-sm font-medium text-muted-foreground mb-1" htmlFor="cfMinInvestment">Min Investment ($)</label>
            <input type="number" name="cfMinInvestment" id="cfMinInvestment" defaultValue="500" min="100" step="100" className="w-full p-3 bg-secondary/30 rounded-lg text-foreground border border-transparent focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all" />
        </div>

        <div>
            <label className="block text-sm font-medium text-muted-foreground mb-1" htmlFor="cfOrigin">Origin</label>
            <input type="text" name="cfOrigin" id="cfOrigin" defaultValue="Africa" className="w-full p-3 bg-secondary/30 rounded-lg text-foreground border border-transparent focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all" />
        </div>

        <div>
            <label className="block text-sm font-medium text-muted-foreground mb-1" htmlFor="cfTransportMethod">Transport Method</label>
            <select name="cfTransportMethod" id="cfTransportMethod" defaultValue="Air Freight" className="w-full p-3 bg-secondary/30 rounded-lg text-foreground border border-transparent focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all appearance-none">
                <option value="Air Freight">Air Freight</option>
                <option value="Sea Freight">Sea Freight</option>
                <option value="Road Transport">Road Transport</option>
                <option value="Rail Transport">Rail Transport</option>
            </select>
        </div>

        <div className="md:col-span-2">
            <label className="block text-sm font-medium text-muted-foreground mb-1" htmlFor="cfIcon">Icon</label>
            <select name="cfIcon" id="cfIcon" defaultValue="gold-bar" className="w-full p-3 bg-secondary/30 rounded-lg text-foreground border border-transparent focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all appearance-none">
                <option value="gold-bar">Gold Bar</option>
                <option value="diamond">Diamond</option>
                <option value="copper">Copper</option>
                <option value="silver">Silver</option>
           </select>
        </div>
    </div>
</div>
```

## Files Updated So Far:
✅ `/src/lib/actions.ts` - createDeal action now accepts crowdfunding parameters
✅ Prisma schema - Added cf* fields to Deal model

## Still Need To Do:
- [ ] Manually add the above section to `/src/app/admin/deals/create/page.tsx`
- [ ] Add similar fields to `/src/app/admin/deals/[id]/edit/EditDealForm.tsx`
