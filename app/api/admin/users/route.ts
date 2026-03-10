import type { Prisma } from "@prisma/client";
import prisma from "@/lib/prisma/client";
import { successResponse, errorResponse } from "@/lib/api/response";
import { requireAdmin } from "@/lib/auth/route-auth";

const USER_ROLE_VALUES = ["SUPER_ADMIN", "ADMIN", "ORGANIZER", "CUSTOMER", "SCANNER"] as const;

export async function GET(request: Request) {
    try {
        const authResult = await requireAdmin();

        if ("error" in authResult) {
            return errorResponse(authResult.error, authResult.status);
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
        const sortOrder: Prisma.SortOrder =
            url.searchParams.get('sortOrder') === 'asc' ? 'asc' : 'desc';

        // Build where clause dynamically
        const where: Prisma.UserWhereInput = {};
        
        // Role filter
        if (roleFilter && USER_ROLE_VALUES.includes(roleFilter as (typeof USER_ROLE_VALUES)[number])) {
            where.role = roleFilter as (typeof USER_ROLE_VALUES)[number];
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
            where.createdAt = {
                ...(dateFrom ? { gte: dateFrom } : {}),
                ...(dateTo ? { lte: dateTo } : {}),
            };
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
        const orderBy: Prisma.UserOrderByWithRelationInput = {};
        
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

        const genderDistribution = await prisma.customerProfile.groupBy({
            by: ['gender'],
            _count: true,
        });

        const customerProfilesWithAge = await prisma.customerProfile.findMany({
            where: {
                birthDate: { not: null },
            },
            select: {
                birthDate: true,
            },
        });

        const ageGroups = {
            '13-17': 0,
            '18-24': 0,
            '25-34': 0,
            '35-44': 0,
            '45-54': 0,
            '55+': 0,
        };

        const now = new Date();
        customerProfilesWithAge.forEach(profile => {
            if (profile.birthDate) {
                const age = now.getFullYear() - profile.birthDate.getFullYear();
                if (age >= 13 && age <= 17) ageGroups['13-17']++;
                else if (age >= 18 && age <= 24) ageGroups['18-24']++;
                else if (age >= 25 && age <= 34) ageGroups['25-34']++;
                else if (age >= 35 && age <= 44) ageGroups['35-44']++;
                else if (age >= 45 && age <= 54) ageGroups['45-54']++;
                else if (age >= 55) ageGroups['55+']++;
            }
        });

        const cityDistribution = await prisma.customerProfile.groupBy({
            by: ['city'],
            _count: true,
            where: {
                city: { not: null },
            },
            orderBy: {
                _count: {
                    city: 'desc',
                },
            },
            take: 10,
        });

        const activeUsersLast30Days = await prisma.user.count({
            where: {
                lastLoginAt: {
                    gte: thirtyDaysAgo,
                },
            },
        });
        
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
                activeLastMonth: activeUsersLast30Days,
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
                genderDistribution: genderDistribution.map(g => ({
                    name: g.gender || 'Not Specified',
                    value: g._count,
                })),
                ageDistribution: [
                    { name: '13-17', value: ageGroups['13-17'] },
                    { name: '18-24', value: ageGroups['18-24'] },
                    { name: '25-34', value: ageGroups['25-34'] },
                    { name: '35-44', value: ageGroups['35-44'] },
                    { name: '45-54', value: ageGroups['45-54'] },
                    { name: '55+', value: ageGroups['55+'] },
                ],
                topCities: cityDistribution.map(c => ({
                    name: c.city || 'Unknown',
                    value: c._count,
                })),
            },
        });
    } catch (error) {
        console.error("Error fetching users:", error);
        return errorResponse("Failed to fetch users", 500);
    }
}
