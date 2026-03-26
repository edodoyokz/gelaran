import crypto from "crypto";
import {
  decidePaymentIntentAction,
  type BookingStatus,
  type ExistingTransaction,
  type PaymentStatus,
} from "./idempotency";

type ExistingBooking = {
  id: string;
  bookingCode: string;
  status: BookingStatus;
  paymentStatus: PaymentStatus;
  expiresAt: Date | null;
  transaction: ExistingTransaction | null;
};

export interface PosSellRetryContext {
  requestId: string;
  now: Date;
  existingBooking: ExistingBooking | null;
}

type CreateBookingDecision = {
  action: "create-booking";
  bookingCode: string;
};

type ReturnExistingBookingDecision = {
  action: "return-existing-booking";
  bookingId: string;
  bookingCode: string;
};

type ReusePaymentIntentDecision = {
  action: "reuse-payment-intent";
  bookingId: string;
  bookingCode: string;
  transactionId: string;
  token: string;
  redirectUrl: string;
};

type RefreshPaymentIntentDecision = {
  action: "refresh-payment-intent";
  bookingId: string;
  bookingCode: string;
  reuseTransactionId?: string;
};

type RejectBookingDecision = {
  action: "reject";
  bookingId: string;
  bookingCode: string;
  reason: "booking-paid" | "booking-expired";
};

export type PosSellRetryDecision =
  | CreateBookingDecision
  | ReturnExistingBookingDecision
  | ReusePaymentIntentDecision
  | RefreshPaymentIntentDecision
  | RejectBookingDecision;

export function createPosBookingCode(requestId: string) {
  const hash = crypto.createHash("sha256").update(requestId).digest("hex").toUpperCase();
  return `BSC-${hash.slice(0, 8)}`;
}

export function decidePosSellRetryAction(context: PosSellRetryContext): PosSellRetryDecision {
  const bookingCode = createPosBookingCode(context.requestId);

  if (!context.existingBooking) {
    return {
      action: "create-booking",
      bookingCode,
    };
  }

  if (
    context.existingBooking.paymentStatus === "PAID" ||
    context.existingBooking.status === "CONFIRMED"
  ) {
    return {
      action: "return-existing-booking",
      bookingId: context.existingBooking.id,
      bookingCode: context.existingBooking.bookingCode,
    };
  }

  const paymentDecision = decidePaymentIntentAction({
    bookingStatus: context.existingBooking.status,
    paymentStatus: context.existingBooking.paymentStatus,
    bookingExpiresAt: context.existingBooking.expiresAt,
    now: context.now,
    transaction: context.existingBooking.transaction,
  });

  if (paymentDecision.action === "reuse") {
    return {
      action: "reuse-payment-intent",
      bookingId: context.existingBooking.id,
      bookingCode: context.existingBooking.bookingCode,
      transactionId: paymentDecision.transactionId,
      token: paymentDecision.token,
      redirectUrl: paymentDecision.redirectUrl,
    };
  }

  if (paymentDecision.action === "reject") {
    return {
      action: "reject",
      bookingId: context.existingBooking.id,
      bookingCode: context.existingBooking.bookingCode,
      reason: paymentDecision.reason,
    };
  }

  return {
    action: "refresh-payment-intent",
    bookingId: context.existingBooking.id,
    bookingCode: context.existingBooking.bookingCode,
    reuseTransactionId:
      paymentDecision.action === "create" || paymentDecision.action === "repair-create"
        ? paymentDecision.reuseTransactionId
        : undefined,
  };
}
