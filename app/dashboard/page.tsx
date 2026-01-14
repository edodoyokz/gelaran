"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import {
    Ticket,
    Calendar,
    MapPin,
    AlertCircle,
    Heart,
    Clock,
    ChevronRight,
    Sparkles,
    TrendingUp,
    Wallet,
    ArrowUpRight,
    ArrowDownRight,
} from "lucide-react";
import { MiniSparkline, AreaChart } from "@/components/ui/charts";

interface BookingEvent {
    id: string;
    title: string;
    slug: string;
    posterImage: string | null;
    venue: { name: string; city: string } | null;
}

interface EventSchedule {
    scheduleDate: string;
    startTime: string;
}

interface UpcomingBooking {
    id: string;
    bookingCode: string;
    status: string;
    totalTickets: number;
    event: BookingEvent;
    eventSchedule: EventSchedule | null;
}

interface RecentBooking {
    id: string;
    bookingCode: string;
    status: string;
    totalAmount: string;
    createdAt: string;
    event: {
        title: string;
        slug: string;
        posterImage: string | null;
    };
}

interface RecommendedEvent {
    id: string;
    title: string;
    slug: string;
    posterImage: string | null;
    category: string | null;
    venue: { name: string; city: string } | null;
    schedule: { date: string; time: string } | null;
    price: { isFree: boolean; startingFrom: number } | null;
}

interface DashboardData {
    stats: {
        totalBookings: number;
        upcomingEvents: number;
        wishlistCount: number;
        totalSpent?: number;
    };
    upcomingBookings: UpcomingBooking[];
    recentBookings: RecentBooking[];
    recommendedEvents: RecommendedEvent[];
    user: {
        name: string | null;
        email: string;
    };
    bookingTrend?: { value: number }[];
    activityData?: { name: string; value: number }[];
}

const STATUS_COLORS: Record<string, string> = {
    PENDING: "bg-[var(--warning-bg)] text-[var(--warning-text)]",
    AWAITING_PAYMENT: "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400",
    PAID: "bg-[var(--info-bg)] text-[var(--info-text)]",
    CONFIRMED: "bg-[var(--success-bg)] text-[var(--success-text)]",
    CANCELLED: "bg-[var(--error-bg)] text-[var(--error-text)]",
    REFUNDED: "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400",
    EXPIRED: "bg-[var(--bg-tertiary)] text-[var(--text-muted)]",
};

const STATUS_LABELS: Record<string, string> = {
    PENDING: "Menunggu",
    AWAITING_PAYMENT: "Menunggu Pembayaran",
    PAID: "Dibayar",
    CONFIRMED: "Dikonfirmasi",
    CANCELLED: "Dibatalkan",
    REFUNDED: "Dikembalikan",
    EXPIRED: "Kadaluarsa",
};

function generateSparklineData(count: number = 7, trend: "up" | "down" | "stable" = "up"): { value: number }[] {
    const data: { value: number }[] = [];
    let base = Math.random() * 50 + 20;
    for (let i = 0; i < count; i++) {
        const variance = (Math.random() - 0.5) * 20;
        const trendFactor = trend === "up" ? i * 3 : trend === "down" ? -i * 3 : 0;
        data.push({ value: Math.max(0, base + variance + trendFactor) });
        base = data[i].value;
    }
    return data;
}

function generateActivityData(): { name: string; value: number }[] {
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun"];
    return months.map((name) => ({
        name,
        value: Math.floor(Math.random() * 10) + 1,
    }));
}

