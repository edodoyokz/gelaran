# GEL-17 Payment Idempotency and Webhook Hardening Design

## Goal

Make online and POS payment order creation safe to retry, make Midtrans webhook processing idempotent, ensure transaction state changes are auditable, and provide a recovery path for partial failures without widening the scope into unrelated payment product work.

## Problem Summary

The current payment flow is operational but not yet safe under retries and duplicate callbacks:

- `app/api/payments/route.ts` always generates a fresh order id and creates a new `Transaction` row, even when the same booking already has an active pending payment attempt.
- `app/api/pos/sell/route.ts` repeats the same pattern for on-site sales.
- `app/api/payments/webhook/route.ts` updates the transaction every time and then re-applies booking and ticket side effects without checking whether the status transition has already been processed.
- raw payment payloads are stored on the transaction, but there is not yet a clear audit trail for why a status changed, whether a duplicate callback was ignored, or whether a recovery action repaired a partial failure.
- a new `lib/audit-log.ts` helper exists in local changes, but it is not wired into the payment paths yet.

This means a user retry, POS retry, or duplicate Midtrans webhook can produce duplicate side effects or make incident review harder than it should be.

## Approaches Considered

### Approach A — Patch idempotency inline in each route

Add conditional checks directly inside `app/api/payments/route.ts`, `app/api/pos/sell/route.ts`, and `app/api/payments/webhook/route.ts`.

**Pros**
- Lowest immediate code movement.
- Fastest way to stop the worst duplicate behavior.

**Cons**
- Logic stays duplicated across online and POS flows.
- Harder to test consistently.
- Recovery and audit rules drift more easily over time.

### Approach B — Introduce small payment-flow helpers and route orchestration

Extract focused helpers for payment intent reuse, transaction transition handling, audit recording, and recovery decisions, then keep the route handlers thin.

**Pros**
- Best balance of safety, testability, and bounded scope.
- Lets online and POS payment flows share the same idempotency rules.
- Makes webhook dedupe behavior explicit.

**Cons**
- Slightly more initial refactor than patching inline.

### Approach C — Add a new event store or webhook ledger table

Create new persistence structures for inbound webhook events and replay/reconciliation.

**Pros**
- Strongest long-term audit and replay model.

**Cons**
- Too wide for this issue.
- Requires schema expansion and migration planning beyond the release-blocker scope.

## Selected Approach

Use **Approach B**.

We will add a narrow payment helper layer that centralizes:

- whether an existing payment intent can be safely reused,
- when a fresh Midtrans order should be created,
- how webhook transitions are mapped and applied only once,
- how payment audit entries are written,
- how a partial state mismatch is repaired and recorded.

This fixes the issue at the root cause without introducing a new persistence model.

## Architecture

### 1. Shared payment intent helper

Add a helper module under `lib/payments/` that works with both customer checkout and POS payment creation.

Responsibilities:

- load the current booking plus its existing transaction,
- determine whether the transaction is still active and reusable,
- treat `PENDING` and `PROCESSING` transactions with non-expired payment windows as reusable,
- return a structured decision such as:
  - `reuse-existing-intent`
  - `create-new-intent`
  - `reject-paid-booking`
  - `reject-expired-booking`
  - `repair-and-reuse`
- normalize transaction expiry handling so checkout and POS use the same decision rules.

For this issue we will keep the current one-transaction-per-booking data shape and make reuse the default behavior instead of creating duplicates.

### 2. Shared Midtrans payment order creation path

Create a small helper that receives the booking, customer details, line items, callback URLs, and payment method metadata, then:

- reuses the current transaction if it is still pending and has reusable gateway data,
- otherwise creates a fresh Midtrans transaction and updates the existing database transaction row instead of creating a second payment side effect,
- preserves `transactionCode`, `paymentGateway`, `paymentMethod`, `amount`, `expiresAt`, and gateway payload consistently,
- returns the same response contract for checkout and POS.

This keeps route handlers focused on auth/request validation while the payment intent rules live in one place.

### 3. Idempotent webhook transition handler

Add a helper that receives the existing transaction record plus the Midtrans webhook payload and computes:

