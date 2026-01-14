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

const updateTicketTypeSchema = z.object({
    name: z.string().min(1).max(100).optional(),
    description: z.string().max(500).nullable().optional(),
    basePrice: z.number().min(0).optional(),
    totalQuantity: z.number().int().min(0).optional(),
    minPerOrder: z.number().int().min(1).optional(),
    maxPerOrder: z.number().int().min(1).optional(),
    isFree: z.boolean().optional(),
    isHidden: z.boolean().optional(),
    isActive: z.boolean().optional(),
    saleStartAt: z.string().datetime().nullable().optional(),
    saleEndAt: z.string().datetime().nullable().optional(),
});

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const resolvedParams = await params;
        const id = resolvedParams.id;
        const authResult = await verifyAdmin();

        if ("error" in authResult) {
            return errorResponse(authResult.error, authResult.status);
        }

        const ticketType = await prisma.ticketType.findUnique({
            where: { id },
            include: {
                event: {
                    select: {
                        id: true,
                        title: true,
                        status: true,
                    },
                },
            },
        });

        if (!ticketType) {
            return errorResponse("Ticket type not found", 404);
        }

        return successResponse(ticketType);
    } catch (error) {
        console.error("Error fetching ticket type:", error);
        return errorResponse("Failed to fetch ticket type", 500);
    }
}

export async function PUT(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const resolvedParams = await params;
        const id = resolvedParams.id;
        const authResult = await verifyAdmin();

        if ("error" in authResult) {
            return errorResponse(authResult.error, authResult.status);
        }

        const ticketType = await prisma.ticketType.findUnique({
            where: { id },
            include: {
                event: {
                    select: { id: true, title: true, status: true },
                },
            },
        });

        if (!ticketType) {
            return errorResponse("Ticket type not found", 404);
        }

        const body = await request.json();
        const parsed = updateTicketTypeSchema.safeParse(body);

        if (!parsed.success) {
            return errorResponse("Validation error", 400, {
                errors: parsed.error.flatten().fieldErrors,
            });
        }

        const data = parsed.data;

        if (data.totalQuantity !== undefined && data.totalQuantity < ticketType.soldQuantity) {
            return errorResponse(
                `Cannot set quantity below sold count (${ticketType.soldQuantity})`,
                400
            );
        }

        if (data.minPerOrder && data.maxPerOrder && data.minPerOrder > data.maxPerOrder) {
            return errorResponse("Min per order cannot exceed max per order", 400);
        }

        const updateData: Record<string, unknown> = {};

        if (data.name !== undefined) updateData.name = data.name;
        if (data.description !== undefined) updateData.description = data.description;
        if (data.basePrice !== undefined) updateData.basePrice = data.basePrice;
        if (data.totalQuantity !== undefined) updateData.totalQuantity = data.totalQuantity;
        if (data.minPerOrder !== undefined) updateData.minPerOrder = data.minPerOrder;
        if (data.maxPerOrder !== undefined) updateData.maxPerOrder = data.maxPerOrder;
        if (data.isFree !== undefined) updateData.isFree = data.isFree;
        if (data.isHidden !== undefined) updateData.isHidden = data.isHidden;
        if (data.isActive !== undefined) updateData.isActive = data.isActive;
        if (data.saleStartAt !== undefined) {
            updateData.saleStartAt = data.saleStartAt ? new Date(data.saleStartAt) : null;
        }
        if (data.saleEndAt !== undefined) {
            updateData.saleEndAt = data.saleEndAt ? new Date(data.saleEndAt) : null;
        }

        const updatedTicketType = await prisma.ticketType.update({
            where: { id },
            data: updateData,
        });

        return successResponse(updatedTicketType);
    } catch (error) {
        console.error("Error updating ticket type:", error);
        return errorResponse("Failed to update ticket type", 500);
    }
}

export async function DELETE(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const resolvedParams = await params;
        const id = resolvedParams.id;
        const authResult = await verifyAdmin();

        if ("error" in authResult) {
            return errorResponse(authResult.error, authResult.status);
        }

        const ticketType = await prisma.ticketType.findUnique({
            where: { id },
        });

        if (!ticketType) {
            return errorResponse("Ticket type not found", 404);
        }

        if (ticketType.soldQuantity > 0) {
            return errorResponse(
                `Cannot delete ticket type with ${ticketType.soldQuantity} sold ticket(s). Deactivate instead.`,
                400
            );
        }

        await prisma.ticketType.delete({
            where: { id },
        });

        return successResponse({ message: "Ticket type deleted successfully" });
    } catch (error) {
        console.error("Error deleting ticket type:", error);
        return errorResponse("Failed to delete ticket type", 500);
    }
}
