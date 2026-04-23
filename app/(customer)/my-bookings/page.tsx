"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import {
    Ticket,
    Calendar,
    MapPin,
    Loader2,
    AlertCircle,
    Clock,
    CheckCircle,
    XCircle,
    QrCode,
    ChevronRight,
    Download,
    Search,
    Sparkles,
    Gift,
} from "lucide-react";
import {
    CustomerEmptyState,
    CustomerHero,
    CustomerMetricGrid,
    CustomerStatusBadge,
    DashboardSection,
    StatsCard,
} from "@/components/customer/customer-dashboard-primitives";

interface BookedTicket {
    id: string;
    uniqueCode: string;
    status: string;
    isCheckedIn: boolean;
    ticketType: {
        name: string;
    };
}

interface EventSchedule {
    scheduleDate: string;
    startTime: string;
    endTime: string;
}

interface Venue {
    name: string;
    city: string;
}

interface BookingEvent {
    id: string;
    title: string;
    slug: string;
    posterImage: string | null;
    venue: Venue | null;
}

interface Booking {
    id: string;
    bookingCode: string;
    status:
    | "PENDING"
    | "AWAITING_PAYMENT"
    | "PAID"
    | "CONFIRMED"
    | "CANCELLED"
    | "REFUNDED"
    | "EXPIRED";
    paymentStatus: string;
    totalTickets: number;
    totalAmount: string;
    createdAt: string;
    expiresAt: string | null;
    isComplimentary: boolean;
    event: BookingEvent;
    eventSchedule: EventSchedule | null;
    bookedTickets: BookedTicket[];
}

interface BookingStats {
    total: number;
    confirmed: number;
    pending: number;
    cancelled: number;
    completed: number;
}

interface Pagination {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
}

const STATUS_CONFIG: Record<
    string,
    {
        tone: "warning" | "accent" | "success" | "danger" | "neutral";
        icon: typeof CheckCircle;
        label: string;
    }
> = {
    PENDING: { tone: "warning", icon: Clock, label: "Menunggu" },
    AWAITING_PAYMENT: {
        tone: "warning",
        icon: Clock,
        label: "Menunggu Pembayaran",
    },
    PAID: { tone: "accent", icon: CheckCircle, label: "Dibayar" },
    CONFIRMED: {
        tone: "success",
        icon: CheckCircle,
        label: "Dikonfirmasi",
    },
    CANCELLED: { tone: "danger", icon: XCircle, label: "Dibatalkan" },
    REFUNDED: { tone: "neutral", icon: XCircle, label: "Dikembalikan" },
    EXPIRED: { tone: "neutral", icon: XCircle, label: "Kadaluarsa" },
};

const FILTER_TABS = [
    { value: "all", label: "Semua", icon: Ticket },
    { value: "confirmed", label: "Aktif", icon: CheckCircle },
    { value: "awaiting_payment", label: "Pembayaran", icon: Clock },
    { value: "cancelled", label: "Dibatalkan", icon: XCircle },
];

