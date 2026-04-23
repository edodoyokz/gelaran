import { NotificationType } from "@prisma/client";
import { type NextRequest } from "next/server";
import { z } from "zod";
import prisma from "@/lib/prisma/client";
import { createAuditLogger } from "@/lib/audit-log";
import { successResponse, errorResponse } from "@/lib/api/response";
import { createRequestLogger } from "@/lib/logging/logger";
import { attachRequestIdHeader, createRequestContext } from "@/lib/logging/request";
import { createClient } from "@/lib/supabase/server";
import { sendBookingConfirmationEmail } from "@/lib/email/send";

class PaymentVerificationConflictError extends Error {
    constructor(message: string) {
        super(message);
        this.name = "PaymentVerificationConflictError";
    }
}

function buildVerificationResponse(params: {
    booking: {
        id: string;
        bookingCode: string;
        status: string;
        paymentStatus: string;
        paidAt: Date | null;
        confirmedAt: Date | null;
    };
    transaction: {
        verificationStatus: string | null;
        verifiedAt: Date | null;
        verificationNotes: string | null;
    };
}) {
    return {
        bookingId: params.booking.id,
        bookingCode: params.booking.bookingCode,
        status: params.booking.status,
        paymentStatus: params.booking.paymentStatus,
        verificationStatus: params.transaction.verificationStatus,
        verifiedAt: params.transaction.verifiedAt,
        verificationNotes: params.transaction.verificationNotes,
        paidAt: params.booking.paidAt,
        confirmedAt: params.booking.confirmedAt,
    };
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

const verifyPaymentSchema = z.object({
    action: z.enum(["VERIFY", "REJECT"]),
    notes: z.string().max(1000).optional(),
});

export async function PUT(
    request: NextRequest,
    { params }: { params: Promise<{ bookingId: string }> }
) {
    const requestContext = createRequestContext(request, "/api/admin/bookings/[bookingId]/verify-payment");
    const logger = createRequestLogger(requestContext);
    const auditLogger = createAuditLogger(prisma);
    const ipAddress = request.headers.get("x-forwarded-for") || request.headers.get("x-real-ip");
    const userAgent = request.headers.get("user-agent");
    const fail = (message: string, code = 400, details?: Record<string, unknown>) =>
        attachRequestIdHeader(errorResponse(message, code, details), requestContext.requestId);
    const ok = <T>(data: T, status = 200) =>
        attachRequestIdHeader(successResponse(data, undefined, status), requestContext.requestId);
    let resolvedBookingId: string | null = null;

    try {
        const { bookingId } = await params;
        resolvedBookingId = bookingId;
        logger.info("payment.verification.request_received", "Payment verification request received", {
            bookingId,
        });

        const auth = await verifyAdminByEmail();
        if ("error" in auth) {
            return fail(auth.error, auth.status);
        }

        const body = await request.json();
        const parsed = verifyPaymentSchema.safeParse(body);

        if (!parsed.success) {
            return fail("Validation error", 400, {
                reason: "VALIDATION_ERROR",
                bookingId,
                errors: parsed.error.flatten().fieldErrors,
            });
        }

        const { action, notes } = parsed.data;

        // Fetch booking with transaction
        const booking = await prisma.booking.findUnique({
            where: { id: bookingId },
            include: {
                transaction: true,
                event: { select: { id: true, title: true } },
                bookedTickets: {
                    include: {
                        ticketType: { select: { id: true, name: true } },
                    },
                },
            },
        });

        if (!booking) {
            return fail("Booking not found", 404, {
                bookingId,
                reason: "BOOKING_NOT_FOUND",
            });
        }

        if (!booking.transaction) {
            return fail("Transaction not found", 404, {
                bookingId: booking.id,
                reason: "TRANSACTION_NOT_FOUND",
            });
        }

        // Validate transaction state
        if (booking.transaction.verificationStatus !== "PROOF_UPLOADED") {
            return fail(
                `Invalid verification status. Current status: ${booking.transaction.verificationStatus}`,
                409,
                {
                    bookingId: booking.id,
                    transactionId: booking.transaction.id,
                    reason: "INVALID_VERIFICATION_STATUS",
                    currentVerificationStatus: booking.transaction.verificationStatus,
                    expectedVerificationStatus: "PROOF_UPLOADED",
                }
            );
        }

        if (!booking.transaction.paymentProofUrl) {
            return fail("Payment proof URL not found", 400, {
                bookingId: booking.id,
                transactionId: booking.transaction.id,
                reason: "PAYMENT_PROOF_URL_MISSING",
            });
        }

        if (action === "REJECT") {
            const rejected = await prisma.$transaction(async (tx) => {
                const now = new Date();

                const rejection = await tx.transaction.updateMany({
                    where: {
                        id: booking.transaction!.id,
                        verificationStatus: "PROOF_UPLOADED",
                    },
                    data: {
                        verificationStatus: "REJECTED",
                        verifiedBy: auth.admin.id,
                        verifiedAt: now,
                        verificationNotes: notes || null,
                    },
                });

                if (rejection.count !== 1) {
                    throw new PaymentVerificationConflictError(
                        "Transaction status changed. Only PROOF_UPLOADED transactions can be verified."
                    );
                }

                const updatedTransaction = await tx.transaction.findUniqueOrThrow({
                    where: { id: booking.transaction!.id },
                    select: {
                        verificationStatus: true,
                        verifiedAt: true,
                        verificationNotes: true,
                    },
                });

                // Create notification for customer
                const userId = booking.userId;
                if (userId) {
                    await tx.notification.create({
                        data: {
                            userId,
                            type: NotificationType.SYSTEM,
                            title: "Bukti pembayaran ditolak",
                            message: `Bukti pembayaran untuk booking ${booking.bookingCode} ditolak. ${notes ? `Catatan: ${notes}` : "Silakan upload ulang bukti pembayaran yang valid."}`,
                            data: { bookingId: booking.id, bookingCode: booking.bookingCode },
                        },
                    });
                }

                // Audit log
                await tx.auditLog.create({
                    data: {
                        userId: auth.admin.id,
                        action: "PAYMENT_PROOF_REJECTED",
                        entityType: "Transaction",
                        entityId: booking.transaction!.id,
                        oldValues: { verificationStatus: "PROOF_UPLOADED" },
                        newValues: { verificationStatus: "REJECTED", notes: notes || null },
                    },
                });

                return updatedTransaction;
            });

            await auditLogger.log({
                action: "PAYMENT_VERIFICATION_STATUS_CHANGED",
                entityType: "Booking",
                entityId: booking.id,
                userId: auth.admin.id,
                ipAddress,
                userAgent,
                newValues: {
                    action,
                    verificationStatus: "REJECTED",
                    bookingCode: booking.bookingCode,
                },
            });

            logger.info("payment.verification.rejected", "Payment proof rejected", {
                bookingId,
                bookingCode: booking.bookingCode,
            });

            return ok(
                buildVerificationResponse({
                    booking,
                    transaction: rejected,
                })
            );
        }

        // VERIFY action
        const verified = await prisma.$transaction(async (tx) => {
            const now = new Date();

            const verification = await tx.transaction.updateMany({
                where: {
                    id: booking.transaction!.id,
                    verificationStatus: "PROOF_UPLOADED",
                },
                data: {
                    verificationStatus: "VERIFIED",
                    status: "SUCCESS",
                    verifiedBy: auth.admin.id,
                    verifiedAt: now,
                    verificationNotes: notes || null,
                    paidAt: now,
                },
            });

            if (verification.count !== 1) {
                throw new PaymentVerificationConflictError(
                    "Transaction status changed. Only PROOF_UPLOADED transactions can be verified."
                );
            }

            const updatedTransaction = await tx.transaction.findUniqueOrThrow({
                where: { id: booking.transaction!.id },
                select: {
                    verificationStatus: true,
                    verifiedAt: true,
                    verificationNotes: true,
                },
            });

            // Update booking to paid and confirmed
            const updatedBooking = await tx.booking.update({
                where: { id: booking.id },
                data: {
                    paymentStatus: "PAID",
                    status: "CONFIRMED",
                    paidAt: now,
                    confirmedAt: now,
                },
                include: {
                    bookedTickets: {
                        include: {
                            ticketType: { select: { id: true } },
                        },
                    },
                },
            });

            // Update ticket inventory (soldQuantity)
            const ticketTypeQuantities = new Map<string, number>();
            for (const ticket of booking.bookedTickets) {
                const currentCount = ticketTypeQuantities.get(ticket.ticketType.id) || 0;
                ticketTypeQuantities.set(ticket.ticketType.id, currentCount + 1);
            }

            for (const [ticketTypeId, quantity] of ticketTypeQuantities.entries()) {
                await tx.ticketType.update({
                    where: { id: ticketTypeId },
                    data: {
                        soldQuantity: { increment: quantity },
                    },
                });
            }

            // Generate QR codes for tickets if not already generated
            for (const ticket of updatedBooking.bookedTickets) {
                if (!ticket.qrCodeUrl) {
                    // QR code generation will be handled by a separate process or webhook
                    // For now, we just ensure the ticket is active
                    await tx.bookedTicket.update({
                        where: { id: ticket.id },
                        data: {
                            status: "ACTIVE",
                        },
                    });
                }
            }

            // Create notification for customer
            const userId = booking.userId;
            if (userId) {
                await tx.notification.create({
                    data: {
                        userId,
                        type: "BOOKING_CONFIRMED",
                        title: "Pembayaran diverifikasi",
                        message: `Pembayaran untuk booking ${booking.bookingCode} telah diverifikasi. Tiket Anda sudah aktif!`,
                        data: { bookingId: booking.id, bookingCode: booking.bookingCode },
                    },
                });
            }

            // Audit log
            await tx.auditLog.create({
                data: {
                    userId: auth.admin.id,
                    action: "PAYMENT_PROOF_VERIFIED",
                    entityType: "Transaction",
                    entityId: booking.transaction!.id,
                    oldValues: {
                        verificationStatus: "PROOF_UPLOADED",
                        transactionStatus: booking.transaction!.status,
                        bookingStatus: booking.status,
                        paymentStatus: booking.paymentStatus,
                    },
                    newValues: {
                        verificationStatus: "VERIFIED",
                        transactionStatus: "SUCCESS",
                        bookingStatus: "CONFIRMED",
                        paymentStatus: "PAID",
                        notes: notes || null,
                    },
                },
            });

            return { transaction: updatedTransaction, booking: updatedBooking };
        });

        await auditLogger.log({
            action: "PAYMENT_VERIFICATION_STATUS_CHANGED",
            entityType: "Booking",
            entityId: booking.id,
            userId: auth.admin.id,
            ipAddress,
            userAgent,
            newValues: {
                action,
                verificationStatus: "VERIFIED",
                bookingCode: booking.bookingCode,
                bookingStatus: "CONFIRMED",
                paymentStatus: "PAID",
            },
        });

        logger.info("payment.verification.verified", "Payment proof verified", {
            bookingId,
            bookingCode: booking.bookingCode,
        });

        // Send booking confirmation email asynchronously
        sendBookingConfirmationEmail(booking.id).catch((err) => {
            logger.error("payment.verification.email_failed", "Failed to send confirmation email", err);
        });

        return ok(buildVerificationResponse(verified));
    } catch (error) {
        if (error instanceof PaymentVerificationConflictError) {
            logger.warn("payment.verification.conflict", "Payment verification conflict", {
                reason: error.message,
            });
            return fail(error.message, 409, {
                bookingId: resolvedBookingId,
                reason: "PAYMENT_VERIFICATION_CONFLICT",
                expectedVerificationStatus: "PROOF_UPLOADED",
            });
        }

        logger.error("payment.verification.failed", "Payment verification failed", error);
        return fail("Failed to verify payment", 500);
    }
}
