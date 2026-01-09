# Product Requirements Document (PRD): BSC Event Ticketing Platform

---

| Atribut | Deskripsi |
|---------|-----------|
| **Versi Dokumen** | 2.0 |
| **Status** | Draft |
| **Tipe Produk** | Multi-Vendor Event Ticketing System |
| **Target Launch** | Beta (Januari 2026) |
| **Reference Platforms** | Eventmie Pro FullyLoaded, Eventbrite, Loket.com |

---

## 1. Ringkasan Eksekutif (Executive Summary)

BSC adalah platform manajemen acara dan penjualan tiket berbasis web yang memungkinkan **Multi-Organizer** untuk:

- Membuat dan mengelola berbagai jenis event (offline, online, hybrid, recurring)
- Menjual tiket dengan berbagai tier harga dan sistem kursi interaktif
- Mengelola check-in dengan QR scanner real-time
- Melacak pendapatan dan melakukan penarikan dana

**Platform Owner (Admin)** mendapatkan keuntungan melalui:
- Komisi per tiket yang terjual (configurable)
- Platform fee per transaksi
- Featured event placement fees

### Target Market
- **Primary**: Indonesia (IDR, local payment gateways)
- **Secondary**: Southeast Asia expansion ready

---

## 2. User Personas (Aktor)

### 2.1 Super Admin (Platform Owner)

**Deskripsi**: Pemilik platform yang mengelola seluruh sistem.

**Responsibilities**:
- Manajemen pengguna (ban, verifikasi, assign roles)
- Moderasi event (approve/reject)
- Konfigurasi komisi dan fee
- Manajemen payment gateway
- Payout processing ke organizer
- Content management (blog, pages)
- Melihat analytics platform-wide

**Permissions**: Full access ke semua modul

---

### 2.2 Organizer (Penyelenggara Event)

**Deskripsi**: Pengguna yang mendaftar untuk membuat dan menjual tiket event.

**Responsibilities**:
- Membuat dan mengelola event
- Setup tiket dan harga
- Membuat seating chart (optional)
- Melihat daftar booking dan attendee
- Melakukan check-in tiket
- Melihat laporan penjualan
- Request payout ke rekening bank
- Mengelola tim (scanner, manager)

**Sub-roles (Team Members)**:
| Role | Access |
|------|--------|
| Manager | Full access ke event organizer |
| Scanner | Check-in only |
| Finance | View bookings & payouts |

---

### 2.3 Customer (Pembeli Tiket)

**Deskripsi**: End-user yang membeli tiket event.

**Responsibilities**:
- Browse dan search event
- Membeli tiket (dengan/tanpa login)
- Menyimpan event ke wishlist
- Melihat dan download tiket
- Transfer tiket ke orang lain
- Menulis review setelah event
- Follow organizer untuk notifikasi

---

### 2.4 Scanner/Doorman

**Deskripsi**: Staff yang memindai tiket di lokasi event.

**Responsibilities**:
- Login ke scanner web/app
- Scan QR code tiket
- Verifikasi kevalidan tiket
- Undo check-in jika perlu

**Access**: Per-event assignment, check-in only

---

## 3. Functional Requirements (Feature Modules)

---

### Module 1: Authentication & User Management

#### FR-1.1: Registration & Login

| Feature | Description | Priority |
|---------|-------------|----------|
| Email registration | Register with email + password | P0 |
| Phone registration | Register with phone number | P1 |
| Social login | Google, Facebook, Apple Sign-In | P1 |
| Email verification | OTP/link verification required | P0 |
| Forgot password | Reset via email link | P0 |
| Two-factor auth (2FA) | Optional TOTP/SMS | P2 |

#### FR-1.2: Profile Management

| Feature | Description | Priority |
|---------|-------------|----------|
| Edit profile | Name, avatar, contact info | P0 |
| Change password | Current + new password | P0 |
| Notification preferences | Email, push, WhatsApp toggles | P1 |
| Account deletion | GDPR-compliant account removal | P1 |

#### FR-1.3: Organizer Onboarding

| Feature | Description | Priority |
|---------|-------------|----------|
| Become organizer | Form to apply as organizer | P0 |
| KYC verification | Upload ID, tax documents | P1 |
| Bank account setup | Add payout bank account | P0 |
| Organization profile | Logo, banner, bio, social links | P0 |

---

### Module 2: Event Management

#### FR-2.1: Event Creation Wizard

Step-by-step event creation:

| Step | Fields | Priority |
|------|--------|----------|
| 1. Basic Info | Title, category, tags, short description | P0 |
| 2. Details | Full description (rich text), FAQs | P0 |
| 3. Media | Poster, banner, gallery, trailer video | P0 |
| 4. Location & Time | Venue/online, date/time, timezone | P0 |
| 5. Tickets | Ticket types, pricing, quotas | P0 |
| 6. Seating (optional) | Section, rows, seats | P1 |
| 7. Settings | Visibility, terms, refund policy | P0 |
| 8. Publish | Preview, schedule, or publish | P0 |

#### FR-2.2: Event Types

| Type | Description | Features |
|------|-------------|----------|
| **Offline** | Physical venue | Map integration, venue info |
| **Online** | Virtual/streaming | Meeting URL, password, auto-reveal |
| **Hybrid** | Both options | Separate ticket types |

#### FR-2.3: Recurring Events

| Feature | Description | Priority |
|---------|-------------|----------|
| Daily repeat | Every X days | P1 |
| Weekly repeat | Specific days (Mon, Wed, Fri) | P1 |
| Monthly repeat | Day of month | P1 |
| Exception dates | Skip specific dates | P1 |
| End conditions | End date or max occurrences | P1 |

#### FR-2.4: Multi-Session Events

| Feature | Description | Priority |
|---------|-------------|----------|
| Schedule builder | Add multiple sessions/days | P1 |
| Per-session tickets | Different tickets per session | P1 |
| Session speakers | Assign performers/speakers | P2 |

