"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
    AlertCircle,
    ArrowLeft,
    Bell,
    CalendarDays,
    CheckCircle,
    Clock3,
    Heart,
    Loader2,
    MapPin,
    Share2,
    Ticket,
    Users,
    Video,
} from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import SeatSelector, { SelectedSeat } from "@/components/seating/SeatSelector";
import { ReviewSection } from "@/components/features/reviews";
import { VenueMapViewer } from "@/components/features/events/VenueMapViewer";
import {
    DiscoveryBadge,
    DiscoveryContainer,
    DiscoveryFaqList,
    DiscoveryHero,
    DiscoveryLinkRow,
    DiscoveryMetaItem,
    DiscoveryPageShell,
    DiscoveryPanel,
    DiscoverySection,
    DiscoveryStat,
} from "@/components/features/events/discovery-primitives";

interface TicketType {
    id: string;
    name: string;
    description: string | null;
    basePrice: number;
    totalQuantity: number;
    availableQuantity: number;
    minPerOrder: number;
    maxPerOrder: number;
    isFree: boolean;
}

interface EventSchedule {
    id: string;
    title: string | null;
    scheduleDate: string;
    startTime: string;
    endTime: string;
}

interface EventData {
    id: string;
    slug: string;
    title: string;
    shortDescription: string | null;
    description: string | null;
    posterImage: string | null;
    bannerImage: string | null;
    eventType: "OFFLINE" | "ONLINE" | "HYBRID";
    status: string;
    isFeatured: boolean;
    hasSeatingChart: boolean;
    minTicketsPerOrder?: number;
    maxTicketsPerOrder?: number;
    termsAndConditions: string | null;
    refundPolicy: string | null;
    viewCount: number;
    category: {
        id: string;
        name: string;
        slug: string;
        colorHex: string | null;
    } | null;
    venue: {
        id: string;
        name: string;
        address: string;
        city: string;
        province: string;
    } | null;
    organizer: {
        id: string;
        name: string;
        slug: string | null;
        logo: string | null;
        description: string | null;
        isVerified: boolean;
    };
    schedules: EventSchedule[];
    ticketTypes: TicketType[];
    faqs: Array<{
        id: string;
        question: string;
        answer: string;
    }>;
}

interface EventDetailViewProps {
    event: EventData;
}

function formatDate(dateStr: string): string {
    return new Date(dateStr).toLocaleDateString("id-ID", {
        weekday: "long",
        day: "numeric",
        month: "long",
        year: "numeric",
    });
}

function formatShortDate(dateStr: string): string {
    return new Date(dateStr).toLocaleDateString("id-ID", {
        day: "numeric",
        month: "short",
        year: "numeric",
    });
}

function formatTime(timeStr: string): string {
    return new Date(timeStr).toLocaleTimeString("id-ID", {
        hour: "2-digit",
        minute: "2-digit",
    });
}

