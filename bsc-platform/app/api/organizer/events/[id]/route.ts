import { type NextRequest } from "next/server";
import prisma from "@/lib/prisma/client";
import { successResponse, errorResponse } from "@/lib/api/response";
import { createClient } from "@/lib/supabase/server";
import { updateEventSchema } from "@/lib/validators";

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const supabase = await createClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
            return errorResponse("Unauthorized", 401);
        }

        const organizer = await prisma.user.findUnique({
            where: { email: user.email! },
        });

        if (!organizer) {
            return errorResponse("User not found", 404);
        }

        const event = await prisma.event.findUnique({
            where: { id },
            include: {
                category: true,
                venue: true,
                schedules: { orderBy: { sortOrder: "asc" } },
                ticketTypes: {
                    orderBy: { sortOrder: "asc" },
                    include: {
                        priceTiers: { orderBy: { sortOrder: "asc" } },
                        _count: { select: { bookedTickets: true } },
                    },
                },
                promoCodes: { where: { isActive: true } },
                faqs: { orderBy: { sortOrder: "asc" } },
                _count: {
                    select: {
                        bookings: { where: { status: { in: ["CONFIRMED", "PAID"] } } },
                        reviews: true,
                    },
                },
            },
        });

        if (!event) {
            return errorResponse("Event not found", 404);
        }

        if (event.organizerId !== organizer.id && organizer.role !== "ADMIN" && organizer.role !== "SUPER_ADMIN") {
            return errorResponse("Not authorized to view this event", 403);
        }

        const ticketStats = await prisma.ticketType.aggregate({
            where: { eventId: id },
            _sum: { totalQuantity: true, soldQuantity: true, reservedQuantity: true },
        });

        const revenueStats = await prisma.booking.aggregate({
            where: {
                eventId: id,
                status: { in: ["CONFIRMED", "PAID"] },
            },
            _sum: { totalAmount: true, organizerRevenue: true },
        });

        const checkedInCount = await prisma.bookedTicket.count({
            where: {
                booking: { eventId: id, status: { in: ["CONFIRMED", "PAID"] } },
                isCheckedIn: true,
            },
        });

        return successResponse({
            ...event,
            stats: {
                totalTickets: ticketStats._sum.totalQuantity || 0,
                soldTickets: ticketStats._sum.soldQuantity || 0,
                reservedTickets: ticketStats._sum.reservedQuantity || 0,
                availableTickets: (ticketStats._sum.totalQuantity || 0) - (ticketStats._sum.soldQuantity || 0) - (ticketStats._sum.reservedQuantity || 0),
                totalRevenue: Number(revenueStats._sum.totalAmount || 0),
                organizerRevenue: Number(revenueStats._sum.organizerRevenue || 0),
                totalBookings: event._count.bookings,
                totalReviews: event._count.reviews,
                checkedInCount,
            },
        });
    } catch (error) {
        console.error("Error fetching event:", error);
        return errorResponse("Failed to fetch event", 500);
    }
}

export async function PUT(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const supabase = await createClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
            return errorResponse("Unauthorized", 401);
        }

        const organizer = await prisma.user.findUnique({
            where: { email: user.email! },
        });

        if (!organizer || organizer.role !== "ORGANIZER") {
            return errorResponse("Only organizers can update events", 403);
        }

        const event = await prisma.event.findUnique({
            where: { id },
        });

        if (!event) {
            return errorResponse("Event not found", 404);
        }

        if (event.organizerId !== organizer.id) {
            return errorResponse("Not authorized to update this event", 403);
        }

        const body = await request.json();
        const parsed = updateEventSchema.safeParse(body);

        if (!parsed.success) {
            return errorResponse("Validation error", 400, {
                errors: parsed.error.flatten().fieldErrors,
            });
        }

        const data = parsed.data;

        const updatedEvent = await prisma.event.update({
            where: { id },
            data: {
                title: data.title,
                shortDescription: data.shortDescription,
                description: data.description,
                categoryId: data.categoryId,
                eventType: data.eventType,
                visibility: data.visibility,
                accessPassword: data.accessPassword,
                posterImage: data.posterImage,
                bannerImage: data.bannerImage,
                trailerVideoUrl: data.trailerVideoUrl,
                onlineMeetingUrl: data.onlineMeetingUrl,
                onlineMeetingPassword: data.onlineMeetingPassword,
                minTicketsPerOrder: data.minTicketsPerOrder,
                maxTicketsPerOrder: data.maxTicketsPerOrder,
                termsAndConditions: data.termsAndConditions,
                refundPolicy: data.refundPolicy,
                metaTitle: data.metaTitle,
                metaDescription: data.metaDescription,
                status: data.status,
            },
            include: {
                category: true,
                venue: true,
                schedules: { orderBy: { sortOrder: "asc" } },
                ticketTypes: { orderBy: { sortOrder: "asc" } },
            },
        });

        return successResponse(updatedEvent);
    } catch (error) {
        console.error("Error updating event:", error);
        return errorResponse("Failed to update event", 500);
    }
}

export async function DELETE(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const supabase = await createClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
            return errorResponse("Unauthorized", 401);
        }

        const organizer = await prisma.user.findUnique({
            where: { email: user.email! },
        });

        if (!organizer || organizer.role !== "ORGANIZER") {
            return errorResponse("Only organizers can delete events", 403);
        }

        const event = await prisma.event.findUnique({
            where: { id },
            include: { _count: { select: { bookings: { where: { status: { in: ["CONFIRMED", "PAID"] } } } } } },
        });

        if (!event) {
            return errorResponse("Event not found", 404);
        }

        if (event.organizerId !== organizer.id) {
            return errorResponse("Not authorized to delete this event", 403);
        }

        if (event._count.bookings > 0) {
            return errorResponse("Cannot delete event with confirmed bookings", 400);
        }

        await prisma.event.update({
            where: { id },
            data: { deletedAt: new Date() },
        });

        return successResponse({ message: "Event deleted successfully" });
    } catch (error) {
        console.error("Error deleting event:", error);
        return errorResponse("Failed to delete event", 500);
    }
}
