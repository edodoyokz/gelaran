"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
    ArrowLeft,
    Calendar,
    MapPin,
    Users,
    Ticket,
    TrendingUp,
    Clock,
    Eye,
    Edit2,
    Send,
    ExternalLink,
    CheckCircle,
    XCircle,
    MoreVertical,
    Plus,
    Trash2,
    RefreshCw,
    UserCheck,
    QrCode,
    Copy,
    AlertCircle,
    Loader2,
} from "lucide-react";
import { formatCurrency } from "@/lib/utils";

interface EventSchedule {
    id: string;
    title: string;
    scheduleDate: string;
    startTime: string;
    endTime: string;
}

interface TicketType {
    id: string;
    name: string;
    description: string | null;
    basePrice: number;
    totalQuantity: number;
    isFree: boolean;
    isHidden: boolean;
    saleStartAt: string | null;
    saleEndAt: string | null;
    _count: {
        bookedTickets: number;
    };
}

interface Venue {
    id: string;
    name: string;
    address: string;
    city: string;
    province: string;
}

interface Category {
    id: string;
    name: string;
    slug: string;
}

interface EventStats {
    totalTickets: number;
    soldTickets: number;
    reservedTickets: number;
    availableTickets: number;
    totalRevenue: number;
    organizerRevenue: number;
    totalBookings: number;
    totalReviews: number;
    checkedInCount: number;
}

interface EventData {
    id: string;
    title: string;
    slug: string;
    shortDescription: string | null;
    description: string;
    posterImage: string | null;
    bannerImage: string | null;
    eventType: "OFFLINE" | "ONLINE" | "HYBRID";
    status: "DRAFT" | "PENDING_REVIEW" | "PUBLISHED" | "CANCELLED" | "COMPLETED";
    visibility: "PUBLIC" | "PRIVATE" | "PASSWORD_PROTECTED";
    onlineMeetingUrl: string | null;
    createdAt: string;
    publishedAt: string | null;
    category: Category | null;
    venue: Venue | null;
    schedules: EventSchedule[];
    ticketTypes: TicketType[];
    stats: EventStats;
}

type TabType = "overview" | "tickets" | "attendees" | "settings";

const STATUS_COLORS: Record<string, string> = {
    DRAFT: "bg-gray-100 text-gray-700",
    PENDING_REVIEW: "bg-yellow-100 text-yellow-700",
    PUBLISHED: "bg-green-100 text-green-700",
    CANCELLED: "bg-red-100 text-red-700",
    COMPLETED: "bg-blue-100 text-blue-700",
};

const STATUS_LABELS: Record<string, string> = {
    DRAFT: "Draft",
    PENDING_REVIEW: "Menunggu Review",
    PUBLISHED: "Dipublikasikan",
    CANCELLED: "Dibatalkan",
    COMPLETED: "Selesai",
};

