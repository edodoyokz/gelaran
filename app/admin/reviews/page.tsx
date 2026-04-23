"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import Image from "next/image";
import {
    Search,
    CheckCircle,
    XCircle,
    EyeOff,
    Loader2,
    AlertTriangle,
    Star,
    Trash2,
    MessageSquare,
} from "lucide-react";
import { formatDate } from "@/lib/utils";
import {
    AdminDataTable,
    AdminFilterBar,
    AdminMetricCard,
    AdminNotice,
    AdminStatusBadge,
    AdminWorkspacePage,
} from "@/components/admin/admin-workspace";
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

const STATUS_TONE_MAP: Record<string, "success" | "warning" | "danger" | "default"> = {
    PENDING: "warning",
    PUBLISHED: "success",
    HIDDEN: "default",
    REJECTED: "danger",
};

const STATUS_LABEL_MAP: Record<string, string> = {
    PENDING: "Menunggu Review",
    PUBLISHED: "Diterbitkan",
    HIDDEN: "Disembunyikan",
    REJECTED: "Ditolak",
};

export default function AdminReviewsPage() {
    const [reviews, setReviews] = useState<Review[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [search, setSearch] = useState("");
    const [statusFilter, setStatusFilter] = useState("");
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(0);
    const [total, setTotal] = useState(0);
    const { showToast } = useToast();
    const { confirm } = useConfirm();

    const fetchReviews = useCallback(async () => {
        try {
            setIsLoading(true);
            setError(null);

            const searchParams = new URLSearchParams({
                page: page.toString(),
                limit: "20",
                ...(search && { search }),
                ...(statusFilter && { status: statusFilter }),
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
    }, [page, search, statusFilter]);

    useEffect(() => {
        fetchReviews();
    }, [page, search, statusFilter, fetchReviews]);

    const handleStatusChange = async (
        reviewId: string,
        newStatus: "PENDING" | "PUBLISHED" | "HIDDEN" | "REJECTED"
    ) => {
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
        if (
            !(await confirm("Apakah Anda yakin ingin menghapus ulasan ini?", {
                title: "Hapus Ulasan",
                description: "Tindakan ini tidak dapat dibatalkan.",
                confirmText: "Hapus",
                cancelText: "Batal",
                variant: "danger",
            }))
        )
            return;

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

    const renderStars = (rating: number) =>
        [1, 2, 3, 4, 5].map((star) => (
            <Star
                key={star}
                className={`h-3.5 w-3.5 ${star <= rating ? "fill-yellow-400 text-yellow-400" : "text-(--border)"}`}
            />
        ));

    const pendingCount = reviews.filter((r) => r.status === "PENDING").length;
    const publishedCount = reviews.filter((r) => r.status === "PUBLISHED").length;

    if (isLoading && reviews.length === 0) {
        return (
            <div className="flex min-h-[60vh] items-center justify-center">
                <Loader2 className="h-10 w-10 animate-spin text-(--accent-primary)" />
            </div>
        );
    }

    if (error && reviews.length === 0) {
        return (
            <AdminWorkspacePage eyebrow="Admin reviews" title="Review moderation" description="Moderate user reviews across all events on the platform.">
                <AdminNotice tone="warning" title="Review data is unavailable" description={error} actionHref="/admin" actionLabel="Back to dashboard" />
            </AdminWorkspacePage>
        );
    }

    return (
        <AdminWorkspacePage
            eyebrow="Admin reviews"
            title="Review moderation"
            description="Moderate user reviews across all events to ensure quality and safety standards."
        >
            <section className="grid gap-4 md:grid-cols-3">
                <AdminMetricCard label="Total reviews" value={total.toLocaleString("en-US")} icon={MessageSquare} meta="Across all statuses" />
                <AdminMetricCard label="Pending review" value={pendingCount.toString()} icon={AlertTriangle} tone="warning" meta="Awaiting moderation" />
                <AdminMetricCard label="Published" value={publishedCount.toString()} icon={CheckCircle} tone="success" meta="Live on platform" />
            </section>

            <AdminFilterBar>
                <label className="relative block min-w-[16rem] flex-1">
                    <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-(--text-muted)" />
                    <input
                        type="search"
                        value={search}
                        onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                        placeholder="Search by user, email, or event"
                        className="w-full rounded-2xl border border-(--border) bg-(--surface-elevated) py-3 pl-11 pr-4 text-sm text-foreground outline-none"
                    />
                </label>
                <select
                    value={statusFilter}
                    onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
                    className="rounded-2xl border border-(--border) bg-(--surface-elevated) px-4 py-3 text-sm"
                >
                    <option value="">All statuses</option>
                    <option value="PENDING">Menunggu Review</option>
                    <option value="PUBLISHED">Diterbitkan</option>
                    <option value="HIDDEN">Disembunyikan</option>
                    <option value="REJECTED">Ditolak</option>
                </select>
            </AdminFilterBar>

            <AdminDataTable
                columns={["User", "Event", "Booking", "Rating", "Review", "Status", "Date", "Actions"]}
                hasRows={reviews.length > 0}
                emptyTitle="No reviews match the current filters"
                emptyDescription="Try adjusting the status filter or search term."
            >
                {reviews.map((review) => (
                    <tr key={review.id} className="transition-colors hover:bg-(--surface-elevated)">
                        <td className="px-5 py-4 align-top">
                            <div className="flex items-center gap-3">
                                {review.user.avatarUrl ? (
                                    <Image
                                        src={review.user.avatarUrl}
                                        alt={review.user.name}
                                        width={36}
                                        height={36}
                                        className="rounded-full object-cover shrink-0"
                                    />
                                ) : (
                                    <div className="w-9 h-9 rounded-full bg-(--accent-primary)/10 flex items-center justify-center shrink-0">
                                        <span className="font-semibold text-sm text-(--accent-primary)">
                                            {review.user.name.charAt(0)}
                                        </span>
                                    </div>
                                )}
                                <div>
                                    <p className="text-sm font-semibold text-foreground">{review.user.name}</p>
                                    <p className="text-xs text-(--text-muted)">{review.user.email}</p>
                                </div>
                            </div>
                        </td>
                        <td className="px-5 py-4 align-top">
                            <Link
                                href={`/events/${review.event.slug}`}
                                className="text-sm font-semibold text-(--accent-primary) hover:opacity-80"
                            >
                                {review.event.title}
                            </Link>
                        </td>
                        <td className="px-5 py-4 align-top">
                            <span className="font-mono text-xs text-(--text-secondary)">{review.booking.bookingCode}</span>
                        </td>
                        <td className="px-5 py-4 align-top">
                            <div className="flex gap-0.5">{renderStars(review.rating)}</div>
                        </td>
                        <td className="px-5 py-4 align-top max-w-xs">
                            <p className="text-sm text-(--text-secondary) line-clamp-2">
                                {review.reviewText || <span className="text-(--text-muted) italic">No text</span>}
                            </p>
                        </td>
                        <td className="px-5 py-4 align-top">
                            <AdminStatusBadge
                                label={STATUS_LABEL_MAP[review.status] || review.status}
                                tone={STATUS_TONE_MAP[review.status] ?? "default"}
                            />
                        </td>
                        <td className="px-5 py-4 align-top text-sm text-(--text-secondary)">
                            {formatDate(review.createdAt)}
                        </td>
                        <td className="px-5 py-4 align-top">
                            <div className="flex items-center gap-2">
                                {review.status === "PENDING" && (
                                    <select
                                        value={review.status}
                                        onChange={(e) =>
                                            handleStatusChange(
                                                review.id,
                                                e.target.value as "PENDING" | "PUBLISHED" | "HIDDEN" | "REJECTED"
                                            )
                                        }
                                        className="rounded-xl border border-(--border) bg-(--surface-elevated) px-2 py-1.5 text-sm outline-none"
                                    >
                                        <option value="PENDING">Menunggu</option>
                                        <option value="PUBLISHED">Diterbitkan</option>
                                        <option value="HIDDEN">Sembunyikan</option>
                                        <option value="REJECTED">Tolak</option>
                                    </select>
                                )}
                                <button
                                    onClick={() => handleDeleteReview(review.id)}
                                    className="p-2 text-red-600 hover:bg-red-500/10 rounded-lg transition-colors"
                                    title="Delete review"
                                >
                                    <Trash2 className="h-4 w-4" />
                                </button>
                            </div>
                        </td>
                    </tr>
                ))}
            </AdminDataTable>

            {total > 20 && (
                <div className="flex items-center justify-between">
                    <p className="text-sm text-(--text-muted)">
                        Showing {(page - 1) * 20 + 1}–{Math.min(page * 20, total)} of {total} reviews
                    </p>
                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => setPage((p) => Math.max(1, p - 1))}
                            disabled={page === 1}
                            className="rounded-full border border-(--border) px-4 py-2 text-sm font-semibold text-foreground hover:bg-(--surface-elevated) disabled:opacity-50"
                        >
                            Previous
                        </button>
                        <button
                            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                            disabled={page >= totalPages}
                            className="rounded-full bg-(--accent-gradient) px-4 py-2 text-sm font-semibold text-white disabled:opacity-50"
                        >
                            Next
                        </button>
                    </div>
                </div>
            )}
        </AdminWorkspacePage>
    );
}
