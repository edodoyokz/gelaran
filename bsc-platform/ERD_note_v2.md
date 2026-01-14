# BSC Event Ticketing Platform - Technical Implementation Notes v2.0

> **Version**: 2.0  
> **Reference**: ERD_v2.md, PRD_v2.md  
> **Target Audience**: Backend Developers

---

## 1. Database Design Principles

### 1.1 Primary Keys

Semua tabel menggunakan **UUID v4** sebagai primary key:

```sql
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Example table
CREATE TABLE events (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    -- ...
);
```

**Alasan**:
- Tidak predictable (security: prevent IDOR enumeration)
- Distributed-friendly (no sequence conflict)
- URL-safe

### 1.2 Timestamps

Semua tabel memiliki minimal:

```sql
created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
```

Gunakan **trigger** untuk auto-update `updated_at`:

```sql
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_events_updated_at
    BEFORE UPDATE ON events
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
```

### 1.3 Soft Deletes

Tabel yang mendukung soft delete:

| Table | Column |
|-------|--------|
| users | deleted_at |
| events | deleted_at |
| ticket_types | deleted_at (implicit via is_active) |
| promo_codes | deleted_at (implicit via is_active) |

**Query Pattern**:
```sql
-- Default: exclude deleted
SELECT * FROM events WHERE deleted_at IS NULL;

-- Include deleted (admin audit)
SELECT * FROM events; -- No filter
```

**Prisma Schema**:
```prisma
model Event {
  id        String    @id @default(uuid())
  deletedAt DateTime? @map("deleted_at")
  
  @@map("events")
}
```

---

## 2. Module Implementation Details

### 2.1 User Management

#### Authentication Flow

```
┌─────────────────────────────────────────────────────────────┐
│                     Registration Flow                        │
├─────────────────────────────────────────────────────────────┤
│  1. User submits email + password                           │
│  2. Create user (is_verified = false)                       │
│  3. Generate verification token (UUID, 24h expiry)          │
│  4. Send verification email                                 │
│  5. User clicks link → verify token                         │
│  6. Set is_verified = true, email_verified_at = NOW()       │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│                       Login Flow                            │
├─────────────────────────────────────────────────────────────┤
│  1. User submits email + password                           │
│  2. Verify password hash (bcrypt)                           │
│  3. Check is_verified == true                               │
│  4. Check is_active == true                                 │
│  5. Generate JWT access token (15 min)                      │
│  6. Generate refresh token (7 days, stored in DB)           │
│  7. Return tokens                                           │
└─────────────────────────────────────────────────────────────┘
```

#### JWT Structure

```typescript
// Access Token Payload
interface AccessTokenPayload {
  sub: string;        // user_id
  email: string;
  role: UserRole;
  organizerId?: string; // if role is organizer
  iat: number;
  exp: number;        // 15 minutes
}

// Refresh Token (stored in user_sessions)
interface RefreshToken {
  id: string;
  userId: string;
  tokenHash: string;  // hashed token
  expiresAt: Date;
  deviceInfo: string;
  ipAddress: string;
}
```

#### Password Security

```typescript
const BCRYPT_ROUNDS = 12;

// Hash password
const hash = await bcrypt.hash(password, BCRYPT_ROUNDS);

// Verify password
const isValid = await bcrypt.compare(password, hash);
```

---

### 2.2 Event Management

#### Event Status Machine

```
                    ┌────────────────┐
                    │     DRAFT      │
                    └───────┬────────┘
                            │ submit
                            ▼
                    ┌────────────────┐
              ┌─────│ PENDING_REVIEW │─────┐
              │     └────────────────┘     │
          reject                        approve
              │                            │
              ▼                            ▼
     ┌────────────────┐           ┌────────────────┐
     │     DRAFT      │           │   PUBLISHED    │
     └────────────────┘           └───────┬────────┘
                                          │
                      ┌───────────────────┼───────────────────┐
                      │                   │                   │
                  cancel              auto (time)          manual
                      │                   │                   │
                      ▼                   ▼                   ▼
             ┌────────────────┐  ┌────────────────┐  ┌────────────────┐
             │   CANCELLED    │  │     ENDED      │  │     ENDED      │
             └────────────────┘  └────────────────┘  └────────────────┘
```

