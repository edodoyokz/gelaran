import { type NextRequest } from "next/server";
import prisma from "@/lib/prisma/client";
import { successResponse, errorResponse } from "@/lib/api/response";
import { createClient } from "@/lib/supabase/server";
import { z } from "zod";

interface BankAccountRecord {
    id: string;
    bankName: string;
    accountNumber: string;
    accountHolderName: string;
    isPrimary: boolean;
}

function generatePayoutCode(): string {
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    let result = "PAY-";
    for (let i = 0; i < 10; i++) {
        result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
}

const withdrawSchema = z.object({
    amount: z.coerce.number().min(50000, "Minimum penarikan Rp 50.000"),
    bankAccountId: z.string().uuid("Pilih rekening bank"),
    notes: z.string().max(500).optional(),
});

export async function POST(request: NextRequest) {
    try {
        const supabase = await createClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
            return errorResponse("Unauthorized", 401);
        }

        const organizer = await prisma.user.findUnique({
            where: { email: user.email! },
            include: {
                organizerProfile: {
                    include: { bankAccounts: true },
                },
            },
        });

        if (!organizer || organizer.role !== "ORGANIZER" || !organizer.organizerProfile) {
            return errorResponse("Not an organizer", 403);
        }

        const profile = organizer.organizerProfile;
        const balance = Number(profile.walletBalance);

        const body = await request.json();
        const parsed = withdrawSchema.safeParse(body);

        if (!parsed.success) {
            return errorResponse("Validation error", 400, {
                errors: parsed.error.flatten().fieldErrors,
            });
        }

        const { amount, bankAccountId, notes } = parsed.data;

        if (amount > balance) {
            return errorResponse("Saldo tidak mencukupi", 400);
        }

        const bankAccount = profile.bankAccounts.find((b: BankAccountRecord) => b.id === bankAccountId);
        if (!bankAccount) {
            return errorResponse("Rekening bank tidak ditemukan", 404);
        }

        const fee = 2500;
        const netAmount = amount - fee;

        const payoutCode = generatePayoutCode();

        const [payout] = await prisma.$transaction([
            prisma.payout.create({
                data: {
                    organizerId: profile.id,
                    bankAccountId,
                    payoutCode,
                    amount,
                    fee,
                    netAmount,
                    status: "REQUESTED",
                    notes,
                    requestedBy: organizer.id,
                },
            }),
            prisma.organizerProfile.update({
                where: { id: profile.id },
                data: {
                    walletBalance: { decrement: amount },
                },
            }),
        ]);

        return successResponse(payout, undefined, 201);
    } catch (error) {
        console.error("Error creating payout:", error);
        return errorResponse("Failed to create payout request", 500);
    }
}
