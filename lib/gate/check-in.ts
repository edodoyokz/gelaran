export type GateCheckInResultCode =
    | "SUCCESS"
    | "ALREADY_CHECKED_IN"
    | "INVALID"
    | "WRONG_EVENT"
    | "ACCESS_DENIED"
    | "SESSION_INACTIVE";

type GateCheckInTicket = {
    id: string;
    uniqueCode: string;
    ticketType: string;
    attendeeName: string;
    bookingCode: string;
    eventTitle: string;
    checkedInAt: Date;
};

type GateCheckInBaseOutcome = {
    message: string;
    result: GateCheckInResultCode;
    status: number;
};

export type GateCheckInOutcome =
    | (GateCheckInBaseOutcome & {
          result: "SUCCESS";
          ticket: GateCheckInTicket;
      })
    | (GateCheckInBaseOutcome & {
          result: Exclude<GateCheckInResultCode, "SUCCESS">;
          checkedInAt?: Date;
      });

type GateCheckInInput = {
    deviceInfo?: string | null;
    deviceToken?: string | null;
    ipAddress?: string | null;
    ticketCode?: string | null;
};

type DeviceAccessRecord = {
    id: string;
    isActive: boolean;
    session: {
        eventId: string;
        isActive: boolean;
        sessionType: string;
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
        status: string;
        event: {
            title: string;
        };
    };
    ticketType: {
        name: string;
    };
};

type CheckInLogRecord = {
    bookedTicketId: string;
    deviceInfo?: string;
    ipAddress?: string;
    result: "SUCCESS" | "ALREADY_CHECKED_IN" | "INVALID" | "WRONG_EVENT";
    scannedBy: string;
    scannedCode: string;
};

type GateCheckInPrisma = {
    deviceAccess: {
        findUnique: (args: Record<string, unknown>) => Promise<DeviceAccessRecord | null>;
        update: (args: { where: { id: string }; data: { lastActiveAt: Date } }) => Promise<unknown>;
    };
    bookedTicket: {
        findUnique: (args: Record<string, unknown>) => Promise<BookedTicketRecord | null>;
        update: (args: {
            where: { id: string };
            data: { isCheckedIn: boolean; checkedInAt: Date };
        }) => Promise<BookedTicketRecord>;
    };
    checkInLog: {
        create: (args: { data: CheckInLogRecord }) => Promise<unknown>;
    };
};

type GateCheckInDeps = {
    now?: () => Date;
    prisma?: GateCheckInPrisma;
};

async function resolvePrismaClient(provided?: GateCheckInPrisma) {
    if (provided) {
        return provided;
    }

    const prismaModule = await import("../prisma/client");
    return prismaModule.default as GateCheckInPrisma;
}

function success(ticket: GateCheckInTicket): GateCheckInOutcome {
    return {
        status: 200,
        result: "SUCCESS",
        message: "Check-in berhasil",
        ticket,
    };
}

function failure(
    status: number,
    result: Exclude<GateCheckInResultCode, "SUCCESS">,
    message: string,
    extra?: Pick<Extract<GateCheckInOutcome, { result: Exclude<GateCheckInResultCode, "SUCCESS"> }>, "checkedInAt">
): GateCheckInOutcome {
    return {
        status,
        result,
        message,
        ...extra,
    };
}

function normalizeTicketCode(ticketCode?: string | null) {
    return ticketCode?.trim().toUpperCase() ?? "";
}

async function touchDeviceActivity(
    prisma: GateCheckInPrisma,
    deviceAccessId: string,
    lastActiveAt: Date
) {
    await prisma.deviceAccess.update({
        where: { id: deviceAccessId },
        data: { lastActiveAt },
    });
}

async function logOutcome(prisma: GateCheckInPrisma, data: CheckInLogRecord) {
    await prisma.checkInLog.create({ data });
}

