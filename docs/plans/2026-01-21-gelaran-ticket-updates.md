# GELARAN TICKET Feature Updates Implementation Plan (REVISED - Option B)

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Fix critical pricing bugs, integrate existing seating system, add FAQ page, and polish UX for Jan 27 demo.

**REVISION CONTEXT:** After deep analysis, discovered platform is 60-70% complete. Many "features" already exist and just need integration or bug fixes. This plan focuses on high-impact work.

**Architecture:** Fix hardcoded pricing logic to use database models, wire existing SeatSelector component to booking flow, create FAQ dedicated page, add essential UX polish.

**Tech Stack:** Next.js 16, React 19, Prisma + PostgreSQL, Supabase (auth/storage), TailwindCSS, TypeScript

---

## What Changed from Original Plan?

### ❌ REMOVED: Phase 4 - Tax & Commission Calculators
**Reason:** REDUNDANT - this functionality already exists!
- Tax/commission breakdown already shown in checkout flow
- Organizer dashboard already shows detailed revenue splits with percentages
- Building standalone calculators adds no real user value
- Saves 4-6 hours of development time

### ✅ KEPT: Core MVP Features
1. **Phase 1: Pricing Module** - CRITICAL BUGFIX (not a new feature)
2. **Phase 2: Seating Integration** - Just wiring, components exist
3. **Phase 3: FAQ Page** - User explicitly requested (PROJECT-REQ line 17)
4. **Phase 5: UX Polish** - Essential for demo quality

---

## Architecture Overview

**Key Strategic Decisions (from deep analysis):**

1. **Pricing is a BUGFIX, not a feature** - Checkout/booking ignores TaxRate/CommissionSetting database models and uses hardcoded 11%/5%
2. **Seating is 90% complete** - SeatSelector component (314 lines), APIs, and database models all exist, just not imported
3. **FAQ already works inline** - EventFaq model exists, FAQs displayed in EventDetailView, just need dedicated page
4. **Calculators are redundant** - Tax/fee info already shown in checkout breakdown and organizer dashboard
5. **Testing Strategy** - Pure function unit tests for pricing math, integration tests for quote vs actual booking

**Implementation Sequence:**

1. Pricing bugfix (foundation - fixes financial discrepancy risk)
2. Seating plan integration (Jan 27 demo deadline)
3. FAQ dedicated page (user requirement)
4. UX enhancements (loading states, error handling, FAQ management)

---

## Phase 1: Pricing Module Unification (FOUNDATION)

**Problem:** Currently tax/commission calculations are duplicated in `app/checkout/page.tsx` (5%/11% hardcoded) and `app/api/bookings/route.ts`. This causes drift and makes calculators impossible.

**Solution:** Create centralized pricing module + quote API endpoint.

### Task 1.1: Create Pricing Utilities Module

**Files:**
- Create: `lib/pricing/calculate.ts`
- Create: `lib/pricing/types.ts`
- Create: `lib/pricing/constants.ts`

**Step 1: Write types for pricing inputs/outputs**

Create `lib/pricing/types.ts`:

```typescript
import { TaxType, CommissionType } from '@prisma/client'

export interface PricingInput {
  subtotal: number
  discountAmount: number
  taxRate: {
    rate: number
    type: TaxType
    isInclusive: boolean
  } | null
  commission: {
    value: number
    type: CommissionType
    minCommission?: number
    maxCommission?: number
  } | null
  paymentGatewayFeePercentage: number // e.g., 2.9% for Midtrans
}

export interface PricingBreakdown {
  subtotal: number
  discountAmount: number
  taxBase: number // DPP (after discount, before tax)
  taxAmount: number
  taxLabel: string
  platformFee: number
  paymentGatewayFee: number
  totalAmount: number
  organizerRevenue: number
  platformRevenue: number
}
```

**Step 2: Write pure pricing calculation function**

Create `lib/pricing/calculate.ts`:

