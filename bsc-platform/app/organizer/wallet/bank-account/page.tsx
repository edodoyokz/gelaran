"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
    ArrowLeft,
    CreditCard,
    Plus,
    CheckCircle,
    AlertCircle,
    Loader2,
    Trash2,
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
    const router = useRouter();
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
            <div className="min-h-screen bg-gray-100 flex items-center justify-center">
                <div className="text-center">
                    <Loader2 className="h-12 w-12 text-indigo-600 animate-spin mx-auto mb-4" />
                    <p className="text-gray-500">Memuat data...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-100">
            <header className="bg-white border-b">
                <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
                    <div className="flex items-center gap-4">
                        <Link href="/organizer/wallet" className="text-gray-500 hover:text-gray-700">
                            <ArrowLeft className="h-5 w-5" />
                        </Link>
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900">Rekening Bank</h1>
                            <p className="text-sm text-gray-500">Kelola rekening untuk penarikan dana</p>
                        </div>
                    </div>
                </div>
            </header>

            <main className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {success && (
                    <div className="mb-6 flex items-center gap-3 p-4 bg-green-50 border border-green-200 rounded-xl">
                        <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0" />
                        <p className="text-green-700">{success}</p>
                    </div>
                )}

                {error && (
                    <div className="mb-6 flex items-center gap-3 p-4 bg-red-50 border border-red-200 rounded-xl">
                        <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0" />
                        <p className="text-red-700">{error}</p>
                    </div>
                )}

                <div className="bg-white rounded-xl shadow-sm overflow-hidden mb-6">
                    <div className="px-6 py-4 border-b flex items-center justify-between">
                        <h2 className="font-semibold text-gray-900 flex items-center gap-2">
                            <CreditCard className="h-5 w-5 text-gray-500" />
                            Daftar Rekening
                        </h2>
                        {!showForm && (
                            <button
                                type="button"
                                onClick={() => setShowForm(true)}
                                className="inline-flex items-center gap-2 px-4 py-2 text-sm bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700"
                            >
                                <Plus className="h-4 w-4" />
                                Tambah
                            </button>
                        )}
                    </div>

                    {bankAccounts.length === 0 && !showForm ? (
                        <div className="p-8 text-center">
                            <CreditCard className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                            <p className="text-gray-500 mb-4">Belum ada rekening bank terdaftar</p>
                            <button
                                type="button"
                                onClick={() => setShowForm(true)}
                                className="inline-flex items-center gap-2 text-indigo-600 font-medium"
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
                                            <CreditCard className="h-6 w-6 text-indigo-600" />
                                        </div>
                                        <div>
                                            <div className="flex items-center gap-2">
                                                <p className="font-medium text-gray-900">{account.bankName}</p>
                                                {account.isPrimary && (
                                                    <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-indigo-100 text-indigo-700 text-xs rounded-full">
                                                        <Star className="h-3 w-3" />
                                                        Utama
                                                    </span>
                                                )}
                                            </div>
                                            <p className="text-sm text-gray-500">
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
                    <div className="bg-white rounded-xl shadow-sm overflow-hidden">
                        <div className="px-6 py-4 border-b flex items-center justify-between">
                            <h2 className="font-semibold text-gray-900">Tambah Rekening Baru</h2>
                            <button
                                type="button"
                                onClick={() => setShowForm(false)}
                                className="text-gray-400 hover:text-gray-600"
                            >
                                &times;
                            </button>
                        </div>
                        <form onSubmit={handleSubmit} className="p-6 space-y-5">
                            <div>
                                <label htmlFor="input-bank" className="block text-sm font-medium text-gray-700 mb-1">
                                    Pilih Bank <span className="text-red-500">*</span>
                                </label>
                                <select
                                    id="input-bank"
                                    value={bankCode}
                                    onChange={(e) => handleBankSelect(e.target.value)}
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
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
                                <label htmlFor="input-account-number" className="block text-sm font-medium text-gray-700 mb-1">
                                    Nomor Rekening <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    id="input-account-number"
                                    value={accountNumber}
                                    onChange={(e) => setAccountNumber(e.target.value.replace(/\D/g, ""))}
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                                    placeholder="Masukkan nomor rekening"
                                    maxLength={20}
                                    required
                                />
                            </div>

                            <div>
                                <label htmlFor="input-account-name" className="block text-sm font-medium text-gray-700 mb-1">
                                    Nama Pemilik Rekening <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    id="input-account-name"
                                    value={accountHolderName}
                                    onChange={(e) => setAccountHolderName(e.target.value.toUpperCase())}
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
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
                                    className="h-4 w-4 text-indigo-600 rounded"
                                />
                                <label htmlFor="input-primary" className="text-sm text-gray-700">
                                    Jadikan sebagai rekening utama
                                </label>
                            </div>

                            <div className="flex gap-3 pt-4">
                                <button
                                    type="button"
                                    onClick={() => setShowForm(false)}
                                    className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50"
                                >
                                    Batal
                                </button>
                                <button
                                    type="submit"
                                    disabled={isSubmitting}
                                    className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-3 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 disabled:opacity-50"
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
            </main>
        </div>
    );
}