export async function checkInTicket(
    input: GateCheckInInput,
    deps: GateCheckInDeps = {}
): Promise<GateCheckInOutcome> {
    const prisma = await resolvePrismaClient(deps.prisma);
    const now = deps.now ?? (() => new Date());
    const currentTime = now();
    const normalizedTicketCode = normalizeTicketCode(input.ticketCode);

    if (!input.deviceToken) {
        return failure(401, "ACCESS_DENIED", "Device token diperlukan");
    }

    const deviceAccess = await prisma.deviceAccess.findUnique({
        where: { deviceToken: input.deviceToken },
        include: {
            session: {
                select: {
                    eventId: true,
                    isActive: true,
                    sessionType: true,
                },
            },
        },
    });

    if (!deviceAccess || !deviceAccess.isActive) {
        return failure(401, "ACCESS_DENIED", "Akses tidak valid");
    }

    if (deviceAccess.session.sessionType !== "GATE") {
        await touchDeviceActivity(prisma, deviceAccess.id, currentTime);
        return failure(403, "ACCESS_DENIED", "Device ini bukan untuk check-in. Gunakan /pos untuk penjualan.");
    }

    if (!deviceAccess.session.isActive) {
        await touchDeviceActivity(prisma, deviceAccess.id, currentTime);
        return failure(403, "SESSION_INACTIVE", "Session Gate Scanner tidak aktif");
    }

    if (!normalizedTicketCode) {
        await touchDeviceActivity(prisma, deviceAccess.id, currentTime);
        return failure(400, "INVALID", "Kode tiket diperlukan");
    }

    const bookedTicket = await prisma.bookedTicket.findUnique({
        where: { uniqueCode: normalizedTicketCode },
        include: {
            booking: {
                include: {
                    event: {
                        select: {
                            id: true,
                            title: true,
                        },
                    },
                },
            },
            ticketType: {
                select: { name: true },
            },
        },
    });

    if (!bookedTicket) {
        await touchDeviceActivity(prisma, deviceAccess.id, currentTime);
        return failure(404, "INVALID", "Tiket tidak ditemukan");
    }

    if (bookedTicket.booking.eventId !== deviceAccess.session.eventId) {
        await logOutcome(prisma, {
            bookedTicketId: bookedTicket.id,
            scannedBy: deviceAccess.id,
            result: "WRONG_EVENT",
            scannedCode: normalizedTicketCode,
            deviceInfo: input.deviceInfo ?? undefined,
            ipAddress: input.ipAddress ?? undefined,
        });
        await touchDeviceActivity(prisma, deviceAccess.id, currentTime);
        return failure(400, "WRONG_EVENT", "Tiket untuk event berbeda");
    }

    if (!["CONFIRMED", "PAID"].includes(bookedTicket.booking.status)) {
        await logOutcome(prisma, {
            bookedTicketId: bookedTicket.id,
            scannedBy: deviceAccess.id,
            result: "INVALID",
            scannedCode: normalizedTicketCode,
            deviceInfo: input.deviceInfo ?? undefined,
            ipAddress: input.ipAddress ?? undefined,
        });
        await touchDeviceActivity(prisma, deviceAccess.id, currentTime);
        return failure(400, "INVALID", "Booking belum dikonfirmasi");
    }

    if (bookedTicket.isCheckedIn) {
        await logOutcome(prisma, {
            bookedTicketId: bookedTicket.id,
            scannedBy: deviceAccess.id,
            result: "ALREADY_CHECKED_IN",
            scannedCode: normalizedTicketCode,
            deviceInfo: input.deviceInfo ?? undefined,
            ipAddress: input.ipAddress ?? undefined,
        });
        await touchDeviceActivity(prisma, deviceAccess.id, currentTime);
        return failure(400, "ALREADY_CHECKED_IN", "Tiket sudah di-check-in", {
            checkedInAt: bookedTicket.checkedInAt ?? undefined,
        });
    }

    const updatedTicket = await prisma.bookedTicket.update({
        where: { id: bookedTicket.id },
        data: {
            isCheckedIn: true,
            checkedInAt: currentTime,
        },
    });

    await logOutcome(prisma, {
        bookedTicketId: bookedTicket.id,
        scannedBy: deviceAccess.id,
        result: "SUCCESS",
        scannedCode: normalizedTicketCode,
        deviceInfo: input.deviceInfo ?? undefined,
        ipAddress: input.ipAddress ?? undefined,
    });
    await touchDeviceActivity(prisma, deviceAccess.id, currentTime);

    return success({
        id: bookedTicket.id,
        uniqueCode: bookedTicket.uniqueCode,
        ticketType: bookedTicket.ticketType.name,
        attendeeName: bookedTicket.booking.guestName || "Guest",
        bookingCode: bookedTicket.booking.bookingCode,
        eventTitle: bookedTicket.booking.event.title,
        checkedInAt: updatedTicket.checkedInAt,
    });
}
