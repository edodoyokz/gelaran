import { redirect } from "next/navigation";
import Link from "next/link";
import { Plus, Search, Calendar, Users, MoreVertical } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import prisma from "@/lib/prisma/client";

export default async function OrganizerEventsPage() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

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
                    category: { select: { name: true, colorHex: true } },
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

    return (
        <>
            <header className="bg-[var(--surface)] border-b sticky top-0 z-10">
                <div className="px-6 py-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-2xl font-bold text-[var(--text-primary)]">Event Saya</h1>
                            <p className="text-[var(--text-secondary)]">Kelola semua event Anda</p>
                        </div>
                        <Link
                            href="/organizer/events/new"
                            className="inline-flex items-center gap-2 px-4 py-2.5 bg-[var(--accent-primary)] text-white rounded-xl font-medium hover:opacity-90 shadow-sm"
                        >
                            <Plus className="h-5 w-5" />
                            Buat Event
                        </Link>
                    </div>
                </div>
            </header>

            <main className="p-6 space-y-6">
                <div className="bg-[var(--surface)] rounded-xl p-4 flex gap-4 shadow-sm">
                    <div className="flex-1 relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-[var(--text-muted)]" />
                        <input
                            type="text"
                            placeholder="Cari event..."
                            className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-[var(--accent-primary)] focus:border-transparent"
                        />
                    </div>
                    <select className="px-4 py-2 border rounded-lg focus:ring-2 focus:ring-[var(--accent-primary)]">
                        <option value="">Semua Status</option>
                        <option value="DRAFT">Draft</option>
                        <option value="PUBLISHED">Published</option>
                        <option value="ENDED">Ended</option>
                    </select>
                </div>

                {organizer.events.length === 0 ? (
                    <div className="bg-[var(--surface)] rounded-xl p-12 text-center shadow-sm">
                        <Calendar className="h-16 w-16 text-[var(--text-muted)] mx-auto mb-4" />
                        <h2 className="text-xl font-semibold text-[var(--text-primary)] mb-2">Belum ada event</h2>
                        <p className="text-[var(--text-muted)] mb-6">Buat event pertama kamu sekarang!</p>
                        <Link
                            href="/organizer/events/new"
                            className="inline-flex items-center gap-2 px-6 py-3 bg-[var(--accent-primary)] text-white rounded-xl font-medium hover:opacity-90 shadow-md transition-all hover:-translate-y-0.5"
                        >
                            <Plus className="h-5 w-5" />
                            Buat Event
                        </Link>
                    </div>
                ) : (
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {organizer.events.map((event) => (
                            <div key={event.id} className="bg-[var(--surface)] rounded-xl overflow-hidden shadow-sm group">
                                <div className="relative">
                                    <img
                                        src={event.posterImage || "/placeholder.jpg"}
                                        alt={event.title}
                                        className="w-full h-40 object-cover"
                                    />
                                    <span className={`absolute top-3 right-3 px-2 py-1 text-xs font-medium rounded-full ${event.status === "PUBLISHED"
                                            ? "bg-green-500 text-white"
                                            : event.status === "DRAFT"
                                                ? "bg-gray-500 text-white"
                                                : "bg-yellow-500 text-white"
                                        }`}>
                                        {event.status}
                                    </span>
                                </div>
                                <div className="p-4">
                                    <div className="flex items-start justify-between mb-2">
                                        <h3 className="font-semibold text-[var(--text-primary)] line-clamp-2">{event.title}</h3>
                                        <button type="button" className="p-1 text-[var(--text-muted)] hover:text-[var(--text-secondary)]">
                                            <MoreVertical className="h-5 w-5" />
                                        </button>
                                    </div>
                                    <div className="space-y-1 text-sm text-[var(--text-muted)]">
                                        <div className="flex items-center gap-1">
                                            <Calendar className="h-4 w-4" />
                                            {event.schedules[0]
                                                ? new Date(event.schedules[0].scheduleDate).toLocaleDateString("id-ID", {
                                                    day: "numeric",
                                                    month: "short",
                                                    year: "numeric",
                                                })
                                                : "Belum ada jadwal"
                                            }
                                        </div>
                                        <div className="flex items-center gap-1">
                                            <Users className="h-4 w-4" />
                                            {event._count.bookings} bookings
                                        </div>
                                    </div>
                                    <div className="mt-4 flex gap-2">
                                        <Link
                                            href={`/organizer/events/${event.id}`}
                                            className="flex-1 text-center py-2.5 border border-indigo-600 text-[var(--accent-primary)] rounded-xl text-sm font-medium hover:bg-[var(--accent-primary)]/10 transition-colors"
                                        >
                                            Kelola
                                        </Link>
                                        <Link
                                            href={`/events/${event.slug}`}
                                            className="px-4 py-2.5 border rounded-xl text-sm font-medium text-[var(--text-secondary)] hover:bg-[var(--surface-hover)] transition-colors"
                                        >
                                            Lihat
                                        </Link>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </main>
        </>
    );
}
