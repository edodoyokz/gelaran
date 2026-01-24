import { Breadcrumb } from "@/components/docs/Breadcrumb";
import { BrowserFrame } from "@/components/docs/BrowserFrame";
import { FeatureCard } from "@/components/docs/FeatureCard";
import { Wallet, Building, ArrowDownToLine, Percent } from "lucide-react";

export default function OrganizerWalletDocsPage() {
    return (
        <div className="animate-fade-in">
            <Breadcrumb
                items={[
                    { label: "Dokumentasi", href: "/docs" },
                    { label: "Organizer", href: "/docs/organizer" },
                    { label: "Wallet & Payouts" },
                ]}
            />

            <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight mb-4">
                Wallet & Payouts
            </h1>
            <p className="text-xl text-slate-600 mb-8 leading-relaxed">
                Panduan untuk mengelola pendapatan dan penarikan dana.
            </p>

            {/* Screenshot */}
            <div className="mb-10">
                <h3 className="text-lg font-semibold text-slate-900 mb-2">Tampilan Wallet</h3>
                <p className="text-slate-600 mb-4 text-sm">
                    Pantau pendapatan dan tarik dana ke rekening bank Anda.
                </p>
                <BrowserFrame
                    src="/docs/images/organizer-wallet.png"
                    title="https://bsc.com/organizer/wallet"
                    alt="Organizer Wallet Screenshot"
                />
            </div>

            {/* Feature Cards */}
            <h2 className="text-2xl font-bold text-slate-900 mb-6">Fitur Wallet</h2>
            <div className="grid md:grid-cols-2 gap-6 mb-12">
                <FeatureCard
                    icon={Wallet}
                    title="Saldo Tersedia"
                    description="Lihat total pendapatan yang siap ditarik ke rekening."
                    iconBgColor="bg-green-100"
                    iconColor="text-green-600"
                />
                <FeatureCard
                    icon={Building}
                    title="Rekening Bank"
                    description="Daftarkan rekening bank untuk menerima payout."
                    iconBgColor="bg-blue-100"
                    iconColor="text-blue-600"
                />
                <FeatureCard
                    icon={ArrowDownToLine}
                    title="Tarik Dana"
                    description="Ajukan penarikan dana, diproses dalam 1-3 hari kerja."
                    iconBgColor="bg-indigo-100"
                    iconColor="text-indigo-600"
                />
                <FeatureCard
                    icon={Percent}
                    title="Biaya Platform"
                    description="Platform memotong 5% dari setiap transaksi."
                    iconBgColor="bg-amber-100"
                    iconColor="text-amber-600"
                />
            </div>

            {/* Steps */}
            <h2 className="text-2xl font-bold text-slate-900 mb-6">Cara Tarik Dana</h2>
            <ol className="list-decimal list-inside space-y-3 text-slate-600 mb-12">
                <li>Pastikan rekening bank sudah terdaftar di halaman <code className="bg-slate-100 px-2 py-0.5 rounded text-sm">Wallet → Bank Account</code></li>
                <li>Klik tombol <strong>&quot;Tarik Dana&quot;</strong> dan masukkan jumlah yang ingin ditarik</li>
                <li>Konfirmasi penarikan dengan memasukkan PIN atau password</li>
                <li>Dana akan diproses dan masuk ke rekening dalam 1-3 hari kerja</li>
            </ol>

            {/* Footer */}
            <div className="mt-16 pt-8 border-t border-slate-200 flex justify-between items-center text-sm text-slate-500">
                <span>Terakhir diperbarui: Januari 2026</span>
            </div>
        </div>
    );
}