#### Scheduled Publishing

```typescript
// Cron job runs every minute
async function checkScheduledEvents() {
  const now = new Date();
  
  await prisma.event.updateMany({
    where: {
      status: 'DRAFT',
      publishAt: { lte: now },
      deletedAt: null,
    },
    data: {
      status: 'PUBLISHED',
      publishAt: null,
    }
  });
}
```

#### Event Auto-End

```typescript
// Cron job runs every hour
async function endPastEvents() {
  const now = new Date();
  
  await prisma.event.updateMany({
    where: {
      status: 'PUBLISHED',
      endDatetime: { lt: now },
      deletedAt: null,
    },
    data: {
      status: 'ENDED',
    }
  });
}
```

---

### 2.3 Ticketing & Seating

#### Ticket Availability Calculation

```sql
-- Available tickets for a ticket type
SELECT 
    tt.id,
    tt.name,
    tt.total_quantity,
    tt.sold_quantity,
    tt.reserved_quantity,
    (tt.total_quantity - tt.sold_quantity - tt.reserved_quantity) AS available
FROM ticket_types tt
WHERE tt.event_id = :event_id
  AND tt.is_active = true
  AND (tt.sale_start_at IS NULL OR tt.sale_start_at <= NOW())
  AND (tt.sale_end_at IS NULL OR tt.sale_end_at > NOW());
```

#### Price Tier Selection

```typescript
async function getCurrentPriceTier(ticketTypeId: string): Promise<TicketPriceTier> {
  const now = new Date();
  
  const tier = await prisma.ticketPriceTier.findFirst({
    where: {
      ticketTypeId,
      isActive: true,
      startAt: { lte: now },
      OR: [
        { endAt: null },
        { endAt: { gt: now } },
      ],
      soldQuantity: { lt: prisma.ticketPriceTier.fields.quantityLimit }
    },
    orderBy: { sortOrder: 'asc' },
  });
  
  if (!tier) {
    // Fall back to base ticket price
    return getBasePrice(ticketTypeId);
  }
  
  return tier;
}
```

---

### 2.4 Seat Locking (Critical for Concurrency)

#### Redis Lock Structure

```typescript
// Key format
const lockKey = `seat_lock:${seatId}`;

// Value structure (JSON)
interface SeatLock {
  sessionId: string;
  userId: string | null;
  lockedAt: number;    // Unix timestamp
  expiresAt: number;   // Unix timestamp
}

// Lock duration
const SEAT_LOCK_TTL_SECONDS = 900; // 15 minutes
```

#### Lock Acquisition

```typescript
async function lockSeat(seatId: string, sessionId: string, userId?: string): Promise<boolean> {
  const lockKey = `seat_lock:${seatId}`;
  const now = Date.now();
  
  const lockValue = JSON.stringify({
    sessionId,
    userId: userId || null,
    lockedAt: now,
    expiresAt: now + (SEAT_LOCK_TTL_SECONDS * 1000),
  });
  
  // SET NX (only if not exists) with TTL
  const result = await redis.set(lockKey, lockValue, 'EX', SEAT_LOCK_TTL_SECONDS, 'NX');
  
  if (result === 'OK') {
    // Also update DB for consistency
    await prisma.seat.update({
      where: { id: seatId },
      data: {
        status: 'LOCKED',
        lockedByUserId: userId,
        lockedUntil: new Date(now + (SEAT_LOCK_TTL_SECONDS * 1000)),
      },
    });
    return true;
  }
  
  return false;
}
```

#### Lock Release

