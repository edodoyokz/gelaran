import prisma from "@/lib/prisma/client";
import { successResponse, errorResponse } from "@/lib/api/response";
import { requireAdminContext } from "@/lib/auth/route-auth";

function toSafeNumber(value: unknown): number {
    const parsed = Number(value ?? 0);
    return Number.isFinite(parsed) ? parsed : 0;
}

export async function GET() {
    try {
        const authContext = await requireAdminContext();

        if ("error" in authContext) {
            return errorResponse(authContext.error, authContext.status);
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
                    total: toSafeNumber(totalRevenue._sum.totalAmount),
                    platform: toSafeNumber(totalRevenue._sum.platformRevenue),
                    organizer: toSafeNumber(totalRevenue._sum.organizerRevenue),
                },
            },
        });
    } catch (error) {
        console.error("Error fetching bookings:", error);
        return errorResponse("Failed to fetch bookings", 500);
    }
}
