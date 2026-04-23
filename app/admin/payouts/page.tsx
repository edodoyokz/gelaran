"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
    Search,
    CheckCircle,
    XCircle,
    Clock,
    Banknote,
    Loader2,
    Filter,
    Play,
    X,
} from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import {
    AdminDataTable,
    AdminFilterBar,
    AdminMetricCard,
    AdminNotice,
    AdminStatusBadge,
    AdminWorkspacePage,
} from "@/components/admin/admin-workspace";
import { useToast } from "@/components/ui/toast-provider";

interface BankAccount {
    bankName: string;
    accountNumber: string;
    accountHolderName: string;
}

interface OrganizerProfile {
    user: {
        name: string;
        email: string;
    };
}

interface Payout {
    id: string;
    payoutCode: string;
    amount: string | number;
    fee: string | number;
    netAmount: string | number;
    status: "REQUESTED" | "APPROVED" | "PROCESSING" | "COMPLETED" | "REJECTED" | "FAILED";
    requestedAt: string;
    notes: string | null;
    organizerProfile: OrganizerProfile;
    bankAccount: BankAccount;
}

const STATUS_TONE_MAP: Record<string, "success" | "warning" | "danger" | "default" | "accent"> = {
    REQUESTED: "warning",
    APPROVED: "accent",
    PROCESSING: "accent",
    COMPLETED: "success",
    REJECTED: "danger",
    FAILED: "danger",
};