- normalized target transaction status,
- whether the webhook is a duplicate with no new transition,
- whether downstream booking/ticket side effects must run,
- whether the transaction and booking state are inconsistent and need a repair step.

Rules:

- if the incoming normalized status is the same as the stored transaction status and the booking state is already consistent, record an audit entry and exit without re-running side effects,
- only apply sold/reserved counter changes the first time a success or terminal failure transition is accepted,
- only mark POS auto-check-in once,
- store the latest raw gateway payload for forensic review,
- keep booking state transitions aligned with the accepted transaction transition.

### 4. Audit model

Use the existing `audit_logs` table as the primary audit trail and `transactions.gatewayResponse` as the raw gateway evidence.

Add targeted payment audit actions in `lib/audit-log.ts` and route helpers for:

- `PAYMENT_ORDER_CREATED`
- `PAYMENT_WEBHOOK_RECEIVED`
- `PAYMENT_STATUS_CHANGED`
- `PAYMENT_WEBHOOK_IGNORED`
- `PAYMENT_RECOVERY_APPLIED`

Each audit entry should capture, when available:

- `transactionId`
- `bookingId`
- `transactionCode` / Midtrans order id
- `gatewayTransactionId`
- previous and new status
- reason for accepting, ignoring, or repairing the transition
- relevant request metadata (IP/user agent) when available

### 5. Recovery path

Provide a bounded recovery path instead of a broad reconciliation system.

For this issue, recovery means:

- if a booking is `AWAITING_PAYMENT` with a pending transaction whose gateway payload is incomplete but still safely reusable, repair the missing stored fields and audit the repair,
- if a webhook indicates a paid terminal state but the booking is not yet marked paid, complete the missing booking/ticket updates once and audit the recovery,
- if a webhook is duplicate after the system is already consistent, ignore it and audit the ignore decision,
- if the state is unsafe or ambiguous, fail closed and return an error instead of guessing.

## Files in Scope

Primary implementation targets:

- `app/api/payments/route.ts`
- `app/api/payments/webhook/route.ts`
- `app/api/pos/sell/route.ts`
- `lib/midtrans/client.ts`
- `lib/audit-log.ts`
- new helper modules under `lib/payments/`
- targeted tests under `lib/payments/` or adjacent test files

Possible supporting touch points:

- `types/midtrans-client.d.ts`
- `app/api/pos/sell/errors.ts` only if required by the refactor

Out of scope for this issue:

- broad checkout UI redesign,
- new database tables or schema migrations unless absolutely required,
- unrelated admin/customer page cleanup,
- typecheck failures already known outside the payment slice.

## Error Handling

### Create payment routes

- `400` for invalid booking/request state.
- `403` for ownership/auth failures already enforced by route logic.
- `409` only if a recovery-safe decision cannot be made because the booking/transaction state is inconsistent.
- `503` when payments are disabled.
- successful retries should return the active payment intent instead of surfacing an avoidable error.

### Webhook route

- `403` for invalid signature.
- `404` if the transaction truly does not exist.
- `200` for duplicate callbacks that were intentionally ignored.
- `500` only for unexpected internal failures.

## Testing Strategy

Follow strict TDD with focused tests first.

### Unit/logic coverage

Add tests for helpers that prove:

- active pending transaction is reused,
- expired or terminal transaction requires a fresh intent decision,
- duplicate paid webhook does not re-run ticket counter mutations,
- duplicate failed/expired webhook does not re-run release logic,
- recovery path upgrades mismatched transaction/booking state exactly once,
- audit payloads capture before/after states and decisions.

### Route-adjacent verification

After helper tests pass, run targeted verification for the touched payment files:

- helper tests with Node test runner,
- focused ESLint on payment and audit files,
- the existing `pnpm run test` suite to ensure no regression in the current baseline.

## Success Criteria Mapping

- **Order creation avoids duplicate side effects** → payment creation routes reuse active intent instead of always creating a new order.
- **Webhook processing is idempotent** → duplicate callbacks update raw payload/audit trail without replaying booking/ticket mutations.
- **Transaction state changes are auditable** → accepted, ignored, and recovered transitions write payment-specific audit entries.
- **Recovery path exists for partial failures** → bounded repair logic handles safe mismatches and records what happened.
