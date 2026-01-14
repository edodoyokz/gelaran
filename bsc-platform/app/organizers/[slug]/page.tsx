"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
    ArrowLeft,
    Calendar,
    MapPin,
    Users,
    Ticket,
    Star,
    Globe,
    ExternalLink,
    UserPlus,
    UserMinus,
    Loader2,
    AlertCircle,
    CheckCircle,
    Clock,
} from "lucide-react";
import { formatCurrency } from "@/lib/utils";

interface OrganizerData {
    id: string;
    userId: string;
    organizationName: string;
    organizationSlug: string;
    organizationLogo: string | null;
    organizationBanner: string | null;
    organizationDescription: string | null;
    websiteUrl: string | null;
    socialFacebook: string | null;
    socialInstagram: string | null;
    socialTwitter: string | null;
    socialTiktok: string | null;
    isVerified: boolean;
    createdAt: string;
    user: {
        id: string;
        name: string;
        avatarUrl: string | null;
        createdAt: string;
    };
}

interface OrganizerStats {
    totalEvents: number;
    followersCount: number;
    totalTicketsSold: number;
    averageRating: number;
    totalReviews: number;
}

interface EventSchedule {
    id: string;
    scheduleDate: string;
    startTime: string;
    endTime: string;
}

interface EventData {
    id: string;
    slug: string;
    title: string;
    posterImage: string | null;
    bannerImage?: string | null;
    eventType?: string;
    category: { name: string; slug: string };
    venue: { name: string; city: string } | null;
    schedule: EventSchedule | null;
    lowestPrice?: number | null;
    reviewCount: number;
}

interface ApiResponse {
    success: boolean;
    data: {
        organizer: OrganizerData;
        stats: OrganizerStats;
        upcomingEvents: EventData[];
        pastEvents: EventData[];
        isFollowing: boolean;
    };
    error?: { message: string };
}

function FacebookIcon({ className }: { className?: string }) {
    return (
        <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
            <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
        </svg>
    );
}

function InstagramIcon({ className }: { className?: string }) {
    return (
        <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
            <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/>
        </svg>
    );
}

function TwitterIcon({ className }: { className?: string }) {
    return (
        <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
            <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
        </svg>
    );
}

function TiktokIcon({ className }: { className?: string }) {
    return (
        <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
            <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z"/>
        </svg>
    );
}

