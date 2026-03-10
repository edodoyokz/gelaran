import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma/client";
import { requireAdmin } from "@/lib/auth/route-auth";

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
        brandName: "Gelaran",
        tagline: "Platform manajemen event dan penjualan tiket terpercaya.",
        copyright: "© 2026 Gelaran. All rights reserved.",
        links: [
            { label: "Tentang Kami", href: "/about" },
            { label: "Hubungi", href: "/contact" },
            { label: "Syarat & Ketentuan", href: "/terms" },
            { label: "Kebijakan Privasi", href: "/privacy" },
        ],
        socialLinks: [],
    },
    seo: {
        siteTitle: "Gelaran - Platform Event & Ticketing",
        siteDescription: "Platform manajemen event dan penjualan tiket terpercaya di Indonesia.",
        siteKeywords: "event, tiket, konser, workshop, festival, indonesia",
        ogImage: "",
    },
};

async function verifyAdmin(): Promise<{ admin: { id: string; role: string } } | { error: string; status: number }> {
    const authResult = await requireAdmin();

    if ("error" in authResult) {
        return authResult;
    }

    return { admin: { id: authResult.user.id, role: authResult.user.role } };
}

export async function GET() {
    try {
        const result = await verifyAdmin();
        if ("error" in result) {
            return NextResponse.json(
                { success: false, error: result.error },
                { status: result.status }
            );
        }

        const contentMap: Record<string, unknown> = { ...DEFAULT_CONTENT };

        try {
            const contents = await prisma.siteContent.findMany({
                orderBy: { key: "asc" },
            });

            for (const content of contents) {
                contentMap[content.key] = content.value;
            }
        } catch {
            console.log("SiteContent table may not exist yet, using defaults");
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

export async function PUT(request: NextRequest) {
    try {
        const result = await verifyAdmin();
        if ("error" in result) {
            return NextResponse.json(
                { success: false, error: result.error },
                { status: result.status }
            );
        }

        const body = await request.json();
        const { key, value } = body;

        if (!key || value === undefined) {
            return NextResponse.json(
                { success: false, error: "Key and value are required" },
                { status: 400 }
            );
        }

        try {
            const updated = await prisma.siteContent.upsert({
                where: { key },
                update: { value },
                create: { key, value, type: "JSON" },
            });

            return NextResponse.json({
                success: true,
                data: updated,
            });
        } catch (dbError) {
            console.error("Database error - table may not exist:", dbError);
            return NextResponse.json(
                { success: false, error: "Database table not configured. Run the SQL migration first." },
                { status: 500 }
            );
        }
    } catch (error) {
        console.error("Failed to update site content:", error);
        return NextResponse.json(
            { success: false, error: "Failed to update site content" },
            { status: 500 }
        );
    }
}
