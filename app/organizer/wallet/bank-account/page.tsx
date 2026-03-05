"use client";

import { useState, useEffect } from "react";
import {
    CreditCard,
    Plus,
    CheckCircle,
    AlertCircle,
    Loader2,
    Star,
} from "lucide-react";

interface BankAccount {
    id: string;
    bankName: string;
    bankCode: string | null;
    accountNumber: string;
    accountHolderName: string;
    isPrimary: boolean;
    isVerified: boolean;
}

const BANK_LIST = [
    { code: "002", name: "BRI" },
    { code: "014", name: "BCA" },
    { code: "009", name: "BNI" },
    { code: "008", name: "Mandiri" },
    { code: "022", name: "CIMB Niaga" },
    { code: "011", name: "Danamon" },
    { code: "013", name: "Permata" },
    { code: "028", name: "OCBC NISP" },
    { code: "426", name: "Mega" },
    { code: "200", name: "BTN" },
    { code: "213", name: "BTPN" },
    { code: "441", name: "Bukopin" },
    { code: "147", name: "Muamalat" },
    { code: "451", name: "BSI" },
    { code: "950", name: "Commonwealth" },
    { code: "023", name: "UOB Indonesia" },
    { code: "046", name: "DBS Indonesia" },
    { code: "542", name: "Jago" },
    { code: "501", name: "BPR KS" },
];

