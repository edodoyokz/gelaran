import { Breadcrumb } from "@/components/docs/Breadcrumb";
import { BrowserFrame } from "@/components/docs/BrowserFrame";
import { FeatureCard } from "@/components/docs/FeatureCard";
import { CreditCard, RefreshCcw, Wallet, FileText } from "lucide-react";

export default function AdminTransactionsDocsPage() {
    return (
        <div className="animate-fade-in">
            <Breadcrumb
                items={[
                    { label: "Dokumentasi", href: "/docs" },
                    { label: "Admin", href: "/docs/admin" },
                    { label: "Transactions" },
                ]}
            />

            <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight mb-4">
                Transactions
            </h1>
            <p className="text-xl text-slate-600 mb-8 leading-relaxed">
                Panduan untuk memantau dan mengelola transaksi keuangan platform.
            </p>

            {/* Screenshot */}
            <div className="mb-10">
                <h3 className="text-lg font-semibold text-slate-900 mb-2">Tampilan Transactions</h3>
                <p className="text-slate-600 mb-4 text-sm">
                    Pantau semua transaksi pembayaran dari customer ke organizer.
                </p>
                <BrowserFrame
                    src="/docs/images/admin-transactions.png"
                    title="https://bsc.com/admin/bookings"
                    alt="Admin Transactions Screenshot"
                />
            </div>

            {/* Feature Cards */}
            <h2 className="text-2xl font-bold text-slate-900 mb-6">Fitur Utama</h2>
            <div className="grid md:grid-cols-2 gap-6 mb-12">
                <FeatureCard
                    icon={CreditCard}
                    title="Lihat Transaksi"
                    description="Pantau semua transaksi pembayaran yang masuk ke platform."
                    iconBgColor="bg-blue-100"
                    iconColor="text-blue-600"
                />
                <FeatureCard
                    icon={RefreshCcw}
                    title="Proses Refund"
                    description="Tangani permintaan refund dari customer dengan mudah."
                    iconBgColor="bg-amber-100"
                    iconColor="text-amber-600"
                />
                <FeatureCard
                    icon={Wallet}
                    title="Payout Management"
                    description="Setujui dan proses payout ke rekening organizer."
                    iconBgColor="bg-green-100"
                    iconColor="text-green-600"
                />
                <FeatureCard
                    icon={FileText}
                    title="Laporan Keuangan"
                    description="Lihat laporan keuangan harian, mingguan, atau bulanan."
                    iconBgColor="bg-purple-100"
                    iconColor="text-purple-600"
                />
            </div>

            {/* Status */}
            <h2 className="text-2xl font-bold text-slate-900 mb-6">Status Transaksi</h2>
            <div className="grid gap-3 mb-12">
                <div className="flex items-center gap-3 p-3 bg-yellow-50 rounded-lg">
                    <span className="px-2 py-1 text-xs font-medium bg-yellow-200 text-yellow-800 rounded">Pending</span>
                    <span className="text-slate-600">Menunggu pembayaran dari customer</span>
                </div>
                <div className="flex items-center gap-3 p-3 bg-green-50 rounded-lg">
                    <span className="px-2 py-1 text-xs font-medium bg-green-200 text-green-800 rounded">Paid</span>
                    <span className="text-slate-600">Pembayaran berhasil, tiket sudah diterbitkan</span>
                </div>
                <div className="flex items-center gap-3 p-3 bg-red-50 rounded-lg">
                    <span className="px-2 py-1 text-xs font-medium bg-red-200 text-red-800 rounded">Failed</span>
                    <span className="text-slate-600">Pembayaran gagal atau dibatalkan</span>
                </div>
                <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg">
                    <span className="px-2 py-1 text-xs font-medium bg-blue-200 text-blue-800 rounded">Refunded</span>
                    <span className="text-slate-600">Dana sudah dikembalikan ke customer</span>
                </div>
            </div>

            {/* Footer */}
            <div className="mt-16 pt-8 border-t border-slate-200 flex justify-between items-center text-sm text-slate-500">
                <span>Terakhir diperbarui: Januari 2026</span>
            </div>
        </div>
    );
}
