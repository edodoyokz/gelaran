import crypto from "crypto";
import { type NextRequest } from "next/server";
import prisma from "@/lib/prisma/client";
import { createAuditLogger } from "@/lib/audit-log";
import { getServerEnv } from "@/lib/env";
import { sendBookingConfirmationEmail } from "@/lib/email/send";
import { createRequestLogger } from "@/lib/logging/logger";
import { attachRequestIdHeader, createRequestContext } from "@/lib/logging/request";
import { decideWebhookTransition } from "@/lib/payments/webhook-transitions";
import { rateLimiters, getClientIdentifier } from "@/lib/rate-limit";
import type { PrismaTransactionClient } from "@/types/prisma";

const env = getServerEnv();

export async function POST(request: NextRequest) {
    // Rate limiting for webhook (higher limit for legitimate webhooks)
    const clientId = getClientIdentifier(request.headers);
    const rateLimit = rateLimiters.webhook.check(clientId);
    
    if (!rateLimit.success) {
        // Webhooks should not be rate limited under normal circumstances
        // If this happens, it could be a DDoS or misconfiguration
        return new Response("Too Many Requests", { status: 429 });
    }
    
    const requestContext = createRequestContext(request, "/api/payments/webhook");
    const logger = createRequestLogger(requestContext);
    const textResponse = (
        body: string,
        status: number,
        level: "info" | "warn" | "error",
        event: string,
        message: string,
        details: Record<string, unknown> = {}
    ) => {
        logger[level](event, message, details);
        return attachRequestIdHeader(new Response(body, { status }), requestContext.requestId);
    };

    try {
        logger.info("payments.webhook_received", "Payment webhook received");

        if (!env.NEXT_PUBLIC_PAYMENTS_ENABLED) {
            return textResponse(
                "Payments are disabled during the current stage",
                503,
                "warn",
                "payments.webhook_disabled",
                "Payment webhook received while payments are disabled"
            );
        }

        const body = await request.json();

        const {
            order_id,
            status_code,
            gross_amount,
            signature_key,
            transaction_status,
            fraud_status,
            payment_type,
        } = body;

        const serverKey = env.MIDTRANS_SERVER_KEY;
        const expectedSignature = crypto
            .createHash("sha512")
            .update(`${order_id}${status_code}${gross_amount}${serverKey}`)
            .digest("hex");

        if (signature_key !== expectedSignature) {
            return textResponse(
                "Invalid signature",
                403,
                "warn",
                "payments.webhook_invalid_signature",
                "Invalid Midtrans signature",
                { orderId: order_id }
            );
        }

        const transaction = await prisma.transaction.findUnique({
            where: { transactionCode: order_id },
            include: {
                booking: {
                    include: {
                        bookedTickets: true,
                    },
                },
            },
        });

        if (!transaction) {
            return textResponse(
                "Transaction not found",
                404,
                "warn",
                "payments.webhook_transaction_missing",
                "Payment transaction not found",
                { orderId: order_id }
            );
        }

        const auditLogger = createAuditLogger(prisma);
        const ipAddress = request.headers.get("x-forwarded-for") || request.headers.get("x-real-ip");
        const userAgent = request.headers.get("user-agent");

        await auditLogger.log({
            action: "PAYMENT_WEBHOOK_RECEIVED",
            entityType: "Booking",
            entityId: transaction.bookingId,
            ipAddress,
            userAgent,
            newValues: {
                transactionId: transaction.id,
                transactionCode: transaction.transactionCode,
                incomingGatewayStatus: transaction_status,
                gatewayTransactionId: body.transaction_id || null,
            },
        });

        const decision = decideWebhookTransition({
            currentTransactionStatus: transaction.status,
            currentBookingStatus: transaction.booking.status,
            incomingGatewayStatus: transaction_status,
            fraudStatus: fraud_status ?? null,
            salesChannel: transaction.booking.salesChannel,
        });

        const transactionPatch = {
            status: decision.nextTransactionStatus,
            paymentMethod: payment_type?.toUpperCase() || transaction.paymentMethod,
            paymentChannel: body.bank || body.issuer || transaction.paymentChannel,
            gatewayTransactionId: body.transaction_id || transaction.gatewayTransactionId,
            gatewayResponse: body,
            paidAt: decision.action === "ignore"
                ? transaction.paidAt
                : decision.shouldSetPaidAt
                    ? transaction.paidAt || new Date()
                    : null,
            failureReason: decision.nextTransactionStatus === "FAILED" || decision.nextTransactionStatus === "EXPIRED"
                ? `Payment ${decision.nextTransactionStatus.toLowerCase()}`
                : null,
        };

        if (decision.action === "ignore") {
            await prisma.transaction.update({
                where: { id: transaction.id },
                data: transactionPatch,
            });

            await auditLogger.logPaymentWebhookIgnored({
                transactionId: transaction.id,
                bookingId: transaction.bookingId,
                transactionCode: transaction.transactionCode,
                status: decision.nextTransactionStatus,
                reason: decision.reason,
                ipAddress,
                userAgent,
            });

            return textResponse(
                "OK",
                200,
                "info",
                "payments.webhook_duplicate_ignored",
                "Duplicate payment webhook ignored",
                {
                    orderId: order_id,
                    transactionStatus: transaction_status,
                }
            );
        }

        const processedAt = new Date();
        let bookingStateChanged = false;

        await prisma.$transaction(async (tx: PrismaTransactionClient) => {
            await tx.transaction.update({
                where: { id: transaction.id },
                data: {
                    ...transactionPatch,
                    paidAt: decision.shouldSetPaidAt ? transaction.paidAt || processedAt : null,
                },
            });

            const bookingData =
                decision.nextBookingStatus === "CONFIRMED"
                    ? {
                        status: "CONFIRMED" as const,
                        paymentStatus: decision.nextPaymentStatus ?? "PAID",
                        paidAt: processedAt,
                        confirmedAt: transaction.booking.confirmedAt || processedAt,
                        cancellationReason: null,
                    }
                    : {
                        status: decision.nextBookingStatus,
                        paymentStatus: decision.nextPaymentStatus ?? "UNPAID",
                        paidAt: null,
                        cancellationReason: `Payment ${decision.nextTransactionStatus.toLowerCase()}`,
                    };

            const bookingUpdate = await tx.booking.updateMany({
                where: {
                    id: transaction.bookingId,
                    status: transaction.booking.status,
                },
                data: bookingData,
            });

            bookingStateChanged = bookingUpdate.count > 0;

            if (bookingStateChanged && decision.ticketEffect === "confirm-sale") {
                for (const ticket of transaction.booking.bookedTickets) {
                    await tx.ticketType.update({
                        where: { id: ticket.ticketTypeId },
                        data: {
                            soldQuantity: { increment: 1 },
                            reservedQuantity: { decrement: 1 },
                        },
                    });

                    if (decision.shouldAutoCheckIn) {
                        await tx.bookedTicket.update({
                            where: { id: ticket.id },
                            data: {
                                isCheckedIn: true,
                                checkedInAt: processedAt,
                            },
                        });
                    }
                }
            }

            if (bookingStateChanged && decision.ticketEffect === "release-reservation") {
                for (const ticket of transaction.booking.bookedTickets) {
                    await tx.ticketType.update({
                        where: { id: ticket.ticketTypeId },
                        data: {
                            reservedQuantity: { decrement: 1 },
                        },
                    });
                }
            }
        });

        const shouldSendConfirmationEmail =
            bookingStateChanged && decision.nextBookingStatus === "CONFIRMED" && decision.ticketEffect === "confirm-sale";

        if (decision.action === "apply") {
            await auditLogger.logPaymentStatusChanged({
                transactionId: transaction.id,
                bookingId: transaction.bookingId,
                transactionCode: transaction.transactionCode,
                fromStatus: transaction.status,
                toStatus: decision.nextTransactionStatus,
                gatewayTransactionId: body.transaction_id || null,
                reason: decision.reason,
                ipAddress,
                userAgent,
            });
        } else {
            await auditLogger.logPaymentRecoveryApplied({
                transactionId: transaction.id,
                bookingId: transaction.bookingId,
                transactionCode: transaction.transactionCode,
                recoveryType: decision.reason,
                fromStatus: transaction.booking.status,
                toStatus: decision.nextBookingStatus,
                ipAddress,
                userAgent,
            });

            if (transaction.status !== decision.nextTransactionStatus) {
                await auditLogger.logPaymentStatusChanged({
                    transactionId: transaction.id,
                    bookingId: transaction.bookingId,
                    transactionCode: transaction.transactionCode,
                    fromStatus: transaction.status,
                    toStatus: decision.nextTransactionStatus,
                    gatewayTransactionId: body.transaction_id || null,
                    reason: decision.reason,
                    ipAddress,
                    userAgent,
                });
            }
        }

        if (shouldSendConfirmationEmail && (transaction.booking.guestEmail || transaction.booking.userId)) {
            sendBookingConfirmationEmail(transaction.bookingId).catch((err) => {
                logger.error(
                    "payments.webhook_email_failed",
                    "Failed to send booking confirmation email",
                    err,
                    {
                        bookingId: transaction.bookingId,
                    }
                );
            });
        }

        if (decision.nextBookingStatus === "CONFIRMED") {
            logger.info("payments.webhook_processed_paid", "Payment webhook confirmed booking", {
                bookingId: transaction.bookingId,
                bookingCode: transaction.booking.bookingCode,
                recovery: decision.action === "repair",
                ticketEffect: decision.ticketEffect,
                bookingStateChanged,
            });
        }

        return textResponse(
            "OK",
            200,
            "info",
            "payments.webhook_processed",
            "Payment webhook processed",
            {
                orderId: order_id,
                transactionStatus: transaction_status,
                outcome: decision.action,
            }
        );
    } catch (error) {
        logger.error("payments.webhook_failed", "Webhook processing failed", error);
        return textResponse(
            "Internal error",
            500,
            "error",
            "payments.webhook_response_failed",
            "Webhook processing failed"
        );
    }
}
