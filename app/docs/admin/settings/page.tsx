import { Breadcrumb } from "@/components/docs/Breadcrumb";
import { FeatureCard } from "@/components/docs/FeatureCard";
import { Settings, CreditCard, Mail, Globe } from "lucide-react";

export default function AdminSettingsDocsPage() {
    return (
        <div className="animate-fade-in">
            <Breadcrumb
                items={[
                    { label: "Dokumentasi", href: "/docs" },
                    { label: "Admin", href: "/docs/admin" },
                    { label: "Settings" },
                ]}
            />

            <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight mb-4">
                Platform Settings
            </h1>
            <p className="text-xl text-slate-600 mb-8 leading-relaxed">
                Panduan untuk mengonfigurasi pengaturan platform BSC.
            </p>

            {/* Feature Cards */}
            <h2 className="text-2xl font-bold text-slate-900 mb-6">Pengaturan Tersedia</h2>
            <div className="grid md:grid-cols-2 gap-6 mb-12">
                <FeatureCard
                    icon={Globe}
                    title="Pengaturan Umum"
                    description="Konfigurasi nama, logo, dan branding platform."
                    iconBgColor="bg-blue-100"
                    iconColor="text-blue-600"
                />
                <FeatureCard
                    icon={CreditCard}
                    title="Payment Gateway"
                    description="Konfigurasi Midtrans dan metode pembayaran lainnya."
                    iconBgColor="bg-green-100"
                    iconColor="text-green-600"
                />
                <FeatureCard
                    icon={Mail}
                    title="Email Notifikasi"
                    description="Atur template email dan konfigurasi SMTP."
                    iconBgColor="bg-purple-100"
                    iconColor="text-purple-600"
                />
                <FeatureCard
                    icon={Settings}
                    title="Biaya Platform"
                    description="Tentukan persentase fee platform untuk setiap transaksi."
                    iconBgColor="bg-amber-100"
                    iconColor="text-amber-600"
                />
            </div>

            {/* Settings List */}
            <h2 className="text-2xl font-bold text-slate-900 mb-6">Konfigurasi Penting</h2>
            <div className="space-y-4 mb-12">
                <div className="p-4 border border-slate-200 rounded-lg">
                    <h3 className="font-semibold text-slate-900 mb-2">Payment Gateway</h3>
                    <ul className="list-disc list-inside space-y-1 text-slate-600 text-sm">
                        <li>Server Key dan Client Key Midtrans</li>
                        <li>Mode sandbox atau production</li>
                        <li>Callback URL untuk webhook</li>
                    </ul>
                </div>
                <div className="p-4 border border-slate-200 rounded-lg">
                    <h3 className="font-semibold text-slate-900 mb-2">Platform Fee</h3>
                    <ul className="list-disc list-inside space-y-1 text-slate-600 text-sm">
                        <li>Persentase fee per transaksi (default: 5%)</li>
                        <li>Fee minimum per transaksi</li>
                        <li>Jadwal payout ke organizer</li>
                    </ul>
                </div>
            </div>

            {/* Footer */}
            <div className="mt-16 pt-8 border-t border-slate-200 flex justify-between items-center text-sm text-slate-500">
                <span>Terakhir diperbarui: Januari 2026</span>
            </div>
        </div>
    );
}
