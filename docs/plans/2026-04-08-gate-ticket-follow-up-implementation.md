# Gate And Ticket Follow-Up Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Close the revised follow-up scope after the current `GO WITH CONDITIONS` decision by proving gate/check-in and ticket print/download/QR fulfillment as beta-critical `PASS` gates before beta starts, then finish the remaining non-blocking hardening work for waitlist, POS cashier return flow, route smoke expansion, and the owner roster contract.

**Architecture:** Treat this follow-up as an evidence-first hardening pass, not a product redesign. Run the two beta-critical tracks as strict fail-closed gates: first verify the current implementation using the existing route, UI, and focused tests; only make narrow implementation changes when a verification step fails or exposes a concrete contract gap. Keep the remaining workstreams lightweight and operationally focused by reusing the current docs, route contracts, and focused tests already present in the repository.

**Tech Stack:** Next.js 16 App Router, React 19, TypeScript, Prisma, PostgreSQL/Supabase, Supabase Auth and Storage, `@react-pdf/renderer`, `qrcode` and `qrcode.react`, node test runner via `tsx`, ESLint, TypeScript compiler, operational docs under `docs/operations/` and `docs/go-live/`.

---

## Implementation Notes

- Assume near-zero context. Open every referenced file before changing it and verify the current behavior from code plus executable evidence.
- This plan is a follow-up to the current `GO WITH CONDITIONS` package in `docs/operations/beta-verification-checklist.md`, not a greenfield rebuild.
- Beta-critical scope is limited to proving `PASS` for gate/check-in and ticket print/download/QR fulfillment before beta test starts.
- For every task marked `Verification-only`, do not broaden into cleanup or refactoring.
- For every task marked `Implementation-if-broken`, change only the smallest number of files needed to make the referenced verification step pass.
- Use `corepack pnpm` for package commands because this repo already documents that `pnpm` may not be directly on `PATH`.
- Record final evidence in `docs/operations/beta-verification-checklist.md` and, when route-level smoke expands, in `docs/operations/smoke-tests.md`.

## Phase 1 - Baseline And Scope Lock

### Task 1: Reconfirm the revised follow-up scope and current beta decision

**Type:** Verification-only

**Files:**
- Review: `docs/plans/2026-04-08-follow-up-verification-and-owner-roster-design.md`
- Review: `docs/operations/beta-verification-checklist.md`
- Review: `docs/operations/smoke-tests.md`
- Review: `package.json`

**Step 1: Re-read the approved follow-up design**

- Confirm the split between beta-critical work and remaining non-blocking follow-up in `docs/plans/2026-04-08-follow-up-verification-and-owner-roster-design.md`.
- Confirm that only two workstreams must reach `PASS` before beta starts: gate/check-in and ticket print/download/QR fulfillment.

**Step 2: Reconfirm the current evidence baseline**

- Read `docs/operations/beta-verification-checklist.md` and note what is already proven, especially that manual-payment and complimentary verification are already closed.
- Confirm that gate verification is still explicitly open and that broader waitlist/POS/route-smoke coverage remains follow-up scope.

**Step 3: Reconfirm the repository command surface**

Run:

```bash
corepack pnpm run test:env && corepack pnpm run test:auth-route-coverage && corepack pnpm run test:auth-recovery-ui && corepack pnpm run test:route-contracts && node --import tsx --test lib/runtime-env-wiring.test.ts lib/gate/check-in.test.ts lib/payments/pos-retry.test.ts && corepack pnpm run typecheck
```

Expected:

- All commands pass, matching or improving the current documented baseline.
- Any new failure is treated as part of this follow-up only if it blocks the revised scope directly.

**Step 4: Write a local blocker note before coding**

- Create a short working note outside the repo or in your session notes that lists which follow-up tasks are still evidence gaps versus actual code gaps.
- Do not edit repo files yet unless a later task requires it.

## Phase 2 - Beta-Critical Gate 1: Gate / Check-In Must Pass

### Task 2: Audit the current gate/check-in implementation and proof points

**Type:** Verification-only

**Files:**
- Review: `app/api/gate/check-in/route.ts`
- Review: `app/gate/page.tsx`
- Review: `components/gate/QRScanner.tsx`
- Review: `lib/gate/check-in.ts`
- Review: `lib/gate/check-in.test.ts`
- Review: `lib/gate/result-display.ts`
- Review: `docs/operations/smoke-tests.md`
- Review: `docs/plans/2026-03-10-gel-12-gate-checkin.md`

