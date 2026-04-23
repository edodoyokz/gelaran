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
    Plus,
    Trash2,
    RefreshCw,
    UserCheck,
    QrCode,
    Copy,
    AlertCircle,
    Loader2,
    Tag,
    LayoutGrid,
    Camera,
    ShoppingCart,
    Settings,
    Gift,
    Sparkles,
} from "lucide-react";
import {
    OrganizerHeroCard,
    OrganizerInlineAction,
    OrganizerListItem,
    OrganizerMetricCard,
    OrganizerPanel,
    OrganizerStatusBadge,
    OrganizerSurface,
    OrganizerWorkspaceHeader,
} from "@/components/organizer/organizer-workspace-primitives";
import { formatCurrency, formatDate } from "@/lib/utils";

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

type TabType = "overview" | "schedules" | "tickets" | "promo-codes" | "complimentary" | "attendees" | "settings";

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
        } catch {
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
        } catch {
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
            <div className="min-h-screen bg-(--bg-secondary) flex items-center justify-center">
                <div className="text-center">
                    <Loader2 className="h-12 w-12 text-(--accent-primary) animate-spin mx-auto mb-4" />
                    <p className="text-(--text-muted)">Memuat data event...</p>
                </div>
            </div>
        );
    }

    if (error || !event) {
        return (
            <div className="min-h-screen bg-(--bg-secondary) flex items-center justify-center">
                <div className="text-center">
                    <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
                    <p className="text-foreground font-medium mb-2">{error || "Event tidak ditemukan"}</p>
                    <Link href="/organizer/events" className="text-(--accent-primary) hover:text-indigo-500">
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
        { id: "complimentary", label: "Complimentary", icon: Gift },
        { id: "attendees", label: "Peserta", icon: Users },
        { id: "settings", label: "Pengaturan", icon: Edit2 },
    ];

    const firstSchedule = event.schedules[0];
    const eventDate = firstSchedule ? new Date(firstSchedule.scheduleDate) : null;
    const fillRate = event.stats.totalTickets > 0 ? Math.round((event.stats.soldTickets / event.stats.totalTickets) * 100) : 0;
    const checkInRate = event.stats.soldTickets > 0 ? Math.round((event.stats.checkedInCount / event.stats.soldTickets) * 100) : 0;

    return (
        <div className="space-y-6 pb-12">
            <OrganizerWorkspaceHeader
                eyebrow="Organizer event workflow"
                title={event.title}
                description="Halaman detail event kini memakai hierarki workspace yang lebih kuat untuk performa, aksi utama, dan pengelolaan modul event."
                actions={
                    <div className="flex flex-wrap gap-3">
                        <Link
                            href="/organizer/events"
                            className="inline-flex items-center gap-2 rounded-full border border-(--border) bg-(--surface) px-5 py-3 text-sm font-semibold text-foreground transition-colors hover:bg-(--surface-elevated)"
                        >
                            <ArrowLeft className="h-4 w-4" />
                            Kembali ke katalog
                        </Link>
                        {event.status === "DRAFT" ? (
                            <button
                                type="button"
                                onClick={handlePublish}
                                disabled={isPublishing}
                                className="inline-flex items-center gap-2 rounded-full bg-(--accent-primary) px-5 py-3 text-sm font-semibold text-white shadow-(--shadow-sm) transition-opacity hover:opacity-90 disabled:opacity-50"
                            >
                                {isPublishing ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                                Kirim untuk review
                            </button>
                        ) : null}
                        {event.status === "PUBLISHED" ? (
                            <Link
                                href={`/events/${event.slug}`}
                                target="_blank"
                                className="inline-flex items-center gap-2 rounded-full bg-green-600 px-5 py-3 text-sm font-semibold text-white shadow-(--shadow-sm) transition-colors hover:bg-green-700"
                            >
                                <ExternalLink className="h-4 w-4" />
                                Lihat halaman publik
                            </Link>
                        ) : null}
                        <Link
                            href={`/organizer/events/${eventId}/edit`}
                            className="inline-flex items-center gap-2 rounded-full border border-(--border) bg-(--surface) px-5 py-3 text-sm font-semibold text-foreground transition-colors hover:bg-(--surface-elevated)"
                        >
                            <Edit2 className="h-4 w-4" />
                            Edit event
                        </Link>
                    </div>
                }
                badge={<OrganizerStatusBadge tone={event.status === "PUBLISHED" ? "success" : event.status === "PENDING_REVIEW" ? "warning" : event.status === "CANCELLED" ? "danger" : event.status === "COMPLETED" ? "info" : "default"}>{STATUS_LABELS[event.status]}</OrganizerStatusBadge>}
                meta={
                    <div className="flex flex-wrap items-center gap-2">
                        <span className="rounded-full border border-(--border) bg-(--surface) px-3 py-1 font-medium text-foreground">
                            {event.category?.name || "Tanpa kategori"}
                        </span>
                        <span>{eventDate ? eventDate.toLocaleDateString("id-ID", { dateStyle: "long" }) : "Belum ada jadwal"}</span>
                        <span>•</span>
                        <span>{event.visibility}</span>
                    </div>
                }
            />

            <OrganizerHeroCard
                icon={Sparkles}
                title="Ringkasan performa dan readiness event dalam satu workspace."
                description="Gunakan overview ini untuk memantau penjualan, kesiapan operasional, dan modul lanjutan tanpa mengubah struktur route atau interaksi event organizer yang sudah ada."
                actions={
                    <>
                        <button
                            type="button"
                            onClick={copyEventUrl}
                            className="inline-flex items-center gap-2 rounded-full border border-white/40 bg-white/20 px-5 py-3 text-sm font-semibold text-foreground backdrop-blur transition-colors hover:bg-white/30"
                        >
                            <Copy className="h-4 w-4" />
                            Salin URL publik
                        </button>
                        <button
                            type="button"
                            onClick={() => setShowDeleteModal(true)}
                            className="inline-flex items-center gap-2 rounded-full border border-[rgba(220,38,38,0.24)] bg-white/20 px-5 py-3 text-sm font-semibold text-[rgb(185,28,28)] backdrop-blur transition-colors hover:bg-[rgba(220,38,38,0.08)]"
                        >
                            <Trash2 className="h-4 w-4" />
                            Hapus event
                        </button>
                    </>
                }
                aside={
                    <div className="space-y-4">
                        <div>
                            <p className="text-sm font-medium text-(--text-secondary)">Fill rate tiket</p>
                            <p className="mt-1 text-3xl font-semibold tracking-(--tracking-heading) text-foreground">{fillRate}%</p>
                        </div>
                        <div className="grid gap-3">
                            <OrganizerSurface>
                                <p className="text-xs uppercase tracking-[0.2em] text-(--text-muted)">Check-in rate</p>
                                <p className="mt-2 text-lg font-semibold text-foreground">{checkInRate}%</p>
                            </OrganizerSurface>
                            <OrganizerSurface>
                                <p className="text-xs uppercase tracking-[0.2em] text-(--text-muted)">Organizer revenue</p>
                                <p className="mt-2 text-lg font-semibold text-foreground">{formatCurrency(event.stats.organizerRevenue)}</p>
                            </OrganizerSurface>
                        </div>
                    </div>
                }
            />

            <OrganizerPanel title="Workflow modules" description="Pilih area kerja event sesuai kebutuhan operasional, dari ringkasan performa sampai promo dan pengaturan.">
                <div className="flex flex-wrap gap-2">
                    {tabs.map((tab) => (
                        <button
                            key={tab.id}
                            type="button"
                            onClick={() => setActiveTab(tab.id)}
                            className={`inline-flex items-center gap-2 rounded-full border px-4 py-2.5 text-sm font-semibold transition-colors ${activeTab === tab.id
                                ? "border-[rgba(41,179,182,0.24)] bg-(--surface-brand-soft) text-(--accent-primary)"
                                : "border-(--border) bg-(--surface) text-(--text-secondary) hover:bg-(--surface-elevated)"}`}
                        >
                            <tab.icon className="h-4 w-4" />
                            {tab.label}
                        </button>
                    ))}
                </div>
            </OrganizerPanel>

            <main>
                {activeTab === "overview" && <OverviewTab event={event} onRefresh={refetchEvent} />}
                {activeTab === "schedules" && <SchedulesTab event={event} onRefresh={refetchEvent} />}
                {activeTab === "tickets" && <TicketsTab event={event} onRefresh={refetchEvent} />}
                {activeTab === "promo-codes" && <PromoCodesTab event={event} />}
                {activeTab === "complimentary" && <ComplimentaryTab event={event} />}
                {activeTab === "attendees" && <AttendeesTab event={event} />}
                {activeTab === "settings" && <SettingsTab event={event} />}
            </main>

            {showDeleteModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
                    <div className="w-full max-w-md rounded-[1.75rem] border border-(--border) bg-(--surface) p-6 shadow-(--shadow-xl)">
                        <h3 className="text-lg font-bold text-foreground">Hapus event?</h3>
                        <p className="mt-2 text-sm leading-6 text-(--text-secondary)">
                            Event &quot;{event.title}&quot; akan dihapus secara permanen. Aksi ini tidak dapat dibatalkan.
                        </p>
                        <div className="mt-6 flex gap-3">
                            <button
                                type="button"
                                onClick={() => setShowDeleteModal(false)}
                                className="flex-1 rounded-full border border-(--border) px-4 py-3 text-sm font-semibold text-foreground transition-colors hover:bg-(--surface-elevated)"
                            >
                                Batal
                            </button>
                            <button
                                type="button"
                                onClick={handleDelete}
                                disabled={isDeleting}
                                className="flex-1 rounded-full bg-red-600 px-4 py-3 text-sm font-semibold text-white transition-colors hover:bg-red-700 disabled:opacity-50"
                            >
                                {isDeleting ? "Menghapus..." : "Ya, hapus"}
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
            label: "Tiket terjual",
            value: event.stats.soldTickets,
            icon: Ticket,
            meta: `${event.stats.totalTickets} total inventori`,
            trend: `${event.stats.availableTickets} tiket masih tersedia`,
            tone: "accent" as const,
        },
        {
            label: "Pendapatan organizer",
            value: formatCurrency(event.stats.organizerRevenue),
            icon: TrendingUp,
            meta: `${formatCurrency(event.stats.totalRevenue)} gross revenue`,
            trend: `${event.stats.totalBookings} booking berhasil`,
            tone: "success" as const,
        },
        {
            label: "Peserta check-in",
            value: event.stats.checkedInCount,
            icon: UserCheck,
            meta: `${event.stats.soldTickets} tiket valid`,
            trend: `${event.stats.soldTickets - event.stats.checkedInCount} belum check-in`,
            tone: "warning" as const,
        },
        {
            label: "Review & awareness",
            value: event.stats.totalReviews,
            icon: Eye,
            meta: `${event.stats.reservedTickets} tiket masih reserved`,
            trend: "Pantau sentimen dan momentum event",
            tone: "default" as const,
        },
    ];

    return (
        <div className="space-y-6">
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                {stats.map((stat) => (
                    <OrganizerMetricCard
                        key={stat.label}
                        label={stat.label}
                        value={stat.value}
                        lucideIcon={stat.icon}
                        meta={stat.meta}
                        trend={stat.trend}
                        tone={stat.tone}
                    />
                ))}
            </div>

            <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_320px] xl:items-start">
                <div className="space-y-6">
                    <OrganizerPanel
                        title="Event snapshot"
                        description="Panel ini merangkum positioning event, jadwal utama, dan konteks lokasi untuk membantu scanning cepat dari workspace organizer."
                        action={
                            <button type="button" onClick={onRefresh} className="inline-flex items-center gap-2 text-sm font-semibold text-(--accent-primary)">
                                <RefreshCw className="h-4 w-4" />
                                Refresh
                            </button>
                        }
                    >
                        <div className="grid gap-6 lg:grid-cols-[220px_minmax(0,1fr)]">
                            {event.posterImage ? (
                                <img src={event.posterImage} alt={event.title} className="h-full min-h-72 w-full rounded-3xl object-cover" />
                            ) : (
                                <OrganizerSurface className="flex min-h-72 items-center justify-center text-center text-sm text-(--text-muted)">
                                    Poster belum tersedia
                                </OrganizerSurface>
                            )}
                            <div className="space-y-5">
                                <OrganizerSurface>
                                    <p className="text-xs uppercase tracking-[0.2em] text-(--text-muted)">Deskripsi</p>
                                    <p className="mt-2 text-sm leading-7 text-(--text-secondary)">{event.shortDescription || event.description}</p>
                                </OrganizerSurface>
                                <div className="grid gap-4 md:grid-cols-2">
                                    <OrganizerSurface>
                                        <p className="text-xs uppercase tracking-[0.2em] text-(--text-muted)">Jadwal</p>
                                        <div className="mt-3 space-y-2 text-sm leading-6 text-(--text-secondary)">
                                            {event.schedules.length > 0 ? event.schedules.slice(0, 3).map((schedule) => (
                                                <p key={schedule.id}>
                                                    {new Date(schedule.scheduleDate).toLocaleDateString("id-ID")} · {schedule.startTime} - {schedule.endTime}
                                                </p>
                                            )) : <p>Belum ada jadwal</p>}
                                            {event.schedules.length > 3 ? <p>+{event.schedules.length - 3} jadwal lainnya</p> : null}
                                        </div>
                                    </OrganizerSurface>
                                    <OrganizerSurface>
                                        <p className="text-xs uppercase tracking-[0.2em] text-(--text-muted)">Lokasi & akses</p>
                                        <div className="mt-3 space-y-2 text-sm leading-6 text-(--text-secondary)">
                                            {event.venue ? (
                                                <>
                                                    <p className="font-semibold text-foreground">{event.venue.name}</p>
                                                    <p>{event.venue.city}, {event.venue.province}</p>
                                                </>
                                            ) : event.eventType === "ONLINE" ? (
                                                <p>Event online</p>
                                            ) : (
                                                <p>Belum ada lokasi utama</p>
                                            )}
                                            {event.onlineMeetingUrl ? <p className="break-all">{event.onlineMeetingUrl}</p> : null}
                                        </div>
                                    </OrganizerSurface>
                                </div>
                            </div>
                        </div>
                    </OrganizerPanel>

                    <OrganizerPanel
                        title="Modul operasional utama"
                        description="Akses cepat ke gate, peserta, promo, dan seating kini tampil sebagai daftar tindakan yang lebih konsisten."
                    >
                        <div className="grid gap-3 md:grid-cols-2">
                            <OrganizerListItem
                                href={`/gate?eventId=${event.id}`}
                                title="Gate scanner"
                                description="Check-in peserta dan validasi akses di lokasi event."
                                icon={Camera}
                                end={<OrganizerStatusBadge tone="info">Live ops</OrganizerStatusBadge>}
                            />
                            <OrganizerListItem
                                href={`/pos?eventId=${event.id}`}
                                title="POS kasir"
                                description="Kelola penjualan tiket on-site saat event berjalan."
                                icon={ShoppingCart}
                                end={<OrganizerStatusBadge tone="success">Sales</OrganizerStatusBadge>}
                            />
                            <OrganizerListItem
                                href={`/organizer/events/${event.id}/attendees`}
                                title="Daftar peserta"
                                description={`${event.stats.soldTickets} peserta terdaftar untuk event ini.`}
                                icon={Users}
                            />
                            <OrganizerListItem
                                href={`/organizer/events/${event.id}/promo`}
                                title="Kode promo"
                                description="Kelola diskon dan eksperimen penawaran untuk mendorong penjualan."
                                icon={Tag}
                            />
                            <OrganizerListItem
                                href={`/organizer/events/${event.id}/seating`}
                                title="Denah kursi"
                                description="Atur seating chart untuk venue dengan layout tempat duduk."
                                icon={LayoutGrid}
                            />
                            <OrganizerListItem
                                href={`/organizer/events/${event.id}/gate`}
                                title="Pengaturan gate & POS"
                                description="Kelola PIN, akses staff, dan preferensi operasional lapangan."
                                icon={Settings}
                            />
                        </div>
                    </OrganizerPanel>
                </div>

                <div className="space-y-6">
                    <OrganizerPanel title="Status publishing" description="Sidebar ini membantu memantau readiness status event dan tindakan berikutnya.">
                        <div className="space-y-4">
                            <OrganizerSurface>
                                <p className="text-xs uppercase tracking-[0.2em] text-(--text-muted)">Status</p>
                                <div className="mt-3 flex flex-wrap gap-2">
                                    <OrganizerStatusBadge tone={event.status === "PUBLISHED" ? "success" : event.status === "PENDING_REVIEW" ? "warning" : event.status === "CANCELLED" ? "danger" : event.status === "COMPLETED" ? "info" : "default"}>
                                        {STATUS_LABELS[event.status]}
                                    </OrganizerStatusBadge>
                                    <OrganizerStatusBadge tone="default">{event.visibility}</OrganizerStatusBadge>
                                </div>
                            </OrganizerSurface>
                            <OrganizerSurface>
                                <p className="text-xs uppercase tracking-[0.2em] text-(--text-muted)">Tanggal penting</p>
                                <div className="mt-3 space-y-2 text-sm leading-6 text-(--text-secondary)">
                                    <p>Dibuat: {formatDate(event.createdAt)}</p>
                                    <p>Publish: {event.publishedAt ? formatDate(event.publishedAt) : "Belum dipublikasikan"}</p>
                                </div>
                            </OrganizerSurface>
                            <OrganizerSurface>
                                <p className="text-xs uppercase tracking-[0.2em] text-(--text-muted)">CTA utama</p>
                                <div className="mt-3 space-y-3">
                                    <Link href={`/organizer/events/${event.id}/edit`} className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-(--accent-primary) px-4 py-3 text-sm font-semibold text-white">
                                        <Edit2 className="h-4 w-4" />
                                        Perbarui event
                                    </Link>
                                    {event.status === "PUBLISHED" ? (
                                        <OrganizerInlineAction href={`/events/${event.slug}`}>Buka halaman publik</OrganizerInlineAction>
                                    ) : null}
                                </div>
                            </OrganizerSurface>
                        </div>
                    </OrganizerPanel>
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
        } catch {
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
        } catch {
            alert("Terjadi kesalahan saat menyimpan tiket");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-foreground">Tipe Tiket</h2>
                <Link
                    href={`/organizer/events/${event.id}/tickets/new`}
                    className="inline-flex items-center gap-2 px-4 py-2 bg-(--accent-primary) text-white rounded-lg font-medium hover:opacity-90"
                >
                    <Plus className="h-4 w-4" />
                    Tambah Tiket
                </Link>
            </div>

            {event.ticketTypes.length === 0 ? (
                <div className="bg-(--surface) rounded-xl shadow-sm p-12 text-center">
                    <Ticket className="h-12 w-12 text-(--text-muted) mx-auto mb-4" />
                    <p className="text-(--text-muted) mb-4">Belum ada tipe tiket. Tambahkan tiket untuk event ini.</p>
                    <Link
                        href={`/organizer/events/${event.id}/tickets/new`}
                        className="inline-flex items-center gap-2 text-(--accent-primary) font-medium"
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
                            <div key={ticket.id} className="bg-(--surface) rounded-xl shadow-sm p-6">
                                <div className="flex items-start justify-between mb-4">
                                    <div>
                                        <div className="flex items-center gap-2">
                                            <h3 className="font-semibold text-foreground">{ticket.name}</h3>
                                            {ticket.isHidden && (
                                                <span className="px-2 py-0.5 bg-(--bg-secondary) text-(--text-secondary) text-xs rounded-full">Hidden</span>
                                            )}
                                            {ticket.isFree && (
                                                <span className="px-2 py-0.5 bg-green-500/10 text-green-700 text-xs rounded-full">Gratis</span>
                                            )}
                                            {!ticket.isActive && (
                                                <span className="px-2 py-0.5 bg-red-500/10 text-red-700 text-xs rounded-full">Non-aktif</span>
                                            )}
                                        </div>
                                        {ticket.description && (
                                            <p className="text-sm text-(--text-muted) mt-1">{ticket.description}</p>
                                        )}
                                    </div>
                                    <div className="text-right">
                                        <p className="text-xl font-bold text-foreground">
                                            {ticket.isFree ? "GRATIS" : formatCurrency(Number(ticket.basePrice))}
                                        </p>
                                    </div>
                                </div>

                                <div className="flex items-center gap-6 text-sm">
                                    <div>
                                        <span className="text-(--text-muted)">Terjual:</span>
                                        <span className="font-medium text-foreground ml-1">
                                            {ticket._count.bookedTickets} / {ticket.totalQuantity}
                                        </span>
                                    </div>
                                    <div>
                                        <span className="text-(--text-muted)">Tersisa:</span>
                                        <span className={`font-medium ml-1 ${remaining < 10 ? "text-red-600" : "text-foreground"}`}>
                                            {remaining}
                                        </span>
                                    </div>
                                </div>

                                <div className="mt-3">
                                    <div className="h-2 bg-(--bg-secondary) rounded-full overflow-hidden">
                                        <div
                                            className={`h-full rounded-full transition-all ${soldPercent >= 90 ? "bg-red-500" : soldPercent >= 50 ? "bg-yellow-500" : "bg-(--accent-primary)"
                                                }`}
                                            style={{ width: `${soldPercent}%` }}
                                        />
                                    </div>
                                </div>

                                {(ticket.saleStartAt || ticket.saleEndAt) && (
                                    <div className="mt-4 flex items-center gap-2 text-xs text-(--text-muted)">
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
                                        className="inline-flex items-center gap-1.5 px-3 py-1.5 border border-(--border) text-(--text-secondary) text-sm rounded-lg hover:bg-(--surface-hover)"
                                    >
                                        <Edit2 className="h-3.5 w-3.5" />
                                        Edit
                                    </button>
                                    <button
                                        onClick={() => handleDelete(ticket.id)}
                                        disabled={isDeleting === ticket.id || ticket._count.bookedTickets > 0}
                                        className="inline-flex items-center gap-1.5 px-3 py-1.5 border border-red-200 text-red-600 text-sm rounded-lg hover:bg-red-500/10 disabled:opacity-50 disabled:cursor-not-allowed"
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
                    <div className="bg-(--surface) rounded-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
                        <div className="p-6 border-b flex justify-between items-center sticky top-0 bg-(--surface) z-10">
                            <h3 className="text-lg font-bold text-foreground">Edit Tiket</h3>
                            <button onClick={() => setEditingTicket(null)} className="text-(--text-muted) hover:text-(--text-secondary)">
                                <XCircle className="h-6 w-6" />
                            </button>
                        </div>
                        <form onSubmit={handleSave} className="p-6 space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-(--text-secondary) mb-1">Nama Tiket</label>
                                <input name="name" defaultValue={editingTicket.name} required className="w-full px-3 py-2 border rounded-lg" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-(--text-secondary) mb-1">Deskripsi</label>
                                <textarea name="description" defaultValue={editingTicket.description || ""} className="w-full px-3 py-2 border rounded-lg" rows={3} />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-(--text-secondary) mb-1">Harga (Rp)</label>
                                    <input name="basePrice" type="number" defaultValue={editingTicket.basePrice} min="0" required className="w-full px-3 py-2 border rounded-lg" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-(--text-secondary) mb-1">Total Kuota</label>
                                    <input name="totalQuantity" type="number" defaultValue={editingTicket.totalQuantity} min="1" required className="w-full px-3 py-2 border rounded-lg" />
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-(--text-secondary) mb-1">Min. per Order</label>
                                    <input name="minPerOrder" type="number" defaultValue={editingTicket.minPerOrder || 1} min="1" required className="w-full px-3 py-2 border rounded-lg" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-(--text-secondary) mb-1">Max. per Order</label>
                                    <input name="maxPerOrder" type="number" defaultValue={editingTicket.maxPerOrder || 5} min="1" required className="w-full px-3 py-2 border rounded-lg" />
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-(--text-secondary) mb-1">Mulai Penjualan</label>
                                    <input name="saleStartAt" type="datetime-local" defaultValue={editingTicket.saleStartAt ? new Date(editingTicket.saleStartAt).toISOString().slice(0, 16) : ""} className="w-full px-3 py-2 border rounded-lg" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-(--text-secondary) mb-1">Akhir Penjualan</label>
                                    <input name="saleEndAt" type="datetime-local" defaultValue={editingTicket.saleEndAt ? new Date(editingTicket.saleEndAt).toISOString().slice(0, 16) : ""} className="w-full px-3 py-2 border rounded-lg" />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <label className="flex items-center gap-2">
                                    <input name="isFree" type="checkbox" defaultChecked={editingTicket.isFree} className="rounded border-(--border)" />
                                    <span className="text-sm text-(--text-secondary)">Tiket Gratis</span>
                                </label>
                                <label className="flex items-center gap-2">
                                    <input name="isHidden" type="checkbox" defaultChecked={editingTicket.isHidden} className="rounded border-(--border)" />
                                    <span className="text-sm text-(--text-secondary)">Sembunyikan Tiket</span>
                                </label>
                                <label className="flex items-center gap-2">
                                    <input name="isActive" type="checkbox" defaultChecked={editingTicket.isActive} className="rounded border-(--border)" />
                                    <span className="text-sm text-(--text-secondary)">Aktif</span>
                                </label>
                            </div>
                            <div className="pt-4 flex gap-3">
                                <button type="button" onClick={() => setEditingTicket(null)} className="flex-1 px-4 py-2 border rounded-lg hover:bg-(--surface-hover)">Batal</button>
                                <button type="submit" disabled={isLoading} className="flex-1 px-4 py-2 bg-(--accent-primary) text-white rounded-lg hover:opacity-90 disabled:opacity-50">
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
    const [attendees, setAttendees] = useState<Array<{
        id: string;
        ticketCode: string;
        ticketType: string;
        attendeeName: string;
        attendeeEmail: string;
        attendeePhone: string | null;
        bookingCode: string;
        isCheckedIn: boolean;
        checkedInAt: string | null;
        status: string;
    }>>([]);
    const [isLoading, setIsLoading] = useState(true);
    const eventId = event.id;

    useEffect(() => {
        const loadAttendees = async () => {
            try {
                setIsLoading(true);
                const res = await fetch(`/api/organizer/events/${eventId}/attendees`);
                const data = await res.json();

                if (data.success && data.data?.attendees) {
                    setAttendees(data.data.attendees);
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
            <div className="bg-(--surface) rounded-xl shadow-sm p-12 text-center">
                <Loader2 className="h-8 w-8 text-(--accent-primary) animate-spin mx-auto mb-4" />
                <p className="text-(--text-muted)">Memuat data peserta...</p>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-foreground">Daftar Peserta</h2>
                <div className="flex gap-3">
                    <Link
                        href={`/organizer/events/${event.id}/gate`}
                        className="inline-flex items-center gap-2 px-4 py-2 bg-(--accent-primary) text-white rounded-lg font-medium hover:opacity-90"
                    >
                        <QrCode className="h-4 w-4" />
                        Scan Tiket
                    </Link>
                </div>
            </div>

            <div className="grid sm:grid-cols-3 gap-4">
                <div className="bg-(--surface) rounded-xl p-5 shadow-sm">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-indigo-100 rounded-lg flex items-center justify-center">
                            <Users className="h-5 w-5 text-(--accent-primary)" />
                        </div>
                        <div>
                            <p className="text-2xl font-bold text-foreground">{event.stats.soldTickets}</p>
                            <p className="text-sm text-(--text-muted)">Total Terdaftar</p>
                        </div>
                    </div>
                </div>
                <div className="bg-(--surface) rounded-xl p-5 shadow-sm">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-green-500/10 rounded-lg flex items-center justify-center">
                            <CheckCircle className="h-5 w-5 text-green-600" />
                        </div>
                        <div>
                            <p className="text-2xl font-bold text-foreground">{event.stats.checkedInCount}</p>
                            <p className="text-sm text-(--text-muted)">Sudah Check-in</p>
                        </div>
                    </div>
                </div>
                <div className="bg-(--surface) rounded-xl p-5 shadow-sm">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-yellow-500/10 rounded-lg flex items-center justify-center">
                            <Clock className="h-5 w-5 text-yellow-600" />
                        </div>
                        <div>
                            <p className="text-2xl font-bold text-foreground">{event.stats.soldTickets - event.stats.checkedInCount}</p>
                            <p className="text-sm text-(--text-muted)">Belum Check-in</p>
                        </div>
                    </div>
                </div>
            </div>

            <div className="bg-(--surface) rounded-xl shadow-sm overflow-hidden">
                {attendees.length === 0 ? (
                    <div className="p-12 text-center text-(--text-muted)">
                        <Users className="h-12 w-12 text-(--text-muted) mx-auto mb-4" />
                        <p>Belum ada peserta terdaftar.</p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-(--surface-hover) border-b">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-semibold text-(--text-muted) uppercase">Kode Tiket</th>
                                    <th className="px-6 py-3 text-left text-xs font-semibold text-(--text-muted) uppercase">Nama</th>
                                    <th className="px-6 py-3 text-left text-xs font-semibold text-(--text-muted) uppercase">Email</th>
                                    <th className="px-6 py-3 text-left text-xs font-semibold text-(--text-muted) uppercase">Tipe Tiket</th>
                                    <th className="px-6 py-3 text-left text-xs font-semibold text-(--text-muted) uppercase">Status</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-(--border)">
                                {attendees.map((attendee) => (
                                    <tr key={attendee.id} className="hover:bg-(--surface-hover)">
                                        <td className="px-6 py-4 font-mono text-sm">{attendee.ticketCode}</td>
                                        <td className="px-6 py-4">
                                            <div>
                                                <p className="font-medium text-foreground">{attendee.attendeeName}</p>
                                                {attendee.attendeePhone && (
                                                    <p className="text-sm text-(--text-muted)">{attendee.attendeePhone}</p>
                                                )}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-sm text-(--text-secondary)">{attendee.attendeeEmail}</td>
                                        <td className="px-6 py-4">
                                            <span className="px-2 py-1 bg-(--accent-primary)/10 text-(--accent-primary) text-xs font-medium rounded">
                                                {attendee.ticketType}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            {attendee.isCheckedIn ? (
                                                <span className="inline-flex items-center gap-1 px-2 py-1 bg-green-500/10 text-green-700 text-xs font-medium rounded-full">
                                                    <CheckCircle className="h-3 w-3" />
                                                    Check-in
                                                </span>
                                            ) : (
                                                <span className="inline-flex items-center gap-1 px-2 py-1 bg-yellow-500/10 text-yellow-700 text-xs font-medium rounded-full">
                                                    <Clock className="h-3 w-3" />
                                                    Pending
                                                </span>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
}

function SettingsTab({ event }: { event: EventData }) {
    return (
        <div className="space-y-6">
            <div className="bg-(--surface) rounded-xl shadow-sm overflow-hidden">
                <div className="px-6 py-4 border-b">
                    <h2 className="text-lg font-semibold">Informasi Event</h2>
                </div>
                <div className="p-6 space-y-4">
                    <div className="grid sm:grid-cols-2 gap-4">
                        <div>
                            <span className="text-xs font-medium text-(--text-muted) uppercase tracking-wider">Tipe Event</span>
                            <p className="text-foreground mt-1">{event.eventType}</p>
                        </div>
                        <div>
                            <span className="text-xs font-medium text-(--text-muted) uppercase tracking-wider">Visibilitas</span>
                            <p className="text-foreground mt-1">{event.visibility}</p>
                        </div>
                        <div>
                            <span className="text-xs font-medium text-(--text-muted) uppercase tracking-wider">Kategori</span>
                            <p className="text-foreground mt-1">{event.category?.name || "-"}</p>
                        </div>
                        <div>
                            <span className="text-xs font-medium text-(--text-muted) uppercase tracking-wider">Status</span>
                            <p className="text-foreground mt-1">{STATUS_LABELS[event.status]}</p>
                        </div>
                    </div>
                </div>
            </div>

            <div className="bg-(--surface) rounded-xl shadow-sm overflow-hidden">
                <div className="px-6 py-4 border-b">
                    <h2 className="text-lg font-semibold">Tindakan</h2>
                </div>
                <div className="p-6 space-y-4">
                    <Link
                        href={`/organizer/events/${event.id}/edit`}
                        className="flex items-center justify-between w-full px-4 py-3 border border-(--border) rounded-lg hover:bg-(--surface-hover)"
                    >
                        <div className="flex items-center gap-3">
                            <Edit2 className="h-5 w-5 text-(--text-muted)" />
                            <div>
                                <p className="font-medium text-foreground">Edit Event</p>
                                <p className="text-sm text-(--text-muted)">Ubah informasi event</p>
                            </div>
                        </div>
                        <ArrowLeft className="h-5 w-5 text-(--text-muted) rotate-180" />
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
        } catch {
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
        } catch {
            alert("Terjadi kesalahan saat menyimpan jadwal");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-foreground">Jadwal Event</h2>
                <button
                    onClick={() => { setEditingSchedule(null); setIsModalOpen(true); }}
                    className="inline-flex items-center gap-2 px-4 py-2 bg-(--accent-primary) text-white rounded-lg font-medium hover:opacity-90"
                >
                    <Plus className="h-4 w-4" />
                    Tambah Jadwal
                </button>
            </div>

            {event.schedules.length === 0 ? (
                <div className="bg-(--surface) rounded-xl shadow-sm p-12 text-center">
                    <Calendar className="h-12 w-12 text-(--text-muted) mx-auto mb-4" />
                    <p className="text-(--text-muted) mb-4">Belum ada jadwal. Tambahkan jadwal untuk event ini.</p>
                </div>
            ) : (
                <div className="space-y-4">
                    {event.schedules.map((schedule) => (
                        <div key={schedule.id} className="bg-(--surface) rounded-xl shadow-sm p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
                            <div className="flex items-start gap-4">
                                <div className="w-12 h-12 bg-indigo-100 rounded-lg flex items-center justify-center shrink-0">
                                    <Calendar className="h-6 w-6 text-(--accent-primary)" />
                                </div>
                                <div>
                                    <h3 className="font-semibold text-foreground">{schedule.title || "Jadwal Event"}</h3>
                                    <div className="flex flex-wrap gap-x-4 gap-y-1 mt-1 text-sm text-(--text-secondary)">
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
                                        <div className="flex items-center gap-1.5 mt-1 text-sm text-(--text-secondary)">
                                            <MapPin className="h-4 w-4" />
                                            {schedule.locationOverride}
                                        </div>
                                    )}
                                    {schedule.description && (
                                        <p className="text-sm text-(--text-muted) mt-2">{schedule.description}</p>
                                    )}
                                </div>
                            </div>
                            <div className="flex items-center gap-2 md:self-start">
                                <button
                                    onClick={() => handleEdit(schedule)}
                                    className="p-2 text-(--text-muted) hover:text-(--accent-primary) hover:bg-(--accent-primary)/10 rounded-lg transition-colors"
                                    title="Edit"
                                >
                                    <Edit2 className="h-5 w-5" />
                                </button>
                                <button
                                    onClick={() => handleDelete(schedule.id)}
                                    disabled={isDeleting === schedule.id}
                                    className="p-2 text-(--text-muted) hover:text-red-600 hover:bg-red-500/10 rounded-lg transition-colors disabled:opacity-50"
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
                    <div className="bg-(--surface) rounded-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
                        <div className="p-6 border-b flex justify-between items-center sticky top-0 bg-(--surface) z-10">
                            <h3 className="text-lg font-bold text-foreground">{editingSchedule ? "Edit Jadwal" : "Tambah Jadwal"}</h3>
                            <button onClick={() => setIsModalOpen(false)} className="text-(--text-muted) hover:text-(--text-secondary)">
                                <XCircle className="h-6 w-6" />
                            </button>
                        </div>
                        <form onSubmit={handleSubmit} className="p-6 space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-(--text-secondary) mb-1">Judul (Opsional)</label>
                                <input name="title" defaultValue={editingSchedule?.title || ""} placeholder="Contoh: Sesi 1, Main Stage, dll" className="w-full px-3 py-2 border rounded-lg" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-(--text-secondary) mb-1">Tanggal</label>
                                <input name="scheduleDate" type="date" required defaultValue={editingSchedule?.scheduleDate ? new Date(editingSchedule.scheduleDate).toISOString().split('T')[0] : ""} className="w-full px-3 py-2 border rounded-lg" />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-(--text-secondary) mb-1">Jam Mulai</label>
                                    <input name="startTime" type="time" required defaultValue={editingSchedule?.startTime || ""} className="w-full px-3 py-2 border rounded-lg" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-(--text-secondary) mb-1">Jam Selesai</label>
                                    <input name="endTime" type="time" required defaultValue={editingSchedule?.endTime || ""} className="w-full px-3 py-2 border rounded-lg" />
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-(--text-secondary) mb-1">Lokasi Khusus (Opsional)</label>
                                <input name="locationOverride" defaultValue={editingSchedule?.locationOverride || ""} placeholder="Jika berbeda dengan lokasi utama" className="w-full px-3 py-2 border rounded-lg" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-(--text-secondary) mb-1">Deskripsi (Opsional)</label>
                                <textarea name="description" defaultValue={editingSchedule?.description || ""} rows={3} className="w-full px-3 py-2 border rounded-lg" />
                            </div>
                            <div className="pt-4 flex gap-3">
                                <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 px-4 py-2 border rounded-lg hover:bg-(--surface-hover)">Batal</button>
                                <button type="submit" disabled={isLoading} className="flex-1 px-4 py-2 bg-(--accent-primary) text-white rounded-lg hover:opacity-90 disabled:opacity-50">
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

function ComplimentaryTab({ event }: { event: EventData }) {
    const [requests, setRequests] = useState<Array<{
        id: string;
        guestName: string | null;
        guestEmail: string | null;
        reason: string | null;
        requestedTotal: number;
        status: "PENDING" | "APPROVED" | "REJECTED";
        reviewedNote: string | null;
        createdAt: string;
        items: Array<{
            id: string;
            quantity: number;
            ticketType: {
                id: string;
                name: string;
                basePrice: number;
                isFree: boolean;
            };
        }>;
        bookings: Array<{
            id: string;
            bookingCode: string;
            status: string;
            createdAt: string;
        }>;
    }>>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isSaving, setIsSaving] = useState(false);

    const fetchRequests = async () => {
        try {
            const res = await fetch(`/api/organizer/events/${event.id}/complimentary-requests`);
            const data = await res.json();
            if (data.success) {
                setRequests(data.data);
            }
        } catch {
            setRequests([]);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchRequests();

        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [event.id]);

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const formData = new FormData(e.currentTarget);

        const ticketTypeRows = event.ticketTypes
            .map((ticketType) => ({
                ticketTypeId: ticketType.id,
                quantity: Number(formData.get(`qty-${ticketType.id}`) || 0),
            }))
            .filter((item) => item.quantity > 0);

        if (ticketTypeRows.length === 0) {
            alert("Pilih minimal 1 tiket complimentary");
            return;
        }

        const payload = {
            guestName: String(formData.get("guestName") || ""),
            guestEmail: String(formData.get("guestEmail") || ""),
            guestPhone: String(formData.get("guestPhone") || ""),
            reason: String(formData.get("reason") || ""),
            items: ticketTypeRows,
        };

        try {
            setIsSaving(true);
            const res = await fetch(`/api/organizer/events/${event.id}/complimentary-requests`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload),
            });
            const data = await res.json();

            if (!data.success) {
                alert(data.error?.message || "Gagal membuat request complimentary");
                return;
            }

            setIsModalOpen(false);
            fetchRequests();
        } catch {
            alert("Terjadi kesalahan");
        } finally {
            setIsSaving(false);
        }
    };

    if (isLoading) {
        return <div className="text-center py-12"><Loader2 className="h-8 w-8 animate-spin mx-auto text-(--accent-primary)" /></div>;
    }

    const totalRequests = requests.length;
    const pendingCount = requests.filter(r => r.status === "PENDING").length;
    const approvedCount = requests.filter(r => r.status === "APPROVED").length;
    const rejectedCount = requests.filter(r => r.status === "REJECTED").length;

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-foreground">Complimentary Ticket Requests</h2>
                <button
                    type="button"
                    onClick={() => setIsModalOpen(true)}
                    className="inline-flex items-center gap-2 px-4 py-2 bg-(--accent-primary) text-white rounded-lg font-medium hover:opacity-90"
                >
                    <Gift className="h-4 w-4" />
                    Request Complimentary
                </button>
            </div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-(--surface) rounded-xl p-5 shadow-sm">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-indigo-100 rounded-lg flex items-center justify-center">
                            <Gift className="h-5 w-5 text-(--accent-primary)" />
                        </div>
                        <div>
                            <p className="text-2xl font-bold text-foreground">{totalRequests}</p>
                            <p className="text-sm text-(--text-muted)">Total Requests</p>
                        </div>
                    </div>
                </div>
                <div className="bg-(--surface) rounded-xl p-5 shadow-sm">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-yellow-500/10 rounded-lg flex items-center justify-center">
                            <Clock className="h-5 w-5 text-yellow-600" />
                        </div>
                        <div>
                            <p className="text-2xl font-bold text-foreground">{pendingCount}</p>
                            <p className="text-sm text-(--text-muted)">Pending</p>
                        </div>
                    </div>
                </div>
                <div className="bg-(--surface) rounded-xl p-5 shadow-sm">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-green-500/10 rounded-lg flex items-center justify-center">
                            <CheckCircle className="h-5 w-5 text-green-600" />
                        </div>
                        <div>
                            <p className="text-2xl font-bold text-foreground">{approvedCount}</p>
                            <p className="text-sm text-(--text-muted)">Approved</p>
                        </div>
                    </div>
                </div>
                <div className="bg-(--surface) rounded-xl p-5 shadow-sm">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-red-500/10 rounded-lg flex items-center justify-center">
                            <XCircle className="h-5 w-5 text-red-600" />
                        </div>
                        <div>
                            <p className="text-2xl font-bold text-foreground">{rejectedCount}</p>
                            <p className="text-sm text-(--text-muted)">Rejected</p>
                        </div>
                    </div>
                </div>
            </div>

            {requests.length === 0 ? (
                <div className="bg-(--surface) rounded-xl shadow-sm p-12 text-center">
                    <Gift className="h-12 w-12 text-(--text-muted) mx-auto mb-4" />
                    <p className="text-(--text-muted)">Belum ada request complimentary untuk event ini.</p>
                </div>
            ) : (
                <div className="grid gap-4">
                    {requests.map((request) => (
                        <div key={request.id} className="bg-(--surface) rounded-xl shadow-sm p-5">
                            <div className="flex items-start justify-between gap-3">
                                <div>
                                    <p className="font-semibold text-foreground">{request.guestName || "Guest"}</p>
                                    <p className="text-sm text-(--text-muted)">{request.guestEmail || "-"}</p>
                                    <p className="text-sm text-(--text-secondary) mt-1">Total tiket: {request.requestedTotal}</p>
                                    <div className="text-sm text-(--text-secondary) mt-2 space-y-1">
                                        {request.items.map((item) => (
                                            <p key={item.id}>• {item.ticketType.name} x{item.quantity}</p>
                                        ))}
                                    </div>
                                    {request.reason && (
                                        <p className="text-sm text-(--text-muted) mt-2">Alasan: {request.reason}</p>
                                    )}
                                    {request.bookings?.[0] && (
                                        <p className="text-sm text-green-700 mt-2">Booking issued: {request.bookings[0].bookingCode}</p>
                                    )}
                                </div>
                                <div className="text-right">
                                    <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${request.status === "APPROVED"
                                        ? "bg-green-500/10 text-green-700"
                                        : request.status === "REJECTED"
                                            ? "bg-red-500/10 text-red-700"
                                            : "bg-yellow-500/10 text-yellow-700"
                                        }`}>
                                        {request.status}
                                    </span>
                                    <p className="text-xs text-(--text-muted) mt-2">{formatDate(request.createdAt)}</p>
                                    {request.reviewedNote && (
                                        <p className="text-xs text-(--text-muted) mt-1 max-w-[220px]">Catatan admin: {request.reviewedNote}</p>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {isModalOpen && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-(--surface) rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                        <div className="p-6 border-b sticky top-0 bg-(--surface)">
                            <h3 className="text-lg font-bold text-foreground">Request Complimentary Ticket</h3>
                        </div>
                        <form onSubmit={handleSubmit} className="p-6 space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-(--text-secondary) mb-1">Nama Penerima *</label>
                                    <input name="guestName" required className="w-full px-3 py-2 border rounded-lg" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-(--text-secondary) mb-1">Email Penerima *</label>
                                    <input name="guestEmail" type="email" required className="w-full px-3 py-2 border rounded-lg" />
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-(--text-secondary) mb-1">No. WhatsApp</label>
                                <input name="guestPhone" className="w-full px-3 py-2 border rounded-lg" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-(--text-secondary) mb-1">Alasan Request</label>
                                <textarea name="reason" rows={3} className="w-full px-3 py-2 border rounded-lg" />
                            </div>

                            <div>
                                <p className="text-sm font-medium text-(--text-secondary) mb-2">Jumlah tiket per tipe</p>
                                <div className="space-y-2">
                                    {event.ticketTypes.filter((ticket) => ticket.isActive).map((ticket) => (
                                        <div key={ticket.id} className="grid grid-cols-[1fr_110px] gap-3 items-center">
                                            <div>
                                                <p className="text-sm font-medium text-foreground">{ticket.name}</p>
                                                <p className="text-xs text-(--text-muted)">Sisa tersedia: {Math.max(0, ticket.totalQuantity - ticket._count.bookedTickets)}</p>
                                            </div>
                                            <input
                                                name={`qty-${ticket.id}`}
                                                type="number"
                                                min={0}
                                                max={50}
                                                defaultValue={0}
                                                className="px-3 py-2 border rounded-lg"
                                            />
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div className="pt-4 flex gap-3">
                                <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 px-4 py-2 border rounded-lg hover:bg-(--surface-hover)">Batal</button>
                                <button type="submit" disabled={isSaving} className="flex-1 px-4 py-2 bg-(--accent-primary) text-white rounded-lg hover:opacity-90 disabled:opacity-50">
                                    {isSaving ? "Mengirim..." : "Kirim Request"}
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
        } catch {
            console.error("Failed to fetch promo codes");
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {

        fetchPromoCodes();
        // eslint-disable-next-line react-hooks/exhaustive-deps
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

    if (isLoading) return <div className="text-center py-12"><Loader2 className="h-8 w-8 animate-spin mx-auto text-(--accent-primary)" /></div>;

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-foreground">Kode Promo</h2>
                <button
                    onClick={() => { setEditingPromo(null); setIsModalOpen(true); }}
                    className="inline-flex items-center gap-2 px-4 py-2 bg-(--accent-primary) text-white rounded-lg font-medium hover:opacity-90"
                >
                    <Plus className="h-4 w-4" />
                    Tambah Promo
                </button>
            </div>

            {promoCodes.length === 0 ? (
                <div className="bg-(--surface) rounded-xl shadow-sm p-12 text-center">
                    <Tag className="h-12 w-12 text-(--text-muted) mx-auto mb-4" />
                    <p className="text-(--text-muted) mb-4">Belum ada kode promo. Buat kode promo untuk event ini.</p>
                </div>
            ) : (
                <div className="grid gap-4">
                    {promoCodes.map((promo) => (
                        <div key={promo.id} className="bg-(--surface) rounded-xl shadow-sm p-6">
                            <div className="flex justify-between items-start">
                                <div>
                                    <div className="flex items-center gap-2">
                                        <span className="px-2.5 py-1 bg-indigo-100 text-(--accent-primary) font-mono font-bold rounded text-lg">
                                            {promo.code}
                                        </span>
                                        {!promo.isActive && (
                                            <span className="px-2 py-0.5 bg-red-500/10 text-red-700 text-xs rounded-full">Non-aktif</span>
                                        )}
                                    </div>
                                    <p className="text-foreground font-medium mt-2">
                                        Diskon {promo.discountType === "PERCENTAGE" ? `${promo.discountValue}%` : formatCurrency(promo.discountValue)}
                                    </p>
                                    <div className="text-sm text-(--text-muted) mt-1 space-y-1">
                                        <p>Berlaku: {new Date(promo.validFrom).toLocaleDateString("id-ID")} - {new Date(promo.validUntil).toLocaleDateString("id-ID")}</p>
                                        <p>Digunakan: {promo._count?.usages || 0} kali {promo.usageLimitTotal ? `/ ${promo.usageLimitTotal}` : ""}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2">
                                    <button
                                        onClick={() => { setEditingPromo(promo); setIsModalOpen(true); }}
                                        className="p-2 text-(--text-muted) hover:text-(--accent-primary) hover:bg-(--accent-primary)/10 rounded-lg transition-colors"
                                    >
                                        <Edit2 className="h-5 w-5" />
                                    </button>
                                    <button
                                        onClick={() => handleDelete(promo.id)}
                                        disabled={isDeleting === promo.id}
                                        className="p-2 text-(--text-muted) hover:text-red-600 hover:bg-red-500/10 rounded-lg transition-colors disabled:opacity-50"
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
                    <div className="bg-(--surface) rounded-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
                        <div className="p-6 border-b flex justify-between items-center sticky top-0 bg-(--surface) z-10">
                            <h3 className="text-lg font-bold text-foreground">{editingPromo ? "Edit Promo" : "Tambah Promo"}</h3>
                            <button onClick={() => setIsModalOpen(false)} className="text-(--text-muted) hover:text-(--text-secondary)">
                                <XCircle className="h-6 w-6" />
                            </button>
                        </div>
                        <form onSubmit={handleSubmit} className="p-6 space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-(--text-secondary) mb-1">Kode Promo</label>
                                <input name="code" defaultValue={editingPromo?.code || ""} required pattern="[A-Za-z0-9]+" className="w-full px-3 py-2 border rounded-lg uppercase" placeholder="Contoh: MERDEKA45" />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-(--text-secondary) mb-1">Tipe Diskon</label>
                                    <select name="discountType" defaultValue={editingPromo?.discountType || "PERCENTAGE"} className="w-full px-3 py-2 border rounded-lg">
                                        <option value="PERCENTAGE">Persentase (%)</option>
                                        <option value="FIXED_AMOUNT">Nominal (Rp)</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-(--text-secondary) mb-1">Nilai Diskon</label>
                                    <input name="discountValue" type="number" defaultValue={editingPromo?.discountValue || ""} required min="1" className="w-full px-3 py-2 border rounded-lg" />
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-(--text-secondary) mb-1">Min. Belanja</label>
                                    <input name="minOrderAmount" type="number" defaultValue={editingPromo?.minOrderAmount || ""} className="w-full px-3 py-2 border rounded-lg" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-(--text-secondary) mb-1">Maks. Diskon</label>
                                    <input name="maxDiscountAmount" type="number" defaultValue={editingPromo?.maxDiscountAmount || ""} className="w-full px-3 py-2 border rounded-lg" placeholder="Opsional" />
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-(--text-secondary) mb-1">Kuota Total</label>
                                    <input name="usageLimitTotal" type="number" defaultValue={editingPromo?.usageLimitTotal || ""} className="w-full px-3 py-2 border rounded-lg" placeholder="Tak Terbatas" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-(--text-secondary) mb-1">Limit per User</label>
                                    <input name="usageLimitPerUser" type="number" defaultValue={editingPromo?.usageLimitPerUser || 1} className="w-full px-3 py-2 border rounded-lg" />
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-(--text-secondary) mb-1">Berlaku Dari</label>
                                    <input name="validFrom" type="datetime-local" required defaultValue={editingPromo?.validFrom ? new Date(editingPromo.validFrom).toISOString().slice(0, 16) : ""} className="w-full px-3 py-2 border rounded-lg" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-(--text-secondary) mb-1">Berlaku Sampai</label>
                                    <input name="validUntil" type="datetime-local" required defaultValue={editingPromo?.validUntil ? new Date(editingPromo.validUntil).toISOString().slice(0, 16) : ""} className="w-full px-3 py-2 border rounded-lg" />
                                </div>
                            </div>
                            <label className="flex items-center gap-2">
                                <input name="isActive" type="checkbox" defaultChecked={editingPromo?.isActive ?? true} className="rounded border-(--border)" />
                                <span className="text-sm text-(--text-secondary)">Aktif</span>
                            </label>
                            <div className="pt-4 flex gap-3">
                                <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 px-4 py-2 border rounded-lg hover:bg-(--surface-hover)">Batal</button>
                                <button type="submit" disabled={isSaving} className="flex-1 px-4 py-2 bg-(--accent-primary) text-white rounded-lg hover:opacity-90 disabled:opacity-50">
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
