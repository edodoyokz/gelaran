import { type NextRequest } from "next/server";
import prisma from "@/lib/prisma/client";
import { successResponse, errorResponse } from "@/lib/api/response";
import { createClient } from "@/lib/supabase/server";
import { z } from "zod";

const bankAccountSchema = z.object({
    bankName: z.string().min(2, "Nama bank wajib diisi"),
    bankCode: z.string().optional(),
    accountNumber: z.string().min(5, "Nomor rekening minimal 5 digit").max(20),
    accountHolderName: z.string().min(2, "Nama pemilik rekening wajib diisi"),
    isPrimary: z.boolean().optional().default(false),
});

export async function GET() {
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
                    include: {
                        bankAccounts: {
                            orderBy: [{ isPrimary: "desc" }, { createdAt: "desc" }],
                        },
                    },
                },
            },
        });

        if (!organizer || organizer.role !== "ORGANIZER" || !organizer.organizerProfile) {
            return errorResponse("Not an organizer", 403);
        }

        return successResponse(organizer.organizerProfile.bankAccounts);
    } catch (error) {
        console.error("Error fetching bank accounts:", error);
        return errorResponse("Failed to fetch bank accounts", 500);
    }
}

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

        const body = await request.json();
        const parsed = bankAccountSchema.safeParse(body);

        if (!parsed.success) {
            return errorResponse("Validation error", 400, {
                errors: parsed.error.flatten().fieldErrors,
            });
        }

        const data = parsed.data;
        const profile = organizer.organizerProfile;

        const existingAccount = profile.bankAccounts.find(
            (acc) => acc.accountNumber === data.accountNumber && acc.bankName === data.bankName
        );

        if (existingAccount) {
            return errorResponse("Rekening bank ini sudah terdaftar", 400);
        }

        const isFirstAccount = profile.bankAccounts.length === 0;
        const shouldBePrimary = isFirstAccount || data.isPrimary;

        if (shouldBePrimary && profile.bankAccounts.length > 0) {
            await prisma.organizerBankAccount.updateMany({
                where: { organizerProfileId: profile.id },
                data: { isPrimary: false },
            });
        }

        const bankAccount = await prisma.organizerBankAccount.create({
            data: {
                organizerProfileId: profile.id,
                bankName: data.bankName,
                bankCode: data.bankCode,
                accountNumber: data.accountNumber,
                accountHolderName: data.accountHolderName,
                isPrimary: shouldBePrimary,
            },
        });

        return successResponse(bankAccount, undefined, 201);
    } catch (error) {
        console.error("Error creating bank account:", error);
        return errorResponse("Failed to create bank account", 500);
    }
}