**Step 1: Confirm the current backend contract**

- Verify that `app/api/gate/check-in/route.ts` is the active check-in entry point.
- Verify that `lib/gate/check-in.ts` still owns the normalized result handling.
- Note the result codes currently supported for success, duplicate scans, invalid tickets, wrong-event tickets, and access/session failures.

**Step 2: Confirm the current operator UI path**

- Verify that `app/gate/page.tsx`, `components/gate/QRScanner.tsx`, and `lib/gate/result-display.ts` still use the same result vocabulary.
- Confirm whether the page already distinguishes duplicate, invalid, wrong-event, and access-denied outcomes clearly enough for beta operations.

**Step 3: Re-run the focused gate tests**

Run:

```bash
node --import tsx --test lib/gate/check-in.test.ts
```

Expected:

- PASS.
- The tests still cover first scan success and repeat-scan rejection behavior.

**Step 4: Decide whether this track is verification-complete or implementation-needed**

- If the tests pass and the route/UI contract still exposes clear operator behavior for success, duplicate, invalid, and wrong-event flows, proceed to live verification in Task 3.
- If a focused test is missing or the code contract no longer matches the expected operator behavior, continue to Task 4.

### Task 3: Execute live gate/check-in verification and record `PASS` evidence

**Type:** Verification-only

**Files:**
- Review: `docs/operations/beta-verification-checklist.md`
- Review: `docs/operations/smoke-tests.md`
- Modify: `docs/operations/beta-verification-checklist.md`

**Step 1: Boot the app in the beta-like local environment**

Run:

```bash
corepack pnpm run dev
```

Expected:

- The app boots cleanly and is reachable at the local app URL used for verification.

**Step 2: Run the live gate flow with a real operator session**

- Sign in as organizer or gate staff.
- Open the target gate route for an event.
- Verify these four outcomes with real requests and UI feedback:
  - first valid scan succeeds
  - second scan of the same ticket is rejected as duplicate
  - invalid or unknown ticket is rejected clearly
  - wrong-event ticket is rejected clearly if test data is available

**Step 3: Capture evidence for the beta-critical decision**

- Record the checked route, actor role, event identifier, and the observed outcome for each scenario.
- If one scenario cannot be executed because seed data is missing, mark the workstream `non-PASS` and stop claiming beta readiness for gate/check-in.

**Step 4: Update the evidence log**

- Add a dated follow-up entry to `docs/operations/beta-verification-checklist.md` with the command results and live gate evidence.
- State the final gate/check-in status explicitly as either `PASS` or `non-PASS`.

### Task 4: Patch gate/check-in only if Task 2 or Task 3 fails

**Type:** Implementation-if-broken

**Files:**
- Modify: `lib/gate/check-in.ts`
- Modify: `app/api/gate/check-in/route.ts`
- Modify: `app/gate/page.tsx`
- Modify: `components/gate/QRScanner.tsx`
- Modify: `lib/gate/result-display.ts`
- Modify: `lib/gate/check-in.test.ts`
- Review: `docs/plans/2026-03-10-gel-12-gate-checkin.md`

**Step 1: Reproduce the exact failing gate path**

Run the smallest matching command first:

```bash
node --import tsx --test lib/gate/check-in.test.ts
```

Expected:

- FAIL only on the scenario that matches the live or contract gap you observed.

**Step 2: Add or tighten one failing test if coverage is missing**

- Add one focused assertion for the missing behavior only, such as duplicate-scan UI mapping, wrong-event result handling, or access-denied contract stability.
- Avoid broad rewrites of the gate test file.

**Step 3: Apply the minimal fix**

- Patch the service, route, or UI mapping only where the broken behavior originates.
- Preserve the existing result vocabulary instead of inventing a new operator state model unless the current contract is internally inconsistent.

**Step 4: Re-run the focused gate verification**

Run:

```bash
node --import tsx --test lib/gate/check-in.test.ts && corepack pnpm run typecheck
```

Expected:

- PASS.

**Step 5: Repeat Task 3 and do not mark this workstream `PASS` until the live verification succeeds**

## Phase 3 - Beta-Critical Gate 2: Ticket Print / Download / QR Fulfillment Must Pass

