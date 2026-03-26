"use client";

import { useState, useEffect, useCallback, Suspense } from "react";
import { useParams, useRouter } from "next/navigation";
import {
    ArrowLeft,
    RefreshCw,
    AlertCircle,
    CheckCircle,
    Clock,
    XCircle,
    AlertTriangle,
    ChevronUp,
    User,
} from "lucide-react";
import { formatCurrency, formatDate } from "@/lib/utils";

interface Refund {
    id: string;
    refundType: string;
    refundAmount: string;
    reason: string;
    status: string;
    adminNotes: string | null;
    requestedAt: string;
    processedAt: string | null;
    completedAt: string | null;
}

interface BookingSummary {
    id: string;
    bookingCode: string;
    status: string;
    totalAmount: string;
    event: {
        title: string;
    };
}

function RefundPageContent() {
    const params = useParams();
    const router = useRouter();
    const bookingCode = params.code as string;

    const [refundHistory, setRefundHistory] = useState<Refund[]>([]);
    const [refundPolicy, setRefundPolicy] = useState<string | null>(null);
    const [canRequestRefund, setCanRequestRefund] = useState(false);
    const [booking, setBooking] = useState<BookingSummary | null>(null);
    const [showRequestForm, setShowRequestForm] = useState(false);
    const [refundType, setRefundType] = useState<"FULL" | "PARTIAL">("FULL");
    const [reason, setReason] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [successMessage, setSuccessMessage] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    const fetchRefundData = useCallback(async () => {
        try {
            setIsLoading(true);
            setError(null);

            const res = await fetch(`/api/my-bookings/${bookingCode}/refund`);
            const data = await res.json();

            if (!data.success) {
                throw new Error(data.error?.message || "Gagal memuat data refund");
            }

            setRefundHistory(data.data.refunds);
            setRefundPolicy(data.data.refundPolicy);
            setCanRequestRefund(data.data.canRequestRefund);

            const bookingRes = await fetch(`/api/my-bookings/${bookingCode}`);
            const bookingData = await bookingRes.json();
            if (bookingData.success) {
                setBooking({
                    id: bookingData.data.id,
                    bookingCode: bookingData.data.bookingCode,
                    status: bookingData.data.status,
                    totalAmount: bookingData.data.totalAmount,
                    event: bookingData.data.event,
                });
            }
        } catch (err) {
            const message = err instanceof Error ? err.message : "Terjadi kesalahan";
            setError(message);
        } finally {
            setIsLoading(false);
        }
    }, [bookingCode]);

    useEffect(() => {
        fetchRefundData();
    }, [bookingCode, fetchRefundData]);

    const handleSubmitRefund = async (e: React.FormEvent) => {
        e.preventDefault();
        
        if (!reason.trim()) {
            setError("Alasan wajib diisi");
            return;
        }

        setIsSubmitting(true);
        setError(null);
        setSuccessMessage(null);

        try {
            const res = await fetch(`/api/my-bookings/${bookingCode}/refund`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ reason, refundType }),
            });

            const data = await res.json();

            if (!data.success) {
                throw new Error(data.error?.message || "Gagal mengajukan refund");
            }

            setSuccessMessage("Permintaan refund berhasil dikirim!");
            setReason("");
            setShowRequestForm(false);
            
            await fetchRefundData();
        } catch (err) {
            const message = err instanceof Error ? err.message : "Terjadi kesalahan";
            setError(message);
        } finally {
            setIsSubmitting(false);
        }
    };

    const getRefundTypeBadge = (type: string) => {
        switch (type) {
            case "FULL":
                return (
                    <span className="inline-flex items-center gap-1 px-2 py-1 bg-red-100 text-red-700 text-xs font-bold rounded-full">
                        Full Refund
                    </span>
                );
            case "PARTIAL":
                return (
                    <span className="inline-flex items-center gap-1 px-2 py-1 bg-amber-100 text-amber-700 text-xs font-bold rounded-full">
                        Partial Refund
                    </span>
                );
            default:
                return (
                    <span className="inline-flex items-center gap-1 px-2 py-1 bg-gray-100 text-gray-700 text-xs font-bold rounded-full">
                        {type}
                    </span>
                );
        }
    };

    const getStatusBadge = (status: string) => {
        switch (status) {
            case "REQUESTED":
                return (
                    <span className="inline-flex items-center gap-1 px-2 py-1 bg-amber-100 text-amber-700 text-xs font-bold rounded-full">
                        <Clock className="h-3 w-3" />
                        Menunggu Review
                    </span>
                );
            case "APPROVED":
                return (
                    <span className="inline-flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-700 text-xs font-bold rounded-full">
                        <RefreshCw className="h-3 w-3" />
                        Disetujui
                    </span>
                );
            case "PROCESSING":
                return (
                    <span className="inline-flex items-center gap-1 px-2 py-1 bg-purple-100 text-purple-700 text-xs font-bold rounded-full">
                        <RefreshCw className="h-3 w-3" />
                        Sedang Diproses
                    </span>
                );
            case "COMPLETED":
                return (
                    <span className="inline-flex items-center gap-1 px-2 py-1 bg-green-100 text-green-700 text-xs font-bold rounded-full">
                        <CheckCircle className="h-3 w-3" />
                        Selesai
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

    if (isLoading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-amber-50 to-orange-50 flex items-center justify-center">
                <div className="flex flex-col items-center gap-4">
                    <RefreshCw className="h-12 w-12 text-amber-600 animate-spin" />
                    <p className="text-gray-600">Memuat data refund...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-100">
            <div className="max-w-4xl mx-auto px-4 py-8">
                <div className="mb-6">
                    <button
                        onClick={() => router.push("/my-bookings")}
                        className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
                    >
                        <ArrowLeft className="h-4 w-4" />
                        <span>Kembali ke Daftar Pesanan</span>
                    </button>
                </div>

                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">Refund Pesanan</h1>
                    <p className="text-gray-600">Ajukan permintaan refund untuk pesanan yang memenuhi syarat dan ketentuan.</p>
                </div>

                {booking && (
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
                        <div className="flex justify-between items-start">
                            <div>
                                <h2 className="text-lg font-bold text-gray-900 mb-2">{booking.event.title}</h2>
                                <div className="flex items-center gap-2 text-sm text-gray-600">
                                    <span className="font-mono font-medium">{booking.bookingCode}</span>
                                    {getStatusBadge(booking.status)}
                                </div>
                            </div>
                            <div className="text-right">
                                <p className="text-sm text-gray-500">Total Pembayaran</p>
                                <p className="text-2xl font-bold text-indigo-600">{formatCurrency(Number(booking.totalAmount))}</p>
                            </div>
                        </div>
                    </div>
                )}

                {refundPolicy && (
                    <div className="bg-blue-50 border border-blue-200 rounded-xl p-6 mb-6">
                        <div className="flex items-start gap-3">
                            <div className="p-2 bg-blue-100 rounded-lg">
                                <AlertTriangle className="h-5 w-5 text-blue-600" />
                            </div>
                            <div className="flex-1">
                                <h3 className="font-bold text-blue-900 mb-2">Kebijakan Refund</h3>
                                <div className="prose text-sm text-blue-800">
                                    {refundPolicy.split("\n").map((line, idx) => (
                                        <p key={idx}>{line}</p>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <div className="lg:col-span-2 space-y-6">
                        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                            <div className="px-6 py-4 border-b border-gray-200 bg-gray-50 flex justify-between items-center">
                                <h3 className="font-semibold text-gray-900">Riwayat Refund</h3>
                                {canRequestRefund && (
                                    <button
                                        onClick={() => setShowRequestForm(!showRequestForm)}
                                        className="px-4 py-2 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 transition-colors flex items-center gap-2"
                                    >
                                        {showRequestForm ? (
                                            <>
                                                <ChevronUp className="h-4 w-4" />
                                                Tutup Form
                                            </>
                                        ) : (
                                            <>
                                                <AlertCircle className="h-4 w-4" />
                                                Ajukan Refund Baru
                                            </>
                                        )}
                                    </button>
                                )}
                            </div>

                            {successMessage && (
                                <div className="p-6 bg-green-50 border border-green-200 rounded-lg">
                                    <div className="flex items-center gap-3">
                                        <CheckCircle className="h-5 w-5 text-green-600" />
                                        <p className="font-medium text-green-800">{successMessage}</p>
                                    </div>
                                </div>
                            )}

                            {error && (
                                <div className="p-6 bg-red-50 border border-red-200 rounded-lg">
                                    <div className="flex items-center gap-3">
                                        <XCircle className="h-5 w-5 text-red-600" />
                                        <p className="font-medium text-red-800">{error}</p>
                                    </div>
                                </div>
                            )}

                            {showRequestForm ? (
                                <form onSubmit={handleSubmitRefund} className="p-6 space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1.5">
                                            Jenis Refund *
                                        </label>
                                        <div className="flex gap-4">
                                            <label className="flex items-center gap-2 cursor-pointer">
                                                <input
                                                    type="radio"
                                                    name="refundType"
                                                    value="FULL"
                                                    checked={refundType === "FULL"}
                                                    onChange={() => setRefundType("FULL")}
                                                    className="hidden"
                                                />
                                                <div className="w-4 h-4 rounded-full border-2 border-indigo-300 bg-white flex items-center justify-center">
                                                    <div className={`w-2 h-2 rounded-full ${refundType === "FULL" ? "bg-indigo-600" : "border-indigo-300"}`} />
                                                </div>
                                                <span className="text-sm">Full Refund (100%)</span>
                                            </label>
                                            <label className="flex items-center gap-2 cursor-pointer">
                                                <input
                                                    type="radio"
                                                    name="refundType"
                                                    value="PARTIAL"
                                                    checked={refundType === "PARTIAL"}
                                                    onChange={() => setRefundType("PARTIAL")}
                                                    className="hidden"
                                                />
                                                <div className="w-4 h-4 rounded-full border-2 border-indigo-300 bg-white flex items-center justify-center">
                                                    <div className={`w-2 h-2 rounded-full ${refundType === "PARTIAL" ? "bg-indigo-600" : "border-indigo-300"}`} />
                                                </div>
                                                <span className="text-sm">Partial Refund</span>
                                            </label>
                                        </div>
                                    </div>

                                    <div>
                                        <label htmlFor="reason" className="block text-sm font-medium text-gray-700 mb-1.5">
                                            Alasan Refund *
                                        </label>
                                        <textarea
                                            id="reason"
                                            value={reason}
                                            onChange={(e) => setReason(e.target.value)}
                                            placeholder="Jelaskan mengapa Anda ingin mengajukan refund..."
                                            rows={4}
                                            className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-none"
                                            required
                                        />
                                        <p className="text-xs text-gray-500 mt-1">
                                            Alasan akan dikirim ke tim admin untuk ditinjau.
                                        </p>
                                    </div>

                                    <button
                                        type="submit"
                                        disabled={isSubmitting}
                                        className="w-full px-6 py-3 bg-indigo-600 text-white rounded-lg font-semibold hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
                                    >
                                        {isSubmitting ? (
                                            <>
                                                <RefreshCw className="h-5 w-5 animate-spin" />
                                                Mengirim...
                                            </>
                                        ) : (
                                            <>
                                                <AlertCircle className="h-5 w-5" />
                                                Ajukan Permintaan Refund
                                            </>
                                        )}
                                    </button>
                                </form>
                            ) : (
                                <div className="p-6">
                                    {refundHistory.length === 0 ? (
                                        <div className="text-center py-12">
                                            <User className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                                            <p className="text-gray-500">Belum ada riwayat refund</p>
                                            {canRequestRefund && (
                                                <button
                                                    onClick={() => setShowRequestForm(true)}
                                                    className="mt-4 px-6 py-3 bg-indigo-600 text-white rounded-lg font-semibold hover:bg-indigo-700 transition-colors"
                                                >
                                                    Ajukan Refund
                                                </button>
                                            )}
                                        </div>
                                    ) : (
                                        <div className="space-y-4">
                                            {refundHistory.map((refund) => (
                                                <div
                                                    key={refund.id}
                                                    className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors"
                                                >
                                                    <div className="flex items-start justify-between mb-2">
                                                        <div className="flex items-center gap-3">
                                                            {getRefundTypeBadge(refund.refundType)}
                                                            <span className="text-sm text-gray-500">
                                                                {formatDate(refund.requestedAt)}
                                                            </span>
                                                        </div>
                                                        {getStatusBadge(refund.status)}
                                                    </div>

                                                    <div className="space-y-2">
                                                        <div className="flex justify-between items-center text-sm">
                                                            <span className="text-gray-600">Jumlah:</span>
                                                            <span className="font-bold text-gray-900">
                                                                {formatCurrency(Number(refund.refundAmount))}
                                                            </span>
                                                        </div>

                                                        <div>
                                                            <p className="text-xs text-gray-500 mb-1">Alasan:</p>
                                                            <p className="text-sm text-gray-800">{refund.reason}</p>
                                                        </div>

                                                        {refund.adminNotes && (
                                                            <div className="mt-3 p-3 bg-gray-50 rounded">
                                                                <p className="text-xs text-gray-500 mb-1">Catatan Admin:</p>
                                                                <p className="text-sm text-gray-700">{refund.adminNotes}</p>
                                                            </div>
                                                        )}

                                                        {refund.processedAt && (
                                                            <div className="flex justify-between items-center text-xs text-gray-500 mt-2">
                                                                <span>Diproses: {formatDate(refund.processedAt)}</span>
                                                                {refund.completedAt && (
                                                                    <span>Selesai: {formatDate(refund.completedAt)}</span>
                                                                )}
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>

                        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                            <h3 className="font-semibold text-gray-900 mb-4">Informasi Refund</h3>
                            <div className="space-y-3 text-sm">
                                <div className="flex items-start gap-3">
                                    <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0" />
                                    <div>
                                        <p className="font-medium text-gray-900">Pengajuan Refund</p>
                                        <p className="text-gray-600">
                                            Kirim permintaan refund melalui form. Permintaan akan direview oleh admin dalam 1-3 hari kerja.
                                        </p>
                                    </div>
                                </div>
                                <div className="flex items-start gap-3">
                                    <RefreshCw className="h-5 w-5 text-amber-600 flex-shrink-0" />
                                    <div>
                                        <p className="font-medium text-gray-900">Proses Review</p>
                                        <p className="text-gray-600">
                                            Admin akan memverifikasi alasan dan memutuskan apakah refund dapat disetujui.
                                        </p>
                                    </div>
                                </div>
                                <div className="flex items-start gap-3">
                                    <User className="h-5 w-5 text-blue-600 flex-shrink-0" />
                                    <div>
                                        <p className="font-medium text-gray-900">Pemrosesan</p>
                                        <p className="text-gray-600">
                                            Jika disetujui, refund akan diproses ke metode pembayaran asal dalam 3-7 hari kerja.
                                        </p>
                                    </div>
                                </div>
                                <div className="flex items-start gap-3">
                                    <AlertTriangle className="h-5 w-5 text-amber-600 flex-shrink-0" />
                                    <div>
                                        <p className="font-medium text-gray-900">Syarat & Ketentuan</p>
                                        <p className="text-gray-600">
                                            Refund hanya dapat diajukan untuk pesanan berstatus &quot;PAID&quot; atau &quot;CONFIRMED&quot;.
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default function RefundPage() {
    return (
        <Suspense fallback={
            <div className="min-h-screen bg-gray-100 flex items-center justify-center">
                <RefreshCw className="h-12 w-12 text-gray-400 animate-spin" />
            </div>
        }>
            <RefundPageContent />
        </Suspense>
    );
}
