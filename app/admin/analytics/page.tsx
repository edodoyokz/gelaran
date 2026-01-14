"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
    TrendingUp,
    DollarSign,
    Users,
    Calendar,
    ArrowUp,
    ArrowDown,
    Loader2,
    AlertCircle,
    BarChart3,
    PieChart,
    Download,
} from "lucide-react";
import { AdminHeader } from "@/components/admin/AdminHeader";
import { formatCurrency } from "@/lib/utils";

interface AnalyticsData {
    overview: {
        totalRevenue: number;
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
}

const STATUS_COLORS: Record<string, string> = {
    PENDING: "bg-yellow-100 text-yellow-700",
    CONFIRMED: "bg-blue-100 text-blue-700",
    PAID: "bg-green-100 text-green-700",
    CANCELLED: "bg-red-100 text-red-700",
    REFUNDED: "bg-red-100 text-red-700",
};

const STATUS_LABELS: Record<string, string> = {
    PENDING: "Menunggu",
    CONFIRMED: "Dikonfirmasi",
    PAID: "Dibayar",
    CANCELLED: "Dibatalkan",
    REFUNDED: "Dikembalikan",
};

export default function AdminAnalyticsPage() {
    const [data, setData] = useState<AnalyticsData | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const loadData = async () => {
            try {
                setIsLoading(true);
                const res = await fetch("/api/admin/finance");
                const resData = await res.json();

                if (!resData.success) {
                    setError(resData.error?.message || "Gagal memuat data");
                    return;
                }

                setData(resData.data);
            } catch {
                setError("Terjadi kesalahan saat memuat data");
            } finally {
                setIsLoading(false);
            }
        };

        loadData();
    }, []);

    if (isLoading) {
        return (
            <div className="min-h-screen bg-gray-100 flex items-center justify-center">
                <div className="text-center">
                    <Loader2 className="h-12 w-12 text-indigo-600 animate-spin mx-auto mb-4" />
                    <p className="text-gray-500">Memuat data analitik...</p>
                </div>
            </div>
        );
    }

    if (error || !data) {
        return (
            <div className="min-h-screen bg-gray-100 flex items-center justify-center">
                <div className="text-center">
                    <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
                    <p className="text-gray-900 font-medium mb-2">{error || "Data tidak tersedia"}</p>
                    <Link href="/admin" className="text-indigo-600 hover:text-indigo-500">
                        Kembali ke Dashboard
                    </Link>
                </div>
            </div>
        );
    }

    const growthPercent = data.thisMonth.growthPercent;
    const isPositiveGrowth = growthPercent >= 0;

    return (
        <>
            <AdminHeader title="Analitik Dashboard" backHref="/admin" />

            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                    <StatCard
                        title="Total Pendapatan"
                        value={formatCurrency(data.overview.totalRevenue)}
                        icon={DollarSign}
                        color="green"
                    />
                    <StatCard
                        title="Pendapatan Platform"
                        value={formatCurrency(data.overview.platformRevenue)}
                        icon={TrendingUp}
                        color="indigo"
                    />
                    <StatCard
                        title="Total Booking"
                        value={data.overview.totalBookings.toString()}
                        icon={Users}
                        color="purple"
                    />
                    <StatCard
                        title="Bulan Ini"
                        value={formatCurrency(data.thisMonth.revenue)}
                        icon={Calendar}
                        color="blue"
                        change={{
                            value: `${Math.abs(growthPercent)}%`,
                            isPositive: isPositiveGrowth,
                        }}
                    />
                </div>

                <div className="grid lg:grid-cols-2 gap-6 mb-8">
                    <div className="bg-white rounded-xl shadow-sm p-6">
                        <h2 className="text-lg font-semibold text-gray-900 mb-4">Payouts</h2>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="p-4 bg-yellow-50 rounded-lg">
                                <p className="text-sm text-gray-500 mb-1">Pending</p>
                                <p className="text-2xl font-bold text-yellow-700">
                                    {formatCurrency(data.payouts.pending.amount)}
                                </p>
                                <p className="text-xs text-gray-500 mt-1">{data.payouts.pending.count} payout</p>
                            </div>
                            <div className="p-4 bg-green-50 rounded-lg">
                                <p className="text-sm text-gray-500 mb-1">Selesai</p>
                                <p className="text-2xl font-bold text-green-700">
                                    {formatCurrency(data.payouts.completed.amount)}
                                </p>
                                <p className="text-xs text-gray-500 mt-1">{data.payouts.completed.count} payout</p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-xl shadow-sm p-6">
                        <h2 className="text-lg font-semibold text-gray-900 mb-4">Status Booking</h2>
                        <div className="space-y-3">
                            {data.bookingsByStatus.map((status) => (
                                <div key={status.status} className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <span
                                            className={`px-2 py-0.5 text-xs font-medium rounded-full ${STATUS_COLORS[status.status]}`}
                                        >
                                            {STATUS_LABELS[status.status] || status.status}
                                        </span>
                                    </div>
                                    <div className="text-right">
                                        <p className="font-semibold text-gray-900">{status.count}</p>
                                        <p className="text-xs text-gray-500">{formatCurrency(status.amount)}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                <div className="grid lg:grid-cols-2 gap-6">
                    <div className="bg-white rounded-xl shadow-sm overflow-hidden">
                        <div className="p-6 border-b flex items-center justify-between">
                            <h2 className="text-lg font-semibold">Transaksi Terbaru</h2>
                            <Link
                                href="/admin/bookings"
                                className="text-sm text-indigo-600 hover:text-indigo-500"
                            >
                                Lihat Semua
                            </Link>
                        </div>
                        <div className="divide-y max-h-[400px] overflow-y-auto">
                            {data.recentTransactions.length === 0 ? (
                                <div className="p-12 text-center text-gray-500">
                                    <Loader2 className="h-8 w-8 mx-auto mb-4 opacity-50" />
                                    <p>Belum ada transaksi</p>
                                </div>
                            ) : (
                                data.recentTransactions.map((tx) => (
                                    <div key={tx.id} className="p-4 hover:bg-gray-50">
                                        <div className="flex items-start justify-between mb-2">
                                            <div>
                                                <p className="font-medium text-gray-900">{tx.customerName}</p>
                                                <p className="text-sm text-gray-500">{tx.eventTitle}</p>
                                            </div>
                                            <p className="font-semibold text-gray-900">
                                                {formatCurrency(tx.amount)}
                                            </p>
                                        </div>
                                        <div className="flex items-center justify-between text-xs text-gray-500">
                                            <span>{tx.bookingCode}</span>
                                            <span>
                                                {new Date(tx.paidAt).toLocaleDateString("id-ID", {
                                                    day: "numeric",
                                                    month: "short",
                                                    year: "numeric",
                                                    hour: "2-digit",
                                                    minute: "2-digit",
                                                })}
                                            </span>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>

                    <div className="bg-white rounded-xl shadow-sm overflow-hidden">
                        <div className="p-6 border-b flex items-center justify-between">
                            <h2 className="text-lg font-semibold">Event Terpopuler</h2>
                            <Link
                                href="/admin/events"
                                className="text-sm text-indigo-600 hover:text-indigo-500"
                            >
                                Lihat Semua
                            </Link>
                        </div>
                        <div className="divide-y max-h-[400px] overflow-y-auto">
                            {data.topEvents.length === 0 ? (
                                <div className="p-12 text-center text-gray-500">
                                    <BarChart3 className="h-8 w-8 mx-auto mb-4 opacity-50" />
                                    <p>Belum ada data event</p>
                                </div>
                            ) : (
                                data.topEvents.map((event) => (
                                    <div key={event.id} className="p-4 hover:bg-gray-50">
                                        <div className="flex items-center gap-3">
                                            {event.posterImage ? (
                                                <img
                                                    src={event.posterImage}
                                                    alt={event.title}
                                                    className="w-12 h-12 rounded-lg object-cover"
                                                />
                                            ) : (
                                                <div className="w-12 h-12 bg-gray-200 rounded-lg flex items-center justify-center">
                                                    <Calendar className="h-6 w-6 text-gray-400" />
                                                </div>
                                            )}
                                            <div className="flex-1 min-w-0">
                                                <p className="font-medium text-gray-900 truncate">{event.title}</p>
                                                <p className="text-sm text-gray-500">{event.bookingCount} booking</p>
                                            </div>
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

interface StatCardProps {
    title: string;
    value: string;
    icon: React.ElementType;
    color: "green" | "indigo" | "purple" | "blue";
    change?: {
        value: string;
        isPositive: boolean;
    };
}

function StatCard({ title, value, icon: Icon, color, change }: StatCardProps) {
    const colorMap: Record<string, { bg: string; icon: string }> = {
        green: { bg: "bg-green-100", icon: "text-green-600" },
        indigo: { bg: "bg-indigo-100", icon: "text-indigo-600" },
        purple: { bg: "bg-purple-100", icon: "text-purple-600" },
        blue: { bg: "bg-blue-100", icon: "text-blue-600" },
    };

    const colors = colorMap[color];

    return (
        <div className="bg-white rounded-xl p-6 shadow-sm">
            <div className="flex items-center justify-between mb-4">
                <div className={`w-12 h-12 ${colors.bg} rounded-lg flex items-center justify-center`}>
                    <Icon className={`h-6 w-6 ${colors.icon}`} />
                </div>
                {change && (
                    <div
                        className={`flex items-center gap-1 text-sm font-medium ${
                            change.isPositive ? "text-green-600" : "text-red-600"
                        }`}
                    >
                        {change.isPositive ? (
                            <ArrowUp className="h-4 w-4" />
                        ) : (
                            <ArrowDown className="h-4 w-4" />
                        )}
                        {change.value}
                    </div>
                )}
            </div>
            <p className="text-2xl font-bold text-gray-900">{value}</p>
            <p className="text-sm text-gray-500">{title}</p>
        </div>
    );
}
