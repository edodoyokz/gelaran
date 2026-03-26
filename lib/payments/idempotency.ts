export type PaymentStatus = "UNPAID" | "PAID" | "PARTIAL_REFUND" | "FULL_REFUND";
export type BookingStatus = "PENDING" | "AWAITING_PAYMENT" | "PAID" | "CONFIRMED" | "CANCELLED" | "REFUNDED" | "EXPIRED";
export type TransactionStatus = "PENDING" | "PROCESSING" | "SUCCESS" | "FAILED" | "EXPIRED" | "REFUNDED";

export interface ExistingTransaction {
  id: string;
  status: TransactionStatus;
  expiresAt: Date | null;
  gatewayResponse?: Record<string, unknown> | null;
}

export interface PaymentIntentContext {
  bookingStatus: BookingStatus;
  paymentStatus: PaymentStatus;
  bookingExpiresAt: Date | null;
  now: Date;
  transaction: ExistingTransaction | null;
}

type RejectDecision = {
  action: "reject";
  reason: "booking-paid" | "booking-expired";
};

type ReuseDecision = {
  action: "reuse";
  reason: "active-intent";
  transactionId: string;
  token: string;
  redirectUrl: string;
};

type CreateDecision = {
  action: "create";
  reason: "missing-transaction" | "transaction-terminal" | "transaction-expired";
  reuseTransactionId?: string;
};

type RepairCreateDecision = {
  action: "repair-create";
  reason: "missing-intent-data";
  reuseTransactionId: string;
};

export type PaymentIntentDecision = RejectDecision | ReuseDecision | CreateDecision | RepairCreateDecision;

const ACTIVE_TRANSACTION_STATUSES = new Set<TransactionStatus>(["PENDING", "PROCESSING"]);
const TERMINAL_TRANSACTION_STATUSES = new Set<TransactionStatus>(["SUCCESS", "FAILED", "EXPIRED", "REFUNDED"]);

function isExpired(expiresAt: Date | null, now: Date) {
  return expiresAt !== null && expiresAt.getTime() <= now.getTime();
}

function getIntentData(gatewayResponse?: Record<string, unknown> | null) {
  if (!gatewayResponse) {
    return null;
  }

  const token = typeof gatewayResponse.token === "string" ? gatewayResponse.token : null;
  const redirectUrl =
    typeof gatewayResponse.redirect_url === "string" ? gatewayResponse.redirect_url : null;

  if (!token || !redirectUrl) {
    return null;
  }

  return { token, redirectUrl };
}

export function decidePaymentIntentAction(context: PaymentIntentContext): PaymentIntentDecision {
  if (context.paymentStatus === "PAID") {
    return { action: "reject", reason: "booking-paid" };
  }

  if (isExpired(context.bookingExpiresAt, context.now) || context.bookingStatus === "EXPIRED") {
    return { action: "reject", reason: "booking-expired" };
  }

  if (!context.transaction) {
    return { action: "create", reason: "missing-transaction" };
  }

  if (TERMINAL_TRANSACTION_STATUSES.has(context.transaction.status)) {
    return {
      action: "create",
      reason: "transaction-terminal",
      reuseTransactionId: context.transaction.id,
    };
  }

  if (!ACTIVE_TRANSACTION_STATUSES.has(context.transaction.status)) {
    return {
      action: "create",
      reason: "transaction-terminal",
      reuseTransactionId: context.transaction.id,
    };
  }

  if (isExpired(context.transaction.expiresAt, context.now)) {
    return {
      action: "create",
      reason: "transaction-expired",
      reuseTransactionId: context.transaction.id,
    };
  }

  const intentData = getIntentData(context.transaction.gatewayResponse ?? null);
  if (!intentData) {
    return {
      action: "repair-create",
      reason: "missing-intent-data",
      reuseTransactionId: context.transaction.id,
    };
  }

  return {
    action: "reuse",
    reason: "active-intent",
    transactionId: context.transaction.id,
    token: intentData.token,
    redirectUrl: intentData.redirectUrl,
  };
}
