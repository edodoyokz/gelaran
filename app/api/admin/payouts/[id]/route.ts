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

const updatePayoutSchema = z.object({
    status: z.enum(["APPROVED", "PROCESSING", "COMPLETED", "REJECTED"]),
    rejectionReason: z.string().optional(),
    proofDocumentUrl: z.string().url().optional(),
});

export async function PUT(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const authResult = await verifyAdmin();

        if ("error" in authResult) {
            return errorResponse(authResult.error, authResult.status);
        }

        const payout = await prisma.payout.findUnique({
            where: { id },
            include: { organizerProfile: true },
        });

        if (!payout) {
            return errorResponse("Payout not found", 404);
        }

        const body = await request.json();
        const parsed = updatePayoutSchema.safeParse(body);

        if (!parsed.success) {
            return errorResponse("Validation error", 400, {
                errors: parsed.error.flatten().fieldErrors,
            });
        }

        const { status, rejectionReason, proofDocumentUrl } = parsed.data;

        const updateData: Record<string, unknown> = {
            status,
            processedBy: authResult.admin.id,
        };

        if (status === "APPROVED") {
            updateData.approvedAt = new Date();
            updateData.status = "PROCESSING";
        }

        if (status === "COMPLETED") {
            updateData.completedAt = new Date();

            await prisma.organizerProfile.update({
                where: { id: payout.organizerId },
                data: {
                    totalWithdrawn: { increment: payout.amount },
                },
            });
        }

        if (status === "REJECTED") {
            updateData.rejectionReason = rejectionReason;

            await prisma.organizerProfile.update({
                where: { id: payout.organizerId },
                data: {
                    walletBalance: { increment: payout.amount },
                },
            });
        }

        if (proofDocumentUrl) {
            updateData.proofDocumentUrl = proofDocumentUrl;
        }

        const updatedPayout = await prisma.payout.update({
            where: { id },
            data: updateData,
            include: {
                organizerProfile: {
                    include: {
                        user: { select: { name: true, email: true } },
                    },
                },
                bankAccount: true,
            },
        });

        return successResponse(updatedPayout);
    } catch (error) {
        console.error("Error updating payout:", error);
        return errorResponse("Failed to update payout", 500);
    }
}
