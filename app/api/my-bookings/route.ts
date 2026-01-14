import { type NextRequest } from "next/server";
import prisma from "@/lib/prisma/client";
import { successResponse, errorResponse } from "@/lib/api/response";
import { createClient } from "@/lib/supabase/server";
import type { BookingStatus, Prisma } from "@prisma/client";

const VALID_STATUSES: BookingStatus[] = [
    "PENDING", "AWAITING_PAYMENT", "PAID", "CONFIRMED", "CANCELLED", "REFUNDED", "EXPIRED"
];

export async function GET(request: NextRequest) {
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
        const statusParam = searchParams.get("status");
        const page = parseInt(searchParams.get("page") || "1");
        const limit = parseInt(searchParams.get("limit") || "10");
        const skip = (page - 1) * limit;

        const where: Prisma.BookingWhereInput = { userId: dbUser.id };
        if (statusParam && statusParam !== "all") {
            const upperStatus = statusParam.toUpperCase() as BookingStatus;
            if (VALID_STATUSES.includes(upperStatus)) {
                where.status = upperStatus;
            }
        }

        const [bookings, total] = await Promise.all([
            prisma.booking.findMany({
                where,
                orderBy: { createdAt: "desc" },
                skip,
                take: limit,
                include: {
                    event: {
                        select: {
                            id: true,
                            title: true,
                            slug: true,
                            posterImage: true,
                            venue: {
                                select: {
                                    name: true,
                                    city: true,
                                },
                            },
                        },
                    },
                    eventSchedule: {
                        select: {
                            scheduleDate: true,
                            startTime: true,
                            endTime: true,
                        },
                    },
                    bookedTickets: {
                        select: {
                            id: true,
                            uniqueCode: true,
                            status: true,
                            isCheckedIn: true,
                            ticketType: {
                                select: {
                                    name: true,
                                },
                            },
                        },
                    },
                },
            }),
            prisma.booking.count({ where }),
        ]);

        const stats = await prisma.booking.groupBy({
            by: ["status"],
            where: { userId: dbUser.id },
            _count: true,
        });

        const statusCounts = stats.reduce((acc, stat) => {
            acc[stat.status] = stat._count;
            return acc;
        }, {} as Record<string, number>);

        return successResponse({
            bookings,
            pagination: {
                page,
                limit,
                total,
                totalPages: Math.ceil(total / limit),
            },
            stats: {
                total,
                confirmed: statusCounts["CONFIRMED"] || 0,
                pending: (statusCounts["PENDING"] || 0) + (statusCounts["AWAITING_PAYMENT"] || 0),
                cancelled: statusCounts["CANCELLED"] || 0,
                completed: statusCounts["PAID"] || 0,
            },
        });
    } catch (error) {
        console.error("Error fetching user bookings:", error);
        return errorResponse("Failed to fetch bookings", 500);
    }
}
