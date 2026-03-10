import { readFile } from "fs/promises";
import path from "path";
import type { Prisma, PrismaClient } from "@prisma/client";

export interface PlatformSettings {
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

export interface PlatformSettingsRow {
    id: string;
    settings_key: string;
    platform_name: string;
    platform_email: string;
    platform_phone: string;
    platform_fee_percentage: string | number;
    min_withdrawal_amount: string | number;
    max_tickets_per_order: number;
    booking_expiry_minutes: number;
    enable_email_notifications: boolean;
    enable_sms_notifications: boolean;
    maintenance_mode: boolean;
    payment_gateway_midtrans_enabled: boolean;
    payment_gateway_xendit_enabled: boolean;
    created_at: Date;
    updated_at: Date;
}

export const DEFAULT_PLATFORM_SETTINGS: PlatformSettings = {
    platformName: "Gelaran",
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

const LEGACY_SETTINGS_FILE = path.join(process.cwd(), "data", "platform-settings.json");
const SETTINGS_KEY = "default";

type PlatformSettingsUpdate = Partial<PlatformSettings> & {
    paymentGateways?: Partial<PlatformSettings["paymentGateways"]>;
};

export function mergePlatformSettings(
    current: PlatformSettings,
    update: PlatformSettingsUpdate
): PlatformSettings {
    return {
        ...current,
        ...update,
        paymentGateways: {
            ...current.paymentGateways,
            ...update.paymentGateways,
        },
    };
}

export function toPlatformSettingsAuditJson(settings: PlatformSettings): Prisma.InputJsonObject {
    return {
        platformName: settings.platformName,
        platformEmail: settings.platformEmail,
        platformPhone: settings.platformPhone,
        platformFeePercentage: settings.platformFeePercentage,
        minWithdrawalAmount: settings.minWithdrawalAmount,
        maxTicketsPerOrder: settings.maxTicketsPerOrder,
        bookingExpiryMinutes: settings.bookingExpiryMinutes,
        enableEmailNotifications: settings.enableEmailNotifications,
        enableSmsNotifications: settings.enableSmsNotifications,
        maintenanceMode: settings.maintenanceMode,
        paymentGateways: {
            midtrans: settings.paymentGateways.midtrans,
            xendit: settings.paymentGateways.xendit,
        },
    };
}

export function toPlatformSettingsResponse(row: PlatformSettingsRow): PlatformSettings {
    return {
        platformName: row.platform_name,
        platformEmail: row.platform_email,
        platformPhone: row.platform_phone,
        platformFeePercentage: Number(row.platform_fee_percentage),
        minWithdrawalAmount: Number(row.min_withdrawal_amount),
        maxTicketsPerOrder: row.max_tickets_per_order,
        bookingExpiryMinutes: row.booking_expiry_minutes,
        enableEmailNotifications: row.enable_email_notifications,
        enableSmsNotifications: row.enable_sms_notifications,
        maintenanceMode: row.maintenance_mode,
        paymentGateways: {
            midtrans: row.payment_gateway_midtrans_enabled,
            xendit: row.payment_gateway_xendit_enabled,
        },
    };
}

async function readLegacyPlatformSettings(): Promise<PlatformSettingsUpdate | null> {
    try {
        const raw = await readFile(LEGACY_SETTINGS_FILE, "utf8");
        const parsed = JSON.parse(raw) as PlatformSettingsUpdate;
        return parsed;
    } catch {
        return null;
    }
}

async function insertPlatformSettings(
    prisma: PrismaClient,
    settings: PlatformSettings
): Promise<PlatformSettingsRow> {
    const rows = await prisma.$queryRaw<PlatformSettingsRow[]>`
        INSERT INTO "platform_settings" (
            "settings_key",
            "platform_name",
            "platform_email",
            "platform_phone",
            "platform_fee_percentage",
            "min_withdrawal_amount",
            "max_tickets_per_order",
            "booking_expiry_minutes",
            "enable_email_notifications",
            "enable_sms_notifications",
            "maintenance_mode",
            "payment_gateway_midtrans_enabled",
            "payment_gateway_xendit_enabled"
        )
        VALUES (
            ${SETTINGS_KEY},
            ${settings.platformName},
            ${settings.platformEmail},
            ${settings.platformPhone},
            ${settings.platformFeePercentage},
            ${settings.minWithdrawalAmount},
            ${settings.maxTicketsPerOrder},
            ${settings.bookingExpiryMinutes},
            ${settings.enableEmailNotifications},
            ${settings.enableSmsNotifications},
            ${settings.maintenanceMode},
            ${settings.paymentGateways.midtrans},
            ${settings.paymentGateways.xendit}
        )
        ON CONFLICT ("settings_key") DO UPDATE SET
            "updated_at" = CURRENT_TIMESTAMP
        RETURNING *
    `;

    return rows[0];
}

export async function getOrCreatePlatformSettingsRow(
    prisma: PrismaClient
): Promise<PlatformSettingsRow> {
    const existingRows = await prisma.$queryRaw<PlatformSettingsRow[]>`
        SELECT *
        FROM "platform_settings"
        WHERE "settings_key" = ${SETTINGS_KEY}
        LIMIT 1
    `;

    if (existingRows[0]) {
        return existingRows[0];
    }

    const legacy = await readLegacyPlatformSettings();
    const seededSettings = mergePlatformSettings(DEFAULT_PLATFORM_SETTINGS, legacy ?? {});

    return insertPlatformSettings(prisma, seededSettings);
}

export async function savePlatformSettings(
    prisma: PrismaClient,
    settings: PlatformSettings
): Promise<PlatformSettingsRow> {
    const rows = await prisma.$queryRaw<PlatformSettingsRow[]>`
        UPDATE "platform_settings"
        SET
            "platform_name" = ${settings.platformName},
            "platform_email" = ${settings.platformEmail},
            "platform_phone" = ${settings.platformPhone},
            "platform_fee_percentage" = ${settings.platformFeePercentage},
            "min_withdrawal_amount" = ${settings.minWithdrawalAmount},
            "max_tickets_per_order" = ${settings.maxTicketsPerOrder},
            "booking_expiry_minutes" = ${settings.bookingExpiryMinutes},
            "enable_email_notifications" = ${settings.enableEmailNotifications},
            "enable_sms_notifications" = ${settings.enableSmsNotifications},
            "maintenance_mode" = ${settings.maintenanceMode},
            "payment_gateway_midtrans_enabled" = ${settings.paymentGateways.midtrans},
            "payment_gateway_xendit_enabled" = ${settings.paymentGateways.xendit},
            "updated_at" = CURRENT_TIMESTAMP
        WHERE "settings_key" = ${SETTINGS_KEY}
        RETURNING *
    `;

    return rows[0] ?? insertPlatformSettings(prisma, settings);
}
