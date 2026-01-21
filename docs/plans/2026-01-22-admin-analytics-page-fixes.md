# Admin Analytics Page Fixes Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Fix critical analytics page issues including wrong revenue labeling, missing date filters, and add essential visualizations

**Architecture:** 
- Fix backend data labeling to distinguish total transactions from platform revenue
- Add date range filter with preset options (7d, 30d, 90d, custom)
- Implement chart components for revenue trends and booking status visualization
- Enhance transaction and event lists with actionable information
- Delegate UI/visual changes to frontend-ui-ux-engineer agent

**Tech Stack:** 
- Next.js 15 (Client Components for analytics page)
- Prisma ORM (date-filtered aggregations)
- React (chart components, date picker)
- Recharts or similar chart library
- TypeScript

---

## Task 1: Fix Revenue Labeling (Backend Data)

**Files:**
- Modify: `app/api/admin/finance/route.ts:144-150`
- Review: API response structure

**Step 1: Identify current misleading response**

Read `app/api/admin/finance/route.ts` lines 144-150:
```typescript
// Current response sends "totalRevenue" which is totalAmount (misleading)
overview: {
    totalRevenue: Number(totalRevenue._sum.totalAmount || 0),
    platformRevenue: Number(totalRevenue._sum.platformRevenue || 0),
    organizerRevenue: Number(totalRevenue._sum.organizerRevenue || 0),
    totalBookings: totalRevenue._count.id,
}
```

**Step 2: Rename to clarify what it represents**

Replace lines 145-149 in `app/api/admin/finance/route.ts`:

```typescript
overview: {
    totalTransactions: Number(totalRevenue._sum.totalAmount || 0), // Renamed from totalRevenue
    platformRevenue: Number(totalRevenue._sum.platformRevenue || 0),
    organizerRevenue: Number(totalRevenue._sum.organizerRevenue || 0),
    totalBookings: totalRevenue._count.id,
}
```

**Step 3: Update frontend TypeScript interface**

Update interface in `app/admin/analytics/page.tsx` line 22-27:

```typescript
interface AnalyticsData {
    overview: {
        totalTransactions: number; // Changed from totalRevenue
        platformRevenue: number;
        organizerRevenue: number;
        totalBookings: number;
    };
    // ... rest unchanged
}
```

**Step 4: Update stat card label**

Update line 144-148 in `app/admin/analytics/page.tsx`:

```typescript
<StatCard
    title="Total Transaksi" // Changed from "Total Pendapatan"
    value={formatCurrency(data.overview.totalTransactions)} // Changed property name
    icon={DollarSign}
    color="green"
/>
```

**Step 5: Verify TypeScript compilation**

Run: `npx tsc --noEmit`
Expected: No errors

**Step 6: Commit**

```bash
git add app/api/admin/finance/route.ts app/admin/analytics/page.tsx
git commit -m "fix: correct analytics revenue labeling - total transactions vs platform revenue"
```

---

## Task 2: Add Date Range Filter Component (FRONTEND AGENT)

**Delegation:** This task should be delegated to `frontend-ui-ux-engineer` agent

**Files:**
- Create: `components/admin/DateRangeFilter.tsx`

**Requirements for Frontend Agent:**

**Visual Design:**
- Dropdown button showing current selection (e.g., "Last 30 days")
- Dropdown menu with preset options:
  - Last 7 days
  - Last 30 days
  - Last 90 days
  - This month
  - Last month
  - Custom range (shows date pickers)
- Styled with existing design system (CSS variables)
- Icon: Calendar icon from lucide-react
- Should match AdminDashboardCharts date picker style

**Component Interface:**
```typescript
interface DateRangeFilterProps {
    value: {
        from: Date;
        to: Date;
        preset?: '7d' | '30d' | '90d' | 'this_month' | 'last_month' | 'custom';
    };
    onChange: (range: { from: Date; to: Date; preset?: string }) => void;
}
```

**Functionality:**
- When preset selected, auto-calculate from/to dates
- When custom selected, show two date input fields
- Emit onChange event when selection changes
- Display selected range in human-readable format

