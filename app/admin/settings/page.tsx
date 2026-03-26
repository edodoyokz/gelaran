"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { Bell, Building2, CreditCard, Loader2, Percent, Save, Shield } from "lucide-react";
import {
    AdminMetricCard,
    AdminNotice,
    AdminStatusBadge,
    AdminSurface,
    AdminWorkspacePage,
} from "@/components/admin/admin-workspace";
import { useToast } from "@/components/ui/toast-provider";

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

export default function AdminSettingsPage() {
    const { showToast } = useToast();
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [settings, setSettings] = useState<PlatformSettings>(DEFAULT_SETTINGS);

    const loadSettings = useCallback(async () => {
        try {
            setIsLoading(true);
            setError(null);
            const [settingsRes, commissionRes] = await Promise.all([
                fetch("/api/admin/settings"),
                fetch("/api/admin/settings/commission"),
            ]);

            if (!settingsRes.ok) {
                setError("Failed to load platform settings");
                return;
            }

            const settingsData = await settingsRes.json();
            const commissionData = await commissionRes.json();

            if (settingsData.success) {
                setSettings({
                    ...settingsData.data,
                    platformFeePercentage: commissionData.success
                        ? commissionData.data.commissionValue
                        : settingsData.data.platformFeePercentage,
                });
            }
        } catch {
            setError("Failed to load platform settings");
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        loadSettings();
    }, [loadSettings]);

    const handleSave = async () => {
        try {
            setIsSaving(true);
            const { platformFeePercentage, ...otherSettings } = settings;

            const [settingsRes, commissionRes] = await Promise.all([
                fetch("/api/admin/settings", {
                    method: "PUT",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(otherSettings),
                }),
                fetch("/api/admin/settings/commission", {
                    method: "PUT",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ commissionValue: platformFeePercentage }),
                }),
            ]);

            const [settingsData, commissionData] = await Promise.all([
                settingsRes.json(),
                commissionRes.json(),
            ]);

            if (!settingsData.success || !commissionData.success) {
                showToast("Failed to save settings", "error");
                return;
            }

            showToast("Settings saved", "success");
        } catch {
            showToast("Failed to save settings", "error");
        } finally {
            setIsSaving(false);
        }
    };

    const toggleBoolean = (key: "enableEmailNotifications" | "enableSmsNotifications" | "maintenanceMode") => {
        setSettings((current) => ({ ...current, [key]: !current[key] }));
    };

    const paymentGatewaySummary = useMemo(() => [
        settings.paymentGateways.midtrans ? "Midtrans" : null,
        settings.paymentGateways.xendit ? "Xendit" : null,
    ].filter(Boolean).join(", ") || "No gateways enabled", [settings.paymentGateways.midtrans, settings.paymentGateways.xendit]);

    if (isLoading) {
        return (
            <div className="flex min-h-[60vh] items-center justify-center">
                <Loader2 className="h-10 w-10 animate-spin text-(--accent-primary)" />
            </div>
        );
    }

    if (error) {
        return (
            <AdminWorkspacePage eyebrow="Admin settings" title="Platform controls" description="Configure platform-wide defaults for payouts, notifications, and operational risk.">
                <AdminNotice tone="warning" title="Settings are unavailable" description={error} actionHref="/admin" actionLabel="Back to dashboard" />
            </AdminWorkspacePage>
        );
    }

    return (
        <AdminWorkspacePage
            eyebrow="Admin settings"
            title="Platform controls"
            description="Configure platform-wide defaults for payouts, notifications, and operational risk."
            actions={
                <button
                    type="button"
                    onClick={handleSave}
                    disabled={isSaving}
                    className="inline-flex items-center gap-2 rounded-full bg-(--accent-gradient) px-4 py-2 text-sm font-semibold text-white shadow-(--shadow-glow) disabled:opacity-60"
                >
                    {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                    Save settings
                </button>
            }
        >
            <AdminNotice
                tone={settings.maintenanceMode ? "warning" : "info"}
                title={settings.maintenanceMode ? "Maintenance mode is enabled" : "Platform is operating normally"}
                description={settings.maintenanceMode ? "Public customer-facing flows may be restricted while the team performs maintenance." : "The workspace is configured for normal platform operation."}
            />

            <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                <AdminMetricCard label="Platform fee" value={`${settings.platformFeePercentage}%`} icon={Percent} tone="accent" meta="Default commission for organizers" />
                <AdminMetricCard label="Min withdrawal" value={new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(settings.minWithdrawalAmount)} icon={CreditCard} meta="Payout minimum threshold" />
                <AdminMetricCard label="Booking expiry" value={`${settings.bookingExpiryMinutes} min`} icon={Shield} meta={`Max ${settings.maxTicketsPerOrder} tickets per order`} />
                <AdminMetricCard label="Notifications" value={settings.enableEmailNotifications || settings.enableSmsNotifications ? "Enabled" : "Limited"} icon={Bell} tone="success" meta={paymentGatewaySummary} />
            </section>

            <section className="grid gap-6 xl:grid-cols-[1fr_1fr]">
                <AdminSurface title="General platform identity" description="Core business and support contact details used across the product.">
                    <div className="grid gap-4 md:grid-cols-2">
                        <label className="space-y-2 text-sm text-(--text-secondary)">
                            <span>Platform name</span>
                            <input value={settings.platformName} onChange={(event) => setSettings((current) => ({ ...current, platformName: event.target.value }))} className="w-full rounded-2xl border border-(--border) bg-(--surface-elevated) px-4 py-3 text-foreground outline-none" />
                        </label>
                        <label className="space-y-2 text-sm text-(--text-secondary)">
                            <span>Support email</span>
                            <input value={settings.platformEmail} onChange={(event) => setSettings((current) => ({ ...current, platformEmail: event.target.value }))} className="w-full rounded-2xl border border-(--border) bg-(--surface-elevated) px-4 py-3 text-foreground outline-none" />
                        </label>
                        <label className="space-y-2 text-sm text-(--text-secondary) md:col-span-2">
                            <span>Support phone</span>
                            <input value={settings.platformPhone} onChange={(event) => setSettings((current) => ({ ...current, platformPhone: event.target.value }))} className="w-full rounded-2xl border border-(--border) bg-(--surface-elevated) px-4 py-3 text-foreground outline-none" />
                        </label>
                    </div>
                </AdminSurface>

                <AdminSurface title="Fees and limits" description="Control platform commission and purchasing guardrails.">
                    <div className="grid gap-4 md:grid-cols-2">
                        <label className="space-y-2 text-sm text-(--text-secondary)">
                            <span>Platform fee (%)</span>
                            <input type="number" value={settings.platformFeePercentage} onChange={(event) => setSettings((current) => ({ ...current, platformFeePercentage: Number(event.target.value) }))} className="w-full rounded-2xl border border-(--border) bg-(--surface-elevated) px-4 py-3 text-foreground outline-none" />
                        </label>
                        <label className="space-y-2 text-sm text-(--text-secondary)">
                            <span>Minimum withdrawal</span>
                            <input type="number" value={settings.minWithdrawalAmount} onChange={(event) => setSettings((current) => ({ ...current, minWithdrawalAmount: Number(event.target.value) }))} className="w-full rounded-2xl border border-(--border) bg-(--surface-elevated) px-4 py-3 text-foreground outline-none" />
                        </label>
                        <label className="space-y-2 text-sm text-(--text-secondary)">
                            <span>Max tickets per order</span>
                            <input type="number" value={settings.maxTicketsPerOrder} onChange={(event) => setSettings((current) => ({ ...current, maxTicketsPerOrder: Number(event.target.value) }))} className="w-full rounded-2xl border border-(--border) bg-(--surface-elevated) px-4 py-3 text-foreground outline-none" />
                        </label>
                        <label className="space-y-2 text-sm text-(--text-secondary)">
                            <span>Booking expiry (minutes)</span>
                            <input type="number" value={settings.bookingExpiryMinutes} onChange={(event) => setSettings((current) => ({ ...current, bookingExpiryMinutes: Number(event.target.value) }))} className="w-full rounded-2xl border border-(--border) bg-(--surface-elevated) px-4 py-3 text-foreground outline-none" />
                        </label>
                    </div>
                </AdminSurface>
            </section>

            <section className="grid gap-6 xl:grid-cols-[1fr_1fr]">
                <AdminSurface title="Communication toggles" description="Control which transactional channels are active from the admin layer.">
                    <div className="space-y-4">
                        {[
                            {
                                label: "Email notifications",
                                enabled: settings.enableEmailNotifications,
                                onToggle: () => toggleBoolean("enableEmailNotifications"),
                            },
                            {
                                label: "SMS notifications",
                                enabled: settings.enableSmsNotifications,
                                onToggle: () => toggleBoolean("enableSmsNotifications"),
                            },
                            {
                                label: "Maintenance mode",
                                enabled: settings.maintenanceMode,
                                onToggle: () => toggleBoolean("maintenanceMode"),
                            },
                        ].map((item) => (
                            <div key={item.label} className="flex items-center justify-between rounded-2xl border border-(--border) bg-(--surface-elevated) p-4">
                                <div>
                                    <p className="text-sm font-semibold text-foreground">{item.label}</p>
                                    <p className="mt-1 text-sm text-(--text-secondary)">{item.enabled ? "Enabled" : "Disabled"}</p>
                                </div>
                                <button type="button" onClick={item.onToggle} className={`inline-flex h-10 items-center rounded-full px-4 text-sm font-semibold ${item.enabled ? "bg-(--accent-gradient) text-white" : "border border-(--border) bg-(--surface) text-foreground"}`}>
                                    {item.enabled ? "On" : "Off"}
                                </button>
                            </div>
                        ))}
                    </div>
                </AdminSurface>

                <AdminSurface title="Payment gateway availability" description="Workspace-level visibility over which payment providers are enabled.">
                    <div className="space-y-4">
                        {[
                            ["Midtrans", settings.paymentGateways.midtrans],
                            ["Xendit", settings.paymentGateways.xendit],
                        ].map(([label, enabled]) => (
                            <div key={String(label)} className="flex items-center justify-between rounded-2xl border border-(--border) bg-(--surface-elevated) p-4">
                                <div className="flex items-center gap-3">
                                    <Building2 className="h-5 w-5 text-(--accent-primary)" />
                                    <div>
                                        <p className="text-sm font-semibold text-foreground">{label}</p>
                                        <p className="mt-1 text-sm text-(--text-secondary)">Gateway status managed from admin configuration.</p>
                                    </div>
                                </div>
                                <AdminStatusBadge label={enabled ? "Enabled" : "Disabled"} tone={enabled ? "success" : "default"} />
                            </div>
                        ))}
                    </div>
                </AdminSurface>
            </section>
        </AdminWorkspacePage>
    );
}
