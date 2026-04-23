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
import { CategoryPill, Hero } from "@/components/features/home";
import { EventCard } from "@/components/features/events/EventCard";
import {
    EditorialPanel,
    PublicPageShell,
    PublicSection,
} from "@/components/shared/public-marketing";
import { EmptyState } from "@/components/shared/phase-two-shells";
import {
    formatLandingEventDate,
    formatLandingEventPrice,
    formatLandingEventTime,
} from "@/lib/home/landing-page";

const EVENT_GRID_ID = "home-event-results";

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

function formatLocation(event: PublicEvent): string {
    if (event.eventType === "ONLINE") return "Online (Virtual)";
    if (event.venue) return `${event.venue.name}, ${event.venue.city}`;
    return "Lokasi akan diumumkan";
}

function isSuccessfulResponse(response: Response): boolean {
    return response.ok;
}

async function parseSuccessfulJson<T>(response: Response): Promise<T | null> {
    if (!isSuccessfulResponse(response)) {
        return null;
    }

    try {
        return (await response.json()) as T;
    } catch {
        return null;
    }
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
        const abortController = new AbortController();

        const loadData = async () => {
            try {
                setIsLoading(true);

                const [categoriesRes, eventsRes, onlineRes, topEventsRes, reviewHighlightsRes] = await Promise.all([
                    fetch("/api/categories", { signal: abortController.signal }),
                    fetch("/api/events?limit=8&status=PUBLISHED", { signal: abortController.signal }),
                    fetch("/api/events?limit=4&status=PUBLISHED&eventType=ONLINE", { signal: abortController.signal }),
                    fetch("/api/home/top-events", { signal: abortController.signal }),
                    fetch("/api/home/review-highlights", { signal: abortController.signal }),
                ]);

                const [categoriesData, eventsData, onlineData, topEventsData, reviewHighlightsData] = await Promise.all([
                    parseSuccessfulJson<{ success?: boolean; data?: Category[] }>(categoriesRes),
                    parseSuccessfulJson<{ success?: boolean; data?: PublicEvent[] }>(eventsRes),
                    parseSuccessfulJson<{ success?: boolean; data?: PublicEvent[] }>(onlineRes),
                    parseSuccessfulJson<{ success?: boolean; data?: PublicEvent[] }>(topEventsRes),
                    parseSuccessfulJson<{ success?: boolean; data?: ReviewHighlight[] }>(reviewHighlightsRes),
                ]);

                if (abortController.signal.aborted) {
                    return;
                }

                setCategories(categoriesData?.success && categoriesData.data ? categoriesData.data : []);
                setEvents(eventsData?.success && eventsData.data ? eventsData.data : []);
                setOnlineEvents(onlineData?.success && onlineData.data ? onlineData.data : []);
                setTopEvents(topEventsData?.success && topEventsData.data ? topEventsData.data : []);
                setReviewHighlights(reviewHighlightsData?.success && reviewHighlightsData.data ? reviewHighlightsData.data : []);
            } catch (error) {
                if (abortController.signal.aborted) {
                    return;
                }

                setCategories([]);
                setEvents([]);
                setOnlineEvents([]);
                setTopEvents([]);
                setReviewHighlights([]);

                if (error instanceof Error && error.name === "AbortError") {
                    return;
                }

                console.error("Data load failed");
            } finally {
                if (!abortController.signal.aborted) {
                    setIsLoading(false);
                }
            }
        };

        loadData();

        return () => {
            abortController.abort();
        };
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

    const heroFeaturedEvent = featuredEvents[0] ?? events[0] ?? null;

    const heroSupportEvents = (featuredEvents.length > 1 ? featuredEvents.slice(1, 3) : events.slice(0, 2))
        .filter((event) => event.id !== heroFeaturedEvent?.id)
        .slice(0, 2)
        .map((event) => ({
            id: event.id,
            title: event.title,
            href: `/events/${event.slug}`,
            location: formatLocation(event),
        }));

    return (
        <PublicPageShell
            hero={
                <Hero
                    featuredEvent={heroFeaturedEvent ? {
                        title: heroFeaturedEvent.title,
                        href: `/events/${heroFeaturedEvent.slug}`,
                        location: formatLocation(heroFeaturedEvent),
                        date: formatLandingEventDate(heroFeaturedEvent.schedule),
                        price: formatLandingEventPrice(heroFeaturedEvent.startingPrice),
                        image: heroFeaturedEvent.posterImage || "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?ixlib=rb-4.0.3&auto=format&fit=crop&w=1400&q=80",
                        category: heroFeaturedEvent.category?.name || "Featured event",
                    } : null}
                    supportEvents={heroSupportEvents}
                    stats={[
                        { label: "Kategori aktif", value: `${categories.length || 0}+` },
                        { label: "Event tayang", value: `${events.length || 0}` },
                        { label: "Review unggulan", value: `${reviewHighlights.length || 0}` },
                    ]}
                />
            }
        >
            <PublicSection
                eyebrow="Browse by interest"
                title="Pilih kategori event yang sesuai minatmu"
                description="Temukan event berdasarkan kategori favorit—dari musik, bisnis, hingga teknologi. Semua tersusun rapi untuk memudahkan eksplorasimu."
                className="pt-0"
            >
                <EditorialPanel className="p-4 sm:p-5">
                    <fieldset className="min-w-0">
                        <legend className="sr-only">Filter kategori event</legend>
                        <div className="flex gap-3 overflow-x-auto pb-1 no-scrollbar">
                        {displayCategories.map((category) => (
                            <CategoryPill
                                key={category.id}
                                icon={CATEGORY_ICONS[category.slug] || <TrendingUp size={18} />}
                                name={category.name}
                                isActive={selectedCategory === category.slug}
                                controlsId={EVENT_GRID_ID}
                                onClick={() => setSelectedCategory(category.slug)}
                            />
                        ))}
                        </div>
                    </fieldset>
                </EditorialPanel>
            </PublicSection>

            <PublicSection
                eyebrow="Popular now"
                title="Event populer yang sedang trending"
                description="Jelajahi event yang paling banyak dicari dan dihadiri oleh komunitas Gelaran."
                action={
                    <Link
                        href="/events"
                        className="inline-flex min-h-11 items-center justify-center gap-2 rounded-full border border-(--border) bg-(--surface) px-5 py-2.5 text-sm font-semibold text-foreground transition-colors duration-200 hover:border-(--border-strong) hover:bg-(--surface-hover)"
                    >
                        Lihat semua event
                        <ArrowRight className="h-4 w-4" />
                    </Link>
                }
                className="pt-4 sm:pt-6"
            >
                {isLoading ? (
                    <div
                        aria-live="polite"
                        aria-busy="true"
                        className="flex flex-col items-center justify-center gap-3 py-24 text-center"
                    >
                        <Loader2 className="h-10 w-10 animate-spin text-(--accent-primary)" />
                        <p className="text-sm font-medium text-(--text-secondary)">
                            Memuat kurasi event publik Gelaran.
                        </p>
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
                    <div id={EVENT_GRID_ID} className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
                        {filteredEvents.map((event) => (
                            <EventCard
                                key={event.id}
                                id={event.id}
                                slug={event.slug}
                                title={event.title}
                                date={formatLandingEventDate(event.schedule)}
                                time={formatLandingEventTime(event.schedule)}
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
                    title="Event unggulan yang tidak boleh dilewatkan"
                    description="Kurasi khusus dari tim Gelaran untuk pengalaman event terbaik bulan ini."
                    className="pt-4 sm:pt-6"
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
                                            {formatLandingEventDate(event.schedule)} · {formatLandingEventPrice(event.startingPrice)}
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
                    title="Event dengan momentum tertinggi minggu ini"
                    description="Lihat event yang paling banyak dikunjungi dan diminati oleh pengguna Gelaran."
                    action={
                        <Link
                            href="/events?sort=viewCount-desc"
                            className="inline-flex min-h-11 items-center justify-center gap-2 rounded-full border border-(--border) bg-(--surface) px-5 py-2.5 text-sm font-semibold text-foreground transition-colors duration-200 hover:border-(--border-strong) hover:bg-(--surface-hover)"
                        >
                            Lihat ranking
                            <ArrowRight className="h-4 w-4" />
                        </Link>
                    }
                    className="pt-4 sm:pt-6"
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
                                    date={formatLandingEventDate(event.schedule)}
                                    time={formatLandingEventTime(event.schedule)}
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
                    title="Event online untuk audiens yang lebih luas"
                    description="Ikuti event dari mana saja dengan pilihan event virtual yang berkualitas."
                    action={
                        <Link
                            href="/events?eventType=ONLINE"
                            className="inline-flex min-h-11 items-center justify-center gap-2 rounded-full border border-(--border) bg-(--surface) px-5 py-2.5 text-sm font-semibold text-foreground transition-colors duration-200 hover:border-(--border-strong) hover:bg-(--surface-hover)"
                        >
                            Lihat event online
                            <ArrowRight className="h-4 w-4" />
                        </Link>
                    }
                    className="pt-4 sm:pt-6"
                >
                    <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
                        {onlineEvents.map((event) => (
                            <EventCard
                                key={`online-${event.id}`}
                                id={event.id}
                                slug={event.slug}
                                title={event.title}
                                date={formatLandingEventDate(event.schedule)}
                                time={formatLandingEventTime(event.schedule)}
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
                    title="Apa kata mereka yang sudah hadir"
                    description="Pengalaman nyata dari pengguna Gelaran yang telah menghadiri berbagai event."
                    className="pt-4 sm:pt-6"
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
