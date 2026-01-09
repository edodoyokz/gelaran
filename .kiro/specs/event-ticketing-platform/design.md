# Design Document: BSC Event Ticketing Platform

## Overview

BSC adalah platform multi-vendor event ticketing yang dibangun dengan arsitektur modern menggunakan Node.js (NestJS) untuk backend, Next.js untuk frontend, dan PostgreSQL sebagai database utama. Platform ini dirancang untuk menangani high-concurrency ticket sales dengan fitur seating chart interaktif, multi-payment gateway, dan real-time check-in system.

### Key Design Principles

1. **Scalability**: Horizontal scaling untuk API servers, caching layer dengan Redis
2. **Data Integrity**: Database transactions untuk booking, optimistic locking untuk seat selection
3. **Security**: JWT authentication, role-based access control, encrypted sensitive data
4. **Performance**: Sub-2-second page loads, <500ms QR scan validation
5. **Reliability**: 99.9% uptime, graceful degradation, offline-capable scanning

## Architecture

### High-Level Architecture

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                              CLIENT LAYER                                    │
├─────────────────┬─────────────────┬─────────────────┬──────────────────────┤
│   Next.js Web   │   Mobile PWA    │  Scanner App    │   Admin Dashboard    │
│   (SSR/SSG)     │   (React)       │  (React)        │   (React)            │
└────────┬────────┴────────┬────────┴────────┬────────┴──────────┬───────────┘
         │                 │                 │                   │
         └─────────────────┴─────────────────┴───────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                              API GATEWAY                                     │
│                         (Rate Limiting, Auth)                                │
└─────────────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                           BACKEND SERVICES                                   │
├─────────────────┬─────────────────┬─────────────────┬──────────────────────┤
│   Auth Service  │  Event Service  │ Booking Service │  Payment Service     │
├─────────────────┼─────────────────┼─────────────────┼──────────────────────┤
│   User Service  │  Ticket Service │ Scanner Service │  Notification Svc    │
├─────────────────┼─────────────────┼─────────────────┼──────────────────────┤
│  Payout Service │ Analytics Svc   │  Review Service │  Promo Service       │
└────────┬────────┴────────┬────────┴────────┬────────┴──────────┬───────────┘
         │                 │                 │                   │
         └─────────────────┴─────────────────┴───────────────────┘
                                    │
         ┌──────────────────────────┼──────────────────────────┐
         ▼                          ▼                          ▼
┌─────────────────┐      ┌─────────────────┐      ┌─────────────────┐
│   PostgreSQL    │      │     Redis       │      │   File Storage  │
│   (Primary DB)  │      │  (Cache/Queue)  │      │   (S3/MinIO)    │
└─────────────────┘      └─────────────────┘      └─────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                         EXTERNAL SERVICES                                    │
├─────────────────┬─────────────────┬─────────────────┬──────────────────────┤
│    Midtrans     │   Google Maps   │     Twilio      │   Email (SMTP)       │
│  (Payment GW)   │   (Location)    │     (SMS)       │   (SendGrid)         │
└─────────────────┴─────────────────┴─────────────────┴──────────────────────┘
```

### Technology Stack

| Layer | Technology | Purpose |
|-------|------------|---------|
| Frontend | Next.js 14 (App Router) | SSR/SSG for SEO, React components |
| Backend | NestJS | Enterprise-grade Node.js framework |
| Database | PostgreSQL 15 | Relational DB with JSONB support |
| Cache | Redis 7 | Session, seat locks, rate limiting |
| ORM | Prisma | Type-safe database access |
| Auth | JWT + Passport.js | Stateless authentication |
| File Storage | MinIO/S3 | Event images, PDF tickets |
| Queue | BullMQ (Redis) | Background jobs, notifications |
| Search | PostgreSQL Full-Text | Event search (upgrade to Elasticsearch later) |

## Components and Interfaces

### 1. Authentication Module

```typescript
interface AuthService {
  register(dto: RegisterDto): Promise<User>;
  login(dto: LoginDto): Promise<AuthTokens>;
  refreshToken(refreshToken: string): Promise<AuthTokens>;
  forgotPassword(email: string): Promise<void>;
  resetPassword(token: string, newPassword: string): Promise<void>;
  verifyEmail(token: string): Promise<void>;
  oauthLogin(provider: 'google' | 'facebook', token: string): Promise<AuthTokens>;
}

interface AuthTokens {
  accessToken: string;  // JWT, expires in 24h
  refreshToken: string; // UUID, expires in 7d
}

