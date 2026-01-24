import { redirect } from "next/navigation";
import Link from "next/link";
import type { Decimal } from "@prisma/client/runtime/library";
import {
    Users,
    Calendar,
    CreditCard,
    AlertCircle,
    TrendingUp,
    ArrowUpRight,
    MapPin,
    Tag,
    Settings,
    LayoutTemplate,
} from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import prisma from "@/lib/prisma/client";
import { formatCurrency } from "@/lib/utils";
import { AdminHeader } from "@/components/admin/AdminHeader";
import { AdminDashboardCharts } from "@/components/admin/AdminDashboardCharts";
import { RevenueBreakdown } from "@/components/admin/RevenueBreakdown";
import { CommissionOverview } from "@/components/admin/CommissionOverview";

interface RecentBooking {
    id: string;
    bookingCode: string;
    status: string;
    event: { 
        title: string;
        organizer: {
            name: string | null;
            organizerProfile: {
                organizationName: string;
            } | null;
        };
    };
    user: { name: string | null; email: string | null } | null;
    guestName: string | null;
    totalAmount: Decimal;
    createdAt: Date;
}

export default async function AdminDashboard() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        redirect("/login?returnUrl=/admin");
    }

    const adminUser = await prisma.user.findUnique({
        where: { email: user.email! },
    });

    if (!adminUser || !["ADMIN", "SUPER_ADMIN"].includes(adminUser.role)) {
        redirect("/");
    }

    const [
        totalUsers,
        totalOrganizers,
        totalEvents,
        publishedEvents,
        totalBookings,
        pendingPayouts,
        totalCategories,
        totalVenues,
    ] = await Promise.all([
        prisma.user.count({ where: { deletedAt: null } }),
        prisma.user.count({ where: { role: "ORGANIZER", deletedAt: null } }),
        prisma.event.count({ where: { deletedAt: null } }),
        prisma.event.count({ where: { status: "PUBLISHED", deletedAt: null } }),
        prisma.booking.count({ where: { status: { in: ["CONFIRMED", "PAID"] } } }),
        prisma.payout.count({ where: { status: "REQUESTED" } }),
        prisma.category.count({ where: { isActive: true } }),
        prisma.venue.count({ where: { isActive: true } }),
    ]);

    const platformRevenueData = await prisma.booking.aggregate({
        where: { status: { in: ["CONFIRMED", "PAID"] } },
        _sum: { platformRevenue: true },
    });
    const totalPlatformRevenue = Number(platformRevenueData._sum.platformRevenue || 0);

    const revenueBreakdown = await prisma.booking.aggregate({
        where: { status: { in: ["CONFIRMED", "PAID"] } },
        _sum: {
            totalAmount: true,
            platformRevenue: true,
            organizerRevenue: true,
            paymentGatewayFee: true,
            taxAmount: true,
        },
    });

    const breakdown = {
        totalTransactions: Number(revenueBreakdown._sum.totalAmount || 0),
        platformRevenue: Number(revenueBreakdown._sum.platformRevenue || 0),
        organizerRevenue: Number(revenueBreakdown._sum.organizerRevenue || 0),
        gatewayFee: Number(revenueBreakdown._sum.paymentGatewayFee || 0),
        tax: Number(revenueBreakdown._sum.taxAmount || 0),
    };

    const globalCommission = await prisma.commissionSetting.findFirst({
        where: { organizerId: null, isActive: true },
        select: { commissionValue: true },
    });

    const commissionOverridesCount = await prisma.commissionSetting.count({
        where: { organizerId: { not: null }, isActive: true },
    });

    const commissionStats = {
        globalRate: Number(globalCommission?.commissionValue || 5),
        overridesCount: commissionOverridesCount,
    };

    const recentBookings = await prisma.booking.findMany({
        take: 5,
        orderBy: { createdAt: "desc" },
        where: { status: { in: ["CONFIRMED", "PAID"] } },
        include: {
            event: { 
                select: { 
                    title: true,
                    organizer: {
                        select: {
                            name: true,
                            organizerProfile: {
                                select: { organizationName: true }
                            }
                        }
                    }
                } 
            },
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
            iconColor: "text-blue-500",
            bgColor: "bg-blue-500/10",
        },
        {
            label: "Total Events",
            value: `${publishedEvents}/${totalEvents}`,
            subLabel: "Published/Total",
            icon: Calendar,
            href: "/admin/events",
            color: "bg-emerald-500",
            iconColor: "text-emerald-500",
            bgColor: "bg-emerald-500/10",
        },
        {
            label: "Total Bookings",
            value: totalBookings,
            icon: CreditCard,
            href: "/admin/bookings",
            color: "bg-purple-500",
            iconColor: "text-purple-500",
            bgColor: "bg-purple-500/10",
        },
        {
            label: "Platform Revenue",
            value: formatCurrency(totalPlatformRevenue),
            icon: TrendingUp,
            href: "/admin/finance",
            color: "bg-indigo-500",
            iconColor: "text-indigo-500",
            bgColor: "bg-indigo-500/10",
        },
    ];

    const quickLinks = [
        { href: "/admin/users", icon: Users, label: "User Management", sublabel: `${totalOrganizers} organizers`, iconColor: "text-blue-500", bgColor: "bg-blue-500/10" },
        { href: "/admin/events", icon: Calendar, label: "Event Moderation", sublabel: `${publishedEvents} published`, iconColor: "text-emerald-500", bgColor: "bg-emerald-500/10" },
        { href: "/admin/payouts", icon: CreditCard, label: "Payout Processing", sublabel: `${pendingPayouts} pending`, iconColor: "text-purple-500", bgColor: "bg-purple-500/10" },
        { href: "/admin/categories", icon: Tag, label: "Categories", sublabel: `${totalCategories} categories`, iconColor: "text-orange-500", bgColor: "bg-orange-500/10" },
        { href: "/admin/venues", icon: MapPin, label: "Venues", sublabel: `${totalVenues} venues`, iconColor: "text-teal-500", bgColor: "bg-teal-500/10" },
        { href: "/admin/settings", icon: Settings, label: "Platform Settings", sublabel: "Configure platform", iconColor: "text-gray-500", bgColor: "bg-gray-500/10" },
        { href: "/admin/landing-page", icon: LayoutTemplate, label: "Landing Page", sublabel: "Hero, footer, SEO", iconColor: "text-indigo-500", bgColor: "bg-indigo-500/10" },
    ];

    return (
        <>
            <AdminHeader 
                title="Admin Panel" 
                subtitle="Gelaran Management"
            />

            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {pendingPayouts > 0 && (
                    <div className="mb-6 rounded-xl p-4 flex items-center justify-between bg-[var(--warning-bg)] border border-[var(--warning)]/20">
                        <div className="flex items-center gap-3">
                            <AlertCircle className="h-5 w-5 text-[var(--warning)]" />
                            <div>
                                <p className="font-medium text-[var(--warning-text)]">
                                    {pendingPayouts} payout request{pendingPayouts > 1 ? "s" : ""} pending
                                </p>
                                <p className="text-sm text-[var(--warning-text)]/70">Review and process organizer payouts</p>
                            </div>
                        </div>
                        <Link
                            href="/admin/payouts"
                            className="px-5 py-2.5 bg-[var(--warning)] text-white rounded-xl text-sm font-medium hover:opacity-90 transition-opacity"
                        >
                            Review
                        </Link>
                    </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                    {stats.map((stat) => (
                        <Link
                            key={stat.label}
                            href={stat.href}
                            className="rounded-xl p-6 shadow-[var(--shadow-sm)] hover:shadow-[var(--shadow-md)] transition-all group bg-[var(--surface)] border border-[var(--border)]"
                        >
                            <div className="flex items-center justify-between mb-4">
                                <div className={`w-12 h-12 ${stat.bgColor} rounded-lg flex items-center justify-center`}>
                                    <stat.icon className={`h-6 w-6 ${stat.iconColor}`} />
                                </div>
                                <ArrowUpRight className="h-5 w-5 text-[var(--text-muted)] group-hover:text-[var(--accent-primary)] transition-colors" />
                            </div>
                            <p className="text-2xl font-bold text-[var(--text-primary)]">{stat.value}</p>
                            <p className="text-sm text-[var(--text-muted)]">{stat.subLabel || stat.label}</p>
                        </Link>
                    ))}
                </div>

                <div className="grid md:grid-cols-3 lg:grid-cols-4 gap-4 mb-8">
                    {quickLinks.map((link) => (
                        <Link
                            key={link.href}
                            href={link.href}
                            className="rounded-xl p-4 shadow-[var(--shadow-sm)] hover:shadow-[var(--shadow-md)] flex items-center gap-4 transition-all bg-[var(--surface)] border border-[var(--border)]"
                        >
                            <div className={`w-10 h-10 ${link.bgColor} rounded-lg flex items-center justify-center`}>
                                <link.icon className={`h-5 w-5 ${link.iconColor}`} />
                            </div>
                            <div>
                                <h3 className="font-semibold text-[var(--text-primary)] text-sm">{link.label}</h3>
                                <p className="text-xs text-[var(--text-muted)]">{link.sublabel}</p>
                            </div>
                        </Link>
                    ))}
                </div>

                <div className="grid md:grid-cols-2 gap-6 mb-8">
                    <RevenueBreakdown
                        totalTransactions={breakdown.totalTransactions}
                        platformRevenue={breakdown.platformRevenue}
                        organizerRevenue={breakdown.organizerRevenue}
                        gatewayFee={breakdown.gatewayFee}
                        tax={breakdown.tax}
                    />
                    <CommissionOverview
                        globalRate={commissionStats.globalRate}
                        overridesCount={commissionStats.overridesCount}
                    />
                </div>

                <AdminDashboardCharts />

                <div className="rounded-xl shadow-[var(--shadow-sm)] bg-[var(--surface)] border border-[var(--border)] mt-8">
                    <div className="px-6 py-4 border-b border-[var(--border)]">
                        <h2 className="text-lg font-semibold text-[var(--text-primary)]">Recent Bookings</h2>
                    </div>
                    <div className="divide-y divide-[var(--border)]">
                        {recentBookings.length === 0 ? (
                            <div className="p-8 text-center text-[var(--text-muted)]">
                                No recent bookings
                            </div>
                        ) : (
                            recentBookings.map((booking: RecentBooking) => {
                                const statusColors = {
                                    PAID: "bg-green-500/10 text-green-600",
                                    CONFIRMED: "bg-blue-500/10 text-blue-600",
                                };
                                const organizerName = booking.event.organizer.organizerProfile?.organizationName 
                                    || booking.event.organizer.name 
                                    || "Unknown";

                                return (
                                    <Link 
                                        key={booking.id} 
                                        href={`/admin/bookings/${booking.id}`}
                                        className="px-6 py-4 flex items-center justify-between hover:bg-[var(--surface-hover)] transition-colors"
                                    >
                                        <div className="flex-1">
                                            <p className="font-medium text-[var(--text-primary)]">
                                                {booking.event.title}
                                            </p>
                                            <div className="flex items-center gap-2 mt-1">
                                                <span className="text-sm text-[var(--text-muted)]">
                                                    {booking.user?.name || booking.guestName || "Guest"} • {booking.bookingCode}
                                                </span>
                                                <span className="text-xs text-[var(--text-muted)]">
                                                    • by {organizerName}
                                                </span>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-4">
                                            <div className="text-right">
                                                <p className="font-medium text-[var(--accent-primary)]">
                                                    {formatCurrency(Number(booking.totalAmount))}
                                                </p>
                                                <p className="text-xs text-[var(--text-muted)]">
                                                    {new Date(booking.createdAt).toLocaleDateString("id-ID")}
                                                </p>
                                            </div>
                                            <span className={`px-2 py-1 text-xs font-medium rounded-full ${statusColors[booking.status as keyof typeof statusColors]}`}>
                                                {booking.status}
                                            </span>
                                        </div>
                                    </Link>
                                );
                            })
                        )}
                    </div>
                </div>
            </main>
        </>
    );
}
