"use client";

import { useState } from "react";
import Link from "next/link";
import {
    Mail,
    Phone,
    MapPin,
    Clock,
    Send,
    MessageSquare,
    Loader2,
    CheckCircle,
    Instagram,
    Facebook,
    Twitter,
} from "lucide-react";

const CONTACT_INFO = [
    {
        icon: Mail,
        label: "Email",
        value: "support@bsctickets.com",
        link: "mailto:support@bsctickets.com",
    },
    {
        icon: Phone,
        label: "Telepon",
        value: "+62 21 1234 5678",
        link: "tel:+622112345678",
    },
    {
        icon: MapPin,
        label: "Alamat",
        value: "Jl. Sudirman No. 123, Jakarta Pusat, 10220",
        link: "https://maps.google.com",
    },
    {
        icon: Clock,
        label: "Jam Operasional",
        value: "Senin - Jumat, 09:00 - 18:00 WIB",
        link: null,
    },
];

const FAQ_ITEMS = [
    {
        question: "Bagaimana cara membeli tiket?",
        answer: "Pilih event yang ingin Anda hadiri, pilih jenis tiket dan jumlah, lalu lakukan pembayaran melalui metode yang tersedia.",
    },
    {
        question: "Apakah tiket bisa di-refund?",
        answer: "Kebijakan refund tergantung pada masing-masing organizer. Silakan cek halaman event untuk informasi lebih lanjut.",
    },
    {
        question: "Bagaimana cara menjadi organizer?",
        answer: "Daftar akun sebagai organizer, lengkapi profil Anda, dan mulai buat event pertama Anda.",
    },
    {
        question: "Berapa biaya platform untuk organizer?",
        answer: "Gelaran mengambil fee sebesar 5% dari setiap transaksi tiket yang berhasil.",
    },
];

