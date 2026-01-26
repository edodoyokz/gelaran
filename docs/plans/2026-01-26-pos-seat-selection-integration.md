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

---

## Improvement Roadmap

### 1. Race Condition Handling (Medium Priority)

**Problem:**
- Tidak ada locking mechanism untuk concurrent sales
- Potensi double-booking jika timing tepat

**Solution: Optimistic Locking dengan Version Check**

```typescript
// Di Prisma transaction
const seat = await tx.seat.findUnique({
    where: { id: seatId },
    select: { id: true, status: true, version: true }
});

if (seat.status !== 'AVAILABLE') {
    throw new Error('Seat sudah tidak tersedia');
}

// Atomic update dengan version check
const updated = await tx.seat.updateMany({
    where: { 
        id: seatId, 
        status: 'AVAILABLE',
        version: seat.version  // Optimistic lock
    },
    data: { 
        status: 'BOOKED',
        version: { increment: 1 }
    }
});

if (updated.count === 0) {
    throw new Error('Seat conflict - silakan pilih seat lain');
}
```

**Alternative: Short-term Reservation (30 detik)**
```typescript
// Lock seat saat dipilih
await tx.seat.update({
    where: { id: seatId },
    data: {
        status: 'LOCKED',
        lockedBySession: posSessionId,
        lockedUntil: new Date(Date.now() + 30000)
    }
});
```

### 2. Real-time UI Updates (Low-Medium Priority)

**Problem:**
- Tidak ada real-time update jika seat diambil user lain
- Kasir mungkin memilih seat yang sudah sold

**Solution Options:**

**Option A: Polling (Simple)**
```typescript
// Poll setiap 5 detik
useEffect(() => {
    const interval = setInterval(() => {
        fetchSeatAvailability();
    }, 5000);
    return () => clearInterval(interval);
}, []);
```

**Option B: WebSocket/SSE (Recommended untuk scale)**
```typescript
// Server-Sent Events untuk seat status
const eventSource = new EventSource(`/api/pos/seats/stream?eventId=${eventId}`);
eventSource.onmessage = (event) => {
    const { seatId, newStatus } = JSON.parse(event.data);
    updateSeatStatus(seatId, newStatus);
};
```

**Option C: Supabase Realtime (Easiest dengan current stack)**
```typescript
// Subscribe ke seat changes
supabase
    .channel('seats')
    .on('postgres_changes', {
        event: 'UPDATE',
        schema: 'public',
        table: 'seats',
        filter: `event_id=eq.${eventId}`
    }, handleSeatChange)
    .subscribe();
```

### 3. Enhanced Error Handling (Low Priority)

**Problem:**
- Error messages generic untuk seat conflicts
- UX kurang baik saat terjadi conflict

**Solution: Specific Error Messages + Visual Feedback**

```typescript
// Error types
enum SeatError {
    ALREADY_BOOKED = 'ALREADY_BOOKED',
    LOCKED_BY_OTHER = 'LOCKED_BY_OTHER',
    NOT_FOUND = 'NOT_FOUND',
    WRONG_EVENT = 'WRONG_EVENT'
}

// Error response dengan detail
return errorResponse({
    code: SeatError.ALREADY_BOOKED,
    message: 'Seat ini sudah dibeli oleh customer lain',
    seatId: conflictingSeatId,
    suggestion: 'Silakan refresh dan pilih seat lain'
});
```

**Frontend UX:**
```tsx
// Visual feedback saat conflict
{conflictSeats.map(seatId => (
    <SeatIcon 
        key={seatId}
        className="animate-pulse bg-red-500" 
        tooltip="Seat ini sudah tidak tersedia"
    />
))}
```

---

## Priority Matrix

| Improvement | Priority | Effort | Impact |
|-------------|----------|--------|--------|
| Optimistic Locking | Medium | 2-3h | High |
| Polling (5s) | Low-Med | 1h | Medium |
| WebSocket/Realtime | Low | 4-5h | Medium |
| Better Error Messages | Low | 1-2h | Low-Med |

**Rekomendasi:**
1. Implement Optimistic Locking di Phase 1 (wajib)
2. Implement Polling 5s di Phase 2 (simple, effective)
3. Better error messages bisa ditambah kapan saja
4. WebSocket bisa jadi future enhancement
