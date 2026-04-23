"use client";

import type { FormEvent } from "react";
import { Suspense, useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import {
    CalendarDays,
    Grid3X3,
    List,
    Loader2,
    MapPin,
    Search,
    SlidersHorizontal,
    Sparkles,
    Ticket,
    X,
} from "lucide-react";
import { Navbar } from "@/components/layouts/Navbar";
import { EventCard } from "@/components/features/events/EventCard";
import {
    DiscoveryBadge,
    DiscoveryContainer,
    DiscoveryPageShell,
    DiscoveryPanel,
    DiscoverySection,
    DiscoveryStat,
} from "@/components/features/events/discovery-primitives";
import { cn, formatCurrency } from "@/lib/utils";

interface Category {
    id: string;
    name: string;
    slug: string;
    colorHex: string | null;
}

interface Venue {
    id: string;
    name: string;
    city: string;
    province: string;
}

interface Schedule {
    scheduleDate: string;
    startTime: string;
}

interface EventItem {
    id: string;
    slug: string;
    title: string;
    shortDescription: string | null;
    posterImage: string | null;
    eventType: string;
    isFeatured: boolean;
    category: Category | null;
    venue: Venue | null;
    organizer: {
        id: string;
        name: string;
        slug: string | null;
        logo: string | null;
    };
    schedule: Schedule | null;
    startingPrice: number | null;
    viewCount: number;
}

interface Pagination {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
}

const SORT_OPTIONS = [
    { value: "createdAt-desc", label: "Terbaru" },
    { value: "createdAt-asc", label: "Terlama" },
    { value: "title-asc", label: "Nama A-Z" },
    { value: "title-desc", label: "Nama Z-A" },
    { value: "viewCount-desc", label: "Terpopuler" },
];

const EVENT_TYPES = [
    { value: "", label: "Semua tipe" },
    { value: "OFFLINE", label: "Offline" },
    { value: "ONLINE", label: "Online" },
    { value: "HYBRID", label: "Hybrid" },
];

const DATE_FILTERS = [
    { value: "", label: "Semua waktu" },
    { value: "THIS_WEEK", label: "Minggu ini" },
    { value: "THIS_MONTH", label: "Bulan ini" },
];

const PRICE_TYPES = [
    { value: "", label: "Gratis & berbayar" },
    { value: "FREE", label: "Gratis" },
    { value: "PAID", label: "Berbayar" },
];

const focusRingClass = "focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[rgba(41,179,182,0.22)] focus-visible:ring-offset-2 focus-visible:ring-offset-white";
const categoryChipBaseClass = `inline-flex min-h-11 items-center justify-center rounded-full border px-6 py-2.5 text-sm font-semibold transition-all duration-200 ${focusRingClass}`;
const filterRailButtonBaseClass = `flex w-full items-center gap-3 rounded-2xl px-4 py-3 text-left text-sm font-semibold transition-all duration-200 ${focusRingClass}`;

function getCategoryChipClassName(active: boolean) {
    return cn(
        categoryChipBaseClass,
        active
            ? "border-[#fbc117]/80 bg-[#fbc117] text-[#342400] shadow-[0_20px_35px_-24px_rgba(251,193,23,0.95)]"
            : "border-[rgba(1,89,89,0.08)] bg-white/92 text-[#015959] shadow-[0_18px_34px_-28px_rgba(0,32,32,0.45)] hover:-translate-y-0.5 hover:bg-[#dff7f6]",
    );
}

function getFilterRailButtonClassName(active: boolean) {
    return cn(
        filterRailButtonBaseClass,
        active
            ? "bg-[#015959] text-white shadow-[0_20px_40px_-28px_rgba(1,89,89,0.7)]"
            : "text-[#015959] hover:bg-white/55",
    );
}

function formatDate(dateStr: string): string {
    return new Date(dateStr).toLocaleDateString("id-ID", {
        day: "numeric",
        month: "short",
        year: "numeric",
    });
}

function formatTime(dateStr?: string): string {
    if (!dateStr) return "Waktu diumumkan nanti";

    return new Date(dateStr).toLocaleTimeString("id-ID", {
        hour: "2-digit",
        minute: "2-digit",
    }) + " WIB";
}

function buildActiveChips(filters: {
    search: string;
    category: string;
    city: string;
    eventType: string;
    dateFilter: string;
    priceType: string;
}, categories: Category[]) {
    return [
        filters.search
            ? { key: "search", label: filters.search }
            : null,
        filters.category
            ? {
                key: "category",
                label: categories.find((category) => category.slug === filters.category)?.name || filters.category,
            }
            : null,
        filters.city
            ? { key: "city", label: filters.city }
            : null,
        filters.eventType
            ? { key: "eventType", label: EVENT_TYPES.find((type) => type.value === filters.eventType)?.label || filters.eventType }
            : null,
        filters.dateFilter
            ? { key: "dateFilter", label: DATE_FILTERS.find((filter) => filter.value === filters.dateFilter)?.label || filters.dateFilter }
            : null,
        filters.priceType
            ? { key: "priceType", label: PRICE_TYPES.find((type) => type.value === filters.priceType)?.label || filters.priceType }
            : null,
    ].filter(Boolean) as Array<{ key: string; label: string }>;
}

function EventsContent() {
    const router = useRouter();
    const searchParams = useSearchParams();

    const [events, setEvents] = useState<EventItem[]>([]);
    const [categories, setCategories] = useState<Category[]>([]);
    const [pagination, setPagination] = useState<Pagination | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
    const [showFilters, setShowFilters] = useState(false);

    const [filters, setFilters] = useState({
        search: searchParams.get("search") || "",
        category: searchParams.get("category") || "",
        city: searchParams.get("city") || "",
        eventType: searchParams.get("eventType") || "",
        dateFilter: searchParams.get("dateFilter") || "",
        priceType: searchParams.get("priceType") || "",
        sort: searchParams.get("sort") || "createdAt-desc",
    });

    const [searchInput, setSearchInput] = useState(searchParams.get("search") || "");

    useEffect(() => {
        const nextFilters = {
            search: searchParams.get("search") || "",
            category: searchParams.get("category") || "",
            city: searchParams.get("city") || "",
            eventType: searchParams.get("eventType") || "",
            dateFilter: searchParams.get("dateFilter") || "",
            priceType: searchParams.get("priceType") || "",
            sort: searchParams.get("sort") || "createdAt-desc",
        };

        setFilters((currentFilters) => {
            const hasChanged = Object.entries(nextFilters).some(([key, value]) => currentFilters[key as keyof typeof currentFilters] !== value);
            return hasChanged ? nextFilters : currentFilters;
        });
        setSearchInput(nextFilters.search);
    }, [searchParams]);

    const fetchEvents = useCallback(async () => {
        try {
            setIsLoading(true);
            setErrorMessage(null);
            const params = new URLSearchParams();

            if (filters.search) params.set("search", filters.search);
            if (filters.category) params.set("category", filters.category);
            if (filters.city) params.set("city", filters.city);
            if (filters.eventType) params.set("eventType", filters.eventType);
            if (filters.dateFilter) params.set("dateFilter", filters.dateFilter);
            if (filters.priceType) params.set("priceType", filters.priceType);

            const [sortBy, sortOrder] = filters.sort.split("-");
            params.set("sortBy", sortBy);
            params.set("sortOrder", sortOrder);
            params.set("page", searchParams.get("page") || "1");
            params.set("limit", "12");

            const response = await fetch(`/api/events?${params.toString()}`);

            if (!response.ok) {
                throw new Error(`Events request failed with status ${response.status}`);
            }

            const data = await response.json();

            if (data.success) {
                setEvents(data.data);
                setPagination(data.meta);
                return;
            }

            throw new Error(data.message || "Events response was not successful");
        } catch (error) {
            console.error("Failed to fetch events:", error);
            setEvents([]);
            setPagination(null);
            setErrorMessage("Event belum bisa dimuat. Coba ulang beberapa saat lagi.");
        } finally {
            setIsLoading(false);
        }
    }, [filters, searchParams]);

    const fetchCategories = useCallback(async () => {
        try {
            const response = await fetch("/api/categories");

            if (!response.ok) {
                throw new Error(`Categories request failed with status ${response.status}`);
            }

            const data = await response.json();
            if (data.success) {
                setCategories(data.data);
                return;
            }

            throw new Error(data.message || "Categories response was not successful");
        } catch (error) {
            console.error("Failed to fetch categories:", error);
        }
    }, []);

    useEffect(() => {
        fetchEvents();
    }, [fetchEvents]);

    useEffect(() => {
        fetchCategories();
    }, [fetchCategories]);

    const updateURL = (newFilters: typeof filters) => {
        const params = new URLSearchParams();

        if (newFilters.search) params.set("search", newFilters.search);
        if (newFilters.category) params.set("category", newFilters.category);
        if (newFilters.city) params.set("city", newFilters.city);
        if (newFilters.eventType) params.set("eventType", newFilters.eventType);
        if (newFilters.dateFilter) params.set("dateFilter", newFilters.dateFilter);
        if (newFilters.priceType) params.set("priceType", newFilters.priceType);
        if (newFilters.sort !== "createdAt-desc") params.set("sort", newFilters.sort);

        router.push(`/events${params.toString() ? `?${params.toString()}` : ""}`);
    };

    const handleSearch = (event: FormEvent) => {
        event.preventDefault();
        const newFilters = { ...filters, search: searchInput };
        setFilters(newFilters);
        updateURL(newFilters);
    };

    const handleFilterChange = (key: string, value: string) => {
        const newFilters = { ...filters, [key]: value };
        setFilters(newFilters);
        updateURL(newFilters);
    };

    const clearFilters = () => {
        const nextFilters = {
            search: "",
            category: "",
            city: "",
            eventType: "",
            dateFilter: "",
            priceType: "",
            sort: "createdAt-desc",
        };

        setFilters(nextFilters);
        setSearchInput("");
        router.push("/events");
    };

    const activeChips = useMemo(() => buildActiveChips(filters, categories), [filters, categories]);
    const featuredEvents = useMemo(() => events.filter((event) => event.isFeatured).slice(0, 3), [events]);
    const cityCount = useMemo(() => new Set(events.map((event) => event.venue?.city).filter(Boolean)).size, [events]);
    const lowestPrice = useMemo(() => {
        const paidPrices = events
            .map((event) => event.startingPrice)
            .filter((value): value is number => value !== null && value > 0);

        if (!paidPrices.length) return null;
        return Math.min(...paidPrices);
    }, [events]);

    const heroCategories = useMemo(() => {
        if (!filters.category) {
            return categories.slice(0, 5);
        }

        const selectedCategory = categories.find((category) => category.slug === filters.category);
        const leadingCategories = categories.slice(0, 5);

        if (!selectedCategory || leadingCategories.some((category) => category.slug === selectedCategory.slug)) {
            return leadingCategories;
        }

        return [...leadingCategories.slice(0, 4), selectedCategory];
    }, [categories, filters.category]);

    const hasActiveFilters = activeChips.length > 0;

    return (
        <DiscoveryPageShell>
            <Navbar transparent={false} />

            <section className="px-4 pb-10 pt-24 sm:px-6 sm:pb-12 sm:pt-28 lg:px-8 lg:pb-16">
                <div className="mx-auto max-w-7xl text-center">
                    <div className="inline-flex items-center gap-2 rounded-full border border-[rgba(1,89,89,0.12)] bg-white/88 px-4 py-1.5 text-[0.7rem] font-semibold uppercase tracking-[0.26em] text-[#015959] shadow-[0_14px_30px_-24px_rgba(0,32,32,0.55)] backdrop-blur-sm">
                        <Sparkles className="h-3.5 w-3.5 text-[#f95d00]" />
                        Event discovery
                    </div>

                    <h1 className="mx-auto mt-6 max-w-5xl font-(--font-editorial) text-4xl leading-[0.94] tracking-[-0.05em] text-[#015959] sm:text-5xl lg:text-7xl">
                        Explore Solo&apos;s <br className="hidden sm:block" />
                        <span className="italic text-[#f95d00]">Cultural Pulse</span>
                    </h1>

                    <p className="mx-auto mt-5 max-w-3xl text-sm leading-7 text-[#015959]/72 sm:text-base">
                        Temukan konser, workshop, pertunjukan tradisi, dan agenda komunitas dengan ritme editorial
                        yang lebih dekat ke Stitch tanpa mengubah alur pencarian, filter, dan navigasi publik yang ada.
                    </p>

                    <div className="mt-8 flex flex-wrap justify-center gap-3">
                        <button
                            type="button"
                            onClick={() => handleFilterChange("category", "")}
                            className={getCategoryChipClassName(!filters.category)}
                        >
                            Semua event
                        </button>
                        {heroCategories.map((category) => (
                            <button
                                key={category.id}
                                type="button"
                                onClick={() => handleFilterChange("category", category.slug)}
                                className={getCategoryChipClassName(filters.category === category.slug)}
                            >
                                {category.name}
                            </button>
                        ))}
                    </div>

                    <DiscoveryPanel className="mx-auto mt-8 max-w-5xl p-5 sm:p-6">
                        <div className="grid gap-3 sm:grid-cols-3">
                            <DiscoveryStat label="Event tayang" value={pagination?.total ?? events.length} hint="Kurasi publik aktif" />
                            <DiscoveryStat label="Kota aktif" value={cityCount || "-"} hint="Persebaran agenda" />
                            <DiscoveryStat
                                label="Harga awal"
                                value={lowestPrice ? formatCurrency(lowestPrice) : "Gratis"}
                                hint="Mulai dari penawaran termurah"
                            />
                        </div>
                    </DiscoveryPanel>
                </div>
            </section>

            <DiscoveryContainer className="pb-16 sm:pb-20">
                <div className="mt-4 grid gap-8 lg:grid-cols-[18rem_minmax(0,1fr)] lg:items-start xl:gap-10">
                    <aside className={cn("space-y-5", showFilters ? "block" : "hidden lg:block")}>
                        <div className="overflow-hidden rounded-[1.9rem] border border-[rgba(1,89,89,0.08)] bg-[linear-gradient(180deg,rgba(181,250,249,0.95),rgba(214,252,251,0.88))] p-5 shadow-[0_24px_60px_-40px_rgba(0,32,32,0.38)] lg:sticky lg:top-28">
                            <div className="flex items-start justify-between gap-4">
                                <div>
                                    <h2 className="font-(--font-editorial) text-2xl font-bold tracking-(--tracking-heading) text-[#015959]">Filters</h2>
                                    <p className="mt-1 text-[0.72rem] font-semibold uppercase tracking-[0.22em] text-[#015959]/55">Refine your culture</p>
                                </div>
                                <button
                                    type="button"
                                    onClick={clearFilters}
                                    className={cn(
                                        "text-xs font-bold uppercase tracking-[0.18em] text-[#1d7d7e] transition-colors hover:text-[#f95d00]",
                                        focusRingClass,
                                    )}
                                >
                                    Clear all
                                </button>
                            </div>

                            <div className="mt-6 space-y-2">
                                <button
                                    type="button"
                                    onClick={() => handleFilterChange("category", "")}
                                    className={getFilterRailButtonClassName(!filters.category)}
                                >
                                    <Ticket className="h-4 w-4" />
                                    Semua event
                                </button>

                                {categories.map((category) => (
                                    <button
                                        key={category.id}
                                        type="button"
                                        onClick={() => handleFilterChange("category", category.slug)}
                                        className={getFilterRailButtonClassName(filters.category === category.slug)}
                                    >
                                        <Sparkles className="h-4 w-4" />
                                        <span className="truncate">{category.name}</span>
                                    </button>
                                ))}
                            </div>

                            <div className="mt-8 border-t border-[rgba(1,89,89,0.1)] pt-6">
                                <h3 className="text-sm font-bold text-[#015959]">Refine details</h3>
                                <div className="mt-4 grid gap-4">
                                    <label className="space-y-2 text-sm text-[#015959]/76">
                                        <span className="font-semibold text-[#015959]">Kota</span>
                                        <input
                                            type="text"
                                            value={filters.city}
                                            onChange={(event) => handleFilterChange("city", event.target.value)}
                                            placeholder="Jakarta, Bandung, Surabaya"
                                            className={cn(
                                                "h-12 w-full rounded-2xl border border-[rgba(1,89,89,0.12)] bg-white/92 px-4 text-sm text-foreground transition-all duration-200 placeholder:text-[#015959]/42 focus:border-(--border-focus)",
                                                focusRingClass,
                                            )}
                                        />
                                    </label>

                                    <label className="space-y-2 text-sm text-[#015959]/76">
                                        <span className="font-semibold text-[#015959]">Tipe event</span>
                                        <select
                                            value={filters.eventType}
                                            onChange={(event) => handleFilterChange("eventType", event.target.value)}
                                            className={cn(
                                                "h-12 w-full rounded-2xl border border-[rgba(1,89,89,0.12)] bg-white/92 px-4 text-sm text-foreground transition-all duration-200 focus:border-(--border-focus)",
                                                focusRingClass,
                                            )}
                                        >
                                            {EVENT_TYPES.map((option) => (
                                                <option key={option.value} value={option.value}>
                                                    {option.label}
                                                </option>
                                            ))}
                                        </select>
                                    </label>

                                    <label className="space-y-2 text-sm text-[#015959]/76">
                                        <span className="font-semibold text-[#015959]">Periode</span>
                                        <select
                                            value={filters.dateFilter}
                                            onChange={(event) => handleFilterChange("dateFilter", event.target.value)}
                                            className={cn(
                                                "h-12 w-full rounded-2xl border border-[rgba(1,89,89,0.12)] bg-white/92 px-4 text-sm text-foreground transition-all duration-200 focus:border-(--border-focus)",
                                                focusRingClass,
                                            )}
                                        >
                                            {DATE_FILTERS.map((option) => (
                                                <option key={option.value} value={option.value}>
                                                    {option.label}
                                                </option>
                                            ))}
                                        </select>
                                    </label>

                                    <label className="space-y-2 text-sm text-[#015959]/76">
                                        <span className="font-semibold text-[#015959]">Harga</span>
                                        <select
                                            value={filters.priceType}
                                            onChange={(event) => handleFilterChange("priceType", event.target.value)}
                                            className={cn(
                                                "h-12 w-full rounded-2xl border border-[rgba(1,89,89,0.12)] bg-white/92 px-4 text-sm text-foreground transition-all duration-200 focus:border-(--border-focus)",
                                                focusRingClass,
                                            )}
                                        >
                                            {PRICE_TYPES.map((option) => (
                                                <option key={option.value} value={option.value}>
                                                    {option.label}
                                                </option>
                                            ))}
                                        </select>
                                    </label>
                                </div>
                            </div>
                        </div>
                    </aside>

                    <div className="space-y-6">
                        <div className="rounded-[1.6rem] border border-[rgba(1,89,89,0.08)] bg-white/92 px-4 py-4 shadow-[0_22px_48px_-36px_rgba(0,32,32,0.42)] sm:px-5">
                            <form onSubmit={handleSearch} className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-center">
                                <div className="relative">
                                    <label htmlFor="events-search" className="sr-only">
                                        Cari event, venue, atau organizer
                                    </label>
                                    <Search className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-[#015959]/45" />
                                    <input
                                        id="events-search"
                                        type="text"
                                        value={searchInput}
                                        onChange={(event) => setSearchInput(event.target.value)}
                                        placeholder="Cari event, venue, atau organizer"
                                        className={cn(
                                            "h-13 w-full rounded-full border border-[rgba(1,89,89,0.12)] bg-[#f7fbfb] pl-12 pr-4 text-sm text-foreground transition-all duration-200 placeholder:text-[#015959]/42 focus:border-(--border-focus)",
                                            focusRingClass,
                                        )}
                                    />
                                </div>

                                <div className="flex flex-wrap gap-3">
                                    <button
                                        type="submit"
                                        className={cn(
                                            "inline-flex min-h-12 items-center justify-center rounded-full bg-[#f95d00] px-6 py-3 text-sm font-semibold text-white transition-colors duration-200 hover:bg-[#d95000]",
                                            focusRingClass,
                                        )}
                                    >
                                        Cari event
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setShowFilters((previous) => !previous)}
                                        className={cn(
                                            "inline-flex min-h-12 items-center justify-center gap-2 rounded-full border px-5 py-3 text-sm font-semibold transition-colors duration-200 lg:hidden",
                                            showFilters || hasActiveFilters
                                                ? "border-[#015959] bg-[#ddf8f7] text-[#015959]"
                                                : "border-[rgba(1,89,89,0.12)] bg-white text-foreground hover:bg-(--surface-hover)",
                                            focusRingClass,
                                        )}
                                    >
                                        <SlidersHorizontal className="h-4 w-4" />
                                        Filter
                                        {hasActiveFilters ? (
                                            <span className="inline-flex h-6 min-w-6 items-center justify-center rounded-full bg-[#015959] px-1.5 text-[0.72rem] text-white">
                                                {activeChips.length}
                                            </span>
                                        ) : null}
                                    </button>
                                </div>
                            </form>
                        </div>

                        <div className="rounded-[1.6rem] border border-[rgba(1,89,89,0.08)] bg-white/92 px-4 py-4 shadow-[0_22px_48px_-36px_rgba(0,32,32,0.42)] sm:px-5">
                            <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
                                <div className="flex flex-wrap items-center gap-3">
                                    <DiscoveryBadge tone="accent">
                                        <Ticket className="h-3.5 w-3.5" />
                                        {pagination?.total ?? events.length} event ditemukan
                                    </DiscoveryBadge>
                                    {featuredEvents.length > 0 ? (
                                        <DiscoveryBadge tone="warm">
                                            <Sparkles className="h-3.5 w-3.5" />
                                            {featuredEvents.length} pilihan unggulan
                                        </DiscoveryBadge>
                                    ) : null}
                                    {hasActiveFilters ? (
                                        <button
                                            type="button"
                                            onClick={clearFilters}
                                            className={cn(
                                                "inline-flex items-center gap-2 rounded-full border border-[rgba(1,89,89,0.12)] bg-white px-4 py-2 text-sm font-semibold text-(--text-secondary) transition-colors duration-200 hover:border-(--border-strong) hover:text-foreground",
                                                focusRingClass,
                                            )}
                                        >
                                            <X className="h-4 w-4" />
                                            Reset semua filter
                                        </button>
                                    ) : null}
                                </div>

                                <div className="flex flex-wrap items-center gap-3">
                                    <label className="flex items-center gap-3 rounded-full border border-[rgba(1,89,89,0.12)] bg-[#f7fbfb] px-4 py-2.5 text-sm text-[#015959]/76">
                                        <span className="font-medium">Urutkan</span>
                                        <select
                                            value={filters.sort}
                                            onChange={(event) => handleFilterChange("sort", event.target.value)}
                                            className={cn("bg-transparent font-semibold text-foreground", focusRingClass)}
                                        >
                                            {SORT_OPTIONS.map((option) => (
                                                <option key={option.value} value={option.value}>
                                                    {option.label}
                                                </option>
                                            ))}
                                        </select>
                                    </label>

                                    <div className="inline-flex overflow-hidden rounded-full border border-[rgba(1,89,89,0.12)] bg-white">
                                        <button
                                            type="button"
                                            onClick={() => setViewMode("grid")}
                                            className={cn(
                                                "inline-flex h-11 w-11 items-center justify-center transition-colors duration-200",
                                                viewMode === "grid" ? "bg-[#015959] text-white" : "text-(--text-secondary) hover:bg-(--surface-hover)",
                                                focusRingClass,
                                            )}
                                            aria-label="Tampilan grid"
                                        >
                                            <Grid3X3 className="h-4 w-4" />
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => setViewMode("list")}
                                            className={cn(
                                                "inline-flex h-11 w-11 items-center justify-center transition-colors duration-200",
                                                viewMode === "list" ? "bg-[#015959] text-white" : "text-(--text-secondary) hover:bg-(--surface-hover)",
                                                focusRingClass,
                                            )}
                                            aria-label="Tampilan list"
                                        >
                                            <List className="h-4 w-4" />
                                        </button>
                                    </div>
                                </div>
                            </div>

                            {activeChips.length > 0 ? (
                                <div className="mt-4 flex flex-wrap gap-2">
                                    {activeChips.map((chip) => (
                                        <button
                                            key={chip.key}
                                            type="button"
                                            onClick={() => {
                                                handleFilterChange(chip.key, "");
                                                if (chip.key === "search") {
                                                    setSearchInput("");
                                                }
                                            }}
                                            className={cn(
                                                "inline-flex items-center gap-2 rounded-full border border-[rgba(1,89,89,0.12)] bg-white px-3 py-2 text-sm text-(--text-secondary) transition-colors duration-200 hover:border-(--border-strong) hover:text-foreground",
                                                focusRingClass,
                                            )}
                                        >
                                            {chip.key === "city" ? <MapPin className="h-3.5 w-3.5" /> : null}
                                            {chip.key === "dateFilter" ? <CalendarDays className="h-3.5 w-3.5" /> : null}
                                            {chip.label}
                                            <X className="h-3.5 w-3.5" />
                                        </button>
                                    ))}
                                </div>
                            ) : null}
                        </div>

                        {featuredEvents.length > 0 ? (
                            <DiscoverySection
                                title="Sorotan minggu ini"
                                description="Event unggulan ditempatkan dalam strip editorial agar rekomendasi terasa lebih terarah sebelum pengunjung masuk ke keseluruhan listing."
                            >
                                <div className="grid gap-5 lg:grid-cols-3">
                                    {featuredEvents.map((event) => (
                                        <Link
                                            key={event.id}
                                            href={`/events/${event.slug}`}
                                            className="group relative overflow-hidden rounded-[1.7rem] border border-[rgba(1,89,89,0.08)] bg-(--surface) shadow-[0_26px_60px_-40px_rgba(0,32,32,0.52)]"
                                        >
                                            <img
                                                src={event.posterImage || "/placeholder.jpg"}
                                                alt={event.title}
                                                className="h-72 w-full object-cover transition-transform duration-500 group-hover:scale-105"
                                            />
                                            <div className="absolute inset-0 bg-linear-to-t from-[rgba(6,18,18,0.82)] via-[rgba(6,18,18,0.18)] to-transparent" />
                                            <div className="absolute left-4 top-4">
                                                <DiscoveryBadge tone="warm">Featured selection</DiscoveryBadge>
                                            </div>
                                            <div className="absolute inset-x-0 bottom-0 space-y-3 p-6 text-white">
                                                <div className="space-y-1.5">
                                                    <h2 className="font-(--font-editorial) text-2xl leading-tight tracking-(--tracking-heading)">{event.title}</h2>
                                                    <p className="text-sm text-white/82">
                                                        {event.venue ? `${event.venue.city}, ${event.venue.province}` : "Lokasi diumumkan nanti"}
                                                    </p>
                                                    <p className="text-sm text-white/72">
                                                        {event.schedule ? formatDate(event.schedule.scheduleDate) : "Tanggal diumumkan"}
                                                        {event.startingPrice !== null ? ` · ${event.startingPrice === 0 ? "Gratis" : formatCurrency(event.startingPrice)}` : ""}
                                                    </p>
                                                </div>
                                            </div>
                                        </Link>
                                    ))}
                                </div>
                            </DiscoverySection>
                        ) : null}

                        <DiscoverySection
                            title="Semua event"
                            description="Listing utama sekarang memakai filter, toolbar, dan ritme visual yang lebih dekat ke Stitch tanpa mengubah perilaku route publik yang sudah ada."
                        >
                            {isLoading ? (
                                <DiscoveryPanel className="flex min-h-72 items-center justify-center p-8">
                                    <div className="text-center">
                                        <Loader2 className="mx-auto h-9 w-9 animate-spin text-(--accent-primary)" />
                                        <p className="mt-4 text-sm text-(--text-secondary)">Memuat kurasi event terbaru...</p>
                                    </div>
                                </DiscoveryPanel>
                            ) : errorMessage ? (
                                <DiscoveryPanel className="p-10 text-center sm:p-14">
                                    <X className="mx-auto h-12 w-12 text-[#f95d00]" />
                                    <h3 className="mt-5 text-2xl font-semibold tracking-(--tracking-heading) text-foreground">
                                        Gagal memuat event
                                    </h3>
                                    <p className="mx-auto mt-3 max-w-xl text-sm leading-7 text-(--text-secondary) sm:text-base">
                                        {errorMessage}
                                    </p>
                                    <button
                                        type="button"
                                        onClick={() => void fetchEvents()}
                                        className={cn(
                                            "mt-6 inline-flex min-h-12 items-center justify-center rounded-full bg-(--accent-primary) px-6 py-3 text-sm font-semibold text-white transition-colors duration-200 hover:bg-(--accent-primary-hover)",
                                            focusRingClass,
                                        )}
                                    >
                                        Coba lagi
                                    </button>
                                </DiscoveryPanel>
                            ) : events.length === 0 ? (
                                <DiscoveryPanel className="p-10 text-center sm:p-14">
                                    <Search className="mx-auto h-12 w-12 text-(--text-muted)" />
                                    <h3 className="mt-5 text-2xl font-semibold tracking-(--tracking-heading) text-foreground">
                                        Tidak ada event yang cocok
                                    </h3>
                                    <p className="mx-auto mt-3 max-w-xl text-sm leading-7 text-(--text-secondary) sm:text-base">
                                        Coba ganti kata kunci, ubah kota, atau buka kembali filter untuk menemukan agenda yang lebih relevan.
                                    </p>
                                    {hasActiveFilters ? (
                                        <button
                                            type="button"
                                            onClick={clearFilters}
                                            className={cn(
                                                "mt-6 inline-flex min-h-12 items-center justify-center rounded-full bg-(--accent-primary) px-6 py-3 text-sm font-semibold text-white transition-colors duration-200 hover:bg-(--accent-primary-hover)",
                                                focusRingClass,
                                            )}
                                        >
                                            Hapus semua filter
                                        </button>
                                    ) : null}
                                </DiscoveryPanel>
                            ) : (
                                <>
                                    <p className="mb-4 text-sm text-(--text-secondary)">
                                        Menampilkan {events.length} dari {pagination?.total || 0} event publik yang sedang tayang.
                                    </p>

                                    <div
                                        className={cn(
                                            viewMode === "grid"
                                                ? "grid gap-5 md:grid-cols-2 xl:grid-cols-3"
                                                : "space-y-4",
                                        )}
                                    >
                                        {events.map((event) => {
                                            const categoryLabel = event.category?.name || "General";
                                            const locationLabel = event.venue
                                                ? `${event.venue.city}, ${event.venue.province}`
                                                : event.eventType === "ONLINE"
                                                    ? "Online event"
                                                    : "Lokasi diumumkan nanti";

                                            return (
                                                <div
                                                    key={event.id}
                                                    className={cn(
                                                        viewMode === "list"
                                                            ? "rounded-[1.6rem] border border-[rgba(1,89,89,0.08)] bg-white/92 p-2 shadow-[0_20px_48px_-36px_rgba(0,32,32,0.36)]"
                                                            : undefined,
                                                    )}
                                                >
                                                    <EventCard
                                                        id={event.id}
                                                        slug={event.slug}
                                                        title={event.title}
                                                        date={event.schedule ? formatDate(event.schedule.scheduleDate) : "Tanggal diumumkan"}
                                                        time={event.schedule ? formatTime(event.schedule.startTime) : "Waktu diumumkan nanti"}
                                                        location={locationLabel}
                                                        price={event.startingPrice ?? 0}
                                                        image={event.posterImage || "/placeholder.jpg"}
                                                        category={categoryLabel}
                                                        organizer={event.organizer.name}
                                                        rating={Math.min(5, Math.max(4, event.viewCount > 0 ? 4 + event.viewCount / 1000 : 4.6))}
                                                        reviewCount={event.viewCount}
                                                        featuredLabel={event.isFeatured ? "Pilihan editor" : null}
                                                        className={
                                                            viewMode === "list"
                                                                ? "rounded-[1.2rem] border-transparent bg-transparent shadow-none hover:translate-y-0 hover:shadow-none md:flex-row md:[&>div:first-child]:h-auto md:[&>div:first-child]:w-72 md:[&>div:last-child]:p-6"
                                                                : "rounded-[1.6rem] border-[rgba(1,89,89,0.08)] bg-white/92 shadow-[0_22px_48px_-36px_rgba(0,32,32,0.42)] hover:-translate-y-1.5 hover:shadow-[0_28px_58px_-34px_rgba(0,32,32,0.5)]"
                                                        }
                                                        metaTone={event.isFeatured ? "warm" : event.eventType === "ONLINE" ? "default" : "accent"}
                                                    />
                                                </div>
                                            );
                                        })}
                                    </div>

                                    {pagination && pagination.totalPages > 1 ? (
                                        <div className="mt-8 flex flex-wrap justify-center gap-2">
                                            {Array.from({ length: pagination.totalPages }, (_unused, index) => index + 1).map((page) => (
                                                <Link
                                                    key={page}
                                                    href={`/events?${new URLSearchParams({
                                                        ...Object.fromEntries(Object.entries(filters).filter(([, value]) => value)),
                                                        page: page.toString(),
                                                    }).toString()}`}
                                                    className={cn(
                                                        "inline-flex h-11 min-w-11 items-center justify-center rounded-full border px-4 text-sm font-semibold transition-colors duration-200",
                                                        pagination.page === page
                                                            ? "border-(--accent-primary) bg-(--accent-primary) text-white"
                                                            : "border-(--border) bg-white text-foreground hover:border-(--border-strong) hover:bg-(--surface-hover)",
                                                        focusRingClass,
                                                    )}
                                                >
                                                    {page}
                                                </Link>
                                            ))}
                                        </div>
                                    ) : null}
                                </>
                            )}
                        </DiscoverySection>
                    </div>
                </div>
            </DiscoveryContainer>
        </DiscoveryPageShell>
    );
}

export default function EventsPage() {
    return (
        <Suspense
            fallback={
                <div className="flex min-h-[60vh] items-center justify-center">
                    <Loader2 className="h-8 w-8 animate-spin text-(--accent-primary)" />
                </div>
            }
        >
            <EventsContent />
        </Suspense>
    );
}
