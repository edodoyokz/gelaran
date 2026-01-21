"use client";

import { useState, useEffect } from "react";
import { AreaChart, BarChart, PieChart } from "@/components/ui/charts";
import { ChartSkeleton, Skeleton } from "@/components/ui/skeleton";
import { DateRangePicker } from "@/components/ui/date-picker/DateRangePicker";
import {
    TrendingUp,
    Users,
    Calendar,
    CreditCard,
    Clock,
} from "lucide-react";

interface ChartDataPoint {
    name: string;
    revenue: number;
    bookings: number;
    users: number;
    [key: string]: string | number;
}

interface CategoryData {
    name: string;
    value: number;
    color?: string;
    [key: string]: string | number | undefined;
}

interface ActivityItem {
    id: string;
    type: string;
    title: string;
    description: string;
    timestamp: string;
}

interface ChartData {
    revenueChart: ChartDataPoint[];
    categoryDistribution: CategoryData[];
    recentActivity: ActivityItem[];
}

const ACTIVITY_ICONS: Record<string, typeof TrendingUp> = {
    booking: CreditCard,
    user: Users,
    event: Calendar,
};

const ACTIVITY_COLORS: Record<string, string> = {
    booking: "bg-purple-500/10 text-purple-500",
    user: "bg-blue-500/10 text-blue-500",
    event: "bg-emerald-500/10 text-emerald-500",
};

