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
                    <span className="inline-flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-700 text-xs font-medium rounded-full">
                        <CheckCircle className="h-3 w-3" />
                        Disetujui
                    </span>
                );
            case "PROCESSING":
                return (
                    <span className="inline-flex items-center gap-1 px-2 py-1 bg-purple-100 text-purple-700 text-xs font-medium rounded-full">
                        <RefreshCw className="h-3 w-3" />
                        Sedang Diproses
                    </span>
                );
            case "COMPLETED":
                return (
                    <span className="inline-flex items-center gap-1 px-2 py-1 bg-green-100 text-green-700 text-xs font-medium rounded-full">
                        <CheckCircle className="h-3 w-3" />
                        Selesai
                    </span>
                );
            case "REJECTED":
                return (
                    <span className="inline-flex items-center gap-1 px-2 py-1 bg-red-100 text-red-700 text-xs font-medium rounded-full">
                        <XCircle className="h-3 w-3" />
                        Ditolak
                    </span>
                );
            case "FAILED":
                return (
                    <span className="inline-flex items-center gap-1 px-2 py-1 bg-gray-100 text-gray-700 text-xs font-medium rounded-full">
                        <AlertTriangle className="h-3 w-3" />
                        Gagal
                    </span>
                );
            default:
                return (
                    <span className="inline-flex items-center gap-1 px-2 py-1 bg-gray-100 text-gray-700 text-xs font-medium rounded-full">
                        {status}
                    </span>
                );
        }
    };

    const getRefundTypeBadge = (type: string) => {
        return (
            <span className={`inline-block px-2 py-1 text-xs font-medium rounded ${
                type === "FULL" 
                    ? "bg-red-100 text-red-700" 
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
                        className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
                    >
                        <ArrowLeft className="h-4 w-4" />
                        <span>Kembali ke Dashboard Admin</span>
                    </Link>
                </div>

                <div className="mb-6 flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900 mb-2">Manajemen Refund</h1>
                        <p className="text-gray-600">Kelola permintaan refund dari pelanggan.</p>
                    </div>

                    <div className="flex gap-3">
                        <Link
                            href="/admin/analytics"
                            className="px-4 py-2 bg-white rounded-lg border border-gray-200 hover:bg-gray-50 flex items-center gap-2 transition-colors"
                        >
                            <Wallet className="h-4 w-4 text-indigo-600" />
                            <span className="text-sm">Lihat Statistik</span>
                        </Link>
                        <button
                            onClick={fetchRefunds}
                            className="px-4 py-2 bg-white rounded-lg border border-gray-200 hover:bg-gray-50 flex items-center gap-2 transition-colors"
                        >
                            <RefreshCw className="h-4 w-4 text-gray-600" />
                            <span className="text-sm">Refresh</span>
                        </button>
                    </div>
                </div>

                <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                    <div className="p-4 border-b border-gray-200 bg-gray-50 flex flex-col sm:flex-row gap-4">
                        <div className="flex-1 relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                            <input
                                type="text"
                                placeholder="Cari refund berdasarkan kode booking, nama, email..."
                                value={search}
                                onChange={(e) => {
                                    setSearch(e.target.value);
                                    setPage(1);
                                }}
                                className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                            />
                        </div>

                        <div className="flex gap-2">
                            <select
                                value={statusFilter}
                                onChange={(e) => {
                                    setStatusFilter(e.target.value);
                                    setPage(1);
                                }}
                                className="px-4 py-2 border rounded-lg bg-white focus:ring-2 focus:ring-indigo-500"
                            >
                                <option value="">Semua Status</option>
                                <option value="REQUESTED">Menunggu Review</option>
                                <option value="APPROVED">Disetujui</option>
                                <option value="PROCESSING">Sedang Diproses</option>
                                <option value="COMPLETED">Selesai</option>
                                <option value="REJECTED">Ditolak</option>
                                <option value="FAILED">Gagal</option>
                            </select>

                            <div className="text-sm text-gray-500 flex items-center gap-1">
                                <span>Total:</span>
                                <span className="font-semibold text-gray-900">{total} refund</span>
                            </div>
                        </div>
                    </div>

                    {isLoading ? (
                        <div className="p-12 flex items-center justify-center">
                            <Loader2 className="h-8 w-8 text-indigo-600 animate-spin" />
                        </div>
                    ) : error ? (
                        <div className="p-12 text-center text-red-600">
                            {error}
                        </div>
                    ) : refunds.length === 0 ? (
                        <div className="p-12 text-center text-gray-500">
                            <Ticket className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                            <p>Tidak ada refund ditemukan.</p>
                        </div>
                    ) : (
                        <>
                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead className="bg-gray-50 border-b border-gray-200">
                                        <tr>
                                            <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                                                Kode Booking
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                                                Event
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                                                Pelanggan
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                                                Jenis
                                            </th>
                                            <th className="px-6 py-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">
                                                Jumlah
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                                                Status
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                                                Tanggal
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                                                Aksi
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-200">
                                        {refunds.map((refund) => (
                                            <>
                                                <tr
                                                    key={refund.id}
                                                    className="hover:bg-gray-50 transition-colors"
                                                    onClick={() => {
                                                        setSelectedRefund(refund);
                                                        setShowDetails((prev) => ({ ...prev, [refund.id]: !prev[refund.id] }));
                                                    }}
                                                >
                                                    <td className="px-6 py-4">
                                                        <div className="flex items-center gap-2">
                                                            <Ticket className="h-4 w-4 text-indigo-600" />
                                                            <span className="font-mono text-sm font-medium text-gray-900">
                                                                {refund.bookingCode}
                                                            </span>
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <span className="font-medium text-gray-900">{refund.eventName}</span>
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <div className="flex items-center gap-2 text-sm">
                                                            <User className="h-4 w-4 text-gray-400" />
                                                            <div>
                                                                <p className="font-medium text-gray-900">
                                                                    {refund.guestName || "-"}
                                                                </p>
                                                                <p className="text-xs text-gray-500">
                                                                    {refund.guestEmail || "-"}
                                                                </p>
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        {getRefundTypeBadge(refund.refundType)}
                                                    </td>
                                                    <td className="px-6 py-4 text-right">
                                                        <span className="font-bold text-gray-900">
                                                            {formatCurrency(Number(refund.refundAmount))}
                                                        </span>
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        {getStatusBadge(refund.status)}
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <span className="text-sm text-gray-600">
                                                            {formatDate(refund.requestedAt)}
                                                        </span>
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <Link
                                                            href={`/my-bookings/${refund.bookingCode}`}
                                                            className="text-indigo-600 hover:text-indigo-700 hover:underline"
                                                        >
                                                            Lihat Pesanan
                                                        </Link>
                                                    </td>
                                                </tr>
                                                {showDetails[refund.id] && (
                                                    <tr>
                                                        <td colSpan={8} className="px-6 py-4 bg-gray-50 border-t border-b border-l border-r border-gray-200">
                                                            <div className="space-y-4">
                                                                <div className="flex justify-between items-start">
                                                                    <div>
                                                                        <h4 className="font-semibold text-gray-900 mb-2">Detail Request</h4>
                                                                        <div className="grid grid-cols-2 gap-4 text-sm">
                                                                            <div>
                                                                                <p className="text-gray-500 mb-1">Requester</p>
                                                                                <p className="font-medium text-gray-900">
                                                                                    {refund.requesterName || "-"}
                                                                                </p>
                                                                            </div>
                                                                            <div>
                                                                                <p className="text-gray-500 mb-1">Diproses Oleh</p>
                                                                                <p className="font-medium text-gray-900">
                                                                                    {refund.processorName || "-"}
                                                                                </p>
                                                                            </div>
                                                                            <div>
                                                                                <p className="text-gray-500 mb-1">Tanggal Request</p>
                                                                                <p className="font-medium text-gray-900">
                                                                                    {formatDate(refund.requestedAt)}
                                                                                </p>
                                                                            </div>
                                                                            <div>
                                                                                <p className="text-gray-500 mb-1">Payment Method</p>
                                                                                <p className="font-medium text-gray-900">
                                                                                    {refund.paymentMethod || "-"}
                                                                                </p>
                                                                            </div>
                                                                        </div>
                                                                    </div>
                                                                    <button
                                                                        onClick={() => setShowDetails((prev) => ({ ...prev, [refund.id]: false }))}
                                                                        className="text-gray-400 hover:text-gray-600"
                                                                    >
                                                                        <XCircle className="h-5 w-5" />
                                                                    </button>
                                                                </div>
                                                            </div>

                                                            {refund.reason && (
                                                                <div>
                                                                    <h4 className="font-semibold text-gray-900 mb-2">Alasan Refund</h4>
                                                                    <p className="text-sm text-gray-700 bg-gray-100 p-3 rounded-lg">
                                                                        {refund.reason}
                                                                    </p>
                                                                </div>
                                                            )}

                                                            {refund.adminNotes && (
                                                                <div>
                                                                    <h4 className="font-semibold text-gray-900 mb-2">Catatan Admin</h4>
                                                                    <p className="text-sm text-gray-700 bg-gray-100 p-3 rounded-lg">
                                                                        {refund.adminNotes}
                                                                    </p>
                                                                </div>
                                                            )}

                                                            {refund.completedAt && (
                                                                <div>
                                                                    <h4 className="font-semibold text-gray-900 mb-2">Tanggal Selesai</h4>
                                                                    <p className="text-sm text-gray-700">
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

                            <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between">
                                <p className="text-sm text-gray-500">
                                    Menampilkan {(page - 1) * 20 + 1} - {Math.min(page * 20, total)} dari {total} refund
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
