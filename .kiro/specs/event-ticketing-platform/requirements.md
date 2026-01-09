# Requirements Document

## Introduction

BSC adalah platform manajemen acara dan penjualan tiket berbasis web multi-vendor yang memungkinkan penyelenggara acara (Organizer) untuk membuat acara, menjual tiket, mengelola kursi (seating chart), dan memeriksa kehadiran (check-in). Platform ini terinspirasi dari fitur-fitur terbaik Eventmie Pro FullyLoaded, Eventbrite, Fever, SeatGeek, dan AXS dengan fokus pada pengalaman pengguna yang seamless dan sistem keuangan yang transparan.

## Glossary

- **Platform**: Sistem BSC secara keseluruhan
- **Admin**: Super Admin yang mengelola seluruh platform
- **Organizer**: Penyelenggara acara yang membuat dan mengelola event
- **Customer**: Pembeli tiket yang menghadiri acara
- **Scanner**: Petugas yang memvalidasi tiket saat check-in
- **Event**: Acara yang dibuat oleh Organizer
- **Ticket_Type**: Kategori tiket (VIP, Regular, Early Bird, dll)
- **Seating_Chart**: Layout kursi interaktif untuk venue
- **Seat**: Kursi individual dalam seating chart
- **Booking**: Transaksi pembelian tiket
- **Booked_Ticket**: Tiket individual yang sudah dibeli
- **Wallet**: Saldo virtual Organizer dari penjualan tiket
- **Payout**: Pencairan dana dari Wallet ke rekening bank
- **QR_Code**: Kode unik untuk validasi tiket
- **Commission**: Persentase potongan Admin dari setiap transaksi

## Requirements

### Requirement 1: User Authentication & Authorization

**User Story:** As a user, I want to register and login to the platform with different roles, so that I can access features appropriate to my role.

#### Acceptance Criteria

1. WHEN a visitor registers as Customer, THE Platform SHALL create a new user account with customer role and send email verification
2. WHEN a visitor registers as Organizer, THE Platform SHALL create a new user account with organizer role pending Admin approval
3. WHEN Admin approves an Organizer registration, THE Platform SHALL activate the organizer account and notify via email
4. WHEN a user logs in with valid credentials, THE Platform SHALL authenticate and redirect to role-appropriate dashboard
5. IF a user enters invalid credentials 5 times, THEN THE Platform SHALL temporarily lock the account for 15 minutes
6. WHEN a user requests password reset, THE Platform SHALL send a time-limited reset link via email
7. THE Platform SHALL support OAuth login via Google and Facebook for Customer accounts
8. WHILE a user session is active, THE Platform SHALL maintain authentication state with JWT tokens valid for 24 hours

### Requirement 2: Organizer Profile Management

**User Story:** As an Organizer, I want to manage my profile and banking information, so that I can receive payouts from ticket sales.

#### Acceptance Criteria

1. WHEN an Organizer completes profile setup, THE Platform SHALL store organization name, description, logo, and contact information
2. WHEN an Organizer adds bank account details, THE Platform SHALL encrypt and store bank name, account number, and account holder name
3. THE Platform SHALL display current wallet balance on Organizer dashboard
4. WHEN an Organizer updates profile information, THE Platform SHALL validate and save changes immediately
5. IF an Organizer submits incomplete banking information, THEN THE Platform SHALL reject the submission and display specific validation errors

### Requirement 3: Event Creation & Management

**User Story:** As an Organizer, I want to create and manage events with rich details, so that I can attract customers and sell tickets.

#### Acceptance Criteria

