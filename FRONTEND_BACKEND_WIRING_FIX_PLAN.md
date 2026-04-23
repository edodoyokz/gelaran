# Frontend/Backend Wiring Fix Plan

Date: 2026-04-02
Repo: `/home/luckyn00b/Documents/PROJECT/BSC-FINAL`
Source audit: `FRONTEND_BACKEND_WIRING_REPORT.md`

## Goal

Fix the highest-risk frontend/backend wiring issues first, in an order that reduces cascading failures and avoids patching symptoms before the identity/auth model is stabilized.

---

## Executive Order of Work

1. **Unify auth identity mapping between Supabase and Prisma**
2. **Fix broken backend/frontend route contracts**
3. **Repair password recovery/auth callback flow**
4. **Normalize env contracts and shared service initialization**
5. **Strengthen auth boundaries and route guard patterns**
6. **Add focused verification tests and smoke checks**

---

## Phase 1 — Identity Model Stabilization (Highest Priority)

### Why first
This is the root issue behind booking ownership, payment authorization, reviews, waitlists, organizer/admin checks, and other user-scoped flows. If this is not fixed first, downstream fixes may still behave inconsistently.

### Objective
Ensure all Prisma relations use **local Prisma `User.id`**, never raw Supabase `user.id`, unless the schema is explicitly redesigned to store the external auth subject separately.

### Target areas
- `lib/auth/route-auth.ts`
- `app/api/profile/route.ts`
- `app/api/bookings/route.ts`
- `app/api/my-bookings/route.ts`
- `app/api/payments/route.ts`
- `app/api/events/[slug]/reviews/route.ts`
- `app/api/events/[slug]/waitlist/route.ts`
- `app/api/admin/tax-rates/route.ts`
- `app/api/organizer/events/[id]/seating/sections/route.ts`
- `app/api/tickets/[ticketId]/transfer/route.ts`
- any other route using `supabase.auth.getUser().data.user.id` directly for Prisma ownership

### Implementation plan

#### 1.1 Introduce one canonical authenticated-user resolver
Create or strengthen a shared server helper that returns:
- Supabase auth user
- local Prisma user
- local Prisma user id
- role / ownership context if needed

Suggested shape:
```ts
{
  authUser,
  dbUser,
  dbUserId,
  email,
}
```

This helper should:
- read the Supabase session
- require a verified email when app logic depends on local user mapping
- resolve the Prisma user by email (or by an explicit `supabaseUserId` column if later added)
- fail consistently when the local app user cannot be resolved

#### 1.2 Replace raw `user.id` writes in Prisma relations
Search and replace all user-scoped Prisma mutations/queries that do this pattern:
- `user.id`
- `session.user.id`
- `supabase.auth.getUser().data.user.id`

When the destination field is a Prisma relation to `User`, change them to use:
- `dbUser.id`

#### 1.3 Standardize ownership checks
Any ownership check like:
```ts
booking.userId !== user.id
```
should become:
```ts
booking.userId !== dbUser.id
```

#### 1.4 Decide whether external auth subject should be persisted
Optional but recommended:
- add a dedicated column such as `supabaseUserId` on Prisma `User`
- keep `User.id` as internal app identity
- use `supabaseUserId` only as external-auth linkage, not as relation primary key

This is safer long-term than relying only on email matching.

### Acceptance criteria
- booking creation stores Prisma `User.id`
- `/api/my-bookings` returns newly created bookings for the same authenticated user
- payment ownership check passes for the same user who created the booking
- review creation and waitlist lookup/delete operate on the same local app identity
- no user-scoped Prisma relation is written with raw Supabase subject IDs

---

## Phase 2 — Repair Broken Route Contracts (High Priority)

### Why second
These are concrete wiring breaks visible to users and organizers. Once identity is stable, route-level contract mismatches are the next most damaging issues.

### Workstream 2A — Missing upload endpoint

#### Problem
Frontend venue editor posts to `/api/upload`, but no such backend route exists.