### Task 5: Audit the current ticket artifact implementation surface

**Type:** Verification-only

**Files:**
- Review: `app/(customer)/my-bookings/[code]/page.tsx`
- Review: `app/(customer)/my-bookings/[code]/ticket/page.tsx`
- Review: `components/gate/TicketPrint.tsx`
- Review: `lib/pdf/ticket-template.tsx`
- Review: `lib/pdf/evoucher-template.tsx`
- Review: `lib/pdf/templates/classic.tsx`
- Review: `lib/pdf/templates/modern.tsx`
- Review: `lib/email/templates.ts`
- Review: `docs/operations/beta-verification-checklist.md`

**Step 1: Map the customer ticket access path**

- Confirm that the booking detail route and ticket route used in the current checklist still exist and are the intended beta retrieval paths.
- Identify which page or component renders QR data and which path is expected to handle print or download.

**Step 2: Map the printable/downloadable artifact path**

- Confirm whether `components/gate/TicketPrint.tsx` is still used for print output.
- Confirm whether the PDF templates in `lib/pdf/` are the active fulfillment templates or only fallback/template code.
- Confirm whether any current path still renders a placeholder where a real QR artifact should exist.

**Step 3: Decide whether the code surface is already plausible for beta verification**

- If the live customer ticket route appears complete enough to prove print/download/QR access, move to Task 6.
- If the code clearly shows placeholder-only fulfillment or a missing route/action, continue to Task 7 after documenting the gap.

### Task 6: Execute live ticket print/download/QR fulfillment verification and record `PASS` evidence

**Type:** Verification-only

**Files:**
- Review: `docs/operations/beta-verification-checklist.md`
- Modify: `docs/operations/beta-verification-checklist.md`
- Review: `docs/operations/storage-policy.md`

**Step 1: Verify the booking-to-ticket retrieval path**

Run the app if it is not already running:

```bash
corepack pnpm run dev
```

Then verify with a real booking that:

- `/my-bookings` loads
- `/my-bookings/[code]` loads for the target booking
- `/my-bookings/[code]/ticket` loads and renders the ticket artifact

**Step 2: Verify QR fulfillment in the real ticket view**

- Confirm the customer-visible ticket view shows a real QR or scannable ticket code, not only static placeholder copy.
- If possible, use the gate flow with that artifact to confirm the ticket can be fulfilled in the intended beta path.

**Step 3: Verify print/download behavior**

- Trigger the print path if the UI exposes it.
- Trigger the download path if the UI exposes it.
- Confirm at least one supported beta artifact path succeeds without broken assets, dead buttons, or unauthorized errors.

**Step 4: Apply the beta-critical rule**

- Mark this workstream `PASS` only if the ticket can be retrieved and used through the intended beta fulfillment path, and the supported print/download experience does not break on the main happy path.
- If QR renders but print/download is broken, or print/download works but the QR artifact is not actually usable for gate operations, mark the workstream `non-PASS`.

**Step 5: Update the evidence log**

- Add dated evidence to `docs/operations/beta-verification-checklist.md` describing the retrieval route, ticket route, QR result, and print/download result.
- State the final status explicitly as `PASS` or `non-PASS`.

### Task 7: Patch ticket print/download/QR fulfillment only if Task 5 or Task 6 fails

**Type:** Implementation-if-broken

**Files:**
- Modify: `app/(customer)/my-bookings/[code]/page.tsx`
- Modify: `app/(customer)/my-bookings/[code]/ticket/page.tsx`
- Modify: `components/gate/TicketPrint.tsx`
- Modify: `lib/pdf/ticket-template.tsx`
- Modify: `lib/pdf/evoucher-template.tsx`
- Modify: `lib/pdf/templates/classic.tsx`
- Modify: `lib/pdf/templates/modern.tsx`
- Modify: `lib/email/templates.ts`
- Review: `components/features/checkout/checkout-result-primitives.tsx`

**Step 1: Reproduce the narrow ticket fulfillment failure**

- Identify the exact failing behavior: missing QR data, broken ticket page, dead print action, dead download action, placeholder-only PDF output, or unauthorized artifact access.
- Write down one sentence describing the failure before changing code.

**Step 2: Add the smallest useful regression check when practical**

- If the gap is template or route-contract based, add or extend a targeted test near the affected area.
- If the gap is UI-only and there is no existing test harness for that route, skip broad test scaffolding and prefer a minimal fix plus live verification.

