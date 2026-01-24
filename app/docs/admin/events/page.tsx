import { Breadcrumb } from "@/components/docs/Breadcrumb";
import { BrowserFrame } from "@/components/docs/BrowserFrame";
import { FeatureCard } from "@/components/docs/FeatureCard";
import { Calendar, CheckCircle, XCircle, Edit } from "lucide-react";

export default function AdminEventsDocsPage() {
    return (
        <div className="animate-fade-in">
            <Breadcrumb
                items={[
                    { label: "Dokumentasi", href: "/docs" },
                    { label: "Admin", href: "/docs/admin" },
                    { label: "Event Moderation" },
                ]}
            />

            <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight mb-4">
                Event Moderation
            </h1>
            <p className="text-xl text-slate-600 mb-8 leading-relaxed">
                Panduan untuk memoderasi dan mengelola event di platform Gelaran.
            </p>

            {/* Screenshot */}
            <div className="mb-10">
                <h3 className="text-lg font-semibold text-slate-900 mb-2">Tampilan Event Moderation</h3>
                <p className="text-slate-600 mb-4 text-sm">
                    Review dan kelola semua event yang masuk dari organizer.
                </p>
                <BrowserFrame
                    src="/docs/images/admin-events.png"
                    title="https://bsc.com/admin/events"
                    alt="Admin Event Moderation Screenshot"
                />
            </div>

            {/* Feature Cards */}
            <h2 className="text-2xl font-bold text-slate-900 mb-6">Fitur Utama</h2>
            <div className="grid md:grid-cols-2 gap-6 mb-12">
                <FeatureCard
                    icon={Calendar}
                    title="Review Event"
                    description="Lihat detail dan informasi event baru yang menunggu approval."
                    iconBgColor="bg-blue-100"
                    iconColor="text-blue-600"
                />
                <FeatureCard
                    icon={CheckCircle}
                    title="Approve Event"
                    description="Setujui event yang sudah sesuai untuk dipublikasikan."
                    iconBgColor="bg-green-100"
                    iconColor="text-green-600"
                />
                <FeatureCard
                    icon={XCircle}
                    title="Reject Event"
                    description="Tolak event dengan catatan untuk perbaikan oleh organizer."
                    iconBgColor="bg-red-100"
                    iconColor="text-red-600"
                />
                <FeatureCard
                    icon={Edit}
                    title="Edit Event"
                    description="Edit informasi event jika diperlukan penyesuaian minor."
                    iconBgColor="bg-amber-100"
                    iconColor="text-amber-600"
                />
            </div>

            {/* Workflow */}
            <h2 className="text-2xl font-bold text-slate-900 mb-6">Workflow Moderasi</h2>
            <ol className="list-decimal list-inside space-y-3 text-slate-600 mb-12">
                <li>Event baru masuk dengan status <code className="bg-slate-100 px-2 py-0.5 rounded text-sm">Pending</code></li>
                <li>Admin mereview detail event (deskripsi, harga, tanggal)</li>
                <li>Admin menyetujui atau menolak dengan catatan</li>
                <li>Organizer mendapat notifikasi hasil moderasi</li>
            </ol>

            {/* Footer */}
            <div className="mt-16 pt-8 border-t border-slate-200 flex justify-between items-center text-sm text-slate-500">
                <span>Terakhir diperbarui: Januari 2026</span>
            </div>
        </div>
    );
}
