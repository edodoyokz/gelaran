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
    const [loadError, setLoadError] = useState(false);

    useEffect(() => {
        if (loaded) return;

        const loadContent = async () => {
            try {
                const res = await fetch("/api/site-content?keys=footer");
                if (!res.ok) {
                    throw new Error(`Footer content request failed: ${res.status}`);
                }

                const data = await res.json();
                if (data.success && data.data?.footer) {
                    setContent({ ...DEFAULT_CONTENT, ...data.data.footer });
                }
                setLoadError(false);
            } catch (error) {
                console.error("Failed to load footer content", error);
                setLoadError(true);
            } finally {
                setLoaded(true);
            }
        };
        loadContent();
    }, [loaded]);

    return (
        <footer className="relative mt-12 overflow-hidden border-t border-[var(--shell-footer-border)] bg-[var(--shell-footer-bg)] pb-8 pt-14 text-[var(--text-primary)] md:mt-16 md:pt-18">
            <div className="absolute left-[12%] top-0 h-80 w-80 -translate-y-1/2 rounded-full bg-[var(--brand-yellow)]/12 blur-3xl" />
            <div className="absolute bottom-0 right-[10%] h-80 w-80 translate-y-1/2 rounded-full bg-[var(--brand-teal-light)]/12 blur-3xl" />

            <div className="container relative z-10 mx-auto px-4 md:px-6">
                <div className="mb-12 grid grid-cols-1 gap-8 md:mb-16 md:grid-cols-2 lg:grid-cols-4 lg:gap-12">
                    <div>
                        <span className="mb-4 inline-flex rounded-full border border-[rgba(1,89,89,0.12)] bg-[var(--surface-chip)] px-3 py-1 text-[0.65rem] font-bold uppercase tracking-[0.24em] text-[var(--accent-primary)]">
                            Cultural Ticketing
                        </span>
                        <h3 className="mb-4 flex items-center gap-2 font-[var(--font-editorial)] text-3xl font-bold tracking-[-0.05em] text-[var(--accent-primary)] md:mb-6 md:text-4xl">
                            Gelaran<span className="font-sans text-base font-semibold uppercase tracking-[0.28em] text-[var(--text-secondary)]">ID</span>
                        </h3>
                        <p className="mb-6 max-w-sm text-sm leading-relaxed text-[var(--text-secondary)] md:mb-8 md:text-base">
                            {content.tagline}
                        </p>
                        {loadError ? (
                            <p className="mb-4 text-xs font-medium uppercase tracking-[0.18em] text-[var(--text-muted)]">
                                Menggunakan konten footer cadangan.
                            </p>
                        ) : null}
                        <div className="flex gap-3">
                            {content.socialLinks.map((link) => {
                                const icon = link.platform === "instagram"
                                    ? <Instagram size={18} />
                                    : link.platform === "twitter"
                                        ? <Twitter size={18} />
                                        : <Linkedin size={18} />;

                                const hoverClass = link.platform === "instagram"
                                    ? "hover:bg-[var(--accent-primary)]"
                                    : link.platform === "twitter"
                                        ? "hover:bg-[var(--brand-teal-light)]"
                                        : "hover:bg-[var(--accent-secondary)]";

                                return (
                                    <a
                                        key={link.platform}
                                        href={link.url || "/"}
                                        className={`flex min-h-[44px] min-w-[44px] items-center justify-center rounded-full border border-[rgba(1,89,89,0.12)] bg-[var(--surface-editorial)] text-[var(--text-muted)] transition-all duration-300 hover:-translate-y-0.5 hover:text-white ${hoverClass}`}
                                    >
                                        {icon}
                                    </a>
                                );
                            })}
                        </div>
                    </div>

                    <div>
                        <h4 className="mb-4 text-[0.72rem] font-bold uppercase tracking-[0.24em] text-[var(--accent-primary)] md:mb-6">Perusahaan</h4>
                        <ul className="space-y-3">
                            {content.links.slice(0, 3).map((link) => (
                                <li key={link.href}>
                                    <Link
                                        href={link.href}
                                        className="text-sm text-[var(--text-secondary)] transition-colors hover:text-[var(--accent-primary)] md:text-base"
                                    >
                                        {link.label}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>

                    <div>
                        <h4 className="mb-4 text-[0.72rem] font-bold uppercase tracking-[0.24em] text-[var(--accent-primary)] md:mb-6">Dukungan</h4>
                        <ul className="space-y-3">
                            {content.links.slice(3).map((link) => (
                                <li key={link.href}>
                                    <Link
                                        href={link.href}
                                        className="text-sm text-[var(--text-secondary)] transition-colors hover:text-[var(--accent-primary)] md:text-base"
                                    >
                                        {link.label}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>

                    <div>
                        <h4 className="mb-4 text-[0.72rem] font-bold uppercase tracking-[0.24em] text-[var(--accent-primary)] md:mb-6">Hubungi Kami</h4>
                        <ul className="space-y-4 text-sm text-[var(--text-secondary)] md:text-base">
                            <li className="flex items-start gap-3">
                                <MapPin className="mt-0.5 shrink-0 text-[var(--accent-primary)]" size={16} />
                                <span>Jl. Jendral Sudirman No. 1, Jakarta Pusat</span>
                            </li>
                            <li className="flex items-center gap-3">
                                <Mail className="shrink-0 text-[var(--accent-primary)]" size={16} />
                                <span>support@bsctickets.com</span>
                            </li>
                            <li className="flex items-center gap-3">
                                <Phone className="shrink-0 text-[var(--accent-primary)]" size={16} />
                                <span>+62 21 5555 8888</span>
                            </li>
                        </ul>
                    </div>
                </div>

                <div className="flex flex-col items-center justify-between gap-4 border-t border-[var(--shell-footer-border)] pt-6 text-xs text-[var(--text-secondary)] md:flex-row md:pt-8 md:text-sm">
                    <p>{content.copyright}</p>
                    <div className="flex gap-6">
                        <Link href="/privacy" className="transition-colors hover:text-[var(--accent-primary)]">Privacy</Link>
                        <Link href="/terms" className="transition-colors hover:text-[var(--accent-primary)]">Terms</Link>
                        <Link href="/sitemap" className="transition-colors hover:text-[var(--accent-primary)]">Sitemap</Link>
                    </div>
                </div>
            </div>
        </footer>
    );
}