function EventCard({ event, isPast = false }: { event: EventData; isPast?: boolean }) {
    const formatDate = (dateStr: string) => {
        return new Date(dateStr).toLocaleDateString("id-ID", {
            day: "numeric",
            month: "short",
            year: "numeric",
        });
    };

    return (
        <Link
            href={`/events/${event.slug}`}
            className={`group bg-white rounded-2xl overflow-hidden border border-gray-100 shadow-sm hover:shadow-xl hover:shadow-indigo-500/10 transition-all duration-300 ${isPast ? "opacity-75 hover:opacity-100" : ""}`}
        >
            <div className="relative h-40 bg-gradient-to-br from-indigo-500 to-purple-600">
                {event.posterImage && (
                    <img
                        src={event.posterImage}
                        alt={event.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                )}
                <div className="absolute top-3 left-3">
                    <span className="px-2 py-1 bg-white/90 backdrop-blur-sm text-xs font-bold text-indigo-600 rounded-lg">
                        {event.category.name}
                    </span>
                </div>
                {isPast && (
                    <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
                        <span className="px-3 py-1.5 bg-black/60 text-white text-sm font-medium rounded-full">
                            Event Selesai
                        </span>
                    </div>
                )}
            </div>
            <div className="p-4">
                <h3 className="font-bold text-gray-900 line-clamp-2 group-hover:text-indigo-600 transition-colors mb-2">
                    {event.title}
                </h3>
                {event.schedule && (
                    <div className="flex items-center text-gray-500 text-sm mb-1">
                        <Calendar size={14} className="mr-1.5 text-gray-400" />
                        <span>{formatDate(event.schedule.scheduleDate)}</span>
                    </div>
                )}
                {event.venue && (
                    <div className="flex items-center text-gray-500 text-sm mb-3">
                        <MapPin size={14} className="mr-1.5 text-gray-400" />
                        <span className="truncate">{event.venue.city}</span>
                    </div>
                )}
                {!isPast && event.lowestPrice !== undefined && event.lowestPrice !== null && (
                    <div className="pt-3 border-t border-gray-100">
                        <div className="flex items-center justify-between">
                            {event.reviewCount > 0 && (
                                <div className="flex items-center text-yellow-500 bg-yellow-50 px-2 py-1 rounded-lg">
                                    <Star size={12} fill="currentColor" className="mr-1" />
                                    <span className="text-xs font-bold text-yellow-700">{event.reviewCount}</span>
                                </div>
                            )}
                            <div className="ml-auto text-right">
                                <span className="text-[10px] text-gray-400 uppercase">Mulai dari</span>
                                <p className="font-bold text-indigo-600">
                                    {event.lowestPrice === 0 ? "Gratis" : formatCurrency(event.lowestPrice)}
                                </p>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </Link>
    );
}

export default function OrganizerProfilePage() {
    const params = useParams();
    const router = useRouter();
    const slug = params.slug as string;

    const [organizer, setOrganizer] = useState<OrganizerData | null>(null);
    const [stats, setStats] = useState<OrganizerStats | null>(null);
    const [upcomingEvents, setUpcomingEvents] = useState<EventData[]>([]);
    const [pastEvents, setPastEvents] = useState<EventData[]>([]);
    const [isFollowing, setIsFollowing] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [isFollowLoading, setIsFollowLoading] = useState(false);
    const [followersCount, setFollowersCount] = useState(0);

    const fetchOrganizer = useCallback(async () => {
        try {
            setIsLoading(true);
            const res = await fetch(`/api/organizers/${slug}`);
            const data: ApiResponse = await res.json();

            if (!data.success) {
                setError(data.error?.message || "Organizer tidak ditemukan");
                return;
            }

            setOrganizer(data.data.organizer);
            setStats(data.data.stats);
            setUpcomingEvents(data.data.upcomingEvents);
            setPastEvents(data.data.pastEvents);
            setIsFollowing(data.data.isFollowing);
            setFollowersCount(data.data.stats.followersCount);
        } catch {
            setError("Gagal memuat profil organizer");
        } finally {
            setIsLoading(false);
        }
    }, [slug]);

    useEffect(() => {
        fetchOrganizer();
    }, [fetchOrganizer]);

    const handleFollowToggle = async () => {
        setIsFollowLoading(true);
        try {
            const method = isFollowing ? "DELETE" : "POST";
            const res = await fetch(`/api/organizers/${slug}/follow`, { method });
            const data = await res.json();

            if (data.success) {
                setIsFollowing(data.data.isFollowing);
                setFollowersCount(data.data.followersCount);
            } else if (res.status === 401) {
                router.push(`/login?returnUrl=/organizers/${slug}`);
            }
        } catch {
            console.error("Failed to toggle follow");
        } finally {
            setIsFollowLoading(false);
        }
    };

    const formatMemberSince = (dateStr: string) => {
        return new Date(dateStr).toLocaleDateString("id-ID", {
            month: "long",
            year: "numeric",
        });
    };

    if (isLoading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <Loader2 className="h-12 w-12 text-indigo-600 animate-spin mx-auto mb-4" />
                    <p className="text-gray-500">Memuat profil organizer...</p>
                </div>
            </div>
        );
    }

    if (error || !organizer) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center max-w-md px-4">
                    <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
                    <h2 className="text-xl font-bold text-gray-900 mb-2">Organizer Tidak Ditemukan</h2>
                    <p className="text-gray-500 mb-6">{error || "Halaman yang kamu cari tidak tersedia."}</p>
                    <Link
                        href="/"
                        className="inline-flex items-center gap-2 px-6 py-3 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 transition-colors"
                    >
                        <ArrowLeft className="h-4 w-4" />
                        Kembali ke Beranda
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50">
            <div className="relative h-64 md:h-80 bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-500">
                {organizer.organizationBanner && (
                    <img
                        src={organizer.organizationBanner}
                        alt={organizer.organizationName}
                        className="w-full h-full object-cover"
                    />
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
                
                <div className="absolute top-4 left-4">
                    <button
                        type="button"
                        onClick={() => router.back()}
                        className="p-2 bg-white/20 backdrop-blur-md rounded-full text-white hover:bg-white/30 transition-colors"
                    >
                        <ArrowLeft className="h-5 w-5" />
                    </button>
                </div>
            </div>

            <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="relative -mt-20 mb-8">
                    <div className="bg-white rounded-2xl shadow-xl p-6 md:p-8">
                        <div className="flex flex-col md:flex-row gap-6">
                            <div className="flex-shrink-0">
                                <div className="w-28 h-28 md:w-36 md:h-36 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 p-1 -mt-20 md:-mt-24 shadow-xl">
                                    {organizer.organizationLogo ? (
                                        <img
                                            src={organizer.organizationLogo}
                                            alt={organizer.organizationName}
                                            className="w-full h-full rounded-xl object-cover bg-white"
                                        />
                                    ) : (
                                        <div className="w-full h-full rounded-xl bg-white flex items-center justify-center">
                                            <span className="text-4xl md:text-5xl font-bold text-indigo-600">
                                                {organizer.organizationName.charAt(0)}
                                            </span>
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div className="flex-1 min-w-0">
                                <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                                    <div>
                                        <div className="flex items-center gap-2 mb-1">
                                            <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
                                                {organizer.organizationName}
                                            </h1>
                                            {organizer.isVerified && (
                                                <CheckCircle className="h-6 w-6 text-blue-500" />
                                            )}
                                        </div>
                                        <p className="text-gray-500 mb-4">
                                            Bergabung sejak {formatMemberSince(organizer.createdAt)}
                                        </p>
                                        
                                        <div className="flex flex-wrap gap-3">
                                            {organizer.websiteUrl && (
                                                <a
                                                    href={organizer.websiteUrl}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg text-sm transition-colors"
                                                >
                                                    <Globe className="h-4 w-4" />
                                                    Website
                                                    <ExternalLink className="h-3 w-3" />
                                                </a>
                                            )}
                                            {organizer.socialFacebook && (
                                                <a
                                                    href={organizer.socialFacebook}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="p-2 bg-gray-100 hover:bg-blue-100 text-gray-600 hover:text-blue-600 rounded-lg transition-colors"
                                                >
                                                    <FacebookIcon className="h-5 w-5" />
                                                </a>
                                            )}
                                            {organizer.socialInstagram && (
                                                <a
                                                    href={organizer.socialInstagram}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="p-2 bg-gray-100 hover:bg-pink-100 text-gray-600 hover:text-pink-600 rounded-lg transition-colors"
                                                >
                                                    <InstagramIcon className="h-5 w-5" />
                                                </a>
                                            )}
                                            {organizer.socialTwitter && (
                                                <a
                                                    href={organizer.socialTwitter}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="p-2 bg-gray-100 hover:bg-gray-200 text-gray-600 hover:text-gray-900 rounded-lg transition-colors"
                                                >
                                                    <TwitterIcon className="h-5 w-5" />
                                                </a>
                                            )}
                                            {organizer.socialTiktok && (
                                                <a
                                                    href={organizer.socialTiktok}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="p-2 bg-gray-100 hover:bg-gray-200 text-gray-600 hover:text-gray-900 rounded-lg transition-colors"
                                                >
                                                    <TiktokIcon className="h-5 w-5" />
                                                </a>
                                            )}
                                        </div>
                                    </div>

                                    <button
                                        type="button"
                                        onClick={handleFollowToggle}
                                        disabled={isFollowLoading}
                                        className={`inline-flex items-center gap-2 px-6 py-3 rounded-xl font-semibold transition-all ${
                                            isFollowing
                                                ? "bg-gray-100 text-gray-700 hover:bg-red-50 hover:text-red-600"
                                                : "bg-indigo-600 text-white hover:bg-indigo-700"
                                        } disabled:opacity-50`}
                                    >
                                        {isFollowLoading ? (
                                            <Loader2 className="h-5 w-5 animate-spin" />
                                        ) : isFollowing ? (
                                            <>
                                                <UserMinus className="h-5 w-5" />
                                                Mengikuti
                                            </>
                                        ) : (
                                            <>
                                                <UserPlus className="h-5 w-5" />
                                                Ikuti
                                            </>
                                        )}
                                    </button>
                                </div>

                                {organizer.organizationDescription && (
                                    <p className="text-gray-600 mt-4 max-w-2xl">
                                        {organizer.organizationDescription}
                                    </p>
                                )}
                            </div>
                        </div>

                        {stats && (
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8 pt-8 border-t border-gray-100">
                                <div className="text-center p-4 bg-gray-50 rounded-xl">
                                    <div className="flex items-center justify-center gap-2 text-indigo-600 mb-2">
                                        <Calendar className="h-5 w-5" />
                                    </div>
                                    <p className="text-2xl font-bold text-gray-900">{stats.totalEvents}</p>
                                    <p className="text-sm text-gray-500">Event</p>
                                </div>
                                <div className="text-center p-4 bg-gray-50 rounded-xl">
                                    <div className="flex items-center justify-center gap-2 text-pink-600 mb-2">
                                        <Users className="h-5 w-5" />
                                    </div>
                                    <p className="text-2xl font-bold text-gray-900">{followersCount}</p>
                                    <p className="text-sm text-gray-500">Pengikut</p>
                                </div>
                                <div className="text-center p-4 bg-gray-50 rounded-xl">
                                    <div className="flex items-center justify-center gap-2 text-green-600 mb-2">
                                        <Ticket className="h-5 w-5" />
                                    </div>
                                    <p className="text-2xl font-bold text-gray-900">
                                        {stats.totalTicketsSold > 1000
                                            ? `${(stats.totalTicketsSold / 1000).toFixed(1)}K`
                                            : stats.totalTicketsSold}
                                    </p>
                                    <p className="text-sm text-gray-500">Tiket Terjual</p>
                                </div>
                                <div className="text-center p-4 bg-gray-50 rounded-xl">
                                    <div className="flex items-center justify-center gap-2 text-yellow-500 mb-2">
                                        <Star className="h-5 w-5" fill="currentColor" />
                                    </div>
                                    <p className="text-2xl font-bold text-gray-900">
                                        {stats.averageRating > 0 ? stats.averageRating.toFixed(1) : "-"}
                                    </p>
                                    <p className="text-sm text-gray-500">
                                        {stats.totalReviews > 0 ? `${stats.totalReviews} Review` : "Belum ada review"}
                                    </p>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {upcomingEvents.length > 0 && (
                    <section className="mb-12">
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                                <Clock className="h-5 w-5 text-indigo-600" />
                                Event Mendatang
                            </h2>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                            {upcomingEvents.map((event) => (
                                <EventCard key={event.id} event={event} />
                            ))}
                        </div>
                    </section>
                )}

                {pastEvents.length > 0 && (
                    <section className="mb-12">
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-xl font-bold text-gray-900">Event Sebelumnya</h2>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                            {pastEvents.map((event) => (
                                <EventCard key={event.id} event={event} isPast />
                            ))}
                        </div>
                    </section>
                )}

                {upcomingEvents.length === 0 && pastEvents.length === 0 && (
                    <div className="text-center py-16">
                        <Calendar className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                        <h3 className="text-lg font-medium text-gray-900 mb-2">Belum Ada Event</h3>
                        <p className="text-gray-500">Organizer ini belum memiliki event.</p>
                    </div>
                )}

                <div className="pb-12" />
            </div>
        </div>
    );
}