**Must Use:**
- Tailwind CSS classes matching existing cards
- Lucide-react icons
- CSS variables: `var(--surface)`, `var(--text-primary)`, `var(--accent-primary)`

**Expected Output:**
```tsx
export function DateRangeFilter({ value, onChange }: DateRangeFilterProps) {
    // Component implementation
    // Must have dropdown with presets
    // Must have custom date inputs
    // Must emit onChange with proper date objects
}
```

**Acceptance Criteria:**
- ✅ Dropdown shows current selection
- ✅ All 6 options (5 presets + custom) work correctly
- ✅ Dates calculated correctly for presets
- ✅ onChange fires with proper Date objects
- ✅ Matches existing design system
- ✅ Mobile responsive

**Step 1: Component created and exported**
**Step 2: TypeScript compiles without errors**
**Step 3: Commit with message**: "feat: add date range filter component with presets"

---

## Task 3: Integrate Date Range Filter into Analytics Page

**Files:**
- Modify: `app/admin/analytics/page.tsx`

**Step 1: Add state for date range**

Add after line 84 in `app/admin/analytics/page.tsx`:

```typescript
const [dateRange, setDateRange] = useState<{
    from: Date;
    to: Date;
    preset?: string;
}>({
    from: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // 30 days ago
    to: new Date(),
    preset: '30d',
});
```

**Step 2: Update data fetching to include date params**

Modify the fetch call (line 90):

```typescript
// OLD
const res = await fetch("/api/admin/finance");

// NEW
const fromStr = dateRange.from.toISOString();
const toStr = dateRange.to.toISOString();
const res = await fetch(`/api/admin/finance?from=${fromStr}&to=${toStr}`);
```

**Step 3: Re-fetch when date range changes**

Update useEffect dependency (line 107):

```typescript
// OLD
}, []);

// NEW
}, [dateRange]);
```

**Step 4: Add import for DateRangeFilter**

Add to imports (line 19):

```typescript
import { DateRangeFilter } from "@/components/admin/DateRangeFilter";
```

**Step 5: Add filter UI below header**

Add after line 139 (AdminHeader):

```typescript
<AdminHeader title="Analitik Dashboard" backHref="/admin" />

<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-end">
    <DateRangeFilter value={dateRange} onChange={setDateRange} />
</div>
```

**Step 6: Verify TypeScript compilation**

Run: `npx tsc --noEmit`
Expected: No errors

**Step 7: Commit**

```bash
git add app/admin/analytics/page.tsx
git commit -m "feat: integrate date range filter into analytics page"
```

---

## Task 4: Update Backend to Support Date Filtering

**Files:**
- Modify: `app/api/admin/finance/route.ts:30-136`

**Step 1: Extract query parameters**

Add after line 45 in `app/api/admin/finance/route.ts`:

```typescript
// Get date range from query params
const url = new URL(request.url);
const fromParam = url.searchParams.get('from');
const toParam = url.searchParams.get('to');

const dateFrom = fromParam ? new Date(fromParam) : new Date(0); // Beginning of time
const dateTo = toParam ? new Date(toParam) : new Date(); // Now
```

**Step 2: Add date filter to aggregation queries**

This requires changing the `NextRequest` parameter. Update function signature (line 30):

```typescript
// OLD
export async function GET() {

// NEW
export async function GET(request: Request) {
```

**Step 3: Update all booking aggregations to filter by date**

Update totalRevenue query (lines 62-70):

```typescript
// Add paidAt filter
prisma.booking.aggregate({
    where: { 
        status: { in: ["CONFIRMED", "PAID"] },
        paidAt: { gte: dateFrom, lte: dateTo }, // NEW
    },
    _sum: {
        totalAmount: true,
        platformRevenue: true,
        organizerRevenue: true,
    },
    _count: { id: true },
}),
```

**Step 4: Update recentTransactions query to respect date filter**

Update line 100-116:

```typescript
prisma.booking.findMany({
    where: { 
        status: { in: ["CONFIRMED", "PAID"] },
        paidAt: { gte: dateFrom, lte: dateTo }, // NEW
    },
    orderBy: { paidAt: "desc" },
    take: 10,
    // ... rest unchanged
}),
```

**Step 5: Update topEvents to filter bookings by date**