#### FR-2.5: Performers & Sponsors

| Feature | Description | Priority |
|---------|-------------|----------|
| Performer profiles | Name, bio, photo, links | P2 |
| Sponsor profiles | Logo, tier (platinum, gold, etc.) | P2 |
| Assign to events | Multiple performers/sponsors | P2 |

#### FR-2.6: Event Visibility

| Mode | Description |
|------|-------------|
| Public | Listed on browse/search |
| Private | Direct link only |
| Password protected | Requires access code |

---

### Module 3: Ticketing System

#### FR-3.1: Ticket Types

| Feature | Description | Priority |
|---------|-------------|----------|
| Multiple types | VIP, Regular, Early Bird, etc. | P0 |
| Per-type settings | Description, quantity, min/max per order | P0 |
| Free tickets | $0 tickets for RSVP | P0 |
| Hidden tickets | Unlisted, code-access only | P1 |
| Group tickets | X tickets per unit | P2 |

#### FR-3.2: Pricing Tiers

| Feature | Description | Priority |
|---------|-------------|----------|
| Time-based tiers | Early bird, regular, late | P1 |
| Quantity-based tiers | First 100 cheaper | P1 |
| Price display | Show original vs. current | P1 |

#### FR-3.3: Promo Codes

| Feature | Description | Priority |
|---------|-------------|----------|
| Percentage discount | X% off | P0 |
| Fixed discount | Rp X off | P0 |
| Max discount cap | Cap for percentage | P0 |
| Usage limits | Total + per user | P0 |
| Ticket restrictions | Apply to specific tickets | P1 |
| Date validity | Valid from/until | P0 |
| Auto-apply codes | URL parameter codes | P1 |

#### FR-3.4: Seating Chart System (FullyLoaded Feature)

| Feature | Description | Priority |
|---------|-------------|----------|
| Section builder | Create zones (VIP, Balcony) | P1 |
| Row builder | Add rows with labels (A, B, C) | P1 |
| Seat builder | Generate seats per row | P1 |
| Visual seat map | Interactive SVG/Canvas map | P1 |
| Price by zone | Different zones = different prices | P1 |
| Seat status | Available, locked, booked, blocked | P1 |
| Wheelchair accessible | Mark accessible seats | P2 |
| Seat locking | 10-15 min lock during checkout | P0 |

#### FR-3.5: Waitlist

| Feature | Description | Priority |
|---------|-------------|----------|
| Join waitlist | When sold out, collect email | P1 |
| Auto-notify | Email when tickets available | P1 |
| Priority queue | FIFO notification order | P1 |
| Expiry | Limited time to purchase | P1 |

---

### Module 4: Booking & Checkout

#### FR-4.1: Checkout Flow

```
1. Select Event
   └─> 2. Select Date/Session (if multi-session)
       └─> 3. Select Tickets (quantity)
           └─> 4. Select Seats (if seating chart)
               └─> 5. Fill Attendee Info (if required)
                   └─> 6. Apply Promo Code
                       └─> 7. Review Order
                           └─> 8. Payment
                               └─> 9. Confirmation + Ticket Delivery
```

#### FR-4.2: Checkout Features

| Feature | Description | Priority |
|---------|-------------|----------|
| Guest checkout | Buy without account | P1 |
| Timer/countdown | 15 min to complete payment | P0 |
| Order summary | Itemized breakdown | P0 |
| Tax display | Inclusive/exclusive tax | P0 |
| Platform fee | Service fee breakdown | P0 |
| Multiple payment methods | Cards, e-wallet, VA | P0 |

#### FR-4.3: Attendee Information

| Feature | Description | Priority |
|---------|-------------|----------|
| Per-ticket info | Collect name/email per ticket | P1 |
| Custom questions | Organizer-defined fields | P1 |
| Field types | Text, select, checkbox, date | P1 |
| Required/optional | Per-field validation | P1 |

#### FR-4.4: Order Management (Customer)

| Feature | Description | Priority |
|---------|-------------|----------|
| View orders | List of past bookings | P0 |
| Download tickets | PDF with QR code | P0 |
| View QR in-app | Mobile-friendly QR display | P0 |
| Email tickets | Resend ticket email | P0 |
| Cancel order | Self-service (if policy allows) | P1 |
| Request refund | Submit refund request | P1 |

---

### Module 5: Payment Processing

#### FR-5.1: Payment Gateways

| Gateway | Region | Methods | Priority |
|---------|--------|---------|----------|
| Midtrans | Indonesia | Credit card, VA, GoPay, QRIS | P0 |
| Xendit | Indonesia | Credit card, VA, OVO, Dana | P0 |
| Stripe | Global | Credit card, Apple Pay, Google Pay | P2 |

#### FR-5.2: Payment Methods

| Method | Description | Priority |
|--------|-------------|----------|
| Credit/debit card | 3DS secure | P0 |
| Bank transfer | Virtual account (BCA, Mandiri, BNI, BRI) | P0 |
| E-wallet | GoPay, OVO, Dana, ShopeePay | P0 |
| QRIS | Universal QR | P0 |
| Retail | Alfamart, Indomaret | P1 |

#### FR-5.3: Payment Flow

| State | Description | Timeout |
|-------|-------------|---------|
| Pending | Order created, awaiting payment | 15 min (card), 24h (VA) |
| Processing | Payment being verified | - |
| Paid | Payment confirmed | - |
| Expired | Payment not received | - |
| Failed | Payment failed | - |

#### FR-5.4: Webhook Handling

| Event | Action |
|-------|--------|
| payment.success | Confirm booking, generate tickets, send email |
| payment.failed | Mark as failed, release seats |
| payment.expired | Mark as expired, release seats |
| refund.success | Update refund status |

---

### Module 6: Ticket Delivery & Check-in

#### FR-6.1: Ticket Generation

