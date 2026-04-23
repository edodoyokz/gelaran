import prisma from "@/lib/prisma/client";
import { successResponse, errorResponse } from "@/lib/api/response";
import { requireAdminContext } from "@/lib/auth/route-auth";
import { createAdminClient } from "@/lib/supabase/server";
import { createPaymentProofReadUrl } from "@/lib/storage/payment-proof";
import { z } from "zod";

export async function GET(
    request: Request,
    { params }: { params: Promise<{ bookingId: string }> }
) {
    try {
        const authResult = await requireAdminContext();

        if ("error" in authResult) {
            return errorResponse(authResult.error, authResult.status);
        }

        const { bookingId } = await params;

        const booking = await prisma.booking.findUnique({
            where: { id: bookingId },
            include: {
                user: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                        phone: true,
                    },
                },
                event: {
                    select: {
                        id: true,
                        title: true,
                        slug: true,
                        posterImage: true,
                        organizer: {
                            select: {
                                name: true,
                                organizerProfile: {
                                    select: { organizationName: true },
                                },
                            },
                        },
                        venue: {
                            select: {
                                name: true,
                                address: true,
                                city: true,
                            },
                        },
                        schedules: {
                            take: 1,
                            orderBy: { scheduleDate: "asc" },
                            select: {
                                scheduleDate: true,
                                startTime: true,
                                endTime: true,
                            },
                        },
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
                        paymentGateway: true,
                        paymentMethod: true,
                        paymentChannel: true,
                        amount: true,
                        status: true,
                        paidAt: true,
                        paymentProofUrl: true,
                        paymentProofUploadedAt: true,
                        verificationStatus: true,
                        verifiedAt: true,
                        verificationNotes: true,
                    },
                },
                refunds: true,
            },
        });

        if (!booking) {
            return errorResponse("Booking not found", 404);
        }

        let paymentProofUrl: string | null = null;

        if (booking.transaction) {
            const storage = createAdminClient();
            paymentProofUrl = await createPaymentProofReadUrl(storage, booking.transaction.paymentProofUrl);
        }

        return successResponse({
            ...booking,
            transaction: booking.transaction
                ? {
                      ...booking.transaction,
                      paymentProofUrl,
                  }
                : null,
        });
    } catch (error) {
        console.error("Error fetching booking:", error);
        return errorResponse("Failed to fetch booking", 500);
    }
}

const cancelBookingSchema = z.object({
    action: z.literal("cancel"),
    reason: z.string().min(1).max(500),
});

export async function PATCH(
    request: Request,
    { params }: { params: Promise<{ bookingId: string }> }
) {
    try {
        const authResult = await requireAdminContext();

        if ("error" in authResult) {
            return errorResponse(authResult.error, authResult.status);
        }

        const { bookingId } = await params;
        const body = await request.json();
        const parsed = cancelBookingSchema.safeParse(body);

        if (!parsed.success) {
            return errorResponse("Validation error", 400, {
                errors: parsed.error.flatten().fieldErrors,
            });
        }

        const booking = await prisma.booking.findUnique({
            where: { id: bookingId },
        });

        if (!booking) {
            return errorResponse("Booking not found", 404);
        }

        if (["CANCELLED", "REFUNDED", "EXPIRED"].includes(booking.status)) {
            return errorResponse("Booking cannot be cancelled", 400);
        }

        const updated = await prisma.booking.update({
            where: { id: bookingId },
            data: {
                status: "CANCELLED",
                cancellationReason: parsed.data.reason,
                cancelledBy: authResult.dbUserId,
                cancelledAt: new Date(),
            },
        });

        return successResponse(updated);
    } catch (error) {
        console.error("Error cancelling booking:", error);
        return errorResponse("Failed to cancel booking", 500);
    }
}
