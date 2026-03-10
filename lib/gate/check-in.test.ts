import assert from "node:assert/strict";
import test from "node:test";

import { checkInTicket } from "./check-in.ts";

type DeviceAccessRecord = {
    id: string;
    isActive: boolean;
    session: {
        eventId: string;
        isActive: boolean;
        sessionType: "GATE" | "POS";
    };
};

type BookedTicketRecord = {
    id: string;
    uniqueCode: string;
    isCheckedIn: boolean;
    checkedInAt: Date | null;
    booking: {
        bookingCode: string;
        eventId: string;
        guestName: string | null;
        status: "PAID" | "CONFIRMED" | "PENDING";
        event: {
            id: string;
            title: string;
        };
    };
    ticketType: {
        name: string;
    };
};

function createHarness(overrides?: {
    deviceAccess?: DeviceAccessRecord | null;
    bookedTicket?: BookedTicketRecord | null;
}) {
    const state = {
        deviceAccess: overrides?.deviceAccess ?? {
            id: "device-1",
            isActive: true,
            session: {
                eventId: "event-1",
                isActive: true,
                sessionType: "GATE" as const,
            },
        },
        bookedTicket: overrides?.bookedTicket ?? {
            id: "ticket-1",
            uniqueCode: "VALID-001",
            isCheckedIn: false,
            checkedInAt: null,
            booking: {
                bookingCode: "BOOK-001",
                eventId: "event-1",
                guestName: "Guest One",
                status: "PAID" as const,
                event: {
                    id: "event-1",
                    title: "Gelaran Beta",
                },
            },
            ticketType: {
                name: "Regular",
            },
        },
        lastActiveAtUpdates: [] as Date[],
        logEntries: [] as Array<Record<string, unknown>>,
    };

    const prisma = {
        deviceAccess: {
            async findUnique() {
                return state.deviceAccess;
            },
            async update(args: { data: { lastActiveAt: Date } }) {
                state.lastActiveAtUpdates.push(args.data.lastActiveAt);
                return state.deviceAccess;
            },
        },
        bookedTicket: {
            async findUnique(args: { where: { uniqueCode: string } }) {
                if (!state.bookedTicket) {
                    return null;
                }

                return state.bookedTicket.uniqueCode === args.where.uniqueCode
                    ? state.bookedTicket
                    : null;
            },
            async update(args: { data: { isCheckedIn: boolean; checkedInAt: Date } }) {
                if (!state.bookedTicket) {
                    throw new Error("booked ticket missing");
                }

                state.bookedTicket = {
                    ...state.bookedTicket,
                    isCheckedIn: args.data.isCheckedIn,
                    checkedInAt: args.data.checkedInAt,
                };

                return state.bookedTicket;
            },
        },
        checkInLog: {
            async create(args: { data: Record<string, unknown> }) {
                state.logEntries.push(args.data);
                return args.data;
            },
        },
    };

    return { prisma, state };
}

test("returns ACCESS_DENIED when device token is missing", async () => {
    const { prisma } = createHarness();

    const result = await checkInTicket(
        {
            deviceToken: null,
            ticketCode: "VALID-001",
        },
        {
            prisma,
            now: () => new Date("2026-03-10T10:00:00.000Z"),
        }
    );

    assert.equal(result.result, "ACCESS_DENIED");
    assert.equal(result.status, 401);
});

test("returns SESSION_INACTIVE when gate session is inactive", async () => {
    const { prisma } = createHarness({
        deviceAccess: {
            id: "device-1",
            isActive: true,
            session: {
                eventId: "event-1",
                isActive: false,
                sessionType: "GATE",
            },
        },
    });

    const result = await checkInTicket(
        {
            deviceToken: "device-token",
            ticketCode: "VALID-001",
        },
        {
            prisma,
            now: () => new Date("2026-03-10T10:00:00.000Z"),
        }
    );

    assert.equal(result.result, "SESSION_INACTIVE");
    assert.equal(result.status, 403);
});

test("returns INVALID when ticket code is unknown", async () => {
    const { prisma } = createHarness({ bookedTicket: null });

    const result = await checkInTicket(
        {
            deviceToken: "device-token",
            ticketCode: "missing-001",
        },
        {
            prisma,
            now: () => new Date("2026-03-10T10:00:00.000Z"),
        }
    );

    assert.equal(result.result, "INVALID");
    assert.equal(result.status, 404);
});

