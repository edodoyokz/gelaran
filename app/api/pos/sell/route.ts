import { type NextRequest, NextResponse } from "next/server";
import { Prisma } from "@prisma/client";
import prisma from "@/lib/prisma/client";
import { successResponse, errorResponse } from "@/lib/api/response";
import { createAuditLogger } from "@/lib/audit-log";
import { getServerEnv } from "@/lib/env";
import { createPaymentProvider } from "@/lib/payments/provider";
import { generateOrderId } from "@/lib/midtrans/client";
import { createRequestContext } from "@/lib/logging/request";
import { createPosBookingCode, decidePosSellRetryAction } from "@/lib/payments/pos-retry";
import type { Decimal } from "@prisma/client/runtime/library";
import type { PrismaTransactionClient } from "@/types/prisma";
import { SeatError, SeatErrorResponse, createSeatErrorResponse, getHttpStatusForError } from "./errors";

const env = getServerEnv();
const paymentProvider = createPaymentProvider();

interface TicketRequest {
    ticketTypeId: string;
    quantity: number;
}

interface SeatConflictError extends Error {
    seatErrorResponse?: SeatErrorResponse;
}

interface TicketTypeForSale {
    id: string;
    name: string;
    basePrice: Decimal;
    isFree: boolean;
    maxPerOrder: number;
    totalQuantity: number;
    soldQuantity: number;
    reservedQuantity: number;
}

