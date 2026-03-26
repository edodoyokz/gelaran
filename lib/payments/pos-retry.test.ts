import assert from "node:assert/strict";
import test from "node:test";
import type { PosSellRetryContext } from "./pos-retry";

type PosRetryModule = typeof import("./pos-retry") & {
  default?: typeof import("./pos-retry");
};

function createContext(overrides: Partial<PosSellRetryContext> = {}): PosSellRetryContext {
  return {
    requestId: "req-123",
    now: new Date("2026-03-10T10:00:00.000Z"),
    existingBooking: null,
    ...overrides,
  };
}

async function loadPosRetry() {
  const loadedModule = (await import("./pos-retry")) as PosRetryModule;
  return (loadedModule.default ?? loadedModule) as typeof import("./pos-retry");
}

test("creates a stable POS booking code from the request id", async () => {
  const { createPosBookingCode } = await loadPosRetry();
  assert.equal(createPosBookingCode("req-123"), createPosBookingCode("req-123"));
  assert.notEqual(createPosBookingCode("req-123"), createPosBookingCode("req-456"));
  assert.match(createPosBookingCode("req-123"), /^BSC-[A-Z0-9]{8}$/);
});

test("creates a new booking when no prior POS sell request exists", async () => {
  const { createPosBookingCode, decidePosSellRetryAction } = await loadPosRetry();
  const decision = decidePosSellRetryAction(createContext());

  assert.deepEqual(decision, {
    action: "create-booking",
    bookingCode: createPosBookingCode("req-123"),
  });
});

test("returns the existing completed booking for duplicate free or paid POS requests", async () => {
  const { createPosBookingCode, decidePosSellRetryAction } = await loadPosRetry();
  const decision = decidePosSellRetryAction(
    createContext({
      existingBooking: {
        id: "booking-1",
        bookingCode: createPosBookingCode("req-123"),
        status: "CONFIRMED",
        paymentStatus: "PAID",
        expiresAt: null,
        transaction: null,
      },
    }),
  );

  assert.deepEqual(decision, {
    action: "return-existing-booking",
    bookingId: "booking-1",
    bookingCode: createPosBookingCode("req-123"),
  });
});

test("reuses the active POS payment intent for duplicate retry requests", async () => {
  const { createPosBookingCode, decidePosSellRetryAction } = await loadPosRetry();
  const decision = decidePosSellRetryAction(
    createContext({
      existingBooking: {
        id: "booking-2",
        bookingCode: createPosBookingCode("req-123"),
        status: "AWAITING_PAYMENT",
        paymentStatus: "UNPAID",
        expiresAt: new Date("2026-03-10T10:30:00.000Z"),
        transaction: {
          id: "txn-1",
          status: "PENDING",
          expiresAt: new Date("2026-03-10T10:20:00.000Z"),
          gatewayResponse: {
            token: "snap-token",
            redirect_url: "https://snap.example/redirect",
          },
        },
      },
    }),
  );

  assert.deepEqual(decision, {
    action: "reuse-payment-intent",
    bookingId: "booking-2",
    bookingCode: createPosBookingCode("req-123"),
    transactionId: "txn-1",
    token: "snap-token",
    redirectUrl: "https://snap.example/redirect",
  });
});

test("refreshes the payment intent on the existing booking when the prior POS transaction is expired", async () => {
  const { createPosBookingCode, decidePosSellRetryAction } = await loadPosRetry();
  const decision = decidePosSellRetryAction(
    createContext({
      existingBooking: {
        id: "booking-3",
        bookingCode: createPosBookingCode("req-123"),
        status: "AWAITING_PAYMENT",
        paymentStatus: "UNPAID",
        expiresAt: new Date("2026-03-10T10:30:00.000Z"),
        transaction: {
          id: "txn-2",
          status: "EXPIRED",
          expiresAt: new Date("2026-03-10T09:40:00.000Z"),
          gatewayResponse: null,
        },
      },
    }),
  );

  assert.deepEqual(decision, {
    action: "refresh-payment-intent",
    bookingId: "booking-3",
    bookingCode: createPosBookingCode("req-123"),
    reuseTransactionId: "txn-2",
  });
});

test("rejects duplicate POS retries when the booking is already expired", async () => {
  const { createPosBookingCode, decidePosSellRetryAction } = await loadPosRetry();
  const decision = decidePosSellRetryAction(
    createContext({
      existingBooking: {
        id: "booking-4",
        bookingCode: createPosBookingCode("req-123"),
        status: "EXPIRED",
        paymentStatus: "UNPAID",
        expiresAt: new Date("2026-03-10T09:40:00.000Z"),
        transaction: {
          id: "txn-3",
          status: "EXPIRED",
          expiresAt: new Date("2026-03-10T09:40:00.000Z"),
          gatewayResponse: null,
        },
      },
    }),
  );

  assert.deepEqual(decision, {
    action: "reject",
    bookingId: "booking-4",
    bookingCode: createPosBookingCode("req-123"),
    reason: "booking-expired",
  });
});