| Feature | Description | Priority |
|---------|-------------|----------|
| PDF ticket | Professional design with event info | P0 |
| QR code | Unique per ticket, scannable | P0 |
| E-ticket email | Auto-send after payment | P0 |
| Ticket number | Sequential per event | P0 |
| Barcode fallback | 1D barcode option | P2 |

#### FR-6.2: Ticket Transfer

| Feature | Description | Priority |
|---------|-------------|----------|
| Initiate transfer | Enter recipient email | P1 |
| Recipient notification | Email with accept link | P1 |
| Accept transfer | Claim to recipient account | P1 |
| New QR generation | Old code invalidated | P1 |
| Transfer history | Audit trail | P1 |

#### FR-6.3: Check-in System

| Feature | Description | Priority |
|---------|-------------|----------|
| Web scanner | Browser-based QR scanner | P0 |
| Mobile scanner | PWA or native app | P1 |
| Check-in points | Multiple gates per event | P1 |
| Real-time sync | Instant status update | P0 |
| Undo check-in | Reverse accidental scans | P0 |
| Offline mode | Queue scans when offline | P2 |

#### FR-6.4: Scanner Features

| Feature | Description | Priority |
|---------|-------------|----------|
| Scan result display | Valid/invalid/already used | P0 |
| Ticket details | Show attendee name, ticket type | P0 |
| Audio feedback | Success/error sounds | P0 |
| Scan history | Recent scans list | P1 |
| Stats dashboard | Total scanned/remaining | P1 |

---

### Module 7: Financial Management

#### FR-7.1: Commission Structure

| Feature | Description | Priority |
|---------|-------------|----------|
| Global commission | Default % for all | P0 |
| Per-organizer commission | Custom % for specific org | P1 |
| Per-event commission | Override at event level | P2 |
| Fixed + percentage | Base fee + percentage | P1 |

**Commission Calculation**:
```
ticket_price = Rp 100,000
platform_fee = 5%
payment_gateway_fee = 2.9%
tax = 11% (PPN)

total_to_customer = ticket_price + tax + platform_fee + gateway_fee
organizer_revenue = ticket_price - platform_fee
platform_revenue = platform_fee
```

#### FR-7.2: Organizer Wallet

| Feature | Description | Priority |
|---------|-------------|----------|
| Balance display | Current withdrawable balance | P0 |
| Transaction history | Credits and debits | P0 |
| Pending balance | From recent sales (hold period) | P1 |
| Lifetime stats | Total earned, total withdrawn | P0 |

#### FR-7.3: Payout System

| Feature | Description | Priority |
|---------|-------------|----------|
| Request payout | Submit withdrawal request | P0 |
| Minimum amount | Minimum Rp 100,000 | P0 |
| Bank account selection | Choose from saved accounts | P0 |
| Approval workflow | Admin reviews and approves | P0 |
| Payout tracking | Status: pending, processing, completed | P0 |
| Transfer proof | Upload receipt/screenshot | P1 |
| Auto payout | Scheduled weekly/monthly (optional) | P2 |

#### FR-7.4: Refund Management

| Feature | Description | Priority |
|---------|-------------|----------|
| Refund request | Customer initiates | P1 |
| Refund policy check | Validate against event policy | P1 |
| Partial refund | Percentage or fixed amount | P1 |
| Refund approval | Admin/organizer approval | P1 |
| Refund to original | Return to original payment | P1 |
| Wallet refund | Credit to customer wallet | P2 |
| Refund fee | Optional deduction | P1 |

---

### Module 8: Admin Panel

#### FR-8.1: Dashboard

| Widget | Description | Priority |
|--------|-------------|----------|
| Today's sales | Revenue + tickets sold | P0 |
| Active events | Currently live events | P0 |
| Recent bookings | Last 10 orders | P0 |
| Top organizers | By revenue | P1 |
| Revenue chart | Daily/weekly/monthly | P0 |
| User growth | New registrations | P1 |

#### FR-8.2: User Management

| Feature | Description | Priority |
|---------|-------------|----------|
| User list | Search, filter, sort | P0 |
| User detail | View profile, orders, events | P0 |
| Ban/unban | Suspend user access | P0 |
| Role assignment | Change user role | P0 |
| Impersonate | Login as user (for support) | P2 |
| KYC verification | Approve/reject organizer KYC | P1 |

#### FR-8.3: Event Moderation

| Feature | Description | Priority |
|---------|-------------|----------|
| Pending events | Review queue | P0 |
| Approve/reject | With feedback message | P0 |
| Feature event | Promote to homepage | P1 |
| Force cancel | Cancel with notification | P1 |
| Edit any event | Override content | P1 |

#### FR-8.4: Booking Management

| Feature | Description | Priority |
|---------|-------------|----------|
| All bookings | Platform-wide list | P0 |
| Booking detail | Full order information | P0 |
| Manual confirmation | Confirm payment manually | P1 |
| Admin refund | Initiate refund | P0 |
| Resend tickets | Resend confirmation email | P0 |

#### FR-8.5: Payout Management

| Feature | Description | Priority |
|---------|-------------|----------|
| Payout requests | Queue of pending requests | P0 |
| Approve/reject | With notes | P0 |
| Mark as completed | After manual transfer | P0 |
| Batch payout | Process multiple at once | P2 |
| Payout history | Full audit trail | P0 |

#### FR-8.6: Settings

| Category | Settings | Priority |
|----------|----------|----------|
| General | Site name, logo, contact | P0 |
| Commission | Default rates, tiers | P0 |
| Payment | Gateway credentials, methods | P0 |
| Tax | Tax rates, display options | P0 |
| Email | SMTP config, sender info | P0 |
| SEO | Meta tags, analytics codes | P1 |
| Feature flags | Enable/disable features | P1 |

---

### Module 9: Organizer Panel

#### FR-9.1: Dashboard

