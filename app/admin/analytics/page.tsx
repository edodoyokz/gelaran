"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
    ArrowRight,
    BarChart3,
    CalendarRange,
    CreditCard,
    Loader2,
    TrendingUp,
    Wallet,
} from "lucide-react";
import {
    AdminFilterBar,
    AdminMetricCard,
    AdminNotice,
    AdminStatusBadge,
    AdminSurface,
    AdminWorkspacePage,
} from "@/components/admin/admin-workspace";
import { DateRangeFilter, type DateRangePreset } from "@/components/admin/DateRangeFilter";
import { RevenueTrendChart } from "@/components/admin/RevenueTrendChart";
import { formatCurrency } from "@/lib/utils";

interface AnalyticsData {
    overview: {
        totalTransactions: number;
        platformRevenue: number;
        organizerRevenue: number;
        totalBookings: number;
    };
    thisMonth: {
        revenue: number;
        platformRevenue: number;
        growthPercent: number;
    };
    payouts: {
        pending: {
            count: number;
            amount: number;
        };
        completed: {
            count: number;
            amount: number;
        };
    };
    bookingsByStatus: {
        status: string;
        count: number;
        amount: number;
    }[];
    recentTransactions: {
        id: string;
        bookingCode: string;
        amount: number;
        platformRevenue: number;
        paidAt: string;
        eventTitle: string;
        customerName: string;
    }[];
    topEvents: {
        id: string;
        title: string;
        posterImage: string | null;
        bookingCount: number;
    }[];
    revenueTrend: Array<{
        date: string;
        platformRevenue: number;
        organizerRevenue: number;
    }>;
}

const statusToneMap: Record<string, "default" | "success" | "warning" | "danger" | "accent"> = {
    PAID: "success",
    CONFIRMED: "accent",
    PENDING: "warning",
    CANCELLED: "danger",
    REFUNDED: "default",
};