```typescript
async function releaseSeat(seatId: string, sessionId: string): Promise<boolean> {
  const lockKey = `seat_lock:${seatId}`;
  
  // Lua script for atomic check-and-delete
  const script = `
    local current = redis.call('GET', KEYS[1])
    if current then
      local data = cjson.decode(current)
      if data.sessionId == ARGV[1] then
        redis.call('DEL', KEYS[1])
        return 1
      end
    end
    return 0
  `;
  
  const result = await redis.eval(script, 1, lockKey, sessionId);
  
  if (result === 1) {
    await prisma.seat.update({
      where: { id: seatId },
      data: {
        status: 'AVAILABLE',
        lockedByUserId: null,
        lockedUntil: null,
      },
    });
    return true;
  }
  
  return false;
}
```

#### Lock Expiry Cleanup (Cron)

```typescript
// Run every minute
async function cleanupExpiredSeatLocks() {
  const now = new Date();
  
  // Find expired locks in DB
  const expiredSeats = await prisma.seat.findMany({
    where: {
      status: 'LOCKED',
      lockedUntil: { lt: now },
    },
  });
  
  for (const seat of expiredSeats) {
    // Clean Redis
    await redis.del(`seat_lock:${seat.id}`);
    
    // Update DB
    await prisma.seat.update({
      where: { id: seat.id },
      data: {
        status: 'AVAILABLE',
        lockedByUserId: null,
        lockedUntil: null,
      },
    });
  }
}
```

---

### 2.5 Booking & Transactions

#### Booking Flow

```
┌─────────────────────────────────────────────────────────────┐
│                    Checkout Flow                            │
├─────────────────────────────────────────────────────────────┤
│  1. Create Booking (status: PENDING)                        │
│  2. Lock seats (if seating chart)                          │
│  3. Reserve ticket quantities                               │
│  4. Calculate pricing:                                      │
│     - Subtotal (sum of tickets)                            │
│     - Discount (promo code)                                │
│     - Tax (PPN 11%)                                        │
│     - Platform fee (5%)                                    │
│     - Gateway fee (2.9%)                                   │
│     - Total                                                │
│  5. Create Transaction (status: PENDING)                   │
│  6. Call payment gateway                                   │
│  7. Return payment URL/instructions                        │
│  8. Set booking expiry (15 min for card, 24h for VA)       │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│                 Payment Webhook Handler                     │
├─────────────────────────────────────────────────────────────┤
│  ON payment.success:                                        │
│    1. Update transaction status = SUCCESS                   │
│    2. Update booking status = PAID                         │
│    3. Convert reserved → sold quantities                   │
│    4. Convert locked → booked seats                        │
│    5. Generate ticket codes                                │
│    6. Calculate organizer revenue                          │
│    7. Credit organizer wallet                              │
│    8. Send confirmation email                              │
│    9. Queue ticket PDF generation                          │
├─────────────────────────────────────────────────────────────┤
│  ON payment.failed / payment.expired:                       │
│    1. Update transaction status                            │
│    2. Update booking status                                │
│    3. Release reserved quantities                          │
│    4. Release locked seats                                 │
│    5. Send failure notification                            │
└─────────────────────────────────────────────────────────────┘
```

#### Database Transaction Example

```typescript
async function confirmBookingPayment(bookingId: string): Promise<void> {
  await prisma.$transaction(async (tx) => {
    // 1. Get booking with related data
    const booking = await tx.booking.findUnique({
      where: { id: bookingId },
      include: {
        bookedTickets: {
          include: { seat: true, ticketType: true }
        },
        event: true,
      },
    });
    
    if (!booking || booking.status !== 'AWAITING_PAYMENT') {
      throw new Error('Invalid booking state');
    }
    
    // 2. Update booking status
    await tx.booking.update({
      where: { id: bookingId },
      data: {
        status: 'PAID',
        paidAt: new Date(),
      },
    });
    
    // 3. Update ticket quantities
    for (const ticket of booking.bookedTickets) {
      await tx.ticketType.update({
        where: { id: ticket.ticketTypeId },
        data: {
          soldQuantity: { increment: 1 },
          reservedQuantity: { decrement: 1 },
        },
      });
    }
    
    // 4. Update seat statuses
    const seatIds = booking.bookedTickets
      .filter(t => t.seatId)
      .map(t => t.seatId);
    
    if (seatIds.length > 0) {
      await tx.seat.updateMany({
        where: { id: { in: seatIds } },
        data: {
          status: 'BOOKED',
          lockedByUserId: null,
          lockedUntil: null,
        },
      });
    }
    
    // 5. Generate unique ticket codes
    for (const ticket of booking.bookedTickets) {
      await tx.bookedTicket.update({
        where: { id: ticket.id },
        data: {
          uniqueCode: generateTicketCode(),
          status: 'ACTIVE',
        },
      });
    }
    
    // 6. Credit organizer wallet
    await tx.organizerProfile.update({
      where: { userId: booking.event.organizerId },
      data: {
        walletBalance: { increment: booking.organizerRevenue },
        totalEarned: { increment: booking.organizerRevenue },
      },
    });
  });
  
  // 7. Post-transaction: Queue background jobs
  await bookingQueue.add('sendConfirmationEmail', { bookingId });
  await bookingQueue.add('generateTicketPdf', { bookingId });
}
```

