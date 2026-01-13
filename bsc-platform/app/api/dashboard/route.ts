import prisma from "@/lib/prisma/client";
import { successResponse, errorResponse } from "@/lib/api/response";
import { createClient } from "@/lib/supabase/server";

export async function GET() {
    try {
        const supabase = await createClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (!user || !user.email) {
            return errorResponse("Unauthorized", 401);
        }

        const dbUser = await prisma.user.findUnique({
            where: { email: user.email },
            select: {
                id: true,
                name: true,
                email: true,
            },
        });

        if (!dbUser) {
            return errorResponse("User not found", 404);
        }

        const now = new Date();
        const thirtyDaysLater = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);

        const [
            totalBookings,
            upcomingBookingsData,
            recentBookings,
            wishlistCount,
            recommendedEvents,
        ] = await Promise.all([
            prisma.booking.count({
                where: { userId: dbUser.id },
            }),

            prisma.booking.findMany({
                where: {
                    userId: dbUser.id,
                    status: { in: ["CONFIRMED", "PAID"] },
                    eventSchedule: {
                        scheduleDate: {
                            gte: now,
                            lte: thirtyDaysLater,
                        },
                    },
                },
                orderBy: { eventSchedule: { scheduleDate: "asc" } },
                take: 4,
                select: {
                    id: true,
                    bookingCode: true,
                    status: true,
                    totalTickets: true,
                    event: {
                        select: {
                            id: true,
                            title: true,
                            slug: true,
                            posterImage: true,
                            venue: {
                                select: { name: true, city: true },
                            },
                        },
                    },
                    eventSchedule: {
                        select: {
                            scheduleDate: true,
                            startTime: true,
                        },
                    },
                },
            }),

            prisma.booking.findMany({
                where: { userId: dbUser.id },
                orderBy: { createdAt: "desc" },
                take: 5,
                select: {
                    id: true,
                    bookingCode: true,
                    status: true,
                    totalAmount: true,
                    createdAt: true,
                    event: {
                        select: {
                            title: true,
                            slug: true,
                            posterImage: true,
                        },
                    },
                },
            }),

            prisma.wishlist.count({
                where: { userId: dbUser.id },
            }),

            prisma.event.findMany({
                where: {
                    status: "PUBLISHED",
                    deletedAt: null,
                    schedules: {
                        some: {
                            scheduleDate: { gte: now },
                            isActive: true,
                        },
                    },
                },
                orderBy: { createdAt: "desc" },
                take: 6,
                select: {
                    id: true,
                    title: true,
                    slug: true,
                    posterImage: true,
                    category: {
                        select: { name: true },
                    },
                    venue: {
                        select: { name: true, city: true },
                    },
                    schedules: {
                        where: { isActive: true },
                        orderBy: { scheduleDate: "asc" },
                        take: 1,
                        select: {
                            scheduleDate: true,
                            startTime: true,
                        },
                    },
                    ticketTypes: {
                        where: { isActive: true },
                        orderBy: { basePrice: "asc" },
                        take: 1,
                        select: {
                            basePrice: true,
                            isFree: true,
                        },
                    },
                },
            }),
        ]);

        const upcomingCount = await prisma.booking.count({
            where: {
                userId: dbUser.id,
                status: { in: ["CONFIRMED", "PAID"] },
                eventSchedule: {
                    scheduleDate: { gte: now },
                },
            },
        });

        const formattedRecommended = recommendedEvents.map((e) => ({
            id: e.id,
            title: e.title,
            slug: e.slug,
            posterImage: e.posterImage,
            category: e.category?.name || null,
            venue: e.venue ? { name: e.venue.name, city: e.venue.city } : null,
            schedule: e.schedules[0] ? {
                date: e.schedules[0].scheduleDate.toISOString(),
                time: e.schedules[0].startTime.toISOString(),
            } : null,
            price: e.ticketTypes[0] ? {
                isFree: e.ticketTypes[0].isFree,
                startingFrom: Number(e.ticketTypes[0].basePrice),
            } : null,
        }));

        return successResponse({
            stats: {
                totalBookings,
                upcomingEvents: upcomingCount,
                wishlistCount,
            },
            upcomingBookings: upcomingBookingsData,
            recentBookings: recentBookings.map((b) => ({
                ...b,
                totalAmount: Number(b.totalAmount).toString(),
            })),
            recommendedEvents: formattedRecommended,
            user: {
                name: dbUser.name,
                email: dbUser.email,
            },
        });
    } catch (error) {
        console.error("Error fetching dashboard:", error);
        return errorResponse("Failed to fetch dashboard", 500);
    }
}
