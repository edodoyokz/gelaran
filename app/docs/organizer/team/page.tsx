import { Breadcrumb } from "@/components/docs/Breadcrumb";
import { BrowserFrame } from "@/components/docs/BrowserFrame";
import { FeatureCard } from "@/components/docs/FeatureCard";
import { Users, UserPlus, Shield, Eye } from "lucide-react";

export default function OrganizerTeamDocsPage() {
    return (
        <div className="animate-fade-in">
            <Breadcrumb
                items={[
                    { label: "Dokumentasi", href: "/docs" },
                    { label: "Organizer", href: "/docs/organizer" },
                    { label: "Tim" },
                ]}
            />

            <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight mb-4">
                Team Management
            </h1>
            <p className="text-xl text-slate-600 mb-8 leading-relaxed">
                Panduan untuk mengelola tim dan akses staff event Anda.
            </p>

            {/* Screenshot */}
            <div className="mb-10">
                <h3 className="text-lg font-semibold text-slate-900 mb-2">Tampilan Team Management</h3>
                <p className="text-slate-600 mb-4 text-sm">
                    Kelola anggota tim dan atur hak akses mereka.
                </p>
                <BrowserFrame
                    src="/docs/images/organizer-team.png"
                    title="https://bsc.com/organizer/team"
                    alt="Organizer Team Screenshot"
                />
            </div>

            {/* Feature Cards */}
            <h2 className="text-2xl font-bold text-slate-900 mb-6">Fitur Team Management</h2>
            <div className="grid md:grid-cols-2 gap-6 mb-12">
                <FeatureCard
                    icon={UserPlus}
                    title="Tambah Anggota"
                    description="Undang anggota tim baru dengan email mereka."
                    iconBgColor="bg-indigo-100"
                    iconColor="text-indigo-600"
                />
                <FeatureCard
                    icon={Shield}
                    title="Atur Role"
                    description="Tentukan role dan hak akses setiap anggota."
                    iconBgColor="bg-green-100"
                    iconColor="text-green-600"
                />
            </div>

            {/* Roles */}
            <h2 className="text-2xl font-bold text-slate-900 mb-6">Role Anggota Tim</h2>
            <div className="space-y-4 mb-12">
                <div className="p-4 border border-slate-200 rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                        <Users className="w-5 h-5 text-purple-600" />
                        <h3 className="font-semibold text-slate-900">Owner</h3>
                    </div>
                    <p className="text-sm text-slate-600">Akses penuh ke semua fitur termasuk wallet dan pengaturan.</p>
                </div>
                <div className="p-4 border border-slate-200 rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                        <Shield className="w-5 h-5 text-blue-600" />
                        <h3 className="font-semibold text-slate-900">Manager</h3>
                    </div>
                    <p className="text-sm text-slate-600">Dapat mengelola event, melihat laporan, dan mengundang staff.</p>
                </div>
                <div className="p-4 border border-slate-200 rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                        <UserPlus className="w-5 h-5 text-green-600" />
                        <h3 className="font-semibold text-slate-900">Staff</h3>
                    </div>
                    <p className="text-sm text-slate-600">Akses terbatas ke Gate & POS untuk check-in dan penjualan on-site.</p>
                </div>
                <div className="p-4 border border-slate-200 rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                        <Eye className="w-5 h-5 text-amber-600" />
                        <h3 className="font-semibold text-slate-900">Viewer</h3>
                    </div>
                    <p className="text-sm text-slate-600">Hanya bisa melihat laporan dan statistik, tidak bisa mengedit.</p>
                </div>
            </div>

            {/* Footer */}
            <div className="mt-16 pt-8 border-t border-slate-200 flex justify-between items-center text-sm text-slate-500">
                <span>Terakhir diperbarui: Januari 2026</span>
            </div>
        </div>
    );
}
