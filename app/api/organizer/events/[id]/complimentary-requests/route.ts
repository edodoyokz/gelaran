import { Prisma } from "@prisma/client";
import { type NextRequest } from "next/server";
import { z } from "zod";
import prisma from "@/lib/prisma/client";
import { successResponse, errorResponse } from "@/lib/api/response";
import {
    findComplimentarySubmissionConflict,
    mapComplimentaryRequestSummary,
    type ComplimentarySubmissionConflict,
    normalizeGuestEmail,
} from "@/lib/complimentary-flow";
import { createClient } from "@/lib/supabase/server";
import type { Event, User } from "@/types/prisma";

class ComplimentarySubmissionConflictError extends Error {
    constructor(public readonly conflict: ComplimentarySubmissionConflict) {
        super(conflict.message);
        this.name = "ComplimentarySubmissionConflictError";
    }
}

type OrganizerAccessResult =
    | { organizer: User; event: Event }
    | { error: string; status: number };

async function verifyOrganizerAccess(eventId: string, userEmail: string): Promise<OrganizerAccessResult> {
    const organizer = await prisma.user.findUnique({ where: { email: userEmail } });

    if (!organizer || organizer.role !== "ORGANIZER") {
        return { error: "Only organizers can manage complimentary requests", status: 403 };
    }

    const event = await prisma.event.findUnique({ where: { id: eventId } });

    if (!event) {
        return { error: "Event not found", status: 404 };
    }

    if (event.organizerId !== organizer.id) {
        return { error: "Not authorized", status: 403 };
    }

    return { organizer, event };
}

const createRequestSchema = z.object({
    reason: z.string().max(1000).optional().nullable(),
    eventScheduleId: z.string().uuid().optional().nullable(),
    guestName: z.string().min(2).max(120),
    guestEmail: z.string().email(),
    guestPhone: z.string().max(30).optional().nullable(),
    items: z
        .array(
            z.object({
                ticketTypeId: z.string().uuid(),
                quantity: z.number().int().min(1).max(50),
            })
        )
        .min(1),
});

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const supabase = await createClient();
        const {
            data: { user },
        } = await supabase.auth.getUser();

        if (!user || !user.email) {
            return errorResponse("Unauthorized", 401);
        }

        const result = await verifyOrganizerAccess(id, user.email);
        if ("error" in result) {
            return errorResponse(result.error, result.status);
        }

        const requests = await prisma.complimentaryTicketRequest.findMany({
            where: { eventId: id },
            orderBy: { createdAt: "desc" },
            include: {
                requestedBy: { select: { id: true, name: true, email: true } },
                reviewedBy: { select: { id: true, name: true, email: true } },
                items: {
                    include: {
                        ticketType: {
                            select: { id: true, name: true, basePrice: true, isFree: true },
                        },
                    },
                },
                bookings: {
                    select: {
                        id: true,
                        bookingCode: true,
                        status: true,
                        createdAt: true,
                    },
                    orderBy: { createdAt: "desc" },
                    take: 1,
                },
            },
        });

        return successResponse(
            requests.map((requestRecord) =>
                mapComplimentaryRequestSummary({
                    ...requestRecord,
                    items: requestRecord.items.map((item) => ({
                        ...item,
                        ticketType: {
                            ...item.ticketType,
                            basePrice: Number(item.ticketType.basePrice),
                        },
                    })),
                })
            )
        );
    } catch (error) {
        console.error("Error fetching complimentary requests:", error);
        return errorResponse("Failed to fetch complimentary requests", 500);
    }
}

