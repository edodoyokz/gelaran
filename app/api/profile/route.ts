import { type NextRequest } from "next/server";
import prisma from "@/lib/prisma/client";
import { successResponse, errorResponse } from "@/lib/api/response";
import { createClient } from "@/lib/supabase/server";
import { z } from "zod";
import type { Gender, PrismaTransactionClient } from "@/types/prisma";

const VALID_GENDERS: Gender[] = ["MALE", "FEMALE", "OTHER", "PREFER_NOT_TO_SAY"];

const updateProfileSchema = z.object({
    name: z.string().min(2).max(100).optional(),
    phone: z.string().min(10).max(20).optional().nullable(),
    avatarUrl: z.string().url().optional().nullable(),
    locale: z.string().min(2).max(5).optional(),
    timezone: z.string().optional(),
    birthDate: z.string().optional().nullable(),
    gender: z.enum(["MALE", "FEMALE", "OTHER", "PREFER_NOT_TO_SAY"]).optional().nullable(),
    address: z.string().max(500).optional().nullable(),
    city: z.string().max(100).optional().nullable(),
    province: z.string().max(100).optional().nullable(),
    postalCode: z.string().max(10).optional().nullable(),
});

export async function GET() {
    try {
        const supabase = await createClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (!user || !user.email) {
            return errorResponse("Unauthorized", 401);
        }

        let dbUser = await prisma.user.findUnique({
            where: { email: user.email },
            include: {
                customerProfile: true,
            },
        });

        if (!dbUser) {
            dbUser = await prisma.user.create({
                data: {
                    email: user.email,
                    name: user.user_metadata?.name || user.email.split("@")[0],
                    isVerified: !!user.email_confirmed_at,
                    emailVerifiedAt: user.email_confirmed_at ? new Date(user.email_confirmed_at) : null,
                },
                include: {
                    customerProfile: true,
                },
            });
        }

        return successResponse({
            id: dbUser.id,
            name: dbUser.name,
            email: dbUser.email,
            phone: dbUser.phone,
            avatarUrl: dbUser.avatarUrl,
            role: dbUser.role,
            isVerified: dbUser.isVerified,
            locale: dbUser.locale,
            timezone: dbUser.timezone,
            emailVerifiedAt: dbUser.emailVerifiedAt,
            lastLoginAt: dbUser.lastLoginAt,
            createdAt: dbUser.createdAt,
            customerProfile: dbUser.customerProfile ? {
                birthDate: dbUser.customerProfile.birthDate,
                gender: dbUser.customerProfile.gender,
                address: dbUser.customerProfile.address,
                city: dbUser.customerProfile.city,
                province: dbUser.customerProfile.province,
                postalCode: dbUser.customerProfile.postalCode,
            } : null,
        });
    } catch (error) {
        console.error("Error fetching profile:", error);
        return errorResponse("Failed to fetch profile", 500);
    }
}

export async function PUT(request: NextRequest) {
    try {
        const supabase = await createClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (!user || !user.email) {
            return errorResponse("Unauthorized", 401);
        }

        const dbUser = await prisma.user.findUnique({
            where: { email: user.email },
            include: {
                customerProfile: true,
            },
        });

        if (!dbUser) {
            return errorResponse("User not found", 404);
        }

        const body = await request.json();
        const parsed = updateProfileSchema.safeParse(body);

        if (!parsed.success) {
            return errorResponse("Validation error", 400, {
                errors: parsed.error.flatten().fieldErrors,
            });
        }

        const data = parsed.data;

        if (data.phone && data.phone !== dbUser.phone) {
            const existingPhone = await prisma.user.findFirst({
                where: {
                    phone: data.phone,
                    id: { not: dbUser.id },
                },
            });

            if (existingPhone) {
                return errorResponse("Phone number already in use", 400);
            }
        }

        const updatedUser = await prisma.$transaction(async (tx: PrismaTransactionClient) => {
            const userUpdate = await tx.user.update({
                where: { id: dbUser.id },
                data: {
                    name: data.name,
                    phone: data.phone,
                    avatarUrl: data.avatarUrl,
                    locale: data.locale,
                    timezone: data.timezone,
                },
            });

            const profileData = {
                birthDate: data.birthDate ? new Date(data.birthDate) : undefined,
                gender: data.gender && VALID_GENDERS.includes(data.gender) ? data.gender : undefined,
                address: data.address,
                city: data.city,
                province: data.province,
                postalCode: data.postalCode,
            };

            const hasProfileData = Object.values(profileData).some((v) => v !== undefined);

            if (hasProfileData) {
                if (dbUser.customerProfile) {
                    await tx.customerProfile.update({
                        where: { userId: dbUser.id },
                        data: profileData,
                    });
                } else {
                    await tx.customerProfile.create({
                        data: {
                            userId: dbUser.id,
                            ...profileData,
                        },
                    });
                }
            }

            return userUpdate;
        });

        const refreshedUser = await prisma.user.findUnique({
            where: { id: updatedUser.id },
            include: { customerProfile: true },
        });

        return successResponse({
            id: refreshedUser?.id,
            name: refreshedUser?.name,
            email: refreshedUser?.email,
            phone: refreshedUser?.phone,
            avatarUrl: refreshedUser?.avatarUrl,
            locale: refreshedUser?.locale,
            timezone: refreshedUser?.timezone,
            customerProfile: refreshedUser?.customerProfile ? {
                birthDate: refreshedUser.customerProfile.birthDate,
                gender: refreshedUser.customerProfile.gender,
                address: refreshedUser.customerProfile.address,
                city: refreshedUser.customerProfile.city,
                province: refreshedUser.customerProfile.province,
                postalCode: refreshedUser.customerProfile.postalCode,
            } : null,
        });
    } catch (error) {
        console.error("Error updating profile:", error);
        return errorResponse("Failed to update profile", 500);
    }
}
