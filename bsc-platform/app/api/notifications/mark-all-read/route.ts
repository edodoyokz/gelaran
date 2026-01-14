import prisma from "@/lib/prisma/client";
import { successResponse, errorResponse } from "@/lib/api/response";
import { createClient } from "@/lib/supabase/server";

export async function PUT() {
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

        const result = await prisma.notification.updateMany({
            where: {
                userId: dbUser.id,
                isRead: false,
            },
            data: {
                isRead: true,
                readAt: new Date(),
            },
        });

        return successResponse({ markedAsRead: result.count });
    } catch (error) {
        console.error("Error marking all notifications as read:", error);
        return errorResponse("Failed to mark notifications as read", 500);
    }
}