| Widget | Description | Priority |
|--------|-------------|----------|
| Revenue summary | Today, week, month | P0 |
| Tickets sold | Total + by event | P0 |
| Active events | Currently selling | P0 |
| Recent orders | Last 10 bookings | P0 |
| Check-in stats | For ongoing events | P1 |
| Revenue chart | Time series | P0 |

#### FR-9.2: Event Management

| Feature | Description | Priority |
|---------|-------------|----------|
| My events | List with status filter | P0 |
| Create event | Wizard (see FR-2.1) | P0 |
| Edit event | Update published events | P0 |
| Duplicate event | Clone for new dates | P1 |
| Cancel event | With attendee notification | P1 |
| Event analytics | Views, conversions, sales | P1 |

#### FR-9.3: Attendee Management

| Feature | Description | Priority |
|---------|-------------|----------|
| Attendee list | Per-event attendees | P0 |
| Export attendees | CSV/Excel download | P0 |
| Attendee search | By name, email, ticket | P0 |
| Attendee detail | Order + ticket info | P0 |
| Manual check-in | Mark as checked-in | P0 |
| Resend ticket | Email individual ticket | P0 |

#### FR-9.4: Team Management

| Feature | Description | Priority |
|---------|-------------|----------|
| Invite member | Send invitation email | P1 |
| Assign role | Manager, scanner, finance | P1 |
| Remove member | Revoke access | P1 |
| Activity log | Team member actions | P2 |

#### FR-9.5: Financial

| Feature | Description | Priority |
|---------|-------------|----------|
| Wallet balance | Current + pending | P0 |
| Transaction history | All credits/debits | P0 |
| Request payout | Withdrawal form | P0 |
| Payout history | Past payouts | P0 |
| Bank accounts | Manage payout accounts | P0 |
| Tax documents | Download statements | P2 |

---

### Module 10: Customer Frontend

#### FR-10.1: Homepage

| Section | Description | Priority |
|---------|-------------|----------|
| Hero banner | Featured events carousel | P0 |
| Search bar | Quick search | P0 |
| Category browse | Category cards | P0 |
| Featured events | Admin-curated | P0 |
| Upcoming events | Chronological | P0 |
| Popular events | By sales/views | P1 |
| Events near me | Location-based | P1 |
| Organizer spotlight | Featured organizers | P2 |

#### FR-10.2: Event Discovery

| Feature | Description | Priority |
|---------|-------------|----------|
| Search | Full-text search | P0 |
| Category filter | By category/subcategory | P0 |
| Date filter | Today, weekend, next week, custom | P0 |
| Location filter | City, radius | P1 |
| Price filter | Free, paid, range | P0 |
| Event type | Online, offline, hybrid | P0 |
| Sort options | Date, popularity, price | P0 |

#### FR-10.3: Event Page

| Section | Description | Priority |
|---------|-------------|----------|
| Hero image | Poster/banner | P0 |
| Title & summary | Event name, date, location | P0 |
| Ticket selection | Types + quantities | P0 |
| Seating map | Interactive (if applicable) | P1 |
| Description | Full rich text | P0 |
| Schedule | Sessions/agenda | P1 |
| Performers | Lineup/speakers | P2 |
| Location map | Google Maps embed | P0 |
| FAQs | Expandable Q&A | P1 |
| Reviews | Past attendee reviews | P1 |
| Share buttons | Social sharing | P0 |
| Organizer info | Profile + follow button | P0 |
| Similar events | Recommendations | P2 |

#### FR-10.4: Customer Account

| Feature | Description | Priority |
|---------|-------------|----------|
| My tickets | Active tickets with QR | P0 |
| Order history | Past purchases | P0 |
| Wishlist | Saved events | P1 |
| Following | Followed organizers | P1 |
| Profile settings | Edit profile | P0 |
| Notifications | In-app notifications | P1 |

---

### Module 11: Notifications & Communications

#### FR-11.1: Transactional Emails

| Email | Trigger | Priority |
|-------|---------|----------|
| Welcome | User registration | P0 |
| Email verification | After registration | P0 |
| Password reset | Forgot password request | P0 |
| Booking confirmation | Payment success | P0 |
| Ticket delivery | With PDF attachment | P0 |
| Payment reminder | Pending payment | P0 |
| Payment failed | Transaction failed | P0 |
| Event reminder | 24h, 1h before event | P1 |
| Event cancelled | Organizer cancels | P0 |
| Refund confirmation | Refund processed | P1 |
| Payout confirmation | Payout completed | P0 |

#### FR-11.2: Push Notifications

| Notification | Trigger | Priority |
|--------------|---------|----------|
| Event reminder | Upcoming event | P1 |
| New event from followed | Followed organizer posts | P2 |
| Ticket available | Waitlist notification | P1 |
| Order status update | Payment/refund | P1 |

#### FR-11.3: WhatsApp Integration

| Feature | Description | Priority |
|---------|-------------|----------|
| Order confirmation | Via WhatsApp API | P2 |
| Event reminder | 24h reminder | P2 |
| Ticket delivery | Link to view ticket | P2 |

---

### Module 12: Reviews & Ratings

#### FR-12.1: Review System

| Feature | Description | Priority |
|---------|-------------|----------|
| Post review | After event ends | P1 |
| Rating (1-5) | Star rating | P1 |
| Review text | Written feedback | P1 |
| Verified badge | Must have attended | P1 |
| Photo upload | With review | P2 |

#### FR-12.2: Review Moderation

| Feature | Description | Priority |
|---------|-------------|----------|
| Auto-publish | Verified reviews | P1 |
| Manual review | Flagged content | P1 |
| Report review | Inappropriate content | P1 |
| Organizer reply | Respond to reviews | P1 |

---

### Module 13: Content Management (CMS)

#### FR-13.1: Static Pages

