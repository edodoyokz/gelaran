import assert from "node:assert/strict";
import test from "node:test";
import {
  createPaymentOrderCreatedAudit,
  createPaymentStatusChangedAudit,
  createPaymentWebhookIgnoredAudit,
  createPaymentRecoveryAppliedAudit,
} from "@/lib/audit-log";

test("builds audit payload for payment order creation", () => {
  assert.deepEqual(
    createPaymentOrderCreatedAudit({
      transactionId: "txn_1",
      bookingId: "booking_1",
      transactionCode: "BSC-ABC-1",
      paymentMethod: "SNAP",
      amount: 150000,
      mode: "created",
    }),
    {
      action: "PAYMENT_ORDER_CREATED",
      entityType: "Booking",
      entityId: "booking_1",
      newValues: {
        transactionId: "txn_1",
        transactionCode: "BSC-ABC-1",
        paymentMethod: "SNAP",
        amount: 150000,
        mode: "created",
      },
    }
  );
});

test("builds audit payload for payment status changes", () => {
  assert.deepEqual(
    createPaymentStatusChangedAudit({
      transactionId: "txn_2",
      bookingId: "booking_2",
      transactionCode: "BSC-ABC-2",
      fromStatus: "PENDING",
      toStatus: "SUCCESS",
      gatewayTransactionId: "midtrans-2",
      reason: "status-advanced",
    }),
    {
      action: "PAYMENT_STATUS_CHANGED",
      entityType: "Booking",
      entityId: "booking_2",
      oldValues: {
        transactionId: "txn_2",
        status: "PENDING",
      },
      newValues: {
        transactionCode: "BSC-ABC-2",
        status: "SUCCESS",
        gatewayTransactionId: "midtrans-2",
        reason: "status-advanced",
      },
    }
  );
});

test("builds audit payload for ignored duplicate webhook", () => {
  assert.deepEqual(
    createPaymentWebhookIgnoredAudit({
      transactionId: "txn_3",
      bookingId: "booking_3",
      transactionCode: "BSC-ABC-3",
      status: "SUCCESS",
      reason: "duplicate-terminal-status",
    }),
    {
      action: "PAYMENT_WEBHOOK_IGNORED",
      entityType: "Booking",
      entityId: "booking_3",
      newValues: {
        transactionId: "txn_3",
        transactionCode: "BSC-ABC-3",
        status: "SUCCESS",
        reason: "duplicate-terminal-status",
      },
    }
  );
});

test("builds audit payload for applied payment recovery", () => {
  assert.deepEqual(
    createPaymentRecoveryAppliedAudit({
      transactionId: "txn_4",
      bookingId: "booking_4",
      transactionCode: "BSC-ABC-4",
      recoveryType: "booking-out-of-sync",
      fromStatus: "AWAITING_PAYMENT",
      toStatus: "CONFIRMED",
    }),
    {
      action: "PAYMENT_RECOVERY_APPLIED",
      entityType: "Booking",
      entityId: "booking_4",
      oldValues: {
        transactionId: "txn_4",
        status: "AWAITING_PAYMENT",
      },
      newValues: {
        transactionCode: "BSC-ABC-4",
        recoveryType: "booking-out-of-sync",
        status: "CONFIRMED",
      },
    }
  );
});
