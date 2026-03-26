"use client";

import type { ComponentType } from "react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
    AlertCircle,
    ArrowLeft,
    CalendarDays,
    CheckCircle,
    ExternalLink,
    Globe,
    Loader2,
    Sparkles,
    Star,
    Ticket,
    UserMinus,
    UserPlus,
    Users,
} from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import { EventCard } from "@/components/features/events/EventCard";
import {
    DiscoveryBadge,
    DiscoveryContainer,
    DiscoveryHero,
    DiscoveryLinkRow,
    DiscoveryPageShell,
    DiscoveryPanel,
    DiscoverySection,
    DiscoveryStat,
} from "@/components/features/events/discovery-primitives";

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
            <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
        </svg>
    );
}

function InstagramIcon({ className }: { className?: string }) {
    return (
        <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
            <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" />
        </svg>
    );
}

function TwitterIcon({ className }: { className?: string }) {
    return (
        <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
            <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
        </svg>
    );
}

function TiktokIcon({ className }: { className?: string }) {
    return (
        <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
            <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z" />
        </svg>
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
            const response = await fetch(`/api/organizers/${slug}`);
            const data: ApiResponse = await response.json();

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
            const response = await fetch(`/api/organizers/${slug}/follow`, { method });
            const data = await response.json();

            if (data.success) {
                setIsFollowing(data.data.isFollowing);
                setFollowersCount(data.data.followersCount);
            } else if (response.status === 401) {
                router.push(`/login?returnUrl=/organizers/${slug}`);
            }
        } catch {
            console.error("Failed to toggle follow");
        } finally {
            setIsFollowLoading(false);
        }
    };

    const formatMemberSince = (dateStr: string) =>
        new Date(dateStr).toLocaleDateString("id-ID", {
            month: "long",
            year: "numeric",
        });

    const formatEventDate = (schedule: EventSchedule | null) =>
        schedule
            ? new Date(schedule.scheduleDate).toLocaleDateString("id-ID", {
                day: "numeric",
                month: "short",
                year: "numeric",
            })
            : "Tanggal diumumkan";

    const formatEventTime = (schedule: EventSchedule | null) =>
        schedule
            ? `${new Date(schedule.startTime).toLocaleTimeString("id-ID", {
                hour: "2-digit",
                minute: "2-digit",
            })} WIB`
            : "Waktu diumumkan";

    const socialLinks = useMemo(
        () =>
            organizer
                ? [
                    organizer.websiteUrl
                        ? {
                            key: "website",
                            href: organizer.websiteUrl,
                            label: "Website",
                            icon: Globe,
                        }
                        : null,
                    organizer.socialFacebook
                        ? {
                            key: "facebook",
                            href: organizer.socialFacebook,
                            label: "Facebook",
                            icon: FacebookIcon,
                        }
                        : null,
                    organizer.socialInstagram
                        ? {
                            key: "instagram",
                            href: organizer.socialInstagram,
                            label: "Instagram",
                            icon: InstagramIcon,
                        }
                        : null,
                    organizer.socialTwitter
                        ? {
                            key: "twitter",
                            href: organizer.socialTwitter,
                            label: "X / Twitter",
                            icon: TwitterIcon,
                        }
                        : null,
                    organizer.socialTiktok
                        ? {
                            key: "tiktok",
                            href: organizer.socialTiktok,
                            label: "TikTok",
                            icon: TiktokIcon,
                        }
                        : null,
                ].filter(Boolean) as {
                        key: string;
                        href: string;
                        label: string;
                        icon: ComponentType<{ className?: string }>;
                    }[]
                : [],
        [organizer],
    );

    if (isLoading) {
        return (
            <DiscoveryPageShell>
                <div className="flex min-h-screen items-center justify-center">
                    <div className="text-center">
                        <Loader2 className="mx-auto h-10 w-10 animate-spin text-(--accent-primary)" />
                        <p className="mt-4 text-sm text-(--text-secondary)">Memuat profil organizer...</p>
                    </div>
                </div>
            </DiscoveryPageShell>
        );
    }

    if (error || !organizer) {
        return (
            <DiscoveryPageShell>
                <div className="flex min-h-screen items-center justify-center px-4">
                    <DiscoveryPanel className="max-w-xl p-10 text-center">
                        <AlertCircle className="mx-auto h-12 w-12 text-(--error)" />
                        <h1 className="mt-5 text-3xl font-semibold tracking-(--tracking-heading) text-foreground">
                            Organizer tidak ditemukan
                        </h1>
                        <p className="mt-3 text-sm leading-7 text-(--text-secondary) sm:text-base">
                            {error || "Halaman yang kamu cari tidak tersedia."}
                        </p>
                        <Link
                            href="/"
                            className="mt-6 inline-flex min-h-12 items-center justify-center gap-2 rounded-full bg-(--accent-primary) px-6 py-3 text-sm font-semibold text-white transition-colors duration-200 hover:bg-(--accent-primary-hover)"
                        >
                            <ArrowLeft className="h-4 w-4" />
                            Kembali ke beranda
                        </Link>
                    </DiscoveryPanel>
                </div>
            </DiscoveryPageShell>
        );
    }

    return (
        <DiscoveryPageShell>
            <DiscoveryHero
                eyebrow={
                    <span className="inline-flex items-center gap-2">
                        <Sparkles className="h-3.5 w-3.5" />
                        Organizer public profile
                    </span>
                }
                title={organizer.organizationName}
                description={
                    organizer.organizationDescription ||
                    "Profil publik organizer ini kini mengikuti baseline editorial Gelaran dengan hero media, statistik ringkas, dan presentasi event yang lebih konsisten."
                }
            >
                <DiscoveryPanel className="overflow-hidden p-0">
                    <div className="relative h-72 w-full bg-[linear-gradient(135deg,rgba(1,89,89,0.94),rgba(41,179,182,0.7))] sm:h-80 lg:h-104">
                        {organizer.organizationBanner ? (
                            <img
                                src={organizer.organizationBanner}
                                alt={organizer.organizationName}
                                className="h-full w-full object-cover"
                            />
                        ) : null}
                        <div className="absolute inset-0 bg-linear-to-t from-[rgba(6,18,18,0.8)] via-[rgba(6,18,18,0.22)] to-transparent" />
                        <div className="absolute inset-x-0 bottom-0 p-5 sm:p-6">
                            <div className="grid gap-3 sm:grid-cols-3">
                                <DiscoveryStat label="Total event" value={stats?.totalEvents ?? 0} hint="Portofolio publik" />
                                <DiscoveryStat label="Pengikut" value={followersCount} hint="Komunitas aktif" />
                                <DiscoveryStat
                                    label="Rating publik"
                                    value={stats?.averageRating && stats.averageRating > 0 ? stats.averageRating.toFixed(1) : "—"}
                                    hint={stats?.totalReviews ? `${stats.totalReviews} review` : "Belum ada review"}
                                />
                            </div>
                        </div>
                    </div>
                </DiscoveryPanel>
            </DiscoveryHero>

            <DiscoveryContainer className="pb-16 sm:pb-20">
                <div className="mb-6 flex flex-wrap items-center gap-3">
                    <button
                        type="button"
                        onClick={() => router.back()}
                        className="inline-flex items-center gap-2 text-sm font-semibold text-(--text-secondary) transition-colors duration-200 hover:text-foreground"
                    >
                        <ArrowLeft className="h-4 w-4" />
                        Kembali
                    </button>
                    {organizer.isVerified ? <DiscoveryBadge tone="success">Terverifikasi</DiscoveryBadge> : null}
                    <DiscoveryBadge tone="accent">Bergabung sejak {formatMemberSince(organizer.createdAt)}</DiscoveryBadge>
                </div>

                <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_22rem] lg:items-start">
                    <div className="space-y-8">
                        <DiscoveryPanel className="p-5 sm:p-6 lg:p-8">
                            <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
                                <div className="flex flex-col gap-5 sm:flex-row">
                                    <div className="h-24 w-24 shrink-0 overflow-hidden rounded-[1.85rem] bg-[linear-gradient(135deg,rgba(1,89,89,0.92),rgba(41,179,182,0.68))] shadow-(--shadow-md)">
                                        {organizer.organizationLogo ? (
                                            <img
                                                src={organizer.organizationLogo}
                                                alt={organizer.organizationName}
                                                className="h-full w-full object-cover"
                                            />
                                        ) : (
                                            <div className="flex h-full w-full items-center justify-center text-3xl font-semibold text-white">
                                                {organizer.organizationName.charAt(0)}
                                            </div>
                                        )}
                                    </div>

                                    <div className="min-w-0 space-y-3">
                                        <div className="flex flex-wrap items-center gap-2">
                                            <h1 className="font-(--font-editorial) text-4xl leading-tight tracking-(--tracking-heading) text-foreground sm:text-5xl">
                                                {organizer.organizationName}
                                            </h1>
                                            {organizer.isVerified ? <CheckCircle className="h-6 w-6 text-(--info)" /> : null}
                                        </div>
                                        <p className="max-w-3xl text-sm leading-7 text-(--text-secondary) sm:text-base">
                                            {organizer.organizationDescription ||
                                                "Organizer ini belum menambahkan deskripsi brand publik."}
                                        </p>
                                    </div>
                                </div>

                                <button
                                    type="button"
                                    onClick={handleFollowToggle}
                                    disabled={isFollowLoading}
                                    className={`inline-flex min-h-12 items-center justify-center gap-2 rounded-full px-6 py-3 text-sm font-semibold transition-colors duration-200 ${isFollowing
                                        ? "border border-(--border) bg-white text-(--text-secondary) hover:border-[rgba(217,79,61,0.22)] hover:text-(--error-text)"
                                        : "bg-(--accent-secondary) text-white hover:bg-(--accent-secondary-hover)"
                                        }`}
                                >
                                    {isFollowLoading ? (
                                        <Loader2 className="h-4 w-4 animate-spin" />
                                    ) : isFollowing ? (
                                        <>
                                            <UserMinus className="h-4 w-4" />
                                            Mengikuti
                                        </>
                                    ) : (
                                        <>
                                            <UserPlus className="h-4 w-4" />
                                            Ikuti organizer
                                        </>
                                    )}
                                </button>
                            </div>
                        </DiscoveryPanel>

                        <DiscoverySection
                            title="Statistik publik"
                            description="Hierarki data diringkas menjadi empat metrik utama agar reputasi organizer cepat dipindai."
                        >
                            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                                <DiscoveryStat label="Event" value={stats?.totalEvents ?? 0} hint="Jumlah event publik" />
                                <DiscoveryStat label="Pengikut" value={followersCount} hint="Komunitas yang mengikuti" />
                                <DiscoveryStat
                                    label="Tiket terjual"
                                    value={
                                        stats
                                            ? stats.totalTicketsSold > 1000
                                                ? `${(stats.totalTicketsSold / 1000).toFixed(1)}K`
                                                : stats.totalTicketsSold
                                            : 0
                                    }
                                    hint="Akumulasi penjualan"
                                />
                                <DiscoveryStat
                                    label="Rating"
                                    value={stats?.averageRating && stats.averageRating > 0 ? stats.averageRating.toFixed(1) : "—"}
                                    hint={stats?.totalReviews ? `${stats.totalReviews} review publik` : "Belum ada review"}
                                />
                            </div>
                        </DiscoverySection>

                        {upcomingEvents.length > 0 ? (
                            <DiscoverySection
                                title="Event mendatang"
                                description="Kartu event menggunakan pola discovery yang sama dengan listing publik agar pengalaman lintas halaman terasa konsisten."
                            >
                                <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
                                    {upcomingEvents.map((event) => (
                                        <EventCard
                                            key={event.id}
                                            id={event.id}
                                            slug={event.slug}
                                            title={event.title}
                                            date={formatEventDate(event.schedule)}
                                            time={formatEventTime(event.schedule)}
                                            location={event.venue ? `${event.venue.name}, ${event.venue.city}` : "Lokasi diumumkan"}
                                            price={event.lowestPrice ?? 0}
                                            image={event.posterImage || "/placeholder.jpg"}
                                            category={event.category?.name || "Event"}
                                            organizer={organizer.organizationName}
                                            rating={event.reviewCount > 0 ? Math.min(5, 4 + event.reviewCount / 100) : 4.7}
                                            reviewCount={event.reviewCount}
                                            metaTone="accent"
                                        />
                                    ))}
                                </div>
                            </DiscoverySection>
                        ) : null}

                        {pastEvents.length > 0 ? (
                            <DiscoverySection
                                title="Arsip event sebelumnya"
                                description="Related content untuk organizer tetap hadir melalui arsip event lama dengan treatment visual yang serupa."
                            >
                                <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
                                    {pastEvents.map((event) => (
                                        <EventCard
                                            key={event.id}
                                            id={event.id}
                                            slug={event.slug}
                                            title={event.title}
                                            date={formatEventDate(event.schedule)}
                                            time={formatEventTime(event.schedule)}
                                            location={event.venue ? `${event.venue.name}, ${event.venue.city}` : "Lokasi diumumkan"}
                                            price={event.lowestPrice ?? 0}
                                            image={event.posterImage || "/placeholder.jpg"}
                                            category={event.category?.name || "Event"}
                                            organizer={organizer.organizationName}
                                            rating={event.reviewCount > 0 ? Math.min(5, 4 + event.reviewCount / 100) : 4.4}
                                            reviewCount={event.reviewCount}
                                            featuredLabel="Arsip"
                                            metaTone="default"
                                            className="opacity-90"
                                        />
                                    ))}
                                </div>
                            </DiscoverySection>
                        ) : null}

                        {upcomingEvents.length === 0 && pastEvents.length === 0 ? (
                            <DiscoveryPanel className="p-10 text-center sm:p-14">
                                <CalendarDays className="mx-auto h-12 w-12 text-(--text-muted)" />
                                <h2 className="mt-5 text-2xl font-semibold tracking-(--tracking-heading) text-foreground">
                                    Belum ada event publik
                                </h2>
                                <p className="mx-auto mt-3 max-w-xl text-sm leading-7 text-(--text-secondary) sm:text-base">
                                    Organizer ini belum memiliki event yang ditampilkan secara publik saat ini.
                                </p>
                            </DiscoveryPanel>
                        ) : null}
                    </div>

                    <aside className="space-y-4 lg:sticky lg:top-24">
                        <DiscoveryPanel className="p-5 sm:p-6">
                            <p className="text-[0.68rem] font-semibold uppercase tracking-[0.22em] text-(--text-muted)">
                                Profile summary
                            </p>
                            <div className="mt-4 space-y-4">
                                <div className="rounded-3xl border border-(--border) bg-white p-4">
                                    <div className="flex items-start gap-3">
                                        <div className="inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-(--surface-brand-soft) text-(--accent-primary)">
                                            <Users className="h-5 w-5" />
                                        </div>
                                        <div>
                                            <p className="text-[0.68rem] font-semibold uppercase tracking-[0.22em] text-(--text-muted)">Followers</p>
                                            <p className="mt-1 text-xl font-semibold text-foreground">{followersCount}</p>
                                        </div>
                                    </div>
                                </div>

                                <div className="rounded-3xl border border-(--border) bg-white p-4">
                                    <div className="flex items-start gap-3">
                                        <div className="inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-(--warning-bg) text-(--warning-text)">
                                            <Star className="h-5 w-5" />
                                        </div>
                                        <div>
                                            <p className="text-[0.68rem] font-semibold uppercase tracking-[0.22em] text-(--text-muted)">Public rating</p>
                                            <p className="mt-1 text-xl font-semibold text-foreground">
                                                {stats?.averageRating && stats.averageRating > 0 ? stats.averageRating.toFixed(1) : "—"}
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                <div className="rounded-3xl border border-(--border) bg-white p-4">
                                    <div className="flex items-start gap-3">
                                        <div className="inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-(--surface-brand-soft) text-(--accent-primary)">
                                            <Ticket className="h-5 w-5" />
                                        </div>
                                        <div>
                                            <p className="text-[0.68rem] font-semibold uppercase tracking-[0.22em] text-(--text-muted)">Ticket value</p>
                                            <p className="mt-1 text-xl font-semibold text-foreground">
                                                {upcomingEvents.some((event) => typeof event.lowestPrice === "number")
                                                    ? formatCurrency(
                                                        Math.min(
                                                            ...upcomingEvents
                                                                .map((event) => event.lowestPrice)
                                                                .filter((price): price is number => typeof price === "number"),
                                                        ),
                                                    )
                                                    : "Gratis / TBA"}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </DiscoveryPanel>

                        {socialLinks.length > 0 ? (
                            <DiscoveryPanel className="p-5 sm:p-6">
                                <p className="text-[0.68rem] font-semibold uppercase tracking-[0.22em] text-(--text-muted)">
                                    External channels
                                </p>
                                <div className="mt-4 space-y-3">
                                    {socialLinks.map((item) => {
                                        const Icon = item.icon;
                                        return (
                                            <a
                                                key={item.key}
                                                href={item.href}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="flex items-center justify-between rounded-3xl border border-(--border) bg-white px-4 py-3 text-sm font-medium text-foreground transition-colors duration-200 hover:border-(--border-strong) hover:bg-(--surface-hover)"
                                            >
                                                <span className="inline-flex items-center gap-3">
                                                    <span className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-(--surface-muted) text-(--text-secondary)">
                                                        <Icon className="h-4 w-4" />
                                                    </span>
                                                    {item.label}
                                                </span>
                                                <ExternalLink className="h-4 w-4 text-(--text-muted)" />
                                            </a>
                                        );
                                    })}
                                </div>
                            </DiscoveryPanel>
                        ) : null}

                        <DiscoveryPanel className="p-5 sm:p-6">
                            <p className="text-[0.68rem] font-semibold uppercase tracking-[0.22em] text-(--text-muted)">
                                Related browsing
                            </p>
                            <h3 className="mt-2 text-xl font-semibold tracking-(--tracking-heading) text-foreground">
                                Jelajahi semua event publik
                            </h3>
                            <p className="mt-2 text-sm leading-7 text-(--text-secondary)">
                                Kembali ke discovery page untuk melihat organizer ini bersama event publik lainnya dalam satu baseline desain.
                            </p>
                            <div className="mt-4">
                                <DiscoveryLinkRow href="/events" label="Buka halaman event discovery" />
                            </div>
                        </DiscoveryPanel>
                    </aside>
                </div>
            </DiscoveryContainer>
        </DiscoveryPageShell>
    );
}
