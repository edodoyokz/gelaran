import Link from "next/link";
import {
    Calendar,
    Users,
    Wallet,
    TrendingUp,
    Plus,
    BarChart3,
    ArrowUpRight,
    CreditCard,
    Settings,
    QrCode,
    Clock,
    CheckCircle,
    AlertCircle,
    ArrowRight,
    Ticket,
    Eye,
} from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import prisma from "@/lib/prisma/client";
import { formatCurrency } from "@/lib/utils";
import { redirect } from "next/navigation";

const STATUS_COLORS: Record<string, string> = {
    DRAFT: "bg-gray-100 text-gray-700",
    PENDING_REVIEW: "bg-yellow-100 text-yellow-700",
    PUBLISHED: "bg-green-100 text-green-700",
    CANCELLED: "bg-red-100 text-red-700",
    COMPLETED: "bg-blue-100 text-blue-700",
};

export default async function OrganizerDashboard() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        redirect("/login?returnUrl=/organizer");
    }

    const organizer = await prisma.user.findUnique({
        where: { email: user.email! },
        include: {
            organizerProfile: true,
        },
    });

    if (!organizer || organizer.role !== "ORGANIZER") {
        redirect("/");
    }

    const now = new Date();
    const sevenDaysFromNow = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);

    const [
        totalEvents,
        totalBookings,
        recentEvents,
        upcomingEvents,
        recentBookings,
        pendingWithdrawals,
    ] = await Promise.all([
        prisma.event.count({
            where: { organizerId: organizer.id, deletedAt: null },
        }),
        prisma.booking.count({
            where: {
                event: { organizerId: organizer.id },
                status: { in: ["CONFIRMED", "PAID"] },
            },
        }),
        prisma.event.findMany({
            where: { organizerId: organizer.id, deletedAt: null },
            orderBy: { createdAt: "desc" },
            take: 5,
            include: {
                _count: { select: { bookings: { where: { status: { in: ["CONFIRMED", "PAID"] } } } } },
                schedules: { take: 1, orderBy: { scheduleDate: "asc" } },
            },
        }),
        prisma.event.findMany({
            where: {
                organizerId: organizer.id,
                deletedAt: null,
                status: "PUBLISHED",
                schedules: {
                    some: {
                        scheduleDate: { gte: now, lte: sevenDaysFromNow },
                    },
                },
            },
            orderBy: { schedules: { _count: "asc" } },
            take: 3,
            include: {
                schedules: {
                    where: { scheduleDate: { gte: now, lte: sevenDaysFromNow } },
                    orderBy: { scheduleDate: "asc" },
                    take: 1,
                },
                _count: { select: { bookings: { where: { status: { in: ["CONFIRMED", "PAID"] } } } } },
            },
        }),
        prisma.booking.findMany({
            where: {
                event: { organizerId: organizer.id },
                status: { in: ["CONFIRMED", "PAID"] },
            },
            orderBy: { createdAt: "desc" },
            take: 5,
            include: {
                user: { select: { name: true, email: true, avatarUrl: true } },
                event: { select: { title: true, slug: true } },
                bookedTickets: { include: { ticketType: { select: { name: true } } } },
            },
        }),
        prisma.payout.count({
            where: {
                organizerProfile: { userId: organizer.id },
                status: "REQUESTED",
            },
        }),
    ]);

    const stats = [
        {
            label: "Total Events",
            value: totalEvents,
            icon: Calendar,
            color: "indigo",
            href: "/organizer/events",
        },
        {
            label: "Total Peserta",
            value: totalBookings,
            icon: Users,
            color: "purple",
        },
        {
            label: "Saldo Wallet",
            value: formatCurrency(Number(organizer.organizerProfile?.walletBalance || 0)),
            icon: Wallet,
            color: "green",
            href: "/organizer/wallet",
        },
        {
            label: "Total Pendapatan",
            value: formatCurrency(Number(organizer.organizerProfile?.totalEarned || 0)),
            icon: TrendingUp,
            color: "blue",
        },
    ];

    const quickActions = [
        { label: "Buat Event", icon: Plus, href: "/organizer/events/new", color: "indigo" },
        { label: "Wallet", icon: Wallet, href: "/organizer/wallet", color: "green" },
        { label: "Tarik Dana", icon: CreditCard, href: "/organizer/wallet/withdraw", color: "purple" },
        { label: "Pengaturan", icon: Settings, href: "/organizer/settings", color: "gray" },
    ];

    const colorMap: Record<string, { bg: string; icon: string; hover: string }> = {
        indigo: { bg: "bg-indigo-100", icon: "text-indigo-600", hover: "hover:bg-indigo-50" },
        purple: { bg: "bg-purple-100", icon: "text-purple-600", hover: "hover:bg-purple-50" },
        green: { bg: "bg-green-100", icon: "text-green-600", hover: "hover:bg-green-50" },
        blue: { bg: "bg-blue-100", icon: "text-blue-600", hover: "hover:bg-blue-50" },
        gray: { bg: "bg-gray-100", icon: "text-gray-600", hover: "hover:bg-gray-50" },
    };

    return (
        <div className="min-h-screen">
            <header className="bg-white border-b sticky top-0 z-10">
                <div className="px-6 py-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
                            <p className="text-gray-500">
                                Selamat datang, {organizer.organizerProfile?.organizationName || organizer.name}
                            </p>
                        </div>
                        <Link
                            href="/organizer/events/new"
                            className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 transition-colors shadow-sm"
                        >
                            <Plus className="h-5 w-5" />
                            Buat Event
                        </Link>
                    </div>
                </div>
            </header>

            <main className="p-6 space-y-6">
                {pendingWithdrawals > 0 && (
                    <div className="flex items-center gap-3 p-4 bg-yellow-50 border border-yellow-200 rounded-xl">
                        <AlertCircle className="h-5 w-5 text-yellow-600 flex-shrink-0" />
                        <p className="text-yellow-800 text-sm">
                            Anda memiliki <strong>{pendingWithdrawals} permintaan penarikan</strong> yang sedang diproses.
                        </p>
                        <Link href="/organizer/wallet" className="ml-auto text-yellow-700 text-sm font-medium hover:underline">
                            Lihat Status
                        </Link>
                    </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    {stats.map((stat) => {
                        const colors = colorMap[stat.color];

                        if (stat.href) {
                            return (
                                <Link
                                    key={stat.label}
                                    href={stat.href}
                                    className="bg-white rounded-xl p-5 shadow-sm border border-gray-100 hover:shadow-md transition-shadow cursor-pointer"
                                >
                                    <div className="flex items-center gap-4">
                                        <div className={`w-12 h-12 ${colors.bg} rounded-xl flex items-center justify-center`}>
                                            <stat.icon className={`h-6 w-6 ${colors.icon}`} />
                                        </div>
                                        <div>
                                            <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                                            <p className="text-sm text-gray-500">{stat.label}</p>
                                        </div>
                                    </div>
                                </Link>
                            );
                        }

                        return (
                            <div
                                key={stat.label}
                                className="bg-white rounded-xl p-5 shadow-sm border border-gray-100"
                            >
                                <div className="flex items-center gap-4">
                                    <div className={`w-12 h-12 ${colors.bg} rounded-xl flex items-center justify-center`}>
                                        <stat.icon className={`h-6 w-6 ${colors.icon}`} />
                                    </div>
                                    <div>
                                        <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                                        <p className="text-sm text-gray-500">{stat.label}</p>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>

                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
                    <h2 className="text-sm font-semibold text-gray-900 mb-4">Aksi Cepat</h2>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                        {quickActions.map((action) => {
                            const colors = colorMap[action.color];
                            return (
                                <Link
                                    key={action.label}
                                    href={action.href}
                                    className={`flex flex-col items-center gap-2 p-4 rounded-xl border border-gray-100 ${colors.hover} transition-colors`}
                                >
                                    <div className={`w-10 h-10 ${colors.bg} rounded-lg flex items-center justify-center`}>
                                        <action.icon className={`h-5 w-5 ${colors.icon}`} />
                                    </div>
                                    <span className="text-sm font-medium text-gray-700">{action.label}</span>
                                </Link>
                            );
                        })}
                    </div>
                </div>

                <div className="grid lg:grid-cols-2 gap-6">
                    {upcomingEvents.length > 0 && (
                        <div className="bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl shadow-lg p-5 text-white">
                            <div className="flex items-center justify-between mb-4">
                                <h2 className="font-semibold flex items-center gap-2">
                                    <Clock className="h-5 w-5" />
                                    Event Mendatang (7 Hari)
                                </h2>
                                <span className="text-xs bg-white/20 px-2 py-1 rounded-full">
                                    {upcomingEvents.length} event
                                </span>
                            </div>
                            <div className="space-y-3">
                                {upcomingEvents.map((event) => {
                                    const schedule = event.schedules[0];
                                    const eventDate = schedule ? new Date(schedule.scheduleDate) : null;
                                    const daysUntil = eventDate
                                        ? Math.ceil((eventDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
                                        : null;

                                    return (
                                        <Link
                                            key={event.id}
                                            href={`/organizer/events/${event.id}`}
                                            className="flex items-center gap-3 p-3 bg-white/10 rounded-lg hover:bg-white/20 transition-colors"
                                        >
                                            <div className="flex-1 min-w-0">
                                                <p className="font-medium truncate">{event.title}</p>
                                                <p className="text-sm text-white/70">
                                                    {eventDate?.toLocaleDateString("id-ID", { weekday: "short", day: "numeric", month: "short" })}
                                                    {" • "}
                                                    {event._count.bookings} peserta
                                                </p>
                                            </div>
                                            {daysUntil !== null && (
                                                <span className={`text-xs font-medium px-2 py-1 rounded-full ${
                                                    daysUntil <= 1 ? "bg-red-500" : daysUntil <= 3 ? "bg-yellow-500" : "bg-white/20"
                                                }`}>
                                                    {daysUntil === 0 ? "Hari Ini" : daysUntil === 1 ? "Besok" : `${daysUntil} hari`}
                                                </span>
                                            )}
                                        </Link>
                                    );
                                })}
                            </div>
                        </div>
                    )}

                    <div className="bg-white rounded-xl shadow-sm border border-gray-100">
                        <div className="px-5 py-4 border-b flex items-center justify-between">
                            <h2 className="font-semibold text-gray-900 flex items-center gap-2">
                                <Ticket className="h-5 w-5 text-gray-500" />
                                Booking Terbaru
                            </h2>
                            <Link href="/organizer/events" className="text-indigo-600 text-sm font-medium hover:text-indigo-500">
                                Lihat Semua
                            </Link>
                        </div>
                        <div className="divide-y">
                            {recentBookings.length === 0 ? (
                                <div className="p-8 text-center">
                                    <Ticket className="h-10 w-10 text-gray-300 mx-auto mb-3" />
                                    <p className="text-gray-500 text-sm">Belum ada booking</p>
                                </div>
                            ) : (
                                recentBookings.map((booking) => (
                                    <div key={booking.id} className="flex items-center gap-4 px-5 py-3">
                                        {booking.user?.avatarUrl ? (
                                            <img
                                                src={booking.user.avatarUrl}
                                                alt={booking.user.name}
                                                className="w-9 h-9 rounded-full object-cover"
                                            />
                                        ) : (
                                            <div className="w-9 h-9 rounded-full bg-gray-100 flex items-center justify-center">
                                                <Users className="h-4 w-4 text-gray-400" />
                                            </div>
                                        )}
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm font-medium text-gray-900 truncate">
                                                {booking.user?.name || "Guest"}
                                            </p>
                                            <p className="text-xs text-gray-500 truncate">
                                                {booking.event.title} • {booking.bookedTickets.length} tiket
                                            </p>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-sm font-medium text-gray-900">
                                                {formatCurrency(Number(booking.totalAmount))}
                                            </p>
                                            <p className="text-xs text-gray-400">
                                                {new Date(booking.createdAt).toLocaleDateString("id-ID")}
                                            </p>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-xl shadow-sm border border-gray-100">
                    <div className="px-5 py-4 border-b flex items-center justify-between">
                        <h2 className="font-semibold text-gray-900 flex items-center gap-2">
                            <BarChart3 className="h-5 w-5 text-gray-500" />
                            Event Terbaru
                        </h2>
                        <Link href="/organizer/events" className="text-indigo-600 text-sm font-medium hover:text-indigo-500 flex items-center gap-1">
                            Lihat Semua
                            <ArrowRight className="h-4 w-4" />
                        </Link>
                    </div>
                    <div className="divide-y">
                        {recentEvents.length === 0 ? (
                            <div className="p-12 text-center">
                                <Calendar className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                                <p className="text-gray-500 mb-4">Belum ada event. Buat event pertama kamu!</p>
                                <Link
                                    href="/organizer/events/new"
                                    className="inline-flex items-center gap-2 text-indigo-600 font-medium"
                                >
                                    <Plus className="h-4 w-4" />
                                    Buat Event
                                </Link>
                            </div>
                        ) : (
                            recentEvents.map((event) => (
                                <Link
                                    key={event.id}
                                    href={`/organizer/events/${event.id}`}
                                    className="flex items-center gap-4 px-5 py-4 hover:bg-gray-50 transition-colors"
                                >
                                    <img
                                        src={event.posterImage || "/placeholder.jpg"}
                                        alt={event.title}
                                        className="w-14 h-14 object-cover rounded-lg flex-shrink-0"
                                    />
                                    <div className="flex-1 min-w-0">
                                        <h3 className="font-medium text-gray-900 truncate">{event.title}</h3>
                                        <p className="text-sm text-gray-500">
                                            {event.schedules[0]
                                                ? new Date(event.schedules[0].scheduleDate).toLocaleDateString("id-ID", {
                                                    weekday: "short",
                                                    day: "numeric",
                                                    month: "short",
                                                    year: "numeric",
                                                })
                                                : "Belum ada jadwal"
                                            }
                                        </p>
                                    </div>
                                    <div className="text-right flex-shrink-0">
                                        <span className={`inline-flex px-2.5 py-1 text-xs font-medium rounded-full ${STATUS_COLORS[event.status]}`}>
                                            {event.status === "PUBLISHED" ? "Aktif" : event.status === "DRAFT" ? "Draft" : event.status}
                                        </span>
                                        <p className="text-sm text-gray-500 mt-1">
                                            {event._count.bookings} peserta
                                        </p>
                                    </div>
                                </Link>
                            ))
                        )}
                    </div>
                </div>
            </main>
        </div>
    );
}
