"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
    Search,
    Eye,
    CheckCircle,
    XCircle,
    Calendar,
    MapPin,
    Loader2,
    AlertCircle,
    Filter,
} from "lucide-react";
import { AdminHeader } from "@/components/admin/AdminHeader";
import { useToast } from "@/components/ui/toast-provider";

interface EventSchedule {
    scheduleDate: string;
    startTime: string;
    endTime: string;
}

interface EventVenue {
    name: string;
    city: string;
}

interface EventCategory {
    id: string;
    name: string;
}

interface EventOrganizer {
    id: string;
    name: string;
    organizerProfile: {
        organizationName: string | null;
    } | null;
}

interface EventRevenue {
    total: number;
    platform: number;
}

interface AdminEvent {
    id: string;
    slug: string;
    title: string;
    posterImage: string | null;
    status: "DRAFT" | "PENDING_REVIEW" | "PUBLISHED" | "CANCELLED" | "ENDED";
    createdAt: string;
    organizer: EventOrganizer;
    category: EventCategory | null;
    venue: EventVenue | null;
    schedules: EventSchedule[];
    revenue: EventRevenue;
    _count: {
        bookings: number;
    };
}

interface PaginationMeta {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
}

interface StatsData {
    total: number;
    draft: number;
    pending: number;
    published: number;
    cancelled: number;
    ended: number;
    totalRevenue: number;
    platformRevenue: number;
}

interface FilterOptions {
    categories: Array<{ id: string; name: string; count: number }>;
    cities: string[];
    organizers: Array<{ id: string; name: string; organizationName: string | null }>;
}

interface EventsResponse {
    events: AdminEvent[];
    pagination: PaginationMeta;
    stats: StatsData;
    filterOptions: FilterOptions;
}

const STATUS_COLORS: Record<string, string> = {
    DRAFT: "bg-gray-100 text-gray-700",
    PENDING_REVIEW: "bg-yellow-100 text-yellow-700",
    PUBLISHED: "bg-green-100 text-green-700",
    CANCELLED: "bg-red-100 text-red-700",
    ENDED: "bg-blue-100 text-blue-700",
};

