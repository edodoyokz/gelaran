import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma/client";

const DEFAULT_CONTENT: Record<string, unknown> = {
    hero: {
        title: "Temukan Pengalaman Tak Terlupakan.",
        subtitle: "Jelajahi konser, workshop, dan festival terbaik di sekitarmu.",
        backgroundImage: "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?ixlib=rb-4.0.3&auto=format&fit=crop&w=1600&q=80",
        searchPlaceholder: "Konser, Festival...",
        locationPlaceholder: "Jakarta, Indonesia",
        ctaText: "Cari",
    },
    footer: {
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
    },
    seo: {
        siteTitle: "BSC Tickets - Platform Event & Ticketing",
        siteDescription: "Platform manajemen event dan penjualan tiket terpercaya di Indonesia.",
        siteKeywords: "event, tiket, konser, workshop, festival, indonesia",
        ogImage: "",
    },
};

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const keys = searchParams.get("keys")?.split(",") || [];

        let contents;
        if (keys.length > 0) {
            contents = await prisma.siteContent.findMany({
                where: { key: { in: keys } },
            });
        } else {
            contents = await prisma.siteContent.findMany();
        }

        const contentMap: Record<string, unknown> = {};
        
        for (const key of Object.keys(DEFAULT_CONTENT)) {
            if (keys.length === 0 || keys.includes(key)) {
                contentMap[key] = DEFAULT_CONTENT[key];
            }
        }
        
        for (const content of contents) {
            contentMap[content.key] = content.value;
        }

        return NextResponse.json({
            success: true,
            data: contentMap,
        });
    } catch (error) {
        console.error("Failed to fetch site content:", error);
        return NextResponse.json({
            success: true,
            data: DEFAULT_CONTENT,
        });
    }
}