export async function POST(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const supabase = await createClient();
        const {
            data: { user },
        } = await supabase.auth.getUser();

        if (!user || !user.email) {
            return errorResponse("Unauthorized", 401);
        }

        const result = await verifyOrganizerAccess(id, user.email);
        if ("error" in result) {
            return errorResponse(result.error, result.status);
        }

        const body = await request.json();
        const parsed = createRequestSchema.safeParse(body);

        if (!parsed.success) {
            return errorResponse("Validation error", 400, {
                errors: parsed.error.flatten().fieldErrors,
            });
        }

        const data = parsed.data;
        const guestEmail = normalizeGuestEmail(data.guestEmail);
        const ticketTypeIds = data.items.map((item) => item.ticketTypeId);
        const uniqueTicketTypeIds = Array.from(new Set(ticketTypeIds));

        if (uniqueTicketTypeIds.length !== ticketTypeIds.length) {
            return errorResponse("Duplicate ticket type in request", 400);
        }

        const ticketTypes = await prisma.ticketType.findMany({
            where: {
                id: { in: ticketTypeIds },
                eventId: id,
                isActive: true,
            },
            select: {
                id: true,
                name: true,
                totalQuantity: true,
                soldQuantity: true,
                reservedQuantity: true,
            },
        });

        if (ticketTypes.length !== ticketTypeIds.length) {
            return errorResponse("One or more ticket types are invalid", 400);
        }

        for (const item of data.items) {
            const ticketType = ticketTypes.find((ticket) => ticket.id === item.ticketTypeId);
            if (!ticketType) {
                return errorResponse("Ticket type not found", 400);
            }

            const available =
                ticketType.totalQuantity - ticketType.soldQuantity - ticketType.reservedQuantity;
            if (item.quantity > available) {
                return errorResponse(
                    `Requested quantity for ${ticketType.name} exceeds available quota (${available})`,
                    400
                );
            }
        }

        const requestedTotal = data.items.reduce((sum, item) => sum + item.quantity, 0);

        const createdRequest = await prisma.$transaction(
            async (tx) => {
                const submissionConflict = await findComplimentarySubmissionConflict(tx, {
                    eventId: id,
                    guestEmail,
                });

                if (submissionConflict) {
                    throw new ComplimentarySubmissionConflictError(submissionConflict);
                }

                const requestRecord = await tx.complimentaryTicketRequest.create({
                    data: {
                        eventId: id,
                        eventScheduleId: data.eventScheduleId || null,
                        requestedById: result.organizer.id,
                        reason: data.reason || null,
                        guestName: data.guestName,
                        guestEmail,
                        guestPhone: data.guestPhone || null,
                        requestedTotal,
                        status: "PENDING",
                        items: {
                            create: data.items.map((item) => ({
                                ticketTypeId: item.ticketTypeId,
                                quantity: item.quantity,
                            })),
                        },
                    },
                    include: {
                        reviewedBy: { select: { id: true, name: true, email: true } },
                        bookings: {
                            select: {
                                id: true,
                                bookingCode: true,
                                status: true,
                                createdAt: true,
                            },
                            orderBy: { createdAt: "desc" },
                            take: 1,
                        },
                        items: {
                            include: {
                                ticketType: {
                                    select: { id: true, name: true, basePrice: true, isFree: true },
                                },
                            },
                        },
                    },
                });

                const admins = await tx.user.findMany({
                    where: {
                        role: { in: ["ADMIN", "SUPER_ADMIN"] },
                        isActive: true,
                        deletedAt: null,
                    },
                    select: { id: true },
                });

                if (admins.length > 0) {
                    await tx.notification.createMany({
                        data: admins.map((admin) => ({
                            userId: admin.id,
                            type: "COMPLIMENTARY_REQUEST_SUBMITTED",
                            title: "Permintaan tiket complimentary baru",
                            message: `${result.event.title}: ${requestedTotal} tiket menunggu approval`,
                            data: {
                                requestId: requestRecord.id,
                                eventId: id,
                                organizerId: result.organizer.id,
                            },
                        })),
                    });
                }

                return requestRecord;
            },
            {
                isolationLevel: Prisma.TransactionIsolationLevel.Serializable,
            }
        );

        return successResponse(
            mapComplimentaryRequestSummary({
                ...createdRequest,
                items: createdRequest.items.map((item) => ({
                    ...item,
                    ticketType: {
                        ...item.ticketType,
                        basePrice: Number(item.ticketType.basePrice),
                    },
                })),
            }),
            undefined,
            201
        );
    } catch (error) {
        if (error instanceof ComplimentarySubmissionConflictError) {
            return errorResponse(error.conflict.message, 409, {
                code: error.conflict.code,
            });
        }

        if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2034") {
            return errorResponse("Concurrent complimentary request detected. Please retry.", 409, {
                code: "COMPLIMENTARY_REQUEST_CONFLICT",
            });
        }

        console.error("Error creating complimentary request:", error);
        return errorResponse("Failed to create complimentary request", 500);
    }
}