export default function MyBookingsPage() {
    const router = useRouter();
    const [bookings, setBookings] = useState<Booking[]>([]);
    const [stats, setStats] = useState<BookingStats | null>(null);
    const [pagination, setPagination] = useState<Pagination | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [activeTab, setActiveTab] = useState("all");
    const [search, setSearch] = useState("");
    const [currentPage, setCurrentPage] = useState(1);

    const fetchBookings = useCallback(
        async (status: string, page: number) => {
            try {
                setIsLoading(true);
                const params = new URLSearchParams();
                if (status !== "all") params.set("status", status);
                params.set("page", page.toString());
                params.set("limit", "10");

                const res = await fetch(`/api/my-bookings?${params.toString()}`);
                const data = await res.json();

                if (!res.ok) {
                    if (res.status === 401) {
                        router.push("/login?returnUrl=/my-bookings");
                        return;
                    }
                    setError(data.error?.message || "Gagal memuat pesanan");
                    return;
                }

                if (data.success) {
                    setBookings(data.data.bookings);
                    setStats(data.data.stats);
                    setPagination(data.data.pagination);
                    setError(null);
                }
            } catch {
                setError("Gagal memuat pesanan");
            } finally {
                setIsLoading(false);
            }
        },
        [router],
    );

    useEffect(() => {
        fetchBookings(activeTab, currentPage);
    }, [activeTab, currentPage, fetchBookings]);

    const handleTabChange = (tab: string) => {
        setActiveTab(tab);
        setCurrentPage(1);
    };

    const formatDate = (dateStr: string): string => {
        return new Date(dateStr).toLocaleDateString("id-ID", {
            weekday: "short",
            day: "numeric",
            month: "short",
            year: "numeric",
        });
    };

    const formatTime = (timeStr: string): string => {
        const date = new Date(timeStr);
        return date.toLocaleTimeString("id-ID", {
            hour: "2-digit",
            minute: "2-digit",
        });
    };

    const formatCurrency = (amount: string | number): string => {
        return new Intl.NumberFormat("id-ID", {
            style: "currency",
            currency: "IDR",
            minimumFractionDigits: 0,
        }).format(Number(amount));
    };

    const filteredBookings = bookings.filter((booking) => {
        if (!search) return true;
        const searchLower = search.toLowerCase();
        return (
            booking.bookingCode.toLowerCase().includes(searchLower) ||
            booking.event.title.toLowerCase().includes(searchLower)
        );
    });

    if (isLoading && bookings.length === 0) {
        return (
            <div className="min-h-[60vh] flex items-center justify-center">
                <div className="text-center">
                    <Loader2 className="mx-auto mb-4 h-12 w-12 animate-spin text-(--accent-primary)" />
                    <p className="text-(--text-muted)">Memuat pesanan kamu...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <CustomerEmptyState
                title="Pesanan belum bisa dimuat"
                description={`${error}. Coba beberapa saat lagi atau kembali ke dashboard untuk melanjutkan aktivitas customer.`}
                href="/dashboard"
                ctaLabel="Kembali ke dashboard"
                icon={AlertCircle}
            />
        );
    }

    return (
        <div className="space-y-7 lg:space-y-9">
            <CustomerHero
                eyebrow="Order history"
                title="Pesanan saya"
                description="Kelola tiket aktif, pantau pembayaran yang belum selesai, dan buka detail booking dari tampilan yang lebih rapi serta mudah dipindai."
                meta={
                    stats ? (
                        <>
                            <CustomerStatusBadge
                                label={`${stats.total} total pesanan`}
                                tone="accent"
                                icon={Ticket}
                            />
                            <CustomerStatusBadge
                                label={`${stats.confirmed} dikonfirmasi`}
                                tone="success"
                                icon={CheckCircle}
                            />
                        </>
                    ) : undefined
                }
                actions={
                    <Link
                        href="/events"
                        className="inline-flex items-center justify-center gap-2 rounded-full bg-(--accent-gradient) px-5 py-3 text-sm font-semibold text-white shadow-(--shadow-glow) transition-transform duration-200 hover:-translate-y-0.5"
                    >
                        <Sparkles className="h-4 w-4" />
                        Jelajahi Event
                    </Link>
                }
            />

            {stats ? (
                <CustomerMetricGrid>
                    <StatsCard
                        label="Total pesanan"
                        value={stats.total}
                        icon={Ticket}
                        tone="accent"
                        trend="Seluruh transaksi yang pernah dibuat"
                    />
                    <StatsCard
                        label="Pesanan aktif"
                        value={stats.confirmed}
                        icon={CheckCircle}
                        tone="success"
                        trend="Siap dibuka ke halaman tiket"
                    />
                    <StatsCard
                        label="Menunggu aksi"
                        value={stats.pending}
                        icon={Clock}
                        tone="warning"
                        trend="Perlu diselesaikan atau dipantau"
                    />
                    <StatsCard
                        label="Dibatalkan"
                        value={stats.cancelled}
                        icon={XCircle}
                        tone="default"
                        trend="Riwayat pesanan tidak aktif"
                    />
                </CustomerMetricGrid>
            ) : null}

            <DashboardSection
                title="Filter dan pencarian"
                description="Saring daftar pesanan berdasarkan status atau cari cepat menggunakan kode booking dan nama event."
            >
                <div className="space-y-4">
                    <div className="flex flex-wrap gap-3">
                        {FILTER_TABS.map((tab) => {
                            const Icon = tab.icon;
                            const isActive = activeTab === tab.value;
                            return (
                                <button
                                    key={tab.value}
                                    type="button"
                                    onClick={() => handleTabChange(tab.value)}
                                    className={`inline-flex items-center gap-2 rounded-full px-4 py-2.5 text-sm font-semibold transition-colors ${isActive
                                            ? "bg-(--accent-gradient) text-white"
                                            : "border border-(--border) bg-(--surface-elevated) text-(--text-secondary) hover:bg-(--surface-hover)"
                                        }`}
                                >
                                    <Icon className="h-4 w-4" />
                                    {tab.label}
                                </button>
                            );
                        })}
                    </div>
                    <label className="relative block max-w-xl">
                        <Search className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-(--text-muted)" />
                        <input
                            type="text"
                            placeholder="Cari kode pesanan atau event..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="input rounded-full pl-12"
                        />
                    </label>
                </div>
            </DashboardSection>

            {isLoading && bookings.length > 0 ? (
                <div className="flex justify-center py-2">
                    <Loader2 className="h-6 w-6 animate-spin text-(--accent-primary)" />
                </div>
            ) : null}

            <DashboardSection
                title="Daftar booking"
                description="Setiap kartu menampilkan ringkasan event, status pembayaran, komposisi tiket, dan jalur aksi yang paling relevan."
            >
                {filteredBookings.length === 0 ? (
                    <CustomerEmptyState
                        title="Tidak ada pesanan ditemukan"
                        description={
                            activeTab === "all"
                                ? "Kamu belum memiliki pesanan. Mulai eksplorasi event untuk melihat booking pertama muncul di area ini."
                                : "Tidak ada pesanan dengan filter yang sedang aktif. Coba status lain atau gunakan pencarian yang berbeda."
                        }
                        href="/events"
                        ctaLabel="Jelajahi event"
                        icon={Ticket}
                        className="border-none bg-transparent p-0 shadow-none"
                    />
                ) : (
                    <div className="space-y-5">
                        {filteredBookings.map((booking) => {
                            const statusConfig =
                                STATUS_CONFIG[booking.status] || STATUS_CONFIG.PENDING;

                            return (
                                <article
                                    key={booking.id}
                                    className="overflow-hidden rounded-[1.9rem] border border-[rgba(1,89,89,0.08)] bg-[linear-gradient(180deg,rgba(255,255,255,0.98),rgba(246,250,249,0.95))] shadow-[0_18px_44px_rgba(1,89,89,0.07)] transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[0_24px_56px_rgba(1,89,89,0.11)] dark:border-[rgba(78,222,225,0.12)] dark:bg-[linear-gradient(180deg,rgba(26,26,36,0.96),rgba(18,30,31,0.92))]"
                                >
                                    <div className="flex flex-col lg:flex-row">
                                        <div className="relative aspect-16/10 w-full shrink-0 overflow-hidden bg-(--surface-brand-soft) lg:h-auto lg:w-64 lg:aspect-auto">
                                            <Image
                                                src={booking.event.posterImage || "/placeholder.jpg"}
                                                alt={booking.event.title}
                                                fill
                                                className="object-cover"
                                                sizes="(max-width: 1024px) 100vw, 256px"
                                            />
                                            <div className="absolute inset-0 bg-linear-to-t from-black/65 via-black/20 to-transparent lg:bg-linear-to-r" />
                                            <div className="absolute left-4 top-4 flex flex-wrap gap-2">
                                                <CustomerStatusBadge
                                                    label={statusConfig.label}
                                                    tone={statusConfig.tone}
                                                    icon={statusConfig.icon}
                                                    className="border-white/10 bg-black/35 text-white backdrop-blur"
                                                />
                                                {booking.isComplimentary ? (
                                                    <CustomerStatusBadge
                                                        label="Gratis"
                                                        tone="success"
                                                        icon={Gift}
                                                        className="border-white/10 bg-black/35 text-white backdrop-blur"
                                                    />
                                                ) : null}
                                            </div>
                                            <div className="absolute bottom-4 left-4 right-4 lg:hidden">
                                                <h2 className="line-clamp-2 text-lg font-semibold text-white">
                                                    {booking.event.title}
                                                </h2>
                                            </div>
                                        </div>

                                        <div className="flex-1 space-y-5 p-5 sm:p-6">
                                            <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
                                                <div className="min-w-0 flex-1 space-y-3">
                                                    <div className="flex flex-wrap items-center gap-2">
                                                        <span className="rounded-full bg-(--bg-secondary) px-3 py-1 font-mono text-xs text-(--text-muted)">
                                                            {booking.bookingCode}
                                                        </span>
                                                        <CustomerStatusBadge
                                                            label={`${booking.totalTickets} tiket`}
                                                            tone="accent"
                                                            icon={Ticket}
                                                        />
                                                    </div>

                                                    <div className="hidden lg:block">
                                                        <h2 className="text-xl font-semibold text-foreground">
                                                            <Link
                                                                href={`/events/${booking.event.slug}`}
                                                                className="transition-colors hover:text-(--accent-primary)"
                                                            >
                                                                {booking.event.title}
                                                            </Link>
                                                        </h2>
                                                    </div>

                                                    <div className="space-y-2 text-sm text-(--text-secondary)">
                                                        {booking.eventSchedule ? (
                                                            <div className="flex items-center gap-2">
                                                                <Calendar className="h-4 w-4 text-(--accent-primary)" />
                                                                <span>
                                                                    {formatDate(
                                                                        booking.eventSchedule
                                                                            .scheduleDate,
                                                                    )}
                                                                    <span className="mx-2 text-(--text-muted)">
                                                                        •
                                                                    </span>
                                                                    {formatTime(
                                                                        booking.eventSchedule
                                                                            .startTime,
                                                                    )}
                                                                </span>
                                                            </div>
                                                        ) : null}
                                                        {booking.event.venue ? (
                                                            <div className="flex items-center gap-2">
                                                                <MapPin className="h-4 w-4 text-(--text-muted)" />
                                                                <span>
                                                                    {booking.event.venue.name}, {booking.event.venue.city}
                                                                </span>
                                                            </div>
                                                        ) : null}
                                                    </div>

                                                    <div className="flex flex-wrap gap-2">
                                                        {booking.bookedTickets.slice(0, 3).map((ticket) => (
                                                            <CustomerStatusBadge
                                                                key={ticket.id}
                                                                label={`${ticket.ticketType.name}${ticket.isCheckedIn ? " • Check-in" : ""}`}
                                                                tone={
                                                                    ticket.isCheckedIn
                                                                        ? "success"
                                                                        : "neutral"
                                                                }
                                                                icon={Ticket}
                                                            />
                                                        ))}
                                                        {booking.bookedTickets.length > 3 ? (
                                                            <CustomerStatusBadge
                                                                label={`+${booking.bookedTickets.length - 3} tiket lain`}
                                                                tone="neutral"
                                                            />
                                                        ) : null}
                                                    </div>
                                                </div>

                                                <aside className="rounded-[1.5rem] border border-(--border-light) bg-[linear-gradient(180deg,rgba(255,255,255,0.9),rgba(247,250,249,0.86))] p-4 shadow-[0_10px_28px_rgba(1,89,89,0.04)] dark:bg-(--surface-elevated) xl:w-64">
                                                    <p className="text-xs font-medium uppercase tracking-[0.18em] text-(--text-muted)">
                                                        Ringkasan pembayaran
                                                    </p>
                                                    {booking.isComplimentary ? (
                                                        <>
                                                            <div className="mt-2 flex items-center gap-2">
                                                                <Gift className="h-5 w-5 text-(--success-text)" />
                                                                <p className="text-2xl font-semibold text-(--success-text)">
                                                                    GRATIS
                                                                </p>
                                                            </div>
                                                            <p className="mt-1 text-sm text-(--text-secondary)">
                                                                Tiket complimentary
                                                            </p>
                                                        </>
                                                    ) : (
                                                        <>
                                                            <p className="mt-2 text-2xl font-semibold text-foreground">
                                                                {formatCurrency(booking.totalAmount)}
                                                            </p>
                                                            <p className="mt-1 text-sm text-(--text-secondary)">
                                                                Dibuat {formatDate(booking.createdAt)}
                                                            </p>
                                                        </>
                                                    )}

                                                    <div className="mt-4 flex flex-col gap-3">
                                                        {booking.status === "CONFIRMED" ? (
                                                            <Link
                                                                href={`/my-bookings/${booking.bookingCode}`}
                                                                className="inline-flex items-center justify-center gap-2 rounded-full bg-(--accent-gradient) px-4 py-3 text-sm font-semibold text-white shadow-(--shadow-glow)"
                                                            >
                                                                <QrCode className="h-4 w-4" />
                                                                Lihat tiket
                                                            </Link>
                                                        ) : null}

                                                        {booking.status === "AWAITING_PAYMENT" && !booking.isComplimentary ? (
                                                            <Link
                                                                href={`/checkout/payment/${booking.id}`}
                                                                className="inline-flex items-center justify-center gap-2 rounded-full bg-(--accent-gradient) px-4 py-3 text-sm font-semibold text-white shadow-(--shadow-glow)"
                                                            >
                                                                <Clock className="h-4 w-4" />
                                                                Lanjut bayar
                                                            </Link>
                                                        ) : null}

                                                        {(booking.status === "CONFIRMED" ||
                                                            booking.status === "PAID") && (
                                                                <button
                                                                    type="button"
                                                                    className="inline-flex items-center justify-center gap-2 rounded-full border border-(--border) bg-(--surface) px-4 py-3 text-sm font-semibold text-foreground transition-colors hover:bg-(--surface-hover)"
                                                                >
                                                                    <Download className="h-4 w-4" />
                                                                    Unduh ringkasan
                                                                </button>
                                                            )}

                                                        <Link
                                                            href={`/my-bookings/${booking.bookingCode}`}
                                                            className="inline-flex items-center justify-center gap-2 rounded-full border border-(--border) bg-(--surface) px-4 py-3 text-sm font-semibold text-(--text-secondary) transition-colors hover:bg-(--surface-hover)"
                                                        >
                                                            Detail booking
                                                            <ChevronRight className="h-4 w-4" />
                                                        </Link>
                                                    </div>
                                                </aside>
                                            </div>

                                            {booking.status === "AWAITING_PAYMENT" &&
                                                booking.expiresAt ? (
                                                <div className="rounded-2xl border border-[rgba(251,193,23,0.28)] bg-(--warning-bg) p-4 text-sm text-(--warning-text)">
                                                    <div className="flex items-start gap-2">
                                                        <Clock className="mt-0.5 h-4 w-4 shrink-0" />
                                                        <p>
                                                            Pembayaran berakhir pada {formatDate(booking.expiresAt)} pukul{" "}
                                                            {new Date(
                                                                booking.expiresAt,
                                                            ).toLocaleTimeString("id-ID", {
                                                                hour: "2-digit",
                                                                minute: "2-digit",
                                                            })}
                                                            . Selesaikan pembayaran agar tiket tetap aktif.
                                                        </p>
                                                    </div>
                                                </div>
                                            ) : null}
                                        </div>
                                    </div>
                                </article>
                            );
                        })}
                    </div>
                )}
            </DashboardSection>

            {pagination && pagination.totalPages > 1 ? (
                <div className="flex flex-wrap items-center justify-center gap-2">
                    <button
                        type="button"
                        onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                        disabled={currentPage === 1}
                        className="inline-flex items-center rounded-full border border-(--border) bg-(--surface-elevated) px-4 py-2.5 text-sm font-semibold text-(--text-secondary) transition-colors hover:bg-(--surface-hover) disabled:cursor-not-allowed disabled:opacity-50"
                    >
                        Sebelumnya
                    </button>

                    {Array.from({ length: pagination.totalPages }, (_, i) => i + 1)
                        .filter((page) => {
                            if (pagination.totalPages <= 7) return true;
                            if (page === 1 || page === pagination.totalPages) return true;
                            if (Math.abs(page - currentPage) <= 1) return true;
                            return false;
                        })
                        .map((page, index, arr) => {
                            const showEllipsis = index > 0 && page - arr[index - 1] > 1;
                            return (
                                <span key={page} className="flex items-center gap-2">
                                    {showEllipsis ? (
                                        <span className="px-1 text-sm text-(--text-muted)">...</span>
                                    ) : null}
                                    <button
                                        type="button"
                                        onClick={() => setCurrentPage(page)}
                                        className={`inline-flex h-11 w-11 items-center justify-center rounded-full text-sm font-semibold transition-colors ${currentPage === page
                                                ? "bg-(--accent-gradient) text-white"
                                                : "border border-(--border) bg-(--surface-elevated) text-(--text-secondary) hover:bg-(--surface-hover)"
                                            }`}
                                    >
                                        {page}
                                    </button>
                                </span>
                            );
                        })}

                    <button
                        type="button"
                        onClick={() =>
                            setCurrentPage((p) => Math.min(pagination.totalPages, p + 1))
                        }
                        disabled={currentPage === pagination.totalPages}
                        className="inline-flex items-center rounded-full border border-(--border) bg-(--surface-elevated) px-4 py-2.5 text-sm font-semibold text-(--text-secondary) transition-colors hover:bg-(--surface-hover) disabled:cursor-not-allowed disabled:opacity-50"
                    >
                        Berikutnya
                    </button>
                </div>
            ) : null}
        </div>
    );
}
