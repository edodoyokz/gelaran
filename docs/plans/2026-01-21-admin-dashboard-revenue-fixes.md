# Admin Dashboard Revenue Fixes Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Fix incorrect revenue calculations and add proper platform revenue breakdown to admin dashboard

**Architecture:** 
- Replace transaction-based revenue aggregation with booking-based platform revenue calculation
- Add new revenue breakdown component showing platform fee, organizer revenue, and payment gateway fees
- Update chart data API to use platform revenue instead of total transaction amounts
- Add commission settings overview card to dashboard

**Tech Stack:** 
- Next.js 15 (Server Components + Client Components)
- Prisma ORM (booking aggregations)
- React (AdminDashboardCharts client component)
- TypeScript

---

## Task 1: Fix Platform Revenue Calculation in Dashboard

**Files:**
- Modify: `app/admin/page.tsx:68-72`
- Modify: `app/admin/page.tsx:114-121`

**Step 1: Identify current incorrect calculation**

Read `app/admin/page.tsx` lines 68-72 to confirm the bug:
```typescript
// Current WRONG implementation
const transactions = await prisma.transaction.aggregate({
    where: { status: "SUCCESS" },
    _sum: { amount: true },
});
const totalRevenue = Number(transactions._sum.amount || 0);
```

**Step 2: Replace with correct platform revenue calculation**

Replace lines 68-72 in `app/admin/page.tsx`:

```typescript
const platformRevenueData = await prisma.booking.aggregate({
    where: { status: { in: ["CONFIRMED", "PAID"] } },
    _sum: { platformRevenue: true },
});
const totalPlatformRevenue = Number(platformRevenueData._sum.platformRevenue || 0);
```

**Step 3: Update stats card to use correct value**

Replace line 115 in `app/admin/page.tsx`:

```typescript
// OLD
value: formatCurrency(totalRevenue),

// NEW
value: formatCurrency(totalPlatformRevenue),
```

**Step 4: Verify changes compile**

Run: `npm run build`
Expected: Build succeeds with no TypeScript errors

**Step 5: Commit**

```bash
git add app/admin/page.tsx
git commit -m "fix: correct platform revenue calculation from bookings instead of transactions"
```

---

## Task 2: Add Revenue Breakdown Data Fetching

**Files:**
- Modify: `app/admin/page.tsx:48-66`
- Modify: `app/admin/page.tsx:68-82` (after previous changes)

**Step 1: Add revenue breakdown aggregation query**

Add after the `platformRevenueData` query in `app/admin/page.tsx`:

```typescript
const revenueBreakdown = await prisma.booking.aggregate({
    where: { status: { in: ["CONFIRMED", "PAID"] } },
    _sum: {
        totalAmount: true,
        platformRevenue: true,
        organizerRevenue: true,
        paymentGatewayFee: true,
        taxAmount: true,
    },
});

const breakdown = {
    totalTransactions: Number(revenueBreakdown._sum.totalAmount || 0),
    platformRevenue: Number(revenueBreakdown._sum.platformRevenue || 0),
    organizerRevenue: Number(revenueBreakdown._sum.organizerRevenue || 0),
    gatewayFee: Number(revenueBreakdown._sum.paymentGatewayFee || 0),
    tax: Number(revenueBreakdown._sum.taxAmount || 0),
};
```

**Step 2: Add global commission rate fetch**

Add after the breakdown calculation:

```typescript
const globalCommission = await prisma.commissionSetting.findFirst({
    where: { organizerId: null, isActive: true },
    select: { commissionValue: true },
});

const commissionOverridesCount = await prisma.commissionSetting.count({
    where: { organizerId: { not: null }, isActive: true },
});

const commissionStats = {
    globalRate: globalCommission?.commissionValue || 5,
    overridesCount: commissionOverridesCount,
};
```

**Step 3: Verify TypeScript compilation**

Run: `npx tsc --noEmit`
Expected: No errors

**Step 4: Commit**

```bash
git add app/admin/page.tsx
git commit -m "feat: add revenue breakdown and commission stats data queries"
```

---

## Task 3: Create Revenue Breakdown Component

**Files:**
- Create: `components/admin/RevenueBreakdown.tsx`

**Step 1: Create component file with TypeScript interface**

Create `components/admin/RevenueBreakdown.tsx`:

