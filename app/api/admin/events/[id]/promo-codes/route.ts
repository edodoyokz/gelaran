import { type NextRequest } from "next/server";
import prisma from "@/lib/prisma/client";
import { successResponse, errorResponse } from "@/lib/api/response";
import { createClient } from "@/lib/supabase/server";
import { z } from "zod";
import type { User } from "@/types/prisma";

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

const createPromoCodeSchema = z.object({
    code: z.string().min(1).max(50).regex(/^[A-Z0-9_-]+$/),
    description: z.string().nullable().optional(),
    discountType: z.enum(["PERCENTAGE", "FIXED_AMOUNT"]),
    discountValue: z.number().min(0),
    maxDiscountAmount: z.number().min(0).nullable().optional(),
    minOrderAmount: z.number().min(0).nullable().optional(),
    usageLimitTotal: z.number().int().min(1).nullable().optional(),
    usageLimitPerUser: z.number().int().min(1).nullable().optional(),
    validFrom: z.string().datetime(),
    validUntil: z.string().datetime(),
    isActive: z.boolean().default(true),
});

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id: eventId } = await params;
        const authResult = await verifyAdmin();

        if ("error" in authResult) {
            return errorResponse(authResult.error, authResult.status);
        }

        const event = await prisma.event.findUnique({
            where: { id: eventId },
        });

        if (!event) {
            return errorResponse("Event not found", 404);
        }

        const promoCodes = await prisma.promoCode.findMany({
            where: { eventId },
            orderBy: { createdAt: "desc" },
        });

        return successResponse(promoCodes);
    } catch (error) {
        console.error("Error fetching promo codes:", error);
        return errorResponse("Failed to fetch promo codes", 500);
    }
}

export async function POST(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id: eventId } = await params;
        const authResult = await verifyAdmin();

        if ("error" in authResult) {
            return errorResponse(authResult.error, authResult.status);
        }

        const event = await prisma.event.findUnique({
            where: { id: eventId },
        });

        if (!event) {
            return errorResponse("Event not found", 404);
        }

        const body = await request.json();
        const parsed = createPromoCodeSchema.safeParse(body);

        if (!parsed.success) {
            return errorResponse("Validation error", 400, {
                errors: parsed.error.flatten().fieldErrors,
            });
        }

        const data = parsed.data;

        const existing = await prisma.promoCode.findUnique({
            where: { code: data.code },
        });

        if (existing) {
            return errorResponse("Promo code already exists", 400);
        }

        const promoCode = await prisma.promoCode.create({
            data: {
                eventId,
                organizerId: event.organizerId,
                code: data.code,
                description: data.description,
                discountType: data.discountType,
                discountValue: data.discountValue,
                maxDiscountAmount: data.maxDiscountAmount,
                minOrderAmount: data.minOrderAmount,
                usageLimitTotal: data.usageLimitTotal,
                usageLimitPerUser: data.usageLimitPerUser,
                validFrom: new Date(data.validFrom),
                validUntil: new Date(data.validUntil),
                isActive: data.isActive,
            },
        });

        return successResponse(promoCode, undefined, 201);
    } catch (error) {
        console.error("Error creating promo code:", error);
        return errorResponse("Failed to create promo code", 500);
    }
}
