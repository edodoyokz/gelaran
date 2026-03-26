"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Image from "next/image";
import {
    TrendingUp,
    TrendingDown,
    DollarSign,
    CreditCard,
    Wallet,
    Clock,
    CheckCircle,
    Loader2,
    AlertCircle,
    ArrowUpRight,
    Calendar,
    Download,
} from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import { AdminHeader } from "@/components/admin/AdminHeader";

interface FinanceOverview {
    totalRevenue: number;
    platformRevenue: number;
    organizerRevenue: number;
    totalBookings: number;
}

interface ThisMonthStats {
    revenue: number;
    platformRevenue: number;
    growthPercent: number;
}

interface PayoutStats {
    pending: { count: number; amount: number };
    completed: { count: number; amount: number };
}

interface BookingByStatus {
    status: string;
    count: number;
    amount: number;
}

interface RecentTransaction {
    id: string;
    bookingCode: string;
    amount: number;
    platformRevenue: number;
    paidAt: string;
    eventTitle: string;
    customerName: string;
}

interface TopEvent {
    id: string;
    title: string;
    posterImage: string | null;
    bookingCount: number;
}

interface FinanceData {
    overview: FinanceOverview;
    thisMonth: ThisMonthStats;
    payouts: PayoutStats;
    bookingsByStatus: BookingByStatus[];
    recentTransactions: RecentTransaction[];
    topEvents: TopEvent[];
}

const STATUS_COLORS: Record<string, string> = {
    PENDING: "bg-gray-400",
    AWAITING_PAYMENT: "bg-yellow-400",
    PAID: "bg-blue-400",
    CONFIRMED: "bg-green-400",
    CANCELLED: "bg-red-400",
    REFUNDED: "bg-purple-400",
    EXPIRED: "bg-[var(--border)]",
};