```typescript
interface RevenueBreakdownProps {
    totalTransactions: number;
    platformRevenue: number;
    organizerRevenue: number;
    gatewayFee: number;
    tax: number;
}

export function RevenueBreakdown({
    totalTransactions,
    platformRevenue,
    organizerRevenue,
    gatewayFee,
    tax,
}: RevenueBreakdownProps) {
    const formatCurrency = (value: number): string => {
        return new Intl.NumberFormat("id-ID", {
            style: "currency",
            currency: "IDR",
            minimumFractionDigits: 0,
            maximumFractionDigits: 0,
        }).format(value);
    };

    const calculatePercentage = (value: number): string => {
        if (totalTransactions === 0) return "0%";
        return ((value / totalTransactions) * 100).toFixed(1) + "%";
    };

    return (
        <div className="rounded-xl shadow-[var(--shadow-sm)] bg-[var(--surface)] border border-[var(--border)]">
            <div className="px-6 py-4 border-b border-[var(--border)]">
                <h3 className="text-lg font-semibold text-[var(--text-primary)]">
                    Revenue Breakdown
                </h3>
                <p className="text-sm text-[var(--text-muted)] mt-0.5">
                    Platform earnings and distribution
                </p>
            </div>
            <div className="p-6 space-y-4">
                <div className="flex items-center justify-between">
                    <span className="text-sm text-[var(--text-muted)]">Total Transactions</span>
                    <span className="text-lg font-bold text-[var(--text-primary)]">
                        {formatCurrency(totalTransactions)}
                    </span>
                </div>
                <div className="h-px bg-[var(--border)]" />
                <div className="flex items-center justify-between">
                    <div>
                        <span className="text-sm font-medium text-[var(--text-primary)]">Platform Revenue</span>
                        <span className="ml-2 text-xs text-[var(--text-muted)]">
                            {calculatePercentage(platformRevenue)}
                        </span>
                    </div>
                    <span className="text-base font-semibold text-[var(--accent-primary)]">
                        {formatCurrency(platformRevenue)}
                    </span>
                </div>
                <div className="flex items-center justify-between">
                    <div>
                        <span className="text-sm font-medium text-[var(--text-primary)]">Organizer Revenue</span>
                        <span className="ml-2 text-xs text-[var(--text-muted)]">
                            {calculatePercentage(organizerRevenue)}
                        </span>
                    </div>
                    <span className="text-base font-semibold text-emerald-600">
                        {formatCurrency(organizerRevenue)}
                    </span>
                </div>
                <div className="flex items-center justify-between">
                    <div>
                        <span className="text-sm font-medium text-[var(--text-primary)]">Payment Gateway Fee</span>
                        <span className="ml-2 text-xs text-[var(--text-muted)]">
                            {calculatePercentage(gatewayFee)}
                        </span>
                    </div>
                    <span className="text-base font-medium text-[var(--text-muted)]">
                        {formatCurrency(gatewayFee)}
                    </span>
                </div>
                {tax > 0 && (
                    <div className="flex items-center justify-between">
                        <div>
                            <span className="text-sm font-medium text-[var(--text-primary)]">Tax Collected</span>
                            <span className="ml-2 text-xs text-[var(--text-muted)]">
                                {calculatePercentage(tax)}
                            </span>
                        </div>
                        <span className="text-base font-medium text-[var(--text-muted)]">
                            {formatCurrency(tax)}
                        </span>
                    </div>
                )}
            </div>
        </div>
    );
}
```

**Step 2: Verify TypeScript compilation**

Run: `npx tsc --noEmit`
Expected: No errors

**Step 3: Commit**

```bash
git add components/admin/RevenueBreakdown.tsx
git commit -m "feat: create revenue breakdown component with percentage distribution"
```

---

## Task 4: Create Commission Overview Component

**Files:**
- Create: `components/admin/CommissionOverview.tsx`

**Step 1: Create component file**

Create `components/admin/CommissionOverview.tsx`:

