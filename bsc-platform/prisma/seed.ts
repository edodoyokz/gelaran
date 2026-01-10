// prisma/seed.ts
// Run with: pnpm tsx prisma/seed.ts
import "dotenv/config";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
    console.log("🌱 Seeding database...");

    // Create categories
    const categories = await Promise.all([
        prisma.category.upsert({
            where: { slug: "musik" },
            update: {},
            create: {
                name: "Musik",
                slug: "musik",
                icon: "🎵",
                colorHex: "#8B5CF6",
                sortOrder: 1,
            },
        }),
        prisma.category.upsert({
            where: { slug: "bisnis" },
            update: {},
            create: {
                name: "Bisnis",
                slug: "bisnis",
                icon: "💼",
                colorHex: "#3B82F6",
                sortOrder: 2,
            },
        }),
        prisma.category.upsert({
            where: { slug: "kuliner" },
            update: {},
            create: {
                name: "Kuliner",
                slug: "kuliner",
                icon: "🍜",
                colorHex: "#F59E0B",
                sortOrder: 3,
            },
        }),
        prisma.category.upsert({
            where: { slug: "teknologi" },
            update: {},
            create: {
                name: "Teknologi",
                slug: "teknologi",
                icon: "💻",
                colorHex: "#10B981",
                sortOrder: 4,
            },
        }),
        prisma.category.upsert({
            where: { slug: "olahraga" },
            update: {},
            create: {
                name: "Olahraga",
                slug: "olahraga",
                icon: "⚽",
                colorHex: "#EF4444",
                sortOrder: 5,
            },
        }),
    ]);

    console.log(`✅ Created ${categories.length} categories`);

    // Create sample organizer user
    const organizer = await prisma.user.upsert({
        where: { email: "organizer@bsc.id" },
        update: {},
        create: {
            name: "BSC Events",
            email: "organizer@bsc.id",
            role: "ORGANIZER",
            isVerified: true,
            isActive: true,
            organizerProfile: {
                create: {
                    organizationName: "BSC Events Official",
                    organizationSlug: "bsc-events",
                    organizationDescription: "Official event organizer for BSC Platform",
                    isVerified: true,
                    verificationStatus: "APPROVED",
                },
            },
        },
        include: { organizerProfile: true },
    });

    console.log(`✅ Created organizer: ${organizer.email}`);

    // Create venues
    const venues = await Promise.all([
        prisma.venue.upsert({
            where: { slug: "gbk-senayan" },
            update: {},
            create: {
                name: "Gelora Bung Karno",
                slug: "gbk-senayan",
                address: "Jl. Pintu Satu Senayan",
                city: "Jakarta",
                province: "DKI Jakarta",
                postalCode: "10270",
                capacity: 80000,
            },
        }),
        prisma.venue.upsert({
            where: { slug: "ice-bsd" },
            update: {},
            create: {
                name: "Indonesia Convention Exhibition",
                slug: "ice-bsd",
                address: "Jl. BSD Grand Boulevard",
                city: "Tangerang",
                province: "Banten",
                postalCode: "15339",
                capacity: 50000,
            },
        }),
        prisma.venue.upsert({
            where: { slug: "alun-alun-jogja" },
            update: {},
            create: {
                name: "Alun-Alun Kidul Yogyakarta",
                slug: "alun-alun-jogja",
                address: "Jl. Alun-Alun Kidul",
                city: "Yogyakarta",
                province: "DI Yogyakarta",
                postalCode: "55131",
                capacity: 10000,
            },
        }),
    ]);

    console.log(`✅ Created ${venues.length} venues`);

    // Create sample events
    const events = await Promise.all([
        prisma.event.upsert({
            where: { slug: "sound-of-jakarta-festival-2026" },
            update: {},
            create: {
                organizerId: organizer.id,
                categoryId: categories[0].id,
                venueId: venues[0].id,
                title: "Sound of Jakarta Festival 2026",
                slug: "sound-of-jakarta-festival-2026",
                shortDescription: "Festival musik terbesar tahun ini dengan lineup internasional",
                description: "Festival musik terbesar tahun ini menghadirkan musisi papan atas.",
                posterImage: "https://images.unsplash.com/photo-1533174072545-e8d4aa97edf9?w=800",
                bannerImage: "https://images.unsplash.com/photo-1533174072545-e8d4aa97edf9?w=1600",
                eventType: "OFFLINE",
                status: "PUBLISHED",
                visibility: "PUBLIC",
                isFeatured: true,
                minTicketsPerOrder: 1,
                maxTicketsPerOrder: 10,
                schedules: {
                    create: {
                        title: "Main Event",
                        scheduleDate: new Date("2026-01-24"),
                        startTime: new Date("2026-01-24T15:00:00"),
                        endTime: new Date("2026-01-24T23:00:00"),
                    },
                },
                ticketTypes: {
                    create: [
                        {
                            name: "Festival A (Standing)",
                            description: "Akses area festival standing",
                            basePrice: 350000,
                            totalQuantity: 1000,
                            minPerOrder: 1,
                            maxPerOrder: 5,
                            sortOrder: 1,
                        },
                        {
                            name: "VIP Seating",
                            description: "Kursi VIP dengan view terbaik",
                            basePrice: 850000,
                            totalQuantity: 200,
                            minPerOrder: 1,
                            maxPerOrder: 4,
                            sortOrder: 2,
                        },
                    ],
                },
            },
        }),
        prisma.event.upsert({
            where: { slug: "tech-startup-summit-2026" },
            update: {},
            create: {
                organizerId: organizer.id,
                categoryId: categories[1].id,
                venueId: venues[1].id,
                title: "Tech Startup Summit SE Asia 2026",
                slug: "tech-startup-summit-2026",
                shortDescription: "Pertemuan para founder, investor, dan tech enthusiast",
                description: "Konferensi teknologi terbesar di Asia Tenggara.",
                posterImage: "https://images.unsplash.com/photo-1544531586-fde5298cdd40?w=800",
                eventType: "OFFLINE",
                status: "PUBLISHED",
                visibility: "PUBLIC",
                isFeatured: true,
                minTicketsPerOrder: 1,
                maxTicketsPerOrder: 5,
                schedules: {
                    create: {
                        title: "Conference Day",
                        scheduleDate: new Date("2026-02-12"),
                        startTime: new Date("2026-02-12T09:00:00"),
                        endTime: new Date("2026-02-12T18:00:00"),
                    },
                },
                ticketTypes: {
                    create: [
                        {
                            name: "General Pass",
                            description: "Akses ke semua sesi",
                            basePrice: 150000,
                            totalQuantity: 500,
                            sortOrder: 1,
                        },
                    ],
                },
            },
        }),
        prisma.event.upsert({
            where: { slug: "jogja-culinary-week-2026" },
            update: {},
            create: {
                organizerId: organizer.id,
                categoryId: categories[2].id,
                venueId: venues[2].id,
                title: "Jogja Culinary Week 2026",
                slug: "jogja-culinary-week-2026",
                shortDescription: "Festival kuliner terbesar di Yogyakarta",
                description: "Nikmati ribuan kuliner legendaris Yogyakarta.",
                posterImage: "https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=800",
                eventType: "OFFLINE",
                status: "PUBLISHED",
                visibility: "PUBLIC",
                isFeatured: false,
                minTicketsPerOrder: 1,
                maxTicketsPerOrder: 10,
                schedules: {
                    create: {
                        title: "Opening Day",
                        scheduleDate: new Date("2026-03-05"),
                        startTime: new Date("2026-03-05T10:00:00"),
                        endTime: new Date("2026-03-05T22:00:00"),
                    },
                },
                ticketTypes: {
                    create: [
                        {
                            name: "Free Entry RSVP",
                            description: "Registrasi gratis",
                            basePrice: 0,
                            isFree: true,
                            totalQuantity: 1000,
                            sortOrder: 1,
                        },
                    ],
                },
            },
        }),
        prisma.event.upsert({
            where: { slug: "workshop-digital-marketing-ai" },
            update: {},
            create: {
                organizerId: organizer.id,
                categoryId: categories[3].id,
                title: "Workshop Digital Marketing dengan AI",
                slug: "workshop-digital-marketing-ai",
                shortDescription: "Pelajari cara menggunakan AI untuk marketing",
                description: "Workshop intensif tentang AI tools untuk marketing.",
                posterImage: "https://images.unsplash.com/photo-1531482615713-2afd69097998?w=800",
                eventType: "ONLINE",
                status: "PUBLISHED",
                visibility: "PUBLIC",
                isFeatured: false,
                onlineMeetingUrl: "https://zoom.us/j/example",
                minTicketsPerOrder: 1,
                maxTicketsPerOrder: 1,
                schedules: {
                    create: {
                        title: "Workshop Session",
                        scheduleDate: new Date("2026-01-18"),
                        startTime: new Date("2026-01-18T13:00:00"),
                        endTime: new Date("2026-01-18T17:00:00"),
                    },
                },
                ticketTypes: {
                    create: [
                        {
                            name: "Webinar Access",
                            description: "Akses live webinar",
                            basePrice: 75000,
                            totalQuantity: 200,
                            sortOrder: 1,
                        },
                    ],
                },
            },
        }),
    ]);

    console.log(`✅ Created ${events.length} events`);
    console.log("\n🎉 Seeding completed!");
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
