import { type NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma/client";
import { successResponse, errorResponse } from "@/lib/api/response";
import { createClient } from "@/lib/supabase/server";

interface AttendeeTicket {
    id: string;
    uniqueCode: string;
    isCheckedIn: boolean;
    checkedInAt: Date | null;
    status: string;
    createdAt: Date;
    booking: {
        id: string;
        bookingCode: string;
        guestName: string | null;
        guestEmail: string | null;
        guestPhone: string | null;
        user: {
            id: string;
            name: string;
            email: string;
            phone: string | null;
        } | null;
    };
    ticketType: {
        id: string;
        name: string;
    };
}

interface CsvAttendee {
    uniqueCode: string;
    booking: {
        bookingCode: string;
        guestName: string | null;
        guestEmail: string | null;
        guestPhone: string | null;
        user: {
            name: string;
            email: string;
            phone: string | null;
        } | null;
    };
    ticketType: {
        name: string;
    };
    isCheckedIn: boolean;
    checkedInAt: Date | null;
}

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const supabase = await createClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
            return errorResponse("Unauthorized", 401);
        }

        const dbUser = await prisma.user.findUnique({
            where: { email: user.email! },
            select: { id: true },
        });

        if (!dbUser) {
            return errorResponse("User not found", 404);
        }

        const { id: eventId } = await params;
        const { searchParams } = new URL(request.url);
        const exportCsv = searchParams.get("export") === "true";

        if (exportCsv) {
            const attendees = await prisma.bookedTicket.findMany({
                where: {
                    booking: {
                        eventId,
                        status: { in: ["CONFIRMED", "PAID"] },
                    },
                },
                include: {
                    booking: {
                        select: {
                            bookingCode: true,
                            guestName: true,
                            guestEmail: true,
                            guestPhone: true,
                            user: {
                                select: {
                                    name: true,
                                    email: true,
                                    phone: true,
                                },
                            },
                        },
                    },
                    ticketType: {
                        select: { name: true },
                    },
                },
                orderBy: { createdAt: "desc" },
            });

            const csvHeader = [
                "Kode Tiket",
                "Kode Booking",
                "Nama",
                "Email",
                "No. WhatsApp",
                "Tipe Tiket",
                "Status Check-in",
                "Waktu Check-in",
            ].join(",");

            const csvRows = attendees.map((t: CsvAttendee) => [
                t.uniqueCode,
                t.booking.bookingCode,
                t.booking.guestName || t.booking.user?.name || "",
                t.booking.guestEmail || t.booking.user?.email || "",
                t.booking.guestPhone || t.booking.user?.phone || "",
                t.ticketType.name,
                t.isCheckedIn ? "Sudah" : "Belum",
                t.checkedInAt ? t.checkedInAt.toISOString() : "-",
            ].map((v) => `"${(v || "").replace(/"/g, '""')}"`).join(","));

            const csvContent = [csvHeader, ...csvRows].join("\n");

            return new NextResponse(csvContent, {
                headers: {
                    "Content-Type": "text/csv; charset=utf-8",
                    "Content-Disposition": `attachment; filename="attendees-${eventId}.csv"`,
                },
            });
        }

        const page = parseInt(searchParams.get("page") || "1", 10);
        const limit = parseInt(searchParams.get("limit") || "20", 10);
        const search = searchParams.get("search") || "";
        const status = searchParams.get("status") || "";
        const checkedIn = searchParams.get("checkedIn");


        const event = await prisma.event.findFirst({
            where: {
                id: eventId,
                organizerId: dbUser.id,
                deletedAt: null,
            },
            select: { id: true, title: true },
        });

        if (!event) {
            return errorResponse("Event not found", 404);
        }

        const whereClause: Record<string, unknown> = {
            booking: {
                eventId,
                status: { in: ["CONFIRMED", "PAID"] },
            },
        };

        if (search) {
            whereClause.OR = [
                { uniqueCode: { contains: search, mode: "insensitive" } },
                { booking: { guestName: { contains: search, mode: "insensitive" } } },
                { booking: { guestEmail: { contains: search, mode: "insensitive" } } },
            ];
        }

        if (status) {
            whereClause.status = status;
        }

        if (checkedIn !== null && checkedIn !== "") {
            whereClause.isCheckedIn = checkedIn === "true";
        }

        const [attendees, total] = await Promise.all([
            prisma.bookedTicket.findMany({
                where: whereClause,
                include: {
                    booking: {
                        select: {
                            id: true,
                            bookingCode: true,
                            guestName: true,
                            guestEmail: true,
                            guestPhone: true,
                            user: {
                                select: {
                                    id: true,
                                    name: true,
                                    email: true,
                                    phone: true,
                                },
                            },
                        },
                    },
                    ticketType: {
                        select: {
                            id: true,
                            name: true,
                        },
                    },
                },
                orderBy: { createdAt: "desc" },
                skip: (page - 1) * limit,
                take: limit,
            }),
            prisma.bookedTicket.count({ where: whereClause }),
        ]);

        const formattedAttendees = attendees.map((ticket: AttendeeTicket) => ({
            id: ticket.id,
            ticketCode: ticket.uniqueCode,
            ticketType: ticket.ticketType.name,
            attendeeName: ticket.booking.guestName || ticket.booking.user?.name || "N/A",
            attendeeEmail: ticket.booking.guestEmail || ticket.booking.user?.email || "N/A",
            attendeePhone: ticket.booking.guestPhone || ticket.booking.user?.phone || null,
            bookingCode: ticket.booking.bookingCode,
            isCheckedIn: ticket.isCheckedIn,
            checkedInAt: ticket.checkedInAt,
            status: ticket.status,
            createdAt: ticket.createdAt,
        }));

        const totalCheckedIn = await prisma.bookedTicket.count({
            where: {
                booking: { eventId, status: { in: ["CONFIRMED", "PAID"] } },
                isCheckedIn: true,
            },
        });

        return successResponse({
            attendees: formattedAttendees,
            pagination: {
                page,
                limit,
                total,
                totalPages: Math.ceil(total / limit),
            },
            stats: {
                totalAttendees: total,
                checkedIn: totalCheckedIn,
                pending: total - totalCheckedIn,
                checkInRate: total > 0 ? Math.round((totalCheckedIn / total) * 100) : 0,
            },
        });
    } catch (error) {
        console.error("Error fetching attendees:", error);
        return errorResponse("Failed to fetch attendees", 500);
    }
}
