"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
    ArrowLeft,
    Ticket,
    Calendar,
    MapPin,
    Loader2,
    AlertCircle,
    Clock,
    CheckCircle,
    XCircle,
    QrCode,
    ChevronRight,
    Download,
    Search,
} from "lucide-react";

interface BookedTicket {
    id: string;
    uniqueCode: string;
    status: string;
    isCheckedIn: boolean;
    ticketType: {
        name: string;
    };
}

interface EventSchedule {
    scheduleDate: string;
    startTime: string;
    endTime: string;
}

interface Venue {
    name: string;
    city: string;
}

interface BookingEvent {
    id: string;
    title: string;
    slug: string;
    posterImage: string | null;
    venue: Venue | null;
}

interface Booking {
    id: string;
    bookingCode: string;
    status: "PENDING" | "AWAITING_PAYMENT" | "PAID" | "CONFIRMED" | "CANCELLED" | "REFUNDED" | "EXPIRED";
    paymentStatus: string;
    totalTickets: number;
    totalAmount: string;
    createdAt: string;
    expiresAt: string | null;
    event: BookingEvent;
    eventSchedule: EventSchedule | null;
    bookedTickets: BookedTicket[];
}

interface BookingStats {
    total: number;
    confirmed: number;
    pending: number;
    cancelled: number;
    completed: number;
}

interface Pagination {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
}

const STATUS_CONFIG: Record<string, { color: string; icon: typeof CheckCircle; label: string }> = {
    PENDING: { color: "bg-yellow-100 text-yellow-700", icon: Clock, label: "Pending" },
    AWAITING_PAYMENT: { color: "bg-orange-100 text-orange-700", icon: Clock, label: "Awaiting Payment" },
    PAID: { color: "bg-blue-100 text-blue-700", icon: CheckCircle, label: "Paid" },
    CONFIRMED: { color: "bg-green-100 text-green-700", icon: CheckCircle, label: "Confirmed" },
    CANCELLED: { color: "bg-red-100 text-red-700", icon: XCircle, label: "Cancelled" },
    REFUNDED: { color: "bg-purple-100 text-purple-700", icon: XCircle, label: "Refunded" },
    EXPIRED: { color: "bg-gray-100 text-gray-700", icon: XCircle, label: "Expired" },
};

const FILTER_TABS = [
    { value: "all", label: "All Bookings" },
    { value: "confirmed", label: "Confirmed" },
    { value: "awaiting_payment", label: "Pending Payment" },
    { value: "cancelled", label: "Cancelled" },
];