interface RegisterDto {
  email: string;
  password: string;
  name: string;
  role: 'customer' | 'organizer';
}
```

### 2. Event Management Module

```typescript
interface EventService {
  create(organizerId: string, dto: CreateEventDto): Promise<Event>;
  update(eventId: string, dto: UpdateEventDto): Promise<Event>;
  publish(eventId: string): Promise<Event>;
  getById(eventId: string): Promise<EventDetail>;
  search(filters: EventSearchFilters): Promise<PaginatedResult<EventSummary>>;
  getByOrganizer(organizerId: string): Promise<Event[]>;
  updateStatus(eventId: string, status: EventStatus): Promise<Event>;
}

interface CreateEventDto {
  title: string;
  description: string;
  category: EventCategory;
  eventType: 'online' | 'offline' | 'hybrid';
  startDatetime: Date;
  endDatetime: Date;
  locationAddress?: string;
  locationCoordinates?: { lat: number; lng: number };
  onlineUrl?: string;
  posterImage?: File;
  hasSeatingChart: boolean;
  isPrivate: boolean;
  password?: string;
}

interface EventSearchFilters {
  query?: string;
  category?: EventCategory;
  dateFrom?: Date;
  dateTo?: Date;
  location?: string;
  radius?: number; // km
  priceMin?: number;
  priceMax?: number;
  eventType?: 'online' | 'offline' | 'hybrid';
  page: number;
  limit: number;
  sortBy: 'date' | 'relevance' | 'popularity';
}
```

### 3. Ticket Management Module

```typescript
interface TicketService {
  createTicketType(eventId: string, dto: CreateTicketTypeDto): Promise<TicketType>;
  updateTicketType(ticketTypeId: string, dto: UpdateTicketTypeDto): Promise<TicketType>;
  getAvailability(eventId: string): Promise<TicketAvailability[]>;
  reserveTickets(dto: ReserveTicketsDto): Promise<Reservation>;
  releaseReservation(reservationId: string): Promise<void>;
}

interface CreateTicketTypeDto {
  name: string;
  description?: string;
  price: number;
  quantity: number;
  saleStartDate: Date;
  saleEndDate: Date;
  minPerOrder: number;
  maxPerOrder: number;
  isEarlyBird: boolean;
  earlyBirdEndDate?: Date;
  earlyBirdPrice?: number;
}

interface TicketAvailability {
  ticketTypeId: string;
  name: string;
  price: number;
  available: number;
  total: number;
  status: 'available' | 'sold_out' | 'not_on_sale';
}
```

### 4. Seating Chart Module

```typescript
interface SeatingService {
  createSeatingChart(eventId: string, dto: CreateSeatingChartDto): Promise<SeatingChart>;
  addRow(chartId: string, dto: AddRowDto): Promise<SeatRow>;
  addSeats(rowId: string, dto: AddSeatsDto): Promise<Seat[]>;
  getChartWithAvailability(eventId: string): Promise<SeatingChartView>;
  lockSeat(seatId: string, sessionId: string): Promise<SeatLock>;
  unlockSeat(seatId: string, sessionId: string): Promise<void>;
  bookSeats(seatIds: string[], bookingId: string): Promise<void>;
}

interface SeatingChartView {
  eventId: string;
  rows: SeatRowView[];
}

interface SeatRowView {
  id: string;
  label: string;
  orderIndex: number;
  seats: SeatView[];
}

interface SeatView {
  id: string;
  seatNumber: string;
  ticketTypeId: string;
  ticketTypeName: string;
  price: number;
  status: 'available' | 'locked' | 'booked';
  lockedUntil?: Date;
}

interface SeatLock {
  seatId: string;
  sessionId: string;
  expiresAt: Date; // 10 minutes from lock time
}
```

### 5. Booking Module

```typescript
interface BookingService {
  createBooking(dto: CreateBookingDto): Promise<Booking>;
  getBooking(bookingId: string): Promise<BookingDetail>;
  getByUser(userId: string): Promise<Booking[]>;
  getByEvent(eventId: string): Promise<Booking[]>;
  cancelBooking(bookingId: string): Promise<void>;
  processPaymentCallback(payload: PaymentCallback): Promise<void>;
}

interface CreateBookingDto {
  userId?: string; // null for guest checkout
  guestEmail?: string;
  guestName?: string;
  eventId: string;
  items: BookingItem[];
  promoCode?: string;
}

interface BookingItem {
  ticketTypeId: string;
  quantity: number;
  seatIds?: string[]; // for seated events
}

interface BookingDetail {
  id: string;
  bookingCode: string;
  event: EventSummary;
  user?: UserSummary;
  guestEmail?: string;
  items: BookedTicketDetail[];
  subtotal: number;
  discount: number;
  taxAmount: number;
  adminCommission: number;
  organizerNetIncome: number;
  totalAmount: number;
  status: BookingStatus;
  transaction?: Transaction;
  createdAt: Date;
}
```

### 6. Payment Module

```typescript
interface PaymentService {
  createTransaction(bookingId: string): Promise<PaymentIntent>;
  handleWebhook(payload: MidtransWebhook): Promise<void>;
  processRefund(transactionId: string, amount: number): Promise<Refund>;
  getTransactionStatus(transactionId: string): Promise<TransactionStatus>;
}

