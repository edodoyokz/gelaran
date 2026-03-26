import { mapTransactionStatus } from "@/lib/midtrans/client";
import type { BookingStatus, PaymentStatus, TransactionStatus } from "./idempotency";

export type SalesChannel = "ONLINE" | "ON_SITE";
export type TicketEffect = "none" | "confirm-sale" | "release-reservation";

export interface WebhookDecisionContext {
  currentTransactionStatus: TransactionStatus;
  currentBookingStatus: BookingStatus;
  incomingGatewayStatus: string;
  fraudStatus: string | null;
  salesChannel: SalesChannel;
}

type ApplyDecision = {
  action: "apply";
  reason: "status-advanced";
  nextTransactionStatus: TransactionStatus;
  nextBookingStatus: BookingStatus;
  nextPaymentStatus: PaymentStatus | null;
  ticketEffect: TicketEffect;
  shouldSetPaidAt: boolean;
  shouldAutoCheckIn: boolean;
};

type IgnoreDecision = {
  action: "ignore";
  reason: "duplicate-terminal-status";
  nextTransactionStatus: TransactionStatus;
};

type RepairDecision = {
  action: "repair";
  reason: "booking-out-of-sync" | "transaction-out-of-sync";
  nextTransactionStatus: TransactionStatus;
  nextBookingStatus: BookingStatus;
  nextPaymentStatus: PaymentStatus | null;
  ticketEffect: TicketEffect;
  shouldSetPaidAt: boolean;
  shouldAutoCheckIn: boolean;
};

export type WebhookTransitionDecision = ApplyDecision | IgnoreDecision | RepairDecision;

function isPaidStatus(incomingGatewayStatus: string, fraudStatus: string | null) {
  if (incomingGatewayStatus === "settlement") {
    return true;
  }

  if (incomingGatewayStatus === "capture") {
    return fraudStatus === "accept";
  }

  return false;
}

function getSuccessDecision(
  currentTransactionStatus: TransactionStatus,
  currentBookingStatus: BookingStatus,
  salesChannel: SalesChannel,
): WebhookTransitionDecision {
  if (currentTransactionStatus === "SUCCESS" && currentBookingStatus === "CONFIRMED") {
    return {
      action: "ignore",
      reason: "duplicate-terminal-status",
      nextTransactionStatus: "SUCCESS",
    };
  }

  if (currentTransactionStatus !== "SUCCESS" && currentBookingStatus === "CONFIRMED") {
    return {
      action: "repair",
      reason: "transaction-out-of-sync",
      nextTransactionStatus: "SUCCESS",
      nextBookingStatus: "CONFIRMED",
      nextPaymentStatus: "PAID",
      ticketEffect: "none",
      shouldSetPaidAt: true,
      shouldAutoCheckIn: false,
    };
  }

  if (currentTransactionStatus === "SUCCESS" && currentBookingStatus !== "CONFIRMED") {
    return {
      action: "repair",
      reason: "booking-out-of-sync",
      nextTransactionStatus: "SUCCESS",
      nextBookingStatus: "CONFIRMED",
      nextPaymentStatus: "PAID",
      ticketEffect: "confirm-sale",
      shouldSetPaidAt: true,
      shouldAutoCheckIn: salesChannel === "ON_SITE",
    };
  }

  return {
    action: "apply",
    reason: "status-advanced",
    nextTransactionStatus: "SUCCESS",
    nextBookingStatus: "CONFIRMED",
    nextPaymentStatus: "PAID",
    ticketEffect: "confirm-sale",
    shouldSetPaidAt: true,
    shouldAutoCheckIn: salesChannel === "ON_SITE",
  };
}

function getFailureDecision(
  nextTransactionStatus: Extract<TransactionStatus, "FAILED" | "EXPIRED">,
  currentTransactionStatus: TransactionStatus,
  currentBookingStatus: BookingStatus,
): WebhookTransitionDecision {
  const nextBookingStatus = nextTransactionStatus === "EXPIRED" ? "EXPIRED" : "CANCELLED";

  if (currentTransactionStatus === nextTransactionStatus && currentBookingStatus === nextBookingStatus) {
    return {
      action: "ignore",
      reason: "duplicate-terminal-status",
      nextTransactionStatus,
    };
  }

  if (currentTransactionStatus !== nextTransactionStatus && currentBookingStatus === nextBookingStatus) {
    return {
      action: "repair",
      reason: "transaction-out-of-sync",
      nextTransactionStatus,
      nextBookingStatus,
      nextPaymentStatus: null,
      ticketEffect: "none",
      shouldSetPaidAt: false,
      shouldAutoCheckIn: false,
    };
  }

  return {
    action: "apply",
    reason: "status-advanced",
    nextTransactionStatus,
    nextBookingStatus,
    nextPaymentStatus: null,
    ticketEffect: "release-reservation",
    shouldSetPaidAt: false,
    shouldAutoCheckIn: false,
  };
}

export function decideWebhookTransition(context: WebhookDecisionContext): WebhookTransitionDecision {
  if (isPaidStatus(context.incomingGatewayStatus, context.fraudStatus)) {
    return getSuccessDecision(
      context.currentTransactionStatus,
      context.currentBookingStatus,
      context.salesChannel,
    );
  }

  const nextTransactionStatus = mapTransactionStatus(context.incomingGatewayStatus) as TransactionStatus;
  if (nextTransactionStatus === "FAILED" || nextTransactionStatus === "EXPIRED") {
    return getFailureDecision(
      nextTransactionStatus,
      context.currentTransactionStatus,
      context.currentBookingStatus,
    );
  }

  return {
    action: "ignore",
    reason: "duplicate-terminal-status",
    nextTransactionStatus,
  };
}
