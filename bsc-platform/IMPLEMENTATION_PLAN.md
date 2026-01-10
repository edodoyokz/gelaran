# BSC Platform - Complete Implementation Plan

> Generated: 2026-01-10
> Status: MVP Development Phase
> Total Missing Features: 45+

---

## Quick Summary

| Phase | Items | Priority | Est. Hours |
|-------|-------|----------|------------|
| Phase 1 | Core Organizer Features | 🔴 CRITICAL | 20-25h |
| Phase 2 | Admin Actions & Management | 🔴 CRITICAL | 15-20h |
| Phase 3 | Customer Features | 🟡 IMPORTANT | 15-20h |
| Phase 4 | Auth & Navigation | 🟡 IMPORTANT | 8-10h |
| Phase 5 | Static & Info Pages | 🟢 STANDARD | 4-6h |
| Phase 6 | Enhanced Features | 🟢 NICE-TO-HAVE | 30-40h |
| Phase 7 | Polish & Optimization | 🟢 NICE-TO-HAVE | 10-15h |

**Total Estimated: ~100-130 hours**

---

## Phase 1: Core Organizer Features (CRITICAL)

### 1.1 Create Event Form
**Priority**: 🔴 CRITICAL  
**Path**: `/organizer/events/new`  
**Estimated**: 6-8 hours

**Tasks**:
- [ ] Buat page `/app/organizer/events/new/page.tsx`
- [ ] Form multi-step wizard:
  - Step 1: Basic Info (title, description, category, event type)
  - Step 2: Schedule (date, time, recurring options)
  - Step 3: Location (venue selection atau create new, atau online)
  - Step 4: Tickets (ticket types, pricing, quantity, price tiers)
  - Step 5: Media (poster image, banner, trailer URL, gallery)
  - Step 6: Settings (visibility, T&C, refund policy, min/max per order)
- [ ] API `POST /api/organizer/events`
- [ ] Validasi dengan Zod schema
- [ ] Image upload ke Supabase Storage
- [ ] Auto-generate slug dari title

**Files to Create**:
```
app/organizer/events/new/page.tsx
app/api/organizer/events/route.ts
components/features/organizer/EventFormWizard.tsx
components/features/organizer/steps/
  - BasicInfoStep.tsx
  - ScheduleStep.tsx
  - LocationStep.tsx
  - TicketStep.tsx
  - MediaStep.tsx
  - SettingsStep.tsx
lib/validators/event.ts
lib/storage/upload.ts
```

---

### 1.2 Event Detail & Management Dashboard
**Priority**: 🔴 CRITICAL  
**Path**: `/organizer/events/[id]`  
**Estimated**: 8-10 hours

**Tasks**:
- [ ] Dashboard event dengan tab navigation
- [ ] **Overview Tab**: Stats, quick actions, revenue chart
- [ ] **Tickets Tab**: CRUD ticket types dengan price tiers
- [ ] **Attendees Tab**: List bookings, search, export CSV
- [ ] **Schedule Tab**: Manage multi-day schedules
- [ ] **Promo Tab**: Manage promo codes
- [ ] **FAQ Tab**: Manage event FAQs
- [ ] **Settings Tab**: Edit event details, publish/unpublish
- [ ] API endpoints untuk semua operations

**API Endpoints**:
```
PUT    /api/organizer/events/[id]
DELETE /api/organizer/events/[id]
POST   /api/organizer/events/[id]/publish
POST   /api/organizer/events/[id]/unpublish
POST   /api/organizer/events/[id]/duplicate
CRUD   /api/organizer/events/[id]/tickets
CRUD   /api/organizer/events/[id]/tickets/[ticketId]/tiers
CRUD   /api/organizer/events/[id]/schedules
CRUD   /api/organizer/events/[id]/promos
CRUD   /api/organizer/events/[id]/faqs
GET    /api/organizer/events/[id]/attendees
GET    /api/organizer/events/[id]/attendees/export
```

