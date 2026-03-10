import type { Prisma } from "@prisma/client";
import prisma from "@/lib/prisma/client";
import { successResponse, errorResponse } from "@/lib/api/response";
import { requireAdmin } from "@/lib/auth/route-auth";

const EVENT_STATUS_VALUES = ["DRAFT", "PENDING_REVIEW", "PUBLISHED", "CANCELLED", "ENDED"] as const;

export async function GET(request: Request) {
    try {
        const authResult = await requireAdmin();

        if ("error" in authResult) {
            return errorResponse(authResult.error, authResult.status);
        }

        const url = new URL(request.url);
        
        const page = parseInt(url.searchParams.get('page') || '1');
        const limit = parseInt(url.searchParams.get('limit') || '20');
        const skip = (page - 1) * limit;
        
        const statusFilter = url.searchParams.get('status') || '';
        const categoryFilter = url.searchParams.get('category') || '';
        const organizerFilter = url.searchParams.get('organizer') || '';
        const search = url.searchParams.get('search') || '';
        const dateFrom = url.searchParams.get('dateFrom') ? new Date(url.searchParams.get('dateFrom')!) : null;
        const dateTo = url.searchParams.get('dateTo') ? new Date(url.searchParams.get('dateTo')!) : null;
        const scheduledFrom = url.searchParams.get('scheduledFrom') ? new Date(url.searchParams.get('scheduledFrom')!) : null;
        const scheduledTo = url.searchParams.get('scheduledTo') ? new Date(url.searchParams.get('scheduledTo')!) : null;
        const cityFilter = url.searchParams.get('city') || '';
        const hasBookingsFilter = url.searchParams.get('hasBookings') || '';
        
        const sortBy = url.searchParams.get('sortBy') || 'createdAt';
        const sortOrder: Prisma.SortOrder =
            url.searchParams.get('sortOrder') === 'asc' ? 'asc' : 'desc';

        const where: Prisma.EventWhereInput = { deletedAt: null };

        if (statusFilter && EVENT_STATUS_VALUES.includes(statusFilter as (typeof EVENT_STATUS_VALUES)[number])) {
            where.status = statusFilter as (typeof EVENT_STATUS_VALUES)[number];
        }
        
        if (categoryFilter) {
            where.categoryId = categoryFilter;
        }
        
        if (organizerFilter) {
            where.organizerId = organizerFilter;
        }
        
        if (search) {
            where.OR = [
                { title: { contains: search, mode: 'insensitive' } },
                { organizer: { name: { contains: search, mode: 'insensitive' } } },
                { organizer: { organizerProfile: { organizationName: { contains: search, mode: 'insensitive' } } } },
            ];
        }
        
        if (dateFrom || dateTo) {
            where.createdAt = {
                ...(dateFrom ? { gte: dateFrom } : {}),
                ...(dateTo ? { lte: dateTo } : {}),
            };
        }
        
        if (scheduledFrom || scheduledTo) {
            where.schedules = {
                some: {
                    scheduleDate: {
                        ...(scheduledFrom && { gte: scheduledFrom }),
                        ...(scheduledTo && { lte: scheduledTo }),
                    },
                },
            };
        }
        
        if (cityFilter) {
            where.venue = {
                city: { contains: cityFilter, mode: 'insensitive' },
            };
        }
        
        if (hasBookingsFilter === 'yes') {
            where.bookings = { some: {} };
        } else if (hasBookingsFilter === 'no') {
            where.bookings = { none: {} };
        }

        const orderBy: Prisma.EventOrderByWithRelationInput = {};

        if (sortBy === 'title' || sortBy === 'createdAt' || sortBy === 'status') {
            orderBy[sortBy] = sortOrder;
        } else if (sortBy === 'bookings') {
            orderBy.bookings = { _count: sortOrder };
        } else if (sortBy === 'organizer') {
            orderBy.organizer = { name: sortOrder };
        } else if (sortBy === 'scheduledDate') {
            orderBy.schedules = { _count: sortOrder };
        } else {
            orderBy.createdAt = 'desc';
        }

        const totalCount = await prisma.event.count({ where });
        
        const events = await prisma.event.findMany({
            where,
            orderBy,
            skip,
            take: limit,
            select: {
                id: true,
                slug: true,
                title: true,
                posterImage: true,
                status: true,
                createdAt: true,
                organizer: {
                    select: {
                        id: true,
                        name: true,
                        organizerProfile: {
                            select: {
                                organizationName: true,
                            },
                        },
                    },
                },
                category: {
                    select: {
                        id: true,
                        name: true,
                    },
                },
                venue: {
                    select: {
                        name: true,
                        city: true,
                    },
                },
                schedules: {
                    select: {
                        scheduleDate: true,
                        startTime: true,
                        endTime: true,
                    },
                    orderBy: { scheduleDate: 'asc' },
                    take: 1,
                },
                _count: {
                    select: {
                        bookings: true,
                    },
                },
            },
        });
        
        const eventsWithRevenue = await Promise.all(
            events.map(async (event) => {
                const revenue = await prisma.booking.aggregate({
                    where: {
                        eventId: event.id,
                        OR: [
                            { status: 'CONFIRMED' },
                            { paymentStatus: 'PAID' },
                        ],
                    },
                    _sum: {
                        totalAmount: true,
                        platformRevenue: true,
                    },
                });
                
                return {
                    ...event,
                    revenue: {
                        total: Number(revenue._sum.totalAmount || 0),
                        platform: Number(revenue._sum.platformRevenue || 0),
                    },
                };
            })
        );

        const totalPages = Math.ceil(totalCount / limit);
        const hasNext = page < totalPages;
        const hasPrev = page > 1;
        
        const [
            totalEvents,
            draftCount,
            pendingCount,
            publishedCount,
            cancelledCount,
            endedCount,
        ] = await Promise.all([
            prisma.event.count({ where: { deletedAt: null } }),
            prisma.event.count({ where: { status: 'DRAFT', deletedAt: null } }),
            prisma.event.count({ where: { status: 'PENDING_REVIEW', deletedAt: null } }),
            prisma.event.count({ where: { status: 'PUBLISHED', deletedAt: null } }),
            prisma.event.count({ where: { status: 'CANCELLED', deletedAt: null } }),
            prisma.event.count({ where: { status: 'ENDED', deletedAt: null } }),
        ]);
        
        const totalRevenue = await prisma.booking.aggregate({
            where: {
                OR: [
                    { status: 'CONFIRMED' },
                    { paymentStatus: 'PAID' },
                ],
            },
            _sum: {
                totalAmount: true,
                platformRevenue: true,
            },
        });
        
        const categories = await prisma.category.findMany({
            select: {
                id: true,
                name: true,
                _count: { select: { events: true } },
            },
            orderBy: { name: 'asc' },
        });
        
        const cities = await prisma.venue.findMany({
            distinct: ['city'],
            select: { city: true },
            orderBy: { city: 'asc' },
        });
        
        const organizers = await prisma.user.findMany({
            where: {
                role: 'ORGANIZER',
            },
            select: {
                id: true,
                name: true,
                organizerProfile: {
                    select: {
                        organizationName: true,
                    },
                },
            },
            orderBy: { name: 'asc' },
        });
        
        return successResponse({
            events: eventsWithRevenue,
            pagination: {
                page,
                limit,
                total: totalCount,
                totalPages,
                hasNext,
                hasPrev,
            },
            stats: {
                total: totalEvents,
                draft: draftCount,
                pending: pendingCount,
                published: publishedCount,
                cancelled: cancelledCount,
                ended: endedCount,
                totalRevenue: Number(totalRevenue._sum.totalAmount || 0),
                platformRevenue: Number(totalRevenue._sum.platformRevenue || 0),
            },
            filterOptions: {
                categories: categories.map((c: { id: string; name: string; _count: { events: number } }) => ({ 
                    id: c.id, 
                    name: c.name, 
                    count: c._count.events 
                })),
                cities: cities.map((c: { city: string }) => c.city),
                organizers: organizers.map((o: {
                    id: string;
                    name: string;
                    organizerProfile?: {
                        organizationName: string | null;
                    } | null;
                }) => ({
                    id: o.id,
                    name: o.name,
                    organizationName: o.organizerProfile?.organizationName || null,
                })),
            },
        });
    } catch (error) {
        console.error("Error fetching events:", error);
        return errorResponse("Failed to fetch events", 500);
    }
}
