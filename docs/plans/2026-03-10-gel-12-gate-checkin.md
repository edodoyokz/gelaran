# GEL-12 Gate Check-In Stabilization Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Stabilize gate check-in and operator feedback so repeated scans, invalid tickets, wrong-event scans, and access problems produce consistent, auditable outcomes.

**Architecture:** Introduce a small gate check-in service under `lib/gate/` to centralize backend result handling, then refactor the gate page to use a shared operator-feedback mapper for both QR and manual entry. Keep the existing route and scanner UI, but make their result contract explicit and testable.

**Tech Stack:** Next.js App Router, TypeScript, Prisma, existing gate scanner UI

---

### Task 1: Add focused gate check-in tests

**Files:**
- Create: `lib/gate/check-in.test.ts`
- Review: `app/api/gate/check-in/route.ts`
- Review: `lib/api/response.ts`

**Steps:**
1. Add a focused test file for gate check-in result evaluation.
2. Write failing tests for `INVALID`, `WRONG_EVENT`, `ALREADY_CHECKED_IN`, `ACCESS_DENIED`, and `SESSION_INACTIVE` outcomes.
3. Add a failing test for a successful scan that marks a ticket checked in.
4. Add a failing test for a repeat scan after success returning `ALREADY_CHECKED_IN`.
5. Run only the new focused test file.

### Task 2: Create gate check-in service

**Files:**
- Create: `lib/gate/check-in.ts`
- Modify: `app/api/gate/check-in/route.ts`
- Test: `lib/gate/check-in.test.ts`

**Steps:**
1. Create a service function that validates device/session access and normalizes the ticket code.
2. Move ticket lookup and outcome evaluation into the service.
3. Return a stable result contract including operator-facing `result` codes and optional metadata.
4. Refactor the route to call the service and translate outcomes into `successResponse` or `errorResponse`.
5. Run the focused gate check-in tests again.

### Task 3: Add audit logging for important scan outcomes

**Files:**
- Modify: `lib/gate/check-in.ts`
- Review: `prisma/schema.prisma`
- Test: `lib/gate/check-in.test.ts`

**Steps:**
1. Review the existing `checkInLog` model fields used by the current success path.
2. Extend the service so important non-success outcomes create log entries where the existing schema supports them.
3. Keep schema changes out of scope unless they are strictly necessary.
4. Add or update tests that assert important outcomes are logged when feasible in unit coverage.
5. Re-run the focused gate check-in tests.

### Task 4: Refactor gate page to use shared result mapping

**Files:**
- Modify: `app/gate/page.tsx`
- Create: `lib/gate/result-display.ts`
- Review: `components/gate/QRScanner.tsx`

**Steps:**
1. Create a small helper that maps result codes into operator-facing UI labels, colors, and messages.
2. Update manual ticket entry to use the shared result mapping.
3. Update QR-based check-in flow to use the same result mapping and result contract.
4. Ensure stats refresh only occurs after `SUCCESS`.
5. Verify that device/session failures are shown distinctly from invalid tickets.

### Task 5: Tighten QR scanner result handling

**Files:**
- Modify: `components/gate/QRScanner.tsx`
- Modify: `app/gate/page.tsx`
- Review: `lib/gate/result-display.ts`

**Steps:**
1. Ensure QR scan history records the stabilized result codes.
2. Ensure the last-result panel remains understandable for repeated scans.
3. Keep cooldown behavior, but prevent repeated scans from collapsing into ambiguous `INVALID` feedback.
4. Ensure `onScanComplete` receives the stabilized result contract.
5. Manually review the scanner component for duplicated result assumptions.

### Task 6: Add operator-smoke documentation note

**Files:**
- Modify: `docs/operations/smoke-tests.md`
- Review: `docs/go-live/go-live-checklist.md`

**Steps:**
1. Add a short note clarifying that event-day gate smoke checks must verify both successful first scan and repeated scan rejection.
2. Mention wrong-event and invalid-ticket behavior as part of operator verification.
3. Keep the documentation update minimal and linked to the existing smoke-test structure.
4. Re-read the go-live checklist to ensure the new note fits the readiness flow.
5. Save without broadening documentation scope.

### Task 7: Verify implementation and update Linear

**Files:**
- Review: `lib/gate/check-in.ts`
- Review: `lib/gate/check-in.test.ts`
- Review: `app/api/gate/check-in/route.ts`
- Review: `app/gate/page.tsx`
- Review: `components/gate/QRScanner.tsx`
- Review: `docs/operations/smoke-tests.md`

**Steps:**
1. Run the focused gate check-in tests.
2. Run a grep check to ensure the stabilized result codes are used consistently in gate files.
3. Review the operator-facing messages for each result type.
4. Add a Linear progress comment summarizing the backend stabilization and UI feedback work.
5. Move `GEL-12` to the appropriate workflow state after verification.
