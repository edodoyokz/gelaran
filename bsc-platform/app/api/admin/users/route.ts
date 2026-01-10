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

        const users = await prisma.user.findMany({
            where: { deletedAt: null },
            orderBy: { createdAt: "desc" },
            take: 100,
            include: {
                organizerProfile: {
                    select: {
                        organizationName: true,
                        isVerified: true,
                    },
                },
                _count: {
                    select: { bookings: true, events: true },
                },
            },
        });

        return successResponse(users);
    } catch (error) {
        console.error("Error fetching users:", error);
        return errorResponse("Failed to fetch users", 500);
    }
}
