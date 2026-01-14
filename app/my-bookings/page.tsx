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
    Filter,
    Sparkles,
} from "lucide-react";

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
    status: "PENDING" | "AWAITING_PAYMENT" | "PAID" | "CONFIRMED" | "CANCELLED" | "REFUNDED" | "EXPIRED";
    paymentStatus: string;
    totalTickets: number;
    totalAmount: string;
    createdAt: string;
    expiresAt: string | null;
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

const STATUS_CONFIG: Record<string, { color: string; bgColor: string; icon: typeof CheckCircle; label: string }> = {
    PENDING: { color: "text-[var(--warning)]", bgColor: "bg-[var(--warning-bg)]", icon: Clock, label: "Menunggu" },
    AWAITING_PAYMENT: { color: "text-orange-500", bgColor: "bg-orange-100 dark:bg-orange-900/30", icon: Clock, label: "Menunggu Pembayaran" },
    PAID: { color: "text-[var(--info)]", bgColor: "bg-[var(--info-bg)]", icon: CheckCircle, label: "Dibayar" },
    CONFIRMED: { color: "text-[var(--success)]", bgColor: "bg-[var(--success-bg)]", icon: CheckCircle, label: "Dikonfirmasi" },
    CANCELLED: { color: "text-[var(--error)]", bgColor: "bg-[var(--error-bg)]", icon: XCircle, label: "Dibatalkan" },
    REFUNDED: { color: "text-purple-500", bgColor: "bg-purple-100 dark:bg-purple-900/30", icon: XCircle, label: "Dikembalikan" },
    EXPIRED: { color: "text-[var(--text-muted)]", bgColor: "bg-[var(--bg-tertiary)]", icon: XCircle, label: "Kadaluarsa" },
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

    const fetchBookings = useCallback(async (status: string, page: number) => {
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
            }
        } catch {
            setError("Gagal memuat pesanan");
        } finally {
            setIsLoading(false);
        }
    }, [router]);

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
                    <Loader2 className="h-12 w-12 text-[var(--accent-primary)] animate-spin mx-auto mb-4" />
                    <p className="text-[var(--text-muted)]">Memuat pesanan kamu...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-[60vh] flex items-center justify-center">
                <div className="text-center card p-8 max-w-md">
                    <div className="w-16 h-16 bg-[var(--error-bg)] rounded-full flex items-center justify-center mx-auto mb-4">
                        <AlertCircle className="h-8 w-8 text-[var(--error)]" />
                    </div>
                    <p className="text-[var(--text-primary)] font-bold text-lg mb-2">{error}</p>
                    <Link href="/dashboard" className="text-[var(--accent-primary)] hover:underline">
                        Kembali ke Dashboard
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <section className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-2xl sm:text-3xl font-bold text-[var(--text-primary)]">
                        Pesanan Saya
                    </h1>
                    {stats && (
                        <p className="text-[var(--text-muted)] text-sm mt-1">
                            {stats.total} total pesanan
                        </p>
                    )}
                </div>
            </section>

            {stats && (
                <section className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                    <div className="card p-4 flex items-center gap-3">
                        <div className="p-2.5 bg-indigo-500/10 text-indigo-500 rounded-xl">
                            <Ticket className="h-5 w-5" />
                        </div>
                        <div>
                            <p className="text-2xl font-bold text-[var(--text-primary)]">{stats.total}</p>
                            <p className="text-xs text-[var(--text-muted)]">Total</p>
                        </div>
                    </div>
                    <div className="card p-4 flex items-center gap-3">
                        <div className="p-2.5 bg-emerald-500/10 text-emerald-500 rounded-xl">
                            <CheckCircle className="h-5 w-5" />
                        </div>
                        <div>
                            <p className="text-2xl font-bold text-[var(--text-primary)]">{stats.confirmed}</p>
                            <p className="text-xs text-[var(--text-muted)]">Dikonfirmasi</p>
                        </div>
                    </div>
                    <div className="card p-4 flex items-center gap-3">
                        <div className="p-2.5 bg-amber-500/10 text-amber-500 rounded-xl">
                            <Clock className="h-5 w-5" />
                        </div>
                        <div>
                            <p className="text-2xl font-bold text-[var(--text-primary)]">{stats.pending}</p>
                            <p className="text-xs text-[var(--text-muted)]">Menunggu</p>
                        </div>
                    </div>
                    <div className="card p-4 flex items-center gap-3">
                        <div className="p-2.5 bg-rose-500/10 text-rose-500 rounded-xl">
                            <XCircle className="h-5 w-5" />
                        </div>
                        <div>
                            <p className="text-2xl font-bold text-[var(--text-primary)]">{stats.cancelled}</p>
                            <p className="text-xs text-[var(--text-muted)]">Dibatalkan</p>
                        </div>
                    </div>
                </section>
            )}

            <section className="card overflow-hidden">
                <div className="border-b border-[var(--border)] overflow-x-auto">
                    <div className="flex min-w-max">
                        {FILTER_TABS.map((tab) => {
                            const Icon = tab.icon;
                            return (
                                <button
                                    key={tab.value}
                                    type="button"
                                    onClick={() => handleTabChange(tab.value)}
                                    className={`flex items-center gap-2 px-5 py-3.5 text-sm font-medium border-b-2 transition-all whitespace-nowrap ${
                                        activeTab === tab.value
                                            ? "border-[var(--accent-primary)] text-[var(--accent-primary)] bg-[var(--accent-primary)]/5"
                                            : "border-transparent text-[var(--text-muted)] hover:text-[var(--text-secondary)] hover:bg-[var(--surface-hover)]"
                                    }`}
                                >
                                    <Icon className="h-4 w-4" />
                                    {tab.label}
                                </button>
                            );
                        })}
                    </div>
                </div>

                <div className="p-4">
                    <div className="relative max-w-md">
                        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-5 w-5 text-[var(--text-muted)]" />
                        <input
                            type="text"
                            placeholder="Cari kode pesanan atau event..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="input pl-11"
                        />
                    </div>
                </div>
            </section>

            {isLoading && bookings.length > 0 && (
                <div className="flex justify-center py-4">
                    <Loader2 className="h-6 w-6 text-[var(--accent-primary)] animate-spin" />
                </div>
            )}

            {filteredBookings.length === 0 ? (
                <div className="card p-12 text-center">
                    <div className="w-20 h-20 bg-gradient-to-br from-indigo-100 to-purple-100 dark:from-indigo-900/30 dark:to-purple-900/30 rounded-full flex items-center justify-center mx-auto mb-6">
                        <Ticket className="h-10 w-10 text-[var(--accent-primary)]" />
                    </div>
                    <h3 className="text-lg font-bold text-[var(--text-primary)] mb-2">Tidak ada pesanan ditemukan</h3>
                    <p className="text-[var(--text-muted)] mb-6 max-w-sm mx-auto">
                        {activeTab === "all"
                            ? "Kamu belum memiliki pesanan."
                            : `Tidak ada pesanan dengan status ini.`}
                    </p>
                    <Link href="/events" className="btn-primary inline-flex">
                        <Sparkles className="h-4 w-4" />
                        Jelajahi Event
                        <ChevronRight className="h-4 w-4" />
                    </Link>
                </div>
            ) : (
                <div className="space-y-4">
                    {filteredBookings.map((booking) => {
                        const statusConfig = STATUS_CONFIG[booking.status] || STATUS_CONFIG.PENDING;
                        const StatusIcon = statusConfig.icon;

                        return (
                            <div
                                key={booking.id}
                                className="card card-hover overflow-hidden"
                            >
                                <div className="flex flex-col md:flex-row">
                                    <div className="md:w-48 h-36 md:h-auto relative shrink-0">
                                        <Image
                                            src={booking.event.posterImage || "/placeholder.jpg"}
                                            alt={booking.event.title}
                                            fill
                                            className="object-cover"
                                            sizes="(max-width: 768px) 100vw, 192px"
                                        />
                                        <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent md:hidden" />
                                        <div className="absolute top-3 left-3">
                                            <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold ${statusConfig.bgColor} ${statusConfig.color}`}>
                                                <StatusIcon className="h-3.5 w-3.5" />
                                                {statusConfig.label}
                                            </span>
                                        </div>
                                    </div>

                                    <div className="flex-1 p-4 md:p-5">
                                        <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center gap-2 mb-1.5">
                                                    <span className="text-sm text-[var(--text-muted)] font-mono bg-[var(--bg-tertiary)] px-2 py-0.5 rounded">
                                                        {booking.bookingCode}
                                                    </span>
                                                </div>
                                                <h3 className="text-lg font-bold text-[var(--text-primary)] mb-2 line-clamp-1">
                                                    <Link
                                                        href={`/events/${booking.event.slug}`}
                                                        className="hover:text-[var(--accent-primary)] transition-colors"
                                                    >
                                                        {booking.event.title}
                                                    </Link>
                                                </h3>

                                                <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-[var(--text-muted)]">
                                                    {booking.eventSchedule && (
                                                        <div className="flex items-center gap-1.5">
                                                            <Calendar className="h-4 w-4 text-[var(--accent-primary)]" />
                                                            <span>
                                                                {formatDate(booking.eventSchedule.scheduleDate)}
                                                                <span className="mx-1 text-[var(--border)]">•</span>
                                                                {formatTime(booking.eventSchedule.startTime)}
                                                            </span>
                                                        </div>
                                                    )}
                                                    {booking.event.venue && (
                                                        <div className="flex items-center gap-1.5">
                                                            <MapPin className="h-4 w-4" />
                                                            <span>
                                                                {booking.event.venue.name}, {booking.event.venue.city}
                                                            </span>
                                                        </div>
                                                    )}
                                                </div>

                                                <div className="mt-3 flex flex-wrap gap-1.5">
                                                    {booking.bookedTickets.slice(0, 3).map((ticket) => (
                                                        <span
                                                            key={ticket.id}
                                                            className={`inline-flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-medium ${
                                                                ticket.isCheckedIn
                                                                    ? "bg-[var(--success-bg)] text-[var(--success-text)]"
                                                                    : "bg-[var(--bg-tertiary)] text-[var(--text-secondary)]"
                                                            }`}
                                                        >
                                                            <Ticket className="h-3 w-3" />
                                                            {ticket.ticketType.name}
                                                            {ticket.isCheckedIn && " ✓"}
                                                        </span>
                                                    ))}
                                                    {booking.bookedTickets.length > 3 && (
                                                        <span className="inline-flex items-center px-2 py-1 bg-[var(--bg-tertiary)] text-[var(--text-muted)] rounded-lg text-xs">
                                                            +{booking.bookedTickets.length - 3} lainnya
                                                        </span>
                                                    )}
                                                </div>
                                            </div>

                                            <div className="flex flex-row md:flex-col items-center md:items-end gap-4 pt-3 md:pt-0 border-t md:border-t-0 border-[var(--border)]">
                                                <div className="md:text-right">
                                                    <p className="text-xs text-[var(--text-muted)]">Total</p>
                                                    <p className="text-lg font-bold text-[var(--text-primary)]">
                                                        {formatCurrency(booking.totalAmount)}
                                                    </p>
                                                    <p className="text-xs text-[var(--text-muted)]">
                                                        {booking.totalTickets} tiket
                                                    </p>
                                                </div>

                                                <div className="flex gap-2">
                                                    {booking.status === "CONFIRMED" && (
                                                        <Link
                                                            href={`/my-bookings/${booking.bookingCode}`}
                                                            className="btn-primary py-2 px-3"
                                                        >
                                                            <QrCode className="h-4 w-4" />
                                                            <span className="hidden sm:inline">Lihat Tiket</span>
                                                        </Link>
                                                    )}
                                                    {booking.status === "AWAITING_PAYMENT" && (
                                                        <Link
                                                            href={`/checkout/payment/${booking.id}`}
                                                            className="btn-primary py-2 px-3 !from-orange-500 !to-amber-500"
                                                        >
                                                            Bayar
                                                        </Link>
                                                    )}
                                                    {(booking.status === "CONFIRMED" || booking.status === "PAID") && (
                                                        <button
                                                            type="button"
                                                            className="btn-secondary py-2 px-3"
                                                        >
                                                            <Download className="h-4 w-4" />
                                                        </button>
                                                    )}
                                                </div>
                                            </div>
                                        </div>

                                        {booking.status === "AWAITING_PAYMENT" && booking.expiresAt && (
                                            <div className="mt-4 p-3 bg-[var(--warning-bg)] border border-[var(--warning)]/20 rounded-xl">
                                                <p className="text-sm text-[var(--warning-text)] flex items-center gap-2">
                                                    <Clock className="h-4 w-4" />
                                                    Pembayaran berakhir pada {formatDate(booking.expiresAt)} pukul{" "}
                                                    {new Date(booking.expiresAt).toLocaleTimeString("id-ID", {
                                                        hour: "2-digit",
                                                        minute: "2-digit",
                                                    })}
                                                </p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}

            {pagination && pagination.totalPages > 1 && (
                <div className="flex justify-center gap-2">
                    <button
                        type="button"
                        onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                        disabled={currentPage === 1}
                        className="btn-secondary py-2 disabled:opacity-50"
                    >
                        Sebelumnya
                    </button>
                    <div className="flex items-center gap-1">
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
                                    <span key={page} className="flex items-center">
                                        {showEllipsis && (
                                            <span className="px-2 text-[var(--text-muted)]">...</span>
                                        )}
                                        <button
                                            type="button"
                                            onClick={() => setCurrentPage(page)}
                                            className={`w-10 h-10 rounded-xl text-sm font-medium transition-all ${
                                                currentPage === page
                                                    ? "bg-[var(--accent-primary)] text-white"
                                                    : "hover:bg-[var(--surface-hover)] text-[var(--text-secondary)]"
                                            }`}
                                        >
                                            {page}
                                        </button>
                                    </span>
                                );
                            })}
                    </div>
                    <button
                        type="button"
                        onClick={() => setCurrentPage((p) => Math.min(pagination.totalPages, p + 1))}
                        disabled={currentPage === pagination.totalPages}
                        className="btn-secondary py-2 disabled:opacity-50"
                    >
                        Selanjutnya
                    </button>
                </div>
            )}
        </div>
    );
}
