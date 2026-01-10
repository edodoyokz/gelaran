"use client";

import { useState, useEffect } from "react";
import { TrendingUp, Music, Briefcase, Coffee, Monitor, ChevronRight, Loader2 } from "lucide-react";
import Link from "next/link";
import { Navbar } from "@/components/layouts/Navbar";
import { Footer } from "@/components/layouts/Footer";
import { Hero } from "@/components/features/home/Hero";
import { CategoryPill } from "@/components/features/home/CategoryPill";
import { EventCard } from "@/components/features/events/EventCard";

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

const CATEGORY_ICONS: Record<string, React.ReactNode> = {
    all: <TrendingUp size={16} />,
    music: <Music size={16} />,
    business: <Briefcase size={16} />,
    food: <Coffee size={16} />,
    tech: <Monitor size={16} />,
};

function formatEventDate(schedule: EventSchedule | null): string {
    if (!schedule) return "Segera";

    const date = new Date(schedule.scheduleDate);
    const options: Intl.DateTimeFormatOptions = {
        weekday: "long",
        day: "numeric",
        month: "short",
        year: "numeric",
    };

    return date.toLocaleDateString("id-ID", options);
}

function formatEventTime(schedule: EventSchedule | null): string {
    if (!schedule) return "";
    return `${schedule.startTime} WIB`;
}

function formatLocation(event: PublicEvent): string {
    if (event.eventType === "ONLINE") {
        return "Online (Virtual)";
    }
    if (event.venue) {
        return `${event.venue.name}, ${event.venue.city}`;
    }
    return "Lokasi akan diumumkan";
}

export default function HomePage() {
    const [categories, setCategories] = useState<Category[]>([]);
    const [events, setEvents] = useState<PublicEvent[]>([]);
    const [onlineEvents, setOnlineEvents] = useState<PublicEvent[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [selectedCategory, setSelectedCategory] = useState("all");

    useEffect(() => {
        const loadData = async () => {
            try {
                setIsLoading(true);

                const [categoriesRes, eventsRes, onlineRes] = await Promise.all([
                    fetch("/api/categories"),
                    fetch("/api/events?limit=8&status=PUBLISHED"),
                    fetch("/api/events?limit=4&status=PUBLISHED&eventType=ONLINE"),
                ]);

                const [categoriesData, eventsData, onlineData] = await Promise.all([
                    categoriesRes.json(),
                    eventsRes.json(),
                    onlineRes.json(),
                ]);

                if (categoriesData.success) {
                    setCategories(categoriesData.data);
                }
                if (eventsData.success) {
                    setEvents(eventsData.data);
                }
                if (onlineData.success) {
                    setOnlineEvents(onlineData.data);
                }
            } catch (error) {
                console.error("Failed to load homepage data:", error);
            } finally {
                setIsLoading(false);
            }
        };

        loadData();
    }, []);

    const filteredEvents =
        selectedCategory === "all"
            ? events
            : events.filter((e) => e.category?.slug === selectedCategory);

    const displayCategories = [
        { id: "all", name: "Semua", slug: "all", icon: null, colorHex: null, eventCount: events.length },
        ...categories.slice(0, 4),
    ];

    return (
        <div className="font-sans text-gray-900 bg-white min-h-screen">
            <Navbar />
            <Hero />

            <main className="container mx-auto px-4 py-8">
                <div className="flex overflow-x-auto pb-4 space-x-3 mb-8 no-scrollbar">
                    {displayCategories.map((cat) => (
                        <CategoryPill
                            key={cat.id}
                            icon={CATEGORY_ICONS[cat.slug] || <TrendingUp size={16} />}
                            name={cat.name}
                            isActive={selectedCategory === cat.slug}
                            onClick={() => setSelectedCategory(cat.slug)}
                        />
                    ))}
                </div>

                <div className="flex justify-between items-end mb-6">
                    <h2 className="text-2xl font-bold text-gray-900">Event Populer</h2>
                    <Link href="/events" className="text-indigo-600 text-sm font-semibold flex items-center hover:underline">
                        Lihat Semua <ChevronRight size={16} />
                    </Link>
                </div>

                {isLoading ? (
                    <div className="flex items-center justify-center py-12">
                        <Loader2 className="h-8 w-8 text-indigo-600 animate-spin" />
                    </div>
                ) : filteredEvents.length === 0 ? (
                    <div className="text-center py-12 text-gray-500">
                        <p>Belum ada event tersedia untuk kategori ini.</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
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
                                image={event.posterImage || "/placeholder-event.jpg"}
                                category={event.category?.slug || "other"}
                                organizer={event.organizer.name}
                                rating={4}
                                reviewCount={0}
                            />
                        ))}
                    </div>
                )}

                {onlineEvents.length > 0 && (
                    <>
                        <div className="flex justify-between items-end mb-6">
                            <h2 className="text-2xl font-bold text-gray-900">Online Event</h2>
                            <Link
                                href="/events?eventType=ONLINE"
                                className="text-indigo-600 text-sm font-semibold flex items-center hover:underline"
                            >
                                Lihat Semua <ChevronRight size={16} />
                            </Link>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
                            {onlineEvents.map((event) => (
                                <EventCard
                                    key={event.id}
                                    id={event.id}
                                    slug={event.slug}
                                    title={event.title}
                                    date={formatEventDate(event.schedule)}
                                    time={formatEventTime(event.schedule)}
                                    location={formatLocation(event)}
                                    price={event.startingPrice ?? 0}
                                    image={event.posterImage || "/placeholder-event.jpg"}
                                    category={event.category?.slug || "other"}
                                    organizer={event.organizer.name}
                                    rating={4}
                                    reviewCount={0}
                                />
                            ))}
                        </div>
                    </>
                )}
            </main>

            <Footer />
        </div>
    );
}
