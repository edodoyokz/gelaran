import { type NextRequest } from "next/server";
import prisma from "@/lib/prisma/client";
import { successResponse, errorResponse } from "@/lib/api/response";
import { createClient } from "@/lib/supabase/server";
import { z } from "zod";

const updateProfileSchema = z.object({
    organizationName: z.string().min(2).max(100).optional(),
    organizationDescription: z.string().max(1000).optional().nullable(),
    websiteUrl: z.string().url().optional().nullable().or(z.literal("")),
    socialFacebook: z.string().optional().nullable().or(z.literal("")),
    socialInstagram: z.string().optional().nullable().or(z.literal("")),
    socialTwitter: z.string().optional().nullable().or(z.literal("")),
    socialTiktok: z.string().optional().nullable().or(z.literal("")),
    organizationLogo: z.string().optional().nullable(),
    organizationBanner: z.string().optional().nullable(),
});

export async function GET() {
    try {
        const supabase = await createClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
            return errorResponse("Unauthorized", 401);
        }

        const organizer = await prisma.user.findUnique({
            where: { email: user.email! },
            include: {
                organizerProfile: true,
            },
        });

        if (!organizer || organizer.role !== "ORGANIZER") {
            return errorResponse("Not an organizer", 403);
        }

        if (!organizer.organizerProfile) {
            return errorResponse("Organizer profile not found", 404);
        }

        return successResponse({
            user: {
                id: organizer.id,
                name: organizer.name,
                email: organizer.email,
                phone: organizer.phone,
                avatarUrl: organizer.avatarUrl,
            },
            profile: organizer.organizerProfile,
        });
    } catch (error) {
        console.error("Error fetching organizer profile:", error);
        return errorResponse("Failed to fetch profile", 500);
    }
}

export async function PUT(request: NextRequest) {
    try {
        const supabase = await createClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
            return errorResponse("Unauthorized", 401);
        }

        const organizer = await prisma.user.findUnique({
            where: { email: user.email! },
            include: { organizerProfile: true },
        });

        if (!organizer || organizer.role !== "ORGANIZER") {
            return errorResponse("Not an organizer", 403);
        }

        if (!organizer.organizerProfile) {
            return errorResponse("Organizer profile not found", 404);
        }

        const body = await request.json();
        const parsed = updateProfileSchema.safeParse(body);

        if (!parsed.success) {
            return errorResponse("Validation error", 400, {
                errors: parsed.error.flatten().fieldErrors,
            });
        }

        const data = parsed.data;

        const updateData: Record<string, unknown> = {};

        if (data.organizationName !== undefined) {
            updateData.organizationName = data.organizationName;
        }
        if (data.organizationDescription !== undefined) {
            updateData.organizationDescription = data.organizationDescription || null;
        }
        if (data.websiteUrl !== undefined) {
            updateData.websiteUrl = data.websiteUrl || null;
        }
        if (data.socialFacebook !== undefined) {
            updateData.socialFacebook = data.socialFacebook || null;
        }
        if (data.socialInstagram !== undefined) {
            updateData.socialInstagram = data.socialInstagram || null;
        }
        if (data.socialTwitter !== undefined) {
            updateData.socialTwitter = data.socialTwitter || null;
        }
        if (data.socialTiktok !== undefined) {
            updateData.socialTiktok = data.socialTiktok || null;
        }
        if (data.organizationLogo !== undefined) {
            updateData.organizationLogo = data.organizationLogo || null;
        }
        if (data.organizationBanner !== undefined) {
            updateData.organizationBanner = data.organizationBanner || null;
        }

        const updatedProfile = await prisma.organizerProfile.update({
            where: { id: organizer.organizerProfile.id },
            data: updateData,
        });

        return successResponse(updatedProfile);
    } catch (error) {
        console.error("Error updating organizer profile:", error);
        return errorResponse("Failed to update profile", 500);
    }
}
