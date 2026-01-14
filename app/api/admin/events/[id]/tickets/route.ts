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

const createTicketSchema = z.object({
    name: z.string().min(1).max(100),
    description: z.string().max(500).nullable().optional(),
    basePrice: z.number().min(0),
    totalQuantity: z.number().int().min(1),
    minPerOrder: z.number().int().min(1).default(1),
    maxPerOrder: z.number().int().min(1).default(10),
    isFree: z.boolean().default(false),
    isHidden: z.boolean().default(false),
    isActive: z.boolean().default(true),
    saleStartAt: z.string().datetime().nullable().optional(),
    saleEndAt: z.string().datetime().nullable().optional(),
});

export async function POST(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const resolvedParams = await params;
        const eventId = resolvedParams.id;
        
        if (!eventId) {
            return errorResponse("Event ID is required", 400);
        }
        
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
        const parsed = createTicketSchema.safeParse(body);

        if (!parsed.success) {
            return errorResponse("Validation error", 400, {
                errors: parsed.error.flatten().fieldErrors,
            });
        }

        const data = parsed.data;

        const maxSortOrder = await prisma.ticketType.aggregate({
            where: { eventId },
            _max: { sortOrder: true },
        });

        const ticket = await prisma.ticketType.create({
            data: {
                eventId,
                name: data.name,
                description: data.description,
                basePrice: data.isFree ? 0 : data.basePrice,
                totalQuantity: data.totalQuantity,
                minPerOrder: data.minPerOrder,
                maxPerOrder: data.maxPerOrder,
                isFree: data.isFree,
                isHidden: data.isHidden,
                isActive: data.isActive,
                saleStartAt: data.saleStartAt ? new Date(data.saleStartAt) : null,
                saleEndAt: data.saleEndAt ? new Date(data.saleEndAt) : null,
                sortOrder: (maxSortOrder._max.sortOrder || 0) + 1,
            },
        });

        return successResponse(ticket, undefined, 201);
    } catch (error) {
        console.error("Error creating ticket:", error);
        return errorResponse("Failed to create ticket", 500);
    }
}
