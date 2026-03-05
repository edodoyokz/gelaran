"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
    Search,
    CheckCircle,
    XCircle,
    Clock,
    Banknote,
    Loader2,
    AlertCircle,
    Filter,
    Play,
} from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import { AdminHeader } from "@/components/admin/AdminHeader";
import { useToast } from "@/components/ui/toast-provider";

interface BankAccount {
    bankName: string;
    accountNumber: string;
    accountHolderName: string;
}

interface OrganizerUser {
    name: string;
    email: string;
}

interface OrganizerProfile {
    user: OrganizerUser;
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

const STATUS_COLORS: Record<string, string> = {
    REQUESTED: "bg-yellow-500/10 text-yellow-600",
    APPROVED: "bg-blue-500/10 text-blue-500",
    PROCESSING: "bg-blue-500/10 text-blue-500",
    COMPLETED: "bg-green-500/10 text-green-600",
    REJECTED: "bg-red-500/10 text-red-500",
    FAILED: "bg-red-500/10 text-red-500",
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
                prev.map((p) =>
                    p.id === payoutId ? { ...p, status: "PROCESSING" } : p
                )
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
                prev.map((p) =>
                    p.id === payoutId ? { ...p, status: "COMPLETED" } : p
                )
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
                body: JSON.stringify({
                    status: "REJECTED",
                    rejectionReason,
                }),
            });

            const data = await res.json();

            if (!data.success) {
                showToast(data.error?.message || "Failed to reject payout", "error");
                return;
            }

            setPayouts((prev) =>
                prev.map((p) =>
                    p.id === showRejectModal ? { ...p, status: "REJECTED" } : p
                )
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
            <div className="min-h-screen bg-[var(--bg-secondary)] flex items-center justify-center">
                <div className="text-center">
                    <Loader2 className="h-12 w-12 text-[var(--accent-primary)] animate-spin mx-auto mb-4" />
                    <p className="text-[var(--text-muted)]">Loading payouts...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen bg-[var(--bg-secondary)] flex items-center justify-center">
                <div className="text-center">
                    <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
                    <p className="text-[var(--text-primary)] font-medium mb-2">{error}</p>
                    <Link href="/admin" className="text-[var(--accent-primary)] hover:text-indigo-500">
                        Back to Dashboard
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <>
            <AdminHeader 
                title="Payout Processing" 
                backHref="/admin"
            />

            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="grid md:grid-cols-3 gap-6 mb-8">
                    <div className="bg-[var(--surface)] rounded-xl p-6 shadow-sm">
                        <div className="flex items-center gap-3 mb-2">
                            <div className="w-10 h-10 bg-yellow-500/10 rounded-lg flex items-center justify-center">
                                <Clock className="h-5 w-5 text-yellow-600" />
                            </div>
                            <span className="text-[var(--text-muted)]">Pending</span>
                        </div>
                        <p className="text-2xl font-bold text-[var(--text-primary)]">{pendingPayouts.length}</p>
                        <p className="text-sm text-[var(--text-muted)]">{formatCurrency(totalPending)}</p>
                    </div>
                    <div className="bg-[var(--surface)] rounded-xl p-6 shadow-sm">
                        <div className="flex items-center gap-3 mb-2">
                            <div className="w-10 h-10 bg-blue-500/10 rounded-lg flex items-center justify-center">
                                <Banknote className="h-5 w-5 text-blue-600" />
                            </div>
                            <span className="text-[var(--text-muted)]">Processing</span>
                        </div>
                        <p className="text-2xl font-bold text-[var(--text-primary)]">{processingPayouts.length}</p>
                    </div>
                    <div className="bg-[var(--surface)] rounded-xl p-6 shadow-sm">
                        <div className="flex items-center gap-3 mb-2">
                            <div className="w-10 h-10 bg-green-500/10 rounded-lg flex items-center justify-center">
                                <CheckCircle className="h-5 w-5 text-green-600" />
                            </div>
                            <span className="text-[var(--text-muted)]">Completed</span>
                        </div>
                        <p className="text-2xl font-bold text-[var(--text-primary)]">{completedPayouts.length}</p>
                    </div>
                </div>

                <div className="bg-[var(--surface)] rounded-xl p-4 mb-6 flex flex-wrap gap-4">
                    <div className="flex-1 min-w-[200px] relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-[var(--text-muted)]" />
                        <input
                            type="text"
                            placeholder="Search by payout code or organizer..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 border rounded-lg"
                        />
                    </div>
                    <div className="flex items-center gap-2">
                        <Filter className="h-5 w-5 text-[var(--text-muted)]" />
                        <select
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                            className="px-4 py-2 border rounded-lg"
                        >
                            <option value="">All Status</option>
                            <option value="REQUESTED">Pending</option>
                            <option value="PROCESSING">Processing</option>
                            <option value="COMPLETED">Completed</option>
                            <option value="REJECTED">Rejected</option>
                        </select>
                    </div>
                </div>

                <div className="bg-[var(--surface)] rounded-xl shadow-sm overflow-hidden">
                    <table className="w-full">
                        <thead className="bg-[var(--surface-hover)] border-b">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-[var(--text-muted)] uppercase">
                                    Payout
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-[var(--text-muted)] uppercase">
                                    Organizer
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-[var(--text-muted)] uppercase">
                                    Bank
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-[var(--text-muted)] uppercase">
                                    Amount
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-[var(--text-muted)] uppercase">
                                    Status
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-[var(--text-muted)] uppercase">
                                    Actions
                                </th>
                            </tr>
                        </thead>
                        <tbody className="divide-y">
                            {filteredPayouts.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="px-6 py-12 text-center text-[var(--text-muted)]">
                                        No payout requests found
                                    </td>
                                </tr>
                            ) : (
                                filteredPayouts.map((payout) => (
                                    <tr key={payout.id} className="hover:bg-[var(--surface-hover)]">
                                        <td className="px-6 py-4">
                                            <p className="font-medium text-[var(--text-primary)] font-mono">
                                                {payout.payoutCode}
                                            </p>
                                            <p className="text-xs text-[var(--text-muted)]">
                                                {new Date(payout.requestedAt).toLocaleDateString("id-ID")}
                                            </p>
                                        </td>
                                        <td className="px-6 py-4">
                                            <p className="text-sm text-[var(--text-primary)]">
                                                {payout.organizerProfile.user.name}
                                            </p>
                                            <p className="text-xs text-[var(--text-muted)]">
                                                {payout.organizerProfile.user.email}
                                            </p>
                                        </td>
                                        <td className="px-6 py-4">
                                            <p className="text-sm text-[var(--text-primary)]">
                                                {payout.bankAccount.bankName}
                                            </p>
                                            <p className="text-xs text-[var(--text-muted)]">
                                                {payout.bankAccount.accountNumber}
                                            </p>
                                        </td>
                                        <td className="px-6 py-4">
                                            <p className="font-medium text-[var(--text-primary)]">
                                                {formatCurrency(Number(payout.amount))}
                                            </p>
                                            <p className="text-xs text-[var(--text-muted)]">
                                                Net: {formatCurrency(Number(payout.netAmount))}
                                            </p>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span
                                                className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${STATUS_COLORS[payout.status]}`}
                                            >
                                                {payout.status}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
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
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </main>

            {showRejectModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-[var(--surface)] rounded-2xl max-w-md w-full p-6">
                        <h3 className="text-lg font-bold text-[var(--text-primary)] mb-4">Tolak Payout</h3>
                        <div className="mb-4">
                            <label htmlFor="reject-reason" className="block text-sm font-medium text-[var(--text-secondary)] mb-1">
                                Alasan Penolakan
                            </label>
                            <textarea
                                id="reject-reason"
                                value={rejectionReason}
                                onChange={(e) => setRejectionReason(e.target.value)}
                                rows={3}
                                className="w-full px-4 py-3 border border-[var(--border)] rounded-lg resize-none"
                                placeholder="Jelaskan alasan penolakan..."
                            />
                        </div>
                        <div className="flex gap-3">
                            <button
                                type="button"
                                onClick={() => {
                                    setShowRejectModal(null);
                                    setRejectionReason("");
                                }}
                                className="flex-1 px-4 py-2 border border-[var(--border)] text-[var(--text-secondary)] rounded-lg font-medium hover:bg-[var(--surface-hover)]"
                            >
                                Batal
                            </button>
                            <button
                                type="button"
                                onClick={handleReject}
                                disabled={actionLoading !== null}
                                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 disabled:opacity-50"
                            >
                                {actionLoading ? "Processing..." : "Tolak Payout"}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