1. WHEN an Organizer creates a new event, THE Platform SHALL require title, description, category, start/end datetime, and location
2. THE Platform SHALL support three event types: Online (with streaming URL), Offline (with venue address), and Hybrid
3. WHEN an Organizer uploads event media, THE Platform SHALL accept poster image (max 5MB), gallery images (max 10 images), and video trailer URL
4. THE Platform SHALL support recurring events with configurable frequency (daily, weekly, monthly) and end date
5. WHEN an Organizer sets event location, THE Platform SHALL integrate with Google Maps for address autocomplete and map display
6. THE Platform SHALL support event status transitions: Draft → Published → Ended
7. WHEN an Organizer publishes an event, THE Platform SHALL validate all required fields before making event publicly visible
8. IF Admin has enabled event moderation, THEN THE Platform SHALL require Admin approval before publishing
9. WHEN an event end datetime passes, THE Platform SHALL automatically update status to Ended
10. THE Platform SHALL support private events with password protection or invitation-only access

### Requirement 4: Ticket Type Configuration

**User Story:** As an Organizer, I want to create multiple ticket types with different prices and quantities, so that I can offer various options to customers.

#### Acceptance Criteria

1. WHEN an Organizer creates a ticket type, THE Platform SHALL require name, price, total quantity, and sale period (start/end datetime)
2. THE Platform SHALL support free tickets with price set to zero
3. WHEN an Organizer sets ticket quantity, THE Platform SHALL track sold_quantity separately from total quantity
4. THE Platform SHALL calculate and display available tickets as (quantity - sold_quantity)
5. WHEN ticket sale period starts, THE Platform SHALL make tickets available for purchase
6. WHEN ticket sale period ends OR sold_quantity equals quantity, THE Platform SHALL mark ticket type as sold out
7. THE Platform SHALL support early bird pricing with automatic price increase after specified date
8. WHEN an Organizer configures group tickets, THE Platform SHALL allow minimum and maximum purchase quantities per order
9. IF an Organizer attempts to reduce quantity below sold_quantity, THEN THE Platform SHALL reject the change

### Requirement 5: Interactive Seating Chart

**User Story:** As an Organizer, I want to create interactive seating charts, so that customers can select specific seats for their tickets.

#### Acceptance Criteria

1. WHEN an Organizer enables seating chart for an event, THE Platform SHALL provide a visual seat map editor
2. THE Platform SHALL allow Organizer to create seat rows with labels (e.g., Row A, Row B) and order index
3. WHEN an Organizer adds seats to a row, THE Platform SHALL generate seat numbers automatically (e.g., A-1, A-2)
4. THE Platform SHALL allow linking each seat to a ticket type for pricing tier assignment
5. WHEN displaying seating chart to Customer, THE Platform SHALL show real-time seat availability with color coding (available, locked, booked)
6. WHEN a Customer selects a seat, THE Platform SHALL temporarily lock the seat for 10 minutes to prevent double booking
7. IF seat lock expires without purchase completion, THEN THE Platform SHALL release the seat back to available status
8. WHEN a booking is completed, THE Platform SHALL update seat status from locked to booked
9. THE Platform SHALL support seat map import from image upload with manual seat placement overlay
10. FOR ALL seat selection operations, THE Platform SHALL use optimistic locking to prevent race conditions

### Requirement 6: Event Discovery & Search

**User Story:** As a Customer, I want to discover and search for events, so that I can find events that interest me.

#### Acceptance Criteria

1. WHEN a Customer visits the homepage, THE Platform SHALL display featured events, upcoming events, and category filters
2. THE Platform SHALL provide search functionality with filters for: date range, category, location, price range, and event type
3. WHEN a Customer searches by location, THE Platform SHALL support city name, postal code, and geolocation-based search
4. THE Platform SHALL display search results with event poster, title, date, location, and starting price
5. WHEN displaying event listings, THE Platform SHALL sort by relevance, date, or popularity (ticket sales)
6. THE Platform SHALL provide category-based browsing (Music, Sports, Conference, Workshop, etc.)
7. WHEN a Customer views an event page, THE Platform SHALL display full event details, ticket options, and seating chart (if applicable)
8. THE Platform SHALL show remaining ticket count or "Selling Fast" indicator when availability is below 20%

### Requirement 7: Booking & Checkout Flow

