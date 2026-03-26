import { type NextRequest } from "next/server";
import { z } from "zod";
import prisma from "@/lib/prisma/client";
import { createAuditLogger } from "@/lib/audit-log";
import { successResponse, errorResponse } from "@/lib/api/response";
import { createRequestLogger } from "@/lib/logging/logger";
import { attachRequestIdHeader, createRequestContext } from "@/lib/logging/request";
import { createClient } from "@/lib/supabase/server";
import { getComplimentaryApprovalError, getComplimentaryReviewTransitionError } from "@/lib/complimentary-flow";
import { generateBookingCode } from "@/lib/utils";

class ComplimentaryFlowConflictError extends Error {
    constructor(message: string) {
        super(message);
        this.name = "ComplimentaryFlowConflictError";
    }
}

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
    const requestContext = createRequestContext(request, "/api/admin/complimentary-requests/[requestId]");
    const logger = createRequestLogger(requestContext);
    const auditLogger = createAuditLogger(prisma);
    const ipAddress = request.headers.get("x-forwarded-for") || request.headers.get("x-real-ip");
    const userAgent = request.headers.get("user-agent");
    const fail = (message: string, code = 400, details?: Record<string, unknown>) =>
        attachRequestIdHeader(errorResponse(message, code, details), requestContext.requestId);
    const ok = <T>(data: T, status = 200) =>
        attachRequestIdHeader(successResponse(data, undefined, status), requestContext.requestId);

    try {
        const { requestId } = await params;
        logger.info("complimentary.review.request_received", "Complimentary review request received", {
            requestId,
        });

        const auth = await verifyAdminByEmail();
        if ("error" in auth) {
            return fail(auth.error, auth.status);
        }

        const body = await request.json();
        const parsed = reviewSchema.safeParse(body);

        if (!parsed.success) {
            return fail("Validation error", 400, {
                errors: parsed.error.flatten().fieldErrors,
            });
        }

        const { action, note } = parsed.data;
        const requestRecord = await prisma.complimentaryTicketRequest.findUnique({
            where: { id: requestId },
            include: {
                event: { select: { id: true, title: true } },
            },
        });

        if (!requestRecord) {
            return fail("Request not found", 404);
        }

        if (action === "REJECT") {
            const rejected = await prisma.$transaction(async (tx) => {
                const transition = await tx.complimentaryTicketRequest.findUnique({
                    where: { id: requestId },
                    select: { status: true },
                });

                if (!transition) {
                    throw new ComplimentaryFlowConflictError("Request not found");
                }

                const transitionError = getComplimentaryReviewTransitionError({
                    currentStatus: transition.status,
                    action,
                });

                if (transitionError) {
                    throw new ComplimentaryFlowConflictError(transitionError);
                }

                const updateResult = await tx.complimentaryTicketRequest.updateMany({
                    where: { id: requestId, status: "PENDING" },
                    data: {
                        status: "REJECTED",
                        reviewedById: auth.admin.id,
                        reviewedNote: note || null,
                        reviewedAt: new Date(),
                    },
                });

                if (updateResult.count !== 1) {
                    throw new ComplimentaryFlowConflictError("Only pending complimentary requests can be reviewed");
                }

                const updated = await tx.complimentaryTicketRequest.findUnique({
                    where: { id: requestId },
                });

                if (!updated) {
                    throw new ComplimentaryFlowConflictError("Request not found");
                }

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

            await auditLogger.log({
                action: "COMPLIMENTARY_REVIEW_STATUS_CHANGED",
                entityType: "ComplimentaryTicketRequest",
                entityId: requestRecord.id,
                userId: auth.admin.id,
                ipAddress,
                userAgent,
                newValues: {
                    action,
                    status: "REJECTED",
                },
            });

            logger.info("complimentary.review.rejected", "Complimentary request rejected", {
                requestId,
            });

            return ok(rejected);
        }

        const bookingCode = generateBookingCode();

        const approved = await prisma.$transaction(async (tx) => {
            const approvalRequest = await tx.complimentaryTicketRequest.findUnique({
                where: { id: requestId },
                include: {
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

            if (!approvalRequest) {
                throw new ComplimentaryFlowConflictError("Request not found");
            }

            const existingBooking = await tx.booking.findFirst({
                where: { complimentaryRequestId: requestId },
                select: { id: true },
            });

            const approvalError = getComplimentaryApprovalError({
                currentStatus: approvalRequest.status,
                existingBookingId: existingBooking?.id,
                items: approvalRequest.items.map((item) => ({
                    ticketTypeName: item.ticketType.name,
                    quantity: item.quantity,
                    available:
                        item.ticketType.totalQuantity -
                        item.ticketType.soldQuantity -
                        item.ticketType.reservedQuantity,
                })),
            });

            if (approvalError) {
                throw new ComplimentaryFlowConflictError(approvalError);
            }

            const updateResult = await tx.complimentaryTicketRequest.updateMany({
                where: { id: requestId, status: "PENDING" },
                data: {
                    status: "APPROVED",
                    reviewedById: auth.admin.id,
                    reviewedNote: note || null,
                    reviewedAt: new Date(),
                    approvedTotal: approvalRequest.requestedTotal,
                },
            });

            if (updateResult.count !== 1) {
                throw new ComplimentaryFlowConflictError("Only pending complimentary requests can be reviewed");
            }

            const booking = await tx.booking.create({
                data: {
                    bookingCode,
                    userId: null,
                    eventId: approvalRequest.eventId,
                    eventScheduleId: approvalRequest.eventScheduleId,
                    complimentaryRequestId: approvalRequest.id,
                    guestName: approvalRequest.guestName || null,
                    guestEmail: approvalRequest.guestEmail?.trim().toLowerCase() || null,
                    guestPhone: approvalRequest.guestPhone || null,
                    totalTickets: approvalRequest.requestedTotal,
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
            for (const item of approvalRequest.items) {
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

            return {
                requestId: approvalRequest.id,
                status: "APPROVED" as const,
                reviewedAt: new Date(),
                reviewedNote: note || null,
                booking,
            };
        });

        await auditLogger.log({
            action: "COMPLIMENTARY_REVIEW_STATUS_CHANGED",
            entityType: "ComplimentaryTicketRequest",
            entityId: requestRecord.id,
            userId: auth.admin.id,
            ipAddress,
            userAgent,
            newValues: {
                action,
                status: approved.status,
                bookingCode: approved.booking.bookingCode,
            },
        });

        logger.info("complimentary.review.approved", "Complimentary request approved", {
            requestId,
            bookingCode: approved.booking.bookingCode,
        });

        return ok({
            id: approved.requestId,
            status: approved.status,
            reviewedAt: approved.reviewedAt,
            reviewedNote: approved.reviewedNote,
            booking: {
                id: approved.booking.id,
                bookingCode: approved.booking.bookingCode,
                status: approved.booking.status,
            },
        });
    } catch (error) {
        if (error instanceof ComplimentaryFlowConflictError) {
            logger.warn("complimentary.review.conflict", "Complimentary review conflict", {
                reason: error.message,
            });
            return fail(error.message, error.message === "Request not found" ? 404 : 409);
        }

        logger.error("complimentary.review.failed", "Complimentary review failed", error);
        return fail("Failed to review complimentary request", 500);
    }
}