export default function AdminEventsPage() {
    const router = useRouter();
    const { showToast } = useToast();
    
    const [events, setEvents] = useState<AdminEvent[]>([]);
    const [pagination, setPagination] = useState<PaginationMeta | null>(null);
    const [stats, setStats] = useState<StatsData>({
        total: 0,
        draft: 0,
        pending: 0,
        published: 0,
        cancelled: 0,
        ended: 0,
        totalRevenue: 0,
        platformRevenue: 0,
    });
    const [filterOptions, setFilterOptions] = useState<FilterOptions>({
        categories: [],
        cities: [],
        organizers: [],
    });
    
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    
    const [statusFilter, setStatusFilter] = useState<string>("");
    const [categoryFilter, setCategoryFilter] = useState<string>("");
    const [organizerFilter, setOrganizerFilter] = useState<string>("");
    const [search, setSearch] = useState("");
    const [dateFrom, setDateFrom] = useState<string>("");
    const [dateTo, setDateTo] = useState<string>("");
    const [scheduledFrom, setScheduledFrom] = useState<string>("");
    const [scheduledTo, setScheduledTo] = useState<string>("");
    const [cityFilter, setCityFilter] = useState<string>("");
    const [hasBookingsFilter, setHasBookingsFilter] = useState<string>("");
    
    const [sortBy, setSortBy] = useState<string>("createdAt");
    const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
    
    const [currentPage, setCurrentPage] = useState<number>(1);
    const [itemsPerPage, setItemsPerPage] = useState<number>(20);
    
    const [selectedEvents, setSelectedEvents] = useState<Set<string>>(new Set());
    const [isBulkActionLoading, setIsBulkActionLoading] = useState(false);
    
    const [showAnalytics, setShowAnalytics] = useState(false);
    
    const [actionLoading, setActionLoading] = useState<string | null>(null);
    const [showRejectModal, setShowRejectModal] = useState<string | null>(null);
    const [rejectionReason, setRejectionReason] = useState("");

    const fetchEvents = useCallback(async () => {
        try {
            setIsLoading(true);
            
            const params = new URLSearchParams();
            params.set('page', currentPage.toString());
            params.set('limit', itemsPerPage.toString());
            
            if (statusFilter) params.set('status', statusFilter);
            if (categoryFilter) params.set('category', categoryFilter);
            if (organizerFilter) params.set('organizer', organizerFilter);
            if (search) params.set('search', search);
            if (dateFrom) params.set('dateFrom', dateFrom);
            if (dateTo) params.set('dateTo', dateTo);
            if (scheduledFrom) params.set('scheduledFrom', scheduledFrom);
            if (scheduledTo) params.set('scheduledTo', scheduledTo);
            if (cityFilter) params.set('city', cityFilter);
            if (hasBookingsFilter) params.set('hasBookings', hasBookingsFilter);
            if (sortBy) params.set('sortBy', sortBy);
            if (sortOrder) params.set('sortOrder', sortOrder);
            
            const res = await fetch(`/api/admin/events?${params.toString()}`);
            const data = await res.json();

            if (!res.ok) {
                if (res.status === 401) {
                    router.push("/login?returnUrl=/admin/events");
                    return;
                }
                if (res.status === 403) {
                    router.push("/");
                    return;
                }
                setError(data.error?.message || "Failed to load events");
                return;
            }

            if (data.success) {
                setEvents(data.data.events);
                setPagination(data.data.pagination);
                setStats(data.data.stats);
                setFilterOptions(data.data.filterOptions);
            }
        } catch {
            setError("Failed to load events");
        } finally {
            setIsLoading(false);
        }
    }, [router, currentPage, itemsPerPage, statusFilter, categoryFilter, organizerFilter, search, dateFrom, dateTo, scheduledFrom, scheduledTo, cityFilter, hasBookingsFilter, sortBy, sortOrder]);

    useEffect(() => {
        fetchEvents();
    }, [fetchEvents]);

    const handleApprove = async (eventId: string) => {
        try {
            setActionLoading(eventId);
            const res = await fetch(`/api/admin/events/${eventId}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ status: "PUBLISHED" }),
            });

            const data = await res.json();

            if (!data.success) {
                showToast(data.error?.message || "Failed to approve event", "error");
                return;
            }

            await fetchEvents();
            showToast("Event approved successfully", "success");
        } catch {
            showToast("Failed to approve event", "error");
        } finally {
            setActionLoading(null);
        }
    };

    const handleReject = async () => {
        if (!showRejectModal) return;

        try {
            setActionLoading(showRejectModal);
            const res = await fetch(`/api/admin/events/${showRejectModal}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    status: "CANCELLED",
                    rejectionReason,
                }),
            });

            const data = await res.json();

            if (!data.success) {
                showToast(data.error?.message || "Failed to reject event", "error");
                return;
            }

            await fetchEvents();
            setShowRejectModal(null);
            setRejectionReason("");
            showToast("Event rejected successfully", "success");
        } catch {
            showToast("Failed to reject event", "error");
        } finally {
            setActionLoading(null);
        }
    };

    if (isLoading) {
        return (
            <div className="min-h-screen bg-gray-100 flex items-center justify-center">
                <div className="text-center">
                    <Loader2 className="h-12 w-12 text-indigo-600 animate-spin mx-auto mb-4" />
                    <p className="text-gray-500">Loading events...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen bg-gray-100 flex items-center justify-center">
                <div className="text-center">
                    <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
                    <p className="text-gray-900 font-medium mb-2">{error}</p>
                    <Link href="/admin" className="text-indigo-600 hover:text-indigo-500">
                        Back to Dashboard
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <>
            <AdminHeader 
                title="Event Moderation" 
                subtitle={stats.pending > 0 ? `${stats.pending} event menunggu review` : undefined}
                backHref="/admin"
            />

            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="bg-white rounded-xl p-4 mb-6 flex flex-wrap gap-4">
                    <div className="flex-1 min-w-[200px] relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Search events..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 border rounded-lg"
                        />
                    </div>
                    <div className="flex items-center gap-2">
                        <Filter className="h-5 w-5 text-gray-400" />
                        <select
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                            className="px-4 py-2 border rounded-lg"
                        >
                            <option value="">All Status</option>
                            <option value="PENDING_REVIEW">Pending Review</option>
                            <option value="PUBLISHED">Published</option>
                            <option value="DRAFT">Draft</option>
                            <option value="CANCELLED">Cancelled</option>
                        </select>
                    </div>
                </div>

                <div className="bg-white rounded-xl shadow-sm overflow-hidden">
                    <table className="w-full">
                        <thead className="bg-gray-50 border-b">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                                    Event
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                                    Organizer
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                                    Status
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                                    Bookings
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                                    Date
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                                    Actions
                                </th>
                            </tr>
                        </thead>
                        <tbody className="divide-y">
                            {events.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
                                        No events found
                                    </td>
                                </tr>
                            ) : (
                                events.map((event: AdminEvent) => (
                                    <tr key={event.id} className="hover:bg-gray-50">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <img
                                                    src={event.posterImage || "/placeholder.jpg"}
                                                    alt=""
                                                    className="w-12 h-12 object-cover rounded-lg"
                                                />
                                                <div>
                                                    <p className="font-medium text-gray-900 line-clamp-1">
                                                        {event.title}
                                                    </p>
                                                    <p className="text-sm text-gray-500">
                                                        {event.category?.name}
                                                    </p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <p className="text-sm text-gray-900">
                                                {event.organizer.organizerProfile?.organizationName ||
                                                    event.organizer.name}
                                            </p>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span
                                                className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${STATUS_COLORS[event.status]}`}
                                            >
                                                {event.status}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-gray-500">
                                            {event._count.bookings}
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="text-sm">
                                                {event.schedules[0] ? (
                                                    <div className="flex items-center gap-1 text-gray-500">
                                                        <Calendar className="h-3 w-3" />
                                                        {new Date(
                                                            event.schedules[0].scheduleDate
                                                        ).toLocaleDateString("id-ID")}
                                                    </div>
                                                ) : (
                                                    <span className="text-gray-400">No date</span>
                                                )}
                                                {event.venue && (
                                                    <div className="flex items-center gap-1 text-gray-400 text-xs">
                                                        <MapPin className="h-3 w-3" />
                                                        {event.venue.city}
                                                    </div>
                                                )}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-1">
                                                <Link
                                                    href={`/admin/events/${event.id}`}
                                                    className="p-2 text-gray-400 hover:text-indigo-600 rounded-lg hover:bg-gray-100"
                                                    title="View Details"
                                                >
                                                    <Eye className="h-4 w-4" />
                                                </Link>
                                                {event.status === "PENDING_REVIEW" && (
                                                    <>
                                                        <button
                                                            type="button"
                                                            onClick={() => handleApprove(event.id)}
                                                            disabled={actionLoading === event.id}
                                                            className="p-2 text-green-500 hover:text-green-700 rounded-lg hover:bg-green-50 disabled:opacity-50"
                                                            title="Approve"
                                                        >
                                                            {actionLoading === event.id ? (
                                                                <Loader2 className="h-4 w-4 animate-spin" />
                                                            ) : (
                                                                <CheckCircle className="h-4 w-4" />
                                                            )}
                                                        </button>
                                                        <button
                                                            type="button"
                                                            onClick={() => setShowRejectModal(event.id)}
                                                            disabled={actionLoading === event.id}
                                                            className="p-2 text-red-500 hover:text-red-700 rounded-lg hover:bg-red-50 disabled:opacity-50"
                                                            title="Reject"
                                                        >
                                                            <XCircle className="h-4 w-4" />
                                                        </button>
                                                    </>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </main>

            {showRejectModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl max-w-md w-full p-6">
                        <h3 className="text-lg font-bold text-gray-900 mb-4">Tolak Event</h3>
                        <div className="mb-4">
                            <label htmlFor="rejection-reason" className="block text-sm font-medium text-gray-700 mb-1">
                                Alasan Penolakan
                            </label>
                            <textarea
                                id="rejection-reason"
                                value={rejectionReason}
                                onChange={(e) => setRejectionReason(e.target.value)}
                                rows={3}
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg resize-none"
                                placeholder="Jelaskan alasan penolakan..."
                            />
                        </div>
                        <div className="flex gap-3">
                            <button
                                type="button"
                                onClick={() => {
                                    setShowRejectModal(null);
                                    setRejectionReason("");
                                }}
                                className="flex-1 px-4 py-2.5 border border-gray-300 text-gray-700 rounded-xl font-medium hover:bg-gray-50"
                            >
                                Batal
                            </button>
                            <button
                                type="button"
                                onClick={handleReject}
                                disabled={actionLoading !== null || !rejectionReason.trim()}
                                className="flex-1 px-4 py-2.5 bg-red-600 text-white rounded-xl font-medium hover:bg-red-700 disabled:opacity-50"
                            >
                                {actionLoading ? "Processing..." : "Tolak Event"}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
