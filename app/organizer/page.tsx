import Link from "next/link";
import {
    ArrowRight,
    BarChart3,
    Calendar,
    CreditCard,
    Plus,
    Ticket,
    TrendingUp,
    Users,
    Wallet,
    AlertCircle,
    Clock3,
    Sparkles,
} from "lucide-react";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import prisma from "@/lib/prisma/client";
import { formatCurrency } from "@/lib/utils";
import {
    EmptyState,
    OrganizerHeroCard,
    OrganizerInlineAction,
    OrganizerListItem,
    OrganizerMetricCard,
    OrganizerPanel,
    OrganizerStatusBadge,
    OrganizerSurface,
    OrganizerWorkspaceHeader,
} from "@/components/organizer/organizer-workspace-primitives";

const STATUS_TONE: Record<string, "default" | "warning" | "success" | "danger" | "info"> = {
    DRAFT: "default",
    PENDING_REVIEW: "warning",
    PUBLISHED: "success",
    CANCELLED: "danger",
    COMPLETED: "info",
};

const STATUS_LABEL: Record<string, string> = {
    DRAFT: "Draft",
    PENDING_REVIEW: "Menunggu review",
    PUBLISHED: "Published",
    CANCELLED: "Dibatalkan",
    COMPLETED: "Selesai",
};