**Step 3: Implement the minimal fulfillment fix**

- Keep the current booking and ticket route structure.
- Reuse the existing ticket/PDF component tree instead of introducing a second fulfillment system.
- Prefer wiring real QR or ticket-code data into the existing artifact templates over redesigning template visuals.

**Step 4: Re-run the smallest affected verification set**

Run:

```bash
corepack pnpm run test:route-contracts && corepack pnpm run typecheck
```

Expected:

- PASS.

**Step 5: Repeat Task 6 and do not mark this workstream `PASS` until live artifact verification succeeds**

## Phase 4 - Remaining Non-Blocking Follow-Up

### Task 8: Verify the waitlist path and patch only if the proof is broken

**Type:** Verification-only first, implementation-if-broken second

**Files:**
- Review: `app/api/events/[slug]/waitlist/route.ts`
- Review: `components/features/events/EventDetailView.tsx`
- Review: `lib/auth/route-auth-coverage.test.ts`
- Modify: `docs/operations/beta-verification-checklist.md`

**Step 1: Audit the current waitlist contract**

- Confirm that `app/api/events/[slug]/waitlist/route.ts` still handles waitlist creation for sold-out ticket types.
- Confirm that `components/features/events/EventDetailView.tsx` still posts to that endpoint and exposes the user-visible success/error states.

**Step 2: Execute the non-blocking live verification**

- Use a sold-out ticket type.
- Verify new waitlist join succeeds.
- Verify duplicate waiting entry is rejected.
- Verify the route rejects waitlist signup when tickets are still available.

**Step 3: Patch only if the route or UI is concretely broken**

- If behavior is broken, modify only `app/api/events/[slug]/waitlist/route.ts` and/or `components/features/events/EventDetailView.tsx`.
- Keep email-provider proof as evidence-only; do not expand this task into a broader email system redesign.

**Step 4: Re-verify and record status**

- Add a dated waitlist follow-up note to `docs/operations/beta-verification-checklist.md`.
- Mark the outcome as non-blocking regardless of result, but record any accepted gaps explicitly.

### Task 9: Verify POS status pages and cashier return flow, then patch only if broken

**Type:** Verification-only first, implementation-if-broken second

**Files:**
- Review: `app/pos/page.tsx`
- Review: `app/pos/access/page.tsx`
- Review: `app/pos/payment-success/page.tsx`
- Review: `app/pos/payment-pending/page.tsx`
- Review: `app/pos/payment-failed/page.tsx`
- Review: `components/pos/pos-payment-status-page.tsx`
- Review: `lib/payments/pos-retry.ts`
- Review: `lib/payments/pos-retry.test.ts`
- Modify: `docs/operations/beta-verification-checklist.md`

**Step 1: Re-run the focused POS retry logic test**

Run:

```bash
node --import tsx --test lib/payments/pos-retry.test.ts
```

Expected:

- PASS.

**Step 2: Execute the live status-route verification**

- Verify `/pos/payment-success`, `/pos/payment-pending`, and `/pos/payment-failed` render real pages.
- Verify each page provides a clear return path to `/pos` or `/pos/access`.
- Verify pending-state refresh does not create a duplicate transaction when used as a refresh-only follow-up.

**Step 3: Patch only if live behavior is broken**

- Prefer changes in `components/pos/pos-payment-status-page.tsx`, the three route pages, or `lib/payments/pos-retry.ts`.
- Do not redesign the entire POS cashier flow.

**Step 4: Re-run focused verification and record status**

Run if code changed:

```bash
node --import tsx --test lib/payments/pos-retry.test.ts && corepack pnpm run test:route-contracts && corepack pnpm run typecheck
```

Expected:

- PASS.

**Step 5: Update evidence**

- Add the cashier return-flow result to `docs/operations/beta-verification-checklist.md`.

### Task 10: Expand route smoke coverage with only the routes needed by this follow-up

**Type:** Verification-only unless a smoke route is actually broken

**Files:**
- Review: `docs/operations/smoke-tests.md`
- Modify: `docs/operations/smoke-tests.md`
- Review: `lib/route-contracts.test.ts`
- Modify: `lib/route-contracts.test.ts`

**Step 1: Add the minimum follow-up route list**

