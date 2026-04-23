import { type NextRequest } from "next/server";
import { Prisma } from "@prisma/client";
import prisma from "@/lib/prisma/client";
import { successResponse, errorResponse } from "@/lib/api/response";
import { createAuditLogger } from "@/lib/audit-log";
import { getServerEnv } from "@/lib/env";
import { createRequestLogger } from "@/lib/logging/logger";
import { attachRequestIdHeader, createRequestContext } from "@/lib/logging/request";
import { decidePaymentIntentAction } from "@/lib/payments/idempotency";
import { createPaymentProvider } from "@/lib/payments/provider";
import { generateOrderId } from "@/lib/midtrans/client";
import { rateLimiters, getClientIdentifier, getRateLimitHeaders } from "@/lib/rate-limit";
import type { Decimal } from "@prisma/client/runtime/library";
import { getOptionalAuthenticatedAppUser } from "@/lib/auth/route-auth";
import { getBookingAccessError } from "@/lib/auth/local-identity";

const env = getServerEnv();
const paymentProvider = createPaymentProvider();

interface BookedTicketWithType {
    ticketTypeId: string;
    unitPrice: Decimal;
    ticketType: {
        name: string;
    };
}

function getGatewayResponseObject(value: unknown) {
    if (!value || typeof value !== "object" || Array.isArray(value)) {
        return null;
    }

    return value as Record<string, unknown>;
}

