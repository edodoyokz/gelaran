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

const updatePromoCodeSchema = z.object({
    code: z.string().min(1).max(50).regex(/^[A-Z0-9_-]+$/).optional(),
    description: z.string().nullable().optional(),
    discountType: z.enum(["PERCENTAGE", "FIXED_AMOUNT"]).optional(),
    discountValue: z.number().min(0).optional(),
    maxDiscountAmount: z.number().min(0).nullable().optional(),
    minOrderAmount: z.number().min(0).nullable().optional(),
    usageLimitTotal: z.number().int().min(1).nullable().optional(),
    usageLimitPerUser: z.number().int().min(1).nullable().optional(),
    validFrom: z.string().datetime().optional(),
    validUntil: z.string().datetime().optional(),
    isActive: z.boolean().optional(),
});

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string; promoId: string }> }
) {
    try {
        const { promoId } = await params;
        const authResult = await verifyAdmin();

        if ("error" in authResult) {
            return errorResponse(authResult.error, authResult.status);
        }

        const promoCode = await prisma.promoCode.findUnique({
            where: { id: promoId },
            include: {
                event: { select: { id: true, title: true } },
                _count: { select: { usages: true } },
            },
        });

        if (!promoCode) {
            return errorResponse("Promo code not found", 404);
        }

        return successResponse(promoCode);
    } catch (error) {
        console.error("Error fetching promo code:", error);
        return errorResponse("Failed to fetch promo code", 500);
    }
}

export async function PUT(
    request: NextRequest,
    { params }: { params: Promise<{ id: string; promoId: string }> }
) {
    try {
        const { id: eventId, promoId } = await params;
        const authResult = await verifyAdmin();

        if ("error" in authResult) {
            return errorResponse(authResult.error, authResult.status);
        }

        const promoCode = await prisma.promoCode.findUnique({
            where: { id: promoId },
        });

        if (!promoCode) {
            return errorResponse("Promo code not found", 404);
        }

        if (promoCode.eventId !== eventId) {
            return errorResponse("Promo code does not belong to this event", 400);
        }

        const body = await request.json();
        const parsed = updatePromoCodeSchema.safeParse(body);

        if (!parsed.success) {
            return errorResponse("Validation error", 400, {
                errors: parsed.error.flatten().fieldErrors,
            });
        }

        const data = parsed.data;

        if (data.code && data.code !== promoCode.code) {
            const existing = await prisma.promoCode.findUnique({
                where: { code: data.code },
            });
            if (existing) {
                return errorResponse("Promo code already exists", 400);
            }
        }

        const updateData: Record<string, unknown> = {};

        if (data.code !== undefined) updateData.code = data.code;
        if (data.description !== undefined) updateData.description = data.description;
        if (data.discountType !== undefined) updateData.discountType = data.discountType;
        if (data.discountValue !== undefined) updateData.discountValue = data.discountValue;
        if (data.maxDiscountAmount !== undefined) updateData.maxDiscountAmount = data.maxDiscountAmount;
        if (data.minOrderAmount !== undefined) updateData.minOrderAmount = data.minOrderAmount;
        if (data.usageLimitTotal !== undefined) updateData.usageLimitTotal = data.usageLimitTotal;
        if (data.usageLimitPerUser !== undefined) updateData.usageLimitPerUser = data.usageLimitPerUser;
        if (data.validFrom !== undefined) updateData.validFrom = new Date(data.validFrom);
        if (data.validUntil !== undefined) updateData.validUntil = new Date(data.validUntil);
        if (data.isActive !== undefined) updateData.isActive = data.isActive;

        const updated = await prisma.promoCode.update({
            where: { id: promoId },
            data: updateData,
        });

        return successResponse(updated);
    } catch (error) {
        console.error("Error updating promo code:", error);
        return errorResponse("Failed to update promo code", 500);
    }
}

export async function DELETE(
    request: NextRequest,
    { params }: { params: Promise<{ id: string; promoId: string }> }
) {
    try {
        const { id: eventId, promoId } = await params;
        const authResult = await verifyAdmin();

        if ("error" in authResult) {
            return errorResponse(authResult.error, authResult.status);
        }

        const promoCode = await prisma.promoCode.findUnique({
            where: { id: promoId },
            include: {
                _count: { select: { usages: true } },
            },
        });

        if (!promoCode) {
            return errorResponse("Promo code not found", 404);
        }

        if (promoCode.eventId !== eventId) {
            return errorResponse("Promo code does not belong to this event", 400);
        }

        if (promoCode._count.usages > 0) {
            return errorResponse(
                `Cannot delete promo code with ${promoCode._count.usages} usage(s). Deactivate instead.`,
                400
            );
        }

        await prisma.promoCode.delete({
            where: { id: promoId },
        });

        return successResponse({ message: "Promo code deleted successfully" });
    } catch (error) {
        console.error("Error deleting promo code:", error);
        return errorResponse("Failed to delete promo code", 500);
    }
}
