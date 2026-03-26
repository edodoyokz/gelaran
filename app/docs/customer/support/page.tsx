import { Breadcrumb } from "@/components/docs/Breadcrumb";
import { FeatureCard } from "@/components/docs/FeatureCard";
import { Mail, Phone, MessageCircle, Clock } from "lucide-react";

export default function CustomerSupportDocsPage() {
    return (
        <div className="animate-fade-in">
            <Breadcrumb
                items={[
                    { label: "Dokumentasi", href: "/docs" },
                    { label: "Customer", href: "/docs/customer" },
                    { label: "Hubungi Support" },
                ]}
            />

            <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight mb-4">
                Hubungi Support
            </h1>
            <p className="text-xl text-slate-600 mb-8 leading-relaxed">
                Butuh bantuan? Kami siap membantu Anda 24/7.
            </p>

            {/* Contact Cards */}
            <h2 className="text-2xl font-bold text-slate-900 mb-6">Cara Menghubungi Kami</h2>
            <div className="grid md:grid-cols-2 gap-6 mb-12">
                <FeatureCard
                    icon={Mail}
                    title="Email"
                    description="support@bsctickets.com - Respon dalam 24 jam."
                    iconBgColor="bg-blue-100"
                    iconColor="text-blue-600"
                />
                <FeatureCard
                    icon={Phone}
                    title="WhatsApp"
                    description="+62 812-3456-7890 - Respon cepat."
                    iconBgColor="bg-green-100"
                    iconColor="text-green-600"
                />
                <FeatureCard
                    icon={MessageCircle}
                    title="Live Chat"
                    description="Klik ikon chat di pojok kanan bawah."
                    iconBgColor="bg-purple-100"
                    iconColor="text-purple-600"
                />
                <FeatureCard
                    icon={Clock}
                    title="Jam Operasional"
                    description="Senin-Jumat: 09:00-18:00, Sabtu: 09:00-15:00."
                    iconBgColor="bg-amber-100"
                    iconColor="text-amber-600"
                />
            </div>

            {/* Contact Info */}
            <div className="p-6 bg-linear-to-br from-slate-50 to-slate-100 rounded-xl mb-12">
                <h3 className="font-bold text-slate-900 mb-4">Informasi Kontak Lengkap</h3>
                <div className="grid md:grid-cols-2 gap-4">
                    <div>
                        <p className="text-sm font-medium text-slate-500 mb-1">Email Support</p>
                        <a href="mailto:support@bsctickets.com" className="text-indigo-600 hover:underline">
                            support@bsctickets.com
                        </a>
                    </div>
                    <div>
                        <p className="text-sm font-medium text-slate-500 mb-1">WhatsApp</p>
                        <a href="https://wa.me/6281234567890" className="text-indigo-600 hover:underline">
                            +62 812-3456-7890
                        </a>
                    </div>
                    <div>
                        <p className="text-sm font-medium text-slate-500 mb-1">Jam Operasional</p>
                        <p className="text-slate-900">Senin - Jumat: 09:00 - 18:00 WIB</p>
                        <p className="text-slate-900">Sabtu: 09:00 - 15:00 WIB</p>
                    </div>
                    <div>
                        <p className="text-sm font-medium text-slate-500 mb-1">Waktu Respon</p>
                        <p className="text-slate-900">Maksimal 1x24 jam (hari kerja)</p>
                    </div>
                </div>
            </div>

            {/* Tips */}
            <h2 className="text-2xl font-bold text-slate-900 mb-6">Tips Menghubungi Support</h2>
            <ul className="list-disc list-inside space-y-2 text-slate-600 mb-12">
                <li>Sertakan nomor booking/transaksi jika ada masalah pembelian</li>
                <li>Jelaskan masalah dengan detail dan kronologis</li>
                <li>Lampirkan screenshot jika diperlukan</li>
                <li>Gunakan email yang terdaftar di akun Gelaran Anda</li>
            </ul>

            {/* Footer */}
            <div className="mt-16 pt-8 border-t border-slate-200 flex justify-between items-center text-sm text-slate-500">
                <span>Terakhir diperbarui: Januari 2026</span>
            </div>
        </div>
    );
}