export default function ContactPage() {
    const [formData, setFormData] = useState({
        name: "",
        email: "",
        subject: "",
        message: "",
    });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitted, setSubmitted] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        await new Promise((resolve) => setTimeout(resolve, 1500));
        setSubmitted(true);
        setIsSubmitting(false);
    };

    const handleInputChange = (field: string, value: string) => {
        setFormData((prev) => ({ ...prev, [field]: value }));
    };

    return (
        <div className="min-h-screen bg-gray-50">
            <section className="bg-gradient-to-br from-indigo-600 to-purple-600 text-white py-20">
                <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                    <h1 className="text-4xl font-bold mb-4">Hubungi Kami</h1>
                    <p className="text-xl text-white/90 max-w-2xl mx-auto">
                        Punya pertanyaan atau butuh bantuan? Tim kami siap membantu Anda.
                    </p>
                </div>
            </section>

            <section className="py-16">
                <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid lg:grid-cols-3 gap-8">
                        <div className="lg:col-span-2">
                            <div className="bg-white rounded-2xl shadow-sm p-8">
                                <div className="flex items-center gap-3 mb-6">
                                    <div className="p-2 bg-indigo-100 rounded-lg">
                                        <MessageSquare className="h-6 w-6 text-indigo-600" />
                                    </div>
                                    <h2 className="text-2xl font-bold text-gray-900">Kirim Pesan</h2>
                                </div>

                                {submitted ? (
                                    <div className="text-center py-12">
                                        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                            <CheckCircle className="h-8 w-8 text-green-600" />
                                        </div>
                                        <h3 className="text-xl font-bold text-gray-900 mb-2">
                                            Pesan Terkirim!
                                        </h3>
                                        <p className="text-gray-600 mb-6">
                                            Terima kasih telah menghubungi kami. Tim kami akan membalas dalam 1x24 jam.
                                        </p>
                                        <button
                                            type="button"
                                            onClick={() => {
                                                setSubmitted(false);
                                                setFormData({ name: "", email: "", subject: "", message: "" });
                                            }}
                                            className="text-indigo-600 font-medium hover:text-indigo-500"
                                        >
                                            Kirim pesan lainnya
                                        </button>
                                    </div>
                                ) : (
                                    <form onSubmit={handleSubmit} className="space-y-6">
                                        <div className="grid md:grid-cols-2 gap-6">
                                            <div>
                                                <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                                                    Nama Lengkap
                                                </label>
                                                <input
                                                    id="name"
                                                    type="text"
                                                    required
                                                    value={formData.name}
                                                    onChange={(e) => handleInputChange("name", e.target.value)}
                                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                                    placeholder="John Doe"
                                                />
                                            </div>
                                            <div>
                                                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                                                    Email
                                                </label>
                                                <input
                                                    id="email"
                                                    type="email"
                                                    required
                                                    value={formData.email}
                                                    onChange={(e) => handleInputChange("email", e.target.value)}
                                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                                    placeholder="john@email.com"
                                                />
                                            </div>
                                        </div>

                                        <div>
                                            <label htmlFor="subject" className="block text-sm font-medium text-gray-700 mb-1">
                                                Subjek
                                            </label>
                                            <select
                                                id="subject"
                                                required
                                                value={formData.subject}
                                                onChange={(e) => handleInputChange("subject", e.target.value)}
                                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                            >
                                                <option value="">Pilih subjek</option>
                                                <option value="general">Pertanyaan Umum</option>
                                                <option value="booking">Masalah Booking</option>
                                                <option value="payment">Masalah Pembayaran</option>
                                                <option value="refund">Pengajuan Refund</option>
                                                <option value="organizer">Menjadi Organizer</option>
                                                <option value="partnership">Kerjasama</option>
                                                <option value="other">Lainnya</option>
                                            </select>
                                        </div>

                                        <div>
                                            <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-1">
                                                Pesan
                                            </label>
                                            <textarea
                                                id="message"
                                                required
                                                rows={5}
                                                value={formData.message}
                                                onChange={(e) => handleInputChange("message", e.target.value)}
                                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
                                                placeholder="Tuliskan pesan Anda..."
                                            />
                                        </div>

                                        <button
                                            type="submit"
                                            disabled={isSubmitting}
                                            className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 transition-colors disabled:opacity-50"
                                        >
                                            {isSubmitting ? (
                                                <>
                                                    <Loader2 className="h-5 w-5 animate-spin" />
                                                    Mengirim...
                                                </>
                                            ) : (
                                                <>
                                                    <Send className="h-5 w-5" />
                                                    Kirim Pesan
                                                </>
                                            )}
                                        </button>
                                    </form>
                                )}
                            </div>
                        </div>

                        <div className="space-y-6">
                            <div className="bg-white rounded-2xl shadow-sm p-6">
                                <h3 className="text-lg font-bold text-gray-900 mb-4">Informasi Kontak</h3>
                                <div className="space-y-4">
                                    {CONTACT_INFO.map((info) => {
                                        const Icon = info.icon;
                                        const content = (
                                            <div className="flex items-start gap-3">
                                                <div className="p-2 bg-indigo-100 rounded-lg flex-shrink-0">
                                                    <Icon className="h-5 w-5 text-indigo-600" />
                                                </div>
                                                <div>
                                                    <p className="text-sm text-gray-500">{info.label}</p>
                                                    <p className="text-gray-900 font-medium">{info.value}</p>
                                                </div>
                                            </div>
                                        );

                                        if (info.link) {
                                            return (
                                                <a
                                                    key={info.label}
                                                    href={info.link}
                                                    className="block hover:bg-gray-50 -mx-2 px-2 py-2 rounded-lg transition-colors"
                                                    target={info.link.startsWith("http") ? "_blank" : undefined}
                                                    rel={info.link.startsWith("http") ? "noopener noreferrer" : undefined}
                                                >
                                                    {content}
                                                </a>
                                            );
                                        }

                                        return <div key={info.label}>{content}</div>;
                                    })}
                                </div>
                            </div>

                            <div className="bg-white rounded-2xl shadow-sm p-6">
                                <h3 className="text-lg font-bold text-gray-900 mb-4">Ikuti Kami</h3>
                                <div className="flex gap-3">
                                    <a
                                        href="https://instagram.com"
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="p-3 bg-gradient-to-br from-purple-500 to-pink-500 text-white rounded-lg hover:opacity-90 transition-opacity"
                                    >
                                        <Instagram className="h-5 w-5" />
                                    </a>
                                    <a
                                        href="https://facebook.com"
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="p-3 bg-blue-600 text-white rounded-lg hover:opacity-90 transition-opacity"
                                    >
                                        <Facebook className="h-5 w-5" />
                                    </a>
                                    <a
                                        href="https://twitter.com"
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="p-3 bg-sky-500 text-white rounded-lg hover:opacity-90 transition-opacity"
                                    >
                                        <Twitter className="h-5 w-5" />
                                    </a>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            <section className="py-16 bg-white">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                    <h2 className="text-2xl font-bold text-gray-900 text-center mb-8">
                        Pertanyaan yang Sering Diajukan
                    </h2>
                    <div className="space-y-4">
                        {FAQ_ITEMS.map((faq) => (
                            <div key={faq.question} className="bg-gray-50 rounded-xl p-6">
                                <h3 className="font-bold text-gray-900 mb-2">{faq.question}</h3>
                                <p className="text-gray-600">{faq.answer}</p>
                            </div>
                        ))}
                    </div>
                    <div className="text-center mt-8">
                        <Link
                            href="/faq"
                            className="text-indigo-600 font-medium hover:text-indigo-500"
                        >
                            Lihat semua FAQ →
                        </Link>
                    </div>
                </div>
            </section>
        </div>
    );
}
