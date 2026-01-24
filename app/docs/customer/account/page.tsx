import { Breadcrumb } from "@/components/docs/Breadcrumb";
import { FeatureCard } from "@/components/docs/FeatureCard";
import { User, Shield, Ticket, Edit } from "lucide-react";

export default function CustomerAccountDocsPage() {
    return (
        <div className="animate-fade-in">
            <Breadcrumb
                items={[
                    { label: "Dokumentasi", href: "/docs" },
                    { label: "Customer", href: "/docs/customer" },
                    { label: "Akun Saya" },
                ]}
            />

            <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight mb-4">
                Akun Saya
            </h1>
            <p className="text-xl text-slate-600 mb-8 leading-relaxed">
                Panduan untuk mengelola akun dan profil Anda.
            </p>

            {/* Feature Cards */}
            <h2 className="text-2xl font-bold text-slate-900 mb-6">Fitur Akun</h2>
            <div className="grid md:grid-cols-2 gap-6 mb-12">
                <FeatureCard
                    icon={Edit}
                    title="Edit Profil"
                    description="Ubah nama, foto profil, dan nomor telepon."
                    iconBgColor="bg-blue-100"
                    iconColor="text-blue-600"
                />
                <FeatureCard
                    icon={Shield}
                    title="Keamanan"
                    description="Ubah password dan aktifkan autentikasi 2 faktor."
                    iconBgColor="bg-green-100"
                    iconColor="text-green-600"
                />
                <FeatureCard
                    icon={Ticket}
                    title="Tiket Saya"
                    description="Lihat semua tiket yang sudah Anda beli."
                    iconBgColor="bg-purple-100"
                    iconColor="text-purple-600"
                />
                <FeatureCard
                    icon={User}
                    title="Riwayat Aktivitas"
                    description="Lihat log login dan aktivitas akun Anda."
                    iconBgColor="bg-amber-100"
                    iconColor="text-amber-600"
                />
            </div>

            {/* Settings */}
            <h2 className="text-2xl font-bold text-slate-900 mb-6">Pengaturan Profil</h2>
            <div className="space-y-4 mb-12">
                <div className="p-4 border border-slate-200 rounded-lg">
                    <h3 className="font-semibold text-slate-900 mb-2">Informasi Dasar</h3>
                    <ul className="list-disc list-inside space-y-1 text-slate-600 text-sm">
                        <li>Ubah nama dan foto profil</li>
                        <li>Update nomor telepon</li>
                        <li>Ubah email (memerlukan verifikasi)</li>
                    </ul>
                </div>
                <div className="p-4 border border-slate-200 rounded-lg">
                    <h3 className="font-semibold text-slate-900 mb-2">Keamanan Akun</h3>
                    <ul className="list-disc list-inside space-y-1 text-slate-600 text-sm">
                        <li>Ubah password secara berkala</li>
                        <li>Aktifkan autentikasi dua faktor (2FA)</li>
                        <li>Pantau riwayat login dari perangkat lain</li>
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