**Files to Create**:
```
app/organizer/events/[id]/page.tsx
app/organizer/events/[id]/tickets/page.tsx
app/organizer/events/[id]/attendees/page.tsx
app/organizer/events/[id]/schedule/page.tsx
app/organizer/events/[id]/promos/page.tsx
app/organizer/events/[id]/faqs/page.tsx
app/organizer/events/[id]/settings/page.tsx
app/api/organizer/events/[id]/route.ts
app/api/organizer/events/[id]/publish/route.ts
app/api/organizer/events/[id]/duplicate/route.ts
app/api/organizer/events/[id]/tickets/route.ts
app/api/organizer/events/[id]/tickets/[ticketId]/tiers/route.ts
app/api/organizer/events/[id]/schedules/route.ts
app/api/organizer/events/[id]/promos/route.ts
app/api/organizer/events/[id]/faqs/route.ts
app/api/organizer/events/[id]/attendees/route.ts
components/features/organizer/EventDashboard.tsx
components/features/organizer/TicketTypeManager.tsx
components/features/organizer/PriceTierManager.tsx
components/features/organizer/AttendeeTable.tsx
components/features/organizer/ScheduleManager.tsx
components/features/organizer/PromoCodeManager.tsx
components/features/organizer/FAQManager.tsx
```

---

### 1.3 Organizer Profile Settings
**Priority**: 🔴 CRITICAL  
**Path**: `/organizer/settings`  
**Estimated**: 2-3 hours

**Tasks**:
- [ ] Edit organization name, slug
- [ ] Upload organization logo & banner
- [ ] Edit description, website, social links
- [ ] API `PATCH /api/organizer/profile`

**Files to Create**:
```
app/organizer/settings/page.tsx
app/api/organizer/profile/route.ts
components/features/organizer/OrganizerProfileForm.tsx
```

---

### 1.4 Wallet - Withdraw & Bank Account
**Priority**: 🔴 CRITICAL  
**Path**: `/organizer/wallet/withdraw`, `/organizer/wallet/bank-account`  
**Estimated**: 3-4 hours

**Tasks**:
- [ ] Page withdraw dengan form amount
- [ ] Validasi saldo cukup
- [ ] Page add/edit/delete bank account
- [ ] Set primary bank account
- [ ] API endpoints

**Files to Create**:
```
app/organizer/wallet/withdraw/page.tsx
app/organizer/wallet/bank-account/page.tsx
app/organizer/wallet/bank-account/new/page.tsx
app/api/organizer/payouts/route.ts
app/api/organizer/bank-accounts/route.ts
app/api/organizer/bank-accounts/[id]/route.ts
lib/validators/payout.ts
```

---

### 1.5 Homepage Dynamic Data
**Priority**: 🔴 CRITICAL  
**Path**: `/`  
**Estimated**: 3-4 hours

**Tasks**:
- [ ] Ganti mock data dengan fetch dari API
- [ ] Update API `/api/events` dengan filters:
  - Category, Location/City, Date range
  - Search query, Featured, Event type
  - Pagination
- [ ] Fetch categories dari API
- [ ] Loading states dengan skeleton
- [ ] "Lihat Semua" links yang berfungsi

**Files to Modify**:
```
app/page.tsx
app/api/events/route.ts
app/api/categories/route.ts
```

---

## Phase 2: Admin Actions & Management (CRITICAL)

### 2.1 Admin - Event Approval Actions
**Priority**: 🔴 CRITICAL  
**Path**: `/admin/events`  
**Estimated**: 3-4 hours

**Tasks**:
- [ ] Working approve/reject buttons dengan modal
- [ ] Rejection reason input
- [ ] API endpoints
- [ ] Email notification ke organizer
- [ ] Filter by status yang berfungsi
- [ ] Search yang berfungsi

**Files to Create/Modify**:
```
app/admin/events/page.tsx (modify)
app/admin/events/[id]/page.tsx (create - event detail view)
app/api/admin/events/[id]/route.ts
app/api/admin/events/[id]/approve/route.ts
app/api/admin/events/[id]/reject/route.ts
components/features/admin/EventApprovalModal.tsx
```

---

### 2.2 Admin - Payout Processing Actions
**Priority**: 🔴 CRITICAL  
**Path**: `/admin/payouts`  
**Estimated**: 3-4 hours

**Tasks**:
- [ ] Working approve/reject/complete buttons
- [ ] Upload bukti transfer
- [ ] Update organizer wallet balance
- [ ] Email notification ke organizer
- [ ] Payout detail modal

