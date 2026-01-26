# POS Seat Selection - Implementation Review

**Date:** 2026-01-26  
**Status:** Partially Implemented

---

## ✅ Yang Sudah Selesai

### Backend API

#### 1. `/api/pos/sell/route.ts` ✅
- [x] Accept `seatIds` parameter
- [x] Validate seats belong to event
- [x] Validate seats are available
- [x] Create booked tickets with seat references
- [x] Update seat status to BOOKED
- [x] Handle seat-based vs quantity-based flow

**Code Review:**
```typescript
// Lines 122-174: Seat validation & booking logic
const seatSelection = seatIds && seatIds.length > 0;
if (seatSelection) {
    // ✓ Validates seats
    // ✓ Checks availability
    // ✓ Creates seat details
}
```

### Frontend

#### 2. `components/pos/POSSeatSelector.tsx` ✅
- [x] Component created (320 lines)
- [x] Fetch venue map from `/api/events/{slug}/venue-map`
- [x] Display sections with stats
- [x] Expandable section detail
- [x] Seat grid with status colors
- [x] Click to select/deselect seats
- [x] Visual feedback (checkmark on selected)
- [x] Legend for seat statuses

**Features:**
- Section overview dengan availability stats
- Stage indicator
- Row labels (both sides)
- Accessibility indicator (ring)
- Responsive design

#### 3. `app/pos/page.tsx` ✅
- [x] State management untuk `selectedSeats`
- [x] `handleSeatSelect` dan `handleSeatDeselect` handlers
- [x] Conditional rendering (seat map vs ticket quantity)
- [x] Integration dengan `POSSeatSelector`
- [x] Send `seatIds` ke API saat sell
- [x] Validation untuk seat-based events

**Code Review:**
```typescript
// Lines 92-93: State
const [selectedSeats, setSelectedSeats] = useState<string[]>([]);
const [seatMode, setSeatMode] = useState(false);

// Lines 177-191: Handlers
const handleSeatSelect = (seatId, seat) => { ... } // ✓
const handleSeatDeselect = (seatId) => { ... } // ✓

// Lines 432-438: Conditional UI
{event?.hasSeatingChart ? (
    <POSSeatSelector ... />
) : (
    // Ticket quantity selector
)}

// Lines 242: Send seatIds
seatIds: selectedSeats.length > 0 ? selectedSeats : undefined
```

---

## ❌ Yang Belum Selesai

### 1. `/api/pos/event/route.ts` - Missing Fields ⚠️

**Problem:**
API tidak mengembalikan `hasSeatingChart` dan `slug` yang dibutuhkan POSSeatSelector.

**Current Response:**
```typescript
event: {
    id, title, posterImage, status, venue, schedule, ticketTypes
    // ❌ Missing: hasSeatingChart
    // ❌ Missing: slug
}
```

**Required Fix:**
```typescript
event: {
    // ... existing fields
    hasSeatingChart: event.hasSeatingChart,
    slug: event.slug,
}
```

**Impact:** POSSeatSelector tidak bisa di-render karena `event.slug` undefined.

---

### 2. Real-time Updates - Not Implemented

**From Plan:** Polling setiap 5 detik untuk seat availability

**Current:** 
- POS page polling event data setiap 30 detik (line 137)
- Tapi tidak refresh seat map

**Required:**
```typescript
// In POSSeatSelector.tsx
useEffect(() => {
    if (!eventSlug) return;
    
    const interval = setInterval(() => {
        fetchVenueMap(); // Refresh seat availability
    }, 5000);
    
    return () => clearInterval(interval);
}, [eventSlug]);
```

---

### 3. Optimistic Locking - Not Implemented

**From Plan:** Version check untuk prevent race conditions

**Current:** 
- Basic status check: `if (seat.status !== "AVAILABLE")`
- No version field
- No atomic update with version check

**Required:**
1. Add `version` field to Seat model (migration)
2. Implement optimistic locking in `/api/pos/sell`:
```typescript
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

---

### 4. Enhanced Error Messages - Partially Done

**Current:**
- Generic errors: "One or more seats are not available"
- No specific error codes

**From Plan:**
```typescript
enum SeatError {
    ALREADY_BOOKED = 'ALREADY_BOOKED',
    LOCKED_BY_OTHER = 'LOCKED_BY_OTHER',
    // ...
}
```

**Recommended:** Add specific error handling untuk better UX

---

## Priority Checklist

### High Priority (Blocker)
- [ ] **Fix `/api/pos/event` response** - Add `hasSeatingChart` and `slug`
  - Estimasi: 10 menit
  - Impact: Feature tidak bisa digunakan tanpa ini

### Medium Priority
- [ ] **Add polling untuk seat updates** (5 detik)
  - Estimasi: 30 menit
  - Impact: Prevent kasir memilih seat yang sudah sold

- [ ] **Implement optimistic locking**
  - Estimasi: 2-3 jam (include migration)
  - Impact: Prevent double-booking

### Low Priority
- [ ] **Enhanced error messages**
  - Estimasi: 1 jam
  - Impact: Better UX

- [ ] **Add seat info tooltip** (row, section, price)
  - Estimasi: 30 menit
  - Impact: Better UX

---

## Testing Checklist

- [ ] Test seat selection flow
- [ ] Test payment dengan seats
- [ ] Test auto check-in dengan seats
- [ ] Test concurrent sales (2 kasir pilih seat sama)
- [ ] Test mixed mode (some events with seats, some without)
- [ ] Test error handling (seat sudah sold)

---

## Next Steps

1. **Immediate:** Fix `/api/pos/event` untuk return `hasSeatingChart` dan `slug`
2. **Short-term:** Add polling 5 detik untuk seat updates
3. **Medium-term:** Implement optimistic locking
4. **Testing:** Comprehensive testing dengan multiple POS devices