```typescript
import Link from "next/link";
import { Percent, Settings } from "lucide-react";

interface CommissionOverviewProps {
    globalRate: number;
    overridesCount: number;
}

export function CommissionOverview({ globalRate, overridesCount }: CommissionOverviewProps) {
    return (
        <div className="rounded-xl shadow-[var(--shadow-sm)] bg-[var(--surface)] border border-[var(--border)]">
            <div className="px-6 py-4 border-b border-[var(--border)] flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <Percent className="w-5 h-5 text-[var(--accent-primary)]" />
                    <h3 className="text-lg font-semibold text-[var(--text-primary)]">
                        Commission Settings
                    </h3>
                </div>
                <Link
                    href="/admin/settings"
                    className="text-sm text-[var(--accent-primary)] hover:underline flex items-center gap-1"
                >
                    <Settings className="w-4 h-4" />
                    Configure
                </Link>
            </div>
            <div className="p-6 space-y-4">
                <div>
                    <span className="text-sm text-[var(--text-muted)]">Global Default Rate</span>
                    <p className="text-3xl font-bold text-[var(--accent-primary)] mt-1">
                        {globalRate}%
                    </p>
                </div>
                <div className="h-px bg-[var(--border)]" />
                <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-[var(--text-primary)]">Custom Overrides</span>
                    <span className="text-lg font-semibold text-[var(--text-primary)]">
                        {overridesCount}
                    </span>
                </div>
                {overridesCount > 0 && (
                    <Link
                        href="/admin/users?role=ORGANIZER"
                        className="block text-center text-sm text-[var(--accent-primary)] hover:underline mt-2"
                    >
                        View organizers with custom rates →
                    </Link>
                )}
            </div>
        </div>
    );
}
```

**Step 2: Verify TypeScript compilation**

Run: `npx tsc --noEmit`
Expected: No errors

**Step 3: Commit**

```bash
git add components/admin/CommissionOverview.tsx
git commit -m "feat: create commission overview component with global rate and overrides count"
```

---

## Task 5: Integrate New Components into Dashboard

**Files:**
- Modify: `app/admin/page.tsx` (import and render sections)

**Step 1: Add component imports**

Add at top of `app/admin/page.tsx` after other imports:

```typescript
import { RevenueBreakdown } from "@/components/admin/RevenueBreakdown";
import { CommissionOverview } from "@/components/admin/CommissionOverview";
```

**Step 2: Add revenue breakdown section after quick links**

Add after the quick links grid (around line 197) and before `<AdminDashboardCharts />`:

```typescript
                <div className="grid md:grid-cols-2 gap-6 mb-8">
                    <RevenueBreakdown
                        totalTransactions={breakdown.totalTransactions}
                        platformRevenue={breakdown.platformRevenue}
                        organizerRevenue={breakdown.organizerRevenue}
                        gatewayFee={breakdown.gatewayFee}
                        tax={breakdown.tax}
                    />
                    <CommissionOverview
                        globalRate={commissionStats.globalRate}
                        overridesCount={commissionStats.overridesCount}
                    />
                </div>
```

**Step 3: Verify TypeScript compilation**

Run: `npx tsc --noEmit`
Expected: No errors

**Step 4: Verify build succeeds**

Run: `npm run build`
Expected: Build completes successfully

**Step 5: Commit**

```bash
git add app/admin/page.tsx
git commit -m "feat: integrate revenue breakdown and commission overview into dashboard"
```

---

## Task 6: Fix Chart Revenue Calculation

**Files:**
- Modify: `app/api/admin/dashboard/chart-data/route.ts:92-105`
- Modify: `app/api/admin/dashboard/chart-data/route.ts:165-171`

**Step 1: Replace transaction-based revenue with booking-based**

Replace the `getRevenueOverTime` function's transaction query (lines 92-105):

```typescript
// OLD - Remove this
const transactions = await prisma.transaction.findMany({
    where: {
        status: "SUCCESS",
        createdAt: { gte: startDate, lte: endDate },
    },
    select: { amount: true, createdAt: true },
    orderBy: { createdAt: "asc" },
});

// NEW - Use this instead
const revenueBookings = await prisma.booking.findMany({
    where: {
        status: { in: ["CONFIRMED", "PAID"] },
        createdAt: { gte: startDate, lte: endDate },
    },
    select: {
        platformRevenue: true,
        createdAt: true,
    },
    orderBy: { createdAt: "asc" },
});
```

**Step 2: Update revenue aggregation logic**

Replace the revenue accumulation logic (around line 165-171):