```typescript
import { TaxType, CommissionType } from '@prisma/client'
import type { PricingInput, PricingBreakdown } from './types'

export function calculatePricing(input: PricingInput): PricingBreakdown {
  const { subtotal, discountAmount, taxRate, commission, paymentGatewayFeePercentage } = input
  
  // 1. Tax base (after discount)
  const taxBase = Math.max(0, subtotal - discountAmount)
  
  // 2. Calculate tax
  let taxAmount = 0
  let taxLabel = 'No Tax'
  
  if (taxRate) {
    if (taxRate.type === 'PERCENTAGE') {
      if (taxRate.isInclusive) {
        // Inclusive: extract tax from taxBase
        // Formula: tax = taxBase - (taxBase / (1 + rate/100))
        taxAmount = Math.round(taxBase - (taxBase / (1 + taxRate.rate / 100)))
        taxLabel = `Tax (${taxRate.rate}% incl.)`
      } else {
        // Exclusive: add tax on top
        taxAmount = Math.round(taxBase * taxRate.rate / 100)
        taxLabel = `Tax (${taxRate.rate}%)`
      }
    } else {
      // FIXED tax amount
      taxAmount = taxRate.rate
      taxLabel = 'Tax (fixed)'
    }
  }
  
  // 3. Subtotal after tax (for exclusive) or same (for inclusive)
  const amountAfterTax = taxRate?.isInclusive ? taxBase : taxBase + taxAmount
  
  // 4. Calculate platform commission
  let platformFee = 0
  
  if (commission) {
    if (commission.type === 'PERCENTAGE') {
      platformFee = Math.round(taxBase * commission.value / 100)
    } else {
      // FIXED commission
      platformFee = commission.value
    }
    
    // Apply min/max caps
    if (commission.minCommission && platformFee < commission.minCommission) {
      platformFee = commission.minCommission
    }
    if (commission.maxCommission && platformFee > commission.maxCommission) {
      platformFee = commission.maxCommission
    }
  }
  
  // 5. Calculate payment gateway fee (on total customer pays)
  const paymentGatewayFee = Math.round(amountAfterTax * paymentGatewayFeePercentage / 100)
  
  // 6. Total amount customer pays
  const totalAmount = amountAfterTax
  
  // 7. Revenue split
  const platformRevenue = platformFee
  const organizerRevenue = taxBase - platformFee - paymentGatewayFee
  
  return {
    subtotal,
    discountAmount,
    taxBase,
    taxAmount,
    taxLabel,
    platformFee,
    paymentGatewayFee,
    totalAmount,
    organizerRevenue,
    platformRevenue
  }
}
```

**Step 3: Add constants**

Create `lib/pricing/constants.ts`:

```typescript
export const DEFAULT_PAYMENT_GATEWAY_FEE_PERCENTAGE = 2.9 // Midtrans ~2.9%
export const DEFAULT_PLATFORM_FEE_PERCENTAGE = 5
export const DEFAULT_TAX_PERCENTAGE = 11 // Indonesia PPN
```

**Step 4: Write unit tests**

Create `lib/pricing/__tests__/calculate.test.ts`:

```typescript
import { describe, test, expect } from '@jest/globals'
import { calculatePricing } from '../calculate'

describe('calculatePricing', () => {
  test('exclusive tax with percentage commission', () => {
    const result = calculatePricing({
      subtotal: 100000,
      discountAmount: 10000,
      taxRate: { rate: 11, type: 'PERCENTAGE', isInclusive: false },
      commission: { value: 5, type: 'PERCENTAGE' },
      paymentGatewayFeePercentage: 2.9
    })
    
    expect(result.taxBase).toBe(90000)
    expect(result.taxAmount).toBe(9900)
    expect(result.platformFee).toBe(4500)
    expect(result.totalAmount).toBe(99900)
  })
  
  test('inclusive tax', () => {
    const result = calculatePricing({
      subtotal: 111000,
      discountAmount: 0,
      taxRate: { rate: 11, type: 'PERCENTAGE', isInclusive: true },
      commission: { value: 5, type: 'PERCENTAGE' },
      paymentGatewayFeePercentage: 2.9
    })
    
    // Tax should be extracted: 111000 / 1.11 = 100000 base, 11000 tax
    expect(result.taxAmount).toBe(11000)
    expect(result.totalAmount).toBe(111000)
  })
  
  test('commission with min cap', () => {
    const result = calculatePricing({
      subtotal: 10000,
      discountAmount: 0,
      taxRate: null,
      commission: { value: 5, type: 'PERCENTAGE', minCommission: 2000 },
      paymentGatewayFeePercentage: 2.9
    })
    
    // 5% of 10000 = 500, but min is 2000
    expect(result.platformFee).toBe(2000)
  })
})
```

**Step 5: Run tests (if test framework setup exists)**

Run: `npm test lib/pricing/__tests__/calculate.test.ts` (or skip if no test setup yet)
Expected: All tests pass

**Step 6: Commit**

```bash
git add lib/pricing
git commit -m "feat: add centralized pricing calculation module with unit tests"
```

---

### Task 1.2: Create Pricing Quote API Endpoint

**Files:**
- Create: `app/api/pricing/quote/route.ts`

**Step 1: Write API route with validation**

Create `app/api/pricing/quote/route.ts`:

