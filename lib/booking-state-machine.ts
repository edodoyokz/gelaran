// Booking State Machine for Complimentary Bookings

export type BookingStatus =
  | "DRAFT"
  | "AWAITING_APPROVAL"
  | "APPROVED"
  | "REJECTED"
  | "AWAITING_PAYMENT"
  | "PAID"
  | "CONFIRMED"
  | "CANCELLED"
  | "REFUNDED"
  | "EXPIRED";

export type BookingPaymentStatus =
  | "UNPAID"
  | "PENDING"
  | "PAID"
  | "REFUNDED"
  | "FAILED";

interface BookingStateTransition {
  from: BookingStatus;
  to: BookingStatus;
  allowed: boolean;
  requiresApproval?: boolean;
  reason?: string;
}

// Valid state transitions for complimentary bookings
const COMPLIMENTARY_TRANSITIONS: Record<string, BookingStateTransition[]> = {
  DRAFT: [
    { from: "DRAFT", to: "AWAITING_APPROVAL", allowed: true, reason: "Submit for approval" },
    { from: "DRAFT", to: "CANCELLED", allowed: true, reason: "User cancelled" },
  ],
  AWAITING_APPROVAL: [
    { from: "AWAITING_APPROVAL", to: "APPROVED", allowed: true, reason: "Approved by organizer/admin" },
    { from: "AWAITING_APPROVAL", to: "REJECTED", allowed: true, reason: "Rejected by organizer/admin" },
    { from: "AWAITING_APPROVAL", to: "CANCELLED", allowed: true, reason: "Cancelled" },
  ],
  APPROVED: [
    { from: "APPROVED", to: "CONFIRMED", allowed: true, reason: "Auto-confirmed for complimentary bookings" },
    { from: "APPROVED", to: "CANCELLED", allowed: true, reason: "Cancelled" },
  ],
  REJECTED: [
    // Terminal state
  ],
  CONFIRMED: [
    { from: "CONFIRMED", to: "CANCELLED", allowed: true, reason: "Cancelled" },
    { from: "CONFIRMED", to: "REFUNDED", allowed: false, reason: "Complimentary bookings cannot be refunded" },
  ],
  CANCELLED: [
    // Terminal state
  ],
  EXPIRED: [
    // Terminal state
  ],
  REFUNDED: [
    // Terminal state
  ],
};

// Paid booking transitions (for future payment integration)
const PAID_TRANSITIONS: Record<string, BookingStateTransition[]> = {
  AWAITING_PAYMENT: [
    { from: "AWAITING_PAYMENT", to: "PAID", allowed: true, reason: "Payment completed" },
    { from: "AWAITING_PAYMENT", to: "EXPIRED", allowed: true, reason: "Payment timeout" },
    { from: "AWAITING_PAYMENT", to: "CANCELLED", allowed: true, reason: "User cancelled" },
  ],
  PAID: [
    { from: "PAID", to: "CONFIRMED", allowed: true, reason: "Booking confirmed" },
    { from: "PAID", to: "REFUNDED", allowed: true, reason: "Refunded" },
  ],
};

export function isStateTransitionAllowed(
  from: BookingStatus,
  to: BookingStatus,
  isComplimentary: boolean
): boolean {
  const transitions = isComplimentary ? COMPLIMENTARY_TRANSITIONS : PAID_TRANSITIONS;
  const allowedTransitions = transitions[from] || [];

  return allowedTransitions.some((transition) => transition.to === to && transition.allowed);
}

export function getTransitionReason(
  from: BookingStatus,
  to: BookingStatus,
  isComplimentary: boolean
): string | null {
  const transitions = isComplimentary ? COMPLIMENTARY_TRANSITIONS : PAID_TRANSITIONS;
  const allowedTransitions = transitions[from] || [];

  const transition = allowedTransitions.find((t) => t.to === to);
  return transition?.reason || null;
}

export function isTerminalState(status: BookingStatus): boolean {
  return ["CANCELLED", "REJECTED", "EXPIRED", "REFUNDED"].includes(status);
}

export function isFinalState(status: BookingStatus): boolean {
  return ["CONFIRMED", ...isTerminalState(status) ? [status] : []].includes(status);
}

export function canTransitionTo(status: BookingStatus): BookingStatus[] {
  const allTransitions = Object.values(COMPLIMENTARY_TRANSITIONS).flat();
  return allTransitions
    .filter((t) => t.from === status && t.allowed)
    .map((t) => t.to);
}

