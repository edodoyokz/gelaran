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

        const targetUser = await prisma.user.findUnique({
            where: { id },
            include: {
                organizerProfile: {
                    include: {
                        bankAccounts: {
                            select: {
                                id: true,
                                bankName: true,
                                accountNumber: true,
                                accountHolderName: true,
                                isPrimary: true,
                                isVerified: true,
                            },
                        },
                        payouts: {
                            take: 5,
                            orderBy: { createdAt: "desc" },
                            select: {
                                id: true,
                                payoutCode: true,
                                amount: true,
                                status: true,
                                createdAt: true,
                            },
                        },
                    },
                },
                customerProfile: true,
                bookings: {
                    take: 10,
                    orderBy: { createdAt: "desc" },
                    include: {
                        event: {
                            select: {
                                id: true,
                                title: true,
                                slug: true,
                            },
                        },
                    },
                },
                events: {
                    take: 10,
                    orderBy: { createdAt: "desc" },
                    select: {
                        id: true,
                        title: true,
                        slug: true,
                        status: true,
                        createdAt: true,
                        _count: {
                            select: { bookings: true },
                        },
                    },
                },
                _count: {
                    select: {
                        bookings: true,
                        events: true,
                        reviews: true,
                        wishlists: true,
                    },
                },
            },
        });

        if (!targetUser) {
            return errorResponse("User not found", 404);
        }

        const formattedUser = {
            ...targetUser,
            organizerProfile: targetUser.organizerProfile ? {
                ...targetUser.organizerProfile,
                walletBalance: targetUser.organizerProfile.walletBalance.toString(),
                totalEarned: targetUser.organizerProfile.totalEarned.toString(),
                totalWithdrawn: targetUser.organizerProfile.totalWithdrawn.toString(),
                payouts: targetUser.organizerProfile.payouts.map(p => ({
                    ...p,
                    amount: p.amount.toString(),
                })),
            } : null,
            bookings: targetUser.bookings.map(b => ({
                ...b,
                subtotal: b.subtotal.toString(),
                totalAmount: b.totalAmount.toString(),
            })),
        };

        return successResponse(formattedUser);
    } catch (error) {
        console.error("Error fetching user:", error);
        return errorResponse("Failed to fetch user", 500);
    }
}

const updateUserSchema = z.object({
    role: z.enum(["CUSTOMER", "ORGANIZER", "ADMIN"]).optional(),
    status: z.enum(["active", "suspended"]).optional(),
    isVerified: z.boolean().optional(),
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

        const targetUser = await prisma.user.findUnique({
            where: { id },
        });

        if (!targetUser) {
            return errorResponse("User not found", 404);
        }

        if (targetUser.role === "SUPER_ADMIN" && authResult.admin.role !== "SUPER_ADMIN") {
            return errorResponse("Cannot modify super admin", 403);
        }

        const body = await request.json();
        const parsed = updateUserSchema.safeParse(body);

        if (!parsed.success) {
            return errorResponse("Validation error", 400, {
                errors: parsed.error.flatten().fieldErrors,
            });
        }

        const { role, status, isVerified } = parsed.data;

        const updateData: Record<string, unknown> = {};

        if (role !== undefined) {
            updateData.role = role;
        }

        if (status !== undefined) {
            updateData.deletedAt = status === "suspended" ? new Date() : null;
        }

        if (isVerified !== undefined) {
            updateData.isVerified = isVerified;
        }

        const updatedUser = await prisma.user.update({
            where: { id },
            data: updateData,
            include: {
                organizerProfile: {
                    select: {
                        organizationName: true,
                        isVerified: true,
                    },
                },
                _count: {
                    select: { bookings: true, events: true },
                },
            },
        });

        return successResponse(updatedUser);
    } catch (error) {
        console.error("Error updating user:", error);
        return errorResponse("Failed to update user", 500);
    }
}
