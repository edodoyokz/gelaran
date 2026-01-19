"use client";

import { useState, useEffect, useCallback, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import {
    Search,
    Filter,
    MapPin,
    Calendar,
    Loader2,
    Grid,
    List,
    ChevronDown,
    X,
    Tag,
    SlidersHorizontal,
} from "lucide-react";
import { Navbar } from "@/components/layouts/Navbar";


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
    { value: "", label: "Semua Tipe" },
    { value: "OFFLINE", label: "Offline" },
    { value: "ONLINE", label: "Online" },
    { value: "HYBRID", label: "Hybrid" },
];

function EventsContent() {
    const router = useRouter();
    const searchParams = useSearchParams();

    const [events, setEvents] = useState<EventItem[]>([]);
    const [categories, setCategories] = useState<Category[]>([]);
    const [pagination, setPagination] = useState<Pagination | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
    const [showFilters, setShowFilters] = useState(false);

    const [filters, setFilters] = useState({
        search: searchParams.get("search") || "",
        category: searchParams.get("category") || "",
        city: searchParams.get("city") || "",
        eventType: searchParams.get("eventType") || "",
        sort: searchParams.get("sort") || "createdAt-desc",
    });

    const [searchInput, setSearchInput] = useState(filters.search);

    const fetchEvents = useCallback(async () => {
        try {
            setIsLoading(true);
            const params = new URLSearchParams();

            if (filters.search) params.set("search", filters.search);
            if (filters.category) params.set("category", filters.category);
            if (filters.city) params.set("city", filters.city);
            if (filters.eventType) params.set("eventType", filters.eventType);

            const [sortBy, sortOrder] = filters.sort.split("-");
            params.set("sortBy", sortBy);
            params.set("sortOrder", sortOrder);
            params.set("page", searchParams.get("page") || "1");
            params.set("limit", "12");

            const res = await fetch(`/api/events?${params.toString()}`);
            const data = await res.json();

            if (data.success) {
                setEvents(data.data);
                setPagination(data.meta);
            }
        } catch (error) {
            console.error("Failed to fetch events:", error);
        } finally {
            setIsLoading(false);
        }
    }, [filters, searchParams]);

    const fetchCategories = useCallback(async () => {
        try {
            const res = await fetch("/api/categories");
            const data = await res.json();
            if (data.success) {
                setCategories(data.data);
            }
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
        if (newFilters.sort !== "createdAt-desc") params.set("sort", newFilters.sort);

        router.push(`/events?${params.toString()}`);
    };

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
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
        const newFilters = {
            search: "",
            category: "",
            city: "",
            eventType: "",
            sort: "createdAt-desc",
        };
        setFilters(newFilters);
        setSearchInput("");
        router.push("/events");
    };

    const hasActiveFilters = filters.search || filters.category || filters.city || filters.eventType;

    const formatDate = (dateStr: string): string => {
        return new Date(dateStr).toLocaleDateString("id-ID", {
            day: "numeric",
            month: "short",
            year: "numeric",
        });
    };

    const formatCurrency = (amount: number): string => {
        return new Intl.NumberFormat("id-ID", {
            style: "currency",
            currency: "IDR",
            minimumFractionDigits: 0,
        }).format(amount);
    };

    return (
        <div className="min-h-screen bg-gray-50">
            <Navbar transparent={false} />

            <div className="pt-20">
                <div className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-12">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <h1 className="text-3xl font-bold mb-4">Jelajahi Event</h1>
                        <p className="text-white/80 mb-6">
                            Temukan event menarik di sekitarmu
                        </p>

                        <form onSubmit={handleSearch} className="flex gap-2">
                            <div className="relative flex-1 max-w-2xl">
                                <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                                <input
                                    type="text"
                                    value={searchInput}
                                    onChange={(e) => setSearchInput(e.target.value)}
                                    placeholder="Cari konser, seminar, workshop..."
                                    className="w-full pl-12 pr-4 py-3 rounded-lg bg-white text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-white/50"
                                />
                            </div>
                            <button
                                type="submit"
                                className="px-6 py-3 bg-white text-indigo-600 rounded-lg font-medium hover:bg-gray-100 transition-colors"
                            >
                                Cari
                            </button>
                        </form>
                    </div>
                </div>

                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                    <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
                        <div className="flex items-center gap-2">
                            <button
                                type="button"
                                onClick={() => setShowFilters(!showFilters)}
                                className={`flex items-center gap-2 px-4 py-2 rounded-lg border transition-colors ${
                                    showFilters || hasActiveFilters
                                        ? "bg-indigo-50 border-indigo-300 text-indigo-600"
                                        : "bg-white border-gray-300 text-gray-700 hover:bg-gray-50"
                                }`}
                            >
                                <SlidersHorizontal className="h-4 w-4" />
                                Filter
                                {hasActiveFilters && (
                                    <span className="px-1.5 py-0.5 bg-indigo-600 text-white text-xs rounded-full">
                                        {[filters.search, filters.category, filters.city, filters.eventType].filter(Boolean).length}
                                    </span>
                                )}
                            </button>

                            {hasActiveFilters && (
                                <button
                                    type="button"
                                    onClick={clearFilters}
                                    className="flex items-center gap-1 px-3 py-2 text-gray-500 hover:text-gray-700"
                                >
                                    <X className="h-4 w-4" />
                                    Hapus filter
                                </button>
                            )}
                        </div>

                        <div className="flex items-center gap-4">
                            <div className="flex items-center gap-2">
                                <span className="text-sm text-gray-500">Urutkan:</span>
                                <select
                                    value={filters.sort}
                                    onChange={(e) => handleFilterChange("sort", e.target.value)}
                                    className="px-3 py-2 border rounded-lg bg-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                >
                                    {SORT_OPTIONS.map((opt) => (
                                        <option key={opt.value} value={opt.value}>
                                            {opt.label}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div className="hidden sm:flex items-center border rounded-lg overflow-hidden">
                                <button
                                    type="button"
                                    onClick={() => setViewMode("grid")}
                                    className={`p-2 ${viewMode === "grid" ? "bg-indigo-50 text-indigo-600" : "bg-white text-gray-500"}`}
                                >
                                    <Grid className="h-5 w-5" />
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setViewMode("list")}
                                    className={`p-2 ${viewMode === "list" ? "bg-indigo-50 text-indigo-600" : "bg-white text-gray-500"}`}
                                >
                                    <List className="h-5 w-5" />
                                </button>
                            </div>
                        </div>
                    </div>

                    {showFilters && (
                        <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
                            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                                <div>
                                    <label htmlFor="filter-category" className="block text-sm font-medium text-gray-700 mb-1">
                                        Kategori
                                    </label>
                                    <select
                                        id="filter-category"
                                        value={filters.category}
                                        onChange={(e) => handleFilterChange("category", e.target.value)}
                                        className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                    >
                                        <option value="">Semua Kategori</option>
                                        {categories.map((cat) => (
                                            <option key={cat.id} value={cat.slug}>
                                                {cat.name}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div>
                                    <label htmlFor="filter-city" className="block text-sm font-medium text-gray-700 mb-1">
                                        Kota
                                    </label>
                                    <input
                                        id="filter-city"
                                        type="text"
                                        value={filters.city}
                                        onChange={(e) => handleFilterChange("city", e.target.value)}
                                        placeholder="Masukkan kota"
                                        className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                    />
                                </div>

                                <div>
                                    <label htmlFor="filter-type" className="block text-sm font-medium text-gray-700 mb-1">
                                        Tipe Event
                                    </label>
                                    <select
                                        id="filter-type"
                                        value={filters.eventType}
                                        onChange={(e) => handleFilterChange("eventType", e.target.value)}
                                        className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                    >
                                        {EVENT_TYPES.map((type) => (
                                            <option key={type.value} value={type.value}>
                                                {type.label}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            </div>
                        </div>
                    )}

                    {hasActiveFilters && (
                        <div className="flex flex-wrap gap-2 mb-6">
                            {filters.search && (
                                <span className="inline-flex items-center gap-1 px-3 py-1 bg-indigo-100 text-indigo-700 rounded-full text-sm">
                                    <Search className="h-3 w-3" />
                                    {filters.search}
                                    <button
                                        type="button"
                                        onClick={() => {
                                            handleFilterChange("search", "");
                                            setSearchInput("");
                                        }}
                                        className="ml-1 hover:text-indigo-900"
                                    >
                                        <X className="h-3 w-3" />
                                    </button>
                                </span>
                            )}
                            {filters.category && (
                                <span className="inline-flex items-center gap-1 px-3 py-1 bg-indigo-100 text-indigo-700 rounded-full text-sm">
                                    <Tag className="h-3 w-3" />
                                    {categories.find((c) => c.slug === filters.category)?.name || filters.category}
                                    <button
                                        type="button"
                                        onClick={() => handleFilterChange("category", "")}
                                        className="ml-1 hover:text-indigo-900"
                                    >
                                        <X className="h-3 w-3" />
                                    </button>
                                </span>
                            )}
                            {filters.city && (
                                <span className="inline-flex items-center gap-1 px-3 py-1 bg-indigo-100 text-indigo-700 rounded-full text-sm">
                                    <MapPin className="h-3 w-3" />
                                    {filters.city}
                                    <button
                                        type="button"
                                        onClick={() => handleFilterChange("city", "")}
                                        className="ml-1 hover:text-indigo-900"
                                    >
                                        <X className="h-3 w-3" />
                                    </button>
                                </span>
                            )}
                            {filters.eventType && (
                                <span className="inline-flex items-center gap-1 px-3 py-1 bg-indigo-100 text-indigo-700 rounded-full text-sm">
                                    <Filter className="h-3 w-3" />
                                    {EVENT_TYPES.find((t) => t.value === filters.eventType)?.label}
                                    <button
                                        type="button"
                                        onClick={() => handleFilterChange("eventType", "")}
                                        className="ml-1 hover:text-indigo-900"
                                    >
                                        <X className="h-3 w-3" />
                                    </button>
                                </span>
                            )}
                        </div>
                    )}

                    {isLoading ? (
                        <div className="flex items-center justify-center py-20">
                            <Loader2 className="h-8 w-8 text-indigo-600 animate-spin" />
                        </div>
                    ) : events.length === 0 ? (
                        <div className="bg-white rounded-xl shadow-sm p-12 text-center">
                            <Search className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                            <h3 className="text-lg font-medium text-gray-900 mb-2">
                                Tidak ada event ditemukan
                            </h3>
                            <p className="text-gray-500 mb-6">
                                Coba ubah filter atau kata kunci pencarian Anda
                            </p>
                            {hasActiveFilters && (
                                <button
                                    type="button"
                                    onClick={clearFilters}
                                    className="px-6 py-2 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 transition-colors"
                                >
                                    Hapus semua filter
                                </button>
                            )}
                        </div>
                    ) : (
                        <>
                            <p className="text-sm text-gray-500 mb-4">
                                Menampilkan {events.length} dari {pagination?.total || 0} event
                            </p>

                            <div
                                className={
                                    viewMode === "grid"
                                        ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
                                        : "space-y-4"
                                }
                            >
                                {events.map((event) => (
                                    <Link
                                        key={event.id}
                                        href={`/events/${event.slug}`}
                                        className={`bg-white rounded-xl shadow-sm overflow-hidden hover:shadow-md transition-shadow group ${
                                            viewMode === "list" ? "flex" : ""
                                        }`}
                                    >
                                        <div
                                            className={`relative ${
                                                viewMode === "list" ? "w-48 flex-shrink-0" : "aspect-[4/3]"
                                            }`}
                                        >
                                            <img
                                                src={event.posterImage || "/placeholder.jpg"}
                                                alt={event.title}
                                                className="w-full h-full object-cover"
                                            />
                                            {event.isFeatured && (
                                                <span className="absolute top-2 left-2 px-2 py-1 bg-yellow-400 text-yellow-900 text-xs font-medium rounded">
                                                    Featured
                                                </span>
                                            )}
                                        </div>

                                        <div className="p-4 flex-1">
                                            {event.category && (
                                                <span
                                                    className="inline-block px-2 py-0.5 rounded text-xs font-medium mb-2"
                                                    style={{
                                                        backgroundColor: `${event.category.colorHex}20`,
                                                        color: event.category.colorHex || "#6366f1",
                                                    }}
                                                >
                                                    {event.category.name}
                                                </span>
                                            )}

                                            <h3 className="font-bold text-gray-900 mb-2 line-clamp-2 group-hover:text-indigo-600 transition-colors">
                                                {event.title}
                                            </h3>

                                            {event.schedule && (
                                                <div className="flex items-center gap-1 text-sm text-gray-500 mb-1">
                                                    <Calendar className="h-4 w-4" />
                                                    {formatDate(event.schedule.scheduleDate)}
                                                </div>
                                            )}

                                            {event.venue && (
                                                <div className="flex items-center gap-1 text-sm text-gray-500 mb-3">
                                                    <MapPin className="h-4 w-4" />
                                                    {event.venue.city}
                                                </div>
                                            )}

                                            <div className="flex items-center justify-between">
                                                <div>
                                                    {event.startingPrice !== null && (
                                                        <p className="font-bold text-indigo-600">
                                                            {event.startingPrice === 0
                                                                ? "GRATIS"
                                                                : `Mulai ${formatCurrency(event.startingPrice)}`}
                                                        </p>
                                                    )}
                                                </div>
                                                <span className="text-xs text-gray-400 capitalize">
                                                    {event.eventType.toLowerCase()}
                                                </span>
                                            </div>
                                        </div>
                                    </Link>
                                ))}
                            </div>

                            {pagination && pagination.totalPages > 1 && (
                                <div className="flex justify-center gap-2 mt-8">
                                    {Array.from({ length: pagination.totalPages }, (_, i) => i + 1).map((page) => (
                                        <Link
                                            key={page}
                                            href={`/events?${new URLSearchParams({
                                                ...Object.fromEntries(
                                                    Object.entries(filters).filter(([_, v]) => v)
                                                ),
                                                page: page.toString(),
                                            }).toString()}`}
                                            className={`w-10 h-10 flex items-center justify-center rounded-lg font-medium ${
                                                pagination.page === page
                                                    ? "bg-indigo-600 text-white"
                                                    : "bg-white border hover:bg-gray-50"
                                            }`}
                                        >
                                            {page}
                                        </Link>
                                    ))}
                                </div>
                            )}
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}

export default function EventsPage() {
    return (
        <Suspense
            fallback={
                <div className="flex items-center justify-center min-h-[60vh]">
                    <Loader2 className="h-8 w-8 text-indigo-600 animate-spin" />
                </div>
            }
        >
            <EventsContent />
        </Suspense>
    );
}
