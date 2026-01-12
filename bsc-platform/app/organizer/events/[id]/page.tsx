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
    Tag,
} from "lucide-react";
import { formatCurrency } from "@/lib/utils";

interface EventSchedule {
    id: string;
    title: string | null;
    scheduleDate: string;
    startTime: string;
    endTime: string;
    description: string | null;
    locationOverride: string | null;
    isActive: boolean;
}

interface TicketType {
    id: string;
    name: string;
    description: string | null;
    basePrice: number;
    totalQuantity: number;
    minPerOrder: number;
    maxPerOrder: number;
    isFree: boolean;
    isHidden: boolean;
    isActive: boolean;
    saleStartAt: string | null;
    saleEndAt: string | null;
    _count: {
        bookedTickets: number;
    };
}

interface PromoCode {
    id: string;
    code: string;
    discountType: "PERCENTAGE" | "FIXED_AMOUNT";
    discountValue: number;
    maxDiscountAmount: number | null;
    minOrderAmount: number | null;
    usageLimitTotal: number | null;
    usageLimitPerUser: number | null;
    validFrom: string;
    validUntil: string;
    isActive: boolean;
    _count: {
        usages: number;
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

type TabType = "overview" | "schedules" | "tickets" | "promo-codes" | "attendees" | "settings";

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
        { id: "schedules", label: "Jadwal", icon: Calendar },
        { id: "tickets", label: "Tiket", icon: Ticket },
        { id: "promo-codes", label: "Promo", icon: Tag },
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
                {activeTab === "schedules" && (
                    <SchedulesTab event={event} onRefresh={refetchEvent} />
                )}
                {activeTab === "tickets" && (
                    <TicketsTab event={event} onRefresh={refetchEvent} />
                )}
                {activeTab === "promo-codes" && (
                    <PromoCodesTab event={event} />
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
    const [editingTicket, setEditingTicket] = useState<TicketType | null>(null);
    const [isDeleting, setIsDeleting] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);

    const handleDelete = async (ticketId: string) => {
        if (!confirm("Apakah Anda yakin ingin menghapus tiket ini?")) return;

        try {
            setIsDeleting(ticketId);
            const res = await fetch(`/api/organizer/events/${event.id}/tickets/${ticketId}`, {
                method: "DELETE",
            });
            const data = await res.json();

            if (!data.success) {
                alert(data.error || "Gagal menghapus tiket");
                return;
            }

            onRefresh();
        } catch (error) {
            alert("Terjadi kesalahan saat menghapus tiket");
        } finally {
            setIsDeleting(null);
        }
    };

    const handleSave = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (!editingTicket) return;

        const formData = new FormData(e.currentTarget);
        const payload = {
            name: formData.get("name"),
            description: formData.get("description"),
            basePrice: Number(formData.get("basePrice")),
            totalQuantity: Number(formData.get("totalQuantity")),
            minPerOrder: Number(formData.get("minPerOrder")),
            maxPerOrder: Number(formData.get("maxPerOrder")),
            isFree: formData.get("isFree") === "on",
            isHidden: formData.get("isHidden") === "on",
            isActive: formData.get("isActive") === "on",
            saleStartAt: formData.get("saleStartAt") ? new Date(formData.get("saleStartAt") as string).toISOString() : null,
            saleEndAt: formData.get("saleEndAt") ? new Date(formData.get("saleEndAt") as string).toISOString() : null,
        };

        try {
            setIsLoading(true);
            const res = await fetch(`/api/organizer/events/${event.id}/tickets/${editingTicket.id}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload),
            });
            const data = await res.json();

            if (!data.success) {
                alert(data.error || "Gagal menyimpan tiket");
                return;
            }

            setEditingTicket(null);
            onRefresh();
        } catch (error) {
            alert("Terjadi kesalahan saat menyimpan tiket");
        } finally {
            setIsLoading(false);
        }
    };

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
                                            {!ticket.isActive && (
                                                <span className="px-2 py-0.5 bg-red-100 text-red-700 text-xs rounded-full">Non-aktif</span>
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

                                <div className="mt-4 flex gap-2 justify-end border-t pt-4">
                                    <button
                                        onClick={() => setEditingTicket(ticket)}
                                        className="inline-flex items-center gap-1.5 px-3 py-1.5 border border-gray-300 text-gray-700 text-sm rounded-lg hover:bg-gray-50"
                                    >
                                        <Edit2 className="h-3.5 w-3.5" />
                                        Edit
                                    </button>
                                    <button
                                        onClick={() => handleDelete(ticket.id)}
                                        disabled={isDeleting === ticket.id || ticket._count.bookedTickets > 0}
                                        className="inline-flex items-center gap-1.5 px-3 py-1.5 border border-red-200 text-red-600 text-sm rounded-lg hover:bg-red-50 disabled:opacity-50 disabled:cursor-not-allowed"
                                        title={ticket._count.bookedTickets > 0 ? "Tidak dapat menghapus tiket yang sudah terjual" : "Hapus tiket"}
                                    >
                                        {isDeleting === ticket.id ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Trash2 className="h-3.5 w-3.5" />}
                                        Hapus
                                    </button>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}

            {editingTicket && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
                        <div className="p-6 border-b flex justify-between items-center sticky top-0 bg-white z-10">
                            <h3 className="text-lg font-bold text-gray-900">Edit Tiket</h3>
                            <button onClick={() => setEditingTicket(null)} className="text-gray-400 hover:text-gray-600">
                                <XCircle className="h-6 w-6" />
                            </button>
                        </div>
                        <form onSubmit={handleSave} className="p-6 space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Nama Tiket</label>
                                <input name="name" defaultValue={editingTicket.name} required className="w-full px-3 py-2 border rounded-lg" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Deskripsi</label>
                                <textarea name="description" defaultValue={editingTicket.description || ""} className="w-full px-3 py-2 border rounded-lg" rows={3} />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Harga (Rp)</label>
                                    <input name="basePrice" type="number" defaultValue={editingTicket.basePrice} min="0" required className="w-full px-3 py-2 border rounded-lg" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Total Kuota</label>
                                    <input name="totalQuantity" type="number" defaultValue={editingTicket.totalQuantity} min="1" required className="w-full px-3 py-2 border rounded-lg" />
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Min. per Order</label>
                                    <input name="minPerOrder" type="number" defaultValue={editingTicket.minPerOrder || 1} min="1" required className="w-full px-3 py-2 border rounded-lg" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Max. per Order</label>
                                    <input name="maxPerOrder" type="number" defaultValue={editingTicket.maxPerOrder || 5} min="1" required className="w-full px-3 py-2 border rounded-lg" />
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Mulai Penjualan</label>
                                    <input name="saleStartAt" type="datetime-local" defaultValue={editingTicket.saleStartAt ? new Date(editingTicket.saleStartAt).toISOString().slice(0, 16) : ""} className="w-full px-3 py-2 border rounded-lg" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Akhir Penjualan</label>
                                    <input name="saleEndAt" type="datetime-local" defaultValue={editingTicket.saleEndAt ? new Date(editingTicket.saleEndAt).toISOString().slice(0, 16) : ""} className="w-full px-3 py-2 border rounded-lg" />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <label className="flex items-center gap-2">
                                    <input name="isFree" type="checkbox" defaultChecked={editingTicket.isFree} className="rounded border-gray-300" />
                                    <span className="text-sm text-gray-700">Tiket Gratis</span>
                                </label>
                                <label className="flex items-center gap-2">
                                    <input name="isHidden" type="checkbox" defaultChecked={editingTicket.isHidden} className="rounded border-gray-300" />
                                    <span className="text-sm text-gray-700">Sembunyikan Tiket</span>
                                </label>
                                <label className="flex items-center gap-2">
                                    <input name="isActive" type="checkbox" defaultChecked={editingTicket.isActive} className="rounded border-gray-300" />
                                    <span className="text-sm text-gray-700">Aktif</span>
                                </label>
                            </div>
                            <div className="pt-4 flex gap-3">
                                <button type="button" onClick={() => setEditingTicket(null)} className="flex-1 px-4 py-2 border rounded-lg hover:bg-gray-50">Batal</button>
                                <button type="submit" disabled={isLoading} className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50">
                                    {isLoading ? "Menyimpan..." : "Simpan Perubahan"}
                                </button>
                            </div>
                        </form>
                    </div>
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

function SchedulesTab({ event, onRefresh }: { event: EventData; onRefresh: () => void }) {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingSchedule, setEditingSchedule] = useState<EventSchedule | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [isDeleting, setIsDeleting] = useState<string | null>(null);

    const handleEdit = (schedule: EventSchedule) => {
        setEditingSchedule(schedule);
        setIsModalOpen(true);
    };

    const handleDelete = async (scheduleId: string) => {
        if (!confirm("Apakah Anda yakin ingin menghapus jadwal ini?")) return;

        try {
            setIsDeleting(scheduleId);
            const res = await fetch(`/api/organizer/events/${event.id}/schedules/${scheduleId}`, {
                method: "DELETE",
            });
            const data = await res.json();

            if (!data.success) {
                alert(data.error || "Gagal menghapus jadwal");
                return;
            }

            onRefresh();
        } catch (error) {
            alert("Terjadi kesalahan saat menghapus jadwal");
        } finally {
            setIsDeleting(null);
        }
    };

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const formData = new FormData(e.currentTarget);
        const payload = {
            title: formData.get("title"),
            scheduleDate: new Date(formData.get("scheduleDate") as string).toISOString(),
            startTime: formData.get("startTime"),
            endTime: formData.get("endTime"),
            description: formData.get("description"),
            locationOverride: formData.get("locationOverride"),
        };

        try {
            setIsLoading(true);
            const url = editingSchedule
                ? `/api/organizer/events/${event.id}/schedules/${editingSchedule.id}`
                : `/api/organizer/events/${event.id}/schedules`;
            
            const method = editingSchedule ? "PUT" : "POST";

            const res = await fetch(url, {
                method,
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload),
            });
            const data = await res.json();

            if (!data.success) {
                alert(data.error || "Gagal menyimpan jadwal");
                return;
            }

            setIsModalOpen(false);
            setEditingSchedule(null);
            onRefresh();
        } catch (error) {
            alert("Terjadi kesalahan saat menyimpan jadwal");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-gray-900">Jadwal Event</h2>
                <button
                    onClick={() => { setEditingSchedule(null); setIsModalOpen(true); }}
                    className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700"
                >
                    <Plus className="h-4 w-4" />
                    Tambah Jadwal
                </button>
            </div>

            {event.schedules.length === 0 ? (
                <div className="bg-white rounded-xl shadow-sm p-12 text-center">
                    <Calendar className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-500 mb-4">Belum ada jadwal. Tambahkan jadwal untuk event ini.</p>
                </div>
            ) : (
                <div className="space-y-4">
                    {event.schedules.map((schedule) => (
                        <div key={schedule.id} className="bg-white rounded-xl shadow-sm p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
                            <div className="flex items-start gap-4">
                                <div className="w-12 h-12 bg-indigo-100 rounded-lg flex items-center justify-center flex-shrink-0">
                                    <Calendar className="h-6 w-6 text-indigo-600" />
                                </div>
                                <div>
                                    <h3 className="font-semibold text-gray-900">{schedule.title || "Jadwal Event"}</h3>
                                    <div className="flex flex-wrap gap-x-4 gap-y-1 mt-1 text-sm text-gray-600">
                                        <div className="flex items-center gap-1.5">
                                            <Calendar className="h-4 w-4" />
                                            {new Date(schedule.scheduleDate).toLocaleDateString("id-ID", { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                                        </div>
                                        <div className="flex items-center gap-1.5">
                                            <Clock className="h-4 w-4" />
                                            {schedule.startTime} - {schedule.endTime}
                                        </div>
                                    </div>
                                    {schedule.locationOverride && (
                                        <div className="flex items-center gap-1.5 mt-1 text-sm text-gray-600">
                                            <MapPin className="h-4 w-4" />
                                            {schedule.locationOverride}
                                        </div>
                                    )}
                                    {schedule.description && (
                                        <p className="text-sm text-gray-500 mt-2">{schedule.description}</p>
                                    )}
                                </div>
                            </div>
                            <div className="flex items-center gap-2 md:self-start">
                                <button
                                    onClick={() => handleEdit(schedule)}
                                    className="p-2 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                                    title="Edit"
                                >
                                    <Edit2 className="h-5 w-5" />
                                </button>
                                <button
                                    onClick={() => handleDelete(schedule.id)}
                                    disabled={isDeleting === schedule.id}
                                    className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
                                    title="Hapus"
                                >
                                    {isDeleting === schedule.id ? <Loader2 className="h-5 w-5 animate-spin" /> : <Trash2 className="h-5 w-5" />}
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {isModalOpen && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
                        <div className="p-6 border-b flex justify-between items-center sticky top-0 bg-white z-10">
                            <h3 className="text-lg font-bold text-gray-900">{editingSchedule ? "Edit Jadwal" : "Tambah Jadwal"}</h3>
                            <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-600">
                                <XCircle className="h-6 w-6" />
                            </button>
                        </div>
                        <form onSubmit={handleSubmit} className="p-6 space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Judul (Opsional)</label>
                                <input name="title" defaultValue={editingSchedule?.title || ""} placeholder="Contoh: Sesi 1, Main Stage, dll" className="w-full px-3 py-2 border rounded-lg" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Tanggal</label>
                                <input name="scheduleDate" type="date" required defaultValue={editingSchedule?.scheduleDate ? new Date(editingSchedule.scheduleDate).toISOString().split('T')[0] : ""} className="w-full px-3 py-2 border rounded-lg" />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Jam Mulai</label>
                                    <input name="startTime" type="time" required defaultValue={editingSchedule?.startTime || ""} className="w-full px-3 py-2 border rounded-lg" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Jam Selesai</label>
                                    <input name="endTime" type="time" required defaultValue={editingSchedule?.endTime || ""} className="w-full px-3 py-2 border rounded-lg" />
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Lokasi Khusus (Opsional)</label>
                                <input name="locationOverride" defaultValue={editingSchedule?.locationOverride || ""} placeholder="Jika berbeda dengan lokasi utama" className="w-full px-3 py-2 border rounded-lg" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Deskripsi (Opsional)</label>
                                <textarea name="description" defaultValue={editingSchedule?.description || ""} rows={3} className="w-full px-3 py-2 border rounded-lg" />
                            </div>
                            <div className="pt-4 flex gap-3">
                                <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 px-4 py-2 border rounded-lg hover:bg-gray-50">Batal</button>
                                <button type="submit" disabled={isLoading} className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50">
                                    {isLoading ? "Menyimpan..." : "Simpan"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}

function PromoCodesTab({ event }: { event: EventData }) {
    const [promoCodes, setPromoCodes] = useState<PromoCode[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingPromo, setEditingPromo] = useState<PromoCode | null>(null);
    const [isSaving, setIsSaving] = useState(false);
    const [isDeleting, setIsDeleting] = useState<string | null>(null);

    const fetchPromoCodes = async () => {
        try {
            const res = await fetch(`/api/organizer/events/${event.id}/promo-codes`);
            const data = await res.json();
            if (data.success) {
                setPromoCodes(data.data);
            }
        } catch (error) {
            console.error("Failed to fetch promo codes");
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchPromoCodes();
    }, [event.id]);

    const handleDelete = async (promoId: string) => {
        if (!confirm("Apakah Anda yakin ingin menghapus kode promo ini?")) return;
        try {
            setIsDeleting(promoId);
            const res = await fetch(`/api/organizer/events/${event.id}/promo-codes/${promoId}`, {
                method: "DELETE",
            });
            const data = await res.json();
            if (data.success) {
                fetchPromoCodes();
            } else {
                alert(data.error || "Gagal menghapus kode promo");
            }
        } catch {
            alert("Terjadi kesalahan");
        } finally {
            setIsDeleting(null);
        }
    };

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const formData = new FormData(e.currentTarget);
        const payload = {
            code: formData.get("code"),
            discountType: formData.get("discountType"),
            discountValue: Number(formData.get("discountValue")),
            maxDiscountAmount: formData.get("maxDiscountAmount") ? Number(formData.get("maxDiscountAmount")) : null,
            minOrderAmount: formData.get("minOrderAmount") ? Number(formData.get("minOrderAmount")) : null,
            usageLimitTotal: formData.get("usageLimitTotal") ? Number(formData.get("usageLimitTotal")) : null,
            usageLimitPerUser: formData.get("usageLimitPerUser") ? Number(formData.get("usageLimitPerUser")) : null,
            validFrom: new Date(formData.get("validFrom") as string).toISOString(),
            validUntil: new Date(formData.get("validUntil") as string).toISOString(),
            isActive: formData.get("isActive") === "on",
        };

        try {
            setIsSaving(true);
            const url = editingPromo
                ? `/api/organizer/events/${event.id}/promo-codes/${editingPromo.id}`
                : `/api/organizer/events/${event.id}/promo-codes`;
            
            const method = editingPromo ? "PUT" : "POST";

            const res = await fetch(url, {
                method,
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload),
            });
            const data = await res.json();

            if (!data.success) {
                alert(data.error || "Gagal menyimpan kode promo");
                return;
            }

            setIsModalOpen(false);
            setEditingPromo(null);
            fetchPromoCodes();
        } catch {
            alert("Terjadi kesalahan");
        } finally {
            setIsSaving(false);
        }
    };

    if (isLoading) return <div className="text-center py-12"><Loader2 className="h-8 w-8 animate-spin mx-auto text-indigo-600" /></div>;

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-gray-900">Kode Promo</h2>
                <button
                    onClick={() => { setEditingPromo(null); setIsModalOpen(true); }}
                    className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700"
                >
                    <Plus className="h-4 w-4" />
                    Tambah Promo
                </button>
            </div>

            {promoCodes.length === 0 ? (
                <div className="bg-white rounded-xl shadow-sm p-12 text-center">
                    <Tag className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-500 mb-4">Belum ada kode promo. Buat kode promo untuk event ini.</p>
                </div>
            ) : (
                <div className="grid gap-4">
                    {promoCodes.map((promo) => (
                        <div key={promo.id} className="bg-white rounded-xl shadow-sm p-6">
                            <div className="flex justify-between items-start">
                                <div>
                                    <div className="flex items-center gap-2">
                                        <span className="px-2.5 py-1 bg-indigo-100 text-indigo-700 font-mono font-bold rounded text-lg">
                                            {promo.code}
                                        </span>
                                        {!promo.isActive && (
                                            <span className="px-2 py-0.5 bg-red-100 text-red-700 text-xs rounded-full">Non-aktif</span>
                                        )}
                                    </div>
                                    <p className="text-gray-900 font-medium mt-2">
                                        Diskon {promo.discountType === "PERCENTAGE" ? `${promo.discountValue}%` : formatCurrency(promo.discountValue)}
                                    </p>
                                    <div className="text-sm text-gray-500 mt-1 space-y-1">
                                        <p>Berlaku: {new Date(promo.validFrom).toLocaleDateString("id-ID")} - {new Date(promo.validUntil).toLocaleDateString("id-ID")}</p>
                                        <p>Digunakan: {promo._count?.usages || 0} kali {promo.usageLimitTotal ? `/ ${promo.usageLimitTotal}` : ""}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2">
                                    <button
                                        onClick={() => { setEditingPromo(promo); setIsModalOpen(true); }}
                                        className="p-2 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                                    >
                                        <Edit2 className="h-5 w-5" />
                                    </button>
                                    <button
                                        onClick={() => handleDelete(promo.id)}
                                        disabled={isDeleting === promo.id}
                                        className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
                                    >
                                        {isDeleting === promo.id ? <Loader2 className="h-5 w-5 animate-spin" /> : <Trash2 className="h-5 w-5" />}
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {isModalOpen && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
                        <div className="p-6 border-b flex justify-between items-center sticky top-0 bg-white z-10">
                            <h3 className="text-lg font-bold text-gray-900">{editingPromo ? "Edit Promo" : "Tambah Promo"}</h3>
                            <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-600">
                                <XCircle className="h-6 w-6" />
                            </button>
                        </div>
                        <form onSubmit={handleSubmit} className="p-6 space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Kode Promo</label>
                                <input name="code" defaultValue={editingPromo?.code || ""} required pattern="[A-Za-z0-9]+" className="w-full px-3 py-2 border rounded-lg uppercase" placeholder="Contoh: MERDEKA45" />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Tipe Diskon</label>
                                    <select name="discountType" defaultValue={editingPromo?.discountType || "PERCENTAGE"} className="w-full px-3 py-2 border rounded-lg">
                                        <option value="PERCENTAGE">Persentase (%)</option>
                                        <option value="FIXED_AMOUNT">Nominal (Rp)</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Nilai Diskon</label>
                                    <input name="discountValue" type="number" defaultValue={editingPromo?.discountValue || ""} required min="1" className="w-full px-3 py-2 border rounded-lg" />
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Min. Belanja</label>
                                    <input name="minOrderAmount" type="number" defaultValue={editingPromo?.minOrderAmount || ""} className="w-full px-3 py-2 border rounded-lg" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Maks. Diskon</label>
                                    <input name="maxDiscountAmount" type="number" defaultValue={editingPromo?.maxDiscountAmount || ""} className="w-full px-3 py-2 border rounded-lg" placeholder="Opsional" />
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Kuota Total</label>
                                    <input name="usageLimitTotal" type="number" defaultValue={editingPromo?.usageLimitTotal || ""} className="w-full px-3 py-2 border rounded-lg" placeholder="Tak Terbatas" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Limit per User</label>
                                    <input name="usageLimitPerUser" type="number" defaultValue={editingPromo?.usageLimitPerUser || 1} className="w-full px-3 py-2 border rounded-lg" />
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Berlaku Dari</label>
                                    <input name="validFrom" type="datetime-local" required defaultValue={editingPromo?.validFrom ? new Date(editingPromo.validFrom).toISOString().slice(0, 16) : ""} className="w-full px-3 py-2 border rounded-lg" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Berlaku Sampai</label>
                                    <input name="validUntil" type="datetime-local" required defaultValue={editingPromo?.validUntil ? new Date(editingPromo.validUntil).toISOString().slice(0, 16) : ""} className="w-full px-3 py-2 border rounded-lg" />
                                </div>
                            </div>
                            <label className="flex items-center gap-2">
                                <input name="isActive" type="checkbox" defaultChecked={editingPromo?.isActive ?? true} className="rounded border-gray-300" />
                                <span className="text-sm text-gray-700">Aktif</span>
                            </label>
                            <div className="pt-4 flex gap-3">
                                <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 px-4 py-2 border rounded-lg hover:bg-gray-50">Batal</button>
                                <button type="submit" disabled={isSaving} className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50">
                                    {isSaving ? "Menyimpan..." : "Simpan"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