export function EventDetailView({ event }: EventDetailViewProps) {
    const router = useRouter();
    const [quantities, setQuantities] = useState<Record<string, number>>({});
    const [selectedSeats, setSelectedSeats] = useState<SelectedSeat[]>([]);
    const [expandedFaq, setExpandedFaq] = useState<string | null>(null);
    const [showTerms, setShowTerms] = useState(false);
    const [isWishlisted, setIsWishlisted] = useState(false);
    const [isWishlistLoading, setIsWishlistLoading] = useState(false);
    const [showWaitlistModal, setShowWaitlistModal] = useState(false);
    const [waitlistTicket, setWaitlistTicket] = useState<TicketType | null>(null);
    const [waitlistEmail, setWaitlistEmail] = useState("");
    const [waitlistName, setWaitlistName] = useState("");
    const [isJoiningWaitlist, setIsJoiningWaitlist] = useState(false);
    const [waitlistError, setWaitlistError] = useState<string | null>(null);
    const [waitlistSuccess, setWaitlistSuccess] = useState(false);

    const checkWishlistStatus = useCallback(async () => {
        try {
            const response = await fetch(`/api/wishlist/${event.id}`);
            if (response.ok) {
                const data = await response.json();
                if (data.success) {
                    setIsWishlisted(data.data.isWishlisted);
                }
            }
        } catch {
            // ignore silently
        }
    }, [event.id]);

    useEffect(() => {
        checkWishlistStatus();
    }, [checkWishlistStatus]);

    const handleWishlistToggle = async () => {
        setIsWishlistLoading(true);
        try {
            if (isWishlisted) {
                const response = await fetch(`/api/wishlist/${event.id}`, { method: "DELETE" });
                if (response.ok) {
                    setIsWishlisted(false);
                } else if (response.status === 401) {
                    router.push("/auth/login");
                    return;
                }
            } else {
                const response = await fetch("/api/wishlist", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ eventId: event.id }),
                });
                if (response.ok) {
                    setIsWishlisted(true);
                } else if (response.status === 401) {
                    router.push("/auth/login");
                    return;
                }
            }
        } catch {
            console.error("Failed to toggle wishlist");
        } finally {
            setIsWishlistLoading(false);
        }
    };

    const schedule = event.schedules[0];
    const eventDate = schedule ? formatDate(schedule.scheduleDate) : "Tanggal akan diumumkan";
    const eventDateShort = schedule ? formatShortDate(schedule.scheduleDate) : "Segera diumumkan";
    const eventTime = schedule ? `${formatTime(schedule.startTime)} - ${formatTime(schedule.endTime)} WIB` : "Waktu akan diumumkan";
    const location =
        event.eventType === "ONLINE"
            ? "Online event"
            : event.venue
                ? `${event.venue.name}, ${event.venue.city}`
                : "Lokasi akan diumumkan";

    const lowestPrice = useMemo(() => {
        if (!event.ticketTypes.length) return null;
        return Math.min(...event.ticketTypes.map((ticket) => ticket.basePrice));
    }, [event.ticketTypes]);

    const soldOutCount = useMemo(
        () => event.ticketTypes.filter((ticket) => ticket.availableQuantity === 0).length,
        [event.ticketTypes],
    );

    const total = event.hasSeatingChart
        ? selectedSeats.reduce((accumulator, seat) => accumulator + seat.price, 0)
        : event.ticketTypes.reduce((accumulator, ticket) => accumulator + ticket.basePrice * (quantities[ticket.id] || 0), 0);

    const totalTickets = event.hasSeatingChart
        ? selectedSeats.length
        : Object.values(quantities).reduce((accumulator, value) => accumulator + value, 0);

    const handleQtyChange = (ticketId: string, delta: number) => {
        setQuantities((previous) => {
            const current = previous[ticketId] || 0;
            const ticket = event.ticketTypes.find((item) => item.id === ticketId);
            if (!ticket) return previous;

            const maxQty = Math.min(ticket.maxPerOrder, ticket.availableQuantity);
            const newValue = Math.max(0, Math.min(maxQty, current + delta));
            return { ...previous, [ticketId]: newValue };
        });
    };

    const handleCheckout = () => {
        if (totalTickets === 0) return;

        if (event.hasSeatingChart) {
            const ticketCounts = selectedSeats.reduce((accumulator, seat) => {
                const ticketId = seat.ticketTypeId;
                if (ticketId) {
                    accumulator[ticketId] = (accumulator[ticketId] || 0) + 1;
                }
                return accumulator;
            }, {} as Record<string, number>);

            const ticketParams = Object.entries(ticketCounts)
                .map(([id, quantity]) => `${id}:${quantity}`)
                .join(",");

            const seatIds = selectedSeats.map((seat) => seat.id).join(",");
            router.push(`/checkout?event=${event.slug}&tickets=${ticketParams}&seats=${seatIds}`);
            return;
        }

        const ticketParams = event.ticketTypes
            .filter((ticket) => quantities[ticket.id] > 0)
            .map((ticket) => `${ticket.id}:${quantities[ticket.id]}`)
            .join(",");

        router.push(`/checkout?event=${event.slug}&tickets=${ticketParams}`);
    };

    const handleShare = async () => {
        if (navigator.share) {
            await navigator.share({
                title: event.title,
                text: event.shortDescription || "",
                url: window.location.href,
            });
        } else {
            await navigator.clipboard.writeText(window.location.href);
            alert("Link berhasil disalin!");
        }
    };

    const openWaitlistModal = (ticket: TicketType) => {
        setWaitlistTicket(ticket);
        setWaitlistEmail("");
        setWaitlistName("");
        setWaitlistError(null);
        setWaitlistSuccess(false);
        setShowWaitlistModal(true);
    };

    const handleJoinWaitlist = async () => {
        if (!waitlistTicket || !waitlistEmail) return;

        setIsJoiningWaitlist(true);
        setWaitlistError(null);

        try {
            const response = await fetch(`/api/events/${event.slug}/waitlist`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    ticketTypeId: waitlistTicket.id,
                    email: waitlistEmail,
                    name: waitlistName || null,
                    quantity: 1,
                }),
            });

            const data = await response.json();

            if (!response.ok) {
                setWaitlistError(data.error?.message || "Gagal bergabung waitlist");
                return;
            }

            setWaitlistSuccess(true);
        } catch {
            setWaitlistError("Gagal bergabung waitlist. Coba lagi.");
        } finally {
            setIsJoiningWaitlist(false);
        }
    };

    return (
        <DiscoveryPageShell>
            <div className="sticky top-0 z-40 border-b border-(--border) bg-[rgba(255,255,255,0.86)] backdrop-blur-xl">
                <DiscoveryContainer className="flex items-center justify-between gap-4 py-3">
                    <Link
                        href="/events"
                        className="inline-flex items-center gap-2 text-sm font-semibold text-(--text-secondary) transition-colors duration-200 hover:text-foreground"
                    >
                        <ArrowLeft className="h-4 w-4" />
                        <span className="hidden sm:inline">Kembali ke event</span>
                    </Link>
                    <p className="hidden max-w-md truncate text-sm font-semibold text-foreground md:block">{event.title}</p>
                    <div className="flex items-center gap-2">
                        <button
                            type="button"
                            onClick={handleWishlistToggle}
                            disabled={isWishlistLoading}
                            className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-(--border) bg-white text-(--text-secondary) transition-colors duration-200 hover:text-rose-500"
                            aria-label={isWishlisted ? "Hapus dari wishlist" : "Tambah ke wishlist"}
                        >
                            {isWishlistLoading ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                                <Heart className="h-4 w-4" fill={isWishlisted ? "currentColor" : "none"} />
                            )}
                        </button>
                        <button
                            type="button"
                            onClick={handleShare}
                            className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-(--border) bg-white text-(--text-secondary) transition-colors duration-200 hover:text-foreground"
                            aria-label="Bagikan event"
                        >
                            <Share2 className="h-4 w-4" />
                        </button>
                    </div>
                </DiscoveryContainer>
            </div>

            <DiscoveryHero
                eyebrow={
                    <div className="flex flex-wrap items-center gap-2">
                        {event.category ? <DiscoveryBadge tone="accent">{event.category.name}</DiscoveryBadge> : null}
                        <DiscoveryBadge tone={event.isFeatured ? "warm" : "default"}>
                            {event.isFeatured ? "Pilihan editor" : event.eventType.toLowerCase()}
                        </DiscoveryBadge>
                    </div>
                }
                title={<>{event.title}</>}
                description={<>{event.shortDescription || event.description || "Deskripsi event akan segera diperbarui."}</>}
                className="pb-8"
            >
                <DiscoveryPanel className="overflow-hidden p-0">
                    <div className="relative h-72 w-full bg-[linear-gradient(135deg,rgba(1,89,89,0.96),rgba(41,179,182,0.7))] sm:h-80 lg:h-104">
                        <img
                            src={event.bannerImage || event.posterImage || "/placeholder-event.jpg"}
                            alt={event.title}
                            className="h-full w-full object-cover"
                        />
                        <div className="absolute inset-0 bg-linear-to-t from-[rgba(6,18,18,0.76)] via-[rgba(6,18,18,0.14)] to-transparent" />
                        <div className="absolute inset-x-0 bottom-0 p-5 sm:p-6">
                            <div className="grid gap-3 sm:grid-cols-3">
                                <DiscoveryStat label="Tanggal" value={eventDateShort} hint={schedule?.title || "Jadwal utama"} />
                                <DiscoveryStat label="Waktu" value={schedule ? formatTime(schedule.startTime) : "TBA"} hint={eventTime} />
                                <DiscoveryStat
                                    label="Mulai dari"
                                    value={lowestPrice === null ? "Segera diumumkan" : lowestPrice === 0 ? "Gratis" : formatCurrency(lowestPrice)}
                                    hint={event.ticketTypes.length ? `${event.ticketTypes.length} tipe tiket` : "Belum ada tiket"}
                                />
                            </div>
                        </div>
                    </div>
                </DiscoveryPanel>
            </DiscoveryHero>

            <DiscoveryContainer className="pb-16 sm:pb-20">
                <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_24rem] lg:items-start">
                    <div className="space-y-8">
                        <DiscoveryPanel className="p-5 sm:p-6 lg:p-8">
                            <div className="grid gap-4 sm:grid-cols-3">
                                <DiscoveryMetaItem icon={CalendarDays} label="Tanggal" value={eventDate} tone="accent" />
                                <DiscoveryMetaItem icon={Clock3} label="Waktu" value={eventTime} />
                                <DiscoveryMetaItem
                                    icon={event.eventType === "ONLINE" ? Video : MapPin}
                                    label="Lokasi"
                                    value={location}
                                    tone={event.eventType === "ONLINE" ? "warm" : "default"}
                                />
                            </div>

                            {event.eventType !== "OFFLINE" ? (
                                <div className="mt-5 rounded-3xl border border-[rgba(41,179,182,0.2)] bg-[rgba(41,179,182,0.1)] p-4 text-sm leading-7 text-(--info-text)">
                                    Event ini mendukung pengalaman online. Pastikan email dan perangkat yang digunakan aktif agar akses berjalan lancar.
                                </div>
                            ) : null}
                        </DiscoveryPanel>

                        <DiscoverySection title="Tentang event" description="Narasi utama, agenda singkat, dan konteks pengalaman yang akan didapat peserta.">
                            <DiscoveryPanel className="p-5 sm:p-6 lg:p-8">
                                <div className="prose max-w-none text-(--text-secondary)">
                                    <p className="whitespace-pre-wrap text-sm leading-8 sm:text-base">
                                        {event.description || event.shortDescription || "Informasi lengkap event akan segera diperbarui oleh penyelenggara."}
                                    </p>
                                </div>
                            </DiscoveryPanel>
                        </DiscoverySection>

                        <DiscoverySection title="Penyelenggara" description="Profil singkat organizer ditampilkan sebagai bagian dari konteks editorial event.">
                            <DiscoveryPanel className="p-5 sm:p-6 lg:p-8">
                                <div className="flex flex-col gap-5 sm:flex-row sm:items-center">
                                    <div className="h-18 w-18 shrink-0 overflow-hidden rounded-[1.75rem] bg-[linear-gradient(135deg,rgba(1,89,89,0.92),rgba(41,179,182,0.68))] text-white shadow-(--shadow-sm)">
                                        {event.organizer.logo ? (
                                            <img src={event.organizer.logo} alt={event.organizer.name} className="h-full w-full object-cover" />
                                        ) : (
                                            <div className="flex h-full w-full items-center justify-center text-2xl font-semibold">
                                                {event.organizer.name.charAt(0)}
                                            </div>
                                        )}
                                    </div>
                                    <div className="min-w-0 flex-1">
                                        <div className="flex flex-wrap items-center gap-2">
                                            <h2 className="text-2xl font-semibold tracking-(--tracking-heading) text-foreground">
                                                {event.organizer.name}
                                            </h2>
                                            {event.organizer.isVerified ? <CheckCircle className="h-5 w-5 text-(--info)" /> : null}
                                        </div>
                                        {event.organizer.description ? (
                                            <p className="mt-2 max-w-2xl text-sm leading-7 text-(--text-secondary)">
                                                {event.organizer.description}
                                            </p>
                                        ) : null}
                                        {event.organizer.slug ? (
                                            <div className="mt-4">
                                                <DiscoveryLinkRow href={`/organizers/${event.organizer.slug}`} label="Lihat profil organizer" />
                                            </div>
                                        ) : null}
                                    </div>
                                </div>
                            </DiscoveryPanel>
                        </DiscoverySection>

                        {event.hasSeatingChart ? (
                            <DiscoverySection title="Tata letak venue" description="Peta kursi ditampilkan agar pengunjung bisa memahami orientasi area sebelum memilih seat.">
                                <VenueMapViewer eventSlug={event.slug} mode="view" />
                            </DiscoverySection>
                        ) : null}

                        {event.faqs.length > 0 ? (
                            <DiscoverySection
                                title="Pertanyaan yang sering muncul"
                                description="FAQ dipadatkan dalam pola accordion editorial agar cepat dipindai tanpa memenuhi halaman."
                                action={<DiscoveryLinkRow href={`/events/${event.slug}/faq`} label="Buka halaman FAQ lengkap" />}
                            >
                                <DiscoveryFaqList
                                    items={event.faqs.slice(0, 4)}
                                    expandedId={expandedFaq}
                                    onToggle={(id) => setExpandedFaq((current) => (current === id ? null : id))}
                                />
                            </DiscoverySection>
                        ) : null}

                        {(event.termsAndConditions || event.refundPolicy) ? (
                            <DiscoverySection title="Syarat & kebijakan" description="Aturan pembelian dan refund tetap tersedia, tetapi disajikan sebagai disclosure yang lebih rapi.">
                                <DiscoveryPanel className="p-5 sm:p-6 lg:p-8">
                                    <button
                                        type="button"
                                        onClick={() => setShowTerms((current) => !current)}
                                        className="flex w-full items-center justify-between gap-4 rounded-3xl border border-(--border) bg-white px-5 py-4 text-left transition-colors duration-200 hover:bg-(--surface-hover)"
                                    >
                                        <div>
                                            <p className="text-[0.68rem] font-semibold uppercase tracking-[0.22em] text-(--text-muted)">Disclosure</p>
                                            <h3 className="mt-1 text-lg font-semibold text-foreground">
                                                {showTerms ? "Sembunyikan detail kebijakan" : "Lihat ketentuan pembelian & refund"}
                                            </h3>
                                        </div>
                                        <span className="text-2xl leading-none text-(--text-secondary)">{showTerms ? "−" : "+"}</span>
                                    </button>

                                    {showTerms ? (
                                        <div className="mt-5 grid gap-5 md:grid-cols-2">
                                            {event.termsAndConditions ? (
                                                <div className="rounded-3xl border border-(--border) bg-(--surface-muted) p-5">
                                                    <h4 className="text-sm font-semibold uppercase tracking-[0.2em] text-(--text-muted)">Ketentuan umum</h4>
                                                    <p className="mt-3 whitespace-pre-wrap text-sm leading-7 text-(--text-secondary)">
                                                        {event.termsAndConditions}
                                                    </p>
                                                </div>
                                            ) : null}
                                            {event.refundPolicy ? (
                                                <div className="rounded-3xl border border-(--border) bg-(--surface-muted) p-5">
                                                    <h4 className="text-sm font-semibold uppercase tracking-[0.2em] text-(--text-muted)">Kebijakan refund</h4>
                                                    <p className="mt-3 whitespace-pre-wrap text-sm leading-7 text-(--text-secondary)">
                                                        {event.refundPolicy}
                                                    </p>
                                                </div>
                                            ) : null}
                                        </div>
                                    ) : null}
                                </DiscoveryPanel>
                            </DiscoverySection>
                        ) : null}

                        <ReviewSection eventId={event.id} eventSlug={event.slug} />
                    </div>

                    <aside className="space-y-4 lg:sticky lg:top-24">
                        <DiscoveryPanel className="overflow-hidden">
                            <div className="border-b border-(--border) px-5 py-5 sm:px-6">
                                <div className="flex items-center justify-between gap-3">
                                    <div>
                                        <p className="text-[0.68rem] font-semibold uppercase tracking-[0.22em] text-(--text-muted)">Ticket summary</p>
                                        <h2 className="mt-1 text-2xl font-semibold tracking-(--tracking-heading) text-foreground">
                                            {event.hasSeatingChart ? "Pilih kursi" : "Pilih tiket"}
                                        </h2>
                                    </div>
                                    <DiscoveryBadge tone={soldOutCount > 0 ? "warm" : "success"}>
                                        {soldOutCount > 0 ? `${soldOutCount} sold out` : "Masih tersedia"}
                                    </DiscoveryBadge>
                                </div>
                            </div>

                            {event.hasSeatingChart ? (
                                <div className="p-4 sm:p-5">
                                    <div className="max-h-144 overflow-y-auto rounded-3xl border border-(--border) bg-white p-3">
                                        <SeatSelector
                                            eventSlug={event.slug}
                                            ticketTypes={event.ticketTypes}
                                            maxSeats={event.maxTicketsPerOrder || 5}
                                            onSeatsSelected={setSelectedSeats}
                                            onError={(message) => alert(message)}
                                        />
                                    </div>
                                </div>
                            ) : (
                                <div className="space-y-3 p-4 sm:p-5">
                                    {event.ticketTypes.length === 0 ? (
                                        <div className="rounded-3xl border border-dashed border-(--border) bg-(--surface-muted) p-6 text-center text-sm text-(--text-secondary)">
                                            Tiket belum tersedia untuk event ini.
                                        </div>
                                    ) : (
                                        event.ticketTypes.map((ticket) => (
                                            <div
                                                key={ticket.id}
                                                className={`rounded-[1.75rem] border p-4 transition-colors ${ticket.availableQuantity === 0
                                                    ? "border-(--border) bg-(--surface-muted)"
                                                    : "border-(--border) bg-white hover:border-(--border-strong)"
                                                    }`}
                                            >
                                                <div className="flex items-start justify-between gap-4">
                                                    <div className="min-w-0 flex-1">
                                                        <div className="flex flex-wrap items-center gap-2">
                                                            <h3 className="text-base font-semibold text-foreground">{ticket.name}</h3>
                                                            {ticket.isFree ? <DiscoveryBadge tone="success">Gratis</DiscoveryBadge> : null}
                                                        </div>
                                                        {ticket.description ? (
                                                            <p className="mt-1 text-sm leading-6 text-(--text-secondary)">{ticket.description}</p>
                                                        ) : null}
                                                        <p className="mt-3 text-lg font-semibold text-(--accent-primary)">
                                                            {ticket.isFree ? "Gratis" : formatCurrency(ticket.basePrice)}
                                                        </p>
                                                    </div>

                                                    {ticket.availableQuantity > 0 ? (
                                                        <div className="flex items-center gap-2 rounded-full border border-(--border) bg-(--surface-muted) px-2 py-1.5">
                                                            <button
                                                                type="button"
                                                                onClick={() => handleQtyChange(ticket.id, -1)}
                                                                disabled={!quantities[ticket.id]}
                                                                className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-white text-(--text-secondary) disabled:opacity-35"
                                                            >
                                                                −
                                                            </button>
                                                            <span className="w-6 text-center text-sm font-semibold text-foreground">
                                                                {quantities[ticket.id] || 0}
                                                            </span>
                                                            <button
                                                                type="button"
                                                                onClick={() => handleQtyChange(ticket.id, 1)}
                                                                disabled={(quantities[ticket.id] || 0) >= ticket.maxPerOrder}
                                                                className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-(--accent-primary) text-white disabled:opacity-35"
                                                            >
                                                                +
                                                            </button>
                                                        </div>
                                                    ) : (
                                                        <button
                                                            type="button"
                                                            onClick={() => openWaitlistModal(ticket)}
                                                            className="inline-flex items-center gap-2 rounded-full border border-[rgba(251,193,23,0.32)] bg-[rgba(251,193,23,0.18)] px-4 py-2 text-sm font-semibold text-(--warning-text) transition-colors duration-200 hover:bg-[rgba(251,193,23,0.28)]"
                                                        >
                                                            <Bell className="h-4 w-4" />
                                                            Waitlist
                                                        </button>
                                                    )}
                                                </div>

                                                <div className="mt-3 flex items-center gap-2 text-xs text-(--text-muted)">
                                                    <Users className="h-3.5 w-3.5" />
                                                    <span>
                                                        {ticket.availableQuantity > 0
                                                            ? `Tersisa ${ticket.availableQuantity} tiket · maks ${ticket.maxPerOrder} per order`
                                                            : "Saat ini sold out"}
                                                    </span>
                                                </div>
                                            </div>
                                        ))
                                    )}
                                </div>
                            )}

                            <div className="border-t border-(--border) bg-(--surface-muted) px-5 py-5 sm:px-6">
                                <div className="space-y-2 rounded-3xl border border-(--border) bg-white p-4">
                                    <div className="flex items-center justify-between gap-3 text-sm text-(--text-secondary)">
                                        <span>Total pilihan</span>
                                        <span>{totalTickets} tiket</span>
                                    </div>
                                    <div className="flex items-center justify-between gap-3">
                                        <span className="text-sm font-semibold uppercase tracking-[0.22em] text-(--text-muted)">Total</span>
                                        <span className="text-2xl font-semibold tracking-(--tracking-heading) text-(--accent-primary)">
                                            {formatCurrency(total)}
                                        </span>
                                    </div>
                                </div>

                                <button
                                    type="button"
                                    onClick={handleCheckout}
                                    disabled={totalTickets === 0}
                                    className="mt-4 inline-flex min-h-13 w-full items-center justify-center gap-2 rounded-full bg-(--accent-secondary) px-6 py-3 text-sm font-semibold text-white transition-colors duration-200 hover:bg-(--accent-secondary-hover) disabled:cursor-not-allowed disabled:bg-gray-300"
                                >
                                    <Ticket className="h-4 w-4" />
                                    {totalTickets === 0 ? (event.hasSeatingChart ? "Pilih kursi" : "Pilih tiket") : `Checkout (${totalTickets} tiket)`}
                                </button>

                                <p className="mt-3 text-center text-xs leading-6 text-(--text-muted)">
                                    Pembayaran aman dengan Gelaran Guarantee dan ringkasan order yang tetap transparan.
                                </p>
                            </div>
                        </DiscoveryPanel>

                        <DiscoveryPanel className="p-5 sm:p-6">
                            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-1">
                                <DiscoveryStat label="Dilihat" value={event.viewCount.toLocaleString()} hint="Minat pengunjung saat ini" />
                                <DiscoveryStat
                                    label="FAQ aktif"
                                    value={event.faqs.length}
                                    hint={event.faqs.length ? "Sudah dijawab organizer" : "Belum tersedia"}
                                />
                                <DiscoveryStat
                                    label="Venue type"
                                    value={event.eventType}
                                    hint={event.hasSeatingChart ? "Dengan seating chart" : "General admission"}
                                />
                            </div>
                        </DiscoveryPanel>

                        {event.organizer.slug ? (
                            <DiscoveryPanel className="p-5 sm:p-6">
                                <p className="text-[0.68rem] font-semibold uppercase tracking-[0.22em] text-(--text-muted)">Related content</p>
                                <h3 className="mt-2 text-xl font-semibold tracking-(--tracking-heading) text-foreground">
                                    Jelajahi profil organizer
                                </h3>
                                <p className="mt-2 text-sm leading-7 text-(--text-secondary)">
                                    Lihat event lain, statistik publik, dan identitas brand organizer yang menyelenggarakan event ini.
                                </p>
                                <div className="mt-4">
                                    <DiscoveryLinkRow href={`/organizers/${event.organizer.slug}`} label="Buka halaman organizer" />
                                </div>
                            </DiscoveryPanel>
                        ) : null}
                    </aside>
                </div>
            </DiscoveryContainer>

            {showWaitlistModal && waitlistTicket ? (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
                    <DiscoveryPanel className="w-full max-w-md p-6">
                        {waitlistSuccess ? (
                            <div className="text-center">
                                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-(--success-bg)">
                                    <CheckCircle className="h-8 w-8 text-(--success)" />
                                </div>
                                <h3 className="mt-4 text-2xl font-semibold tracking-(--tracking-heading) text-foreground">
                                    Berhasil bergabung
                                </h3>
                                <p className="mt-3 text-sm leading-7 text-(--text-secondary)">
                                    Notifikasi akan dikirim ke <strong>{waitlistEmail}</strong> saat tiket <strong>{waitlistTicket.name}</strong> tersedia kembali.
                                </p>
                                <button
                                    type="button"
                                    onClick={() => setShowWaitlistModal(false)}
                                    className="mt-6 inline-flex min-h-12 w-full items-center justify-center rounded-full bg-(--accent-primary) px-6 py-3 text-sm font-semibold text-white transition-colors duration-200 hover:bg-(--accent-primary-hover)"
                                >
                                    Tutup
                                </button>
                            </div>
                        ) : (
                            <>
                                <div className="flex items-center gap-3">
                                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-(--warning-bg)">
                                        <Bell className="h-5 w-5 text-(--warning-text)" />
                                    </div>
                                    <div>
                                        <p className="text-[0.68rem] font-semibold uppercase tracking-[0.22em] text-(--text-muted)">Waitlist</p>
                                        <h3 className="text-xl font-semibold tracking-(--tracking-heading) text-foreground">{waitlistTicket.name}</h3>
                                    </div>
                                </div>

                                <p className="mt-4 text-sm leading-7 text-(--text-secondary)">
                                    Tiket sedang habis. Daftarkan email untuk mendapatkan notifikasi ketika kuota kembali tersedia.
                                </p>

                                {waitlistError ? (
                                    <div className="mt-4 flex items-start gap-2 rounded-[1.25rem] border border-[rgba(217,79,61,0.22)] bg-(--error-bg) p-3 text-sm text-(--error-text)">
                                        <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
                                        <span>{waitlistError}</span>
                                    </div>
                                ) : null}

                                <div className="mt-5 space-y-4">
                                    <label className="block space-y-2">
                                        <span className="text-sm font-medium text-foreground">Email</span>
                                        <input
                                            id="waitlistEmail"
                                            type="email"
                                            value={waitlistEmail}
                                            onChange={(e) => setWaitlistEmail(e.target.value)}
                                            placeholder="email@contoh.com"
                                            className="h-12 w-full rounded-2xl border border-(--border) bg-white px-4 text-sm text-foreground outline-none focus:border-(--border-focus)"
                                        />
                                    </label>
                                    <label className="block space-y-2">
                                        <span className="text-sm font-medium text-foreground">Nama (opsional)</span>
                                        <input
                                            id="waitlistName"
                                            type="text"
                                            value={waitlistName}
                                            onChange={(e) => setWaitlistName(e.target.value)}
                                            placeholder="Nama lengkap"
                                            className="h-12 w-full rounded-2xl border border-(--border) bg-white px-4 text-sm text-foreground outline-none focus:border-(--border-focus)"
                                        />
                                    </label>
                                </div>

                                <div className="mt-6 flex gap-3">
                                    <button
                                        type="button"
                                        onClick={() => setShowWaitlistModal(false)}
                                        disabled={isJoiningWaitlist}
                                        className="inline-flex min-h-12 flex-1 items-center justify-center rounded-full border border-(--border) bg-white px-4 py-3 text-sm font-semibold text-(--text-secondary) transition-colors duration-200 hover:bg-(--surface-hover) disabled:opacity-50"
                                    >
                                        Batal
                                    </button>
                                    <button
                                        type="button"
                                        onClick={handleJoinWaitlist}
                                        disabled={isJoiningWaitlist || !waitlistEmail}
                                        className="inline-flex min-h-12 flex-1 items-center justify-center gap-2 rounded-full bg-(--accent-secondary) px-4 py-3 text-sm font-semibold text-white transition-colors duration-200 hover:bg-(--accent-secondary-hover) disabled:opacity-50"
                                    >
                                        {isJoiningWaitlist ? (
                                            <>
                                                <Loader2 className="h-4 w-4 animate-spin" />
                                                Memproses...
                                            </>
                                        ) : (
                                            <>
                                                <Bell className="h-4 w-4" />
                                                Gabung waitlist
                                            </>
                                        )}
                                    </button>
                                </div>
                            </>
                        )}
                    </DiscoveryPanel>
                </div>
            ) : null}
        </DiscoveryPageShell>
    );
}