export default function AdminPayoutsPage() {
    const router = useRouter();
    const [payouts, setPayouts] = useState<Payout[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [statusFilter, setStatusFilter] = useState<string>("");
    const [search, setSearch] = useState("");
    const [actionLoading, setActionLoading] = useState<string | null>(null);
    const [showRejectModal, setShowRejectModal] = useState<string | null>(null);
    const [rejectionReason, setRejectionReason] = useState("");
    const { showToast } = useToast();

    const fetchPayouts = useCallback(async () => {
        try {
            setIsLoading(true);
            const res = await fetch("/api/admin/payouts");
            const data = await res.json();

            if (!res.ok) {
                if (res.status === 401) {
                    router.push("/login?returnUrl=/admin/payouts");
                    return;
                }
                if (res.status === 403) {
                    router.push("/");
                    return;
                }
                setError(data.error?.message || "Failed to load payouts");
                return;
            }

            if (data.success) {
                setPayouts(data.data);
            }
        } catch {
            setError("Failed to load payouts");
        } finally {
            setIsLoading(false);
        }
    }, [router]);

    useEffect(() => {
        fetchPayouts();
    }, [fetchPayouts]);

    const handleApprove = async (payoutId: string) => {
        try {
            setActionLoading(payoutId);
            const res = await fetch(`/api/admin/payouts/${payoutId}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ status: "APPROVED" }),
            });

            const data = await res.json();
            if (!data.success) {
                showToast(data.error?.message || "Failed to approve payout", "error");
                return;
            }

            setPayouts((prev) =>
                prev.map((p) => (p.id === payoutId ? { ...p, status: "PROCESSING" } : p))
            );
            showToast("Payout approved successfully", "success");
        } catch {
            showToast("Failed to approve payout", "error");
        } finally {
            setActionLoading(null);
        }
    };

    const handleComplete = async (payoutId: string) => {
        try {
            setActionLoading(payoutId);
            const res = await fetch(`/api/admin/payouts/${payoutId}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ status: "COMPLETED" }),
            });

            const data = await res.json();
            if (!data.success) {
                showToast(data.error?.message || "Failed to complete payout", "error");
                return;
            }

            setPayouts((prev) =>
                prev.map((p) => (p.id === payoutId ? { ...p, status: "COMPLETED" } : p))
            );
            showToast("Payout completed successfully", "success");
        } catch {
            showToast("Failed to complete payout", "error");
        } finally {
            setActionLoading(null);
        }
    };

    const handleReject = async () => {
        if (!showRejectModal) return;

        try {
            setActionLoading(showRejectModal);
            const res = await fetch(`/api/admin/payouts/${showRejectModal}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ status: "REJECTED", rejectionReason }),
            });

            const data = await res.json();
            if (!data.success) {
                showToast(data.error?.message || "Failed to reject payout", "error");
                return;
            }

            setPayouts((prev) =>
                prev.map((p) => (p.id === showRejectModal ? { ...p, status: "REJECTED" } : p))
            );
            setShowRejectModal(null);
            setRejectionReason("");
            showToast("Payout rejected successfully", "success");
        } catch {
            showToast("Failed to reject payout", "error");
        } finally {
            setActionLoading(null);
        }
    };

    const filteredPayouts = payouts.filter((payout) => {
        const matchesStatus = !statusFilter || payout.status === statusFilter;
        const matchesSearch =
            !search ||
            payout.payoutCode.toLowerCase().includes(search.toLowerCase()) ||
            payout.organizerProfile.user.name.toLowerCase().includes(search.toLowerCase()) ||
            payout.organizerProfile.user.email.toLowerCase().includes(search.toLowerCase());
        return matchesStatus && matchesSearch;
    });

    const pendingPayouts = payouts.filter((p) => p.status === "REQUESTED");
    const processingPayouts = payouts.filter((p) => p.status === "PROCESSING");
    const completedPayouts = payouts.filter((p) => p.status === "COMPLETED");
    const totalPending = pendingPayouts.reduce((sum, p) => sum + Number(p.amount), 0);

    if (isLoading) {
        return (
            <div className="flex min-h-[60vh] items-center justify-center">
                <Loader2 className="h-10 w-10 animate-spin text-(--accent-primary)" />
            </div>
        );
    }

    if (error) {
        return (
            <AdminWorkspacePage eyebrow="Admin payouts" title="Payout processing" description="Review organiser payout requests and manage the disbursement queue.">
                <AdminNotice tone="warning" title="Payout data is unavailable" description={error} actionHref="/admin" actionLabel="Back to dashboard" />
            </AdminWorkspacePage>
        );
    }

    return (
        <>
            <AdminWorkspacePage
                eyebrow="Admin payouts"
                title="Payout processing"
                description="Review organiser payout requests and manage the disbursement queue."
            >
                <section className="grid gap-4 md:grid-cols-3">
                    <AdminMetricCard
                        label="Pending payouts"
                        value={pendingPayouts.length.toString()}
                        icon={Clock}
                        tone="warning"
                        meta={formatCurrency(totalPending)}
                    />
                    <AdminMetricCard
                        label="Processing"
                        value={processingPayouts.length.toString()}
                        icon={Banknote}
                        tone="accent"
                        meta="Active disbursements"
                    />
                    <AdminMetricCard
                        label="Completed"
                        value={completedPayouts.length.toString()}
                        icon={CheckCircle}
                        tone="success"
                        meta="All-time completed payouts"
                    />
                </section>

                <AdminFilterBar>
                    <label className="relative block min-w-[16rem] flex-1">
                        <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-(--text-muted)" />
                        <input
                            type="search"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            placeholder="Search by payout code or organizer"
                            className="w-full rounded-2xl border border-(--border) bg-(--surface-elevated) py-3 pl-11 pr-4 text-sm text-foreground outline-none"
                        />
                    </label>
                    <label className="flex items-center gap-2">
                        <Filter className="h-4 w-4 text-(--text-muted)" />
                        <select
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                            className="rounded-2xl border border-(--border) bg-(--surface-elevated) px-4 py-3 text-sm"
                        >
                            <option value="">All statuses</option>
                            <option value="REQUESTED">Pending</option>
                            <option value="PROCESSING">Processing</option>
                            <option value="COMPLETED">Completed</option>
                            <option value="REJECTED">Rejected</option>
                        </select>
                    </label>
                </AdminFilterBar>

                <AdminDataTable
                    columns={["Payout", "Organizer", "Bank account", "Amount", "Status", "Actions"]}
                    hasRows={filteredPayouts.length > 0}
                    emptyTitle="No payout requests match the current filters"
                    emptyDescription="Try adjusting the status filter or search term."
                >
                    {filteredPayouts.map((payout) => (
                        <tr key={payout.id} className="transition-colors hover:bg-(--surface-elevated)">
                            <td className="px-5 py-4 align-top">
                                <p className="font-mono text-sm font-semibold text-foreground">{payout.payoutCode}</p>
                                <p className="mt-0.5 text-xs text-(--text-muted)">
                                    {new Date(payout.requestedAt).toLocaleDateString("id-ID")}
                                </p>
                            </td>
                            <td className="px-5 py-4 align-top">
                                <p className="text-sm font-semibold text-foreground">{payout.organizerProfile.user.name}</p>
                                <p className="mt-0.5 text-xs text-(--text-muted)">{payout.organizerProfile.user.email}</p>
                            </td>
                            <td className="px-5 py-4 align-top">
                                <p className="text-sm font-semibold text-foreground">{payout.bankAccount.bankName}</p>
                                <p className="mt-0.5 text-xs text-(--text-muted)">{payout.bankAccount.accountNumber}</p>
                            </td>
                            <td className="px-5 py-4 align-top">
                                <p className="text-sm font-semibold text-foreground">{formatCurrency(Number(payout.amount))}</p>
                                <p className="mt-0.5 text-xs text-(--text-muted)">Net: {formatCurrency(Number(payout.netAmount))}</p>
                            </td>
                            <td className="px-5 py-4 align-top">
                                <AdminStatusBadge label={payout.status} tone={STATUS_TONE_MAP[payout.status] ?? "default"} />
                            </td>
                            <td className="px-5 py-4 align-top">
                                <div className="flex items-center gap-1">
                                    {payout.status === "REQUESTED" && (
                                        <>
                                            <button
                                                type="button"
                                                onClick={() => handleApprove(payout.id)}
                                                disabled={actionLoading === payout.id}
                                                className="p-2 text-green-500 hover:text-green-700 rounded-lg hover:bg-green-500/10 disabled:opacity-50"
                                                title="Approve & Process"
                                            >
                                                {actionLoading === payout.id ? (
                                                    <Loader2 className="h-4 w-4 animate-spin" />
                                                ) : (
                                                    <CheckCircle className="h-4 w-4" />
                                                )}
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => setShowRejectModal(payout.id)}
                                                disabled={actionLoading === payout.id}
                                                className="p-2 text-red-500 hover:text-red-700 rounded-lg hover:bg-red-500/10 disabled:opacity-50"
                                                title="Reject"
                                            >
                                                <XCircle className="h-4 w-4" />
                                            </button>
                                        </>
                                    )}
                                    {payout.status === "PROCESSING" && (
                                        <button
                                            type="button"
                                            onClick={() => handleComplete(payout.id)}
                                            disabled={actionLoading === payout.id}
                                            className="p-2 text-blue-500 hover:text-blue-700 rounded-lg hover:bg-blue-500/10 disabled:opacity-50"
                                            title="Mark as Completed"
                                        >
                                            {actionLoading === payout.id ? (
                                                <Loader2 className="h-4 w-4 animate-spin" />
                                            ) : (
                                                <Play className="h-4 w-4" />
                                            )}
                                        </button>
                                    )}
                                </div>
                            </td>
                        </tr>
                    ))}
                </AdminDataTable>
            </AdminWorkspacePage>

            {showRejectModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-(--surface) rounded-2xl max-w-md w-full p-6 shadow-2xl">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-lg font-bold text-foreground">Reject payout</h3>
                            <button
                                type="button"
                                onClick={() => { setShowRejectModal(null); setRejectionReason(""); }}
                                className="p-2 text-(--text-muted) hover:text-(--text-secondary) rounded-lg hover:bg-(--surface-elevated)"
                            >
                                <X className="h-5 w-5" />
                            </button>
                        </div>
                        <div className="mb-4">
                            <label htmlFor="reject-reason" className="block text-sm font-medium text-(--text-secondary) mb-2">
                                Rejection reason
                            </label>
                            <textarea
                                id="reject-reason"
                                value={rejectionReason}
                                onChange={(e) => setRejectionReason(e.target.value)}
                                rows={3}
                                className="w-full rounded-2xl border border-(--border) bg-(--surface-elevated) px-4 py-3 text-foreground resize-none outline-none"
                                placeholder="Explain the reason for rejection..."
                            />
                        </div>
                        <div className="flex gap-3">
                            <button
                                type="button"
                                onClick={() => { setShowRejectModal(null); setRejectionReason(""); }}
                                className="flex-1 rounded-full border border-(--border) px-4 py-2 text-sm font-semibold text-foreground hover:bg-(--surface-elevated)"
                            >
                                Cancel
                            </button>
                            <button
                                type="button"
                                onClick={handleReject}
                                disabled={actionLoading !== null}
                                className="flex-1 inline-flex items-center justify-center gap-2 rounded-full bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-700 disabled:opacity-50"
                            >
                                {actionLoading && <Loader2 className="h-4 w-4 animate-spin" />}
                                Reject payout
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
