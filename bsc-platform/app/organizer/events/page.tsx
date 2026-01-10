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
        <div className="min-h-screen bg-gray-100">
            {/* Header */}
            <header className="bg-white border-b">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
                    <div className="flex items-center justify-between">
                        <h1 className="text-2xl font-bold text-gray-900">Events</h1>
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
                {/* Search & Filters */}
                <div className="bg-white rounded-xl p-4 mb-6 flex gap-4">
                    <div className="flex-1 relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Cari event..."
                            className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                        />
                    </div>
                    <select className="px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500">
                        <option value="">Semua Status</option>
                        <option value="DRAFT">Draft</option>
                        <option value="PUBLISHED">Published</option>
                        <option value="ENDED">Ended</option>
                    </select>
                </div>

                {/* Events Grid */}
                {organizer.events.length === 0 ? (
                    <div className="bg-white rounded-xl p-12 text-center">
                        <Calendar className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                        <h2 className="text-xl font-semibold text-gray-900 mb-2">Belum ada event</h2>
                        <p className="text-gray-500 mb-6">Buat event pertama kamu sekarang!</p>
                        <Link
                            href="/organizer/events/new"
                            className="inline-flex items-center gap-2 px-6 py-3 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700"
                        >
                            <Plus className="h-5 w-5" />
                            Buat Event
                        </Link>
                    </div>
                ) : (
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {organizer.events.map((event) => (
                            <div key={event.id} className="bg-white rounded-xl overflow-hidden shadow-sm group">
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
                                        <h3 className="font-semibold text-gray-900 line-clamp-2">{event.title}</h3>
                                        <button className="p-1 text-gray-400 hover:text-gray-600">
                                            <MoreVertical className="h-5 w-5" />
                                        </button>
                                    </div>
                                    <div className="space-y-1 text-sm text-gray-500">
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
                                            className="flex-1 text-center py-2 border border-indigo-600 text-indigo-600 rounded-lg text-sm font-medium hover:bg-indigo-50"
                                        >
                                            Kelola
                                        </Link>
                                        <Link
                                            href={`/events/${event.slug}`}
                                            className="px-4 py-2 border rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-50"
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
        </div>
    );
}