export default function EventDetailPage() {
    const params = useParams();
    const router = useRouter();
    const eventId = params.id as string;

    const [event, setEvent] = useState<EventData | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [activeTab, setActiveTab] = useState<TabType>("overview");
    const [isPublishing, setIsPublishing] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);

    useEffect(() => {
        const loadEvent = async () => {
            try {
                setIsLoading(true);
                const res = await fetch(`/api/organizer/events/${eventId}`);
                const data = await res.json();

                if (!data.success) {
                    setError(data.error || "Gagal memuat event");
                    return;
                }

                setEvent(data.data);
            } catch {
                setError("Terjadi kesalahan saat memuat data");
            } finally {
                setIsLoading(false);
            }
        };

        loadEvent();
    }, [eventId]);

    const refetchEvent = async () => {
        try {
            const res = await fetch(`/api/organizer/events/${eventId}`);
            const data = await res.json();

            if (data.success) {
                setEvent(data.data);
            }
        } catch {
            console.error("Failed to refetch event");
        }
    };

    const handlePublish = async () => {
        if (!event) return;

        try {
            setIsPublishing(true);
            const res = await fetch(`/api/organizer/events/${eventId}/publish`, {
                method: "POST",
            });
            const data = await res.json();

            if (!data.success) {
                alert(data.error || "Gagal mengirim untuk review");
                return;
            }

            refetchEvent();
        } catch (err) {
            alert("Terjadi kesalahan");
        } finally {
            setIsPublishing(false);
        }
    };

    const handleDelete = async () => {
        try {
            setIsDeleting(true);
            const res = await fetch(`/api/organizer/events/${eventId}`, {
                method: "DELETE",
            });
            const data = await res.json();

            if (!data.success) {
                alert(data.error || "Gagal menghapus event");
                return;
            }

            router.push("/organizer/events");
        } catch (err) {
            alert("Terjadi kesalahan");
        } finally {
            setIsDeleting(false);
            setShowDeleteModal(false);
        }
    };

    const copyEventUrl = () => {
        if (!event) return;
        const url = `${window.location.origin}/events/${event.slug}`;
        navigator.clipboard.writeText(url);
        alert("URL berhasil disalin!");
    };

    if (isLoading) {
        return (
            <div className="min-h-screen bg-gray-100 flex items-center justify-center">
                <div className="text-center">
                    <Loader2 className="h-12 w-12 text-indigo-600 animate-spin mx-auto mb-4" />
                    <p className="text-gray-500">Memuat data event...</p>
                </div>
            </div>
        );
    }

    if (error || !event) {
        return (
            <div className="min-h-screen bg-gray-100 flex items-center justify-center">
                <div className="text-center">
                    <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
                    <p className="text-gray-900 font-medium mb-2">{error || "Event tidak ditemukan"}</p>
                    <Link href="/organizer/events" className="text-indigo-600 hover:text-indigo-500">
                        Kembali ke daftar event
                    </Link>
                </div>
            </div>
        );
    }

    const tabs: { id: TabType; label: string; icon: React.ElementType }[] = [
        { id: "overview", label: "Overview", icon: Eye },
        { id: "tickets", label: "Tiket", icon: Ticket },
        { id: "attendees", label: "Peserta", icon: Users },
        { id: "settings", label: "Pengaturan", icon: Edit2 },
    ];

    const firstSchedule = event.schedules[0];
    const eventDate = firstSchedule ? new Date(firstSchedule.scheduleDate) : null;

    return (
        <div className="min-h-screen bg-gray-100">
            <header className="bg-white border-b">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
                    <div className="flex items-center gap-4 mb-4">
                        <Link href="/organizer/events" className="text-gray-500 hover:text-gray-700">
                            <ArrowLeft className="h-5 w-5" />
                        </Link>
                        <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-3">
                                <h1 className="text-2xl font-bold text-gray-900 truncate">{event.title}</h1>
                                <span className={`px-2.5 py-1 text-xs font-medium rounded-full ${STATUS_COLORS[event.status]}`}>
                                    {STATUS_LABELS[event.status]}
                                </span>
                            </div>
                            <p className="text-sm text-gray-500 mt-1">
                                {event.category?.name || "Tanpa Kategori"} •{" "}
                                {eventDate ? eventDate.toLocaleDateString("id-ID", { dateStyle: "long" }) : "Belum ada jadwal"}
                            </p>
                        </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-3">
                        {event.status === "DRAFT" && (
                            <button
                                type="button"
                                onClick={handlePublish}
                                disabled={isPublishing}
                                className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 disabled:opacity-50"
                            >
                                {isPublishing ? (
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                ) : (
                                    <Send className="h-4 w-4" />
                                )}
                                Kirim untuk Review
                            </button>
                        )}
                        {event.status === "PUBLISHED" && (
                            <Link
                                href={`/events/${event.slug}`}
                                target="_blank"
                                className="inline-flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700"
                            >
                                <ExternalLink className="h-4 w-4" />
                                Lihat Halaman Publik
                            </Link>
                        )}
                        <Link
                            href={`/organizer/events/${eventId}/edit`}
                            className="inline-flex items-center gap-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50"
                        >
                            <Edit2 className="h-4 w-4" />
                            Edit Event
                        </Link>
                        <button
                            type="button"
                            onClick={copyEventUrl}
                            className="inline-flex items-center gap-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50"
                        >
                            <Copy className="h-4 w-4" />
                            Salin URL
                        </button>
                        <button
                            type="button"
                            onClick={() => setShowDeleteModal(true)}
                            className="inline-flex items-center gap-2 px-4 py-2 border border-red-300 text-red-600 rounded-lg font-medium hover:bg-red-50"
                        >
                            <Trash2 className="h-4 w-4" />
                            Hapus
                        </button>
                    </div>

                    <div className="flex gap-1 mt-6 border-b -mb-px">
                        {tabs.map((tab) => (
                            <button
                                key={tab.id}
                                type="button"
                                onClick={() => setActiveTab(tab.id)}
                                className={`inline-flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
                                    activeTab === tab.id
                                        ? "border-indigo-600 text-indigo-600"
                                        : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                                }`}
                            >
                                <tab.icon className="h-4 w-4" />
                                {tab.label}
                            </button>
                        ))}
                    </div>
                </div>
            </header>

            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {activeTab === "overview" && (
                    <OverviewTab event={event} onRefresh={refetchEvent} />
                )}
                {activeTab === "tickets" && (
                    <TicketsTab event={event} onRefresh={refetchEvent} />
                )}
                {activeTab === "attendees" && (
                    <AttendeesTab event={event} />
                )}
                {activeTab === "settings" && (
                    <SettingsTab event={event} />
                )}
            </main>

            {showDeleteModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl max-w-md w-full p-6">
                        <h3 className="text-lg font-bold text-gray-900 mb-2">Hapus Event?</h3>
                        <p className="text-gray-600 mb-6">
                            Event &quot;{event.title}&quot; akan dihapus secara permanen. Aksi ini tidak dapat dibatalkan.
                        </p>
                        <div className="flex gap-3">
                            <button
                                type="button"
                                onClick={() => setShowDeleteModal(false)}
                                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50"
                            >
                                Batal
                            </button>
                            <button
                                type="button"
                                onClick={handleDelete}
                                disabled={isDeleting}
                                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 disabled:opacity-50"
                            >
                                {isDeleting ? "Menghapus..." : "Ya, Hapus"}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

function OverviewTab({ event, onRefresh }: { event: EventData; onRefresh: () => void }) {
    const stats = [
        {
            label: "Tiket Terjual",
            value: event.stats.soldTickets,
            total: event.stats.totalTickets,
            icon: Ticket,
            color: "indigo",
            showProgress: true,
        },
        {
            label: "Total Pendapatan",
            value: formatCurrency(event.stats.organizerRevenue),
            icon: TrendingUp,
            color: "green",
        },
        {
            label: "Total Booking",
            value: event.stats.totalBookings,
            icon: Users,
            color: "purple",
        },
        {
            label: "Check-in",
            value: event.stats.checkedInCount,
            total: event.stats.soldTickets,
            icon: UserCheck,
            color: "blue",
            showProgress: true,
        },
    ];

    const colorMap: Record<string, { bg: string; icon: string; progress: string }> = {
        indigo: { bg: "bg-indigo-100", icon: "text-indigo-600", progress: "bg-indigo-600" },
        green: { bg: "bg-green-100", icon: "text-green-600", progress: "bg-green-600" },
        purple: { bg: "bg-purple-100", icon: "text-purple-600", progress: "bg-purple-600" },
        blue: { bg: "bg-blue-100", icon: "text-blue-600", progress: "bg-blue-600" },
    };

    return (
        <div className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {stats.map((stat) => {
                    const colors = colorMap[stat.color];
                    const progressPercent = stat.showProgress && stat.total
                        ? Math.round((Number(stat.value) / stat.total) * 100)
                        : null;

                    return (
                        <div key={stat.label} className="bg-white rounded-xl p-6 shadow-sm">
                            <div className="flex items-center gap-3 mb-4">
                                <div className={`w-12 h-12 ${colors.bg} rounded-lg flex items-center justify-center`}>
                                    <stat.icon className={`h-6 w-6 ${colors.icon}`} />
                                </div>
                            </div>
                            <p className="text-2xl font-bold text-gray-900">
                                {stat.value}
                                {stat.total !== undefined && (
                                    <span className="text-sm font-normal text-gray-500"> / {stat.total}</span>
                                )}
                            </p>
                            <p className="text-sm text-gray-500">{stat.label}</p>
                            {progressPercent !== null && (
                                <div className="mt-3">
                                    <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                                        <div
                                            className={`h-full ${colors.progress} rounded-full transition-all`}
                                            style={{ width: `${progressPercent}%` }}
                                        />
                                    </div>
                                    <p className="text-xs text-gray-400 mt-1">{progressPercent}%</p>
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>

            <div className="grid lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 bg-white rounded-xl shadow-sm overflow-hidden">
                    <div className="px-6 py-4 border-b flex items-center justify-between">
                        <h2 className="text-lg font-semibold">Detail Event</h2>
                        <button type="button" onClick={onRefresh} className="text-gray-400 hover:text-gray-600">
                            <RefreshCw className="h-4 w-4" />
                        </button>
                    </div>
                    <div className="p-6">
                        <div className="flex gap-6">
                            {event.posterImage && (
                                <img
                                    src={event.posterImage}
                                    alt={event.title}
                                    className="w-32 h-48 object-cover rounded-lg flex-shrink-0"
                                />
                            )}
                            <div className="flex-1 space-y-4">
                                <div>
                                    <span className="text-xs font-medium text-gray-400 uppercase tracking-wider">Deskripsi</span>
                                    <p className="text-gray-700 mt-1 line-clamp-3">{event.shortDescription || event.description}</p>
                                </div>

                                <div className="grid sm:grid-cols-2 gap-4">
                                    <div className="flex items-start gap-3">
                                        <Calendar className="h-5 w-5 text-gray-400 mt-0.5" />
                                        <div>
                                            <span className="text-xs font-medium text-gray-400 uppercase tracking-wider">Jadwal</span>
                                            {event.schedules.length > 0 ? (
                                                <div className="mt-1 space-y-1">
                                                    {event.schedules.slice(0, 3).map((schedule) => (
                                                        <p key={schedule.id} className="text-sm text-gray-700">
                                                            {new Date(schedule.scheduleDate).toLocaleDateString("id-ID")} •{" "}
                                                            {schedule.startTime} - {schedule.endTime}
                                                        </p>
                                                    ))}
                                                    {event.schedules.length > 3 && (
                                                        <p className="text-sm text-gray-400">+{event.schedules.length - 3} jadwal lainnya</p>
                                                    )}
                                                </div>
                                            ) : (
                                                <p className="text-sm text-gray-500 mt-1">Belum ada jadwal</p>
                                            )}
                                        </div>
                                    </div>

                                    <div className="flex items-start gap-3">
                                        <MapPin className="h-5 w-5 text-gray-400 mt-0.5" />
                                        <div>
                                            <span className="text-xs font-medium text-gray-400 uppercase tracking-wider">Lokasi</span>
                                            {event.venue ? (
                                                <div className="mt-1">
                                                    <p className="text-sm font-medium text-gray-700">{event.venue.name}</p>
                                                    <p className="text-sm text-gray-500">{event.venue.city}, {event.venue.province}</p>
                                                </div>
                                            ) : event.eventType === "ONLINE" ? (
                                                <p className="text-sm text-gray-500 mt-1">Event Online</p>
                                            ) : (
                                                <p className="text-sm text-gray-500 mt-1">Belum ada lokasi</p>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-xl shadow-sm overflow-hidden">
                    <div className="px-6 py-4 border-b">
                        <h2 className="text-lg font-semibold">Aksi Cepat</h2>
                    </div>
                    <div className="p-4 space-y-2">
                        <Link
                            href={`/organizer/events/${event.id}/scanner`}
                            className="flex items-center gap-3 w-full px-4 py-3 rounded-lg hover:bg-gray-50 transition-colors"
                        >
                            <div className="w-10 h-10 bg-indigo-100 rounded-lg flex items-center justify-center">
                                <QrCode className="h-5 w-5 text-indigo-600" />
                            </div>
                            <div className="text-left">
                                <p className="font-medium text-gray-900">Scan Tiket</p>
                                <p className="text-sm text-gray-500">Check-in peserta</p>
                            </div>
                        </Link>
                        <Link
                            href={`/organizer/events/${event.id}/attendees`}
                            className="flex items-center gap-3 w-full px-4 py-3 rounded-lg hover:bg-gray-50 transition-colors"
                        >
                            <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                                <Users className="h-5 w-5 text-purple-600" />
                            </div>
                            <div className="text-left">
                                <p className="font-medium text-gray-900">Daftar Peserta</p>
                                <p className="text-sm text-gray-500">{event.stats.soldTickets} terdaftar</p>
                            </div>
                        </Link>
                        <Link
                            href={`/organizer/events/${event.id}/promo`}
                            className="flex items-center gap-3 w-full px-4 py-3 rounded-lg hover:bg-gray-50 transition-colors"
                        >
                            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                                <Ticket className="h-5 w-5 text-green-600" />
                            </div>
                            <div className="text-left">
                                <p className="font-medium text-gray-900">Kode Promo</p>
                                <p className="text-sm text-gray-500">Kelola diskon</p>
                            </div>
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}

function TicketsTab({ event, onRefresh }: { event: EventData; onRefresh: () => void }) {
    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-gray-900">Tipe Tiket</h2>
                <Link
                    href={`/organizer/events/${event.id}/tickets/new`}
                    className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700"
                >
                    <Plus className="h-4 w-4" />
                    Tambah Tiket
                </Link>
            </div>

            {event.ticketTypes.length === 0 ? (
                <div className="bg-white rounded-xl shadow-sm p-12 text-center">
                    <Ticket className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-500 mb-4">Belum ada tipe tiket. Tambahkan tiket untuk event ini.</p>
                    <Link
                        href={`/organizer/events/${event.id}/tickets/new`}
                        className="inline-flex items-center gap-2 text-indigo-600 font-medium"
                    >
                        <Plus className="h-4 w-4" />
                        Tambah Tiket Pertama
                    </Link>
                </div>
            ) : (
                <div className="grid gap-4">
                    {event.ticketTypes.map((ticket) => {
                        const soldPercent = ticket.totalQuantity > 0
                            ? Math.round((ticket._count.bookedTickets / ticket.totalQuantity) * 100)
                            : 0;
                        const remaining = ticket.totalQuantity - ticket._count.bookedTickets;

                        return (
                            <div key={ticket.id} className="bg-white rounded-xl shadow-sm p-6">
                                <div className="flex items-start justify-between mb-4">
                                    <div>
                                        <div className="flex items-center gap-2">
                                            <h3 className="font-semibold text-gray-900">{ticket.name}</h3>
                                            {ticket.isHidden && (
                                                <span className="px-2 py-0.5 bg-gray-100 text-gray-600 text-xs rounded-full">Hidden</span>
                                            )}
                                            {ticket.isFree && (
                                                <span className="px-2 py-0.5 bg-green-100 text-green-700 text-xs rounded-full">Gratis</span>
                                            )}
                                        </div>
                                        {ticket.description && (
                                            <p className="text-sm text-gray-500 mt-1">{ticket.description}</p>
                                        )}
                                    </div>
                                    <div className="text-right">
                                        <p className="text-xl font-bold text-gray-900">
                                            {ticket.isFree ? "GRATIS" : formatCurrency(Number(ticket.basePrice))}
                                        </p>
                                    </div>
                                </div>

                                <div className="flex items-center gap-6 text-sm">
                                    <div>
                                        <span className="text-gray-500">Terjual:</span>
                                        <span className="font-medium text-gray-900 ml-1">
                                            {ticket._count.bookedTickets} / {ticket.totalQuantity}
                                        </span>
                                    </div>
                                    <div>
                                        <span className="text-gray-500">Tersisa:</span>
                                        <span className={`font-medium ml-1 ${remaining < 10 ? "text-red-600" : "text-gray-900"}`}>
                                            {remaining}
                                        </span>
                                    </div>
                                </div>

                                <div className="mt-3">
                                    <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                                        <div
                                            className={`h-full rounded-full transition-all ${
                                                soldPercent >= 90 ? "bg-red-500" : soldPercent >= 50 ? "bg-yellow-500" : "bg-indigo-600"
                                            }`}
                                            style={{ width: `${soldPercent}%` }}
                                        />
                                    </div>
                                </div>

                                {(ticket.saleStartAt || ticket.saleEndAt) && (
                                    <div className="mt-4 flex items-center gap-2 text-xs text-gray-500">
                                        <Clock className="h-3.5 w-3.5" />
                                        {ticket.saleStartAt && (
                                            <span>Mulai: {new Date(ticket.saleStartAt).toLocaleDateString("id-ID")}</span>
                                        )}
                                        {ticket.saleStartAt && ticket.saleEndAt && <span>•</span>}
                                        {ticket.saleEndAt && (
                                            <span>Berakhir: {new Date(ticket.saleEndAt).toLocaleDateString("id-ID")}</span>
                                        )}
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}

function AttendeesTab({ event }: { event: EventData }) {
    const [attendees, setAttendees] = useState<unknown[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const eventId = event.id;

    useEffect(() => {
        const loadAttendees = async () => {
            try {
                setIsLoading(true);
                const res = await fetch(`/api/organizer/events/${eventId}/attendees`);
                const data = await res.json();

                if (data.success) {
                    setAttendees(data.data);
                }
            } catch {
                console.error("Failed to fetch attendees");
            } finally {
                setIsLoading(false);
            }
        };

        loadAttendees();
    }, [eventId]);

    if (isLoading) {
        return (
            <div className="bg-white rounded-xl shadow-sm p-12 text-center">
                <Loader2 className="h-8 w-8 text-indigo-600 animate-spin mx-auto mb-4" />
                <p className="text-gray-500">Memuat data peserta...</p>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-gray-900">Daftar Peserta</h2>
                <div className="flex gap-3">
                    <Link
                        href={`/organizer/events/${event.id}/scanner`}
                        className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700"
                    >
                        <QrCode className="h-4 w-4" />
                        Scan Tiket
                    </Link>
                </div>
            </div>

            <div className="grid sm:grid-cols-3 gap-4">
                <div className="bg-white rounded-xl p-5 shadow-sm">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-indigo-100 rounded-lg flex items-center justify-center">
                            <Users className="h-5 w-5 text-indigo-600" />
                        </div>
                        <div>
                            <p className="text-2xl font-bold text-gray-900">{event.stats.soldTickets}</p>
                            <p className="text-sm text-gray-500">Total Terdaftar</p>
                        </div>
                    </div>
                </div>
                <div className="bg-white rounded-xl p-5 shadow-sm">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                            <CheckCircle className="h-5 w-5 text-green-600" />
                        </div>
                        <div>
                            <p className="text-2xl font-bold text-gray-900">{event.stats.checkedInCount}</p>
                            <p className="text-sm text-gray-500">Sudah Check-in</p>
                        </div>
                    </div>
                </div>
                <div className="bg-white rounded-xl p-5 shadow-sm">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-yellow-100 rounded-lg flex items-center justify-center">
                            <Clock className="h-5 w-5 text-yellow-600" />
                        </div>
                        <div>
                            <p className="text-2xl font-bold text-gray-900">{event.stats.soldTickets - event.stats.checkedInCount}</p>
                            <p className="text-sm text-gray-500">Belum Check-in</p>
                        </div>
                    </div>
                </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm overflow-hidden">
                <div className="p-12 text-center text-gray-500">
                    <Users className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                    <p>Daftar peserta lengkap akan ditampilkan di sini.</p>
                    <p className="text-sm mt-1">Fitur dalam pengembangan.</p>
                </div>
            </div>
        </div>
    );
}

function SettingsTab({ event }: { event: EventData }) {
    return (
        <div className="space-y-6">
            <div className="bg-white rounded-xl shadow-sm overflow-hidden">
                <div className="px-6 py-4 border-b">
                    <h2 className="text-lg font-semibold">Informasi Event</h2>
                </div>
                <div className="p-6 space-y-4">
                    <div className="grid sm:grid-cols-2 gap-4">
                        <div>
                            <span className="text-xs font-medium text-gray-400 uppercase tracking-wider">Tipe Event</span>
                            <p className="text-gray-900 mt-1">{event.eventType}</p>
                        </div>
                        <div>
                            <span className="text-xs font-medium text-gray-400 uppercase tracking-wider">Visibilitas</span>
                            <p className="text-gray-900 mt-1">{event.visibility}</p>
                        </div>
                        <div>
                            <span className="text-xs font-medium text-gray-400 uppercase tracking-wider">Kategori</span>
                            <p className="text-gray-900 mt-1">{event.category?.name || "-"}</p>
                        </div>
                        <div>
                            <span className="text-xs font-medium text-gray-400 uppercase tracking-wider">Status</span>
                            <p className="text-gray-900 mt-1">{STATUS_LABELS[event.status]}</p>
                        </div>
                    </div>
                </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm overflow-hidden">
                <div className="px-6 py-4 border-b">
                    <h2 className="text-lg font-semibold">Tindakan</h2>
                </div>
                <div className="p-6 space-y-4">
                    <Link
                        href={`/organizer/events/${event.id}/edit`}
                        className="flex items-center justify-between w-full px-4 py-3 border border-gray-200 rounded-lg hover:bg-gray-50"
                    >
                        <div className="flex items-center gap-3">
                            <Edit2 className="h-5 w-5 text-gray-400" />
                            <div>
                                <p className="font-medium text-gray-900">Edit Event</p>
                                <p className="text-sm text-gray-500">Ubah informasi event</p>
                            </div>
                        </div>
                        <ArrowLeft className="h-5 w-5 text-gray-400 rotate-180" />
                    </Link>
                </div>
            </div>
        </div>
    );
}