| Page | Purpose | Priority |
|------|---------|----------|
| About Us | Company info | P0 |
| Terms of Service | Legal | P0 |
| Privacy Policy | Data policy | P0 |
| Refund Policy | Global policy | P0 |
| Contact Us | Contact form | P0 |
| Help/FAQ | General FAQs | P1 |

#### FR-13.2: Blog

| Feature | Description | Priority |
|---------|-------------|----------|
| Blog posts | SEO content | P2 |
| Categories | Blog organization | P2 |
| Featured posts | Homepage display | P2 |
| Rich editor | Markdown/WYSIWYG | P2 |

#### FR-13.3: Banners

| Feature | Description | Priority |
|---------|-------------|----------|
| Homepage hero | Carousel banners | P1 |
| Sidebar ads | Promotional banners | P2 |
| Scheduled display | Start/end dates | P1 |

---

### Module 14: Analytics & Reporting

#### FR-14.1: Admin Analytics

| Report | Metrics | Priority |
|--------|---------|----------|
| Revenue report | Daily/weekly/monthly revenue | P0 |
| Sales report | Tickets sold by event | P0 |
| User report | Signups, active users | P1 |
| Event report | Published, sold out, cancelled | P1 |
| Payout report | Total paid to organizers | P0 |
| Commission report | Platform earnings | P0 |

#### FR-14.2: Organizer Analytics

| Report | Metrics | Priority |
|--------|---------|----------|
| Event performance | Views, conversions, sales | P1 |
| Ticket sales | By type, over time | P0 |
| Revenue breakdown | Gross, fees, net | P0 |
| Attendee demographics | Location, device | P2 |
| Promo code usage | Codes used, revenue impact | P1 |
| Check-in rates | Attendance rate | P1 |

---

### Module 15: Affiliate System

#### FR-15.1: Affiliate Program

| Feature | Description | Priority |
|---------|-------------|----------|
| Apply as affiliate | Application form | P2 |
| Unique referral code | Personal tracking code | P2 |
| Commission tracking | Per referral sale | P2 |
| Affiliate dashboard | Earnings, clicks, conversions | P2 |
| Payout to affiliates | Monthly payouts | P2 |

---

## 4. Non-Functional Requirements (NFR)

### NFR-1: Performance

| Requirement | Target |
|-------------|--------|
| Page load time | < 2 seconds |
| API response time | < 200ms (p95) |
| Concurrent users | 10,000+ simultaneous |
| Transaction throughput | 1,000 bookings/minute |
| QR scan verification | < 100ms |

### NFR-2: Security

| Requirement | Implementation |
|-------------|----------------|
| Authentication | JWT with refresh tokens |
| Password storage | bcrypt with salt |
| API security | Rate limiting, CORS |
| Payment security | PCI-DSS compliance (via gateway) |
| Data protection | HTTPS everywhere, encrypted at rest |
| IDOR prevention | UUID-based resources, auth checks |
| SQL injection | Parameterized queries, ORM |
| XSS prevention | CSP headers, input sanitization |

### NFR-3: Scalability

| Component | Strategy |
|-----------|----------|
| Application | Horizontal scaling (containerized) |
| Database | Read replicas, connection pooling |
| Caching | Redis for sessions, hot data |
| CDN | Static assets, images |
| Queue | Background jobs for emails, PDFs |

### NFR-4: Availability

| Requirement | Target |
|-------------|--------|
| Uptime | 99.9% |
| Disaster recovery | Daily backups, multi-AZ |
| Graceful degradation | Feature flags |

### NFR-5: Concurrency Control

**Seat Locking Strategy**:
```
1. User clicks seat → API lock (15 min TTL)
2. Lock stored in Redis with session_id
3. Lock auto-expires if not purchased
4. Database transaction for booking:
   - SELECT FOR UPDATE on seat
   - Verify lock owner matches session
   - Update status to booked
   - Release lock
```

**Ticket Stock Strategy**:
```
- Optimistic locking with version field
- Atomic decrement: UPDATE ... SET sold = sold + 1 WHERE sold + 1 <= total
- Retry on conflict (max 3 attempts)
```

---

## 5. Technical Stack (Optimized for Vercel + Supabase)

> **Deployment Target**: Vercel (Frontend + API) + Supabase (Database + Auth + Storage)
> **Architecture**: Full-stack Next.js dengan serverless functions

---

### 5.1 Core Stack Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                         VERCEL                                  │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────────┐  │
│  │  Next.js    │  │  API Routes │  │  Vercel Cron Jobs       │  │
│  │  Frontend   │  │  (Backend)  │  │  (Scheduled Tasks)      │  │
│  └─────────────┘  └─────────────┘  └─────────────────────────┘  │
│                           │                                     │
│  ┌─────────────────────────────────────────────────────────────┐│
│  │              Inngest (Background Jobs)                      ││
│  │  - PDF Generation  - Email Sending  - Payment Processing   ││
│  └─────────────────────────────────────────────────────────────┘│
└─────────────────────────────────────────────────────────────────┘
                              │
        ┌─────────────────────┼─────────────────────┐
        │                     │                     │
        ▼                     ▼                     ▼
