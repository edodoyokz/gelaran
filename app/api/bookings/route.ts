import { type NextRequest } from "next/server";
import prisma from "@/lib/prisma/client";
import { successResponse, errorResponse } from "@/lib/api/response";
import { createRequestLogger } from "@/lib/logging/logger";
import { attachRequestIdHeader, createRequestContext } from "@/lib/logging/request";
import { createBookingSchema } from "@/lib/validators";
import { createClient } from "@/lib/supabase/server";
import { generateBookingCode } from "@/lib/utils";
import { calculatePricing } from "@/lib/pricing/calculate";
import { DEFAULT_PAYMENT_GATEWAY_FEE_PERCENTAGE, DEFAULT_PLATFORM_FEE_PERCENTAGE } from "@/lib/pricing/constants";
import type { Decimal } from "@prisma/client/runtime/library";
import type { PrismaTransactionClient } from "@/types/prisma";

interface TicketTypeRecord {
    id: string;
    name: string;
    basePrice: Decimal;
    isFree: boolean;
    minPerOrder: number;
    maxPerOrder: number;
    totalQuantity: number;
    soldQuantity: number;
    reservedQuantity: number;
}

export async function POST(request: NextRequest) {
    const requestContext = createRequestContext(request, "/api/bookings");
    const logger = createRequestLogger(requestContext);
    const fail = (message: string, code = 400, details?: Record<string, unknown>) => {
        logger.warn("bookings.request_failed", message, {
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
        logger.info("bookings.request_received", "Create booking request received");
        // Get authenticated user (optional for guest checkout)
        const supabase = await createClient();
        const { data: { user } } = await supabase.auth.getUser();

        // Parse request body
        const body = await request.json();
        const parsed = createBookingSchema.safeParse(body);

        if (!parsed.success) {
            return fail("Invalid booking data", 400, parsed.error.flatten().fieldErrors);
        }

        const {
            eventId,
            eventScheduleId,
            tickets,
            seatIds,
            seatSessionId,
            promoCode,
            guestEmail,
            guestName,
            guestPhone,
        } = parsed.data;

        // Require either user or guest info
        if (!user && !guestEmail) {
            return fail("Email is required for guest checkout", 400);
        }

        // Get event with ticket types
        const event = await prisma.event.findUnique({
            where: { id: eventId, status: "PUBLISHED", deletedAt: null },
            include: {
                ticketTypes: {
                    where: { isActive: true },
                },
            },
        });

        if (!event) {
            return fail("Event not found", 404);
        }

        const seatSelection = seatIds && seatIds.length > 0;
        let subtotal = 0;
        let totalTickets = 0;
        const ticketDetails: Array<{
            ticketTypeId: string;
            quantity: number;
            unitPrice: number;
            name: string;
        }> = [];
        const seatDetails: Array<{
            seatId: string;
            ticketTypeId: string;
            unitPrice: number;
        }> = [];

        if (seatSelection) {
            if (!seatSessionId) {
                return fail("Seat session is required", 400);
            }

            const seats = await prisma.seat.findMany({
                where: { id: { in: seatIds }, isActive: true },
                include: {
                    ticketType: true,
                    row: { include: { section: true } },
                },
            });

            if (seats.length !== seatIds.length) {
                return fail("One or more seats not found", 404);
            }

            const now = new Date();
            const seatTicketCounts: Record<string, number> = {};

            for (const seat of seats) {
                if (seat.row.section.eventId !== eventId) {
                    return fail("Seat does not belong to this event", 400);
                }

                if (!seat.ticketTypeId || !seat.ticketType) {
                    return fail("Seat is missing ticket type", 400);
                }

                if (seat.status === "BOOKED" || seat.status === "BLOCKED") {
                    return fail("One or more seats are not available", 400);
                }

                if (
                    seat.status !== "LOCKED" ||
                    seat.lockedByUserId !== seatSessionId ||
                    !seat.lockedUntil ||
                    seat.lockedUntil < now
                ) {
                    return fail("Seat is not locked", 400);
                }

                const unitPrice = seat.priceOverride
                    ? Number(seat.priceOverride)
                    : seat.ticketType.isFree
                      ? 0
                      : Number(seat.ticketType.basePrice);

                subtotal += unitPrice;
                totalTickets += 1;
                seatDetails.push({
                    seatId: seat.id,
                    ticketTypeId: seat.ticketTypeId,
                    unitPrice,
                });

                seatTicketCounts[seat.ticketTypeId] = (seatTicketCounts[seat.ticketTypeId] || 0) + 1;
            }

            const requestedTicketCounts = tickets.reduce<Record<string, number>>((acc, ticket) => {
                acc[ticket.ticketTypeId] = (acc[ticket.ticketTypeId] || 0) + ticket.quantity;
                return acc;
            }, {});

            const seatTicketKeys = Object.keys(seatTicketCounts);
            const requestedTicketKeys = Object.keys(requestedTicketCounts);

            if (seatTicketKeys.length !== requestedTicketKeys.length) {
                return fail("Ticket selection mismatch", 400);
            }

            for (const ticketTypeId of seatTicketKeys) {
                const seatCount = seatTicketCounts[ticketTypeId];
                const requestedCount = requestedTicketCounts[ticketTypeId];
                if (seatCount !== requestedCount) {
                    return fail("Ticket selection mismatch", 400);
                }
            }

            for (const ticketTypeId of seatTicketKeys) {
                const ticketType = event.ticketTypes.find((t: TicketTypeRecord) => t.id === ticketTypeId);
                if (!ticketType) {
                    return fail(`Ticket type ${ticketTypeId} not found`, 400);
                }

                const quantity = seatTicketCounts[ticketTypeId];
                if (quantity < ticketType.minPerOrder) {
                    return fail(`Minimum ${ticketType.minPerOrder} tickets required for ${ticketType.name}`, 400);
                }
                if (quantity > ticketType.maxPerOrder) {
                    return fail(`Maximum ${ticketType.maxPerOrder} tickets allowed for ${ticketType.name}`, 400);
                }

                const unitPrice = ticketType.isFree ? 0 : Number(ticketType.basePrice);
                ticketDetails.push({
                    ticketTypeId: ticketType.id,
                    quantity,
                    unitPrice,
                    name: ticketType.name,
                });
            }
        } else {
            for (const ticketRequest of tickets) {
                const ticketType = event.ticketTypes.find((t: TicketTypeRecord) => t.id === ticketRequest.ticketTypeId);

                if (!ticketType) {
                    return fail(`Ticket type ${ticketRequest.ticketTypeId} not found`, 400);
                }

                const available = ticketType.totalQuantity - ticketType.soldQuantity - ticketType.reservedQuantity;
                if (ticketRequest.quantity > available) {
                    return fail(`Only ${available} tickets available for ${ticketType.name}`, 400);
                }

                if (ticketRequest.quantity < ticketType.minPerOrder) {
                    return fail(`Minimum ${ticketType.minPerOrder} tickets required for ${ticketType.name}`, 400);
                }
                if (ticketRequest.quantity > ticketType.maxPerOrder) {
                    return fail(`Maximum ${ticketType.maxPerOrder} tickets allowed for ${ticketType.name}`, 400);
                }

                const unitPrice = ticketType.isFree ? 0 : Number(ticketType.basePrice);
                subtotal += unitPrice * ticketRequest.quantity;

                ticketDetails.push({
                    ticketTypeId: ticketType.id,
                    quantity: ticketRequest.quantity,
                    unitPrice,
                    name: ticketType.name,
                });
                totalTickets += ticketRequest.quantity;
            }
        }

        if (totalTickets < event.minTicketsPerOrder) {
            return fail(`Minimum ${event.minTicketsPerOrder} tickets per order`, 400);
        }
        if (totalTickets > event.maxTicketsPerOrder) {
            return fail(`Maximum ${event.maxTicketsPerOrder} tickets per order`, 400);
        }

        // Apply promo code if provided
        let discountAmount = 0;
        if (promoCode) {
            const promo = await prisma.promoCode.findFirst({
                where: {
                    code: promoCode.toUpperCase(),
                    isActive: true,
                    OR: [
                        { eventId: null },
                        { eventId: eventId },
                    ],
                    validFrom: { lte: new Date() },
                    validUntil: { gte: new Date() },
                },
            });

            if (promo) {
                if (promo.usageLimitTotal && promo.usedCount >= promo.usageLimitTotal) {
                    return fail("Promo code usage limit reached", 400);
                }

                if (promo.minOrderAmount && subtotal < Number(promo.minOrderAmount)) {
                    return fail(`Minimum order ${promo.minOrderAmount} required for this promo`, 400);
                }

                if (promo.discountType === "PERCENTAGE") {
                    discountAmount = subtotal * (Number(promo.discountValue) / 100);
                    if (promo.maxDiscountAmount) {
                        discountAmount = Math.min(discountAmount, Number(promo.maxDiscountAmount));
                    }
                } else {
                    discountAmount = Number(promo.discountValue);
                }
            }
        }

        const defaultTaxRate = await prisma.taxRate.findFirst({
            where: { isDefault: true, isActive: true }
        });

        let commissionSetting = await prisma.commissionSetting.findFirst({
            where: {
                eventId: event.id,
                isActive: true,
                OR: [
                    { validFrom: null },
                    { validFrom: { lte: new Date() } }
                ],
                AND: [
                    {
                        OR: [
                            { validUntil: null },
                            { validUntil: { gte: new Date() } }
                        ]
                    }
                ]
            }
        });

        if (!commissionSetting) {
            commissionSetting = await prisma.commissionSetting.findFirst({
                where: {
                    organizerId: event.organizerId,
                    isActive: true
                }
            });
        }

        if (!commissionSetting) {
            commissionSetting = await prisma.commissionSetting.findFirst({
                where: {
                    organizerId: null,
                    isActive: true
                }
            });
        }

        const pricing = calculatePricing({
            subtotal,
            discountAmount,
            taxRate: defaultTaxRate ? {
                rate: Number(defaultTaxRate.rate),
                type: defaultTaxRate.taxType,
                isInclusive: defaultTaxRate.isInclusive
            } : null,
            commission: commissionSetting ? {
                value: Number(commissionSetting.commissionValue),
                type: commissionSetting.commissionType,
                minCommission: commissionSetting.minCommission ? Number(commissionSetting.minCommission) : undefined,
                maxCommission: commissionSetting.maxCommission ? Number(commissionSetting.maxCommission) : undefined
            } : {
                value: DEFAULT_PLATFORM_FEE_PERCENTAGE,
                type: 'PERCENTAGE'
            },
            paymentGatewayFeePercentage: DEFAULT_PAYMENT_GATEWAY_FEE_PERCENTAGE
        });

        const totalAmount = pricing.totalAmount;
        const taxAmount = pricing.taxAmount;
        const platformFee = pricing.platformFee;
        const paymentGatewayFee = pricing.paymentGatewayFee;
        const organizerRevenue = pricing.organizerRevenue;
        const platformRevenue = pricing.platformRevenue;
        const taxPercent = pricing.taxBase > 0 ? pricing.taxAmount / pricing.taxBase : 0;

        // Generate booking code
        const bookingCode = generateBookingCode();

        // Create booking with transaction
        const booking = await prisma.$transaction(async (tx: PrismaTransactionClient) => {
            // Create booking
            const newBooking = await tx.booking.create({
                data: {
                    bookingCode,
                    userId: user?.id || null,
                    eventId,
                    eventScheduleId,
                    guestEmail: guestEmail || null,
                    guestName: guestName || null,
                    guestPhone: guestPhone || null,
                    totalTickets,
                    subtotal,
                    discountAmount,
                    taxAmount,
                    platformFee,
                    paymentGatewayFee,
                    totalAmount,
                    organizerRevenue,
                    platformRevenue,
                    status: totalAmount === 0 ? "CONFIRMED" : "AWAITING_PAYMENT",
                    paymentStatus: totalAmount === 0 ? "PAID" : "UNPAID",
                    expiresAt: totalAmount === 0 ? null : new Date(Date.now() + 30 * 60 * 1000), // 30 min
                    paidAt: totalAmount === 0 ? new Date() : null,
                    confirmedAt: totalAmount === 0 ? new Date() : null,
                    ipAddress: request.headers.get("x-forwarded-for") || request.headers.get("x-real-ip"),
                },
            });

            if (seatSelection) {
                for (let i = 0; i < seatDetails.length; i++) {
                    const seatDetail = seatDetails[i];
                    const uniqueCode = `${bookingCode}-S${String(i + 1).padStart(3, "0")}`;

                    const bookedTicket = await tx.bookedTicket.create({
                        data: {
                            bookingId: newBooking.id,
                            ticketTypeId: seatDetail.ticketTypeId,
                            seatId: seatDetail.seatId,
                            uniqueCode,
                            unitPrice: seatDetail.unitPrice,
                            taxAmount: Math.round(seatDetail.unitPrice * taxPercent),
                            finalPrice: seatDetail.unitPrice + Math.round(seatDetail.unitPrice * taxPercent),
                            status: "ACTIVE",
                        },
                    });

                    await tx.seat.update({
                        where: { id: seatDetail.seatId },
                        data: {
                            status: "BOOKED",
                            lockedByUserId: null,
                            lockedUntil: null,
                            bookedTicketId: bookedTicket.id,
                        },
                    });
                }

                for (const detail of ticketDetails) {
                    await tx.ticketType.update({
                        where: { id: detail.ticketTypeId },
                        data: {
                            reservedQuantity: { increment: detail.quantity },
                        },
                    });
                }
            } else {
                for (const detail of ticketDetails) {
                    for (let i = 0; i < detail.quantity; i++) {
                        const uniqueCode = `${bookingCode}-${detail.ticketTypeId.slice(0, 4).toUpperCase()}-${String(i + 1).padStart(3, "0")}`;

                        await tx.bookedTicket.create({
                            data: {
                                bookingId: newBooking.id,
                                ticketTypeId: detail.ticketTypeId,
                                uniqueCode,
                                unitPrice: detail.unitPrice,
                                taxAmount: Math.round(detail.unitPrice * taxPercent),
                                finalPrice: detail.unitPrice + Math.round(detail.unitPrice * taxPercent),
                                status: "ACTIVE",
                            },
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

            return newBooking;
        });

        logger.info("bookings.created", "Booking created", {
            bookingId: booking.id,
            bookingCode: booking.bookingCode,
            eventId,
            totalAmount: Number(booking.totalAmount),
        });

        return ok({
            id: booking.id,
            bookingCode: booking.bookingCode,
            totalAmount: Number(booking.totalAmount),
            status: booking.status,
            expiresAt: booking.expiresAt,
        }, 201);
    } catch (error) {
        logger.error("bookings.create_failed", "Failed to create booking", error);
        return fail("Failed to create booking", 500);
    }
}
