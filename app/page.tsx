"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
    ArrowRight,
    Calendar,
    Flame,
    Loader2,
    Monitor,
    Music,
    Briefcase,
    Coffee,
    Sparkles,
    Star,
    TrendingUp,
    Zap,
} from "lucide-react";
import { CategoryPill } from "@/components/features/home/CategoryPill";
import { EventCard } from "@/components/features/events/EventCard";
import {
    EditorialPanel,
    MarketingHero,
    PublicPageShell,
    PublicSection,
} from "@/components/shared/public-marketing";
import { EmptyState } from "@/components/shared/phase-two-shells";

interface Category {
    id: string;
    name: string;
    slug: string;
    icon: string | null;
    colorHex: string | null;
    eventCount: number;
}

interface EventSchedule {
    scheduleDate: string;
    startTime: string;
    endTime: string;
}

interface EventVenue {
    id: string;
    name: string;
    city: string;
    province: string;
}

interface EventCategory {
    id: string;
    name: string;
    slug: string;
    colorHex: string | null;
}

interface EventOrganizer {
    id: string;
    name: string;
    slug: string | null;
    logo: string | null;
}

interface PublicEvent {
    id: string;
    slug: string;
    title: string;
    shortDescription: string | null;
    posterImage: string | null;
    eventType: "OFFLINE" | "ONLINE" | "HYBRID";
    isFeatured: boolean;
    category: EventCategory | null;
    venue: EventVenue | null;
    organizer: EventOrganizer;
    schedule: EventSchedule | null;
    startingPrice: number | null;
    viewCount: number;
}

interface ReviewHighlight {
    id: string;
    rating: number;
    reviewText: string | null;
    user: {
        name: string;
        avatarUrl: string | null;
    };
    event: {
        title: string;
        slug: string;
    };
}

const CATEGORY_ICONS: Record<string, React.ReactNode> = {
    all: <TrendingUp size={18} />,
    music: <Music size={18} />,
    business: <Briefcase size={18} />,
    food: <Coffee size={18} />,
    tech: <Monitor size={18} />,
    art: <Sparkles size={18} />,
    sport: <Zap size={18} />,
};

function formatEventDate(schedule: EventSchedule | null): string {
    if (!schedule) return "Segera";

    return new Date(schedule.scheduleDate).toLocaleDateString("id-ID", {
        weekday: "short",
        day: "numeric",
        month: "short",
        year: "numeric",
    });
}

function formatEventTime(schedule: EventSchedule | null): string {
    if (!schedule) return "";

    return `${new Date(schedule.startTime).toLocaleTimeString("id-ID", {
        hour: "2-digit",
        minute: "2-digit",
    })} WIB`;
}

function formatLocation(event: PublicEvent): string {
    if (event.eventType === "ONLINE") return "Online (Virtual)";
    if (event.venue) return `${event.venue.name}, ${event.venue.city}`;
    return "Lokasi akan diumumkan";
}

function formatPrice(price: number | null): string {
    if (!price || price <= 0) return "Gratis";

    return new Intl.NumberFormat("id-ID", {
        style: "currency",
        currency: "IDR",
        maximumFractionDigits: 0,
    }).format(price);
}

