import Link from "next/link";
import { redirect } from "next/navigation";
import { Calendar, Eye, Plus, Search, SlidersHorizontal, Users } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import prisma from "@/lib/prisma/client";
import {
    EmptyState,
    OrganizerMetricCard,
    OrganizerPanel,
    OrganizerStatusBadge,
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

export default async function OrganizerEventsPage() {
    const supabase = await createClient();
    const {
        data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
        redirect("/login?returnUrl=/organizer/events");
    }

    const organizer = await prisma.user.findUnique({
        where: { email: user.email! },
        include: {
            events: {
                where: { deletedAt: null },
                orderBy: { createdAt: "desc" },
                include: {
                    category: { select: { name: true } },
                    venue: { select: { name: true, city: true } },
                    _count: { select: { bookings: true } },
                    schedules: { take: 1, orderBy: { scheduleDate: "asc" } },
                },
            },
        },
    });

    if (!organizer || organizer.role !== "ORGANIZER") {
        redirect("/");
    }

    const publishedCount = organizer.events.filter((event) => event.status === "PUBLISHED").length;
    const totalBookings = organizer.events.reduce((sum, event) => sum + event._count.bookings, 0);

    return (
        <div className="space-y-6">
            <OrganizerWorkspaceHeader
                title="Katalog event"
                description="Kelola seluruh event organizer dari satu katalog yang menonjolkan status, jadwal terdekat, dan kesiapan operasional."
                actions={
                    <Link
                        href="/organizer/events/new"
                        className="inline-flex items-center gap-2 rounded-full bg-(--accent-primary) px-5 py-3 text-sm font-semibold text-white shadow-(--shadow-sm) transition-opacity hover:opacity-90"
                    >
                        <Plus className="h-4 w-4" />
                        Buat event
                    </Link>
                }
            />

            <div className="grid gap-4 md:grid-cols-3">
                <OrganizerMetricCard label="Semua event" value={organizer.events.length} lucideIcon={Calendar} meta="Draft, review, dan published" />
                <OrganizerMetricCard label="Event published" value={publishedCount} lucideIcon={Eye} tone="success" meta="Sudah tampil di halaman publik" />
                <OrganizerMetricCard label="Total booking" value={totalBookings} lucideIcon={Users} tone="accent" meta="Akumulasi booking dari semua event" />
            </div>

            <OrganizerPanel
                title="Cari dan filter"
                description="Kontrol ini tetap presentational agar perilaku existing aman, namun tampilannya sudah seragam dengan workspace organizer baru."
            >
                <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_220px]">
                    <label className="relative block">
                        <Search className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-(--text-muted)" />
                        <input
                            type="text"
                            placeholder="Cari event, venue, atau kategori..."
                            className="w-full rounded-[1.25rem] border border-(--border) bg-(--surface-elevated) py-3 pl-12 pr-4 text-sm text-foreground outline-none transition-colors focus:border-(--accent-primary)"
                        />
                    </label>
                    <label className="relative block">
                        <SlidersHorizontal className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-(--text-muted)" />
                        <select className="w-full appearance-none rounded-[1.25rem] border border-(--border) bg-(--surface-elevated) py-3 pl-12 pr-4 text-sm text-foreground outline-none transition-colors focus:border-(--accent-primary)">
                            <option value="">Semua status</option>
                            <option value="DRAFT">Draft</option>
                            <option value="PUBLISHED">Published</option>
                            <option value="PENDING_REVIEW">Menunggu review</option>
                        </select>
                    </label>
                </div>
            </OrganizerPanel>

            <OrganizerPanel
                title="Daftar event"
                description="Kartu event memperjelas status, jadwal pertama, kategori, dan akses menuju halaman detail event."
            >
                {organizer.events.length === 0 ? (
                    <EmptyState
                        title="Belum ada event"
                        description="Mulai dari event pertama untuk mengisi katalog organizer dan membuka alur ticketing, publikasi, serta analitik."
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
                    <div className="grid gap-5 xl:grid-cols-2">
                        {organizer.events.map((event) => {
                            const schedule = event.schedules[0];
                            return (
                                <article
                                    key={event.id}
                                    className="overflow-hidden rounded-[1.75rem] border border-(--border) bg-(--surface) shadow-(--shadow-sm)"
                                >
                                    <div className="relative h-52 overflow-hidden bg-(--surface-elevated)">
                                        <img
                                            src={event.posterImage || "/placeholder.jpg"}
                                            alt={event.title}
                                            className="h-full w-full object-cover"
                                        />
                                        <div className="absolute inset-0 bg-linear-to-t from-black/60 via-black/10 to-transparent" />
                                        <div className="absolute inset-x-0 bottom-0 flex items-end justify-between gap-4 p-5">
                                            <div className="min-w-0">
                                                <p className="truncate text-lg font-semibold text-white">{event.title}</p>
                                                <p className="truncate text-sm text-white/80">{event.category?.name || "Tanpa kategori"}</p>
                                            </div>
                                            <OrganizerStatusBadge tone={STATUS_TONE[event.status]}>
                                                {STATUS_LABEL[event.status]}
                                            </OrganizerStatusBadge>
                                        </div>
                                    </div>

                                    <div className="space-y-4 p-5">
                                        <div className="rounded-[1.25rem] border border-(--border) bg-(--surface-elevated) p-4">
                                            <p className="text-xs uppercase tracking-[0.2em] text-(--text-muted)">Jadwal pertama</p>
                                            <p className="mt-2 text-sm font-semibold text-foreground">
                                                {schedule
                                                    ? new Date(schedule.scheduleDate).toLocaleDateString("id-ID", {
                                                        weekday: "long",
                                                        day: "numeric",
                                                        month: "long",
                                                        year: "numeric",
                                                    })
                                                    : "Belum ada jadwal"}
                                            </p>
                                        </div>

                                        <div className="grid gap-3 sm:grid-cols-2 text-sm text-(--text-secondary)">
                                            <div className="rounded-[1.25rem] border border-(--border) bg-(--surface-elevated) p-4">
                                                <p className="text-xs uppercase tracking-[0.2em] text-(--text-muted)">Venue</p>
                                                <p className="mt-2 font-semibold text-foreground">{event.venue?.name || (event.eventType === "ONLINE" ? "Event online" : "Belum diatur")}</p>
                                                <p className="mt-1">{event.venue?.city || "Atur venue di detail event"}</p>
                                            </div>
                                            <div className="rounded-[1.25rem] border border-(--border) bg-(--surface-elevated) p-4">
                                                <p className="text-xs uppercase tracking-[0.2em] text-(--text-muted)">Booking</p>
                                                <p className="mt-2 font-semibold text-foreground">{event._count.bookings} transaksi</p>
                                                <p className="mt-1">Status data tetap mengikuti backend organizer.</p>
                                            </div>
                                        </div>

                                        <div className="flex flex-wrap gap-3">
                                            <Link
                                                href={`/organizer/events/${event.id}`}
                                                className="inline-flex flex-1 items-center justify-center gap-2 rounded-full bg-(--accent-primary) px-4 py-3 text-sm font-semibold text-white transition-opacity hover:opacity-90"
                                            >
                                                Kelola event
                                            </Link>
                                            <Link
                                                href={`/events/${event.slug}`}
                                                className="inline-flex items-center justify-center gap-2 rounded-full border border-(--border) bg-(--surface-elevated) px-4 py-3 text-sm font-semibold text-foreground transition-colors hover:bg-(--surface-hover)"
                                            >
                                                Lihat publik
                                            </Link>
                                        </div>
                                    </div>
                                </article>
                            );
                        })}
                    </div>
                )}
            </OrganizerPanel>
        </div>
    );
}
