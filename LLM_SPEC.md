# 📋 LLM Specification Document: BSC Event Ticketing Platform

> **📅 Tanggal Hari Ini**: 9 Januari 2026  
> **🕐 Timezone**: Asia/Jakarta (WIB, UTC+7)

> **Tujuan**: Dokumen ini memberikan konteks lengkap bagi LLM (Large Language Model) untuk membantu pengembangan platform BSC Event Ticketing. Baca dokumen ini sepenuhnya sebelum mengerjakan task apapun.

---

## 📌 Status Project Saat Ini

| Parameter | Nilai |
|-----------|-------|
| **Tanggal Sekarang** | 9 Januari 2026 |
| **Target Beta Launch** | Januari 2026 (bulan ini!) |
| **Phase Saat Ini** | Development Phase 1-2 (Foundation → Core Features) |
| **Tech Stack** | Next.js 16, Supabase, Prisma 6, TypeScript 5 |

---

## 1. 🎯 Executive Summary

### Apa itu BSC?

**BSC** adalah platform manajemen acara dan penjualan tiket berbasis web (mirip Eventbrite, Loket.com, atau Eventmie Pro) yang memungkinkan:

- **Multi-Organizer** untuk membuat event dan menjual tiket
- **Customer** untuk membeli tiket dengan berbagai metode pembayaran
- **Platform Owner (Admin)** untuk mengelola sistem dan mendapatkan komisi

### Target Market
- **Primary**: Indonesia (IDR, payment gateway lokal: Midtrans, Xendit)
- **Secondary**: Southeast Asia expansion ready

### Business Model
- Komisi per tiket yang terjual (configurable)
- Platform fee per transaksi
- Featured event placement fees

---

## 2. 👥 User Personas (Aktor Sistem)

| Aktor | Deskripsi | Level Akses |
|-------|-----------|-------------|
| **Super Admin** | Pemilik platform, full control | Semua modul |
| **Organizer** | Penyelenggara event, buat & kelola event | Event sendiri, finance, team |
| **Customer** | Pembeli tiket | Browse, beli, tiket sendiri |
| **Scanner** | Staff check-in di venue | Scan QR tiket saja |

### Organizer Sub-roles:
- **Manager**: Full access ke event organizer
- **Scanner**: Check-in only
- **Finance**: View bookings & payouts

---

## 3. 🏗️ Technical Architecture

### Core Stack

```
┌─────────────────────────────────────────────────────────────────┐
│                         VERCEL                                  │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────────┐  │
│  │  Next.js 16 │  │  API Routes │  │  Vercel Cron Jobs       │  │
│  │  Frontend   │  │  (Backend)  │  │  (Scheduled Tasks)      │  │
│  └─────────────┘  └─────────────┘  └─────────────────────────┘  │
│  ┌─────────────────────────────────────────────────────────────┐│
│  │              Inngest (Background Jobs)                      ││
│  └─────────────────────────────────────────────────────────────┘│
└─────────────────────────────────────────────────────────────────┘
                              │
        ┌─────────────────────┼─────────────────────┐
        │                     │                     │
        ▼                     ▼                     ▼
┌───────────────┐    ┌───────────────┐    ┌───────────────┐
│   SUPABASE    │    │    UPSTASH    │    │   EXTERNAL    │
│ • PostgreSQL  │    │ • Redis       │    │ • Midtrans    │
│ • Auth        │    │   (caching,   │    │ • Xendit      │
│ • Storage     │    │    locking)   │    │ • Resend      │
│ • Realtime    │    │               │    │               │
└───────────────┘    └───────────────┘    └───────────────┘
```

### Technology Stack Detail

| Layer | Technology | Version |
|-------|------------|---------|
| **Framework** | Next.js (App Router) | 16.x |
| **Language** | TypeScript | 5.x |
| **Styling** | Tailwind CSS | 4.x |
| **UI Components** | shadcn/ui | Latest |
| **State Management** | Zustand | 5.x |
| **Data Fetching** | TanStack Query | 5.x |
| **Forms** | React Hook Form | 7.x |
| **Validation** | Zod | 3.x |
| **ORM** | Prisma | 6.x |
| **Auth** | Supabase Auth | Latest |
| **Database** | PostgreSQL (Supabase) | 15+ |
| **Cache/Locking** | Upstash Redis | Latest |
| **Background Jobs** | Inngest | 3.x |
| **Email** | Resend | Latest |
| **PDF Generation** | @react-pdf/renderer | 4.x |

