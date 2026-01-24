import { Breadcrumb } from "@/components/docs/Breadcrumb";
import { FeatureCard } from "@/components/docs/FeatureCard";
import { BrowserFrame } from "@/components/docs/BrowserFrame";
import { Users, Calendar, CreditCard, Shield } from "lucide-react";

export default function AdminDocsPage() {
    return (
        <div className="animate-fade-in">
            <Breadcrumb
                items={[
                    { label: "Dokumentasi", href: "/docs" },
                    { label: "Admin" },
                ]}
            />

            <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight mb-4">
                Admin Dashboard
            </h1>
            <p className="text-xl text-slate-600 mb-8 leading-relaxed">
                Selamat datang di panduan Admin BSC. Kelola pengguna, event, dan transaksi dari satu tempat.
            </p>

            {/* Screenshot */}
            <div className="mb-10">
                <h3 className="text-lg font-semibold text-slate-900 mb-2">Tampilan Dashboard</h3>
                <p className="text-slate-600 mb-4 text-sm">
                    Dashboard admin memberikan overview lengkap tentang aktivitas platform.
                </p>
                <BrowserFrame
                    src="/docs/images/admin-dashboard.png"
                    title="https://bsc.com/admin"
                    alt="Admin Dashboard Screenshot"
                />
            </div>

            {/* Feature Cards */}
            <h2 className="text-2xl font-bold text-slate-900 mb-6">Fitur Utama</h2>
            <div className="grid md:grid-cols-2 gap-6 mb-12">
                <FeatureCard
                    icon={Users}
                    title="User Management"
                    description="Kelola semua pengguna, ubah role, dan pantau aktivitas akun."
                    iconBgColor="bg-blue-100"
                    iconColor="text-blue-600"
                />
                <FeatureCard
                    icon={Calendar}
                    title="Event Moderation"
                    description="Review dan approve event baru dari organizer."
                    iconBgColor="bg-green-100"
                    iconColor="text-green-600"
                />
                <FeatureCard
                    icon={CreditCard}
                    title="Transactions"
                    description="Pantau semua transaksi, proses refund, dan kelola payout."
                    iconBgColor="bg-purple-100"
                    iconColor="text-purple-600"
                />
                <FeatureCard
                    icon={Shield}
                    title="Platform Settings"
                    description="Konfigurasi pengaturan platform dan payment gateway."
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
