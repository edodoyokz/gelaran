import "dotenv/config";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient({
    datasources: {
        db: {
            url: process.env.DIRECT_URL || process.env.DATABASE_URL,
        },
    },
});

const DEFAULT_CONFIG = {
    colors: {
        primary: "#4F46E5",
        background: "#FFFFFF",
        text: "#111827",
    },
    assets: {
        logoUrl: null,
        backgroundUrl: null,
    },
    toggles: {
        showQr: true,
        showPrice: true,
        showVenueMap: true,
    },
    customSections: [],
};

async function main() {
    console.log("🌱 Seeding voucher templates...");

    const templateModern = await prisma.voucherTemplate.create({
        data: {
            name: "Modern",
            slug: "modern",
            componentKey: "modern",
            previewImageUrl: "/images/voucher-templates/modern-preview.png",
            defaultConfig: {
                ...DEFAULT_CONFIG,
                colors: {
                    ...DEFAULT_CONFIG.colors,
                    primary: "#4F46E5",
                },
            },
            isActive: true,
        },
    });

    const templateClassic = await prisma.voucherTemplate.create({
        data: {
            name: "Classic",
            slug: "classic",
            componentKey: "classic",
            previewImageUrl: "/images/voucher-templates/classic-preview.png",
            defaultConfig: {
                ...DEFAULT_CONFIG,
                colors: {
                    ...DEFAULT_CONFIG.colors,
                    primary: "#1E40AF",
                },
            },
            isActive: true,
        },
    });

    const templateMinimal = await prisma.voucherTemplate.create({
        data: {
            name: "Minimal",
            slug: "minimal",
            componentKey: "minimal",
            previewImageUrl: "/images/voucher-templates/minimal-preview.png",
            defaultConfig: {
                ...DEFAULT_CONFIG,
                colors: {
                    ...DEFAULT_CONFIG.colors,
                    primary: "#000000",
                },
            },
            isActive: true,
        },
    });

    console.log("✅ Created voucher templates:");
    console.log(`  - ${templateModern.name} (${templateModern.slug})`);
    console.log(`  - ${templateClassic.name} (${templateClassic.slug})`);
    console.log(`  - ${templateMinimal.name} (${templateMinimal.slug})`);
    console.log("\n🎉 Template seeding completed!");
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
