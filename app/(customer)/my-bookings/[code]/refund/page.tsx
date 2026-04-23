"use client";

import { useState, useEffect, useCallback, Suspense } from "react";
import Link from "next/link";
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
import {
    CustomerHero,
    CustomerStatusBadge,
    DashboardSection,
} from "@/components/customer/customer-dashboard-primitives";

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
    const [reason, setReason] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [successMessage, setSuccessMessage] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const refundType: "FULL" = "FULL";

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
                const bookingSummary = bookingData.data.booking;
                setBooking({
                    id: bookingSummary.id,
                    bookingCode: bookingSummary.bookingCode,
                    status: bookingSummary.status,
                    totalAmount: bookingSummary.totalAmount,
                    event: bookingSummary.event,
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
                return <CustomerStatusBadge label="Full refund" tone="danger" />;
            case "PARTIAL":
                return <CustomerStatusBadge label="Partial refund" tone="warning" />;
            default:
                return <CustomerStatusBadge label={type} tone="neutral" />;
        }
    };

    const getStatusBadge = (status: string) => {
        switch (status) {
            case "REQUESTED":
                return <CustomerStatusBadge label="Menunggu review" tone="warning" icon={Clock} />;
            case "APPROVED":
                return <CustomerStatusBadge label="Disetujui" tone="accent" icon={RefreshCw} />;
            case "PROCESSING":
                return <CustomerStatusBadge label="Sedang diproses" tone="accent" icon={RefreshCw} />;
            case "COMPLETED":
                return <CustomerStatusBadge label="Selesai" tone="success" icon={CheckCircle} />;
            case "REJECTED":
                return <CustomerStatusBadge label="Ditolak" tone="danger" icon={XCircle} />;
            default:
                return <CustomerStatusBadge label={status} tone="neutral" />;
        }
    };

    if (isLoading) {
        return (
            <div className="min-h-[60vh] flex items-center justify-center">
                <div className="flex flex-col items-center gap-4">
                    <RefreshCw className="h-12 w-12 animate-spin text-(--accent-primary)" />
                    <p className="text-(--text-muted)">Memuat data refund...</p>
                </div>
            </div>
        );
    }

    if (error && !booking) {
        return (
            <DashboardSection>
                <div className="flex min-h-[45vh] items-center justify-center">
                    <div className="max-w-md text-center">
                        <AlertCircle className="mx-auto mb-4 h-12 w-12 text-(--error)" />
                        <h2 className="mb-2 text-xl font-semibold text-foreground">Refund belum bisa dimuat</h2>
                        <p className="mb-6 text-(--text-secondary)">{error}</p>
                        <button
                            onClick={() => router.push("/my-bookings")}
                            className="inline-flex items-center gap-2 rounded-full bg-(--accent-gradient) px-5 py-3 text-sm font-semibold text-white"
                        >
                            <ArrowLeft className="h-4 w-4" />
                            Kembali ke pesanan
                        </button>
                    </div>
                </div>
            </DashboardSection>
        );
    }

    return (
        <div className="space-y-6 lg:space-y-8">
            <CustomerHero
                eyebrow="Refund center"
                title="Refund pesanan"
                description="Ajukan refund untuk booking yang memenuhi syarat dan pantau seluruh proses pengembaliannya dalam satu halaman."
                meta={
                    booking ? (
                        <>
                            <CustomerStatusBadge label={booking.bookingCode} tone="accent" />
                            <CustomerStatusBadge label={booking.status} tone="neutral" />
                        </>
                    ) : undefined
                }
                actions={
                    <Link
                        href={`/my-bookings/${bookingCode}`}
                        className="inline-flex items-center gap-2 rounded-full border border-(--border) bg-(--surface-elevated) px-5 py-3 text-sm font-semibold text-foreground transition-colors hover:bg-(--surface-hover)"
                    >
                        <ArrowLeft className="h-4 w-4" />
                        Kembali ke detail booking
                    </Link>
                }
            />

            {booking ? (
                <DashboardSection
                    title="Ringkasan pesanan"
                    description="Pastikan event dan nominal pembayaran sesuai sebelum mengajukan refund baru."
                >
                    <div className="rounded-[1.75rem] border border-(--border-light) bg-(--surface-elevated) p-5">
                        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                            <div>
                                <h2 className="text-xl font-semibold text-foreground">{booking.event.title}</h2>
                                <p className="mt-2 text-sm text-(--text-secondary)">Kode booking {booking.bookingCode}</p>
                            </div>
                            <div className="text-left sm:text-right">
                                <p className="text-xs font-medium uppercase tracking-[0.18em] text-(--text-muted)">Total pembayaran</p>
                                <p className="mt-2 text-2xl font-semibold text-foreground">
                                    {formatCurrency(Number(booking.totalAmount))}
                                </p>
                            </div>
                        </div>
                    </div>
                </DashboardSection>
            ) : null}

            {refundPolicy ? (
                <DashboardSection
                    title="Kebijakan refund"
                    description="Ringkasan aturan event terkait pengembalian dana yang perlu dibaca sebelum mengirim permintaan."
                >
                    <div className="rounded-[1.75rem] border border-[rgba(41,179,182,0.22)] bg-(--surface-brand-soft) p-5 text-sm leading-7 text-(--text-secondary)">
                        {refundPolicy.split("\n").map((line, idx) => (
                            <p key={idx}>{line}</p>
                        ))}
                    </div>
                </DashboardSection>
            ) : null}

            <div className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
                <div className="space-y-6">
                    <DashboardSection
                        title="Riwayat refund"
                        description="Lihat semua pengajuan refund sebelumnya beserta status review dan catatan admin bila tersedia."
                        actionLabel={canRequestRefund && !showRequestForm ? "Ajukan refund baru" : undefined}
                    >
                        <div className="space-y-4">
                            {successMessage ? (
                                <div className="rounded-2xl border border-[rgba(19,135,108,0.18)] bg-(--success-bg) p-4 text-(--success-text)">
                                    <div className="flex items-center gap-3">
                                        <CheckCircle className="h-5 w-5" />
                                        <p>{successMessage}</p>
                                    </div>
                                </div>
                            ) : null}

                            {error ? (
                                <div className="rounded-2xl border border-[rgba(198,40,40,0.16)] bg-(--error-bg) p-4 text-(--error-text)">
                                    <div className="flex items-center gap-3">
                                        <XCircle className="h-5 w-5" />
                                        <p>{error}</p>
                                    </div>
                                </div>
                            ) : null}

                            {canRequestRefund ? (
                                <button
                                    onClick={() => setShowRequestForm(!showRequestForm)}
                                    className="inline-flex items-center gap-2 rounded-full border border-(--border) bg-(--surface-elevated) px-4 py-2.5 text-sm font-semibold text-foreground transition-colors hover:bg-(--surface-hover)"
                                >
                                    {showRequestForm ? <ChevronUp className="h-4 w-4" /> : <AlertCircle className="h-4 w-4" />}
                                    {showRequestForm ? "Tutup form" : "Ajukan refund baru"}
                                </button>
                            ) : null}

                            {showRequestForm ? (
                                <form onSubmit={handleSubmitRefund} className="space-y-4 rounded-[1.75rem] border border-(--border-light) bg-(--surface-elevated) p-5">
                                    <div>
                                        <label className="mb-2 block text-sm font-medium text-(--text-secondary)">
                                            Jenis refund
                                        </label>
                                        <div className="inline-flex items-center rounded-full bg-(--accent-gradient) px-4 py-2.5 text-sm font-semibold text-white shadow-(--shadow-glow)">
                                            Full refund (100%)
                                        </div>
                                        <p className="mt-2 text-xs text-(--text-muted)">
                                            Pengajuan refund parsial belum didukung pada alur customer saat ini.
                                        </p>
                                    </div>

                                    <div>
                                        <label htmlFor="reason" className="mb-2 block text-sm font-medium text-(--text-secondary)">
                                            Alasan refund *
                                        </label>
                                        <textarea
                                            id="reason"
                                            value={reason}
                                            onChange={(e) => setReason(e.target.value)}
                                            placeholder="Jelaskan mengapa Anda ingin mengajukan refund..."
                                            rows={4}
                                            className="input resize-none"
                                            required
                                        />
                                        <p className="mt-2 text-xs text-(--text-muted)">
                                            Alasan akan dikirim ke tim admin untuk ditinjau.
                                        </p>
                                    </div>

                                    <button
                                        type="submit"
                                        disabled={isSubmitting}
                                        className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-(--accent-gradient) px-5 py-3 text-sm font-semibold text-white shadow-(--shadow-glow) disabled:opacity-60"
                                    >
                                        {isSubmitting ? (
                                            <>
                                                <RefreshCw className="h-4 w-4 animate-spin" />
                                                Mengirim...
                                            </>
                                        ) : (
                                            <>
                                                <AlertCircle className="h-4 w-4" />
                                                Ajukan permintaan refund
                                            </>
                                        )}
                                    </button>
                                </form>
                            ) : null}

                            {refundHistory.length === 0 ? (
                                <div className="rounded-[1.75rem] border border-dashed border-(--border-strong) bg-(--surface-elevated) p-10 text-center">
                                    <User className="mx-auto mb-4 h-12 w-12 text-(--text-muted)" />
                                    <p className="font-medium text-foreground">Belum ada riwayat refund</p>
                                    <p className="mt-2 text-sm text-(--text-secondary)">
                                        Pengajuan refund yang berhasil dibuat akan muncul di sini lengkap dengan status peninjauannya.
                                    </p>
                                </div>
                            ) : (
                                refundHistory.map((refund) => (
                                    <article
                                        key={refund.id}
                                        className="rounded-[1.75rem] border border-(--border-light) bg-(--surface-elevated) p-5"
                                    >
                                        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                                            <div className="space-y-2">
                                                <div className="flex flex-wrap gap-2">
                                                    {getRefundTypeBadge(refund.refundType)}
                                                    {getStatusBadge(refund.status)}
                                                </div>
                                                <p className="text-sm text-(--text-secondary)">
                                                    Diajukan {formatDate(refund.requestedAt)}
                                                </p>
                                            </div>
                                            <p className="text-lg font-semibold text-foreground">
                                                {formatCurrency(Number(refund.refundAmount))}
                                            </p>
                                        </div>

                                        <div className="mt-4 space-y-3 text-sm text-(--text-secondary)">
                                            <div>
                                                <p className="text-xs font-medium uppercase tracking-[0.18em] text-(--text-muted)">Alasan</p>
                                                <p className="mt-1">{refund.reason}</p>
                                            </div>
                                            {refund.adminNotes ? (
                                                <div className="rounded-2xl border border-(--border-light) bg-(--surface) p-4">
                                                    <p className="text-xs font-medium uppercase tracking-[0.18em] text-(--text-muted)">Catatan admin</p>
                                                    <p className="mt-1">{refund.adminNotes}</p>
                                                </div>
                                            ) : null}
                                            {refund.processedAt ? (
                                                <p>Diproses {formatDate(refund.processedAt)}</p>
                                            ) : null}
                                            {refund.completedAt ? (
                                                <p>Selesai {formatDate(refund.completedAt)}</p>
                                            ) : null}
                                        </div>
                                    </article>
                                ))
                            )}
                        </div>
                    </DashboardSection>
                </div>

                <DashboardSection
                    title="Alur refund"
                    description="Panduan singkat tentang bagaimana Gelaran memproses refund setelah permintaan diajukan."
                >
                    <div className="space-y-4 text-sm text-(--text-secondary)">
                        <div className="rounded-2xl border border-(--border-light) bg-(--surface-elevated) p-4">
                            <div className="flex items-start gap-3">
                                <CheckCircle className="mt-0.5 h-5 w-5 text-(--success)" />
                                <div>
                                    <p className="font-semibold text-foreground">Pengajuan refund</p>
                                    <p className="mt-1">Kirim permintaan refund melalui form. Tim admin akan memeriksa kelengkapan alasan dan status pesanan.</p>
                                </div>
                            </div>
                        </div>
                        <div className="rounded-2xl border border-(--border-light) bg-(--surface-elevated) p-4">
                            <div className="flex items-start gap-3">
                                <RefreshCw className="mt-0.5 h-5 w-5 text-(--accent-primary)" />
                                <div>
                                    <p className="font-semibold text-foreground">Proses review</p>
                                    <p className="mt-1">Admin akan memverifikasi alasan dan memutuskan apakah refund dapat disetujui atau perlu informasi tambahan.</p>
                                </div>
                            </div>
                        </div>
                        <div className="rounded-2xl border border-(--border-light) bg-(--surface-elevated) p-4">
                            <div className="flex items-start gap-3">
                                <User className="mt-0.5 h-5 w-5 text-(--info)" />
                                <div>
                                    <p className="font-semibold text-foreground">Pemrosesan dana</p>
                                    <p className="mt-1">Jika disetujui, refund akan diproses ke metode pembayaran asal dalam kisaran 3-7 hari kerja.</p>
                                </div>
                            </div>
                        </div>
                        <div className="rounded-2xl border border-[rgba(251,193,23,0.28)] bg-(--warning-bg) p-4 text-(--warning-text)">
                            <div className="flex items-start gap-3">
                                <AlertTriangle className="mt-0.5 h-5 w-5" />
                                <div>
                                    <p className="font-semibold">Syarat utama</p>
                                    <p className="mt-1">Refund hanya dapat diajukan untuk pesanan berstatus <strong>PAID</strong> atau <strong>CONFIRMED</strong>.</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </DashboardSection>
            </div>
        </div>
    );
}

export default function RefundPage() {
    return (
        <Suspense
            fallback={
                <div className="min-h-[60vh] flex items-center justify-center">
                    <RefreshCw className="h-12 w-12 animate-spin text-(--accent-primary)" />
                </div>
            }
        >
            <RefundPageContent />
        </Suspense>
    );
}
