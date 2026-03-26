import assert from "node:assert/strict";
import test from "node:test";
import { decidePaymentIntentAction, type PaymentIntentContext } from "./idempotency";

function createContext(overrides: Partial<PaymentIntentContext> = {}): PaymentIntentContext {
  return {
    bookingStatus: "AWAITING_PAYMENT",
    paymentStatus: "UNPAID",
    bookingExpiresAt: new Date("2026-03-10T12:30:00.000Z"),
    now: new Date("2026-03-10T12:00:00.000Z"),
    transaction: null,
    ...overrides,
  };
}

test("reuses an active pending transaction with reusable gateway intent", () => {
  const decision = decidePaymentIntentAction(
    createContext({
      transaction: {
        id: "txn_1",
        status: "PENDING",
        expiresAt: new Date("2026-03-10T12:20:00.000Z"),
        gatewayResponse: {
          token: "snap-token",
          redirect_url: "https://snap.example/redirect",
        },
      },
    })
  );

  assert.deepEqual(decision, {
    action: "reuse",
    reason: "active-intent",
    transactionId: "txn_1",
    token: "snap-token",
    redirectUrl: "https://snap.example/redirect",
  });
});

test("rejects already paid bookings before any payment intent action", () => {
  const decision = decidePaymentIntentAction(
    createContext({ paymentStatus: "PAID", bookingStatus: "CONFIRMED" })
  );

  assert.deepEqual(decision, {
    action: "reject",
    reason: "booking-paid",
  });
});

test("rejects expired bookings before reusing or creating payment intent", () => {
  const decision = decidePaymentIntentAction(
    createContext({ bookingExpiresAt: new Date("2026-03-10T11:30:00.000Z") })
  );

  assert.deepEqual(decision, {
    action: "reject",
    reason: "booking-expired",
  });
});

test("creates a fresh payment intent when existing transaction is terminal", () => {
  const decision = decidePaymentIntentAction(
    createContext({
      transaction: {
        id: "txn_2",
        status: "FAILED",
        expiresAt: new Date("2026-03-10T12:20:00.000Z"),
        gatewayResponse: {
          token: "stale-token",
          redirect_url: "https://snap.example/stale",
        },
      },
    })
  );

  assert.deepEqual(decision, {
    action: "create",
    reason: "transaction-terminal",
    reuseTransactionId: "txn_2",
  });
});

test("repairs a pending transaction that is missing reusable gateway intent data", () => {
  const decision = decidePaymentIntentAction(
    createContext({
      transaction: {
        id: "txn_3",
        status: "PENDING",
        expiresAt: new Date("2026-03-10T12:20:00.000Z"),
        gatewayResponse: {
          transaction_id: "mid-123",
        },
      },
    })
  );

  assert.deepEqual(decision, {
    action: "repair-create",
    reason: "missing-intent-data",
    reuseTransactionId: "txn_3",
  });
});
