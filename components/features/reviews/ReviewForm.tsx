"use client";

import { useState } from "react";
import { Star, Send, Loader2 } from "lucide-react";

interface ReviewFormProps {
    eventId: string;
    bookingId: string;
    onSuccess?: () => void;
    onCancel?: () => void;
}

export function ReviewForm({ eventId, bookingId, onSuccess, onCancel }: ReviewFormProps) {
    const [rating, setRating] = useState(0);
    const [hoverRating, setHoverRating] = useState(0);
    const [reviewText, setReviewText] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        if (rating === 0) {
            setError("Silakan pilih rating");
            return;
        }

        setIsSubmitting(true);
        setError(null);

        try {
            const res = await fetch("/api/reviews", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    eventId,
                    bookingId,
                    rating,
                    reviewText: reviewText.trim() || null,
                }),
            });

            const data = await res.json();

            if (!data.success) {
                throw new Error(data.error?.message || "Gagal mengirim review");
            }

            setRating(0);
            setReviewText("");
            onSuccess?.();
        } catch (err) {
            const message = err instanceof Error ? err.message : "Terjadi kesalahan";
            setError(message);
        } finally {
            setIsSubmitting(false);
        }
    };

    const ratingLabels = ["", "Sangat Buruk", "Buruk", "Cukup", "Bagus", "Sangat Bagus"];

    return (
        <form onSubmit={handleSubmit} className="bg-white rounded-xl border border-gray-200 p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Tulis Review</h3>
            
            <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-3">
                    Rating *
                </label>
                <div className="flex items-center gap-2">
                    {[1, 2, 3, 4, 5].map((star) => (
                        <button
                            key={star}
                            type="button"
                            onClick={() => setRating(star)}
                            onMouseEnter={() => setHoverRating(star)}
                            onMouseLeave={() => setHoverRating(0)}
                            className="p-1 transition-transform hover:scale-110 focus:outline-none"
                        >
                            <Star
                                className={`h-8 w-8 transition-colors ${
                                    star <= (hoverRating || rating)
                                        ? "text-yellow-400 fill-yellow-400"
                                        : "text-gray-300"
                                }`}
                            />
                        </button>
                    ))}
                    {(hoverRating || rating) > 0 && (
                        <span className="ml-2 text-sm text-gray-600">
                            {ratingLabels[hoverRating || rating]}
                        </span>
                    )}
                </div>
            </div>

            <div className="mb-6">
                <label htmlFor="reviewText" className="block text-sm font-medium text-gray-700 mb-2">
                    Ulasan (opsional)
                </label>
                <textarea
                    id="reviewText"
                    value={reviewText}
                    onChange={(e) => setReviewText(e.target.value)}
                    placeholder="Bagikan pengalaman Anda menghadiri event ini..."
                    rows={4}
                    maxLength={1000}
                    className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-none transition-shadow"
                />
                <p className="text-xs text-gray-500 mt-1 text-right">
                    {reviewText.length}/1000 karakter
                </p>
            </div>

            {error && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
                    {error}
                </div>
            )}

            <div className="flex gap-3">
                {onCancel && (
                    <button
                        type="button"
                        onClick={onCancel}
                        disabled={isSubmitting}
                        className="flex-1 px-4 py-3 border border-gray-200 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors disabled:opacity-50"
                    >
                        Batal
                    </button>
                )}
                <button
                    type="submit"
                    disabled={isSubmitting || rating === 0}
                    className="flex-1 px-4 py-3 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                    {isSubmitting ? (
                        <>
                            <Loader2 className="h-5 w-5 animate-spin" />
                            Mengirim...
                        </>
                    ) : (
                        <>
                            <Send className="h-5 w-5" />
                            Kirim Review
                        </>
                    )}
                </button>
            </div>
        </form>
    );
}