┌───────────────┐    ┌───────────────┐    ┌───────────────┐
│   SUPABASE    │    │    UPSTASH    │    │   EXTERNAL    │
│               │    │               │    │               │
│ • PostgreSQL  │    │ • Redis       │    │ • Midtrans    │
│ • Auth        │    │   (caching,   │    │ • Xendit      │
│ • Storage     │    │    locking)   │    │ • Resend      │
│ • Realtime    │    │ • QStash      │    │ • Sentry      │
│ • Edge Funcs  │    │   (fallback)  │    │               │
└───────────────┘    └───────────────┘    └───────────────┘
```

---

### 5.2 Frontend Stack

| Component | Technology | Version | Reason |
|-----------|------------|---------|--------|
| **Framework** | Next.js | 16.x | App Router, Server Components, Turbopack stable, SSR/SSG for SEO |
| **Language** | TypeScript | 5.x | Type safety, better DX |
| **Styling** | Tailwind CSS | 4.x | Utility-first, responsive, themeable |
| **UI Components** | shadcn/ui | Latest | Accessible, customizable, Radix-based |
| **Icons** | Lucide React | Latest | Consistent, tree-shakeable |
| **State (Client)** | Zustand | 5.x | Lightweight, simple API |
| **Data Fetching** | TanStack Query | 5.x | Caching, background refetch, optimistic updates |
| **Forms** | React Hook Form | 7.x | Performance, uncontrolled inputs |
| **Validation** | Zod | 3.x | Schema validation, shared FE/BE |
| **Date/Time** | date-fns | 4.x | Lightweight, tree-shakeable |
| **Charts** | Recharts | 2.x | React-native, responsive |
| **Rich Text** | Tiptap | 2.x | Extensible, collaborative-ready |
| **QR Code** | qrcode.react | 4.x | Client-side QR generation |
| **Maps** | @vis.gl/react-google-maps | Latest | Official Google Maps React |

---

### 5.3 Backend Stack (Next.js API Routes)

| Component | Technology | Version | Reason |
|-----------|------------|---------|--------|
| **Runtime** | Node.js | 20.x | LTS, native fetch, performance |
| **API Layer** | Next.js API Routes | 16.x | Serverless, integrated with frontend |
| **ORM** | Prisma | 6.x | Type-safe, migrations, Supabase compatible |
| **Validation** | Zod | 3.x | Request/response validation |
| **Auth** | Supabase Auth + @supabase/ssr | Latest | Cookie-based SSR auth, social providers |
| **Background Jobs** | Inngest | 3.x | Durable functions, retries, workflows |
| **Caching** | Upstash Redis | Latest | Serverless Redis, Vercel integration |
| **Rate Limiting** | @upstash/ratelimit | Latest | Serverless rate limiting |
| **PDF Generation** | @react-pdf/renderer | 4.x | React-based PDF, serverless compatible |
| **Email** | Resend | Latest | Developer-friendly, React Email |
| **Image Processing** | Sharp | 0.33.x | Next.js Image optimization |

---

### 5.4 Database & Storage (Supabase)

| Component | Service | Purpose |
|-----------|---------|---------|
| **Primary Database** | Supabase PostgreSQL | Transactional data, ACID compliance |
| **Connection Pooling** | Supabase Pooler (PgBouncer) | Handle serverless connection limits |
| **Authentication** | Supabase Auth | Email, OAuth (Google, Facebook, Apple), Magic Link |
| **File Storage** | Supabase Storage | Event posters, tickets PDF, user avatars |
| **Realtime** | Supabase Realtime | Seat availability updates, live notifications |
| **Edge Functions** | Supabase Edge Functions | Payment webhooks (Deno runtime) |
| **Full-text Search** | PostgreSQL FTS | Event search (built-in, no external service) |

**Prisma + Supabase Configuration:**
```env
# Use connection pooler for serverless (port 6543)
DATABASE_URL="postgresql://postgres.[project-ref]:[password]@aws-0-[region].pooler.supabase.com:6543/postgres?pgbouncer=true"

# Direct connection for migrations only
DIRECT_URL="postgresql://postgres.[project-ref]:[password]@aws-0-[region].pooler.supabase.com:5432/postgres"
```

---

### 5.5 Caching & Real-time (Upstash)

| Component | Service | Purpose |
|-----------|---------|---------|
| **Redis Cache** | Upstash Redis | API response caching, session data |
| **Seat Locking** | Upstash Redis | Distributed locks dengan TTL (15 min) |
| **Rate Limiting** | Upstash Ratelimit | API protection, abuse prevention |
| **Message Queue** | Upstash QStash | Fallback queue jika Inngest unavailable |

**Seat Locking Implementation:**
```typescript
import { Redis } from '@upstash/redis'

const redis = Redis.fromEnv()

// Lock seat for 15 minutes
await redis.set(`seat:${seatId}:lock`, sessionId, { ex: 900, nx: true })

// Check lock owner
const owner = await redis.get(`seat:${seatId}:lock`)
if (owner !== sessionId) throw new Error('Seat locked by another user')
```

---

### 5.6 Background Jobs (Inngest)

| Job Type | Inngest Feature | Use Case |
|----------|-----------------|----------|
| **Email Sending** | Step functions | Booking confirmation, reminders |
| **PDF Generation** | Long-running jobs | Ticket PDF creation |
| **Payment Processing** | Retries + idempotency | Webhook handling |
| **Cleanup Tasks** | Scheduled functions | Expired bookings, seat locks |
| **Notifications** | Fan-out | Event reminders to attendees |

**Inngest Setup in Next.js:**
```typescript
// app/api/inngest/route.ts
import { serve } from "inngest/next";
import { inngest } from "@/lib/inngest/client";
import { 
  sendBookingConfirmation,
  generateTicketPdf,
  processPaymentWebhook,
  cleanupExpiredBookings 
} from "@/lib/inngest/functions";

