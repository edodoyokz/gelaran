"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
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
    const eventId = params.id as string;

    const [analytics, setAnalytics] = useState<EventAnalytics | null>(null);
    const [ticketStats, setTicketStats] = useState<TicketTypeStats[]>([]);
    const [_dailySales, _setDailySales] = useState<DailySales[]>([]);
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
            <div className="min-h-screen bg-[var(--bg-secondary)] flex items-center justify-center">
                <div className="text-center">
                    <Loader2 className="h-12 w-12 text-[var(--accent-primary)] animate-spin mx-auto mb-4" />
                    <p className="text-[var(--text-muted)]">Memuat analitik...</p>
                </div>
            </div>
        );
    }

    if (error || !analytics) {
        return (
            <div className="min-h-screen bg-[var(--bg-secondary)] flex items-center justify-center">
                <div className="text-center">
                    <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
                    <p className="text-[var(--text-primary)] font-medium mb-2">{error || "Data tidak tersedia"}</p>
                    <Link href={`/organizer/events/${eventId}`} className="text-[var(--accent-primary)] hover:text-indigo-500">
                        Kembali ke Event
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[var(--bg-secondary)]">
            <header className="bg-[var(--surface)] border-b">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <Link
                                href={`/organizer/events/${eventId}`}
                                className="text-[var(--text-muted)] hover:text-[var(--text-secondary)]"
                            >
                                <ArrowLeft className="h-5 w-5" />
                            </Link>
                            <div>
                                <h1 className="text-2xl font-bold text-[var(--text-primary)]">Analitik Event</h1>
                                <p className="text-sm text-[var(--text-muted)] mt-1">{event?.title || "Event"}</p>
                            </div>
                        </div>
                        <button
                            type="button"
                            className="inline-flex items-center gap-2 px-4 py-2 border border-[var(--border)] text-[var(--text-secondary)] rounded-lg font-medium hover:bg-[var(--surface-hover)]"
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
                    <div className="bg-[var(--surface)] rounded-xl shadow-sm p-6">
                        <h2 className="text-lg font-semibold text-[var(--text-primary)] mb-4">Statistik Tiket</h2>
                        <div className="space-y-4">
                            <div className="flex items-center justify-between p-3 bg-[var(--surface-hover)] rounded-lg">
                                <div className="flex items-center gap-2">
                                    <Ticket className="h-5 w-5 text-[var(--accent-primary)]" />
                                    <span className="text-[var(--text-secondary)]">Total Tiket</span>
                                </div>
                                <span className="font-semibold text-[var(--text-primary)]">{analytics.totalTickets}</span>
                            </div>
                            <div className="flex items-center justify-between p-3 bg-green-500/10 rounded-lg">
                                <div className="flex items-center gap-2">
                                    <TrendingUp className="h-5 w-5 text-green-600" />
                                    <span className="text-[var(--text-secondary)]">Terjual</span>
                                </div>
                                <span className="font-semibold text-[var(--text-primary)]">{analytics.soldTickets}</span>
                            </div>
                            <div className="flex items-center justify-between p-3 bg-yellow-500/10 rounded-lg">
                                <div className="flex items-center gap-2">
                                    <Clock className="h-5 w-5 text-yellow-600" />
                                    <span className="text-[var(--text-secondary)]">Reserved</span>
                                </div>
                                <span className="font-semibold text-[var(--text-primary)]">{analytics.reservedTickets}</span>
                            </div>
                            <div className="flex items-center justify-between p-3 bg-blue-500/10 rounded-lg">
                                <div className="flex items-center gap-2">
                                    <Users className="h-5 w-5 text-blue-600" />
                                    <span className="text-[var(--text-secondary)]">Tersedia</span>
                                </div>
                                <span className="font-semibold text-[var(--text-primary)]">{analytics.availableTickets}</span>
                            </div>
                        </div>
                    </div>

                    <div className="bg-[var(--surface)] rounded-xl shadow-sm p-6">
                        <h2 className="text-lg font-semibold text-[var(--text-primary)] mb-4">Ringkasan Pendapatan</h2>
                        <div className="space-y-4">
                            <div className="flex items-center justify-between p-3 bg-[var(--accent-primary)]/10 rounded-lg">
                                <div className="flex items-center gap-2">
                                    <DollarSign className="h-5 w-5 text-[var(--accent-primary)]" />
                                    <span className="text-[var(--text-secondary)]">Total Pendapatan</span>
                                </div>
                                <span className="font-semibold text-[var(--text-primary)]">
                                    {formatCurrency(analytics.totalRevenue)}
                                </span>
                            </div>
                            <div className="flex items-center justify-between p-3 bg-green-500/10 rounded-lg">
                                <div className="flex items-center gap-2">
                                    <DollarSign className="h-5 w-5 text-green-600" />
                                    <span className="text-[var(--text-secondary)]">Pendapatan Organizer</span>
                                </div>
                                <span className="font-semibold text-[var(--text-primary)]">
                                    {formatCurrency(analytics.organizerRevenue)}
                                </span>
                            </div>
                            <div className="flex items-center justify-between p-3 bg-red-500/10 rounded-lg">
                                <div className="flex items-center gap-2">
                                    <TrendingUp className="h-5 w-5 text-red-600" />
                                    <span className="text-[var(--text-secondary)]">Biaya Platform</span>
                                </div>
                                <span className="font-semibold text-[var(--text-primary)]">
                                    {formatCurrency(analytics.totalRevenue - analytics.organizerRevenue)}
                                </span>
                            </div>
                            <div className="flex items-center justify-between p-3 bg-purple-500/10 rounded-lg">
                                <div className="flex items-center gap-2">
                                    <BarChart3 className="h-5 w-5 text-purple-600" />
                                    <span className="text-[var(--text-secondary)]">Konversi Tiket</span>
                                </div>
                                <span className="font-semibold text-[var(--text-primary)]">{analytics.conversionRate}%</span>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="bg-[var(--surface)] rounded-xl shadow-sm overflow-hidden">
                    <div className="p-6 border-b flex items-center justify-between">
                        <h2 className="text-lg font-semibold">Penjualan per Tipe Tiket</h2>
                    </div>
                    {ticketStats.length === 0 ? (
                        <div className="p-12 text-center text-[var(--text-muted)]">
                            <Ticket className="h-12 w-12 mx-auto mb-4 opacity-50" />
                            <p>Belum ada tipe tiket</p>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead className="bg-[var(--surface-hover)] border-b">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-[var(--text-muted)] uppercase">
                                            Tipe Tiket
                                        </th>
                                        <th className="px-6 py-3 text-right text-xs font-medium text-[var(--text-muted)] uppercase">
                                            Total
                                        </th>
                                        <th className="px-6 py-3 text-right text-xs font-medium text-[var(--text-muted)] uppercase">
                                            Terjual
                                        </th>
                                        <th className="px-6 py-3 text-right text-xs font-medium text-[var(--text-muted)] uppercase">
                                            Tersisa
                                        </th>
                                        <th className="px-6 py-3 text-right text-xs font-medium text-[var(--text-muted)] uppercase">
                                            Pendapatan
                                        </th>
                                        <th className="px-6 py-3 text-right text-xs font-medium text-[var(--text-muted)] uppercase">
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
                                            <tr key={stat.id} className="hover:bg-[var(--surface-hover)]">
                                                <td className="px-6 py-4 font-medium text-[var(--text-primary)]">
                                                    {stat.name}
                                                </td>
                                                <td className="px-6 py-4 text-right text-[var(--text-secondary)]">
                                                    {stat.totalQuantity}
                                                </td>
                                                <td className="px-6 py-4 text-right">
                                                    <span className="font-semibold text-[var(--text-primary)]">
                                                        {stat.soldQuantity}
                                                    </span>
                                                    <span className="text-xs text-[var(--text-muted)] ml-2">
                                                        ({soldPercent}%)
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 text-right text-[var(--text-secondary)]">
                                                    {stat.availableQuantity}
                                                </td>
                                                <td className="px-6 py-4 text-right font-medium text-[var(--text-primary)]">
                                                    {formatCurrency(stat.revenue)}
                                                </td>
                                                <td className="px-6 py-4 text-right text-[var(--text-secondary)]">
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
        indigo: { bg: "bg-indigo-100", icon: "text-[var(--accent-primary)]", progress: "bg-[var(--accent-primary)]" },
        green: { bg: "bg-green-500/10", icon: "text-green-600", progress: "bg-green-600" },
        purple: { bg: "bg-purple-500/10", icon: "text-purple-600", progress: "bg-purple-600" },
        blue: { bg: "bg-blue-500/10", icon: "text-blue-600", progress: "bg-blue-600" },
    };

    const colors = colorMap[color];

    return (
        <div className="bg-[var(--surface)] rounded-xl p-6 shadow-sm">
            <div className="flex items-center gap-3 mb-4">
                <div className={`w-12 h-12 ${colors.bg} rounded-lg flex items-center justify-center`}>
                    <Icon className={`h-6 w-6 ${colors.icon}`} />
                </div>
            </div>
            <p className="text-2xl font-bold text-[var(--text-primary)]">
                {value}
                {total !== undefined && (
                    <span className="text-sm font-normal text-[var(--text-muted)]"> / {total}</span>
                )}
            </p>
            <p className="text-sm text-[var(--text-muted)] mb-3">{title}</p>
            {showProgress && percent !== undefined && (
                <div>
                    <div className="h-2 bg-[var(--bg-secondary)] rounded-full overflow-hidden">
                        <div
                            className={`h-full ${colors.progress} rounded-full transition-all`}
                            style={{ width: `${Math.min(percent, 100)}%` }}
                        />
                    </div>
                    <p className="text-xs text-[var(--text-muted)] mt-1">{percent}%</p>
                </div>
            )}
        </div>
    );
}
