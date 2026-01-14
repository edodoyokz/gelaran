"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
    Users,
    Heart,
    HeartCrack,
    Bell,
    BellOff,
    Search,
    Loader2,
    AlertCircle,
    Check,
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
            <div className="min-h-screen bg-gray-100 flex items-center justify-center">
                <div className="text-center">
                    <Loader2 className="h-12 w-12 text-indigo-600 animate-spin mx-auto mb-4" />
                    <p className="text-gray-500">Memuat daftar mengikuti...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen bg-gray-100 flex items-center justify-center">
                <div className="text-center">
                    <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
                    <p className="text-gray-900 font-medium mb-2">{error}</p>
                    <Link href="/" className="text-indigo-600 hover:text-indigo-500">
                        Kembali ke Beranda
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-100">
            <header className="bg-white border-b">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
                    <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-4">
                            <Users className="h-6 w-6 text-gray-600" />
                            <div>
                                <h1 className="text-2xl font-bold text-gray-900">Mengikuti</h1>
                                <p className="text-sm text-gray-500 mt-1">
                                    {following.length} organizer yang Anda ikuti
                                </p>
                            </div>
                        </div>
                    </div>

                    {following.length > 0 && (
                        <div className="relative max-w-md">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                            <input
                                type="text"
                                placeholder="Cari organizer..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                className="w-full pl-10 pr-4 py-2 border rounded-lg"
                            />
                        </div>
                    )}
                </div>
            </header>

            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {following.length === 0 ? (
                    <div className="bg-white rounded-xl shadow-sm p-12 text-center">
                        <HeartCrack className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                        <h3 className="text-lg font-medium text-gray-900 mb-2">Belum mengikuti organizer</h3>
                        <p className="text-gray-500 mb-6">
                            Ikuti organizer favorit Anda untuk mendapatkan update terbaru tentang event mereka.
                        </p>
                        <Link
                            href="/events"
                            className="inline-flex items-center gap-2 text-indigo-600 font-medium"
                        >
                            <Users className="h-4 w-4" />
                            Jelajahi Event
                        </Link>
                    </div>
                ) : filteredFollowing.length === 0 ? (
                    <div className="bg-white rounded-xl shadow-sm p-12 text-center">
                        <Search className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                        <h3 className="text-lg font-medium text-gray-900 mb-2">Tidak ada hasil</h3>
                        <p className="text-gray-500">Coba kata kunci pencarian lain.</p>
                    </div>
                ) : (
                    <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                        {filteredFollowing.map((item) => (
                            <div
                                key={item.id}
                                className="bg-white rounded-xl shadow-sm overflow-hidden hover:shadow-md transition-shadow"
                            >
                                <div className="p-6">
                                    <div className="flex items-start gap-4 mb-4">
                                        {item.organizer.organizationLogo ? (
                                            <img
                                                src={item.organizer.organizationLogo}
                                                alt={item.organizer.organizationName}
                                                className="w-14 h-14 rounded-xl object-cover"
                                            />
                                        ) : (
                                            <div className="w-14 h-14 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center text-white text-xl font-bold">
                                                {item.organizer.organizationName.charAt(0).toUpperCase()}
                                            </div>
                                        )}
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-2 mb-1">
                                                <h3 className="font-semibold text-gray-900 truncate">
                                                    {item.organizer.organizationName}
                                                </h3>
                                                {item.organizer.isVerified && (
                                                    <Check className="h-4 w-4 text-blue-500 flex-shrink-0" />
                                                )}
                                            </div>
                                            <p className="text-sm text-gray-500">
                                                @{item.organizer.organizationSlug}
                                            </p>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-2 text-xs text-gray-500 mb-4">
                                        <Heart className="h-3.5 w-3.5" />
                                        <span>
                                            Mengikuti sejak{" "}
                                            {new Date(item.followedAt).toLocaleDateString("id-ID", {
                                                month: "long",
                                                year: "numeric",
                                            })}
                                        </span>
                                    </div>

                                    <div className="flex items-center justify-between border-t pt-4">
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
                                            className="inline-flex items-center gap-1.5 text-sm text-gray-600 hover:text-gray-900 disabled:opacity-50"
                                        >
                                            {item.notifyNewEvents ? (
                                                <Bell className="h-4 w-4" />
                                            ) : (
                                                <BellOff className="h-4 w-4" />
                                            )}
                                            {item.notifyNewEvents ? "Notif Aktif" : "Notif Non-aktif"}
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() =>
                                                handleUnfollow(item.organizer.organizationSlug, item.id)
                                            }
                                            disabled={actionLoading === item.id}
                                            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm text-red-600 hover:bg-red-50 rounded-lg disabled:opacity-50"
                                        >
                                            {actionLoading === item.id ? (
                                                <Loader2 className="h-3.5 w-3.5 animate-spin" />
                                            ) : (
                                                <HeartCrack className="h-3.5 w-3.5" />
                                            )}
                                            Berhenti Ikuti
                                        </button>
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
