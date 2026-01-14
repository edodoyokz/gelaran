import { type NextRequest } from "next/server";
import prisma from "@/lib/prisma/client";
import { successResponse, errorResponse } from "@/lib/api/response";
import { createClient } from "@/lib/supabase/server";
import { z } from "zod";
import type { User } from "@/types/prisma";
import { resend, FROM_EMAIL } from "@/lib/email/client";

type AdminResult = { admin: User } | { error: string; status: number };

interface PublishedEventData {
    id: string;
    title: string;
    slug: string;
    shortDescription: string | null;
    posterImage: string | null;
    organizer: {
        id: string;
        name: string;
        organizerProfile: {
            id: string;
            organizationName: string | null;
        } | null;
    };
    schedules: Array<{
        scheduleDate: Date;
    }>;
}

async function notifyFollowers(event: PublishedEventData): Promise<void> {
    const organizerProfile = event.organizer.organizerProfile;
    if (!organizerProfile) return;

    const followers = await prisma.organizerFollower.findMany({
        where: {
            organizerProfileId: organizerProfile.id,
            notifyNewEvents: true,
        },
        select: { userId: true },
    });

    if (followers.length === 0) return;

    const users = await prisma.user.findMany({
        where: { id: { in: followers.map((f) => f.userId) } },
        select: { email: true, name: true },
    });

    const organizerName = organizerProfile.organizationName || event.organizer.name;
    const eventDate = event.schedules[0]
        ? new Date(event.schedules[0].scheduleDate).toLocaleDateString("id-ID", {
              weekday: "long",
              day: "numeric",
              month: "long",
              year: "numeric",
          })
        : "Segera";

    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://bsc.id";
    const eventUrl = `${baseUrl}/events/${event.slug}`;

    const emailPromises = users.map((user) =>
        resend.emails.send({
            from: FROM_EMAIL,
            to: user.email,
            subject: `Event Baru dari ${organizerName}: ${event.title}`,
            html: `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
  <div style="background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%); padding: 32px; border-radius: 16px 16px 0 0; text-align: center;">
    <h1 style="color: white; margin: 0; font-size: 24px;">Event Baru!</h1>
  </div>
  <div style="background: #f8fafc; padding: 32px; border-radius: 0 0 16px 16px; border: 1px solid #e2e8f0; border-top: none;">
    <p style="font-size: 16px; margin-bottom: 16px;">Halo ${user.name || ""},</p>
    <p><strong>${organizerName}</strong> yang kamu ikuti baru saja mempublikasikan event baru:</p>
    
    <div style="background: white; padding: 20px; border-radius: 12px; margin: 20px 0; border: 1px solid #e2e8f0;">
      ${event.posterImage ? `<img src="${event.posterImage}" alt="${event.title}" style="width: 100%; border-radius: 8px; margin-bottom: 16px;">` : ""}
      <h2 style="margin: 0 0 8px 0; color: #1e293b; font-size: 20px;">${event.title}</h2>
      <p style="color: #64748b; margin: 0 0 12px 0; font-size: 14px;">${eventDate}</p>
      ${event.shortDescription ? `<p style="color: #475569; margin: 0; font-size: 14px;">${event.shortDescription}</p>` : ""}
    </div>
    
    <a href="${eventUrl}" style="display: inline-block; background: #6366f1; color: white; padding: 14px 28px; border-radius: 8px; text-decoration: none; font-weight: 600; margin-top: 16px;">Lihat Event</a>
    
    <p style="color: #94a3b8; font-size: 12px; margin-top: 32px;">
      Kamu menerima email ini karena kamu mengikuti ${organizerName}.<br>
      <a href="${baseUrl}/following" style="color: #6366f1;">Kelola preferensi notifikasi</a>
    </p>
  </div>
</body>
</html>
            `,
        })
    );

    await Promise.allSettled(emailPromises);
}