---

## 4. 📊 Database Schema Overview

### Entity Groups

#### 1️⃣ User Management
- `USERS` - Semua pengguna sistem
- `ORGANIZER_PROFILES` - Profil organizer + wallet
- `ORGANIZER_BANK_ACCOUNTS` - Rekening payout
- `ORGANIZER_TEAM_MEMBERS` - Tim organizer
- `CUSTOMER_PROFILES` - Profil customer
- `USER_SESSIONS` - Session management

#### 2️⃣ Event Management
- `EVENTS` - Data event utama
- `EVENT_SCHEDULES` - Multi-session/multi-day
- `EVENT_MEDIA` - Gambar, video
- `EVENT_FAQS` - FAQ per event
- `CATEGORIES` - Kategori event
- `VENUES` - Lokasi/tempat
- `TAGS` / `EVENT_TAGS` - Tagging
- `PERFORMERS` / `EVENT_PERFORMERS` - Pengisi acara
- `SPONSORS` / `EVENT_SPONSORS` - Sponsor event
- `RECURRING_PATTERNS` - Pattern untuk recurring events

#### 3️⃣ Ticketing
- `TICKET_TYPES` - Jenis tiket (VIP, Regular, dll)
- `TICKET_PRICE_TIERS` - Tiering harga (Early Bird, dll)
- `SEATING_SECTIONS` - Zona/seksi venue
- `SEAT_ROWS` - Baris kursi
- `SEATS` - Individual seat
- `WAITLIST_ENTRIES` - Waitlist saat sold out
- `PROMO_CODES` - Kode promo
- `PROMO_CODE_USAGES` - Tracking penggunaan promo

#### 4️⃣ Booking & Transactions
- `BOOKINGS` - Order/pemesanan
- `BOOKED_TICKETS` - Tiket individual dengan QR
- `TRANSACTIONS` - Transaksi pembayaran
- `ATTENDEE_QUESTIONS` - Custom form per event
- `ATTENDEE_ANSWERS` - Jawaban attendee
- `TICKET_TRANSFERS` - Transfer tiket antar user

#### 5️⃣ Check-in System
- `CHECK_IN_POINTS` - Gate/pintu masuk
- `SCANNER_SESSIONS` - Sesi scanner
- `CHECK_IN_LOGS` - Log scan tiket

#### 6️⃣ Financial
- `TAX_RATES` - Konfigurasi pajak
- `REFUNDS` - Pengembalian dana
- `PAYOUTS` - Penarikan dana organizer
- `COMMISSION_SETTINGS` - Konfigurasi komisi

#### 7️⃣ Reviews & Content
- `REVIEWS` - Review event
- `REVIEW_REPLIES` - Balasan organizer
- `PAGES` - Static pages
- `BLOG_POSTS` - Blog
- `NOTIFICATIONS` - Notifikasi
- `AUDIT_LOGS` - Log aktivitas
- `WISHLISTS` - Event yang disimpan

### Key Relationships
```
USER → has → ORGANIZER_PROFILE → has → EVENTS → has → TICKET_TYPES
                                                    ↓
CUSTOMER → makes → BOOKINGS → contains → BOOKED_TICKETS ← linked to → SEATS
                      ↓
               TRANSACTIONS → can have → REFUNDS
```

---

## 5. 📡 API Structure

### Base Configuration
- **Base URL**: `https://api.bsc.id/v1`
- **Auth**: Bearer JWT Token
- **Content-Type**: `application/json`

### API Modules

| Module | Prefix | Purpose |
|--------|--------|---------|
| Authentication | `/auth/*` | Register, login, verify, reset |
| Users | `/users/*` | Profile, bookings, tickets, wishlist |
| Organizer | `/organizer/*` | Profile, bank, wallet, payout, team |
| Events | `/events/*` | CRUD, schedules, media, tickets |
| Tickets | `/tickets/*` | Types, pricing, seating |
| Bookings | `/bookings/*` | Create, manage, refund |
| Payments | `/payments/*` | Process, webhook |
| Check-in | `/check-in/*` | Scanner, logs |
| Promo Codes | `/promo-codes/*` | CRUD, validate |
| Reviews | `/reviews/*` | Submit, reply |
| Notifications | `/notifications/*` | List, mark read |
| Admin | `/admin/*` | Users, events, payouts, settings |
| Public | `/public/*` | Categories, venues, search |