**User Story:** As a Customer, I want to purchase tickets through a smooth checkout process, so that I can secure my attendance at events.

#### Acceptance Criteria

1. WHEN a Customer selects tickets, THE Platform SHALL add items to cart with ticket type, quantity, and seat assignments (if applicable)
2. THE Platform SHALL display itemized pricing: ticket price, tax amount, and admin service fee
3. WHEN a Customer proceeds to checkout, THE Platform SHALL start a 15-minute countdown timer for cart reservation
4. IF checkout timer expires, THEN THE Platform SHALL release reserved tickets and seats back to inventory
5. THE Platform SHALL support guest checkout without requiring account registration
6. WHEN a Customer completes payment, THE Platform SHALL create booking record with unique booking code
7. THE Platform SHALL calculate and store: total_amount, tax_amount, admin_commission, and organizer_net_income at booking time
8. WHEN booking is confirmed, THE Platform SHALL generate unique QR codes for each booked ticket
9. THE Platform SHALL send booking confirmation email with PDF tickets attached
10. IF payment fails, THEN THE Platform SHALL release reserved inventory and display appropriate error message

### Requirement 8: Payment Gateway Integration

**User Story:** As a Customer, I want to pay using various payment methods, so that I can complete purchases conveniently.

#### Acceptance Criteria

1. THE Platform SHALL integrate with Midtrans payment gateway for Indonesian market
2. THE Platform SHALL support payment methods: credit/debit card, bank transfer, e-wallet (GoPay, OVO, DANA)
3. WHEN a Customer initiates payment, THE Platform SHALL create pending transaction and redirect to payment gateway
4. WHEN payment gateway sends webhook notification, THE Platform SHALL update booking and transaction status accordingly
5. THE Platform SHALL handle payment statuses: pending, paid, failed, expired, refunded
6. IF payment is not completed within 24 hours, THEN THE Platform SHALL mark transaction as expired and release inventory
7. WHEN a refund is processed, THE Platform SHALL update transaction status and reverse wallet balance changes
8. THE Platform SHALL store transaction reference numbers from payment gateway for reconciliation

### Requirement 9: Ticket Generation & Delivery

**User Story:** As a Customer, I want to receive my tickets digitally, so that I can access them easily on event day.

#### Acceptance Criteria

1. WHEN a booking is confirmed, THE Platform SHALL generate PDF ticket for each booked ticket
2. THE Platform SHALL include on each ticket: event name, date/time, venue, seat info (if applicable), unique QR code, and booking code
3. THE Platform SHALL send tickets via email immediately after successful payment
4. WHEN a Customer accesses their account, THE Platform SHALL display all purchased tickets with download option
5. THE Platform SHALL generate QR codes containing unique_code that can be validated offline
6. THE Platform SHALL support Apple Wallet and Google Wallet ticket formats
7. WHEN a Customer requests ticket resend, THE Platform SHALL regenerate and send tickets to registered email

### Requirement 10: Check-in & QR Scanning

**User Story:** As a Scanner, I want to validate tickets quickly and accurately, so that I can manage event entry efficiently.

#### Acceptance Criteria

1. THE Platform SHALL provide web-based scanner interface accessible on mobile devices
2. WHEN a Scanner scans a QR code, THE Platform SHALL validate the unique_code against booked_tickets database
3. THE Platform SHALL return scan result within 500ms: Valid (green), Already Used (yellow), Invalid (red)
4. WHEN a valid ticket is scanned, THE Platform SHALL update is_checked_in to true and record checked_in_at timestamp
5. IF a ticket has already been checked in, THEN THE Platform SHALL display warning with original check-in time
6. THE Platform SHALL support offline scanning mode with local validation and sync when online
7. WHEN Scanner is offline, THE Platform SHALL queue check-in records and sync automatically when connection restored
8. THE Platform SHALL display real-time check-in statistics: total expected, checked in, remaining

### Requirement 11: Organizer Financial Management

