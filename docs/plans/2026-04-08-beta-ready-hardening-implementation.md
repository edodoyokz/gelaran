# Beta-Ready Hardening Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Drive the repository from approved hardening design to beta-candidate status by closing critical manual-payment and complimentary-flow gaps, restoring required repo gates, proving environment readiness, and producing an evidence-backed beta decision package.

**Architecture:** Execute the approved five-wave hardening design as a strict gate pipeline: establish the truth baseline first, then fix repo-level blockers, then validate environment readiness, then run cross-role verification, and finally update the beta decision package. Treat every wave as fail-closed: if a required command, route, dataset, or operational dependency cannot be proven with evidence, record it as an open blocker and stop advancing readiness claims.

**Tech Stack:** Next.js 16 App Router, React 19, TypeScript, Prisma, PostgreSQL/Supabase, Supabase Auth and Storage, Tailwind CSS v4, node test runner via `tsx`, ESLint, TypeScript compiler, existing beta/go-live operations docs under `docs/`.

---

## Implementation Notes

- Assume zero project context. Start each task by opening the referenced files and confirming the current behavior before changing anything.
- Keep scope tightly limited to beta-candidate hardening. Do not refactor unrelated admin pages, payment systems, or generalized platform architecture.
- Prefer targeted tests and focused route checks over broad rewrites. If a task is verification-only, do not expand it into code cleanup.
- Use `corepack pnpm` for package commands because `pnpm` may not be on `PATH` in some local environments.
- Record blockers immediately in the working notes and then in the final package docs. Do not silently work around missing env, missing seed data, or failing verification.

## Wave 1 - Truth Pass And Blocker Confirmation

### Task 1: Reconfirm the approved hardening scope against the current repo state

**Type:** Verification-only

**Files:**
- Review: `docs/plans/2026-04-08-beta-ready-hardening-design.md`
- Review: `docs/operations/beta-verification-checklist.md`
- Review: `docs/go-live/go-live-evidence-log.md`
- Review: `package.json`

**Step 1: Re-read the approved design and current verification package**

- Confirm the five implementation waves and the four final gates from `docs/plans/2026-04-08-beta-ready-hardening-design.md`.
- Confirm the currently documented local blocker in `docs/operations/beta-verification-checklist.md`.

**Step 2: Reconfirm the repo-level beta commands**

Run:

```bash
corepack pnpm run test:env && corepack pnpm run test:auth-route-coverage && corepack pnpm run test:auth-recovery-ui && corepack pnpm run test:route-contracts && node --import tsx --test lib/runtime-env-wiring.test.ts lib/gate/check-in.test.ts lib/payments/pos-retry.test.ts && corepack pnpm run typecheck
```

Expected:

- The first targeted tests match or improve on the results recorded in `docs/operations/beta-verification-checklist.md`.
- `corepack pnpm run typecheck` still fails until the known `lib/env.test.ts` typing issue is fixed.

**Step 3: Record the starting truth baseline**

- Capture the exact command results, the current date/time, and whether the known typecheck blocker still reproduces.
- If any new blocker appears, add it to the working notes immediately and treat it as in scope only if it affects manual payment, complimentary flow, quality gates, environment gates, or final beta evidence.

### Task 2: Confirm the current blocker list for manual payment and complimentary flows

**Type:** Verification-only

**Files:**
- Review: `app/api/admin/bookings/[bookingId]/verify-payment/route.ts`
- Review: `app/api/admin/bookings/[id]/route.ts`
- Review: `app/admin/bookings/[id]/page.tsx`
- Review: `app/api/admin/complimentary-requests/route.ts`
- Review: `app/api/admin/complimentary-requests/[requestId]/route.ts`
- Review: `app/admin/complimentary-requests/page.tsx`
- Review: `lib/complimentary-flow.test.ts`
- Review: `prisma/migrations/20260408032512_add_payment_verification_fields/migration.sql`

**Step 1: Map the current manual-payment path**

- Confirm that admin verification currently terminates at `app/api/admin/bookings/[bookingId]/verify-payment/route.ts`.
- Confirm that admin booking detail data is fetched from `app/api/admin/bookings/[id]/route.ts` and rendered in `app/admin/bookings/[id]/page.tsx`.
- Identify whether the page currently exposes payment-proof status, proof URL, verification notes, or verify/reject actions.