### Standard Response Format
```typescript
// Success
{
  "success": true,
  "data": { ... },
  "meta": { "page": 1, "limit": 20, "total": 100, "totalPages": 5 }
}

// Error
{
  "success": false,
  "error": { "code": 1001, "message": "...", "details": { ... } },
  "requestId": "req_abc123"
}
```

---

## 6. 🎨 Core Features (Modules)

### Module Priority Legend
- **P0**: Must-have for MVP
- **P1**: Important, post-MVP
- **P2**: Nice-to-have, future

### Feature Summary

| Module | Features | Priority |
|--------|----------|----------|
| **1. Auth & User** | Register, Login, Social, 2FA, Profile | P0-P2 |
| **2. Event Management** | Create wizard, Types (offline/online/hybrid), Recurring | P0-P1 |
| **3. Ticketing** | Multiple types, Price tiers, Promo codes, Seating chart | P0-P1 |
| **4. Booking** | Checkout flow, Guest checkout, Attendee info | P0-P1 |
| **5. Payment** | Midtrans, Xendit, Multiple methods (VA, E-wallet, QRIS) | P0-P1 |
| **6. Ticket Delivery** | PDF generation, QR code, Email, Transfer | P0-P1 |
| **7. Check-in** | QR scanner, Multi-gate, Offline mode | P0-P2 |
| **8. Financial** | Commission, Wallet, Payout, Refund | P0-P2 |
| **9. Organizer Panel** | Dashboard, Events, Attendees, Reports | P0-P1 |
| **10. Admin Panel** | Full system management | P0-P1 |
| **11. Customer Frontend** | Homepage, Search, Event page, Account | P0-P2 |
| **12. Notifications** | Email, Push, WhatsApp | P0-P2 |
| **13. Reviews** | Rating, Review text, Moderation | P1 |
| **14. CMS** | Pages, Blog, Banners | P1-P2 |
| **15. Analytics** | Sales, Revenue, Attendees | P0-P2 |

---

## 7. 🔄 Key Business Flows

### 7.1 Checkout Flow
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

### 7.2 Payment States
```
Pending → Processing → Paid → (possible) Refunded
                    ↘ Failed/Expired
```

### 7.3 Payout Flow
```
Organizer Request → Admin Review → Approved → Processing → Completed
                               ↘ Rejected
```

### 7.4 Seat Locking Strategy
```typescript
// 1. User clicks seat → API lock (15 min TTL)
// 2. Lock stored in Redis with session_id
// 3. Lock auto-expires if not purchased
// 4. Database transaction for booking:
//    - SELECT FOR UPDATE on seat
//    - Verify lock owner matches session
//    - Update status to booked
//    - Release lock
```

---

## 8. 🔐 Non-Functional Requirements

### Performance Targets
| Metric | Target |
|--------|--------|
| Page load time | < 2 seconds |
| API response time | < 200ms (p95) |
| Concurrent users | 10,000+ |
| Transaction throughput | 1,000 bookings/minute |
| QR scan verification | < 100ms |

### Security Requirements
- JWT authentication with refresh tokens
- bcrypt password hashing
- Rate limiting & CORS
- PCI-DSS compliance (via gateway)
- HTTPS everywhere
- UUID-based resources (IDOR prevention)
- Parameterized queries (SQL injection prevention)
- CSP headers (XSS prevention)

### Availability
- Uptime target: 99.9%
- Daily backups, multi-AZ
- Graceful degradation with feature flags

---

## 9. 📁 Reference Documents

Dokumen yang tersedia di project ini:

| File | Deskripsi |
|------|-----------|
| `PRD_v2.md` | Product Requirements Document lengkap |
| `ERD_v2.md` | Entity Relationship Diagram dalam Mermaid |
| `API_SPEC.md` | Spesifikasi API lengkap |
| `eventmie/` | Reference codebase dari Eventmie Pro (Laravel) |