interface PaymentIntent {
  transactionId: string;
  paymentUrl: string; // Midtrans Snap URL
  expiresAt: Date;
}

interface MidtransWebhook {
  transaction_id: string;
  order_id: string;
  transaction_status: 'capture' | 'settlement' | 'pending' | 'deny' | 'cancel' | 'expire' | 'refund';
  payment_type: string;
  gross_amount: string;
  signature_key: string;
}
```

### 7. Scanner Module

```typescript
interface ScannerService {
  validateTicket(uniqueCode: string, eventId: string): Promise<ScanResult>;
  checkIn(ticketId: string, scannerId: string): Promise<CheckInResult>;
  getEventStats(eventId: string): Promise<CheckInStats>;
  syncOfflineCheckIns(checkIns: OfflineCheckIn[]): Promise<SyncResult>;
}

interface ScanResult {
  status: 'valid' | 'already_used' | 'invalid' | 'wrong_event';
  ticket?: {
    id: string;
    eventName: string;
    ticketType: string;
    seatNumber?: string;
    attendeeName: string;
    isCheckedIn: boolean;
    checkedInAt?: Date;
  };
  message: string;
}

interface CheckInStats {
  eventId: string;
  totalTickets: number;
  checkedIn: number;
  remaining: number;
  checkInRate: number;
  lastCheckInAt?: Date;
}
```

### 8. Financial Module

```typescript
interface FinancialService {
  getOrganizerWallet(organizerId: string): Promise<WalletSummary>;
  getTransactionHistory(organizerId: string, filters: TransactionFilters): Promise<PaginatedResult<WalletTransaction>>;
  requestPayout(organizerId: string, amount: number): Promise<Payout>;
  processPayout(payoutId: string, adminId: string): Promise<Payout>;
  getPayoutHistory(organizerId: string): Promise<Payout[]>;
}

interface WalletSummary {
  organizerId: string;
  balance: number;
  pendingPayouts: number;
  totalEarnings: number;
  totalPayouts: number;
}

