"use client";

import { useCallback, useState, useEffect } from "react";
import Link from "next/link";
import {
    Search,
    CheckCircle,
    XCircle,
    Clock,
    RefreshCw,
    AlertTriangle,
    User,
    Ticket,
    Loader2,
} from "lucide-react";
import { formatCurrency, formatDate } from "@/lib/utils";
import {
    AdminDataTable,
    AdminFilterBar,
    AdminMetricCard,
    AdminNotice,
    AdminStatusBadge,
    AdminWorkspacePage,
} from "@/components/admin/admin-workspace";

interface Refund {
    id: string;
    bookingCode: string;
    guestName: string | null;
    guestEmail: string | null;
    eventName: string;
    refundType: string;
    refundAmount: string;
    reason: string;
    status: string;
    requestedAt: string;
    processedAt: string | null;
    completedAt: string | null;
    adminNotes: string | null;
    transactionCode: string | null;
    paymentMethod: string | null;
    requesterName: string | null;
    processorName: string | null;
}

const STATUS_TONE_MAP: Record<string, "success" | "warning" | "danger" | "default" | "accent"> = {
    REQUESTED: "warning",
    APPROVED: "accent",
    PROCESSING: "accent",
    COMPLETED: "success",
    REJECTED: "danger",
    FAILED: "danger",
};

const STATUS_LABEL_MAP: Record<string, string> = {
    REQUESTED: "Menunggu Review",
    APPROVED: "Disetujui",
    PROCESSING: "Sedang Diproses",
    COMPLETED: "Selesai",
    REJECTED: "Ditolak",
    FAILED: "Gagal",
};

