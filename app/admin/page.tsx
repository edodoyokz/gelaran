import Link from "next/link";
import { redirect } from "next/navigation";
import {
    ArrowRight,
    BadgeDollarSign,
    CalendarRange,
    Gift,
    MapPin,
    Settings,
    ShieldCheck,
    Tags,
    Users,
    Wallet,
} from "lucide-react";
import type { Decimal } from "@prisma/client/runtime/library";
import prisma from "@/lib/prisma/client";
import { createClient } from "@/lib/supabase/server";
import {
    AdminActionCard,
    AdminMetricCard,
    AdminNotice,
    AdminStatusBadge,
    AdminSurface,
    AdminWorkspacePage,
} from "@/components/admin/admin-workspace";
import { formatCurrency } from "@/lib/utils";

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

const bookingStatusTone: Record<string, "accent" | "success" | "warning" | "danger" | "default"> = {
    PAID: "success",
    CONFIRMED: "accent",
    PENDING: "warning",
    CANCELLED: "danger",
    REFUNDED: "default",
};

export default async function AdminDashboardPage() {
    const supabase = await createClient();
    const {
        data: { user },
    } = await supabase.auth.getUser();

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
        pendingComplimentaryRequests,
    ] = await Promise.all([
        prisma.user.count({ where: { deletedAt: null } }),
        prisma.user.count({ where: { role: "ORGANIZER", deletedAt: null } }),
        prisma.event.count({ where: { deletedAt: null } }),
        prisma.event.count({ where: { status: "PUBLISHED", deletedAt: null } }),
        prisma.booking.count({ where: { status: { in: ["CONFIRMED", "PAID"] } } }),
        prisma.payout.count({ where: { status: "REQUESTED" } }),
        prisma.category.count({ where: { isActive: true } }),
        prisma.venue.count({ where: { isActive: true } }),
        prisma.complimentaryTicketRequest.count({ where: { status: "PENDING" } }),
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
            subtotal: true,
            platformRevenue: true,
            organizerRevenue: true,
            paymentGatewayFee: true,
            taxAmount: true,
        },
    });

    const globalCommission = await prisma.commissionSetting.findFirst({
        where: { organizerId: null, isActive: true },
        select: { commissionValue: true },
    });

    const commissionOverridesCount = await prisma.commissionSetting.count({
        where: { organizerId: { not: null }, isActive: true },
    });

    const recentBookings = await prisma.booking.findMany({
        take: 6,
        orderBy: { createdAt: "desc" },
        where: { status: { in: ["CONFIRMED", "PAID", "PENDING"] } },
        include: {
            event: {
                select: {
                    title: true,
                    organizer: {
                        select: {
                            name: true,
                            organizerProfile: {
                                select: { organizationName: true },
                            },
                        },
                    },
                },
            },
            user: { select: { name: true, email: true } },
        },
    });

    const breakdown = {
        totalTransactions: Number(revenueBreakdown._sum.totalAmount || 0),
        subtotal: Number(revenueBreakdown._sum.subtotal || 0),
        platformRevenue: Number(revenueBreakdown._sum.platformRevenue || 0),
        organizerRevenue: Number(revenueBreakdown._sum.organizerRevenue || 0),
        gatewayFee: Number(revenueBreakdown._sum.paymentGatewayFee || 0),
        tax: Number(revenueBreakdown._sum.taxAmount || 0),
    };

    const actionCards = [
        {
            title: "Moderate event catalog",
            description: `${publishedEvents} published events out of ${totalEvents} total listings across the platform catalog.`,
            href: "/admin/events",
            icon: CalendarRange,
            badge: `${totalEvents} total`,
        },
        {
            title: "Review bookings and escalations",
            description: `${totalBookings} confirmed bookings are flowing through the workspace with finance-linked visibility.`,
            href: "/admin/bookings",
            icon: BadgeDollarSign,
            badge: `${totalBookings} orders`,
        },
        {
            title: "Check venues and location quality",
            description: `${totalVenues} active venues and ${totalCategories} active categories support discovery and operations.`,
            href: "/admin/venues",
            icon: MapPin,
            badge: `${totalVenues} venues`,
        },
        {
            title: "Adjust platform controls",
            description: `Commission defaults, limits, and notification behavior remain centralized for admins.`,
            href: "/admin/settings",
            icon: Settings,
            badge: `${Number(globalCommission?.commissionValue || 5)}% fee`,
        },
    ];

    const shortcutCards = [
        {
            href: "/admin/categories",
            label: "Categories",
            value: `${totalCategories} active`,
            icon: Tags,
        },
        {
            href: "/admin/venues",
            label: "Venues",
            value: `${totalVenues} active`,
            icon: MapPin,
        },
        {
            href: "/admin/complimentary-requests",
            label: "Complimentary",
            value: `${pendingComplimentaryRequests} pending`,
            icon: Gift,
        },
        {
            href: "/admin/settings",
            label: "Settings",
            value: "Platform controls",
            icon: Settings,
        },
    ];

    return (
        <AdminWorkspacePage
            eyebrow="Admin workspace"
            title="Gelaran control center"
            description="Monitor platform health, revenue flow, catalog quality, and operator response from a workspace aligned with the shared Gelaran UI system."
            actions={
                <div className="flex flex-wrap items-center gap-3">
                    <Link
                        href="/admin/analytics"
                        className="inline-flex items-center gap-2 rounded-full border border-(--border) bg-(--surface-elevated) px-4 py-2 text-sm font-semibold text-foreground transition-colors hover:border-[rgba(41,179,182,0.28)] hover:text-(--accent-primary)"
                    >
                        Open analytics
                        <ArrowRight className="h-4 w-4" />
                    </Link>
                    <Link
                        href="/admin/users"
                        className="inline-flex items-center gap-2 rounded-full bg-(--accent-gradient) px-4 py-2 text-sm font-semibold text-white shadow-(--shadow-glow)"
                    >
                        Review users
                        <ArrowRight className="h-4 w-4" />
                    </Link>
                </div>
            }
        >
            {pendingPayouts > 0 ? (
                <AdminNotice
                    tone="warning"
                    title={`${pendingPayouts} payout request${pendingPayouts > 1 ? "s are" : " is"} waiting for review`}
                    description="Finance operations need attention so organizer cash flow remains predictable and escalations stay low."
                    actionHref="/admin/payouts"
                    actionLabel="Review payouts"
                />
            ) : (
                <AdminNotice
                    tone="success"
                    title="Finance queue is currently stable"
                    description="No payout requests are waiting right now, so the team can focus on moderation, support, and platform quality."
                    actionHref="/admin/finance"
                    actionLabel="Open finance overview"
                />
            )}

            <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                <AdminMetricCard
                    label="Active users"
                    value={totalUsers.toLocaleString("en-US")}
                    icon={Users}
                    href="/admin/users"
                    tone="accent"
                    meta={`${totalOrganizers} organizers with workspace access`}
                />
                <AdminMetricCard
                    label="Published events"
                    value={`${publishedEvents}/${totalEvents}`}
                    icon={CalendarRange}
                    href="/admin/events"
                    meta="Live events versus total catalog listings"
                />
                <AdminMetricCard
                    label="Confirmed bookings"
                    value={totalBookings.toLocaleString("en-US")}
                    icon={ShieldCheck}
                    href="/admin/bookings"
                    meta="Paid and confirmed orders across the platform"
                />
                <AdminMetricCard
                    label="Platform revenue"
                    value={formatCurrency(totalPlatformRevenue)}
                    icon={Wallet}
                    href="/admin/analytics"
                    tone="success"
                    meta={`Global commission ${Number(globalCommission?.commissionValue || 5)}%`}
                />
            </section>

            <section className="grid gap-4 xl:grid-cols-4">
                {actionCards.map((card) => (
                    <AdminActionCard key={card.href} {...card} />
                ))}
            </section>

            <section className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
                <AdminSurface
                    title="Revenue posture"
                    description="A high-level view of gross transaction flow, platform share, and payout-sensitive components."
                >
                    <dl className="grid gap-4 sm:grid-cols-2">
                        {[
                            ["Gross transactions", formatCurrency(breakdown.totalTransactions)],
                            ["Subtotal", formatCurrency(breakdown.subtotal)],
                            ["Platform revenue", formatCurrency(breakdown.platformRevenue)],
                            ["Organizer revenue", formatCurrency(breakdown.organizerRevenue)],
                            ["Gateway fees", formatCurrency(breakdown.gatewayFee)],
                            ["Tax collected", formatCurrency(breakdown.tax)],
                        ].map(([label, value]) => (
                            <div key={label} className="rounded-2xl border border-(--border) bg-(--surface-elevated) p-4">
                                <dt className="text-sm text-(--text-secondary)">{label}</dt>
                                <dd className="mt-2 text-xl font-semibold text-foreground">{value}</dd>
                            </div>
                        ))}
                    </dl>
                </AdminSurface>

                <AdminSurface
                    title="Platform configuration snapshot"
                    description="Shared controls that directly shape revenue policies and admin intervention thresholds."
                >
                    <div className="space-y-4">
                        <div className="rounded-2xl border border-(--border) bg-(--surface-elevated) p-4">
                            <p className="text-sm text-(--text-secondary)">Global commission</p>
                            <p className="mt-2 text-2xl font-semibold text-foreground">
                                {Number(globalCommission?.commissionValue || 5)}%
                            </p>
                        </div>
                        <div className="rounded-2xl border border-(--border) bg-(--surface-elevated) p-4">
                            <p className="text-sm text-(--text-secondary)">Organizer overrides</p>
                            <p className="mt-2 text-2xl font-semibold text-foreground">
                                {commissionOverridesCount.toLocaleString("en-US")}
                            </p>
                        </div>
                        <div className="rounded-2xl border border-(--border) bg-(--surface-elevated) p-4">
                            <p className="text-sm text-(--text-secondary)">Complimentary requests pending</p>
                            <p className="mt-2 text-2xl font-semibold text-foreground">
                                {pendingComplimentaryRequests.toLocaleString("en-US")}
                            </p>
                        </div>
                    </div>
                </AdminSurface>
            </section>

            <AdminSurface
                title="Operational shortcuts"
                description="Frequently visited admin surfaces that keep Phase 9 coherent with moderation, finance, and platform setup flows."
            >
                <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                    {shortcutCards.map((item) => (
                        <Link
                            key={item.href}
                            href={item.href}
                            className="rounded-2xl border border-(--border) bg-(--surface-elevated) p-4 transition-colors hover:border-[rgba(41,179,182,0.28)] hover:bg-(--surface-brand-soft)"
                        >
                            <item.icon className="h-5 w-5 text-(--accent-primary)" />
                            <h3 className="mt-4 text-sm font-semibold text-foreground">{item.label}</h3>
                            <p className="mt-1 text-sm text-(--text-secondary)">{item.value}</p>
                        </Link>
                    ))}
                </div>
            </AdminSurface>

            <AdminSurface
                title="Recent booking activity"
                description="Latest customer activity visible to admins without leaving the workspace shell."
                action={
                    <Link
                        href="/admin/bookings"
                        className="inline-flex items-center gap-2 text-sm font-semibold text-(--accent-primary) transition-opacity hover:opacity-80"
                    >
                        View all bookings
                        <ArrowRight className="h-4 w-4" />
                    </Link>
                }
            >
                <div className="space-y-3">
                    {recentBookings.map((booking: RecentBooking) => {
                        const organizerName =
                            booking.event.organizer.organizerProfile?.organizationName ||
                            booking.event.organizer.name ||
                            "Unknown organizer";

                        return (
                            <Link
                                key={booking.id}
                                href={`/admin/bookings/${booking.id}`}
                                className="flex flex-col gap-4 rounded-2xl border border-(--border) bg-(--surface-elevated) p-4 transition-colors hover:border-[rgba(41,179,182,0.28)] hover:bg-(--surface-brand-soft) md:flex-row md:items-center md:justify-between"
                            >
                                <div className="min-w-0 space-y-1">
                                    <p className="text-sm font-semibold text-foreground">{booking.event.title}</p>
                                    <p className="text-sm text-(--text-secondary)">
                                        {booking.user?.name || booking.guestName || "Guest purchaser"} · {booking.bookingCode}
                                    </p>
                                    <p className="text-xs uppercase tracking-[0.14em] text-(--text-muted)">
                                        Organizer · {organizerName}
                                    </p>
                                </div>
                                <div className="flex items-center gap-3 md:justify-end">
                                    <div className="text-left md:text-right">
                                        <p className="text-sm font-semibold text-foreground">
                                            {formatCurrency(Number(booking.totalAmount))}
                                        </p>
                                        <p className="text-xs text-(--text-muted)">
                                            {new Date(booking.createdAt).toLocaleDateString("id-ID", {
                                                day: "numeric",
                                                month: "short",
                                                year: "numeric",
                                            })}
                                        </p>
                                    </div>
                                    <AdminStatusBadge
                                        label={booking.status}
                                        tone={bookingStatusTone[booking.status] || "default"}
                                    />
                                </div>
                            </Link>
                        );
                    })}
                </div>
            </AdminSurface>
        </AdminWorkspacePage>
    );
}
