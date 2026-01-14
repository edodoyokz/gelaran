import { type NextRequest } from "next/server";
import prisma from "@/lib/prisma/client";
import { successResponse, errorResponse, paginationMeta } from "@/lib/api/response";
import { createClient } from "@/lib/supabase/server";

export async function GET(request: NextRequest) {
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

        const searchParams = request.nextUrl.searchParams;
        const page = parseInt(searchParams.get("page") || "1");
        const limit = parseInt(searchParams.get("limit") || "20");
        const skip = (page - 1) * limit;

        const [notifications, total] = await Promise.all([
            prisma.notification.findMany({
                where: { userId: dbUser.id },
                orderBy: { createdAt: "desc" },
                skip,
                take: limit,
            }),
            prisma.notification.count({
                where: { userId: dbUser.id },
            }),
        ]);

        const formattedNotifications = notifications.map((n) => ({
            id: n.id,
            type: n.type,
            title: n.title,
            message: n.message,
            isRead: n.isRead,
            createdAt: n.createdAt.toISOString(),
            metadata: n.data || {},
        }));

        return successResponse(formattedNotifications, paginationMeta(page, limit, total));
    } catch (error) {
        console.error("Error fetching notifications:", error);
        return errorResponse("Failed to fetch notifications", 500);
    }
}
