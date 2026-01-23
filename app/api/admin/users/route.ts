import prisma from "@/lib/prisma/client";
import { successResponse, errorResponse } from "@/lib/api/response";
import { createClient } from "@/lib/supabase/server";

export async function GET(request: Request) {
    try {
        const supabase = await createClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (!user || !user.email) {
            return errorResponse("Unauthorized", 401);
        }

        const admin = await prisma.user.findUnique({
            where: { email: user.email },
        });

        if (!admin || (admin.role !== "ADMIN" && admin.role !== "SUPER_ADMIN")) {
            return errorResponse("Admin access required", 403);
        }

        const url = new URL(request.url);
        
        // Pagination params
        const page = parseInt(url.searchParams.get('page') || '1');
        const limit = parseInt(url.searchParams.get('limit') || '20');
        const skip = (page - 1) * limit;
        
        // Filter params
        const roleFilter = url.searchParams.get('role') || '';
        const verificationFilter = url.searchParams.get('verification') || '';
        const statusFilter = url.searchParams.get('status') || '';
        const search = url.searchParams.get('search') || '';
        const dateFrom = url.searchParams.get('dateFrom') ? new Date(url.searchParams.get('dateFrom')!) : null;
        const dateTo = url.searchParams.get('dateTo') ? new Date(url.searchParams.get('dateTo')!) : null;
        const activityFilter = url.searchParams.get('activity') || '';
        
        // Sort params
        const sortBy = url.searchParams.get('sortBy') || 'createdAt';
        const sortOrder = url.searchParams.get('sortOrder') || 'desc';

        // Build where clause dynamically
        const where: any = {};
        
        // Role filter
        if (roleFilter) {
            where.role = roleFilter;
        }
        
        // Verification filter
        if (verificationFilter === 'verified') {
            where.isVerified = true;
        } else if (verificationFilter === 'unverified') {
            where.isVerified = false;
        }
        
        // Status filter (active/suspended)
        if (statusFilter === 'active') {
            where.deletedAt = null;
        } else if (statusFilter === 'suspended') {
            where.deletedAt = { not: null };
        }
        
        // Search filter (name or email)
        if (search) {
            where.OR = [
                { name: { contains: search, mode: 'insensitive' } },
                { email: { contains: search, mode: 'insensitive' } },
            ];
        }
        
        // Date range filter
        if (dateFrom || dateTo) {
            where.createdAt = {};
            if (dateFrom) where.createdAt.gte = dateFrom;
            if (dateTo) where.createdAt.lte = dateTo;
        }
        
        // Activity filter
        if (activityFilter === 'hasBookings') {
            where.bookings = { some: {} };
        } else if (activityFilter === 'hasEvents') {
            where.events = { some: {} };
        } else if (activityFilter === 'noActivity') {
            where.AND = [
                { bookings: { none: {} } },
                { events: { none: {} } },
            ];
        }

        // Build orderBy clause
        const orderBy: any = {};
        
        if (sortBy === 'name' || sortBy === 'email' || sortBy === 'createdAt') {
            orderBy[sortBy] = sortOrder;
        } else if (sortBy === 'bookings') {
            orderBy.bookings = { _count: sortOrder };
        } else if (sortBy === 'events') {
            orderBy.events = { _count: sortOrder };
        } else {
            orderBy.createdAt = 'desc'; // default
        }

        // Get total count for pagination
        const totalCount = await prisma.user.count({ where });
        
        // Get paginated users
        const users = await prisma.user.findMany({
            where,
            orderBy,
            skip,
            take: limit,
            select: {
                id: true,
                name: true,
                email: true,
                phone: true,
                avatarUrl: true,
                role: true,
                isVerified: true,
                createdAt: true,
                deletedAt: true,
                organizerProfile: {
                    select: {
                        organizationName: true,
                        isVerified: true,
                    },
                },
                _count: {
                    select: {
                        bookings: true,
                        events: true,
                    },
                },
            },
        });

        // Calculate pagination metadata
        const totalPages = Math.ceil(totalCount / limit);
        const hasNext = page < totalPages;
        const hasPrev = page > 1;

        const [totalUsers, customerCount, organizerCount, adminCount, verifiedCount, unverifiedCount] = await Promise.all([
            prisma.user.count(),
            prisma.user.count({ where: { role: 'CUSTOMER' } }),
            prisma.user.count({ where: { role: 'ORGANIZER' } }),
            prisma.user.count({ where: { role: { in: ['ADMIN', 'SUPER_ADMIN'] } } }),
            prisma.user.count({ where: { isVerified: true } }),
            prisma.user.count({ where: { isVerified: false } }),
        ]);

        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        
        const userGrowthData = await prisma.$queryRaw<Array<{ date: Date; count: bigint }>>`
            SELECT DATE(created_at) as date, COUNT(*)::bigint as count
            FROM "users"
            WHERE created_at >= ${thirtyDaysAgo}
            GROUP BY DATE(created_at)
            ORDER BY date ASC
        `;

        const growthChart = userGrowthData.map(item => ({
            date: item.date.toISOString().split('T')[0],
            count: Number(item.count),
        }));
        
        return successResponse({
            users,
            pagination: {
                page,
                limit,
                total: totalCount,
                totalPages,
                hasNext,
                hasPrev,
            },
            stats: {
                total: totalUsers,
                customers: customerCount,
                organizers: organizerCount,
                admins: adminCount,
            },
            charts: {
                roleDistribution: [
                    { name: 'Customers', value: customerCount },
                    { name: 'Organizers', value: organizerCount },
                    { name: 'Admins', value: adminCount },
                ],
                verificationStatus: [
                    { name: 'Verified', value: verifiedCount },
                    { name: 'Unverified', value: unverifiedCount },
                ],
                userGrowth: growthChart,
            },
        });
    } catch (error) {
        console.error("Error fetching users:", error);
        return errorResponse("Failed to fetch users", 500);
    }
}
