import { successResponse, errorResponse } from "@/lib/api/response";
import { createClient } from "@/lib/supabase/server";
import prisma from "@/lib/prisma/client";
import { z } from "zod";
import { readFile, writeFile } from "fs/promises";
import path from "path";

type AdminResult = { admin: { id: string; role: string } } | { error: string; status: number };

async function verifySuperAdmin(): Promise<AdminResult> {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user || !user.email) {
        return { error: "Unauthorized", status: 401 };
    }

    const admin = await prisma.user.findUnique({
        where: { email: user.email },
    });

    if (!admin || admin.role !== "SUPER_ADMIN") {
        return { error: "Super Admin access required", status: 403 };
    }

    return { admin: { id: admin.id, role: admin.role } };
}

const SETTINGS_FILE = path.join(process.cwd(), "data", "platform-settings.json");

interface PlatformSettings {
    platformName: string;
    platformEmail: string;
    platformPhone: string;
    platformFeePercentage: number;
    minWithdrawalAmount: number;
    maxTicketsPerOrder: number;
    bookingExpiryMinutes: number;
    enableEmailNotifications: boolean;
    enableSmsNotifications: boolean;
    maintenanceMode: boolean;
    paymentGateways: {
        midtrans: boolean;
        xendit: boolean;
    };
}

const DEFAULT_SETTINGS: PlatformSettings = {
    platformName: "BSC Ticketing",
    platformEmail: "support@bsc-ticketing.com",
    platformPhone: "+62 21 1234567",
    platformFeePercentage: 5,
    minWithdrawalAmount: 100000,
    maxTicketsPerOrder: 10,
    bookingExpiryMinutes: 60,
    enableEmailNotifications: true,
    enableSmsNotifications: false,
    maintenanceMode: false,
    paymentGateways: {
        midtrans: true,
        xendit: false,
    },
};

async function getSettings(): Promise<PlatformSettings> {
    try {
        const data = await readFile(SETTINGS_FILE, "utf-8");
        return { ...DEFAULT_SETTINGS, ...JSON.parse(data) };
    } catch {
        return DEFAULT_SETTINGS;
    }
}

async function saveSettings(settings: PlatformSettings): Promise<void> {
    const dir = path.dirname(SETTINGS_FILE);
    const { mkdir } = await import("fs/promises");
    await mkdir(dir, { recursive: true });
    await writeFile(SETTINGS_FILE, JSON.stringify(settings, null, 2), "utf-8");
}

export async function GET() {
    try {
        const authResult = await verifySuperAdmin();

        if ("error" in authResult) {
            return errorResponse(authResult.error, authResult.status);
        }

        const settings = await getSettings();
        return successResponse(settings);
    } catch (error) {
        console.error("Error fetching settings:", error);
        return errorResponse("Failed to fetch settings", 500);
    }
}

const updateSettingsSchema = z.object({
    platformName: z.string().min(1).max(100).optional(),
    platformEmail: z.string().email().optional(),
    platformPhone: z.string().min(5).max(20).optional(),
    platformFeePercentage: z.number().min(0).max(100).optional(),
    minWithdrawalAmount: z.number().min(0).optional(),
    maxTicketsPerOrder: z.number().int().min(1).max(100).optional(),
    bookingExpiryMinutes: z.number().int().min(5).max(1440).optional(),
    enableEmailNotifications: z.boolean().optional(),
    enableSmsNotifications: z.boolean().optional(),
    maintenanceMode: z.boolean().optional(),
    paymentGateways: z.object({
        midtrans: z.boolean(),
        xendit: z.boolean(),
    }).optional(),
});

export async function PUT(request: Request) {
    try {
        const authResult = await verifySuperAdmin();

        if ("error" in authResult) {
            return errorResponse(authResult.error, authResult.status);
        }

        const body = await request.json();
        const parsed = updateSettingsSchema.safeParse(body);

        if (!parsed.success) {
            return errorResponse("Validation error", 400, {
                errors: parsed.error.flatten().fieldErrors,
            });
        }

        const currentSettings = await getSettings();
        const newSettings = { ...currentSettings, ...parsed.data };
        await saveSettings(newSettings);

        return successResponse(newSettings);
    } catch (error) {
        console.error("Error updating settings:", error);
        return errorResponse("Failed to update settings", 500);
    }
}