```typescript
import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import prisma from '@/lib/prisma'
import { calculatePricing } from '@/lib/pricing/calculate'
import { DEFAULT_PAYMENT_GATEWAY_FEE_PERCENTAGE, DEFAULT_PLATFORM_FEE_PERCENTAGE } from '@/lib/pricing/constants'

const QuoteSchema = z.object({
  eventId: z.string().uuid(),
  tickets: z.array(z.object({
    ticketTypeId: z.string().uuid(),
    quantity: z.number().int().min(1)
  })),
  seatIds: z.array(z.string().uuid()).optional(),
  promoCode: z.string().optional()
})

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const data = QuoteSchema.parse(body)
    
    // 1. Fetch event with tax rate and commission settings
    const event = await prisma.event.findUnique({
      where: { id: data.eventId },
      include: {
        ticketTypes: true
      }
    })
    
    if (!event) {
      return NextResponse.json({ error: 'Event not found' }, { status: 404 })
    }
    
    // 2. Calculate subtotal from tickets
    let subtotal = 0
    
    for (const ticket of data.tickets) {
      const ticketType = event.ticketTypes.find(t => t.id === ticket.ticketTypeId)
      if (!ticketType) {
        return NextResponse.json({ error: `Ticket type ${ticket.ticketTypeId} not found` }, { status: 400 })
      }
      subtotal += Number(ticketType.basePrice) * ticket.quantity
    }
    
    // 3. Calculate discount if promo code provided
    let discountAmount = 0
    
    if (data.promoCode) {
      const promo = await prisma.promoCode.findUnique({
        where: { code: data.promoCode, isActive: true }
      })
      
      if (promo && new Date() >= promo.validFrom && new Date() <= promo.validUntil) {
        if (promo.discountType === 'PERCENTAGE') {
          discountAmount = Math.round(subtotal * Number(promo.discountValue) / 100)
          if (promo.maxDiscountAmount) {
            discountAmount = Math.min(discountAmount, Number(promo.maxDiscountAmount))
          }
        } else {
          discountAmount = Number(promo.discountValue)
        }
      }
    }
    
    // 4. Get tax rate (use default for now, enhance later with Event.taxRateId)
    const defaultTaxRate = await prisma.taxRate.findFirst({
      where: { isDefault: true, isActive: true }
    })
    
    // 5. Get commission setting (event > organizer > default)
    let commissionSetting = await prisma.commissionSetting.findFirst({
      where: {
        eventId: event.id,
        isActive: true,
        OR: [
          { validFrom: null },
          { validFrom: { lte: new Date() } }
        ],
        OR: [
          { validUntil: null },
          { validUntil: { gte: new Date() } }
        ]
      }
    })
    
    if (!commissionSetting) {
      commissionSetting = await prisma.commissionSetting.findFirst({
        where: {
          organizerId: event.organizerId,
          isActive: true
        }
      })
    }
    
    // 6. Calculate pricing
    const pricing = calculatePricing({
      subtotal,
      discountAmount,
      taxRate: defaultTaxRate ? {
        rate: Number(defaultTaxRate.rate),
        type: defaultTaxRate.taxType,
        isInclusive: defaultTaxRate.isInclusive
      } : null,
      commission: commissionSetting ? {
        value: Number(commissionSetting.commissionValue),
        type: commissionSetting.commissionType,
        minCommission: commissionSetting.minCommission ? Number(commissionSetting.minCommission) : undefined,
        maxCommission: commissionSetting.maxCommission ? Number(commissionSetting.maxCommission) : undefined
      } : {
        value: DEFAULT_PLATFORM_FEE_PERCENTAGE,
        type: 'PERCENTAGE'
      },
      paymentGatewayFeePercentage: DEFAULT_PAYMENT_GATEWAY_FEE_PERCENTAGE
    })
    
    return NextResponse.json(pricing)
    
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors }, { status: 400 })
    }
    console.error('Pricing quote error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
```

**Step 2: Test endpoint manually**

Run: `curl -X POST http://localhost:3000/api/pricing/quote -H "Content-Type: application/json" -d '{"eventId": "...", "tickets": [{"ticketTypeId": "...", "quantity": 1}]}'`
Expected: JSON response with pricing breakdown

**Step 3: Commit**

```bash
git add app/api/pricing
git commit -m "feat: add pricing quote API endpoint for unified calculations"
```

---

### Task 1.3: Migrate Existing Booking Logic to Use Pricing Module

**Files:**
- Modify: `app/api/bookings/route.ts` (replace hardcoded calculations)
- Modify: `app/checkout/page.tsx` (call quote endpoint instead of client-side math)

**Step 1: Update booking creation route**

In `app/api/bookings/route.ts`, find the pricing calculation section and replace with:

```typescript
// Import at top
import { calculatePricing } from '@/lib/pricing/calculate'
import { DEFAULT_PAYMENT_GATEWAY_FEE_PERCENTAGE, DEFAULT_PLATFORM_FEE_PERCENTAGE } from '@/lib/pricing/constants'

// Replace existing tax/fee calculation with:
const defaultTaxRate = await prisma.taxRate.findFirst({
  where: { isDefault: true, isActive: true }
})

const commissionSetting = await prisma.commissionSetting.findFirst({
  where: {
    OR: [
      { eventId: event.id },
      { organizerId: event.organizerId }
    ],
    isActive: true
  }
})

const pricing = calculatePricing({
  subtotal,
  discountAmount,
  taxRate: defaultTaxRate ? {
    rate: Number(defaultTaxRate.rate),
    type: defaultTaxRate.taxType,
    isInclusive: defaultTaxRate.isInclusive
  } : null,
  commission: commissionSetting ? {
    value: Number(commissionSetting.commissionValue),
    type: commissionSetting.commissionType,
    minCommission: commissionSetting.minCommission ? Number(commissionSetting.minCommission) : undefined,
    maxCommission: commissionSetting.maxCommission ? Number(commissionSetting.maxCommission) : undefined
  } : {
    value: DEFAULT_PLATFORM_FEE_PERCENTAGE,
    type: 'PERCENTAGE'
  },
  paymentGatewayFeePercentage: DEFAULT_PAYMENT_GATEWAY_FEE_PERCENTAGE
})

// Then use pricing.taxAmount, pricing.platformFee, etc. in booking creation
```