#### Booking Code Generation

```typescript
function generateBookingCode(): string {
  const prefix = 'BSC';
  const year = new Date().getFullYear();
  const random = Math.random().toString(36).substring(2, 8).toUpperCase();
  
  return `${prefix}-${year}-${random}`;
  // Example: BSC-2026-A3X7K9
}
```

#### Ticket Code Generation

```typescript
function generateTicketCode(): string {
  // 32-character hex string (secure random)
  return crypto.randomBytes(16).toString('hex').toUpperCase();
  // Example: 7A3F9C2B1E4D8A0F5C6B3E9D2A1F7C4B
}
```

---

### 2.6 Financial Calculations

#### Commission Calculation

```typescript
interface BookingCalculation {
  subtotal: number;        // Sum of ticket prices
  discountAmount: number;  // Promo code discount
  taxAmount: number;       // PPN (11%)
  platformFee: number;     // Platform commission (5%)
  gatewayFee: number;      // Payment gateway fee (2.9%)
  totalAmount: number;     // Customer pays
  organizerRevenue: number; // Organizer receives
  platformRevenue: number;  // Platform keeps
}

function calculateBooking(
  ticketPrices: number[],
  discount: number,
  taxRate: number = 0.11,
  commissionRate: number = 0.05,
  gatewayRate: number = 0.029
): BookingCalculation {
  const subtotal = ticketPrices.reduce((sum, p) => sum + p, 0);
  const discountedSubtotal = subtotal - discount;
  
  // Tax on discounted subtotal
  const taxAmount = Math.round(discountedSubtotal * taxRate);
  
  // Platform fee on discounted subtotal
  const platformFee = Math.round(discountedSubtotal * commissionRate);
  
  // Gateway fee on total (including tax)
  const preGatewayTotal = discountedSubtotal + taxAmount + platformFee;
  const gatewayFee = Math.round(preGatewayTotal * gatewayRate);
  
  const totalAmount = preGatewayTotal + gatewayFee;
  
  // Organizer gets: subtotal - discount - platform fee
  const organizerRevenue = discountedSubtotal - platformFee;
  
  // Platform gets: platform fee
  const platformRevenue = platformFee;
  
  return {
    subtotal,
    discountAmount: discount,
    taxAmount,
    platformFee,
    gatewayFee,
    totalAmount,
    organizerRevenue,
    platformRevenue,
  };
}
```

#### Wallet Balance Tracking

```typescript
// organizer_profiles table
interface WalletUpdate {
  walletBalance: number;    // Current withdrawable
  totalEarned: number;      // Lifetime gross
  totalWithdrawn: number;   // Lifetime payouts
}

// When booking is confirmed:
walletBalance += organizerRevenue;
totalEarned += organizerRevenue;

// When payout is completed:
walletBalance -= payoutAmount;
totalWithdrawn += payoutAmount;

// Invariant:
// walletBalance = totalEarned - totalWithdrawn - pendingPayouts
```

---

### 2.7 Check-in System