Update line 132 in the _count filter:

```typescript
_count: {
    select: { 
        bookings: { 
            where: { 
                status: { in: ["CONFIRMED", "PAID"] },
                paidAt: { gte: dateFrom, lte: dateTo }, // NEW
            } 
        } 
    },
},
```

**Step 6: Verify TypeScript compilation**

Run: `npx tsc --noEmit`
Expected: No errors

**Step 7: Test with query params**

Run dev server and test:
```bash
curl "http://localhost:3000/api/admin/finance?from=2026-01-01&to=2026-01-22"
```
Expected: JSON response with filtered data

**Step 8: Commit**

```bash
git add app/api/admin/finance/route.ts
git commit -m "feat: add date range filtering to finance analytics API"
```

---

## Task 5: Add Revenue Trend Chart Component (FRONTEND AGENT)

**Delegation:** This task should be delegated to `frontend-ui-ux-engineer` agent

**Files:**
- Create: `components/admin/RevenueTrendChart.tsx`

**Requirements for Frontend Agent:**

**Visual Design:**
- Card container with header "Revenue Trend"
- Line chart showing revenue over time
- Two lines:
  1. Platform Revenue (indigo/accent color)
  2. Organizer Revenue (emerald/success color)
- X-axis: Date labels
- Y-axis: Currency amounts (formatted as Rp)
- Legend showing both lines
- Tooltip on hover showing exact amounts
- Responsive height: 300px on desktop, 200px on mobile

**Component Interface:**
```typescript
interface RevenueTrendChartProps {
    data: Array<{
        date: string; // ISO date string
        platformRevenue: number;
        organizerRevenue: number;
    }>;
}
```

**Chart Library:**
Use Recharts (already in project dependencies):
```typescript
import { LineChart, Line, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer } from 'recharts';
```

**Styling Requirements:**
- Container: `bg-[var(--surface)]` with `shadow-[var(--shadow-sm)]`
- Chart colors:
  - Platform: `#6366f1` (indigo-500)
  - Organizer: `#10b981` (emerald-500)
- Tooltip: Custom with currency formatting
- Grid lines: Subtle gray
- Axis labels: `var(--text-muted)`

**Data Formatting:**
- X-axis dates: Show as "Jan 15" format
- Y-axis amounts: Show as "10K", "100K", "1M" (abbreviated)
- Tooltip amounts: Full currency "Rp 1,250,000"

**Expected Output:**
```tsx
export function RevenueTrendChart({ data }: RevenueTrendChartProps) {
    const formatCurrency = (value: number) => {
        return new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            minimumFractionDigits: 0,
        }).format(value);
    };

    // Chart implementation using Recharts
    // Must show two lines with different colors
    // Must have custom tooltip with currency formatting
    // Must be responsive
}
```

**Acceptance Criteria:**
- ✅ Chart displays both platform and organizer revenue lines
- ✅ Hover tooltip shows exact amounts in IDR format
- ✅ Legend clearly identifies each line
- ✅ X-axis dates formatted as "Jan 15"
- ✅ Y-axis shows abbreviated amounts
- ✅ Responsive (works on mobile)
- ✅ Matches design system colors

**Step 1: Component created with Recharts**
**Step 2: Currency formatting works correctly**
**Step 3: TypeScript compiles without errors**
**Step 4: Commit with message**: "feat: add revenue trend line chart component"

---

## Task 6: Add Booking Status Progress Bars (FRONTEND AGENT)

**Delegation:** This task should be delegated to `frontend-ui-ux-engineer` agent

**Files:**
- Modify: `app/admin/analytics/page.tsx:195-213`

**Requirements for Frontend Agent:**

**Visual Design:**
Replace the current simple list (lines 196-211) with progress bar visualization.

**Current Code:**
```typescript
<div className="space-y-3">
    {data.bookingsByStatus.map((status) => (
        <div key={status.status} className="flex items-center justify-between">
            <div className="flex items-center gap-2">
                <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${STATUS_COLORS[status.status]}`}>
                    {STATUS_LABELS[status.status] || status.status}
                </span>
            </div>
            <div className="text-right">
                <p className="font-semibold text-gray-900">{status.count}</p>
                <p className="text-xs text-gray-500">{formatCurrency(status.amount)}</p>
            </div>
        </div>
    ))}
