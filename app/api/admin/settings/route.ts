import { z } from "zod";
import prisma from "@/lib/prisma/client";
import { successResponse, errorResponse } from "@/lib/api/response";
import { createRequestLogger } from "@/lib/logging/logger";
import { attachRequestIdHeader, createRequestContext } from "@/lib/logging/request";
import {
    getOrCreatePlatformSettingsRow,
    mergePlatformSettings,
    savePlatformSettings,
    toPlatformSettingsAuditJson,
    toPlatformSettingsResponse,
} from "@/lib/platform-settings";
import { createClient } from "@/lib/supabase/server";

type AdminResult = { admin: { id: string; role: string } } | { error: string; status: number };

async function verifySuperAdmin(): Promise<AdminResult> {
    const supabase = await createClient();
    const {
        data: { user },
    } = await supabase.auth.getUser();

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
    paymentGateways: z
        .object({
            midtrans: z.boolean(),
            xendit: z.boolean(),
        })
        .optional(),
});

export async function GET(request: Request) {
    const requestContext = createRequestContext(request, "/api/admin/settings");
    const logger = createRequestLogger(requestContext);
    const fail = (message: string, code = 400, details?: Record<string, unknown>) => {
        logger.warn("admin.settings.request_failed", message, {
            statusCode: code,
            details,
        });

        return attachRequestIdHeader(
            errorResponse(message, code, details),
            requestContext.requestId
        );
    };
    const ok = <T>(data: T, status = 200) =>
        attachRequestIdHeader(successResponse(data, undefined, status), requestContext.requestId);

    try {
        logger.info("admin.settings.read_requested", "Platform settings requested");
        const authResult = await verifySuperAdmin();

        if ("error" in authResult) {
            return fail(authResult.error, authResult.status);
        }

        const settingsRow = await getOrCreatePlatformSettingsRow(prisma);
        const settings = toPlatformSettingsResponse(settingsRow);

        logger.info("admin.settings.read_succeeded", "Platform settings loaded", {
            settingsId: settingsRow.id,
        });

        return ok(settings);
    } catch (error) {
        logger.error("admin.settings.read_failed", "Failed to fetch platform settings", error);
        return fail("Failed to fetch settings", 500);
    }
}

export async function PUT(request: Request) {
    const requestContext = createRequestContext(request, "/api/admin/settings");
    const logger = createRequestLogger(requestContext);
    const fail = (message: string, code = 400, details?: Record<string, unknown>) => {
        logger.warn("admin.settings.request_failed", message, {
            statusCode: code,
            details,
        });

        return attachRequestIdHeader(
            errorResponse(message, code, details),
            requestContext.requestId
        );
    };
    const ok = <T>(data: T, status = 200) =>
        attachRequestIdHeader(successResponse(data, undefined, status), requestContext.requestId);

    try {
        logger.info("admin.settings.update_requested", "Platform settings update requested");
        const authResult = await verifySuperAdmin();

        if ("error" in authResult) {
            return fail(authResult.error, authResult.status);
        }

        const body = await request.json();
        const parsed = updateSettingsSchema.safeParse(body);

        if (!parsed.success) {
            return fail("Validation error", 400, {
                errors: parsed.error.flatten().fieldErrors,
            });
        }

        const currentRow = await getOrCreatePlatformSettingsRow(prisma);
        const currentSettings = toPlatformSettingsResponse(currentRow);
        const nextSettings = mergePlatformSettings(currentSettings, parsed.data);
        const updatedRow = await savePlatformSettings(prisma, nextSettings);
        const updatedSettings = toPlatformSettingsResponse(updatedRow);

        await prisma.auditLog.create({
            data: {
                userId: authResult.admin.id,
                action: "UPDATE",
                entityType: "PlatformSettings",
                entityId: updatedRow.id,
                oldValues: toPlatformSettingsAuditJson(currentSettings),
                newValues: toPlatformSettingsAuditJson(updatedSettings),
            },
        });

        logger.info("admin.settings.update_succeeded", "Platform settings updated", {
            settingsId: updatedRow.id,
            adminId: authResult.admin.id,
        });

        return ok(updatedSettings);
    } catch (error) {
        logger.error("admin.settings.update_failed", "Failed to update platform settings", error);
        return fail("Failed to update settings", 500);
    }
}
