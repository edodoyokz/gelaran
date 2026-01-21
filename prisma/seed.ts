import "dotenv/config";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
    console.log("🗑️  Deleting existing data...");

    await prisma.$transaction([
        prisma.bookedTicket.deleteMany(),
        prisma.booking.deleteMany(),
        prisma.eventFaq.deleteMany(),
        prisma.seat.deleteMany(),
        prisma.venueSection.deleteMany(),
        prisma.ticketType.deleteMany(),
        prisma.eventSchedule.deleteMany(),
        prisma.event.deleteMany(),
        prisma.customerProfile.deleteMany(),
        prisma.organizerProfile.deleteMany(),
        prisma.user.deleteMany(),
        prisma.venue.deleteMany(),
        prisma.category.deleteMany(),
        prisma.taxRate.deleteMany(),
        prisma.commissionSetting.deleteMany(),
    ]);

    console.log("✅ Deleted all existing data");
    console.log("🌱 Seeding database with Solo/Surakarta data...");

    const taxRate = await prisma.taxRate.create({
        data: {
            name: "PPN Indonesia",
            code: "PPN-11",
            rate: 11.0,
            taxType: "PERCENTAGE",
            isInclusive: false,
            isDefault: true,
            isActive: true
        }
    });

    const defaultCommission = await prisma.commissionSetting.create({
        data: {
            commissionType: "PERCENTAGE",
            commissionValue: 5.0,
            isActive: true
        }
    });

    console.log("✅ Created tax rate and commission setting");

    const categories = await Promise.all([
        prisma.category.create({
            data: {
                name: "Seni & Budaya",
                slug: "seni-budaya",
                icon: "🎭",
                colorHex: "#8B5CF6",
                sortOrder: 1,
            },
        }),
        prisma.category.create({
            data: {
                name: "Olahraga",
                slug: "olahraga",
                icon: "🏀",
                colorHex: "#EF4444",
                sortOrder: 2,
            },
        }),
        prisma.category.create({
            data: {
                name: "Seminar & Workshop",
                slug: "seminar-workshop",
                icon: "📚",
                colorHex: "#3B82F6",
                sortOrder: 3,
            },
        }),
        prisma.category.create({
            data: {
                name: "Musik",
                slug: "musik",
                icon: "🎵",
                colorHex: "#10B981",
                sortOrder: 4,
            },
        }),
        prisma.category.create({
            data: {
                name: "Party & Hiburan",
                slug: "party-hiburan",
                icon: "🎉",
                colorHex: "#F59E0B",
                sortOrder: 5,
            },
        }),
    ]);

    console.log(`✅ Created ${categories.length} categories`);

    const organizerSriwedari = await prisma.user.create({
        data: {
            name: "Taman Sriwedari",
            email: "info@sriwedari.solo.go.id",
            role: "ORGANIZER",
            isVerified: true,
            isActive: true,
            organizerProfile: {
                create: {
                    organizationName: "Taman Sriwedari Solo",
                    organizationSlug: "taman-sriwedari",
                    organizationDescription: "Pengelola Taman Budaya Sriwedari - Pusat seni dan budaya tradisional Jawa di Kota Solo",
                    isVerified: true,
                    verificationStatus: "APPROVED",
                },
            },
        },
        include: { organizerProfile: true },
    });

    const organizerSport = await prisma.user.create({
        data: {
            name: "GOR Manahan Management",
            email: "info@gormanahan.solo.go.id",
            role: "ORGANIZER",
            isVerified: true,
            isActive: true,
            organizerProfile: {
                create: {
                    organizationName: "GOR Manahan Solo",
                    organizationSlug: "gor-manahan",
                    organizationDescription: "Pengelola Gelanggang Olahraga Manahan - Venue olahraga utama di Kota Solo",
                    isVerified: true,
                    verificationStatus: "APPROVED",
                },
            },
        },
        include: { organizerProfile: true },
    });

    const organizerSeminar = await prisma.user.create({
        data: {
            name: "Solo Creative Hub",
            email: "hello@solocreativehub.id",
            role: "ORGANIZER",
            isVerified: true,
            isActive: true,
            organizerProfile: {
                create: {
                    organizationName: "Solo Creative Hub",
                    organizationSlug: "solo-creative-hub",
                    organizationDescription: "Event organizer profesional untuk seminar, workshop, dan acara korporat di Solo",
                    isVerified: true,
                    verificationStatus: "APPROVED",
                },
            },
        },
        include: { organizerProfile: true },
    });

    const organizerMusic = await prisma.user.create({
        data: {
            name: "Solo Music Fest",
            email: "contact@solomusicfest.id",
            role: "ORGANIZER",
            isVerified: true,
            isActive: true,
            organizerProfile: {
                create: {
                    organizationName: "Solo Music Fest",
                    organizationSlug: "solo-music-fest",
                    organizationDescription: "Promotor musik dan event organizer untuk konser dan gigs di Solo Raya",
                    isVerified: true,
                    verificationStatus: "APPROVED",
                },
            },
        },
        include: { organizerProfile: true },
    });

    const organizerParty = await prisma.user.create({
        data: {
            name: "Solo Nightlife Events",
            email: "party@solonightlife.id",
            role: "ORGANIZER",
            isVerified: true,
            isActive: true,
            organizerProfile: {
                create: {
                    organizationName: "Solo Nightlife Events",
                    organizationSlug: "solo-nightlife",
                    organizationDescription: "Event organizer untuk party dan hiburan malam di Solo",
                    isVerified: true,
                    verificationStatus: "APPROVED",
                },
            },
        },
        include: { organizerProfile: true },
    });

    console.log("✅ Created 5 organizers");

    const admin = await prisma.user.create({
        data: {
            name: "Admin Gelaran Solo",
            email: "admin@gelaran.id",
            role: "SUPER_ADMIN",
            isVerified: true,
            isActive: true,
        },
    });

    console.log(`✅ Created admin: ${admin.email}`);

    const customers = await Promise.all([
        prisma.user.create({
            data: {
                name: "Budi Santoso",
                email: "budi.santoso@email.com",
                phone: "081234567001",
                role: "CUSTOMER",
                isVerified: true,
                isActive: true,
                customerProfile: {
                    create: {
                        gender: "MALE",
                        city: "Surakarta",
                        province: "Jawa Tengah",
                    },
                },
            },
            include: { customerProfile: true },
        }),
        prisma.user.create({
            data: {
                name: "Siti Nurhaliza",
                email: "siti.nur@email.com",
                phone: "081234567002",
                role: "CUSTOMER",
                isVerified: true,
                isActive: true,
                customerProfile: {
                    create: {
                        gender: "FEMALE",
                        city: "Surakarta",
                        province: "Jawa Tengah",
                    },
                },
            },
            include: { customerProfile: true },
        }),
        prisma.user.create({
            data: {
                name: "Ahmad Rizki",
                email: "ahmad.rizki@email.com",
                phone: "081234567003",
                role: "CUSTOMER",
                isVerified: true,
                isActive: true,
                customerProfile: {
                    create: {
                        gender: "MALE",
                        city: "Surakarta",
                        province: "Jawa Tengah",
                    },
                },
            },
            include: { customerProfile: true },
        }),
    ]);

    console.log(`✅ Created ${customers.length} customers`);

    const venues = await Promise.all([
        prisma.venue.create({
            data: {
                name: "Taman Sriwedari",
                slug: "taman-sriwedari",
                address: "Jl. Slamet Riyadi No.275",
                city: "Surakarta",
                province: "Jawa Tengah",
                postalCode: "57141",
                capacity: 500,
                latitude: -7.566667,
                longitude: 110.816667,
            },
        }),
        prisma.venue.create({
            data: {
                name: "GOR Manahan",
                slug: "gor-manahan",
                address: "Jl. Menteri Supeno No.14",
                city: "Surakarta",
                province: "Jawa Tengah",
                postalCode: "57139",
                capacity: 10000,
                latitude: -7.569444,
                longitude: 110.836111,
            },
        }),
        prisma.venue.create({
            data: {
                name: "Solo Paragon Hotel & Convention",
                slug: "solo-paragon",
                address: "Jl. Yosodipuro No.111",
                city: "Surakarta",
                province: "Jawa Tengah",
                postalCode: "57131",
                capacity: 800,
                latitude: -7.562222,
                longitude: 110.819722,
            },
        }),
        prisma.venue.create({
            data: {
                name: "The Sunan Hotel Solo",
                slug: "the-sunan-solo",
                address: "Jl. Adi Sucipto No.47",
                city: "Surakarta",
                province: "Jawa Tengah",
                postalCode: "57145",
                capacity: 500,
                latitude: -7.516667,
                longitude: 110.766667,
            },
        }),
        prisma.venue.create({
            data: {
                name: "De Tjolomadoe",
                slug: "de-tjolomadoe",
                address: "Jl. Adi Sumarmo, Paulan",
                city: "Karanganyar",
                province: "Jawa Tengah",
                postalCode: "57772",
                capacity: 1000,
                latitude: -7.501944,
                longitude: 110.809722,
            },
        }),
    ]);

    console.log(`✅ Created ${venues.length} venues`);

    const eventWayang = await prisma.event.create({
        data: {
            organizerId: organizerSriwedari.id,
            categoryId: categories[0].id,
            venueId: venues[0].id,
            title: "Pertunjukan Wayang Orang Sriwedari - Rama Tambak",
            slug: "wayang-orang-rama-tambak-sriwedari",
            shortDescription: "Pertunjukan wayang orang klasik lakon Rama Tambak oleh seniman Sriwedari",
            description: `Saksikan pertunjukan wayang orang klasik dengan lakon Rama Tambak yang dibawakan oleh para seniman berbakat dari Taman Sriwedari.

Wayang orang adalah salah satu warisan budaya Jawa yang masih dilestarikan di Kota Solo. Pertunjukan ini menampilkan tari, musik gamelan, dan cerita epik Ramayana dalam balutan seni tradisional yang memukau.

Fasilitas:
- Tempat duduk berkualitas
- Sound system profesional
- Parkir luas
- Kantin tradisional

Pertunjukan ini cocok untuk keluarga dan pecinta seni budaya Jawa.`,
            posterImage: "https://images.unsplash.com/photo-1580870069867-74c57ee1bb07?w=800",
            bannerImage: "https://images.unsplash.com/photo-1580870069867-74c57ee1bb07?w=1600",
            eventType: "OFFLINE",
            status: "PUBLISHED",
            visibility: "PUBLIC",
            isFeatured: true,
            minTicketsPerOrder: 1,
            maxTicketsPerOrder: 10,
            hasSeatingChart: true,
            schedules: {
                create: [
                    {
                        scheduleDate: new Date("2026-02-15"),
                        startTime: "19:30:00",
                        endTime: "22:00:00",
                        isActive: true,
                    },
                ],
            },
        },
        include: { schedules: true },
    });

    const eventBasket = await prisma.event.create({
        data: {
            organizerId: organizerSport.id,
            categoryId: categories[1].id,
            venueId: venues[1].id,
            title: "Pertandingan Basket: Satria Muda vs Pelita Jaya",
            slug: "basket-satria-muda-vs-pelita-jaya",
            shortDescription: "Pertandingan seru IBL 2026 di GOR Manahan Solo",
            description: `Indonesian Basketball League (IBL) 2026 hadir di Kota Solo!

Saksikan pertandingan sengit antara:
- Satria Muda Pertamina Jakarta
- Pelita Jaya Bakrie Jakarta

Di venue yang megah, GOR Manahan Solo yang baru saja direnovasi dengan fasilitas internasional.

Fasilitas:
- Tribun nyaman
- Layar LED besar
- Food court modern
- Parkir luas dan aman
- Merchandise booth

Jangan lewatkan aksi para pemain basket terbaik Indonesia!`,
            posterImage: "https://images.unsplash.com/photo-1546519638-68e109498ffc?w=800",
            bannerImage: "https://images.unsplash.com/photo-1546519638-68e109498ffc?w=1600",
            eventType: "OFFLINE",
            status: "PUBLISHED",
            visibility: "PUBLIC",
            isFeatured: true,
            minTicketsPerOrder: 1,
            maxTicketsPerOrder: 4,
            hasSeatingChart: true,
            schedules: {
                create: [
                    {
                        scheduleDate: new Date("2026-02-20"),
                        startTime: "18:00:00",
                        endTime: "21:00:00",
                        isActive: true,
                    },
                ],
            },
        },
        include: { schedules: true },
    });

    const eventSeminar = await prisma.event.create({
        data: {
            organizerId: organizerSeminar.id,
            categoryId: categories[2].id,
            venueId: venues[2].id,
            title: "Seminar Nasional: Digital Transformation untuk UMKM",
            slug: "seminar-digital-transformation-umkm",
            shortDescription: "Seminar dan workshop tentang transformasi digital untuk pengusaha UMKM",
            description: `Seminar Nasional yang membahas strategi transformasi digital untuk UMKM di era modern.

Pembicara:
- Dr. Budi Raharjo (Google Indonesia)
- Siti Nurhaliza, MBA (Tokopedia)
- Ahmad Zaki (Founder startup unicorn)

Materi:
- E-commerce strategy
- Digital marketing
- Social media management
- Payment gateway integration

Benefit:
- E-certificate
- Lunch & coffee break
- Networking session
- Doorprize menarik
- Materi presentasi

Cocok untuk: Pemilik UMKM, entrepreneur, mahasiswa bisnis`,
            posterImage: "https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800",
            bannerImage: "https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=1600",
            eventType: "OFFLINE",
            status: "PUBLISHED",
            visibility: "PUBLIC",
            isFeatured: true,
            minTicketsPerOrder: 1,
            maxTicketsPerOrder: 5,
            hasSeatingChart: false,
            schedules: {
                create: [
                    {
                        scheduleDate: new Date("2026-02-25"),
                        startTime: "08:00:00",
                        endTime: "16:00:00",
                        isActive: true,
                    },
                ],
            },
        },
        include: { schedules: true },
    });

    const eventGigs = await prisma.event.create({
        data: {
            organizerId: organizerMusic.id,
            categoryId: categories[3].id,
            venueId: venues[4].id,
            title: "Solo Indie Gigs: Featuring Efek Rumah Kaca & Hindia",
            slug: "solo-indie-gigs-erk-hindia",
            shortDescription: "Konser indie terbesar di Solo dengan lineup musisi papan atas",
            description: `Solo Indie Gigs 2026 menghadirkan musisi indie terbaik Indonesia!

Lineup:
- Efek Rumah Kaca
- Hindia
- Tulus
- Pamungkas
- Local band: Jogjarockartakulture

Venue: De Tjolomadoe - Bekas pabrik gula yang ikonik dengan nuansa industrial yang artistik.

Fasilitas:
- Standing area luas
- Sound system profesional
- Lighting spektakuler
- Food & beverage area
- Merchandise booth
- Parkir gratis

Musik: Indie rock, alternative, pop indie

Wajib datang untuk pecinta musik indie!`,
            posterImage: "https://images.unsplash.com/photo-1501281668745-f7f57925c3b4?w=800",
            bannerImage: "https://images.unsplash.com/photo-1501281668745-f7f57925c3b4?w=1600",
            eventType: "OFFLINE",
            status: "PUBLISHED",
            visibility: "PUBLIC",
            isFeatured: true,
            minTicketsPerOrder: 1,
            maxTicketsPerOrder: 5,
            hasSeatingChart: false,
            schedules: {
                create: [
                    {
                        scheduleDate: new Date("2026-03-01"),
                        startTime: "18:00:00",
                        endTime: "23:00:00",
                        isActive: true,
                    },
                ],
            },
        },
        include: { schedules: true },
    });

    const eventParty = await prisma.event.create({
        data: {
            organizerId: organizerParty.id,
            categoryId: categories[4].id,
            venueId: venues[3].id,
            title: "New Year Party 2026: Sky Lounge Edition",
            slug: "new-year-party-2026-sky-lounge",
            shortDescription: "Pesta tahun baru dengan DJ internasional di rooftop hotel mewah",
            description: `Rayakan pergantian tahun dengan kemewahan dan kemeriahan di Sky Lounge!

DJ Lineup:
- DJ Snake (France)
- DJ Yasmin (Malaysia)
- Local DJ: Dipha Barus

Venue: The Sunan Hotel Solo - Rooftop dengan view Kota Solo 360 derajat

Fasilitas:
- All you can eat & drink
- Premium cocktails
- VIP lounge area
- Photo booth professional
- Fireworks show at midnight
- Live band opening

Dress code: Semi formal / Smart casual

21+ only (ID required)

Limited seats - Book now!`,
            posterImage: "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=800",
            bannerImage: "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=1600",
            eventType: "OFFLINE",
            status: "PUBLISHED",
            visibility: "PUBLIC",
            isFeatured: true,
            minTicketsPerOrder: 1,
            maxTicketsPerOrder: 10,
            hasSeatingChart: false,
            schedules: {
                create: [
                    {
                        scheduleDate: new Date("2026-12-31"),
                        startTime: "20:00:00",
                        endTime: "03:00:00",
                        isActive: true,
                    },
                ],
            },
        },
        include: { schedules: true },
    });

    console.log("✅ Created 5 events");

    const ticketWayang = await Promise.all([
        prisma.ticketType.create({
            data: {
                eventId: eventWayang.id,
                name: "Reguler",
                description: "Kursi standar area tengah",
                basePrice: 50000,
                totalQuantity: 100,
                maxPerOrder: 5,
                isFree: false,
            },
        }),
        prisma.ticketType.create({
            data: {
                eventId: eventWayang.id,
                name: "VIP",
                description: "Kursi premium baris depan",
                basePrice: 100000,
                totalQuantity: 50,
                maxPerOrder: 5,
                isFree: false,
            },
        }),
    ]);

    const ticketBasket = await Promise.all([
        prisma.ticketType.create({
            data: {
                eventId: eventBasket.id,
                name: "Tribun",
                description: "Tempat duduk tribun umum",
                basePrice: 75000,
                totalQuantity: 500,
                maxPerOrder: 4,
                isFree: false,
            },
        }),
        prisma.ticketType.create({
            data: {
                eventId: eventBasket.id,
                name: "VIP",
                description: "Kursi VIP dengan view terbaik",
                basePrice: 150000,
                totalQuantity: 100,
                maxPerOrder: 4,
                isFree: false,
            },
        }),
    ]);

    const ticketSeminar = await Promise.all([
        prisma.ticketType.create({
            data: {
                eventId: eventSeminar.id,
                name: "Early Bird",
                description: "Harga spesial untuk pendaftar awal (termasuk lunch & sertifikat)",
                basePrice: 150000,
                totalQuantity: 200,
                maxPerOrder: 5,
                isFree: false,
            },
        }),
        prisma.ticketType.create({
            data: {
                eventId: eventSeminar.id,
                name: "Regular",
                description: "Tiket reguler (termasuk lunch & sertifikat)",
                basePrice: 250000,
                totalQuantity: 300,
                maxPerOrder: 5,
                isFree: false,
            },
        }),
    ]);

    const ticketGigs = await Promise.all([
        prisma.ticketType.create({
            data: {
                eventId: eventGigs.id,
                name: "Presale",
                description: "Presale special price",
                basePrice: 200000,
                totalQuantity: 300,
                maxPerOrder: 5,
                isFree: false,
            },
        }),
        prisma.ticketType.create({
            data: {
                eventId: eventGigs.id,
                name: "Regular",
                description: "Regular standing ticket",
                basePrice: 300000,
                totalQuantity: 500,
                maxPerOrder: 5,
                isFree: false,
            },
        }),
    ]);

    const ticketParty = await Promise.all([
        prisma.ticketType.create({
            data: {
                eventId: eventParty.id,
                name: "Regular Pass",
                description: "All you can eat & drink included",
                basePrice: 500000,
                totalQuantity: 100,
                maxPerOrder: 5,
                isFree: false,
            },
        }),
        prisma.ticketType.create({
            data: {
                eventId: eventParty.id,
                name: "VIP Pass",
                description: "VIP lounge access + premium drinks + reserved table",
                basePrice: 1000000,
                totalQuantity: 30,
                maxPerOrder: 10,
                isFree: false,
            },
        }),
    ]);

    console.log("✅ Created ticket types for all events");

    const bookingWayang = await prisma.booking.create({
        data: {
            userId: customers[0].id,
            eventId: eventWayang.id,
            bookingCode: "BSC-WAYANG-001",
            guestName: customers[0].name,
            guestEmail: customers[0].email,
            guestPhone: customers[0].phone!,
            totalTickets: 2,
            subtotal: 150000,
            platformFee: 7500,
            taxAmount: 17325,
            totalAmount: 174825,
            paymentStatus: "PAID",
            status: "CONFIRMED",
            bookedTickets: {
                create: [
                    {
                        ticketTypeId: ticketWayang[0].id,
                        uniqueCode: "TICK-WAY-001-01",
                        unitPrice: 50000,
                        finalPrice: 50000,
                        status: "ACTIVE",
                    },
                    {
                        ticketTypeId: ticketWayang[1].id,
                        uniqueCode: "TICK-WAY-001-02",
                        unitPrice: 100000,
                        finalPrice: 100000,
                        status: "ACTIVE",
                    },
                ],
            },
        },
    });

    const bookingBasket = await prisma.booking.create({
        data: {
            userId: customers[1].id,
            eventId: eventBasket.id,
            bookingCode: "BSC-BASKET-001",
            guestName: customers[1].name,
            guestEmail: customers[1].email,
            guestPhone: customers[1].phone!,
            totalTickets: 3,
            subtotal: 225000,
            platformFee: 11250,
            taxAmount: 26012.5,
            totalAmount: 262262.5,
            paymentStatus: "PAID",
            status: "CONFIRMED",
            bookedTickets: {
                create: [
                    {
                        ticketTypeId: ticketBasket[0].id,
                        uniqueCode: "TICK-BAS-001-01",
                        unitPrice: 75000,
                        finalPrice: 75000,
                        status: "ACTIVE",
                    },
                    {
                        ticketTypeId: ticketBasket[0].id,
                        uniqueCode: "TICK-BAS-001-02",
                        unitPrice: 75000,
                        finalPrice: 75000,
                        status: "ACTIVE",
                    },
                    {
                        ticketTypeId: ticketBasket[0].id,
                        uniqueCode: "TICK-BAS-001-03",
                        unitPrice: 75000,
                        finalPrice: 75000,
                        status: "ACTIVE",
                    },
                ],
            },
        },
    });

    const bookingSeminar = await prisma.booking.create({
        data: {
            userId: customers[2].id,
            eventId: eventSeminar.id,
            bookingCode: "BSC-SEMINAR-001",
            guestName: customers[2].name,
            guestEmail: customers[2].email,
            guestPhone: customers[2].phone!,
            totalTickets: 1,
            subtotal: 150000,
            platformFee: 7500,
            taxAmount: 17325,
            totalAmount: 174825,
            paymentStatus: "PAID",
            status: "CONFIRMED",
            bookedTickets: {
                create: [
                    {
                        ticketTypeId: ticketSeminar[0].id,
                        uniqueCode: "TICK-SEM-001-01",
                        unitPrice: 150000,
                        finalPrice: 150000,
                        status: "ACTIVE",
                    },
                ],
            },
        },
    });

    const bookingGigs = await prisma.booking.create({
        data: {
            userId: customers[0].id,
            eventId: eventGigs.id,
            bookingCode: "BSC-GIGS-001",
            guestName: customers[0].name,
            guestEmail: customers[0].email,
            guestPhone: customers[0].phone!,
            totalTickets: 2,
            subtotal: 400000,
            platformFee: 20000,
            taxAmount: 46200,
            totalAmount: 466200,
            paymentStatus: "PAID",
            status: "CONFIRMED",
            bookedTickets: {
                create: [
                    {
                        ticketTypeId: ticketGigs[0].id,
                        uniqueCode: "TICK-GIG-001-01",
                        unitPrice: 200000,
                        finalPrice: 200000,
                        status: "ACTIVE",
                    },
                    {
                        ticketTypeId: ticketGigs[0].id,
                        uniqueCode: "TICK-GIG-001-02",
                        unitPrice: 200000,
                        finalPrice: 200000,
                        status: "ACTIVE",
                    },
                ],
            },
        },
    });

    console.log("✅ Created sample bookings with tickets");

    await Promise.all([
        prisma.eventFaq.createMany({
            data: [
                {
                    eventId: eventWayang.id,
                    question: "Apakah ada dress code khusus?",
                    answer: "Tidak ada dress code khusus, namun kami menyarankan menggunakan pakaian sopan dan nyaman.",
                    sortOrder: 1,
                },
                {
                    eventId: eventWayang.id,
                    question: "Apakah boleh membawa kamera?",
                    answer: "Kamera ponsel diperbolehkan. Kamera DSLR/profesional harus seizin panitia.",
                    sortOrder: 2,
                },
            ],
        }),
        prisma.eventFaq.createMany({
            data: [
                {
                    eventId: eventBasket.id,
                    question: "Apakah ada parkir?",
                    answer: "Ya, tersedia parkir luas di GOR Manahan. Gratis untuk pemegang tiket.",
                    sortOrder: 1,
                },
                {
                    eventId: eventBasket.id,
                    question: "Apakah bisa refund tiket?",
                    answer: "Refund dapat dilakukan maksimal 3 hari sebelum pertandingan dengan potongan biaya admin 10%.",
                    sortOrder: 2,
                },
            ],
        }),
    ]);

    console.log("✅ Created FAQs for events");

    console.log("\n🎉 Seeding completed successfully!");
    console.log("\n📊 Summary:");
    console.log(`- Tax Rates: 1`);
    console.log(`- Commission Settings: 1`);
    console.log(`- Categories: ${categories.length}`);
    console.log(`- Organizers: 5`);
    console.log(`- Customers: ${customers.length}`);
    console.log(`- Admin: 1`);
    console.log(`- Venues: ${venues.length}`);
    console.log(`- Events: 5`);
    console.log(`  - Wayang Orang Sriwedari`);
    console.log(`  - Basket: Satria Muda vs Pelita Jaya`);
    console.log(`  - Seminar Digital Transformation`);
    console.log(`  - Solo Indie Gigs`);
    console.log(`  - New Year Party 2026`);
    console.log(`- Ticket Types: 10`);
    console.log(`- Bookings: 4 (with paid tickets)`);
    console.log(`- FAQs: Created`);
    console.log("\n✉️  Login credentials:");
    console.log("Admin: admin@gelaran.id");
    console.log("Organizers: info@sriwedari.solo.go.id, info@gormanahan.solo.go.id, etc.");
    console.log("Customers: budi.santoso@email.com, siti.nur@email.com, ahmad.rizki@email.com");
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