**Step 2: Update checkout page to fetch quote**

In `app/checkout/page.tsx`, replace client-side calculation with API call:

```typescript
// Add React Query hook
const { data: pricingQuote, isLoading } = useQuery({
  queryKey: ['pricing-quote', eventSlug, ticketSelections],
  queryFn: async () => {
    const response = await fetch('/api/pricing/quote', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        eventId: event.id,
        tickets: ticketSelections.map(t => ({
          ticketTypeId: t.ticketTypeId,
          quantity: t.quantity
        })),
        promoCode: appliedPromoCode
      })
    })
    if (!response.ok) throw new Error('Failed to fetch pricing')
    return response.json()
  },
  enabled: !!event && ticketSelections.length > 0
})

// Then render pricingQuote.subtotal, pricingQuote.taxAmount, etc.
```

**Step 3: Test checkout flow end-to-end**

1. Add tickets to cart
2. View checkout page - verify pricing matches
3. Complete booking - verify created booking has identical amounts
4. Check database booking record

Expected: Quote API amounts === Booking record amounts

**Step 4: Commit**

```bash
git add app/api/bookings/route.ts app/checkout/page.tsx
git commit -m "refactor: migrate booking and checkout to use centralized pricing module"
```

---

## Phase 2: Seating Plan MVP (JAN 27 DEADLINE)

**Goal:** Wire up existing seating infrastructure to the booking flow - backend and components already exist, just need integration.

**✅ WHAT ALREADY EXISTS:**
- Database models: VenueSection, VenueRow, Seat (COMPLETE)
- API endpoints: seat locking, section CRUD, seat management (ALL WORKING)
- Frontend component: SeatSelector with visual chart, seat selection, status indicators (EXISTS)
- Seat locking mechanism with 15min expiry (WORKING)

**❌ WHAT'S MISSING:**
- SeatSelector not imported in event detail page
- No checkout integration for locked seats
- BookedTicket doesn't link to seat IDs properly

**REVISED APPROACH:** Simple 4-step integration instead of building from scratch.

**Estimated Time:** 3-4 hours (down from 2-3 days)

---

### Task 2.1: Integrate SeatSelector into Event Detail Page

**Files:**
- Modify: `app/events/[slug]/page.tsx`

**Step 1: Import existing SeatSelector component**

Add import at top of `app/events/[slug]/page.tsx`:

```typescript
import { SeatSelector } from '@/components/seating/SeatSelector'
```

**Step 2: Add conditional seating section**

In the event page component, after ticket type selection section, add:

```typescript
{event.hasSeatingChart && (
  <div className="mt-12">
    <h2 className="text-2xl font-bold mb-6">Select Your Seats</h2>
    <SeatSelector
      eventId={event.id}
      eventSlug={event.slug}
    />
  </div>
)}
```

**Step 3: Update Prisma query to include seating data**

Modify the event fetch query to include venue sections:

```typescript
const event = await prisma.event.findUnique({
  where: { slug: params.slug },
  include: {
    // ... existing includes
    venueSections: {
      where: { isActive: true },
      orderBy: { sortOrder: 'asc' },
      include: {
        rows: {
          where: { isActive: true },
          orderBy: { sortOrder: 'asc' },
          include: {
            seats: {
              where: { isActive: true },
              include: {
                ticketType: true
              }
            }
          }
        }
      }
    }
  }
})
```

**Step 4: Test visual integration**

1. Navigate to an event with `hasSeatingChart = true`
2. Verify SeatSelector renders correctly
3. Verify seat chart displays with proper colors and status
4. Test seat selection interaction

Expected: SeatSelector displays on event page when seating enabled

**Step 5: Commit**

```bash
git add app/events/[slug]/page.tsx
git commit -m "feat: integrate SeatSelector component into event detail page"
```

**Estimated Time:** 30 minutes

---

### Task 2.2: Add Seat Locking on Checkout Entry

**Files:**
- Modify: `app/checkout/page.tsx`

**Step 1: Accept and validate seat IDs from query params**

Add query param parsing at top of checkout page:

```typescript
const searchParams = useSearchParams()
const seatIds = searchParams.get('seats')?.split(',') || []
```

**Step 2: Lock seats when entering checkout**

Add seat locking effect:

```typescript
useEffect(() => {
  if (seatIds.length > 0) {
    lockSeats()
  }
}, [seatIds])

const lockSeats = async () => {
  const sessionId = `checkout-${Date.now()}`
  
  const response = await fetch(`/api/events/${eventSlug}/seats`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      seatIds,
      sessionId
    })
  })
  
  if (!response.ok) {
    // Handle seat already taken
    alert('Selected seats are no longer available')
    router.push(`/events/${eventSlug}`)
    return
  }
  
  const { seats, lockUntil } = await response.json()
  setLockedSeats(seats)
  setLockExpiry(lockUntil)
}
```