### Cara Menggunakan Dokumen Ini

1. **Untuk task database/schema**: Baca `ERD_v2.md`
2. **Untuk task API**: Baca `API_SPEC.md`
3. **Untuk fitur detail**: Baca `PRD_v2.md`
4. **Untuk referensi implementasi**: Lihat `eventmie/src/`

---

## 10. 📂 Project Structure (Target)

```
bsc-platform/
├── app/                          # Next.js App Router
│   ├── (auth)/                   # Auth routes group
│   │   ├── login/
│   │   ├── register/
│   │   └── forgot-password/
│   ├── (customer)/               # Customer-facing routes
│   │   ├── events/
│   │   ├── checkout/
│   │   └── account/
│   ├── organizer/                # Organizer dashboard
│   │   ├── dashboard/
│   │   ├── events/
│   │   ├── attendees/
│   │   ├── finance/
│   │   └── settings/
│   ├── admin/                    # Admin panel
│   │   ├── dashboard/
│   │   ├── users/
│   │   ├── events/
│   │   ├── bookings/
│   │   ├── payouts/
│   │   └── settings/
│   ├── scanner/                  # QR Scanner interface
│   └── api/                      # API Routes
│       ├── auth/
│       ├── users/
│       ├── organizer/
│       ├── events/
│       ├── bookings/
│       ├── payments/
│       ├── webhooks/
│       ├── cron/
│       └── inngest/
├── components/                   # Shared components
│   ├── ui/                       # shadcn/ui components
│   ├── forms/
│   ├── layouts/
│   └── features/
├── lib/                          # Utilities & shared logic
│   ├── supabase/                 # Supabase client
│   ├── prisma/                   # Prisma client
│   ├── inngest/                  # Background job functions
│   ├── email/                    # Email templates
│   ├── pdf/                      # PDF generation
│   ├── payment/                  # Payment gateway utils
│   ├── validators/               # Zod schemas
│   └── utils/                    # Helper functions
├── prisma/
│   ├── schema.prisma             # Database schema
│   └── migrations/
├── public/
├── styles/
├── types/                        # TypeScript types
├── middleware.ts                 # Auth & routing middleware
├── next.config.ts
├── tailwind.config.ts
├── vercel.json
└── package.json
```

---

## 11. 🛠️ Development Conventions

### Naming Conventions

| Type | Convention | Example |
|------|------------|---------|
| Files (components) | PascalCase | `EventCard.tsx` |
| Files (utils) | kebab-case | `format-currency.ts` |
| Functions | camelCase | `createBooking()` |
| Constants | SCREAMING_SNAKE | `MAX_TICKETS_PER_ORDER` |
| DB Tables | SCREAMING_SNAKE | `BOOKED_TICKETS` |
| DB Columns | snake_case | `created_at` |
| API Routes | kebab-case | `/api/promo-codes` |

### Code Style
- Use Biome for linting & formatting
- Strict TypeScript (no `any`)
- Prefer named exports
- Use Zod for all validation
- Use path aliases (`@/components/...`)

### Git Conventions
- Branch: `feature/`, `fix/`, `hotfix/`
- Commit: Conventional Commits (`feat:`, `fix:`, `chore:`)
- PR required for main branch

---

## 12. 🧩 Common Tasks Guide

### Saat Diminta Membuat Feature Baru:

1. **Pahami konteks** - Baca PRD untuk feature tersebut
2. **Cek ERD** - Pastikan schema database sudah ada atau perlu migration
3. **Cek API Spec** - Pastikan endpoint sudah didefinisikan
4. **Implementasi**:
   - Prisma schema (jika perlu)
   - API route
   - Frontend page/component
   - Zod validation schemas
5. **Testing considerations**

### Saat Diminta Fix Bug:

1. Pahami flow yang bermasalah
2. Trace dari API sampai DB
3. Check edge cases
4. Pastikan tidak break fitur lain

### Saat Diminta Review/Improve:

1. Check performance implications
2. Check security concerns
3. Check maintainability
4. Suggest improvements dengan alasan

---

## 13. ⚠️ Important Notes

### Hal yang Harus Diperhatikan:

1. **Concurrency Control**
   - Seat locking HARUS menggunakan Redis dengan TTL
   - Stock management menggunakan optimistic locking