**User Story:** As an Organizer, I want to track my earnings and request payouts, so that I can manage my event revenue.

#### Acceptance Criteria

1. THE Platform SHALL calculate organizer_net_income as: total_amount - tax_amount - admin_commission
2. WHEN a booking is paid, THE Platform SHALL add organizer_net_income to Organizer's wallet_balance
3. THE Platform SHALL display transaction history with booking details and commission breakdown
4. WHEN an Organizer requests payout, THE Platform SHALL validate minimum payout amount (configurable by Admin)
5. THE Platform SHALL create payout record with status pending and requested amount
6. WHEN Admin processes payout, THE Platform SHALL update payout status to processed and deduct from wallet_balance
7. IF payout amount exceeds wallet_balance, THEN THE Platform SHALL reject the payout request
8. THE Platform SHALL generate monthly financial reports for Organizers with sales summary and commission details

### Requirement 12: Admin Commission & Platform Settings

**User Story:** As an Admin, I want to configure platform settings and commission rates, so that I can manage platform revenue.

#### Acceptance Criteria

1. THE Platform SHALL allow Admin to set global commission percentage (default 10%)
2. THE Platform SHALL allow Admin to set per-organizer commission rates that override global rate
3. WHEN calculating admin_commission, THE Platform SHALL use organizer-specific rate if set, otherwise global rate
4. THE Platform SHALL allow Admin to configure tax percentage for ticket sales
5. THE Platform SHALL allow Admin to set minimum payout amount for Organizer withdrawals
6. WHEN Admin updates commission rates, THE Platform SHALL apply new rates only to future bookings (not retroactive)
7. THE Platform SHALL provide Admin dashboard with platform-wide sales, revenue, and commission statistics

### Requirement 13: Admin User & Event Management

**User Story:** As an Admin, I want to manage users and moderate events, so that I can maintain platform quality and security.

#### Acceptance Criteria

1. THE Platform SHALL display all users with filtering by role, status, and registration date
2. WHEN Admin views user details, THE Platform SHALL show profile information, booking history, and activity log
3. THE Platform SHALL allow Admin to activate, deactivate, or ban user accounts
4. WHEN Admin bans a user, THE Platform SHALL immediately invalidate all active sessions
5. THE Platform SHALL display all events with filtering by status, organizer, and date
6. WHEN event moderation is enabled, THE Platform SHALL queue new events for Admin approval
7. THE Platform SHALL allow Admin to approve, reject, or request changes for pending events
8. WHEN Admin rejects an event, THE Platform SHALL notify Organizer with rejection reason

### Requirement 14: Reviews & Ratings

**User Story:** As a Customer, I want to review events I attended, so that I can share my experience and help others decide.

#### Acceptance Criteria

1. WHEN an event ends, THE Platform SHALL enable review submission for Customers who attended
2. THE Platform SHALL require rating (1-5 stars) and optional text review
3. WHEN a Customer submits a review, THE Platform SHALL associate it with the booking and event
4. THE Platform SHALL display reviews on event page with average rating and review count
5. THE Platform SHALL allow only one review per Customer per event
6. IF a Customer has not checked in to the event, THEN THE Platform SHALL not allow review submission
7. THE Platform SHALL allow Organizer to respond to reviews publicly

### Requirement 15: Notifications & Communications

**User Story:** As a user, I want to receive relevant notifications, so that I can stay informed about my events and bookings.

#### Acceptance Criteria

1. THE Platform SHALL send email notifications for: registration, booking confirmation, payment status, event reminders
2. WHEN an event is 24 hours away, THE Platform SHALL send reminder email to all ticket holders
3. THE Platform SHALL support in-app notifications for real-time updates
4. WHEN an Organizer updates event details, THE Platform SHALL notify affected ticket holders
5. IF an event is cancelled, THEN THE Platform SHALL notify all ticket holders and initiate refund process
6. THE Platform SHALL allow users to configure notification preferences (email, push, SMS)
7. THE Platform SHALL integrate with Twilio for SMS notifications (optional feature)