#### QR Code Content

```typescript
// QR content: just the unique ticket code
const qrContent = bookedTicket.uniqueCode;
// Example: 7A3F9C2B1E4D8A0F5C6B3E9D2A1F7C4B

// Do NOT include event_id or user info - 
// the code is unique, database lookup handles the rest
```

#### Check-in Validation

```typescript
async function validateTicket(code: string, eventId: string): Promise<CheckInResult> {
  const ticket = await prisma.bookedTicket.findUnique({
    where: { uniqueCode: code },
    include: {
      booking: { include: { event: true } },
      ticketType: true,
      seat: true,
    },
  });
  
  if (!ticket) {
    return { valid: false, reason: 'INVALID_CODE' };
  }
  
  if (ticket.booking.eventId !== eventId) {
    return { valid: false, reason: 'WRONG_EVENT' };
  }
  
  if (ticket.booking.status !== 'PAID' && ticket.booking.status !== 'CONFIRMED') {
    return { valid: false, reason: 'BOOKING_NOT_PAID' };
  }
  
  if (ticket.status === 'CANCELLED' || ticket.status === 'REFUNDED') {
    return { valid: false, reason: 'TICKET_CANCELLED' };
  }
  
  if (ticket.isCheckedIn) {
    return { 
      valid: false, 
      reason: 'ALREADY_CHECKED_IN',
      checkedInAt: ticket.checkedInAt,
    };
  }
  
  return {
    valid: true,
    ticket: {
      id: ticket.id,
      ticketType: ticket.ticketType.name,
      seat: ticket.seat?.seatLabel || 'GA',
      attendeeName: ticket.booking.guestName || 'N/A',
    },
  };
}
```

#### Perform Check-in

```typescript
async function checkInTicket(
  ticketId: string, 
  scannerId: string,
  checkInPointId: string
): Promise<void> {
  await prisma.$transaction([
    prisma.bookedTicket.update({
      where: { id: ticketId },
      data: {
        isCheckedIn: true,
        checkedInAt: new Date(),
        checkedInBy: scannerId,
        checkInPointId: checkInPointId,
      },
    }),
    prisma.checkInLog.create({
      data: {
        bookedTicketId: ticketId,
        scannedBy: scannerId,
        checkInPointId: checkInPointId,
        result: 'SUCCESS',
        scannedAt: new Date(),
      },
    }),
  ]);
}
```

---

### 2.8 Promo Code Validation

```typescript
interface PromoValidationResult {
  valid: boolean;
  reason?: string;
  discount?: number;
}

async function validatePromoCode(
  code: string,
  eventId: string,
  userId: string | null,
  ticketTypeIds: string[],
  subtotal: number
): Promise<PromoValidationResult> {
  const promo = await prisma.promoCode.findUnique({
    where: { code: code.toUpperCase() },
    include: { usages: true },
  });
  
  if (!promo) {
    return { valid: false, reason: 'INVALID_CODE' };
  }
  
  if (!promo.isActive) {
    return { valid: false, reason: 'CODE_INACTIVE' };
  }
  
  // Event scope check
  if (promo.eventId && promo.eventId !== eventId) {
    return { valid: false, reason: 'CODE_NOT_FOR_EVENT' };
  }
  
  // Date validity
  const now = new Date();
  if (promo.validFrom && promo.validFrom > now) {
    return { valid: false, reason: 'CODE_NOT_YET_VALID' };
  }
  if (promo.validUntil && promo.validUntil < now) {
    return { valid: false, reason: 'CODE_EXPIRED' };
  }
  
  // Usage limits
  if (promo.usageLimitTotal && promo.usedCount >= promo.usageLimitTotal) {
    return { valid: false, reason: 'CODE_USAGE_EXHAUSTED' };
  }
  
  if (userId && promo.usageLimitPerUser) {
    const userUsageCount = promo.usages.filter(u => u.userId === userId).length;
    if (userUsageCount >= promo.usageLimitPerUser) {
      return { valid: false, reason: 'CODE_ALREADY_USED' };
    }
  }
  
  // Minimum order
  if (promo.minOrderAmount && subtotal < promo.minOrderAmount) {
    return { valid: false, reason: 'MINIMUM_NOT_MET' };
  }
  
  // Ticket type restrictions
  if (promo.applicableTicketTypes) {
    const applicableTypes = JSON.parse(promo.applicableTicketTypes);
    const hasApplicable = ticketTypeIds.some(id => applicableTypes.includes(id));
    if (!hasApplicable) {
      return { valid: false, reason: 'NOT_APPLICABLE_TO_TICKETS' };
    }
  }
  
  // Calculate discount
  let discount: number;
  if (promo.discountType === 'PERCENTAGE') {
    discount = Math.round(subtotal * (promo.discountValue / 100));
    if (promo.maxDiscountAmount) {
      discount = Math.min(discount, promo.maxDiscountAmount);
    }
  } else {
    discount = promo.discountValue;
  }
  
  return { valid: true, discount };
}
```

