"use client";

import { useState, useEffect } from "react";
import { TrendingUp, Music, Briefcase, Coffee, Monitor, ChevronRight, Loader2, Sparkles, Zap, Calendar } from "lucide-react";
import Link from "next/link";
import { Navbar } from "@/components/layouts/Navbar";
import { Footer } from "@/components/layouts/Footer";
import { Hero } from "@/components/features/home/Hero";
import { CategoryPill } from "@/components/features/home/CategoryPill";
import { EventCard } from "@/components/features/events/EventCard";
import { cn } from "@/lib/utils";

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

    const date = new Date(schedule.scheduleDate);
    const options: Intl.DateTimeFormatOptions = {
        weekday: "short",
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
                console.error("Data load failed");
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
        ...categories,
    ];

    return (
        <div className="font-sans text-gray-900 bg-gray-50/50 min-h-screen selection:bg-indigo-100 selection:text-indigo-900">
            <Navbar />
            <Hero />

            <main className="container mx-auto px-4 md:px-6 py-8 md:py-12">
                <div className="bg-white/80 backdrop-blur-xl rounded-2xl md:rounded-3xl shadow-lg shadow-gray-200/50 p-3 md:p-4 mb-8 md:mb-12 border border-gray-100">
                    <div className="flex overflow-x-auto pb-1 gap-2 md:gap-3 no-scrollbar">
                        {displayCategories.map((cat) => (
                            <CategoryPill
                                key={cat.id}
                                icon={CATEGORY_ICONS[cat.slug] || <TrendingUp size={18} />}
                                name={cat.name}
                                isActive={selectedCategory === cat.slug}
                                onClick={() => setSelectedCategory(cat.slug)}
                            />
                        ))}
                    </div>
                </div>

                <section className="mb-12 md:mb-16">
                    <div className="flex flex-col sm:flex-row sm:justify-between sm:items-end gap-3 mb-6 md:mb-8">
                        <div>
                            <h2 className="text-2xl md:text-3xl font-bold text-gray-900 tracking-tight mb-1">Event Populer</h2>
                            <p className="text-gray-500 text-sm">Jangan lewatkan event yang sedang trending.</p>
                        </div>
                        <Link href="/events" className="group text-indigo-600 text-sm font-bold flex items-center hover:text-indigo-700 transition-colors bg-indigo-50 px-4 py-2 rounded-full hover:bg-indigo-100 self-start sm:self-auto">
                            Lihat Semua 
                            <ChevronRight size={16} className="ml-1 transition-transform group-hover:translate-x-1" />
                        </Link>
                    </div>

                    {isLoading ? (
                        <div className="flex items-center justify-center py-24">
                            <Loader2 className="h-10 w-10 text-indigo-600 animate-spin" />
                        </div>
                    ) : filteredEvents.length === 0 ? (
                        <div className="text-center py-24 bg-white rounded-3xl border border-dashed border-gray-200">
                            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                <Calendar className="text-gray-400" size={32} />
                            </div>
                            <p className="text-gray-500 font-medium text-lg">Belum ada event tersedia untuk kategori ini.</p>
                            <button 
                                onClick={() => setSelectedCategory("all")}
                                className="mt-4 text-indigo-600 font-bold hover:underline"
                            >
                                Lihat semua event
                            </button>
                        </div>
                    ) : (
                        <div className="flex overflow-x-auto snap-x snap-mandatory gap-4 pb-4 -mx-4 px-4 md:grid md:grid-cols-2 md:gap-5 md:pb-0 md:mx-0 md:px-0 lg:grid-cols-4 no-scrollbar">
                            {filteredEvents.map((event) => (
                                <div key={event.id} className="snap-start shrink-0 w-[280px] sm:w-[300px] md:w-auto">
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
                                        rating={4.8}
                                        reviewCount={124}
                                    />
                                </div>
                            ))}
                        </div>
                    )}
                </section>

                <div className="w-full h-px bg-gradient-to-r from-transparent via-gray-200 to-transparent mb-12" />

                {onlineEvents.length > 0 && (
                    <section className="mb-8">
                        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-end gap-3 mb-6 md:mb-8">
                             <div>
                                <h2 className="text-2xl md:text-3xl font-bold text-gray-900 tracking-tight mb-1">Online Event</h2>
                                <p className="text-gray-500 text-sm">Ikuti event seru dari mana saja.</p>
                            </div>
                            <Link
                                href="/events?eventType=ONLINE"
                                className="group text-indigo-600 text-sm font-bold flex items-center hover:text-indigo-700 transition-colors bg-indigo-50 px-4 py-2 rounded-full hover:bg-indigo-100 self-start sm:self-auto"
                            >
                                Lihat Semua 
                                <ChevronRight size={16} className="ml-1 transition-transform group-hover:translate-x-1" />
                            </Link>
                        </div>

                        <div className="flex overflow-x-auto snap-x snap-mandatory gap-4 pb-4 -mx-4 px-4 md:grid md:grid-cols-2 md:gap-5 md:pb-0 md:mx-0 md:px-0 lg:grid-cols-4 no-scrollbar">
                            {onlineEvents.map((event) => (
                                <div key={event.id} className="snap-start shrink-0 w-[280px] sm:w-[300px] md:w-auto">
                                    <EventCard
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
                                </div>
                            ))}
                        </div>
                    </section>
                )}
            </main>

            <Footer />
        </div>
    );
}
