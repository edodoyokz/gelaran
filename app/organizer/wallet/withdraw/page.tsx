"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
    Wallet,
    CreditCard,
    AlertCircle,
    CheckCircle,
    Loader2,
    ArrowUpRight,
    ArrowLeft,
} from "lucide-react";
import { formatCurrency } from "@/lib/utils";

interface BankAccount {
    id: string;
    bankName: string;
    accountNumber: string;
    accountHolderName: string;
    isPrimary: boolean;
    isVerified: boolean;
}

export default function WithdrawPage() {
    const _router = useRouter();
    const [isLoading, setIsLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);

    const [balance, setBalance] = useState(0);
    const [bankAccounts, setBankAccounts] = useState<BankAccount[]>([]);

    const [amount, setAmount] = useState("");
    const [bankAccountId, setBankAccountId] = useState("");
    const [notes, setNotes] = useState("");

    const MIN_WITHDRAW = 50000;
    const FEE = 2500;

    useEffect(() => {
        const loadData = async () => {
            try {
                setIsLoading(true);
                const res = await fetch("/api/organizer/settings");
                const data = await res.json();

                if (!data.success) {
                    setError(data.error || "Gagal memuat data");
                    return;
                }

                setBalance(Number(data.data.profile.walletBalance));
                setBankAccounts(data.data.profile.bankAccounts || []);

                const primaryAccount = data.data.profile.bankAccounts?.find(
                    (acc: BankAccount) => acc.isPrimary
                );
                if (primaryAccount) {
                    setBankAccountId(primaryAccount.id);
                }
            } catch {
                setError("Terjadi kesalahan saat memuat data");
            } finally {
                setIsLoading(false);
            }
        };

        loadData();
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);

        const amountNum = Number(amount);

        if (!bankAccountId) {
            setError("Pilih rekening bank tujuan");
            return;
        }

        if (amountNum < MIN_WITHDRAW) {
            setError(`Minimum penarikan ${formatCurrency(MIN_WITHDRAW)}`);
            return;
        }

        if (amountNum > balance) {
            setError("Saldo tidak mencukupi");
            return;
        }

        try {
            setIsSubmitting(true);
            const res = await fetch("/api/organizer/wallet/withdraw", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    amount: amountNum,
                    bankAccountId,
                    notes,
                }),
            });

            const data = await res.json();

            if (!data.success) {
                setError(data.error?.message || "Gagal melakukan penarikan");
                return;
            }

            setSuccess(true);
        } catch {
            setError("Terjadi kesalahan saat memproses");
        } finally {
            setIsSubmitting(false);
        }
    };

    const netAmount = Number(amount) > 0 ? Number(amount) - FEE : 0;

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <div className="text-center">
                    <Loader2 className="h-12 w-12 text-(--accent-primary) animate-spin mx-auto mb-4" />
                    <p className="text-(--text-muted)">Memuat data...</p>
                </div>
            </div>
        );
    }

    if (success) {
        return (
            <div className="flex items-center justify-center min-h-[60vh] p-4">
                <div className="bg-(--surface) rounded-2xl shadow-lg max-w-md w-full p-8 text-center">
                    <div className="w-16 h-16 bg-green-500/10 rounded-full flex items-center justify-center mx-auto mb-6">
                        <CheckCircle className="h-8 w-8 text-green-600" />
                    </div>
                    <h2 className="text-2xl font-bold text-(--text-primary) mb-2">Permintaan Terkirim!</h2>
                    <p className="text-(--text-secondary) mb-6">
                        Permintaan penarikan sebesar {formatCurrency(Number(amount))} sedang diproses.
                        Anda akan menerima transfer dalam 1-3 hari kerja.
                    </p>
                    <Link
                        href="/organizer/wallet"
                        className="inline-flex items-center gap-2 px-6 py-3 bg-(--accent-primary) text-white rounded-lg font-medium hover:opacity-90"
                    >
                        <ArrowLeft className="h-5 w-5" />
                        Kembali ke Wallet
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <>
            <header className="bg-(--surface) border-b sticky top-0 z-10">
                <div className="px-6 py-4">
                    <h1 className="text-2xl font-bold text-(--text-primary)">Tarik Dana</h1>
                    <p className="text-(--text-secondary)">Tarik saldo ke rekening bank Anda</p>
                </div>
            </header>

            <main className="p-6">
                <div className="max-w-xl mx-auto space-y-6">
                    <div className="bg-linear-to-br from-indigo-600 to-purple-700 rounded-2xl p-6 text-white">
                        <div className="flex items-center gap-3 mb-2">
                            <Wallet className="h-6 w-6" />
                            <span className="opacity-90">Saldo Tersedia</span>
                        </div>
                        <p className="text-3xl font-bold">{formatCurrency(balance)}</p>
                    </div>

                    {bankAccounts.length === 0 ? (
                        <div className="bg-(--surface) rounded-xl shadow-sm p-8 text-center">
                            <CreditCard className="h-12 w-12 text-(--text-muted) mx-auto mb-4" />
                            <p className="text-(--text-secondary) mb-4">
                                Anda belum memiliki rekening bank. Tambahkan rekening terlebih dahulu untuk menarik dana.
                            </p>
                            <Link
                                href="/organizer/wallet/bank-account"
                                className="inline-flex items-center gap-2 px-6 py-3 bg-(--accent-primary) text-white rounded-lg font-medium hover:opacity-90"
                            >
                                Tambah Rekening Bank
                            </Link>
                        </div>
                    ) : (
                        <form onSubmit={handleSubmit} className="space-y-6">
                            {error && (
                                <div className="flex items-center gap-3 p-4 bg-red-500/10 border border-red-200 rounded-xl">
                                    <AlertCircle className="h-5 w-5 text-red-600 shrink-0" />
                                    <p className="text-red-700">{error}</p>
                                </div>
                            )}

                            <div className="bg-(--surface) rounded-xl shadow-sm overflow-hidden">
                                <div className="px-6 py-4 border-b">
                                    <h2 className="font-semibold text-(--text-primary)">Rekening Tujuan</h2>
                                </div>
                                <div className="p-4 space-y-3">
                                    {bankAccounts.map((account) => (
                                        <label
                                            key={account.id}
                                            htmlFor={`bank-${account.id}`}
                                            className={`flex items-center gap-4 p-4 border rounded-lg cursor-pointer transition-colors ${
                                                bankAccountId === account.id
                                                    ? "border-indigo-500 bg-(--accent-primary)/10"
                                                    : "border-(--border) hover:border-(--border)"
                                            }`}
                                        >
                                            <input
                                                type="radio"
                                                id={`bank-${account.id}`}
                                                name="bankAccount"
                                                value={account.id}
                                                checked={bankAccountId === account.id}
                                                onChange={(e) => setBankAccountId(e.target.value)}
                                                className="h-4 w-4 text-(--accent-primary)"
                                            />
                                            <div className="flex-1">
                                                <p className="font-medium text-(--text-primary)">{account.bankName}</p>
                                                <p className="text-sm text-(--text-muted)">
                                                    {account.accountNumber} • {account.accountHolderName}
                                                </p>
                                            </div>
                                            {account.isPrimary && (
                                                <span className="px-2 py-1 bg-indigo-100 text-(--accent-primary) text-xs rounded-full">
                                                    Utama
                                                </span>
                                            )}
                                        </label>
                                    ))}
                                </div>
                            </div>

                            <div className="bg-(--surface) rounded-xl shadow-sm overflow-hidden">
                                <div className="px-6 py-4 border-b">
                                    <h2 className="font-semibold text-(--text-primary)">Jumlah Penarikan</h2>
                                </div>
                                <div className="p-6 space-y-4">
                                    <div>
                                        <label htmlFor="input-amount" className="block text-sm font-medium text-(--text-secondary) mb-1">
                                            Jumlah (min. {formatCurrency(MIN_WITHDRAW)})
                                        </label>
                                        <div className="relative">
                                            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-(--text-muted)">Rp</span>
                                            <input
                                                type="number"
                                                id="input-amount"
                                                value={amount}
                                                onChange={(e) => setAmount(e.target.value)}
                                                className="w-full pl-12 pr-4 py-3 border border-(--border) rounded-lg focus:ring-2 focus:ring-(--accent-primary) focus:border-transparent"
                                                placeholder="0"
                                                min={MIN_WITHDRAW}
                                                max={balance}
                                            />
                                        </div>
                                    </div>

                                    <div className="flex gap-2">
                                        {[100000, 250000, 500000].map((preset) => (
                                            <button
                                                key={preset}
                                                type="button"
                                                onClick={() => setAmount(String(Math.min(preset, balance)))}
                                                disabled={balance < preset}
                                                className="flex-1 px-3 py-2 border border-(--border) rounded-lg text-sm font-medium text-(--text-secondary) hover:bg-(--surface-hover) disabled:opacity-50 disabled:cursor-not-allowed"
                                            >
                                                {formatCurrency(preset)}
                                            </button>
                                        ))}
                                        <button
                                            type="button"
                                            onClick={() => setAmount(String(balance))}
                                            className="flex-1 px-3 py-2 border border-indigo-300 bg-(--accent-primary)/10 rounded-lg text-sm font-medium text-(--accent-primary) hover:bg-indigo-100"
                                        >
                                            Semua
                                        </button>
                                    </div>

                                    <div>
                                        <label htmlFor="input-notes" className="block text-sm font-medium text-(--text-secondary) mb-1">
                                            Catatan (opsional)
                                        </label>
                                        <textarea
                                            id="input-notes"
                                            value={notes}
                                            onChange={(e) => setNotes(e.target.value)}
                                            rows={2}
                                            className="w-full px-4 py-3 border border-(--border) rounded-lg focus:ring-2 focus:ring-(--accent-primary) focus:border-transparent resize-none"
                                            placeholder="Catatan untuk penarikan ini..."
                                            maxLength={500}
                                        />
                                    </div>
                                </div>
                            </div>

                            {Number(amount) > 0 && (
                                <div className="bg-(--surface) rounded-xl shadow-sm p-6">
                                    <h3 className="font-semibold text-(--text-primary) mb-4">Rincian</h3>
                                    <div className="space-y-3 text-sm">
                                        <div className="flex justify-between">
                                            <span className="text-(--text-muted)">Jumlah penarikan</span>
                                            <span className="text-(--text-primary)">{formatCurrency(Number(amount))}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-(--text-muted)">Biaya admin</span>
                                            <span className="text-(--text-primary)">- {formatCurrency(FEE)}</span>
                                        </div>
                                        <div className="border-t pt-3 flex justify-between font-medium">
                                            <span className="text-(--text-secondary)">Total diterima</span>
                                            <span className="text-green-600">{formatCurrency(netAmount)}</span>
                                        </div>
                                    </div>
                                </div>
                            )}

                            <button
                                type="submit"
                                disabled={isSubmitting || Number(amount) < MIN_WITHDRAW || !bankAccountId}
                                className="w-full inline-flex items-center justify-center gap-2 px-6 py-4 bg-(--accent-primary) text-white rounded-xl font-medium hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {isSubmitting ? (
                                    <Loader2 className="h-5 w-5 animate-spin" />
                                ) : (
                                    <ArrowUpRight className="h-5 w-5" />
                                )}
                                {isSubmitting ? "Memproses..." : "Tarik Dana"}
                            </button>
                        </form>
                    )}
                </div>
            </main>
        </>
    );
}