**Files to Create/Modify**:
```
app/admin/payouts/page.tsx (modify)
app/api/admin/payouts/[id]/route.ts
app/api/admin/payouts/[id]/approve/route.ts
app/api/admin/payouts/[id]/reject/route.ts
app/api/admin/payouts/[id]/complete/route.ts
components/features/admin/PayoutProcessModal.tsx
```

---

### 2.3 Admin - User Management Actions
**Priority**: 🟡 IMPORTANT  
**Path**: `/admin/users`  
**Estimated**: 3-4 hours

**Tasks**:
- [ ] User detail page
- [ ] Change user role (CUSTOMER ↔ ORGANIZER)
- [ ] Activate/deactivate user
- [ ] View user's bookings & events
- [ ] Working search & filters

**Files to Create/Modify**:
```
app/admin/users/page.tsx (modify)
app/admin/users/[id]/page.tsx (create)
app/api/admin/users/[id]/route.ts
app/api/admin/users/[id]/role/route.ts
components/features/admin/UserDetailModal.tsx
```

---

### 2.4 Admin - Bookings Page (MISSING)
**Priority**: 🟡 IMPORTANT  
**Path**: `/admin/bookings`  
**Estimated**: 2-3 hours

**Tasks**:
- [ ] List all bookings platform-wide
- [ ] Search by booking code, event, user
- [ ] Filter by status
- [ ] Booking detail view

**Files to Create**:
```
app/admin/bookings/page.tsx
app/admin/bookings/[id]/page.tsx
app/api/admin/bookings/route.ts
app/api/admin/bookings/[id]/route.ts
```

---

### 2.5 Admin - Finance Dashboard (MISSING)
**Priority**: 🟡 IMPORTANT  
**Path**: `/admin/finance`  
**Estimated**: 4-5 hours

**Tasks**:
- [ ] Platform revenue overview
- [ ] Transaction list
- [ ] Revenue by period chart
- [ ] Pending vs completed payouts
- [ ] Export reports

**Files to Create**:
```
app/admin/finance/page.tsx
app/api/admin/finance/stats/route.ts
app/api/admin/finance/transactions/route.ts
app/api/admin/finance/export/route.ts
components/features/admin/RevenueChart.tsx
```

---

### 2.6 Admin - Category Management (MISSING)
**Priority**: 🟡 IMPORTANT  
**Path**: `/admin/categories`  
**Estimated**: 2-3 hours

**Tasks**:
- [ ] CRUD categories
- [ ] Set icon, color, sort order
- [ ] Parent/child categories (subcategories)
- [ ] Toggle active/inactive

**Files to Create**:
```
app/admin/categories/page.tsx
app/api/admin/categories/route.ts
app/api/admin/categories/[id]/route.ts
components/features/admin/CategoryForm.tsx
```

---

### 2.7 Admin - Venue Management (MISSING)
**Priority**: 🟢 NICE-TO-HAVE  
**Path**: `/admin/venues`  
**Estimated**: 2-3 hours

**Tasks**:
- [ ] List all venues
- [ ] CRUD venues
- [ ] Verify venues
- [ ] Map integration (optional)

**Files to Create**:
```
app/admin/venues/page.tsx
app/api/admin/venues/route.ts
app/api/admin/venues/[id]/route.ts
```

---

### 2.8 Admin - Settings (MISSING)
**Priority**: 🟢 NICE-TO-HAVE  
**Path**: `/admin/settings`  
**Estimated**: 2 hours

**Tasks**:
- [ ] Platform fee percentage
- [ ] Email settings
- [ ] General configurations

**Files to Create**:
```
app/admin/settings/page.tsx
app/api/admin/settings/route.ts
```

---

## Phase 3: Customer Features (IMPORTANT)

### 3.1 Customer - My Bookings
**Priority**: 🟡 IMPORTANT  
**Path**: `/my-bookings`  
**Estimated**: 4-5 hours

**Tasks**:
- [ ] List semua booking customer
- [ ] Filter by status (upcoming, past, cancelled)
- [ ] Booking detail page dengan QR codes
- [ ] Download ticket as PDF
- [ ] Cancel booking (if allowed by refund policy)
- [ ] Request refund