test("returns WRONG_EVENT when ticket belongs to another event", async () => {
    const { prisma, state } = createHarness({
        bookedTicket: {
            id: "ticket-1",
            uniqueCode: "VALID-001",
            isCheckedIn: false,
            checkedInAt: null,
            booking: {
                bookingCode: "BOOK-001",
                eventId: "event-2",
                guestName: "Guest One",
                status: "PAID",
                event: {
                    id: "event-2",
                    title: "Other Event",
                },
            },
            ticketType: {
                name: "Regular",
            },
        },
    });

    const result = await checkInTicket(
        {
            deviceToken: "device-token",
            ticketCode: "valid-001",
        },
        {
            prisma,
            now: () => new Date("2026-03-10T10:00:00.000Z"),
        }
    );

    assert.equal(result.result, "WRONG_EVENT");
    assert.equal(result.status, 400);
    assert.deepEqual(state.logEntries, [
        {
            bookedTicketId: "ticket-1",
            scannedBy: "device-1",
            result: "WRONG_EVENT",
            scannedCode: "VALID-001",
            deviceInfo: undefined,
            ipAddress: undefined,
        },
    ]);
});

test("returns INVALID and logs when booking is not ready for check-in", async () => {
    const { prisma, state } = createHarness({
        bookedTicket: {
            id: "ticket-1",
            uniqueCode: "VALID-001",
            isCheckedIn: false,
            checkedInAt: null,
            booking: {
                bookingCode: "BOOK-001",
                eventId: "event-1",
                guestName: "Guest One",
                status: "PENDING",
                event: {
                    id: "event-1",
                    title: "Gelaran Beta",
                },
            },
            ticketType: {
                name: "Regular",
            },
        },
    });

    const result = await checkInTicket(
        {
            deviceToken: "device-token",
            ticketCode: "VALID-001",
        },
        {
            prisma,
            now: () => new Date("2026-03-10T10:00:00.000Z"),
        }
    );

    assert.equal(result.result, "INVALID");
    assert.equal(result.status, 400);
    assert.deepEqual(state.logEntries, [
        {
            bookedTicketId: "ticket-1",
            scannedBy: "device-1",
            result: "INVALID",
            scannedCode: "VALID-001",
            deviceInfo: undefined,
            ipAddress: undefined,
        },
    ]);
});

test("returns ALREADY_CHECKED_IN when ticket was used before", async () => {
    const checkedInAt = new Date("2026-03-10T09:55:00.000Z");
    const { prisma, state } = createHarness({
        bookedTicket: {
            id: "ticket-1",
            uniqueCode: "VALID-001",
            isCheckedIn: true,
            checkedInAt,
            booking: {
                bookingCode: "BOOK-001",
                eventId: "event-1",
                guestName: "Guest One",
                status: "PAID",
                event: {
                    id: "event-1",
                    title: "Gelaran Beta",
                },
            },
            ticketType: {
                name: "Regular",
            },
        },
    });

    const result = await checkInTicket(
        {
            deviceToken: "device-token",
            ticketCode: "VALID-001",
        },
        {
            prisma,
            now: () => new Date("2026-03-10T10:00:00.000Z"),
        }
    );

    assert.equal(result.result, "ALREADY_CHECKED_IN");
    assert.equal(result.status, 400);
    assert.equal(result.checkedInAt?.toISOString(), checkedInAt.toISOString());
    assert.deepEqual(state.logEntries, [
        {
            bookedTicketId: "ticket-1",
            scannedBy: "device-1",
            result: "ALREADY_CHECKED_IN",
            scannedCode: "VALID-001",
            deviceInfo: undefined,
            ipAddress: undefined,
        },
    ]);
});

test("returns SUCCESS and marks ticket checked in for a valid scan", async () => {
    const now = new Date("2026-03-10T10:00:00.000Z");
    const { prisma, state } = createHarness();

    const result = await checkInTicket(
        {
            deviceToken: "device-token",
            ticketCode: " valid-001 ",
        },
        {
            prisma,
            now: () => now,
        }
    );

    assert.equal(result.result, "SUCCESS");
    assert.equal(result.status, 200);
    assert.equal(state.bookedTicket?.isCheckedIn, true);
    assert.equal(state.bookedTicket?.checkedInAt?.toISOString(), now.toISOString());
    assert.deepEqual(state.logEntries, [
        {
            bookedTicketId: "ticket-1",
            scannedBy: "device-1",
            result: "SUCCESS",
            scannedCode: "VALID-001",
            deviceInfo: undefined,
            ipAddress: undefined,
        },
    ]);
});

test("returns ALREADY_CHECKED_IN on a repeat scan after success", async () => {
    const now = new Date("2026-03-10T10:00:00.000Z");
    const { prisma } = createHarness();

    const firstScan = await checkInTicket(
        {
            deviceToken: "device-token",
            ticketCode: "VALID-001",
        },
        {
            prisma,
            now: () => now,
        }
    );

    const secondScan = await checkInTicket(
        {
            deviceToken: "device-token",
            ticketCode: "VALID-001",
        },
        {
            prisma,
            now: () => now,
        }
    );

    assert.equal(firstScan.result, "SUCCESS");
    assert.equal(secondScan.result, "ALREADY_CHECKED_IN");
    assert.equal(secondScan.checkedInAt?.toISOString(), now.toISOString());
});
