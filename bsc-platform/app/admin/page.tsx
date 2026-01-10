import { redirect } from "next/navigation";
import Link from "next/link";
import {
    Users,
    Calendar,
    CreditCard,
    AlertCircle,
    TrendingUp,
    ArrowUpRight,
    Shield,
    Settings
} from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import prisma from "@/lib/prisma/client";
import { formatCurrency } from "@/lib/utils";

export default async function AdminDashboard() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        redirect("/login?returnUrl=/admin");
    }

    // Check if user is admin
    const adminUser = await prisma.user.findUnique({
        where: { email: user.email! },
    });

    if (!adminUser || !["ADMIN", "SUPER_ADMIN"].includes(adminUser.role)) {
        redirect("/");
    }

    // Get platform stats
    const [
        totalUsers,
        totalOrganizers,
        totalEvents,
        publishedEvents,
        totalBookings,
        pendingPayouts,
    ] = await Promise.all([
        prisma.user.count({ where: { deletedAt: null } }),
        prisma.user.count({ where: { role: "ORGANIZER", deletedAt: null } }),
        prisma.event.count({ where: { deletedAt: null } }),
        prisma.event.count({ where: { status: "PUBLISHED", deletedAt: null } }),
        prisma.booking.count({ where: { status: { in: ["CONFIRMED", "PAID"] } } }),
        prisma.payout.count({ where: { status: "REQUESTED" } }),
    ]);

    // Get total revenue (simplified)
    const transactions = await prisma.transaction.aggregate({
        where: { status: "SUCCESS" },
        _sum: { amount: true },
    });
    const totalRevenue = Number(transactions._sum.amount || 0);

    // Recent activities
    const recentBookings = await prisma.booking.findMany({
        take: 5,
        orderBy: { createdAt: "desc" },
        where: { status: { in: ["CONFIRMED", "PAID"] } },
        include: {
            event: { select: { title: true } },
            user: { select: { name: true, email: true } },
        },
    });

    const stats = [
        {
            label: "Total Users",
            value: totalUsers,
            icon: Users,
            href: "/admin/users",
            color: "bg-blue-500",
        },
        {
            label: "Total Events",
            value: `${publishedEvents}/${totalEvents}`,
            subLabel: "Published/Total",
            icon: Calendar,
            href: "/admin/events",
            color: "bg-green-500",
        },
        {
            label: "Total Bookings",
            value: totalBookings,
            icon: CreditCard,
            href: "/admin/bookings",
            color: "bg-purple-500",
        },
        {
            label: "Platform Revenue",
            value: formatCurrency(totalRevenue),
            icon: TrendingUp,
            href: "/admin/finance",
            color: "bg-indigo-500",
        },
    ];

    return (
        <div className="min-h-screen bg-gray-100">
            {/* Header */}
            <header className="bg-white border-b">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-indigo-600 rounded-lg flex items-center justify-center">
                                <Shield className="h-6 w-6 text-white" />
                            </div>
                            <div>
                                <h1 className="text-2xl font-bold text-gray-900">Admin Panel</h1>
                                <p className="text-sm text-gray-500">BSC Platform Management</p>
                            </div>
                        </div>
                        <Link
                            href="/admin/settings"
                            className="p-2 text-gray-500 hover:text-gray-700 rounded-lg hover:bg-gray-100"
                        >
                            <Settings className="h-5 w-5" />
                        </Link>
                    </div>
                </div>
            </header>

            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Alert for pending payouts */}
                {pendingPayouts > 0 && (
                    <div className="mb-6 bg-yellow-50 border border-yellow-200 rounded-xl p-4 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <AlertCircle className="h-5 w-5 text-yellow-600" />
                            <div>
                                <p className="font-medium text-yellow-800">
                                    {pendingPayouts} payout request{pendingPayouts > 1 ? "s" : ""} pending
                                </p>
                                <p className="text-sm text-yellow-600">Review and process organizer payouts</p>
                            </div>
                        </div>
                        <Link
                            href="/admin/payouts"
                            className="px-4 py-2 bg-yellow-600 text-white rounded-lg text-sm font-medium hover:bg-yellow-700"
                        >
                            Review
                        </Link>
                    </div>
                )}

                {/* Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                    {stats.map((stat) => (
                        <Link
                            key={stat.label}
                            href={stat.href}
                            className="bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow group"
                        >
                            <div className="flex items-center justify-between mb-4">
                                <div className={`w-12 h-12 ${stat.color} rounded-lg flex items-center justify-center`}>
                                    <stat.icon className="h-6 w-6 text-white" />
                                </div>
                                <ArrowUpRight className="h-5 w-5 text-gray-400 group-hover:text-indigo-600" />
                            </div>
                            <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                            <p className="text-sm text-gray-500">{stat.subLabel || stat.label}</p>
                        </Link>
                    ))}
                </div>

                {/* Quick Links */}
                <div className="grid md:grid-cols-3 gap-6 mb-8">
                    <Link
                        href="/admin/users"
                        className="bg-white rounded-xl p-6 shadow-sm hover:shadow-md flex items-center gap-4"
                    >
                        <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                            <Users className="h-6 w-6 text-blue-600" />
                        </div>
                        <div>
                            <h3 className="font-semibold text-gray-900">User Management</h3>
                            <p className="text-sm text-gray-500">{totalOrganizers} organizers</p>
                        </div>
                    </Link>
                    <Link
                        href="/admin/events"
                        className="bg-white rounded-xl p-6 shadow-sm hover:shadow-md flex items-center gap-4"
                    >
                        <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                            <Calendar className="h-6 w-6 text-green-600" />
                        </div>
                        <div>
                            <h3 className="font-semibold text-gray-900">Event Moderation</h3>
                            <p className="text-sm text-gray-500">{publishedEvents} published</p>
                        </div>
                    </Link>
                    <Link
                        href="/admin/payouts"
                        className="bg-white rounded-xl p-6 shadow-sm hover:shadow-md flex items-center gap-4"
                    >
                        <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                            <CreditCard className="h-6 w-6 text-purple-600" />
                        </div>
                        <div>
                            <h3 className="font-semibold text-gray-900">Payout Processing</h3>
                            <p className="text-sm text-gray-500">{pendingPayouts} pending</p>
                        </div>
                    </Link>
                </div>

                {/* Recent Activity */}
                <div className="bg-white rounded-xl shadow-sm">
                    <div className="px-6 py-4 border-b">
                        <h2 className="text-lg font-semibold">Recent Bookings</h2>
                    </div>
                    <div className="divide-y">
                        {recentBookings.length === 0 ? (
                            <div className="p-8 text-center text-gray-500">
                                No recent bookings
                            </div>
                        ) : (
                            recentBookings.map((booking) => (
                                <div key={booking.id} className="px-6 py-4 flex items-center justify-between">
                                    <div>
                                        <p className="font-medium text-gray-900">{booking.event.title}</p>
                                        <p className="text-sm text-gray-500">
                                            {booking.user?.name || booking.guestName || "Guest"} • {booking.bookingCode}
                                        </p>
                                    </div>
                                    <div className="text-right">
                                        <p className="font-medium text-indigo-600">
                                            {formatCurrency(Number(booking.totalAmount))}
                                        </p>
                                        <p className="text-xs text-gray-500">
                                            {new Date(booking.createdAt).toLocaleDateString("id-ID")}
                                        </p>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </main>
        </div>
    );
}
