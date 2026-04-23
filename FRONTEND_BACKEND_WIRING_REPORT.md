# Frontend/Backend Wiring Audit

Date: 2026-04-02
Repo: `/home/luckyn00b/Documents/PROJECT/BSC-FINAL`
Scope: frontend/backend wiring audit based on static file inspection of routes, API handlers, auth/data flow, env usage, Prisma integration, and client/server boundaries. No code changes were made.

## Executive Summary

The frontend/backend wiring is not fully correct. The highest-risk issue is an identity mismatch between Supabase auth users and Prisma `users.id`, and it affects booking ownership, payments, reviews, waitlists, organizer ownership checks, and admin flows. There are also concrete broken UI-to-backend links, including a missing `/api/upload` endpoint, POS callback URLs that target pages that do not exist, and several dead navigation targets. In addition, Prisma initialization is operationally coupled to unrelated env vars, and the password recovery flow appears miswired around the auth callback exchange step.

## Findings

### 1. Critical: Supabase auth IDs are being mixed with Prisma `users.id`

**Why this is broken**

The codebase has two identity sources:

- Prisma `User.id` is a database-generated UUID, not sourced from Supabase: [prisma/schema.prisma](/home/luckyn00b/Documents/PROJECT/BSC-FINAL/prisma/schema.prisma#L11)
- The app’s central auth helper resolves the current app user by `email` and returns the Prisma user ID: [lib/auth/route-auth.ts](/home/luckyn00b/Documents/PROJECT/BSC-FINAL/lib/auth/route-auth.ts#L20)
- Profile bootstrap also creates local Prisma users by `email` and lets Prisma generate the ID: [app/api/profile/route.ts](/home/luckyn00b/Documents/PROJECT/BSC-FINAL/app/api/profile/route.ts#L33)

However, multiple routes persist or query relational fields using `supabase.auth.getUser().data.user.id` directly:

- Booking creation writes `userId: user?.id || null`: [app/api/bookings/route.ts](/home/luckyn00b/Documents/PROJECT/BSC-FINAL/app/api/bookings/route.ts#L353)
- User bookings list reads bookings by local Prisma ID `dbUser.id`: [app/api/my-bookings/route.ts](/home/luckyn00b/Documents/PROJECT/BSC-FINAL/app/api/my-bookings/route.ts#L20)
- Payment creation authorizes ownership by comparing `booking.userId` against local Prisma `dbUser.id`: [app/api/payments/route.ts](/home/luckyn00b/Documents/PROJECT/BSC-FINAL/app/api/payments/route.ts#L128)
- Reviews query and create `Review.userId` from `user.id`, even though `Review.userId` is a Prisma `User` relation: [prisma/schema.prisma](/home/luckyn00b/Documents/PROJECT/BSC-FINAL/prisma/schema.prisma#L478), [app/api/events/[slug]/reviews/route.ts](/home/luckyn00b/Documents/PROJECT/BSC-FINAL/app/api/events/%5Bslug%5D/reviews/route.ts#L155)
- Waitlist stores and queries `WaitlistEntry.userId` from `user.id`: [prisma/schema.prisma](/home/luckyn00b/Documents/PROJECT/BSC-FINAL/prisma/schema.prisma#L599), [app/api/events/[slug]/waitlist/route.ts](/home/luckyn00b/Documents/PROJECT/BSC-FINAL/app/api/events/%5Bslug%5D/waitlist/route.ts#L104), [app/api/events/[slug]/waitlist/route.ts](/home/luckyn00b/Documents/PROJECT/BSC-FINAL/app/api/events/%5Bslug%5D/waitlist/route.ts#L306)

**Impact**

- Authenticated bookings can be created under a Supabase subject ID and then disappear from `/api/my-bookings`.
- `/api/payments` can reject the same authenticated user as “you don't own this booking”.
- Review creation can fail relational integrity or fail to match existing local user-linked data.
- Waitlist “my entry” lookup and delete can miss entries created under the wrong identity.

**Recommended fix**

Normalize all authenticated route handlers onto one app-user resolver path:

- Resolve the local Prisma user first, by email or an explicit synced external-auth mapping.
- Persist only Prisma `users.id` in Prisma relations like `Booking.userId`, `Review.userId`, `Wishlist.userId`, `Notification.userId`, `OrganizerFollower.userId`, etc.
- Add integration tests covering create-booking -> list-bookings -> pay-booking for an authenticated user.

### 2. High: Prisma client initialization eagerly depends on unrelated server env vars

**Evidence**

- Prisma client reads `getServerEnv()` at module import time: [lib/prisma/client.ts](/home/luckyn00b/Documents/PROJECT/BSC-FINAL/lib/prisma/client.ts#L1)
- `getServerEnv()` requires not only DB config, but also `SUPABASE_SERVICE_ROLE_KEY`, `RESEND_API_KEY`, and `EMAIL_FROM`: [lib/env.ts](/home/luckyn00b/Documents/PROJECT/BSC-FINAL/lib/env.ts#L27)

**Why this is risky**

Any route importing Prisma can fail during module evaluation if a non-DB feature env var is missing, even when that route does not use email delivery or the Supabase service role.

**Impact**

- DB-backed routes become operationally coupled to optional integrations.
- Misconfigured email or service-role env can take down unrelated API handlers.

**Recommended fix**

- Split env access by feature area, for example `getDatabaseEnv()`, `getEmailEnv()`, `getSupabaseEnv()`.
- Keep Prisma initialization dependent only on DB config and `NODE_ENV`.

### 3. Medium: Auth callback bypasses central env validation

**Evidence**

- The callback route constructs a Supabase client from raw `process.env.NEXT_PUBLIC_SUPABASE_URL!` and `process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!`: [app/auth/callback/route.ts](/home/luckyn00b/Documents/PROJECT/BSC-FINAL/app/auth/callback/route.ts#L13)
- The rest of the server-side integration has a centralized env parser with explicit validation errors: [lib/env.ts](/home/luckyn00b/Documents/PROJECT/BSC-FINAL/lib/env.ts#L15)

**Impact**

- Missing or misnamed Supabase env vars fail in the callback path with raw non-null assertions instead of a consistent, validated configuration error.
- This makes auth bootstrap behavior less predictable than the rest of the backend.

**Recommended fix**

- Use the same env access layer in `app/auth/callback/route.ts` that the rest of the backend uses.

### 4. Medium: Waitlist email flow bypasses the centralized email client and uses a different env contract

**Evidence**

- Shared email client uses `getServerEnv()` and `EMAIL_FROM`: [lib/email/client.ts](/home/luckyn00b/Documents/PROJECT/BSC-FINAL/lib/email/client.ts#L4)
- Waitlist route creates its own `Resend` client directly from `process.env.RESEND_API_KEY`: [app/api/events/[slug]/waitlist/route.ts](/home/luckyn00b/Documents/PROJECT/BSC-FINAL/app/api/events/%5Bslug%5D/waitlist/route.ts#L1)
- Waitlist route sends from `process.env.RESEND_FROM_EMAIL || "noreply@gelaran.id"` instead of the shared `EMAIL_FROM`: [app/api/events/[slug]/waitlist/route.ts](/home/luckyn00b/Documents/PROJECT/BSC-FINAL/app/api/events/%5Bslug%5D/waitlist/route.ts#L115)

**Impact**

- Sender configuration is inconsistent across the app.
- Waitlist emails can silently use a different sender identity than booking confirmation emails.
- Central env validation does not fully protect this route’s email behavior.

**Recommended fix**

- Reuse the shared email client/config layer for waitlist confirmation mail.
- Standardize on one sender env contract.

### 5. Medium: Auth coverage test is too weak to detect broken authorization or identity wiring

**Evidence**

- The auth coverage test treats a route as “guarded” if its source merely contains `supabase.auth.getUser(`: [lib/auth/route-auth-coverage.test.ts](/home/luckyn00b/Documents/PROJECT/BSC-FINAL/lib/auth/route-auth-coverage.test.ts#L29)
- It does not require role checks, local Prisma user resolution, or use of the shared auth helper.

**Impact**

- Routes can pass the guard test while still using the wrong identity model or missing role enforcement.
- This makes it easy for the broken auth/data-link pattern above to survive CI.

**Recommended fix**

- Tighten the test so admin and organizer routes must use `requireAdmin`, `requireOrganizer`, or a shared helper returning the local Prisma user.
- Add targeted tests for ownership checks on user-scoped routes.

### 6. High: Organizer venue-layout upload is wired to a missing API route

**Evidence**

- The organizer venue editor uploads layout images to `/api/upload`: [components/organizer/venue-editor/ImageTracer.tsx](/home/luckyn00b/Documents/PROJECT/BSC-FINAL/components/organizer/venue-editor/ImageTracer.tsx#L53)
- There is no matching `app/api/upload/route.ts` or `app/api/upload/*` route in the repo root `app/api` tree.

**Impact**

- Venue layout image upload is dead on arrival.
- The seating-chart UI can present an upload control that has no backend handler, so organizers cannot complete that part of the setup flow.

**Recommended fix**

- Implement the missing upload route, or repoint the frontend to the actual storage/upload endpoint if one already exists elsewhere.
- Add a UI-level integration test that verifies a successful upload returns a URL consumed by `onImageUpload`.

### 7. High: POS payment callbacks target pages that do not exist

**Evidence**

- POS payment creation uses Midtrans callbacks that redirect to:
  - `/pos/payment-success`
  - `/pos/payment-failed`
  - `/pos/payment-pending`
  Evidence: [app/api/pos/sell/route.ts](/home/luckyn00b/Documents/PROJECT/BSC-FINAL/app/api/pos/sell/route.ts#L357), [app/api/pos/sell/route.ts](/home/luckyn00b/Documents/PROJECT/BSC-FINAL/app/api/pos/sell/route.ts#L659)
- The only `app/pos` pages present are:
  - [app/pos/page.tsx](/home/luckyn00b/Documents/PROJECT/BSC-FINAL/app/pos/page.tsx)
  - [app/pos/access/page.tsx](/home/luckyn00b/Documents/PROJECT/BSC-FINAL/app/pos/access/page.tsx)

**Impact**

- Successful, failed, or pending POS payment redirects can land on 404 pages.
- That breaks the cashier flow after checkout and makes payment-state recovery harder.

**Recommended fix**

- Add the missing `/pos/payment-success`, `/pos/payment-failed`, and `/pos/payment-pending` pages, or update the callback URLs to existing POS result screens.
- Test the POS flow end-to-end with both success and pending states.

### 8. Medium: Password recovery flow appears miswired around the code-exchange callback

**Evidence**

- Forgot-password sends users to `/reset-password`: [app/(auth)/forgot-password/page.tsx](/home/luckyn00b/Documents/PROJECT/BSC-FINAL/app/%28auth%29/forgot-password/page.tsx#L31)
- The reset-password page only checks whether recovery params or a session exist; it does not exchange a recovery `code` for a session: [app/(auth)/reset-password/page.tsx](/home/luckyn00b/Documents/PROJECT/BSC-FINAL/app/%28auth%29/reset-password/page.tsx#L46)
- The actual code-exchange logic lives in the auth callback route: [app/auth/callback/route.ts](/home/luckyn00b/Documents/PROJECT/BSC-FINAL/app/auth/callback/route.ts#L10)

**Impact**

- If Supabase sends a code-based recovery link to `/reset-password` directly, the client may show the form without a usable session.
- Password reset behavior can depend on provider URL mode or hash/session state instead of one explicit, reliable flow.

**Recommended fix**

- Standardize recovery links to flow through `/auth/callback` and then forward to `/reset-password`.
- Alternatively, teach `/reset-password` to exchange the recovery code explicitly before allowing password update.

### 9. Medium: Broken navigation links leave the frontend pointing at missing routes

**Evidence**

- Organizer gate page routes empty-state CTA to `/organizer/events/create`: [app/organizer/gate/page.tsx](/home/luckyn00b/Documents/PROJECT/BSC-FINAL/app/organizer/gate/page.tsx#L117)
- The actual organizer event creation page is `/organizer/events/new`: [app/organizer/events/new/page.tsx](/home/luckyn00b/Documents/PROJECT/BSC-FINAL/app/organizer/events/new/page.tsx)
- Customer header links to `/partner`: [components/customer/CustomerHeader.tsx](/home/luckyn00b/Documents/PROJECT/BSC-FINAL/components/customer/CustomerHeader.tsx#L81)
- No `app/partner` route exists in the app tree.

**Impact**

- Users hit 404s from first-party navigation instead of valid product flows.
- These are small issues individually, but they reduce trust and suggest the route inventory is not fully aligned with the UI.

**Recommended fix**

- Update the organizer CTA to `/organizer/events/new`.
- Remove, hide, or implement the `/partner` destination.
- Add a route-link smoke test for primary navigation and empty-state CTAs.

### 10. Low: Customer auth boundary is client-only and there is no middleware-backed session refresh

**Evidence**

- Customer layout is a client component that performs auth checks in `useEffect` after render: [app/(customer)/layout.tsx](/home/luckyn00b/Documents/PROJECT/BSC-FINAL/app/%28customer%29/layout.tsx#L53)
- `lib/supabase/server.ts` explicitly notes that cookie write failures can be ignored if middleware refreshes sessions: [lib/supabase/server.ts](/home/luckyn00b/Documents/PROJECT/BSC-FINAL/lib/supabase/server.ts#L19)
- No root `middleware.ts` was present during inspection.

**Impact**

- Customer pages rely on client-side redirect behavior rather than server-side protection.
- That can produce auth flicker, stale session behavior, or inconsistent handling between direct loads and client transitions.

**Recommended fix**

- Move customer-area protection to a server boundary where possible.
- Add middleware-based session refresh if Supabase SSR flows depend on it.

## Additional Observations

- Several routes use `RESEND_FROM_EMAIL` and `NEXT_PUBLIC_BASE_URL`, while the shared env layer and `.env.example` standardize on `EMAIL_FROM` and `NEXT_PUBLIC_APP_URL`: [lib/env.ts](/home/luckyn00b/Documents/PROJECT/BSC-FINAL/lib/env.ts#L27), [lib/email/client.ts](/home/luckyn00b/Documents/PROJECT/BSC-FINAL/lib/email/client.ts#L7), [app/api/tickets/[ticketId]/transfer/route.ts](/home/luckyn00b/Documents/PROJECT/BSC-FINAL/app/api/tickets/%5BticketId%5D/transfer/route.ts#L167), [app/api/events/[slug]/waitlist/route.ts](/home/luckyn00b/Documents/PROJECT/BSC-FINAL/app/api/events/%5Bslug%5D/waitlist/route.ts#L117), [.env.example](/home/luckyn00b/Documents/PROJECT/BSC-FINAL/.env.example#L47)
- Static inspection also found direct organizer/admin ownership checks against `user.id` in route families such as tax rates, organizer seating sections, reviews, ticket transfers, and waitlists, which reinforces the central identity mismatch rather than being isolated cases: [app/api/admin/tax-rates/route.ts](/home/luckyn00b/Documents/PROJECT/BSC-FINAL/app/api/admin/tax-rates/route.ts#L27), [app/api/organizer/events/[id]/seating/sections/route.ts](/home/luckyn00b/Documents/PROJECT/BSC-FINAL/app/api/organizer/events/%5Bid%5D/seating/sections/route.ts#L36), [app/api/events/[slug]/reviews/route.ts](/home/luckyn00b/Documents/PROJECT/BSC-FINAL/app/api/events/%5Bslug%5D/reviews/route.ts#L155), [app/api/tickets/[ticketId]/transfer/route.ts](/home/luckyn00b/Documents/PROJECT/BSC-FINAL/app/api/tickets/%5BticketId%5D/transfer/route.ts#L85)

## Verification Notes

- This audit was based on static inspection of route handlers, auth helpers, env parsing, Supabase integration, email integration, and Prisma schema/client wiring.
- Runtime verification was limited by the environment:
  - `pnpm` was not available on `PATH`.
  - The repo expects `pnpm` according to [README.md](/home/luckyn00b/Documents/PROJECT/BSC-FINAL/README.md#L17) and [package.json](/home/luckyn00b/Documents/PROJECT/BSC-FINAL/package.json#L15).
  - Attempting to fall back to `corepack pnpm` could not complete because registry access was unavailable in the sandbox (`ENOTFOUND registry.npmjs.org`).
- Because of that, no typecheck, lint, or end-to-end verification scripts were executed during this audit.
