import { type NextRequest } from "next/server";
import prisma from "@/lib/prisma/client";
import { successResponse, errorResponse } from "@/lib/api/response";
import { createClient } from "@/lib/supabase/server";

async function getAuthenticatedUser() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user?.email) {
        return null;
    }

    return prisma.user.findUnique({
        where: { email: user.email },
        select: { id: true },
    });
}

export async function PUT(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const dbUser = await getAuthenticatedUser();

        if (!dbUser) {
            return errorResponse("Unauthorized", 401);
        }

        const notification = await prisma.notification.findUnique({
            where: { id },
            select: { userId: true },
        });

        if (!notification) {
            return errorResponse("Notification not found", 404);
        }

        if (notification.userId !== dbUser.id) {
            return errorResponse("Unauthorized", 403);
        }

        const body = await request.json();

        const updated = await prisma.notification.update({
            where: { id },
            data: {
                isRead: body.isRead ?? true,
                readAt: body.isRead ? new Date() : null,
            },
        });

        return successResponse({
            id: updated.id,
            isRead: updated.isRead,
            readAt: updated.readAt?.toISOString(),
        });
    } catch (error) {
        console.error("Error updating notification:", error);
        return errorResponse("Failed to update notification", 500);
    }
}

export async function DELETE(
    _request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const dbUser = await getAuthenticatedUser();

        if (!dbUser) {
            return errorResponse("Unauthorized", 401);
        }

        const notification = await prisma.notification.findUnique({
            where: { id },
            select: { userId: true },
        });

        if (!notification) {
            return errorResponse("Notification not found", 404);
        }

        if (notification.userId !== dbUser.id) {
            return errorResponse("Unauthorized", 403);
        }

        await prisma.notification.delete({
            where: { id },
        });

        return successResponse({ deleted: true });
    } catch (error) {
        console.error("Error deleting notification:", error);
        return errorResponse("Failed to delete notification", 500);
    }
}
