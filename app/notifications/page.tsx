"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
    Bell,
    Check,
    X,
    Trash2,
    Loader2,
    AlertCircle,
    Ticket,
    Calendar,
    Users,
    CheckCircle,
    XCircle,
} from "lucide-react";

interface Notification {
    id: string;
    type: "BOOKING_CONFIRMED" | "BOOKING_CANCELLED" | "EVENT_REMINDER" | "EVENT_UPDATE" | "PAYOUT" | "SYSTEM";
    title: string;
    message: string;
    isRead: boolean;
    createdAt: string;
    metadata: {
        eventId?: string;
        eventTitle?: string;
        bookingCode?: string;
    };
}

const NOTIFICATION_ICONS: Record<string, { icon: React.ElementType; bg: string; iconColor: string }> = {
    BOOKING_CONFIRMED: { icon: CheckCircle, bg: "bg-green-100", iconColor: "text-green-600" },
    BOOKING_CANCELLED: { icon: XCircle, bg: "bg-red-100", iconColor: "text-red-600" },
    EVENT_REMINDER: { icon: Calendar, bg: "bg-blue-100", iconColor: "text-blue-600" },
    EVENT_UPDATE: { icon: Ticket, bg: "bg-purple-100", iconColor: "text-purple-600" },
    PAYOUT: { icon: Users, bg: "bg-indigo-100", iconColor: "text-indigo-600" },
    SYSTEM: { icon: Bell, bg: "bg-gray-100", iconColor: "text-gray-600" },
};

const NOTIFICATION_LABELS: Record<string, string> = {
    BOOKING_CONFIRMED: "Booking Dikonfirmasi",
    BOOKING_CANCELLED: "Booking Dibatalkan",
    EVENT_REMINDER: "Pengingat Event",
    EVENT_UPDATE: "Update Event",
    PAYOUT: "Payout",
    SYSTEM: "Sistem",
};

