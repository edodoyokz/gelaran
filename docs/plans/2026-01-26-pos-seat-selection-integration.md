# POS Seat Selection Integration Plan

**Date:** 2026-01-26  
**Status:** Draft  
**Priority:** High

---

## Overview

Menambahkan kemampuan pemilihan seat di POS (Point of Sale) untuk event dengan seating chart (`hasSeatingChart = true`). Saat ini POS hanya mendukung pemilihan quantity tiket tanpa memilih seat spesifik.

---

## Current State

### POS Flow (Existing)
1. Staff login dengan PIN → device token
2. Tampil daftar ticket types dengan quantity selector (+/-)
3. Input data pembeli (nama, phone, email)
4. Proses pembayaran via Midtrans Snap atau gratis
5. Generate tiket dengan unique code

### Limitations
- Tidak bisa memilih seat spesifik
- Event dengan `hasSeatingChart = true` tidak bisa dijual di POS dengan benar
- Seat yang terjual dari POS tidak ter-track

---

## Proposed Solution

### Backend Changes

#### 1. Update `/api/pos/sell/route.ts`

**Current:**
```typescript
const { tickets, buyerName, buyerPhone, buyerEmail, autoCheckIn } = body;
```

**Proposed:**
```typescript
const { tickets, seatIds, buyerName, buyerPhone, buyerEmail, autoCheckIn } = body;

// If seatIds provided, use seat-based booking flow
if (seatIds && seatIds.length > 0) {
    // Validate seats belong to event
    // Validate seats are available
    // Create booked tickets with seat references
    // Update seat status to BOOKED
}
```

#### 2. Update `/api/pos/event/route.ts`

Add to response:
```typescript
{
    event: {
        // existing fields...
        hasSeatingChart: boolean,
        venueLayout: VenueLayoutData | null
    }
}
```

### Frontend Changes

#### 1. Update `app/pos/page.tsx`

**New State:**
```typescript
const [selectedSeats, setSelectedSeats] = useState<string[]>([]);
const [seatMode, setSeatMode] = useState(false); // true if event has seating chart
```

**Conditional Rendering:**
```tsx
{event.hasSeatingChart ? (
    <POSSeatSelector 
        eventId={event.id}
        onSeatsSelected={setSelectedSeats}
        deviceToken={deviceToken}
    />
) : (
    // Existing ticket quantity selector
    <TicketQuantitySelector ... />
)}
```

#### 2. New Component: `components/pos/POSSeatSelector.tsx`

- Render simplified venue map untuk POS
- Quick select seats by tap
- Show seat info (row, number, price)
- Responsive untuk tablet/mobile

---

## Implementation Phases

### Phase 1: Backend API (Est. 2-3 hours)
- [ ] Update `/api/pos/sell` untuk handle `seatIds`
- [ ] Update `/api/pos/event` return `hasSeatingChart` + layout
- [ ] Add seat validation logic

### Phase 2: Frontend POS (Est. 4-5 hours)
- [ ] Create `POSSeatSelector` component
- [ ] Update `app/pos/page.tsx` with conditional logic
- [ ] Integrate seat selection with sell flow
- [ ] Handle mixed mode (some ticket types with seats, some without)

### Phase 3: Testing (Est. 2 hours)
- [ ] Test seat selection flow
- [ ] Test payment integration
- [ ] Test auto check-in with seats
- [ ] Test concurrent sales

---

## Key Decisions

### 1. Seat Locking Strategy

**Option A: No Locking (Recommended for POS)**
- Kasir langsung pilih dan jual
- Konfirmasi ketersediaan secara visual
- Simpler implementation

**Option B: Short Lock (30 seconds)**
- Lock saat mulai proses pembayaran
- Release jika pembayaran gagal/batal
- More complex, may not be necessary for on-site

### 2. UI Approach

**Option A: Tab-based**
```
[Ticket Types] | [Seat Map]
```

**Option B: Integrated (Recommended)**
- Seat map shows ticket type colors
- Tap seat → auto-select ticket type

---

## Files to Modify

| File | Change Type | Description |
|------|-------------|-------------|
| `app/api/pos/sell/route.ts` | Modify | Add seatIds handling |
| `app/api/pos/event/route.ts` | Modify | Return venue layout |
| `app/pos/page.tsx` | Modify | Add conditional seat UI |
| `components/pos/POSSeatSelector.tsx` | New | Seat selection for POS |

---

## Dependencies

- Existing `VenueMapViewer` component dapat di-reuse atau di-adapt
- Prisma schema sudah support `Seat` model
- Midtrans integration tetap sama

---

## Estimated Total Effort

| Phase | Hours |
|-------|-------|
| Backend API | 2-3 |
| Frontend POS | 4-5 |
| Testing | 2 |
| **Total** | **8-10** |

---

## Open Questions

1. Apakah perlu seat locking untuk POS?
2. Apakah POS perlu support partial seat selection (beberapa tiket pilih seat, beberapa tidak)?
3. UI preference: tab-based atau integrated?
