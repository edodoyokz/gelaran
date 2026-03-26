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
import {
    CustomerEmptyState,
    CustomerHero,
    CustomerStatusBadge,
    DashboardSection,
} from "@/components/customer/customer-dashboard-primitives";

interface Notification {
    id: string;
    type:
    | "BOOKING_CONFIRMED"
    | "BOOKING_CANCELLED"
    | "EVENT_REMINDER"
    | "EVENT_UPDATE"
    | "PAYOUT"
    | "SYSTEM";
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

const NOTIFICATION_ICONS: Record<
    string,
    { icon: React.ElementType; tone: "success" | "danger" | "accent" | "warning" | "neutral" }
> = {
    BOOKING_CONFIRMED: { icon: CheckCircle, tone: "success" },
    BOOKING_CANCELLED: { icon: XCircle, tone: "danger" },
    EVENT_REMINDER: { icon: Calendar, tone: "accent" },
    EVENT_UPDATE: { icon: Ticket, tone: "warning" },
    PAYOUT: { icon: Users, tone: "accent" },
    SYSTEM: { icon: Bell, tone: "neutral" },
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
                setError(null);
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

            setNotifications((prev) =>
                prev.map((n) =>
                    n.id === notificationId ? { ...n, isRead: true } : n,
                ),
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

            setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
        } catch {
            console.error("Failed to mark all notifications as read");
        }
    };

    const handleDelete = async (notificationId: string) => {
        try {
            await fetch(`/api/notifications/${notificationId}`, {
                method: "DELETE",
            });

            setNotifications((prev) => prev.filter((n) => n.id !== notificationId));
        } catch {
            console.error("Failed to delete notification");
        }
    };

