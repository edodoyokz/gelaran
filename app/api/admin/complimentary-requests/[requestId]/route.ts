import { type NextRequest } from "next/server";
import { z } from "zod";
import prisma from "@/lib/prisma/client";
import { successResponse, errorResponse } from "@/lib/api/response";
import { createClient } from "@/lib/supabase/server";
import { generateBookingCode } from "@/lib/utils";

type VerifyAdminResult =
    | { admin: { id: string } }
    | { error: string; status: 401 | 403 };

async function verifyAdminByEmail(): Promise<VerifyAdminResult> {
    const supabase = await createClient();
    const {
        data: { user },
    } = await supabase.auth.getUser();

    if (!user?.email) {
        return { error: "Unauthorized", status: 401 };
    }

    const admin = await prisma.user.findUnique({
        where: { email: user.email },
        select: { id: true, role: true },
    });
    if (!admin || !["ADMIN", "SUPER_ADMIN"].includes(admin.role)) {
        return { error: "Admin access required", status: 403 };
    }

    return { admin: { id: admin.id } };
}

const reviewSchema = z.object({
    action: z.enum(["APPROVE", "REJECT"]),
    note: z.string().max(1000).optional().nullable(),
});

export async function PUT(
    request: NextRequest,
    { params }: { params: Promise<{ requestId: string }> }
) {
    try {
        const { requestId } = await params;
        const auth = await verifyAdminByEmail();
        if ("error" in auth) {
            return errorResponse(auth.error, auth.status);
        }

        const body = await request.json();
        const parsed = reviewSchema.safeParse(body);

        if (!parsed.success) {
            return errorResponse("Validation error", 400, {
                errors: parsed.error.flatten().fieldErrors,
            });
        }

        const requestRecord = await prisma.complimentaryTicketRequest.findUnique({
            where: { id: requestId },
            include: {
                event: { select: { id: true, title: true } },
                items: {
                    include: {
                        ticketType: {
                            select: {
                                id: true,
                                name: true,
                                totalQuantity: true,
                                soldQuantity: true,
                                reservedQuantity: true,
                            },
                        },
                    },
                },
            },
        });

        if (!requestRecord) {
            return errorResponse("Request not found", 404);
        }

        if (requestRecord.status !== "PENDING") {
            return errorResponse("Request already reviewed", 400);
        }

        const { action, note } = parsed.data;

        if (action === "REJECT") {
            const rejected = await prisma.$transaction(async (tx) => {
                const updated = await tx.complimentaryTicketRequest.update({
                    where: { id: requestId },
                    data: {
                        status: "REJECTED",
                        reviewedById: auth.admin.id,
                        reviewedNote: note || null,
                        reviewedAt: new Date(),
                    },
                });

                await tx.notification.create({
                    data: {
                        userId: requestRecord.requestedById,
                        type: "COMPLIMENTARY_REQUEST_REJECTED",
                        title: "Permintaan complimentary ditolak",
                        message: `${requestRecord.event.title} - permintaan tidak disetujui admin`,
                        data: { requestId: requestRecord.id },
                    },
                });

                await tx.auditLog.create({
                    data: {
                        userId: auth.admin.id,
                        action: "COMPLIMENTARY_REQUEST_REJECTED",
                        entityType: "ComplimentaryTicketRequest",
                        entityId: requestRecord.id,
                        oldValues: { status: "PENDING" },
                        newValues: { status: "REJECTED", note: note || null },
                    },
                });

                return updated;
            });

            return successResponse(rejected);
        }

        for (const item of requestRecord.items) {
            const available =
                item.ticketType.totalQuantity - item.ticketType.soldQuantity - item.ticketType.reservedQuantity;
            if (item.quantity > available) {
                return errorResponse(
                    `Quota tidak cukup untuk ${item.ticketType.name}. Tersedia ${available}`,
                    400
                );
            }
        }

        const bookingCode = generateBookingCode();

        const approved = await prisma.$transaction(async (tx) => {
            const approvedRequest = await tx.complimentaryTicketRequest.update({
                where: { id: requestId },
                data: {
                    status: "APPROVED",
                    reviewedById: auth.admin.id,
                    reviewedNote: note || null,
                    reviewedAt: new Date(),
                    approvedTotal: requestRecord.requestedTotal,
                },
            });

            const booking = await tx.booking.create({
                data: {
                    bookingCode,
                    userId: null,
                    eventId: requestRecord.eventId,
                    eventScheduleId: requestRecord.eventScheduleId,
                    complimentaryRequestId: requestRecord.id,
                    guestName: requestRecord.guestName || null,
                    guestEmail: requestRecord.guestEmail || null,
                    guestPhone: requestRecord.guestPhone || null,
                    totalTickets: requestRecord.requestedTotal,
                    subtotal: 0,
                    discountAmount: 0,
                    taxAmount: 0,
                    platformFee: 0,
                    paymentGatewayFee: 0,
                    totalAmount: 0,
                    organizerRevenue: 0,
                    platformRevenue: 0,
                    isComplimentary: true,
                    status: "CONFIRMED",
                    paymentStatus: "PAID",
                    paidAt: new Date(),
                    confirmedAt: new Date(),
                },
            });

            let sequence = 1;
            for (const item of requestRecord.items) {
                for (let i = 0; i < item.quantity; i++) {
                    const uniqueCode = `${bookingCode}-C${String(sequence).padStart(3, "0")}`;
                    sequence += 1;

                    await tx.bookedTicket.create({
                        data: {
                            bookingId: booking.id,
                            ticketTypeId: item.ticketTypeId,
                            uniqueCode,
                            unitPrice: 0,
                            taxAmount: 0,
                            finalPrice: 0,
                            status: "ACTIVE",
                        },
                    });
                }

                await tx.ticketType.update({
                    where: { id: item.ticketTypeId },
                    data: {
                        soldQuantity: { increment: item.quantity },
                    },
                });
            }

            await tx.notification.create({
                data: {
                    userId: requestRecord.requestedById,
                    type: "COMPLIMENTARY_REQUEST_APPROVED",
                    title: "Permintaan complimentary disetujui",
                    message: `${requestRecord.event.title} - booking ${booking.bookingCode} sudah diterbitkan`,
                    data: { requestId: requestRecord.id, bookingId: booking.id, bookingCode: booking.bookingCode },
                },
            });

            await tx.auditLog.create({
                data: {
                    userId: auth.admin.id,
                    action: "COMPLIMENTARY_REQUEST_APPROVED",
                    entityType: "ComplimentaryTicketRequest",
                    entityId: requestRecord.id,
                    oldValues: { status: "PENDING" },
                    newValues: { status: "APPROVED", bookingCode: booking.bookingCode, note: note || null },
                },
            });

            return { approvedRequest, booking };
        });

        return successResponse({
            ...approved.approvedRequest,
            booking: {
                id: approved.booking.id,
                bookingCode: approved.booking.bookingCode,
                status: approved.booking.status,
            },
        });
    } catch (error) {
        console.error("Error reviewing complimentary request:", error);
        return errorResponse("Failed to review complimentary request", 500);
    }
}
