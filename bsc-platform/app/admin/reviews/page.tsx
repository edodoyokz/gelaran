"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
    ArrowLeft,
    Search,
    CheckCircle,
    XCircle,
    Eye,
    EyeOff,
    Loader2,
    AlertTriangle,
    Star,
    Trash2,
    ChevronDown,
    ChevronUp,
} from "lucide-react";
import { formatDate } from "@/lib/utils";
import { useToast } from "@/components/ui/toast-provider";
import { useConfirm } from "@/components/ui/confirm-provider";

interface Review {
    id: string;
    rating: number;
    reviewText: string | null;
    status: "PENDING" | "PUBLISHED" | "HIDDEN" | "REJECTED";
    createdAt: string;
    user: {
        id: string;
        name: string;
        email: string;
        avatarUrl: string | null;
    };
    event: {
        id: string;
        title: string;
        slug: string;
    };
    booking: {
        id: string;
        bookingCode: string;
    };
}

interface ReviewsResponse {
    reviews: Review[];
    pagination: {
        total: number;
        page: number;
        limit: number;
        totalPages: number;
    };
}

export default function AdminReviewsPage() {
    const [reviews, setReviews] = useState<Review[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [search, setSearch] = useState("");
    const [statusFilter, setStatusFilter] = useState("");
    const [eventIdFilter, setEventIdFilter] = useState("");
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(0);
    const [total, setTotal] = useState(0);
    const [selectedReview, setSelectedReview] = useState<Review | null>(null);
    const { showToast } = useToast();
    const { confirm } = useConfirm();

    const fetchReviews = async () => {
        try {
            setIsLoading(true);
            setError(null);

            const searchParams = new URLSearchParams({
                page: page.toString(),
                limit: "20",
                ...(search && { search }),
                ...(statusFilter && { status: statusFilter }),
                ...(eventIdFilter && { eventId: eventIdFilter }),
            });

            const res = await fetch(`/api/admin/reviews?${searchParams.toString()}`);
            const data = await res.json();

            if (!data.success) {
                throw new Error(data.error?.message || "Gagal memuat ulasan");
            }

            setReviews(data.data);
            setTotalPages(data.data.pagination.totalPages);
            setTotal(data.data.pagination.total);
        } catch (err) {
            const message = err instanceof Error ? err.message : "Terjadi kesalahan";
            setError(message);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchReviews();
    }, [page, search, statusFilter, eventIdFilter]);

    const handleStatusChange = async (reviewId: string, newStatus: "PENDING" | "PUBLISHED" | "HIDDEN" | "REJECTED") => {
        try {
            const res = await fetch(`/api/admin/reviews`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ reviewId, status: newStatus }),
            });

            const data = await res.json();

            if (!data.success) {
                throw new Error(data.error?.message || "Gagal memperbarui status");
            }

            await fetchReviews();
            showToast("Status ulasan berhasil diperbarui", "success");
        } catch (err) {
            showToast(err instanceof Error ? err.message : "Terjadi kesalahan", "error");
        }
    };

    const handleDeleteReview = async (reviewId: string) => {
        if (!await confirm("Apakah Anda yakin ingin menghapus ulasan ini?", {
            title: "Hapus Ulasan",
            description: "Tindakan ini tidak dapat dibatalkan.",
            confirmText: "Hapus",
            cancelText: "Batal",
            variant: "danger"
        })) return;

        try {
            const res = await fetch(`/api/admin/reviews?reviewId=${reviewId}`, {
                method: "DELETE",
            });

            const data = await res.json();

            if (!data.success) {
                throw new Error(data.error?.message || "Gagal menghapus ulasan");
            }

            await fetchReviews();
            showToast("Ulasan berhasil dihapus", "success");
        } catch (err) {
            showToast(err instanceof Error ? err.message : "Terjadi kesalahan", "error");
        }
    };

    const getStatusBadge = (status: string) => {
        switch (status) {
            case "PENDING":
                return (
                    <span className="inline-flex items-center gap-1 px-2 py-1 bg-amber-100 text-amber-700 text-xs font-bold rounded-full">
                        <AlertTriangle className="h-3 w-3" />
                        Menunggu Review
                    </span>
                );
            case "PUBLISHED":
                return (
                    <span className="inline-flex items-center gap-1 px-2 py-1 bg-green-100 text-green-700 text-xs font-bold rounded-full">
                        <CheckCircle className="h-3 w-3" />
                        Diterbitkan
                    </span>
                );
            case "HIDDEN":
                return (
                    <span className="inline-flex items-center gap-1 px-2 py-1 bg-gray-100 text-gray-700 text-xs font-bold rounded-full">
                        <EyeOff className="h-3 w-3" />
                        Disembunyikan
                    </span>
                );
            case "REJECTED":
                return (
                    <span className="inline-flex items-center gap-1 px-2 py-1 bg-red-100 text-red-700 text-xs font-bold rounded-full">
                        <XCircle className="h-3 w-3" />
                        Ditolak
                    </span>
                );
            default:
                return (
                    <span className="inline-flex items-center gap-1 px-2 py-1 bg-gray-100 text-gray-700 text-xs font-bold rounded-full">
                        {status}
                    </span>
                );
        }
    };

    const renderStars = (rating: number) => {
        return [1, 2, 3, 4, 5].map((star) => (
            <Star
                key={star}
                className={`h-4 w-4 ${star <= rating ? "fill-yellow-400 text-yellow-400" : "text-gray-300"}`}
            />
        ));
    };

    return (
        <>
            <div className="max-w-7xl mx-auto px-4 py-6">
                <div className="mb-6">
                    <Link
                        href="/admin"
                        className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
                    >
                        <ArrowLeft className="h-4 w-4" />
                        <span>Kembali ke Dashboard Admin</span>
                    </Link>
                </div>

                <div className="mb-6 flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900 mb-2">Manajemen Ulasan</h1>
                        <p className="text-gray-600">Moderasi ulasan event dari pengguna.</p>
                    </div>

                    <div className="flex items-center gap-2">
                        <Link
                            href="/admin/analytics"
                            className="px-4 py-2 bg-white rounded-lg border border-gray-200 hover:bg-gray-50 flex items-center gap-2 transition-colors"
                        >
                            Lihat Statistik
                        </Link>
                    </div>
                </div>

                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 mb-6 flex gap-4">
                    <div className="flex-1 relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Cari ulasan berdasarkan nama pengguna, email, atau judul event..."
                            value={search}
                            onChange={(e) => {
                                setSearch(e.target.value);
                                setPage(1);
                            }}
                            className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                        />
                    </div>

                    <select
                        value={statusFilter}
                        onChange={(e) => {
                            setStatusFilter(e.target.value);
                            setPage(1);
                        }}
                        className="px-4 py-2 border rounded-lg bg-white focus:ring-2 focus:ring-indigo-500"
                    >
                        <option value="">Semua Status</option>
                        <option value="PENDING">Menunggu Review</option>
                        <option value="PUBLISHED">Diterbitkan</option>
                        <option value="HIDDEN">Disembunyikan</option>
                        <option value="REJECTED">Ditolak</option>
                    </select>

                    <input
                        type="text"
                        placeholder="Filter by Event ID..."
                        value={eventIdFilter}
                        onChange={(e) => {
                            setEventIdFilter(e.target.value);
                            setPage(1);
                        }}
                        className="px-4 py-2 border rounded-lg w-48 focus:ring-2 focus:ring-indigo-500"
                    />
                </div>

                <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                    {isLoading ? (
                        <div className="p-12 flex items-center justify-center">
                            <Loader2 className="h-8 w-8 text-indigo-600 animate-spin" />
                        </div>
                    ) : error ? (
                        <div className="p-12 text-center text-red-600">
                            {error}
                        </div>
                    ) : reviews.length === 0 ? (
                        <div className="p-12 text-center text-gray-500">
                            Tidak ada ulasan ditemukan.
                        </div>
                    ) : (
                        <>
                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead className="bg-gray-50 border-b border-gray-200">
                                        <tr>
                                            <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                                                Pengguna
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                                                Event
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                                                Booking
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                                                Rating
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                                                Ulasan
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                                                Status
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                                                Tanggal
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-200">
                                        {reviews.map((review) => (
                                            <tr key={review.id} className="hover:bg-gray-50 transition-colors">
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center gap-3">
                                                        {review.user.avatarUrl ? (
                                                            <img
                                                                src={review.user.avatarUrl}
                                                                alt={review.user.name}
                                                                className="w-10 h-10 rounded-full object-cover"
                                                            />
                                                        ) : (
                                                            <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center">
                                                                <span className="font-semibold text-indigo-600">
                                                                    {review.user.name.charAt(0)}
                                                                </span>
                                                            </div>
                                                        )}
                                                        <div>
                                                            <p className="font-medium text-gray-900">{review.user.name}</p>
                                                            <p className="text-xs text-gray-500">{review.user.email}</p>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <Link
                                                        href={`/events/${review.event.slug}`}
                                                        className="text-indigo-600 hover:text-indigo-700 hover:underline font-medium"
                                                    >
                                                        {review.event.title}
                                                    </Link>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <span className="font-mono text-sm text-gray-700">
                                                        {review.booking.bookingCode}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="flex gap-0.5">
                                                        {renderStars(review.rating)}
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 max-w-xs">
                                                    <p className="text-sm text-gray-700 line-clamp-2">
                                                        {review.reviewText || "-"}
                                                    </p>
                                                </td>
                                                <td className="px-6 py-4">
                                                    {getStatusBadge(review.status)}
                                                </td>
                                                <td className="px-6 py-4 text-sm text-gray-600">
                                                    {formatDate(review.createdAt)}
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center gap-2">
                                                        {review.status === "PENDING" && (
                                                            <select
                                                                value={review.status}
                                                                onChange={(e) => handleStatusChange(review.id, e.target.value as "PENDING" | "PUBLISHED" | "HIDDEN" | "REJECTED")}
                                                                className="px-2 py-1 border rounded-lg bg-white text-sm focus:ring-2 focus:ring-indigo-500"
                                                            >
                                                                <option value="PENDING">Menunggu</option>
                                                                <option value="PUBLISHED">Diterbitkan</option>
                                                                <option value="HIDDEN">Disembunyikan</option>
                                                                <option value="REJECTED">Ditolak</option>
                                                            </select>
                                                        )}
                                                        <button
                                                                onClick={() => handleDeleteReview(review.id)}
                                                                className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                                                title="Hapus ulasan"
                                                        >
                                                            <Trash2 className="h-4 w-4" />
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>

                            <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between">
                                <p className="text-sm text-gray-500">
                                    Menampilkan {(page - 1) * 20 + 1} - {Math.min(page * 20, total)} dari {total} ulasan
                                </p>
                                <div className="flex items-center gap-2">
                                    <button
                                        onClick={() => setPage((p) => Math.max(1, p - 1))}
                                        disabled={page === 1}
                                        className="px-4 py-2 border rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                    >
                                        Sebelumnya
                                    </button>
                                    <button
                                        onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                                        disabled={page >= totalPages}
                                        className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                    >
                                        Selanjutnya
                                    </button>
                                </div>
                            </div>
                        </>
                    )}
                </div>
            </div>
        </>
    );
}