**Files to Create**:
```
app/my-bookings/page.tsx
app/my-bookings/[bookingCode]/page.tsx
app/api/my/bookings/route.ts
app/api/my/bookings/[bookingCode]/route.ts
app/api/my/bookings/[bookingCode]/cancel/route.ts
app/api/my/bookings/[bookingCode]/refund/route.ts
app/api/my/bookings/[bookingCode]/ticket-pdf/route.ts
components/features/booking/BookingCard.tsx
components/features/booking/TicketQRCode.tsx
lib/pdf/ticket-generator.ts
```

---

### 3.2 Customer - Profile Settings
**Priority**: 🟡 IMPORTANT  
**Path**: `/profile`  
**Estimated**: 3-4 hours

**Tasks**:
- [ ] View/edit name, phone, birthdate, gender
- [ ] Change password
- [ ] Upload avatar
- [ ] Address information
- [ ] Notification preferences
- [ ] Delete account (optional)

**Files to Create**:
```
app/profile/page.tsx
app/profile/password/page.tsx
app/api/my/profile/route.ts
app/api/my/profile/password/route.ts
app/api/my/profile/avatar/route.ts
components/features/profile/ProfileForm.tsx
components/features/profile/PasswordChangeForm.tsx
```

---

### 3.3 Customer - Wishlist
**Priority**: 🟡 IMPORTANT  
**Path**: `/wishlist`  
**Estimated**: 2-3 hours

**Tasks**:
- [ ] List wishlisted events
- [ ] Remove from wishlist
- [ ] Toggle wishlist di EventCard (fix TODO)
- [ ] Show wishlist count di navbar

**Files to Create**:
```
app/wishlist/page.tsx
app/api/my/wishlist/route.ts
app/api/my/wishlist/[eventId]/route.ts
```

**Files to Modify**:
```
components/features/events/EventCard.tsx (fix TODO)
```

---

### 3.4 Become Organizer Flow (MISSING)
**Priority**: 🟡 IMPORTANT  
**Path**: `/become-organizer`  
**Estimated**: 3-4 hours

**Tasks**:
- [ ] Application form untuk jadi organizer
- [ ] Upload documents (KTP, NPWP, etc)
- [ ] Create OrganizerProfile
- [ ] Admin approval flow
- [ ] Email notification

**Files to Create**:
```
app/become-organizer/page.tsx
app/api/organizer/apply/route.ts
app/admin/organizer-applications/page.tsx
app/api/admin/organizer-applications/route.ts
app/api/admin/organizer-applications/[id]/approve/route.ts
app/api/admin/organizer-applications/[id]/reject/route.ts
```

---

### 3.5 Event Search & Browse Page (MISSING)
**Priority**: 🟡 IMPORTANT  
**Path**: `/events`  
**Estimated**: 4-5 hours

**Tasks**:
- [ ] Search events dengan query
- [ ] Filter by category, location, date, price range
- [ ] Sort by relevance, date, price, popularity
- [ ] Pagination atau infinite scroll
- [ ] Map view (optional)

**Files to Create**:
```
app/events/page.tsx
components/features/events/EventFilters.tsx
components/features/events/EventGrid.tsx
components/features/events/SearchBar.tsx
```

---

## Phase 4: Auth & Navigation (IMPORTANT)

### 4.1 Reset Password Page (MISSING)
**Priority**: 🟡 IMPORTANT  
**Path**: `/reset-password`  
**Estimated**: 1-2 hours

**Tasks**:
- [ ] Handle token from email link
- [ ] New password form
- [ ] Use Supabase updateUser

**Files to Create**:
```
app/(auth)/reset-password/page.tsx
```

---

### 4.2 Navbar Auth State
**Priority**: 🟡 IMPORTANT  
**Estimated**: 2-3 hours

**Tasks**:
- [ ] Detect auth state (logged in/out)
- [ ] Show user avatar/name when logged in
- [ ] Dropdown menu with:
  - My Bookings
  - Wishlist
  - Profile
  - Organizer Dashboard (if organizer)
  - Admin Panel (if admin)
  - Logout
- [ ] Mobile responsive menu

**Files to Modify**:
```
components/layouts/Navbar.tsx
```

**Files to Create**:
```
components/layouts/UserDropdown.tsx
components/layouts/MobileMenu.tsx
```

---

### 4.3 Logout Functionality
**Priority**: 🟡 IMPORTANT  
**Estimated**: 30 min

**Tasks**:
- [ ] Logout button di navbar dropdown
- [ ] Clear session
- [ ] Redirect ke homepage

