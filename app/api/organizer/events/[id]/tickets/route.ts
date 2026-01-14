import { type NextRequest } from "next/server";
import prisma from "@/lib/prisma/client";
import { successResponse, errorResponse } from "@/lib/api/response";
import { createClient } from "@/lib/supabase/server";
import { z } from "zod";
import type { User, Event } from "@/types/prisma";

type OrganizerAccessResult = 
    | { organizer: User; event: Event }
    | { error: string; status: number };

const createTicketSchema = z.object({
    name: z.string().min(1),
    description: z.string().optional(),
    basePrice: z.coerce.number().min(0),
    totalQuantity: z.coerce.number().min(1),
    minPerOrder: z.coerce.number().min(1).default(1),
    maxPerOrder: z.coerce.number().min(1).max(10).default(10),
    isFree: z.boolean().default(false),
    isHidden: z.boolean().default(false),
    saleStartAt: z.string().datetime().optional().nullable(),
    saleEndAt: z.string().datetime().optional().nullable(),
});

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

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const supabase = await createClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
            return errorResponse("Unauthorized", 401);
        }

        const result = await verifyOrganizerAccess(id, user.email!);
        if ("error" in result) {
            return errorResponse(result.error, result.status);
        }

        const tickets = await prisma.ticketType.findMany({
            where: { eventId: id },
            orderBy: { sortOrder: "asc" },
            include: {
                priceTiers: { orderBy: { sortOrder: "asc" } },
                _count: { select: { bookedTickets: true } },
            },
        });

        return successResponse(tickets);
    } catch (error) {
        console.error("Error fetching tickets:", error);
        return errorResponse("Failed to fetch tickets", 500);
    }
}

export async function POST(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const supabase = await createClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
            return errorResponse("Unauthorized", 401);
        }

        const result = await verifyOrganizerAccess(id, user.email!);
        if ("error" in result) {
            return errorResponse(result.error, result.status);
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
            where: { eventId: id },
            _max: { sortOrder: true },
        });

        const ticket = await prisma.ticketType.create({
            data: {
                eventId: id,
                name: data.name,
                description: data.description,
                basePrice: data.isFree ? 0 : data.basePrice,
                totalQuantity: data.totalQuantity,
                minPerOrder: data.minPerOrder,
                maxPerOrder: data.maxPerOrder,
                isFree: data.isFree,
                isHidden: data.isHidden,
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
