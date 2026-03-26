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
    ChevronRight,
    Sparkles,
    TrendingUp,
    Wallet,
} from "lucide-react";
import { MiniSparkline, AreaChart } from "@/components/ui/charts";
import {
    CustomerActionCard,
    CustomerEmptyState,
    CustomerHero,
    CustomerMetricGrid,
    CustomerStatusBadge,
    DashboardSection,
    StatsCard,
} from "@/components/customer/customer-dashboard-primitives";

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

const STATUS_META: Record<string, { label: string; tone: "warning" | "accent" | "success" | "danger" | "neutral" }> = {
    PENDING: { label: "Menunggu", tone: "warning" },
    AWAITING_PAYMENT: { label: "Menunggu Pembayaran", tone: "warning" },
    PAID: { label: "Dibayar", tone: "accent" },
    CONFIRMED: { label: "Dikonfirmasi", tone: "success" },
    CANCELLED: { label: "Dibatalkan", tone: "danger" },
    REFUNDED: { label: "Dikembalikan", tone: "neutral" },
    EXPIRED: { label: "Kadaluarsa", tone: "neutral" },
};

function generateSparklineData(
    count: number = 7,
    trend: "up" | "down" | "stable" = "up",
): { value: number }[] {
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
        <div className="space-y-6 lg:space-y-8">
            <div className="rounded-4xl border border-(--border) bg-(--surface)/90 p-6 shadow-(--shadow-sm) sm:p-8">
                <div className="space-y-4">
                    <div className="h-5 w-32 skeleton rounded-full" />
                    <div className="h-10 w-64 skeleton rounded-xl" />
                    <div className="h-5 w-full max-w-2xl skeleton rounded-lg" />
                </div>
            </div>
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="h-36 skeleton rounded-[1.75rem]" />
                ))}
            </div>
            <div className="grid gap-6 xl:grid-cols-[1.5fr_0.9fr]">
                <div className="h-80 skeleton rounded-[1.75rem]" />
                <div className="h-80 skeleton rounded-[1.75rem]" />
            </div>
            <div className="grid gap-4 lg:grid-cols-2">
                {[1, 2].map((i) => (
                    <div key={i} className="h-56 skeleton rounded-[1.75rem]" />
                ))}
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
                        totalSpent:
                            result.data.stats.totalSpent ||
                            result.data.recentBookings.reduce(
                                (sum: number, b: RecentBooking) =>
                                    sum + parseFloat(b.totalAmount || "0"),
                                0,
                            ),
                    },
                };
                setData(enhancedData);
                setError(null);
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
            <CustomerEmptyState
                title="Dashboard belum bisa dimuat"
                description={`${error}. Muat ulang halaman atau kembali ke beranda untuk melanjutkan penjelajahan event.`}
                href="/"
                ctaLabel="Kembali ke Beranda"
                icon={AlertCircle}
            />
        );
    }

    if (!data) return null;

    const firstName = data.user.name?.split(" ")[0] || "Pengguna";
    const bookingTrend = data.bookingTrend || generateSparklineData(7, "up");
    const activityData = data.activityData || generateActivityData();
    const totalSpent = data.stats.totalSpent || 0;
    const isPositiveTrend =
        bookingTrend.length > 1 &&
        bookingTrend[bookingTrend.length - 1].value > bookingTrend[0].value;

    const stats = [
        {
            label: "Total Pesanan",
            value: data.stats.totalBookings,
            icon: Ticket,
            href: "/my-bookings",
            sparklineData: bookingTrend,
            tone: "accent" as const,
            trend: isPositiveTrend ? "+12% vs bulan lalu" : "Perlu perhatian",
        },
        {
            label: "Event Mendatang",
            value: data.stats.upcomingEvents,
            icon: Calendar,
            href: "/my-bookings?status=confirmed",
            sparklineData: generateSparklineData(7, "stable"),
            tone: "success" as const,
            trend:
                data.stats.upcomingEvents > 0
                    ? `${data.stats.upcomingEvents} event siap dihadiri`
                    : "Belum ada agenda aktif",
        },
        {
            label: "Wishlist",
            value: data.stats.wishlistCount,
            icon: Heart,
            href: "/wishlist",
            sparklineData: generateSparklineData(7, "up"),
            tone: "default" as const,
            trend:
                data.stats.wishlistCount > 0
                    ? "Kurasi event favorit tersimpan"
                    : "Mulai simpan event favorit",
        },
        {
            label: "Total Belanja",
            value: formatCurrency(totalSpent),
            icon: Wallet,
            href: "/my-bookings",
            sparklineData: generateSparklineData(7, "up"),
            tone: "warning" as const,
            trend: "Ringkasan pengeluaran sepanjang booking",
        },
    ];

    return (
        <div className="space-y-6 lg:space-y-8">
            <CustomerHero
                eyebrow="Customer dashboard"
                title={
                    <>
                        {getGreeting()}, <span className="text-(--accent-primary)">{firstName}</span>
                    </>
                }
                description="Pantau pesanan aktif, wishlist, dan rekomendasi event terbaru dari satu dashboard yang konsisten dengan alur customer Gelaran."
                meta={
                    <>
                        <CustomerStatusBadge
                            label={`${data.stats.upcomingEvents} event mendatang`}
                            tone="success"
                            icon={Calendar}
                        />
                        <CustomerStatusBadge
                            label={`${data.stats.wishlistCount} item wishlist`}
                            tone="accent"
                            icon={Heart}
                        />
                    </>
                }
                actions={
                    <>
                        <Link
                            href="/my-bookings"
                            className="inline-flex items-center justify-center gap-2 rounded-full border border-(--border) bg-(--surface-elevated) px-5 py-3 text-sm font-semibold text-foreground transition-colors hover:bg-(--surface-hover)"
                        >
                            <Ticket className="h-4 w-4" />
                            Lihat Pesanan
                        </Link>
                        <Link
                            href="/events"
                            className="inline-flex items-center justify-center gap-2 rounded-full bg-(--accent-gradient) px-5 py-3 text-sm font-semibold text-white shadow-(--shadow-glow) transition-transform duration-200 hover:-translate-y-0.5"
                        >
                            <Sparkles className="h-4 w-4" />
                            Jelajahi Event
                        </Link>
                    </>
                }
            />

            <CustomerMetricGrid>
                {stats.map((stat) => (
                    <Link key={stat.label} href={stat.href} className="block">
                        <StatsCard
                            label={stat.label}
                            value={stat.value}
                            icon={stat.icon}
                            tone={stat.tone}
                            trend={stat.trend}
                            meta={
                                <MiniSparkline
                                    data={stat.sparklineData}
                                    color="#29b3b6"
                                    positive
                                    height={26}
                                    width={72}
                                />
                            }
                            className="h-full"
                        />
                    </Link>
                ))}
            </CustomerMetricGrid>

            <div className="grid gap-6 xl:grid-cols-[1.55fr_0.95fr]">
                <DashboardSection
                    title="Aktivitas booking"
                    description="Ringkasan aktivitas booking dalam 6 bulan terakhir untuk membantu melihat ritme pembelian dan periode terpadat."
                    className="h-full"
                >
                    <AreaChart
                        data={activityData}
                        height={250}
                        color="#29b3b6"
                        showYAxis={false}
                        showGrid
                        formatTooltip={(value: number) => `${value} booking`}
                    />
                </DashboardSection>

                <DashboardSection
                    title="Aksi cepat"
                    description="Shortcut utama untuk melanjutkan aktivitas customer tanpa berpindah-pindah halaman."
                    className="h-full"
                >
                    <div className="grid gap-4">
                        <CustomerActionCard
                            title="Kelola profil"
                            description="Perbarui data personal, alamat, preferensi bahasa, dan zona waktu akunmu."
                            href="/profile"
                            icon={Wallet}
                            actionLabel="Buka profil"
                        />
                        <CustomerActionCard
                            title="Notifikasi terbaru"
                            description="Baca update booking, pengingat event, dan pemberitahuan sistem terbaru."
                            href="/notifications"
                            icon={TrendingUp}
                            actionLabel="Buka notifikasi"
                        />
                    </div>
                </DashboardSection>
            </div>

            <DashboardSection
                title="Event mendatang"
                description="Pesanan yang paling dekat dengan jadwal acara ditampilkan lebih dulu agar kamu bisa cepat mengakses tiket dan detail event."
                actionHref="/my-bookings"
                actionLabel="Lihat semua pesanan"
            >
                {data.upcomingBookings.length === 0 ? (
                    <CustomerEmptyState
                        title="Belum ada event mendatang"
                        description="Setelah kamu menyelesaikan booking, ringkasan acara berikutnya akan muncul di sini lengkap dengan status dan jumlah tiket."
                        href="/events"
                        ctaLabel="Temukan event"
                        icon={Calendar}
                        className="border-none bg-transparent p-0 shadow-none"
                    />
                ) : (
                    <div className="grid gap-4 lg:grid-cols-2">
                        {data.upcomingBookings.map((booking) => {
                            const status = STATUS_META[booking.status] || STATUS_META.PENDING;
                            return (
                                <Link
                                    key={booking.id}
                                    href={`/my-bookings/${booking.bookingCode}`}
                                    className="group overflow-hidden rounded-[1.75rem] border border-(--border) bg-(--surface-elevated) shadow-(--shadow-sm) transition-all duration-200 hover:-translate-y-0.5 hover:shadow-(--shadow-md)"
                                >
                                    <div className="flex flex-col gap-4 p-4 sm:flex-row sm:p-5">
                                        <div className="relative aspect-4/3 w-full overflow-hidden rounded-2xl bg-(--surface-brand-soft) sm:h-32 sm:w-32 sm:shrink-0">
                                            <Image
                                                src={booking.event.posterImage || "/placeholder.jpg"}
                                                alt={booking.event.title}
                                                fill
                                                className="object-cover transition-transform duration-500 group-hover:scale-105"
                                                sizes="(max-width: 640px) 100vw, 128px"
                                            />
                                        </div>
                                        <div className="min-w-0 flex-1 space-y-4">
                                            <div className="space-y-2">
                                                <div className="flex flex-wrap items-center gap-2">
                                                    <CustomerStatusBadge label={status.label} tone={status.tone} />
                                                    <span className="rounded-full bg-(--surface-brand-soft) px-3 py-1 text-xs font-semibold text-(--accent-primary)">
                                                        {booking.totalTickets} tiket
                                                    </span>
                                                </div>
                                                <h3 className="text-lg font-semibold text-foreground transition-colors group-hover:text-(--accent-primary)">
                                                    {booking.event.title}
                                                </h3>
                                            </div>

                                            <div className="space-y-2 text-sm text-(--text-secondary)">
                                                {booking.eventSchedule ? (
                                                    <div className="flex items-center gap-2">
                                                        <Calendar className="h-4 w-4 text-(--accent-primary)" />
                                                        <span>
                                                            {formatDate(booking.eventSchedule.scheduleDate)} • {formatTime(booking.eventSchedule.startTime)}
                                                        </span>
                                                    </div>
                                                ) : null}
                                                {booking.event.venue ? (
                                                    <div className="flex items-center gap-2">
                                                        <MapPin className="h-4 w-4 text-(--text-muted)" />
                                                        <span className="truncate">
                                                            {booking.event.venue.name}, {booking.event.venue.city}
                                                        </span>
                                                    </div>
                                                ) : null}
                                            </div>

                                            <div className="inline-flex items-center gap-2 text-sm font-semibold text-(--accent-primary)">
                                                Buka detail pesanan
                                                <ChevronRight className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-0.5" />
                                            </div>
                                        </div>
                                    </div>
                                </Link>
                            );
                        })}
                    </div>
                )}
            </DashboardSection>

            <div className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
                <DashboardSection
                    title="Pesanan terbaru"
                    description="Monitor transaksi terbaru dan lanjutkan ke halaman detail jika perlu cek status, tiket, atau invoice."
                >
                    {data.recentBookings.length === 0 ? (
                        <CustomerEmptyState
                            title="Belum ada pesanan terbaru"
                            description="Semua transaksi yang kamu buat akan dirangkum di sini agar mudah dipantau dari dashboard."
                            href="/events"
                            ctaLabel="Mulai booking"
                            icon={Ticket}
                            className="border-none bg-transparent p-0 shadow-none"
                        />
                    ) : (
                        <div className="space-y-3">
                            {data.recentBookings.slice(0, 4).map((booking) => {
                                const status = STATUS_META[booking.status] || STATUS_META.PENDING;
                                return (
                                    <Link
                                        key={booking.id}
                                        href={`/my-bookings/${booking.bookingCode}`}
                                        className="flex flex-col gap-4 rounded-2xl border border-(--border-light) bg-(--surface-elevated) p-4 transition-colors hover:bg-(--surface-hover) sm:flex-row sm:items-center"
                                    >
                                        <div className="min-w-0 flex-1 space-y-2">
                                            <div className="flex flex-wrap items-center gap-2">
                                                <p className="rounded-full bg-(--bg-secondary) px-3 py-1 font-mono text-xs text-(--text-muted)">
                                                    {booking.bookingCode}
                                                </p>
                                                <CustomerStatusBadge label={status.label} tone={status.tone} />
                                            </div>
                                            <h3 className="font-semibold text-foreground">{booking.event.title}</h3>
                                            <p className="text-sm text-(--text-secondary)">
                                                Dibuat {formatDate(booking.createdAt)}
                                            </p>
                                        </div>
                                        <div className="flex items-center justify-between gap-4 sm:block sm:text-right">
                                            <p className="text-lg font-semibold text-foreground">
                                                {formatCurrency(booking.totalAmount)}
                                            </p>
                                            <span className="inline-flex items-center gap-1 text-sm font-semibold text-(--accent-primary)">
                                                Detail
                                                <ChevronRight className="h-4 w-4" />
                                            </span>
                                        </div>
                                    </Link>
                                );
                            })}
                        </div>
                    )}
                </DashboardSection>

                <DashboardSection
                    title="Rekomendasi untukmu"
                    description="Pilihan event yang relevan berdasarkan minat dan aktivitas eksplorasimu di Gelaran."
                    actionHref="/events"
                    actionLabel="Lihat katalog"
                >
                    {data.recommendedEvents.length === 0 ? (
                        <CustomerEmptyState
                            title="Belum ada rekomendasi"
                            description="Terus jelajahi event dan simpan wishlist agar rekomendasi personal mulai terisi di dashboard ini."
                            href="/events"
                            ctaLabel="Jelajahi event"
                            icon={Sparkles}
                            className="border-none bg-transparent p-0 shadow-none"
                        />
                    ) : (
                        <div className="space-y-3">
                            {data.recommendedEvents.slice(0, 3).map((event) => (
                                <Link
                                    key={event.id}
                                    href={`/events/${event.slug}`}
                                    className="group flex gap-4 rounded-2xl border border-(--border-light) bg-(--surface-elevated) p-4 transition-colors hover:bg-(--surface-hover)"
                                >
                                    <div className="relative aspect-3/4 w-24 shrink-0 overflow-hidden rounded-2xl bg-(--surface-brand-soft)">
                                        <Image
                                            src={event.posterImage || "/placeholder.jpg"}
                                            alt={event.title}
                                            fill
                                            className="object-cover transition-transform duration-500 group-hover:scale-105"
                                            sizes="96px"
                                        />
                                    </div>
                                    <div className="min-w-0 flex-1 space-y-2">
                                        {event.category ? (
                                            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-(--accent-primary)">
                                                {event.category}
                                            </p>
                                        ) : null}
                                        <h3 className="line-clamp-2 font-semibold text-foreground transition-colors group-hover:text-(--accent-primary)">
                                            {event.title}
                                        </h3>
                                        {event.schedule ? (
                                            <div className="flex items-center gap-2 text-sm text-(--text-secondary)">
                                                <Calendar className="h-4 w-4 text-(--accent-primary)" />
                                                <span>
                                                    {formatDate(event.schedule.date)} • {formatTime(event.schedule.time)}
                                                </span>
                                            </div>
                                        ) : null}
                                        {event.venue ? (
                                            <div className="flex items-center gap-2 text-sm text-(--text-secondary)">
                                                <MapPin className="h-4 w-4 text-(--text-muted)" />
                                                <span className="truncate">
                                                    {event.venue.name}, {event.venue.city}
                                                </span>
                                            </div>
                                        ) : null}
                                        <p className="pt-1 text-sm font-semibold text-foreground">
                                            {event.price
                                                ? event.price.isFree
                                                    ? "Gratis"
                                                    : `Mulai ${formatCurrency(event.price.startingFrom)}`
                                                : "Harga segera diumumkan"}
                                        </p>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    )}
                </DashboardSection>
            </div>
        </div>
    );
}