```typescript
// OLD - Remove this
transactions.forEach((tx) => {
    const key = formatDate(new Date(tx.createdAt));
    const existing = dataMap.get(key);
    if (existing) {
        existing.revenue += Number(tx.amount);
    }
});

// NEW - Use this instead
revenueBookings.forEach((booking) => {
    const key = formatDate(new Date(booking.createdAt));
    const existing = dataMap.get(key);
    if (existing) {
        existing.revenue += Number(booking.platformRevenue || 0);
    }
});
```

**Step 3: Verify TypeScript compilation**

Run: `npx tsc --noEmit`
Expected: No errors

**Step 4: Commit**

```bash
git add app/api/admin/dashboard/chart-data/route.ts
git commit -m "fix: chart revenue calculation to use platform revenue from bookings"
```

---

## Task 7: Enhance Recent Bookings Display

**Files:**
- Modify: `app/admin/page.tsx:74-82` (booking query)
- Modify: `app/admin/page.tsx:211-232` (booking display)

**Step 1: Enhance booking query to include more data**

Replace the `recentBookings` query (lines 74-82):

```typescript
const recentBookings = await prisma.booking.findMany({
    take: 5,
    orderBy: { createdAt: "desc" },
    where: { status: { in: ["CONFIRMED", "PAID"] } },
    include: {
        event: { 
            select: { 
                title: true,
                organizer: {
                    select: {
                        name: true,
                        organizerProfile: {
                            select: { organizationName: true }
                        }
                    }
                }
            } 
        },
        user: { select: { name: true, email: true } },
    },
});
```

**Step 2: Update booking type interface**

Update the `RecentBooking` interface (line 22-30):

```typescript
interface RecentBooking {
    id: string;
    bookingCode: string;
    status: string;
    event: { 
        title: string;
        organizer: {
            name: string | null;
            organizerProfile: {
                organizationName: string;
            } | null;
        };
    };
    user: { name: string | null; email: string | null } | null;
    guestName: string | null;
    totalAmount: Decimal;
    createdAt: Date;
}
```

**Step 3: Enhance booking display UI**

Replace the booking list item rendering (lines 211-232):

```typescript
recentBookings.map((booking: RecentBooking) => {
    const statusColors = {
        PAID: "bg-green-500/10 text-green-600",
        CONFIRMED: "bg-blue-500/10 text-blue-600",
    };
    const organizerName = booking.event.organizer.organizerProfile?.organizationName 
        || booking.event.organizer.name 
        || "Unknown";

    return (
        <Link 
            key={booking.id} 
            href={`/admin/bookings/${booking.id}`}
            className="px-6 py-4 flex items-center justify-between hover:bg-[var(--surface-hover)] transition-colors"
        >
            <div className="flex-1">
                <p className="font-medium text-[var(--text-primary)]">
                    {booking.event.title}
                </p>
                <div className="flex items-center gap-2 mt-1">
                    <span className="text-sm text-[var(--text-muted)]">
                        {booking.user?.name || booking.guestName || "Guest"} • {booking.bookingCode}
                    </span>
                    <span className="text-xs text-[var(--text-muted)]">
                        • by {organizerName}
                    </span>
                </div>
            </div>
            <div className="flex items-center gap-4">
                <div className="text-right">
                    <p className="font-medium text-[var(--accent-primary)]">
                        {formatCurrency(Number(booking.totalAmount))}
                    </p>
                    <p className="text-xs text-[var(--text-muted)]">
                        {new Date(booking.createdAt).toLocaleDateString("id-ID")}
                    </p>
                </div>
                <span className={`px-2 py-1 text-xs font-medium rounded-full ${statusColors[booking.status as keyof typeof statusColors]}`}>
                    {booking.status}
                </span>
            </div>
        </Link>
    );
})
```

**Step 4: Verify TypeScript compilation**

Run: `npx tsc --noEmit`
Expected: No errors

**Step 5: Verify build succeeds**

Run: `npm run build`
Expected: Build completes successfully

**Step 6: Commit**

```bash
git add app/admin/page.tsx
git commit -m "feat: enhance recent bookings with status badges and organizer info"
```

---

## Task 8: Update Chart Display Labels

**Files:**
- Modify: `components/admin/AdminDashboardCharts.tsx:169`
- Modify: `components/admin/AdminDashboardCharts.tsx:157`

**Step 1: Update chart label to reflect platform revenue**

Update line 169 in `components/admin/AdminDashboardCharts.tsx`:

