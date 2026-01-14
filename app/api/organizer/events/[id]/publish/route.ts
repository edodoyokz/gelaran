import { type NextRequest } from "next/server";
import prisma from "@/lib/prisma/client";
import { successResponse, errorResponse } from "@/lib/api/response";
import { createClient } from "@/lib/supabase/server";

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

        const organizer = await prisma.user.findUnique({
            where: { email: user.email! },
        });

        if (!organizer || organizer.role !== "ORGANIZER") {
            return errorResponse("Only organizers can publish events", 403);
        }

        const event = await prisma.event.findUnique({
            where: { id },
            include: {
                schedules: true,
                ticketTypes: true,
            },
        });

        if (!event) {
            return errorResponse("Event not found", 404);
        }

        if (event.organizerId !== organizer.id) {
            return errorResponse("Not authorized to publish this event", 403);
        }

        if (event.schedules.length === 0) {
            return errorResponse("Event must have at least one schedule", 400);
        }

        if (event.ticketTypes.length === 0) {
            return errorResponse("Event must have at least one ticket type", 400);
        }

        if (!event.title || !event.description || !event.categoryId) {
            return errorResponse("Event must have title, description, and category", 400);
        }

        const updatedEvent = await prisma.event.update({
            where: { id },
            data: {
                status: "PENDING_REVIEW",
                publishAt: new Date(),
            },
        });

        return successResponse({
            ...updatedEvent,
            message: "Event submitted for review",
        });
    } catch (error) {
        console.error("Error publishing event:", error);
        return errorResponse("Failed to publish event", 500);
    }
}