2. **Payment Security**
   - JANGAN pernah log credit card data
   - Gunakan payment gateway official SDK
   - Verify webhook signatures

3. **Data Integrity**
   - Gunakan database transactions untuk booking
   - Implement idempotency keys untuk payment

4. **Indonesian Localization**
   - Format currency: `Rp 1.000.000`
   - Timezone default: `Asia/Jakarta`
   - Date format: `DD MMMM YYYY`

5. **Mobile Responsiveness**
   - Semua pages HARUS responsive
   - QR scanner HARUS work di mobile

---

## 14. 🔗 External Integrations

### Payment Gateways

#### Midtrans (Primary)
- **Methods**: Credit Card, VA, GoPay, QRIS
- **SDK**: SNAP.js + Server API
- **Webhook**: `/api/webhooks/midtrans`

#### Xendit (Secondary)
- **Methods**: VA, OVO, Dana, Cards
- **SDK**: REST API
- **Webhook**: `/api/webhooks/xendit`

### Email (Resend)
- Transactional emails
- React Email templates
- Template types:
  - Welcome email
  - Email verification
  - Booking confirmation
  - Ticket delivery
  - Event reminder
  - Payout notification

### Storage (Supabase Storage)
- Event posters & banners
- User avatars
- PDF tickets
- KYC documents

### Maps (Google Maps)
- Venue location display
- Geocoding for search

---

## 15. 🚀 Development Roadmap

### Phase 1: Foundation (Weeks 1-8) → MVP
- Auth system
- Basic event CRUD
- Ticket types
- Basic booking + payment

### Phase 2: Core Features (Weeks 9-16) → Beta
- PDF tickets + QR
- Check-in scanner
- Organizer wallet + payouts
- Admin panel

### Phase 3: Advanced (Weeks 17-24)
- Seating charts
- Recurring events
- Promo codes + refunds
- Reviews system

### Phase 4: Polish (Weeks 25-32) → Launch
- Analytics dashboards
- CMS
- Performance optimization
- Security audit

---

## 16. 📞 Quick Reference Commands

```bash
# Development
pnpm dev              # Start dev server
pnpm build            # Production build
pnpm lint             # Run linter

# Database
pnpm prisma generate  # Generate Prisma client
pnpm prisma migrate dev  # Run migrations (dev)
pnpm prisma studio    # Open Prisma Studio

# Inngest (Background Jobs)
pnpm inngest-dev      # Start Inngest dev server
```

---

## 17. ✅ Checklist Sebelum Mengerjakan Task

- [ ] Sudah baca section yang relevan dari PRD?
- [ ] Sudah cek ERD untuk schema yang dibutuhkan?
- [ ] Sudah cek API Spec untuk endpoint yang dibutuhkan?
- [ ] Sudah paham user persona mana yang terlibat?
- [ ] Sudah paham business flow yang terkait?
- [ ] Sudah pertimbangkan edge cases?
- [ ] Sudah pertimbangkan security implications?
- [ ] **Sudah query Context7 untuk dokumentasi library yang akan digunakan?** ⬅️ PENTING!

---

## 18. 🔍 Menggunakan MCP Context7 untuk Dokumentasi Library

MCP Context7 adalah tool yang sangat berguna untuk mendapatkan dokumentasi terbaru dari library/framework yang digunakan di project ini. **GUNAKAN Context7 setiap kali perlu referensi dokumentasi library!**

### Cara Kerja Context7

1. **Resolve Library ID** - Pertama, cari ID library yang valid
2. **Query Docs** - Kemudian query dokumentasi dengan pertanyaan spesifik

### Library IDs yang Sering Digunakan

Berikut adalah library ID yang sudah diketahui untuk project ini:

| Library | Context7 ID | Digunakan Untuk |
|---------|-------------|-----------------|
| Next.js | `/vercel/next.js` | Framework utama |
| Supabase | `/supabase/supabase` | Database, Auth, Storage |
| Prisma | `/prisma/docs` | ORM |
| TanStack Query | `/tanstack/query` | Data fetching |
| React Hook Form | `/react-hook-form/react-hook-form` | Form handling |
| Zod | `/colinhacks/zod` | Validation |
| Tailwind CSS | `/tailwindlabs/tailwindcss.com` | Styling |
| shadcn/ui | `/shadcn-ui/ui` | UI Components |
| Inngest | `/inngest/inngest` | Background jobs |
| Resend | `/resend/resend-node` | Email |
| Upstash Redis | `/upstash/docs` | Caching, rate limiting |

