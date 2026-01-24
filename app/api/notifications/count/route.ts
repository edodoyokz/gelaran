import prisma from "@/lib/prisma/client";
import { successResponse, errorResponse } from "@/lib/api/response";
import { createClient } from "@/lib/supabase/server";

export async function GET() {
    try {
        const supabase = await createClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (!user?.email) {
            return errorResponse("Unauthorized", 401);
        }

        const dbUser = await prisma.user.findUnique({
            where: { email: user.email },
            select: { id: true },
        });

        if (!dbUser) {
            return errorResponse("User not found", 404);
        }

        const unreadCount = await prisma.notification.count({
            where: {
                userId: dbUser.id,
                isRead: false,
            },
        });

        return successResponse({ unreadCount });
    } catch (error) {
        console.error("Error fetching notification count:", error);
        return errorResponse("Failed to fetch notification count", 500);
    }
}
