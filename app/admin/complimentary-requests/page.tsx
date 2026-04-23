"use client";

import { useCallback, useEffect, useState } from "react";
import { Loader2, CheckCircle2, XCircle, Gift, Calendar, ClipboardList } from "lucide-react";
import { formatDate } from "@/lib/utils";
import {
    AdminMetricCard,
    AdminNotice,
    AdminStatusBadge,
    AdminWorkspacePage,
} from "@/components/admin/admin-workspace";
import { useToast } from "@/components/ui/toast-provider";

type RequestStatus = "PENDING" | "APPROVED" | "REJECTED";

interface ComplimentaryRequest {
    id: string;
    event: {
        id: string;
        title: string;
        organizer: {
            name: string;
            organizerProfile: {
                organizationName: string;
            } | null;
        };
    };
    requestedBy: {
        id: string;
        name: string;
        email: string;
    };
    guestName: string | null;
    guestEmail: string | null;
    requestedTotal: number;
    approvedTotal: number | null;
    status: RequestStatus;
    reviewedNote: string | null;
    createdAt: string;
    reviewedAt: string | null;
    reviewSummary?: {
        reviewedAt: string | null;
        reviewedNote: string | null;
        reviewedBy: {
            id: string;
            name: string | null;
            email: string | null;
        } | null;
    } | null;
    bookingSummary?: {
        id: string;
        bookingCode: string;
        status: string;
        createdAt: string;
    } | null;
    items: Array<{
        id: string;
        quantity: number;
        ticketType: {
            id: string;
            name: string;
            basePrice: number;
        };
    }>;
    bookings: Array<{
        id: string;
        bookingCode: string;
        status: string;
        createdAt: string;
    }>;
}

const STATUS_TONE_MAP: Record<RequestStatus, "success" | "warning" | "danger" | "default"> = {
    APPROVED: "success",
    PENDING: "warning",
    REJECTED: "danger",
};