### Kapan Menggunakan Context7

✅ **GUNAKAN Context7 ketika:**
- Implementasi fitur baru dengan library tertentu
- Tidak yakin API/syntax terbaru dari library
- Perlu contoh code yang up-to-date
- Debugging issue terkait library
- Mencari best practices penggunaan library

❌ **TIDAK PERLU Context7 ketika:**
- Sudah familiar dengan implementasi
- Task tidak melibatkan library external
- Hanya refactoring kode existing

### Contoh Penggunaan

#### Contoh 1: Implementasi Supabase Auth

```
1. Resolve library ID:
   mcp_context7_resolve-library-id
   - libraryName: "supabase"
   - query: "authentication with Next.js app router"

2. Query dokumentasi:
   mcp_context7_query-docs
   - libraryId: "/supabase/supabase"
   - query: "How to implement email/password auth with Next.js App Router and cookies"
```

#### Contoh 2: Prisma dengan Supabase

```
1. Resolve library ID:
   mcp_context7_resolve-library-id
   - libraryName: "prisma"
   - query: "connection pooling with supabase"

2. Query dokumentasi:
   mcp_context7_query-docs
   - libraryId: "/prisma/docs"
   - query: "How to configure Prisma with Supabase PostgreSQL connection pooler for serverless"
```

#### Contoh 3: TanStack Query Mutations

```
1. Query dokumentasi (sudah tahu library ID):
   mcp_context7_query-docs
   - libraryId: "/tanstack/query"
   - query: "useMutation with optimistic updates and error handling"
```

#### Contoh 4: Inngest Background Jobs

```
1. Query dokumentasi:
   mcp_context7_query-docs
   - libraryId: "/inngest/inngest"
   - query: "Step functions with retries and error handling in Next.js"
```

### Query Tips untuk Context7

| Tipe Query | Contoh Query yang Baik |
|------------|------------------------|
| **Setup/Config** | "How to configure [library] with [environment]" |
| **Implementation** | "How to implement [feature] using [method]" |
| **Best Practices** | "[feature] best practices and patterns" |
| **Error Handling** | "Error handling for [operation] in [library]" |
| **Migration** | "Migration from [old version] to [new version]" |

### Workflow dengan Context7

```
Saat implementasi fitur:

1. Identifikasi library yang dibutuhkan
   ↓
2. Query Context7 untuk dokumentasi terbaru
   ↓
3. Implementasi berdasarkan dokumentasi
   ↓
4. Jika ada error, query Context7 untuk troubleshooting
```

### Catatan Penting

1. **Batasan Query**: Maksimal 3 panggilan per pertanyaan
2. **Jika Library Tidak Ditemukan**: Gunakan `resolve-library-id` terlebih dahulu
3. **Cache Mental**: Simpan pola-pola umum yang sudah dipelajari
4. **Versi Spesifik**: Bisa query versi spesifik dengan format `/org/project/version`

---

## 19. 🛠️ MCP Tools Lainnya yang Tersedia

### Exa Search (untuk riset)
- `mcp_exa_web_search_exa` - Web search
- `mcp_exa_get_code_context_exa` - Cari contoh kode
- `mcp_exa_company_research_exa` - Riset company

### Sequential Thinking (untuk problem solving)
- `mcp_sequential-thinking_sequentialthinking` - Untuk memecah masalah kompleks

### Kapan Menggunakan:
- **Context7**: Dokumentasi library (PRIORITAS UTAMA)
- **Exa Code**: Cari contoh implementasi di real projects
- **Exa Web**: Cari artikel/tutorial terbaru
- **Sequential Thinking**: Analisis masalah kompleks step-by-step

---

*Dokumen ini adalah panduan utama untuk LLM dalam mengerjakan project BSC Event Ticketing Platform. Update dokumen ini seiring perkembangan project.*

---

**Last Updated**: 9 Januari 2026  
**Version**: 1.2  
**Document Created For**: LLM Context & Guidance
