import prisma from "@/lib/prisma/client";
import { successResponse, errorResponse } from "@/lib/api/response";
import { createClient } from "@/lib/supabase/server";

function generateSlug(name: string): string {
    return name
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, "")
        .replace(/\s+/g, "-")
        .replace(/-+/g, "-")
        .trim();
}

async function getUniqueSlug(baseSlug: string): Promise<string> {
    let slug = baseSlug;
    let counter = 1;

    while (true) {
        const existing = await prisma.organizerProfile.findUnique({
            where: { organizationSlug: slug },
        });

        if (!existing) {
            return slug;
        }

        slug = `${baseSlug}-${counter}`;
        counter++;
    }
}

export async function POST(request: Request) {
    try {
        const supabase = await createClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (!user || !user.email) {
            return errorResponse("Unauthorized. Please login first.", 401);
        }

        const dbUser = await prisma.user.findUnique({
            where: { email: user.email },
            include: {
                organizerProfile: true,
            },
        });

        if (!dbUser) {
            return errorResponse("User not found", 404);
        }

        if (dbUser.role === "ORGANIZER" || dbUser.role === "ADMIN" || dbUser.role === "SUPER_ADMIN") {
            return errorResponse("You are already an organizer or admin", 400);
        }

        if (dbUser.organizerProfile) {
            const status = dbUser.organizerProfile.verificationStatus;
            if (status === "PENDING") {
                return errorResponse("You already have a pending application. Please wait for approval.", 400);
            }
            if (status === "APPROVED") {
                return errorResponse("Your application has been approved. You are already an organizer.", 400);
            }
        }

        const body = await request.json();
        const {
            organizationName,
            organizationDescription,
            websiteUrl,
            socialFacebook,
            socialInstagram,
            socialTwitter,
            socialTiktok,
        } = body;

        if (!organizationName || organizationName.trim().length < 3) {
            return errorResponse("Organization name must be at least 3 characters", 400);
        }

        if (organizationName.trim().length > 100) {
            return errorResponse("Organization name must be less than 100 characters", 400);
        }

        const baseSlug = generateSlug(organizationName.trim());
        const organizationSlug = await getUniqueSlug(baseSlug);

        const organizerProfile = await prisma.organizerProfile.create({
            data: {
                userId: dbUser.id,
                organizationName: organizationName.trim(),
                organizationSlug,
                organizationDescription: organizationDescription?.trim() || null,
                websiteUrl: websiteUrl?.trim() || null,
                socialFacebook: socialFacebook?.trim() || null,
                socialInstagram: socialInstagram?.trim() || null,
                socialTwitter: socialTwitter?.trim() || null,
                socialTiktok: socialTiktok?.trim() || null,
                verificationStatus: "PENDING",
                isVerified: false,
            },
        });

        return successResponse({
            message: "Application submitted successfully. We will review your application and get back to you soon.",
            organizerProfile: {
                id: organizerProfile.id,
                organizationName: organizerProfile.organizationName,
                organizationSlug: organizerProfile.organizationSlug,
                verificationStatus: organizerProfile.verificationStatus,
            },
        }, undefined, 201);
    } catch (error) {
        console.error("Error submitting organizer application:", error);
        return errorResponse("Failed to submit application", 500);
    }
}

export async function GET() {
    try {
        const supabase = await createClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (!user || !user.email) {
            return errorResponse("Unauthorized", 401);
        }

        const dbUser = await prisma.user.findUnique({
            where: { email: user.email },
            include: {
                organizerProfile: {
                    select: {
                        id: true,
                        organizationName: true,
                        organizationSlug: true,
                        organizationDescription: true,
                        websiteUrl: true,
                        socialFacebook: true,
                        socialInstagram: true,
                        socialTwitter: true,
                        socialTiktok: true,
                        verificationStatus: true,
                        isVerified: true,
                        createdAt: true,
                    },
                },
            },
        });

        if (!dbUser) {
            return errorResponse("User not found", 404);
        }

        return successResponse({
            hasApplication: !!dbUser.organizerProfile,
            isOrganizer: dbUser.role === "ORGANIZER",
            application: dbUser.organizerProfile,
        });
    } catch (error) {
        console.error("Error fetching organizer application:", error);
        return errorResponse("Failed to fetch application status", 500);
    }
}