- Add or tighten smoke references for:
  - `/my-bookings/[code]`
  - `/my-bookings/[code]/ticket`
  - `/gate`
  - `/pos/payment-success`
  - `/pos/payment-pending`
  - `/pos/payment-failed`

**Step 2: Extend the route-contract check only where it is missing**

- If `lib/route-contracts.test.ts` does not already cover one of the follow-up routes above, add the smallest file-existence or route-contract assertion needed.

**Step 3: Re-run the route smoke contract test**

Run:

```bash
corepack pnpm run test:route-contracts
```

Expected:

- PASS.

**Step 4: Record the smoke expansion outcome**

- Update `docs/operations/smoke-tests.md` so the expanded routes are explicit and reusable for later beta passes.

### Task 11: Define the owner roster repo contract without storing live roster data

**Type:** Implementation-docs only

**Files:**
- Review: `docs/plans/2026-04-08-follow-up-verification-and-owner-roster-design.md`
- Review: `docs/go-live/go-live-signoff.md`
- Review: `docs/operations/operator-ownership.md`
- Modify: `docs/operations/operator-ownership.md`

**Step 1: Reconfirm the boundary**

- Keep owner names, contact details, and active shift schedules outside the repo.
- Only define the fields engineering needs to track role requirement, confirmation checkpoint, status, evidence reference, and open issue state.

**Step 2: Add the contract fields to the operational ownership doc**

- Document a lightweight table or template that includes:
  - workstream
  - required role
  - confirmation checkpoint
  - status
  - evidence reference
  - external roster reference
  - open issue / risk note

**Step 3: Cross-check terminology with existing go-live docs**

- Make terminology consistent with `docs/go-live/go-live-signoff.md` and the current `GO`, `GO WITH CONDITIONS`, and `NO-GO` language.

**Step 4: Verify the doc stays non-sensitive**

- Manually confirm the updated doc contains no real names, emails, phone numbers, or shift schedules.

## Phase 5 - Final Follow-Up Decision Update

### Task 12: Re-run the minimum final verification set and close the follow-up package

**Type:** Verification-only

**Files:**
- Modify: `docs/operations/beta-verification-checklist.md`
- Modify: `docs/operations/smoke-tests.md`
- Review: `docs/operations/operator-ownership.md`

**Step 1: Re-run the final minimum command set**

Run:

```bash
corepack pnpm run test:route-contracts && node --import tsx --test lib/gate/check-in.test.ts lib/payments/pos-retry.test.ts && corepack pnpm run typecheck
```

Expected:

- PASS.

**Step 2: Apply the beta start rule explicitly**

- Confirm gate/check-in workstream status is `PASS`.
- Confirm ticket print/download/QR fulfillment workstream status is `PASS`.
- If either one is not `PASS`, keep beta start blocked even if the non-blocking items are complete.

**Step 3: Update the final decision notes**

- Add one dated summary block to `docs/operations/beta-verification-checklist.md` that separates:
  - beta-critical `PASS` gates
  - remaining non-blocking outcomes
  - open caveats still accepted under `GO WITH CONDITIONS`

**Step 4: Verify the docs reflect the revised scope accurately**

- Confirm `docs/operations/beta-verification-checklist.md` now makes it explicit that gate/check-in and ticket fulfillment had to pass before beta started.
- Confirm `docs/operations/smoke-tests.md` and `docs/operations/operator-ownership.md` reflect the final follow-up contract without over-expanding scope.

## Expected Deliverables

- Updated evidence in `docs/operations/beta-verification-checklist.md` for:
  - gate/check-in `PASS` or `non-PASS`
  - ticket print/download/QR fulfillment `PASS` or `non-PASS`
  - waitlist verification outcome
  - POS cashier return-flow outcome
- Updated `docs/operations/smoke-tests.md` with the minimum route smoke expansion for this follow-up.
- Updated `docs/operations/operator-ownership.md` with a repo-safe owner roster contract.
- No broad redesign of gate, ticketing, POS, waitlist, or operations architecture.

## Commit Guidance

- Prefer one commit after each completed workstream with a message tied to the outcome, for example:
  - `docs: record beta-critical gate and ticket verification`
  - `fix: tighten ticket fulfillment beta path`
  - `docs: add owner roster follow-up contract`
- Do not commit partial evidence that still claims `PASS` before the corresponding live verification is complete.