**Step 3: Validate seats belong to current session**

Add session validation:

```typescript
// Verify locked seats match session
const isValidLock = lockedSeats.every(seat => 
  seat.sessionId === sessionId && 
  new Date(seat.lockedUntil) > new Date()
)

if (!isValidLock) {
  alert('Seat lock expired. Please select seats again.')
  router.push(`/events/${eventSlug}`)
}
```

**Step 4: Display selected seat details**

Add seat info display in checkout:

```typescript
{lockedSeats.length > 0 && (
  <div className="bg-blue-50 p-4 rounded-lg mb-6">
    <h3 className="font-semibold mb-2">Selected Seats</h3>
    <div className="space-y-1">
      {lockedSeats.map(seat => (
        <div key={seat.id} className="text-sm">
          Section {seat.row.section.name} - Row {seat.row.rowLabel} - Seat {seat.seatNumber}
        </div>
      ))}
    </div>
    <p className="text-xs text-gray-600 mt-2">
      Reserved until {new Date(lockExpiry).toLocaleTimeString()}
    </p>
  </div>
)}
```

**Step 5: Test seat locking flow**

1. Select seats on event page
2. Click "Continue to Checkout"
3. Verify seats are locked in database
4. Verify checkout displays seat details
5. Verify lock expiry countdown

Expected: Seats locked when entering checkout, displayed correctly

**Step 6: Commit**

```bash
git add app/checkout/page.tsx
git commit -m "feat: add seat locking and validation on checkout entry"
```

**Estimated Time:** 1.5 hours

---

### Task 2.3: Update Booking API to Link Seats

**Files:**
- Modify: `app/api/bookings/route.ts`

**Step 1: Accept seat IDs in booking creation request**

Update booking schema to accept seats:

```typescript
const CreateBookingSchema = z.object({
  // ... existing fields
  seatIds: z.array(z.string().uuid()).optional()
})
```

**Step 2: Link BookedTicket records to Seat IDs**

Modify booking creation to link seats:

```typescript
// Inside booking creation transaction
if (data.seatIds && data.seatIds.length > 0) {
  // Create BookedTicket entries with seat references
  for (const seatId of data.seatIds) {
    const seat = await tx.seat.findUnique({
      where: { id: seatId },
      include: { ticketType: true }
    })
    
    if (!seat) {
      throw new Error(`Seat ${seatId} not found`)
    }
    
    // Verify seat is locked by current user
    if (seat.status !== 'LOCKED' || seat.lockedByUserId !== user.id) {
      throw new Error(`Seat ${seatId} is not locked by you`)
    }
    
    await tx.bookedTicket.create({
      data: {
        bookingId: booking.id,
        ticketTypeId: seat.ticketTypeId,
        seatId: seat.id,
        price: seat.priceOverride || seat.ticketType.basePrice,
        status: 'CONFIRMED'
      }
    })
  }
}
```

**Step 3: Mark seats as BOOKED after payment**

Update seat status on successful booking:

```typescript
// After booking created successfully
if (data.seatIds && data.seatIds.length > 0) {
  await tx.seat.updateMany({
    where: {
      id: { in: data.seatIds }
    },
    data: {
      status: 'BOOKED',
      lockedByUserId: null,
      lockedUntil: null
    }
  })
}
```

**Step 4: Test booking with seats**

1. Select seats and checkout
2. Complete payment
3. Verify BookedTicket records created with seatId
4. Verify seat status changed to BOOKED
5. Verify seat no longer appears as available

Expected: Seats linked to booking and marked BOOKED

**Step 5: Commit**

```bash
git add app/api/bookings/route.ts
git commit -m "feat: link BookedTicket records to seat IDs and update seat status"
```

**Estimated Time:** 1 hour

---

### Task 2.4: Add Seat Release on Checkout Exit

**Files:**
- Modify: `app/checkout/page.tsx`

**Step 1: Release seats on component unmount**

Add cleanup effect:

```typescript
useEffect(() => {
  return () => {
    // Release seats when leaving checkout
    if (seatIds.length > 0) {
      releaseSeatLocks()
    }
  }
}, [seatIds])

const releaseSeatLocks = async () => {
  await fetch(`/api/events/${eventSlug}/seats`, {
    method: 'DELETE',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ seatIds })
  })
}
```

**Step 2: Release seats on back navigation**

Add back button handler:

```typescript
const handleBack = async () => {
  await releaseSeatLocks()
  router.push(`/events/${eventSlug}`)
}
```

**Step 3: Handle lock expiry countdown**

Add expiry timer:

```typescript
useEffect(() => {
  if (!lockExpiry) return
  
  const timer = setInterval(() => {
    const remaining = new Date(lockExpiry).getTime() - Date.now()
    
    if (remaining <= 0) {
      alert('Your seat reservation has expired')
      router.push(`/events/${eventSlug}`)
    } else {
      setTimeRemaining(Math.floor(remaining / 1000))
    }
  }, 1000)
  
  return () => clearInterval(timer)
}, [lockExpiry])
```

