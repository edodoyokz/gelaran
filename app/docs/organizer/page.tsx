import { Breadcrumb } from "@/components/docs/Breadcrumb";
import { FeatureCard } from "@/components/docs/FeatureCard";
import { BrowserFrame } from "@/components/docs/BrowserFrame";
import { Calendar, ScanLine, Wallet, Users } from "lucide-react";

export default function OrganizerDocsPage() {
    return (
        <div className="animate-fade-in">
            <Breadcrumb
                items={[
                    { label: "Dokumentasi", href: "/docs" },
                    { label: "Organizer" },
                ]}
            />

            <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight mb-4">
                Organizer Dashboard
            </h1>
            <p className="text-xl text-slate-600 mb-8 leading-relaxed">
                Buat dan kelola event Anda dengan mudah. Pantau penjualan tiket dan check-in secara real-time.
            </p>

            {/* Screenshot */}
            <div className="mb-10">
                <h3 className="text-lg font-semibold text-slate-900 mb-2">Dashboard Organizer</h3>
                <p className="text-slate-600 mb-4 text-sm">
                    Lihat statistik penjualan, event aktif, dan pendapatan dalam satu tampilan.
                </p>
                <BrowserFrame
                    src="/docs/images/organizer-dashboard.png"
                    title="https://bsc.com/organizer"
                    alt="Organizer Dashboard Screenshot"
                />
            </div>

            {/* Feature Cards */}
            <h2 className="text-2xl font-bold text-slate-900 mb-6">Fitur Organizer</h2>
            <div className="grid md:grid-cols-2 gap-6 mb-12">
                <FeatureCard
                    icon={Calendar}
                    title="Kelola Event"
                    description="Buat event baru, edit informasi, dan kelola kategori tiket."
                    iconBgColor="bg-indigo-100"
                    iconColor="text-indigo-600"
                />
                <FeatureCard
                    icon={ScanLine}
                    title="Gate & POS"
                    description="Scan tiket pengunjung dan jual tiket langsung di lokasi."
                    iconBgColor="bg-green-100"
                    iconColor="text-green-600"
                />
                <FeatureCard
                    icon={Wallet}
                    title="Wallet & Payouts"
                    description="Pantau pendapatan dan tarik dana ke rekening bank Anda."
                    iconBgColor="bg-amber-100"
                    iconColor="text-amber-600"
                />
                <FeatureCard
                    icon={Users}
                    title="Tim Management"
                    description="Tambahkan anggota tim dan atur akses mereka."
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
