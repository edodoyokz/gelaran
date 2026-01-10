import { type NextRequest } from "next/server";
import prisma from "@/lib/prisma/client";
import { successResponse, errorResponse } from "@/lib/api/response";
import { createClient } from "@/lib/supabase/server";
import { z } from "zod";
import type { User } from "@prisma/client";

type AdminResult = { admin: User } | { error: string; status: number };

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

const updateStatusSchema = z.object({
    status: z.enum(["PUBLISHED", "CANCELLED", "DRAFT"]),
    rejectionReason: z.string().optional(),
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
        const parsed = updateStatusSchema.safeParse(body);

        if (!parsed.success) {
            return errorResponse("Validation error", 400, {
                errors: parsed.error.flatten().fieldErrors,
            });
        }

        const { status, rejectionReason } = parsed.data;

        const updateData: Record<string, unknown> = {
            status,
            reviewedBy: authResult.admin.id,
            reviewedAt: new Date(),
        };

        if (status === "PUBLISHED") {
            updateData.publishedAt = new Date();
            updateData.approvedAt = new Date();
        }

        if (status === "CANCELLED" && rejectionReason) {
            updateData.rejectionReason = rejectionReason;
        }

        const updatedEvent = await prisma.event.update({
            where: { id },
            data: updateData,
        });

        return successResponse(updatedEvent);
    } catch (error) {
        console.error("Error updating event status:", error);
        return errorResponse("Failed to update event status", 500);
    }
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

        return successResponse(event);
    } catch (error) {
        console.error("Error fetching event:", error);
        return errorResponse("Failed to fetch event", 500);
    }
}