export default function NotificationsPage() {
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [filter, setFilter] = useState<"all" | "unread">("all");

    useEffect(() => {
        const loadNotifications = async () => {
            try {
                setIsLoading(true);
                const res = await fetch("/api/notifications");
                const data = await res.json();

                if (!data.success) {
                    setError(data.error?.message || "Gagal memuat notifikasi");
                    return;
                }

                setNotifications(data.data || []);
            } catch {
                setError("Terjadi kesalahan saat memuat notifikasi");
            } finally {
                setIsLoading(false);
            }
        };

        loadNotifications();
    }, []);

    const handleMarkAsRead = async (notificationId: string) => {
        try {
            await fetch(`/api/notifications/${notificationId}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ isRead: true }),
            });

            setNotifications(
                notifications.map((n) =>
                    n.id === notificationId ? { ...n, isRead: true } : n
                )
            );
        } catch {
            console.error("Failed to mark notification as read");
        }
    };

    const handleMarkAllAsRead = async () => {
        try {
            await fetch("/api/notifications/mark-all-read", {
                method: "PUT",
            });

            setNotifications(notifications.map((n) => ({ ...n, isRead: true })));
        } catch {
            console.error("Failed to mark all notifications as read");
        }
    };

    const handleDelete = async (notificationId: string) => {
        try {
            await fetch(`/api/notifications/${notificationId}`, {
                method: "DELETE",
            });

            setNotifications(notifications.filter((n) => n.id !== notificationId));
        } catch {
            console.error("Failed to delete notification");
        }
    };

    const filteredNotifications = filter === "unread"
        ? notifications.filter((n) => !n.isRead)
        : notifications;

    const unreadCount = notifications.filter((n) => !n.isRead).length;

    if (isLoading) {
        return (
            <div className="min-h-screen bg-gray-100 flex items-center justify-center">
                <div className="text-center">
                    <Loader2 className="h-12 w-12 text-indigo-600 animate-spin mx-auto mb-4" />
                    <p className="text-gray-500">Memuat notifikasi...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-100">
            <header className="bg-white border-b">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <div className="relative">
                                <Bell className="h-6 w-6 text-gray-600" />
                                {unreadCount > 0 && (
                                    <span className="absolute -top-1 -right-1 h-4 w-4 bg-red-500 rounded-full text-white text-xs flex items-center justify-center">
                                        {unreadCount > 9 ? "9+" : unreadCount}
                                    </span>
                                )}
                            </div>
                            <div>
                                <h1 className="text-2xl font-bold text-gray-900">Notifikasi</h1>
                                <p className="text-sm text-gray-500 mt-1">
                                    {unreadCount} belum dibaca
                                </p>
                            </div>
                        </div>
                        {unreadCount > 0 && (
                            <button
                                type="button"
                                onClick={handleMarkAllAsRead}
                                className="inline-flex items-center gap-2 px-4 py-2 text-gray-700 hover:bg-gray-50 rounded-lg"
                            >
                                <Check className="h-4 w-4" />
                                Tandai Semua Dibaca
                            </button>
                        )}
                    </div>

                    <div className="flex gap-2 mt-6">
                        <button
                            type="button"
                            onClick={() => setFilter("all")}
                            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                                filter === "all"
                                    ? "bg-indigo-600 text-white"
                                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                            }`}
                        >
                            Semua ({notifications.length})
                        </button>
                        <button
                            type="button"
                            onClick={() => setFilter("unread")}
                            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                                filter === "unread"
                                    ? "bg-indigo-600 text-white"
                                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                            }`}
                        >
                            Belum Dibaca ({unreadCount})
                        </button>
                    </div>
                </div>
            </header>

            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {error && (
                    <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
                        <div className="flex items-center gap-2 text-red-800">
                            <AlertCircle className="h-5 w-5" />
                            <span>{error}</span>
                        </div>
                    </div>
                )}

                {filteredNotifications.length === 0 ? (
                    <div className="bg-white rounded-xl shadow-sm p-12 text-center">
                        <Bell className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                        <h3 className="text-lg font-medium text-gray-900 mb-2">
                            {filter === "unread" ? "Tidak ada notifikasi belum dibaca" : "Tidak ada notifikasi"}
                        </h3>
                        <p className="text-gray-500 mb-6">
                            {filter === "unread"
                                ? "Semua notifikasi Anda sudah dibaca."
                                : "Anda belum memiliki notifikasi."}
                        </p>
                        <Link
                            href="/"
                            className="inline-flex items-center gap-2 text-indigo-600 font-medium"
                        >
                            Kembali ke Beranda
                        </Link>
                    </div>
                ) : (
                    <div className="bg-white rounded-xl shadow-sm overflow-hidden">
                        <div className="divide-y">
                            {filteredNotifications.map((notification) => {
                                const iconConfig = NOTIFICATION_ICONS[notification.type] || NOTIFICATION_ICONS.SYSTEM;
                                const Icon = iconConfig.icon;

                                return (
                                    <div
                                        key={notification.id}
                                        className={`p-6 hover:bg-gray-50 transition-colors ${
                                            !notification.isRead ? "bg-indigo-50/50" : ""
                                        }`}
                                        onClick={() => !notification.isRead && handleMarkAsRead(notification.id)}
                                    >
                                        <div className="flex items-start gap-4">
                                            <div
                                                className={`w-12 h-12 ${iconConfig.bg} rounded-lg flex items-center justify-center flex-shrink-0`}
                                            >
                                                <Icon className={`h-6 w-6 ${iconConfig.iconColor}`} />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-start justify-between mb-2">
                                                    <div>
                                                        <div className="flex items-center gap-2 mb-1">
                                                            <span className="text-xs font-medium text-gray-400 uppercase tracking-wider">
                                                                {NOTIFICATION_LABELS[notification.type] || notification.type}
                                                            </span>
                                                            {!notification.isRead && (
                                                                <span className="h-2 w-2 bg-indigo-600 rounded-full" />
                                                            )}
                                                        </div>
                                                        <h3 className="font-semibold text-gray-900">
                                                            {notification.title}
                                                        </h3>
                                                    </div>
                                                    <button
                                                        type="button"
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            handleDelete(notification.id);
                                                        }}
                                                        className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg"
                                                    >
                                                        <Trash2 className="h-4 w-4" />
                                                    </button>
                                                </div>
                                                <p className="text-gray-600 mb-2">{notification.message}</p>
                                                <div className="flex items-center gap-4 text-sm">
                                                    <span className="text-gray-500">
                                                        {new Date(notification.createdAt).toLocaleDateString("id-ID", {
                                                            day: "numeric",
                                                            month: "long",
                                                            year: "numeric",
                                                            hour: "2-digit",
                                                            minute: "2-digit",
                                                        })}
                                                    </span>
                                                    {notification.metadata.eventId && (
                                                        <Link
                                                            href={`/events/${notification.metadata.eventId}`}
                                                            className="text-indigo-600 hover:text-indigo-500"
                                                        >
                                                            Lihat Event
                                                        </Link>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
}
