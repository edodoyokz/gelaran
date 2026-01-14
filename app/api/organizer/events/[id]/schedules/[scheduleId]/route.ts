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
        return { error: "Only organizers can manage schedules", status: 403 };
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

const updateScheduleSchema = z.object({
    title: z.string().max(200).nullable().optional(),
    scheduleDate: z.string().optional(),
    startTime: z.string().optional(),
    endTime: z.string().optional(),
    description: z.string().nullable().optional(),
    locationOverride: z.string().nullable().optional(),
    isActive: z.boolean().optional(),
});

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string; scheduleId: string }> }
) {
    try {
        const { id, scheduleId } = await params;
        const supabase = await createClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
            return errorResponse("Unauthorized", 401);
        }

        const result = await verifyOrganizerAccess(id, user.email!);
        if ("error" in result) {
            return errorResponse(result.error, result.status);
        }

        const schedule = await prisma.eventSchedule.findUnique({
            where: { id: scheduleId },
            include: { event: { select: { id: true, title: true } } },
        });

        if (!schedule) {
            return errorResponse("Schedule not found", 404);
        }

        if (schedule.eventId !== id) {
            return errorResponse("Schedule does not belong to this event", 400);
        }

        return successResponse(schedule);
    } catch (error) {
        console.error("Error fetching schedule:", error);
        return errorResponse("Failed to fetch schedule", 500);
    }
}

export async function PUT(
    request: NextRequest,
    { params }: { params: Promise<{ id: string; scheduleId: string }> }
) {
    try {
        const { id: eventId, scheduleId } = await params;
        const supabase = await createClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
            return errorResponse("Unauthorized", 401);
        }

        const result = await verifyOrganizerAccess(eventId, user.email!);
        if ("error" in result) {
            return errorResponse(result.error, result.status);
        }

        const schedule = await prisma.eventSchedule.findUnique({
            where: { id: scheduleId },
        });

        if (!schedule) {
            return errorResponse("Schedule not found", 404);
        }

        if (schedule.eventId !== eventId) {
            return errorResponse("Schedule does not belong to this event", 400);
        }

        const body = await request.json();
        const parsed = updateScheduleSchema.safeParse(body);

        if (!parsed.success) {
            return errorResponse("Validation error", 400, {
                errors: parsed.error.flatten().fieldErrors,
            });
        }

        const data = parsed.data;
        const updateData: Record<string, unknown> = {};

        if (data.title !== undefined) updateData.title = data.title;
        if (data.scheduleDate !== undefined) updateData.scheduleDate = new Date(data.scheduleDate);
        if (data.startTime !== undefined) updateData.startTime = new Date(`1970-01-01T${data.startTime}:00`);
        if (data.endTime !== undefined) updateData.endTime = new Date(`1970-01-01T${data.endTime}:00`);
        if (data.description !== undefined) updateData.description = data.description;
        if (data.locationOverride !== undefined) updateData.locationOverride = data.locationOverride;
        if (data.isActive !== undefined) updateData.isActive = data.isActive;

        const updated = await prisma.eventSchedule.update({
            where: { id: scheduleId },
            data: updateData,
        });

        return successResponse(updated);
    } catch (error) {
        console.error("Error updating schedule:", error);
        return errorResponse("Failed to update schedule", 500);
    }
}

export async function DELETE(
    request: NextRequest,
    { params }: { params: Promise<{ id: string; scheduleId: string }> }
) {
    try {
        const { id: eventId, scheduleId } = await params;
        const supabase = await createClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
            return errorResponse("Unauthorized", 401);
        }

        const result = await verifyOrganizerAccess(eventId, user.email!);
        if ("error" in result) {
            return errorResponse(result.error, result.status);
        }

        const schedule = await prisma.eventSchedule.findUnique({
            where: { id: scheduleId },
            include: {
                _count: {
                    select: { bookings: true },
                },
            },
        });

        if (!schedule) {
            return errorResponse("Schedule not found", 404);
        }

        if (schedule.eventId !== eventId) {
            return errorResponse("Schedule does not belong to this event", 400);
        }

        if (schedule._count.bookings > 0) {
            return errorResponse(
                `Cannot delete schedule with ${schedule._count.bookings} booking(s). Deactivate instead.`,
                400
            );
        }

        await prisma.eventSchedule.delete({
            where: { id: scheduleId },
        });

        return successResponse({ message: "Schedule deleted successfully" });
    } catch (error) {
        console.error("Error deleting schedule:", error);
        return errorResponse("Failed to delete schedule", 500);
    }
}
