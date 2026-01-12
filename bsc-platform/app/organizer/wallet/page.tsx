import { redirect } from "next/navigation";
import Link from "next/link";
import {
    Wallet,
    ArrowUpRight,
    ArrowDownLeft,
    CreditCard,
    Clock,
    CheckCircle,
    Plus,
} from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import prisma from "@/lib/prisma/client";
import { formatCurrency } from "@/lib/utils";

export default async function OrganizerWalletPage() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        redirect("/login?returnUrl=/organizer/wallet");
    }

    const organizer = await prisma.user.findUnique({
        where: { email: user.email! },
        include: {
            organizerProfile: {
                include: {
                    bankAccounts: true,
                    payouts: {
                        orderBy: { createdAt: "desc" },
                        take: 10,
                    },
                },
            },
        },
    });

    if (!organizer || organizer.role !== "ORGANIZER" || !organizer.organizerProfile) {
        redirect("/");
    }

    const profile = organizer.organizerProfile;
    const balance = Number(profile.walletBalance);
    const totalEarned = Number(profile.totalEarned);
    const totalWithdrawn = Number(profile.totalWithdrawn);

    return (
        <div className="min-h-screen">
            <header className="bg-white border-b sticky top-0 z-10">
                <div className="px-6 py-4">
                    <h1 className="text-2xl font-bold text-gray-900">Wallet</h1>
                    <p className="text-gray-500 text-sm">Kelola saldo dan penarikan dana</p>
                </div>
            </header>

            <main className="p-6 space-y-6">
                <div className="bg-gradient-to-br from-indigo-600 to-purple-700 rounded-2xl p-8 text-white">
                    <div className="flex items-center gap-3 mb-4">
                        <Wallet className="h-8 w-8" />
                        <span className="text-lg opacity-90">Saldo Tersedia</span>
                    </div>
                    <p className="text-4xl font-bold mb-6">{formatCurrency(balance)}</p>
                    <div className="flex gap-4">
                        <Link
                            href="/organizer/wallet/withdraw"
                            className="inline-flex items-center gap-2 px-6 py-3 bg-white text-indigo-600 rounded-xl font-medium hover:bg-gray-100 transition-colors"
                        >
                            <ArrowUpRight className="h-5 w-5" />
                            Tarik Dana
                        </Link>
                        <Link
                            href="/organizer/wallet/bank-account"
                            className="inline-flex items-center gap-2 px-6 py-3 bg-white/20 text-white rounded-xl font-medium hover:bg-white/30 transition-colors"
                        >
                            <CreditCard className="h-5 w-5" />
                            Rekening Bank
                        </Link>
                    </div>
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                    <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                        <div className="flex items-center gap-3 mb-2">
                            <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                                <ArrowDownLeft className="h-6 w-6 text-green-600" />
                            </div>
                            <div>
                                <p className="text-sm text-gray-500">Total Pendapatan</p>
                                <p className="text-2xl font-bold text-gray-900">{formatCurrency(totalEarned)}</p>
                            </div>
                        </div>
                    </div>
                    <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                        <div className="flex items-center gap-3 mb-2">
                            <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
                                <ArrowUpRight className="h-6 w-6 text-purple-600" />
                            </div>
                            <div>
                                <p className="text-sm text-gray-500">Total Ditarik</p>
                                <p className="text-2xl font-bold text-gray-900">{formatCurrency(totalWithdrawn)}</p>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-xl shadow-sm border border-gray-100">
                    <div className="px-6 py-4 border-b flex items-center justify-between">
                        <h2 className="text-lg font-semibold flex items-center gap-2">
                            <CreditCard className="h-5 w-5 text-gray-500" />
                            Rekening Bank
                        </h2>
                        <Link
                            href="/organizer/wallet/bank-account"
                            className="text-indigo-600 text-sm font-medium hover:text-indigo-500 flex items-center gap-1"
                        >
                            <Plus className="h-4 w-4" />
                            Tambah
                        </Link>
                    </div>
                    <div className="divide-y">
                        {profile.bankAccounts.length === 0 ? (
                            <div className="p-8 text-center">
                                <CreditCard className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                                <p className="text-gray-500 mb-4">Belum ada rekening bank</p>
                                <Link
                                    href="/organizer/wallet/bank-account"
                                    className="inline-flex items-center gap-2 text-indigo-600 font-medium"
                                >
                                    <Plus className="h-4 w-4" />
                                    Tambah Rekening
                                </Link>
                            </div>
                        ) : (
                            profile.bankAccounts.map((account) => (
                                <div key={account.id} className="px-6 py-4 flex items-center justify-between">
                                    <div className="flex items-center gap-4">
                                        <div className="w-10 h-10 bg-indigo-100 rounded-lg flex items-center justify-center">
                                            <CreditCard className="h-5 w-5 text-indigo-600" />
                                        </div>
                                        <div>
                                            <p className="font-medium text-gray-900">{account.bankName}</p>
                                            <p className="text-sm text-gray-500">
                                                {account.accountNumber} • {account.accountHolderName}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        {account.isPrimary && (
                                            <span className="px-2.5 py-1 bg-indigo-100 text-indigo-700 text-xs font-medium rounded-full">
                                                Utama
                                            </span>
                                        )}
                                        {account.isVerified && (
                                            <CheckCircle className="h-5 w-5 text-green-500" />
                                        )}
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>

                <div className="bg-white rounded-xl shadow-sm border border-gray-100">
                    <div className="px-6 py-4 border-b">
                        <h2 className="text-lg font-semibold">Riwayat Penarikan</h2>
                    </div>
                    <div className="divide-y">
                        {profile.payouts.length === 0 ? (
                            <div className="p-8 text-center">
                                <Clock className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                                <p className="text-gray-500">Belum ada riwayat penarikan</p>
                            </div>
                        ) : (
                            profile.payouts.map((payout) => (
                                <div key={payout.id} className="px-6 py-4 flex items-center justify-between">
                                    <div className="flex items-center gap-4">
                                        <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${payout.status === "COMPLETED"
                                                ? "bg-green-100"
                                                : payout.status === "REQUESTED" || payout.status === "PROCESSING"
                                                    ? "bg-yellow-100"
                                                    : "bg-red-100"
                                            }`}>
                                            {payout.status === "COMPLETED" ? (
                                                <CheckCircle className="h-5 w-5 text-green-600" />
                                            ) : (
                                                <Clock className="h-5 w-5 text-yellow-600" />
                                            )}
                                        </div>
                                        <div>
                                            <p className="font-medium text-gray-900">{payout.payoutCode}</p>
                                            <p className="text-sm text-gray-500">
                                                {new Date(payout.requestedAt).toLocaleDateString("id-ID", {
                                                    day: "numeric",
                                                    month: "short",
                                                    year: "numeric",
                                                })}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <p className="font-medium text-gray-900">{formatCurrency(Number(payout.netAmount))}</p>
                                        <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${payout.status === "COMPLETED"
                                                ? "bg-green-100 text-green-700"
                                                : payout.status === "REQUESTED"
                                                    ? "bg-yellow-100 text-yellow-700"
                                                    : payout.status === "PROCESSING"
                                                        ? "bg-blue-100 text-blue-700"
                                                        : "bg-red-100 text-red-700"
                                            }`}>
                                            {payout.status === "COMPLETED" ? "Selesai" : 
                                             payout.status === "REQUESTED" ? "Menunggu" :
                                             payout.status === "PROCESSING" ? "Diproses" : payout.status}
                                        </span>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </main>
        </div>
    );
}