export default async function OrganizerDashboard() {
    const supabase = await createClient();
    const {
        data: { user },
    } = await supabase.auth.getUser();

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

    const [totalEvents, totalBookings, recentEvents, upcomingEvents, recentBookings, pendingWithdrawals] =
        await Promise.all([
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
                orderBy: { createdAt: "desc" },
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

    const profile = organizer.organizerProfile;
    const organizationName = profile?.organizationName || organizer.name;
    const walletBalance = Number(profile?.walletBalance || 0);
    const totalEarned = Number(profile?.totalEarned || 0);

    return (
        <div className="space-y-6">
            <OrganizerWorkspaceHeader
                title="Dashboard organizer"
                description="Pantau performa event, booking terbaru, dan tugas operasional yang perlu ditindaklanjuti dari satu workspace yang konsisten."
                actions={
                    <>
                        <Link
                            href="/organizer/events/new"
                            className="inline-flex items-center gap-2 rounded-full bg-(--accent-primary) px-5 py-3 text-sm font-semibold text-white shadow-(--shadow-sm) transition-opacity hover:opacity-90"
                        >
                            <Plus className="h-4 w-4" />
                            Buat event
                        </Link>
                        <Link
                            href="/organizer/events"
                            className="inline-flex items-center gap-2 rounded-full border border-(--border) bg-(--surface) px-5 py-3 text-sm font-semibold text-foreground transition-colors hover:bg-(--surface-elevated)"
                        >
                            Lihat katalog event
                            <ArrowRight className="h-4 w-4" />
                        </Link>
                    </>
                }
                badge={
                    pendingWithdrawals > 0 ? (
                        <OrganizerStatusBadge tone="warning">
                            <AlertCircle className="h-3.5 w-3.5" />
                            {pendingWithdrawals} penarikan sedang diproses
                        </OrganizerStatusBadge>
                    ) : null
                }
                meta={
                    <div className="flex flex-wrap items-center gap-2">
                        <span className="rounded-full border border-(--border) bg-(--surface) px-3 py-1 font-medium text-foreground">
                            {organizationName}
                        </span>
                        <span>Workspace ini menyatukan insight performa, event pipeline, dan status wallet tanpa mengubah alur data organizer yang sudah ada.</span>
                    </div>
                }
            />

            <OrganizerHeroCard
                icon={Sparkles}
                title="Prioritas minggu ini"
                description="Fokus pada event yang akan berlangsung dalam tujuh hari ke depan, cek booking terakhir, dan tindak lanjuti saldo wallet agar operasi harian tetap lancar."
                actions={
                    <>
                        <Link
                            href="/organizer/events/new"
                            className="inline-flex items-center gap-2 rounded-full bg-white px-5 py-3 text-sm font-semibold text-(--accent-primary) shadow-(--shadow-sm) transition-transform hover:-translate-y-0.5"
                        >
                            <Plus className="h-4 w-4" />
                            Launch event baru
                        </Link>
                        <Link
                            href="/organizer/wallet"
                            className="inline-flex items-center gap-2 rounded-full border border-white/40 bg-white/20 px-5 py-3 text-sm font-semibold text-foreground backdrop-blur transition-colors hover:bg-white/30"
                        >
                            <Wallet className="h-4 w-4" />
                            Kelola wallet
                        </Link>
                    </>
                }
                aside={
                    <div className="space-y-4">
                        <div>
                            <p className="text-sm font-medium text-(--text-secondary)">Saldo siap dicairkan</p>
                            <p className="mt-1 text-3xl font-semibold tracking-(--tracking-heading) text-foreground">
                                {formatCurrency(walletBalance)}
                            </p>
                        </div>
                        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-1">
                            <OrganizerSurface>
                                <p className="text-xs uppercase tracking-[0.2em] text-(--text-muted)">Total pendapatan</p>
                                <p className="mt-2 text-lg font-semibold text-foreground">{formatCurrency(totalEarned)}</p>
                            </OrganizerSurface>
                            <OrganizerSurface>
                                <p className="text-xs uppercase tracking-[0.2em] text-(--text-muted)">Booking aktif</p>
                                <p className="mt-2 text-lg font-semibold text-foreground">{totalBookings} peserta</p>
                            </OrganizerSurface>
                        </div>
                    </div>
                }
            />

            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                <OrganizerMetricCard
                    label="Total event"
                    value={totalEvents}
                    lucideIcon={Calendar}
                    href="/organizer/events"
                    meta="Semua event aktif dan draft"
                    trend="Akses katalog dan detail event organizer"
                    tone="accent"
                />
                <OrganizerMetricCard
                    label="Peserta terkonfirmasi"
                    value={totalBookings}
                    lucideIcon={Users}
                    meta="Booking dengan status paid / confirmed"
                    trend="Gunakan data ini untuk estimasi kapasitas"
                />
                <OrganizerMetricCard
                    label="Saldo wallet"
                    value={formatCurrency(walletBalance)}
                    lucideIcon={Wallet}
                    href="/organizer/wallet"
                    meta="Siap untuk penarikan dana"
                    trend={pendingWithdrawals > 0 ? `${pendingWithdrawals} penarikan sedang diproses` : "Belum ada penarikan tertunda"}
                    tone={pendingWithdrawals > 0 ? "warning" : "success"}
                />
                <OrganizerMetricCard
                    label="Total pendapatan"
                    value={formatCurrency(totalEarned)}
                    lucideIcon={TrendingUp}
                    meta="Akumulasi seluruh pemasukan organizer"
                    trend="Dipakai juga sebagai dasar analisis performa"
                    tone="success"
                />
            </div>

            <div className="grid gap-6 xl:grid-cols-[minmax(0,1.4fr)_minmax(320px,0.9fr)]">
                <OrganizerPanel
                    title="Event terbaru"
                    description="Snapshot event yang paling baru dibuat beserta status publikasi dan volume pesertanya."
                    action={<OrganizerInlineAction href="/organizer/events">Kelola semua event</OrganizerInlineAction>}
                >
                    {recentEvents.length === 0 ? (
                        <EmptyState
                            title="Belum ada event organizer"
                            description="Mulai dari draft pertama untuk membangun pipeline event, tiket, dan publikasi dalam workspace ini."
                            icon={Calendar}
                            action={
                                <Link
                                    href="/organizer/events/new"
                                    className="inline-flex items-center gap-2 rounded-full bg-(--accent-primary) px-5 py-3 text-sm font-semibold text-white"
                                >
                                    <Plus className="h-4 w-4" />
                                    Buat event pertama
                                </Link>
                            }
                        />
                    ) : (
                        <div className="space-y-3">
                            {recentEvents.map((event) => {
                                const schedule = event.schedules[0];
                                return (
                                    <OrganizerListItem
                                        key={event.id}
                                        href={`/organizer/events/${event.id}`}
                                        title={event.title}
                                        icon={Calendar}
                                        description={
                                            <div className="space-y-1">
                                                <p>
                                                    {schedule
                                                        ? new Date(schedule.scheduleDate).toLocaleDateString("id-ID", {
                                                            weekday: "short",
                                                            day: "numeric",
                                                            month: "short",
                                                            year: "numeric",
                                                        })
                                                        : "Belum ada jadwal"}
                                                </p>
                                                <p>{event._count.bookings} peserta terdaftar</p>
                                            </div>
                                        }
                                        meta={
                                            <OrganizerStatusBadge tone={STATUS_TONE[event.status]} className="px-2.5 py-0.5">
                                                {STATUS_LABEL[event.status]}
                                            </OrganizerStatusBadge>
                                        }
                                    />
                                );
                            })}
                        </div>
                    )}
                </OrganizerPanel>

                <OrganizerPanel
                    title="Aksi cepat"
                    description="CTA yang paling sering dipakai untuk operasional harian organizer."
                >
                    <div className="space-y-3">
                        {[
                            {
                                href: "/organizer/events/new",
                                title: "Buat event baru",
                                desc: "Mulai draft event, jadwal, tiket, dan media.",
                                icon: Plus,
                            },
                            {
                                href: "/organizer/wallet/withdraw",
                                title: "Ajukan penarikan",
                                desc: "Cairkan saldo yang sudah siap diproses.",
                                icon: CreditCard,
                            },
                            {
                                href: "/organizer/team",
                                title: "Kelola tim organizer",
                                desc: "Atur akses manager, scanner, dan finance.",
                                icon: Users,
                            },
                            {
                                href: "/organizer/settings",
                                title: "Perbarui profil organizer",
                                desc: "Rapikan identitas brand dan kanal sosial.",
                                icon: Ticket,
                            },
                        ].map((item) => (
                            <OrganizerListItem
                                key={item.href}
                                href={item.href}
                                title={item.title}
                                description={item.desc}
                                icon={item.icon}
                            />
                        ))}
                    </div>
                </OrganizerPanel>
            </div>

            <div className="grid gap-6 xl:grid-cols-[minmax(0,1.1fr)_minmax(0,1fr)]">
                <OrganizerPanel
                    title="Booking terbaru"
                    description="Monitor transaksi terbaru untuk memastikan peserta dan pendapatan masuk sesuai ekspektasi."
                    action={<OrganizerInlineAction href="/organizer/events">Buka halaman event</OrganizerInlineAction>}
                >
                    {recentBookings.length === 0 ? (
                        <EmptyState
                            title="Belum ada booking"
                            description="Setelah event dipublikasikan dan tiket aktif, booking terbaru akan muncul di sini."
                            icon={Ticket}
                        />
                    ) : (
                        <div className="space-y-3">
                            {recentBookings.map((booking) => (
                                <div
                                    key={booking.id}
                                    className="flex flex-col gap-4 rounded-[1.25rem] border border-(--border) bg-(--surface-elevated) p-4 sm:flex-row sm:items-center"
                                >
                                    <div className="flex items-center gap-3 min-w-0 flex-1">
                                        {booking.user?.avatarUrl ? (
                                            <img
                                                src={booking.user.avatarUrl}
                                                alt={booking.user.name ?? "User"}
                                                className="h-11 w-11 rounded-2xl object-cover"
                                            />
                                        ) : (
                                            <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-(--border) bg-(--surface)">
                                                <Users className="h-5 w-5 text-(--text-muted)" />
                                            </div>
                                        )}
                                        <div className="min-w-0">
                                            <p className="truncate font-semibold text-foreground">{booking.user?.name || "Guest"}</p>
                                            <p className="truncate text-sm text-(--text-secondary)">{booking.event.title}</p>
                                        </div>
                                    </div>
                                    <div className="grid gap-1 text-sm text-(--text-secondary) sm:text-right">
                                        <p className="font-semibold text-foreground">{formatCurrency(Number(booking.totalAmount))}</p>
                                        <p>{booking.bookedTickets.length} tiket</p>
                                        <p>{new Date(booking.createdAt).toLocaleDateString("id-ID")}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </OrganizerPanel>

                <OrganizerPanel
                    title="Event dalam 7 hari"
                    description="Event terdekat yang perlu perhatian untuk staffing, gate, dan komunikasi peserta."
                >
                    {upcomingEvents.length === 0 ? (
                        <EmptyState
                            title="Tidak ada event mendatang"
                            description="Belum ada event published yang berlangsung dalam tujuh hari ke depan."
                            icon={Clock3}
                        />
                    ) : (
                        <div className="space-y-3">
                            {upcomingEvents.map((event) => {
                                const schedule = event.schedules[0];
                                const eventDate = schedule ? new Date(schedule.scheduleDate) : null;
                                const daysUntil = eventDate
                                    ? Math.ceil((eventDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
                                    : null;

                                return (
                                    <OrganizerListItem
                                        key={event.id}
                                        href={`/organizer/events/${event.id}`}
                                        title={event.title}
                                        icon={BarChart3}
                                        description={
                                            <div className="space-y-1">
                                                <p>
                                                    {eventDate?.toLocaleDateString("id-ID", {
                                                        weekday: "long",
                                                        day: "numeric",
                                                        month: "long",
                                                    }) || "Belum ada jadwal"}
                                                </p>
                                                <p>{event._count.bookings} peserta terkonfirmasi</p>
                                            </div>
                                        }
                                        end={
                                            daysUntil !== null ? (
                                                <OrganizerStatusBadge tone={daysUntil <= 1 ? "danger" : daysUntil <= 3 ? "warning" : "info"}>
                                                    {daysUntil === 0 ? "Hari ini" : daysUntil === 1 ? "Besok" : `${daysUntil} hari lagi`}
                                                </OrganizerStatusBadge>
                                            ) : null
                                        }
                                    />
                                );
                            })}
                        </div>
                    )}
                </OrganizerPanel>
            </div>
        </div>
    );
}
