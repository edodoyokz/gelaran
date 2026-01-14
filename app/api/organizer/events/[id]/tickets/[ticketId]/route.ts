import { type NextRequest } from "next/server";
import prisma from "@/lib/prisma/client";
import { successResponse, errorResponse } from "@/lib/api/response";
import { createClient } from "@/lib/supabase/server";
import { z } from "zod";
import type { User, Event } from "@prisma/client";

type OrganizerAccessResult =
    | { organizer: User; event: Event }
    | { error: string; status: number };

async function verifyOrganizerAccess(eventId: string, userEmail: string): Promise<OrganizerAccessResult> {
    const organizer = await prisma.user.findUnique({
        where: { email: userEmail },
    });

    if (!organizer || organizer.role !== "ORGANIZER") {
        return { error: "Only organizers can manage tickets", status: 403 };
    }

    const event = await prisma.event.findUnique({
        where: { id: eventId },
    });

    if (!event) {
        return { error: "Event not found", status: 404 };
    }

    if (event.organizerId !== organizer.id) {
        return { error: "Not authorized", status: 403 };
    }

    return { organizer, event };
}

const updateTicketSchema = z.object({
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
    { params }: { params: Promise<{ id: string; ticketId: string }> }
) {
    try {
        const { id, ticketId } = await params;
        const supabase = await createClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
            return errorResponse("Unauthorized", 401);
        }

        const result = await verifyOrganizerAccess(id, user.email!);
        if ("error" in result) {
            return errorResponse(result.error, result.status);
        }

        const ticket = await prisma.ticketType.findUnique({
            where: { id: ticketId },
            include: {
                event: { select: { id: true, title: true, status: true } },
                priceTiers: { orderBy: { sortOrder: "asc" } },
                _count: { select: { bookedTickets: true } },
            },
        });

        if (!ticket) {
            return errorResponse("Ticket type not found", 404);
        }

        if (ticket.eventId !== id) {
            return errorResponse("Ticket does not belong to this event", 400);
        }

        return successResponse(ticket);
    } catch (error) {
        console.error("Error fetching ticket:", error);
        return errorResponse("Failed to fetch ticket", 500);
    }
}

export async function PUT(
    request: NextRequest,
    { params }: { params: Promise<{ id: string; ticketId: string }> }
) {
    try {
        const { id: eventId, ticketId } = await params;
        const supabase = await createClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
            return errorResponse("Unauthorized", 401);
        }

        const result = await verifyOrganizerAccess(eventId, user.email!);
        if ("error" in result) {
            return errorResponse(result.error, result.status);
        }

        const ticket = await prisma.ticketType.findUnique({
            where: { id: ticketId },
        });

        if (!ticket) {
            return errorResponse("Ticket type not found", 404);
        }

        if (ticket.eventId !== eventId) {
            return errorResponse("Ticket does not belong to this event", 400);
        }

        const body = await request.json();
        const parsed = updateTicketSchema.safeParse(body);

        if (!parsed.success) {
            return errorResponse("Validation error", 400, {
                errors: parsed.error.flatten().fieldErrors,
            });
        }

        const data = parsed.data;

        if (data.totalQuantity !== undefined && data.totalQuantity < ticket.soldQuantity) {
            return errorResponse(
                `Cannot set quantity below sold count (${ticket.soldQuantity})`,
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

        const updated = await prisma.ticketType.update({
            where: { id: ticketId },
            data: updateData,
            include: {
                priceTiers: { orderBy: { sortOrder: "asc" } },
                _count: { select: { bookedTickets: true } },
            },
        });

        return successResponse(updated);
    } catch (error) {
        console.error("Error updating ticket:", error);
        return errorResponse("Failed to update ticket", 500);
    }
}

export async function DELETE(
    request: NextRequest,
    { params }: { params: Promise<{ id: string; ticketId: string }> }
) {
    try {
        const { id: eventId, ticketId } = await params;
        const supabase = await createClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
            return errorResponse("Unauthorized", 401);
        }

        const result = await verifyOrganizerAccess(eventId, user.email!);
        if ("error" in result) {
            return errorResponse(result.error, result.status);
        }

        const ticket = await prisma.ticketType.findUnique({
            where: { id: ticketId },
        });

        if (!ticket) {
            return errorResponse("Ticket type not found", 404);
        }

        if (ticket.eventId !== eventId) {
            return errorResponse("Ticket does not belong to this event", 400);
        }

        if (ticket.soldQuantity > 0) {
            return errorResponse(
                `Cannot delete ticket type with ${ticket.soldQuantity} sold ticket(s). Deactivate instead.`,
                400
            );
        }

        await prisma.ticketType.delete({
            where: { id: ticketId },
        });

        return successResponse({ message: "Ticket type deleted successfully" });
    } catch (error) {
        console.error("Error deleting ticket:", error);
        return errorResponse("Failed to delete ticket", 500);
    }
}
