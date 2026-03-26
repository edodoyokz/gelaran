"use client";

import { useState, useEffect, useCallback } from "react";
import { Star, ChevronDown, User, Loader2, MessageSquare } from "lucide-react";
import { ReviewForm } from "./ReviewForm";

interface Review {
    id: string;
    rating: number;
    reviewText: string | null;
    createdAt: string;
    user: {
        id: string;
        name: string;
        avatarUrl: string | null;
    };
}

interface ReviewStats {
    averageRating: number;
    totalReviews: number;
    distribution: {
        1: number;
        2: number;
        3: number;
        4: number;
        5: number;
    };
}

interface ReviewSectionProps {
    eventId: string;
    eventSlug: string;
    canReview?: boolean;
    bookingId?: string;
}

export function ReviewSection({ eventId, eventSlug, canReview = false, bookingId }: ReviewSectionProps) {
    const [reviews, setReviews] = useState<Review[]>([]);
    const [stats, setStats] = useState<ReviewStats | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(false);
    const [isLoadingMore, setIsLoadingMore] = useState(false);
    const [showForm, setShowForm] = useState(false);
    const [userHasReviewed, setUserHasReviewed] = useState(false);

    const fetchReviews = useCallback(async (pageNum: number, append = false) => {
        try {
            if (pageNum === 1) setIsLoading(true);
            else setIsLoadingMore(true);

            const res = await fetch(`/api/events/${eventSlug}/reviews?page=${pageNum}&limit=10`);
            const data = await res.json();

            if (data.success) {
                if (append) {
                    setReviews((prev) => [...prev, ...data.data.reviews]);
                } else {
                    setReviews(data.data.reviews);
                    setStats(data.data.stats);
                    setUserHasReviewed(data.data.userHasReviewed || false);
                }
                setHasMore(data.data.pagination?.hasMore || false);
            }
        } catch (err) {
            console.error("Failed to fetch reviews:", err);
        } finally {
            setIsLoading(false);
            setIsLoadingMore(false);
        }
    }, [eventSlug]);

    useEffect(() => {
        fetchReviews(1);
    }, [fetchReviews]);

    const handleLoadMore = () => {
        const nextPage = page + 1;
        setPage(nextPage);
        fetchReviews(nextPage, true);
    };

    const handleReviewSuccess = () => {
        setShowForm(false);
        setUserHasReviewed(true);
        fetchReviews(1);
    };

    const formatDate = (dateStr: string) => {
        return new Date(dateStr).toLocaleDateString("id-ID", {
            day: "numeric",
            month: "long",
            year: "numeric",
        });
    };

    const RatingBar = ({ rating, count, total }: { rating: number; count: number; total: number }) => {
        const percentage = total > 0 ? (count / total) * 100 : 0;
        return (
            <div className="flex items-center gap-2">
                <span className="text-sm text-gray-600 w-4">{rating}</span>
                <Star className="h-4 w-4 text-yellow-400 fill-yellow-400" />
                <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div
                        className="h-full bg-yellow-400 rounded-full transition-all duration-500"
                        style={{ width: `${percentage}%` }}
                    />
                </div>
                <span className="text-sm text-gray-500 w-8 text-right">{count}</span>
            </div>
        );
    };

    if (isLoading) {
        return (
            <div className="bg-white rounded-xl border border-gray-200 p-8">
                <div className="flex items-center justify-center gap-3 text-gray-500">
                    <Loader2 className="h-5 w-5 animate-spin" />
                    <span>Memuat review...</span>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="bg-white rounded-xl border border-gray-200 p-6">
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl font-bold text-gray-900">Ulasan</h2>
                    {canReview && !userHasReviewed && bookingId && !showForm && (
                        <button
                            type="button"
                            onClick={() => setShowForm(true)}
                            className="px-4 py-2 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 transition-colors flex items-center gap-2"
                        >
                            <MessageSquare className="h-4 w-4" />
                            Tulis Review
                        </button>
                    )}
                </div>

                {stats && stats.totalReviews > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="flex items-center gap-6">
                            <div className="text-center">
                                <div className="text-5xl font-bold text-gray-900">
                                    {stats.averageRating.toFixed(1)}
                                </div>
                                <div className="flex items-center justify-center gap-1 mt-2">
                                    {[1, 2, 3, 4, 5].map((star) => (
                                        <Star
                                            key={star}
                                            className={`h-5 w-5 ${
                                                star <= Math.round(stats.averageRating)
                                                    ? "text-yellow-400 fill-yellow-400"
                                                    : "text-gray-300"
                                            }`}
                                        />
                                    ))}
                                </div>
                                <p className="text-sm text-gray-500 mt-1">
                                    {stats.totalReviews} ulasan
                                </p>
                            </div>
                        </div>

                        <div className="space-y-2">
                            {[5, 4, 3, 2, 1].map((rating) => (
                                <RatingBar
                                    key={rating}
                                    rating={rating}
                                    count={stats.distribution[rating as keyof typeof stats.distribution]}
                                    total={stats.totalReviews}
                                />
                            ))}
                        </div>
                    </div>
                ) : (
                    <div className="text-center py-8">
                        <MessageSquare className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                        <p className="text-gray-500">Belum ada ulasan untuk event ini</p>
                    </div>
                )}
            </div>

            {showForm && bookingId && (
                <ReviewForm
                    eventId={eventId}
                    bookingId={bookingId}
                    onSuccess={handleReviewSuccess}
                    onCancel={() => setShowForm(false)}
                />
            )}

            {reviews.length > 0 && (
                <div className="space-y-4">
                    {reviews.map((review) => (
                        <div key={review.id} className="bg-white rounded-xl border border-gray-200 p-6">
                            <div className="flex items-start gap-4">
                                <div className="shrink-0">
                                    {review.user.avatarUrl ? (
                                        <img
                                            src={review.user.avatarUrl}
                                            alt={review.user.name}
                                            className="w-12 h-12 rounded-full object-cover"
                                        />
                                    ) : (
                                        <div className="w-12 h-12 rounded-full bg-indigo-100 flex items-center justify-center">
                                            <User className="h-6 w-6 text-indigo-600" />
                                        </div>
                                    )}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-start justify-between gap-4">
                                        <div>
                                            <h4 className="font-semibold text-gray-900">{review.user.name}</h4>
                                            <div className="flex items-center gap-2 mt-1">
                                                <div className="flex items-center">
                                                    {[1, 2, 3, 4, 5].map((star) => (
                                                        <Star
                                                            key={star}
                                                            className={`h-4 w-4 ${
                                                                star <= review.rating
                                                                    ? "text-yellow-400 fill-yellow-400"
                                                                    : "text-gray-300"
                                                            }`}
                                                        />
                                                    ))}
                                                </div>
                                                <span className="text-sm text-gray-500">
                                                    {formatDate(review.createdAt)}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                    {review.reviewText && (
                                        <p className="mt-3 text-gray-700 leading-relaxed">
                                            {review.reviewText}
                                        </p>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))}

                    {hasMore && (
                        <div className="text-center">
                            <button
                                type="button"
                                onClick={handleLoadMore}
                                disabled={isLoadingMore}
                                className="px-6 py-3 border border-gray-200 rounded-lg font-medium text-gray-700 hover:bg-gray-50 transition-colors disabled:opacity-50 flex items-center gap-2 mx-auto"
                            >
                                {isLoadingMore ? (
                                    <>
                                        <Loader2 className="h-4 w-4 animate-spin" />
                                        Memuat...
                                    </>
                                ) : (
                                    <>
                                        <ChevronDown className="h-4 w-4" />
                                        Lihat Lebih Banyak
                                    </>
                                )}
                            </button>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
