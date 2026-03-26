# GEL-17 Payment Idempotency and Webhook Hardening Implementation Plan

> **For Codex:** Execute this plan in the dedicated `GEL-17` worktree using strict TDD. Do not write production code before the corresponding failing test exists.

**Goal:** Make payment order creation idempotent for checkout and POS, make webhook processing idempotent, add auditable payment transition logging, and support bounded recovery for partial failures.

**Architecture:** Add small helpers under `lib/payments/` for intent reuse and webhook transition decisions, integrate them into the online payment, POS payment, and webhook routes, and route audit writes through `lib/audit-log.ts`.

**Tech Stack:** Next.js route handlers, Prisma, TypeScript, Node test runner via `tsx`, ESLint

---

### Task 1: Add payment decision tests first

**Files:**
- Create: `lib/payments/idempotency.test.ts`
- Create: `lib/payments/idempotency.ts`

**Step 1: Write the failing test**

Cover one behavior per test:
- reuses an active pending transaction,
- rejects paid booking,
- rejects expired booking,
- requires a fresh intent for expired or terminal transaction,
- identifies a recoverable inconsistent state.

**Step 2: Run the focused test and verify RED**

Run: `node --import tsx --test lib/payments/idempotency.test.ts`
Expected: FAIL because helper does not exist yet.

**Step 3: Write minimal implementation**

Add a pure helper that accepts booking/transaction state and returns a structured idempotency decision.

**Step 4: Run the focused test and verify GREEN**

Run: `node --import tsx --test lib/payments/idempotency.test.ts`
Expected: PASS.

**Step 5: Refactor lightly if needed**

Keep the helper pure and small.

### Task 2: Add webhook transition tests first

**Files:**
- Create: `lib/payments/webhook-transitions.test.ts`
- Create: `lib/payments/webhook-transitions.ts`

**Step 1: Write the failing test**

Cover:
- paid webhook is accepted once,
- duplicate paid webhook is ignored,
- failed/expired terminal webhook is accepted once,
- duplicate terminal webhook is ignored,
- inconsistent paid transaction + unpaid booking triggers recovery.

**Step 2: Run the focused test and verify RED**

Run: `node --import tsx --test lib/payments/webhook-transitions.test.ts`
Expected: FAIL.

**Step 3: Write minimal implementation**

Implement status normalization and transition decision helpers that return:
- accepted transition,
- ignored duplicate,
- recovery-required,
- unsafe conflict.

**Step 4: Run the focused test and verify GREEN**

Run: `node --import tsx --test lib/payments/webhook-transitions.test.ts`
Expected: PASS.

### Task 3: Add payment audit helper tests first

**Files:**
- Modify: `lib/audit-log.ts`
- Create: `lib/payments/audit-payloads.test.ts`

**Step 1: Write the failing test**

Cover creation of audit payload metadata for:
- order created,
- webhook ignored,
- status changed,
- recovery applied.

**Step 2: Run the focused test and verify RED**

Run: `node --import tsx --test lib/payments/audit-payloads.test.ts`
Expected: FAIL until helper shape exists.

**Step 3: Write minimal implementation**

Add payment-specific audit helpers and any new action names needed by `lib/audit-log.ts`.

**Step 4: Run the focused test and verify GREEN**

Run: `node --import tsx --test lib/payments/audit-payloads.test.ts`
Expected: PASS.

### Task 4: Integrate idempotent intent reuse into checkout payment route

**Files:**
- Modify: `app/api/payments/route.ts`
- Modify: `lib/payments/idempotency.ts`
- Modify: `lib/audit-log.ts`
- Modify: `lib/midtrans/client.ts` only if helper extraction requires it

**Step 1: Keep existing auth and request validation intact**

Only replace the payment-intent creation path.

**Step 2: Use the decision helper**

- return existing active payment intent when reusable,
- update the existing transaction row when a fresh order is needed,
- audit whether the route created, reused, or repaired the payment intent.

**Step 3: Run focused lint**

Run: `pnpm eslint app/api/payments/route.ts lib/payments/idempotency.ts lib/audit-log.ts lib/midtrans/client.ts`
Expected: PASS.

### Task 5: Integrate idempotent intent reuse into POS payment route

**Files:**
- Modify: `app/api/pos/sell/route.ts`
- Modify: `lib/payments/idempotency.ts`
- Modify: `lib/audit-log.ts`
- Modify: `app/api/pos/sell/errors.ts` only if needed

**Step 1: Keep booking creation logic intact**

Only change the payment order creation segment after the booking exists.

**Step 2: Reuse the same helper path as checkout**

Ensure POS payment creation follows the same transaction reuse/update rules.

**Step 3: Run focused lint**

Run: `pnpm eslint app/api/pos/sell/route.ts app/api/pos/sell/errors.ts lib/payments/idempotency.ts lib/audit-log.ts`
Expected: PASS.

### Task 6: Integrate idempotent webhook processing

**Files:**
- Modify: `app/api/payments/webhook/route.ts`
- Modify: `lib/payments/webhook-transitions.ts`
- Modify: `lib/audit-log.ts`

**Step 1: Keep signature verification intact**

Only replace post-verification transition handling.

**Step 2: Apply accepted transitions once**

- update raw gateway payload,
- apply booking/ticket side effects only when transition is first accepted,
- ignore duplicate callbacks safely,
- apply bounded recovery when state mismatch is recognized as safe.

**Step 3: Run focused lint**

Run: `pnpm eslint app/api/payments/webhook/route.ts lib/payments/webhook-transitions.ts lib/audit-log.ts`
Expected: PASS.

### Task 7: Verify focused tests and payment slice behavior

**Files:**
- Verify only

**Step 1: Run helper tests**

Run:
- `node --import tsx --test lib/payments/idempotency.test.ts`
- `node --import tsx --test lib/payments/webhook-transitions.test.ts`
- `node --import tsx --test lib/payments/audit-payloads.test.ts`
Expected: PASS.

**Step 2: Run focused lint across touched files**

Run:
`pnpm eslint app/api/payments/route.ts app/api/payments/webhook/route.ts app/api/pos/sell/route.ts app/api/pos/sell/errors.ts lib/payments/idempotency.ts lib/payments/webhook-transitions.ts lib/audit-log.ts lib/midtrans/client.ts`
Expected: PASS.

**Step 3: Run broader regression suite**

Run: `pnpm run test`
Expected: PASS, matching or exceeding the verified baseline in this worktree.

**Step 4: Inspect diff boundaries**

Confirm only `GEL-17`-relevant files plus its design/plan docs are changed.

### Task 8: Finalize GEL-17 cleanly

**Files:**
- Verify only

**Step 1: Prepare issue summary**

Capture:
- helper tests added,
- payment routes hardened,
- webhook idempotency behavior,
- audit actions added,
- recovery path implemented,
- exact verification commands and outcomes.

**Step 2: Merge back to `main` only after fresh verification**

Keep unrelated dirty work in the main workspace untouched.
