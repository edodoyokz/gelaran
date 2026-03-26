"use client";

import { Suspense, useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { CalendarDays, Eye, Loader2, Search, Ticket, Wallet } from "lucide-react";
import {
    AdminDataTable,
    AdminFilterBar,
    AdminMetricCard,
    AdminNotice,
    AdminStatusBadge,
    AdminWorkspacePage,
} from "@/components/admin/admin-workspace";
import { formatCurrency } from "@/lib/utils";

interface BookingUser {
    id: string;
    name: string;
    email: string;
}

interface BookingEvent {
    id: string;
    title: string;
    slug: string;
    posterImage: string | null;
    organizer: {
        name: string;
        organizerProfile: {
            organizationName: string | null;
        } | null;
    };
}

interface Booking {
    id: string;
    bookingCode: string;
    totalTickets: number;
    totalAmount: string | number;
    status: "PENDING" | "AWAITING_PAYMENT" | "PAID" | "CONFIRMED" | "CANCELLED" | "REFUNDED" | "EXPIRED";
    paymentStatus: "UNPAID" | "PAID" | "PARTIAL_REFUND" | "FULL_REFUND";
    createdAt: string;
    paidAt: string | null;
    user: BookingUser | null;
    guestEmail: string | null;
    guestName: string | null;
    event: BookingEvent;
}

interface BookingStats {
    byStatus: Array<{
        status: string;
        _count: { id: number };
        _sum: { totalAmount: number | null };
    }>;
    totalRevenue: {
        total: number;
        platform: number;
        organizer: number;
    };
}

const statusTone: Record<string, "default" | "success" | "warning" | "danger" | "accent"> = {
    PENDING: "warning",
    AWAITING_PAYMENT: "warning",
    PAID: "accent",
    CONFIRMED: "success",
    CANCELLED: "danger",
    REFUNDED: "default",
    EXPIRED: "default",
};

function AdminBookingsContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const eventIdParam = searchParams.get("eventId");

    const [bookings, setBookings] = useState<Booking[]>([]);
    const [stats, setStats] = useState<BookingStats | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [statusFilter, setStatusFilter] = useState("");
    const [search, setSearch] = useState("");
    const [eventIdFilter] = useState<string>(eventIdParam || "");

    const fetchBookings = useCallback(async () => {
        try {
            setIsLoading(true);
            setError(null);
            const res = await fetch("/api/admin/bookings");
            const data = await res.json();

            if (!res.ok) {
                if (res.status === 401) {
                    router.push("/login?returnUrl=/admin/bookings");
                    return;
                }
                if (res.status === 403) {
                    router.push("/");
                    return;
                }
                setError(data.error?.message || "Failed to load bookings");
                return;
            }

            if (data.success) {
                setBookings(data.data.bookings);
                setStats(data.data.stats);
            }
        } catch {
            setError("Failed to load bookings");
        } finally {
            setIsLoading(false);
        }
    }, [router]);

    useEffect(() => {
        fetchBookings();
    }, [fetchBookings]);

    const filteredBookings = useMemo(() => bookings.filter((booking) => {
        const matchesStatus = !statusFilter || booking.status === statusFilter;
        const matchesEventId = !eventIdFilter || booking.event.id === eventIdFilter;
        const searchLower = search.toLowerCase();
        const matchesSearch = !search || [
            booking.bookingCode,
            booking.event.title,
            booking.user?.name,
            booking.user?.email,
            booking.guestName,
            booking.guestEmail,
        ].some((value) => value?.toLowerCase().includes(searchLower));

        return matchesStatus && matchesEventId && matchesSearch;
    }), [bookings, eventIdFilter, search, statusFilter]);

    if (isLoading) {
        return (
            <div className="flex min-h-[60vh] items-center justify-center">
                <div className="text-center">
                    <Loader2 className="mx-auto h-10 w-10 animate-spin text-(--accent-primary)" />
                    <p className="mt-4 text-sm text-(--text-secondary)">Loading bookings workspace…</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <AdminWorkspacePage
                eyebrow="Admin bookings"
                title="Bookings operations"
                description="Audit transaction flow, payment state, and customer booking activity."
            >
                <AdminNotice
                    tone="warning"
                    title="Bookings data is unavailable"
                    description={error}
                    actionHref="/admin"
                    actionLabel="Back to dashboard"
                />
            </AdminWorkspacePage>
        );
    }

    return (
        <AdminWorkspacePage
            eyebrow="Admin bookings"
            title="Bookings operations"
            description="Audit transaction flow, payment state, and customer booking activity."
            actions={
                <Link href="/admin/analytics" className="inline-flex items-center gap-2 rounded-full border border-(--border) bg-(--surface-elevated) px-4 py-2 text-sm font-semibold text-foreground hover:text-(--accent-primary)">
                    View analytics
                </Link>
            }
        >
            {eventIdFilter ? (
                <AdminNotice
                    title="Event filter active"
                    description={`Showing ${filteredBookings.length} booking records for the selected event.`}
                    actionHref="/admin/bookings"
                    actionLabel="Clear filter"
                />
            ) : null}

            <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                <AdminMetricCard label="Visible bookings" value={filteredBookings.length.toLocaleString("en-US")} icon={Ticket} meta={`${bookings.length.toLocaleString("en-US")} loaded from the admin API`} />
                <AdminMetricCard label="Gross revenue" value={formatCurrency(stats?.totalRevenue.total || 0)} icon={Wallet} tone="accent" meta={`Platform share ${formatCurrency(stats?.totalRevenue.platform || 0)}`} />
                <AdminMetricCard label="Organizer revenue" value={formatCurrency(stats?.totalRevenue.organizer || 0)} icon={CalendarDays} meta="Settlement-facing revenue across confirmed bookings" />
                <AdminMetricCard label="Confirmed or paid" value={bookings.filter((booking) => ["CONFIRMED", "PAID"].includes(booking.status)).length.toLocaleString("en-US")} icon={Eye} tone="success" meta="Orders currently contributing to operational volume" />
            </section>

            <AdminFilterBar>
                <label className="relative block min-w-[16rem] flex-1">
                    <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-(--text-muted)" />
                    <input
                        type="search"
                        value={search}
                        onChange={(event) => setSearch(event.target.value)}
                        placeholder="Search booking code, event, or customer"
                        className="w-full rounded-2xl border border-(--border) bg-(--surface-elevated) py-3 pl-11 pr-4 text-sm text-foreground outline-none transition-colors focus:border-[rgba(41,179,182,0.32)]"
                    />
                </label>
                <select
                    value={statusFilter}
                    onChange={(event) => setStatusFilter(event.target.value)}
                    className="rounded-2xl border border-(--border) bg-(--surface-elevated) px-4 py-3 text-sm text-foreground outline-none"
                >
                    <option value="">All statuses</option>
                    <option value="PENDING">Pending</option>
                    <option value="AWAITING_PAYMENT">Awaiting payment</option>
                    <option value="PAID">Paid</option>
                    <option value="CONFIRMED">Confirmed</option>
                    <option value="CANCELLED">Cancelled</option>
                    <option value="REFUNDED">Refunded</option>
                    <option value="EXPIRED">Expired</option>
                </select>
            </AdminFilterBar>

            <AdminDataTable
                columns={["Booking", "Event", "Customer", "Amount", "Status", "Created", "Action"]}
                hasRows={filteredBookings.length > 0}
                emptyTitle="No bookings match the current filters"
                emptyDescription="Try clearing the status or search filters to reveal more booking activity."
            >
                {filteredBookings.map((booking) => (
                    <tr key={booking.id} className="bg-(--surface) transition-colors hover:bg-(--surface-elevated)">
                        <td className="px-5 py-4 align-top">
                            <p className="font-mono text-sm font-semibold text-foreground">{booking.bookingCode}</p>
                            <p className="mt-1 text-xs text-(--text-muted)">{booking.totalTickets} ticket(s)</p>
                        </td>
                        <td className="px-5 py-4 align-top">
                            <p className="text-sm font-semibold text-foreground">{booking.event.title}</p>
                            <p className="mt-1 text-xs text-(--text-secondary)">{booking.event.organizer.organizerProfile?.organizationName || booking.event.organizer.name}</p>
                        </td>
                        <td className="px-5 py-4 align-top">
                            <p className="text-sm font-medium text-foreground">{booking.user?.name || booking.guestName || "Guest"}</p>
                            <p className="mt-1 text-xs text-(--text-secondary)">{booking.user?.email || booking.guestEmail || "No email"}</p>
                        </td>
                        <td className="px-5 py-4 align-top">
                            <p className="text-sm font-semibold text-foreground">{formatCurrency(Number(booking.totalAmount))}</p>
                        </td>
                        <td className="px-5 py-4 align-top">
                            <AdminStatusBadge label={booking.status} tone={statusTone[booking.status] || "default"} />
                        </td>
                        <td className="px-5 py-4 align-top text-sm text-(--text-secondary)">
                            {new Date(booking.createdAt).toLocaleString("id-ID")}
                        </td>
                        <td className="px-5 py-4 align-top">
                            <Link href={`/admin/bookings/${booking.id}`} className="inline-flex items-center gap-2 rounded-full border border-(--border) px-3 py-2 text-sm font-semibold text-foreground transition-colors hover:border-[rgba(41,179,182,0.28)] hover:text-(--accent-primary)">
                                <Eye className="h-4 w-4" />
                                View
                            </Link>
                        </td>
                    </tr>
                ))}
            </AdminDataTable>
        </AdminWorkspacePage>
    );
}

function AdminBookingsLoading() {
    return (
        <div className="flex min-h-[60vh] items-center justify-center">
            <Loader2 className="h-10 w-10 animate-spin text-(--accent-primary)" />
        </div>
    );
}

export default function AdminBookingsPage() {
    return (
        <Suspense fallback={<AdminBookingsLoading />}>
            <AdminBookingsContent />
        </Suspense>
    );
}
