"use client";

import { useState } from "react";
import Link from "next/link";
import {
    CheckCircle,
    Clock,
    Facebook,
    Instagram,
    Mail,
    MapPin,
    MessageSquare,
    Phone,
    Send,
    Twitter,
} from "lucide-react";
import {
    EditorialPanel,
    InfoCard,
    MarketingHero,
    PublicPageShell,
    PublicSection,
} from "@/components/shared/public-marketing";

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
        label: "Jam operasional",
        value: "Senin - Jumat, 09:00 - 18:00 WIB",
        link: null,
    },
];

const FAQ_ITEMS = [
    {
        question: "Bagaimana cara membeli tiket?",
        answer: "Pilih event yang ingin Anda hadiri, tentukan jenis tiket dan jumlahnya, lalu selesaikan pembayaran melalui metode yang tersedia.",
    },
    {
        question: "Apakah tiket bisa di-refund?",
        answer: "Kebijakan refund mengikuti aturan masing-masing organizer. Informasi lengkap dapat dilihat di halaman detail event terkait.",
    },
    {
        question: "Bagaimana cara menjadi organizer?",
        answer: "Buat akun, ajukan profil organizer, lalu lengkapi informasi organisasi Anda agar tim kami dapat meninjau pengajuan tersebut.",
    },
    {
        question: "Berapa biaya platform untuk organizer?",
        answer: "Struktur biaya disesuaikan dengan kebijakan platform dan kebutuhan operasional. Tim kami dapat menjelaskan detailnya melalui kanal kontak resmi.",
    },
];

