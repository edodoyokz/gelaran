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

        const bookings = await prisma.booking.findMany({
            orderBy: { createdAt: "desc" },
            take: 100,
            include: {
                user: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                    },
                },
                event: {
                    select: {
                        id: true,
                        title: true,
                        slug: true,
                        posterImage: true,
                        organizer: {
                            select: {
                                name: true,
                                organizerProfile: {
                                    select: { organizationName: true },
                                },
                            },
                        },
                    },
                },
                bookedTickets: {
                    include: {
                        ticketType: {
                            select: { name: true },
                        },
                    },
                },
            },
        });

        const stats = await prisma.booking.groupBy({
            by: ["status"],
            _count: { id: true },
            _sum: { totalAmount: true },
        });

        const totalRevenue = await prisma.booking.aggregate({
            where: { status: { in: ["CONFIRMED", "PAID"] } },
            _sum: {
                totalAmount: true,
                platformRevenue: true,
                organizerRevenue: true,
            },
        });

        return successResponse({
            bookings,
            stats: {
                byStatus: stats,
                totalRevenue: {
                    total: Number(totalRevenue._sum.totalAmount || 0),
                    platform: Number(totalRevenue._sum.platformRevenue || 0),
                    organizer: Number(totalRevenue._sum.organizerRevenue || 0),
                },
            },
        });
    } catch (error) {
        console.error("Error fetching bookings:", error);
        return errorResponse("Failed to fetch bookings", 500);
    }
}