export default function AdminComplimentaryRequestsPage() {
    const { showToast } = useToast();
    const [requests, setRequests] = useState<ComplimentaryRequest[]>([]);
    const [statusFilter, setStatusFilter] = useState<string>("");
    const [isLoading, setIsLoading] = useState(true);
    const [isActionLoading, setIsActionLoading] = useState<string | null>(null);

    const loadRequests = useCallback(async () => {
        try {
            setIsLoading(true);
            const params = new URLSearchParams();
            if (statusFilter) params.set("status", statusFilter);

            const res = await fetch(`/api/admin/complimentary-requests?${params.toString()}`);
            const data = await res.json();
            if (data.success) {
                setRequests(data.data);
            }
        } catch {
            setRequests([]);
        } finally {
            setIsLoading(false);
        }
    }, [statusFilter]);

    useEffect(() => {
        loadRequests();
    }, [loadRequests]);

    const reviewRequest = async (requestId: string, action: "APPROVE" | "REJECT") => {
        try {
            setIsActionLoading(requestId + action);
            const res = await fetch(`/api/admin/complimentary-requests/${requestId}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ action }),
            });
            const data = await res.json();
            if (!data.success) {
                if (res.status === 409) {
                    await loadRequests();
                }
                showToast(data.error?.message || "Gagal memproses request", "error");
                return;
            }
            showToast(action === "APPROVE" ? "Request approved" : "Request rejected", "success");
            await loadRequests();
        } catch {
            showToast("Terjadi kesalahan", "error");
        } finally {
            setIsActionLoading(null);
        }
    };

    const pendingCount = requests.filter((r) => r.status === "PENDING").length;
    const approvedCount = requests.filter((r) => r.status === "APPROVED").length;
    const rejectedCount = requests.filter((r) => r.status === "REJECTED").length;

    return (
        <AdminWorkspacePage
            eyebrow="Admin complimentary"
            title="Complimentary requests"
            description="Review and approve complimentary ticket requests from event organisers."
            actions={
                <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="rounded-2xl border border-(--border) bg-(--surface-elevated) px-4 py-2 text-sm text-foreground outline-none"
                >
                    <option value="">All statuses</option>
                    <option value="PENDING">Pending</option>
                    <option value="APPROVED">Approved</option>
                    <option value="REJECTED">Rejected</option>
                </select>
            }
        >
            <section className="grid gap-4 md:grid-cols-3">
                <AdminMetricCard label="Pending review" value={pendingCount.toString()} icon={ClipboardList} tone="accent" meta="Requires admin action" />
                <AdminMetricCard label="Approved" value={approvedCount.toString()} icon={CheckCircle2} tone="success" meta="Tickets granted" />
                <AdminMetricCard label="Rejected" value={rejectedCount.toString()} icon={XCircle} meta="Requests declined" />
            </section>

            {isLoading ? (
                <div className="flex items-center justify-center py-20">
                    <Loader2 className="h-8 w-8 animate-spin text-(--accent-primary)" />
                </div>
            ) : requests.length === 0 ? (
                <AdminNotice
                    title="No complimentary requests"
                    description={statusFilter ? `No requests with status "${statusFilter}" found.` : "No complimentary ticket requests have been submitted yet."}
                    actionHref="/admin"
                    actionLabel="Back to dashboard"
                />
            ) : (
                <div className="space-y-4">
                    {requests.map((request) => {
                        const reviewSummary = request.reviewSummary ?? {
                            reviewedAt: request.reviewedAt,
                            reviewedNote: request.reviewedNote,
                            reviewedBy: null,
                        };
                        const bookingSummary = request.bookingSummary ?? request.bookings?.[0] ?? null;
                        const isPendingReview = request.status === "PENDING";

                        return (
                        <div key={request.id} className="rounded-2xl border border-(--border) bg-(--surface) p-5">
                            <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                                <div className="flex-1">
                                    <div className="flex items-center gap-2 mb-2">
                                        <Gift className="h-4 w-4 text-pink-500 shrink-0" />
                                        <p className="font-semibold text-foreground">{request.event.title}</p>
                                    </div>
                                    <p className="text-sm text-(--text-secondary)">
                                        Organizer:{" "}
                                        <span className="font-medium">
                                            {request.event.organizer.organizerProfile?.organizationName ||
                                                request.event.organizer.name}
                                        </span>
                                    </p>
                                    <p className="text-sm text-(--text-secondary)">
                                        Requested by:{" "}
                                        <span className="font-medium">{request.requestedBy.name}</span>{" "}
                                        <span className="text-(--text-muted)">({request.requestedBy.email})</span>
                                    </p>
                                    {(request.guestName || request.guestEmail) && (
                                        <p className="text-sm text-(--text-secondary)">
                                            Guest: {request.guestName || "—"}{" "}
                                            {request.guestEmail && (
                                                <span className="text-(--text-muted)">({request.guestEmail})</span>
                                            )}
                                        </p>
                                    )}
                                    <p className="mt-1 text-sm text-(--text-secondary)">
                                        Tickets requested:{" "}
                                        <span className="font-semibold text-foreground">{request.requestedTotal}</span>
                                    </p>
                                    {request.status === "APPROVED" && bookingSummary && (
                                        <div className="mt-3 rounded-2xl border border-green-200 bg-green-500/5 px-4 py-3 text-sm">
                                            <p className="font-semibold text-green-700">
                                                Booking issued: {bookingSummary.bookingCode}
                                            </p>
                                            <p className="mt-1 text-(--text-secondary)">
                                                Booking status:{" "}
                                                <span className="font-medium text-foreground">{bookingSummary.status}</span>
                                            </p>
                                            <p className="text-(--text-muted)">
                                                Issued {formatDate(bookingSummary.createdAt)}
                                            </p>
                                        </div>
                                    )}
                                    {request.status === "REJECTED" && (
                                        <div className="mt-3 rounded-2xl border border-red-200 bg-red-500/5 px-4 py-3 text-sm">
                                            <p className="font-semibold text-red-700">Request rejected</p>
                                            {reviewSummary.reviewedNote && (
                                                <p className="mt-1 text-(--text-secondary)">
                                                    Outcome:{" "}
                                                    <span className="font-medium text-foreground">{reviewSummary.reviewedNote}</span>
                                                </p>
                                            )}
                                            {reviewSummary.reviewedAt && (
                                                <p className="text-(--text-muted)">
                                                    Reviewed {formatDate(reviewSummary.reviewedAt)}
                                                </p>
                                            )}
                                        </div>
                                    )}
                                    {request.status !== "PENDING" && reviewSummary.reviewedBy && (
                                        <p className="mt-2 text-sm text-(--text-muted)">
                                            Reviewed by {reviewSummary.reviewedBy.name || reviewSummary.reviewedBy.email || "Admin"}
                                        </p>
                                    )}
                                    <div className="mt-2 space-y-0.5">
                                        {request.items.map((item) => (
                                            <p key={item.id} className="text-sm text-(--text-muted)">
                                                • {item.ticketType.name} ×{item.quantity}
                                            </p>
                                        ))}
                                    </div>
                                </div>

                                <div className="lg:text-right min-w-[220px] space-y-3">
                                    <AdminStatusBadge
                                        label={request.status}
                                        tone={STATUS_TONE_MAP[request.status]}
                                    />
                                    <p className="text-xs text-(--text-muted) flex lg:justify-end items-center gap-1">
                                        <Calendar className="h-3 w-3" />
                                        {formatDate(request.createdAt)}
                                    </p>
                                    {bookingSummary && (
                                        <p className="text-xs font-semibold text-green-600">
                                            Booking: {bookingSummary.bookingCode}
                                        </p>
                                    )}

                                    {isPendingReview && (
                                        <div className="flex gap-2 lg:justify-end">
                                            <button
                                                type="button"
                                                onClick={() => reviewRequest(request.id, "APPROVE")}
                                                disabled={isActionLoading === request.id + "APPROVE"}
                                                className="inline-flex items-center gap-1.5 rounded-full bg-green-600 px-4 py-2 text-sm font-semibold text-white hover:bg-green-700 disabled:opacity-50"
                                            >
                                                {isActionLoading === request.id + "APPROVE" ? (
                                                    <Loader2 className="h-4 w-4 animate-spin" />
                                                ) : (
                                                    <CheckCircle2 className="h-4 w-4" />
                                                )}
                                                Approve
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => reviewRequest(request.id, "REJECT")}
                                                disabled={isActionLoading === request.id + "REJECT"}
                                                className="inline-flex items-center gap-1.5 rounded-full border border-(--border) px-4 py-2 text-sm font-semibold text-red-600 hover:bg-red-500/10 disabled:opacity-50"
                                            >
                                                {isActionLoading === request.id + "REJECT" ? (
                                                    <Loader2 className="h-4 w-4 animate-spin" />
                                                ) : (
                                                    <XCircle className="h-4 w-4" />
                                                )}
                                                Reject
                                            </button>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                        );
                    })}
                </div>
            )}
        </AdminWorkspacePage>
    );
}