export default function BankAccountPage() {
    const [isLoading, setIsLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);

    const [bankAccounts, setBankAccounts] = useState<BankAccount[]>([]);
    const [showForm, setShowForm] = useState(false);

    const [bankName, setBankName] = useState("");
    const [bankCode, setBankCode] = useState("");
    const [accountNumber, setAccountNumber] = useState("");
    const [accountHolderName, setAccountHolderName] = useState("");
    const [isPrimary, setIsPrimary] = useState(false);

    useEffect(() => {
        const loadBankAccounts = async () => {
            try {
                setIsLoading(true);
                const res = await fetch("/api/organizer/wallet/bank-accounts");
                const data = await res.json();

                if (data.success) {
                    setBankAccounts(data.data);
                }
            } catch {
                console.error("Failed to load bank accounts");
            } finally {
                setIsLoading(false);
            }
        };

        loadBankAccounts();
    }, []);

    const refetchBankAccounts = async () => {
        try {
            const res = await fetch("/api/organizer/wallet/bank-accounts");
            const data = await res.json();

            if (data.success) {
                setBankAccounts(data.data);
            }
        } catch {
            console.error("Failed to load bank accounts");
        }
    };

    const handleBankSelect = (code: string) => {
        const bank = BANK_LIST.find((b) => b.code === code);
        if (bank) {
            setBankCode(code);
            setBankName(bank.name);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setSuccess(null);

        if (!bankName) {
            setError("Pilih bank terlebih dahulu");
            return;
        }

        try {
            setIsSubmitting(true);
            const res = await fetch("/api/organizer/wallet/bank-accounts", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    bankName,
                    bankCode,
                    accountNumber,
                    accountHolderName,
                    isPrimary,
                }),
            });

            const data = await res.json();

            if (!data.success) {
                setError(data.error?.message || "Gagal menambahkan rekening");
                return;
            }

            setSuccess("Rekening berhasil ditambahkan!");
            setShowForm(false);
            setBankName("");
            setBankCode("");
            setAccountNumber("");
            setAccountHolderName("");
            setIsPrimary(false);
            refetchBankAccounts();

            setTimeout(() => setSuccess(null), 3000);
        } catch {
            setError("Terjadi kesalahan saat menyimpan");
        } finally {
            setIsSubmitting(false);
        }
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <div className="text-center">
                    <Loader2 className="h-12 w-12 text-[var(--accent-primary)] animate-spin mx-auto mb-4" />
                    <p className="text-[var(--text-muted)]">Memuat data...</p>
                </div>
            </div>
        );
    }

    return (
        <>
            <header className="bg-[var(--surface)] border-b sticky top-0 z-10">
                <div className="px-6 py-4">
                    <h1 className="text-2xl font-bold text-[var(--text-primary)]">Rekening Bank</h1>
                    <p className="text-[var(--text-secondary)]">Kelola rekening untuk penarikan dana</p>
                </div>
            </header>

            <main className="p-6">
                <div className="max-w-2xl mx-auto space-y-6">
                    {success && (
                        <div className="flex items-center gap-3 p-4 bg-green-500/10 border border-green-200 rounded-xl">
                            <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0" />
                            <p className="text-green-700">{success}</p>
                        </div>
                    )}

                    {error && (
                        <div className="flex items-center gap-3 p-4 bg-red-500/10 border border-red-200 rounded-xl">
                            <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0" />
                            <p className="text-red-700">{error}</p>
                        </div>
                    )}

                    <div className="bg-[var(--surface)] rounded-xl shadow-sm overflow-hidden">
                        <div className="px-6 py-4 border-b flex items-center justify-between">
                            <h2 className="font-semibold text-[var(--text-primary)] flex items-center gap-2">
                                <CreditCard className="h-5 w-5 text-[var(--text-muted)]" />
                                Daftar Rekening
                            </h2>
                            {!showForm && (
                                <button
                                    type="button"
                                    onClick={() => setShowForm(true)}
                                    className="inline-flex items-center gap-2 px-4 py-2 text-sm bg-[var(--accent-primary)] text-white rounded-lg font-medium hover:opacity-90"
                                >
                                    <Plus className="h-4 w-4" />
                                    Tambah
                                </button>
                            )}
                        </div>

                        {bankAccounts.length === 0 && !showForm ? (
                            <div className="p-8 text-center">
                                <CreditCard className="h-12 w-12 text-[var(--text-muted)] mx-auto mb-4" />
                                <p className="text-[var(--text-muted)] mb-4">Belum ada rekening bank terdaftar</p>
                                <button
                                    type="button"
                                    onClick={() => setShowForm(true)}
                                    className="inline-flex items-center gap-2 text-[var(--accent-primary)] font-medium"
                                >
                                    <Plus className="h-4 w-4" />
                                    Tambah Rekening Pertama
                                </button>
                            </div>
                        ) : (
                            <div className="divide-y">
                                {bankAccounts.map((account) => (
                                    <div key={account.id} className="px-6 py-4 flex items-center justify-between">
                                        <div className="flex items-center gap-4">
                                            <div className="w-12 h-12 bg-indigo-100 rounded-lg flex items-center justify-center">
                                                <CreditCard className="h-6 w-6 text-[var(--accent-primary)]" />
                                            </div>
                                            <div>
                                                <div className="flex items-center gap-2">
                                                    <p className="font-medium text-[var(--text-primary)]">{account.bankName}</p>
                                                    {account.isPrimary && (
                                                        <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-indigo-100 text-[var(--accent-primary)] text-xs rounded-full">
                                                            <Star className="h-3 w-3" />
                                                            Utama
                                                        </span>
                                                    )}
                                                </div>
                                                <p className="text-sm text-[var(--text-muted)]">
                                                    {account.accountNumber} • {account.accountHolderName}
                                                </p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            {account.isVerified && (
                                                <CheckCircle className="h-5 w-5 text-green-500" />
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {showForm && (
                        <div className="bg-[var(--surface)] rounded-xl shadow-sm overflow-hidden">
                            <div className="px-6 py-4 border-b flex items-center justify-between">
                                <h2 className="font-semibold text-[var(--text-primary)]">Tambah Rekening Baru</h2>
                                <button
                                    type="button"
                                    onClick={() => setShowForm(false)}
                                    className="text-[var(--text-muted)] hover:text-[var(--text-secondary)]"
                                >
                                    &times;
                                </button>
                            </div>
                            <form onSubmit={handleSubmit} className="p-6 space-y-5">
                                <div>
                                    <label htmlFor="input-bank" className="block text-sm font-medium text-[var(--text-secondary)] mb-1">
                                        Pilih Bank <span className="text-red-500">*</span>
                                    </label>
                                    <select
                                        id="input-bank"
                                        value={bankCode}
                                        onChange={(e) => handleBankSelect(e.target.value)}
                                        className="w-full px-4 py-3 border border-[var(--border)] rounded-lg focus:ring-2 focus:ring-[var(--accent-primary)] focus:border-transparent"
                                        required
                                    >
                                        <option value="">-- Pilih Bank --</option>
                                        {BANK_LIST.map((bank) => (
                                            <option key={bank.code} value={bank.code}>
                                                {bank.name}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div>
                                    <label htmlFor="input-account-number" className="block text-sm font-medium text-[var(--text-secondary)] mb-1">
                                        Nomor Rekening <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        id="input-account-number"
                                        value={accountNumber}
                                        onChange={(e) => setAccountNumber(e.target.value.replace(/\D/g, ""))}
                                        className="w-full px-4 py-3 border border-[var(--border)] rounded-lg focus:ring-2 focus:ring-[var(--accent-primary)] focus:border-transparent"
                                        placeholder="Masukkan nomor rekening"
                                        maxLength={20}
                                        required
                                    />
                                </div>

                                <div>
                                    <label htmlFor="input-account-name" className="block text-sm font-medium text-[var(--text-secondary)] mb-1">
                                        Nama Pemilik Rekening <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        id="input-account-name"
                                        value={accountHolderName}
                                        onChange={(e) => setAccountHolderName(e.target.value.toUpperCase())}
                                        className="w-full px-4 py-3 border border-[var(--border)] rounded-lg focus:ring-2 focus:ring-[var(--accent-primary)] focus:border-transparent"
                                        placeholder="Nama sesuai rekening bank"
                                        required
                                    />
                                </div>

                                <div className="flex items-center gap-3">
                                    <input
                                        type="checkbox"
                                        id="input-primary"
                                        checked={isPrimary}
                                        onChange={(e) => setIsPrimary(e.target.checked)}
                                        className="h-4 w-4 text-[var(--accent-primary)] rounded"
                                    />
                                    <label htmlFor="input-primary" className="text-sm text-[var(--text-secondary)]">
                                        Jadikan sebagai rekening utama
                                    </label>
                                </div>

                                <div className="flex gap-3 pt-4">
                                    <button
                                        type="button"
                                        onClick={() => setShowForm(false)}
                                        className="flex-1 px-4 py-3 border border-[var(--border)] text-[var(--text-secondary)] rounded-lg font-medium hover:bg-[var(--surface-hover)]"
                                    >
                                        Batal
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={isSubmitting}
                                        className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-3 bg-[var(--accent-primary)] text-white rounded-lg font-medium hover:opacity-90 disabled:opacity-50"
                                    >
                                        {isSubmitting ? (
                                            <Loader2 className="h-5 w-5 animate-spin" />
                                        ) : (
                                            <Plus className="h-5 w-5" />
                                        )}
                                        {isSubmitting ? "Menyimpan..." : "Tambah Rekening"}
                                    </button>
                                </div>
                            </form>
                        </div>
                    )}
                </div>
            </main>
        </>
    );
}
