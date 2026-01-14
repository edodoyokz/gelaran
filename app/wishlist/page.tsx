"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import {
    Heart,
    Calendar,
    MapPin,
    Loader2,
    AlertCircle,
    Trash2,
    ExternalLink,
    Tag,
    Sparkles,
} from "lucide-react";

interface WishlistEvent {
    id: string;
    title: string;
    slug: string;
    posterImage: string | null;
    status: string;
    category: string | null;
    venue: {
        name: string;
        city: string;
    } | null;
    schedule: {
        date: string;
        time: string;
    } | null;
    price: {
        isFree: boolean;
        startingFrom: number;
    } | null;
}

interface WishlistItem {
    id: string;
    createdAt: string;
    event: WishlistEvent;
}

export default function WishlistPage() {
    const router = useRouter();
    const [wishlists, setWishlists] = useState<WishlistItem[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [removingId, setRemovingId] = useState<string | null>(null);

    const fetchWishlist = useCallback(async () => {
        try {
            setIsLoading(true);
            const res = await fetch("/api/wishlist");
            const data = await res.json();

            if (!res.ok) {
                if (res.status === 401) {
                    router.push("/login?returnUrl=/wishlist");
                    return;
                }
                setError(data.error?.message || "Gagal memuat wishlist");
                return;
            }

            if (data.success) {
                setWishlists(data.data.wishlists);
            }
        } catch {
            setError("Gagal memuat wishlist");
        } finally {
            setIsLoading(false);
        }
    }, [router]);

    useEffect(() => {
        fetchWishlist();
    }, [fetchWishlist]);

    const handleRemove = async (eventId: string) => {
        try {
            setRemovingId(eventId);
            const res = await fetch(`/api/wishlist?eventId=${eventId}`, {
                method: "DELETE",
            });

            const data = await res.json();

            if (!data.success) {
                alert(data.error?.message || "Gagal menghapus dari wishlist");
                return;
            }

            setWishlists((prev) => prev.filter((w) => w.event.id !== eventId));
        } catch {
            alert("Gagal menghapus dari wishlist");
        } finally {
            setRemovingId(null);
        }
    };

    const formatDate = (dateStr: string): string => {
        return new Date(dateStr).toLocaleDateString("id-ID", {
            weekday: "short",
            day: "numeric",
            month: "short",
            year: "numeric",
        });
    };

    const formatTime = (timeStr: string): string => {
        const date = new Date(timeStr);
        return date.toLocaleTimeString("id-ID", {
            hour: "2-digit",
            minute: "2-digit",
        });
    };

    const formatCurrency = (amount: number): string => {
        return new Intl.NumberFormat("id-ID", {
            style: "currency",
            currency: "IDR",
            minimumFractionDigits: 0,
        }).format(amount);
    };

    if (isLoading) {
        return (
            <div className="min-h-[60vh] flex items-center justify-center">
                <div className="text-center">
                    <Loader2 className="h-12 w-12 text-[var(--accent-primary)] animate-spin mx-auto mb-4" />
                    <p className="text-[var(--text-muted)]">Memuat wishlist...</p>
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
                    <Link href="/dashboard" className="text-[var(--accent-primary)] hover:underline">
                        Kembali ke Dashboard
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <section className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-2xl sm:text-3xl font-bold text-[var(--text-primary)]">
                        Wishlist Saya
                    </h1>
                    <p className="text-[var(--text-muted)] text-sm mt-1">
                        {wishlists.length} event tersimpan
                    </p>
                </div>
            </section>

            {wishlists.length === 0 ? (
                <div className="card p-12 text-center">
                    <div className="w-20 h-20 bg-gradient-to-br from-rose-100 to-pink-100 dark:from-rose-900/30 dark:to-pink-900/30 rounded-full flex items-center justify-center mx-auto mb-6">
                        <Heart className="h-10 w-10 text-rose-500" />
                    </div>
                    <h3 className="text-xl font-bold text-[var(--text-primary)] mb-2">
                        Wishlist kamu kosong
                    </h3>
                    <p className="text-[var(--text-muted)] mb-8 max-w-sm mx-auto">
                        Simpan event yang kamu minati untuk ditemukan dengan mudah nanti.
                    </p>
                    <Link href="/events" className="btn-primary inline-flex">
                        <Sparkles className="h-4 w-4" />
                        Jelajahi Event
                        <ExternalLink className="h-4 w-4" />
                    </Link>
                </div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {wishlists.map((item, index) => (
                        <div
                            key={item.id}
                            className="card card-hover overflow-hidden group animate-fade-in-up"
                            style={{ animationDelay: `${index * 50}ms` }}
                        >
                            <div className="relative aspect-[16/10]">
                                <Image
                                    src={item.event.posterImage || "/placeholder.jpg"}
                                    alt={item.event.title}
                                    fill
                                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />

                                {item.event.status !== "PUBLISHED" && (
                                    <div className="absolute top-3 left-3">
                                        <span className="inline-flex px-2.5 py-1 bg-[var(--error)] text-white rounded-lg text-xs font-bold">
                                            {item.event.status === "ENDED" ? "Berakhir" : "Tidak Tersedia"}
                                        </span>
                                    </div>
                                )}

                                <button
                                    type="button"
                                    onClick={() => handleRemove(item.event.id)}
                                    disabled={removingId === item.event.id}
                                    className="absolute top-3 right-3 p-2.5 bg-white/90 dark:bg-black/50 backdrop-blur-sm rounded-xl text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-900/30 transition-colors disabled:opacity-50 shadow-lg"
                                    title="Hapus dari wishlist"
                                >
                                    {removingId === item.event.id ? (
                                        <Loader2 className="h-5 w-5 animate-spin" />
                                    ) : (
                                        <Heart className="h-5 w-5 fill-current" />
                                    )}
                                </button>

                                <div className="absolute bottom-3 left-3 right-3">
                                    {item.event.price && (
                                        <div className="text-white font-bold text-lg drop-shadow-lg">
                                            {item.event.price.isFree ? (
                                                <span className="text-emerald-400">GRATIS</span>
                                            ) : (
                                                <span>
                                                    Mulai {formatCurrency(item.event.price.startingFrom)}
                                                </span>
                                            )}
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div className="p-4">
                                {item.event.category && (
                                    <div className="flex items-center gap-1 text-xs text-[var(--accent-primary)] font-semibold mb-2">
                                        <Tag className="h-3 w-3" />
                                        {item.event.category}
                                    </div>
                                )}

                                <h3 className="font-bold text-[var(--text-primary)] mb-2 line-clamp-2 group-hover:text-[var(--accent-primary)] transition-colors">
                                    <Link href={`/events/${item.event.slug}`}>
                                        {item.event.title}
                                    </Link>
                                </h3>

                                <div className="space-y-1.5 text-sm text-[var(--text-muted)]">
                                    {item.event.schedule && (
                                        <div className="flex items-center gap-2">
                                            <Calendar className="h-4 w-4 flex-shrink-0 text-[var(--accent-primary)]" />
                                            <span>
                                                {formatDate(item.event.schedule.date)}
                                                <span className="mx-1 text-[var(--border)]">•</span>
                                                {formatTime(item.event.schedule.time)}
                                            </span>
                                        </div>
                                    )}

                                    {item.event.venue && (
                                        <div className="flex items-center gap-2">
                                            <MapPin className="h-4 w-4 flex-shrink-0" />
                                            <span className="truncate">
                                                {item.event.venue.name}, {item.event.venue.city}
                                            </span>
                                        </div>
                                    )}
                                </div>

                                <div className="mt-4 flex gap-2">
                                    <Link
                                        href={`/events/${item.event.slug}`}
                                        className="btn-primary flex-1 py-2.5 text-sm"
                                    >
                                        Lihat Event
                                    </Link>
                                    <button
                                        type="button"
                                        onClick={() => handleRemove(item.event.id)}
                                        disabled={removingId === item.event.id}
                                        className="btn-secondary py-2.5 px-3"
                                    >
                                        <Trash2 className="h-4 w-4" />
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
