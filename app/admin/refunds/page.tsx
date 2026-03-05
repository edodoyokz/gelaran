"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
    ArrowLeft,
    Search,
    CheckCircle,
    XCircle,
    Clock,
    RefreshCw,
    AlertTriangle,
    User,
    Wallet,
    Ticket,
    Download,
    Loader2,
} from "lucide-react";
import { formatCurrency, formatDate } from "@/lib/utils";

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

interface RefundResponse {
    refunds: Refund[];
    pagination: {
        total: number;
        page: number;
        limit: number;
        totalPages: number;
    };
}

export default function AdminRefundsPage() {
    const [refunds, setRefunds] = useState<Refund[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [search, setSearch] = useState("");
    const [statusFilter, setStatusFilter] = useState("");
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(0);
    const [total, setTotal] = useState(0);
    const [selectedRefund, setSelectedRefund] = useState<Refund | null>(null);
    const [showDetails, setShowDetails] = useState<Record<string, boolean>>({});

    const fetchRefunds = async () => {
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
    };

    useEffect(() => {
        fetchRefunds();
    }, [page, search, statusFilter]);

    const getStatusBadge = (status: string) => {
        switch (status) {
            case "REQUESTED":
                return (
                    <span className="inline-flex items-center gap-1 px-2 py-1 bg-amber-100 text-amber-700 text-xs font-medium rounded-full">
                        <Clock className="h-3 w-3" />
                        Menunggu Review
                    </span>
                );
            case "APPROVED":
                return (
                    <span className="inline-flex items-center gap-1 px-2 py-1 bg-blue-500/10 text-blue-500 text-xs font-medium rounded-full">
                        <CheckCircle className="h-3 w-3" />
                        Disetujui
                    </span>
                );
            case "PROCESSING":
                return (
                    <span className="inline-flex items-center gap-1 px-2 py-1 bg-purple-500/10 text-purple-500 text-xs font-medium rounded-full">
                        <RefreshCw className="h-3 w-3" />
                        Sedang Diproses
                    </span>
                );
            case "COMPLETED":
                return (
                    <span className="inline-flex items-center gap-1 px-2 py-1 bg-green-500/10 text-green-600 text-xs font-medium rounded-full">
                        <CheckCircle className="h-3 w-3" />
                        Selesai
                    </span>
                );
            case "REJECTED":
                return (
                    <span className="inline-flex items-center gap-1 px-2 py-1 bg-red-500/10 text-red-500 text-xs font-medium rounded-full">
                        <XCircle className="h-3 w-3" />
                        Ditolak
                    </span>
                );
            case "FAILED":
                return (
                    <span className="inline-flex items-center gap-1 px-2 py-1 bg-[var(--bg-secondary)] text-[var(--text-secondary)] text-xs font-medium rounded-full">
                        <AlertTriangle className="h-3 w-3" />
                        Gagal
                    </span>
                );
            default:
                return (
                    <span className="inline-flex items-center gap-1 px-2 py-1 bg-[var(--bg-secondary)] text-[var(--text-secondary)] text-xs font-medium rounded-full">
                        {status}
                    </span>
                );
        }
    };

    const getRefundTypeBadge = (type: string) => {
        return (
            <span className={`inline-block px-2 py-1 text-xs font-medium rounded ${
                type === "FULL" 
                    ? "bg-red-500/10 text-red-500" 
                    : "bg-amber-100 text-amber-700"
            }`}>
                {type}
            </span>
        );
    };

    return (
        <>
            <div className="max-w-7xl mx-auto px-4 py-6">
                    <div className="mb-6">
                    <Link
                        href="/admin"
                        className="inline-flex items-center gap-2 text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors"
                    >
                        <ArrowLeft className="h-4 w-4" />
                        <span>Kembali ke Dashboard Admin</span>
                    </Link>
                </div>

                <div className="mb-6 flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold text-[var(--text-primary)] mb-2">Manajemen Refund</h1>
                        <p className="text-[var(--text-secondary)]">Kelola permintaan refund dari pelanggan.</p>
                    </div>

                    <div className="flex gap-3">
                        <Link
                            href="/admin/analytics"
                            className="px-4 py-2 bg-[var(--surface)] rounded-lg border border-[var(--border)] hover:bg-[var(--surface-hover)] flex items-center gap-2 transition-colors"
                        >
                            <Wallet className="h-4 w-4 text-[var(--accent-primary)]" />
                            <span className="text-sm">Lihat Statistik</span>
                        </Link>
                        <button
                            onClick={fetchRefunds}
                            className="px-4 py-2 bg-[var(--surface)] rounded-lg border border-[var(--border)] hover:bg-[var(--surface-hover)] flex items-center gap-2 transition-colors"
                        >
                            <RefreshCw className="h-4 w-4 text-[var(--text-secondary)]" />
                            <span className="text-sm">Refresh</span>
                        </button>
                    </div>
                </div>

                <div className="bg-[var(--surface)] rounded-xl shadow-sm border border-[var(--border)] overflow-hidden">
                    <div className="p-4 border-b border-[var(--border)] bg-[var(--surface-hover)] flex flex-col sm:flex-row gap-4">
                        <div className="flex-1 relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[var(--text-muted)]" />
                            <input
                                type="text"
                                placeholder="Cari refund berdasarkan kode booking, nama, email..."
                                value={search}
                                onChange={(e) => {
                                    setSearch(e.target.value);
                                    setPage(1);
                                }}
                                className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-[var(--accent-primary)] focus:border-transparent"
                            />
                        </div>

                        <div className="flex gap-2">
                            <select
                                value={statusFilter}
                                onChange={(e) => {
                                    setStatusFilter(e.target.value);
                                    setPage(1);
                                }}
                                className="px-4 py-2 border rounded-lg bg-[var(--surface)] focus:ring-2 focus:ring-[var(--accent-primary)]"
                            >
                                <option value="">Semua Status</option>
                                <option value="REQUESTED">Menunggu Review</option>
                                <option value="APPROVED">Disetujui</option>
                                <option value="PROCESSING">Sedang Diproses</option>
                                <option value="COMPLETED">Selesai</option>
                                <option value="REJECTED">Ditolak</option>
                                <option value="FAILED">Gagal</option>
                            </select>

                            <div className="text-sm text-[var(--text-muted)] flex items-center gap-1">
                                <span>Total:</span>
                                <span className="font-semibold text-[var(--text-primary)]">{total} refund</span>
                            </div>
                        </div>
                    </div>

                    {isLoading ? (
                        <div className="p-12 flex items-center justify-center">
                            <Loader2 className="h-8 w-8 text-[var(--accent-primary)] animate-spin" />
                        </div>
                    ) : error ? (
                        <div className="p-12 text-center text-red-600">
                            {error}
                        </div>
                    ) : refunds.length === 0 ? (
                        <div className="p-12 text-center text-[var(--text-muted)]">
                            <Ticket className="h-12 w-12 text-[var(--text-muted)] mx-auto mb-4" />
                            <p>Tidak ada refund ditemukan.</p>
                        </div>
                    ) : (
                        <>
                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead className="bg-[var(--surface-hover)] border-b border-[var(--border)]">
                                        <tr>
                                            <th className="px-6 py-3 text-left text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wider">
                                                Kode Booking
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wider">
                                                Event
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wider">
                                                Pelanggan
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wider">
                                                Jenis
                                            </th>
                                            <th className="px-6 py-3 text-right text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wider">
                                                Jumlah
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wider">
                                                Status
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wider">
                                                Tanggal
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wider">
                                                Aksi
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-[var(--border)]">
                                        {refunds.map((refund) => (
                                            <>
                                                <tr
                                                    key={refund.id}
                                                    className="hover:bg-[var(--surface-hover)] transition-colors"
                                                    onClick={() => {
                                                        setSelectedRefund(refund);
                                                        setShowDetails((prev) => ({ ...prev, [refund.id]: !prev[refund.id] }));
                                                    }}
                                                >
                                                    <td className="px-6 py-4">
                                                        <div className="flex items-center gap-2">
                                                            <Ticket className="h-4 w-4 text-[var(--accent-primary)]" />
                                                            <span className="font-mono text-sm font-medium text-[var(--text-primary)]">
                                                                {refund.bookingCode}
                                                            </span>
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <span className="font-medium text-[var(--text-primary)]">{refund.eventName}</span>
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <div className="flex items-center gap-2 text-sm">
                                                            <User className="h-4 w-4 text-[var(--text-muted)]" />
                                                            <div>
                                                                <p className="font-medium text-[var(--text-primary)]">
                                                                    {refund.guestName || "-"}
                                                                </p>
                                                                <p className="text-xs text-[var(--text-muted)]">
                                                                    {refund.guestEmail || "-"}
                                                                </p>
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        {getRefundTypeBadge(refund.refundType)}
                                                    </td>
                                                    <td className="px-6 py-4 text-right">
                                                        <span className="font-bold text-[var(--text-primary)]">
                                                            {formatCurrency(Number(refund.refundAmount))}
                                                        </span>
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        {getStatusBadge(refund.status)}
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <span className="text-sm text-[var(--text-secondary)]">
                                                            {formatDate(refund.requestedAt)}
                                                        </span>
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <Link
                                                            href={`/my-bookings/${refund.bookingCode}`}
                                                            className="text-[var(--accent-primary)] hover:text-[var(--accent-primary)] hover:underline"
                                                        >
                                                            Lihat Pesanan
                                                        </Link>
                                                    </td>
                                                </tr>
                                                {showDetails[refund.id] && (
                                                    <tr>
                                                        <td colSpan={8} className="px-6 py-4 bg-[var(--surface-hover)] border-t border-b border-l border-r border-[var(--border)]">
                                                            <div className="space-y-4">
                                                                <div className="flex justify-between items-start">
                                                                    <div>
                                                                        <h4 className="font-semibold text-[var(--text-primary)] mb-2">Detail Request</h4>
                                                                        <div className="grid grid-cols-2 gap-4 text-sm">
                                                                            <div>
                                                                                <p className="text-[var(--text-muted)] mb-1">Requester</p>
                                                                                <p className="font-medium text-[var(--text-primary)]">
                                                                                    {refund.requesterName || "-"}
                                                                                </p>
                                                                            </div>
                                                                            <div>
                                                                                <p className="text-[var(--text-muted)] mb-1">Diproses Oleh</p>
                                                                                <p className="font-medium text-[var(--text-primary)]">
                                                                                    {refund.processorName || "-"}
                                                                                </p>
                                                                            </div>
                                                                            <div>
                                                                                <p className="text-[var(--text-muted)] mb-1">Tanggal Request</p>
                                                                                <p className="font-medium text-[var(--text-primary)]">
                                                                                    {formatDate(refund.requestedAt)}
                                                                                </p>
                                                                            </div>
                                                                            <div>
                                                                                <p className="text-[var(--text-muted)] mb-1">Payment Method</p>
                                                                                <p className="font-medium text-[var(--text-primary)]">
                                                                                    {refund.paymentMethod || "-"}
                                                                                </p>
                                                                            </div>
                                                                        </div>
                                                                    </div>
                                                                    <button
                                                                        onClick={() => setShowDetails((prev) => ({ ...prev, [refund.id]: false }))}
                                                                        className="text-[var(--text-muted)] hover:text-[var(--text-secondary)]"
                                                                    >
                                                                        <XCircle className="h-5 w-5" />
                                                                    </button>
                                                                </div>
                                                            </div>

                                                            {refund.reason && (
                                                                <div>
                                                                    <h4 className="font-semibold text-[var(--text-primary)] mb-2">Alasan Refund</h4>
                                                                    <p className="text-sm text-[var(--text-secondary)] bg-[var(--bg-secondary)] p-3 rounded-lg">
                                                                        {refund.reason}
                                                                    </p>
                                                                </div>
                                                            )}

                                                            {refund.adminNotes && (
                                                                <div>
                                                                    <h4 className="font-semibold text-[var(--text-primary)] mb-2">Catatan Admin</h4>
                                                                    <p className="text-sm text-[var(--text-secondary)] bg-[var(--bg-secondary)] p-3 rounded-lg">
                                                                        {refund.adminNotes}
                                                                    </p>
                                                                </div>
                                                            )}

                                                            {refund.completedAt && (
                                                                <div>
                                                                    <h4 className="font-semibold text-[var(--text-primary)] mb-2">Tanggal Selesai</h4>
                                                                    <p className="text-sm text-[var(--text-secondary)]">
                                                                        {formatDate(refund.completedAt)}
                                                                    </p>
                                                                </div>
                                                            )}
                                                        </td>
                                                    </tr>
                                                )}
                                            </>
                                        ))}
                                    </tbody>
                                </table>
                            </div>

                            <div className="px-6 py-4 border-t border-[var(--border)] flex items-center justify-between">
                                <p className="text-sm text-[var(--text-muted)]">
                                    Menampilkan {(page - 1) * 20 + 1} - {Math.min(page * 20, total)} dari {total} refund
                                </p>
                                <div className="flex items-center gap-2">
                                    <button
                                        onClick={() => setPage((p) => Math.max(1, p - 1))}
                                        disabled={page === 1}
                                        className="px-4 py-2 border rounded-lg hover:bg-[var(--surface-hover)] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                    >
                                        Sebelumnya
                                    </button>
                                    <button
                                        onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                                        disabled={page >= totalPages}
                                        className="px-4 py-2 bg-[var(--accent-primary)] text-white rounded-lg hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
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
