import { Breadcrumb } from "@/components/docs/Breadcrumb";
import { FeatureCard } from "@/components/docs/FeatureCard";
import { BrowserFrame } from "@/components/docs/BrowserFrame";
import { Ticket, User, HelpCircle, MessageCircle } from "lucide-react";

export default function CustomerDocsPage() {
    return (
        <div className="animate-fade-in">
            <Breadcrumb
                items={[
                    { label: "Dokumentasi", href: "/docs" },
                    { label: "Panduan Pengguna" },
                ]}
            />

            <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight mb-4">
                Selamat Datang di Gelaran
            </h1>
            <p className="text-xl text-slate-600 mb-8 leading-relaxed">
                Temukan dan beli tiket event favorit Anda dengan mudah. Ikuti panduan ini untuk memulai.
            </p>

            {/* Screenshot */}
            <div className="mb-10">
                <BrowserFrame
                    src="/docs/images/customer-home.png"
                    title="https://bsc.com"
                    alt="Gelaran Halaman Utama"
                />
            </div>

            {/* Feature Cards */}
            <h2 className="text-2xl font-bold text-slate-900 mb-6">Mulai Dari Sini</h2>
            <div className="grid md:grid-cols-2 gap-6 mb-12">
                <FeatureCard
                    icon={Ticket}
                    title="Beli Tiket"
                    description="Pelajari cara mencari event, memilih tiket, dan melakukan pembayaran."
                    iconBgColor="bg-blue-100"
                    iconColor="text-blue-600"
                />
                <FeatureCard
                    icon={User}
                    title="Akun Saya"
                    description="Kelola profil, lihat riwayat pembelian, dan download tiket Anda."
                    iconBgColor="bg-green-100"
                    iconColor="text-green-600"
                />
                <FeatureCard
                    icon={HelpCircle}
                    title="FAQ"
                    description="Jawaban untuk pertanyaan yang sering diajukan pengguna."
                    iconBgColor="bg-amber-100"
                    iconColor="text-amber-600"
                />
                <FeatureCard
                    icon={MessageCircle}
                    title="Hubungi Support"
                    description="Tim kami siap membantu jika Anda mengalami kendala."
                    iconBgColor="bg-purple-100"
                    iconColor="text-purple-600"
                />
            </div>

            {/* Quick Start */}
            <div className="p-6 bg-slate-50 rounded-xl border border-slate-200 mb-8">
                <h3 className="font-bold text-slate-900 mb-4">🚀 Langkah Cepat</h3>
                <ol className="list-decimal list-inside space-y-2 text-slate-600">
                    <li>Jelajahi event di halaman utama</li>
                    <li>Pilih event dan kategori tiket</li>
                    <li>Isi data dan selesaikan pembayaran</li>
                    <li>Tiket dikirim ke email Anda</li>
                    <li>Tunjukkan QR code saat check-in</li>
                </ol>
            </div>

            {/* Footer */}
            <div className="mt-16 pt-8 border-t border-slate-200 flex justify-between items-center text-sm text-slate-500">
                <span>Terakhir diperbarui: Januari 2026</span>
            </div>
        </div>
    );
}
