import { Breadcrumb } from "@/components/docs/Breadcrumb";
import { BrowserFrame } from "@/components/docs/BrowserFrame";
import { FeatureCard } from "@/components/docs/FeatureCard";
import { Users, Shield, Edit, History } from "lucide-react";

export default function AdminUsersDocsPage() {
    return (
        <div className="animate-fade-in">
            <Breadcrumb
                items={[
                    { label: "Dokumentasi", href: "/docs" },
                    { label: "Admin", href: "/docs/admin" },
                    { label: "User Management" },
                ]}
            />

            <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight mb-4">
                User Management
            </h1>
            <p className="text-xl text-slate-600 mb-8 leading-relaxed">
                Panduan lengkap untuk mengelola pengguna di platform BSC.
            </p>

            {/* Screenshot */}
            <div className="mb-10">
                <h3 className="text-lg font-semibold text-slate-900 mb-2">Tampilan User Management</h3>
                <p className="text-slate-600 mb-4 text-sm">
                    Kelola semua pengguna dari satu dashboard yang terintegrasi.
                </p>
                <BrowserFrame
                    src="/docs/images/admin-users.png"
                    title="https://bsc.com/admin/users"
                    alt="Admin User Management Screenshot"
                />
            </div>

            {/* Feature Cards */}
            <h2 className="text-2xl font-bold text-slate-900 mb-6">Fitur Utama</h2>
            <div className="grid md:grid-cols-2 gap-6 mb-12">
                <FeatureCard
                    icon={Users}
                    title="Daftar Pengguna"
                    description="Lihat semua pengguna yang terdaftar beserta role dan statusnya."
                    iconBgColor="bg-blue-100"
                    iconColor="text-blue-600"
                />
                <FeatureCard
                    icon={Edit}
                    title="Ubah Role"
                    description="Mengubah role pengguna menjadi Customer, Organizer, atau Admin."
                    iconBgColor="bg-green-100"
                    iconColor="text-green-600"
                />
                <FeatureCard
                    icon={Shield}
                    title="Status Akun"
                    description="Aktifkan atau nonaktifkan akun pengguna sesuai kebutuhan."
                    iconBgColor="bg-amber-100"
                    iconColor="text-amber-600"
                />
                <FeatureCard
                    icon={History}
                    title="Riwayat Aktivitas"
                    description="Pantau aktivitas login dan perubahan data pengguna."
                    iconBgColor="bg-purple-100"
                    iconColor="text-purple-600"
                />
            </div>

            {/* Footer */}
            <div className="mt-16 pt-8 border-t border-slate-200 flex justify-between items-center text-sm text-slate-500">
                <span>Terakhir diperbarui: Januari 2026</span>
            </div>
        </div>
    );
}
