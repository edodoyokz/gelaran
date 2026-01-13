import { type NextRequest } from "next/server";
import prisma from "@/lib/prisma/client";
import { successResponse, errorResponse } from "@/lib/api/response";
import { createClient } from "@/lib/supabase/server";

interface RouteParams {
    params: Promise<{ eventId: string }>;
}

export async function GET(request: NextRequest, { params }: RouteParams) {
    try {
        const { eventId } = await params;

        const supabase = await createClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (!user || !user.email) {
            return errorResponse("Unauthorized", 401);
        }

        const dbUser = await prisma.user.findUnique({
            where: { email: user.email },
        });

        if (!dbUser) {
            return errorResponse("User not found", 404);
        }

        const wishlist = await prisma.wishlist.findUnique({
            where: {
                userId_eventId: {
                    userId: dbUser.id,
                    eventId,
                },
            },
        });

        return successResponse({
            isWishlisted: !!wishlist,
            wishlistId: wishlist?.id || null,
        });
    } catch (error) {
        console.error("Error checking wishlist:", error);
        return errorResponse("Failed to check wishlist", 500);
    }
}

export async function DELETE(request: NextRequest, { params }: RouteParams) {
    try {
        const { eventId } = await params;

        const supabase = await createClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (!user || !user.email) {
            return errorResponse("Unauthorized", 401);
        }

        const dbUser = await prisma.user.findUnique({
            where: { email: user.email },
        });

        if (!dbUser) {
            return errorResponse("User not found", 404);
        }

        const wishlist = await prisma.wishlist.findUnique({
            where: {
                userId_eventId: {
                    userId: dbUser.id,
                    eventId,
                },
            },
        });

        if (!wishlist) {
            return errorResponse("Wishlist item not found", 404);
        }

        await prisma.wishlist.delete({
            where: { id: wishlist.id },
        });

        return successResponse({ success: true });
    } catch (error) {
        console.error("Error removing from wishlist:", error);
        return errorResponse("Failed to remove from wishlist", 500);
    }
}
