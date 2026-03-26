"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import {
    Users,
    Heart,
    HeartCrack,
    Bell,
    BellOff,
    Search,
    Loader2,
    AlertCircle,
    CheckCircle,
    Sparkles,
} from "lucide-react";
import {
    CustomerEmptyState,
    CustomerHero,
    CustomerStatusBadge,
    DashboardSection,
} from "@/components/customer/customer-dashboard-primitives";

interface Organizer {
    id: string;
    organizationName: string;
    organizationSlug: string;
    organizationLogo: string | null;
    isVerified: boolean;
}

interface FollowingItem {
    id: string;
    notifyNewEvents: boolean;
    followedAt: string;
    organizer: Organizer;
}

export default function FollowingPage() {
    const [following, setFollowing] = useState<FollowingItem[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [search, setSearch] = useState("");
    const [actionLoading, setActionLoading] = useState<string | null>(null);

    useEffect(() => {
        const loadFollowing = async () => {
            try {
                setIsLoading(true);
                const res = await fetch("/api/organizer/followers");
                const data = await res.json();

                if (!data.success) {
                    setError(data.error?.message || "Gagal memuat daftar mengikuti");
                    return;
                }

                setFollowing(data.data || []);
                setError(null);
            } catch {
                setError("Terjadi kesalahan saat memuat data");
            } finally {
                setIsLoading(false);
            }
        };

        loadFollowing();
    }, []);

    const handleUnfollow = async (organizerSlug: string, id: string) => {
        if (!confirm("Apakah Anda yakin ingin berhenti mengikuti organizer ini?")) return;

        try {
            setActionLoading(id);
            const res = await fetch(
                `/api/organizer/followers?organizerSlug=${organizerSlug}`,
                {
                    method: "DELETE",
                },
            );
            const data = await res.json();

            if (!data.success) {
                alert(data.error?.message || "Gagal berhenti mengikuti");
                return;
            }

            setFollowing((prev) => prev.filter((f) => f.id !== id));
        } catch {
            alert("Terjadi kesalahan saat berhenti mengikuti");
        } finally {
            setActionLoading(null);
        }
    };

    const handleToggleNotifications = async (
        organizerSlug: string,
        id: string,
        currentNotify: boolean,
    ) => {
        try {
            setActionLoading(id);
            const res = await fetch("/api/organizer/followers", {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    organizerSlug,
                    notifyNewEvents: !currentNotify,
                }),
            });
            const data = await res.json();

            if (!data.success) {
                alert(
                    data.error?.message ||
                    "Gagal mengupdate pengaturan notifikasi",
                );
                return;
            }

            setFollowing((prev) =>
                prev.map((f) =>
                    f.id === id
                        ? { ...f, notifyNewEvents: !currentNotify }
                        : f,
                ),
            );
        } catch {
            alert("Terjadi kesalahan saat mengupdate notifikasi");
        } finally {
            setActionLoading(null);
        }
    };

    const filteredFollowing = following.filter((item) => {
        if (!search) return true;
        const searchLower = search.toLowerCase();
        return (
            item.organizer.organizationName
                .toLowerCase()
                .includes(searchLower) ||
            item.organizer.organizationSlug.toLowerCase().includes(searchLower)
        );
    });

    if (isLoading) {
        return (
            <div className="min-h-[60vh] flex items-center justify-center">
                <div className="text-center">
                    <Loader2 className="mx-auto mb-4 h-12 w-12 animate-spin text-(--accent-primary)" />
                    <p className="text-(--text-muted)">
                        Memuat daftar mengikuti...
                    </p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <CustomerEmptyState
                title="Daftar following belum bisa dimuat"
                description={`${error}. Coba lagi beberapa saat atau kembali ke katalog event untuk melanjutkan eksplorasi.`}
                href="/events"
                ctaLabel="Jelajahi event"
                icon={AlertCircle}
            />
        );
    }

    return (
        <div className="space-y-6 lg:space-y-8">
            <CustomerHero
                eyebrow="Organizer network"
                title="Mengikuti"
                description="Kelola organizer favoritmu, nyalakan notifikasi event baru, dan rapikan daftar akun yang ingin terus kamu pantau."
                meta={
                    <>
                        <CustomerStatusBadge
                            label={`${following.length} organizer diikuti`}
                            tone="accent"
                            icon={Users}
                        />
                        <CustomerStatusBadge
                            label={`${following.filter((item) => item.notifyNewEvents).length} notifikasi aktif`}
                            tone="success"
                            icon={Bell}
                        />
                    </>
                }
                actions={
                    <Link
                        href="/events"
                        className="inline-flex items-center justify-center gap-2 rounded-full bg-(--accent-gradient) px-5 py-3 text-sm font-semibold text-white shadow-(--shadow-glow) transition-transform duration-200 hover:-translate-y-0.5"
                    >
                        <Sparkles className="h-4 w-4" />
                        Temukan organizer baru
                    </Link>
                }
            />

            {following.length > 0 ? (
                <DashboardSection
                    title="Cari organizer"
                    description="Temukan organizer tertentu di daftar following untuk mengatur notifikasi atau berhenti mengikuti lebih cepat."
                >
                    <label className="relative block max-w-xl">
                        <Search className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-(--text-muted)" />
                        <input
                            type="text"
                            placeholder="Cari nama organizer atau slug..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="input rounded-full pl-12"
                        />
                    </label>
                </DashboardSection>
            ) : null}

            <DashboardSection
                title="Organizer yang diikuti"
                description="Setiap kartu menampilkan identitas organizer, waktu mulai mengikuti, dan kontrol cepat untuk preferensi notifikasi."
            >
                {following.length === 0 ? (
                    <CustomerEmptyState
                        title="Belum mengikuti organizer"
                        description="Ikuti organizer favorit agar update event terbaru langsung muncul di dashboard customer dan halaman notifikasi."
                        href="/events"
                        ctaLabel="Mulai jelajahi event"
                        icon={HeartCrack}
                        className="border-none bg-transparent p-0 shadow-none"
                    />
                ) : filteredFollowing.length === 0 ? (
                    <CustomerEmptyState
                        title="Organizer tidak ditemukan"
                        description="Tidak ada hasil yang cocok dengan kata kunci pencarianmu. Coba nama lain atau slug yang berbeda."
                        icon={Search}
                        className="border-none bg-transparent p-0 shadow-none"
                    />
                ) : (
                    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                        {filteredFollowing.map((item) => (
                            <article
                                key={item.id}
                                className="rounded-[1.75rem] border border-(--border) bg-(--surface)/96 p-5 shadow-(--shadow-sm) transition-all duration-200 hover:-translate-y-0.5 hover:shadow-(--shadow-md)"
                            >
                                <div className="flex items-start gap-4">
                                    {item.organizer.organizationLogo ? (
                                        <Image
                                            src={item.organizer.organizationLogo}
                                            alt={item.organizer.organizationName}
                                            width={60}
                                            height={60}
                                            className="h-15 w-15 rounded-2xl object-cover"
                                        />
                                    ) : (
                                        <div className="flex h-15 w-15 items-center justify-center rounded-2xl bg-(--accent-gradient) text-lg font-semibold text-white shadow-(--shadow-glow)">
                                            {item.organizer.organizationName
                                                .charAt(0)
                                                .toUpperCase()}
                                        </div>
                                    )}

                                    <div className="min-w-0 flex-1 space-y-2">
                                        <div className="flex items-center gap-2">
                                            <h2 className="truncate text-lg font-semibold text-foreground">
                                                {item.organizer.organizationName}
                                            </h2>
                                            {item.organizer.isVerified ? (
                                                <CheckCircle className="h-4 w-4 shrink-0 text-(--info)" />
                                            ) : null}
                                        </div>
                                        <p className="text-sm text-(--text-muted)">
                                            @{item.organizer.organizationSlug}
                                        </p>
                                        <div className="flex flex-wrap gap-2">
                                            <CustomerStatusBadge
                                                label={`Mengikuti sejak ${new Date(
                                                    item.followedAt,
                                                ).toLocaleDateString("id-ID", {
                                                    month: "long",
                                                    year: "numeric",
                                                })}`}
                                                tone="neutral"
                                                icon={Heart}
                                            />
                                            <CustomerStatusBadge
                                                label={
                                                    item.notifyNewEvents
                                                        ? "Notifikasi aktif"
                                                        : "Notifikasi nonaktif"
                                                }
                                                tone={
                                                    item.notifyNewEvents
                                                        ? "success"
                                                        : "warning"
                                                }
                                                icon={
                                                    item.notifyNewEvents
                                                        ? Bell
                                                        : BellOff
                                                }
                                            />
                                        </div>
                                    </div>
                                </div>

                                <div className="mt-5 flex flex-col gap-3">
                                    <Link
                                        href={`/organizers/${item.organizer.organizationSlug}`}
                                        className="inline-flex items-center justify-center rounded-full border border-(--border) bg-(--surface-elevated) px-4 py-3 text-sm font-semibold text-foreground transition-colors hover:bg-(--surface-hover)"
                                    >
                                        Lihat profil organizer
                                    </Link>

                                    <div className="grid grid-cols-2 gap-3">
                                        <button
                                            type="button"
                                            onClick={() =>
                                                handleToggleNotifications(
                                                    item.organizer.organizationSlug,
                                                    item.id,
                                                    item.notifyNewEvents,
                                                )
                                            }
                                            disabled={actionLoading === item.id}
                                            className={`inline-flex items-center justify-center gap-2 rounded-full px-4 py-3 text-sm font-semibold transition-colors disabled:cursor-not-allowed disabled:opacity-60 ${item.notifyNewEvents
                                                    ? "bg-(--surface-brand-soft) text-(--accent-primary)"
                                                    : "border border-(--border) bg-(--surface-elevated) text-(--text-secondary) hover:bg-(--surface-hover)"
                                                }`}
                                        >
                                            {actionLoading === item.id ? (
                                                <Loader2 className="h-4 w-4 animate-spin" />
                                            ) : item.notifyNewEvents ? (
                                                <Bell className="h-4 w-4" />
                                            ) : (
                                                <BellOff className="h-4 w-4" />
                                            )}
                                            {item.notifyNewEvents ? "Notif aktif" : "Aktifkan notif"}
                                        </button>

                                        <button
                                            type="button"
                                            onClick={() =>
                                                handleUnfollow(
                                                    item.organizer.organizationSlug,
                                                    item.id,
                                                )
                                            }
                                            disabled={actionLoading === item.id}
                                            className="inline-flex items-center justify-center gap-2 rounded-full border border-[rgba(198,40,40,0.16)] bg-(--error-bg) px-4 py-3 text-sm font-semibold text-(--error-text) transition-colors hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
                                        >
                                            {actionLoading === item.id ? (
                                                <Loader2 className="h-4 w-4 animate-spin" />
                                            ) : (
                                                <HeartCrack className="h-4 w-4" />
                                            )}
                                            Berhenti ikuti
                                        </button>
                                    </div>
                                </div>
                            </article>
                        ))}
                    </div>
                )}
            </DashboardSection>
        </div>
    );
}