#### Target areas
- `components/organizer/venue-editor/ImageTracer.tsx`
- `app/api/upload/route.ts` (to be created) or actual intended upload target
- any storage integration in `lib/`

#### Implementation options

**Option A — create `/api/upload`**
- implement a route handler that accepts the expected file payload
- upload to the existing storage provider
- return the shape expected by `onImageUpload`

**Option B — repoint frontend**
- if there is already another upload/storage endpoint, update `ImageTracer.tsx` to use it

#### Acceptance criteria
- venue editor upload request resolves successfully
- returned uploaded file URL is consumed by the frontend without additional patching
- no organizer upload action points to a missing API route

---

### Workstream 2B — POS callback pages

#### Problem
Backend points checkout callbacks to pages that appear not to exist.

#### Missing routes
- `/pos/payment-success`
- `/pos/payment-failed`
- `/pos/payment-pending`

#### Target areas
- `app/api/pos/sell/route.ts`
- `app/pos/payment-success/page.tsx` (create if needed)
- `app/pos/payment-failed/page.tsx` (create if needed)
- `app/pos/payment-pending/page.tsx` (create if needed)

#### Implementation plan
- decide whether to create these pages or change the callback targets to existing pages
- if pages are created, ensure they can recover relevant transaction context
- make success/pending/failure states consistent with cashier UX

#### Acceptance criteria
- Midtrans callback target always resolves to a real route
- success/pending/failure each render a valid UI
- cashier flow no longer ends in 404 after payment redirect

---

### Workstream 2C — Broken navigation targets

#### Problems already identified
- `/organizer/events/create` should likely be `/organizer/events/new`
- `/partner` appears missing

#### Target areas
- `app/organizer/gate/page.tsx`
- `components/customer/CustomerHeader.tsx`
- route inventory under `app/`

#### Implementation plan
- fix or remove links that target non-existent routes
- verify empty-state CTAs and header navigation against the actual app tree

#### Acceptance criteria
- primary navigation and empty-state CTAs do not land on 404s

---

## Phase 3 — Password Recovery and Auth Callback Repair

### Why third
This is important for auth completeness, but less systemically dangerous than the identity mismatch and route breakages above.

### Problem
Forgot-password points to `/reset-password`, but code exchange appears to happen in `/auth/callback`, creating a likely mismatch in the recovery flow.

### Target areas
- `app/(auth)/forgot-password/page.tsx`
- `app/(auth)/reset-password/page.tsx`
- `app/auth/callback/route.ts`
- Supabase auth redirect configuration

### Implementation plan

#### Option A — route recovery through callback first
- recovery email link lands on `/auth/callback`
- callback exchanges the code
- callback redirects to `/reset-password`
- reset page assumes session already exists

#### Option B — let reset page exchange the code directly
- `/reset-password` handles recovery params and performs code exchange itself
- callback route remains for generic auth flows only

### Recommendation
Prefer **Option A** if the app already centralizes code exchange in `app/auth/callback/route.ts`.

### Acceptance criteria
- password recovery link consistently yields a usable reset session
- reset-password UI is not shown without a valid recovery/auth state

---

## Phase 4 — Env Contract Normalization

### Why fourth
Env drift causes fragile runtime behavior and complicates deployment, but should be fixed after the primary user-facing wiring breaks.

### Problems
- Prisma init depends on unrelated env values
- some routes bypass shared env helpers
- sender/base-url env names are inconsistent

### Target areas
- `lib/env.ts`
- `lib/prisma/client.ts`
- `lib/email/client.ts`
- `app/auth/callback/route.ts`
- `app/api/events/[slug]/waitlist/route.ts`
- `app/api/tickets/[ticketId]/transfer/route.ts`
- `.env.example`

### Implementation plan

#### 4.1 Split env access by domain
Refactor `lib/env.ts` into smaller accessors such as:
- `getDatabaseEnv()`
- `getSupabaseServerEnv()`
- `getEmailEnv()`
- `getAppUrlEnv()`

#### 4.2 Decouple Prisma from optional integrations
`lib/prisma/client.ts` should not require:
- `RESEND_API_KEY`
- `EMAIL_FROM`
- `SUPABASE_SERVICE_ROLE_KEY`