---

### 4.4 Social Login (OAuth)
**Priority**: 🟢 NICE-TO-HAVE  
**Estimated**: 2-3 hours

**Tasks**:
- [ ] Google OAuth
- [ ] Facebook OAuth (optional)
- [ ] Link existing accounts

**Files to Modify**:
```
app/(auth)/login/page.tsx
app/(auth)/register/page.tsx
```

---

## Phase 5: Static & Info Pages (STANDARD)

### 5.1 About Page
**Path**: `/about`  
**Estimated**: 1 hour

```
app/about/page.tsx
```

### 5.2 Contact Page
**Path**: `/contact`  
**Estimated**: 1-2 hours

```
app/contact/page.tsx
app/api/contact/route.ts
```

### 5.3 Terms & Conditions Page
**Path**: `/terms`  
**Estimated**: 30 min

```
app/terms/page.tsx
```

### 5.4 Privacy Policy Page
**Path**: `/privacy`  
**Estimated**: 30 min

```
app/privacy/page.tsx
```

### 5.5 Custom 404 Page
**Estimated**: 30 min

```
app/not-found.tsx
```

### 5.6 Custom Error Page
**Estimated**: 30 min

```
app/error.tsx
app/global-error.tsx
```

---

## Phase 6: Enhanced Features (NICE-TO-HAVE)

### 6.1 Reviews & Ratings
**Estimated**: 4-5 hours

- [ ] Customer submit review (after event ended)
- [ ] Star rating + text review
- [ ] Show reviews on event detail page
- [ ] Organizer reply to reviews
- [ ] Admin moderation

```
app/api/events/[slug]/reviews/route.ts
app/api/my/reviews/route.ts
app/admin/reviews/page.tsx
components/features/events/ReviewSection.tsx
components/features/events/ReviewForm.tsx
```

---

### 6.2 Notifications System
**Estimated**: 5-6 hours

- [ ] Notification bell in navbar
- [ ] Notification list page
- [ ] Mark as read
- [ ] Real-time with Supabase Realtime
- [ ] Push notifications (optional)

```
app/notifications/page.tsx
app/api/my/notifications/route.ts
components/features/notifications/NotificationBell.tsx
components/features/notifications/NotificationList.tsx
lib/notifications/send.ts
```

---

### 6.3 Refund Processing
**Estimated**: 4-5 hours

- [ ] Customer request refund
- [ ] Admin review & approve/reject
- [ ] Process refund via Midtrans
- [ ] Update booking & transaction status

```
app/api/my/bookings/[id]/refund/route.ts
app/admin/refunds/page.tsx
app/api/admin/refunds/route.ts
app/api/admin/refunds/[id]/approve/route.ts
lib/midtrans/refund.ts
```

---

### 6.4 Analytics Dashboard
**Estimated**: 6-8 hours

**Organizer Analytics**:
- Ticket sales over time
- Revenue breakdown by ticket type
- Check-in rate
- Traffic sources

**Admin Analytics**:
- Total platform revenue
- Active events & organizers
- User growth
- Top performing events

```
app/organizer/analytics/page.tsx
app/admin/analytics/page.tsx
app/api/analytics/organizer/route.ts
app/api/analytics/admin/route.ts
components/features/analytics/Chart.tsx
```

---

### 6.5 Ticket Transfer
**Estimated**: 3-4 hours

- [ ] Transfer ticket to another email
- [ ] Recipient receives email
- [ ] Update ticket ownership

```
app/api/my/tickets/[id]/transfer/route.ts
components/features/booking/TicketTransferModal.tsx
```

---

### 6.6 Seating Chart (Complex)
**Estimated**: 15-20 hours

- [ ] Seating chart builder for organizer
- [ ] Seat selection during checkout
- [ ] Real-time seat availability

```
app/organizer/events/[id]/seating/page.tsx
components/features/seating/SeatingChartBuilder.tsx
components/features/seating/SeatSelector.tsx
```

---

### 6.7 Event Check-in Points
**Estimated**: 2-3 hours

- [ ] Define multiple check-in points for event
- [ ] Scanner selects check-in point
- [ ] Stats per check-in point

```
app/organizer/events/[id]/check-in-points/page.tsx
app/api/organizer/events/[id]/check-in-points/route.ts
```