**Step 2: Map the current complimentary-review path**

- Confirm list data comes from `app/api/admin/complimentary-requests/route.ts` and review actions go through `app/api/admin/complimentary-requests/[requestId]/route.ts`.
- Confirm the admin page currently shows enough review outcome data to prove successful booking issuance after approval.

**Step 3: Write a blocker checklist for the implementation branch**

- Include the known repo gate blocker (`lib/env.test.ts` typecheck failure).
- Include any missing UI wiring between the admin booking page and payment-verification API.
- Include any missing response fields needed by the admin UI to render verification state safely.
- Include any complimentary review outcome gaps that prevent cross-role proof of issuance or rejection.

## Wave 2 - Repo Critical Fixes

### Task 3: Fix the current repository-wide typecheck blocker in `lib/env.test.ts`

**Files:**
- Modify: `lib/env.test.ts`
- Review: `docs/operations/beta-verification-checklist.md`

**Step 1: Reproduce the failing typecheck in isolation**

Run:

```bash
corepack pnpm run typecheck
```

Expected:

- FAIL with the existing `TS2540` complaint that `NODE_ENV` is read-only in `lib/env.test.ts`.

**Step 2: Apply the smallest safe typing fix**

- Keep the test behavior unchanged.
- Fix the assignment pattern so `process.env` mutation in the test is typed through a mutable record and no longer trips TypeScript readonly inference.
- Do not weaken unrelated env parsing types.

**Step 3: Verify the env test still passes**

Run:

```bash
corepack pnpm run test:env
```

Expected:

- PASS.

**Step 4: Verify repository typecheck is clean**

Run:

```bash
corepack pnpm run typecheck
```

Expected:

- PASS.

### Task 4: Make admin booking detail API return the manual-payment verification data needed by the page

**Files:**
- Modify: `app/api/admin/bookings/[id]/route.ts`
- Review: `app/api/admin/bookings/[bookingId]/verify-payment/route.ts`
- Modify: `app/admin/bookings/[id]/page.tsx`

**Step 1: Confirm the exact response gap before coding**

- Compare the fields updated in `app/api/admin/bookings/[bookingId]/verify-payment/route.ts` with the fields returned by `app/api/admin/bookings/[id]/route.ts`.
- Identify the missing fields the page needs, such as transaction verification status, proof URL, uploaded-at timestamp, verified-at timestamp, verified-by identifier or displayable review metadata, and verification notes.

**Step 2: Update the admin booking detail API contract**

- Return the minimal additional transaction and booking fields required for admin review UI.
- Preserve the existing success envelope from `successResponse()`.
- Avoid introducing a second admin booking detail endpoint.

**Step 3: Verify the route contract manually**

Run:

```bash
corepack pnpm run dev
```

Then open one real admin booking detail route and inspect the network response for `/api/admin/bookings/[id]`.

Expected:

- Response remains `success: true` and includes the verification fields required by the page.
- Existing admin booking detail rendering does not regress.

### Task 5: Wire the admin payment verification UI to the existing verification API

**Files:**
- Modify: `app/admin/bookings/[id]/page.tsx`
- Review: `app/api/admin/bookings/[bookingId]/verify-payment/route.ts`
- Review: `app/api/admin/bookings/[id]/route.ts`

**Step 1: Add page-level state for payment verification actions**

- Add explicit local state for verification action loading, notes input, and per-status UI gating.
- Only expose verify/reject controls when the booking transaction is in the server-approved reviewable state.

**Step 2: Implement the action handlers against the existing route**

- Call `PUT /api/admin/bookings/[bookingId]/verify-payment` with `action: "VERIFY"` or `action: "REJECT"`.
- Surface server validation and conflict errors through the existing toast flow.
- Reload booking detail data after a successful action so the UI re-renders from server truth rather than optimistic local assumptions.

**Step 3: Render the review evidence block**

- Show current verification status, proof availability, proof upload timestamp if present, verification notes, and verified timestamp if present.
- Make the proof URL clearly visible only when it exists.
- Show a non-actionable state when the transaction is already verified or rejected.

