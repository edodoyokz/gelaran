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

        const payouts = await prisma.payout.findMany({
            orderBy: [
                { status: "asc" },
                { createdAt: "desc" },
            ],
            take: 100,
            include: {
                organizerProfile: {
                    include: {
                        user: { select: { name: true, email: true } },
                    },
                },
                bankAccount: true,
            },
        });

        return successResponse(payouts);
    } catch (error) {
        console.error("Error fetching payouts:", error);
        return errorResponse("Failed to fetch payouts", 500);
    }
}