**Step 4: Test seat release**

1. Lock seats and enter checkout
2. Click back button - verify seats released
3. Lock seats and wait for expiry - verify redirect
4. Lock seats and refresh page - verify seats available again

Expected: Seats released properly on all exit scenarios

**Step 5: Commit**

```bash
git add app/checkout/page.tsx
git commit -m "feat: add seat lock release on checkout exit and expiry"
```

**Estimated Time:** 1 hour

---

## Phase 3: FAQ Page (QUICK WIN)

### Task 3.1: Create Event FAQ Page

**Files:**
- Create: `app/events/[slug]/faq/page.tsx`

**Step 1: Write FAQ page component**

Create `app/events/[slug]/faq/page.tsx`:

```typescript
import { notFound } from 'next/navigation'
import prisma from '@/lib/prisma'

export default async function EventFaqPage({
  params
}: {
  params: { slug: string }
}) {
  const event = await prisma.event.findUnique({
    where: { slug: params.slug },
    include: {
      faqs: {
        where: { isActive: true },
        orderBy: { sortOrder: 'asc' }
      }
    }
  })
  
  if (!event) {
    notFound()
  }
  
  return (
    <div className="container mx-auto px-4 py-12">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-2">{event.title} - FAQ</h1>
        <p className="text-gray-600 mb-8">
          Frequently Asked Questions
        </p>
        
        {event.faqs.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            No FAQ available for this event yet.
          </div>
        ) : (
          <div className="space-y-6">
            {event.faqs.map((faq, index) => (
              <div key={faq.id} className="border-b pb-6">
                <h3 className="text-lg font-semibold mb-2">
                  {index + 1}. {faq.question}
                </h3>
                <p className="text-gray-700 whitespace-pre-wrap">
                  {faq.answer}
                </p>
              </div>
            ))}
          </div>
        )}
        
        <div className="mt-12 p-6 bg-blue-50 rounded-lg">
          <h4 className="font-semibold mb-2">Still have questions?</h4>
          <p className="text-gray-700 mb-4">
            If you can't find the answer you're looking for, contact our support team.
          </p>
          <a
            href="mailto:support@gelaran.id"
            className="inline-block bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
          >
            Contact Support
          </a>
        </div>
      </div>
    </div>
  )
}
```

**Step 2: Add FAQ link to event detail page**

In `app/events/[slug]/page.tsx`, add a link:

```typescript
<a
  href={`/events/${event.slug}/faq`}
  className="text-blue-600 hover:underline"
>
  View Frequently Asked Questions →
</a>
```

**Step 3: Test FAQ page**

Navigate to `/events/test-event/faq`
Expected: List of FAQ entries, or empty state if none exist

**Step 4: Commit**

```bash
git add app/events/[slug]/faq
git commit -m "feat: add event FAQ page with support ticket CTA"
```

---

## ~~Phase 4: Tax & Commission Calculators~~ (REMOVED - REDUNDANT)

**Why Removed:**
- ✅ Tax/commission breakdown **already shown** in checkout flow
- ✅ Organizer dashboard **already shows** detailed revenue splits with percentages
- ✅ Building standalone calculators adds **no real user value**
- ✅ Saves **4-6 hours** of development time

**What Users Already Have:**
- **Checkout Page:** Real-time pricing breakdown showing subtotal, tax (11%), platform fee (5%), payment gateway fee (2.9%), and total
- **Organizer Dashboard:** Revenue analytics with gross revenue, platform fees, payment fees, and net revenue with percentage breakdowns
- **Booking Confirmation:** Complete itemized receipt with all fees detailed

**Verdict:** SKIP and focus on high-impact features instead.

---


---

## Phase 5: UX Enhancements & Polish

**Goal:** Add FAQ management UI for organizers, improve loading states, and add proper error handling.

**Effort Estimate:** 2 hours

### Task 5.1: Add FAQ Management UI for Organizers

**Files:**
- Create: `app/organizer/events/[id]/faq/page.tsx`
- Create: `app/api/organizer/events/[id]/faq/route.ts`

**Step 1: Create FAQ management API**

Create `app/api/organizer/events/[id]/faq/route.ts`:

