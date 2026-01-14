"use client";

import { useState, useEffect, useCallback, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import {
    Search,
    Ticket,
    Calendar,
    Loader2,
    AlertCircle,
    Filter,
    Eye,
    TrendingUp,
    DollarSign,
    Users,
} from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import { AdminHeader } from "@/components/admin/AdminHeader";

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

interface BookedTicket {
    id: string;
    ticketType: {
        name: string;
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
    bookedTickets: BookedTicket[];
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

const STATUS_COLORS: Record<string, string> = {
    PENDING: "bg-gray-100 text-gray-700",
    AWAITING_PAYMENT: "bg-yellow-100 text-yellow-700",
    PAID: "bg-blue-100 text-blue-700",
    CONFIRMED: "bg-green-100 text-green-700",
    CANCELLED: "bg-red-100 text-red-700",
    REFUNDED: "bg-purple-100 text-purple-700",
    EXPIRED: "bg-gray-100 text-gray-500",
};

function AdminBookingsContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const eventIdParam = searchParams.get("eventId");
    
    const [bookings, setBookings] = useState<Booking[]>([]);
    const [stats, setStats] = useState<BookingStats | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [statusFilter, setStatusFilter] = useState<string>("");
    const [search, setSearch] = useState("");
    const [eventIdFilter, setEventIdFilter] = useState<string>(eventIdParam || "");

    const fetchBookings = useCallback(async () => {
        try {
            setIsLoading(true);
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

    const filteredBookings = bookings.filter((booking) => {
        const matchesStatus = !statusFilter || booking.status === statusFilter;
        const matchesEventId = !eventIdFilter || booking.event.id === eventIdFilter;
        const searchLower = search.toLowerCase();
        const matchesSearch =
            !search ||
            booking.bookingCode.toLowerCase().includes(searchLower) ||
            booking.event.title.toLowerCase().includes(searchLower) ||
            booking.user?.name.toLowerCase().includes(searchLower) ||
            booking.user?.email.toLowerCase().includes(searchLower) ||
            booking.guestName?.toLowerCase().includes(searchLower) ||
            booking.guestEmail?.toLowerCase().includes(searchLower);

        return matchesStatus && matchesSearch && matchesEventId;
    });

    if (isLoading) {
        return (
            <div className="min-h-screen bg-gray-100 flex items-center justify-center">
                <div className="text-center">
                    <Loader2 className="h-12 w-12 text-indigo-600 animate-spin mx-auto mb-4" />
                    <p className="text-gray-500">Loading bookings...</p>
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
                title="All Bookings" 
                backHref="/admin"
            />

            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {eventIdFilter && (
                    <div className="mb-6 bg-indigo-50 border border-indigo-200 rounded-xl p-4 flex items-center justify-between">
                        <div>
                            <p className="font-medium text-indigo-800">
                                Filtering by event: {bookings.find(b => b.event.id === eventIdFilter)?.event.title || eventIdFilter}
                            </p>
                            <p className="text-sm text-indigo-600">
                                Showing {filteredBookings.length} booking(s) for this event
                            </p>
                        </div>
                        <button
                            type="button"
                            onClick={() => {
                                setEventIdFilter("");
                                router.replace("/admin/bookings");
                            }}
                            className="px-4 py-2 text-sm font-medium text-indigo-700 hover:text-indigo-800 hover:bg-indigo-100 rounded-lg"
                        >
                            Clear Filter
                        </button>
                    </div>
                )}
                
                {stats && (
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                        <div className="bg-white rounded-xl p-5 shadow-sm">
                            <div className="flex items-center gap-3 mb-2">
                                <div className="w-10 h-10 bg-indigo-100 rounded-lg flex items-center justify-center">
                                    <Ticket className="h-5 w-5 text-indigo-600" />
                                </div>
                            </div>
                            <p className="text-2xl font-bold text-gray-900">{bookings.length}</p>
                            <p className="text-sm text-gray-500">Total Bookings</p>
                        </div>
                        <div className="bg-white rounded-xl p-5 shadow-sm">
                            <div className="flex items-center gap-3 mb-2">
                                <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                                    <TrendingUp className="h-5 w-5 text-green-600" />
                                </div>
                            </div>
                            <p className="text-2xl font-bold text-gray-900">
                                {formatCurrency(stats.totalRevenue.total)}
                            </p>
                            <p className="text-sm text-gray-500">Total Revenue</p>
                        </div>
                        <div className="bg-white rounded-xl p-5 shadow-sm">
                            <div className="flex items-center gap-3 mb-2">
                                <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                                    <DollarSign className="h-5 w-5 text-purple-600" />
                                </div>
                            </div>
                            <p className="text-2xl font-bold text-gray-900">
                                {formatCurrency(stats.totalRevenue.platform)}
                            </p>
                            <p className="text-sm text-gray-500">Platform Revenue</p>
                        </div>
                        <div className="bg-white rounded-xl p-5 shadow-sm">
                            <div className="flex items-center gap-3 mb-2">
                                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                                    <Users className="h-5 w-5 text-blue-600" />
                                </div>
                            </div>
                            <p className="text-2xl font-bold text-gray-900">
                                {bookings.filter((b) => b.status === "CONFIRMED" || b.status === "PAID").length}
                            </p>
                            <p className="text-sm text-gray-500">Confirmed</p>
                        </div>
                    </div>
                )}

                <div className="bg-white rounded-xl p-4 mb-6 flex flex-wrap gap-4">
                    <div className="flex-1 min-w-[200px] relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Search by booking code, event, or customer..."
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
                            <option value="PENDING">Pending</option>
                            <option value="AWAITING_PAYMENT">Awaiting Payment</option>
                            <option value="PAID">Paid</option>
                            <option value="CONFIRMED">Confirmed</option>
                            <option value="CANCELLED">Cancelled</option>
                            <option value="REFUNDED">Refunded</option>
                        </select>
                    </div>
                </div>

                <div className="bg-white rounded-xl shadow-sm overflow-hidden">
                    <table className="w-full">
                        <thead className="bg-gray-50 border-b">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                                    Booking
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                                    Event
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                                    Customer
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                                    Amount
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                                    Status
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
                            {filteredBookings.length === 0 ? (
                                <tr>
                                    <td colSpan={7} className="px-6 py-12 text-center text-gray-500">
                                        No bookings found
                                    </td>
                                </tr>
                            ) : (
                                filteredBookings.map((booking) => (
                                    <tr key={booking.id} className="hover:bg-gray-50">
                                        <td className="px-6 py-4">
                                            <p className="font-medium text-gray-900 font-mono">
                                                {booking.bookingCode}
                                            </p>
                                            <p className="text-xs text-gray-500">
                                                {booking.totalTickets} ticket(s)
                                            </p>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <img
                                                    src={booking.event.posterImage || "/placeholder.jpg"}
                                                    alt=""
                                                    className="w-10 h-10 object-cover rounded-lg"
                                                />
                                                <div>
                                                    <p className="text-sm font-medium text-gray-900 line-clamp-1">
                                                        {booking.event.title}
                                                    </p>
                                                    <p className="text-xs text-gray-500">
                                                        {booking.event.organizer.organizerProfile?.organizationName ||
                                                            booking.event.organizer.name}
                                                    </p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <p className="text-sm text-gray-900">
                                                {booking.user?.name || booking.guestName || "Guest"}
                                            </p>
                                            <p className="text-xs text-gray-500">
                                                {booking.user?.email || booking.guestEmail}
                                            </p>
                                        </td>
                                        <td className="px-6 py-4">
                                            <p className="font-medium text-gray-900">
                                                {formatCurrency(Number(booking.totalAmount))}
                                            </p>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span
                                                className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${STATUS_COLORS[booking.status]}`}
                                            >
                                                {booking.status}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="text-sm">
                                                <div className="flex items-center gap-1 text-gray-500">
                                                    <Calendar className="h-3 w-3" />
                                                    {new Date(booking.createdAt).toLocaleDateString("id-ID")}
                                                </div>
                                                <p className="text-xs text-gray-400">
                                                    {new Date(booking.createdAt).toLocaleTimeString("id-ID", {
                                                        hour: "2-digit",
                                                        minute: "2-digit",
                                                    })}
                                                </p>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <Link
                                                href={`/admin/bookings/${booking.id}`}
                                                className="p-2 text-gray-400 hover:text-indigo-600 rounded-lg hover:bg-gray-100 inline-flex"
                                                title="View Details"
                                            >
                                                <Eye className="h-4 w-4" />
                                            </Link>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </main>
        </>
    );
}

function AdminBookingsLoading() {
    return (
        <div className="min-h-screen bg-gray-100 flex items-center justify-center">
            <div className="text-center">
                <Loader2 className="h-12 w-12 text-indigo-600 animate-spin mx-auto mb-4" />
                <p className="text-gray-500">Loading bookings...</p>
            </div>
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