export default function MyBookingsPage() {
    const router = useRouter();
    const [bookings, setBookings] = useState<Booking[]>([]);
    const [stats, setStats] = useState<BookingStats | null>(null);
    const [pagination, setPagination] = useState<Pagination | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [activeTab, setActiveTab] = useState("all");
    const [search, setSearch] = useState("");
    const [currentPage, setCurrentPage] = useState(1);

    const fetchBookings = useCallback(async (status: string, page: number) => {
        try {
            setIsLoading(true);
            const params = new URLSearchParams();
            if (status !== "all") params.set("status", status);
            params.set("page", page.toString());
            params.set("limit", "10");

            const res = await fetch(`/api/my-bookings?${params.toString()}`);
            const data = await res.json();

            if (!res.ok) {
                if (res.status === 401) {
                    router.push("/login?returnUrl=/my-bookings");
                    return;
                }
                setError(data.error?.message || "Failed to load bookings");
                return;
            }

            if (data.success) {
                setBookings(data.data.bookings);
                setStats(data.data.stats);
                setPagination(data.data.pagination);
            }
        } catch {
            setError("Failed to load bookings");
        } finally {
            setIsLoading(false);
        }
    }, [router]);

    useEffect(() => {
        fetchBookings(activeTab, currentPage);
    }, [activeTab, currentPage, fetchBookings]);

    const handleTabChange = (tab: string) => {
        setActiveTab(tab);
        setCurrentPage(1);
    };

    const formatDate = (dateStr: string): string => {
        return new Date(dateStr).toLocaleDateString("id-ID", {
            weekday: "short",
            day: "numeric",
            month: "short",
            year: "numeric",
        });
    };

    const formatTime = (timeStr: string): string => {
        const date = new Date(timeStr);
        return date.toLocaleTimeString("id-ID", {
            hour: "2-digit",
            minute: "2-digit",
        });
    };

    const formatCurrency = (amount: string | number): string => {
        return new Intl.NumberFormat("id-ID", {
            style: "currency",
            currency: "IDR",
            minimumFractionDigits: 0,
        }).format(Number(amount));
    };

    const filteredBookings = bookings.filter((booking) => {
        if (!search) return true;
        const searchLower = search.toLowerCase();
        return (
            booking.bookingCode.toLowerCase().includes(searchLower) ||
            booking.event.title.toLowerCase().includes(searchLower)
        );
    });

    if (isLoading && bookings.length === 0) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <Loader2 className="h-12 w-12 text-indigo-600 animate-spin mx-auto mb-4" />
                    <p className="text-gray-500">Loading your bookings...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
                    <p className="text-gray-900 font-medium mb-2">{error}</p>
                    <Link href="/" className="text-indigo-600 hover:text-indigo-500">
                        Back to Home
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50">
            <header className="bg-white border-b sticky top-0 z-10">
                <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
                    <div className="flex items-center gap-4">
                        <Link href="/" className="text-gray-500 hover:text-gray-700">
                            <ArrowLeft className="h-5 w-5" />
                        </Link>
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900">My Bookings</h1>
                            {stats && (
                                <p className="text-sm text-gray-500">
                                    {stats.total} total bookings
                                </p>
                            )}
                        </div>
                    </div>
                </div>
            </header>

            <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {stats && (
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                        <div className="bg-white rounded-xl p-4 shadow-sm">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-indigo-100 rounded-lg">
                                    <Ticket className="h-5 w-5 text-indigo-600" />
                                </div>
                                <div>
                                    <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
                                    <p className="text-sm text-gray-500">Total</p>
                                </div>
                            </div>
                        </div>
                        <div className="bg-white rounded-xl p-4 shadow-sm">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-green-100 rounded-lg">
                                    <CheckCircle className="h-5 w-5 text-green-600" />
                                </div>
                                <div>
                                    <p className="text-2xl font-bold text-gray-900">{stats.confirmed}</p>
                                    <p className="text-sm text-gray-500">Confirmed</p>
                                </div>
                            </div>
                        </div>
                        <div className="bg-white rounded-xl p-4 shadow-sm">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-yellow-100 rounded-lg">
                                    <Clock className="h-5 w-5 text-yellow-600" />
                                </div>
                                <div>
                                    <p className="text-2xl font-bold text-gray-900">{stats.pending}</p>
                                    <p className="text-sm text-gray-500">Pending</p>
                                </div>
                            </div>
                        </div>
                        <div className="bg-white rounded-xl p-4 shadow-sm">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-red-100 rounded-lg">
                                    <XCircle className="h-5 w-5 text-red-600" />
                                </div>
                                <div>
                                    <p className="text-2xl font-bold text-gray-900">{stats.cancelled}</p>
                                    <p className="text-sm text-gray-500">Cancelled</p>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                <div className="bg-white rounded-xl shadow-sm mb-6">
                    <div className="border-b overflow-x-auto">
                        <div className="flex min-w-max">
                            {FILTER_TABS.map((tab) => (
                                <button
                                    key={tab.value}
                                    type="button"
                                    onClick={() => handleTabChange(tab.value)}
                                    className={`px-6 py-3 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
                                        activeTab === tab.value
                                            ? "border-indigo-600 text-indigo-600"
                                            : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                                    }`}
                                >
                                    {tab.label}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="p-4">
                        <div className="relative max-w-md">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                            <input
                                type="text"
                                placeholder="Search by booking code or event..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                            />
                        </div>
                    </div>
                </div>

                {isLoading && bookings.length > 0 && (
                    <div className="flex justify-center py-4">
                        <Loader2 className="h-6 w-6 text-indigo-600 animate-spin" />
                    </div>
                )}

                {filteredBookings.length === 0 ? (
                    <div className="bg-white rounded-xl shadow-sm p-12 text-center">
                        <Ticket className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                        <h3 className="text-lg font-medium text-gray-900 mb-2">No bookings found</h3>
                        <p className="text-gray-500 mb-6">
                            {activeTab === "all"
                                ? "You haven't made any bookings yet."
                                : `No ${activeTab} bookings found.`}
                        </p>
                        <Link
                            href="/events"
                            className="inline-flex items-center gap-2 px-6 py-3 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 transition-colors"
                        >
                            Browse Events
                            <ChevronRight className="h-4 w-4" />
                        </Link>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {filteredBookings.map((booking) => {
                            const statusConfig = STATUS_CONFIG[booking.status] || STATUS_CONFIG.PENDING;
                            const StatusIcon = statusConfig.icon;

                            return (
                                <div
                                    key={booking.id}
                                    className="bg-white rounded-xl shadow-sm overflow-hidden hover:shadow-md transition-shadow"
                                >
                                    <div className="flex flex-col md:flex-row">
                                        <div className="md:w-48 h-32 md:h-auto relative">
                                            <img
                                                src={booking.event.posterImage || "/placeholder.jpg"}
                                                alt={booking.event.title}
                                                className="w-full h-full object-cover"
                                            />
                                            <div className="absolute top-2 left-2">
                                                <span
                                                    className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${statusConfig.color}`}
                                                >
                                                    <StatusIcon className="h-3 w-3" />
                                                    {statusConfig.label}
                                                </span>
                                            </div>
                                        </div>

                                        <div className="flex-1 p-4 md:p-6">
                                            <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                                                <div className="flex-1">
                                                    <div className="flex items-center gap-2 mb-1">
                                                        <span className="text-sm text-gray-500 font-mono">
                                                            {booking.bookingCode}
                                                        </span>
                                                    </div>
                                                    <h3 className="text-lg font-bold text-gray-900 mb-2">
                                                        <Link
                                                            href={`/events/${booking.event.slug}`}
                                                            className="hover:text-indigo-600"
                                                        >
                                                            {booking.event.title}
                                                        </Link>
                                                    </h3>

                                                    <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500">
                                                        {booking.eventSchedule && (
                                                            <div className="flex items-center gap-1">
                                                                <Calendar className="h-4 w-4" />
                                                                <span>
                                                                    {formatDate(booking.eventSchedule.scheduleDate)}
                                                                </span>
                                                                <span className="text-gray-300">•</span>
                                                                <span>
                                                                    {formatTime(booking.eventSchedule.startTime)}
                                                                </span>
                                                            </div>
                                                        )}
                                                        {booking.event.venue && (
                                                            <div className="flex items-center gap-1">
                                                                <MapPin className="h-4 w-4" />
                                                                <span>
                                                                    {booking.event.venue.name}, {booking.event.venue.city}
                                                                </span>
                                                            </div>
                                                        )}
                                                    </div>

                                                    <div className="mt-3 flex flex-wrap gap-2">
                                                        {booking.bookedTickets.slice(0, 3).map((ticket) => (
                                                            <span
                                                                key={ticket.id}
                                                                className={`inline-flex items-center gap-1 px-2 py-1 rounded text-xs ${
                                                                    ticket.isCheckedIn
                                                                        ? "bg-green-100 text-green-700"
                                                                        : "bg-gray-100 text-gray-700"
                                                                }`}
                                                            >
                                                                <Ticket className="h-3 w-3" />
                                                                {ticket.ticketType.name}
                                                                {ticket.isCheckedIn && " (Checked In)"}
                                                            </span>
                                                        ))}
                                                        {booking.bookedTickets.length > 3 && (
                                                            <span className="inline-flex items-center px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs">
                                                                +{booking.bookedTickets.length - 3} more
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>

                                                <div className="flex flex-row md:flex-col items-center md:items-end gap-4">
                                                    <div className="text-right">
                                                        <p className="text-sm text-gray-500">Total</p>
                                                        <p className="text-lg font-bold text-gray-900">
                                                            {formatCurrency(booking.totalAmount)}
                                                        </p>
                                                        <p className="text-xs text-gray-500">
                                                            {booking.totalTickets} ticket{booking.totalTickets > 1 ? "s" : ""}
                                                        </p>
                                                    </div>

                                                    <div className="flex gap-2">
                                                        {booking.status === "CONFIRMED" && (
                                                            <Link
                                                                href={`/my-bookings/${booking.id}`}
                                                                className="inline-flex items-center gap-1 px-3 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 transition-colors"
                                                            >
                                                                <QrCode className="h-4 w-4" />
                                                                View Tickets
                                                            </Link>
                                                        )}
                                                        {booking.status === "AWAITING_PAYMENT" && (
                                                            <Link
                                                                href={`/checkout/payment/${booking.id}`}
                                                                className="inline-flex items-center gap-1 px-3 py-2 bg-orange-600 text-white rounded-lg text-sm font-medium hover:bg-orange-700 transition-colors"
                                                            >
                                                                Pay Now
                                                            </Link>
                                                        )}
                                                        {(booking.status === "CONFIRMED" || booking.status === "PAID") && (
                                                            <button
                                                                type="button"
                                                                className="inline-flex items-center gap-1 px-3 py-2 border border-gray-300 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors"
                                                            >
                                                                <Download className="h-4 w-4" />
                                                                E-Ticket
                                                            </button>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>

                                            {booking.status === "AWAITING_PAYMENT" && booking.expiresAt && (
                                                <div className="mt-4 p-3 bg-orange-50 border border-orange-200 rounded-lg">
                                                    <p className="text-sm text-orange-700">
                                                        <Clock className="inline-block h-4 w-4 mr-1" />
                                                        Payment expires on {formatDate(booking.expiresAt)} at{" "}
                                                        {new Date(booking.expiresAt).toLocaleTimeString("id-ID", {
                                                            hour: "2-digit",
                                                            minute: "2-digit",
                                                        })}
                                                    </p>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}

                {pagination && pagination.totalPages > 1 && (
                    <div className="flex justify-center gap-2 mt-8">
                        <button
                            type="button"
                            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                            disabled={currentPage === 1}
                            className="px-4 py-2 border rounded-lg text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                        >
                            Previous
                        </button>
                        <div className="flex items-center gap-1">
                            {Array.from({ length: pagination.totalPages }, (_, i) => i + 1)
                                .filter((page) => {
                                    if (pagination.totalPages <= 7) return true;
                                    if (page === 1 || page === pagination.totalPages) return true;
                                    if (Math.abs(page - currentPage) <= 1) return true;
                                    return false;
                                })
                                .map((page, index, arr) => {
                                    const showEllipsis = index > 0 && page - arr[index - 1] > 1;
                                    return (
                                        <span key={page} className="flex items-center">
                                            {showEllipsis && (
                                                <span className="px-2 text-gray-400">...</span>
                                            )}
                                            <button
                                                type="button"
                                                onClick={() => setCurrentPage(page)}
                                                className={`w-10 h-10 rounded-lg text-sm font-medium ${
                                                    currentPage === page
                                                        ? "bg-indigo-600 text-white"
                                                        : "hover:bg-gray-100"
                                                }`}
                                            >
                                                {page}
                                            </button>
                                        </span>
                                    );
                                })}
                        </div>
                        <button
                            type="button"
                            onClick={() => setCurrentPage((p) => Math.min(pagination.totalPages, p + 1))}
                            disabled={currentPage === pagination.totalPages}
                            className="px-4 py-2 border rounded-lg text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                        >
                            Next
                        </button>
                    </div>
                )}
            </main>
        </div>
    );
}
