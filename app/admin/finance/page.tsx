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
    ArrowUpRight,
    Calendar,
    Download,
} from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import {
    AdminMetricCard,
    AdminNotice,
    AdminSurface,
    AdminWorkspacePage,
} from "@/components/admin/admin-workspace";

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
    EXPIRED: "bg-(--border)",
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
                ...data.bookingsByStatus.map((s) => [s.status, s.count, s.amount]),
                [],
                ["Recent Transactions"],
                ["Booking Code", "Event", "Customer", "Amount", "Platform Revenue", "Date"],
                ...data.recentTransactions.map((tx) => [
                    tx.bookingCode,
                    tx.eventTitle,
                    tx.customerName,
                    tx.amount,
                    tx.platformRevenue,
                    tx.paidAt ? new Date(tx.paidAt).toLocaleDateString("id-ID") : "-",
                ]),
            ];

            const csvContent = csvRows.map((row) => row.join(",")).join("\n");
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
            <div className="flex min-h-[60vh] items-center justify-center">
                <Loader2 className="h-10 w-10 animate-spin text-(--accent-primary)" />
            </div>
        );
    }

    if (error || !data) {
        return (
            <AdminWorkspacePage eyebrow="Admin finance" title="Finance dashboard" description="Monitor revenue streams, payout exposure, and transactional health across the platform.">
                <AdminNotice tone="warning" title="Finance data is unavailable" description={error || "Failed to load data"} actionHref="/admin" actionLabel="Back to dashboard" />
            </AdminWorkspacePage>
        );
    }

    const totalBookingAmount = data.bookingsByStatus.reduce((sum, s) => sum + s.amount, 0);

    return (
        <AdminWorkspacePage
            eyebrow="Admin finance"
            title="Finance dashboard"
            description="Monitor revenue streams, payout exposure, and transactional health across the platform."
            actions={
                <button
                    type="button"
                    onClick={handleExport}
                    disabled={isExporting || !data}
                    className="inline-flex items-center gap-2 rounded-full border border-(--border) bg-(--surface) px-4 py-2 text-sm font-semibold text-foreground hover:bg-(--surface-elevated) disabled:opacity-50"
                >
                    {isExporting ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                        <Download className="h-4 w-4" />
                    )}
                    Export CSV
                </button>
            }
        >
            <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                <AdminMetricCard
                    label="Total revenue"
                    value={formatCurrency(data.overview.totalRevenue)}
                    icon={DollarSign}
                    tone="accent"
                    meta="All-time gross platform revenue"
                />
                <AdminMetricCard
                    label="This month"
                    value={formatCurrency(data.thisMonth.revenue)}
                    icon={data.thisMonth.growthPercent >= 0 ? TrendingUp : TrendingDown}
                    tone={data.thisMonth.growthPercent >= 0 ? "success" : "default"}
                    meta={`${data.thisMonth.growthPercent >= 0 ? "+" : ""}${data.thisMonth.growthPercent}% vs last month`}
                />
                <AdminMetricCard
                    label="Platform revenue"
                    value={formatCurrency(data.overview.platformRevenue)}
                    icon={CreditCard}
                    meta="Net commission retained"
                />
                <AdminMetricCard
                    label="Total bookings"
                    value={data.overview.totalBookings.toLocaleString("en-US")}
                    icon={Wallet}
                    meta="All-time booking count"
                />
            </section>

            <section className="grid lg:grid-cols-3 gap-6">
                <AdminSurface title="Bookings by status" description="Revenue breakdown across booking lifecycle stages." className="lg:col-span-2">
                    <div className="h-3 bg-(--surface-elevated) rounded-full overflow-hidden flex mb-4">
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
                                    <div className={`w-2.5 h-2.5 rounded-full ${STATUS_COLORS[status.status] || "bg-gray-400"}`} />
                                    <span className="text-xs text-(--text-muted)">{status.status}</span>
                                </div>
                                <p className="font-semibold text-foreground">{status.count}</p>
                                <p className="text-xs text-(--text-muted)">{formatCurrency(status.amount)}</p>
                            </div>
                        ))}
                    </div>
                </AdminSurface>

                <AdminSurface title="Payout exposure" description="Pending and completed payout volumes.">
                    <div className="space-y-3">
                        <div className="flex items-center justify-between p-4 bg-yellow-500/10 rounded-xl">
                            <div className="flex items-center gap-3">
                                <Clock className="h-5 w-5 text-yellow-600" />
                                <div>
                                    <p className="font-semibold text-foreground text-sm">Pending</p>
                                    <p className="text-xs text-(--text-muted)">{data.payouts.pending.count} requests</p>
                                </div>
                            </div>
                            <p className="font-bold text-foreground text-sm">{formatCurrency(data.payouts.pending.amount)}</p>
                        </div>
                        <div className="flex items-center justify-between p-4 bg-green-500/10 rounded-xl">
                            <div className="flex items-center gap-3">
                                <CheckCircle className="h-5 w-5 text-green-600" />
                                <div>
                                    <p className="font-semibold text-foreground text-sm">Completed</p>
                                    <p className="text-xs text-(--text-muted)">{data.payouts.completed.count} payouts</p>
                                </div>
                            </div>
                            <p className="font-bold text-foreground text-sm">{formatCurrency(data.payouts.completed.amount)}</p>
                        </div>
                        <Link
                            href="/admin/payouts"
                            className="flex items-center justify-center gap-2 w-full py-2.5 text-sm font-semibold text-(--accent-primary) hover:bg-(--accent-primary)/10 rounded-xl transition-colors"
                        >
                            View all payouts
                            <ArrowUpRight className="h-4 w-4" />
                        </Link>
                    </div>
                </AdminSurface>
            </section>

            <section className="grid lg:grid-cols-3 gap-6">
                <AdminSurface title="Recent transactions" description="Latest confirmed payments across the platform." className="lg:col-span-2">
                    <div className="flex justify-end mb-3">
                        <Link href="/admin/bookings" className="text-sm font-semibold text-(--accent-primary) hover:opacity-80">
                            View all →
                        </Link>
                    </div>
                    {data.recentTransactions.length === 0 ? (
                        <p className="text-center text-(--text-muted) py-8">No transactions yet</p>
                    ) : (
                        <div className="divide-y divide-(--border)">
                            {data.recentTransactions.map((tx) => (
                                <div key={tx.id} className="py-4 flex items-center justify-between gap-4">
                                    <div className="flex items-center gap-4">
                                        <div className="w-10 h-10 bg-green-500/10 rounded-xl flex items-center justify-center shrink-0">
                                            <DollarSign className="h-5 w-5 text-green-600" />
                                        </div>
                                        <div>
                                            <p className="font-semibold text-foreground text-sm">{tx.bookingCode}</p>
                                            <p className="text-xs text-(--text-muted) line-clamp-1">{tx.eventTitle}</p>
                                        </div>
                                    </div>
                                    <div className="text-right shrink-0">
                                        <p className="font-semibold text-foreground text-sm">{formatCurrency(tx.amount)}</p>
                                        <p className="text-xs text-(--text-muted) flex items-center justify-end gap-1">
                                            <Calendar className="h-3 w-3" />
                                            {tx.paidAt ? new Date(tx.paidAt).toLocaleDateString("id-ID") : "-"}
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </AdminSurface>

                <AdminSurface title="Top events" description="Events ranked by booking volume.">
                    {data.topEvents.length === 0 ? (
                        <p className="text-center text-(--text-muted) py-8">No events yet</p>
                    ) : (
                        <div className="divide-y divide-(--border)">
                            {data.topEvents.map((event, index) => (
                                <div key={event.id} className="py-4 flex items-center gap-4">
                                    <span className="text-lg font-bold text-(--text-muted) w-5 shrink-0">{index + 1}</span>
                                    <Image
                                        src={event.posterImage || "/placeholder.jpg"}
                                        alt=""
                                        width={40}
                                        height={40}
                                        className="object-cover rounded-lg shrink-0"
                                    />
                                    <div className="flex-1 min-w-0">
                                        <p className="font-semibold text-foreground text-sm line-clamp-1">{event.title}</p>
                                        <p className="text-xs text-(--text-muted)">{event.bookingCount} bookings</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </AdminSurface>
            </section>
        </AdminWorkspacePage>
    );
}