async function verifyAdmin(): Promise<AdminResult> {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user || !user.email) {
        return { error: "Unauthorized", status: 401 };
    }

    const admin = await prisma.user.findUnique({
        where: { email: user.email },
    });

    if (!admin || !["ADMIN", "SUPER_ADMIN"].includes(admin.role)) {
        return { error: "Admin access required", status: 403 };
    }

    return { admin };
}

const updateEventSchema = z.object({
    status: z.enum(["PUBLISHED", "CANCELLED", "DRAFT", "PENDING_REVIEW"]).optional(),
    rejectionReason: z.string().optional(),
    title: z.string().min(1).max(200).optional(),
    shortDescription: z.string().max(200).nullable().optional(),
    description: z.string().nullable().optional(),
    categoryId: z.string().uuid().optional(),
    venueId: z.string().uuid().nullable().optional(),
    eventType: z.enum(["OFFLINE", "ONLINE", "HYBRID"]).optional(),
    visibility: z.enum(["PUBLIC", "PRIVATE", "PASSWORD_PROTECTED"]).optional(),
    accessPassword: z.string().nullable().optional(),
    posterImage: z.string().nullable().optional(),
    bannerImage: z.string().nullable().optional(),
    trailerVideoUrl: z.string().nullable().optional(),
    onlineMeetingUrl: z.string().nullable().optional(),
    onlineMeetingPassword: z.string().nullable().optional(),
    minTicketsPerOrder: z.number().int().min(1).optional(),
    maxTicketsPerOrder: z.number().int().min(1).optional(),
    termsAndConditions: z.string().nullable().optional(),
    refundPolicy: z.string().nullable().optional(),
    isFeatured: z.boolean().optional(),
});

export async function PUT(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const authResult = await verifyAdmin();

        if ("error" in authResult) {
            return errorResponse(authResult.error, authResult.status);
        }

        const event = await prisma.event.findUnique({
            where: { id },
        });

        if (!event) {
            return errorResponse("Event not found", 404);
        }

        const body = await request.json();
        const parsed = updateEventSchema.safeParse(body);

        if (!parsed.success) {
            return errorResponse("Validation error", 400, {
                errors: parsed.error.flatten().fieldErrors,
            });
        }

        const data = parsed.data;
        const updateData: Record<string, unknown> = {};

        if (data.status !== undefined) {
            updateData.status = data.status;
            if (data.status === "PUBLISHED" && event.status !== "PUBLISHED") {
                updateData.publishedAt = new Date();
            }
            if (data.status === "CANCELLED" && data.rejectionReason) {
                updateData.rejectionReason = data.rejectionReason;
            }
        }

        if (data.title !== undefined) updateData.title = data.title;
        if (data.shortDescription !== undefined) updateData.shortDescription = data.shortDescription;
        if (data.description !== undefined) updateData.description = data.description;
        if (data.categoryId !== undefined) updateData.categoryId = data.categoryId;
        if (data.venueId !== undefined) updateData.venueId = data.venueId;
        if (data.eventType !== undefined) updateData.eventType = data.eventType;
        if (data.visibility !== undefined) updateData.visibility = data.visibility;
        if (data.accessPassword !== undefined) updateData.accessPassword = data.accessPassword;
        if (data.posterImage !== undefined) updateData.posterImage = data.posterImage;
        if (data.bannerImage !== undefined) updateData.bannerImage = data.bannerImage;
        if (data.trailerVideoUrl !== undefined) updateData.trailerVideoUrl = data.trailerVideoUrl;
        if (data.onlineMeetingUrl !== undefined) updateData.onlineMeetingUrl = data.onlineMeetingUrl;
        if (data.onlineMeetingPassword !== undefined) updateData.onlineMeetingPassword = data.onlineMeetingPassword;
        if (data.minTicketsPerOrder !== undefined) updateData.minTicketsPerOrder = data.minTicketsPerOrder;
        if (data.maxTicketsPerOrder !== undefined) updateData.maxTicketsPerOrder = data.maxTicketsPerOrder;
        if (data.termsAndConditions !== undefined) updateData.termsAndConditions = data.termsAndConditions;
        if (data.refundPolicy !== undefined) updateData.refundPolicy = data.refundPolicy;
        if (data.isFeatured !== undefined) updateData.isFeatured = data.isFeatured;

        const updatedEvent = await prisma.event.update({
            where: { id },
            data: updateData,
            include: {
                category: true,
                venue: true,
                organizer: {
                    select: {
                        id: true,
                        name: true,
                        organizerProfile: {
                            select: { id: true, organizationName: true },
                        },
                    },
                },
                schedules: {
                    take: 1,
                    orderBy: { scheduleDate: "asc" },
                },
            },
        });

        if (
            data.status === "PUBLISHED" &&
            event.status !== "PUBLISHED" &&
            updatedEvent.organizer.organizerProfile
        ) {
            notifyFollowers(updatedEvent).catch((err: Error) =>
                console.error("Failed to notify followers:", err)
            );
        }

        return successResponse(updatedEvent);
    } catch (error) {
        console.error("Error updating event:", error);
        return errorResponse("Failed to update event", 500);
    }
}

