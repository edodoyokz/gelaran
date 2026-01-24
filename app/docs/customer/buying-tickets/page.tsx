import { Breadcrumb } from "@/components/docs/Breadcrumb";
import { BrowserFrame } from "@/components/docs/BrowserFrame";
import { FeatureCard } from "@/components/docs/FeatureCard";
import { Ticket, CreditCard, QrCode, Mail } from "lucide-react";

export default function CustomerBuyingTicketsDocsPage() {
    return (
        <div className="animate-fade-in">
            <Breadcrumb
                items={[
                    { label: "Dokumentasi", href: "/docs" },
                    { label: "Customer", href: "/docs/customer" },
                    { label: "Beli Tiket" },
                ]}
            />

            <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight mb-4">
                Membeli Tiket
            </h1>
            <p className="text-xl text-slate-600 mb-8 leading-relaxed">
                Panduan lengkap untuk membeli tiket event di Gelaran.
            </p>

            {/* Screenshot */}
            <div className="mb-10">
                <h3 className="text-lg font-semibold text-slate-900 mb-2">Halaman Detail Event</h3>
                <p className="text-slate-600 mb-4 text-sm">
                    Pilih event dan kategori tiket yang Anda inginkan.
                </p>
                <BrowserFrame
                    src="/docs/images/customer-buying-tickets.png"
                    title="https://bsc.com/events/konser-musik"
                    alt="Customer Event Detail Screenshot"
                />
            </div>

            {/* Steps */}
            <h2 className="text-2xl font-bold text-slate-900 mb-6">Langkah Pembelian</h2>
            <ol className="list-decimal list-inside space-y-3 text-slate-600 mb-12">
                <li>Pilih event yang ingin Anda hadiri dari halaman utama</li>
                <li>Klik <strong>&quot;Beli Tiket&quot;</strong> dan pilih kategori tiket</li>
                <li>Masukkan jumlah tiket dan isi data pengunjung</li>
                <li>Pilih metode pembayaran (Bank, E-Wallet, QRIS, dll)</li>
                <li>Selesaikan pembayaran sebelum batas waktu</li>
                <li>Tiket otomatis dikirim ke email Anda</li>
            </ol>

            {/* Feature Cards */}
            <h2 className="text-2xl font-bold text-slate-900 mb-6">Metode Pembayaran</h2>
            <div className="grid md:grid-cols-2 gap-6 mb-12">
                <FeatureCard
                    icon={CreditCard}
                    title="Transfer Bank"
                    description="BCA, Mandiri, BNI, BRI - Virtual Account otomatis."
                    iconBgColor="bg-blue-100"
                    iconColor="text-blue-600"
                />
                <FeatureCard
                    icon={Ticket}
                    title="E-Wallet"
                    description="GoPay, OVO, DANA, ShopeePay - Bayar langsung dari HP."
                    iconBgColor="bg-green-100"
                    iconColor="text-green-600"
                />
                <FeatureCard
                    icon={QrCode}
                    title="QRIS"
                    description="Scan QR code dengan aplikasi m-banking atau e-wallet."
                    iconBgColor="bg-purple-100"
                    iconColor="text-purple-600"
                />
                <FeatureCard
                    icon={Mail}
                    title="Kartu Kredit/Debit"
                    description="Visa, Mastercard - Pembayaran aman dan instan."
                    iconBgColor="bg-amber-100"
                    iconColor="text-amber-600"
                />
            </div>

            {/* Footer */}
            <div className="mt-16 pt-8 border-t border-slate-200 flex justify-between items-center text-sm text-slate-500">
                <span>Terakhir diperbarui: Januari 2026</span>
            </div>
        </div>
    );
}