    const filteredNotifications =
        filter === "unread"
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
                label = date.toLocaleDateString("id-ID", {
                    day: "numeric",
                    month: "long",
                    year: "numeric",
                });
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
                    <Loader2 className="h-12 w-12 text-(--accent-primary) animate-spin mx-auto mb-4" />
                    <p className="text-(--text-muted)">Memuat notifikasi...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <CustomerEmptyState
                title="Notifikasi belum tersedia"
                description={`${error}. Kembali beberapa saat lagi atau lanjutkan aktivitasmu dari dashboard customer.`}
                href="/dashboard"
                ctaLabel="Kembali ke dashboard"
                icon={AlertCircle}
            />
        );
    }

    const groupedNotifications = groupNotificationsByDate(filteredNotifications);

    return (
        <div className="space-y-6 lg:space-y-8">
            <CustomerHero
                eyebrow="Inbox"
                title="Notifikasi"
                description="Lihat update booking, pengingat event, dan pemberitahuan sistem dalam daftar yang lebih rapi dan mudah dipindai."
                meta={
                    <>
                        <CustomerStatusBadge
                            label={`${notifications.length} total notifikasi`}
                            tone="accent"
                            icon={Bell}
                        />
                        <CustomerStatusBadge
                            label={`${unreadCount} belum dibaca`}
                            tone={unreadCount > 0 ? "warning" : "neutral"}
                            icon={Check}
                        />
                    </>
                }
                actions={
                    unreadCount > 0 ? (
                        <button
                            type="button"
                            onClick={handleMarkAllAsRead}
                            className="inline-flex items-center justify-center gap-2 rounded-full border border-(--border) bg-(--surface-elevated) px-5 py-3 text-sm font-semibold text-foreground transition-colors hover:bg-(--surface-hover)"
                        >
                            <Check className="h-4 w-4" />
                            Tandai semua dibaca
                        </button>
                    ) : undefined
                }
            />

            <DashboardSection
                title="Filter notifikasi"
                description="Fokuskan tampilan ke semua notifikasi atau hanya item yang belum dibaca."
            >
                <div className="flex flex-wrap gap-3">
                    <button
                        type="button"
                        onClick={() => setFilter("all")}
                        className={`inline-flex items-center rounded-full px-4 py-2.5 text-sm font-semibold transition-colors ${filter === "all"
                                ? "bg-(--accent-gradient) text-white"
                                : "border border-(--border) bg-(--surface-elevated) text-(--text-secondary) hover:bg-(--surface-hover)"
                            }`}
                    >
                        Semua ({notifications.length})
                    </button>
                    <button
                        type="button"
                        onClick={() => setFilter("unread")}
                        className={`inline-flex items-center rounded-full px-4 py-2.5 text-sm font-semibold transition-colors ${filter === "unread"
                                ? "bg-(--accent-gradient) text-white"
                                : "border border-(--border) bg-(--surface-elevated) text-(--text-secondary) hover:bg-(--surface-hover)"
                            }`}
                    >
                        Belum dibaca ({unreadCount})
                    </button>
                </div>
            </DashboardSection>

            <DashboardSection
                title="Daftar notifikasi"
                description="Setiap item menampilkan konteks singkat, status baca, dan tautan cepat bila terkait event tertentu."
            >
                {filteredNotifications.length === 0 ? (
                    <CustomerEmptyState
                        title={
                            filter === "unread"
                                ? "Tidak ada notifikasi belum dibaca"
                                : "Belum ada notifikasi"
                        }
                        description={
                            filter === "unread"
                                ? "Semua notifikasi sudah dibaca. Notifikasi baru akan muncul di sini saat ada update booking atau event."
                                : "Kamu belum memiliki notifikasi. Aktivitas seperti booking, pengingat event, dan pembaruan sistem akan muncul di sini."
                        }
                        href="/events"
                        ctaLabel="Jelajahi event"
                        icon={Sparkles}
                        className="border-none bg-transparent p-0 shadow-none"
                    />
                ) : (
                    <div className="space-y-6">
                        {Object.entries(groupedNotifications).map(([date, notifs]) => (
                            <section key={date} className="space-y-3">
                                <h2 className="px-1 text-xs font-semibold uppercase tracking-[0.22em] text-(--text-muted)">
                                    {date}
                                </h2>
                                <div className="space-y-3">
                                    {notifs.map((notification) => {
                                        const iconConfig =
                                            NOTIFICATION_ICONS[notification.type] ||
                                            NOTIFICATION_ICONS.SYSTEM;
                                        const Icon = iconConfig.icon;

                                        return (
                                            <article
                                                key={notification.id}
                                                className={`rounded-3xl border p-4 shadow-(--shadow-sm) transition-colors sm:p-5 ${notification.isRead
                                                        ? "border-(--border) bg-(--surface-elevated)"
                                                        : "border-[rgba(41,179,182,0.22)] bg-(--surface-brand-soft)"
                                                    }`}
                                            >
                                                <div className="flex items-start gap-4">
                                                    <span className="inline-flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-(--surface) text-(--accent-primary) shadow-(--shadow-xs)">
                                                        <Icon className="h-5 w-5" />
                                                    </span>

                                                    <div className="min-w-0 flex-1 space-y-3">
                                                        <div className="flex flex-wrap items-start justify-between gap-3">
                                                            <div className="space-y-1">
                                                                <div className="flex flex-wrap items-center gap-2">
                                                                    <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-(--text-muted)">
                                                                        {NOTIFICATION_LABELS[notification.type] || notification.type}
                                                                    </p>
                                                                    {!notification.isRead ? (
                                                                        <CustomerStatusBadge
                                                                            label="Baru"
                                                                            tone="accent"
                                                                        />
                                                                    ) : null}
                                                                </div>
                                                                <h3 className="text-base font-semibold text-foreground">
                                                                    {notification.title}
                                                                </h3>
                                                            </div>

                                                            <button
                                                                type="button"
                                                                onClick={() => handleDelete(notification.id)}
                                                                className="inline-flex h-10 w-10 items-center justify-center rounded-2xl border border-(--border) bg-(--surface) text-(--text-muted) transition-colors hover:bg-(--error-bg) hover:text-(--error-text)"
                                                                aria-label="Hapus notifikasi"
                                                            >
                                                                <Trash2 className="h-4 w-4" />
                                                            </button>
                                                        </div>

                                                        <p className="text-sm leading-7 text-(--text-secondary)">
                                                            {notification.message}
                                                        </p>

                                                        <div className="flex flex-wrap items-center gap-3 text-sm text-(--text-muted)">
                                                            <span>
                                                                {new Date(notification.createdAt).toLocaleTimeString("id-ID", {
                                                                    hour: "2-digit",
                                                                    minute: "2-digit",
                                                                })}
                                                            </span>
                                                            {notification.metadata.bookingCode ? (
                                                                <CustomerStatusBadge
                                                                    label={notification.metadata.bookingCode}
                                                                    tone="neutral"
                                                                />
                                                            ) : null}
                                                        </div>

                                                        <div className="flex flex-wrap gap-3">
                                                            {!notification.isRead ? (
                                                                <button
                                                                    type="button"
                                                                    onClick={() => handleMarkAsRead(notification.id)}
                                                                    className="inline-flex items-center gap-2 rounded-full border border-(--border) bg-(--surface) px-4 py-2.5 text-sm font-semibold text-foreground transition-colors hover:bg-(--surface-hover)"
                                                                >
                                                                    <Check className="h-4 w-4" />
                                                                    Tandai dibaca
                                                                </button>
                                                            ) : null}
                                                            {notification.metadata.eventId ? (
                                                                <Link
                                                                    href={`/events/${notification.metadata.eventId}`}
                                                                    className="inline-flex items-center gap-2 rounded-full bg-(--accent-gradient) px-4 py-2.5 text-sm font-semibold text-white shadow-(--shadow-glow)"
                                                                >
                                                                    Lihat event
                                                                </Link>
                                                            ) : null}
                                                        </div>
                                                    </div>
                                                </div>
                                            </article>
                                        );
                                    })}
                                </div>
                            </section>
                        ))}
                    </div>
                )}
            </DashboardSection>
        </div>
    );
}
