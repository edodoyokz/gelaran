# GEL-11 Complimentary Booking Hardening Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Harden the beta complimentary booking flow so duplicate guest requests and duplicate ticket issuance are prevented while organizer/admin visibility remains intact.

**Architecture:** Keep the existing request statuses (`PENDING`, `APPROVED`, `REJECTED`) but centralize complimentary business rules in a dedicated service. Route handlers stay thin while approval uses a transaction with duplicate issuance guards and availability rechecks.

**Tech Stack:** Next.js route handlers, TypeScript, Prisma, PostgreSQL, pnpm, Node test runner

---

### Task 1: Add focused complimentary flow tests

**Files:**
- Create: `tests/api/complimentary-flow.test.ts`
- Review: `app/api/admin/complimentary-requests/[requestId]/route.ts`
- Review: `app/api/organizer/events/[id]/complimentary-requests/route.ts`
- Review: `prisma/schema.prisma`

**Step 1: Write the failing tests**
- Add tests for duplicate request rejection when a `PENDING` request exists for the same `eventId + guestEmail`.
- Add tests for duplicate request rejection when an `APPROVED` complimentary booking already exists for the same `eventId + guestEmail`.
- Add tests that a new request is allowed after a prior `REJECTED` request.
- Add tests that approving the same request twice does not issue a second booking.
- Add tests that `APPROVE` after `REJECTED` and `REJECT` after `APPROVED` fail with conflict semantics.
- Add tests that approval fails when quota has changed and is no longer sufficient.

**Step 2: Run the new tests to verify they fail**
Run: `pnpm test -- --run tests/api/complimentary-flow.test.ts`
Expected: FAIL due to missing centralized guards.

**Step 3: Keep the tests narrow**
- Mock or isolate only the Prisma operations needed for duplicate-policy and review behavior.
- Avoid broad end-to-end setup if route-adjacent unit tests can prove the rules faster.

**Step 4: Re-run the same test file**
Run: `pnpm test -- --run tests/api/complimentary-flow.test.ts`
Expected: FAIL remains focused on the intended business rules.

### Task 2: Centralize complimentary policy helpers

**Files:**
- Create: `lib/complimentary/flow.ts`
- Create: `lib/complimentary/flow.test.ts` or keep coverage in `tests/api/complimentary-flow.test.ts`
- Review: `types/prisma` helpers if transaction typing is needed

**Step 1: Write the failing service-level test if needed**
- Add a narrow test for duplicate request policy and review transition policy if route tests are too noisy.

**Step 2: Implement minimal helpers**
- Add a helper to find conflicting requests/bookings by `eventId + guestEmail`.
- Add a helper to assert valid review transitions.
- Add a helper to map review + latest booking summary for API payloads.

**Step 3: Run the related tests**
Run: `pnpm test -- --run tests/api/complimentary-flow.test.ts`
Expected: Some failures move from missing helper logic to route integration gaps.

### Task 3: Harden organizer complimentary request creation

**Files:**
- Modify: `app/api/organizer/events/[id]/complimentary-requests/route.ts`
- Modify: `lib/complimentary/flow.ts`
- Test: `tests/api/complimentary-flow.test.ts`

**Step 1: Write or extend the failing organizer-create test**
- Assert `409` is returned when a conflicting `PENDING` request exists.
- Assert `409` is returned when a complimentary booking already exists for the same guest email and event.
- Assert a new request is accepted after a prior `REJECTED` request.

**Step 2: Implement the minimal route change**
- Call the centralized duplicate policy before creating the request.
- Return stable conflict messages for organizer/admin operators.

**Step 3: Run the focused test file**
Run: `pnpm test -- --run tests/api/complimentary-flow.test.ts`
Expected: Organizer-create scenarios pass; approval-related failures remain.

### Task 4: Harden admin review and issuance transaction

**Files:**
- Modify: `app/api/admin/complimentary-requests/[requestId]/route.ts`
- Modify: `lib/complimentary/flow.ts`
- Test: `tests/api/complimentary-flow.test.ts`

**Step 1: Write or extend the failing approval tests**
- Assert approval fails with `409` if the request is no longer `PENDING`.
- Assert approval fails with `409` if a booking already exists for `complimentaryRequestId`.
- Assert approval fails with `409` when quota is stale.
- Assert approval success returns booking summary once and only once.

**Step 2: Implement the minimal approval hardening**
- Validate transition before processing action.
- Re-check for existing booking inside the transaction.
- Re-read or validate ticket availability inside the transaction before issuance.
- Keep audit log and notification behavior intact.

**Step 3: Run the focused test file**
Run: `pnpm test -- --run tests/api/complimentary-flow.test.ts`
Expected: Approval/rejection tests pass.

### Task 5: Enrich organizer/admin listing payloads

**Files:**
- Modify: `app/api/organizer/events/[id]/complimentary-requests/route.ts`
- Modify: `app/api/admin/complimentary-requests/route.ts`
- Modify: `lib/complimentary/flow.ts`
- Test: `tests/api/complimentary-flow.test.ts`

**Step 1: Write the failing payload-shape test**
- Assert list responses include `reviewedAt`, `reviewedBy`, `reviewedNote`, and latest booking summary fields in a stable format.

**Step 2: Implement the payload mapping**
- Use the shared mapper so organizer and admin endpoints expose the same review/issuance summary semantics.

**Step 3: Run the focused test file**
Run: `pnpm test -- --run tests/api/complimentary-flow.test.ts`
Expected: List payload tests pass.

### Task 6: Verify the whole touched surface

**Files:**
- Verify only

**Step 1: Run the focused complimentary tests**
Run: `pnpm test -- --run tests/api/complimentary-flow.test.ts`
Expected: PASS

**Step 2: Run lint**
Run: `pnpm run lint`
Expected: PASS

**Step 3: Run typecheck**
Run: `pnpm run typecheck`
Expected: PASS

**Step 4: Run full test suite**
Run: `pnpm run test`
Expected: PASS

**Step 5: Run verify**
Run: `pnpm run verify`
Expected: PASS

### Task 7: Sync delivery status

**Files:**
- Modify: Linear issue `GEL-11`

**Step 1: Post implementation summary**
- Add a concise Linear comment with completed safeguards, test evidence, and any remaining follow-up.

**Step 2: Update issue status**
- Move `GEL-11` to the appropriate workflow state once verification is complete.
