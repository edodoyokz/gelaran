"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { CalendarRange, Eye, Loader2, Search, SlidersHorizontal, Ticket, Wallet } from "lucide-react";
import {
    AdminDataTable,
    AdminFilterBar,
    AdminMetricCard,
    AdminNotice,
    AdminStatusBadge,
    AdminWorkspacePage,
} from "@/components/admin/admin-workspace";
import { formatCurrency } from "@/lib/utils";

interface AdminEvent {
    id: string;
    slug: string;
    title: string;
    posterImage: string | null;
    status: "DRAFT" | "PENDING_REVIEW" | "PUBLISHED" | "CANCELLED" | "ENDED";
    createdAt: string;
    organizer: {
        id: string;
        name: string;
        organizerProfile: {
            organizationName: string | null;
        } | null;
    };
    category: {
        id: string;
        name: string;
    } | null;
    venue: {
        name: string;
        city: string;
    } | null;
    schedules: Array<{
        scheduleDate: string;
        startTime: string;
        endTime: string;
    }>;
    revenue: {
        total: number;
        platform: number;
    };
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

const statusTone: Record<string, "default" | "success" | "warning" | "danger" | "accent"> = {
    DRAFT: "default",
    PENDING_REVIEW: "warning",
    PUBLISHED: "success",
    CANCELLED: "danger",
    ENDED: "accent",
};

export default function AdminEventsPage() {
    const router = useRouter();
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
    const [statusFilter, setStatusFilter] = useState("");
    const [categoryFilter, setCategoryFilter] = useState("");
    const [organizerFilter, setOrganizerFilter] = useState("");
    const [search, setSearch] = useState("");

    const fetchEvents = useCallback(async () => {
        try {
            setIsLoading(true);
            setError(null);
            const params = new URLSearchParams();
            if (statusFilter) params.set("status", statusFilter);
            if (categoryFilter) params.set("category", categoryFilter);
            if (organizerFilter) params.set("organizer", organizerFilter);
            if (search) params.set("search", search);
            params.set("page", "1");
            params.set("limit", "20");

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
    }, [categoryFilter, organizerFilter, router, search, statusFilter]);

    useEffect(() => {
        fetchEvents();
    }, [fetchEvents]);

    const headline = useMemo(() => {
        if (stats.pending > 0) {
            return `${stats.pending} event${stats.pending > 1 ? "s" : ""} waiting for moderation review.`;
        }
        return "No event is currently waiting for moderation review.";
    }, [stats.pending]);

    if (isLoading) {
        return (
            <div className="flex min-h-[60vh] items-center justify-center">
                <Loader2 className="h-10 w-10 animate-spin text-(--accent-primary)" />
            </div>
        );
    }

    if (error) {
        return (
            <AdminWorkspacePage
                eyebrow="Admin events"
                title="Catalog moderation"
                description="Review publishing status, organizer ownership, and revenue signals across the event catalog."
            >
                <AdminNotice tone="warning" title="Event data is unavailable" description={error} actionHref="/admin" actionLabel="Back to dashboard" />
            </AdminWorkspacePage>
        );
    }

    return (
        <AdminWorkspacePage
            eyebrow="Admin events"
            title="Catalog moderation"
            description="Review publishing status, organizer ownership, and revenue signals across the event catalog."
        >
            <AdminNotice
                tone={stats.pending > 0 ? "warning" : "success"}
                title="Moderation queue"
                description={headline}
                actionHref="/admin/bookings"
                actionLabel="Inspect booking activity"
            />

            <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                <AdminMetricCard label="All events" value={stats.total.toLocaleString("en-US")} icon={CalendarRange} meta={`${stats.published} published`} />
                <AdminMetricCard label="Pending review" value={stats.pending.toLocaleString("en-US")} icon={SlidersHorizontal} tone="warning" meta={`${stats.draft} drafts still being prepared`} />
                <AdminMetricCard label="Gross revenue" value={formatCurrency(stats.totalRevenue)} icon={Wallet} tone="accent" meta={`Platform revenue ${formatCurrency(stats.platformRevenue)}`} />
                <AdminMetricCard label="Cancelled or ended" value={(stats.cancelled + stats.ended).toLocaleString("en-US")} icon={Ticket} meta="Past or interrupted catalog items" />
            </section>

            <AdminFilterBar>
                <label className="relative block min-w-[16rem] flex-1">
                    <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-(--text-muted)" />
                    <input
                        type="search"
                        value={search}
                        onChange={(event) => setSearch(event.target.value)}
                        placeholder="Search event or organizer"
                        className="w-full rounded-2xl border border-(--border) bg-(--surface-elevated) py-3 pl-11 pr-4 text-sm text-foreground outline-none"
                    />
                </label>
                <select value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)} className="rounded-2xl border border-(--border) bg-(--surface-elevated) px-4 py-3 text-sm">
                    <option value="">All statuses</option>
                    <option value="DRAFT">Draft</option>
                    <option value="PENDING_REVIEW">Pending review</option>
                    <option value="PUBLISHED">Published</option>
                    <option value="CANCELLED">Cancelled</option>
                    <option value="ENDED">Ended</option>
                </select>
                <select value={categoryFilter} onChange={(event) => setCategoryFilter(event.target.value)} className="rounded-2xl border border-(--border) bg-(--surface-elevated) px-4 py-3 text-sm">
                    <option value="">All categories</option>
                    {filterOptions.categories.map((category) => (
                        <option key={category.id} value={category.id}>{category.name}</option>
                    ))}
                </select>
                <select value={organizerFilter} onChange={(event) => setOrganizerFilter(event.target.value)} className="rounded-2xl border border-(--border) bg-(--surface-elevated) px-4 py-3 text-sm">
                    <option value="">All organizers</option>
                    {filterOptions.organizers.map((organizer) => (
                        <option key={organizer.id} value={organizer.id}>{organizer.organizationName || organizer.name}</option>
                    ))}
                </select>
            </AdminFilterBar>

            <AdminDataTable
                columns={["Event", "Organizer", "Status", "Schedule", "Revenue", "Bookings", "Action"]}
                hasRows={events.length > 0}
                emptyTitle="No events match the current filters"
                emptyDescription="Adjust the search query or moderation filters to reveal more catalog results."
            >
                {events.map((event) => (
                    <tr key={event.id} className="transition-colors hover:bg-(--surface-elevated)">
                        <td className="px-5 py-4 align-top">
                            <p className="text-sm font-semibold text-foreground">{event.title}</p>
                            <p className="mt-1 text-xs text-(--text-secondary)">{event.category?.name || "Uncategorized"}</p>
                        </td>
                        <td className="px-5 py-4 align-top text-sm text-(--text-secondary)">
                            <p className="font-medium text-foreground">{event.organizer.organizerProfile?.organizationName || event.organizer.name}</p>
                            <p className="mt-1">{event.venue ? `${event.venue.name} · ${event.venue.city}` : "Venue not assigned"}</p>
                        </td>
                        <td className="px-5 py-4 align-top">
                            <AdminStatusBadge label={event.status.replace("_", " ")} tone={statusTone[event.status] || "default"} />
                        </td>
                        <td className="px-5 py-4 align-top text-sm text-(--text-secondary)">
                            {event.schedules[0] ? new Date(event.schedules[0].scheduleDate).toLocaleDateString("id-ID") : "No schedule"}
                        </td>
                        <td className="px-5 py-4 align-top text-sm text-(--text-secondary)">
                            <p className="font-semibold text-foreground">{formatCurrency(event.revenue.total)}</p>
                            <p className="mt-1">Platform {formatCurrency(event.revenue.platform)}</p>
                        </td>
                        <td className="px-5 py-4 align-top text-sm text-(--text-secondary)">{event._count.bookings.toLocaleString("en-US")}</td>
                        <td className="px-5 py-4 align-top">
                            <Link href={`/admin/events/${event.id}`} className="inline-flex items-center gap-2 rounded-full border border-(--border) px-3 py-2 text-sm font-semibold text-foreground hover:text-(--accent-primary)">
                                <Eye className="h-4 w-4" />
                                View
                            </Link>
                        </td>
                    </tr>
                ))}
            </AdminDataTable>

            {pagination ? (
                <div className="text-sm text-(--text-secondary)">
                    Showing {events.length} of {pagination.total.toLocaleString("en-US")} events.
                </div>
            ) : null}
        </AdminWorkspacePage>
    );
}