function DashboardSkeleton() {
    return (
        <div className="space-y-6">
            <div className="flex items-center gap-3">
                <div className="h-10 w-48 skeleton rounded-lg" />
            </div>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="h-32 skeleton rounded-2xl" />
                ))}
            </div>
            <div className="card p-6">
                <div className="h-6 w-40 skeleton rounded-lg mb-4" />
                <div className="h-48 skeleton rounded-xl" />
            </div>
            <div>
                <div className="h-6 w-32 skeleton rounded-lg mb-4" />
                <div className="flex gap-4 overflow-hidden">
                    {[1, 2, 3].map((i) => (
                        <div key={i} className="flex-shrink-0 w-72 card p-4">
                            <div className="flex gap-3">
                                <div className="w-24 h-24 skeleton rounded-xl" />
                                <div className="flex-1 space-y-2">
                                    <div className="h-4 skeleton rounded w-full" />
                                    <div className="h-3 skeleton rounded w-3/4" />
                                    <div className="h-3 skeleton rounded w-1/2" />
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}

export default function CustomerDashboardPage() {
    const router = useRouter();
    const [data, setData] = useState<DashboardData | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchDashboard = useCallback(async () => {
        try {
            setIsLoading(true);
            const res = await fetch("/api/dashboard");
            const result = await res.json();

            if (!res.ok) {
                if (res.status === 401) {
                    router.push("/login?returnUrl=/dashboard");
                    return;
                }
                setError(result.error?.message || "Gagal memuat dashboard");
                return;
            }

            if (result.success) {
                const enhancedData: DashboardData = {
                    ...result.data,
                    bookingTrend: result.data.bookingTrend || generateSparklineData(7, "up"),
                    activityData: result.data.activityData || generateActivityData(),
                    stats: {
                        ...result.data.stats,
                        totalSpent: result.data.stats.totalSpent ||
                            result.data.recentBookings.reduce(
                                (sum: number, b: RecentBooking) => sum + parseFloat(b.totalAmount || "0"),
                                0
                            ),
                    },
                };
                setData(enhancedData);
            }
        } catch {
            setError("Gagal memuat dashboard");
        } finally {
            setIsLoading(false);
        }
    }, [router]);

    useEffect(() => {
        fetchDashboard();
    }, [fetchDashboard]);

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

    const formatCurrency = (amount: number | string): string => {
        const num = typeof amount === "string" ? parseFloat(amount) : amount;
        return new Intl.NumberFormat("id-ID", {
            style: "currency",
            currency: "IDR",
            minimumFractionDigits: 0,
        }).format(num);
    };

    const getGreeting = (): string => {
        const hour = new Date().getHours();
        if (hour < 12) return "Selamat Pagi";
        if (hour < 17) return "Selamat Siang";
        return "Selamat Malam";
    };

    if (isLoading) {
        return <DashboardSkeleton />;
    }

    if (error) {
        return (
            <div className="min-h-[60vh] flex items-center justify-center">
                <div className="text-center max-w-md w-full card p-8">
                    <div className="w-16 h-16 bg-[var(--error-bg)] rounded-full flex items-center justify-center mx-auto mb-4">
                        <AlertCircle className="h-8 w-8 text-[var(--error)]" />
                    </div>
                    <p className="text-[var(--text-primary)] font-bold text-lg mb-2">{error}</p>
                    <p className="text-[var(--text-muted)] text-sm mb-6">Terjadi kesalahan saat memuat data</p>
                    <Link
                        href="/"
                        className="btn-primary"
                    >
                        Kembali ke Beranda
                    </Link>
                </div>
            </div>
        );
    }

    if (!data) return null;

    const firstName = data.user.name?.split(" ")[0] || "Pengguna";
    const bookingTrend = data.bookingTrend || generateSparklineData(7, "up");
    const activityData = data.activityData || generateActivityData();
    const totalSpent = data.stats.totalSpent || 0;
    const isPositiveTrend = bookingTrend.length > 1 &&
        bookingTrend[bookingTrend.length - 1].value > bookingTrend[0].value;

    const stats = [
        {
            label: "Total Pesanan",
            value: data.stats.totalBookings,
            icon: Ticket,
            gradient: "from-indigo-500 to-purple-500",
            bgGradient: "from-indigo-500/10 to-purple-500/10",
            iconBg: "bg-indigo-500/10",
            iconColor: "text-indigo-500",
            href: "/my-bookings",
            sparklineData: bookingTrend,
            trend: isPositiveTrend ? "+12%" : "-5%",
            trendUp: isPositiveTrend,
        },
        {
            label: "Event Mendatang",
            value: data.stats.upcomingEvents,
            icon: Calendar,
            gradient: "from-emerald-500 to-teal-500",
            bgGradient: "from-emerald-500/10 to-teal-500/10",
            iconBg: "bg-emerald-500/10",
            iconColor: "text-emerald-500",
            href: "/my-bookings?status=confirmed",
            sparklineData: generateSparklineData(7, "stable"),
            trend: data.stats.upcomingEvents > 0 ? "Aktif" : "-",
            trendUp: true,
        },
        {
            label: "Wishlist",
            value: data.stats.wishlistCount,
            icon: Heart,
            gradient: "from-rose-500 to-pink-500",
            bgGradient: "from-rose-500/10 to-pink-500/10",
            iconBg: "bg-rose-500/10",
            iconColor: "text-rose-500",
            href: "/wishlist",
            sparklineData: generateSparklineData(7, "up"),
            trend: "+3",
            trendUp: true,
        },
        {
            label: "Total Belanja",
            value: formatCurrency(totalSpent),
            icon: Wallet,
            gradient: "from-amber-500 to-orange-500",
            bgGradient: "from-amber-500/10 to-orange-500/10",
            iconBg: "bg-amber-500/10",
            iconColor: "text-amber-500",
            href: "/my-bookings",
            sparklineData: generateSparklineData(7, "up"),
            trend: "+25%",
            trendUp: true,
            isLarge: true,
        },
    ];

    return (
        <div className="space-y-6 lg:space-y-8">
            <section className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <p className="text-[var(--text-muted)] text-sm font-medium">{getGreeting()}</p>
                    <h1 className="text-2xl sm:text-3xl font-bold text-[var(--text-primary)]">
                        Halo, <span className="text-gradient">{firstName}</span>! 👋
                    </h1>
                </div>
                <Link
                    href="/events"
                    className="btn-primary self-start sm:self-auto"
                >
                    <Sparkles className="w-4 h-4" />
                    Jelajahi Event
                </Link>
            </section>

            <section>
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
                    {stats.map((stat) => (
                        <Link
                            key={stat.label}
                            href={stat.href}
                            className="group relative overflow-hidden card card-hover p-4 sm:p-5"
                        >
                            <div className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-br ${stat.bgGradient} rounded-full -mr-16 -mt-16 opacity-50 transition-transform group-hover:scale-150`} />

                            <div className="relative">
                                <div className="flex items-center justify-between mb-3">
                                    <div className={`p-2.5 ${stat.iconBg} ${stat.iconColor} rounded-xl`}>
                                        <stat.icon className="h-5 w-5" />
                                    </div>
                                    <div className="hidden sm:block">
                                        <MiniSparkline
                                            data={stat.sparklineData}
                                            color={stat.trendUp ? "#22c55e" : "#ef4444"}
                                            positive={stat.trendUp}
                                            height={24}
                                            width={50}
                                        />
                                    </div>
                                </div>

                                <p className={`font-bold text-[var(--text-primary)] mb-1 ${stat.isLarge ? "text-lg sm:text-xl" : "text-2xl sm:text-3xl"}`}>
                                    {stat.value}
                                </p>

                                <div className="flex items-center justify-between">
                                    <p className="text-[var(--text-muted)] text-xs sm:text-sm font-medium">{stat.label}</p>
                                    {stat.trend !== "-" && (
                                        <span className={`flex items-center gap-0.5 text-xs font-medium ${stat.trendUp ? "text-[var(--success)]" : "text-[var(--error)]"}`}>
                                            {stat.trendUp ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                                            {stat.trend}
                                        </span>
                                    )}
                                </div>
                            </div>
                        </Link>
                    ))}
                </div>
            </section>

            <section className="card p-4 sm:p-6">
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-lg font-bold text-[var(--text-primary)] flex items-center gap-2">
                        <TrendingUp className="w-5 h-5 text-[var(--accent-primary)]" />
                        Aktivitas Booking
                    </h2>
                    <span className="text-xs text-[var(--text-muted)] bg-[var(--bg-tertiary)] px-2 py-1 rounded-full">6 bulan terakhir</span>
                </div>
                <AreaChart
                    data={activityData}
                    height={200}
                    color="#6366f1"
                    showYAxis={false}
                    showGrid={true}
                    formatTooltip={(value: number) => `${value} booking`}
                />
            </section>

            {data.upcomingBookings.length > 0 && (
                <section>
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-lg sm:text-xl font-bold text-[var(--text-primary)] flex items-center gap-2">
                            <Clock className="h-5 w-5 text-[var(--accent-primary)]" />
                            Event Mendatang
                        </h2>
                        <Link href="/my-bookings" className="text-[var(--accent-primary)] hover:text-[var(--accent-primary-hover)] text-sm font-semibold flex items-center gap-1">
                            Lihat Semua
                            <ChevronRight className="w-4 h-4" />
                        </Link>
                    </div>

                    <div className="flex gap-4 overflow-x-auto pb-4 -mx-4 px-4 sm:mx-0 sm:px-0 snap-x snap-mandatory no-scrollbar">
                        {data.upcomingBookings.map((booking) => (
                            <Link
                                key={booking.id}
                                href={`/my-bookings/${booking.bookingCode}`}
                                className="snap-start shrink-0 w-[85vw] sm:w-80 group card p-3 flex gap-4"
                            >
                                <div className="w-24 h-24 sm:w-28 sm:h-28 shrink-0 rounded-xl overflow-hidden relative">
                                    <Image
                                        src={booking.event.posterImage || "/placeholder.jpg"}
                                        alt={booking.event.title}
                                        fill
                                        className="object-cover group-hover:scale-110 transition-transform duration-500"
                                        sizes="(max-width: 640px) 96px, 112px"
                                    />
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent group-hover:from-transparent transition-all" />
                                </div>
                                <div className="flex-1 py-1 pr-1 min-w-0 flex flex-col justify-between">
                                    <div>
                                        <h3 className="font-bold text-[var(--text-primary)] truncate group-hover:text-[var(--accent-primary)] transition-colors text-sm sm:text-base">
                                            {booking.event.title}
                                        </h3>
                                        {booking.eventSchedule && (
                                            <div className="flex items-center gap-1.5 text-xs sm:text-sm text-[var(--text-muted)] mt-1">
                                                <Calendar className="h-3.5 w-3.5 shrink-0 text-[var(--accent-primary)]" />
                                                <span className="truncate">
                                                    {formatDate(booking.eventSchedule.scheduleDate)} • {formatTime(booking.eventSchedule.startTime)}
                                                </span>
                                            </div>
                                        )}
                                        {booking.event.venue && (
                                            <div className="flex items-center gap-1.5 text-xs sm:text-sm text-[var(--text-muted)] mt-0.5">
                                                <MapPin className="h-3.5 w-3.5 shrink-0" />
                                                <span className="truncate">
                                                    {booking.event.venue.name}, {booking.event.venue.city}
                                                </span>
                                            </div>
                                        )}
                                    </div>
                                    <div className="flex items-center justify-between mt-2">
                                        <span className={`px-2 py-0.5 rounded-lg text-[10px] sm:text-xs font-semibold ${STATUS_COLORS[booking.status]}`}>
                                            {STATUS_LABELS[booking.status] || booking.status}
                                        </span>
                                        <div className="flex items-center gap-1 text-xs sm:text-sm font-semibold text-[var(--accent-primary)] bg-[var(--accent-gradient-subtle)] px-2 py-0.5 rounded-lg">
                                            <Ticket className="h-3 w-3" />
                                            <span>{booking.totalTickets}</span>
                                        </div>
                                    </div>
                                </div>
                            </Link>
                        ))}
                    </div>
                </section>
            )}

            {data.recommendedEvents.length > 0 && (
                <section>
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-lg sm:text-xl font-bold text-[var(--text-primary)] flex items-center gap-2">
                            <Sparkles className="h-5 w-5 text-[var(--accent-primary)]" />
                            Rekomendasi Untukmu
                        </h2>
                        <Link href="/events" className="text-[var(--accent-primary)] hover:text-[var(--accent-primary-hover)] text-sm font-semibold flex items-center gap-1">
                            Jelajahi
                            <ChevronRight className="w-4 h-4" />
                        </Link>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {data.recommendedEvents.slice(0, 4).map((event) => (
                            <Link
                                key={event.id}
                                href={`/events/${event.slug}`}
                                className="group card card-hover p-3 flex gap-4"
                            >
                                <div className="w-24 sm:w-28 shrink-0 rounded-xl overflow-hidden relative aspect-[3/4]">
                                    <Image
                                        src={event.posterImage || "/placeholder.jpg"}
                                        alt={event.title}
                                        fill
                                        className="object-cover group-hover:scale-110 transition-transform duration-500"
                                        sizes="(max-width: 640px) 96px, 112px"
                                    />
                                    {event.price && event.price.isFree && (
                                        <div className="absolute top-2 left-2">
                                            <span className="inline-block px-2 py-0.5 bg-[var(--success)]/90 backdrop-blur-sm text-white text-[10px] font-bold rounded-lg shadow-sm">
                                                GRATIS
                                            </span>
                                        </div>
                                    )}
                                </div>
                                <div className="flex-1 min-w-0 flex flex-col py-1">
                                    <div className="mb-auto">
                                        {event.category && (
                                            <span className="inline-block text-[10px] font-bold tracking-wider text-[var(--accent-primary)] uppercase mb-1">
                                                {event.category}
                                            </span>
                                        )}
                                        <h3 className="font-bold text-[var(--text-primary)] leading-tight group-hover:text-[var(--accent-primary)] transition-colors line-clamp-2 text-sm sm:text-base mb-2">
                                            {event.title}
                                        </h3>
                                    </div>

                                    <div className="space-y-1">
                                        {event.schedule && (
                                            <div className="flex items-center gap-1.5 text-xs text-[var(--text-muted)]">
                                                <Calendar className="h-3.5 w-3.5" />
                                                <span>{formatDate(event.schedule.date)}</span>
                                            </div>
                                        )}
                                        {event.venue && (
                                            <div className="flex items-center gap-1.5 text-xs text-[var(--text-muted)]">
                                                <MapPin className="h-3.5 w-3.5" />
                                                <span className="truncate">{event.venue.city}</span>
                                            </div>
                                        )}
                                        {event.price && !event.price.isFree && (
                                            <div className="pt-2 mt-1 border-t border-dashed border-[var(--border)] font-bold text-[var(--accent-primary)] text-sm">
                                                {formatCurrency(event.price.startingFrom)}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </Link>
                        ))}
                    </div>
                </section>
            )}

            {data.upcomingBookings.length === 0 && data.recentBookings.length === 0 && (
                <div className="card p-8 sm:p-12 text-center max-w-lg mx-auto">
                    <div className="w-20 h-20 bg-gradient-to-br from-indigo-100 to-purple-100 dark:from-indigo-900/30 dark:to-purple-900/30 rounded-full flex items-center justify-center mx-auto mb-6">
                        <Ticket className="h-10 w-10 text-[var(--accent-primary)]" />
                    </div>
                    <h3 className="text-xl font-bold text-[var(--text-primary)] mb-2">
                        Belum ada pesanan
                    </h3>
                    <p className="text-[var(--text-muted)] mb-8 max-w-xs mx-auto">
                        Jelajahi ribuan event menarik dan amankan tiket pertamamu sekarang!
                    </p>
                    <Link
                        href="/events"
                        className="btn-primary inline-flex"
                    >
                        <Sparkles className="h-5 w-5" />
                        Jelajahi Event
                    </Link>
                </div>
            )}
        </div>
    );
}