```typescript
import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import prisma from '@/lib/prisma'
import { createClient } from '@/lib/supabase/server'

const FaqSchema = z.object({
  question: z.string().min(5),
  answer: z.string().min(10),
  sortOrder: z.number().optional()
})

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    
    const event = await prisma.event.findUnique({
      where: { id: params.id },
      include: {
        faqs: {
          where: { isActive: true },
          orderBy: { sortOrder: 'asc' }
        }
      }
    })
    
    if (!event || event.organizerId !== user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }
    
    return NextResponse.json(event.faqs)
    
  } catch (error) {
    console.error('Get FAQs error:', error)
    return NextResponse.json({ error: 'Failed to fetch FAQs' }, { status: 500 })
  }
}

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    
    const event = await prisma.event.findUnique({
      where: { id: params.id }
    })
    
    if (!event || event.organizerId !== user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }
    
    const body = await req.json()
    const data = FaqSchema.parse(body)
    
    const faq = await prisma.eventFaq.create({
      data: {
        eventId: params.id,
        question: data.question,
        answer: data.answer,
        sortOrder: data.sortOrder || 0,
        isActive: true
      }
    })
    
    return NextResponse.json(faq)
    
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors }, { status: 400 })
    }
    console.error('Create FAQ error:', error)
    return NextResponse.json({ error: 'Failed to create FAQ' }, { status: 500 })
  }
}
```

**Step 2: Create FAQ management page**

Create `app/organizer/events/[id]/faq/page.tsx`:

```typescript
'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'

export default function EventFaqManagementPage() {
  const params = useParams()
  const [faqs, setFaqs] = useState<any[]>([])
  const [newQuestion, setNewQuestion] = useState('')
  const [newAnswer, setNewAnswer] = useState('')
  const [isAdding, setIsAdding] = useState(false)
  
  useEffect(() => {
    fetchFaqs()
  }, [params.id])
  
  const fetchFaqs = async () => {
    const response = await fetch(`/api/organizer/events/${params.id}/faq`)
    if (response.ok) {
      const data = await response.json()
      setFaqs(data)
    }
  }
  
  const handleAddFaq = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsAdding(true)
    
    try {
      const response = await fetch(`/api/organizer/events/${params.id}/faq`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          question: newQuestion,
          answer: newAnswer
        })
      })
      
      if (response.ok) {
        setNewQuestion('')
        setNewAnswer('')
        await fetchFaqs()
      }
    } catch (error) {
      alert('Failed to add FAQ')
    } finally {
      setIsAdding(false)
    }
  }
  
  return (
    <div className="container mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold mb-8">Manage Event FAQs</h1>
      
      <div className="bg-white border rounded-lg p-6 mb-8">
        <h2 className="text-xl font-semibold mb-4">Add New FAQ</h2>
        
        <form onSubmit={handleAddFaq} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">Question</label>
            <input
              type="text"
              value={newQuestion}
              onChange={(e) => setNewQuestion(e.target.value)}
              className="w-full border rounded-lg px-4 py-2"
              required
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-2">Answer</label>
            <textarea
              value={newAnswer}
              onChange={(e) => setNewAnswer(e.target.value)}
              className="w-full border rounded-lg px-4 py-2"
              rows={4}
              required
            />
          </div>
          
          <button
            type="submit"
            disabled={isAdding}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50"
          >
            {isAdding ? 'Adding...' : 'Add FAQ'}
          </button>
        </form>
      </div>
      
      <div className="space-y-4">
        <h2 className="text-xl font-semibold">Existing FAQs</h2>
        
        {faqs.map((faq, index) => (
          <div key={faq.id} className="border rounded-lg p-4">
            <h3 className="font-semibold mb-2">
              {index + 1}. {faq.question}
            </h3>
            <p className="text-gray-700 whitespace-pre-wrap">{faq.answer}</p>
          </div>
        ))}
      </div>
    </div>
  )
}
```

**Step 3: Commit**

```bash
git add app/organizer/events/[id]/faq app/api/organizer/events/[id]/faq
git commit -m "feat: add FAQ management UI for organizers"
```

---

### Task 5.4: Add Loading States & Error Handling

**Files:**
- Modify: `app/calculators/tax/page.tsx`
- Modify: `app/calculators/commission/page.tsx`
- Modify: `app/support/new/page.tsx`

**Step 1: Add error toast component**

Create `components/ui/Toast.tsx`:

```typescript
'use client'

import { useEffect } from 'react'
import { X } from 'lucide-react'

interface ToastProps {
  message: string
  type: 'success' | 'error' | 'info'
  onClose: () => void
}

export function Toast({ message, type, onClose }: ToastProps) {
  useEffect(() => {
    const timer = setTimeout(onClose, 5000)
    return () => clearTimeout(timer)
  }, [onClose])
  
  const bgColor = {
    success: 'bg-green-500',
    error: 'bg-red-500',
    info: 'bg-blue-500'
  }[type]
  
  return (
    <div className={`fixed bottom-4 right-4 ${bgColor} text-white px-6 py-3 rounded-lg shadow-lg flex items-center gap-3 z-50`}>
      <span>{message}</span>
      <button onClick={onClose} className="hover:bg-white/20 rounded p-1">
        <X className="h-4 w-4" />
      </button>
    </div>
  )
}
```

**Step 2: Add loading spinner component**

Create `components/ui/Spinner.tsx`:

```typescript
export function Spinner({ size = 'md' }: { size?: 'sm' | 'md' | 'lg' }) {
  const sizeClass = {
    sm: 'h-4 w-4',
    md: 'h-8 w-8',
    lg: 'h-12 w-12'
  }[size]
  
  return (
    <div className={`animate-spin rounded-full border-2 border-gray-300 border-t-blue-600 ${sizeClass}`} />
  )
}
```