---

## 3. Critical Indexes

### 3.1 Performance-Critical Indexes

```sql
-- User lookups
CREATE UNIQUE INDEX idx_users_email ON users(email) WHERE deleted_at IS NULL;
CREATE UNIQUE INDEX idx_users_phone ON users(phone) WHERE phone IS NOT NULL AND deleted_at IS NULL;

-- Event discovery
CREATE INDEX idx_events_category_status ON events(category_id, status) WHERE deleted_at IS NULL;
CREATE INDEX idx_events_organizer ON events(organizer_id) WHERE deleted_at IS NULL;
CREATE INDEX idx_events_start_datetime ON events(start_datetime) WHERE status = 'PUBLISHED' AND deleted_at IS NULL;
CREATE INDEX idx_events_slug ON events(slug);

-- Full-text search on events
CREATE INDEX idx_events_search ON events 
    USING gin(to_tsvector('indonesian', title || ' ' || COALESCE(short_description, '')));

-- Booking lookups
CREATE UNIQUE INDEX idx_bookings_code ON bookings(booking_code);
CREATE INDEX idx_bookings_user ON bookings(user_id) WHERE user_id IS NOT NULL;
CREATE INDEX idx_bookings_event_status ON bookings(event_id, status);
CREATE INDEX idx_bookings_created ON bookings(created_at DESC);

-- Ticket validation (CRITICAL - called on every scan)
CREATE UNIQUE INDEX idx_booked_tickets_code ON booked_tickets(unique_code);
CREATE INDEX idx_booked_tickets_booking ON booked_tickets(booking_id);

-- Seat availability
CREATE INDEX idx_seats_row_status ON seats(row_id, status);
CREATE INDEX idx_seats_lock_expiry ON seats(locked_until) WHERE status = 'LOCKED';

-- Transaction tracking
CREATE INDEX idx_transactions_code ON transactions(transaction_code);
CREATE INDEX idx_transactions_status ON transactions(status) WHERE status IN ('PENDING', 'PROCESSING');

-- Promo codes
CREATE UNIQUE INDEX idx_promo_codes_code ON promo_codes(code);
CREATE INDEX idx_promo_codes_event ON promo_codes(event_id) WHERE event_id IS NOT NULL;
```

### 3.2 Query Optimization Tips

```sql
-- GOOD: Use covering index
SELECT id, unique_code, is_checked_in 
FROM booked_tickets 
WHERE unique_code = :code;

-- BAD: SELECT * forces table lookup
SELECT * FROM booked_tickets WHERE unique_code = :code;

-- GOOD: Limit and offset for pagination
SELECT * FROM events 
WHERE category_id = :cat AND status = 'PUBLISHED' 
ORDER BY start_datetime 
LIMIT 20 OFFSET 0;

-- BAD: No limit
SELECT * FROM events WHERE category_id = :cat;
```

---

## 4. Background Jobs

### 4.1 Job Queue Structure (BullMQ)

