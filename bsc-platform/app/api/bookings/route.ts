import { type NextRequest } from "next/server";
import prisma from "@/lib/prisma/client";
import { successResponse, errorResponse } from "@/lib/api/response";
import { createBookingSchema } from "@/lib/validators";
import { createClient } from "@/lib/supabase/server";
import { generateBookingCode } from "@/lib/utils";

export async function POST(request: NextRequest) {
    try {
        // Get authenticated user (optional for guest checkout)
        const supabase = await createClient();
        const { data: { user } } = await supabase.auth.getUser();

        // Parse request body
        const body = await request.json();
        const parsed = createBookingSchema.safeParse(body);

        if (!parsed.success) {
            return errorResponse("Invalid booking data", 400, parsed.error.flatten().fieldErrors);
        }

        const { eventId, eventScheduleId, tickets, promoCode, guestEmail, guestName, guestPhone } = parsed.data;

        // Require either user or guest info
        if (!user && !guestEmail) {
            return errorResponse("Email is required for guest checkout", 400);
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
            return errorResponse("Event not found", 404);
        }

        // Validate tickets
        let subtotal = 0;
        const ticketDetails: Array<{
            ticketTypeId: string;
            quantity: number;
            unitPrice: number;
            name: string;
        }> = [];

        for (const ticketRequest of tickets) {
            const ticketType = event.ticketTypes.find((t) => t.id === ticketRequest.ticketTypeId);

            if (!ticketType) {
                return errorResponse(`Ticket type ${ticketRequest.ticketTypeId} not found`, 400);
            }

            // Check availability
            const available = ticketType.totalQuantity - ticketType.soldQuantity - ticketType.reservedQuantity;
            if (ticketRequest.quantity > available) {
                return errorResponse(`Only ${available} tickets available for ${ticketType.name}`, 400);
            }

            // Check min/max per order
            if (ticketRequest.quantity < ticketType.minPerOrder) {
                return errorResponse(`Minimum ${ticketType.minPerOrder} tickets required for ${ticketType.name}`, 400);
            }
            if (ticketRequest.quantity > ticketType.maxPerOrder) {
                return errorResponse(`Maximum ${ticketType.maxPerOrder} tickets allowed for ${ticketType.name}`, 400);
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

        // Calculate totals
        const totalTickets = tickets.reduce((sum, t) => sum + t.quantity, 0);

        // Check event ticket limits
        if (totalTickets < event.minTicketsPerOrder) {
            return errorResponse(`Minimum ${event.minTicketsPerOrder} tickets per order`, 400);
        }
        if (totalTickets > event.maxTicketsPerOrder) {
            return errorResponse(`Maximum ${event.maxTicketsPerOrder} tickets per order`, 400);
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
                    return errorResponse("Promo code usage limit reached", 400);
                }

                if (promo.minOrderAmount && subtotal < Number(promo.minOrderAmount)) {
                    return errorResponse(`Minimum order ${promo.minOrderAmount} required for this promo`, 400);
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

        // Calculate fees (simplified)
        const platformFeePercent = 0.05; // 5%
        const platformFee = Math.round((subtotal - discountAmount) * platformFeePercent);
        const taxPercent = 0.11; // 11% PPN
        const taxAmount = Math.round((subtotal - discountAmount) * taxPercent);
        const totalAmount = subtotal - discountAmount + platformFee + taxAmount;
        const organizerRevenue = subtotal - discountAmount;
        const platformRevenue = platformFee;

        // Generate booking code
        const bookingCode = generateBookingCode();

        // Create booking with transaction
        const booking = await prisma.$transaction(async (tx) => {
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
                    paymentGatewayFee: 0,
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

            // Create booked tickets
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

                // Update ticket type sold count
                await tx.ticketType.update({
                    where: { id: detail.ticketTypeId },
                    data: {
                        reservedQuantity: { increment: detail.quantity },
                    },
                });
            }

            return newBooking;
        });

        return successResponse({
            id: booking.id,
            bookingCode: booking.bookingCode,
            totalAmount: Number(booking.totalAmount),
            status: booking.status,
            expiresAt: booking.expiresAt,
        }, undefined, 201);
    } catch (error) {
        console.error("Error creating booking:", error);
        return errorResponse("Failed to create booking", 500);
    }
}