```typescript
// OLD
<h3 className="font-semibold text-[var(--text-primary)]">Revenue Trend</h3>

// NEW
<h3 className="font-semibold text-[var(--text-primary)]">Platform Revenue Trend</h3>
```

**Step 2: Update summary text to clarify platform revenue**

Update line 157:

```typescript
// OLD
{formatCurrency(totalRevenue)} revenue • {totalBookings} bookings • {totalNewUsers} new users

// NEW  
{formatCurrency(totalRevenue)} platform revenue • {totalBookings} bookings • {totalNewUsers} new users
```

**Step 3: Update legend label**

Update line 173:

```typescript
// OLD
Revenue

// NEW
Platform Revenue
```

**Step 4: Verify TypeScript compilation**

Run: `npx tsc --noEmit`
Expected: No errors

**Step 5: Commit**

```bash
git add components/admin/AdminDashboardCharts.tsx
git commit -m "feat: update chart labels to clarify platform revenue vs total transactions"
```

---

## Task 9: Final Testing and Verification

**Files:**
- All modified files

**Step 1: Run full TypeScript check**

Run: `npx tsc --noEmit`
Expected: No TypeScript errors

**Step 2: Run production build**

Run: `npm run build`
Expected: Build succeeds with no errors

**Step 3: Start dev server and manual verification**

Run: `npm run dev`

Navigate to: `http://localhost:3000/admin`

**Verify:**
- [ ] Platform Revenue card shows correct platform fee revenue
- [ ] Revenue Breakdown card displays with percentages
- [ ] Commission Overview card shows global rate and overrides
- [ ] Charts display "Platform Revenue Trend" label
- [ ] Recent bookings show status badges and organizer names
- [ ] All numbers format correctly as IDR currency

**Step 4: Commit verification notes**

```bash
git add -A
git commit -m "chore: verify admin dashboard revenue fixes implementation"
```

---

## Task 10: Create Pull Request

**Files:**
- N/A (Git operations)

**Step 1: Review all commits**

Run: `git log --oneline -10`

Expected commits:
1. fix: correct platform revenue calculation from bookings instead of transactions
2. feat: add revenue breakdown and commission stats data queries
3. feat: create revenue breakdown component with percentage distribution
4. feat: create commission overview component with global rate and overrides count
5. feat: integrate revenue breakdown and commission overview into dashboard
6. fix: chart revenue calculation to use platform revenue from bookings
7. feat: enhance recent bookings with status badges and organizer info
8. feat: update chart labels to clarify platform revenue vs total transactions
9. chore: verify admin dashboard revenue fixes implementation

**Step 2: Push to remote**

Run: `git push origin main`

**Step 3: Create pull request (if using feature branch)**

If on feature branch:
```bash
gh pr create --title "fix: admin dashboard revenue calculation and breakdown" --body "$(cat <<'EOF'
## Summary
- Fixed platform revenue calculation to use booking platform fees instead of total transaction amounts
- Added revenue breakdown section showing platform/organizer/gateway fee distribution
- Added commission settings overview card
- Enhanced recent bookings display with status and organizer info
- Updated chart labels to clarify platform revenue vs total transactions

## Changes
- Revenue card now shows actual platform earnings (commission fees)
- New Revenue Breakdown component with percentage distribution
- New Commission Overview component linking to settings
- Chart data now uses `platformRevenue` field from bookings
- Recent bookings enhanced with status badges and organizer names

## Testing
- ✅ TypeScript compilation passes
- ✅ Production build succeeds
- ✅ Manual verification of all dashboard components
- ✅ Currency formatting works correctly
- ✅ All links navigate properly

## Screenshots
[Add screenshots here if needed]
EOF
)"
```

---

## Summary

**Total Tasks:** 10  
**Estimated Time:** 2-3 hours  
**Key Changes:**
- ✅ Fixed critical revenue calculation bug (P0)
- ✅ Added revenue breakdown display (P0)
- ✅ Fixed chart revenue source (P1)
- ✅ Added commission overview (P1)
- ✅ Enhanced recent bookings (P1)

**Files Modified:** 4  
**Files Created:** 2  
**Tests Added:** 0 (manual verification only - dashboard is server component)

**Next Steps After Implementation:**
1. Monitor revenue numbers in production to verify accuracy
2. Consider adding automated E2E tests for dashboard
3. Add export/download functionality for revenue reports
4. Consider adding trend indicators (week-over-week growth)
