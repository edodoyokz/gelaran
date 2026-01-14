import Link from "next/link";
import {
    Users,
    Target,
    Shield,
    Award,
    Sparkles,
    Globe,
    Heart,
    ArrowRight,
} from "lucide-react";
import type { Metadata } from "next";

export const metadata: Metadata = {
    title: "Tentang Kami - BSC Tickets",
    description: "BSC Tickets adalah platform ticketing event terpercaya di Indonesia. Kami membantu organizer dan penonton terhubung melalui pengalaman event yang luar biasa.",
};

const STATS = [
    { value: "500K+", label: "Tiket Terjual" },
    { value: "2,000+", label: "Event Sukses" },
    { value: "1,500+", label: "Organizer" },
    { value: "50+", label: "Kota" },
];

const VALUES = [
    {
        icon: Shield,
        title: "Terpercaya",
        description: "Keamanan transaksi dan data pengguna adalah prioritas utama kami.",
    },
    {
        icon: Sparkles,
        title: "Inovatif",
        description: "Selalu menghadirkan fitur-fitur terbaru untuk pengalaman terbaik.",
    },
    {
        icon: Heart,
        title: "Peduli",
        description: "Kami berkomitmen memberikan layanan pelanggan yang responsif.",
    },
    {
        icon: Globe,
        title: "Inklusif",
        description: "Platform yang mudah diakses oleh semua kalangan.",
    },
];

const TEAM = [
    { name: "Andi Wijaya", role: "CEO & Founder", image: "/team/ceo.jpg" },
    { name: "Sari Dewi", role: "CTO", image: "/team/cto.jpg" },
    { name: "Budi Santoso", role: "Head of Operations", image: "/team/ops.jpg" },
    { name: "Maya Putri", role: "Head of Marketing", image: "/team/marketing.jpg" },
];

export default function AboutPage() {
    return (
        <div className="min-h-screen bg-white">
            <section className="relative bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-500 text-white py-24 overflow-hidden">
                <div className="absolute inset-0 bg-black/20" />
                <div className="absolute inset-0">
                    <div className="absolute top-0 left-1/4 w-96 h-96 bg-white/10 rounded-full blur-3xl" />
                    <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-pink-500/20 rounded-full blur-3xl" />
                </div>
                <div className="relative max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                    <h1 className="text-4xl md:text-5xl font-bold mb-6">
                        Menghubungkan Orang Melalui Event
                    </h1>
                    <p className="text-xl text-white/90 max-w-3xl mx-auto">
                        BSC Tickets adalah platform ticketing event terpercaya yang membantu
                        organizer dan penonton terhubung melalui pengalaman event yang luar biasa.
                    </p>
                </div>
            </section>

            <section className="py-16 bg-gray-50">
                <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
                        {STATS.map((stat) => (
                            <div key={stat.label} className="text-center">
                                <div className="text-3xl md:text-4xl font-bold text-indigo-600 mb-2">
                                    {stat.value}
                                </div>
                                <div className="text-gray-600">{stat.label}</div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            <section className="py-20">
                <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid md:grid-cols-2 gap-12 items-center">
                        <div>
                            <div className="inline-flex items-center gap-2 px-3 py-1 bg-indigo-100 text-indigo-600 rounded-full text-sm font-medium mb-4">
                                <Target className="h-4 w-4" />
                                Misi Kami
                            </div>
                            <h2 className="text-3xl font-bold text-gray-900 mb-6">
                                Membuat Event Lebih Mudah Diakses
                            </h2>
                            <p className="text-gray-600 mb-4">
                                Kami percaya bahwa setiap orang berhak menikmati event-event berkualitas.
                                Misi kami adalah menyederhanakan proses pembelian tiket dan membantu
                                organizer menjangkau audiens yang lebih luas.
                            </p>
                            <p className="text-gray-600 mb-6">
                                Dengan teknologi modern dan tim yang berdedikasi, kami berkomitmen untuk
                                memberikan pengalaman ticketing terbaik bagi semua pihak.
                            </p>
                            <Link
                                href="/events"
                                className="inline-flex items-center gap-2 text-indigo-600 font-medium hover:text-indigo-500"
                            >
                                Jelajahi Event
                                <ArrowRight className="h-4 w-4" />
                            </Link>
                        </div>
                        <div className="relative">
                            <div className="aspect-square bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl overflow-hidden">
                                <div className="absolute inset-0 flex items-center justify-center">
                                    <Users className="h-32 w-32 text-white/30" />
                                </div>
                            </div>
                            <div className="absolute -bottom-6 -right-6 bg-white rounded-xl shadow-xl p-4">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-green-100 rounded-lg">
                                        <Award className="h-6 w-6 text-green-600" />
                                    </div>
                                    <div>
                                        <div className="font-bold text-gray-900">4.9/5</div>
                                        <div className="text-sm text-gray-500">Rating Pengguna</div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            <section className="py-20 bg-gray-50">
                <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-12">
                        <h2 className="text-3xl font-bold text-gray-900 mb-4">Nilai-Nilai Kami</h2>
                        <p className="text-gray-600 max-w-2xl mx-auto">
                            Prinsip-prinsip yang menjadi landasan dalam setiap keputusan dan layanan kami.
                        </p>
                    </div>
                    <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                        {VALUES.map((value) => {
                            const Icon = value.icon;
                            return (
                                <div
                                    key={value.title}
                                    className="bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow"
                                >
                                    <div className="p-3 bg-indigo-100 rounded-lg w-fit mb-4">
                                        <Icon className="h-6 w-6 text-indigo-600" />
                                    </div>
                                    <h3 className="text-lg font-bold text-gray-900 mb-2">{value.title}</h3>
                                    <p className="text-gray-600 text-sm">{value.description}</p>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </section>

            <section className="py-20">
                <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-12">
                        <h2 className="text-3xl font-bold text-gray-900 mb-4">Tim Kami</h2>
                        <p className="text-gray-600 max-w-2xl mx-auto">
                            Orang-orang hebat di balik BSC Tickets yang bekerja keras untuk memberikan
                            layanan terbaik.
                        </p>
                    </div>
                    <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
                        {TEAM.map((member) => (
                            <div key={member.name} className="text-center">
                                <div className="w-32 h-32 mx-auto bg-gradient-to-br from-indigo-400 to-purple-500 rounded-full mb-4 flex items-center justify-center">
                                    <span className="text-3xl font-bold text-white">
                                        {member.name.split(" ").map((n) => n[0]).join("")}
                                    </span>
                                </div>
                                <h3 className="font-bold text-gray-900">{member.name}</h3>
                                <p className="text-sm text-gray-500">{member.role}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            <section className="py-20 bg-indigo-600 text-white">
                <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                    <h2 className="text-3xl font-bold mb-4">Siap Membuat Event?</h2>
                    <p className="text-white/80 mb-8">
                        Bergabunglah dengan ribuan organizer yang telah mempercayakan event mereka kepada kami.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <Link
                            href="/register"
                            className="inline-flex items-center justify-center px-8 py-3 bg-white text-indigo-600 rounded-lg font-medium hover:bg-gray-100 transition-colors"
                        >
                            Daftar Sebagai Organizer
                        </Link>
                        <Link
                            href="/contact"
                            className="inline-flex items-center justify-center px-8 py-3 border-2 border-white text-white rounded-lg font-medium hover:bg-white/10 transition-colors"
                        >
                            Hubungi Kami
                        </Link>
                    </div>
                </div>
            </section>
        </div>
    );
}
