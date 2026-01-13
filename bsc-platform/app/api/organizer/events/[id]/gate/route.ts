import { type NextRequest } from "next/server";
import prisma from "@/lib/prisma/client";
import { successResponse, errorResponse } from "@/lib/api/response";
import { createClient } from "@/lib/supabase/server";
import crypto from "crypto";

function generatePin(): string {
    return Math.floor(10000000 + Math.random() * 90000000).toString();
}

function hashPin(pin: string): string {
    return crypto.createHash("sha256").update(pin).digest("hex");
}

interface RouteContext {
    params: Promise<{ id: string }>;
}

export async function GET(request: NextRequest, context: RouteContext) {
    try {
        const supabase = await createClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
            return errorResponse("Unauthorized", 401);
        }

        const { id: eventId } = await context.params;

        const dbUser = await prisma.user.findUnique({
            where: { email: user.email! },
        });

        if (!dbUser || !["ORGANIZER", "ADMIN", "SUPER_ADMIN"].includes(dbUser.role)) {
            return errorResponse("Forbidden", 403);
        }

        const event = await prisma.event.findUnique({
            where: { id: eventId },
            include: {
                gateSession: {
                    include: {
                        devices: {
                            where: { isActive: true },
                            orderBy: { lastActiveAt: "desc" },
                        },
                    },
                },
                ticketTypes: {
                    where: { isActive: true },
                    select: {
                        id: true,
                        name: true,
                        basePrice: true,
                        totalQuantity: true,
                        soldQuantity: true,
                        isFree: true,
                    },
                },
                schedules: {
                    orderBy: { scheduleDate: "asc" },
                    take: 1,
                },
            },
        });

        if (!event) {
            return errorResponse("Event not found", 404);
        }

        if (dbUser.role === "ORGANIZER" && event.organizerId !== dbUser.id) {
            return errorResponse("Forbidden", 403);
        }

        const [totalSold, checkedIn, onSiteSales] = await Promise.all([
            prisma.bookedTicket.count({
                where: {
                    booking: {
                        eventId,
                        status: { in: ["CONFIRMED", "PAID"] },
                    },
                },
            }),
            prisma.bookedTicket.count({
                where: {
                    booking: {
                        eventId,
                        status: { in: ["CONFIRMED", "PAID"] },
                    },
                    isCheckedIn: true,
                },
            }),
            prisma.booking.count({
                where: {
                    eventId,
                    salesChannel: "ON_SITE",
                    status: { in: ["CONFIRMED", "PAID"] },
                },
            }),
        ]);

        return successResponse({
            event: {
                id: event.id,
                title: event.title,
                posterImage: event.posterImage,
                schedules: event.schedules,
                ticketTypes: event.ticketTypes.map((tt) => ({
                    ...tt,
                    basePrice: Number(tt.basePrice),
                    availableQuantity: tt.totalQuantity - tt.soldQuantity,
                })),
            },
            gateSession: event.gateSession
                ? {
                      id: event.gateSession.id,
                      deviceLimit: event.gateSession.deviceLimit,
                      isActive: event.gateSession.isActive,
                      activeDevices: event.gateSession.devices.map((d) => ({
                          id: d.id,
                          staffName: d.staffName,
                          lastActiveAt: d.lastActiveAt,
                          userAgent: d.userAgent,
                      })),
                      createdAt: event.gateSession.createdAt,
                  }
                : null,
            stats: {
                totalSold,
                checkedIn,
                remaining: totalSold - checkedIn,
                onSiteSales,
                checkInPercentage: totalSold > 0 ? Math.round((checkedIn / totalSold) * 100) : 0,
            },
        });
    } catch (error) {
        console.error("Get gate session error:", error);
        return errorResponse("Failed to get gate session", 500);
    }
}

export async function POST(request: NextRequest, context: RouteContext) {
    try {
        const supabase = await createClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
            return errorResponse("Unauthorized", 401);
        }

        const { id: eventId } = await context.params;
        const body = await request.json();
        const { deviceLimit = 5 } = body;

        const dbUser = await prisma.user.findUnique({
            where: { email: user.email! },
        });

        if (!dbUser || !["ORGANIZER", "ADMIN", "SUPER_ADMIN"].includes(dbUser.role)) {
            return errorResponse("Forbidden", 403);
        }

        const event = await prisma.event.findUnique({
            where: { id: eventId },
            select: {
                id: true,
                slug: true,
                organizerId: true,
            },
        });

        if (!event) {
            return errorResponse("Event not found", 404);
        }

        if (dbUser.role === "ORGANIZER" && event.organizerId !== dbUser.id) {
            return errorResponse("Forbidden", 403);
        }

        const pin = generatePin();
        const pinHash = hashPin(pin);

        const gateSession = await prisma.eventGateSession.upsert({
            where: { eventId },
            update: {
                pinHash,
                deviceLimit: Math.max(1, Math.min(50, deviceLimit)),
                isActive: true,
                updatedAt: new Date(),
            },
            create: {
                eventId,
                pinHash,
                deviceLimit: Math.max(1, Math.min(50, deviceLimit)),
                createdBy: dbUser.id,
            },
        });

        await prisma.gateDeviceAccess.deleteMany({
            where: { gateSessionId: gateSession.id },
        });

        return successResponse({
            pin,
            eventSlug: event.slug,
            deviceLimit: gateSession.deviceLimit,
            message: "PIN berhasil dibuat. Berikan kode event dan PIN ke staff.",
        });
    } catch (error) {
        console.error("Create gate session error:", error);
        return errorResponse("Failed to create gate session", 500);
    }
}

export async function DELETE(request: NextRequest, context: RouteContext) {
    try {
        const supabase = await createClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
            return errorResponse("Unauthorized", 401);
        }

        const { id: eventId } = await context.params;

        const dbUser = await prisma.user.findUnique({
            where: { email: user.email! },
        });

        if (!dbUser || !["ORGANIZER", "ADMIN", "SUPER_ADMIN"].includes(dbUser.role)) {
            return errorResponse("Forbidden", 403);
        }

        const event = await prisma.event.findUnique({
            where: { id: eventId },
            include: { gateSession: true },
        });

        if (!event) {
            return errorResponse("Event not found", 404);
        }

        if (dbUser.role === "ORGANIZER" && event.organizerId !== dbUser.id) {
            return errorResponse("Forbidden", 403);
        }

        if (event.gateSession) {
            await prisma.gateDeviceAccess.deleteMany({
                where: { gateSessionId: event.gateSession.id },
            });

            await prisma.eventGateSession.update({
                where: { id: event.gateSession.id },
                data: { isActive: false },
            });
        }

        return successResponse({ message: "Semua akses gate telah di-revoke" });
    } catch (error) {
        console.error("Revoke gate session error:", error);
        return errorResponse("Failed to revoke gate session", 500);
    }
}
