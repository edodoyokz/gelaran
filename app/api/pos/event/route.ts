import { type NextRequest } from "next/server";
import prisma from "@/lib/prisma/client";
import { successResponse, errorResponse } from "@/lib/api/response";

export async function GET(request: NextRequest) {
    try {
        const deviceToken = request.headers.get("x-device-token");

        if (!deviceToken) {
            return errorResponse("Device token diperlukan", 401);
        }

        const deviceAccess = await prisma.deviceAccess.findUnique({
            where: { deviceToken },
            include: {
                session: {
                    include: {
                        event: {
                            include: {
                                ticketTypes: {
                                    where: { isActive: true },
                                    orderBy: { sortOrder: "asc" },
                                },
                                schedules: {
                                    orderBy: { scheduleDate: "asc" },
                                    take: 1,
                                },
                                venue: {
                                    select: {
                                        name: true,
                                        city: true,
                                    },
                                },
                            },
                        },
                    },
                },
            },
        });

        if (!deviceAccess || !deviceAccess.isActive) {
            return errorResponse("Akses tidak valid", 401);
        }

        if (deviceAccess.session.sessionType !== "POS") {
            return errorResponse("Device ini bukan untuk POS. Gunakan /gate untuk scan tiket.", 403);
        }

        if (!deviceAccess.session.isActive) {
            return errorResponse("Session POS tidak aktif. Hubungi organizer.", 403);
        }

        await prisma.deviceAccess.update({
            where: { id: deviceAccess.id },
            data: { lastActiveAt: new Date() },
        });

        const event = deviceAccess.session.event;

        const [totalSold, onSiteSales, todaySales] = await Promise.all([
            prisma.bookedTicket.count({
                where: {
                    booking: {
                        eventId: event.id,
                        status: { in: ["CONFIRMED", "PAID"] },
                    },
                },
            }),
            prisma.booking.count({
                where: {
                    eventId: event.id,
                    salesChannel: "ON_SITE",
                    status: { in: ["CONFIRMED", "PAID"] },
                },
            }),
            prisma.booking.count({
                where: {
                    eventId: event.id,
                    salesChannel: "ON_SITE",
                    status: { in: ["CONFIRMED", "PAID"] },
                    createdAt: {
                        gte: new Date(new Date().setHours(0, 0, 0, 0)),
                    },
                },
            }),
        ]);

        return successResponse({
            staffName: deviceAccess.staffName,
            event: {
                id: event.id,
                title: event.title,
                posterImage: event.posterImage,
                status: event.status,
                hasSeatingChart: event.hasSeatingChart,
                slug: event.slug,
                venue: event.venue,
                schedule: event.schedules[0] || null,
                ticketTypes: event.ticketTypes.map((tt) => ({
                    id: tt.id,
                    name: tt.name,
                    description: tt.description,
                    basePrice: Number(tt.basePrice),
                    availableQuantity: tt.totalQuantity - tt.soldQuantity - tt.reservedQuantity,
                    maxPerOrder: tt.maxPerOrder,
                    isFree: tt.isFree,
                })),
            },
            stats: {
                totalSold,
                onSiteSales,
                todaySales,
            },
        });
    } catch (error) {
        console.error("Get POS event error:", error);
        return errorResponse("Gagal mengambil data event", 500);
    }
}