export default function HomePage() {
    const [categories, setCategories] = useState<Category[]>([]);
    const [events, setEvents] = useState<PublicEvent[]>([]);
    const [onlineEvents, setOnlineEvents] = useState<PublicEvent[]>([]);
    const [topEvents, setTopEvents] = useState<PublicEvent[]>([]);
    const [reviewHighlights, setReviewHighlights] = useState<ReviewHighlight[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [selectedCategory, setSelectedCategory] = useState("all");

    useEffect(() => {
        const loadData = async () => {
            try {
                setIsLoading(true);

                const [categoriesRes, eventsRes, onlineRes, topEventsRes, reviewHighlightsRes] = await Promise.all([
                    fetch("/api/categories"),
                    fetch("/api/events?limit=8&status=PUBLISHED"),
                    fetch("/api/events?limit=4&status=PUBLISHED&eventType=ONLINE"),
                    fetch("/api/home/top-events"),
                    fetch("/api/home/review-highlights"),
                ]);

                const [categoriesData, eventsData, onlineData, topEventsData, reviewHighlightsData] = await Promise.all([
                    categoriesRes.json(),
                    eventsRes.json(),
                    onlineRes.json(),
                    topEventsRes.json(),
                    reviewHighlightsRes.json(),
                ]);

                if (categoriesData.success) setCategories(categoriesData.data);
                if (eventsData.success) setEvents(eventsData.data);
                if (onlineData.success) setOnlineEvents(onlineData.data);
                if (topEventsData.success) setTopEvents(topEventsData.data);
                if (reviewHighlightsData.success) setReviewHighlights(reviewHighlightsData.data);
            } catch {
                console.error("Data load failed");
            } finally {
                setIsLoading(false);
            }
        };

        loadData();
    }, []);

    const featuredEvents = useMemo(() => events.filter((event) => event.isFeatured).slice(0, 3), [events]);

    const filteredEvents = useMemo(
        () => selectedCategory === "all"
            ? events
            : events.filter((event) => event.category?.slug === selectedCategory),
        [events, selectedCategory],
    );

    const displayCategories = useMemo(
        () => [{ id: "all", name: "Semua", slug: "all", icon: null, colorHex: null, eventCount: events.length }, ...categories],
        [categories, events.length],
    );

    return (
        <PublicPageShell
            hero={
                <MarketingHero
                    eyebrow="Gelaran editorial selection"
                    title={<>Temukan event yang terasa <em className="text-(--accent-secondary) not-italic">terkurasi</em>, bukan sekadar terdaftar.</>}
                    description={
                        <p>
                            Gelaran menghadirkan pengalaman penemuan event yang lebih terang, terarah, dan kaya konteks—
                            dari pertunjukan budaya hingga kelas kreatif, semua dirangkum dalam bahasa visual editorial yang konsisten.
                        </p>
                    }
                    primaryCta={{ href: "/events", label: "Jelajahi event" }}
                    secondaryCta={{ href: "/become-organizer", label: "Jadi organizer" }}
                    stats={[
                        { label: "Kategori aktif", value: `${categories.length || 0}+`, tone: "accent" },
                        { label: "Event tayang", value: `${events.length || 0}`, tone: "default" },
                        { label: "Review unggulan", value: `${reviewHighlights.length || 0}`, tone: "warning" },
                    ]}
                    aside={
                        <EditorialPanel className="max-w-xl space-y-5">
                            <div className="space-y-3">
                                <p className="text-xs font-semibold uppercase tracking-[0.24em] text-(--text-muted)">
                                    Pilihan pekan ini
                                </p>
                                {featuredEvents.length > 0 ? (
                                    <div className="space-y-4">
                                        {featuredEvents.slice(0, 2).map((event, index) => (
                                            <Link
                                                key={event.id}
                                                href={`/events/${event.slug}`}
                                                className="group flex items-center gap-4 rounded-2xl border border-(--border) bg-(--surface) px-4 py-4 transition-transform duration-200 hover:-translate-y-0.5"
                                            >
                                                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-(--surface-brand-soft) text-sm font-semibold text-(--accent-primary)">
                                                    0{index + 1}
                                                </div>
                                                <div className="min-w-0 flex-1">
                                                    <p className="truncate text-sm font-semibold text-foreground">
                                                        {event.title}
                                                    </p>
                                                    <p className="truncate text-sm text-(--text-secondary)">
                                                        {formatLocation(event)}
                                                    </p>
                                                </div>
                                                <ArrowRight className="h-4 w-4 text-(--accent-secondary) transition-transform duration-200 group-hover:translate-x-1" />
                                            </Link>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="rounded-2xl border border-dashed border-(--border) bg-(--surface) px-5 py-8 text-center text-sm text-(--text-secondary)">
                                        Highlight event akan muncul setelah data publik dimuat.
                                    </div>
                                )}
                            </div>
                            <div className="rounded-2xl bg-(--surface-brand-soft) px-5 py-4 text-sm leading-7 text-(--text-secondary)">
                                Gunakan filter kategori di bawah untuk berpindah dari event populer, agenda online, hingga rekomendasi komunitas tanpa kehilangan konteks brand Gelaran.
                            </div>
                        </EditorialPanel>
                    }
                />
            }
        >
            <PublicSection
                eyebrow="Browse by interest"
                title="Pilih ritme event yang ingin kamu ikuti"
                description="Kategori utama dirancang seperti rak editorial—mudah dipindai, ringan di mobile, dan langsung mengarahkan ke kumpulan event yang relevan."
                className="pt-0"
            >
                <EditorialPanel className="p-4 sm:p-5">
                    <div className="flex gap-3 overflow-x-auto pb-1 no-scrollbar">
                        {displayCategories.map((category) => (
                            <CategoryPill
                                key={category.id}
                                icon={CATEGORY_ICONS[category.slug] || <TrendingUp size={18} />}
                                name={category.name}
                                isActive={selectedCategory === category.slug}
                                onClick={() => setSelectedCategory(category.slug)}
                            />
                        ))}
                    </div>
                </EditorialPanel>
            </PublicSection>

            <PublicSection
                eyebrow="Popular now"
                title="Event populer pilihan Gelaran"
                description="Koleksi utama ini memadukan event yang banyak dicari dengan presentasi kartu yang lebih konsisten, lapang, dan nyaman di berbagai ukuran layar."
                action={
                    <Link
                        href="/events"
                        className="inline-flex min-h-11 items-center justify-center gap-2 rounded-full border border-(--border) bg-(--surface) px-5 py-2.5 text-sm font-semibold text-foreground transition-colors duration-200 hover:border-(--border-strong) hover:bg-(--surface-hover)"
                    >
                        Lihat semua event
                        <ArrowRight className="h-4 w-4" />
                    </Link>
                }
                className="pt-0"
            >
                {isLoading ? (
                    <div className="flex items-center justify-center py-24">
                        <Loader2 className="h-10 w-10 animate-spin text-(--accent-primary)" />
                    </div>
                ) : filteredEvents.length === 0 ? (
                    <EmptyState
                        icon={Calendar}
                        title="Belum ada event untuk kategori ini"
                        description="Coba kembali ke semua kategori untuk melihat kurasi event publik Gelaran yang sedang tayang."
                        action={
                            <button
                                type="button"
                                onClick={() => setSelectedCategory("all")}
                                className="inline-flex min-h-11 items-center justify-center rounded-full bg-(--accent-primary) px-5 py-2.5 text-sm font-semibold text-white transition-colors duration-200 hover:bg-(--accent-primary-hover)"
                            >
                                Lihat semua event
                            </button>
                        }
                    />
                ) : (
                    <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
                        {filteredEvents.map((event) => (
                            <EventCard
                                key={event.id}
                                id={event.id}
                                slug={event.slug}
                                title={event.title}
                                date={formatEventDate(event.schedule)}
                                time={formatEventTime(event.schedule)}
                                location={formatLocation(event)}
                                price={event.startingPrice ?? 0}
                                image={event.posterImage || "https://images.unsplash.com/photo-1501281668745-f7f57925c3b4?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80"}
                                category={event.category?.slug || "General"}
                                organizer={event.organizer.name}
                                rating={4.8}
                                reviewCount={124}
                            />
                        ))}
                    </div>
                )}
            </PublicSection>

            {featuredEvents.length > 0 ? (
                <PublicSection
                    eyebrow="Featured stories"
                    title="Sorotan editorial untuk pengalaman yang lebih immersif"
                    description="Banner utama diubah menjadi modul editorial bergaya majalah untuk memberi penekanan lebih kuat pada event unggulan tanpa memecah ritme halaman."
                    className="pt-0"
                >
                    <div className="grid gap-5 lg:grid-cols-3">
                        {featuredEvents.map((event) => (
                            <Link
                                key={`featured-${event.id}`}
                                href={`/events/${event.slug}`}
                                className="group relative overflow-hidden rounded-[calc(var(--radius-3xl)+0.25rem)] border border-(--border) bg-(--surface) shadow-(--shadow-sm)"
                            >
                                <img
                                    src={event.posterImage || "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?ixlib=rb-4.0.3&auto=format&fit=crop&w=1400&q=80"}
                                    alt={event.title}
                                    className="h-72 w-full object-cover transition-transform duration-500 group-hover:scale-105"
                                />
                                <div className="absolute inset-0 bg-linear-to-t from-[rgba(6,18,18,0.86)] via-[rgba(6,18,18,0.24)] to-transparent" />
                                <div className="absolute inset-x-0 bottom-0 space-y-3 p-6 text-white">
                                    <span className="inline-flex items-center gap-2 rounded-full bg-white/16 px-3 py-1 text-[0.7rem] font-semibold uppercase tracking-[0.24em] backdrop-blur-md">
                                        <Flame className="h-3.5 w-3.5" />
                                        Featured event
                                    </span>
                                    <div className="space-y-1">
                                        <h3 className="font-(--font-editorial) text-2xl leading-tight tracking-(--tracking-heading)">
                                            {event.title}
                                        </h3>
                                        <p className="text-sm text-white/82">{formatLocation(event)}</p>
                                        <p className="text-sm text-white/72">
                                            {formatEventDate(event.schedule)} · {formatPrice(event.startingPrice)}
                                        </p>
                                    </div>
                                </div>
                            </Link>
                        ))}
                    </div>
                </PublicSection>
            ) : null}

            {topEvents.length > 0 ? (
                <PublicSection
                    eyebrow="Most visited"
                    title="Top events dengan momentum tertinggi"
                    description="Ranking mingguan diberi treatment lebih rapi agar mudah dibandingkan, terutama pada tablet dan desktop."
                    action={
                        <Link
                            href="/events?sort=viewCount-desc"
                            className="inline-flex min-h-11 items-center justify-center gap-2 rounded-full border border-(--border) bg-(--surface) px-5 py-2.5 text-sm font-semibold text-foreground transition-colors duration-200 hover:border-(--border-strong) hover:bg-(--surface-hover)"
                        >
                            Lihat ranking
                            <ArrowRight className="h-4 w-4" />
                        </Link>
                    }
                    className="pt-0"
                >
                    <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
                        {topEvents.map((event, index) => (
                            <div key={`top-${event.id}`} className="relative">
                                <span className="absolute left-4 top-4 z-10 inline-flex h-10 w-10 items-center justify-center rounded-full bg-(--accent-primary) text-sm font-semibold text-white shadow-(--shadow-sm)">
                                    #{index + 1}
                                </span>
                                <EventCard
                                    id={event.id}
                                    slug={event.slug}
                                    title={event.title}
                                    date={formatEventDate(event.schedule)}
                                    time={formatEventTime(event.schedule)}
                                    location={formatLocation(event)}
                                    price={event.startingPrice ?? 0}
                                    image={event.posterImage || "https://images.unsplash.com/photo-1501281668745-f7f57925c3b4?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80"}
                                    category={event.category?.slug || "General"}
                                    organizer={event.organizer.name}
                                    rating={4.9}
                                    reviewCount={event.viewCount}
                                />
                            </div>
                        ))}
                    </div>
                </PublicSection>
            ) : null}

            {onlineEvents.length > 0 ? (
                <PublicSection
                    eyebrow="Remote-friendly"
                    title="Agenda online untuk audiens yang lebih luas"
                    description="Section online event tetap dipertahankan, namun sekarang mengikuti grid dan CTA yang sama dengan section publik lainnya."
                    action={
                        <Link
                            href="/events?eventType=ONLINE"
                            className="inline-flex min-h-11 items-center justify-center gap-2 rounded-full border border-(--border) bg-(--surface) px-5 py-2.5 text-sm font-semibold text-foreground transition-colors duration-200 hover:border-(--border-strong) hover:bg-(--surface-hover)"
                        >
                            Lihat event online
                            <ArrowRight className="h-4 w-4" />
                        </Link>
                    }
                    className="pt-0"
                >
                    <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
                        {onlineEvents.map((event) => (
                            <EventCard
                                key={`online-${event.id}`}
                                id={event.id}
                                slug={event.slug}
                                title={event.title}
                                date={formatEventDate(event.schedule)}
                                time={formatEventTime(event.schedule)}
                                location={formatLocation(event)}
                                price={event.startingPrice ?? 0}
                                image={event.posterImage || "https://images.unsplash.com/photo-1611162617474-5b21e879e113?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80"}
                                category={event.category?.slug || "Online"}
                                organizer={event.organizer.name}
                                rating={4.9}
                                reviewCount={86}
                            />
                        ))}
                    </div>
                </PublicSection>
            ) : null}

            {reviewHighlights.length > 0 ? (
                <PublicSection
                    eyebrow="Social proof"
                    title="Ulasan yang memperkuat kepercayaan pengunjung"
                    description="Testimoni publik ditampilkan dalam kartu ringan yang menjaga tone editorial sekaligus tetap mudah dipindai."
                    className="pt-0"
                >
                    <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
                        {reviewHighlights.slice(0, 6).map((review) => (
                            <EditorialPanel key={review.id} className="h-full space-y-4 p-6">
                                <div className="flex items-center gap-1 text-(--warning)">
                                    {Array.from({ length: 5 }).map((_, index) => (
                                        <Star
                                            key={`${review.id}-${index}`}
                                            size={14}
                                            fill={index < review.rating ? "currentColor" : "none"}
                                        />
                                    ))}
                                </div>
                                <p className="text-sm leading-7 text-(--text-secondary) sm:text-base">
                                    “{review.reviewText || "Pengalaman event yang berkesan dan tertata rapi dari awal hingga hari-H."}”
                                </p>
                                <div className="border-t border-(--border) pt-4">
                                    <p className="text-sm font-semibold text-foreground">{review.user.name}</p>
                                    <Link
                                        href={`/events/${review.event.slug}`}
                                        className="inline-flex items-center gap-2 text-sm text-(--accent-primary) transition-colors duration-200 hover:text-(--accent-primary-hover)"
                                    >
                                        {review.event.title}
                                        <ArrowRight className="h-4 w-4" />
                                    </Link>
                                </div>
                            </EditorialPanel>
                        ))}
                    </div>
                </PublicSection>
            ) : null}
        </PublicPageShell>
    );
}