### Requirement 16: Promotional Tools

**User Story:** As an Organizer, I want to create promotions and discounts, so that I can boost ticket sales.

#### Acceptance Criteria

1. THE Platform SHALL allow Organizer to create promo codes with percentage or fixed amount discount
2. WHEN creating promo code, THE Platform SHALL require: code, discount type, discount value, usage limit, and validity period
3. WHEN a Customer applies valid promo code, THE Platform SHALL calculate and display discounted price
4. THE Platform SHALL track promo code usage and enforce usage limits
5. IF promo code is expired, invalid, or usage limit reached, THEN THE Platform SHALL reject application with appropriate message
6. THE Platform SHALL support event-specific and organizer-wide promo codes
7. THE Platform SHALL allow Admin to create platform-wide promo codes

### Requirement 17: Reporting & Analytics

**User Story:** As an Organizer, I want to view detailed analytics, so that I can understand my event performance and make data-driven decisions.

#### Acceptance Criteria

1. THE Platform SHALL provide Organizer dashboard with: total sales, revenue, ticket breakdown by type, and check-in rate
2. THE Platform SHALL display sales trends over time with daily/weekly/monthly views
3. THE Platform SHALL show attendee demographics: purchase time distribution, ticket type preferences
4. THE Platform SHALL provide exportable reports in CSV and PDF formats
5. WHEN an event ends, THE Platform SHALL generate comprehensive post-event report
6. THE Platform SHALL track referral sources for ticket purchases (direct, social, email)
7. THE Platform SHALL provide real-time sales monitoring during high-demand periods

### Requirement 18: Mobile Responsiveness & PWA

**User Story:** As a user, I want to access the platform on any device, so that I can browse events and manage tickets on the go.

#### Acceptance Criteria

1. THE Platform SHALL provide fully responsive design optimized for mobile, tablet, and desktop
2. THE Platform SHALL implement Progressive Web App (PWA) features for offline access and home screen installation
3. WHEN a Customer views tickets on mobile, THE Platform SHALL display QR code optimized for scanning
4. THE Platform SHALL support touch-friendly seating chart interaction on mobile devices
5. THE Platform SHALL maintain consistent functionality across all supported browsers (Chrome, Safari, Firefox, Edge)

### Requirement 19: Data Security & Privacy

**User Story:** As a user, I want my data to be secure and private, so that I can trust the platform with my information.

#### Acceptance Criteria

1. THE Platform SHALL encrypt all sensitive data at rest and in transit using AES-256 and TLS 1.3
2. THE Platform SHALL hash passwords using bcrypt with minimum 12 rounds
3. THE Platform SHALL implement CSRF protection on all forms
4. THE Platform SHALL sanitize all user inputs to prevent XSS and SQL injection attacks
5. THE Platform SHALL implement rate limiting on authentication endpoints (max 10 requests per minute)
6. THE Platform SHALL log all security-relevant events for audit purposes
7. THE Platform SHALL comply with data retention policies (delete inactive accounts after 2 years)
8. IF a data breach is detected, THEN THE Platform SHALL notify affected users within 72 hours

### Requirement 20: Performance & Scalability

**User Story:** As a platform operator, I want the system to handle high traffic, so that users have a smooth experience during ticket sales.

#### Acceptance Criteria

1. THE Platform SHALL load event pages within 2 seconds under normal conditions
2. THE Platform SHALL handle concurrent seat selection using database-level locking to prevent overselling
3. WHEN high traffic is detected, THE Platform SHALL implement queue system for checkout to prevent system overload
4. THE Platform SHALL use caching for frequently accessed data (event listings, static content)
5. THE Platform SHALL support horizontal scaling for API servers
6. THE Platform SHALL maintain 99.9% uptime SLA
7. WHEN database operations fail, THE Platform SHALL implement retry logic with exponential backoff