export default function AdminRefundsPage() {
    const [refunds, setRefunds] = useState<Refund[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [search, setSearch] = useState("");
    const [statusFilter, setStatusFilter] = useState("");
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(0);
    const [total, setTotal] = useState(0);
    const [expandedId, setExpandedId] = useState<string | null>(null);

    const fetchRefunds = useCallback(async () => {
        try {
            setIsLoading(true);
            setError(null);

            const searchParams = new URLSearchParams({
                page: page.toString(),
                limit: "20",
                ...(search && { search }),
                ...(statusFilter && { status: statusFilter }),
            });

            const res = await fetch(`/api/admin/refunds?${searchParams.toString()}`);
            const data = await res.json();

            if (!data.success) {
                throw new Error(data.error?.message || "Failed to fetch refunds");
            }

            setRefunds(data.data);
            setTotalPages(data.data.pagination.totalPages);
            setTotal(data.data.pagination.total);
        } catch (err) {
            const message = err instanceof Error ? err.message : "Failed to load refunds";
            setError(message);
        } finally {
            setIsLoading(false);
        }
    }, [page, search, statusFilter]);

    useEffect(() => {
        fetchRefunds();
    }, [page, search, statusFilter, fetchRefunds]);

    const pendingCount = refunds.filter((r) => r.status === "REQUESTED").length;
    const completedCount = refunds.filter((r) => r.status === "COMPLETED").length;

    if (isLoading && refunds.length === 0) {
        return (
            <div className="flex min-h-[60vh] items-center justify-center">
                <Loader2 className="h-10 w-10 animate-spin text-(--accent-primary)" />
            </div>
        );
    }

    if (error && refunds.length === 0) {
        return (
            <AdminWorkspacePage eyebrow="Admin refunds" title="Refund management" description="Review and manage customer refund requests across all events.">
                <AdminNotice tone="warning" title="Refund data is unavailable" description={error} actionHref="/admin" actionLabel="Back to dashboard" />
            </AdminWorkspacePage>
        );
    }

    return (
        <AdminWorkspacePage
            eyebrow="Admin refunds"
            title="Refund management"
            description="Review and manage customer refund requests across all events."
            actions={
                <button
                    type="button"
                    onClick={fetchRefunds}
                    className="inline-flex items-center gap-2 rounded-full border border-(--border) bg-(--surface) px-4 py-2 text-sm font-semibold text-foreground hover:bg-(--surface-elevated)"
                >
                    <RefreshCw className="h-4 w-4" />
                    Refresh
                </button>
            }
        >
            <section className="grid gap-4 md:grid-cols-3">
                <AdminMetricCard label="Total refunds" value={total.toLocaleString("en-US")} icon={Ticket} meta="Across all statuses" />
                <AdminMetricCard label="Pending review" value={pendingCount.toString()} icon={Clock} tone="warning" meta="Requires admin action" />
                <AdminMetricCard label="Completed" value={completedCount.toString()} icon={CheckCircle} tone="success" meta="Successfully processed" />
            </section>

            <AdminFilterBar>
                <label className="relative block min-w-[16rem] flex-1">
                    <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-(--text-muted)" />
                    <input
                        type="search"
                        value={search}
                        onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                        placeholder="Search by booking code, name, or email"
                        className="w-full rounded-2xl border border-(--border) bg-(--surface-elevated) py-3 pl-11 pr-4 text-sm text-foreground outline-none"
                    />
                </label>
                <select
                    value={statusFilter}
                    onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
                    className="rounded-2xl border border-(--border) bg-(--surface-elevated) px-4 py-3 text-sm"
                >
                    <option value="">All statuses</option>
                    <option value="REQUESTED">Menunggu Review</option>
                    <option value="APPROVED">Disetujui</option>
                    <option value="PROCESSING">Sedang Diproses</option>
                    <option value="COMPLETED">Selesai</option>
                    <option value="REJECTED">Ditolak</option>
                    <option value="FAILED">Gagal</option>
                </select>
                <div className="text-sm text-(--text-muted) flex items-center gap-1">
                    <span>Total:</span>
                    <span className="font-semibold text-foreground">{total} refund</span>
                </div>
            </AdminFilterBar>

            <AdminDataTable
                columns={["Booking", "Event", "Customer", "Type", "Amount", "Status", "Date", "Action"]}
                hasRows={refunds.length > 0}
                emptyTitle="No refunds match the current filters"
                emptyDescription="Try adjusting the status filter or search term."
            >
                {refunds.map((refund) => (
                    <>
                        <tr
                            key={refund.id}
                            className="cursor-pointer transition-colors hover:bg-(--surface-elevated)"
                            onClick={() => setExpandedId(expandedId === refund.id ? null : refund.id)}
                        >
                            <td className="px-5 py-4 align-top">
                                <div className="flex items-center gap-2">
                                    <Ticket className="h-4 w-4 text-(--accent-primary) shrink-0" />
                                    <span className="font-mono text-sm font-semibold text-foreground">{refund.bookingCode}</span>
                                </div>
                            </td>
                            <td className="px-5 py-4 align-top">
                                <p className="text-sm font-semibold text-foreground">{refund.eventName}</p>
                            </td>
                            <td className="px-5 py-4 align-top">
                                <div className="flex items-center gap-2 text-sm">
                                    <User className="h-4 w-4 text-(--text-muted) shrink-0" />
                                    <div>
                                        <p className="font-semibold text-foreground">{refund.guestName || "—"}</p>
                                        <p className="text-xs text-(--text-muted)">{refund.guestEmail || "—"}</p>
                                    </div>
                                </div>
                            </td>
                            <td className="px-5 py-4 align-top">
                                <AdminStatusBadge
                                    label={refund.refundType}
                                    tone={refund.refundType === "FULL" ? "danger" : "warning"}
                                />
                            </td>
                            <td className="px-5 py-4 align-top">
                                <span className="font-bold text-foreground text-sm">{formatCurrency(Number(refund.refundAmount))}</span>
                            </td>
                            <td className="px-5 py-4 align-top">
                                <AdminStatusBadge
                                    label={STATUS_LABEL_MAP[refund.status] || refund.status}
                                    tone={STATUS_TONE_MAP[refund.status] ?? "default"}
                                />
                            </td>
                            <td className="px-5 py-4 align-top text-sm text-(--text-secondary)">
                                {formatDate(refund.requestedAt)}
                            </td>
                            <td className="px-5 py-4 align-top">
                                <Link
                                    href={`/my-bookings/${refund.bookingCode}`}
                                    className="text-sm font-semibold text-(--accent-primary) hover:opacity-80"
                                    onClick={(e) => e.stopPropagation()}
                                >
                                    View order
                                </Link>
                            </td>
                        </tr>

                        {expandedId === refund.id && (
                            <tr key={`${refund.id}-detail`}>
                                <td colSpan={8} className="px-5 py-4 bg-(--surface-elevated) border-t border-b border-(--border)">
                                    <div className="space-y-4">
                                        <div className="grid grid-cols-2 gap-4 text-sm">
                                            <div>
                                                <p className="text-(--text-muted) mb-1">Requester</p>
                                                <p className="font-semibold text-foreground">{refund.requesterName || "—"}</p>
                                            </div>
                                            <div>
                                                <p className="text-(--text-muted) mb-1">Processed by</p>
                                                <p className="font-semibold text-foreground">{refund.processorName || "—"}</p>
                                            </div>
                                            <div>
                                                <p className="text-(--text-muted) mb-1">Request date</p>
                                                <p className="font-semibold text-foreground">{formatDate(refund.requestedAt)}</p>
                                            </div>
                                            <div>
                                                <p className="text-(--text-muted) mb-1">Payment method</p>
                                                <p className="font-semibold text-foreground">{refund.paymentMethod || "—"}</p>
                                            </div>
                                        </div>

                                        {refund.reason && (
                                            <div>
                                                <p className="text-sm font-semibold text-foreground mb-1">Refund reason</p>
                                                <p className="text-sm text-(--text-secondary) bg-(--surface) border border-(--border) p-3 rounded-xl">{refund.reason}</p>
                                            </div>
                                        )}

                                        {refund.adminNotes && (
                                            <div>
                                                <p className="text-sm font-semibold text-foreground mb-1">Admin notes</p>
                                                <p className="text-sm text-(--text-secondary) bg-(--surface) border border-(--border) p-3 rounded-xl">{refund.adminNotes}</p>
                                            </div>
                                        )}

                                        {refund.completedAt && (
                                            <div>
                                                <p className="text-sm font-semibold text-foreground mb-1">Completed on</p>
                                                <p className="text-sm text-(--text-secondary)">{formatDate(refund.completedAt)}</p>
                                            </div>
                                        )}
                                    </div>
                                </td>
                            </tr>
                        )}
                    </>
                ))}
            </AdminDataTable>

            {total > 20 && (
                <div className="flex items-center justify-between">
                    <p className="text-sm text-(--text-muted)">
                        Showing {(page - 1) * 20 + 1}–{Math.min(page * 20, total)} of {total} refunds
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