---

## Phase 7: Polish & Optimization

### 7.1 Email Templates Enhancement
**Estimated**: 3-4 hours

- [ ] Better booking confirmation with QR attachment
- [ ] Event reminder (H-1, H-3)
- [ ] Payment reminder
- [ ] Payout notification
- [ ] Use React Email for templates

### 7.2 Image Upload & Optimization
**Estimated**: 2-3 hours

- [ ] Supabase Storage integration
- [ ] Image resize/compress before upload
- [ ] Multiple image upload (event gallery)
- [ ] Image cropper

### 7.3 SEO Optimization
**Estimated**: 2-3 hours

- [ ] Dynamic meta tags per event
- [ ] Structured data (JSON-LD for events)
- [ ] Sitemap generation
- [ ] Open Graph images

### 7.4 Performance Optimization
**Estimated**: 3-4 hours

- [ ] React Query caching strategy
- [ ] Lazy loading images
- [ ] Route prefetching
- [ ] Database query optimization
- [ ] API response caching

### 7.5 Accessibility
**Estimated**: 2-3 hours

- [ ] Keyboard navigation
- [ ] Screen reader support
- [ ] ARIA labels
- [ ] Color contrast

### 7.6 Testing
**Estimated**: 10-15 hours

- [ ] Unit tests for validators
- [ ] Integration tests for APIs
- [ ] E2E tests for critical flows

---

## Implementation Order (Recommended Timeline)

```
WEEK 1: Core Organizer (Must Have for MVP)
├── 1.1 Create Event Form
├── 1.2 Event Detail Management (basic)
└── 1.5 Homepage Dynamic Data

WEEK 2: Core Organizer + Admin
├── 1.2 Event Detail Management (complete)
├── 1.3 Organizer Profile Settings
├── 1.4 Wallet - Withdraw & Bank Account
└── 2.1 Admin Event Approval

WEEK 3: Admin Actions
├── 2.2 Admin Payout Processing
├── 2.3 Admin User Management
├── 2.4 Admin Bookings Page
└── 2.6 Admin Category Management

WEEK 4: Customer Features
├── 3.1 My Bookings
├── 3.2 Profile Settings
├── 3.3 Wishlist
└── 4.2 Navbar Auth State

WEEK 5: Navigation & Auth
├── 4.1 Reset Password
├── 4.3 Logout
├── 3.5 Event Search Page
└── 3.4 Become Organizer Flow

WEEK 6: Static Pages & Polish
├── 5.1-5.6 All Static Pages
├── 2.5 Admin Finance Dashboard
└── 7.x Initial Polish

WEEK 7+: Enhanced Features
├── 6.x Enhanced Features (prioritized)
└── 7.x Testing & Optimization
```

---

## Technical Debt to Address

1. ❌ **Mock Data**: Homepage masih pakai mock data
2. ❌ **Button Types**: Missing `type="button"` on many buttons (lint errors)
3. ❌ **Form Labels**: Some form labels not associated (lint errors)
4. ❌ **AutoFocus**: Accessibility issue in scanner page
5. ⚠️ **Error Handling**: Inconsistent error responses
6. ⚠️ **Loading States**: Missing skeleton loaders
7. ⚠️ **Type Safety**: Some `any` usage

---

## Dependencies to Add

```json
{
  "html5-qrcode": "^2.3.8",
  "qrcode": "^1.5.3",
  "@react-pdf/renderer": "^3.1.0",
  "recharts": "^2.10.0",
  "@react-email/components": "^0.0.12",
  "react-dropzone": "^14.2.3",
  "react-image-crop": "^11.0.0"
}
```

---

## Files Count Summary

| Category | New Files | Modified Files |
|----------|-----------|----------------|
| Pages | ~45 | ~10 |
| API Routes | ~50 | ~5 |
| Components | ~40 | ~5 |
| Lib/Utils | ~10 | ~3 |
| **Total** | **~145** | **~23** |

---

## Notes

- Semua API routes harus include proper authorization checks
- Use Prisma transactions untuk operasi multi-table
- Implement rate limiting untuk public APIs
- Log all financial operations untuk audit trail
- Test payment flows dengan Midtrans sandbox

---

*Last Updated: 2026-01-10*
*Version: 2.0 (Complete)*