export async function DELETE(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const authResult = await verifyAdmin();

        if ("error" in authResult) {
            return errorResponse(authResult.error, authResult.status);
        }

        const event = await prisma.event.findUnique({
            where: { id },
            include: {
                _count: {
                    select: {
                        bookings: {
                            where: { status: { in: ["CONFIRMED", "PAID"] } },
                        },
                    },
                },
            },
        });

        if (!event) {
            return errorResponse("Event not found", 404);
        }

        if (event._count.bookings > 0) {
            return errorResponse(
                `Cannot delete event with ${event._count.bookings} confirmed booking(s). Cancel the event instead.`,
                400
            );
        }

        await prisma.event.update({
            where: { id },
            data: { deletedAt: new Date() },
        });

        return successResponse({ message: "Event deleted successfully" });
    } catch (error) {
        console.error("Error deleting event:", error);
        return errorResponse("Failed to delete event", 500);
    }
}

interface BookingRevenue {
    totalAmount: unknown;
    organizerRevenue: unknown;
    platformRevenue: unknown;
}

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const authResult = await verifyAdmin();

        if ("error" in authResult) {
            return errorResponse(authResult.error, authResult.status);
        }

        const event = await prisma.event.findUnique({
            where: { id },
            include: {
                organizer: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                        organizerProfile: true,
                    },
                },
                category: true,
                venue: true,
                schedules: { orderBy: { sortOrder: "asc" } },
                ticketTypes: { orderBy: { sortOrder: "asc" } },
                promoCodes: { orderBy: { createdAt: "desc" } },
                bookings: {
                    where: {
                        status: { in: ["CONFIRMED", "PAID"] },
                    },
                    select: {
                        totalAmount: true,
                        organizerRevenue: true,
                        platformRevenue: true,
                    },
                },
                _count: {
                    select: {
                        bookings: true,
                        reviews: true,
                    },
                },
            },
        });

        if (!event) {
            return errorResponse("Event not found", 404);
        }

        const bookingsData = event.bookings as BookingRevenue[];
        const totalRevenue = bookingsData.reduce(
            (sum: number, b: BookingRevenue) => sum + Number(b.totalAmount || 0),
            0
        );
        const organizerRevenue = bookingsData.reduce(
            (sum: number, b: BookingRevenue) => sum + Number(b.organizerRevenue || 0),
            0
        );
        const platformRevenue = bookingsData.reduce(
            (sum: number, b: BookingRevenue) => sum + Number(b.platformRevenue || 0),
            0
        );

        const { bookings: _bookings, ...eventData } = event;
        const responseData = {
            ...eventData,
            revenue: {
                total: totalRevenue,
                organizer: organizerRevenue,
                platform: platformRevenue,
            },
        };

        return successResponse(responseData);
    } catch (error) {
        console.error("Error fetching event:", error);
        return errorResponse("Failed to fetch event", 500);
    }
}
