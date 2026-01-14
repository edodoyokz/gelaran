import { type NextRequest } from "next/server";
import prisma from "@/lib/prisma/client";
import { successResponse, errorResponse } from "@/lib/api/response";
import { createClient } from "@/lib/supabase/server";

interface CheckInLogWithTicket {
    bookedTicket: {
        ticketType: {
            name: string;
        };
        booking: {
            guestName: string | null;
            user: {
                name: string;
            } | null;
        };
    };
    scannedAt: Date;
}

// POST /api/check-in - Check in a ticket
export async function POST(request: NextRequest) {
    try {
        const supabase = await createClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
            return errorResponse("Unauthorized", 401);
        }

        const scanner = await prisma.user.findUnique({
            where: { email: user.email! },
        });

        if (!scanner || !["SCANNER", "ORGANIZER", "ADMIN", "SUPER_ADMIN"].includes(scanner.role)) {
            return errorResponse("Not authorized to scan tickets", 403);
        }

        const { ticketCode, eventId } = await request.json();

        if (!ticketCode) {
            return errorResponse("Ticket code is required", 400);
        }

        // Find the booked ticket
        const bookedTicket = await prisma.bookedTicket.findUnique({
            where: { uniqueCode: ticketCode },
            include: {
                booking: {
                    include: {
                        event: {
                            select: {
                                id: true,
                                title: true,
                                organizerId: true,
                            },
                        },
                        user: {
                            select: { name: true, email: true },
                        },
                    },
                },
                ticketType: {
                    select: { name: true },
                },
            },
        });

        if (!bookedTicket) {
            // Log failed attempt
            await prisma.checkInLog.create({
                data: {
                    bookedTicketId: "00000000-0000-0000-0000-000000000000", // Placeholder for invalid
                    scannedBy: scanner.id,
                    result: "INVALID",
                    scannedCode: ticketCode,
                    deviceInfo: request.headers.get("user-agent") || undefined,
                    ipAddress: request.headers.get("x-forwarded-for") || undefined,
                },
            }).catch(() => { }); // Ignore if fails

            return errorResponse("Ticket not found", 404, { result: "INVALID" });
        }

        // Check if correct event (if eventId provided)
        if (eventId && bookedTicket.booking.eventId !== eventId) {
            await prisma.checkInLog.create({
                data: {
                    bookedTicketId: bookedTicket.id,
                    scannedBy: scanner.id,
                    result: "WRONG_EVENT",
                    scannedCode: ticketCode,
                },
            });

            return errorResponse("Ticket is for a different event", 400, { result: "WRONG_EVENT" });
        }

        // Check booking status
        if (!["CONFIRMED", "PAID"].includes(bookedTicket.booking.status)) {
            return errorResponse("Booking not confirmed", 400, { result: "INVALID" });
        }

        // Check if already checked in
        if (bookedTicket.isCheckedIn) {
            await prisma.checkInLog.create({
                data: {
                    bookedTicketId: bookedTicket.id,
                    scannedBy: scanner.id,
                    result: "ALREADY_CHECKED_IN",
                    scannedCode: ticketCode,
                },
            });

            return errorResponse("Ticket already checked in", 400, {
                result: "ALREADY_CHECKED_IN",
                checkedInAt: bookedTicket.checkedInAt,
            });
        }

        // Check in the ticket
        const updatedTicket = await prisma.bookedTicket.update({
            where: { id: bookedTicket.id },
            data: {
                isCheckedIn: true,
                checkedInAt: new Date(),
                checkedInBy: scanner.id,
            },
        });

        // Log successful check-in
        await prisma.checkInLog.create({
            data: {
                bookedTicketId: bookedTicket.id,
                scannedBy: scanner.id,
                result: "SUCCESS",
                scannedCode: ticketCode,
                deviceInfo: request.headers.get("user-agent") || undefined,
                ipAddress: request.headers.get("x-forwarded-for") || undefined,
            },
        });

        return successResponse({
            result: "SUCCESS",
            ticket: {
                id: bookedTicket.id,
                ticketType: bookedTicket.ticketType.name,
                attendeeName: bookedTicket.booking.user?.name || bookedTicket.booking.guestName,
                attendeeEmail: bookedTicket.booking.user?.email || bookedTicket.booking.guestEmail,
                bookingCode: bookedTicket.booking.bookingCode,
                eventTitle: bookedTicket.booking.event.title,
                checkedInAt: updatedTicket.checkedInAt,
            },
        });
    } catch (error) {
        console.error("Check-in error:", error);
        return errorResponse("Check-in failed", 500);
    }
}

// GET /api/check-in?eventId=xxx - Get check-in stats
export async function GET(request: NextRequest) {
    try {
        const supabase = await createClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
            return errorResponse("Unauthorized", 401);
        }

        const eventId = request.nextUrl.searchParams.get("eventId");

        if (!eventId) {
            return errorResponse("Event ID is required", 400);
        }

        // Get check-in stats
        const [totalTickets, checkedIn] = await Promise.all([
            prisma.bookedTicket.count({
                where: {
                    booking: {
                        eventId,
                        status: { in: ["CONFIRMED", "PAID"] },
                    },
                },
            }),
            prisma.bookedTicket.count({
                where: {
                    booking: {
                        eventId,
                        status: { in: ["CONFIRMED", "PAID"] },
                    },
                    isCheckedIn: true,
                },
            }),
        ]);

        // Get recent check-ins
        const recentCheckIns = await prisma.checkInLog.findMany({
            where: {
                result: "SUCCESS",
                bookedTicket: {
                    booking: { eventId },
                },
            },
            orderBy: { scannedAt: "desc" },
            take: 10,
            include: {
                bookedTicket: {
                    include: {
                        ticketType: { select: { name: true } },
                        booking: {
                            include: {
                                user: { select: { name: true } },
                            },
                        },
                    },
                },
            },
        });

        return successResponse({
            total: totalTickets,
            checkedIn,
            remaining: totalTickets - checkedIn,
            percentage: totalTickets > 0 ? Math.round((checkedIn / totalTickets) * 100) : 0,
            recentCheckIns: recentCheckIns.map((log: CheckInLogWithTicket) => ({
                ticketType: log.bookedTicket.ticketType.name,
                attendeeName: log.bookedTicket.booking.user?.name || log.bookedTicket.booking.guestName,
                checkedInAt: log.scannedAt,
            })),
        });
    } catch (error) {
        console.error("Get check-in stats error:", error);
        return errorResponse("Failed to get stats", 500);
    }
}
