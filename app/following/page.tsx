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
            const res = await fetch(`/api/organizer/followers?organizerSlug=${organizerSlug}`, {
                method: "DELETE",
            });
            const data = await res.json();

            if (!data.success) {
                alert(data.error?.message || "Gagal berhenti mengikuti");
                return;
            }

            setFollowing(following.filter((f) => f.id !== id));
        } catch {
            alert("Terjadi kesalahan saat berhenti mengikuti");
        } finally {
            setActionLoading(null);
        }
    };

    const handleToggleNotifications = async (organizerSlug: string, id: string, currentNotify: boolean) => {
        try {
            setActionLoading(id);
            const res = await fetch("/api/organizer/followers", {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ organizerSlug, notifyNewEvents: !currentNotify }),
            });
            const data = await res.json();

            if (!data.success) {
                alert(data.error?.message || "Gagal mengupdate pengaturan notifikasi");
                return;
            }

            setFollowing(
                following.map((f) =>
                    f.id === id ? { ...f, notifyNewEvents: !currentNotify } : f
                )
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
            item.organizer.organizationName.toLowerCase().includes(searchLower) ||
            item.organizer.organizationSlug.toLowerCase().includes(searchLower)
        );
    });

    if (isLoading) {
        return (
            <div className="min-h-[60vh] flex items-center justify-center">
                <div className="text-center">
                    <Loader2 className="h-12 w-12 text-[var(--accent-primary)] animate-spin mx-auto mb-4" />
                    <p className="text-[var(--text-muted)]">Memuat daftar mengikuti...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-[60vh] flex items-center justify-center">
                <div className="text-center card p-8 max-w-md">
                    <div className="w-16 h-16 bg-[var(--error-bg)] rounded-full flex items-center justify-center mx-auto mb-4">
                        <AlertCircle className="h-8 w-8 text-[var(--error)]" />
                    </div>
                    <p className="text-[var(--text-primary)] font-bold text-lg mb-2">{error}</p>
                    <Link href="/" className="text-[var(--accent-primary)] hover:underline">
                        Kembali ke Beranda
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <section className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-2xl sm:text-3xl font-bold text-[var(--text-primary)] flex items-center gap-3">
                        <Users className="h-7 w-7 text-[var(--accent-primary)]" />
                        Mengikuti
                    </h1>
                    <p className="text-[var(--text-muted)] text-sm mt-1">
                        {following.length} organizer yang Anda ikuti
                    </p>
                </div>
            </section>

            {following.length > 0 && (
                <section className="card p-4">
                    <div className="relative max-w-md">
                        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-5 w-5 text-[var(--text-muted)]" />
                        <input
                            type="text"
                            placeholder="Cari organizer..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="input pl-11"
                        />
                    </div>
                </section>
            )}

            {following.length === 0 ? (
                <div className="card p-12 text-center">
                    <div className="w-20 h-20 bg-gradient-to-br from-indigo-100 to-purple-100 dark:from-indigo-900/30 dark:to-purple-900/30 rounded-full flex items-center justify-center mx-auto mb-6">
                        <HeartCrack className="h-10 w-10 text-[var(--accent-primary)]" />
                    </div>
                    <h3 className="text-xl font-bold text-[var(--text-primary)] mb-2">Belum mengikuti organizer</h3>
                    <p className="text-[var(--text-muted)] mb-8 max-w-sm mx-auto">
                        Ikuti organizer favorit Anda untuk mendapatkan update terbaru tentang event mereka.
                    </p>
                    <Link href="/events" className="btn-primary w-full sm:w-auto rounded-full py-3 sm:py-2.5 justify-center inline-flex gap-2">
                        <Sparkles className="h-4 w-4" />
                        Jelajahi Event
                    </Link>
                </div>
            ) : filteredFollowing.length === 0 ? (
                <div className="card p-12 text-center">
                    <div className="w-16 h-16 bg-[var(--bg-tertiary)] rounded-full flex items-center justify-center mx-auto mb-4">
                        <Search className="h-8 w-8 text-[var(--text-muted)]" />
                    </div>
                    <h3 className="text-lg font-bold text-[var(--text-primary)] mb-2">Tidak ada hasil</h3>
                    <p className="text-[var(--text-muted)]">Coba kata kunci pencarian lain.</p>
                </div>
            ) : (
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {filteredFollowing.map((item, index) => (
                        <div
                            key={item.id}
                            className="card card-hover p-5 animate-fade-in-up"
                            style={{ animationDelay: `${index * 50}ms` }}
                        >
                            <div className="flex items-start gap-4 mb-4">
                                {item.organizer.organizationLogo ? (
                                    <Image
                                        src={item.organizer.organizationLogo}
                                        alt={item.organizer.organizationName}
                                        width={56}
                                        height={56}
                                        className="w-14 h-14 rounded-xl object-cover"
                                    />
                                ) : (
                                    <div className="w-14 h-14 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center text-white text-xl font-bold shadow-lg">
                                        {item.organizer.organizationName.charAt(0).toUpperCase()}
                                    </div>
                                )}
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2 mb-1">
                                        <h3 className="font-bold text-[var(--text-primary)] truncate">
                                            {item.organizer.organizationName}
                                        </h3>
                                        {item.organizer.isVerified && (
                                            <CheckCircle className="h-4 w-4 text-[var(--info)] flex-shrink-0" />
                                        )}
                                    </div>
                                    <p className="text-sm text-[var(--text-muted)]">
                                        @{item.organizer.organizationSlug}
                                    </p>
                                </div>
                            </div>

                            <div className="flex items-center gap-2 text-xs text-[var(--text-muted)] mb-4 pb-4 border-b border-[var(--border)]">
                                <Heart className="h-3.5 w-3.5 text-rose-400" />
                                <span>
                                    Mengikuti sejak{" "}
                                    {new Date(item.followedAt).toLocaleDateString("id-ID", {
                                        month: "long",
                                        year: "numeric",
                                    })}
                                </span>
                            </div>

                            <div className="flex items-center justify-between">
                                <button
                                    type="button"
                                    onClick={() =>
                                        handleToggleNotifications(
                                            item.organizer.organizationSlug,
                                            item.id,
                                            item.notifyNewEvents
                                        )
                                    }
                                    disabled={actionLoading === item.id}
                                    className={`inline-flex items-center gap-2 px-3 py-2.5 rounded-xl text-sm font-medium transition-all disabled:opacity-50 ${
                                        item.notifyNewEvents
                                            ? "bg-[var(--accent-primary)]/10 text-[var(--accent-primary)]"
                                            : "bg-[var(--bg-tertiary)] text-[var(--text-muted)] hover:text-[var(--text-secondary)]"
                                    }`}
                                >
                                    {item.notifyNewEvents ? (
                                        <Bell className="h-4 w-4" />
                                    ) : (
                                        <BellOff className="h-4 w-4" />
                                    )}
                                    {item.notifyNewEvents ? "Notif Aktif" : "Notif Off"}
                                </button>
                                <button
                                    type="button"
                                    onClick={() =>
                                        handleUnfollow(item.organizer.organizationSlug, item.id)
                                    }
                                    disabled={actionLoading === item.id}
                                    className="inline-flex items-center gap-2 px-3 py-2.5 rounded-xl text-sm font-medium text-[var(--error)] hover:bg-[var(--error-bg)] transition-all disabled:opacity-50"
                                >
                                    {actionLoading === item.id ? (
                                        <Loader2 className="h-4 w-4 animate-spin" />
                                    ) : (
                                        <HeartCrack className="h-4 w-4" />
                                    )}
                                    Berhenti Ikuti
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