</div>
```

**New Design Required:**
```typescript
<div className="space-y-4">
    {data.bookingsByStatus.map((status) => {
        const total = data.bookingsByStatus.reduce((sum, s) => sum + s.count, 0);
        const percentage = total > 0 ? (status.count / total) * 100 : 0;
        
        return (
            <div key={status.status} className="space-y-2">
                {/* Header row with status badge and stats */}
                <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2">
                        <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${STATUS_COLORS[status.status]}`}>
                            {STATUS_LABELS[status.status]}
                        </span>
                    </div>
                    <div className="text-right">
                        <span className="font-semibold text-[var(--text-primary)]">
                            {status.count} ({percentage.toFixed(1)}%)
                        </span>
                        <span className="text-xs text-[var(--text-muted)] ml-2">
                            {formatCurrency(status.amount)}
                        </span>
                    </div>
                </div>
                
                {/* Progress bar */}
                <div className="w-full bg-gray-200 rounded-full h-2.5 overflow-hidden">
                    <div 
                        className={`h-2.5 rounded-full transition-all duration-300 ${getProgressBarColor(status.status)}`}
                        style={{ width: `${percentage}%` }}
                    />
                </div>
            </div>
        );
    })}
</div>
```

**Progress Bar Colors:**
Add this color mapping function above the return statement:

```typescript
const getProgressBarColor = (status: string): string => {
    const colorMap: Record<string, string> = {
        PAID: 'bg-green-500',
        CONFIRMED: 'bg-blue-500',
        PENDING: 'bg-yellow-500',
        CANCELLED: 'bg-red-400',
        REFUNDED: 'bg-red-500',
    };
    return colorMap[status] || 'bg-gray-400';
};
```

**Acceptance Criteria:**
- ✅ Progress bars show percentage visually
- ✅ Each status has distinct color
- ✅ Percentage shown as text AND bar
- ✅ Shows both count and amount
- ✅ Smooth transition animation (300ms)
- ✅ Responsive on mobile

**Step 1: Code updated with progress bars**
**Step 2: Visual verification - bars display correctly**
**Step 3: TypeScript compiles without errors**
**Step 4: Commit with message**: "feat: add visual progress bars to booking status breakdown"

---

## Task 7: Enhance Recent Transactions List (FRONTEND AGENT)

**Delegation:** This task should be delegated to `frontend-ui-ux-engineer` agent

**Files:**
- Modify: `app/admin/analytics/page.tsx:234-258`

**Requirements for Frontend Agent:**

**Visual Enhancement:**
Current transaction items show: customer name, event title, amount, booking code, date.

Add these enhancements:
1. **Status badge** (PAID/CONFIRMED) - color-coded
2. **Platform revenue** shown separately from total amount
3. **Clickable link** to booking detail page
4. **Better visual hierarchy** with icons

**Current Code (lines 235-257):**
```typescript
<div key={tx.id} className="p-4 hover:bg-gray-50">
    <div className="flex items-start justify-between mb-2">
        <div>
            <p className="font-medium text-gray-900">{tx.customerName}</p>
            <p className="text-sm text-gray-500">{tx.eventTitle}</p>
        </div>
        <p className="font-semibold text-gray-900">
            {formatCurrency(tx.amount)}
        </p>
    </div>
    <div className="flex items-center justify-between text-xs text-gray-500">
        <span>{tx.bookingCode}</span>
        <span>{/* date formatting */}</span>
    </div>
</div>
```

**New Enhanced Design:**
```typescript
<Link 
    href={`/admin/bookings/${tx.id}`}
    key={tx.id} 
    className="block p-4 hover:bg-[var(--surface-hover)] transition-colors border-b last:border-b-0"
>
    <div className="flex items-start justify-between mb-2">
        <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
                <p className="font-medium text-[var(--text-primary)] truncate">
                    {tx.customerName}
                </p>
                <span className="px-2 py-0.5 text-xs font-medium rounded-full bg-green-100 text-green-700 flex-shrink-0">
                    PAID
                </span>
            </div>
            <p className="text-sm text-[var(--text-muted)] truncate">
                {tx.eventTitle}
            </p>
            <p className="text-xs text-[var(--text-muted)] mt-1">
                {tx.bookingCode}
            </p>
        </div>
        <div className="text-right ml-4 flex-shrink-0">
            <p className="font-semibold text-[var(--text-primary)]">
                {formatCurrency(tx.amount)}
            </p>
            <p className="text-xs text-[var(--accent-primary)] mt-0.5">
                Fee: {formatCurrency(tx.platformRevenue)}
            </p>
            <p className="text-xs text-[var(--text-muted)] mt-1">
                {new Date(tx.paidAt).toLocaleDateString("id-ID", {
                    day: "numeric",
                    month: "short",
                    hour: "2-digit",
                    minute: "2-digit",
                })}
            </p>
        </div>
    </div>
</Link>
```

**Visual Enhancements:**
- Status badge always shows "PAID" (green) since we only show CONFIRMED/PAID
- Platform revenue displayed below total in accent color
- Entire row is clickable link
- Hover effect changes background
- Better text truncation for long names
- Icons for better visual scanning

**Acceptance Criteria:**
- ✅ Status badge visible and color-coded
- ✅ Platform revenue shown separately
- ✅ Click navigates to `/admin/bookings/[id]`
- ✅ Hover effect works smoothly
- ✅ Text truncates properly on narrow screens
- ✅ Date format consistent and readable

**Step 1: Update transaction list HTML**
**Step 2: Add Link import from next/link**
**Step 3: Visual verification**
**Step 4: TypeScript compiles without errors**
**Step 5: Commit with message**: "feat: enhance recent transactions with status badges and clickable links"

---

## Task 8: Add Backend Support for Trend Data

**Files:**
- Modify: `app/api/admin/finance/route.ts`
- Add new return field: `revenueTrend`

**Step 1: Add revenue trend data aggregation**

Add this query to the Promise.all array (after topEvents, around line 135):

```typescript
// Add as 9th query in Promise.all
prisma.$queryRaw<Array<{ date: Date; platformRevenue: number; organizerRevenue: number }>>`
    SELECT 
        DATE(paid_at) as date,
        SUM(platform_revenue) as "platformRevenue",
        SUM(organizer_revenue) as "organizerRevenue"
    FROM bookings
    WHERE status IN ('CONFIRMED', 'PAID')
        AND paid_at >= ${dateFrom}
        AND paid_at <= ${dateTo}
    GROUP BY DATE(paid_at)
    ORDER BY date ASC
`,
```

**Step 2: Destructure the new result**

Update the destructuring (line 52):

```typescript
const [
    totalRevenue,
    thisMonthRevenue,
    lastMonthRevenue,
    pendingPayouts,
    completedPayouts,
    bookingsByStatus,
    recentTransactions,
    topEvents,
    revenueTrendData, // NEW
] = await Promise.all([/* ... */]);
```

**Step 3: Format trend data for response**

Add to the return object (around line 185):

```typescript
return successResponse({
    overview: { /* ... */ },
    thisMonth: { /* ... */ },
    payouts: { /* ... */ },
    bookingsByStatus: [ /* ... */ ],
    recentTransactions: [ /* ... */ ],
    topEvents: [ /* ... */ ],
    revenueTrend: revenueTrendData.map(d => ({
        date: d.date.toISOString(),
        platformRevenue: Number(d.platformRevenue || 0),
        organizerRevenue: Number(d.organizerRevenue || 0),
    })), // NEW
});
```

**Step 4: Update frontend TypeScript interface**

Add to AnalyticsData interface in `app/admin/analytics/page.tsx`:

```typescript
interface AnalyticsData {
    overview: { /* ... */ };
    thisMonth: { /* ... */ };
    payouts: { /* ... */ };
    bookingsByStatus: [ /* ... */ ];
    recentTransactions: [ /* ... */ ];
    topEvents: [ /* ... */ ];
    revenueTrend: Array<{  // NEW
        date: string;
        platformRevenue: number;
        organizerRevenue: number;
    }>;
}
```

**Step 5: Verify TypeScript compilation**

Run: `npx tsc --noEmit`
Expected: No errors

**Step 6: Test API response**

```bash
curl "http://localhost:3000/api/admin/finance?from=2026-01-01&to=2026-01-22" | jq '.data.revenueTrend'
```
Expected: Array of date/revenue objects

**Step 7: Commit**

```bash
git add app/api/admin/finance/route.ts app/admin/analytics/page.tsx
git commit -m "feat: add revenue trend data aggregation to analytics API"
```

---

## Task 9: Integrate Revenue Trend Chart into Page

**Files:**
- Modify: `app/admin/analytics/page.tsx`

**Step 1: Add import**

Add to imports (around line 19):

```typescript
import { RevenueTrendChart } from "@/components/admin/RevenueTrendChart";
```

**Step 2: Add chart after stat cards**

Add after the stat cards grid (after line 171, before the Payouts/Status grid):

```typescript
                </div>

                {/* Revenue Trend Chart */}
                <div className="mb-8">
                    {data.revenueTrend && data.revenueTrend.length > 0 ? (
                        <RevenueTrendChart data={data.revenueTrend} />
                    ) : (
                        <div className="bg-white rounded-xl shadow-sm p-12 text-center">
                            <BarChart3 className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                            <p className="text-gray-500">Tidak ada data trend untuk periode ini</p>
                        </div>
                    )}
                </div>

                <div className="grid lg:grid-cols-2 gap-6 mb-8">
```

**Step 3: Verify TypeScript compilation**

Run: `npx tsc --noEmit`
Expected: No errors

**Step 4: Verify build succeeds**

Run: `npm run build`
Expected: Build completes successfully

**Step 5: Commit**

```bash
git add app/admin/analytics/page.tsx
git commit -m "feat: integrate revenue trend chart into analytics page"
```

---

## Task 10: Final Testing and Verification

**Files:**
- All modified files

**Step 1: Run full TypeScript check**

Run: `npx tsc --noEmit`
Expected: No TypeScript errors (except pre-existing Jest error)

**Step 2: Run production build**

Run: `npm run build`
Expected: Build succeeds with no errors

**Step 3: Start dev server and manual verification**

Run: `npm run dev`

Navigate to: `http://localhost:3000/admin/analytics`

**Verify:**
- [ ] "Total Transaksi" card shows correct label (not "Total Pendapatan")
- [ ] Date range filter appears and works
- [ ] Changing date range refetches data
- [ ] Revenue trend chart displays with two lines
- [ ] Booking status shows progress bars
- [ ] Recent transactions show status badges and platform revenue
- [ ] Recent transactions are clickable
- [ ] All currency values format correctly as IDR
- [ ] Empty states display when no data

**Step 4: Test different date ranges**

Test these scenarios:
- Last 7 days
- Last 30 days  
- Last 90 days
- Custom range (specific dates)

Verify data updates correctly for each range.

**Step 5: Commit verification**

```bash
git add -A
git commit -m "chore: verify admin analytics page fixes implementation"
```

---

## Summary

**Total Tasks:** 10
**Estimated Time:** 6-8 hours
**Key Changes:**
- ✅ Fixed misleading revenue labels (P0)
- ✅ Added date range filtering (P1)
- ✅ Added revenue trend visualization (P1)
- ✅ Added booking status progress bars (P1)
- ✅ Enhanced transaction list with more info (P1)

**Files Modified:** 2
**Files Created:** 2 (DateRangeFilter, RevenueTrendChart)
**Frontend Agent Tasks:** 4 (Tasks 2, 5, 6, 7)
**Backend/Logic Tasks:** 6 (Tasks 1, 3, 4, 8, 9, 10)

**Agent Delegation:**
- **frontend-ui-ux-engineer**: Tasks 2, 5, 6, 7 (UI/visual components)
- **general**: Tasks 1, 3, 4, 8, 9, 10 (backend, integration, testing)

**Next Steps After Implementation:**
1. Add export functionality (CSV/PDF)
2. Add more chart types (pie chart for categories)
3. Add filtering by organizer/category
4. Add real-time data refresh
5. Add average order value (AOV) metric
6. Add conversion funnel visualization