export function AdminDashboardCharts() {
    const [data, setData] = useState<ChartData | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [period, setPeriod] = useState("30d");

    useEffect(() => {
        const fetchData = async () => {
            setIsLoading(true);
            try {
                const res = await fetch(`/api/admin/dashboard/chart-data?period=${period}`);
                const result = await res.json();
                if (result.success) {
                    setData(result.data);
                }
            } catch (error) {
                console.error("Failed to fetch chart data:", error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchData();
    }, [period]);

    const handleDateChange = (range: { from: Date; to: Date } | null, presetId?: string) => {
        if (presetId) {
            setPeriod(presetId);
        }
    };

    const formatCurrency = (value: number): string => {
        return new Intl.NumberFormat("id-ID", {
            style: "currency",
            currency: "IDR",
            minimumFractionDigits: 0,
            maximumFractionDigits: 0,
        }).format(value);
    };

    const formatTimeAgo = (timestamp: string): string => {
        const date = new Date(timestamp);
        const now = new Date();
        const diffMs = now.getTime() - date.getTime();
        const diffMins = Math.floor(diffMs / 60000);
        const diffHours = Math.floor(diffMs / 3600000);
        const diffDays = Math.floor(diffMs / 86400000);

        if (diffMins < 1) return "Baru saja";
        if (diffMins < 60) return `${diffMins} menit lalu`;
        if (diffHours < 24) return `${diffHours} jam lalu`;
        if (diffDays < 7) return `${diffDays} hari lalu`;
        return date.toLocaleDateString("id-ID", { day: "numeric", month: "short" });
    };

    if (isLoading) {
        return (
            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <Skeleton className="h-8 w-48" />
                    <Skeleton className="h-10 w-40" />
                </div>
                <div className="grid lg:grid-cols-3 gap-6">
                    <div className="lg:col-span-2">
                        <ChartSkeleton height={300} />
                    </div>
                    <ChartSkeleton height={300} />
                </div>
                <div className="rounded-xl p-6 shadow-[var(--shadow-sm)] bg-[var(--surface)] border border-[var(--border)]">
                    <Skeleton className="h-6 w-32 mb-4" />
                    <div className="space-y-4">
                        {[1, 2, 3, 4, 5].map((i) => (
                            <div key={i} className="flex items-center gap-3">
                                <Skeleton className="w-10 h-10 rounded-lg" />
                                <div className="flex-1">
                                    <Skeleton className="h-4 w-3/4 mb-1" />
                                    <Skeleton className="h-3 w-1/2" />
                                </div>
                                <Skeleton className="h-3 w-16" />
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        );
    }

    if (!data) return null;

    const totalRevenue = data.revenueChart.reduce((sum, d) => sum + d.revenue, 0);
    const totalBookings = data.revenueChart.reduce((sum, d) => sum + d.bookings, 0);
    const totalNewUsers = data.revenueChart.reduce((sum, d) => sum + d.users, 0);

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h2 className="text-lg font-bold text-[var(--text-primary)] flex items-center gap-2">
                        <TrendingUp className="w-5 h-5 text-[var(--accent-primary)]" />
                        Platform Analytics
                    </h2>
                    <p className="text-sm text-[var(--text-muted)] mt-0.5">
                        {formatCurrency(totalRevenue)} platform revenue • {totalBookings} bookings • {totalNewUsers} new users
                    </p>
                </div>
                <DateRangePicker
                    onChange={handleDateChange}
                    presets={["7d", "30d", "90d"]}
                />
            </div>

            <div className="grid lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 rounded-xl p-4 sm:p-6 shadow-[var(--shadow-sm)] bg-[var(--surface)] border border-[var(--border)]">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="font-semibold text-[var(--text-primary)]">Platform Revenue Trend</h3>
                        <div className="flex items-center gap-4 text-xs">
                            <span className="flex items-center gap-1.5">
                                <span className="w-3 h-3 rounded-full bg-indigo-500" />
                                Platform Revenue
                            </span>
                            <span className="flex items-center gap-1.5">
                                <span className="w-3 h-3 rounded-full bg-emerald-500" />
                                Bookings
                            </span>
                        </div>
                    </div>
                    <AreaChart
                        data={data.revenueChart}
                        dataKey="revenue"
                        height={280}
                        color="#6366f1"
                        formatTooltip={formatCurrency}
                    />
                </div>

                <div className="rounded-xl p-4 sm:p-6 shadow-[var(--shadow-sm)] bg-[var(--surface)] border border-[var(--border)]">
                    <h3 className="font-semibold text-[var(--text-primary)] mb-4">Events by Category</h3>
                    {data.categoryDistribution.length > 0 ? (
                        <PieChart
                            data={data.categoryDistribution}
                            height={280}
                            innerRadius={50}
                            outerRadius={90}
                            showLegend={true}
                            legendPosition="bottom"
                        />
                    ) : (
                        <div className="h-[280px] flex items-center justify-center text-[var(--text-muted)] text-sm">
                            No category data available
                        </div>
                    )}
                </div>
            </div>

            <div className="grid lg:grid-cols-2 gap-6">
                <div className="rounded-xl p-4 sm:p-6 shadow-[var(--shadow-sm)] bg-[var(--surface)] border border-[var(--border)]">
                    <h3 className="font-semibold text-[var(--text-primary)] mb-4">Bookings vs New Users</h3>
                    <BarChart
                        data={data.revenueChart.slice(-7)}
                        dataKey="bookings"
                        height={200}
                        color="#8b5cf6"
                        showYAxis={false}
                    />
                </div>

                <div className="rounded-xl shadow-[var(--shadow-sm)] bg-[var(--surface)] border border-[var(--border)]">
                    <div className="px-4 sm:px-6 py-4 border-b border-[var(--border)]">
                        <h3 className="font-semibold text-[var(--text-primary)] flex items-center gap-2">
                            <Clock className="w-4 h-4 text-[var(--text-muted)]" />
                            Recent Activity
                        </h3>
                    </div>
                    <div className="divide-y divide-[var(--border)] max-h-[260px] overflow-y-auto">
                        {data.recentActivity.length === 0 ? (
                            <div className="p-6 text-center text-[var(--text-muted)] text-sm">
                                No recent activity
                            </div>
                        ) : (
                            data.recentActivity.map((activity) => {
                                const Icon = ACTIVITY_ICONS[activity.type] || Calendar;
                                const colorClass = ACTIVITY_COLORS[activity.type] || "bg-gray-500/10 text-gray-500";
                                return (
                                    <div
                                        key={activity.id}
                                        className="px-4 sm:px-6 py-3 flex items-start gap-3 hover:bg-[var(--surface-hover)] transition-colors"
                                    >
                                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${colorClass}`}>
                                            <Icon className="w-4 h-4" />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm font-medium text-[var(--text-primary)] truncate">
                                                {activity.title}
                                            </p>
                                            <p className="text-xs text-[var(--text-muted)] truncate">
                                                {activity.description}
                                            </p>
                                        </div>
                                        <span className="text-xs text-[var(--text-muted)] flex-shrink-0">
                                            {formatTimeAgo(activity.timestamp)}
                                        </span>
                                    </div>
                                );
                            })
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
