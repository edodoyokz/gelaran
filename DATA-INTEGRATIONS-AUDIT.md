# 📊 Data Layer & Integrations Audit Report

**Date:** 2026-02-09  
**Auditor:** Kilo Code  
**Project:** BSC Event Ticketing Platform (Gelaran)

---

## 1. Prisma Schema Health

### ✅ Validation Results

```bash
pnpm prisma validate
# Result: The schema at prisma/schema.prisma is valid 🚀

pnpm prisma generate
# Result: ✔ Generated Prisma Client (v6.19.1) in 534ms
```

### ⚠️ Deprecation Warnings

| Warning | Location | Recommendation |
|---------|----------|----------------|
| `package.json#prisma` deprecated | [`package.json:12-14`](package.json:12) | Migrate to `prisma.config.ts` before Prisma 7 |
| Prisma version outdated | v6.19.1 → v7.3.0 available | Follow [upgrade guide](https://pris.ly/d/major-version-upgrade) |

---

## 2. Core Models Constraints Audit

### ✅ Well-Defined Constraints

| Model | Constraint | Schema Line |
|-------|------------|-------------|
| `User.email` | `@unique` | [`prisma/schema.prisma:21`](prisma/schema.prisma:21) |
| `User.phone` | `@unique` (nullable) | [`prisma/schema.prisma:22`](prisma/schema.prisma:22) |
| `Booking.bookingCode` | `@unique` | [`prisma/schema.prisma:407`](prisma/schema.prisma:407) |
| `BookedTicket.uniqueCode` | `@unique` | [`prisma/schema.prisma:480`](prisma/schema.prisma:480) |
| `Transaction.bookingId` | `@unique` (1:1) | [`prisma/schema.prisma:511`](prisma/schema.prisma:511) |
| `Transaction.transactionCode` | `@unique` | [`prisma/schema.prisma:512`](prisma/schema.prisma:512) |
| `Payout.payoutCode` | `@unique` | [`prisma/schema.prisma:619`](prisma/schema.prisma:619) |
| `Event.slug` | `@unique` | [`prisma/schema.prisma:192`](prisma/schema.prisma:192) |
| `Category.slug` | `@unique` | [`prisma/schema.prisma:143`](prisma/schema.prisma:143) |
| `Venue.slug` | `@unique` | [`prisma/schema.prisma:163`](prisma/schema.prisma:163) |
| `OrganizerProfile.organizationSlug` | `@unique` | [`prisma/schema.prisma:60`](prisma/schema.prisma:60) |
| `Seat` | `@@unique([rowId, seatNumber])` | [`prisma/schema.prisma:1234`](prisma/schema.prisma:1234) |
| `Wishlist` | `@@unique([userId, eventId])` | [`prisma/schema.prisma:690`](prisma/schema.prisma:690) |
| `EventDeviceSession` | `@@unique([eventId, sessionType])` | [`prisma/schema.prisma:741`](prisma/schema.prisma:741) |
| `OrganizerTeamMember` | `@@unique([organizerProfileId, userId])` | [`prisma/schema.prisma:810`](prisma/schema.prisma:810) |
| `EventTag` | `@@unique([eventId, tagId])` | [`prisma/schema.prisma:897`](prisma/schema.prisma:897) |
| `EventPerformer` | `@@unique([eventId, performerId])` | [`prisma/schema.prisma:958`](prisma/schema.prisma:958) |
| `EventSponsor` | `@@unique([eventId, sponsorId])` | [`prisma/schema.prisma:995`](prisma/schema.prisma:995) |
| `AttendeeAnswer` | `@@unique([bookedTicketId, questionId])` | [`prisma/schema.prisma:1073`](prisma/schema.prisma:1073) |
| `OrganizerFollower` | `@@unique([organizerProfileId, userId])` | [`prisma/schema.prisma:1282`](prisma/schema.prisma:1282) |

### ⚠️ Missing Constraints / Risks

| Risk | Description | Location | Impact |
|------|-------------|----------|--------|
| **No unique constraint on Review** | `Review` lacks `@@unique([userId, eventId])` - user could submit multiple reviews for same event | [`prisma/schema.prisma:654-671`](prisma/schema.prisma:654) | **MEDIUM** - Business logic issue |
| **No unique constraint on VenueRow** | `VenueRow` lacks `@@unique([sectionId, rowLabel])` - duplicate row labels possible | [`prisma/schema.prisma:1200-1212`](prisma/schema.prisma:1200) | **LOW** - Data quality issue |
| **TaxRate.isDefault not enforced** | Multiple tax rates could have `isDefault: true` - no partial unique index | [`prisma/schema.prisma:1088`](prisma/schema.prisma:1088) | **MEDIUM** - Logic depends on "first default" |
| **CommissionSetting scope ambiguity** | Both `organizerId` and `eventId` are nullable - no clear priority hierarchy | [`prisma/schema.prisma:1102-1103`](prisma/schema.prisma:1102) | **MEDIUM** - Need application-level priority logic |
| **PromoCode.code case sensitivity** | Code uniqueness is case-sensitive by default in Postgres | [`prisma/schema.prisma:359`](prisma/schema.prisma:359) | **LOW** - "PROMO1" ≠ "promo1" |

### ✅ Seating System Constraints

- `Seat.@@unique([rowId, seatNumber])` - ✅ Prevents duplicate seat numbers per row
- `Seat.version` field for optimistic locking - ✅ Added in migration [`prisma/migrations/20260126_optimistic_locking/migration.sql`](prisma/migrations/20260126_optimistic_locking/migration.sql)

---

## 3. Migrations Audit

### Migration Files

| Migration | Type | Purpose |
|-----------|------|---------|
| [`prisma/migrations/20250126_initial_schema/migration.sql`](prisma/migrations/20250126_initial_schema/migration.sql) | Prisma-managed | Full schema creation with 55+ indexes |
| [`prisma/migrations/20260126_optimistic_locking/migration.sql`](prisma/migrations/20260126_optimistic_locking/migration.sql) | Prisma-managed | Add `version` column to seats |
| [`prisma/migrations/manual_phase3_venue_editor.sql`](prisma/migrations/manual_phase3_venue_editor.sql) | **MANUAL** | VenueLayout + SectionType additions |

### ⚠️ Migration Risks

| Risk | Description | Recommendation |
|------|-------------|----------------|
| **Manual migration outside Prisma** | `manual_phase3_venue_editor.sql` is NOT tracked by Prisma migrate | Run via Supabase SQL Editor, then `prisma db pull` to sync |
| **No migration_lock.toml visible** | Standard Prisma lockfile may be missing | Verify with `ls prisma/migrations/` |
| **Future date migration** | `20260126_optimistic_locking` dated 2026 (future) | Naming convention issue only |

### Indexes Coverage

The initial migration includes **55+ indexes** covering all major foreign keys and query patterns:
- All FK columns indexed
- Status/payment columns indexed for filtering
- Slug columns indexed for lookups
- `created_at` indexed on bookings/events

---

## 4. Seed Data Audit

### Seed Script

**Location:** [`prisma/seed.ts`](prisma/seed.ts)  
**Configuration:** [`package.json:13`](package.json:13) → `"seed": "npx tsx prisma/seed.ts"`

### Seed Execution Issues

| Issue | Evidence | Root Cause |
|-------|----------|------------|
| **Connection pool timeout** | [`seed_output.txt`](seed_output.txt), [`seed_attempt_2.txt`](seed_attempt_2.txt) | Supabase pooler timeout during delete operations |

**Error message:**
```
Error in connector: Error querying the database: FATAL: Unable to check out connection from the pool due to timeout
```

**Current mitigation in seed.ts (line 6-12):**
```typescript
const prisma = new PrismaClient({
    datasources: {
        db: {
            url: process.env.DIRECT_URL || process.env.DATABASE_URL,
        },
    },
});
```

### ⚠️ Seed Reproducibility Issues

| Issue | Impact | Recommendation |
|-------|--------|----------------|
| Uses `DIRECT_URL` fallback | Good for bypassing pooler | Ensure `DIRECT_URL` is set in `.env` |
| No idempotency | `deleteMany()` on first run fails if tables empty with FK constraints | Consider using `prisma migrate reset` instead |
| Missing `VoucherTemplate` seed | [`prisma/seed-templates.ts`](prisma/seed-templates.ts) exists but not called | Add to main seed or document separately |

### Demo Accounts (from [`SEED-DATA.md`](SEED-DATA.md))

| Role | Email | Password |
|------|-------|----------|
| SUPER_ADMIN | `admin@gelaran.id` | `password123` |
| ORGANIZER | `info@sriwedari.solo.go.id` | `password123` |
| ORGANIZER | `info@gormanahan.solo.go.id` | `password123` |
| ORGANIZER | `hello@solocreativehub.id` | `password123` |
| ORGANIZER | `contact@solomusicfest.id` | `password123` |
| ORGANIZER | `party@solonightlife.id` | `password123` |
| CUSTOMER | `budi.santoso@email.com` | `password123` |
| CUSTOMER | `siti.nur@email.com` | `password123` |
| CUSTOMER | `ahmad.rizki@email.com` | `password123` |

**✅ Matches [`QUICK-START.md`](QUICK-START.md) documentation**

### Pricing Configuration (from seed)

| Setting | Value | Location |
|---------|-------|----------|
| Tax Rate | PPN 11% (PERCENTAGE) | [`prisma/seed.ts:41-51`](prisma/seed.ts:41) |
| Platform Commission | 5% (PERCENTAGE) | [`prisma/seed.ts:53-59`](prisma/seed.ts:53) |
| Payment Gateway Fee | 2.9% | Hardcoded in application logic |

---

## 5. External Integrations Audit

### Required Environment Variables

| Variable | Used In | Required | Status |
|----------|---------|----------|--------|
| `DATABASE_URL` | [`prisma/schema.prisma:10`](prisma/schema.prisma:10) | ✅ Yes | Present in [`env`](env) |
| `DIRECT_URL` | [`prisma/schema.prisma:11`](prisma/schema.prisma:11), [`prisma/seed.ts:9`](prisma/seed.ts:9) | ✅ Yes | Present in [`env`](env) |
| `NEXT_PUBLIC_SUPABASE_URL` | [`lib/supabase/client.ts:5`](lib/supabase/client.ts:5), [`lib/supabase/server.ts:8`](lib/supabase/server.ts:8) | ✅ Yes | Present in [`env`](env) |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | [`lib/supabase/client.ts:6`](lib/supabase/client.ts:6), [`lib/supabase/server.ts:9`](lib/supabase/server.ts:9) | ✅ Yes | Present in [`env`](env) |
| `SUPABASE_SERVICE_ROLE_KEY` | [`lib/supabase/server.ts:36`](lib/supabase/server.ts:36), [`scripts/setup-storage.ts:5`](scripts/setup-storage.ts:5) | ✅ Yes | Present in [`env`](env) |
| `MIDTRANS_SERVER_KEY` | [`lib/midtrans/client.ts:12`](lib/midtrans/client.ts:12) | ✅ Yes | **⚠️ MISSING in [`env`](env)** |
| `NEXT_PUBLIC_MIDTRANS_CLIENT_KEY` | [`lib/midtrans/client.ts:13`](lib/midtrans/client.ts:13) | ✅ Yes | **⚠️ MISSING in [`env`](env)** |
| `MIDTRANS_IS_PRODUCTION` | [`lib/midtrans/client.ts:7`](lib/midtrans/client.ts:7) | ⚠️ Optional | Defaults to `false` (sandbox) |
| `RESEND_API_KEY` | [`lib/email/client.ts:6`](lib/email/client.ts:6) | ✅ Yes | Present in [`env`](env) |
| `RESEND_FROM_EMAIL` | Multiple API routes | ⚠️ Optional | Defaults to `noreply@gelaran.id` |
| `EMAIL_FROM` | [`lib/email/client.ts:9`](lib/email/client.ts:9) | ⚠️ Optional | Present in [`env`](env) |
| `CRON_SECRET` | [`app/api/cron/*/route.ts`](app/api/cron) | ⚠️ Optional | **⚠️ MISSING** - cron endpoints unprotected |
| `NEXT_PUBLIC_DEMO_MODE` | [`QUICK-START.md`](QUICK-START.md) | ⚠️ Optional | Controls demo login UI |

### ⚠️ Critical Missing Variables

```bash
# Add to .env for Midtrans payments to work:
MIDTRANS_SERVER_KEY="SB-Mid-server-..."
NEXT_PUBLIC_MIDTRANS_CLIENT_KEY="SB-Mid-client-..."
MIDTRANS_IS_PRODUCTION="false"

# Add for cron security:
CRON_SECRET="your-secure-random-string"
```

### Integration Usage Summary

#### Supabase

| Usage | File | Purpose |
|-------|------|---------|
| Browser client | [`lib/supabase/client.ts`](lib/supabase/client.ts) | Client-side auth |
| Server client | [`lib/supabase/server.ts`](lib/supabase/server.ts) | Server-side auth with cookies |
| Service client | [`lib/supabase/server.ts:31-54`](lib/supabase/server.ts:31) | Admin operations (bypasses RLS) |
| Storage setup | [`scripts/setup-storage.ts`](scripts/setup-storage.ts) | Bucket creation |

#### Midtrans

| Usage | File | Purpose |
|-------|------|---------|
| Snap client | [`lib/midtrans/client.ts:10-14`](lib/midtrans/client.ts:10) | Payment popup |
| Core API | [`lib/midtrans/client.ts:17-21`](lib/midtrans/client.ts:17) | Backend payment operations |
| Webhook | [`app/api/payments/webhook/route.ts`](app/api/payments/webhook/route.ts) | Payment notifications |
| Create payment | [`app/api/payments/route.ts`](app/api/payments/route.ts) | Initiate transactions |

#### Resend (Email)

| Usage | File | Purpose |
|-------|------|---------|
| Client | [`lib/email/client.ts`](lib/email/client.ts) | Email sending |
| Waitlist | [`app/api/events/[slug]/waitlist/route.ts`](app/api/events/[slug]/waitlist/route.ts) | Availability notifications |
| Refunds | [`app/api/my-bookings/[code]/refund/route.ts`](app/api/my-bookings/[code]/refund/route.ts) | Refund confirmations |
| Transfers | [`app/api/tickets/[ticketId]/transfer/route.ts`](app/api/tickets/[ticketId]/transfer/route.ts) | Transfer notifications |
| Team invites | [`app/api/organizer/team/route.ts`](app/api/organizer/team/route.ts) | Invitation emails |
| Reminders | [`app/api/cron/send-reminders/route.ts`](app/api/cron/send-reminders/route.ts) | Event reminders |
| Admin refunds | [`app/api/admin/refunds/route.ts`](app/api/admin/refunds/route.ts) | Admin refund notifications |

#### Cron Jobs

| Endpoint | Purpose | Auth |
|----------|---------|------|
| [`/api/cron/cleanup-expired-bookings`](app/api/cron/cleanup-expired-bookings/route.ts) | Expire pending bookings | `CRON_SECRET` (optional check) |
| [`/api/cron/end-past-events`](app/api/cron/end-past-events/route.ts) | Mark ended events | `CRON_SECRET` (optional check) |
| [`/api/cron/send-reminders`](app/api/cron/send-reminders/route.ts) | Send event reminders | `CRON_SECRET` (optional check) |

**⚠️ Security Issue:** If `CRON_SECRET` is not set, cron endpoints are publicly accessible!

---

## 6. Summary of Risks & Gaps

### 🔴 Critical (Must Fix)

| Issue | Impact | Action |
|-------|--------|--------|
| Missing Midtrans env vars | Payments will fail | Add `MIDTRANS_SERVER_KEY`, `NEXT_PUBLIC_MIDTRANS_CLIENT_KEY` |
| Cron endpoints unprotected | Anyone can trigger cleanup/emails | Set `CRON_SECRET` env var |

### 🟡 Medium (Should Fix)

| Issue | Impact | Action |
|-------|--------|--------|
| Seed connection timeout | Seeding fails on pooled connections | Ensure `DIRECT_URL` is set; use `prisma migrate reset` |
| No `@@unique` on Review | Duplicate reviews possible | Add `@@unique([userId, eventId])` or enforce in app |
| Multiple default TaxRates possible | Unpredictable tax application | Add application logic to handle "first active default" |
| Prisma config deprecation | Will break in Prisma 7 | Migrate `package.json#prisma` to `prisma.config.ts` |
| `env` file in repo | Credentials exposed | Rename to `.env`, add to `.gitignore` |

### 🟢 Low (Consider)

| Issue | Impact | Action |
|-------|--------|--------|
| PromoCode case sensitivity | User confusion | Add `LOWER()` index or normalize on insert |
| VenueRow missing unique | Duplicate labels | Add `@@unique([sectionId, rowLabel])` |
| Manual migration not tracked | Drift between schema and DB | Run `prisma db pull` after manual changes |

---

## 7. Recommended Next Steps

1. **Immediate:**
   - Add missing Midtrans env vars to `.env`
   - Add `CRON_SECRET` to `.env` and configure in deployment
   - Rename `env` → `.env` and ensure it's gitignored

2. **Before Production:**
   - Add `@@unique([userId, eventId])` to Review model
   - Create `prisma.config.ts` to replace deprecated config
   - Run full `prisma migrate reset` to verify seed works

3. **Future Improvements:**
   - Add partial unique index for `TaxRate.isDefault`
   - Add case-insensitive unique index for `PromoCode.code`
   - Document commission priority logic (event > organizer > global)

---

*Report generated by automated audit on 2026-02-09*
