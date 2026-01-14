"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
    BarChart3,
    TrendingUp,
    DollarSign,
    Ticket,
    Users,
    Calendar,
    Clock,
    ArrowLeft,
    Loader2,
    AlertCircle,
    Download,
    RefreshCw,
} from "lucide-react";
import { formatCurrency } from "@/lib/utils";

interface EventAnalytics {
    totalTickets: number;
    soldTickets: number;
    reservedTickets: number;
    availableTickets: number;
    totalRevenue: number;
    organizerRevenue: number;
    totalBookings: number;
    checkedInCount: number;
    conversionRate: number;
}

interface TicketTypeStats {
    id: string;
    name: string;
    totalQuantity: number;
    soldQuantity: number;
    availableQuantity: number;
    revenue: number;
    averagePrice: number;
}

interface DailySales {
    date: string;
    sales: number;
    revenue: number;
}

interface EventData {
    id: string;
    title: string;
    status: string;
}

export default function EventAnalyticsPage() {
    const params = useParams();
    const router = useRouter();
    const eventId = params.id as string;

    const [analytics, setAnalytics] = useState<EventAnalytics | null>(null);
    const [ticketStats, setTicketStats] = useState<TicketTypeStats[]>([]);
    const [dailySales, setDailySales] = useState<DailySales[]>([]);
    const [event, setEvent] = useState<EventData | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const loadData = async () => {
            try {
                setIsLoading(true);
                const res = await fetch(`/api/organizer/events/${eventId}`);
                const data = await res.json();

                if (!data.success) {
                    setError(data.error?.message || "Gagal memuat analitik");
                    return;
                }

                const eventData = data.data;
                setEvent(eventData);

                const stats: EventAnalytics = {
                    totalTickets: eventData.stats.totalTickets,
                    soldTickets: eventData.stats.soldTickets,
                    reservedTickets: eventData.stats.reservedTickets,
                    availableTickets: eventData.stats.availableTickets,
                    totalRevenue: eventData.stats.totalRevenue,
                    organizerRevenue: eventData.stats.organizerRevenue,
                    totalBookings: eventData.stats.totalBookings,
                    checkedInCount: eventData.stats.checkedInCount,
                    conversionRate: eventData.stats.totalTickets > 0
                        ? Math.round((eventData.stats.soldTickets / eventData.stats.totalTickets) * 100)
                        : 0,
                };

                setAnalytics(stats);

                const ticketTypeData: TicketTypeStats[] = eventData.ticketTypes.map((tt: { id: string; name: string; basePrice: number; totalQuantity: number; _count: { bookedTickets: number } }) => ({
                    id: tt.id,
                    name: tt.name,
                    totalQuantity: tt.totalQuantity,
                    soldQuantity: tt._count.bookedTickets,
                    availableQuantity: tt.totalQuantity - tt._count.bookedTickets,
                    revenue: tt._count.bookedTickets * tt.basePrice,
                    averagePrice: tt.basePrice,
                }));

                setTicketStats(ticketTypeData);
            } catch {
                setError("Terjadi kesalahan saat memuat analitik");
            } finally {
                setIsLoading(false);
            }
        };

        loadData();
    }, [eventId]);

    const sellPercent = analytics && analytics.totalTickets > 0
        ? Math.round((analytics.soldTickets / analytics.totalTickets) * 100)
        : 0;

    const checkInPercent = analytics && analytics.soldTickets > 0
        ? Math.round((analytics.checkedInCount / analytics.soldTickets) * 100)
        : 0;

    if (isLoading) {
        return (
            <div className="min-h-screen bg-gray-100 flex items-center justify-center">
                <div className="text-center">
                    <Loader2 className="h-12 w-12 text-indigo-600 animate-spin mx-auto mb-4" />
                    <p className="text-gray-500">Memuat analitik...</p>
                </div>
            </div>
        );
    }

    if (error || !analytics) {
        return (
            <div className="min-h-screen bg-gray-100 flex items-center justify-center">
                <div className="text-center">
                    <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
                    <p className="text-gray-900 font-medium mb-2">{error || "Data tidak tersedia"}</p>
                    <Link href={`/organizer/events/${eventId}`} className="text-indigo-600 hover:text-indigo-500">
                        Kembali ke Event
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-100">
            <header className="bg-white border-b">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <Link
                                href={`/organizer/events/${eventId}`}
                                className="text-gray-500 hover:text-gray-700"
                            >
                                <ArrowLeft className="h-5 w-5" />
                            </Link>
                            <div>
                                <h1 className="text-2xl font-bold text-gray-900">Analitik Event</h1>
                                <p className="text-sm text-gray-500 mt-1">{event?.title || "Event"}</p>
                            </div>
                        </div>
                        <button
                            type="button"
                            className="inline-flex items-center gap-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50"
                        >
                            <Download className="h-4 w-4" />
                            Export
                        </button>
                    </div>
                </div>
            </header>

            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                    <MetricCard
                        title="Tiket Terjual"
                        value={analytics.soldTickets.toString()}
                        total={analytics.totalTickets.toString()}
                        percent={sellPercent}
                        icon={Ticket}
                        color="indigo"
                        showProgress={true}
                    />
                    <MetricCard
                        title="Pendapatan Organizer"
                        value={formatCurrency(analytics.organizerRevenue)}
                        total={formatCurrency(analytics.totalRevenue)}
                        percent={analytics.totalRevenue > 0
                            ? Math.round((analytics.organizerRevenue / analytics.totalRevenue) * 100)
                            : 0}
                        icon={DollarSign}
                        color="green"
                        showProgress={true}
                    />
                    <MetricCard
                        title="Total Booking"
                        value={analytics.totalBookings.toString()}
                        icon={Users}
                        color="purple"
                    />
                    <MetricCard
                        title="Check-in"
                        value={analytics.checkedInCount.toString()}
                        total={analytics.soldTickets.toString()}
                        percent={checkInPercent}
                        icon={Calendar}
                        color="blue"
                        showProgress={true}
                    />
                </div>

                <div className="grid lg:grid-cols-2 gap-6 mb-8">
                    <div className="bg-white rounded-xl shadow-sm p-6">
                        <h2 className="text-lg font-semibold text-gray-900 mb-4">Statistik Tiket</h2>
                        <div className="space-y-4">
                            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                <div className="flex items-center gap-2">
                                    <Ticket className="h-5 w-5 text-indigo-600" />
                                    <span className="text-gray-700">Total Tiket</span>
                                </div>
                                <span className="font-semibold text-gray-900">{analytics.totalTickets}</span>
                            </div>
                            <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                                <div className="flex items-center gap-2">
                                    <TrendingUp className="h-5 w-5 text-green-600" />
                                    <span className="text-gray-700">Terjual</span>
                                </div>
                                <span className="font-semibold text-gray-900">{analytics.soldTickets}</span>
                            </div>
                            <div className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg">
                                <div className="flex items-center gap-2">
                                    <Clock className="h-5 w-5 text-yellow-600" />
                                    <span className="text-gray-700">Reserved</span>
                                </div>
                                <span className="font-semibold text-gray-900">{analytics.reservedTickets}</span>
                            </div>
                            <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                                <div className="flex items-center gap-2">
                                    <Users className="h-5 w-5 text-blue-600" />
                                    <span className="text-gray-700">Tersedia</span>
                                </div>
                                <span className="font-semibold text-gray-900">{analytics.availableTickets}</span>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-xl shadow-sm p-6">
                        <h2 className="text-lg font-semibold text-gray-900 mb-4">Ringkasan Pendapatan</h2>
                        <div className="space-y-4">
                            <div className="flex items-center justify-between p-3 bg-indigo-50 rounded-lg">
                                <div className="flex items-center gap-2">
                                    <DollarSign className="h-5 w-5 text-indigo-600" />
                                    <span className="text-gray-700">Total Pendapatan</span>
                                </div>
                                <span className="font-semibold text-gray-900">
                                    {formatCurrency(analytics.totalRevenue)}
                                </span>
                            </div>
                            <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                                <div className="flex items-center gap-2">
                                    <DollarSign className="h-5 w-5 text-green-600" />
                                    <span className="text-gray-700">Pendapatan Organizer</span>
                                </div>
                                <span className="font-semibold text-gray-900">
                                    {formatCurrency(analytics.organizerRevenue)}
                                </span>
                            </div>
                            <div className="flex items-center justify-between p-3 bg-red-50 rounded-lg">
                                <div className="flex items-center gap-2">
                                    <TrendingUp className="h-5 w-5 text-red-600" />
                                    <span className="text-gray-700">Biaya Platform</span>
                                </div>
                                <span className="font-semibold text-gray-900">
                                    {formatCurrency(analytics.totalRevenue - analytics.organizerRevenue)}
                                </span>
                            </div>
                            <div className="flex items-center justify-between p-3 bg-purple-50 rounded-lg">
                                <div className="flex items-center gap-2">
                                    <BarChart3 className="h-5 w-5 text-purple-600" />
                                    <span className="text-gray-700">Konversi Tiket</span>
                                </div>
                                <span className="font-semibold text-gray-900">{analytics.conversionRate}%</span>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-xl shadow-sm overflow-hidden">
                    <div className="p-6 border-b flex items-center justify-between">
                        <h2 className="text-lg font-semibold">Penjualan per Tipe Tiket</h2>
                    </div>
                    {ticketStats.length === 0 ? (
                        <div className="p-12 text-center text-gray-500">
                            <Ticket className="h-12 w-12 mx-auto mb-4 opacity-50" />
                            <p>Belum ada tipe tiket</p>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead className="bg-gray-50 border-b">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                                            Tipe Tiket
                                        </th>
                                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                                            Total
                                        </th>
                                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                                            Terjual
                                        </th>
                                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                                            Tersisa
                                        </th>
                                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                                            Pendapatan
                                        </th>
                                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                                            Harga Rata-rata
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y">
                                    {ticketStats.map((stat) => {
                                        const soldPercent = stat.totalQuantity > 0
                                            ? Math.round((stat.soldQuantity / stat.totalQuantity) * 100)
                                            : 0;

                                        return (
                                            <tr key={stat.id} className="hover:bg-gray-50">
                                                <td className="px-6 py-4 font-medium text-gray-900">
                                                    {stat.name}
                                                </td>
                                                <td className="px-6 py-4 text-right text-gray-600">
                                                    {stat.totalQuantity}
                                                </td>
                                                <td className="px-6 py-4 text-right">
                                                    <span className="font-semibold text-gray-900">
                                                        {stat.soldQuantity}
                                                    </span>
                                                    <span className="text-xs text-gray-500 ml-2">
                                                        ({soldPercent}%)
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 text-right text-gray-600">
                                                    {stat.availableQuantity}
                                                </td>
                                                <td className="px-6 py-4 text-right font-medium text-gray-900">
                                                    {formatCurrency(stat.revenue)}
                                                </td>
                                                <td className="px-6 py-4 text-right text-gray-600">
                                                    {formatCurrency(stat.averagePrice)}
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
}

interface MetricCardProps {
    title: string;
    value: string;
    total?: string;
    percent?: number;
    icon: React.ElementType;
    color: "indigo" | "green" | "purple" | "blue";
    showProgress?: boolean;
}

function MetricCard({ title, value, total, percent, icon: Icon, color, showProgress }: MetricCardProps) {
    const colorMap: Record<string, { bg: string; icon: string; progress: string }> = {
        indigo: { bg: "bg-indigo-100", icon: "text-indigo-600", progress: "bg-indigo-600" },
        green: { bg: "bg-green-100", icon: "text-green-600", progress: "bg-green-600" },
        purple: { bg: "bg-purple-100", icon: "text-purple-600", progress: "bg-purple-600" },
        blue: { bg: "bg-blue-100", icon: "text-blue-600", progress: "bg-blue-600" },
    };

    const colors = colorMap[color];

    return (
        <div className="bg-white rounded-xl p-6 shadow-sm">
            <div className="flex items-center gap-3 mb-4">
                <div className={`w-12 h-12 ${colors.bg} rounded-lg flex items-center justify-center`}>
                    <Icon className={`h-6 w-6 ${colors.icon}`} />
                </div>
            </div>
            <p className="text-2xl font-bold text-gray-900">
                {value}
                {total !== undefined && (
                    <span className="text-sm font-normal text-gray-500"> / {total}</span>
                )}
            </p>
            <p className="text-sm text-gray-500 mb-3">{title}</p>
            {showProgress && percent !== undefined && (
                <div>
                    <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                        <div
                            className={`h-full ${colors.progress} rounded-full transition-all`}
                            style={{ width: `${Math.min(percent, 100)}%` }}
                        />
                    </div>
                    <p className="text-xs text-gray-400 mt-1">{percent}%</p>
                </div>
            )}
        </div>
    );
}
