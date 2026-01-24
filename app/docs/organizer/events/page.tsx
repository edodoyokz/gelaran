import { Breadcrumb } from "@/components/docs/Breadcrumb";
import { BrowserFrame } from "@/components/docs/BrowserFrame";
import { FeatureCard } from "@/components/docs/FeatureCard";
import { Calendar, Plus, Edit, Ticket } from "lucide-react";

export default function OrganizerEventsDocsPage() {
    return (
        <div className="animate-fade-in">
            <Breadcrumb
                items={[
                    { label: "Dokumentasi", href: "/docs" },
                    { label: "Organizer", href: "/docs/organizer" },
                    { label: "Kelola Event" },
                ]}
            />

            <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight mb-4">
                Kelola Event
            </h1>
            <p className="text-xl text-slate-600 mb-8 leading-relaxed">
                Panduan lengkap untuk membuat dan mengelola event Anda.
            </p>

            {/* Screenshot */}
            <div className="mb-10">
                <h3 className="text-lg font-semibold text-slate-900 mb-2">Tampilan Kelola Event</h3>
                <p className="text-slate-600 mb-4 text-sm">
                    Lihat semua event Anda dan kelola dari satu tempat.
                </p>
                <BrowserFrame
                    src="/docs/images/organizer-events.png"
                    title="https://bsc.com/organizer/events"
                    alt="Organizer Events Screenshot"
                />
            </div>

            {/* Feature Cards */}
            <h2 className="text-2xl font-bold text-slate-900 mb-6">Fitur Utama</h2>
            <div className="grid md:grid-cols-2 gap-6 mb-12">
                <FeatureCard
                    icon={Plus}
                    title="Buat Event Baru"
                    description="Buat event baru dengan form yang mudah diikuti."
                    iconBgColor="bg-indigo-100"
                    iconColor="text-indigo-600"
                />
                <FeatureCard
                    icon={Edit}
                    title="Edit Event"
                    description="Ubah informasi, tanggal, dan harga tiket kapan saja."
                    iconBgColor="bg-green-100"
                    iconColor="text-green-600"
                />
                <FeatureCard
                    icon={Ticket}
                    title="Kategori Tiket"
                    description="Kelola berbagai kategori tiket dengan harga berbeda."
                    iconBgColor="bg-amber-100"
                    iconColor="text-amber-600"
                />
                <FeatureCard
                    icon={Calendar}
                    title="Jadwal Event"
                    description="Atur waktu mulai, selesai, dan batas pembelian tiket."
                    iconBgColor="bg-blue-100"
                    iconColor="text-blue-600"
                />
            </div>

            {/* Status */}
            <h2 className="text-2xl font-bold text-slate-900 mb-6">Status Event</h2>
            <div className="grid gap-3 mb-12">
                <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg">
                    <span className="px-2 py-1 text-xs font-medium bg-slate-200 text-slate-800 rounded">Draft</span>
                    <span className="text-slate-600">Event belum dipublish, masih bisa diedit</span>
                </div>
                <div className="flex items-center gap-3 p-3 bg-yellow-50 rounded-lg">
                    <span className="px-2 py-1 text-xs font-medium bg-yellow-200 text-yellow-800 rounded">Pending</span>
                    <span className="text-slate-600">Menunggu approval dari admin</span>
                </div>
                <div className="flex items-center gap-3 p-3 bg-green-50 rounded-lg">
                    <span className="px-2 py-1 text-xs font-medium bg-green-200 text-green-800 rounded">Published</span>
                    <span className="text-slate-600">Event live dan bisa dibeli customer</span>
                </div>
                <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg">
                    <span className="px-2 py-1 text-xs font-medium bg-blue-200 text-blue-800 rounded">Completed</span>
                    <span className="text-slate-600">Event sudah selesai berlangsung</span>
                </div>
            </div>

            {/* Footer */}
            <div className="mt-16 pt-8 border-t border-slate-200 flex justify-between items-center text-sm text-slate-500">
                <span>Terakhir diperbarui: Januari 2026</span>
            </div>
        </div>
    );
}
