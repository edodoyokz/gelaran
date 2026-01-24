import { type NextRequest } from "next/server";
import prisma from "@/lib/prisma/client";
import { successResponse, errorResponse } from "@/lib/api/response";
import { Decimal } from "@prisma/client/runtime/library";

// Types for Prisma query result
interface PrismaSeat {
    id: string;
    seatLabel: string;
    seatNumber: number;
    status: string;
    isAccessible: boolean;
    ticketTypeId: string | null;
}

interface PrismaRow {
    id: string;
    rowLabel: string;
    sortOrder: number;
    isActive: boolean;
    seats: PrismaSeat[];
}

interface PrismaSection {
    id: string;
    name: string;
    colorHex: string | null;
    capacity: number | null;
    sortOrder: number;
    rows: PrismaRow[];
}

interface PrismaTicketType {
    id: string;
    name: string;
    basePrice: Decimal;
    isFree: boolean;
}

interface VenueMapSection {
    id: string;
    name: string;
    colorHex: string | null;
    capacity: number | null;
    sortOrder: number;
    ticketTypes: {
        id: string;
        name: string;
        basePrice: number;
        isFree: boolean;
    }[];
    stats: {
        totalSeats: number;
        availableSeats: number;
        bookedSeats: number;
    };
    rows: {
        id: string;
        rowLabel: string;
        sortOrder: number;
        seats: {
            id: string;
            seatLabel: string;
            seatNumber: number;
            status: string;
            isAccessible: boolean;
            ticketTypeId: string | null;
        }[];
    }[];
}

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ slug: string }> }
) {
    try {
        const { slug } = await params;

        const event = await prisma.event.findUnique({
            where: { slug },
            select: {
                id: true,
                title: true,
                hasSeatingChart: true,
                venueSections: {
                    where: { isActive: true },
                    orderBy: { sortOrder: "asc" },
                    include: {
                        rows: {
                            where: { isActive: true },
                            orderBy: { sortOrder: "asc" },
                            include: {
                                seats: {
                                    where: { isActive: true },
                                    orderBy: { seatNumber: "asc" },
                                    select: {
                                        id: true,
                                        seatLabel: true,
                                        seatNumber: true,
                                        status: true,
                                        isAccessible: true,
                                        ticketTypeId: true,
                                    },
                                },
                            },
                        },
                    },
                },
                ticketTypes: {
                    where: { isActive: true },
                    select: {
                        id: true,
                        name: true,
                        basePrice: true,
                        isFree: true,
                    },
                },
            },
        });

        if (!event) {
            return errorResponse("Event tidak ditemukan", 404);
        }

        if (!event.hasSeatingChart || event.venueSections.length === 0) {
            return successResponse({
                hasSeatingChart: false,
                sections: [],
            });
        }

        // Build sections with stats
        const sections: VenueMapSection[] = event.venueSections.map((section: PrismaSection) => {
            let totalSeats = 0;
            let availableSeats = 0;
            let bookedSeats = 0;
            const ticketTypeIds = new Set<string>();

            section.rows.forEach((row: PrismaRow) => {
                row.seats.forEach((seat: PrismaSeat) => {
                    totalSeats++;
                    if (seat.status === "AVAILABLE") availableSeats++;
                    if (seat.status === "BOOKED") bookedSeats++;
                    if (seat.ticketTypeId) ticketTypeIds.add(seat.ticketTypeId);
                });
            });

            // Get ticket types associated with this section
            const sectionTicketTypes = event.ticketTypes.filter((t: PrismaTicketType) =>
                ticketTypeIds.has(t.id)
            ).map((t: PrismaTicketType) => ({
                id: t.id,
                name: t.name,
                basePrice: Number(t.basePrice),
                isFree: t.isFree,
            }));

            return {
                id: section.id,
                name: section.name,
                colorHex: section.colorHex,
                capacity: section.capacity,
                sortOrder: section.sortOrder,
                ticketTypes: sectionTicketTypes,
                stats: {
                    totalSeats,
                    availableSeats,
                    bookedSeats,
                },
                rows: section.rows.map((row: PrismaRow) => ({
                    id: row.id,
                    rowLabel: row.rowLabel,
                    sortOrder: row.sortOrder,
                    seats: row.seats.map((seat: PrismaSeat) => ({
                        id: seat.id,
                        seatLabel: seat.seatLabel,
                        seatNumber: seat.seatNumber,
                        status: seat.status,
                        isAccessible: seat.isAccessible,
                        ticketTypeId: seat.ticketTypeId,
                    })),
                })),
            };
        });

        return successResponse({
            hasSeatingChart: true,
            eventTitle: event.title,
            sections,
            ticketTypes: event.ticketTypes.map((t: PrismaTicketType) => ({
                id: t.id,
                name: t.name,
                basePrice: Number(t.basePrice),
                isFree: t.isFree,
            })),
        });
    } catch (error) {
        console.error("Error fetching venue map:", error);
        return errorResponse("Gagal memuat denah venue", 500);
    }
}
