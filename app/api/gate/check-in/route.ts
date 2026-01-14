import { type NextRequest } from "next/server";
import prisma from "@/lib/prisma/client";
import { successResponse, errorResponse } from "@/lib/api/response";

export async function POST(request: NextRequest) {
    try {
        const deviceToken = request.headers.get("x-device-token");

        if (!deviceToken) {
            return errorResponse("Device token diperlukan", 401);
        }

        const deviceAccess = await prisma.deviceAccess.findUnique({
            where: { deviceToken },
            include: {
                session: {
                    select: {
                        isActive: true,
                        eventId: true,
                        sessionType: true,
                    },
                },
            },
        });

        if (!deviceAccess || !deviceAccess.isActive) {
            return errorResponse("Akses tidak valid", 401);
        }

        if (deviceAccess.session.sessionType !== "GATE") {
            return errorResponse("Device ini bukan untuk check-in. Gunakan /pos untuk penjualan.", 403);
        }

        if (!deviceAccess.session.isActive) {
            return errorResponse("Session Gate Scanner tidak aktif", 403);
        }

        const { ticketCode } = await request.json();

        if (!ticketCode) {
            return errorResponse("Kode tiket diperlukan", 400);
        }

        const bookedTicket = await prisma.bookedTicket.findUnique({
            where: { uniqueCode: ticketCode.trim().toUpperCase() },
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
            await prisma.deviceAccess.update({
                where: { id: deviceAccess.id },
                data: { lastActiveAt: new Date() },
            });

            return errorResponse("Tiket tidak ditemukan", 404, { result: "INVALID" });
        }

        if (bookedTicket.booking.eventId !== deviceAccess.session.eventId) {
            return errorResponse("Tiket untuk event berbeda", 400, { result: "WRONG_EVENT" });
        }

        if (!["CONFIRMED", "PAID"].includes(bookedTicket.booking.status)) {
            return errorResponse("Booking belum dikonfirmasi", 400, { result: "INVALID" });
        }

        if (bookedTicket.isCheckedIn) {
            return errorResponse("Tiket sudah di-check-in", 400, {
                result: "ALREADY_CHECKED_IN",
                checkedInAt: bookedTicket.checkedInAt,
            });
        }

        await prisma.bookedTicket.update({
            where: { id: bookedTicket.id },
            data: {
                isCheckedIn: true,
                checkedInAt: new Date(),
            },
        });

        await prisma.checkInLog.create({
            data: {
                bookedTicketId: bookedTicket.id,
                scannedBy: deviceAccess.id,
                result: "SUCCESS",
                scannedCode: ticketCode,
                deviceInfo: request.headers.get("user-agent") || undefined,
                ipAddress: request.headers.get("x-forwarded-for") || undefined,
            },
        });

        await prisma.deviceAccess.update({
            where: { id: deviceAccess.id },
            data: { lastActiveAt: new Date() },
        });

        return successResponse({
            result: "SUCCESS",
            ticket: {
                id: bookedTicket.id,
                uniqueCode: bookedTicket.uniqueCode,
                ticketType: bookedTicket.ticketType.name,
                attendeeName: bookedTicket.booking.guestName || "Guest",
                bookingCode: bookedTicket.booking.bookingCode,
                eventTitle: bookedTicket.booking.event.title,
                checkedInAt: new Date(),
            },
        });
    } catch (error) {
        console.error("Gate check-in error:", error);
        return errorResponse("Gagal check-in", 500);
    }
}
