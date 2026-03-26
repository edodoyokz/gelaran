"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Building2, Eye, Loader2, MapPin, Search, Ticket } from "lucide-react";
import {
    AdminDataTable,
    AdminFilterBar,
    AdminMetricCard,
    AdminNotice,
    AdminStatusBadge,
    AdminWorkspacePage,
} from "@/components/admin/admin-workspace";

interface Venue {
    id: string;
    name: string;
    slug: string;
    address: string;
    city: string;
    province: string;
    postalCode: string | null;
    country: string;
    latitude: string | null;
    longitude: string | null;
    googlePlaceId: string | null;
    capacity: number | null;
    description: string | null;
    amenities: string[] | null;
    imageUrl: string | null;
    isActive: boolean;
    createdAt: string;
    _count: {
        events: number;
    };
}

interface Pagination {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
}

export default function AdminVenuesPage() {
    const router = useRouter();
    const [venues, setVenues] = useState<Venue[]>([]);
    const [cities, setCities] = useState<string[]>([]);
    const [pagination, setPagination] = useState<Pagination | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [search, setSearch] = useState("");
    const [cityFilter, setCityFilter] = useState("");

    const fetchVenues = useCallback(async () => {
        try {
            setIsLoading(true);
            setError(null);
            const params = new URLSearchParams();
            if (search) params.set("search", search);
            if (cityFilter) params.set("city", cityFilter);
            params.set("page", "1");

            const res = await fetch(`/api/admin/venues?${params.toString()}`);
            const data = await res.json();

            if (!res.ok) {
                if (res.status === 401) {
                    router.push("/login?returnUrl=/admin/venues");
                    return;
                }
                if (res.status === 403) {
                    router.push("/admin");
                    return;
                }
                setError(data.error?.message || "Failed to load venues");
                return;
            }

            if (data.success) {
                setVenues(data.data.venues);
                setCities(data.data.cities);
                setPagination(data.data.pagination);
            }
        } catch {
            setError("Failed to load venues");
        } finally {
            setIsLoading(false);
        }
    }, [cityFilter, router, search]);

    useEffect(() => {
        fetchVenues();
    }, [fetchVenues]);

    if (isLoading) {
        return (
            <div className="flex min-h-[60vh] items-center justify-center">
                <Loader2 className="h-10 w-10 animate-spin text-(--accent-primary)" />
            </div>
        );
    }

    if (error) {
        return (
            <AdminWorkspacePage eyebrow="Admin venues" title="Venue directory" description="Review geographic coverage and event readiness across venue records.">
                <AdminNotice tone="warning" title="Venue data is unavailable" description={error} actionHref="/admin" actionLabel="Back to dashboard" />
            </AdminWorkspacePage>
        );
    }

    const activeVenues = venues.filter((venue) => venue.isActive).length;
    const totalEventLinks = venues.reduce((sum, venue) => sum + venue._count.events, 0);

    return (
        <AdminWorkspacePage eyebrow="Admin venues" title="Venue directory" description="Review geographic coverage and event readiness across venue records.">
            <AdminNotice
                title="Venue coverage snapshot"
                description={`${activeVenues.toLocaleString("en-US")} active venues are currently visible across ${cities.length.toLocaleString("en-US")} cities in the admin directory.`}
                actionHref="/admin/events"
                actionLabel="Review event assignments"
            />

            <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                <AdminMetricCard label="Visible venues" value={venues.length.toLocaleString("en-US")} icon={MapPin} meta={`${activeVenues} active in this result set`} />
                <AdminMetricCard label="Cities represented" value={cities.length.toLocaleString("en-US")} icon={Building2} tone="accent" meta="Distinct cities from the filtered API response" />
                <AdminMetricCard label="Event links" value={totalEventLinks.toLocaleString("en-US")} icon={Ticket} meta="Events currently assigned to listed venues" />
                <AdminMetricCard label="Active ratio" value={`${venues.length > 0 ? Math.round((activeVenues / venues.length) * 100) : 0}%`} icon={Eye} tone="success" meta="Share of records marked active" />
            </section>

            <AdminFilterBar>
                <label className="relative block min-w-[16rem] flex-1">
                    <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-(--text-muted)" />
                    <input
                        type="search"
                        value={search}
                        onChange={(event) => setSearch(event.target.value)}
                        placeholder="Search venue name or address"
                        className="w-full rounded-2xl border border-(--border) bg-(--surface-elevated) py-3 pl-11 pr-4 text-sm text-foreground outline-none"
                    />
                </label>
                <select value={cityFilter} onChange={(event) => setCityFilter(event.target.value)} className="rounded-2xl border border-(--border) bg-(--surface-elevated) px-4 py-3 text-sm">
                    <option value="">All cities</option>
                    {cities.map((city) => (
                        <option key={city} value={city}>{city}</option>
                    ))}
                </select>
            </AdminFilterBar>

            <AdminDataTable
                columns={["Venue", "Location", "Capacity", "Events", "Status", "Created", "Action"]}
                hasRows={venues.length > 0}
                emptyTitle="No venues match the current filters"
                emptyDescription="Try clearing the city filter or broadening the search term to reveal more venue records."
            >
                {venues.map((venue) => (
                    <tr key={venue.id} className="transition-colors hover:bg-(--surface-elevated)">
                        <td className="px-5 py-4 align-top">
                            <p className="text-sm font-semibold text-foreground">{venue.name}</p>
                            <p className="mt-1 text-xs text-(--text-secondary)">{venue.address}</p>
                        </td>
                        <td className="px-5 py-4 align-top text-sm text-(--text-secondary)">{venue.city}, {venue.province}</td>
                        <td className="px-5 py-4 align-top text-sm text-(--text-secondary)">{venue.capacity?.toLocaleString("en-US") || "Not set"}</td>
                        <td className="px-5 py-4 align-top text-sm text-(--text-secondary)">{venue._count.events.toLocaleString("en-US")}</td>
                        <td className="px-5 py-4 align-top">
                            <AdminStatusBadge label={venue.isActive ? "Active" : "Inactive"} tone={venue.isActive ? "success" : "default"} />
                        </td>
                        <td className="px-5 py-4 align-top text-sm text-(--text-secondary)">{new Date(venue.createdAt).toLocaleDateString("id-ID")}</td>
                        <td className="px-5 py-4 align-top">
                            <Link href={`/admin/events?search=${encodeURIComponent(venue.name)}`} className="inline-flex items-center gap-2 rounded-full border border-(--border) px-3 py-2 text-sm font-semibold text-foreground hover:text-(--accent-primary)">
                                <Eye className="h-4 w-4" />
                                View related events
                            </Link>
                        </td>
                    </tr>
                ))}
            </AdminDataTable>

            {pagination ? <div className="text-sm text-(--text-secondary)">Showing {venues.length} of {pagination.total.toLocaleString("en-US")} venues.</div> : null}
        </AdminWorkspacePage>
    );
}
