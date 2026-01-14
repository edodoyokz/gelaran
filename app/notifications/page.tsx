"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
    Bell,
    Check,
    Trash2,
    Loader2,
    AlertCircle,
    Ticket,
    Calendar,
    Users,
    CheckCircle,
    XCircle,
    Sparkles,
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

const NOTIFICATION_ICONS: Record<string, { icon: React.ElementType; bgColor: string; iconColor: string }> = {
    BOOKING_CONFIRMED: { icon: CheckCircle, bgColor: "bg-[var(--success-bg)]", iconColor: "text-[var(--success)]" },
    BOOKING_CANCELLED: { icon: XCircle, bgColor: "bg-[var(--error-bg)]", iconColor: "text-[var(--error)]" },
    EVENT_REMINDER: { icon: Calendar, bgColor: "bg-[var(--info-bg)]", iconColor: "text-[var(--info)]" },
    EVENT_UPDATE: { icon: Ticket, bgColor: "bg-purple-100 dark:bg-purple-900/30", iconColor: "text-purple-600 dark:text-purple-400" },
    PAYOUT: { icon: Users, bgColor: "bg-[var(--accent-primary)]/10", iconColor: "text-[var(--accent-primary)]" },
    SYSTEM: { icon: Bell, bgColor: "bg-[var(--bg-tertiary)]", iconColor: "text-[var(--text-muted)]" },
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

    const groupNotificationsByDate = (notifs: Notification[]) => {
        const groups: Record<string, Notification[]> = {};
        const today = new Date();
        const yesterday = new Date(today);
        yesterday.setDate(yesterday.getDate() - 1);

        for (const notif of notifs) {
            const date = new Date(notif.createdAt);
            let label: string;

            if (date.toDateString() === today.toDateString()) {
                label = "Hari Ini";
            } else if (date.toDateString() === yesterday.toDateString()) {
                label = "Kemarin";
            } else {
                label = date.toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" });
            }

            if (!groups[label]) {
                groups[label] = [];
            }
            groups[label].push(notif);
        }

        return groups;
    };

    if (isLoading) {
        return (
            <div className="min-h-[60vh] flex items-center justify-center">
                <div className="text-center">
                    <Loader2 className="h-12 w-12 text-[var(--accent-primary)] animate-spin mx-auto mb-4" />
                    <p className="text-[var(--text-muted)]">Memuat notifikasi...</p>
                </div>
            </div>
        );
    }

    const groupedNotifications = groupNotificationsByDate(filteredNotifications);

    return (
        <div className="space-y-6">
            <section className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div className="flex items-center gap-3">
                    <div className="relative">
                        <Bell className="h-7 w-7 text-[var(--accent-primary)]" />
                        {unreadCount > 0 && (
                            <span className="absolute -top-1 -right-1 h-5 w-5 bg-[var(--error)] rounded-full text-white text-xs font-bold flex items-center justify-center">
                                {unreadCount > 9 ? "9+" : unreadCount}
                            </span>
                        )}
                    </div>
                    <div>
                        <h1 className="text-2xl sm:text-3xl font-bold text-[var(--text-primary)]">Notifikasi</h1>
                        <p className="text-[var(--text-muted)] text-sm">{unreadCount} belum dibaca</p>
                    </div>
                </div>
                {unreadCount > 0 && (
                    <button
                        type="button"
                        onClick={handleMarkAllAsRead}
                        className="btn-secondary self-start sm:self-auto rounded-xl py-2.5 px-4"
                    >
                        <Check className="h-4 w-4" />
                        Tandai Semua Dibaca
                    </button>
                )}
            </section>

            <section className="flex gap-2">
                <button
                    type="button"
                    onClick={() => setFilter("all")}
                    className={`px-4 py-2.5 rounded-xl text-sm font-medium transition-all ${
                        filter === "all"
                            ? "bg-[var(--accent-primary)] text-white"
                            : "bg-[var(--bg-tertiary)] text-[var(--text-secondary)] hover:bg-[var(--surface-hover)]"
                    }`}
                >
                    Semua ({notifications.length})
                </button>
                <button
                    type="button"
                    onClick={() => setFilter("unread")}
                    className={`px-4 py-2.5 rounded-xl text-sm font-medium transition-all ${
                        filter === "unread"
                            ? "bg-[var(--accent-primary)] text-white"
                            : "bg-[var(--bg-tertiary)] text-[var(--text-secondary)] hover:bg-[var(--surface-hover)]"
                    }`}
                >
                    Belum Dibaca ({unreadCount})
                </button>
            </section>

            {error && (
                <div className="bg-[var(--error-bg)] border border-[var(--error)]/20 rounded-xl p-4">
                    <div className="flex items-center gap-2 text-[var(--error-text)]">
                        <AlertCircle className="h-5 w-5" />
                        <span>{error}</span>
                    </div>
                </div>
            )}

            {filteredNotifications.length === 0 ? (
                <div className="card p-12 text-center">
                    <div className="w-20 h-20 bg-gradient-to-br from-indigo-100 to-purple-100 dark:from-indigo-900/30 dark:to-purple-900/30 rounded-full flex items-center justify-center mx-auto mb-6">
                        <Bell className="h-10 w-10 text-[var(--accent-primary)]" />
                    </div>
                    <h3 className="text-xl font-bold text-[var(--text-primary)] mb-2">
                        {filter === "unread" ? "Tidak ada notifikasi belum dibaca" : "Tidak ada notifikasi"}
                    </h3>
                    <p className="text-[var(--text-muted)] mb-8 max-w-sm mx-auto">
                        {filter === "unread"
                            ? "Semua notifikasi Anda sudah dibaca."
                            : "Anda belum memiliki notifikasi."}
                    </p>
                    <Link href="/" className="btn-primary w-full sm:w-auto rounded-full py-3 sm:py-2.5 justify-center inline-flex gap-2">
                        <Sparkles className="h-4 w-4" />
                        Kembali ke Beranda
                    </Link>
                </div>
            ) : (
                <div className="space-y-6">
                    {Object.entries(groupedNotifications).map(([date, notifs]) => (
                        <div key={date}>
                            <h3 className="text-sm font-semibold text-[var(--text-muted)] mb-3 px-1">{date}</h3>
                            <div className="card overflow-hidden divide-y divide-[var(--border)]">
                                {notifs.map((notification) => {
                                    const iconConfig = NOTIFICATION_ICONS[notification.type] || NOTIFICATION_ICONS.SYSTEM;
                                    const Icon = iconConfig.icon;

                                    return (
                                        <button
                                            key={notification.id}
                                            type="button"
                                            className={`w-full text-left p-4 sm:p-5 hover:bg-[var(--surface-hover)] transition-colors ${
                                                !notification.isRead ? "bg-[var(--accent-primary)]/5" : ""
                                            }`}
                                            onClick={() => !notification.isRead && handleMarkAsRead(notification.id)}
                                        >
                                            <div className="flex items-start gap-4">
                                                <div className={`w-11 h-11 ${iconConfig.bgColor} rounded-xl flex items-center justify-center flex-shrink-0`}>
                                                    <Icon className={`h-5 w-5 ${iconConfig.iconColor}`} />
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <div className="flex items-start justify-between gap-2 mb-1">
                                                        <div>
                                                            <div className="flex items-center gap-2 mb-0.5">
                                                                <span className="text-[10px] font-semibold text-[var(--text-muted)] uppercase tracking-wider">
                                                                    {NOTIFICATION_LABELS[notification.type] || notification.type}
                                                                </span>
                                                                {!notification.isRead && (
                                                                    <span className="h-2 w-2 bg-[var(--accent-primary)] rounded-full" />
                                                                )}
                                                            </div>
                                                            <h4 className="font-semibold text-[var(--text-primary)]">
                                                                {notification.title}
                                                            </h4>
                                                        </div>
                                                        <button
                                                            type="button"
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                handleDelete(notification.id);
                                                            }}
                                                            className="p-2 text-[var(--text-muted)] hover:text-[var(--error)] hover:bg-[var(--error-bg)] rounded-lg transition-colors"
                                                        >
                                                            <Trash2 className="h-4 w-4" />
                                                        </button>
                                                    </div>
                                                    <p className="text-[var(--text-secondary)] text-sm mb-2 line-clamp-2">{notification.message}</p>
                                                    <div className="flex items-center gap-4 text-xs">
                                                        <span className="text-[var(--text-muted)]">
                                                            {new Date(notification.createdAt).toLocaleTimeString("id-ID", {
                                                                hour: "2-digit",
                                                                minute: "2-digit",
                                                            })}
                                                        </span>
                                                        {notification.metadata.eventId && (
                                                            <Link
                                                                href={`/events/${notification.metadata.eventId}`}
                                                                onClick={(e) => e.stopPropagation()}
                                                                className="text-[var(--accent-primary)] hover:underline"
                                                            >
                                                                Lihat Event
                                                            </Link>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        </button>
                                    );
                                })}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
