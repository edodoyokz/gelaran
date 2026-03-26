import assert from "node:assert/strict";
import test from "node:test";
import type { WebhookDecisionContext } from "./webhook-transitions";

type WebhookTransitionsModule = typeof import("./webhook-transitions") & {
  default?: typeof import("./webhook-transitions");
};

function createContext(overrides: Partial<WebhookDecisionContext> = {}): WebhookDecisionContext {
  return {
    currentTransactionStatus: "PENDING",
    currentBookingStatus: "AWAITING_PAYMENT",
    incomingGatewayStatus: "settlement",
    fraudStatus: "accept",
    salesChannel: "ONLINE",
    ...overrides,
  };
}

async function loadWebhookTransitions() {
  const loadedModule = (await import("./webhook-transitions")) as WebhookTransitionsModule;
  return (loadedModule.default ?? loadedModule) as typeof import("./webhook-transitions");
}

test("accepts a paid webhook once and applies confirmation side effects", async () => {
  const { decideWebhookTransition } = await loadWebhookTransitions();
  const decision = decideWebhookTransition(createContext());

  assert.deepEqual(decision, {
    action: "apply",
    reason: "status-advanced",
    nextTransactionStatus: "SUCCESS",
    nextBookingStatus: "CONFIRMED",
    nextPaymentStatus: "PAID",
    ticketEffect: "confirm-sale",
    shouldSetPaidAt: true,
    shouldAutoCheckIn: false,
  });
});

test("accepts settlement webhooks without fraud status for non-card payments", async () => {
  const { decideWebhookTransition } = await loadWebhookTransitions();
  const decision = decideWebhookTransition(
    createContext({
      incomingGatewayStatus: "settlement",
      fraudStatus: null,
    })
  );

  assert.deepEqual(decision, {
    action: "apply",
    reason: "status-advanced",
    nextTransactionStatus: "SUCCESS",
    nextBookingStatus: "CONFIRMED",
    nextPaymentStatus: "PAID",
    ticketEffect: "confirm-sale",
    shouldSetPaidAt: true,
    shouldAutoCheckIn: false,
  });
});

test("ignores a duplicate paid webhook after the system is already consistent", async () => {
  const { decideWebhookTransition } = await loadWebhookTransitions();
  const decision = decideWebhookTransition(
    createContext({
      currentTransactionStatus: "SUCCESS",
      currentBookingStatus: "CONFIRMED",
    })
  );

  assert.deepEqual(decision, {
    action: "ignore",
    reason: "duplicate-terminal-status",
    nextTransactionStatus: "SUCCESS",
  });
});

test("repairs a paid webhook when booking is already confirmed but transaction is stale", async () => {
  const { decideWebhookTransition } = await loadWebhookTransitions();
  const decision = decideWebhookTransition(
    createContext({
      currentTransactionStatus: "PENDING",
      currentBookingStatus: "CONFIRMED",
      salesChannel: "ON_SITE",
    })
  );

  assert.deepEqual(decision, {
    action: "repair",
    reason: "transaction-out-of-sync",
    nextTransactionStatus: "SUCCESS",
    nextBookingStatus: "CONFIRMED",
    nextPaymentStatus: "PAID",
    ticketEffect: "none",
    shouldSetPaidAt: true,
    shouldAutoCheckIn: false,
  });
});

test("accepts an expired webhook once and releases reserved tickets", async () => {
  const { decideWebhookTransition } = await loadWebhookTransitions();
  const decision = decideWebhookTransition(
    createContext({
      incomingGatewayStatus: "expire",
      currentTransactionStatus: "PENDING",
      currentBookingStatus: "AWAITING_PAYMENT",
      fraudStatus: null,
    })
  );

  assert.deepEqual(decision, {
    action: "apply",
    reason: "status-advanced",
    nextTransactionStatus: "EXPIRED",
    nextBookingStatus: "EXPIRED",
    nextPaymentStatus: null,
    ticketEffect: "release-reservation",
    shouldSetPaidAt: false,
    shouldAutoCheckIn: false,
  });
});

test("ignores a duplicate failed terminal webhook after reservation has already been released", async () => {
  const { decideWebhookTransition } = await loadWebhookTransitions();
  const decision = decideWebhookTransition(
    createContext({
      incomingGatewayStatus: "cancel",
      currentTransactionStatus: "FAILED",
      currentBookingStatus: "CANCELLED",
      fraudStatus: null,
    })
  );

  assert.deepEqual(decision, {
    action: "ignore",
    reason: "duplicate-terminal-status",
    nextTransactionStatus: "FAILED",
  });
});

test("flags recovery when payment succeeded but booking is not yet confirmed", async () => {
  const { decideWebhookTransition } = await loadWebhookTransitions();
  const decision = decideWebhookTransition(
    createContext({
      currentTransactionStatus: "SUCCESS",
      currentBookingStatus: "AWAITING_PAYMENT",
    })
  );

  assert.deepEqual(decision, {
    action: "repair",
    reason: "booking-out-of-sync",
    nextTransactionStatus: "SUCCESS",
    nextBookingStatus: "CONFIRMED",
    nextPaymentStatus: "PAID",
    ticketEffect: "confirm-sale",
    shouldSetPaidAt: true,
    shouldAutoCheckIn: false,
  });
});