const SOCIALS = [
    {
        label: "Instagram",
        href: "https://instagram.com",
        icon: Instagram,
        className: "hover:border-pink-200 hover:bg-pink-50 hover:text-pink-600",
    },
    {
        label: "Facebook",
        href: "https://facebook.com",
        icon: Facebook,
        className: "hover:border-blue-200 hover:bg-blue-50 hover:text-blue-600",
    },
    {
        label: "Twitter / X",
        href: "https://twitter.com",
        icon: Twitter,
        className: "hover:border-sky-200 hover:bg-sky-50 hover:text-sky-600",
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

    const handleSubmit = async (event: React.FormEvent) => {
        event.preventDefault();
        setIsSubmitting(true);
        await new Promise((resolve) => setTimeout(resolve, 1500));
        setSubmitted(true);
        setIsSubmitting(false);
    };

    const handleInputChange = (field: string, value: string) => {
        setFormData((prev) => ({ ...prev, [field]: value }));
    };

    return (
        <PublicPageShell
            hero={
                <MarketingHero
                    eyebrow="Contact Gelaran"
                    title={<>Butuh bantuan, klarifikasi, atau ingin memulai percakapan dengan tim <em className="text-(--accent-secondary) not-italic">Gelaran</em>?</>}
                    description={
                        <p>
                            Halaman ini dirancang sebagai titik kontak publik yang lebih rapi—menyatukan formulir, kanal komunikasi, dan FAQ ringan dalam pengalaman yang konsisten dengan landing pages Gelaran.
                        </p>
                    }
                    primaryCta={{ href: "#contact-form", label: "Kirim pesan" }}
                    secondaryCta={{ href: "/become-organizer", label: "Jadi organizer" }}
                    aside={
                        <EditorialPanel className="max-w-xl space-y-5">
                            <div className="space-y-3">
                                <p className="text-xs font-semibold uppercase tracking-[0.24em] text-(--text-muted)">
                                    Fast response lane
                                </p>
                                <h2 className="font-(--font-editorial) text-3xl leading-tight tracking-(--tracking-display) text-foreground sm:text-4xl">
                                    Tim kami meninjau pesan terkait support, partnership, dan organizer onboarding.
                                </h2>
                            </div>
                            <div className="grid gap-3 sm:grid-cols-2">
                                {CONTACT_INFO.slice(0, 2).map((item) => (
                                    <InfoCard
                                        key={item.label}
                                        label={item.label}
                                        value={item.value}
                                        icon={item.icon}
                                        href={item.link}
                                    />
                                ))}
                            </div>
                            <p className="text-sm leading-7 text-(--text-secondary)">
                                Untuk pertanyaan yang lebih cepat dijawab, gunakan subjek yang paling relevan saat mengirim pesan melalui formulir di bawah.
                            </p>
                        </EditorialPanel>
                    }
                />
            }
        >
            <PublicSection
                eyebrow="Get in touch"
                title="Kirim pesan tanpa kehilangan konteks"
                description="Formulir dan informasi kontak ditempatkan berdampingan agar pengguna bisa memilih kanal terbaik sesuai kebutuhan mereka."
                className="pt-0"
            >
                <div className="grid gap-6 lg:grid-cols-[minmax(0,1.1fr)_minmax(19rem,0.9fr)]">
                    <EditorialPanel className="p-6 sm:p-8" >
                        <div id="contact-form" className="scroll-mt-32 space-y-6">
                            <div className="flex items-center gap-3">
                                <span className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-(--surface-brand-soft) text-(--accent-primary) shadow-(--shadow-xs)">
                                    <MessageSquare className="h-5 w-5" />
                                </span>
                                <div>
                                    <h2 className="text-2xl font-semibold tracking-(--tracking-heading) text-foreground">
                                        Kirim pesan
                                    </h2>
                                    <p className="text-sm text-(--text-secondary) sm:text-base">
                                        Ceritakan kebutuhan Anda dan tim kami akan menindaklanjuti secepatnya.
                                    </p>
                                </div>
                            </div>

                            {submitted ? (
                                <div className="rounded-3xl border border-[rgba(19,135,108,0.24)] bg-(--success-bg) p-8 text-center">
                                    <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-white text-(--success) shadow-(--shadow-xs)">
                                        <CheckCircle className="h-8 w-8" />
                                    </div>
                                    <h3 className="mt-5 text-2xl font-semibold tracking-(--tracking-heading) text-foreground">
                                        Pesan terkirim
                                    </h3>
                                    <p className="mx-auto mt-3 max-w-xl text-sm leading-7 text-(--text-secondary) sm:text-base">
                                        Terima kasih telah menghubungi kami. Tim Gelaran akan membalas dalam 1×24 jam kerja melalui email yang Anda cantumkan.
                                    </p>
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setSubmitted(false);
                                            setFormData({ name: "", email: "", subject: "", message: "" });
                                        }}
                                        className="mt-6 inline-flex min-h-11 items-center justify-center rounded-full border border-(--border) bg-white px-5 py-2.5 text-sm font-semibold text-foreground transition-colors duration-200 hover:bg-(--surface-hover)"
                                    >
                                        Kirim pesan lainnya
                                    </button>
                                </div>
                            ) : (
                                <form onSubmit={handleSubmit} className="space-y-5">
                                    <div className="grid gap-5 md:grid-cols-2">
                                        <div className="space-y-2">
                                            <label htmlFor="name" className="text-sm font-semibold text-foreground">
                                                Nama lengkap
                                            </label>
                                            <input
                                                id="name"
                                                type="text"
                                                required
                                                value={formData.name}
                                                onChange={(e) => handleInputChange("name", e.target.value)}
                                                className="min-h-12 w-full rounded-2xl border border-(--border) bg-(--surface) px-4 py-3 text-sm text-foreground outline-none transition-colors duration-200 focus:border-(--border-focus) focus:ring-4 focus:ring-(--info-bg)"
                                                placeholder="Nama Anda"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label htmlFor="email" className="text-sm font-semibold text-foreground">
                                                Email
                                            </label>
                                            <input
                                                id="email"
                                                type="email"
                                                required
                                                value={formData.email}
                                                onChange={(e) => handleInputChange("email", e.target.value)}
                                                className="min-h-12 w-full rounded-2xl border border-(--border) bg-(--surface) px-4 py-3 text-sm text-foreground outline-none transition-colors duration-200 focus:border-(--border-focus) focus:ring-4 focus:ring-(--info-bg)"
                                                placeholder="nama@email.com"
                                            />
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <label htmlFor="subject" className="text-sm font-semibold text-foreground">
                                            Subjek
                                        </label>
                                        <select
                                            id="subject"
                                            required
                                            value={formData.subject}
                                            onChange={(e) => handleInputChange("subject", e.target.value)}
                                            className="min-h-12 w-full rounded-2xl border border-(--border) bg-(--surface) px-4 py-3 text-sm text-foreground outline-none transition-colors duration-200 focus:border-(--border-focus) focus:ring-4 focus:ring-(--info-bg)"
                                        >
                                            <option value="">Pilih subjek</option>
                                            <option value="general">Pertanyaan umum</option>
                                            <option value="booking">Masalah booking</option>
                                            <option value="payment">Masalah pembayaran</option>
                                            <option value="refund">Pengajuan refund</option>
                                            <option value="organizer">Menjadi organizer</option>
                                            <option value="partnership">Kerja sama</option>
                                            <option value="other">Lainnya</option>
                                        </select>
                                    </div>

                                    <div className="space-y-2">
                                        <label htmlFor="message" className="text-sm font-semibold text-foreground">
                                            Pesan
                                        </label>
                                        <textarea
                                            id="message"
                                            required
                                            rows={6}
                                            value={formData.message}
                                            onChange={(e) => handleInputChange("message", e.target.value)}
                                            className="w-full rounded-2xl border border-(--border) bg-(--surface) px-4 py-3 text-sm text-foreground outline-none transition-colors duration-200 focus:border-(--border-focus) focus:ring-4 focus:ring-(--info-bg)"
                                            placeholder="Tuliskan konteks, pertanyaan, atau kebutuhan Anda di sini..."
                                        />
                                    </div>

                                    <button
                                        type="submit"
                                        disabled={isSubmitting}
                                        className="inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-full bg-(--accent-secondary) px-6 py-3 text-sm font-semibold text-white shadow-(--shadow-md) transition-colors duration-200 hover:bg-(--accent-secondary-hover) disabled:cursor-not-allowed disabled:opacity-60"
                                    >
                                        {isSubmitting ? (
                                            <>
                                                <Clock className="h-5 w-5 animate-spin" />
                                                Mengirim pesan...
                                            </>
                                        ) : (
                                            <>
                                                <Send className="h-5 w-5" />
                                                Kirim pesan
                                            </>
                                        )}
                                    </button>
                                </form>
                            )}
                        </div>
                    </EditorialPanel>

                    <div className="space-y-5">
                        <EditorialPanel className="space-y-4">
                            <div className="space-y-1">
                                <h3 className="text-xl font-semibold tracking-(--tracking-heading) text-foreground">
                                    Informasi kontak
                                </h3>
                                <p className="text-sm leading-7 text-(--text-secondary)">
                                    Gunakan kanal berikut jika Anda ingin menghubungi Gelaran secara langsung.
                                </p>
                            </div>
                            <div className="grid gap-3">
                                {CONTACT_INFO.map((item) => (
                                    <InfoCard
                                        key={item.label}
                                        label={item.label}
                                        value={item.value}
                                        icon={item.icon}
                                        href={item.link}
                                    />
                                ))}
                            </div>
                        </EditorialPanel>

                        <EditorialPanel className="space-y-4">
                            <div className="space-y-1">
                                <h3 className="text-xl font-semibold tracking-(--tracking-heading) text-foreground">
                                    Ikuti Gelaran
                                </h3>
                                <p className="text-sm leading-7 text-(--text-secondary)">
                                    Tetap terhubung untuk update event, insight organizer, dan rilis platform terbaru.
                                </p>
                            </div>
                            <div className="flex flex-wrap gap-3">
                                {SOCIALS.map((social) => {
                                    const Icon = social.icon;
                                    return (
                                        <a
                                            key={social.label}
                                            href={social.href}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className={`inline-flex min-h-11 items-center gap-2 rounded-full border border-(--border) bg-(--surface) px-4 py-2.5 text-sm font-semibold text-foreground transition-colors duration-200 ${social.className}`}
                                        >
                                            <Icon className="h-4 w-4" />
                                            {social.label}
                                        </a>
                                    );
                                })}
                            </div>
                        </EditorialPanel>
                    </div>
                </div>
            </PublicSection>

            <PublicSection
                eyebrow="Quick answers"
                title="Pertanyaan yang paling sering muncul"
                description="FAQ ringan ini membantu pengunjung mendapatkan jawaban cepat tanpa harus keluar dari alur halaman."
                className="pt-0"
            >
                <div className="grid gap-4 lg:grid-cols-2">
                    {FAQ_ITEMS.map((item) => (
                        <EditorialPanel key={item.question} className="h-full space-y-3">
                            <h3 className="text-lg font-semibold tracking-(--tracking-heading) text-foreground">
                                {item.question}
                            </h3>
                            <p className="text-sm leading-7 text-(--text-secondary) sm:text-base">
                                {item.answer}
                            </p>
                        </EditorialPanel>
                    ))}
                </div>
                <div className="pt-4 text-center">
                    <Link
                        href="/docs"
                        className="inline-flex min-h-11 items-center justify-center rounded-full border border-(--border) bg-(--surface) px-5 py-2.5 text-sm font-semibold text-foreground transition-colors duration-200 hover:border-(--border-strong) hover:bg-(--surface-hover)"
                    >
                        Buka pusat bantuan
                    </Link>
                </div>
            </PublicSection>
        </PublicPageShell>
    );
}
