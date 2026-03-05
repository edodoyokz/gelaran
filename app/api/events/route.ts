import { type NextRequest } from "next/server";
import prisma from "@/lib/prisma/client";
import { successResponse, errorResponse, paginationMeta } from "@/lib/api/response";
import { eventQuerySchema } from "@/lib/validators";
import type { Decimal } from "@prisma/client/runtime/library";

interface EventWithRelations {
    id: string;
    slug: string;
    title: string;
    shortDescription: string | null;
    posterImage: string | null;
    eventType: string;
    isFeatured: boolean;
    viewCount: number;
    category: {
        id: string;
        name: string;
        slug: string;
        colorHex: string | null;
    };
    venue: {
        id: string;
        name: string;
        city: string;
        province: string;
    } | null;
    organizer: {
        id: string;
        name: string;
        organizerProfile: {
            organizationName: string;
            organizationSlug: string;
            organizationLogo: string | null;
        } | null;
    };
    schedules: Array<{
        scheduleDate: Date;
        startTime: Date;
        endTime: Date;
    }>;
    ticketTypes: Array<{
        basePrice: Decimal;
        isFree: boolean;
    }>;
}

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);

        // Parse and validate query params
        const params = eventQuerySchema.safeParse({
            page: searchParams.get("page"),
            limit: searchParams.get("limit"),
            category: searchParams.get("category"),
            city: searchParams.get("city"),
            search: searchParams.get("search"),
            eventType: searchParams.get("eventType"),
            status: searchParams.get("status"),
            startDate: searchParams.get("startDate"),
            endDate: searchParams.get("endDate"),
            dateFilter: searchParams.get("dateFilter"),
            priceType: searchParams.get("priceType"),
            isFeatured: searchParams.get("isFeatured"),
            sortBy: searchParams.get("sortBy"),
            sortOrder: searchParams.get("sortOrder"),
        });

        if (!params.success) {
            return errorResponse("Invalid query parameters", 400, params.error.flatten().fieldErrors);
        }

        const { page, limit, category, city, search, eventType, status, startDate, endDate, dateFilter, priceType, isFeatured, sortBy, sortOrder } = params.data;
        const skip = (page - 1) * limit;

        // Build where clause
        const where: Record<string, unknown> = {
            status,
            deletedAt: null,
        };

        const scheduleDateWhere: Record<string, Date> = {};

        if (startDate) {
            scheduleDateWhere.gte = new Date(startDate);
        }

        if (endDate) {
            scheduleDateWhere.lte = new Date(endDate);
        }

        if (dateFilter === "THIS_WEEK") {
            const now = new Date();
            const day = now.getDay();
            const mondayOffset = day === 0 ? -6 : 1 - day;
            const startOfWeek = new Date(now);
            startOfWeek.setDate(now.getDate() + mondayOffset);
            startOfWeek.setHours(0, 0, 0, 0);

            const endOfWeek = new Date(startOfWeek);
            endOfWeek.setDate(startOfWeek.getDate() + 6);
            endOfWeek.setHours(23, 59, 59, 999);

            scheduleDateWhere.gte = startOfWeek;
            scheduleDateWhere.lte = endOfWeek;
        }

        if (dateFilter === "THIS_MONTH") {
            const now = new Date();
            const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1, 0, 0, 0, 0);
            const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);

            scheduleDateWhere.gte = startOfMonth;
            scheduleDateWhere.lte = endOfMonth;
        }

        if (category) {
            where.category = { slug: category };
        }

        if (city) {
            where.venue = { city: { contains: city, mode: "insensitive" } };
        }

        if (search) {
            where.OR = [
                { title: { contains: search, mode: "insensitive" } },
                { shortDescription: { contains: search, mode: "insensitive" } },
            ];
        }

        if (eventType) {
            where.eventType = eventType;
        }

        if (isFeatured !== undefined) {
            where.isFeatured = isFeatured;
        }

        if (Object.keys(scheduleDateWhere).length > 0) {
            where.schedules = {
                some: {
                    isActive: true,
                    scheduleDate: scheduleDateWhere,
                },
            };
        }

        if (priceType === "FREE") {
            where.ticketTypes = {
                some: {
                    isActive: true,
                    isHidden: false,
                    isFree: true,
                },
            };
        }

        if (priceType === "PAID") {
            where.ticketTypes = {
                some: {
                    isActive: true,
                    isHidden: false,
                    isFree: false,
                },
            };
        }

        // Get total count
        const total = await prisma.event.count({ where });

        // Get events with relations
        const events = await prisma.event.findMany({
            where,
            skip,
            take: limit,
            orderBy: { [sortBy]: sortOrder },
            include: {
                category: {
                    select: {
                        id: true,
                        name: true,
                        slug: true,
                        colorHex: true,
                    },
                },
                venue: {
                    select: {
                        id: true,
                        name: true,
                        city: true,
                        province: true,
                    },
                },
                organizer: {
                    select: {
                        id: true,
                        name: true,
                        organizerProfile: {
                            select: {
                                organizationName: true,
                                organizationSlug: true,
                                organizationLogo: true,
                            },
                        },
                    },
                },
                schedules: {
                    where: { isActive: true },
                    orderBy: { scheduleDate: "asc" },
                    take: 1,
                    select: {
                        scheduleDate: true,
                        startTime: true,
                        endTime: true,
                    },
                },
                ticketTypes: {
                    where: { isActive: true, isHidden: false },
                    orderBy: { basePrice: "asc" },
                    take: 1,
                    select: {
                        basePrice: true,
                        isFree: true,
                    },
                },
            },
        });

        // Transform data
        const transformedEvents = events.map((event: EventWithRelations) => ({
            id: event.id,
            slug: event.slug,
            title: event.title,
            shortDescription: event.shortDescription,
            posterImage: event.posterImage,
            eventType: event.eventType,
            isFeatured: event.isFeatured,
            category: event.category,
            venue: event.venue,
            organizer: {
                id: event.organizer.id,
                name: event.organizer.organizerProfile?.organizationName || event.organizer.name,
                slug: event.organizer.organizerProfile?.organizationSlug,
                logo: event.organizer.organizerProfile?.organizationLogo,
            },
            schedule: event.schedules[0] || null,
            startingPrice: event.ticketTypes[0]?.isFree ? 0 : (event.ticketTypes[0]?.basePrice || null),
            viewCount: event.viewCount,
        }));

        return successResponse(transformedEvents, paginationMeta(page, limit, total));
    } catch (error) {
        console.error("Error fetching events:", error);
        return errorResponse("Failed to fetch events", 500);
    }
}