```typescript
// Queue definitions
const queues = {
  email: new Queue('email'),
  pdf: new Queue('pdf'),
  cleanup: new Queue('cleanup'),
  notifications: new Queue('notifications'),
};

// Job types
interface EmailJob {
  type: 'booking_confirmation' | 'ticket_delivery' | 'reminder' | 'payout';
  recipientEmail: string;
  data: Record<string, any>;
}

interface PdfJob {
  type: 'ticket';
  bookingId: string;
}

interface CleanupJob {
  type: 'expired_bookings' | 'expired_locks' | 'old_sessions';
}
```

### 4.2 Cron Jobs

| Job | Schedule | Description |
|-----|----------|-------------|
| cleanupExpiredBookings | `*/5 * * * *` | Cancel unpaid bookings |
| cleanupExpiredSeatLocks | `* * * * *` | Release expired seat locks |
| endPastEvents | `0 * * * *` | Auto-end finished events |
| sendEventReminders | `0 * * * *` | 24h/1h before event |
| cleanupOldSessions | `0 3 * * *` | Remove expired refresh tokens |
| generateDailyReports | `0 2 * * *` | Analytics aggregation |

---

## 5. API Rate Limiting

```typescript
// Rate limit configuration
const rateLimits = {
  // Public endpoints
  'GET /events': { window: '1m', max: 100 },
  'GET /events/:id': { window: '1m', max: 200 },
  
  // Auth endpoints (prevent brute force)
  'POST /auth/login': { window: '15m', max: 10 },
  'POST /auth/register': { window: '1h', max: 5 },
  'POST /auth/forgot-password': { window: '1h', max: 3 },
  
  // Booking (prevent abuse)
  'POST /bookings': { window: '1m', max: 10 },
  'POST /bookings/:id/pay': { window: '1m', max: 5 },
  
  // Check-in (high volume needed)
  'POST /check-in': { window: '1s', max: 20 },
  
  // Admin (relaxed)
  'admin/*': { window: '1m', max: 500 },
};
```

---

## 6. Error Handling

### 6.1 Error Codes

```typescript
enum ErrorCode {
  // Auth (1xxx)
  INVALID_CREDENTIALS = 1001,
  EMAIL_NOT_VERIFIED = 1002,
  ACCOUNT_SUSPENDED = 1003,
  TOKEN_EXPIRED = 1004,
  
  // Events (2xxx)
  EVENT_NOT_FOUND = 2001,
  EVENT_NOT_PUBLISHED = 2002,
  EVENT_ENDED = 2003,
  
  // Tickets (3xxx)
  TICKET_NOT_AVAILABLE = 3001,
  TICKET_SOLD_OUT = 3002,
  SEAT_NOT_AVAILABLE = 3003,
  SEAT_LOCKED_BY_OTHER = 3004,
  MAX_TICKETS_EXCEEDED = 3005,
  
  // Booking (4xxx)
  BOOKING_NOT_FOUND = 4001,
  BOOKING_EXPIRED = 4002,
  BOOKING_ALREADY_PAID = 4003,
  INVALID_PROMO_CODE = 4004,
  
  // Payment (5xxx)
  PAYMENT_FAILED = 5001,
  PAYMENT_EXPIRED = 5002,
  REFUND_NOT_ALLOWED = 5003,
  
  // Check-in (6xxx)
  TICKET_INVALID = 6001,
  TICKET_ALREADY_USED = 6002,
  WRONG_EVENT = 6003,
}
```

### 6.2 Error Response Format

```typescript
interface ErrorResponse {
  success: false;
  error: {
    code: number;
    message: string;
    details?: Record<string, any>;
  };
  requestId: string;
  timestamp: string;
}

// Example
{
  "success": false,
  "error": {
    "code": 3004,
    "message": "Seat is currently locked by another user",
    "details": {
      "seatId": "uuid",
      "expiresAt": "2026-01-09T09:30:00Z"
    }
  },
  "requestId": "req_abc123",
  "timestamp": "2026-01-09T09:15:00Z"
}
```

---

## 7. Security Checklist

### 7.1 Authentication & Authorization

