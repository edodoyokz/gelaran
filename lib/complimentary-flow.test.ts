import assert from "node:assert/strict";
import test from "node:test";
import {
  findComplimentarySubmissionConflict,
  getComplimentaryApprovalError,
  getComplimentaryReviewTransitionError,
  mapComplimentaryRequestSummary,
} from "./complimentary-flow";

test("findComplimentarySubmissionConflict rejects when pending request exists for same event and guest email", async () => {
  const conflict = await findComplimentarySubmissionConflict(
    {
      complimentaryTicketRequest: {
        findFirst: async () => ({ id: "req-1", status: "PENDING" }),
      },
      booking: {
        findFirst: async () => null,
      },
    },
    {
      eventId: "event-1",
      guestEmail: "guest@example.com",
    }
  );

  assert.deepEqual(conflict, {
    code: "DUPLICATE_PENDING_REQUEST",
    message: "Guest already has a pending complimentary request for this event",
  });
});

test("findComplimentarySubmissionConflict rejects when approved request already exists even without booking", async () => {
  const conflict = await findComplimentarySubmissionConflict(
    {
      complimentaryTicketRequest: {
        findFirst: async () => ({ id: "req-2", status: "APPROVED" }),
      },
      booking: {
        findFirst: async () => null,
      },
    },
    {
      eventId: "event-1",
      guestEmail: "guest@example.com",
    }
  );

  assert.deepEqual(conflict, {
    code: "DUPLICATE_APPROVED_REQUEST",
    message: "Guest already has an approved complimentary request for this event",
  });
});

test("findComplimentarySubmissionConflict queries guest email case-insensitively", async () => {
  const calls: Array<Record<string, unknown>> = [];

  await findComplimentarySubmissionConflict(
    {
      complimentaryTicketRequest: {
        findFirst: async (args) => {
          calls.push(args.where as Record<string, unknown>);
          return null;
        },
      },
      booking: {
        findFirst: async (args) => {
          calls.push(args.where as Record<string, unknown>);
          return null;
        },
      },
    },
    {
      eventId: "event-1",
      guestEmail: "Guest@Example.com",
    }
  );

  assert.deepEqual(calls[0], {
    eventId: "event-1",
    guestEmail: {
      equals: "guest@example.com",
      mode: "insensitive",
    },
    status: {
      in: ["PENDING", "APPROVED"],
    },
  });
  assert.deepEqual(calls[1], {
    eventId: "event-1",
    guestEmail: {
      equals: "guest@example.com",
      mode: "insensitive",
    },
    isComplimentary: true,
  });
});

test("findComplimentarySubmissionConflict rejects when complimentary booking already exists for same event and guest email", async () => {
  const conflict = await findComplimentarySubmissionConflict(
    {
      complimentaryTicketRequest: {
        findFirst: async () => null,
      },
      booking: {
        findFirst: async () => ({ id: "booking-1" }),
      },
    },
    {
      eventId: "event-1",
      guestEmail: "guest@example.com",
    }
  );

  assert.deepEqual(conflict, {
    code: "DUPLICATE_APPROVED_BOOKING",
    message: "Guest already has a complimentary booking for this event",
  });
});

test("findComplimentarySubmissionConflict allows re-submission after rejected request", async () => {
  const conflict = await findComplimentarySubmissionConflict(
    {
      complimentaryTicketRequest: {
        findFirst: async () => null,
      },
      booking: {
        findFirst: async () => null,
      },
    },
    {
      eventId: "event-1",
      guestEmail: "guest@example.com",
    }
  );

  assert.equal(conflict, null);
});

test("getComplimentaryReviewTransitionError rejects approve after rejected", () => {
  assert.equal(
    getComplimentaryReviewTransitionError({
      currentStatus: "REJECTED",
      action: "APPROVE",
    }),
    "Only pending complimentary requests can be reviewed"
  );
});

test("getComplimentaryReviewTransitionError rejects reject after approved", () => {
  assert.equal(
    getComplimentaryReviewTransitionError({
      currentStatus: "APPROVED",
      action: "REJECT",
    }),
    "Only pending complimentary requests can be reviewed"
  );
});

test("getComplimentaryApprovalError rejects when complimentary booking already exists for request", () => {
  assert.equal(
    getComplimentaryApprovalError({
      currentStatus: "PENDING",
      existingBookingId: "booking-1",
      items: [],
    }),
    "Complimentary booking has already been issued for this request"
  );
});

test("getComplimentaryApprovalError rejects when quota becomes insufficient at approval time", () => {
  assert.equal(
    getComplimentaryApprovalError({
      currentStatus: "PENDING",
      items: [
        {
          ticketTypeName: "VIP",
          quantity: 3,
          available: 2,
        },
      ],
    }),
    "Quota tidak cukup untuk VIP. Tersedia 2"
  );
});

test("mapComplimentaryRequestSummary returns latest booking summary", () => {
  const summary = mapComplimentaryRequestSummary({
    id: "req-1",
    status: "APPROVED",
    reviewedAt: new Date("2026-03-08T10:00:00.000Z"),
    reviewedNote: "ok",
    reviewedBy: {
      id: "admin-1",
      name: "Admin",
      email: "admin@example.com",
    },
    bookings: [
      {
        id: "booking-1",
        bookingCode: "BOOK-001",
        status: "CONFIRMED",
        createdAt: new Date("2026-03-08T10:05:00.000Z"),
      },
    ],
  });

  assert.deepEqual(summary.reviewSummary, {
    reviewedAt: new Date("2026-03-08T10:00:00.000Z"),
    reviewedNote: "ok",
    reviewedBy: {
      id: "admin-1",
      name: "Admin",
      email: "admin@example.com",
    },
  });
  assert.deepEqual(summary.bookingSummary, {
    id: "booking-1",
    bookingCode: "BOOK-001",
    status: "CONFIRMED",
    createdAt: new Date("2026-03-08T10:05:00.000Z"),
  });
});

test("mapComplimentaryRequestSummary preserves rejected review evidence without booking", () => {
  const summary = mapComplimentaryRequestSummary({
    id: "req-2",
    status: "REJECTED",
    reviewedAt: new Date("2026-03-09T11:00:00.000Z"),
    reviewedNote: "duplicate guest",
    reviewedBy: {
      id: "admin-2",
      name: "Reviewer",
      email: "reviewer@example.com",
    },
    bookings: [],
  });

  assert.deepEqual(summary.reviewSummary, {
    reviewedAt: new Date("2026-03-09T11:00:00.000Z"),
    reviewedNote: "duplicate guest",
    reviewedBy: {
      id: "admin-2",
      name: "Reviewer",
      email: "reviewer@example.com",
    },
  });
  assert.equal(summary.bookingSummary, null);
});
