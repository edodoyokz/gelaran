import prisma from "@/lib/prisma/client";
import { successResponse, errorResponse } from "@/lib/api/response";
import { createClient } from "@/lib/supabase/server";
import { z } from "zod";

type AdminResult = { admin: { id: string } } | { error: string; status: number };

async function verifyAdmin(): Promise<AdminResult> {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user || !user.email) {
        return { error: "Unauthorized", status: 401 };
    }

    const admin = await prisma.user.findUnique({
        where: { email: user.email },
    });

    if (!admin || !["ADMIN", "SUPER_ADMIN"].includes(admin.role)) {
        return { error: "Admin access required", status: 403 };
    }

    return { admin };
}

export async function GET(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const authResult = await verifyAdmin();

        if ("error" in authResult) {
            return errorResponse(authResult.error, authResult.status);
        }

        const { id } = await params;

        const booking = await prisma.booking.findUnique({
            where: { id },
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
                transaction: true,
                refunds: true,
            },
        });

        if (!booking) {
            return errorResponse("Booking not found", 404);
        }

        return successResponse(booking);
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
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const authResult = await verifyAdmin();

        if ("error" in authResult) {
            return errorResponse(authResult.error, authResult.status);
        }

        const { id } = await params;
        const body = await request.json();
        const parsed = cancelBookingSchema.safeParse(body);

        if (!parsed.success) {
            return errorResponse("Validation error", 400, {
                errors: parsed.error.flatten().fieldErrors,
            });
        }

        const booking = await prisma.booking.findUnique({
            where: { id },
        });

        if (!booking) {
            return errorResponse("Booking not found", 404);
        }

        if (["CANCELLED", "REFUNDED", "EXPIRED"].includes(booking.status)) {
            return errorResponse("Booking cannot be cancelled", 400);
        }

        const updated = await prisma.booking.update({
            where: { id },
            data: {
                status: "CANCELLED",
                cancellationReason: parsed.data.reason,
                cancelledBy: authResult.admin.id,
                cancelledAt: new Date(),
            },
        });

        return successResponse(updated);
    } catch (error) {
        console.error("Error cancelling booking:", error);
        return errorResponse("Failed to cancel booking", 500);
    }
}
