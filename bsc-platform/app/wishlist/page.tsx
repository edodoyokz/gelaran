"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
    ArrowLeft,
    Heart,
    Calendar,
    MapPin,
    Loader2,
    AlertCircle,
    Trash2,
    ExternalLink,
    Tag,
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
                setError(data.error?.message || "Failed to load wishlist");
                return;
            }

            if (data.success) {
                setWishlists(data.data.wishlists);
            }
        } catch {
            setError("Failed to load wishlist");
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
                alert(data.error?.message || "Failed to remove from wishlist");
                return;
            }

            setWishlists((prev) => prev.filter((w) => w.event.id !== eventId));
        } catch {
            alert("Failed to remove from wishlist");
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
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <Loader2 className="h-12 w-12 text-indigo-600 animate-spin mx-auto mb-4" />
                    <p className="text-gray-500">Loading wishlist...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
                    <p className="text-gray-900 font-medium mb-2">{error}</p>
                    <Link href="/" className="text-indigo-600 hover:text-indigo-500">
                        Back to Home
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50">
            <header className="bg-white border-b sticky top-0 z-10">
                <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
                    <div className="flex items-center gap-4">
                        <Link href="/" className="text-gray-500 hover:text-gray-700">
                            <ArrowLeft className="h-5 w-5" />
                        </Link>
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900">My Wishlist</h1>
                            <p className="text-sm text-gray-500">
                                {wishlists.length} saved event{wishlists.length !== 1 ? "s" : ""}
                            </p>
                        </div>
                    </div>
                </div>
            </header>

            <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {wishlists.length === 0 ? (
                    <div className="bg-white rounded-xl shadow-sm p-12 text-center">
                        <Heart className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                        <h3 className="text-lg font-medium text-gray-900 mb-2">
                            Your wishlist is empty
                        </h3>
                        <p className="text-gray-500 mb-6">
                            Save events you&apos;re interested in to find them easily later.
                        </p>
                        <Link
                            href="/events"
                            className="inline-flex items-center gap-2 px-6 py-3 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 transition-colors"
                        >
                            Browse Events
                            <ExternalLink className="h-4 w-4" />
                        </Link>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {wishlists.map((item) => (
                            <div
                                key={item.id}
                                className="bg-white rounded-xl shadow-sm overflow-hidden hover:shadow-md transition-shadow group"
                            >
                                <div className="relative aspect-[16/9]">
                                    <img
                                        src={item.event.posterImage || "/placeholder.jpg"}
                                        alt={item.event.title}
                                        className="w-full h-full object-cover"
                                    />
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />

                                    {item.event.status !== "PUBLISHED" && (
                                        <div className="absolute top-3 left-3">
                                            <span className="inline-flex px-2 py-1 bg-red-500 text-white rounded text-xs font-medium">
                                                {item.event.status === "ENDED" ? "Ended" : "Unavailable"}
                                            </span>
                                        </div>
                                    )}

                                    <button
                                        type="button"
                                        onClick={() => handleRemove(item.event.id)}
                                        disabled={removingId === item.event.id}
                                        className="absolute top-3 right-3 p-2 bg-white/90 backdrop-blur-sm rounded-full text-red-500 hover:bg-red-50 transition-colors disabled:opacity-50"
                                        title="Remove from wishlist"
                                    >
                                        {removingId === item.event.id ? (
                                            <Loader2 className="h-5 w-5 animate-spin" />
                                        ) : (
                                            <Heart className="h-5 w-5 fill-current" />
                                        )}
                                    </button>

                                    <div className="absolute bottom-3 left-3 right-3">
                                        {item.event.price && (
                                            <div className="text-white font-bold">
                                                {item.event.price.isFree ? (
                                                    <span className="text-green-400">FREE</span>
                                                ) : (
                                                    <span>
                                                        From {formatCurrency(item.event.price.startingFrom)}
                                                    </span>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                </div>

                                <div className="p-4">
                                    {item.event.category && (
                                        <div className="flex items-center gap-1 text-xs text-indigo-600 font-medium mb-2">
                                            <Tag className="h-3 w-3" />
                                            {item.event.category}
                                        </div>
                                    )}

                                    <h3 className="font-bold text-gray-900 mb-2 line-clamp-2 group-hover:text-indigo-600 transition-colors">
                                        <Link href={`/events/${item.event.slug}`}>
                                            {item.event.title}
                                        </Link>
                                    </h3>

                                    <div className="space-y-2 text-sm text-gray-500">
                                        {item.event.schedule && (
                                            <div className="flex items-center gap-2">
                                                <Calendar className="h-4 w-4 flex-shrink-0" />
                                                <span>
                                                    {formatDate(item.event.schedule.date)}
                                                    <span className="mx-1">•</span>
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
                                            className="flex-1 text-center px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 transition-colors"
                                        >
                                            View Event
                                        </Link>
                                        <button
                                            type="button"
                                            onClick={() => handleRemove(item.event.id)}
                                            disabled={removingId === item.event.id}
                                            className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors disabled:opacity-50"
                                        >
                                            <Trash2 className="h-4 w-4" />
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