export const { GET, POST, PUT } = serve({
  client: inngest,
  functions: [
    sendBookingConfirmation,
    generateTicketPdf,
    processPaymentWebhook,
    cleanupExpiredBookings,
  ],
});
```

**Example Function:**
```typescript
// lib/inngest/functions/send-booking-confirmation.ts
export const sendBookingConfirmation = inngest.createFunction(
  { id: "send-booking-confirmation", retries: 3 },
  { event: "booking/confirmed" },
  async ({ event, step }) => {
    const { bookingId } = event.data;

    // Step 1: Get booking data
    const booking = await step.run("fetch-booking", async () => {
      return await getBookingWithDetails(bookingId);
    });

    // Step 2: Generate PDF ticket
    const pdfUrl = await step.run("generate-pdf", async () => {
      return await generateTicketPdf(booking);
    });

    // Step 3: Send email
    await step.run("send-email", async () => {
      return await sendEmail({
        to: booking.email,
        subject: `Your tickets for ${booking.event.title}`,
        attachments: [{ url: pdfUrl }],
      });
    });

    return { success: true, bookingId };
  }
);
```

---

### 5.7 Scheduled Tasks (Vercel Cron)

| Task | Schedule | Function |
|------|----------|----------|
| Cleanup expired bookings | Every 5 min | `/api/cron/cleanup-expired-bookings` |
| Release expired seat locks | Every 1 min | `/api/cron/release-seat-locks` |
| Auto-end past events | Every hour | `/api/cron/end-past-events` |
| Send event reminders | Every hour | `/api/cron/send-reminders` |
| Generate daily reports | Daily 2 AM | `/api/cron/daily-reports` |

**vercel.json Configuration:**
```json
{
  "$schema": "https://openapi.vercel.sh/vercel.json",
  "crons": [
    {
      "path": "/api/cron/cleanup-expired-bookings",
      "schedule": "*/5 * * * *"
    },
    {
      "path": "/api/cron/release-seat-locks",
      "schedule": "* * * * *"
    },
    {
      "path": "/api/cron/end-past-events",
      "schedule": "0 * * * *"
    },
    {
      "path": "/api/cron/send-reminders",
      "schedule": "0 * * * *"
    },
    {
      "path": "/api/cron/daily-reports",
      "schedule": "0 2 * * *"
    }
  ]
}
```

---

### 5.8 External Services

| Category | Service | Purpose | Priority |
|----------|---------|---------|----------|
| **Payment** | Midtrans | Indonesian payments (VA, GoPay, QRIS) | P0 |
| **Payment** | Xendit | Alternative (OVO, Dana, Cards) | P1 |
| **Email** | Resend | Transactional emails | P0 |
| **Monitoring** | Sentry | Error tracking, performance | P0 |
| **Analytics** | Vercel Analytics | Web vitals, page views | P0 |
| **Analytics** | PostHog | Product analytics, feature flags | P1 |
| **Logging** | Axiom | Serverless logging (Vercel integration) | P1 |
| **Maps** | Google Maps | Venue display, geocoding | P0 |

---

### 5.9 Development Tools

| Tool | Purpose |
|------|---------|
| **pnpm** | Package manager (faster, disk efficient) |
| **Biome** | Linting + formatting (faster than ESLint + Prettier) |
| **Husky** | Git hooks (pre-commit, pre-push) |
| **lint-staged** | Run linters on staged files |
| **Commitlint** | Conventional commits enforcement |
| **Prisma Studio** | Database GUI |
| **Inngest Dev Server** | Local background job testing |

---

### 5.10 Vercel Project Configuration

**vercel.json (Complete):**
```json
{
  "$schema": "https://openapi.vercel.sh/vercel.json",
  "framework": "nextjs",
  "regions": ["sin1"],
  "functions": {
    "app/api/**/*.ts": {
      "maxDuration": 60,
      "memory": 1024
    },
    "app/api/webhooks/**/*.ts": {
      "maxDuration": 300
    },
    "app/api/inngest/route.ts": {
      "maxDuration": 300
    }
  },
  "crons": [
    { "path": "/api/cron/cleanup-expired-bookings", "schedule": "*/5 * * * *" },
    { "path": "/api/cron/release-seat-locks", "schedule": "* * * * *" },
    { "path": "/api/cron/end-past-events", "schedule": "0 * * * *" },
    { "path": "/api/cron/send-reminders", "schedule": "0 * * * *" },
    { "path": "/api/cron/daily-reports", "schedule": "0 2 * * *" }
  ]
}
```

---

### 5.11 Environment Variables

```env
# ============================================
# SUPABASE
# ============================================
NEXT_PUBLIC_SUPABASE_URL=https://[project-ref].supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...

# Prisma (use pooler for serverless)
DATABASE_URL="postgresql://postgres.[ref]:[pw]@aws-0-ap-southeast-1.pooler.supabase.com:6543/postgres?pgbouncer=true"
DIRECT_URL="postgresql://postgres.[ref]:[pw]@aws-0-ap-southeast-1.pooler.supabase.com:5432/postgres"

# ============================================
# UPSTASH
# ============================================
UPSTASH_REDIS_REST_URL=https://[id].upstash.io
UPSTASH_REDIS_REST_TOKEN=AX...
KV_REST_API_URL=${UPSTASH_REDIS_REST_URL}
KV_REST_API_TOKEN=${UPSTASH_REDIS_REST_TOKEN}

# ============================================
# INNGEST
# ============================================
INNGEST_EVENT_KEY=evt_...
INNGEST_SIGNING_KEY=signkey_...

# ============================================
# PAYMENT GATEWAYS
# ============================================
MIDTRANS_SERVER_KEY=...
MIDTRANS_CLIENT_KEY=...
MIDTRANS_IS_PRODUCTION=false
MIDTRANS_MERCHANT_ID=...

XENDIT_SECRET_KEY=...
XENDIT_WEBHOOK_TOKEN=...

# ============================================
# EMAIL (Resend)
# ============================================
RESEND_API_KEY=re_...
EMAIL_FROM=noreply@bsc.id

# ============================================
# MONITORING
# ============================================
SENTRY_DSN=https://...@sentry.io/...
NEXT_PUBLIC_SENTRY_DSN=${SENTRY_DSN}

