import { type NextRequest } from "next/server";
import prisma from "@/lib/prisma/client";
import { successResponse, errorResponse } from "@/lib/api/response";
import { createClient } from "@/lib/supabase/server";
import { z } from "zod";
import type { Decimal } from "@prisma/client/runtime/library";

interface WishlistWithEvent {
    id: string;
    createdAt: Date;
    event: {
        id: string;
        title: string;
        slug: string;
        posterImage: string | null;
        status: string;
        category: { name: string } | null;
        venue: { name: string; city: string } | null;
        schedules: Array<{ scheduleDate: Date; startTime: Date }>;
        ticketTypes: Array<{ basePrice: Decimal; isFree: boolean }>;
    };
}

const addWishlistSchema = z.object({
    eventId: z.string().uuid(),
});

export async function GET() {
    try {
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

        const wishlists = await prisma.wishlist.findMany({
            where: { userId: dbUser.id },
            orderBy: { createdAt: "desc" },
            include: {
                event: {
                    include: {
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
                },
            },
        });

        const result = wishlists.map((w: WishlistWithEvent) => ({
            id: w.id,
            createdAt: w.createdAt,
            event: {
                id: w.event.id,
                title: w.event.title,
                slug: w.event.slug,
                posterImage: w.event.posterImage,
                status: w.event.status,
                category: w.event.category?.name || null,
                venue: w.event.venue ? {
                    name: w.event.venue.name,
                    city: w.event.venue.city,
                } : null,
                schedule: w.event.schedules[0] ? {
                    date: w.event.schedules[0].scheduleDate,
                    time: w.event.schedules[0].startTime,
                } : null,
                price: w.event.ticketTypes[0] ? {
                    isFree: w.event.ticketTypes[0].isFree,
                    startingFrom: Number(w.event.ticketTypes[0].basePrice),
                } : null,
            },
        }));

        return successResponse({
            wishlists: result,
            total: result.length,
        });
    } catch (error) {
        console.error("Error fetching wishlist:", error);
        return errorResponse("Failed to fetch wishlist", 500);
    }
}

export async function POST(request: NextRequest) {
    try {
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

        const body = await request.json();
        const parsed = addWishlistSchema.safeParse(body);

        if (!parsed.success) {
            return errorResponse("Validation error", 400, {
                errors: parsed.error.flatten().fieldErrors,
            });
        }

        const { eventId } = parsed.data;

        const event = await prisma.event.findUnique({
            where: { id: eventId, status: "PUBLISHED", deletedAt: null },
        });

        if (!event) {
            return errorResponse("Event not found", 404);
        }

        const existing = await prisma.wishlist.findUnique({
            where: {
                userId_eventId: {
                    userId: dbUser.id,
                    eventId,
                },
            },
        });

        if (existing) {
            return errorResponse("Event already in wishlist", 400);
        }

        const wishlist = await prisma.wishlist.create({
            data: {
                userId: dbUser.id,
                eventId,
            },
        });

        return successResponse({
            id: wishlist.id,
            eventId: wishlist.eventId,
            createdAt: wishlist.createdAt,
        }, undefined, 201);
    } catch (error) {
        console.error("Error adding to wishlist:", error);
        return errorResponse("Failed to add to wishlist", 500);
    }
}

export async function DELETE(request: NextRequest) {
    try {
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

        const { searchParams } = new URL(request.url);
        const eventId = searchParams.get("eventId");

        if (!eventId) {
            return errorResponse("Event ID is required", 400);
        }

        const wishlist = await prisma.wishlist.findUnique({
            where: {
                userId_eventId: {
                    userId: dbUser.id,
                    eventId,
                },
            },
        });

        if (!wishlist) {
            return errorResponse("Wishlist item not found", 404);
        }

        await prisma.wishlist.delete({
            where: { id: wishlist.id },
        });

        return successResponse({ success: true });
    } catch (error) {
        console.error("Error removing from wishlist:", error);
        return errorResponse("Failed to remove from wishlist", 500);
    }
}