export default function AdminAnalyticsPage() {
    const [data, setData] = useState<AnalyticsData | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [dateRange, setDateRange] = useState<{
        from: Date;
        to: Date;
        preset?: DateRangePreset;
    }>({
        from: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
        to: new Date(),
        preset: "30d",
    });

    useEffect(() => {
        const loadData = async () => {
            try {
                setIsLoading(true);
                setError(null);
                const fromStr = dateRange.from.toISOString();
                const toStr = dateRange.to.toISOString();
                const res = await fetch(`/api/admin/finance?from=${fromStr}&to=${toStr}`);
                const resData = await res.json();

                if (!res.ok || !resData.success) {
                    setError(resData.error?.message || "Failed to load analytics data");
                    return;
                }

                setData(resData.data);
            } catch {
                setError("Failed to load analytics data");
            } finally {
                setIsLoading(false);
            }
        };

        loadData();
    }, [dateRange]);

    const growthCopy = useMemo(() => {
        if (!data) return "No month-over-month comparison available.";
        const growth = data.thisMonth.growthPercent;
        if (growth > 0) return `${growth}% growth compared with the previous month.`;
        if (growth < 0) return `${Math.abs(growth)}% lower than the previous month.`;
        return "Revenue is stable compared with the previous month.";
    }, [data]);

    if (isLoading) {
        return (
            <div className="flex min-h-[60vh] items-center justify-center">
                <div className="text-center">
                    <Loader2 className="mx-auto h-10 w-10 animate-spin text-(--accent-primary)" />
                    <p className="mt-4 text-sm text-(--text-secondary)">Loading analytics workspace…</p>
                </div>
            </div>
        );
    }

    if (error || !data) {
        return (
            <AdminWorkspacePage
                eyebrow="Admin analytics"
                title="Revenue and activity intelligence"
                description="Track commercial health, payout pressure, and booking behavior across the Gelaran platform."
            >
                <AdminNotice
                    tone="warning"
                    title="Analytics data is unavailable"
                    description={error || "The analytics API did not return a valid payload."}
                    actionHref="/admin"
                    actionLabel="Back to dashboard"
                />
            </AdminWorkspacePage>
        );
    }

    return (
        <AdminWorkspacePage
            eyebrow="Admin analytics"
            title="Revenue and activity intelligence"
            description="Track commercial health, payout pressure, and booking behavior across the Gelaran platform."
            actions={<DateRangeFilter value={dateRange} onChange={setDateRange} />}
        >
            <AdminFilterBar>
                <div className="text-sm text-(--text-secondary)">
                    Selected window: <span className="font-semibold text-foreground">{dateRange.from.toLocaleDateString("id-ID")} – {dateRange.to.toLocaleDateString("id-ID")}</span>
                </div>
                <Link href="/admin/finance" className="inline-flex items-center gap-2 text-sm font-semibold text-(--accent-primary)">
                    Open finance workspace
                    <ArrowRight className="h-4 w-4" />
                </Link>
            </AdminFilterBar>

            <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                <AdminMetricCard label="Gross transactions" value={formatCurrency(data.overview.totalTransactions)} icon={Wallet} tone="accent" meta={growthCopy} />
                <AdminMetricCard label="Platform revenue" value={formatCurrency(data.overview.platformRevenue)} icon={TrendingUp} tone="success" meta={`Organizer revenue ${formatCurrency(data.overview.organizerRevenue)}`} />
                <AdminMetricCard label="Completed bookings" value={data.overview.totalBookings.toLocaleString("en-US")} icon={CreditCard} meta="Confirmed and paid orders in the selected range" />
                <AdminMetricCard label="This month" value={formatCurrency(data.thisMonth.revenue)} icon={CalendarRange} meta={`${data.thisMonth.growthPercent}% month-over-month`} />
            </section>

            <AdminNotice
                tone={data.payouts.pending.count > 0 ? "warning" : "success"}
                title={data.payouts.pending.count > 0 ? "Payout queue needs review" : "Payout queue is clear"}
                description={data.payouts.pending.count > 0 ? `${data.payouts.pending.count} pending payouts worth ${formatCurrency(data.payouts.pending.amount)} are waiting for action.` : "No payout backlog is currently blocking organizer settlement."}
                actionHref="/admin/payouts"
                actionLabel="Review payouts"
            />

            <section className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
                <AdminSurface title="Revenue trend" description="Platform versus organizer revenue over time for the selected date window.">
                    {data.revenueTrend.length > 0 ? (
                        <RevenueTrendChart data={data.revenueTrend} />
                    ) : (
                        <div className="rounded-2xl border border-dashed border-(--border) bg-(--surface-elevated) p-8 text-center text-sm text-(--text-secondary)">
                            No revenue trend data is available for this date range.
                        </div>
                    )}
                </AdminSurface>

                <AdminSurface title="Booking status mix" description="Status distribution within the same reporting window.">
                    <div className="space-y-4">
                        {data.bookingsByStatus.map((status) => {
                            const total = data.bookingsByStatus.reduce((sum, item) => sum + item.count, 0);
                            const percentage = total > 0 ? (status.count / total) * 100 : 0;
                            return (
                                <div key={status.status} className="space-y-2 rounded-2xl border border-(--border) bg-(--surface-elevated) p-4">
                                    <div className="flex items-center justify-between gap-3">
                                        <AdminStatusBadge label={status.status} tone={statusToneMap[status.status] || "default"} />
                                        <span className="text-sm font-semibold text-foreground">{status.count} · {percentage.toFixed(1)}%</span>
                                    </div>
                                    <div className="h-2 rounded-full bg-(--surface)">
                                        <div className="h-2 rounded-full bg-(--accent-gradient)" style={{ width: `${percentage}%` }} />
                                    </div>
                                    <p className="text-sm text-(--text-secondary)">{formatCurrency(status.amount)}</p>
                                </div>
                            );
                        })}
                    </div>
                </AdminSurface>
            </section>

            <section className="grid gap-6 xl:grid-cols-2">
                <AdminSurface title="Recent transactions" description="Latest paid orders visible in the reporting range.">
                    <div className="space-y-3">
                        {data.recentTransactions.map((transaction) => (
                            <div key={transaction.id} className="rounded-2xl border border-(--border) bg-(--surface-elevated) p-4">
                                <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                                    <div>
                                        <p className="text-sm font-semibold text-foreground">{transaction.eventTitle}</p>
                                        <p className="text-sm text-(--text-secondary)">{transaction.customerName || "Guest customer"} · {transaction.bookingCode}</p>
                                    </div>
                                    <div className="text-left md:text-right">
                                        <p className="text-sm font-semibold text-foreground">{formatCurrency(transaction.amount)}</p>
                                        <p className="text-xs text-(--text-muted)">{new Date(transaction.paidAt).toLocaleString("id-ID")}</p>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </AdminSurface>

                <AdminSurface title="Top events" description="Published events driving the highest booking activity.">
                    <div className="space-y-3">
                        {data.topEvents.map((event) => (
                            <div key={event.id} className="rounded-2xl border border-(--border) bg-(--surface-elevated) p-4">
                                <div className="flex items-center justify-between gap-3">
                                    <div className="min-w-0">
                                        <p className="truncate text-sm font-semibold text-foreground">{event.title}</p>
                                        <p className="text-sm text-(--text-secondary)">{event.bookingCount} bookings in range</p>
                                    </div>
                                    <BarChart3 className="h-5 w-5 text-(--accent-primary)" />
                                </div>
                            </div>
                        ))}
                    </div>
                </AdminSurface>
            </section>
        </AdminWorkspacePage>
    );
}
