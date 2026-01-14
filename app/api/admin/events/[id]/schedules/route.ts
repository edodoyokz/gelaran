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

const createScheduleSchema = z.object({
    title: z.string().max(200).nullable().optional(),
    scheduleDate: z.string(),
    startTime: z.string(),
    endTime: z.string(),
    description: z.string().nullable().optional(),
    locationOverride: z.string().nullable().optional(),
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

        const schedules = await prisma.eventSchedule.findMany({
            where: { eventId },
            orderBy: [{ scheduleDate: "asc" }, { startTime: "asc" }],
        });

        return successResponse(schedules);
    } catch (error) {
        console.error("Error fetching schedules:", error);
        return errorResponse("Failed to fetch schedules", 500);
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
        const parsed = createScheduleSchema.safeParse(body);

        if (!parsed.success) {
            return errorResponse("Validation error", 400, {
                errors: parsed.error.flatten().fieldErrors,
            });
        }

        const data = parsed.data;

        const maxSortOrder = await prisma.eventSchedule.aggregate({
            where: { eventId },
            _max: { sortOrder: true },
        });

        const schedule = await prisma.eventSchedule.create({
            data: {
                eventId,
                title: data.title,
                scheduleDate: new Date(data.scheduleDate),
                startTime: new Date(`1970-01-01T${data.startTime}:00`),
                endTime: new Date(`1970-01-01T${data.endTime}:00`),
                description: data.description,
                locationOverride: data.locationOverride,
                isActive: data.isActive,
                sortOrder: (maxSortOrder._max.sortOrder || 0) + 1,
            },
        });

        return successResponse(schedule, undefined, 201);
    } catch (error) {
        console.error("Error creating schedule:", error);
        return errorResponse("Failed to create schedule", 500);
    }
}
