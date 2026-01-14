import prisma from "@/lib/prisma/client";
import { successResponse, errorResponse } from "@/lib/api/response";
import { createClient } from "@/lib/supabase/server";

export async function GET() {
    try {
        const supabase = await createClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (!user || !user.email) {
            return errorResponse("Unauthorized", 401);
        }

        const admin = await prisma.user.findUnique({
            where: { email: user.email },
        });

        if (!admin || !["ADMIN", "SUPER_ADMIN"].includes(admin.role)) {
            return errorResponse("Admin access required", 403);
        }

        const events = await prisma.event.findMany({
            where: { deletedAt: null },
            orderBy: [
                { status: "asc" },
                { createdAt: "desc" },
            ],
            take: 100,
            include: {
                organizer: {
                    select: {
                        name: true,
                        organizerProfile: {
                            select: { organizationName: true },
                        },
                    },
                },
                category: { select: { name: true } },
                venue: { select: { name: true, city: true } },
                _count: { select: { bookings: true } },
                schedules: { take: 1, orderBy: { scheduleDate: "asc" } },
            },
        });

        return successResponse(events);
    } catch (error) {
        console.error("Error fetching admin events:", error);
        return errorResponse("Failed to fetch events", 500);
    }
}
