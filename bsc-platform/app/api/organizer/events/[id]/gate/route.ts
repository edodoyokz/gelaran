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
                deviceSessions: {
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

        // Separate sessions by type
        const gateSession = event.deviceSessions.find(s => s.sessionType === "GATE");
        const posSession = event.deviceSessions.find(s => s.sessionType === "POS");

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
            gateSession: gateSession
                ? {
                      id: gateSession.id,
                      sessionType: gateSession.sessionType,
                      deviceLimit: gateSession.deviceLimit,
                      isActive: gateSession.isActive,
                      activeDevices: gateSession.devices.map((d) => ({
                          id: d.id,
                          staffName: d.staffName,
                          lastActiveAt: d.lastActiveAt,
                          userAgent: d.userAgent,
                      })),
                      createdAt: gateSession.createdAt,
                  }
                : null,
            posSession: posSession
                ? {
                      id: posSession.id,
                      sessionType: posSession.sessionType,
                      deviceLimit: posSession.deviceLimit,
                      isActive: posSession.isActive,
                      activeDevices: posSession.devices.map((d) => ({
                          id: d.id,
                          staffName: d.staffName,
                          lastActiveAt: d.lastActiveAt,
                          userAgent: d.userAgent,
                      })),
                      createdAt: posSession.createdAt,
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
        console.error("Get device session error:", error);
        return errorResponse("Failed to get device session", 500);
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
        const { sessionType = "GATE", deviceLimit = 5 } = body;

        if (!["GATE", "POS"].includes(sessionType)) {
            return errorResponse("Invalid session type", 400);
        }

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

        const session = await prisma.eventDeviceSession.upsert({
            where: { eventId_sessionType: { eventId, sessionType } },
            update: {
                pinHash,
                deviceLimit: Math.max(1, Math.min(20, deviceLimit)),
                isActive: true,
                updatedAt: new Date(),
            },
            create: {
                eventId,
                sessionType,
                pinHash,
                deviceLimit: Math.max(1, Math.min(20, deviceLimit)),
                createdBy: dbUser.id,
            },
        });

        // Revoke all devices for this session
        await prisma.deviceAccess.deleteMany({
            where: { sessionId: session.id },
        });

        const sessionLabel = sessionType === "GATE" ? "Gate Scanner" : "POS Kasir";

        return successResponse({
            pin,
            sessionType,
            eventSlug: event.slug,
            deviceLimit: session.deviceLimit,
            message: `PIN ${sessionLabel} berhasil dibuat. Berikan kode event dan PIN ke staff.`,
        });
    } catch (error) {
        console.error("Create device session error:", error);
        return errorResponse("Failed to create device session", 500);
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
        const { searchParams } = new URL(request.url);
        const sessionTypeParam = searchParams.get("sessionType");
        
        if (!sessionTypeParam || !["GATE", "POS"].includes(sessionTypeParam)) {
            return errorResponse("Invalid session type", 400);
        }

        const revokeSessionType: "GATE" | "POS" = sessionTypeParam as "GATE" | "POS";

        const dbUser = await prisma.user.findUnique({
            where: { email: user.email! },
        });

        if (!dbUser || !["ORGANIZER", "ADMIN", "SUPER_ADMIN"].includes(dbUser.role)) {
            return errorResponse("Forbidden", 403);
        }

        const event = await prisma.event.findUnique({
            where: { id: eventId },
            include: {
                deviceSessions: {
                    where: { sessionType: revokeSessionType },
                },
            },
        });

        if (!event) {
            return errorResponse("Event not found", 404);
        }

        if (dbUser.role === "ORGANIZER" && event.organizerId !== dbUser.id) {
            return errorResponse("Forbidden", 403);
        }

        const session = event.deviceSessions[0];

        if (session) {
            await prisma.deviceAccess.deleteMany({
                where: { sessionId: session.id },
            });

            await prisma.eventDeviceSession.update({
                where: { id: session.id },
                data: { isActive: false },
            });
        }

        const sessionLabel = revokeSessionType === "GATE" ? "Gate Scanner" : "POS Kasir";

        return successResponse({ message: `Akses ${sessionLabel} telah di-revoke` });
    } catch (error) {
        console.error("Revoke device session error:", error);
        return errorResponse("Failed to revoke device session", 500);
    }
}