**Step 4: Verify the page-to-API wiring**

Run:

```bash
corepack pnpm run dev
```

Expected:

- An admin can open `/admin/bookings/[id]`, see the payment proof state, submit verify or reject, receive a success/error toast, and then observe the updated state after reload.
- A second verification attempt on the same booking returns a conflict-style failure and does not create duplicate side effects.

### Task 6: Harden manual-payment verification edge cases without expanding scope

**Files:**
- Modify: `app/api/admin/bookings/[bookingId]/verify-payment/route.ts`
- Review: `prisma/schema.prisma`
- Review: `prisma/migrations/20260408032512_add_payment_verification_fields/migration.sql`
- Modify: `docs/operations/beta-verification-checklist.md`

**Step 1: Reconfirm fail-closed conditions in the route**

- Re-check missing booking, missing transaction, wrong verification status, missing proof URL, and concurrent review conflicts.
- Confirm the route does not apply success side effects when the transaction is not in `PROOF_UPLOADED`.

**Step 2: Patch only beta-critical edge handling gaps**

- If admin UI compatibility requires stable response fields on both verify and reject outcomes, add them here instead of duplicating client heuristics.
- If conflict and validation errors need more explicit payload fields for safe UI handling, add them through the existing `errorResponse()` format.
- Do not redesign the payment domain or add unrelated payment-provider logic.

**Step 3: Verify manual-payment regression safety**

Run:

```bash
corepack pnpm run test:payments && corepack pnpm run typecheck
```

Expected:

- PASS.
- No new type or payment test regression is introduced by the review-flow hardening.

### Task 7: Verify and complete any missing complimentary-flow wiring needed for admin review evidence

**Files:**
- Modify: `app/admin/complimentary-requests/page.tsx`
- Modify: `app/api/admin/complimentary-requests/route.ts`
- Modify: `app/api/admin/complimentary-requests/[requestId]/route.ts`
- Review: `lib/complimentary-flow.test.ts`

**Step 1: Confirm the current approved/rejected response shape and list rendering**

- Check whether the admin list page renders review note, review timestamp, reviewer identity, and issued booking summary clearly enough to prove outcome.
- Check whether the PUT route returns enough data for a safe post-action refresh.

**Step 2: Fill only the missing beta-critical review wiring**

- Ensure the admin list page can display approved booking code/status and rejected review outcome after reload.
- Ensure the page handles already-reviewed requests without presenting duplicate approve/reject actions.
- Preserve the existing concurrency and duplicate-booking protections enforced in `app/api/admin/complimentary-requests/[requestId]/route.ts`.

**Step 3: Verify complimentary helper coverage and route behavior**

Run:

```bash
corepack pnpm run test:complimentary-flow && corepack pnpm run typecheck
```

Expected:

- PASS.
- The existing duplicate-request, duplicate-booking, and transition-guard tests remain green.

## Wave 3 - Environment Readiness

### Task 8: Prepare the verification environment for payment-verification fields and generated Prisma client

**Files:**
- Review: `prisma/schema.prisma`
- Review: `prisma/migrations/20260408032512_add_payment_verification_fields/migration.sql`
- Review: `docs/setup/local-development.md`

**Step 1: Confirm migration intent before execution**

- Verify that the payment-verification migration adds the transaction fields used by `app/api/admin/bookings/[bookingId]/verify-payment/route.ts`.
- Confirm the target database for beta verification is the correct one before applying anything.

**Step 2: Apply Prisma migration and regenerate client**

Run:

```bash
corepack pnpm prisma migrate deploy && corepack pnpm prisma generate
```

Expected:

- Migration applies cleanly.
- Prisma client generation succeeds with no schema drift error.

**Step 3: Verify application still compiles against generated client**

Run:

```bash
corepack pnpm run typecheck
```

Expected:

- PASS.

### Task 9: Confirm storage and environment prerequisites for manual proof review and ticket artifacts

**Type:** Verification-only unless setup is missing

**Files:**
- Review: `docs/setup/local-development.md`
- Review: `docs/operations/storage-policy.md`
- Review: `.env.example`
- Review: `scripts/setup-storage.ts`

