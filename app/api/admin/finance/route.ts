import prisma from "@/lib/prisma/client";
import { successResponse, errorResponse } from "@/lib/api/response";
import { createClient } from "@/lib/supabase/server";
import type { Decimal } from "@prisma/client/runtime/library";
import type { BookingStatus } from "@/types/prisma";

interface BookingByStatus {
    status: BookingStatus;
    _count: { id: number };
    _sum: { totalAmount: Decimal | null };
}

interface RecentTransaction {
    id: string;
    bookingCode: string;
    totalAmount: Decimal;
    platformRevenue: Decimal;
    paidAt: Date | null;
    createdAt: Date;
    event: { title: string };
    user: { name: string | null } | null;
}

interface TopEvent {
    id: string;
    title: string;
    posterImage: string | null;
    _count: { bookings: number };
}

function toSafeNumber(value: unknown): number {
    const parsed = Number(value ?? 0);
    return Number.isFinite(parsed) ? parsed : 0;
}

export async function GET(request: Request) {
    try {
        const supabase = await createClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (!user || !user.email) {
            return errorResponse("Unauthorized", 401);
        }

        const url = new URL(request.url);
        const fromParam = url.searchParams.get('from');
        const toParam = url.searchParams.get('to');

        const dateFrom = fromParam ? new Date(fromParam) : new Date(0);
        const dateTo = toParam ? new Date(toParam) : new Date();

        const admin = await prisma.user.findUnique({
            where: { email: user.email },
        });

        if (!admin || !["ADMIN", "SUPER_ADMIN"].includes(admin.role)) {
            return errorResponse("Admin access required", 403);
        }

        const now = new Date();
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
        const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0);

        const [
            totalRevenue,
            thisMonthRevenue,
            lastMonthRevenue,
            pendingPayouts,
            completedPayouts,
            bookingsByStatus,
            recentTransactions,
            topEvents,
            revenueTrendData,
        ] = await Promise.all([
            prisma.booking.aggregate({
                where: { 
                    status: { in: ["CONFIRMED", "PAID"] },
                    OR: [
                        { paidAt: { gte: dateFrom, lte: dateTo } },
                        { 
                            paidAt: null,
                            createdAt: { gte: dateFrom, lte: dateTo }
                        }
                    ]
                },
                _sum: {
                    totalAmount: true,
                    platformRevenue: true,
                    organizerRevenue: true,
                },
                _count: { id: true },
            }),
            prisma.booking.aggregate({
                where: {
                    status: { in: ["CONFIRMED", "PAID"] },
                    OR: [
                        { paidAt: { gte: startOfMonth, lte: now } },
                        { 
                            paidAt: null,
                            createdAt: { gte: startOfMonth, lte: now }
                        }
                    ]
                },
                _sum: { totalAmount: true, platformRevenue: true },
            }),
            prisma.booking.aggregate({
                where: {
                    status: { in: ["CONFIRMED", "PAID"] },
                    OR: [
                        { paidAt: { gte: startOfLastMonth, lte: endOfLastMonth } },
                        { 
                            paidAt: null,
                            createdAt: { gte: startOfLastMonth, lte: endOfLastMonth }
                        }
                    ]
                },
                _sum: { totalAmount: true, platformRevenue: true },
            }),
            prisma.payout.aggregate({
                where: { status: { in: ["REQUESTED", "PROCESSING"] } },
                _sum: { amount: true },
                _count: { id: true },
            }),
            prisma.payout.aggregate({
                where: { status: "COMPLETED" },
                _sum: { amount: true },
                _count: { id: true },
            }),
            prisma.booking.groupBy({
                by: ["status"],
                where: {
                    OR: [
                        { 
                            status: { in: ["CONFIRMED", "PAID"] },
                            paidAt: { gte: dateFrom, lte: dateTo },
                        },
                        {
                            status: { notIn: ["CONFIRMED", "PAID"] },
                            createdAt: { gte: dateFrom, lte: dateTo },
                        }
                    ]
                },
                _count: { id: true },
                _sum: { totalAmount: true },
            }),
            prisma.booking.findMany({
                where: { 
                    status: { in: ["CONFIRMED", "PAID"] },
                    OR: [
                        { paidAt: { gte: dateFrom, lte: dateTo } },
                        { 
                            paidAt: null,
                            createdAt: { gte: dateFrom, lte: dateTo }
                        }
                    ]
                },
                orderBy: [
                    { paidAt: { sort: "desc", nulls: "last" } },
                    { createdAt: "desc" }
                ],
                take: 10,
                select: {
                    id: true,
                    bookingCode: true,
                    totalAmount: true,
                    platformRevenue: true,
                    paidAt: true,
                    createdAt: true,
                    event: {
                        select: { title: true },
                    },
                    user: {
                        select: { name: true },
                    },
                },
            }),
            prisma.event.findMany({
                where: {
                    status: "PUBLISHED",
                    deletedAt: null,
                },
                orderBy: {
                    bookings: { _count: "desc" },
                },
                take: 5,
                select: {
                    id: true,
                    title: true,
                    posterImage: true,
                    _count: {
                        select: { 
                            bookings: { 
                                where: { 
                                    status: { in: ["CONFIRMED", "PAID"] },
                                    paidAt: { gte: dateFrom, lte: dateTo },
                                } 
                            } 
                        },
                    },
                },
            }),
            prisma.$queryRaw<Array<{ date: Date; platformRevenue: number; organizerRevenue: number }>>`
                SELECT 
                    DATE(COALESCE(paid_at, created_at)) as date,
                    SUM(platform_revenue) as "platformRevenue",
                    SUM(organizer_revenue) as "organizerRevenue"
                FROM bookings
                WHERE status IN ('CONFIRMED', 'PAID')
                    AND (
                        (paid_at IS NOT NULL AND paid_at >= ${dateFrom} AND paid_at <= ${dateTo})
                        OR (paid_at IS NULL AND created_at >= ${dateFrom} AND created_at <= ${dateTo})
                    )
                GROUP BY DATE(COALESCE(paid_at, created_at))
                ORDER BY date ASC
            `,
        ]);

        const thisMonthTotal = toSafeNumber(thisMonthRevenue._sum.totalAmount);
        const lastMonthTotal = toSafeNumber(lastMonthRevenue._sum.totalAmount);
        const growthPercent = lastMonthTotal > 0
            ? Math.round(((thisMonthTotal - lastMonthTotal) / lastMonthTotal) * 100)
            : 0;

        return successResponse({
            overview: {
                totalTransactions: toSafeNumber(totalRevenue._sum.totalAmount),
                platformRevenue: toSafeNumber(totalRevenue._sum.platformRevenue),
                organizerRevenue: toSafeNumber(totalRevenue._sum.organizerRevenue),
                totalBookings: totalRevenue._count.id,
            },
            thisMonth: {
                revenue: thisMonthTotal,
                platformRevenue: toSafeNumber(thisMonthRevenue._sum.platformRevenue),
                growthPercent,
            },
            payouts: {
                pending: {
                    count: pendingPayouts._count.id,
                    amount: toSafeNumber(pendingPayouts._sum.amount),
                },
                completed: {
                    count: completedPayouts._count.id,
                    amount: toSafeNumber(completedPayouts._sum.amount),
                },
            },
            bookingsByStatus: bookingsByStatus.map((s: BookingByStatus) => ({
                status: s.status,
                count: s._count.id,
                amount: toSafeNumber(s._sum.totalAmount),
            })),
            recentTransactions: recentTransactions.map((t: RecentTransaction) => ({
                id: t.id,
                bookingCode: t.bookingCode,
                amount: toSafeNumber(t.totalAmount),
                platformRevenue: toSafeNumber(t.platformRevenue),
                paidAt: t.paidAt || t.createdAt,
                eventTitle: t.event.title,
                customerName: t.user?.name || "Guest",
            })),
            topEvents: topEvents.map((e: TopEvent) => ({
                id: e.id,
                title: e.title,
                posterImage: e.posterImage,
                bookingCount: e._count.bookings,
            })),
            revenueTrend: revenueTrendData.map((d) => ({
                date: d.date.toISOString(),
                platformRevenue: toSafeNumber(d.platformRevenue),
                organizerRevenue: toSafeNumber(d.organizerRevenue),
            })),
        });
    } catch (error) {
        console.error("Error fetching finance data:", error);
        return errorResponse("Failed to fetch finance data", 500);
    }
}
