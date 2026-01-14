import prisma from "@/lib/prisma/client";
import { successResponse, errorResponse } from "@/lib/api/response";
import { createClient } from "@/lib/supabase/server";
import { z } from "zod";

type AdminResult = { admin: { id: string } } | { error: string; status: number };

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

const updateVenueSchema = z.object({
    name: z.string().min(3).max(200).optional(),
    address: z.string().min(5).max(500).optional(),
    city: z.string().min(2).max(100).optional(),
    province: z.string().min(2).max(100).optional(),
    postalCode: z.string().max(10).optional(),
    country: z.string().optional(),
    latitude: z.number().optional(),
    longitude: z.number().optional(),
    googlePlaceId: z.string().optional(),
    capacity: z.number().int().positive().optional(),
    description: z.string().max(2000).optional(),
    amenities: z.array(z.string()).optional(),
    imageUrl: z.string().url().optional().or(z.literal("")),
});

export async function PUT(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const authResult = await verifyAdmin();

        if ("error" in authResult) {
            return errorResponse(authResult.error, authResult.status);
        }

        const { id } = await params;

        const existing = await prisma.venue.findUnique({
            where: { id },
        });

        if (!existing) {
            return errorResponse("Venue not found", 404);
        }

        const body = await request.json();
        const parsed = updateVenueSchema.safeParse(body);

        if (!parsed.success) {
            return errorResponse("Validation error", 400, {
                errors: parsed.error.flatten().fieldErrors,
            });
        }

        const { amenities, imageUrl, ...restData } = parsed.data;

        const venue = await prisma.venue.update({
            where: { id },
            data: {
                ...restData,
                imageUrl: imageUrl === "" ? null : imageUrl,
                amenities: amenities ? amenities : undefined,
            },
        });

        return successResponse({
            ...venue,
            latitude: venue.latitude?.toString() || null,
            longitude: venue.longitude?.toString() || null,
        });
    } catch (error) {
        console.error("Error updating venue:", error);
        return errorResponse("Failed to update venue", 500);
    }
}

export async function DELETE(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const authResult = await verifyAdmin();

        if ("error" in authResult) {
            return errorResponse(authResult.error, authResult.status);
        }

        const { id } = await params;

        const existing = await prisma.venue.findUnique({
            where: { id },
            include: {
                _count: {
                    select: { events: true },
                },
            },
        });

        if (!existing) {
            return errorResponse("Venue not found", 404);
        }

        if (existing._count.events > 0) {
            return errorResponse(
                "Cannot delete venue with existing events. Remove all events first.",
                400
            );
        }

        await prisma.venue.delete({
            where: { id },
        });

        return successResponse({ deleted: true });
    } catch (error) {
        console.error("Error deleting venue:", error);
        return errorResponse("Failed to delete venue", 500);
    }
}
