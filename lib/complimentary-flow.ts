export type ComplimentaryRequestStatus = "PENDING" | "APPROVED" | "REJECTED";
export type ComplimentaryReviewAction = "APPROVE" | "REJECT";

export interface ComplimentarySubmissionConflict {
  code:
    | "DUPLICATE_PENDING_REQUEST"
    | "DUPLICATE_APPROVED_REQUEST"
    | "DUPLICATE_APPROVED_BOOKING";
  message: string;
}

interface ComplimentaryPolicyClient {
  complimentaryTicketRequest: {
    findFirst: (args: {
      where: Record<string, unknown>;
      select?: { id: true; status: true };
    }) => Promise<{ id: string; status: ComplimentaryRequestStatus } | null>;
  };
  booking: {
    findFirst: (args: {
      where: Record<string, unknown>;
      select?: { id: true };
    }) => Promise<{ id: string } | null>;
  };
}

interface FindSubmissionConflictInput {
  eventId: string;
  guestEmail: string;
}

interface ReviewTransitionInput {
  currentStatus: ComplimentaryRequestStatus;
  action: ComplimentaryReviewAction;
}

interface ApprovalQuotaItem {
  ticketTypeName: string;
  quantity: number;
  available: number;
}

interface ApprovalErrorInput {
  currentStatus: ComplimentaryRequestStatus;
  existingBookingId?: string | null;
  items: ApprovalQuotaItem[];
}

interface ComplimentaryReviewerSummary {
  id: string;
  name: string | null;
  email: string | null;
}

interface ComplimentaryBookingSummary {
  id: string;
  bookingCode: string;
  status: string;
  createdAt: Date;
}

interface ComplimentaryRequestSummaryInput {
  id: string;
  status: ComplimentaryRequestStatus;
  reviewedAt: Date | null;
  reviewedNote: string | null;
  reviewedBy: ComplimentaryReviewerSummary | null;
  bookings?: ComplimentaryBookingSummary[];
}

export function normalizeGuestEmail(email: string) {
  return email.trim().toLowerCase();
}

export async function findComplimentarySubmissionConflict(
  client: ComplimentaryPolicyClient,
  input: FindSubmissionConflictInput
): Promise<ComplimentarySubmissionConflict | null> {
  const guestEmail = normalizeGuestEmail(input.guestEmail);

  const openRequest = await client.complimentaryTicketRequest.findFirst({
    where: {
      eventId: input.eventId,
      guestEmail: {
        equals: guestEmail,
        mode: "insensitive",
      },
      status: {
        in: ["PENDING", "APPROVED"],
      },
    },
    select: { id: true, status: true },
  });

  if (openRequest?.status === "PENDING") {
    return {
      code: "DUPLICATE_PENDING_REQUEST",
      message: "Guest already has a pending complimentary request for this event",
    };
  }

  if (openRequest?.status === "APPROVED") {
    return {
      code: "DUPLICATE_APPROVED_REQUEST",
      message: "Guest already has an approved complimentary request for this event",
    };
  }

  const issuedBooking = await client.booking.findFirst({
    where: {
      eventId: input.eventId,
      guestEmail: {
        equals: guestEmail,
        mode: "insensitive",
      },
      isComplimentary: true,
    },
    select: { id: true },
  });

  if (issuedBooking) {
    return {
      code: "DUPLICATE_APPROVED_BOOKING",
      message: "Guest already has a complimentary booking for this event",
    };
  }

  return null;
}

export function getComplimentaryReviewTransitionError(input: ReviewTransitionInput) {
  if (input.currentStatus !== "PENDING") {
    return "Only pending complimentary requests can be reviewed";
  }

  return null;
}

export function getComplimentaryApprovalError(input: ApprovalErrorInput) {
  const transitionError = getComplimentaryReviewTransitionError({
    currentStatus: input.currentStatus,
    action: "APPROVE",
  });

  if (transitionError) {
    return transitionError;
  }

  if (input.existingBookingId) {
    return "Complimentary booking has already been issued for this request";
  }

  const insufficientItem = input.items.find((item) => item.quantity > item.available);
  if (insufficientItem) {
    return `Quota tidak cukup untuk ${insufficientItem.ticketTypeName}. Tersedia ${insufficientItem.available}`;
  }

  return null;
}

export function mapComplimentaryRequestSummary<T extends ComplimentaryRequestSummaryInput>(request: T) {
  const latestBooking = request.bookings?.[0] ?? null;

  return {
    ...request,
    reviewSummary: {
      reviewedAt: request.reviewedAt,
      reviewedNote: request.reviewedNote,
      reviewedBy: request.reviewedBy,
    },
    bookingSummary: latestBooking
      ? {
          id: latestBooking.id,
          bookingCode: latestBooking.bookingCode,
          status: latestBooking.status,
          createdAt: latestBooking.createdAt,
        }
      : null,
  };
}