# ============================================
# EXTERNAL APIs
# ============================================
GOOGLE_MAPS_API_KEY=...
```

---

### 5.12 Cost Estimation (Monthly)

| Service | Plan | Estimated Cost | Notes |
|---------|------|----------------|-------|
| **Vercel** | Pro | $20/member | Includes 1TB bandwidth, 100GB-hrs functions |
| **Supabase** | Pro | $25 | 8GB database, 250GB storage, 500K MAU auth |
| **Upstash Redis** | Pay-as-go | $0-10 | 10K commands/day free |
| **Inngest** | Free/Pro | $0-25 | 25K events/month free |
| **Resend** | Free/Pro | $0-20 | 3K emails/month free |
| **Sentry** | Team | $26 | 100K events/month |
| **Domain** | - | $12/year | .id or .com |
| **TOTAL (Startup)** | | ~$100-120/month | Scalable as needed |

---

### 5.13 Why This Stack?

| Decision | Rationale |
|----------|-----------|
| **Next.js 16 instead of NestJS** | Unified codebase, Turbopack stable, better Vercel integration, simpler deployment |
| **Supabase instead of separate PostgreSQL** | All-in-one (DB + Auth + Storage + Realtime), managed |
| **Inngest instead of BullMQ** | Serverless-native, no Redis worker needed, built-in UI |
| **Upstash Redis instead of Vercel KV** | More features, better pricing, dedicated for locking |
| **Prisma instead of Drizzle** | Mature, better Supabase support, migrations |
| **Resend instead of SendGrid** | Developer-friendly, React Email, simpler API |
| **shadcn/ui instead of MUI/Chakra** | Customizable, accessible, copy-paste components |

---

### 5.14 Architecture Decisions

#### ✅ Serverless-First Approach
- All backend logic in Next.js API Routes
- No dedicated server to manage
- Auto-scaling with Vercel

#### ✅ Edge-Ready Where Possible
- Middleware for auth checks
- Static pages for SEO (ISR)
- Dynamic pages for personalization

#### ✅ Distributed Locking for Concurrency
- Upstash Redis for seat locking
- Optimistic locking in Prisma for stock
- Transaction-based booking confirmation

#### ✅ Event-Driven Background Processing
- Inngest for reliable job processing
- Webhook handlers with retries
- Step functions for complex workflows

#### ✅ Real-time Updates
- Supabase Realtime for seat availability
- Optimistic UI with TanStack Query
- Server-sent events as fallback

---

## 6. Development Roadmap

### Phase 1: Foundation (Weeks 1-8)

| Sprint | Deliverables |
|--------|--------------|
| 1-2 | Project setup, auth system, user management |
| 3-4 | Organizer onboarding, basic event CRUD |
| 5-6 | Ticket types, basic booking flow (no payment) |
| 7-8 | Payment gateway integration (Midtrans), order confirmation |

**MVP Milestone**: End-to-end booking with payment

### Phase 2: Core Features (Weeks 9-16)

| Sprint | Deliverables |
|--------|--------------|
| 9-10 | PDF ticket generation, QR codes, email delivery |
| 11-12 | Check-in scanner (web), attendee management |
| 13-14 | Organizer wallet, payout requests |
| 15-16 | Admin panel (users, events, bookings, payouts) |

**Beta Milestone**: Platform operational for beta users

### Phase 3: Advanced Features (Weeks 17-24)

| Sprint | Deliverables |
|--------|--------------|
| 17-18 | Seating chart builder, seat selection UI |
| 19-20 | Recurring events, multi-session events |
| 21-22 | Promo codes, waitlist, refunds |
| 23-24 | Reviews, wishlist, follow organizers |

### Phase 4: Polish & Scale (Weeks 25-32)

| Sprint | Deliverables |
|--------|--------------|
| 25-26 | Analytics dashboards, reporting |
| 27-28 | Blog/CMS, static pages |
| 29-30 | Performance optimization, load testing |
| 31-32 | Security audit, bug fixes, documentation |

**Launch Milestone**: Production-ready platform

---

## 7. Success Metrics

### Business Metrics

| Metric | Target (6 months) |
|--------|-------------------|
| Registered organizers | 100+ |
| Published events | 500+ |
| Tickets sold | 50,000+ |
| Gross merchandise value (GMV) | Rp 5B+ |
| Platform revenue | Rp 250M+ |

### Technical Metrics

| Metric | Target |
|--------|--------|
| Uptime | 99.9% |
| Error rate | < 0.1% |
| p95 latency | < 200ms |
| Customer support tickets | < 1% of orders |

### User Metrics

| Metric | Target |
|--------|--------|
| Checkout completion rate | > 70% |
| Repeat customer rate | > 30% |
| Organizer retention | > 80% |
| NPS score | > 50 |

---

## 8. Appendix

### A. Glossary

| Term | Definition |
|------|------------|
| Organizer | User who creates and sells event tickets |
| Attendee | Person who attends an event (may differ from buyer) |
| Booking | A purchase transaction containing 1+ tickets |
| Ticket | Individual admission unit with unique QR |
| Payout | Transfer of earnings from platform to organizer |
| GA | General Admission (no assigned seating) |

### B. Integration Points

| System | Purpose | Integration Method |
|--------|---------|-------------------|
| **Supabase** | Database, Auth, Storage, Realtime | `@supabase/supabase-js`, `@supabase/ssr` |
| **Upstash** | Redis caching, seat locking | `@upstash/redis`, Vercel Integration |
| **Inngest** | Background jobs, workflows | `inngest` SDK, `/api/inngest` endpoint |
| **Midtrans** | Payment processing (Indonesia) | REST API + SNAP.js |
| **Xendit** | Alternative payment | REST API + webhooks |
| **Resend** | Transactional email | `resend` SDK + React Email |
| **Sentry** | Error tracking | `@sentry/nextjs` |
| **Google Maps** | Venue display | `@vis.gl/react-google-maps` |
| **Vercel Analytics** | Web analytics | Built-in |
| **Vercel Cron** | Scheduled tasks | `vercel.json` config |

### C. Reference Documents

- ERD_v2.md - Database schema
- API_SPEC.md - API documentation (to be created)
- WIREFRAMES.md - UI mockups (to be created)

---

*Document Version: 2.0*  
*Last Updated: January 2026*  
*Author: BSC Development Team*
