import { type NextRequest } from "next/server";
import prisma from "@/lib/prisma/client";
import { successResponse, errorResponse } from "@/lib/api/response";
import crypto from "crypto";
import { rateLimiters, getClientIdentifier, getRateLimitHeaders } from "@/lib/rate-limit";

function hashPin(pin: string): string {
    return crypto.createHash("sha256").update(pin).digest("hex");
}

function generateDeviceToken(): string {
    return crypto.randomBytes(32).toString("hex");
}

export async function POST(request: NextRequest) {
    try {
        const clientId = getClientIdentifier(request.headers);
        const rateLimit = rateLimiters.accessCredential.check(clientId);

        if (!rateLimit.success) {
            const rateLimitHeaders = getRateLimitHeaders(rateLimit);
            return new Response(JSON.stringify({ error: "Too many access attempts. Please try again later." }), {
                status: 429,
                headers: {
                    "Content-Type": "application/json",
                    ...Object.fromEntries(rateLimitHeaders.entries()),
                },
            });
        }

        const body = await request.json();
        const { eventSlug, pin, staffName, deviceFingerprint } = body;

        if (!eventSlug || !pin || !staffName || !deviceFingerprint) {
            return errorResponse("Kode event, PIN, nama staff, dan device fingerprint diperlukan", 400);
        }

        if (staffName.length < 2 || staffName.length > 100) {
            return errorResponse("Nama kasir harus 2-100 karakter", 400);
        }

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

        // Find POS session for this event with matching PIN
        const session = await prisma.eventDeviceSession.findFirst({
            where: {
                eventId: event.id,
                sessionType: "POS",
                pinHash,
                isActive: true,
            },
            include: {
                devices: {
                    where: { isActive: true },
                },
            },
        });

        if (!session) {
            return errorResponse("PIN tidak valid atau sesi POS Kasir tidak aktif", 401);
        }

        if (session.expiresAt && new Date() > session.expiresAt) {
            return errorResponse("PIN sudah kadaluarsa", 401);
        }

        const existingDevice = session.devices.find(
            (d) => d.deviceFingerprint === deviceFingerprint
        );

        if (existingDevice) {
            await prisma.deviceAccess.update({
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
                message: "Akses POS Kasir berhasil diperbarui",
            });
        }

        if (session.devices.length >= session.deviceLimit) {
            return errorResponse(
                `Batas device POS Kasir tercapai (${session.deviceLimit}). Hubungi organizer untuk menambah batas atau revoke device lain.`,
                403
            );
        }

        const deviceToken = generateDeviceToken();

        await prisma.deviceAccess.create({
            data: {
                sessionId: session.id,
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
            message: "Akses POS Kasir berhasil",
        });
    } catch (error) {
        console.error("POS access error:", error);
        return errorResponse("Gagal mengakses POS Kasir", 500);
    }
}