**Step 1: Check required environment variables are populated in the target verification environment**

- Confirm at minimum: `DATABASE_URL`, `DIRECT_URL`, `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`, `NEXT_PUBLIC_APP_URL`, `NEXT_PUBLIC_APP_STAGE`.
- Confirm email-related vars if complimentary or booking emails are expected to be observed: `RESEND_API_KEY`, `EMAIL_FROM`.

**Step 2: Validate storage readiness for proof/ticket-related flows**

Run if storage has not already been provisioned for the target environment:

```bash
corepack pnpm run setup:storage
```

Expected:

- Required buckets exist and align with `docs/operations/storage-policy.md`.
- No missing-service-role or missing-bucket error remains.

**Step 3: Record environment readiness status**

- If any env variable or storage setup is missing, mark the environment gate as blocked and log the exact missing requirement.
- If everything is present, record the environment as reusable for the final cross-role verification wave.

### Task 10: Confirm seeded users and reference records required for beta verification

**Type:** Verification-only unless missing data must be seeded

**Files:**
- Review: `docs/setup/local-development.md`
- Review: `prisma/seed.ts`
- Review: `prisma/seed-templates.ts`

**Step 1: Confirm required actors exist**

- Verify one admin, one organizer, and one customer account exist in the target environment.
- Verify one published event with at least one ticket type exists.

**Step 2: Confirm flow-specific records exist**

- Verify at least one booking can be brought into a manual-payment proof-review state.
- Verify at least one complimentary request can be created and reviewed.

**Step 3: Seed only if necessary**

Run only if the target environment is missing the required baseline data:

```bash
corepack pnpm prisma db seed
```

Expected:

- Required roles and reference data exist afterward.
- If seeded data is still insufficient for manual-proof or complimentary review, record the exact missing data setup as a blocker.

## Wave 4 - Cross-Role E2E Verification And Evidence Logging

### Task 11: Run the manual-payment verification scenario across customer and admin roles

**Type:** Verification-only unless a critical bug is discovered

**Files:**
- Review: `docs/operations/beta-verification-checklist.md`
- Update: `docs/go-live/go-live-evidence-log.md`
- Update: `docs/operations/beta-verification-checklist.md`

**Step 1: Create or locate a booking in manual proof review state**

- Use a real customer flow or prepared record so the booking reaches transaction verification status `PROOF_UPLOADED`.
- Confirm a payment proof URL exists before admin review starts.

**Step 2: Verify the customer-side pre-review state**

- Confirm the booking is waiting for review and does not already show paid/confirmed success.
- Record booking code, event, and current state.

**Step 3: Verify the admin-side review path**

- Open `/admin/bookings/[id]` as an admin.
- Confirm proof details render.
- Execute one approve path and, on a separate prepared record if available, one reject path.

**Step 4: Confirm server-side and user-visible outcomes**

- Approval expected outcome: transaction moves to verified/success, booking moves to paid/confirmed, and duplicate re-review is blocked.
- Rejection expected outcome: transaction moves to rejected, no paid/confirmed side effect is created, and duplicate re-review is blocked.

**Step 5: Log evidence**

- Update `docs/go-live/go-live-evidence-log.md` with timestamp, route checked, booking code, action taken, result, and any blocker or recovery note.
- Update `docs/operations/beta-verification-checklist.md` to reflect whether manual payment verification is now proven, partially proven, or blocked.

### Task 12: Run the complimentary-flow verification across organizer and admin roles

**Type:** Verification-only unless a critical bug is discovered

**Files:**
- Review: `docs/operations/beta-verification-checklist.md`
- Update: `docs/go-live/go-live-evidence-log.md`
- Update: `docs/operations/beta-verification-checklist.md`

**Step 1: Create or locate a pending complimentary request**

- Use a real organizer-owned event and create a request that stays in `PENDING` before review.
- Record request ID, event, requested guest, and requested quantities.

**Step 2: Verify admin review behavior**

- Open `/admin/complimentary-requests`.
- Confirm the pending request is visible and review actions are available exactly once.
- Approve one request and reject a separate request if a safe test record is available.