export function requiresApproval(from: BookingStatus, to: BookingStatus): boolean {
  const transitions = COMPLIMENTARY_TRANSITIONS[from] || [];
  const transition = transitions.find((t) => t.to === to);
  return transition?.requiresApproval || false;
}

export function validateBookingState(
  currentStatus: BookingStatus,
  newStatus: BookingStatus,
  isComplimentary: boolean
): { valid: boolean; reason?: string } {
  if (currentStatus === newStatus) {
    return { valid: true };
  }

  if (!isStateTransitionAllowed(currentStatus, newStatus, isComplimentary)) {
    return {
      valid: false,
      reason: `Invalid state transition from ${currentStatus} to ${newStatus}`,
    };
  }

  return { valid: true };
}

export function getInitialState(isComplimentary: boolean): BookingStatus {
  return isComplimentary ? "DRAFT" : "AWAITING_PAYMENT";
}

export function getInitialPaymentStatus(isComplimentary: boolean): BookingPaymentStatus {
  return isComplimentary ? "PAID" : "UNPAID";
}

// Complimentary booking specific helpers
export function isComplimentaryBooking(status: BookingStatus, totalAmount: number): boolean {
  return totalAmount === 0 || status === "AWAITING_APPROVAL" || status === "APPROVED";
}

export function needsApproval(status: BookingStatus, totalAmount: number): boolean {
  return totalAmount === 0 && status === "DRAFT";
}

export function canAutoConfirm(status: BookingStatus, totalAmount: number): boolean {
  return totalAmount === 0 && status === "APPROVED";
}

// State machine for booking lifecycle
export class BookingStateMachine {
  private status: BookingStatus;
  private paymentStatus: BookingPaymentStatus;
  private isComplimentary: boolean;

  constructor(
    status: BookingStatus = "DRAFT",
    paymentStatus: BookingPaymentStatus = "UNPAID",
    isComplimentary: boolean = false
  ) {
    this.status = status;
    this.paymentStatus = paymentStatus;
    this.isComplimentary = isComplimentary;
  }

  canTransitionTo(newStatus: BookingStatus): boolean {
    return isStateTransitionAllowed(this.status, newStatus, this.isComplimentary);
  }

  transitionTo(newStatus: BookingStatus): { success: boolean; reason?: string } {
    const validation = validateBookingState(this.status, newStatus, this.isComplimentary);

    if (!validation.valid) {
      return {
        success: false,
        reason: validation.reason,
      };
    }

    this.status = newStatus;
    return { success: true };
  }

  getCurrentStatus(): BookingStatus {
    return this.status;
  }

  getPaymentStatus(): BookingPaymentStatus {
    return this.paymentStatus;
  }

  setPaymentStatus(newStatus: BookingPaymentStatus): void {
    this.paymentStatus = newStatus;
  }

  isTerminal(): boolean {
    return isTerminalState(this.status);
  }

  canApprove(): boolean {
    return this.status === "AWAITING_APPROVAL";
  }

  canReject(): boolean {
    return this.status === "AWAITING_APPROVAL";
  }

  canCancel(): boolean {
    return !isTerminalState(this.status);
  }

  approve(): { success: boolean; reason?: string } {
    if (!this.canApprove()) {
      return {
        success: false,
        reason: "Booking cannot be approved in current state",
      };
    }

    return this.transitionTo("APPROVED");
  }

  reject(): { success: boolean; reason?: string } {
    if (!this.canReject()) {
      return {
        success: false,
        reason: "Booking cannot be rejected in current state",
      };
    }

    return this.transitionTo("REJECTED");
  }

  cancel(): { success: boolean; reason?: string } {
    if (!this.canCancel()) {
      return {
        success: false,
        reason: "Booking cannot be cancelled in current state",
      };
    }

    return this.transitionTo("CANCELLED");
  }

  confirm(): { success: boolean; reason?: string } {
    if (this.isComplimentary && this.status === "APPROVED") {
      return this.transitionTo("CONFIRMED");
    }

    if (!this.isComplimentary && this.status === "PAID") {
      return this.transitionTo("CONFIRMED");
    }

    return {
      success: false,
      reason: "Booking cannot be confirmed in current state",
    };
  }
}
