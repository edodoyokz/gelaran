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
    Tag,
    Sparkles,
} from "lucide-react";
import {
    CustomerEmptyState,
    CustomerHero,
    CustomerStatusBadge,
    DashboardSection,
} from "@/components/customer/customer-dashboard-primitives";

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

const EVENT_STATUS_META: Record<string, { label: string; tone: "neutral" | "warning" | "danger" | "success" }> = {
    PUBLISHED: { label: "Tersedia", tone: "success" },
    DRAFT: { label: "Draft", tone: "warning" },
    ENDED: { label: "Berakhir", tone: "danger" },
    CANCELLED: { label: "Dibatalkan", tone: "danger" },
};

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
                setError(null);
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
                    <Loader2 className="h-12 w-12 text-(--accent-primary) animate-spin mx-auto mb-4" />
                    <p className="text-(--text-muted)">Memuat wishlist...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <CustomerEmptyState
                title="Wishlist belum bisa dimuat"
                description={`${error}. Coba lagi beberapa saat atau kembali ke dashboard untuk melanjutkan aktivitas.`}
                href="/dashboard"
                ctaLabel="Kembali ke dashboard"
                icon={AlertCircle}
            />
        );
    }

    return (
        <div className="space-y-6 lg:space-y-8">
            <CustomerHero
                eyebrow="Saved events"
                title="Wishlist saya"
                description="Simpan event yang menarik untuk ditinjau kembali, bandingkan jadwal, lalu lanjutkan ke proses booking saat kamu siap."
                meta={
                    <CustomerStatusBadge
                        label={`${wishlists.length} event tersimpan`}
                        tone="accent"
                        icon={Heart}
                    />
                }
                actions={
                    <Link
                        href="/events"
                        className="inline-flex items-center justify-center gap-2 rounded-full bg-(--accent-gradient) px-5 py-3 text-sm font-semibold text-white shadow-(--shadow-glow) transition-transform duration-200 hover:-translate-y-0.5"
                    >
                        <Sparkles className="h-4 w-4" />
                        Jelajahi Event
                    </Link>
                }
            />

            <DashboardSection
                title="Event tersimpan"
                description="Daftar event favoritmu dengan status, jadwal, lokasi, dan harga awal agar keputusan booking terasa lebih cepat dan terarah."
            >
                {wishlists.length === 0 ? (
                    <CustomerEmptyState
                        title="Wishlist kamu masih kosong"
                        description="Saat menemukan event menarik, simpan ke wishlist agar mudah dibandingkan dan dibuka kembali dari area customer."
                        href="/events"
                        ctaLabel="Temukan event"
                        icon={Heart}
                        className="border-none bg-transparent p-0 shadow-none"
                    />
                ) : (
                    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                        {wishlists.map((item) => {
                            const status = EVENT_STATUS_META[item.event.status] || {
                                label: item.event.status,
                                tone: "neutral" as const,
                            };

                            return (
                                <article
                                    key={item.id}
                                    className="group overflow-hidden rounded-[1.75rem] border border-(--border) bg-(--surface)/96 shadow-(--shadow-sm) transition-all duration-200 hover:-translate-y-0.5 hover:shadow-(--shadow-md)"
                                >
                                    <div className="relative aspect-16/10 overflow-hidden bg-(--surface-brand-soft)">
                                        <Image
                                            src={item.event.posterImage || "/placeholder.jpg"}
                                            alt={item.event.title}
                                            fill
                                            className="object-cover transition-transform duration-500 group-hover:scale-105"
                                            sizes="(max-width: 768px) 100vw, (max-width: 1280px) 50vw, 33vw"
                                        />
                                        <div className="absolute inset-0 bg-linear-to-t from-black/70 via-black/20 to-transparent" />
                                        <div className="absolute left-4 top-4 flex flex-wrap gap-2">
                                            <CustomerStatusBadge
                                                label={status.label}
                                                tone={status.tone}
                                                className="border-white/10 bg-black/40 text-white backdrop-blur"
                                            />
                                            {item.event.category ? (
                                                <span className="inline-flex items-center gap-1.5 rounded-full border border-white/15 bg-white/10 px-3 py-1 text-xs font-semibold text-white backdrop-blur">
                                                    <Tag className="h-3.5 w-3.5" />
                                                    {item.event.category}
                                                </span>
                                            ) : null}
                                        </div>
                                        <button
                                            type="button"
                                            onClick={() => handleRemove(item.event.id)}
                                            disabled={removingId === item.event.id}
                                            className="absolute right-4 top-4 inline-flex h-11 w-11 items-center justify-center rounded-2xl border border-white/15 bg-black/35 text-white backdrop-blur transition-colors hover:bg-black/55 disabled:cursor-not-allowed disabled:opacity-60"
                                            aria-label="Hapus dari wishlist"
                                        >
                                            {removingId === item.event.id ? (
                                                <Loader2 className="h-4 w-4 animate-spin" />
                                            ) : (
                                                <Trash2 className="h-4 w-4" />
                                            )}
                                        </button>
                                        <div className="absolute bottom-4 left-4 right-4 flex items-end justify-between gap-3 text-white">
                                            <div>
                                                <p className="text-xs font-medium uppercase tracking-[0.18em] text-white/80">
                                                    Tersimpan {formatDate(item.createdAt)}
                                                </p>
                                                <p className="mt-1 text-lg font-semibold">
                                                    {item.event.price
                                                        ? item.event.price.isFree
                                                            ? "Gratis"
                                                            : `Mulai ${formatCurrency(item.event.price.startingFrom)}`
                                                        : "Harga segera diumumkan"}
                                                </p>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="space-y-5 p-5">
                                        <div className="space-y-2">
                                            <h2 className="line-clamp-2 text-lg font-semibold text-foreground transition-colors group-hover:text-(--accent-primary)">
                                                {item.event.title}
                                            </h2>
                                            <div className="space-y-2 text-sm text-(--text-secondary)">
                                                {item.event.schedule ? (
                                                    <div className="flex items-center gap-2">
                                                        <Calendar className="h-4 w-4 text-(--accent-primary)" />
                                                        <span>
                                                            {formatDate(item.event.schedule.date)} • {formatTime(item.event.schedule.time)}
                                                        </span>
                                                    </div>
                                                ) : null}
                                                {item.event.venue ? (
                                                    <div className="flex items-center gap-2">
                                                        <MapPin className="h-4 w-4 text-(--text-muted)" />
                                                        <span className="truncate">
                                                            {item.event.venue.name}, {item.event.venue.city}
                                                        </span>
                                                    </div>
                                                ) : null}
                                            </div>
                                        </div>

                                        <div className="flex gap-3">
                                            <Link
                                                href={`/events/${item.event.slug}`}
                                                className="inline-flex flex-1 items-center justify-center gap-2 rounded-full bg-(--accent-gradient) px-4 py-3 text-sm font-semibold text-white shadow-(--shadow-glow) transition-transform duration-200 hover:-translate-y-0.5"
                                            >
                                                Lihat event
                                            </Link>
                                            <button
                                                type="button"
                                                onClick={() => handleRemove(item.event.id)}
                                                disabled={removingId === item.event.id}
                                                className="inline-flex items-center justify-center rounded-full border border-(--border) bg-(--surface-elevated) px-4 py-3 text-sm font-semibold text-(--text-secondary) transition-colors hover:bg-(--surface-hover) disabled:cursor-not-allowed disabled:opacity-60"
                                            >
                                                {removingId === item.event.id ? (
                                                    <Loader2 className="h-4 w-4 animate-spin" />
                                                ) : (
                                                    <Trash2 className="h-4 w-4" />
                                                )}
                                            </button>
                                        </div>
                                    </div>
                                </article>
                            );
                        })}
                    </div>
                )}
            </DashboardSection>
        </div>
    );
}
