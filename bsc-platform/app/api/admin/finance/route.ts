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
        ] = await Promise.all([
            prisma.booking.aggregate({
                where: { status: { in: ["CONFIRMED", "PAID"] } },
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
                    paidAt: { gte: startOfMonth },
                },
                _sum: { totalAmount: true, platformRevenue: true },
            }),
            prisma.booking.aggregate({
                where: {
                    status: { in: ["CONFIRMED", "PAID"] },
                    paidAt: { gte: startOfLastMonth, lte: endOfLastMonth },
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
                _count: { id: true },
                _sum: { totalAmount: true },
            }),
            prisma.booking.findMany({
                where: { status: { in: ["CONFIRMED", "PAID"] } },
                orderBy: { paidAt: "desc" },
                take: 10,
                select: {
                    id: true,
                    bookingCode: true,
                    totalAmount: true,
                    platformRevenue: true,
                    paidAt: true,
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
                        select: { bookings: { where: { status: { in: ["CONFIRMED", "PAID"] } } } },
                    },
                },
            }),
        ]);

        const thisMonthTotal = Number(thisMonthRevenue._sum.totalAmount || 0);
        const lastMonthTotal = Number(lastMonthRevenue._sum.totalAmount || 0);
        const growthPercent = lastMonthTotal > 0
            ? Math.round(((thisMonthTotal - lastMonthTotal) / lastMonthTotal) * 100)
            : 0;

        return successResponse({
            overview: {
                totalRevenue: Number(totalRevenue._sum.totalAmount || 0),
                platformRevenue: Number(totalRevenue._sum.platformRevenue || 0),
                organizerRevenue: Number(totalRevenue._sum.organizerRevenue || 0),
                totalBookings: totalRevenue._count.id,
            },
            thisMonth: {
                revenue: thisMonthTotal,
                platformRevenue: Number(thisMonthRevenue._sum.platformRevenue || 0),
                growthPercent,
            },
            payouts: {
                pending: {
                    count: pendingPayouts._count.id,
                    amount: Number(pendingPayouts._sum.amount || 0),
                },
                completed: {
                    count: completedPayouts._count.id,
                    amount: Number(completedPayouts._sum.amount || 0),
                },
            },
            bookingsByStatus: bookingsByStatus.map((s) => ({
                status: s.status,
                count: s._count.id,
                amount: Number(s._sum.totalAmount || 0),
            })),
            recentTransactions: recentTransactions.map((t) => ({
                id: t.id,
                bookingCode: t.bookingCode,
                amount: Number(t.totalAmount),
                platformRevenue: Number(t.platformRevenue),
                paidAt: t.paidAt,
                eventTitle: t.event.title,
                customerName: t.user?.name || "Guest",
            })),
            topEvents: topEvents.map((e) => ({
                id: e.id,
                title: e.title,
                posterImage: e.posterImage,
                bookingCount: e._count.bookings,
            })),
        });
    } catch (error) {
        console.error("Error fetching finance data:", error);
        return errorResponse("Failed to fetch finance data", 500);
    }
}
