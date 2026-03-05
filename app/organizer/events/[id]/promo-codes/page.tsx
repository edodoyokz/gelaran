"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
    Tag,
    Plus,
    Edit2,
    Trash2,
    Copy,
    Loader2,
    AlertCircle,
    Calendar,
    Percent,
    DollarSign,
    TrendingUp,
    Check,
    X,
} from "lucide-react";
import { formatCurrency } from "@/lib/utils";

interface PromoCode {
    id: string;
    code: string;
    description: string | null;
    discountType: "PERCENTAGE" | "FIXED_AMOUNT";
    discountValue: number;
    maxDiscountAmount: number | null;
    minOrderAmount: number | null;
    usageLimitTotal: number | null;
    usageLimitPerUser: number | null;
    validFrom: string;
    validUntil: string;
    isActive: boolean;
    _count: {
        usages: number;
    };
}

interface EventData {
    id: string;
    title: string;
}

export default function EventPromoCodesPage() {
    const params = useParams();
    const router = useRouter();
    const eventId = params.id as string;

    const [promoCodes, setPromoCodes] = useState<PromoCode[]>([]);
    const [event, setEvent] = useState<EventData | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [editingPromo, setEditingPromo] = useState<PromoCode | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [actionLoading, setActionLoading] = useState<string | null>(null);

    useEffect(() => {
        const loadData = async () => {
            try {
                setIsLoading(true);
                const [promoRes, eventRes] = await Promise.all([
                    fetch(`/api/organizer/events/${eventId}/promo-codes`),
                    fetch(`/api/organizer/events/${eventId}`),
                ]);

                const promoData = await promoRes.json();
                const eventData = await eventRes.json();

                if (promoData.success) {
                    setPromoCodes(promoData.data);
                }
                if (eventData.success) {
                    setEvent(eventData.data);
                }
            } catch {
                setError("Terjadi kesalahan saat memuat data");
            } finally {
                setIsLoading(false);
            }
        };

        loadData();
    }, [eventId]);

    const handleCreate = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const formData = new FormData(e.currentTarget);

        const payload = {
            code: formData.get("code"),
            description: formData.get("description"),
            discountType: formData.get("discountType"),
            discountValue: Number(formData.get("discountValue")),
            maxDiscountAmount: formData.get("maxDiscountAmount")
                ? Number(formData.get("maxDiscountAmount"))
                : null,
            minOrderAmount: formData.get("minOrderAmount")
                ? Number(formData.get("minOrderAmount"))
                : null,
            usageLimitTotal: formData.get("usageLimitTotal")
                ? Number(formData.get("usageLimitTotal"))
                : null,
            usageLimitPerUser: formData.get("usageLimitPerUser")
                ? Number(formData.get("usageLimitPerUser"))
                : null,
            validFrom: formData.get("validFrom"),
            validUntil: formData.get("validUntil"),
            isActive: formData.get("isActive") === "on",
        };

        try {
            setIsSubmitting(true);
            const res = await fetch(`/api/organizer/events/${eventId}/promo-codes`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload),
            });
            const data = await res.json();

            if (!data.success) {
                alert(data.error?.message || "Gagal membuat promo code");
                return;
            }

            setShowCreateModal(false);
            setPromoCodes([data.data, ...promoCodes]);
        } catch {
            alert("Terjadi kesalahan saat membuat promo code");
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDelete = async (promoId: string) => {
        if (!confirm("Apakah Anda yakin ingin menghapus promo code ini?")) return;

        try {
            setActionLoading(promoId);
            const res = await fetch(`/api/organizer/events/${eventId}/promo-codes/${promoId}`, {
                method: "DELETE",
            });
            const data = await res.json();

            if (!data.success) {
                alert(data.error?.message || "Gagal menghapus promo code");
                return;
            }

            setPromoCodes(promoCodes.filter((p) => p.id !== promoId));
        } catch {
            alert("Terjadi kesalahan saat menghapus promo code");
        } finally {
            setActionLoading(null);
        }
    };

    const copyCode = (code: string) => {
        navigator.clipboard.writeText(code);
        alert("Kode promo berhasil disalin!");
    };

    const isExpired = (promo: PromoCode) => new Date(promo.validUntil) < new Date();
    const isNotStarted = (promo: PromoCode) => new Date(promo.validFrom) > new Date();
    const usagePercent = (promo: PromoCode) => {
        if (!promo.usageLimitTotal) return 0;
        return Math.round((promo._count.usages / promo.usageLimitTotal) * 100);
    };

    if (isLoading) {
        return (
            <div className="min-h-screen bg-[var(--bg-secondary)] flex items-center justify-center">
                <div className="text-center">
                    <Loader2 className="h-12 w-12 text-[var(--accent-primary)] animate-spin mx-auto mb-4" />
                    <p className="text-[var(--text-muted)]">Memuat promo codes...</p>
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
                    <Link href={`/organizer/events/${eventId}`} className="text-[var(--accent-primary)] hover:text-indigo-500">
                        Kembali ke Event
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[var(--bg-secondary)]">
            <header className="bg-[var(--surface)] border-b">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <Link
                                href={`/organizer/events/${eventId}`}
                                className="text-[var(--text-muted)] hover:text-[var(--text-secondary)]"
                            >
                                <Tag className="h-5 w-5" />
                            </Link>
                            <div>
                                <h1 className="text-2xl font-bold text-[var(--text-primary)]">Kode Promo</h1>
                                <p className="text-sm text-[var(--text-muted)] mt-1">{event?.title || "Event"}</p>
                            </div>
                        </div>
                        <button
                            type="button"
                            onClick={() => setShowCreateModal(true)}
                            className="inline-flex items-center gap-2 px-4 py-2 bg-[var(--accent-primary)] text-white rounded-lg font-medium hover:opacity-90"
                        >
                            <Plus className="h-4 w-4" />
                            Buat Promo Code
                        </button>
                    </div>
                </div>
            </header>

            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="grid sm:grid-cols-3 gap-4 mb-8">
                    <div className="bg-[var(--surface)] rounded-xl p-5 shadow-sm">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-indigo-100 rounded-lg flex items-center justify-center">
                                <Tag className="h-5 w-5 text-[var(--accent-primary)]" />
                            </div>
                            <div>
                                <p className="text-2xl font-bold text-[var(--text-primary)]">{promoCodes.length}</p>
                                <p className="text-sm text-[var(--text-muted)]">Total Promo</p>
                            </div>
                        </div>
                    </div>
                    <div className="bg-[var(--surface)] rounded-xl p-5 shadow-sm">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-green-500/10 rounded-lg flex items-center justify-center">
                                <Check className="h-5 w-5 text-green-600" />
                            </div>
                            <div>
                                <p className="text-2xl font-bold text-[var(--text-primary)]">
                                    {promoCodes.filter((p) => p.isActive).length}
                                </p>
                                <p className="text-sm text-[var(--text-muted)]">Aktif</p>
                            </div>
                        </div>
                    </div>
                    <div className="bg-[var(--surface)] rounded-xl p-5 shadow-sm">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-red-500/10 rounded-lg flex items-center justify-center">
                                <X className="h-5 w-5 text-red-600" />
                            </div>
                            <div>
                                <p className="text-2xl font-bold text-[var(--text-primary)]">
                                    {promoCodes.filter((p) => !p.isActive || isExpired(p)).length}
                                </p>
                                <p className="text-sm text-[var(--text-muted)]">Non-aktif/Kadaluarsa</p>
                            </div>
                        </div>
                    </div>
                </div>

                {promoCodes.length === 0 ? (
                    <div className="bg-[var(--surface)] rounded-xl shadow-sm p-12 text-center">
                        <Tag className="h-12 w-12 text-[var(--text-muted)] mx-auto mb-4" />
                        <h3 className="text-lg font-medium text-[var(--text-primary)] mb-2">Belum ada promo code</h3>
                        <p className="text-[var(--text-muted)] mb-6">
                            Buat promo code untuk menarik lebih banyak pembeli ke event Anda.
                        </p>
                        <button
                            type="button"
                            onClick={() => setShowCreateModal(true)}
                            className="inline-flex items-center gap-2 text-[var(--accent-primary)] font-medium"
                        >
                            <Plus className="h-4 w-4" />
                            Buat Promo Code Pertama
                        </button>
                    </div>
                ) : (
                    <div className="grid gap-4">
                        {promoCodes.map((promo) => {
                            const expired = isExpired(promo);
                            const notStarted = isNotStarted(promo);
                            const usagePct = usagePercent(promo);

                            return (
                                <div
                                    key={promo.id}
                                    className={`bg-[var(--surface)] rounded-xl shadow-sm p-6 ${
                                        !promo.isActive || expired ? "opacity-60" : ""
                                    }`}
                                >
                                    <div className="flex items-start justify-between mb-4">
                                        <div className="flex items-center gap-3">
                                            <div className="flex items-center gap-2 bg-[var(--accent-primary)]/10 px-4 py-2 rounded-lg">
                                                <Tag className="h-5 w-5 text-[var(--accent-primary)]" />
                                                <span className="font-bold text-xl text-[var(--text-primary)]">
                                                    {promo.code}
                                                </span>
                                            </div>
                                            <button
                                                type="button"
                                                onClick={() => copyCode(promo.code)}
                                                className="p-2 text-[var(--text-muted)] hover:text-[var(--text-secondary)] hover:bg-[var(--surface-hover)] rounded-lg"
                                                title="Salin Kode"
                                            >
                                                <Copy className="h-4 w-4" />
                                            </button>
                                        </div>
                                        <div className="flex items-center gap-1">
                                            {expired && (
                                                <span className="px-2 py-1 bg-red-500/10 text-red-700 text-xs rounded-full">
                                                    Kadaluarsa
                                                </span>
                                            )}
                                            {notStarted && !expired && (
                                                <span className="px-2 py-1 bg-[var(--bg-secondary)] text-[var(--text-secondary)] text-xs rounded-full">
                                                    Belum Aktif
                                                </span>
                                            )}
                                            {!promo.isActive && !expired && !notStarted && (
                                                <span className="px-2 py-1 bg-yellow-500/10 text-yellow-700 text-xs rounded-full">
                                                    Non-aktif
                                                </span>
                                            )}
                                            <button
                                                type="button"
                                                onClick={() => handleDelete(promo.id)}
                                                disabled={actionLoading === promo.id}
                                                className="p-2 text-red-500 hover:text-red-700 hover:bg-red-500/10 rounded-lg disabled:opacity-50"
                                                title="Hapus"
                                            >
                                                {actionLoading === promo.id ? (
                                                    <Loader2 className="h-4 w-4 animate-spin" />
                                                ) : (
                                                    <Trash2 className="h-4 w-4" />
                                                )}
                                            </button>
                                        </div>
                                    </div>

                                    {promo.description && (
                                        <p className="text-[var(--text-secondary)] mb-4">{promo.description}</p>
                                    )}

                                    <div className="grid sm:grid-cols-2 gap-4 mb-4">
                                        <div className="flex items-center gap-2">
                                            {promo.discountType === "PERCENTAGE" ? (
                                                <Percent className="h-5 w-5 text-[var(--accent-primary)]" />
                                            ) : (
                                                <DollarSign className="h-5 w-5 text-green-600" />
                                            )}
                                            <div>
                                                <p className="text-sm text-[var(--text-muted)]">Diskon</p>
                                                <p className="font-semibold text-[var(--text-primary)]">
                                                    {promo.discountType === "PERCENTAGE"
                                                        ? `${promo.discountValue}%`
                                                        : formatCurrency(promo.discountValue)}
                                                </p>
                                            </div>
                                        </div>
                                        {promo.minOrderAmount && (
                                            <div className="flex items-center gap-2">
                                                <TrendingUp className="h-5 w-5 text-purple-600" />
                                                <div>
                                                    <p className="text-sm text-[var(--text-muted)]">Min. Order</p>
                                                    <p className="font-semibold text-[var(--text-primary)]">
                                                        {formatCurrency(promo.minOrderAmount)}
                                                    </p>
                                                </div>
                                            </div>
                                        )}
                                    </div>

                                    <div className="flex items-center gap-4 text-sm mb-4">
                                        <div className="flex items-center gap-2">
                                            <Calendar className="h-4 w-4 text-[var(--text-muted)]" />
                                            <span className="text-[var(--text-muted)]">
                                                {new Date(promo.validFrom).toLocaleDateString("id-ID")} -{" "}
                                                {new Date(promo.validUntil).toLocaleDateString("id-ID")}
                                            </span>
                                        </div>
                                    </div>

                                    <div className="border-t pt-4">
                                        <div className="flex items-center justify-between mb-2">
                                            <span className="text-sm text-[var(--text-muted)]">
                                                Penggunaan: {promo._count.usages}
                                                {promo.usageLimitTotal && ` / ${promo.usageLimitTotal}`}
                                            </span>
                                            <span className="text-sm font-medium text-[var(--text-primary)]">
                                                {usagePct}%
                                            </span>
                                        </div>
                                        {promo.usageLimitTotal && (
                                            <div className="h-2 bg-[var(--bg-secondary)] rounded-full overflow-hidden">
                                                <div
                                                    className={`h-full rounded-full transition-all ${
                                                        usagePct >= 90 ? "bg-red-500" : usagePct >= 50 ? "bg-yellow-500" : "bg-[var(--accent-primary)]"
                                                    }`}
                                                    style={{ width: `${usagePct}%` }}
                                                />
                                            </div>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </main>

            {showCreateModal && (
                <CreatePromoModal
                    eventId={eventId}
                    isOpen={showCreateModal}
                    onClose={() => setShowCreateModal(false)}
                    onSubmit={handleCreate}
                    isSubmitting={isSubmitting}
                />
            )}
        </div>
    );
}

interface CreatePromoModalProps {
    eventId: string;
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (e: React.FormEvent<HTMLFormElement>) => void;
    isSubmitting: boolean;
}

function CreatePromoModal({ eventId, isOpen, onClose, onSubmit, isSubmitting }: CreatePromoModalProps) {
    if (!isOpen) return null;

    const now = new Date();
    const tomorrow = new Date(now);
    tomorrow.setDate(tomorrow.getDate() + 1);
    const nextWeek = new Date(now);
    nextWeek.setDate(nextWeek.getDate() + 7);

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-[var(--surface)] rounded-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
                <div className="p-6 border-b flex justify-between items-center sticky top-0 bg-[var(--surface)] z-10">
                    <h3 className="text-lg font-bold text-[var(--text-primary)]">Buat Promo Code Baru</h3>
                    <button
                        type="button"
                        onClick={onClose}
                        className="text-[var(--text-muted)] hover:text-[var(--text-secondary)]"
                    >
                        <X className="h-6 w-6" />
                    </button>
                </div>
                <form onSubmit={onSubmit} className="p-6 space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1">Kode Promo</label>
                        <input
                            name="code"
                            type="text"
                            required
                            placeholder="HURUFKAPITAL123"
                            className="w-full px-3 py-2 border rounded-lg font-mono uppercase"
                            pattern="[A-Z0-9_-]+"
                            title="Hanya huruf kapital, angka, dan underscore/tanda hubung"
                        />
                        <p className="text-xs text-[var(--text-muted)] mt-1">
                            Hanya huruf kapital, angka, underscore (_), dan tanda hubung (-)
                        </p>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1">Deskripsi (Opsional)</label>
                        <textarea
                            name="description"
                            rows={2}
                            placeholder="Deskripsi singkat tentang promo ini"
                            className="w-full px-3 py-2 border rounded-lg"
                        />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1">Tipe Diskon</label>
                            <select name="discountType" required className="w-full px-3 py-2 border rounded-lg">
                                <option value="PERCENTAGE">Persentase (%)</option>
                                <option value="FIXED_AMOUNT">Nominal Tetap (Rp)</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1">Nilai Diskon</label>
                            <input
                                name="discountValue"
                                type="number"
                                required
                                min="0"
                                step="0.01"
                                placeholder="0"
                                className="w-full px-3 py-2 border rounded-lg"
                            />
                        </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1">
                                Maksimal Diskon (Rp) - Opsional
                            </label>
                            <input
                                name="maxDiscountAmount"
                                type="number"
                                min="0"
                                step="0.01"
                                placeholder="0"
                                className="w-full px-3 py-2 border rounded-lg"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1">
                                Minimum Order (Rp) - Opsional
                            </label>
                            <input
                                name="minOrderAmount"
                                type="number"
                                min="0"
                                step="0.01"
                                placeholder="0"
                                className="w-full px-3 py-2 border rounded-lg"
                            />
                        </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1">
                                Limit Total - Opsional
                            </label>
                            <input
                                name="usageLimitTotal"
                                type="number"
                                min="1"
                                placeholder="Tanpa limit"
                                className="w-full px-3 py-2 border rounded-lg"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1">
                                Limit per User - Opsional
                            </label>
                            <input
                                name="usageLimitPerUser"
                                type="number"
                                min="1"
                                placeholder="1"
                                className="w-full px-3 py-2 border rounded-lg"
                            />
                        </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1">Berlaku Mulai</label>
                            <input
                                name="validFrom"
                                type="datetime-local"
                                required
                                defaultValue={now.toISOString().slice(0, 16)}
                                className="w-full px-3 py-2 border rounded-lg"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1">Berlaku Sampai</label>
                            <input
                                name="validUntil"
                                type="datetime-local"
                                required
                                defaultValue={nextWeek.toISOString().slice(0, 16)}
                                className="w-full px-3 py-2 border rounded-lg"
                            />
                        </div>
                    </div>
                    <label className="flex items-center gap-2">
                        <input name="isActive" type="checkbox" defaultChecked={true} className="rounded border-[var(--border)]" />
                        <span className="text-sm text-[var(--text-secondary)]">Aktifkan promo code segera</span>
                    </label>
                    <div className="pt-4 flex gap-3">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 px-4 py-2 border rounded-lg hover:bg-[var(--surface-hover)]"
                        >
                            Batal
                        </button>
                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="flex-1 px-4 py-2 bg-[var(--accent-primary)] text-white rounded-lg hover:opacity-90 disabled:opacity-50"
                        >
                            {isSubmitting ? "Membuat..." : "Buat Promo Code"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
