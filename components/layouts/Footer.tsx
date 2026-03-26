"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Twitter, Instagram, Linkedin, Mail, Phone, MapPin } from "lucide-react";

interface FooterLink {
    label: string;
    href: string;
}

interface SocialLink {
    platform: string;
    url: string;
}

interface FooterContent {
    brandName: string;
    tagline: string;
    copyright: string;
    links: FooterLink[];
    socialLinks: SocialLink[];
}

const DEFAULT_CONTENT: FooterContent = {
    brandName: "Gelaran",
    tagline: "Platform manajemen event dan penjualan tiket terpercaya untuk pengalaman terbaik Anda.",
    copyright: "© 2026 Gelaran. All rights reserved.",
    links: [
        { label: "Tentang Kami", href: "/about" },
        { label: "Hubungi Kami", href: "/contact" },
        { label: "Syarat & Ketentuan", href: "/terms" },
        { label: "Kebijakan Privasi", href: "/privacy" },
        { label: "Bantuan", href: "/help" },
    ],
    socialLinks: [
        { platform: "instagram", url: "#" },
        { platform: "twitter", url: "#" },
        { platform: "linkedin", url: "#" },
    ],
};

export function Footer() {
    const [content, setContent] = useState<FooterContent>(DEFAULT_CONTENT);
    const [loaded, setLoaded] = useState(false);

    useEffect(() => {
        if (loaded) return;

        const loadContent = async () => {
            try {
                const res = await fetch("/api/site-content?keys=footer");
                const data = await res.json();
                if (data.success && data.data?.footer) {
                    setContent({ ...DEFAULT_CONTENT, ...data.data.footer });
                }
            } catch {
            } finally {
                setLoaded(true);
            }
        };
        loadContent();
    }, [loaded]);

    return (
        <footer className="bg-[var(--bg-tertiary)] text-[var(--text-primary)] border-t border-[var(--border)] pt-12 md:pt-16 pb-8 mt-12 md:mt-16 relative overflow-hidden">
            <div className="absolute top-0 left-1/4 w-96 h-96 bg-[var(--accent-primary)]/10 rounded-full blur-3xl -translate-y-1/2" />
            <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-purple-600/10 rounded-full blur-3xl translate-y-1/2" />

            <div className="container mx-auto px-4 md:px-6 relative z-10">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 md:gap-12 mb-12 md:mb-16">
                    <div>
                        <h3 className="font-bold text-2xl md:text-3xl text-[var(--text-primary)] mb-4 md:mb-6 tracking-tight flex items-center gap-2">
                            Gelaran<span className="text-[var(--accent-primary)]">.id</span>
                        </h3>
                        <p className="text-[var(--text-secondary)] leading-relaxed mb-6 md:mb-8 text-sm md:text-base">
                            {content.tagline}
                        </p>
                        <div className="flex gap-3">
                            <a href="#" className="w-10 h-10 rounded-full bg-[var(--surface)] border border-[var(--border)] flex items-center justify-center text-[var(--text-muted)] hover:bg-[var(--accent-primary)] hover:text-white transition-all duration-300 min-w-[44px] min-h-[44px]">
                                <Instagram size={18} />
                            </a>
                            <a href="#" className="w-10 h-10 rounded-full bg-[var(--surface)] border border-[var(--border)] flex items-center justify-center text-[var(--text-muted)] hover:bg-blue-400 hover:text-white transition-all duration-300 min-w-[44px] min-h-[44px]">
                                <Twitter size={18} />
                            </a>
                            <a href="#" className="w-10 h-10 rounded-full bg-[var(--surface)] border border-[var(--border)] flex items-center justify-center text-[var(--text-muted)] hover:bg-blue-600 hover:text-white transition-all duration-300 min-w-[44px] min-h-[44px]">
                                <Linkedin size={18} />
                            </a>
                        </div>
                    </div>

                    <div>
                        <h4 className="font-bold text-base md:text-lg mb-4 md:mb-6 text-[var(--text-primary)]">Perusahaan</h4>
                        <ul className="space-y-3">
                            {content.links.slice(0, 3).map((link, index) => (
                                <li key={index}>
                                    <Link
                                        href={link.href}
                                        className="text-[var(--text-secondary)] hover:text-[var(--accent-primary)] transition-colors text-sm md:text-base"
                                    >
                                        {link.label}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>

                    <div>
                        <h4 className="font-bold text-base md:text-lg mb-4 md:mb-6 text-[var(--text-primary)]">Dukungan</h4>
                        <ul className="space-y-3">
                            {content.links.slice(3).map((link, index) => (
                                <li key={index}>
                                    <Link
                                        href={link.href}
                                        className="text-[var(--text-secondary)] hover:text-[var(--accent-primary)] transition-colors text-sm md:text-base"
                                    >
                                        {link.label}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>

                    <div>
                        <h4 className="font-bold text-base md:text-lg mb-4 md:mb-6 text-[var(--text-primary)]">Hubungi Kami</h4>
                        <ul className="space-y-3 text-[var(--text-secondary)] text-sm md:text-base">
                            <li className="flex items-start gap-3">
                                <MapPin className="text-[var(--accent-primary)] shrink-0 mt-0.5" size={16} />
                                <span>Jl. Jendral Sudirman No. 1, Jakarta Pusat</span>
                            </li>
                            <li className="flex items-center gap-3">
                                <Mail className="text-[var(--accent-primary)] shrink-0" size={16} />
                                <span>support@bsctickets.com</span>
                            </li>
                            <li className="flex items-center gap-3">
                                <Phone className="text-[var(--accent-primary)] shrink-0" size={16} />
                                <span>+62 21 5555 8888</span>
                            </li>
                        </ul>
                    </div>
                </div>

                <div className="border-t border-slate-800 pt-6 md:pt-8 flex flex-col md:flex-row justify-between items-center gap-4 text-xs md:text-sm text-slate-500">
                    <p>{content.copyright}</p>
                    <div className="flex gap-6">
                        <Link href="/privacy" className="hover:text-white transition-colors">Privacy</Link>
                        <Link href="/terms" className="hover:text-white transition-colors">Terms</Link>
                        <Link href="/sitemap" className="hover:text-white transition-colors">Sitemap</Link>
                    </div>
                </div>
            </div>
        </footer>
    );
}
