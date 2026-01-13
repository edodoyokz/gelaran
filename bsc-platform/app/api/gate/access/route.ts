import { type NextRequest } from "next/server";
import prisma from "@/lib/prisma/client";
import { successResponse, errorResponse } from "@/lib/api/response";
import crypto from "crypto";

function hashPin(pin: string): string {
    return crypto.createHash("sha256").update(pin).digest("hex");
}

function generateDeviceToken(): string {
    return crypto.randomBytes(32).toString("hex");
}

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { eventSlug, pin, staffName, deviceFingerprint } = body;

        if (!eventSlug || !pin || !staffName || !deviceFingerprint) {
            return errorResponse("Kode event, PIN, nama staff, dan device fingerprint diperlukan", 400);
        }

        if (staffName.length < 2 || staffName.length > 100) {
            return errorResponse("Nama staff harus 2-100 karakter", 400);
        }

        // First, find the event by slug
        const event = await prisma.event.findUnique({
            where: { slug: eventSlug.toLowerCase().trim() },
            select: {
                id: true,
                title: true,
                posterImage: true,
                status: true,
                slug: true,
            },
        });

        if (!event) {
            return errorResponse("Event tidak ditemukan. Periksa kode event.", 404);
        }

        const pinHash = hashPin(pin.replace(/[^0-9]/g, ""));

        // Find gate session for THIS specific event with matching PIN
        const gateSession = await prisma.eventGateSession.findFirst({
            where: {
                eventId: event.id,
                pinHash,
                isActive: true,
            },
            include: {
                devices: {
                    where: { isActive: true },
                },
            },
        });

        if (!gateSession) {
            return errorResponse("PIN tidak valid untuk event ini", 401);
        }

        if (gateSession.expiresAt && new Date() > gateSession.expiresAt) {
            return errorResponse("PIN sudah kadaluarsa", 401);
        }

        const existingDevice = gateSession.devices.find(
            (d) => d.deviceFingerprint === deviceFingerprint
        );

        if (existingDevice) {
            await prisma.gateDeviceAccess.update({
                where: { id: existingDevice.id },
                data: {
                    staffName,
                    lastActiveAt: new Date(),
                    userAgent: request.headers.get("user-agent") || undefined,
                    ipAddress: request.headers.get("x-forwarded-for") || undefined,
                },
            });

            return successResponse({
                deviceToken: existingDevice.deviceToken,
                event,
                staffName,
                message: "Akses berhasil diperbarui",
            });
        }

        if (gateSession.devices.length >= gateSession.deviceLimit) {
            return errorResponse(
                `Batas device tercapai (${gateSession.deviceLimit}). Hubungi organizer untuk menambah batas atau revoke device lain.`,
                403
            );
        }

        const deviceToken = generateDeviceToken();

        await prisma.gateDeviceAccess.create({
            data: {
                gateSessionId: gateSession.id,
                deviceToken,
                deviceFingerprint,
                staffName,
                userAgent: request.headers.get("user-agent") || undefined,
                ipAddress: request.headers.get("x-forwarded-for") || undefined,
            },
        });

        return successResponse({
            deviceToken,
            event,
            staffName,
            message: "Akses gate berhasil",
        });
    } catch (error) {
        console.error("Gate access error:", error);
        return errorResponse("Gagal mengakses gate", 500);
    }
}