export default function AdminFinancePage() {
    const router = useRouter();
    const [data, setData] = useState<FinanceData | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [isExporting, setIsExporting] = useState(false);

    const handleExport = async () => {
        if (!data) return;

        setIsExporting(true);
        try {
            const csvRows = [
                ["Finance Report", new Date().toLocaleDateString("id-ID")],
                [],
                ["Overview"],
                ["Total Revenue", data.overview.totalRevenue],
                ["Platform Revenue", data.overview.platformRevenue],
                ["Organizer Revenue", data.overview.organizerRevenue],
                ["Total Bookings", data.overview.totalBookings],
                [],
                ["This Month"],
                ["Revenue", data.thisMonth.revenue],
                ["Platform Revenue", data.thisMonth.platformRevenue],
                ["Growth %", data.thisMonth.growthPercent],
                [],
                ["Bookings by Status"],
                ["Status", "Count", "Amount"],
                ...data.bookingsByStatus.map(s => [s.status, s.count, s.amount]),
                [],
                ["Recent Transactions"],
                ["Booking Code", "Event", "Customer", "Amount", "Platform Revenue", "Date"],
                ...data.recentTransactions.map(tx => [
                    tx.bookingCode,
                    tx.eventTitle,
                    tx.customerName,
                    tx.amount,
                    tx.platformRevenue,
                    tx.paidAt ? new Date(tx.paidAt).toLocaleDateString("id-ID") : "-"
                ]),
            ];

            const csvContent = csvRows.map(row => row.join(",")).join("\n");
            const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
            const url = URL.createObjectURL(blob);
            const link = document.createElement("a");
            link.href = url;
            link.download = `finance-report-${new Date().toISOString().split("T")[0]}.csv`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            URL.revokeObjectURL(url);
        } finally {
            setIsExporting(false);
        }
    };

    const fetchData = useCallback(async () => {
        try {
            setIsLoading(true);
            const res = await fetch("/api/admin/finance");
            const result = await res.json();

            if (!res.ok) {
                if (res.status === 401) {
                    router.push("/login?returnUrl=/admin/finance");
                    return;
                }
                if (res.status === 403) {
                    router.push("/");
                    return;
                }
                setError(result.error?.message || "Failed to load finance data");
                return;
            }

            if (result.success) {
                setData(result.data);
            }
        } catch {
            setError("Failed to load finance data");
        } finally {
            setIsLoading(false);
        }
    }, [router]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    if (isLoading) {
        return (
            <div className="min-h-screen bg-[var(--bg-secondary)] flex items-center justify-center">
                <div className="text-center">
                    <Loader2 className="h-12 w-12 text-[var(--accent-primary)] animate-spin mx-auto mb-4" />
                    <p className="text-[var(--text-muted)]">Loading finance data...</p>
                </div>
            </div>
        );
    }

    if (error || !data) {
        return (
            <div className="min-h-screen bg-[var(--bg-secondary)] flex items-center justify-center">
                <div className="text-center">
                    <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
                    <p className="text-[var(--text-primary)] font-medium mb-2">{error || "Failed to load data"}</p>
                    <Link href="/admin" className="text-[var(--accent-primary)] hover:opacity-80">
                        Back to Dashboard
                    </Link>
                </div>
            </div>
        );
    }

    const totalBookingAmount = data.bookingsByStatus.reduce((sum, s) => sum + s.amount, 0);

    return (
        <>
            <AdminHeader 
                title="Finance Dashboard" 
                backHref="/admin"
                actions={
                    <button
                        type="button"
                        onClick={handleExport}
                        disabled={isExporting || !data}
                        className="inline-flex items-center gap-2 px-4 py-2 bg-[var(--accent-primary)] text-white rounded-lg text-sm font-medium hover:opacity-90 disabled:opacity-50"
                    >
                        {isExporting ? (
                            <>
                                <Loader2 className="h-4 w-4 animate-spin" />
                                Exporting...
                            </>
                        ) : (
                            <>
                                <Download className="h-4 w-4" />
                                Export CSV
                            </>
                        )}
                    </button>
                }
            />

            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                    <div className="bg-linear-to-br from-indigo-500 to-purple-600 rounded-2xl p-6 text-white">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="w-12 h-12 bg-[var(--surface)] border border-[var(--border)]/20 rounded-xl flex items-center justify-center">
                                <DollarSign className="h-6 w-6" />
                            </div>
                        </div>
                        <p className="text-3xl font-bold">{formatCurrency(data.overview.totalRevenue)}</p>
                        <p className="text-white/80 mt-1">Total Revenue</p>
                    </div>

                    <div className="bg-[var(--surface)] border border-[var(--border)] rounded-2xl p-6 shadow-sm">
                        <div className="flex items-center justify-between mb-4">
                            <div className="w-12 h-12 bg-green-500/10 rounded-xl flex items-center justify-center">
                                <TrendingUp className="h-6 w-6 text-green-600" />
                            </div>
                            <span className={`inline-flex items-center gap-1 px-2 py-1 text-xs font-medium rounded-full ${
                                data.thisMonth.growthPercent >= 0
                                    ? "bg-green-500/10 text-green-600"
                                    : "bg-red-500/10 text-red-500"
                            }`}>
                                {data.thisMonth.growthPercent >= 0 ? (
                                    <TrendingUp className="h-3 w-3" />
                                ) : (
                                    <TrendingDown className="h-3 w-3" />
                                )}
                                {Math.abs(data.thisMonth.growthPercent)}%
                            </span>
                        </div>
                        <p className="text-2xl font-bold text-[var(--text-primary)]">{formatCurrency(data.thisMonth.revenue)}</p>
                        <p className="text-[var(--text-muted)] mt-1">This Month</p>
                    </div>

                    <div className="bg-[var(--surface)] border border-[var(--border)] rounded-2xl p-6 shadow-sm">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="w-12 h-12 bg-purple-500/10 rounded-xl flex items-center justify-center">
                                <CreditCard className="h-6 w-6 text-purple-600" />
                            </div>
                        </div>
                        <p className="text-2xl font-bold text-[var(--text-primary)]">{formatCurrency(data.overview.platformRevenue)}</p>
                        <p className="text-[var(--text-muted)] mt-1">Platform Revenue</p>
                    </div>

                    <div className="bg-[var(--surface)] border border-[var(--border)] rounded-2xl p-6 shadow-sm">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="w-12 h-12 bg-yellow-500/10 rounded-xl flex items-center justify-center">
                                <Wallet className="h-6 w-6 text-yellow-600" />
                            </div>
                        </div>
                        <p className="text-2xl font-bold text-[var(--text-primary)]">{data.overview.totalBookings}</p>
                        <p className="text-[var(--text-muted)] mt-1">Total Bookings</p>
                    </div>
                </div>

                <div className="grid lg:grid-cols-3 gap-6 mb-8">
                    <div className="lg:col-span-2 bg-[var(--surface)] border border-[var(--border)] rounded-2xl shadow-sm overflow-hidden">
                        <div className="px-6 py-4 border-b border-[var(--border)]">
                            <h2 className="text-lg font-semibold text-[var(--text-primary)]">Bookings by Status</h2>
                        </div>
                        <div className="p-6">
                            <div className="h-4 bg-[var(--bg-secondary)] rounded-full overflow-hidden flex mb-4">
                                {data.bookingsByStatus.map((status) => (
                                    <div
                                        key={status.status}
                                        className={`${STATUS_COLORS[status.status] || "bg-gray-400"}`}
                                        style={{ width: `${(status.amount / totalBookingAmount) * 100}%` }}
                                        title={`${status.status}: ${formatCurrency(status.amount)}`}
                                    />
                                ))}
                            </div>
                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                                {data.bookingsByStatus.map((status) => (
                                    <div key={status.status} className="text-center">
                                        <div className="flex items-center justify-center gap-2 mb-1">
                                            <div className={`w-3 h-3 rounded-full ${STATUS_COLORS[status.status] || "bg-gray-400"}`} />
                                            <span className="text-xs text-[var(--text-muted)]">{status.status}</span>
                                        </div>
                                        <p className="font-semibold text-[var(--text-primary)]">{status.count}</p>
                                        <p className="text-xs text-[var(--text-muted)]">{formatCurrency(status.amount)}</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    <div className="bg-[var(--surface)] border border-[var(--border)] rounded-2xl shadow-sm overflow-hidden">
                        <div className="px-6 py-4 border-b border-[var(--border)]">
                            <h2 className="text-lg font-semibold text-[var(--text-primary)]">Payouts</h2>
                        </div>
                        <div className="p-6 space-y-4">
                            <div className="flex items-center justify-between p-4 bg-yellow-500/10 rounded-xl">
                                <div className="flex items-center gap-3">
                                    <Clock className="h-5 w-5 text-yellow-600" />
                                    <div>
                                        <p className="font-medium text-[var(--text-primary)]">Pending</p>
                                        <p className="text-sm text-[var(--text-muted)]">{data.payouts.pending.count} requests</p>
                                    </div>
                                </div>
                                <p className="font-bold text-[var(--text-primary)]">{formatCurrency(data.payouts.pending.amount)}</p>
                            </div>
                            <div className="flex items-center justify-between p-4 bg-green-500/10 rounded-xl">
                                <div className="flex items-center gap-3">
                                    <CheckCircle className="h-5 w-5 text-green-600" />
                                    <div>
                                        <p className="font-medium text-[var(--text-primary)]">Completed</p>
                                        <p className="text-sm text-[var(--text-muted)]">{data.payouts.completed.count} payouts</p>
                                    </div>
                                </div>
                                <p className="font-bold text-[var(--text-primary)]">{formatCurrency(data.payouts.completed.amount)}</p>
                            </div>
                            <Link
                                href="/admin/payouts"
                                className="flex items-center justify-center gap-2 w-full py-3 text-[var(--accent-primary)] font-medium hover:bg-[var(--accent-primary)]/10 rounded-lg transition-colors"
                            >
                                View All Payouts
                                <ArrowUpRight className="h-4 w-4" />
                            </Link>
                        </div>
                    </div>
                </div>

                <div className="grid lg:grid-cols-3 gap-6">
                    <div className="lg:col-span-2 bg-[var(--surface)] border border-[var(--border)] rounded-2xl shadow-sm overflow-hidden">
                        <div className="px-6 py-4 border-b border-[var(--border)] flex items-center justify-between">
                            <h2 className="text-lg font-semibold text-[var(--text-primary)]">Recent Transactions</h2>
                            <Link href="/admin/bookings" className="text-[var(--accent-primary)] text-sm font-medium hover:opacity-80">
                                View All
                            </Link>
                        </div>
                        <div className="divide-y">
                            {data.recentTransactions.length === 0 ? (
                                <div className="p-8 text-center text-[var(--text-muted)]">
                                    No transactions yet
                                </div>
                            ) : (
                                data.recentTransactions.map((tx) => (
                                    <div key={tx.id} className="px-6 py-4 flex items-center justify-between">
                                        <div className="flex items-center gap-4">
                                            <div className="w-10 h-10 bg-green-500/10 rounded-lg flex items-center justify-center">
                                                <DollarSign className="h-5 w-5 text-green-600" />
                                            </div>
                                            <div>
                                                <p className="font-medium text-[var(--text-primary)]">{tx.bookingCode}</p>
                                                <p className="text-sm text-[var(--text-muted)] line-clamp-1">{tx.eventTitle}</p>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <p className="font-medium text-[var(--text-primary)]">{formatCurrency(tx.amount)}</p>
                                            <p className="text-xs text-[var(--text-muted)] flex items-center justify-end gap-1">
                                                <Calendar className="h-3 w-3" />
                                                {tx.paidAt ? new Date(tx.paidAt).toLocaleDateString("id-ID") : "-"}
                                            </p>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>

                    <div className="bg-[var(--surface)] border border-[var(--border)] rounded-2xl shadow-sm overflow-hidden">
                        <div className="px-6 py-4 border-b border-[var(--border)]">
                            <h2 className="text-lg font-semibold text-[var(--text-primary)]">Top Events</h2>
                        </div>
                        <div className="divide-y">
                            {data.topEvents.length === 0 ? (
                                <div className="p-8 text-center text-[var(--text-muted)]">
                                    No events yet
                                </div>
                            ) : (
                                data.topEvents.map((event, index) => (
                                    <div key={event.id} className="px-6 py-4 flex items-center gap-4">
                                        <span className="text-lg font-bold text-[var(--text-muted)] w-6">{index + 1}</span>
                                        <Image
                                            src={event.posterImage || "/placeholder.jpg"}
                                            alt=""
                                            width={48}
                                            height={48}
                                            className="object-cover rounded-lg"
                                        />
                                        <div className="flex-1 min-w-0">
                                            <p className="font-medium text-[var(--text-primary)] line-clamp-1">{event.title}</p>
                                            <p className="text-sm text-[var(--text-muted)]">{event.bookingCount} bookings</p>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </div>
            </main>
        </>
    );
}