**Step 3: Update calculator pages with better UX**

In `app/calculators/tax/page.tsx`, add validation feedback:

```typescript
// Add validation state
const [errors, setErrors] = useState<Record<string, string>>({})

// Add validation
const validateInputs = () => {
  const newErrors: Record<string, string> = {}
  
  if (ticketPrice <= 0) {
    newErrors.price = 'Harga tiket harus lebih dari 0'
  }
  if (quantity <= 0 || quantity > 100) {
    newErrors.quantity = 'Jumlah harus antara 1-100'
  }
  if (taxRate < 0 || taxRate > 100) {
    newErrors.taxRate = 'Tarif pajak harus antara 0-100%'
  }
  
  setErrors(newErrors)
  return Object.keys(newErrors).length === 0
}

// Add error display
{errors.price && (
  <p className="text-red-500 text-sm mt-1">{errors.price}</p>
)}
```

**Step 4: Commit**

```bash
git add components/ui app/calculators app/support
git commit -m "feat: add loading states, error handling, and validation UX"
```

---

## Updated Success Criteria (Option B - Enhanced MVP)

**MVP Complete When:**
- ✅ Pricing quote API returns accurate calculations
- ✅ Checkout and bookings use unified pricing module (CRITICAL BUGFIX)
- ✅ Seating system integrated and working by Jan 27
- ✅ FAQ page displays event FAQs (user requirement)
- ✅ Organizers can manage event FAQs
- ✅ Proper loading states and error handling

**Explicitly SKIPPED (not needed for Jan 27):**
- ❌ Tax calculator (redundant - already shown in checkout)
- ❌ Commission calculator (redundant - already shown in organizer dashboard)
- ❌ CS ticketing system (deferred to post-launch)

---

## Final Effort Estimates (Option B - Enhanced MVP)

| Phase | Tasks | Estimated Time | Priority |
|-------|-------|---------------|----------|
| Phase 1: Pricing Module | Fix hardcoded pricing, create centralized calculate.ts, add quote API | **4 hours** | 🔥 CRITICAL |
| Phase 2: Seating Integration | Import SeatSelector, wire to checkout, link to bookings | **4 hours** | 🎯 DEMO REQ |
| Phase 3: FAQ Page | Create /events/[slug]/faq page, add FAQ link | **2 hours** | ✅ USER REQ |
| Phase 5: UX Polish | FAQ management UI, loading states, error handling | **2 hours** | ⚡ POLISH |
| **TOTAL** | 4 phases | **12 hours (1.5 days)** | ⭐ **RECOMMENDED** |

## REMOVED FROM SCOPE

### 1. CS Ticketing System (Phase 5 in Original Plan)

**Reason:** Focus on core features for Jan 27 presentation deadline

**Deferred Features:**
- Support ticket database models
- Support ticket API endpoints (create, list, view, reply)
- Support ticket UI pages (new, list, detail)
- Admin dashboard for ticket management

**Alternative for Jan 27 Demo:**
- FAQ page with comprehensive Q&A
- Contact email (mailto:support@gelaran.id) in FAQ CTA
- Post-launch: Implement full CS ticketing system

---

### 2. Tax & Commission Calculators (Phase 4 in Original Plan)

**Reason:** REDUNDANT - functionality already exists!

**What Users Already Have:**
- **Checkout Page:** Real-time pricing breakdown showing subtotal, tax (11%), platform fee (5%), payment gateway fee (2.9%), and total
- **Organizer Dashboard:** Revenue analytics with gross revenue, platform fees, payment fees, and net revenue with percentage breakdowns
- **Booking Confirmation:** Complete itemized receipt with all fees detailed

**Why Standalone Calculators Add No Value:**
- Organizers already see exact fee breakdown in dashboard
- Customers already see exact tax/fee breakdown in checkout
- Calculator would just duplicate existing information
- Saves 4-6 hours of development time

**Verdict:** SKIP and focus on high-impact bugfixes and integrations instead.

---

## Summary: Option B (Enhanced MVP) - RECOMMENDED ⭐

**What We're Building:**
1. ✅ **Phase 1: Pricing Module** (4h) - Fix critical hardcoded pricing bug
2. ✅ **Phase 2: Seating Integration** (4h) - Wire existing SeatSelector to booking flow
3. ✅ **Phase 3: FAQ Page** (2h) - Create dedicated /events/[slug]/faq page
4. ✅ **Phase 5: UX Polish** (2h) - FAQ management, loading states, error handling

**What We're NOT Building:**
- ❌ Tax calculator (redundant)
- ❌ Commission calculator (redundant)
- ❌ CS ticketing system (post-launch)

**Total Effort:** 12 hours = 1.5 working days

**Why This Works:**
- Fixes critical financial bug (pricing)
- Delivers demo requirement (seating by Jan 27)
- Meets user explicit request (FAQ page)
- Adds essential polish for presentation
- Skips redundant features that waste time
- Focuses on integration over new builds

---