- [ ] JWT with short expiry (15 min access, 7 day refresh)
- [ ] Refresh token rotation (invalidate old token on refresh)
- [ ] Password bcrypt with cost factor 12+
- [ ] Rate limiting on auth endpoints
- [ ] Account lockout after failed attempts

### 7.2 Data Protection

- [ ] HTTPS everywhere (HSTS headers)
- [ ] Sensitive data encrypted at rest
- [ ] PII fields masked in logs
- [ ] Database credentials in environment variables
- [ ] API keys encrypted in database

### 7.3 Input Validation

- [ ] Request validation (Zod/Joi schema)
- [ ] SQL injection prevention (parameterized queries)
- [ ] XSS prevention (output encoding, CSP headers)
- [ ] File upload validation (type, size, scan)

### 7.4 Authorization

- [ ] IDOR prevention (ownership checks)
- [ ] Role-based access control
- [ ] Resource-level permissions
- [ ] API scope validation

---

## 8. Monitoring & Observability

### 8.1 Metrics to Track

| Category | Metric |
|----------|--------|
| Business | Bookings/minute, Revenue/hour, Conversion rate |
| Performance | API latency (p50, p95, p99), Database query time |
| Availability | Error rate, Uptime, Health check status |
| Resources | CPU, Memory, Database connections, Queue depth |

### 8.2 Logging Format

```typescript
interface LogEntry {
  timestamp: string;
  level: 'debug' | 'info' | 'warn' | 'error';
  service: string;
  requestId: string;
  userId?: string;
  message: string;
  context?: Record<string, any>;
  error?: {
    name: string;
    message: string;
    stack: string;
  };
}
```

### 8.3 Health Check Endpoint

```typescript
// GET /health
{
  "status": "healthy",
  "version": "1.0.0",
  "uptime": 86400,
  "checks": {
    "database": { "status": "up", "latency": 5 },
    "redis": { "status": "up", "latency": 1 },
    "queue": { "status": "up", "jobs": 12 }
  }
}
```

---

## 9. Deployment Notes

### 9.1 Environment Variables

```bash
# Database
DATABASE_URL=postgresql://user:pass@host:5432/bsc
DATABASE_POOL_SIZE=20

# Redis
REDIS_URL=redis://host:6379
REDIS_PASSWORD=secret

# JWT
JWT_SECRET=super-secret-key-min-32-chars
JWT_ACCESS_EXPIRY=15m
JWT_REFRESH_EXPIRY=7d

# Payment Gateways
MIDTRANS_SERVER_KEY=xxx
MIDTRANS_CLIENT_KEY=xxx
MIDTRANS_IS_PRODUCTION=false

XENDIT_SECRET_KEY=xxx
XENDIT_WEBHOOK_TOKEN=xxx

# Email
SMTP_HOST=smtp.sendgrid.net
SMTP_PORT=587
SMTP_USER=apikey
SMTP_PASS=xxx
EMAIL_FROM=noreply@bsc.id

# Storage
S3_ENDPOINT=https://xxx.r2.cloudflarestorage.com
S3_ACCESS_KEY=xxx
S3_SECRET_KEY=xxx
S3_BUCKET=bsc-uploads

# Monitoring
SENTRY_DSN=https://xxx@sentry.io/xxx
```

### 9.2 Docker Compose (Development)

```yaml
version: '3.8'

services:
  api:
    build: .
    ports:
      - "3000:3000"
    environment:
      - DATABASE_URL=postgresql://postgres:postgres@db:5432/bsc
      - REDIS_URL=redis://redis:6379
    depends_on:
      - db
      - redis

  db:
    image: postgres:15
    volumes:
      - pgdata:/var/lib/postgresql/data
    environment:
      - POSTGRES_PASSWORD=postgres
      - POSTGRES_DB=bsc

  redis:
    image: redis:7-alpine
    volumes:
      - redisdata:/data

volumes:
  pgdata:
  redisdata:
```

---

*Document Version: 2.0*  
*Last Updated: January 2026*  
*Next Review: After Phase 1 Completion*
