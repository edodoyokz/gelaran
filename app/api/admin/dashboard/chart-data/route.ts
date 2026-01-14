import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import prisma from "@/lib/prisma/client";

interface ChartDataPoint {
    name: string;
    revenue: number;
    bookings: number;
    users: number;
}

interface CategoryDistribution {
    name: string;
    value: number;
    color?: string;
}

export async function GET(request: Request) {
    try {
        const supabase = await createClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
            return NextResponse.json(
                { success: false, error: { message: "Unauthorized" } },
                { status: 401 }
            );
        }

        const adminUser = await prisma.user.findUnique({
            where: { email: user.email! },
        });

        if (!adminUser || !["ADMIN", "SUPER_ADMIN"].includes(adminUser.role)) {
            return NextResponse.json(
                { success: false, error: { message: "Forbidden" } },
                { status: 403 }
            );
        }

        const { searchParams } = new URL(request.url);
        const period = searchParams.get("period") || "30d";

        let startDate: Date;
        const endDate = new Date();

        switch (period) {
            case "7d":
                startDate = new Date(endDate.getTime() - 7 * 24 * 60 * 60 * 1000);
                break;
            case "30d":
                startDate = new Date(endDate.getTime() - 30 * 24 * 60 * 60 * 1000);
                break;
            case "90d":
                startDate = new Date(endDate.getTime() - 90 * 24 * 60 * 60 * 1000);
                break;
            case "1y":
                startDate = new Date(endDate.getTime() - 365 * 24 * 60 * 60 * 1000);
                break;
            default:
                startDate = new Date(endDate.getTime() - 30 * 24 * 60 * 60 * 1000);
        }

        const [revenueData, categoryData, recentActivity] = await Promise.all([
            getRevenueOverTime(startDate, endDate, period),
            getCategoryDistribution(),
            getRecentActivity(),
        ]);

        return NextResponse.json({
            success: true,
            data: {
                revenueChart: revenueData,
                categoryDistribution: categoryData,
                recentActivity,
            },
        });
    } catch (error) {
        console.error("Admin chart data error:", error);
        return NextResponse.json(
            { success: false, error: { message: "Failed to fetch chart data" } },
            { status: 500 }
        );
    }
}

async function getRevenueOverTime(
    startDate: Date,
    endDate: Date,
    period: string
): Promise<ChartDataPoint[]> {
    const transactions = await prisma.transaction.findMany({
        where: {
            status: "SUCCESS",
            createdAt: {
                gte: startDate,
                lte: endDate,
            },
        },
        select: {
            amount: true,
            createdAt: true,
        },
        orderBy: { createdAt: "asc" },
    });

    const bookings = await prisma.booking.findMany({
        where: {
            status: { in: ["CONFIRMED", "PAID"] },
            createdAt: {
                gte: startDate,
                lte: endDate,
            },
        },
        select: {
            createdAt: true,
        },
        orderBy: { createdAt: "asc" },
    });

    const users = await prisma.user.findMany({
        where: {
            createdAt: {
                gte: startDate,
                lte: endDate,
            },
            deletedAt: null,
        },
        select: {
            createdAt: true,
        },
        orderBy: { createdAt: "asc" },
    });

    const groupByFormat = period === "1y" ? "month" : period === "90d" ? "week" : "day";
    
    const dataMap = new Map<string, { revenue: number; bookings: number; users: number }>();

    const formatDate = (date: Date): string => {
        if (groupByFormat === "month") {
            return date.toLocaleDateString("id-ID", { month: "short", year: "2-digit" });
        } else if (groupByFormat === "week") {
            const weekNum = Math.ceil(date.getDate() / 7);
            return `W${weekNum} ${date.toLocaleDateString("id-ID", { month: "short" })}`;
        } else {
            return date.toLocaleDateString("id-ID", { day: "2-digit", month: "short" });
        }
    };

    const current = new Date(startDate);
    while (current <= endDate) {
        const key = formatDate(current);
        if (!dataMap.has(key)) {
            dataMap.set(key, { revenue: 0, bookings: 0, users: 0 });
        }
        if (groupByFormat === "month") {
            current.setMonth(current.getMonth() + 1);
        } else if (groupByFormat === "week") {
            current.setDate(current.getDate() + 7);
        } else {
            current.setDate(current.getDate() + 1);
        }
    }

    transactions.forEach((tx) => {
        const key = formatDate(new Date(tx.createdAt));
        const existing = dataMap.get(key);
        if (existing) {
            existing.revenue += Number(tx.amount);
        }
    });

    bookings.forEach((b) => {
        const key = formatDate(new Date(b.createdAt));
        const existing = dataMap.get(key);
        if (existing) {
            existing.bookings += 1;
        }
    });

    users.forEach((u) => {
        const key = formatDate(new Date(u.createdAt));
        const existing = dataMap.get(key);
        if (existing) {
            existing.users += 1;
        }
    });

    return Array.from(dataMap.entries()).map(([name, data]) => ({
        name,
        ...data,
    }));
}

async function getCategoryDistribution(): Promise<CategoryDistribution[]> {
    const categories = await prisma.category.findMany({
        where: { isActive: true },
        select: {
            name: true,
            _count: {
                select: { events: true },
            },
        },
        orderBy: { events: { _count: "desc" } },
        take: 8,
    });

    const colors = [
        "#6366f1",
        "#8b5cf6",
        "#ec4899",
        "#f43f5e",
        "#f97316",
        "#eab308",
        "#22c55e",
        "#14b8a6",
    ];

    return categories.map((cat, index) => ({
        name: cat.name,
        value: cat._count.events,
        color: colors[index % colors.length],
    }));
}

async function getRecentActivity(): Promise<Array<{
    id: string;
    type: string;
    title: string;
    description: string;
    timestamp: Date;
}>> {
    const [recentBookings, recentUsers, recentEvents] = await Promise.all([
        prisma.booking.findMany({
            take: 3,
            orderBy: { createdAt: "desc" },
            select: {
                id: true,
                bookingCode: true,
                createdAt: true,
                event: { select: { title: true } },
                user: { select: { name: true } },
                guestName: true,
            },
        }),
        prisma.user.findMany({
            take: 3,
            orderBy: { createdAt: "desc" },
            where: { deletedAt: null },
            select: {
                id: true,
                name: true,
                email: true,
                createdAt: true,
                role: true,
            },
        }),
        prisma.event.findMany({
            take: 3,
            orderBy: { createdAt: "desc" },
            where: { deletedAt: null },
            select: {
                id: true,
                title: true,
                createdAt: true,
                status: true,
            },
        }),
    ]);

    const activities: Array<{
        id: string;
        type: string;
        title: string;
        description: string;
        timestamp: Date;
    }> = [];

    recentBookings.forEach((b) => {
        activities.push({
            id: `booking-${b.id}`,
            type: "booking",
            title: `New booking: ${b.bookingCode}`,
            description: `${b.user?.name || b.guestName || "Guest"} booked ${b.event.title}`,
            timestamp: b.createdAt,
        });
    });

    recentUsers.forEach((u) => {
        activities.push({
            id: `user-${u.id}`,
            type: "user",
            title: `New ${u.role.toLowerCase()}`,
            description: `${u.name || u.email} joined the platform`,
            timestamp: u.createdAt,
        });
    });

    recentEvents.forEach((e) => {
        activities.push({
            id: `event-${e.id}`,
            type: "event",
            title: `Event ${e.status === "PUBLISHED" ? "published" : "created"}`,
            description: e.title,
            timestamp: e.createdAt,
        });
    });

    return activities
        .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
        .slice(0, 10);
}
