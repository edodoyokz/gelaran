"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
    Save,
    Bell,
    Mail,
    CreditCard,
    Globe,
    Shield,
    Percent,
    Clock,
    CheckCircle,
    Building2,
    Loader2,
    AlertCircle,
} from "lucide-react";
import { AdminHeader } from "@/components/admin/AdminHeader";
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

export default function AdminSettingsPage() {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);
    const [settings, setSettings] = useState<PlatformSettings>(DEFAULT_SETTINGS);
    const [activeSection, setActiveSection] = useState<"general" | "fees" | "notifications" | "payment">("general");
    const { showToast } = useToast();

    const checkAuth = useCallback(async () => {
        try {
            setIsLoading(true);
            const [settingsRes, commissionRes] = await Promise.all([
                fetch("/api/admin/settings"),
                fetch("/api/admin/settings/commission")
            ]);
            
            if (!settingsRes.ok) {
                if (settingsRes.status === 401) {
                    router.push("/login?returnUrl=/admin/settings");
                    return;
                }
                if (settingsRes.status === 403) {
                    router.push("/admin");
                    return;
                }
                setError("Failed to load settings");
                return;
            }

            const settingsData = await settingsRes.json();
            const commissionData = await commissionRes.json();
            
            if (settingsData.success) {
                const mergedSettings = {
                    ...settingsData.data,
                    platformFeePercentage: commissionData.success 
                        ? commissionData.data.commissionValue 
                        : settingsData.data.platformFeePercentage
                };
                setSettings(mergedSettings);
            }
        } catch {
            setError("Failed to load settings");
        } finally {
            setIsLoading(false);
        }
    }, [router]);

    useEffect(() => {
        checkAuth();
    }, [checkAuth]);

    const handleSave = async () => {
        try {
            setIsSaving(true);
            setSuccess(false);

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
                })
            ]);

            const [settingsData, commissionData] = await Promise.all([
                settingsRes.json(),
                commissionRes.json()
            ]);

            if (!settingsData.success || !commissionData.success) {
                const errorMsg = !settingsData.success 
                    ? (settingsData.error?.message || "Failed to save settings")
                    : (commissionData.error?.message || "Failed to save commission");
                showToast(errorMsg, "error");
                return;
            }

            setSuccess(true);
            showToast("Settings saved successfully", "success");
            setTimeout(() => setSuccess(false), 3000);
        } catch {
            showToast("Failed to save settings", "error");
        } finally {
            setIsSaving(false);
        }
    };

    const updateSetting = <K extends keyof PlatformSettings>(key: K, value: PlatformSettings[K]) => {
        setSettings((prev) => ({ ...prev, [key]: value }));
    };

    const SECTIONS = [
        { id: "general" as const, label: "General", icon: Building2 },
        { id: "fees" as const, label: "Fees & Limits", icon: Percent },
        { id: "notifications" as const, label: "Notifications", icon: Bell },
        { id: "payment" as const, label: "Payment Gateways", icon: CreditCard },
    ];

    if (isLoading) {
        return (
            <div className="min-h-screen bg-gray-100 flex items-center justify-center">
                <div className="text-center">
                    <Loader2 className="h-12 w-12 text-indigo-600 animate-spin mx-auto mb-4" />
                    <p className="text-gray-500">Loading settings...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen bg-gray-100 flex items-center justify-center">
                <div className="text-center">
                    <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
                    <p className="text-gray-900 font-medium mb-2">{error}</p>
                    <Link href="/admin" className="text-indigo-600 hover:text-indigo-500">
                        Back to Dashboard
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <>
            <AdminHeader 
                title="Platform Settings" 
                subtitle="Configure your platform preferences"
                backHref="/admin"
                actions={
                    <button
                        type="button"
                        onClick={handleSave}
                        disabled={isSaving}
                        className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 disabled:opacity-50"
                    >
                        {isSaving ? (
                            <>
                                <Loader2 className="h-4 w-4 animate-spin" />
                                Saving...
                            </>
                        ) : success ? (
                            <>
                                <CheckCircle className="h-4 w-4" />
                                Saved!
                            </>
                        ) : (
                            <>
                                <Save className="h-4 w-4" />
                                Save Changes
                            </>
                        )}
                    </button>
                }
            />

            <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                    <div className="lg:col-span-1">
                        <nav className="bg-white rounded-xl shadow-sm p-2 space-y-1">
                            {SECTIONS.map((section) => (
                                <button
                                    key={section.id}
                                    type="button"
                                    onClick={() => setActiveSection(section.id)}
                                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left transition-colors ${
                                        activeSection === section.id
                                            ? "bg-indigo-50 text-indigo-700"
                                            : "text-gray-600 hover:bg-gray-50"
                                    }`}
                                >
                                    <section.icon className="h-5 w-5" />
                                    <span className="font-medium">{section.label}</span>
                                </button>
                            ))}
                        </nav>

                        <div className="mt-6 bg-yellow-50 border border-yellow-200 rounded-xl p-4">
                            <div className="flex items-start gap-3">
                                <Shield className="h-5 w-5 text-yellow-600 shrink-0 mt-0.5" />
                                <div>
                                    <p className="text-sm font-medium text-yellow-800">Admin Only</p>
                                    <p className="text-xs text-yellow-700 mt-1">
                                        Changes to these settings affect the entire platform. Please review carefully before saving.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="lg:col-span-3">
                        <div className="bg-white rounded-xl shadow-sm p-6">
                            {activeSection === "general" && (
                                <div className="space-y-6">
                                    <div>
                                        <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                                            <Building2 className="h-5 w-5 text-indigo-600" />
                                            General Settings
                                        </h2>
                                    </div>

                                    <div>
                                        <label htmlFor="platformName" className="block text-sm font-medium text-gray-700 mb-1">
                                            Platform Name
                                        </label>
                                        <input
                                            type="text"
                                            id="platformName"
                                            value={settings.platformName}
                                            onChange={(e) => updateSetting("platformName", e.target.value)}
                                            className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                        />
                                    </div>

                                    <div>
                                        <label htmlFor="platformEmail" className="block text-sm font-medium text-gray-700 mb-1">
                                            Support Email
                                        </label>
                                        <div className="relative">
                                            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                                            <input
                                                type="email"
                                                id="platformEmail"
                                                value={settings.platformEmail}
                                                onChange={(e) => updateSetting("platformEmail", e.target.value)}
                                                className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                            />
                                        </div>
                                    </div>

                                    <div>
                                        <label htmlFor="platformPhone" className="block text-sm font-medium text-gray-700 mb-1">
                                            Support Phone
                                        </label>
                                        <input
                                            type="tel"
                                            id="platformPhone"
                                            value={settings.platformPhone}
                                            onChange={(e) => updateSetting("platformPhone", e.target.value)}
                                            className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                        />
                                    </div>

                                    <div className="pt-4 border-t">
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <p className="font-medium text-gray-900">Maintenance Mode</p>
                                                <p className="text-sm text-gray-500">Temporarily disable the platform for maintenance</p>
                                            </div>
                                            <button
                                                type="button"
                                                onClick={() => updateSetting("maintenanceMode", !settings.maintenanceMode)}
                                                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                                                    settings.maintenanceMode ? "bg-red-600" : "bg-gray-200"
                                                }`}
                                            >
                                                <span
                                                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                                                        settings.maintenanceMode ? "translate-x-6" : "translate-x-1"
                                                    }`}
                                                />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {activeSection === "fees" && (
                                <div className="space-y-6">
                                    <div>
                                        <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                                            <Percent className="h-5 w-5 text-indigo-600" />
                                            Fees & Limits
                                        </h2>
                                    </div>

                                    <div>
                                        <label htmlFor="platformFee" className="block text-sm font-medium text-gray-700 mb-1">
                                            Platform Fee (%)
                                        </label>
                                        <div className="relative">
                                            <input
                                                type="number"
                                                id="platformFee"
                                                min="0"
                                                max="100"
                                                step="0.1"
                                                value={settings.platformFeePercentage}
                                                onChange={(e) => updateSetting("platformFeePercentage", parseFloat(e.target.value) || 0)}
                                                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                            />
                                            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">%</span>
                                        </div>
                                        <p className="mt-1 text-xs text-gray-500">Fee charged on each ticket sale</p>
                                    </div>

                                    <div>
                                        <label htmlFor="minWithdrawal" className="block text-sm font-medium text-gray-700 mb-1">
                                            Minimum Withdrawal Amount
                                        </label>
                                        <div className="relative">
                                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">Rp</span>
                                            <input
                                                type="number"
                                                id="minWithdrawal"
                                                min="0"
                                                value={settings.minWithdrawalAmount}
                                                onChange={(e) => updateSetting("minWithdrawalAmount", parseInt(e.target.value) || 0)}
                                                className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                            />
                                        </div>
                                    </div>

                                    <div>
                                        <label htmlFor="maxTickets" className="block text-sm font-medium text-gray-700 mb-1">
                                            Max Tickets Per Order
                                        </label>
                                        <input
                                            type="number"
                                            id="maxTickets"
                                            min="1"
                                            max="100"
                                            value={settings.maxTicketsPerOrder}
                                            onChange={(e) => updateSetting("maxTicketsPerOrder", parseInt(e.target.value) || 1)}
                                            className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                        />
                                    </div>

                                    <div>
                                        <label htmlFor="bookingExpiry" className="block text-sm font-medium text-gray-700 mb-1">
                                            Booking Expiry Time
                                        </label>
                                        <div className="relative">
                                            <Clock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                                            <input
                                                type="number"
                                                id="bookingExpiry"
                                                min="5"
                                                max="1440"
                                                value={settings.bookingExpiryMinutes}
                                                onChange={(e) => updateSetting("bookingExpiryMinutes", parseInt(e.target.value) || 60)}
                                                className="w-full pl-10 pr-20 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                            />
                                            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">minutes</span>
                                        </div>
                                        <p className="mt-1 text-xs text-gray-500">Time before unpaid bookings expire</p>
                                    </div>
                                </div>
                            )}

                            {activeSection === "notifications" && (
                                <div className="space-y-6">
                                    <div>
                                        <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                                            <Bell className="h-5 w-5 text-indigo-600" />
                                            Notification Settings
                                        </h2>
                                    </div>

                                    <div className="space-y-4">
                                        <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                                            <div className="flex items-center gap-3">
                                                <Mail className="h-5 w-5 text-gray-400" />
                                                <div>
                                                    <p className="font-medium text-gray-900">Email Notifications</p>
                                                    <p className="text-sm text-gray-500">Send booking confirmations and updates via email</p>
                                                </div>
                                            </div>
                                            <button
                                                type="button"
                                                onClick={() => updateSetting("enableEmailNotifications", !settings.enableEmailNotifications)}
                                                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                                                    settings.enableEmailNotifications ? "bg-indigo-600" : "bg-gray-200"
                                                }`}
                                            >
                                                <span
                                                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                                                        settings.enableEmailNotifications ? "translate-x-6" : "translate-x-1"
                                                    }`}
                                                />
                                            </button>
                                        </div>

                                        <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                                            <div className="flex items-center gap-3">
                                                <Globe className="h-5 w-5 text-gray-400" />
                                                <div>
                                                    <p className="font-medium text-gray-900">SMS Notifications</p>
                                                    <p className="text-sm text-gray-500">Send booking confirmations via SMS (additional charges may apply)</p>
                                                </div>
                                            </div>
                                            <button
                                                type="button"
                                                onClick={() => updateSetting("enableSmsNotifications", !settings.enableSmsNotifications)}
                                                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                                                    settings.enableSmsNotifications ? "bg-indigo-600" : "bg-gray-200"
                                                }`}
                                            >
                                                <span
                                                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                                                        settings.enableSmsNotifications ? "translate-x-6" : "translate-x-1"
                                                    }`}
                                                />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {activeSection === "payment" && (
                                <div className="space-y-6">
                                    <div>
                                        <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                                            <CreditCard className="h-5 w-5 text-indigo-600" />
                                            Payment Gateways
                                        </h2>
                                    </div>

                                    <div className="space-y-4">
                                        <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                                                    <span className="text-blue-600 font-bold text-sm">M</span>
                                                </div>
                                                <div>
                                                    <p className="font-medium text-gray-900">Midtrans</p>
                                                    <p className="text-sm text-gray-500">Credit card, bank transfer, e-wallet</p>
                                                </div>
                                            </div>
                                            <button
                                                type="button"
                                                onClick={() => updateSetting("paymentGateways", { ...settings.paymentGateways, midtrans: !settings.paymentGateways.midtrans })}
                                                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                                                    settings.paymentGateways.midtrans ? "bg-indigo-600" : "bg-gray-200"
                                                }`}
                                            >
                                                <span
                                                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                                                        settings.paymentGateways.midtrans ? "translate-x-6" : "translate-x-1"
                                                    }`}
                                                />
                                            </button>
                                        </div>

                                        <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                                                    <span className="text-purple-600 font-bold text-sm">X</span>
                                                </div>
                                                <div>
                                                    <p className="font-medium text-gray-900">Xendit</p>
                                                    <p className="text-sm text-gray-500">Virtual account, QRIS, OVO, Dana</p>
                                                </div>
                                            </div>
                                            <button
                                                type="button"
                                                onClick={() => updateSetting("paymentGateways", { ...settings.paymentGateways, xendit: !settings.paymentGateways.xendit })}
                                                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                                                    settings.paymentGateways.xendit ? "bg-indigo-600" : "bg-gray-200"
                                                }`}
                                            >
                                                <span
                                                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                                                        settings.paymentGateways.xendit ? "translate-x-6" : "translate-x-1"
                                                    }`}
                                                />
                                            </button>
                                        </div>
                                    </div>

                                    <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                                        <p className="text-sm text-blue-700">
                                            <strong>Note:</strong> Make sure to configure API keys in your environment variables for each payment gateway you enable.
                                        </p>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </main>
        </>
    );
}
