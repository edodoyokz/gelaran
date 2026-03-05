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
import { OrganizerHeader } from "@/components/organizer/OrganizerHeader";

const STATUS_COLORS: Record<string, string> = {
    DRAFT: "bg-gray-500/10 text-[var(--text-muted)]",
    PENDING_REVIEW: "bg-[var(--warning-bg)] text-[var(--warning-text)]",
    PUBLISHED: "bg-[var(--success-bg)] text-[var(--success-text)]",
    CANCELLED: "bg-[var(--error-bg)] text-[var(--error-text)]",
    COMPLETED: "bg-[var(--info-bg)] text-[var(--info-text)]",
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
        indigo: { bg: "bg-indigo-500/10", icon: "text-indigo-500", hover: "hover:bg-indigo-500/5" },
        purple: { bg: "bg-purple-500/10", icon: "text-purple-500", hover: "hover:bg-purple-500/5" },
        green: { bg: "bg-emerald-500/10", icon: "text-emerald-500", hover: "hover:bg-emerald-500/5" },
        blue: { bg: "bg-blue-500/10", icon: "text-blue-500", hover: "hover:bg-blue-500/5" },
        gray: { bg: "bg-gray-500/10", icon: "text-[var(--text-muted)]", hover: "hover:bg-gray-500/5" },
    };

    return (
        <div className="min-h-screen">
            <OrganizerHeader 
                title="Dashboard"
                subtitle={`Selamat datang, ${organizer.organizerProfile?.organizationName || organizer.name}`}
            />

            <main className="p-6 space-y-6">
                {pendingWithdrawals > 0 && (
                    <div className="flex items-center gap-3 p-4 rounded-xl bg-[var(--warning-bg)] border border-[var(--warning)]/20">
                        <AlertCircle className="h-5 w-5 text-[var(--warning)] flex-shrink-0" />
                        <p className="text-[var(--warning-text)] text-sm">
                            Anda memiliki <strong>{pendingWithdrawals} permintaan penarikan</strong> yang sedang diproses.
                        </p>
                        <Link href="/organizer/wallet" className="ml-auto text-[var(--warning-text)] text-sm font-medium hover:underline">
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
                                    className="rounded-xl p-5 shadow-[var(--shadow-sm)] hover:shadow-[var(--shadow-md)] transition-shadow cursor-pointer bg-[var(--surface)] border border-[var(--border)]"
                                >
                                    <div className="flex items-center gap-4">
                                        <div className={`w-12 h-12 ${colors.bg} rounded-xl flex items-center justify-center`}>
                                            <stat.icon className={`h-6 w-6 ${colors.icon}`} />
                                        </div>
                                        <div>
                                            <p className="text-2xl font-bold text-[var(--text-primary)]">{stat.value}</p>
                                            <p className="text-sm text-[var(--text-muted)]">{stat.label}</p>
                                        </div>
                                    </div>
                                </Link>
                            );
                        }

                        return (
                            <div
                                key={stat.label}
                                className="rounded-xl p-5 shadow-[var(--shadow-sm)] bg-[var(--surface)] border border-[var(--border)]"
                            >
                                <div className="flex items-center gap-4">
                                    <div className={`w-12 h-12 ${colors.bg} rounded-xl flex items-center justify-center`}>
                                        <stat.icon className={`h-6 w-6 ${colors.icon}`} />
                                    </div>
                                    <div>
                                        <p className="text-2xl font-bold text-[var(--text-primary)]">{stat.value}</p>
                                        <p className="text-sm text-[var(--text-muted)]">{stat.label}</p>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>

                <div className="rounded-xl shadow-[var(--shadow-sm)] p-5 bg-[var(--surface)] border border-[var(--border)]">
                    <h2 className="text-sm font-semibold text-[var(--text-primary)] mb-4">Aksi Cepat</h2>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                        {quickActions.map((action) => {
                            const colors = colorMap[action.color];
                            return (
                                <Link
                                    key={action.label}
                                    href={action.href}
                                    className={`flex flex-col items-center gap-2 p-4 rounded-xl border border-[var(--border)] ${colors.hover} transition-colors`}
                                >
                                    <div className={`w-10 h-10 ${colors.bg} rounded-lg flex items-center justify-center`}>
                                        <action.icon className={`h-5 w-5 ${colors.icon}`} />
                                    </div>
                                    <span className="text-sm font-medium text-[var(--text-secondary)]">{action.label}</span>
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
                                <span className="text-xs bg-[var(--surface)]/20 px-2 py-1 rounded-full">
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
                                            className="flex items-center gap-3 p-3 bg-[var(--surface)]/10 rounded-lg hover:bg-[var(--surface)]/20 transition-colors"
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
                                                    daysUntil <= 1 ? "bg-red-500" : daysUntil <= 3 ? "bg-yellow-500" : "bg-[var(--surface)]/20"
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

                    <div className="rounded-xl shadow-[var(--shadow-sm)] bg-[var(--surface)] border border-[var(--border)]">
                        <div className="px-5 py-4 border-b border-[var(--border)] flex items-center justify-between">
                            <h2 className="font-semibold text-[var(--text-primary)] flex items-center gap-2">
                                <Ticket className="h-5 w-5 text-[var(--text-muted)]" />
                                Booking Terbaru
                            </h2>
                            <Link href="/organizer/events" className="text-[var(--accent-primary)] text-sm font-medium hover:opacity-80">
                                Lihat Semua
                            </Link>
                        </div>
                        <div className="divide-y divide-[var(--border)]">
                            {recentBookings.length === 0 ? (
                                <div className="p-8 text-center">
                                    <Ticket className="h-10 w-10 text-[var(--text-muted)] mx-auto mb-3" />
                                    <p className="text-[var(--text-muted)] text-sm">Belum ada booking</p>
                                </div>
                            ) : (
                                recentBookings.map((booking) => (
                                    <div key={booking.id} className="flex items-center gap-4 px-5 py-3">
                                        {booking.user?.avatarUrl ? (
                                            <img
                                                src={booking.user.avatarUrl}
                                                alt={booking.user.name ?? 'User'}
                                                className="w-9 h-9 rounded-full object-cover"
                                            />
                                        ) : (
                                            <div className="w-9 h-9 rounded-full bg-[var(--surface-hover)] flex items-center justify-center">
                                                <Users className="h-4 w-4 text-[var(--text-muted)]" />
                                            </div>
                                        )}
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm font-medium text-[var(--text-primary)] truncate">
                                                {booking.user?.name || "Guest"}
                                            </p>
                                            <p className="text-xs text-[var(--text-muted)] truncate">
                                                {booking.event.title} • {booking.bookedTickets.length} tiket
                                            </p>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-sm font-medium text-[var(--text-primary)]">
                                                {formatCurrency(Number(booking.totalAmount))}
                                            </p>
                                            <p className="text-xs text-[var(--text-muted)]">
                                                {new Date(booking.createdAt).toLocaleDateString("id-ID")}
                                            </p>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </div>

                <div className="rounded-xl shadow-[var(--shadow-sm)] bg-[var(--surface)] border border-[var(--border)]">
                    <div className="px-5 py-4 border-b border-[var(--border)] flex items-center justify-between">
                        <h2 className="font-semibold text-[var(--text-primary)] flex items-center gap-2">
                            <BarChart3 className="h-5 w-5 text-[var(--text-muted)]" />
                            Event Terbaru
                        </h2>
                        <Link href="/organizer/events" className="text-[var(--accent-primary)] text-sm font-medium hover:opacity-80 flex items-center gap-1">
                            Lihat Semua
                            <ArrowRight className="h-4 w-4" />
                        </Link>
                    </div>
                    <div className="divide-y divide-[var(--border)]">
                        {recentEvents.length === 0 ? (
                            <div className="p-12 text-center">
                                <Calendar className="h-12 w-12 text-[var(--text-muted)] mx-auto mb-4" />
                                <p className="text-[var(--text-muted)] mb-4">Belum ada event. Buat event pertama kamu!</p>
                                <Link
                                    href="/organizer/events/new"
                                    className="inline-flex items-center gap-2 text-[var(--accent-primary)] font-medium"
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
                                    className="flex items-center gap-4 px-5 py-4 hover:bg-[var(--surface-hover)] transition-colors"
                                >
                                    <img
                                        src={event.posterImage || "/placeholder.jpg"}
                                        alt={event.title}
                                        className="w-14 h-14 object-cover rounded-lg flex-shrink-0"
                                    />
                                    <div className="flex-1 min-w-0">
                                        <h3 className="font-medium text-[var(--text-primary)] truncate">{event.title}</h3>
                                        <p className="text-sm text-[var(--text-muted)]">
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
                                        <p className="text-sm text-[var(--text-muted)] mt-1">
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