interface WalletTransaction {
  id: string;
  type: 'credit' | 'debit';
  amount: number;
  description: string;
  bookingId?: string;
  payoutId?: string;
  createdAt: Date;
}
```

## Data Models

### Entity Relationship Diagram (Enhanced)

```mermaid
erDiagram
    USERS ||--o| ORGANIZER_PROFILES : "has profile"
    USERS ||--o{ EVENTS : "organizes"
    USERS ||--o{ BOOKINGS : "makes"
    USERS ||--o{ REVIEWS : "writes"
    USERS ||--o{ REFRESH_TOKENS : "has"
    
    EVENTS ||--o{ TICKET_TYPES : "has"
    EVENTS ||--o{ SEATING_CHARTS : "has"
    EVENTS ||--o{ BOOKINGS : "generates"
    EVENTS ||--o{ REVIEWS : "receives"
    EVENTS }o--|| EVENT_CATEGORIES : "belongs to"
    
    SEATING_CHARTS ||--o{ SEAT_ROWS : "contains"
    SEAT_ROWS ||--o{ SEATS : "contains"
    SEATS }o--|| TICKET_TYPES : "priced by"
    SEATS |o--o| BOOKED_TICKETS : "assigned to"
    
    TICKET_TYPES ||--o{ BOOKED_TICKETS : "instantiated as"
    
    BOOKINGS ||--o{ BOOKED_TICKETS : "contains"
    BOOKINGS ||--o| TRANSACTIONS : "paid by"
    BOOKINGS }o--o| PROMO_CODES : "uses"
    
    ORGANIZER_PROFILES ||--o{ PAYOUTS : "requests"
    ORGANIZER_PROFILES ||--o{ WALLET_TRANSACTIONS : "has"
    
    PLATFORM_SETTINGS ||--o{ COMMISSION_OVERRIDES : "has"
    COMMISSION_OVERRIDES }o--|| ORGANIZER_PROFILES : "applies to"

    USERS {
        uuid id PK
        string email UK
        string password_hash
        string name
        enum role "admin, organizer, customer, scanner"
        boolean is_active
        boolean email_verified
        string avatar_url
        timestamp last_login_at
        timestamp created_at
        timestamp updated_at
    }

    REFRESH_TOKENS {
        uuid id PK
        uuid user_id FK
        string token UK
        timestamp expires_at
        timestamp created_at
    }

    ORGANIZER_PROFILES {
        uuid id PK
        uuid user_id FK UK
        string organization_name
        text description
        string logo_url
        string phone
        string bank_name
        string bank_account_number
        string bank_account_holder
        decimal wallet_balance "DEFAULT 0"
        boolean is_verified
        timestamp created_at
        timestamp updated_at
    }

    EVENT_CATEGORIES {
        uuid id PK
        string name UK
        string slug UK
        string icon
        int sort_order
    }

    EVENTS {
        uuid id PK
        uuid organizer_id FK
        uuid category_id FK
        string title
        string slug UK
        text description
        string poster_image_url
        json gallery_images "array of URLs"
        string video_url
        enum event_type "online, offline, hybrid"
        timestamp start_datetime
        timestamp end_datetime
        string location_address
        decimal location_lat
        decimal location_lng
        string online_url
        boolean has_seating_chart
        boolean is_private
        string password_hash
        enum status "draft, pending, published, cancelled, ended"
        boolean is_recurring
        json recurring_config
        timestamp created_at
        timestamp updated_at
        timestamp deleted_at
    }

    TICKET_TYPES {
        uuid id PK
        uuid event_id FK
        string name
        text description
        decimal price
        int quantity
        int sold_quantity "DEFAULT 0"
        timestamp sale_start_date
        timestamp sale_end_date
        int min_per_order "DEFAULT 1"
        int max_per_order "DEFAULT 10"
        boolean is_early_bird
        timestamp early_bird_end_date
        decimal early_bird_price
        int sort_order
        timestamp created_at
        timestamp updated_at
    }

    SEATING_CHARTS {
        uuid id PK
        uuid event_id FK UK
        string name
        json background_image
        int width
        int height
        timestamp created_at
        timestamp updated_at
    }

    SEAT_ROWS {
        uuid id PK
        uuid seating_chart_id FK
        string label
        int order_index
        int position_y
        timestamp created_at
    }

    SEATS {
        uuid id PK
        uuid row_id FK
        uuid ticket_type_id FK
        string seat_number
        int position_x
        enum status "available, locked, booked"
        uuid locked_by_session
        timestamp locked_until
        timestamp created_at
        timestamp updated_at
    }

    BOOKINGS {
        uuid id PK
        uuid user_id FK "nullable for guest"
        uuid event_id FK
        string booking_code UK
        string guest_email
        string guest_name
        decimal subtotal
        decimal discount_amount
        decimal tax_amount
        decimal admin_commission
        decimal organizer_net_income
        decimal total_amount
        uuid promo_code_id FK
        enum status "pending, paid, cancelled, refunded"
        timestamp expires_at
        timestamp created_at
        timestamp updated_at
    }

    BOOKED_TICKETS {
        uuid id PK
        uuid booking_id FK
        uuid ticket_type_id FK
        uuid seat_id FK "nullable"
        string unique_code UK
        string attendee_name
        string attendee_email
        boolean is_checked_in "DEFAULT false"
        timestamp checked_in_at
        uuid checked_in_by FK
        timestamp created_at
    }

    TRANSACTIONS {
        uuid id PK
        uuid booking_id FK UK
        string external_id UK "Midtrans order_id"
        string payment_type
        decimal amount
        enum status "pending, paid, failed, expired, refunded"
        json gateway_response
        timestamp paid_at
        timestamp created_at
        timestamp updated_at
    }

    PROMO_CODES {
        uuid id PK
        uuid organizer_id FK "nullable for platform-wide"
        uuid event_id FK "nullable for organizer-wide"
        string code UK
        enum discount_type "percentage, fixed"
        decimal discount_value
        decimal max_discount "for percentage type"
        int usage_limit
        int used_count "DEFAULT 0"
        timestamp valid_from
        timestamp valid_until
        boolean is_active "DEFAULT true"
        timestamp created_at
    }

    REVIEWS {
        uuid id PK
        uuid user_id FK
        uuid event_id FK
        uuid booking_id FK
        int rating "1-5"
        text content
        text organizer_reply
        timestamp replied_at
        timestamp created_at
        timestamp updated_at
    }

    PAYOUTS {
        uuid id PK
        uuid organizer_id FK
        decimal amount
        string bank_name
        string bank_account_number
        string bank_account_holder
        enum status "pending, processing, completed, failed"
        string reference_number
        uuid processed_by FK
        timestamp processed_at
        text notes
        timestamp created_at
        timestamp updated_at
    }

    WALLET_TRANSACTIONS {
        uuid id PK
        uuid organizer_id FK
        enum type "credit, debit"
        decimal amount
        decimal balance_after
        string description
        uuid booking_id FK
        uuid payout_id FK
        timestamp created_at
    }

    PLATFORM_SETTINGS {
        uuid id PK
        string key UK
        json value
        timestamp updated_at
    }

    COMMISSION_OVERRIDES {
        uuid id PK
        uuid organizer_id FK UK
        decimal commission_rate
        timestamp created_at
        timestamp updated_at
    }

    NOTIFICATIONS {
        uuid id PK
        uuid user_id FK
        string title
        text content
        enum type "email, push, sms"
        boolean is_read "DEFAULT false"
        json metadata
        timestamp sent_at
        timestamp read_at
        timestamp created_at
    }

    AUDIT_LOGS {
        uuid id PK
        uuid user_id FK
        string action
        string entity_type
        uuid entity_id
        json old_values
        json new_values
        string ip_address
        string user_agent
        timestamp created_at
    }
```

### Database Indexes

```sql
-- Performance indexes
CREATE INDEX idx_events_organizer_status ON events(organizer_id, status);
CREATE INDEX idx_events_category_status ON events(category_id, status);
CREATE INDEX idx_events_start_datetime ON events(start_datetime) WHERE status = 'published';
CREATE INDEX idx_events_location ON events USING GIST (
  ll_to_earth(location_lat, location_lng)
) WHERE location_lat IS NOT NULL;

CREATE INDEX idx_ticket_types_event ON ticket_types(event_id);
CREATE INDEX idx_seats_row ON seats(row_id);
CREATE INDEX idx_seats_status ON seats(status) WHERE status != 'booked';

CREATE INDEX idx_bookings_user ON bookings(user_id);
CREATE INDEX idx_bookings_event_status ON bookings(event_id, status);
CREATE INDEX idx_bookings_code ON bookings(booking_code);

CREATE INDEX idx_booked_tickets_booking ON booked_tickets(booking_id);
CREATE INDEX idx_booked_tickets_unique_code ON booked_tickets(unique_code);
CREATE INDEX idx_booked_tickets_checkin ON booked_tickets(is_checked_in) 
  WHERE is_checked_in = false;

CREATE INDEX idx_transactions_external ON transactions(external_id);
CREATE INDEX idx_transactions_status ON transactions(status);

-- Full-text search
CREATE INDEX idx_events_search ON events USING GIN (
  to_tsvector('indonesian', title || ' ' || COALESCE(description, ''))
);
```


## Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system—essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*


### Property 1: User Registration Role Assignment

*For any* valid registration request with role 'customer' or 'organizer', the created user SHALL have the correct role assigned, and organizer accounts SHALL have is_active set to false pending approval.

**Validates: Requirements 1.1, 1.2**

### Property 2: Authentication Token Validity

*For any* successful login with valid credentials, the generated JWT access token SHALL have an expiry time of exactly 24 hours from creation, and the refresh token SHALL be stored with 7-day expiry.

**Validates: Requirements 1.4, 1.8**

### Property 3: Account Lockout After Failed Attempts

*For any* user account, after exactly 5 consecutive failed login attempts, the account SHALL be locked and subsequent valid credentials SHALL be rejected until the 15-minute lockout period expires.

**Validates: Requirements 1.5**

### Property 4: Password Reset Token Generation

*For any* password reset request for an existing email, a unique reset token SHALL be generated with expiry time between 1-24 hours, and the token SHALL be invalidated after single use.

**Validates: Requirements 1.6**

### Property 5: Bank Account Encryption

*For any* organizer profile with bank account details, the bank_account_number field SHALL be encrypted before storage, and decryption SHALL return the original value (round-trip property).

**Validates: Requirements 2.2**

### Property 6: Profile Validation

*For any* organizer profile update with incomplete banking information (missing bank_name, bank_account_number, or bank_account_holder), the update SHALL be rejected with validation errors.

**Validates: Requirements 2.5**

### Property 7: Event Required Fields Validation

*For any* event creation request missing title, description, category, start_datetime, end_datetime, or location (for offline events), the creation SHALL be rejected with specific field validation errors.

**Validates: Requirements 3.1**

### Property 8: Event Type Support

*For any* event creation with event_type set to 'online', 'offline', or 'hybrid', the event SHALL be created successfully with the correct type stored.

**Validates: Requirements 3.2**

### Property 9: Event Status Transitions

*For any* event, only the following status transitions SHALL be allowed: draft→published, draft→cancelled, published→ended, published→cancelled. All other transitions SHALL be rejected.

**Validates: Requirements 3.6**

### Property 10: Event Publication Validation

*For any* event in draft status, publishing SHALL only succeed if all required fields are complete; incomplete events SHALL remain in draft status.

**Validates: Requirements 3.7**

### Property 11: Private Event Access Control

*For any* private event with password protection, access to event details SHALL only be granted when the correct password is provided.

**Validates: Requirements 3.10**

### Property 12: Ticket Type Required Fields

*For any* ticket type creation missing name, price, quantity, sale_start_date, or sale_end_date, the creation SHALL be rejected.

**Validates: Requirements 4.1**

### Property 13: Free Ticket Support

*For any* ticket type with price set to 0, the ticket type SHALL be created successfully and marked as free.

**Validates: Requirements 4.2**

### Property 14: Ticket Availability Calculation

*For any* ticket type, the available count SHALL equal (quantity - sold_quantity), and when sold_quantity equals quantity OR current time exceeds sale_end_date, the status SHALL be 'sold_out'.

**Validates: Requirements 4.4, 4.5, 4.6**

### Property 15: Early Bird Pricing

*For any* ticket type with is_early_bird=true, the effective price SHALL be early_bird_price when current time is before early_bird_end_date, and price when current time is after.

**Validates: Requirements 4.7**

### Property 16: Ticket Quantity Constraint

*For any* ticket type update attempting to set quantity below sold_quantity, the update SHALL be rejected.

**Validates: Requirements 4.9**

### Property 17: Seat Row Creation

*For any* seat row creation with label and order_index, the row SHALL be created with the specified values and seats can be added to it.

**Validates: Requirements 5.2**

### Property 18: Automatic Seat Number Generation

*For any* seats added to a row with label 'X', the seat numbers SHALL be automatically generated in format 'X-1', 'X-2', etc., in sequential order.

**Validates: Requirements 5.3**

### Property 19: Seat-Ticket Type Association

*For any* seat linked to a ticket_type_id, the seat's price SHALL be determined by the associated ticket type's price.

**Validates: Requirements 5.4**

### Property 20: Seat Lock Lifecycle

*For any* seat selection, the seat SHALL be locked for exactly 10 minutes. If booking is not completed within this time, the seat SHALL automatically return to 'available' status. Upon booking completion, the seat SHALL transition to 'booked' status.

**Validates: Requirements 5.6, 5.7, 5.8**

### Property 21: Concurrent Seat Selection Prevention

*For any* two concurrent seat selection requests for the same seat, exactly one SHALL succeed and one SHALL fail, preventing double booking.

**Validates: Requirements 5.10, 20.2**

### Property 22: Search Filter Accuracy

*For any* event search with filters (category, date range, location, price range, event_type), all returned events SHALL match ALL specified filter criteria.

**Validates: Requirements 6.2**

### Property 23: Location-Based Search

*For any* location-based search with a radius, all returned events SHALL have location coordinates within the specified radius from the search point.

**Validates: Requirements 6.3**

### Property 24: Search Result Completeness

*For any* event in search results, the response SHALL include: id, title, poster_image_url, start_datetime, location_address, and minimum ticket price.

**Validates: Requirements 6.4**

### Property 25: Search Result Sorting

*For any* search with sort_by parameter, results SHALL be ordered correctly: 'date' by start_datetime ascending, 'popularity' by total bookings descending.

**Validates: Requirements 6.5**

### Property 26: Low Availability Indicator

*For any* ticket type where available count is less than 20% of total quantity, the availability status SHALL include 'selling_fast' indicator.

**Validates: Requirements 6.8**

### Property 27: Cart Item Creation

*For any* ticket selection, the cart item SHALL contain ticket_type_id, quantity, unit_price, and seat_ids (if applicable).

**Validates: Requirements 7.1**

### Property 28: Price Breakdown Calculation

*For any* booking, the price breakdown SHALL satisfy: total_amount = subtotal - discount_amount + tax_amount, where tax_amount = (subtotal - discount_amount) * tax_rate.

**Validates: Requirements 7.2**

### Property 29: Reservation Expiry

*For any* checkout initiation, a reservation SHALL be created with expires_at set to exactly 15 minutes from creation. When expires_at passes without payment, all reserved tickets and seats SHALL be released.

**Validates: Requirements 7.3, 7.4**

### Property 30: Guest Checkout Support

*For any* booking created without user_id but with guest_email and guest_name, the booking SHALL be created successfully.

**Validates: Requirements 7.5**

### Property 31: Booking Code Uniqueness

*For any* confirmed booking, the booking_code SHALL be unique across all bookings in the system.

**Validates: Requirements 7.6**

### Property 32: Financial Calculation Integrity

*For any* booking, the following SHALL hold: organizer_net_income = total_amount - tax_amount - admin_commission, and admin_commission = (subtotal - discount_amount) * commission_rate.

**Validates: Requirements 7.7, 11.1**

### Property 33: QR Code Uniqueness

*For any* booked ticket, the unique_code (QR content) SHALL be unique across all booked tickets in the system.

**Validates: Requirements 7.8**

### Property 34: Payment Transaction Creation

*For any* payment initiation, a transaction record SHALL be created with status 'pending' and external_id from payment gateway.

**Validates: Requirements 8.3**

### Property 35: Payment Status Transitions

*For any* transaction, only valid status transitions SHALL be allowed: pending→paid, pending→failed, pending→expired, paid→refunded. The booking status SHALL update accordingly.

**Validates: Requirements 8.4, 8.5**

### Property 36: Payment Expiry

*For any* transaction in 'pending' status for more than 24 hours, the status SHALL transition to 'expired' and associated inventory SHALL be released.

**Validates: Requirements 8.6**

### Property 37: Refund Wallet Reversal

*For any* refund processed, the organizer's wallet_balance SHALL be decreased by the organizer_net_income amount from the original booking.

**Validates: Requirements 8.7**

### Property 38: Ticket Content Completeness

*For any* generated ticket PDF, the content SHALL include: event title, start_datetime, location_address (or online_url), seat_number (if applicable), unique_code as QR, and booking_code.

**Validates: Requirements 9.2**

### Property 39: QR Code Round-Trip

*For any* booked ticket, encoding the unique_code into QR format and then decoding SHALL return the exact original unique_code value.

**Validates: Requirements 9.5**

### Property 40: Check-in Validation

*For any* QR scan, if unique_code exists and is_checked_in=false, result SHALL be 'valid' and is_checked_in SHALL be set to true with checked_in_at timestamp. If is_checked_in=true, result SHALL be 'already_used' with original checked_in_at. If unique_code doesn't exist, result SHALL be 'invalid'.

**Validates: Requirements 10.2, 10.4, 10.5**

### Property 41: Check-in Statistics Accuracy

*For any* event, check-in statistics SHALL satisfy: total_tickets = count of booked_tickets for event, checked_in = count where is_checked_in=true, remaining = total_tickets - checked_in.

**Validates: Requirements 10.8**

### Property 42: Wallet Balance Management

*For any* paid booking, wallet_balance SHALL increase by organizer_net_income. For any processed payout, wallet_balance SHALL decrease by payout amount. Payout requests exceeding wallet_balance SHALL be rejected.

**Validates: Requirements 11.2, 11.6, 11.7**

### Property 43: Minimum Payout Validation

*For any* payout request with amount less than configured minimum_payout_amount, the request SHALL be rejected.

**Validates: Requirements 11.4**

### Property 44: Commission Rate Override

*For any* booking calculation, if organizer has commission_override set, that rate SHALL be used; otherwise global commission_rate SHALL be used.

**Validates: Requirements 12.2, 12.3**

### Property 45: Commission Rate Non-Retroactivity

*For any* commission rate update, existing bookings SHALL retain their original admin_commission values; only new bookings SHALL use the updated rate.

**Validates: Requirements 12.6**

### Property 46: User Filtering

*For any* user list query with filters (role, is_active, date range), all returned users SHALL match ALL specified filter criteria.

**Validates: Requirements 13.1**

### Property 47: Session Invalidation on Ban

*For any* user ban action, all refresh_tokens for that user SHALL be deleted, and subsequent requests with those tokens SHALL be rejected.

**Validates: Requirements 13.4**

### Property 48: Review Eligibility

*For any* review submission, the user SHALL have at least one booked_ticket for the event with is_checked_in=true; otherwise the submission SHALL be rejected.

**Validates: Requirements 14.1, 14.6**

### Property 49: Rating Validation

*For any* review, the rating value SHALL be between 1 and 5 inclusive; values outside this range SHALL be rejected.

**Validates: Requirements 14.2**

### Property 50: Single Review Per Event

*For any* user-event combination, only one review SHALL be allowed; duplicate review submissions SHALL be rejected.

**Validates: Requirements 14.5**

### Property 51: Average Rating Calculation

*For any* event with reviews, the displayed average_rating SHALL equal the arithmetic mean of all review ratings, rounded to one decimal place.

**Validates: Requirements 14.4**

### Property 52: Event Cancellation Workflow

*For any* event cancellation, all ticket holders SHALL receive notification, and all paid bookings SHALL be marked for refund processing.

**Validates: Requirements 15.5**

### Property 53: Promo Code Application

*For any* valid promo code (within validity period, under usage limit, matching scope), the discount SHALL be calculated correctly: percentage type = subtotal * (discount_value/100) capped at max_discount, fixed type = discount_value. Invalid codes SHALL be rejected with specific reason.

**Validates: Requirements 16.3, 16.4, 16.5**

### Property 54: Promo Code Usage Tracking

*For any* successful promo code application, used_count SHALL increment by 1, and when used_count equals usage_limit, subsequent applications SHALL be rejected.

**Validates: Requirements 16.4**

### Property 55: Dashboard Statistics Accuracy

*For any* organizer dashboard, total_sales SHALL equal sum of all paid booking total_amounts, total_revenue SHALL equal sum of organizer_net_income, and check_in_rate SHALL equal (checked_in / total_tickets) * 100.

**Validates: Requirements 17.1**

### Property 56: Password Hashing

*For any* user password, the stored password_hash SHALL be a bcrypt hash with cost factor >= 12, and verifying the original password against the hash SHALL return true.

**Validates: Requirements 19.2**

### Property 57: Input Sanitization

*For any* user input containing potential XSS or SQL injection patterns, the sanitized output SHALL not contain executable scripts or SQL commands.

**Validates: Requirements 19.4**

### Property 58: Rate Limiting

*For any* authentication endpoint, more than 10 requests from the same IP within 1 minute SHALL result in rate limit rejection (HTTP 429).

**Validates: Requirements 19.5**

### Property 59: Audit Log Creation

*For any* security-relevant action (login, logout, password change, role change, data access), an audit log entry SHALL be created with user_id, action, timestamp, and IP address.

**Validates: Requirements 19.6**

### Property 60: Database Retry Logic

*For any* transient database failure, the operation SHALL be retried up to 3 times with exponential backoff (1s, 2s, 4s) before returning error.

**Validates: Requirements 20.7**

## Error Handling

### Error Response Format

All API errors follow a consistent format:

```typescript
interface ErrorResponse {
  statusCode: number;
  error: string;
  message: string;
  details?: ValidationError[];
  timestamp: string;
  path: string;
  requestId: string;
}

interface ValidationError {
  field: string;
  message: string;
  value?: any;
}
```

### Error Categories

| Category | HTTP Status | Description |
|----------|-------------|-------------|
| Validation | 400 | Invalid input data |
| Authentication | 401 | Missing or invalid credentials |
| Authorization | 403 | Insufficient permissions |
| Not Found | 404 | Resource doesn't exist |
| Conflict | 409 | Resource state conflict (e.g., seat already booked) |
| Rate Limit | 429 | Too many requests |
| Server Error | 500 | Internal server error |

### Critical Error Scenarios

1. **Double Booking Prevention**
   - Use database transactions with row-level locking
   - Return 409 Conflict if seat/ticket already taken
   - Log incident for monitoring

2. **Payment Failures**
   - Release reserved inventory immediately
   - Store failure reason from gateway
   - Notify user with retry option

3. **Concurrent Seat Selection**
   - Use Redis distributed locks for seat locking
   - Return 409 if seat locked by another session
   - Auto-release locks on session timeout

4. **Webhook Processing Failures**
   - Implement idempotency using transaction_id
   - Queue failed webhooks for retry
   - Alert on repeated failures

## Testing Strategy

### Dual Testing Approach

This platform requires both unit tests and property-based tests for comprehensive coverage:

1. **Unit Tests**: Verify specific examples, edge cases, and integration points
2. **Property-Based Tests**: Verify universal properties across all valid inputs

### Property-Based Testing Configuration

- **Framework**: fast-check (TypeScript)
- **Minimum Iterations**: 100 per property test
- **Tag Format**: `Feature: event-ticketing-platform, Property {number}: {property_text}`

### Test Categories

| Category | Type | Coverage |
|----------|------|----------|
| Financial Calculations | Property | Properties 28, 32, 42, 44, 53 |
| Data Integrity | Property | Properties 5, 31, 33, 39 |
| State Transitions | Property | Properties 9, 20, 35 |
| Concurrency | Property | Properties 21 |
| Validation | Property | Properties 6, 7, 12, 16, 49 |
| Access Control | Property | Properties 11, 47, 48 |
| Search & Filter | Property | Properties 22, 23, 25, 46 |
| Statistics | Property | Properties 41, 51, 55 |

### Critical Test Scenarios

1. **Ticket Purchase Flow**
   - Unit: Complete purchase with valid data
   - Property: Financial calculations are always correct
   - Property: QR codes are always unique

2. **Seating Chart**
   - Unit: Seat selection and booking
   - Property: No double booking under concurrency
   - Property: Lock expiry releases seats

3. **Payment Processing**
   - Unit: Webhook handling for each status
   - Property: Status transitions are valid
   - Property: Refunds reverse wallet correctly

4. **Check-in System**
   - Unit: Valid/invalid/used ticket scenarios
   - Property: Statistics are always accurate
   - Property: Check-in is idempotent

### Test Data Generators

```typescript
// Example generators for property tests
const userGenerator = fc.record({
  email: fc.emailAddress(),
  name: fc.string({ minLength: 1, maxLength: 100 }),
  role: fc.constantFrom('customer', 'organizer'),
  password: fc.string({ minLength: 8, maxLength: 72 })
});

const ticketTypeGenerator = fc.record({
  name: fc.string({ minLength: 1, maxLength: 50 }),
  price: fc.integer({ min: 0, max: 100000000 }),
  quantity: fc.integer({ min: 1, max: 10000 }),
  soldQuantity: fc.integer({ min: 0 })
}).filter(t => t.soldQuantity <= t.quantity);

const bookingGenerator = fc.record({
  subtotal: fc.integer({ min: 0, max: 1000000000 }),
  discountAmount: fc.integer({ min: 0 }),
  taxRate: fc.double({ min: 0, max: 0.5 }),
  commissionRate: fc.double({ min: 0, max: 0.5 })
}).filter(b => b.discountAmount <= b.subtotal);
```