export async function POST(request: NextRequest) {
    try {
        const requestContext = createRequestContext(request, "/api/pos/sell");
        const deviceToken = request.headers.get("x-device-token");

        if (!deviceToken) {
            return errorResponse("Device token diperlukan", 401);
        }

        const deviceAccess = await prisma.deviceAccess.findUnique({
            where: { deviceToken },
            include: {
                session: {
                    include: {
                        event: {
                            include: {
                                ticketTypes: { where: { isActive: true } },
                            },
                        },
                    },
                },
            },
        });

        if (!deviceAccess || !deviceAccess.isActive) {
            return errorResponse("Akses tidak valid", 401);
        }

        if (deviceAccess.session.sessionType !== "POS") {
            return errorResponse("Device ini tidak memiliki akses POS", 403);
        }

        if (!deviceAccess.session.isActive) {
            return errorResponse("Session POS tidak aktif", 403);
        }

        const body = await request.json();
        const { tickets, seatIds, buyerName, buyerPhone, buyerEmail, autoCheckIn = false } = body as {
            tickets: TicketRequest[];
            seatIds?: string[];
            buyerName: string;
            buyerPhone?: string;
            buyerEmail?: string;
            autoCheckIn?: boolean;
        };

        if (!tickets || tickets.length === 0) {
            return errorResponse("Pilih minimal 1 tiket", 400);
        }

        if (!buyerName || buyerName.length < 2) {
            return errorResponse("Nama pembeli diperlukan", 400);
        }

        const event = deviceAccess.session.event;

        let subtotal = 0;
        const ticketDetails: Array<{
            ticketTypeId: string;
            quantity: number;
            unitPrice: number;
            name: string;
        }> = [];

        for (const ticketRequest of tickets) {
            if (ticketRequest.quantity <= 0) continue;

            const ticketType = event.ticketTypes.find((t: TicketTypeForSale) => t.id === ticketRequest.ticketTypeId);

            if (!ticketType) {
                return errorResponse(`Tipe tiket tidak ditemukan`, 400);
            }

            const available = ticketType.totalQuantity - ticketType.soldQuantity - ticketType.reservedQuantity;
            if (ticketRequest.quantity > available) {
                return errorResponse(`Hanya tersedia ${available} tiket untuk ${ticketType.name}`, 400);
            }

            if (ticketRequest.quantity > ticketType.maxPerOrder) {
                return errorResponse(`Maksimal ${ticketType.maxPerOrder} tiket untuk ${ticketType.name}`, 400);
            }

            const unitPrice = ticketType.isFree ? 0 : Number(ticketType.basePrice);
            subtotal += unitPrice * ticketRequest.quantity;

            ticketDetails.push({
                ticketTypeId: ticketType.id,
                quantity: ticketRequest.quantity,
                unitPrice,
                name: ticketType.name,
            });
        }

        if (ticketDetails.length === 0) {
            return errorResponse("Pilih minimal 1 tiket", 400);
        }

        // Handle seat-based booking
        const seatSelection = seatIds && seatIds.length > 0;
        let totalTickets = 0;
        const seatDetails: Array<{
            seatId: string;
            ticketTypeId: string;
            unitPrice: number;
            version: number; // Added version for optimistic locking
        }> = [];

        if (seatSelection) {
            // Validate seats belong to event and are available
            const seats = await prisma.seat.findMany({
                where: { id: { in: seatIds }, isActive: true },
                include: {
                    ticketType: true,
                    row: { include: { section: true } },
                },
            });

            if (seats.length !== seatIds.length) {
                const missingSeats = seatIds.filter(id => !seats.find(s => s.id === id));
                return NextResponse.json<SeatErrorResponse>(
                    createSeatErrorResponse(
                        SeatError.NOT_FOUND,
                        "Satu atau lebih seat tidak ditemukan",
                        missingSeats[0]
                    ),
                    { status: getHttpStatusForError(SeatError.NOT_FOUND) }
                );
            }

            for (const seat of seats) {
                if (seat.row.section.eventId !== event.id) {
                    const seatLabel = `${seat.row.rowLabel}${seat.seatNumber}`;
                    return NextResponse.json<SeatErrorResponse>(
                        createSeatErrorResponse(
                            SeatError.INVALID_EVENT,
                            `Seat ${seatLabel} tidak milik event ini`,
                            seat.id,
                            seatLabel
                        ),
                        { status: getHttpStatusForError(SeatError.INVALID_EVENT) }
                    );
                }

                if (!seat.ticketTypeId || !seat.ticketType) {
                    const seatLabel = `${seat.row.rowLabel}${seat.seatNumber}`;
                    return NextResponse.json<SeatErrorResponse>(
                        createSeatErrorResponse(
                            SeatError.MISSING_TICKET_TYPE,
                            `Seat ${seatLabel} tidak memiliki ticket type`,
                            seat.id,
                            seatLabel
                        ),
                        { status: getHttpStatusForError(SeatError.MISSING_TICKET_TYPE) }
                    );
                }

                if (seat.status !== "AVAILABLE") {
                    const seatLabel = `${seat.row.rowLabel}${seat.seatNumber}`;
                    return NextResponse.json<SeatErrorResponse>(
                        createSeatErrorResponse(
                            SeatError.ALREADY_BOOKED,
                            `Seat ${seatLabel} sudah terbooking`,
                            seat.id,
                            seatLabel
                        ),
                        { status: getHttpStatusForError(SeatError.ALREADY_BOOKED) }
                    );
                }
            }

            // Create seat details with version for optimistic locking
            for (const seat of seats) {
                if (!seat.ticketType || !seat.ticketTypeId) continue; // Safety check
                const unitPrice = seat.ticketType.isFree ? 0 : Number(seat.ticketType.basePrice);
                subtotal += unitPrice;

                seatDetails.push({
                    seatId: seat.id,
                    ticketTypeId: seat.ticketTypeId,
                    unitPrice,
                    version: seat.version,
                });
            }

            totalTickets = seatIds.length;
        } else {
            totalTickets = ticketDetails.reduce((sum, t) => sum + t.quantity, 0);
        }

        const platformFeePercent = 0.05;
        const platformFee = Math.round(subtotal * platformFeePercent);
        const taxPercent = 0.11;
        const taxAmount = Math.round(subtotal * taxPercent);
        const totalAmount = subtotal + platformFee + taxAmount;
        const organizerRevenue = subtotal - platformFee;
        const platformRevenue = platformFee;

        const bookingCode = createPosBookingCode(requestContext.requestId);

        const existingBooking = await prisma.booking.findUnique({
            where: { bookingCode },
            include: {
                bookedTickets: {
                    select: {
                        id: true,
                        uniqueCode: true,
                        unitPrice: true,
                        ticketType: {
                            select: {
                                name: true,
                            },
                        },
                    },
                },
                transaction: {
                    select: {
                        id: true,
                        transactionCode: true,
                        status: true,
                        expiresAt: true,
                        gatewayResponse: true,
                    },
                },
            },
        });

        const retryDecision = decidePosSellRetryAction({
            requestId: requestContext.requestId,
            now: new Date(),
            existingBooking: existingBooking
                ? {
                    id: existingBooking.id,
                    bookingCode: existingBooking.bookingCode,
                    status: existingBooking.status,
                    paymentStatus: existingBooking.paymentStatus,
                    expiresAt: existingBooking.expiresAt,
                    transaction: existingBooking.transaction
                        ? {
                            id: existingBooking.transaction.id,
                            status: existingBooking.transaction.status,
                            expiresAt: existingBooking.transaction.expiresAt,
                            gatewayResponse:
                                existingBooking.transaction.gatewayResponse &&
                                    typeof existingBooking.transaction.gatewayResponse === "object" &&
                                    !Array.isArray(existingBooking.transaction.gatewayResponse)
                                    ? existingBooking.transaction.gatewayResponse as Record<string, unknown>
                                    : null,
                        }
                        : null,
                }
                : null,
        });

        if (existingBooking && retryDecision.action === "return-existing-booking") {
            return successResponse({
                bookingCode: existingBooking.bookingCode,
                bookingId: existingBooking.id,
                status: existingBooking.status,
                totalAmount: Number(existingBooking.totalAmount),
                tickets: existingBooking.bookedTickets.map((ticket) => ({
                    id: ticket.id,
                    uniqueCode: ticket.uniqueCode,
                    ticketType: ticket.ticketType.name,
                    unitPrice: Number(ticket.unitPrice),
                })),
                reused: true,
            });
        }

        if (existingBooking && retryDecision.action === "reuse-payment-intent") {
            return successResponse({
                bookingCode: existingBooking.bookingCode,
                bookingId: existingBooking.id,
                status: existingBooking.status,
                totalAmount: Number(existingBooking.totalAmount),
                paymentToken: retryDecision.token,
                paymentUrl: retryDecision.redirectUrl,
                orderId: existingBooking.transaction?.transactionCode ?? null,
                tickets: existingBooking.bookedTickets.map((ticket) => ({
                    id: ticket.id,
                    uniqueCode: ticket.uniqueCode,
                    ticketType: ticket.ticketType.name,
                    unitPrice: Number(ticket.unitPrice),
                })),
                reused: true,
            });
        }

        if (existingBooking && retryDecision.action === "reject") {
            const message =
                retryDecision.reason === "booking-expired"
                    ? "Booking POS ini sudah kedaluwarsa dan tidak bisa dibuatkan pembayaran baru"
                    : "Booking POS ini sudah dibayar";

            return errorResponse(message, 409);
        }

        if (existingBooking && retryDecision.action === "refresh-payment-intent") {
            const itemDetails = existingBooking.bookedTickets.map((ticket) => ({
                id: ticket.id,
                name: ticket.ticketType.name,
                price: Number(ticket.unitPrice),
                quantity: 1,
            }));

            const orderId = generateOrderId(existingBooking.bookingCode);
            const expiresAt = new Date(Date.now() + 15 * 60 * 1000);
            const parameter = {
                transaction_details: {
                    order_id: orderId,
                    gross_amount: Number(existingBooking.totalAmount),
                },
                item_details: itemDetails,
                customer_details: {
                    first_name: existingBooking.guestName || "Guest",
                    email: existingBooking.guestEmail || "guest@gelaran.id",
                    phone: existingBooking.guestPhone || "",
                },
                callbacks: {
                    finish: `${process.env.NEXT_PUBLIC_APP_URL}/pos/payment-success?booking=${existingBooking.bookingCode}`,
                    error: `${process.env.NEXT_PUBLIC_APP_URL}/pos/payment-failed?booking=${existingBooking.bookingCode}`,
                    pending: `${process.env.NEXT_PUBLIC_APP_URL}/pos/payment-pending?booking=${existingBooking.bookingCode}`,
                },
                expiry: {
                    unit: "minutes",
                    duration: 15,
                },
            };

            const auditLogger = createAuditLogger(prisma);
            const ipAddress = request.headers.get("x-forwarded-for") || request.headers.get("x-real-ip");
            const userAgent = request.headers.get("user-agent");

            const placeholderTransaction = existingBooking.transaction
                ? await prisma.transaction.update({
                    where: { id: existingBooking.transaction.id },
                    data: {
                        transactionCode: orderId,
                        paymentGateway: "MIDTRANS",
                        paymentMethod: "SNAP_POS",
                        amount: existingBooking.totalAmount,
                        status: "PROCESSING",
                        gatewayResponse: Prisma.JsonNull,
                        gatewayTransactionId: null,
                        failureReason: null,
                        paidAt: null,
                        paymentChannel: null,
                        expiresAt,
                    },
                    select: { id: true },
                })
                : await prisma.transaction.create({
                    data: {
                        bookingId: existingBooking.id,
                        transactionCode: orderId,
                        paymentGateway: "MIDTRANS",
                        paymentMethod: "SNAP_POS",
                        amount: existingBooking.totalAmount,
                        status: "PROCESSING",
                        expiresAt,
                    },
                    select: { id: true },
                });

            try {
                const snapTransaction = await paymentProvider.createTransaction(parameter);
                await prisma.transaction.update({
                    where: { id: placeholderTransaction.id },
                    data: {
                        status: "PENDING",
                        expiresAt,
                        gatewayResponse: {
                            token: snapTransaction.token,
                            redirect_url: snapTransaction.redirect_url,
                            order_id: orderId,
                            source: "pos",
                            created_at: new Date().toISOString(),
                        },
                    },
                });

                await auditLogger.logPaymentOrderCreated({
                    transactionId: placeholderTransaction.id,
                    bookingId: existingBooking.id,
                    transactionCode: orderId,
                    paymentMethod: "SNAP_POS",
                    amount: Number(existingBooking.totalAmount),
                    mode: "repaired",
                    ipAddress,
                    userAgent,
                });

                return successResponse({
                    bookingCode: existingBooking.bookingCode,
                    bookingId: existingBooking.id,
                    status: existingBooking.status,
                    totalAmount: Number(existingBooking.totalAmount),
                    paymentToken: snapTransaction.token,
                    paymentUrl: snapTransaction.redirect_url,
                    orderId,
                    tickets: existingBooking.bookedTickets.map((ticket) => ({
                        id: ticket.id,
                        uniqueCode: ticket.uniqueCode,
                        ticketType: ticket.ticketType.name,
                        unitPrice: Number(ticket.unitPrice),
                    })),
                    reused: true,
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
        }

        const booking = await prisma.$transaction(async (tx: PrismaTransactionClient) => {
            const newBooking = await tx.booking.create({
                data: {
                    bookingCode,
                    userId: null,
                    eventId: event.id,
                    guestEmail: buyerEmail || null,
                    guestName: buyerName,
                    guestPhone: buyerPhone || null,
                    totalTickets,
                    subtotal,
                    discountAmount: 0,
                    taxAmount,
                    platformFee,
                    paymentGatewayFee: 0,
                    totalAmount,
                    organizerRevenue,
                    platformRevenue,
                    status: totalAmount === 0 ? "CONFIRMED" : "AWAITING_PAYMENT",
                    paymentStatus: totalAmount === 0 ? "PAID" : "UNPAID",
                    salesChannel: "ON_SITE",
                    soldByStaff: deviceAccess.staffName,
                    soldByDevice: deviceAccess.deviceFingerprint,
                    expiresAt: totalAmount === 0 ? null : new Date(Date.now() + 15 * 60 * 1000),
                    paidAt: totalAmount === 0 ? new Date() : null,
                    confirmedAt: totalAmount === 0 ? new Date() : null,
                    ipAddress: request.headers.get("x-forwarded-for") || undefined,
                },
            });

            const createdTickets = [];

            if (seatSelection) {
                // Handle seat-based tickets with optimistic locking
                for (let i = 0; i < seatDetails.length; i++) {
                    const seatDetail = seatDetails[i];
                    const uniqueCode = `${bookingCode}-SEAT-${String(i + 1).padStart(3, "0")}`;

                    // Atomic update with optimistic locking
                    const updated = await tx.seat.updateMany({
                        where: {
                            id: seatDetail.seatId,
                            status: 'AVAILABLE',
                            version: seatDetail.version,
                        },
                        data: {
                            status: 'BOOKED',
                            version: { increment: 1 },
                        },
                    });

                    // Check if update was successful (conflict detection)
                    if (updated.count === 0) {
                        // Get seat label for better error message
                        const seatLabel = `${seatDetail.seatId}`;
                        const errorResponse = createSeatErrorResponse(
                            SeatError.LOCKED_BY_OTHER,
                            `Seat conflict - seat sudah dipilih kasir lain`,
                            seatDetail.seatId,
                            seatLabel,
                            { version: seatDetail.version }
                        );

                        // Throw with error response for proper handling
                        const error = new Error(errorResponse.message);
                        (error as SeatConflictError).seatErrorResponse = errorResponse;
                        throw error;
                    }

                    const ticket = await tx.bookedTicket.create({
                        data: {
                            bookingId: newBooking.id,
                            ticketTypeId: seatDetail.ticketTypeId,
                            seatId: seatDetail.seatId,
                            uniqueCode,
                            unitPrice: seatDetail.unitPrice,
                            taxAmount: Math.round(seatDetail.unitPrice * taxPercent),
                            finalPrice: seatDetail.unitPrice + Math.round(seatDetail.unitPrice * taxPercent),
                            status: "ACTIVE",
                            isCheckedIn: autoCheckIn && totalAmount === 0,
                            checkedInAt: autoCheckIn && totalAmount === 0 ? new Date() : null,
                        },
                    });

                    // Get ticket type name
                    const ticketType = await tx.ticketType.findUnique({
                        where: { id: seatDetail.ticketTypeId },
                        select: { name: true },
                    });

                    createdTickets.push({
                        id: ticket.id,
                        uniqueCode: ticket.uniqueCode,
                        ticketType: ticketType?.name || "Unknown",
                        unitPrice: seatDetail.unitPrice,
                    });
                }
            } else {
                // Handle quantity-based tickets
                for (const detail of ticketDetails) {
                    for (let i = 0; i < detail.quantity; i++) {
                        const uniqueCode = `${bookingCode}-${detail.ticketTypeId.slice(0, 4).toUpperCase()}-${String(i + 1).padStart(3, "0")}`;

                        const ticket = await tx.bookedTicket.create({
                            data: {
                                bookingId: newBooking.id,
                                ticketTypeId: detail.ticketTypeId,
                                uniqueCode,
                                unitPrice: detail.unitPrice,
                                taxAmount: Math.round(detail.unitPrice * taxPercent),
                                finalPrice: detail.unitPrice + Math.round(detail.unitPrice * taxPercent),
                                status: "ACTIVE",
                                isCheckedIn: autoCheckIn && totalAmount === 0,
                                checkedInAt: autoCheckIn && totalAmount === 0 ? new Date() : null,
                            },
                        });

                        createdTickets.push({
                            id: ticket.id,
                            uniqueCode: ticket.uniqueCode,
                            ticketType: detail.name,
                            unitPrice: detail.unitPrice,
                        });
                    }

                    await tx.ticketType.update({
                        where: { id: detail.ticketTypeId },
                        data: {
                            reservedQuantity: { increment: detail.quantity },
                        },
                    });
                }
            }

            return { booking: newBooking, tickets: createdTickets };
        });

        if (totalAmount === 0) {
            if (seatSelection) {
                // For seat-based bookings, seats are already marked as BOOKED in transaction
                // No need to update ticket type quantities for seat-based bookings
            } else {
                for (const detail of ticketDetails) {
                    await prisma.ticketType.update({
                        where: { id: detail.ticketTypeId },
                        data: {
                            soldQuantity: { increment: detail.quantity },
                            reservedQuantity: { decrement: detail.quantity },
                        },
                    });
                }
            }

            return successResponse({
                bookingCode: booking.booking.bookingCode,
                status: "CONFIRMED",
                totalAmount: 0,
                tickets: booking.tickets,
                message: "Tiket gratis berhasil dibuat",
            });
        }

        const orderId = generateOrderId(bookingCode);
        const expiresAt = new Date(Date.now() + 15 * 60 * 1000);

        const itemDetails = ticketDetails.map((detail: { ticketTypeId: string; quantity: number; unitPrice: number; name: string }) => ({
            id: detail.ticketTypeId,
            name: detail.name,
            price: detail.unitPrice,
            quantity: detail.quantity,
        }));

        if (platformFee > 0) {
            itemDetails.push({
                id: "platform-fee",
                name: "Platform Fee",
                price: platformFee,
                quantity: 1,
            });
        }

        if (taxAmount > 0) {
            itemDetails.push({
                id: "tax",
                name: "PPN 11%",
                price: taxAmount,
                quantity: 1,
            });
        }

        const parameter = {
            transaction_details: {
                order_id: orderId,
                gross_amount: totalAmount,
            },
            item_details: itemDetails,
            customer_details: {
                first_name: buyerName,
                email: buyerEmail || "guest@gelaran.id",
                phone: buyerPhone || "",
            },
            callbacks: {
                finish: `${process.env.NEXT_PUBLIC_APP_URL}/pos/payment-success?booking=${bookingCode}`,
                error: `${process.env.NEXT_PUBLIC_APP_URL}/pos/payment-failed?booking=${bookingCode}`,
                pending: `${process.env.NEXT_PUBLIC_APP_URL}/pos/payment-pending?booking=${bookingCode}`,
            },
            expiry: {
                unit: "minutes",
                duration: 15,
            },
        };

        if (!env.NEXT_PUBLIC_PAYMENTS_ENABLED) {
            return errorResponse("Payments are disabled during the current stage", 503);
        }

        const auditLogger = createAuditLogger(prisma);
        const ipAddress = request.headers.get("x-forwarded-for") || request.headers.get("x-real-ip");
        const userAgent = request.headers.get("user-agent");
        const placeholderTransaction = await prisma.transaction.create({
            data: {
                bookingId: booking.booking.id,
                transactionCode: orderId,
                paymentGateway: "MIDTRANS",
                paymentMethod: "SNAP_POS",
                amount: totalAmount,
                status: "PROCESSING",
                expiresAt,
            },
            select: {
                id: true,
            },
        });

        try {
            const snapTransaction = await paymentProvider.createTransaction(parameter);
            await prisma.transaction.update({
                where: { id: placeholderTransaction.id },
                data: {
                    status: "PENDING",
                    expiresAt,
                    gatewayResponse: {
                        token: snapTransaction.token,
                        redirect_url: snapTransaction.redirect_url,
                        order_id: orderId,
                        source: "pos",
                        created_at: new Date().toISOString(),
                    },
                },
            });

            await auditLogger.logPaymentOrderCreated({
                transactionId: placeholderTransaction.id,
                bookingId: booking.booking.id,
                transactionCode: orderId,
                paymentMethod: "SNAP_POS",
                amount: totalAmount,
                mode: "created",
                ipAddress,
                userAgent,
            });

            return successResponse({
                bookingCode: booking.booking.bookingCode,
                bookingId: booking.booking.id,
                status: "AWAITING_PAYMENT",
                totalAmount,
                paymentToken: snapTransaction.token,
                paymentUrl: snapTransaction.redirect_url,
                orderId,
                tickets: booking.tickets,
                autoCheckIn,
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
        console.error("POS sell error:", error);

        // Handle optimistic locking conflicts with specific error response
        if (error instanceof Error && (error as SeatConflictError).seatErrorResponse) {
            const seatError = (error as SeatConflictError).seatErrorResponse as SeatErrorResponse;
            return NextResponse.json<SeatErrorResponse>(
                seatError,
                { status: getHttpStatusForError(seatError.error) }
            );
        }

        // Handle other seat conflicts
        if (error instanceof Error && error.message.includes("Seat conflict")) {
            return NextResponse.json<SeatErrorResponse>(
                createSeatErrorResponse(
                    SeatError.CONFLICT,
                    error.message
                ),
                { status: getHttpStatusForError(SeatError.CONFLICT) }
            );
        }

        return errorResponse("Gagal membuat pesanan", 500);
    }
}