unless Prisma truly needs them at module init time.

#### 4.3 Standardize sender/base-url names
Choose one canonical set, for example:
- `EMAIL_FROM`
- `NEXT_PUBLIC_APP_URL`

Then update all routes/helpers to use only that contract.

#### 4.4 Remove raw `process.env` access in critical auth/email code
Use validated env helpers instead of scattered direct reads.

### Acceptance criteria
- Prisma loads with DB-only requirements
- auth callback uses validated env access
- waitlist and ticket/email flows use the same sender/base-url contract
- `.env.example` matches actual code usage

---

## Phase 5 — Auth Boundary Hardening

### Why fifth
After core bugs are fixed, tighten the boundaries so the same classes of mistakes do not reappear.

### Problems
- customer auth boundary is heavily client-side
- auth coverage test is too weak to catch wrong identity usage

### Target areas
- `app/(customer)/layout.tsx`
- `lib/supabase/server.ts`
- root `middleware.ts` (create if appropriate)
- `lib/auth/route-auth-coverage.test.ts`

### Implementation plan

#### 5.1 Move more protection server-side
- protect customer-area routes via server boundary where possible
- add session refresh middleware if Supabase SSR depends on it

#### 5.2 Strengthen auth coverage tests
Current tests should no longer treat raw `supabase.auth.getUser()` as “good enough”.

Require patterns such as:
- shared auth helper usage
- local Prisma user resolution for ownership routes
- explicit role helper usage for admin/organizer paths

### Acceptance criteria
- protected pages do not rely solely on client-side `useEffect` redirects
- CI tests fail if a user-scoped route uses raw Supabase ID against Prisma relations

---

## Phase 6 — Verification Checklist / Tests

### Why last
After fixes are in place, validate the actual behavior end-to-end.

### Minimum test matrix

#### Identity/auth tests
- authenticated user creates booking
- same user sees booking in my-bookings
- same user can create payment for that booking
- same user can submit review where allowed
- same user can create/read/delete waitlist entry

#### Route contract tests
- organizer venue layout upload succeeds
- POS payment success route resolves
- POS payment failure route resolves
- POS payment pending route resolves
- organizer CTA target resolves
- customer header links resolve

#### Recovery/auth tests
- forgot password email lands on valid reset flow
- reset page only appears with valid recovery state

#### Env/config tests
- app boots with only required env for DB routes
- email features fail clearly and locally when email env is absent

---

## Suggested Execution Sequence by Commit

### Commit 1 — auth identity foundation
- add/strengthen shared authenticated Prisma-user resolver
- refactor key user-scoped routes to use local Prisma user id

### Commit 2 — booking/payment/review/waitlist consistency
- patch all confirmed user-ownership handlers
- verify booking -> my-bookings -> payments path

### Commit 3 — upload + POS route contracts
- add/fix `/api/upload`
- add/fix POS callback pages
- fix broken nav targets

### Commit 4 — password recovery flow
- unify callback/reset-password behavior

### Commit 5 — env cleanup
- split env helpers
- decouple Prisma init
- standardize sender/base-url names

### Commit 6 — auth boundary + test hardening
- improve route coverage tests
- add middleware/server-side auth hardening if needed
- add route smoke tests

---

## Fastest Path to Risk Reduction

If time is limited, do these first:

1. Fix identity mapping in booking/payment/review/waitlist paths
2. Add/fix `/api/upload`
3. Add/fix POS callback pages
4. Fix organizer/customer dead links
5. Repair password recovery callback flow

That sequence should eliminate the most user-visible and revenue-affecting breakages earliest.

---

## Definition of Done

This audit can be considered resolved when:
- all Prisma relations consistently use the local Prisma user identity
- all referenced frontend/backend routes exist and return valid responses/pages
- auth recovery flow works from email link to password update
- env configuration is centralized and consistent
- route/auth tests fail on future identity-mapping regressions
- major user flows can be verified without 404, unauthorized mismatch, or missing backend handler errors