**Step 3: Confirm outcome and guard behavior**

- Approval expected outcome: request becomes approved, one booking is issued, booking code/status are visible after reload, and re-approval is blocked.
- Rejection expected outcome: request becomes rejected, no booking is issued, and re-review is blocked.

**Step 4: Log evidence**

- Update `docs/go-live/go-live-evidence-log.md` with request ID, action, booking outcome, and any observed notification/email limitation.
- Update `docs/operations/beta-verification-checklist.md` to reflect actual complimentary-flow evidence, not code assumptions.

### Task 13: Run the agreed repo gates and cross-role smoke checks as the final verification pass

**Type:** Verification-only

**Files:**
- Review: `docs/operations/beta-verification-checklist.md`
- Update: `docs/go-live/go-live-evidence-log.md`

**Step 1: Run the required command gate set**

Run:

```bash
corepack pnpm run test:env && corepack pnpm run test:auth-route-coverage && corepack pnpm run test:auth-recovery-ui && corepack pnpm run test:route-contracts && node --import tsx --test lib/runtime-env-wiring.test.ts lib/gate/check-in.test.ts lib/payments/pos-retry.test.ts && corepack pnpm run test:complimentary-flow && corepack pnpm run test:payments && corepack pnpm run lint && corepack pnpm run typecheck
```

Expected:

- PASS end-to-end.
- Any failure is logged as a current beta blocker, not waved through.

**Step 2: Run the highest-value route smoke checks manually**

- Verify at least these routes load with the intended role access and no regression caused by the hardening work:
  - `/admin`
  - `/admin/bookings`
  - `/admin/bookings/[id]`
  - `/admin/complimentary-requests`
  - `/events`
  - `/my-bookings`

**Step 3: Log final verification evidence**

- Add pass/fail status, command output summary, and route verification notes to `docs/go-live/go-live-evidence-log.md`.
- If a route could not be tested because env or data was missing, log that exact gap instead of marking it passed.

## Wave 5 - Final Beta Decision Package Updates

### Task 14: Update the beta decision package with gate status, blockers, and recommendation

**Files:**
- Update: `docs/operations/beta-verification-checklist.md`
- Update: `docs/go-live/go-live-evidence-log.md`
- Update: `docs/go-live/go-live-readiness-review.md`
- Update: `docs/go-live/go-live-signoff.md`

**Step 1: Convert working notes into explicit gate status**

- Mark each final gate as `PASS`, `BLOCKED`, or `PARTIAL`:
  - critical flow complete
  - quality gates clean
  - environment gates complete
  - real verification evidence

**Step 2: Update the formal review docs**

- In `docs/go-live/go-live-readiness-review.md`, summarize what changed in this beta-hardening pass, the current blockers, and the confidence level.
- In `docs/go-live/go-live-signoff.md`, update the decision recommendation to either beta-candidate ready for review or not ready.
- In `docs/operations/beta-verification-checklist.md`, replace stale blocker notes that are now resolved and preserve unresolved items with explicit owner/action language.

**Step 3: Apply fail-closed decision language**

- If any required wave is incomplete, use a `not ready` or equivalent recommendation.
- Only use beta-candidate or ready-for-beta-review language when all four gates are proven by the evidence captured in the docs.

**Step 4: Final package verification**

Run:

```bash
corepack pnpm run typecheck
```

Expected:

- PASS.
- Final docs align with the actual recorded outcomes and do not claim unverified readiness.

## Done Criteria

- The known `lib/env.test.ts` typecheck blocker is fixed and `corepack pnpm run typecheck` passes.
- Admin booking detail can safely display and execute manual payment verification against `app/api/admin/bookings/[bookingId]/verify-payment/route.ts`.
- Complimentary request review remains guarded against duplicates/concurrency and its outcome is visible enough for admin verification.
- Migration, Prisma generate, env checks, and storage readiness are verified for the target environment.
- Cross-role manual-payment and complimentary flows have real evidence entries in `docs/go-live/go-live-evidence-log.md`.
- Final beta package docs clearly recommend either `ready for beta review` or `not ready`, based only on evidence gathered in this plan.
