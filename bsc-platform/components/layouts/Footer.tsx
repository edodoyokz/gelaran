"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

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
    brandName: "BSC Tickets",
    tagline: "Platform manajemen event dan penjualan tiket terpercaya.",
    copyright: "© 2026 BSC Event Platform. All rights reserved.",
    links: [
        { label: "Tentang Kami", href: "/about" },
        { label: "Hubungi", href: "/contact" },
        { label: "Syarat & Ketentuan", href: "/terms" },
        { label: "Kebijakan Privasi", href: "/privacy" },
    ],
    socialLinks: [],
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
        <footer className="bg-gray-50 border-t border-gray-200 py-12 mt-12">
            <div className="container mx-auto px-4 text-center">
                <h3 className="font-bold text-2xl text-indigo-900 mb-4">{content.brandName}</h3>
                <p className="text-gray-500 mb-8">
                    {content.tagline}
                </p>
                <div className="flex justify-center space-x-6 text-sm text-gray-500">
                    {content.links.map((link, index) => (
                        <Link 
                            key={index} 
                            href={link.href} 
                            className="hover:text-indigo-600 transition-colors"
                        >
                            {link.label}
                        </Link>
                    ))}
                </div>
                <p className="text-xs text-gray-400 mt-8">
                    {content.copyright}
                </p>
            </div>
        </footer>
    );
}
