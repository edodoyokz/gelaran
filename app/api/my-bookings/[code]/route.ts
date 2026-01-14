import prisma from "@/lib/prisma/client";
import { successResponse, errorResponse } from "@/lib/api/response";
import { createClient } from "@/lib/supabase/server";
import type { BookingStatus } from "@prisma/client";

const CANCELLABLE_STATUSES: BookingStatus[] = ["PENDING", "AWAITING_PAYMENT"];

export async function GET(
    request: Request,
    { params }: { params: Promise<{ code: string }> }
) {
    try {
        const { code: bookingCode } = await params;
        const supabase = await createClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (!user || !user.email) {
            return errorResponse("Unauthorized", 401);
        }

        const dbUser = await prisma.user.findUnique({
            where: { email: user.email },
        });

        if (!dbUser) {
            return errorResponse("User not found", 404);
        }

        const booking = await prisma.booking.findUnique({
            where: { bookingCode },
            include: {
                event: {
                    select: {
                        id: true,
                        title: true,
                        slug: true,
                        posterImage: true,
                        bannerImage: true,
                        eventType: true,
                        onlineMeetingUrl: true,
                        onlineMeetingPassword: true,
                        termsAndConditions: true,
                        refundPolicy: true,
                        organizer: {
                            select: {
                                id: true,
                                name: true,
                                email: true,
                                organizerProfile: {
                                    select: {
                                        organizationName: true,
                                        organizationLogo: true,
                                    },
                                },
                            },
                        },
                        venue: {
                            select: {
                                id: true,
                                name: true,
                                address: true,
                                city: true,
                                province: true,
                                latitude: true,
                                longitude: true,
                                googlePlaceId: true,
                            },
                        },
                    },
                },
                eventSchedule: {
                    select: {
                        id: true,
                        title: true,
                        scheduleDate: true,
                        startTime: true,
                        endTime: true,
                        description: true,
                        locationOverride: true,
                    },
                },
                bookedTickets: {
                    select: {
                        id: true,
                        uniqueCode: true,
                        qrCodeUrl: true,
                        unitPrice: true,
                        finalPrice: true,
                        isCheckedIn: true,
                        checkedInAt: true,
                        status: true,
                        ticketType: {
                            select: {
                                id: true,
                                name: true,
                                description: true,
                            },
                        },
                    },
                    orderBy: { createdAt: "asc" },
                },
                transaction: {
                    select: {
                        id: true,
                        transactionCode: true,
                        paymentGateway: true,
                        paymentMethod: true,
                        paymentChannel: true,
                        amount: true,
                        status: true,
                        paidAt: true,
                    },
                },
                refunds: {
                    select: {
                        id: true,
                        refundType: true,
                        refundAmount: true,
                        reason: true,
                        status: true,
                        requestedAt: true,
                        completedAt: true,
                    },
                    orderBy: { requestedAt: "desc" },
                },
            },
        });

        if (!booking) {
            return errorResponse("Booking not found", 404);
        }

        if (booking.userId !== dbUser.id) {
            return errorResponse("Access denied", 403);
        }

        const canCancel = CANCELLABLE_STATUSES.includes(booking.status);
        const canRefund = booking.status === "CONFIRMED" || booking.status === "PAID";
        const isUpcoming = booking.eventSchedule
            ? new Date(booking.eventSchedule.scheduleDate) > new Date()
            : false;

        return successResponse({
            booking: {
                ...booking,
                subtotal: booking.subtotal.toString(),
                discountAmount: booking.discountAmount.toString(),
                taxAmount: booking.taxAmount.toString(),
                platformFee: booking.platformFee.toString(),
                paymentGatewayFee: booking.paymentGatewayFee.toString(),
                totalAmount: booking.totalAmount.toString(),
                organizerRevenue: booking.organizerRevenue.toString(),
                platformRevenue: booking.platformRevenue.toString(),
                bookedTickets: booking.bookedTickets.map((ticket) => ({
                    ...ticket,
                    unitPrice: ticket.unitPrice.toString(),
                    finalPrice: ticket.finalPrice.toString(),
                })),
                transaction: booking.transaction
                    ? {
                          ...booking.transaction,
                          amount: booking.transaction.amount.toString(),
                      }
                    : null,
                refunds: booking.refunds.map((refund) => ({
                    ...refund,
                    refundAmount: refund.refundAmount.toString(),
                })),
            },
            actions: {
                canCancel,
                canRefund,
                isUpcoming,
            },
        });
    } catch (error) {
        console.error("Error fetching booking:", error);
        return errorResponse("Failed to fetch booking", 500);
    }
}

export async function DELETE(
    request: Request,
    { params }: { params: Promise<{ code: string }> }
) {
    try {
        const { code: bookingCode } = await params;
        const supabase = await createClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (!user || !user.email) {
            return errorResponse("Unauthorized", 401);
        }

        const dbUser = await prisma.user.findUnique({
            where: { email: user.email },
        });

        if (!dbUser) {
            return errorResponse("User not found", 404);
        }

        const booking = await prisma.booking.findUnique({
            where: { bookingCode },
            include: {
                bookedTickets: {
                    select: {
                        id: true,
                        ticketTypeId: true,
                        seatId: true,
                    },
                },
            },
        });

        if (!booking) {
            return errorResponse("Booking not found", 404);
        }

        if (booking.userId !== dbUser.id) {
            return errorResponse("Access denied", 403);
        }

        if (!CANCELLABLE_STATUSES.includes(booking.status)) {
            return errorResponse(
                "This booking cannot be cancelled. Only pending or awaiting payment bookings can be cancelled.",
                400
            );
        }

        const body = await request.json().catch(() => ({}));
        const reason = body.reason || "Cancelled by customer";

        await prisma.$transaction(async (tx) => {
            await tx.booking.update({
                where: { id: booking.id },
                data: {
                    status: "CANCELLED",
                    cancellationReason: reason,
                    cancelledBy: dbUser.id,
                    cancelledAt: new Date(),
                },
            });

            await tx.bookedTicket.updateMany({
                where: { bookingId: booking.id },
                data: { status: "CANCELLED" },
            });

            const ticketCounts = booking.bookedTickets.reduce((acc, ticket) => {
                acc[ticket.ticketTypeId] = (acc[ticket.ticketTypeId] || 0) + 1;
                return acc;
            }, {} as Record<string, number>);

            for (const [ticketTypeId, count] of Object.entries(ticketCounts)) {
                await tx.ticketType.update({
                    where: { id: ticketTypeId },
                    data: {
                        reservedQuantity: { decrement: count },
                    },
                });
            }

            const seatIds = booking.bookedTickets
                .filter((t) => t.seatId)
                .map((t) => t.seatId as string);

            if (seatIds.length > 0) {
                await tx.seat.updateMany({
                    where: { id: { in: seatIds } },
                    data: {
                        status: "AVAILABLE",
                        bookedTicketId: null,
                        lockedByUserId: null,
                        lockedUntil: null,
                    },
                });
            }
        });

        return successResponse({
            message: "Booking cancelled successfully",
            bookingCode,
        });
    } catch (error) {
        console.error("Error cancelling booking:", error);
        return errorResponse("Failed to cancel booking", 500);
    }
}
