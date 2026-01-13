"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
    Ticket,
    Calendar,
    MapPin,
    Loader2,
    AlertCircle,
    Heart,
    Clock,
    ChevronRight,
    Sparkles,
    TrendingUp,
    User,
    LogOut,
    Home,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";

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
    };
    upcomingBookings: UpcomingBooking[];
    recentBookings: RecentBooking[];
    recommendedEvents: RecommendedEvent[];
    user: {
        name: string | null;
        email: string;
    };
}

const STATUS_COLORS: Record<string, string> = {
    PENDING: "bg-yellow-100 text-yellow-700",
    AWAITING_PAYMENT: "bg-orange-100 text-orange-700",
    PAID: "bg-blue-100 text-blue-700",
    CONFIRMED: "bg-green-100 text-green-700",
    CANCELLED: "bg-red-100 text-red-700",
    REFUNDED: "bg-purple-100 text-purple-700",
    EXPIRED: "bg-gray-100 text-gray-700",
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

export default function CustomerDashboardPage() {
    const router = useRouter();
    const [data, setData] = useState<DashboardData | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const supabase = createClient();

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
                setData(result.data);
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

    const handleLogout = async () => {
        await supabase.auth.signOut();
        router.push("/login");
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
        return (
            <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 flex items-center justify-center">
                <div className="text-center">
                    <Loader2 className="h-12 w-12 text-indigo-600 animate-spin mx-auto mb-4" />
                    <p className="text-gray-500 font-medium">Memuat dashboard...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 flex items-center justify-center p-4">
                <div className="text-center max-w-md w-full bg-white/50 backdrop-blur-xl p-8 rounded-3xl shadow-xl border border-white/20">
                    <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
                    <p className="text-gray-900 font-bold text-lg mb-2">{error}</p>
                    <Link href="/" className="inline-block px-6 py-2 bg-indigo-600 text-white rounded-xl font-medium hover:bg-indigo-700 transition-colors shadow-lg shadow-indigo-200">
                        Kembali ke Beranda
                    </Link>
                </div>
            </div>
        );
    }

    if (!data) return null;

    const firstName = data.user.name?.split(" ")[0] || "Pengguna";
    const userInitial = firstName.charAt(0).toUpperCase();

    return (
        <div className="min-h-screen bg-gray-50/50 pb-24 md:pb-8">
            <header className="bg-white/80 backdrop-blur-md sticky top-0 z-40 border-b border-gray-100 hidden md:block">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center text-white font-bold">
                            B
                        </div>
                        <span className="font-bold text-xl bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-purple-600">
                            BSC Platform
                        </span>
                    </div>
                    
                    <nav className="flex items-center gap-6">
                        <Link href="/dashboard" className="text-indigo-600 font-medium text-sm flex items-center gap-1.5 bg-indigo-50 px-3 py-1.5 rounded-full">
                            <Home className="w-4 h-4" />
                            Dashboard
                        </Link>
                        <Link href="/my-bookings" className="text-gray-600 hover:text-gray-900 font-medium text-sm transition-colors">
                            Tiket Saya
                        </Link>
                        <Link href="/wishlist" className="text-gray-600 hover:text-gray-900 font-medium text-sm transition-colors">
                            Wishlist
                        </Link>
                    </nav>

                    <div className="flex items-center gap-3 pl-6 border-l border-gray-200">
                         <div className="text-right">
                            <p className="text-sm font-semibold text-gray-900">{firstName}</p>
                            <p className="text-xs text-gray-500">{data.user.email}</p>
                        </div>
                        <div className="h-9 w-9 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center text-white font-medium shadow-md">
                            {userInitial}
                        </div>
                        <button 
                            onClick={handleLogout}
                            className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-full transition-all ml-2"
                            title="Keluar"
                        >
                            <LogOut className="w-5 h-5" />
                        </button>
                    </div>
                </div>
            </header>

            <header className="bg-white/80 backdrop-blur-md sticky top-0 z-40 px-4 py-3 flex items-center justify-between md:hidden border-b border-gray-100">
                <div className="flex items-center gap-3">
                    <div className="h-9 w-9 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center text-white font-medium shadow-md">
                        {userInitial}
                    </div>
                    <div>
                        <p className="text-xs text-gray-500 font-medium">{getGreeting()}</p>
                        <p className="text-sm font-bold text-gray-900">{firstName}</p>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <Link href="/profile" className="p-2 text-gray-600 bg-gray-100 rounded-full hover:bg-gray-200 transition-colors">
                        <User className="w-5 h-5" />
                    </Link>
                </div>
            </header>

            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-8">
                <section>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="group relative overflow-hidden bg-white rounded-3xl p-6 shadow-sm border border-gray-100 transition-all duration-300 hover:shadow-xl hover:-translate-y-1">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-50 rounded-full -mr-16 -mt-16 transition-transform group-hover:scale-110" />
                            <div className="relative flex flex-col h-full justify-between">
                                <div className="flex items-center justify-between mb-4">
                                    <div className="p-3 bg-indigo-100 text-indigo-600 rounded-2xl">
                                        <Ticket className="h-6 w-6" />
                                    </div>
                                    <Link href="/my-bookings" className="p-2 text-gray-400 hover:text-indigo-600 transition-colors">
                                        <ChevronRight className="h-5 w-5" />
                                    </Link>
                                </div>
                                <div>
                                    <p className="text-3xl font-bold text-gray-900 mb-1">{data.stats.totalBookings}</p>
                                    <p className="text-gray-500 font-medium">Total Pesanan</p>
                                </div>
                            </div>
                        </div>

                        <div className="group relative overflow-hidden bg-white rounded-3xl p-6 shadow-sm border border-gray-100 transition-all duration-300 hover:shadow-xl hover:-translate-y-1">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-50 rounded-full -mr-16 -mt-16 transition-transform group-hover:scale-110" />
                            <div className="relative flex flex-col h-full justify-between">
                                <div className="flex items-center justify-between mb-4">
                                    <div className="p-3 bg-emerald-100 text-emerald-600 rounded-2xl">
                                        <Calendar className="h-6 w-6" />
                                    </div>
                                    <Link href="/my-bookings?status=confirmed" className="p-2 text-gray-400 hover:text-emerald-600 transition-colors">
                                        <ChevronRight className="h-5 w-5" />
                                    </Link>
                                </div>
                                <div>
                                    <p className="text-3xl font-bold text-gray-900 mb-1">{data.stats.upcomingEvents}</p>
                                    <p className="text-gray-500 font-medium">Event Mendatang</p>
                                </div>
                            </div>
                        </div>

                        <div className="group relative overflow-hidden bg-white rounded-3xl p-6 shadow-sm border border-gray-100 transition-all duration-300 hover:shadow-xl hover:-translate-y-1">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-rose-50 rounded-full -mr-16 -mt-16 transition-transform group-hover:scale-110" />
                            <div className="relative flex flex-col h-full justify-between">
                                <div className="flex items-center justify-between mb-4">
                                    <div className="p-3 bg-rose-100 text-rose-600 rounded-2xl">
                                        <Heart className="h-6 w-6" />
                                    </div>
                                    <Link href="/wishlist" className="p-2 text-gray-400 hover:text-rose-600 transition-colors">
                                        <ChevronRight className="h-5 w-5" />
                                    </Link>
                                </div>
                                <div>
                                    <p className="text-3xl font-bold text-gray-900 mb-1">{data.stats.wishlistCount}</p>
                                    <p className="text-gray-500 font-medium">Wishlist</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {data.upcomingBookings.length > 0 && (
                    <section>
                        <div className="flex items-center justify-between mb-6 px-1">
                            <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                                <Clock className="h-5 w-5 text-indigo-600" />
                                Event Mendatang
                            </h2>
                            <Link href="/my-bookings" className="text-indigo-600 hover:text-indigo-500 text-sm font-semibold hover:underline">
                                Lihat Semua
                            </Link>
                        </div>
                        <div className="flex md:grid md:grid-cols-2 gap-4 overflow-x-auto pb-4 md:pb-0 -mx-4 px-4 md:mx-0 md:px-0 snap-x">
                            {data.upcomingBookings.map((booking) => (
                                <Link
                                    key={booking.id}
                                    href={`/my-bookings/${booking.bookingCode}`}
                                    className="snap-center shrink-0 w-[85vw] md:w-auto group relative bg-white rounded-3xl p-3 shadow-sm hover:shadow-xl border border-gray-100 transition-all duration-300 flex gap-4"
                                >
                                    <div className="w-28 h-28 md:w-32 md:h-32 shrink-0 rounded-2xl overflow-hidden relative shadow-inner">
                                        <img
                                            src={booking.event.posterImage || "/placeholder.jpg"}
                                            alt={booking.event.title}
                                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                                        />
                                        <div className="absolute inset-0 bg-black/10 group-hover:bg-transparent transition-colors" />
                                    </div>
                                    <div className="flex-1 py-1 pr-1 min-w-0 flex flex-col justify-between">
                                        <div>
                                            <div className="flex items-start justify-between gap-2 mb-1">
                                                <h3 className="font-bold text-gray-900 truncate group-hover:text-indigo-600 transition-colors">
                                                    {booking.event.title}
                                                </h3>
                                            </div>
                                            {booking.eventSchedule && (
                                                <div className="flex items-center gap-1.5 text-sm text-gray-500 mb-1">
                                                    <Calendar className="h-4 w-4 shrink-0 text-indigo-400" />
                                                    <span className="truncate">
                                                        {formatDate(booking.eventSchedule.scheduleDate)} • {formatTime(booking.eventSchedule.startTime)}
                                                    </span>
                                                </div>
                                            )}
                                            {booking.event.venue && (
                                                <div className="flex items-center gap-1.5 text-sm text-gray-500">
                                                    <MapPin className="h-4 w-4 shrink-0 text-gray-400" />
                                                    <span className="truncate">
                                                        {booking.event.venue.name}, {booking.event.venue.city}
                                                    </span>
                                                </div>
                                            )}
                                        </div>
                                        <div className="flex items-center justify-between mt-2">
                                            <span className={`px-2.5 py-1 rounded-lg text-xs font-semibold ${STATUS_COLORS[booking.status]}`}>
                                                {STATUS_LABELS[booking.status] || booking.status}
                                            </span>
                                            <div className="flex items-center gap-1 text-sm font-semibold text-indigo-600 bg-indigo-50 px-2 py-1 rounded-lg">
                                                <Ticket className="h-3.5 w-3.5" />
                                                <span>{booking.totalTickets}</span>
                                            </div>
                                        </div>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    </section>
                )}

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {data.recentBookings.length > 0 && (
                        <section className="lg:col-span-1">
                             <div className="flex items-center justify-between mb-6 px-1">
                                <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                                    <TrendingUp className="h-5 w-5 text-indigo-600" />
                                    Terbaru
                                </h2>
                                <Link href="/my-bookings" className="text-indigo-600 hover:text-indigo-500 text-sm font-semibold hover:underline">
                                    Lihat Semua
                                </Link>
                            </div>
                            <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
                                <div className="divide-y divide-gray-50">
                                    {data.recentBookings.map((booking) => (
                                        <Link
                                            key={booking.id}
                                            href={`/my-bookings/${booking.bookingCode}`}
                                            className="flex items-center gap-3 p-4 hover:bg-indigo-50/50 transition-colors group"
                                        >
                                            <img
                                                src={booking.event.posterImage || "/placeholder.jpg"}
                                                alt={booking.event.title}
                                                className="w-14 h-14 rounded-xl object-cover shadow-sm group-hover:shadow-md transition-all"
                                            />
                                            <div className="flex-1 min-w-0">
                                                <h3 className="font-semibold text-gray-900 truncate group-hover:text-indigo-700 transition-colors">
                                                    {booking.event.title}
                                                </h3>
                                                <p className="text-xs text-gray-500 mb-1">
                                                    {formatDate(booking.createdAt)}
                                                </p>
                                                <p className="text-sm font-bold text-indigo-600">
                                                    {formatCurrency(booking.totalAmount)}
                                                </p>
                                            </div>
                                            <div className="flex-shrink-0">
                                                <span className={`inline-block w-2 h-2 rounded-full ${
                                                    booking.status === 'PAID' || booking.status === 'CONFIRMED' ? 'bg-green-500' :
                                                    booking.status === 'PENDING' ? 'bg-yellow-500' : 'bg-gray-300'
                                                }`} />
                                            </div>
                                        </Link>
                                    ))}
                                </div>
                            </div>
                        </section>
                    )}

                    {data.recommendedEvents.length > 0 && (
                        <section className={data.recentBookings.length > 0 ? "lg:col-span-2" : "lg:col-span-3"}>
                            <div className="flex items-center justify-between mb-6 px-1">
                                <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                                    <Sparkles className="h-5 w-5 text-indigo-600" />
                                    Rekomendasi
                                </h2>
                                <Link href="/events" className="text-indigo-600 hover:text-indigo-500 text-sm font-semibold hover:underline">
                                    Jelajahi
                                </Link>
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                {data.recommendedEvents.map((event) => (
                                    <Link
                                        key={event.id}
                                        href={`/events/${event.slug}`}
                                        className="group bg-white rounded-3xl p-3 shadow-sm hover:shadow-xl border border-gray-100 transition-all duration-300 hover:-translate-y-1 flex gap-4 h-full"
                                    >
                                        <div className="w-28 shrink-0 rounded-2xl overflow-hidden relative shadow-inner">
                                            <img
                                                src={event.posterImage || "/placeholder.jpg"}
                                                alt={event.title}
                                                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                                            />
                                            {event.price && (
                                                <div className="absolute top-2 left-2 right-2">
                                                    {event.price.isFree ? (
                                                        <span className="inline-block px-2 py-1 bg-green-500/90 backdrop-blur-sm text-white text-[10px] font-bold rounded-lg shadow-sm">
                                                            GRATIS
                                                        </span>
                                                    ) : null}
                                                </div>
                                            )}
                                        </div>
                                        <div className="flex-1 min-w-0 flex flex-col py-1">
                                            <div className="mb-auto">
                                                {event.category && (
                                                    <span className="inline-block text-[10px] font-bold tracking-wider text-indigo-500 uppercase mb-1">
                                                        {event.category}
                                                    </span>
                                                )}
                                                <h3 className="font-bold text-gray-900 leading-tight group-hover:text-indigo-600 transition-colors line-clamp-2 mb-2">
                                                    {event.title}
                                                </h3>
                                            </div>
                                            
                                            <div className="space-y-1">
                                                {event.schedule && (
                                                    <div className="flex items-center gap-1.5 text-xs text-gray-500">
                                                        <Calendar className="h-3.5 w-3.5 text-gray-400" />
                                                        <span>{formatDate(event.schedule.date)}</span>
                                                    </div>
                                                )}
                                                {event.venue && (
                                                    <div className="flex items-center gap-1.5 text-xs text-gray-500">
                                                        <MapPin className="h-3.5 w-3.5 text-gray-400" />
                                                        <span className="truncate">{event.venue.city}</span>
                                                    </div>
                                                )}
                                                {event.price && !event.price.isFree && (
                                                    <div className="pt-2 mt-2 border-t border-dashed border-gray-100 font-bold text-indigo-600 text-sm">
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
                </div>

                {data.upcomingBookings.length === 0 && data.recentBookings.length === 0 && (
                    <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-12 text-center max-w-lg mx-auto">
                        <div className="w-20 h-20 bg-indigo-50 rounded-full flex items-center justify-center mx-auto mb-6">
                            <Ticket className="h-10 w-10 text-indigo-400" />
                        </div>
                        <h3 className="text-xl font-bold text-gray-900 mb-2">
                            Belum ada pesanan
                        </h3>
                        <p className="text-gray-500 mb-8 max-w-xs mx-auto">
                            Jelajahi ribuan event menarik dan amankan tiket pertamamu sekarang!
                        </p>
                        <Link
                            href="/events"
                            className="inline-flex items-center gap-2 px-8 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl font-bold hover:shadow-lg hover:shadow-indigo-200 transition-all hover:-translate-y-0.5"
                        >
                            <Sparkles className="h-5 w-5" />
                            Jelajahi Event
                        </Link>
                    </div>
                )}
            </main>

            <div className="fixed bottom-0 left-0 right-0 bg-white/90 backdrop-blur-xl border-t border-gray-200 pb-safe z-50 md:hidden">
                <div className="flex items-center justify-around px-2 py-3">
                    <Link href="/dashboard" className="flex flex-col items-center gap-1 p-2 text-indigo-600">
                        <Home className="h-6 w-6" />
                        <span className="text-[10px] font-medium">Beranda</span>
                    </Link>
                    <Link href="/my-bookings" className="flex flex-col items-center gap-1 p-2 text-gray-400 hover:text-indigo-600 transition-colors">
                        <Ticket className="h-6 w-6" />
                        <span className="text-[10px] font-medium">Tiket</span>
                    </Link>
                    <div className="relative -top-6">
                        <Link href="/events" className="flex items-center justify-center w-14 h-14 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-full text-white shadow-lg shadow-indigo-200 hover:scale-105 transition-transform">
                            <Sparkles className="h-6 w-6" />
                        </Link>
                    </div>
                    <Link href="/wishlist" className="flex flex-col items-center gap-1 p-2 text-gray-400 hover:text-indigo-600 transition-colors">
                        <Heart className="h-6 w-6" />
                        <span className="text-[10px] font-medium">Wishlist</span>
                    </Link>
                    <button 
                        onClick={handleLogout}
                        className="flex flex-col items-center gap-1 p-2 text-gray-400 hover:text-red-500 transition-colors"
                    >
                        <LogOut className="h-6 w-6" />
                        <span className="text-[10px] font-medium">Keluar</span>
                    </button>
                </div>
            </div>
        </div>
    );
}