export async function POST(request: NextRequest) {
    // Rate limiting check
    const clientId = getClientIdentifier(request.headers);
    const rateLimit = rateLimiters.payment.check(clientId);
    
    if (!rateLimit.success) {
        const rateLimitHeaders = getRateLimitHeaders(rateLimit);
        return new Response(JSON.stringify({ error: "Too many requests. Please try again later." }), {
            status: 429,
            headers: {
                "Content-Type": "application/json",
                ...Object.fromEntries(rateLimitHeaders.entries()),
            },
        });
    }
    
    const requestContext = createRequestContext(request, "/api/payments");
    const logger = createRequestLogger(requestContext);
    const fail = (message: string, code = 400, details?: Record<string, unknown>) => {
        logger.warn("payments.request_failed", message, {
            statusCode: code,
            details,
        });

        return attachRequestIdHeader(
            errorResponse(message, code, details),
            requestContext.requestId
        );
    };
    const ok = <T>(data: T, status = 200) =>
        attachRequestIdHeader(successResponse(data, undefined, status), requestContext.requestId);

    try {
        logger.info("payments.request_received", "Create payment request received");

        if (!env.NEXT_PUBLIC_PAYMENTS_ENABLED) {
            return fail("Payments are disabled during the current stage", 503);
        }

        const { bookingId } = await request.json();

        if (!bookingId) {
            return fail("Booking ID is required", 400);
        }

        const booking = await prisma.booking.findUnique({
            where: { id: bookingId },
            include: {
                event: {
                    select: {
                        title: true,
                        slug: true,
                    },
                },
                user: {
                    select: {
                        name: true,
                        email: true,
                        phone: true,
                    },
                },
                bookedTickets: {
                    include: {
                        ticketType: {
                            select: { name: true },
                        },
                    },
                },
                transaction: {
                    select: {
                        id: true,
                        transactionCode: true,
                        paymentMethod: true,
                        status: true,
                        expiresAt: true,
                        gatewayResponse: true,
                    },
                },
            },
        });

        if (!booking) {
            return fail("Booking not found", 404);
        }

        const authContext = await getOptionalAuthenticatedAppUser();
        if (authContext && "error" in authContext) {
            return fail(authContext.error, authContext.status);
        }
        const auditLogger = createAuditLogger(prisma);
        const ipAddress = request.headers.get("x-forwarded-for") || request.headers.get("x-real-ip");
        const userAgent = request.headers.get("user-agent");

        const bookingAccessError = getBookingAccessError(
            {
                userId: booking.userId,
                guestEmail: booking.guestEmail,
            },
            authContext
        );

        if (bookingAccessError) {
            return fail(bookingAccessError.message, bookingAccessError.status);
        }

        if (booking.paymentStatus === "PAID") {
            return fail("Booking already paid", 400);
        }

        if (booking.expiresAt && new Date() > booking.expiresAt) {
            return fail("Booking has expired", 400);
        }

        const customerDetails = {
            first_name: booking.guestName || booking.user?.name || "Guest",
            email: booking.guestEmail || booking.user?.email || authContext?.email || "",
            phone: booking.guestPhone || booking.user?.phone || "",
        };

        const itemDetails = booking.bookedTickets.map((ticket: BookedTicketWithType) => ({
            id: ticket.ticketTypeId,
            name: ticket.ticketType.name,
            price: Number(ticket.unitPrice),
            quantity: 1,
        }));

        if (Number(booking.platformFee) > 0) {
            itemDetails.push({
                id: "platform-fee",
                name: "Platform Fee",
                price: Number(booking.platformFee),
                quantity: 1,
            });
        }

        if (Number(booking.taxAmount) > 0) {
            itemDetails.push({
                id: "tax",
                name: "PPN 11%",
                price: Number(booking.taxAmount),
                quantity: 1,
            });
        }

        const now = new Date();
        const paymentDecision = decidePaymentIntentAction({
            bookingStatus: booking.status,
            paymentStatus: booking.paymentStatus,
            bookingExpiresAt: booking.expiresAt,
            now,
            transaction: booking.transaction
                ? {
                    id: booking.transaction.id,
                    status: booking.transaction.status,
                    expiresAt: booking.transaction.expiresAt,
                    gatewayResponse: getGatewayResponseObject(booking.transaction.gatewayResponse),
                }
                : null,
        });

        if (paymentDecision.action === "reject") {
            return fail(
                paymentDecision.reason === "booking-paid" ? "Booking already paid" : "Booking has expired",
                400,
            );
        }

        if (paymentDecision.action === "reuse" && booking.transaction) {
            await auditLogger.logPaymentOrderCreated({
                transactionId: booking.transaction.id,
                bookingId: booking.id,
                transactionCode: booking.transaction.transactionCode,
                paymentMethod: booking.transaction.paymentMethod,
                amount: Number(booking.totalAmount),
                mode: "reused",
                ipAddress,
                userAgent,
            });

            logger.info("payments.transaction_reused", "Reused active payment transaction", {
                bookingId: booking.id,
                bookingCode: booking.bookingCode,
                orderId: booking.transaction.transactionCode,
            });

            return ok({
                token: paymentDecision.token,
                redirectUrl: paymentDecision.redirectUrl,
                orderId: booking.transaction.transactionCode,
                reused: true,
            });
        }

        const orderId = generateOrderId(booking.bookingCode);
        const expiresAt = new Date(Date.now() + 30 * 60 * 1000);
        const parameter = {
            transaction_details: {
                order_id: orderId,
                gross_amount: Number(booking.totalAmount),
            },
            item_details: itemDetails,
            customer_details: customerDetails,
            callbacks: {
                finish: `${env.NEXT_PUBLIC_APP_URL}/checkout/success?booking=${booking.bookingCode}`,
                error: `${env.NEXT_PUBLIC_APP_URL}/checkout/failed?booking=${booking.bookingCode}`,
                pending: `${env.NEXT_PUBLIC_APP_URL}/checkout/pending?booking=${booking.bookingCode}`,
            },
            expiry: {
                unit: "minutes",
                duration: 30,
            },
        };

        const placeholderTransaction = booking.transaction
            ? await prisma.transaction.update({
                where: { id: booking.transaction.id },
                data: {
                    transactionCode: orderId,
                    paymentGateway: "MIDTRANS",
                    paymentMethod: "SNAP",
                    amount: booking.totalAmount,
                    status: "PROCESSING",
                    gatewayResponse: Prisma.JsonNull,
                    gatewayTransactionId: null,
                    failureReason: null,
                    paidAt: null,
                    paymentChannel: null,
                    expiresAt,
                },
                select: {
                    id: true,
                },
            })
            : await prisma.transaction.create({
                data: {
                    bookingId: booking.id,
                    transactionCode: orderId,
                    paymentGateway: "MIDTRANS",
                    paymentMethod: "SNAP",
                    amount: booking.totalAmount,
                    status: "PROCESSING",
                    expiresAt,
                },
                select: {
                    id: true,
                },
            });

        try {
            const snapTransaction = await paymentProvider.createTransaction(parameter);
            const storedGatewayResponse = {
                token: snapTransaction.token,
                redirect_url: snapTransaction.redirect_url,
                order_id: orderId,
                source: "checkout",
                created_at: now.toISOString(),
            };

            await prisma.transaction.update({
                where: { id: placeholderTransaction.id },
                data: {
                    status: "PENDING",
                    gatewayResponse: storedGatewayResponse,
                    expiresAt,
                },
            });

            await prisma.booking.update({
                where: { id: booking.id },
                data: {
                    status: "AWAITING_PAYMENT",
                },
            });

            await auditLogger.logPaymentOrderCreated({
                transactionId: placeholderTransaction.id,
                bookingId: booking.id,
                transactionCode: orderId,
                paymentMethod: "SNAP",
                amount: Number(booking.totalAmount),
                mode: paymentDecision.action === "repair-create" ? "repaired" : "created",
                ipAddress,
                userAgent,
            });

            logger.info("payments.transaction_created", "Payment transaction created", {
                bookingId: booking.id,
                bookingCode: booking.bookingCode,
                orderId,
                mode: paymentDecision.action === "repair-create" ? "repaired" : "created",
            });

            return ok({
                token: snapTransaction.token,
                redirectUrl: snapTransaction.redirect_url,
                orderId,
                reused: false,
            });
        } catch (paymentError) {
            await prisma.transaction.update({
                where: { id: placeholderTransaction.id },
                data: {
                    failureReason: paymentError instanceof Error ? paymentError.message : "Failed to create Midtrans transaction",
                },
            }).catch(() => undefined);
            throw paymentError;
        }
    } catch (error) {
        logger.error("payments.create_failed", "Failed to create payment", error);
        return fail("Failed to create payment", 500);
    }
}
