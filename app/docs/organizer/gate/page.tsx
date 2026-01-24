import { Breadcrumb } from "@/components/docs/Breadcrumb";
import { BrowserFrame } from "@/components/docs/BrowserFrame";
import { FeatureCard } from "@/components/docs/FeatureCard";
import { ScanLine, CreditCard, Printer, WifiOff } from "lucide-react";

export default function OrganizerGateDocsPage() {
    return (
        <div className="animate-fade-in">
            <Breadcrumb
                items={[
                    { label: "Dokumentasi", href: "/docs" },
                    { label: "Organizer", href: "/docs/organizer" },
                    { label: "Gate & POS" },
                ]}
            />

            <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight mb-4">
                Gate & POS System
            </h1>
            <p className="text-xl text-slate-600 mb-8 leading-relaxed">
                Panduan untuk sistem check-in dan point of sale di event Anda.
            </p>

            {/* Screenshot */}
            <div className="mb-10">
                <h3 className="text-lg font-semibold text-slate-900 mb-2">Tampilan Gate & POS</h3>
                <p className="text-slate-600 mb-4 text-sm">
                    Interface yang mudah digunakan untuk check-in pengunjung.
                </p>
                <BrowserFrame
                    src="/docs/images/organizer-gate.png"
                    title="https://bsc.com/organizer/gate"
                    alt="Organizer Gate POS Screenshot"
                />
            </div>

            {/* Feature Cards */}
            <h2 className="text-2xl font-bold text-slate-900 mb-6">Fitur Gate (Check-in)</h2>
            <div className="grid md:grid-cols-2 gap-6 mb-12">
                <FeatureCard
                    icon={ScanLine}
                    title="Scan QR Code"
                    description="Scan QR code tiket pengunjung dengan kamera HP atau scanner."
                    iconBgColor="bg-indigo-100"
                    iconColor="text-indigo-600"
                />
                <FeatureCard
                    icon={WifiOff}
                    title="Mode Offline"
                    description="Tetap bisa check-in meski tanpa koneksi internet."
                    iconBgColor="bg-green-100"
                    iconColor="text-green-600"
                />
            </div>

            <h2 className="text-2xl font-bold text-slate-900 mb-6">Fitur POS</h2>
            <div className="grid md:grid-cols-2 gap-6 mb-12">
                <FeatureCard
                    icon={CreditCard}
                    title="Jual Tiket On-Site"
                    description="Jual tiket langsung di lokasi dengan pembayaran tunai atau QRIS."
                    iconBgColor="bg-amber-100"
                    iconColor="text-amber-600"
                />
                <FeatureCard
                    icon={Printer}
                    title="Cetak Tiket"
                    description="Cetak tiket instan setelah pembayaran berhasil."
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
