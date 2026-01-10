import { redirect } from "next/navigation";
import Link from "next/link";
import {
    Calendar,
    Users,
    Wallet,
    TrendingUp,
    Plus,
    BarChart3,
    ArrowUpRight,
    ArrowDownRight
} from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import prisma from "@/lib/prisma/client";
import { formatCurrency } from "@/lib/utils";

export default async function OrganizerDashboard() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        redirect("/login?returnUrl=/organizer");
    }

    // Get organizer data
    const organizer = await prisma.user.findUnique({
        where: { email: user.email! },
        include: {
            organizerProfile: true,
            events: {
                where: { deletedAt: null },
                orderBy: { createdAt: "desc" },
                take: 5,
                include: {
                    _count: {
                        select: { bookings: true },
                    },
                    schedules: {
                        take: 1,
                        orderBy: { scheduleDate: "asc" },
                    },
                },
            },
        },
    });

    if (!organizer || organizer.role !== "ORGANIZER") {
        redirect("/");
    }

    // Stats
    const totalEvents = await prisma.event.count({
        where: { organizerId: organizer.id, deletedAt: null },
    });

    const totalBookings = await prisma.booking.count({
        where: {
            event: { organizerId: organizer.id },
            status: { in: ["CONFIRMED", "PAID"] },
        },
    });

    const stats = [
        {
            label: "Total Events",
            value: totalEvents,
            icon: Calendar,
            change: "+2",
            changeType: "positive" as const,
        },
        {
            label: "Total Attendees",
            value: totalBookings,
            icon: Users,
            change: "+12%",
            changeType: "positive" as const,
        },
        {
            label: "Wallet Balance",
            value: formatCurrency(Number(organizer.organizerProfile?.walletBalance || 0)),
            icon: Wallet,
            isAmount: true,
        },
        {
            label: "Total Earned",
            value: formatCurrency(Number(organizer.organizerProfile?.totalEarned || 0)),
            icon: TrendingUp,
            isAmount: true,
        },
    ];

    return (
        <div className="min-h-screen bg-gray-100">
            {/* Header */}
            <header className="bg-white border-b">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
                            <p className="text-gray-500">
                                Selamat datang, {organizer.organizerProfile?.organizationName || organizer.name}
                            </p>
                        </div>
                        <Link
                            href="/organizer/events/new"
                            className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700"
                        >
                            <Plus className="h-5 w-5" />
                            Buat Event
                        </Link>
                    </div>
                </div>
            </header>

            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                    {stats.map((stat) => (
                        <div key={stat.label} className="bg-white rounded-xl p-6 shadow-sm">
                            <div className="flex items-center justify-between mb-4">
                                <div className="w-12 h-12 bg-indigo-100 rounded-lg flex items-center justify-center">
                                    <stat.icon className="h-6 w-6 text-indigo-600" />
                                </div>
                                {stat.change && (
                                    <span className={`text-sm font-medium flex items-center gap-1 ${stat.changeType === "positive" ? "text-green-600" : "text-red-600"
                                        }`}>
                                        {stat.changeType === "positive"
                                            ? <ArrowUpRight className="h-4 w-4" />
                                            : <ArrowDownRight className="h-4 w-4" />
                                        }
                                        {stat.change}
                                    </span>
                                )}
                            </div>
                            <p className="text-2xl font-bold text-gray-900">
                                {stat.value}
                            </p>
                            <p className="text-sm text-gray-500">{stat.label}</p>
                        </div>
                    ))}
                </div>

                {/* Recent Events */}
                <div className="bg-white rounded-xl shadow-sm">
                    <div className="px-6 py-4 border-b flex items-center justify-between">
                        <h2 className="text-lg font-semibold flex items-center gap-2">
                            <BarChart3 className="h-5 w-5 text-gray-500" />
                            Event Terbaru
                        </h2>
                        <Link href="/organizer/events" className="text-indigo-600 text-sm font-medium hover:text-indigo-500">
                            Lihat Semua
                        </Link>
                    </div>
                    <div className="divide-y">
                        {organizer.events.length === 0 ? (
                            <div className="p-12 text-center">
                                <Calendar className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                                <p className="text-gray-500">Belum ada event. Buat event pertama kamu!</p>
                                <Link
                                    href="/organizer/events/new"
                                    className="inline-flex items-center gap-2 mt-4 text-indigo-600 font-medium"
                                >
                                    <Plus className="h-4 w-4" />
                                    Buat Event
                                </Link>
                            </div>
                        ) : (
                            organizer.events.map((event) => (
                                <Link
                                    key={event.id}
                                    href={`/organizer/events/${event.id}`}
                                    className="flex items-center gap-4 px-6 py-4 hover:bg-gray-50"
                                >
                                    <img
                                        src={event.posterImage || "/placeholder.jpg"}
                                        alt={event.title}
                                        className="w-16 h-16 object-cover rounded-lg"
                                    />
                                    <div className="flex-1 min-w-0">
                                        <h3 className="font-medium text-gray-900 truncate">{event.title}</h3>
                                        <p className="text-sm text-gray-500">
                                            {event.schedules[0]
                                                ? new Date(event.schedules[0].scheduleDate).toLocaleDateString("id-ID")
                                                : "Belum ada jadwal"
                                            }
                                        </p>
                                    </div>
                                    <div className="text-right">
                                        <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${event.status === "PUBLISHED"
                                                ? "bg-green-100 text-green-700"
                                                : event.status === "DRAFT"
                                                    ? "bg-gray-100 text-gray-700"
                                                    : "bg-yellow-100 text-yellow-700"
                                            }`}>
                                            {event.status}
                                        </span>
                                        <p className="text-sm text-gray-500 mt-1">
                                            {event._count.bookings} bookings
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
