import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

// Use direct connection URL to avoid connection pool timeout during seeding
const prisma = new PrismaClient({
    datasources: {
        db: {
            url: process.env.DIRECT_URL || process.env.DATABASE_URL,
        },
    },
});

const DEFAULT_PASSWORD = "password123";

async function main() {
    console.log("🗑️  Deleting existing data...");

    await prisma.checkInLog.deleteMany();
    await prisma.bookedTicket.deleteMany();
    await prisma.booking.deleteMany();
    await prisma.complimentaryTicketRequestItem.deleteMany();
    await prisma.complimentaryTicketRequest.deleteMany();
    await prisma.eventFaq.deleteMany();
    await prisma.seat.deleteMany();
    await prisma.venueSection.deleteMany();
    await prisma.ticketType.deleteMany();
    await prisma.eventSchedule.deleteMany();
    await prisma.event.deleteMany();
    await prisma.customerProfile.deleteMany();
    await prisma.organizerProfile.deleteMany();
    await prisma.user.deleteMany();
    await prisma.venue.deleteMany();
    await prisma.category.deleteMany();
    await prisma.taxRate.deleteMany();
    await prisma.commissionSetting.deleteMany();

    console.log("✅ Deleted all existing data");
    console.log("🌱 Seeding database with Solo/Surakarta data...");

    const passwordHash = await bcrypt.hash(DEFAULT_PASSWORD, 10);
    console.log(`🔑 Using default password: ${DEFAULT_PASSWORD}`);

    await prisma.taxRate.create({
        data: {
            name: "PPN Indonesia",
            code: "PPN-11",
            rate: 11.0,
            taxType: "PERCENTAGE",
            isInclusive: false,
            isDefault: true,
            isActive: true,
        },
    });

    await prisma.commissionSetting.create({
        data: {
            commissionType: "PERCENTAGE",
            commissionValue: 5.0,
            isActive: true,
        },
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
            passwordHash,
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
            passwordHash,
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
            passwordHash,
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
            passwordHash,
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
            passwordHash,
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
            passwordHash,
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
                passwordHash,
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
                passwordHash,
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
                passwordHash,
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
                name: "Benteng Vastenburg",
                slug: "benteng-vastenburg",
                address: "Jl. Kapten Mulyadi",
                city: "Surakarta",
                province: "Jawa Tengah",
                postalCode: "57131",
                capacity: 800,
                latitude: -7.569167,
                longitude: 110.824444,
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
            posterImage: "/images/events/wayang-orang.png",
            bannerImage: "/images/events/wayang-orang.png",
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
                        startTime: new Date("2026-02-15T19:30:00"),
                        endTime: new Date("2026-02-15T22:00:00"),
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
            posterImage: "/images/events/basket-match.png",
            bannerImage: "/images/events/basket-match.png",
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
                        startTime: new Date("2026-02-20T18:00:00"),
                        endTime: new Date("2026-02-20T21:00:00"),
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
            posterImage: "/images/events/seminar-digital.png",
            bannerImage: "/images/events/seminar-digital.png",
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
                        startTime: new Date("2026-02-25T08:00:00"),
                        endTime: new Date("2026-02-25T16:00:00"),
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

Venue: Benteng Vastenburg - Benteng bersejarah dengan nuansa heritage yang artistik.

Fasilitas:
- Standing area luas
- Sound system profesional
- Lighting spektakuler
- Food & beverage area
- Merchandise booth
- Parkir gratis

Musik: Indie rock, alternative, pop indie

Wajib datang untuk pecinta musik indie!`,
            posterImage: "/images/events/indie-gigs.png",
            bannerImage: "/images/events/indie-gigs.png",
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
                        startTime: new Date("2026-03-01T18:00:00"),
                        endTime: new Date("2026-03-01T23:00:00"),
                        isActive: true,
                    },
                ],
            },
        },
        include: { schedules: true },
    });

    await prisma.event.create({
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
            posterImage: "/images/events/new-year-party.png",
            bannerImage: "/images/events/new-year-party.png",
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
                        startTime: new Date("2026-12-31T20:00:00"),
                        endTime: new Date("2027-01-01T03:00:00"),
                        isActive: true,
                    },
                ],
            },
        },
        include: { schedules: true },
    });

    const eventBatikWorkshop = await prisma.event.create({
        data: {
            organizerId: organizerSriwedari.id,
            categoryId: categories[2].id,
            venueId: venues[0].id,
            title: "Workshop Batik Tulis: Belajar Membatik Tradisional Solo",
            slug: "workshop-batik-tulis-solo",
            shortDescription: "Workshop membatik langsung dari pengrajin batik Solo",
            description: `Belajar seni membatik tradisional Solo langsung dari pengrajin berpengalaman!

Materi Workshop:
- Sejarah batik Solo dan motif khasnya
- Teknik membatik tulis dengan canting
- Pewarnaan alami batik
- Praktik membuat batik sendiri

Yang Didapat:
- Kain batik hasil karya sendiri
- Sertifikat workshop
- Snack & coffee break
- Goodie bag batik

Cocok untuk: Pemula, pecinta seni, wisatawan, keluarga

Durasi: 4 jam (termasuk praktik)`,
            posterImage: "/images/events/batik-workshop.png",
            bannerImage: "/images/events/batik-workshop.png",
            eventType: "OFFLINE",
            status: "PUBLISHED",
            visibility: "PUBLIC",
            isFeatured: false,
            minTicketsPerOrder: 1,
            maxTicketsPerOrder: 3,
            hasSeatingChart: false,
            schedules: {
                create: [
                    {
                        scheduleDate: new Date("2026-02-22"),
                        startTime: new Date("2026-02-22T09:00:00"),
                        endTime: new Date("2026-02-22T13:00:00"),
                        isActive: true,
                    },
                ],
            },
        },
        include: { schedules: true },
    });

    const eventJazzNight = await prisma.event.create({
        data: {
            organizerId: organizerMusic.id,
            categoryId: categories[3].id,
            venueId: venues[3].id,
            title: "Solo Jazz Night: Featuring Indra Lesmana & Friends",
            slug: "solo-jazz-night-indra-lesmana",
            shortDescription: "Malam jazz dengan musisi jazz terbaik Indonesia di rooftop hotel",
            description: `Solo Jazz Night menghadirkan pengalaman jazz premium di rooftop The Sunan Hotel!

Lineup:
- Indra Lesmana (Piano)
- Tompi (Vocal)
- Barry Likumahuwa (Bass)
- Elfa Dwi Putra (Drums)

Venue: The Sunan Hotel Rooftop - View kota Solo dengan suasana intimate

Fasilitas:
- Welcome drink
- Dinner buffet (VIP)
- Premium seating
- Photo opportunity
- Merchandise corner

Genre: Jazz, Fusion, Contemporary

Dress code: Smart casual

Acara ini cocok untuk pecinta musik jazz dan suasana malam yang elegan.`,
            posterImage: "/images/events/jazz-night.png",
            bannerImage: "/images/events/jazz-night.png",
            eventType: "OFFLINE",
            status: "PUBLISHED",
            visibility: "PUBLIC",
            isFeatured: false,
            minTicketsPerOrder: 1,
            maxTicketsPerOrder: 4,
            hasSeatingChart: true,
            schedules: {
                create: [
                    {
                        scheduleDate: new Date("2026-02-28"),
                        startTime: new Date("2026-02-28T19:00:00"),
                        endTime: new Date("2026-02-28T22:30:00"),
                        isActive: true,
                    },
                ],
            },
        },
        include: { schedules: true },
    });

    const eventCarFreeDay = await prisma.event.create({
        data: {
            organizerId: organizerSport.id,
            categoryId: categories[4].id,
            venueId: venues[1].id,
            title: "Solo Car Free Day Festival: Olahraga & Hiburan Keluarga",
            slug: "solo-car-free-day-festival",
            shortDescription: "Festival mingguan dengan senam, musik, kuliner, dan aktivitas keluarga",
            description: `Car Free Day Solo hadir dengan konsep festival keluarga yang meriah!

Aktivitas:
- Senam pagi bersama
- Zumba & aerobik
- Sepeda santai
- Live music performance
- Bazar kuliner tradisional
- Kids playground
- Pameran UMKM Solo

Venue: Area GOR Manahan & sekitarnya

Fasilitas:
- Area parkir sepeda gratis
- Toilet umum
- Pos kesehatan
- Area istirahat

GRATIS untuk umum!

Cocok untuk: Keluarga, anak-anak, pecinta olahraga, komunitas

Acara rutin setiap minggu pagi.`,
            posterImage: "/images/events/car-free-day.png",
            bannerImage: "/images/events/car-free-day.png",
            eventType: "OFFLINE",
            status: "PUBLISHED",
            visibility: "PUBLIC",
            isFeatured: false,
            minTicketsPerOrder: 1,
            maxTicketsPerOrder: 10,
            hasSeatingChart: false,
            schedules: {
                create: [
                    {
                        scheduleDate: new Date("2026-02-16"),
                        startTime: new Date("2026-02-16T06:00:00"),
                        endTime: new Date("2026-02-16T10:00:00"),
                        isActive: true,
                    },
                ],
            },
        },
        include: { schedules: true },
    });

    const eventKulinerMalam = await prisma.event.create({
        data: {
            organizerId: organizerParty.id,
            categoryId: categories[4].id,
            venueId: venues[2].id,
            title: "Solo Night Culinary Festival: Jelajah Kuliner Nusantara",
            slug: "solo-night-culinary-festival",
            shortDescription: "Festival kuliner malam dengan 50+ tenant makanan dan live music",
            description: `Festival kuliner terbesar di Solo dengan konsep night market!

Kuliner:
- 50+ tenant makanan Nusantara
- Street food khas Solo
- Dessert & minuman kekinian
- Food truck zone
- Traditional snack corner

Entertainment:
- Live acoustic music
- DJ performance
- Traditional dance show
- Cooking demo by chef

Venue: Solo Paragon Convention Hall & outdoor area

Fasilitas:
- Seating area luas
- Instagram-able photo spots
- Kids corner
- Free WiFi
- Ample parking

Tiket masuk GRATIS, bayar per makanan!

Cocok untuk: Keluarga, foodies, anak muda, komunitas kuliner`,
            posterImage: "/images/events/culinary-festival.png",
            bannerImage: "/images/events/culinary-festival.png",
            eventType: "OFFLINE",
            status: "PUBLISHED",
            visibility: "PUBLIC",
            isFeatured: false,
            minTicketsPerOrder: 1,
            maxTicketsPerOrder: 5,
            hasSeatingChart: false,
            schedules: {
                create: [
                    {
                        scheduleDate: new Date("2026-03-05"),
                        startTime: new Date("2026-03-05T17:00:00"),
                        endTime: new Date("2026-03-05T23:00:00"),
                        isActive: true,
                    },
                ],
            },
        },
        include: { schedules: true },
    });

    const eventStartupMeetup = await prisma.event.create({
        data: {
            organizerId: organizerSeminar.id,
            categoryId: categories[2].id,
            venueId: venues[2].id,
            title: "Solo Startup Meetup: Networking & Pitching Session",
            slug: "solo-startup-meetup-networking",
            shortDescription: "Pertemuan bulanan untuk startup, founder, dan investor di Solo",
            description: `Solo Startup Meetup adalah wadah networking untuk ekosistem startup Solo!

Agenda:
- Keynote: "Building Startup in Tier-2 City"
- Startup pitching session (5 startups)
- Panel discussion dengan investor
- Networking session
- Speed mentoring

Speaker:
- Founder startup unicorn
- Angel investor
- Startup mentor
- Government representative

Benefit:
- Networking dengan founder & investor
- Mentoring session
- Snack & coffee
- Startup toolkit digital
- Certificate of attendance

Target: Founder, co-founder, startup team, investor, mahasiswa entrepreneurship

Kapasitas terbatas!`,
            posterImage: "/images/events/startup-meetup.png",
            bannerImage: "/images/events/startup-meetup.png",
            eventType: "OFFLINE",
            status: "PUBLISHED",
            visibility: "PUBLIC",
            isFeatured: false,
            minTicketsPerOrder: 1,
            maxTicketsPerOrder: 3,
            hasSeatingChart: false,
            schedules: {
                create: [
                    {
                        scheduleDate: new Date("2026-03-10"),
                        startTime: new Date("2026-03-10T14:00:00"),
                        endTime: new Date("2026-03-10T18:00:00"),
                        isActive: true,
                    },
                ],
            },
        },
        include: { schedules: true },
    });

    console.log("Created 10 events");

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

    await Promise.all([
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

    await Promise.all([
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

    await Promise.all([
        prisma.ticketType.create({
            data: {
                eventId: eventBatikWorkshop.id,
                name: "Workshop Ticket",
                description: "Termasuk bahan batik, canting, dan sertifikat",
                basePrice: 175000,
                totalQuantity: 30,
                maxPerOrder: 3,
                isFree: false,
            },
        }),
    ]);

    await Promise.all([
        prisma.ticketType.create({
            data: {
                eventId: eventJazzNight.id,
                name: "Regular",
                description: "Standing area dengan welcome drink",
                basePrice: 250000,
                totalQuantity: 150,
                maxPerOrder: 4,
                isFree: false,
            },
        }),
        prisma.ticketType.create({
            data: {
                eventId: eventJazzNight.id,
                name: "VIP",
                description: "Premium seating dengan dinner buffet",
                basePrice: 500000,
                totalQuantity: 50,
                maxPerOrder: 4,
                isFree: false,
            },
        }),
    ]);

    await Promise.all([
        prisma.ticketType.create({
            data: {
                eventId: eventCarFreeDay.id,
                name: "Free Entry",
                description: "Gratis untuk umum",
                basePrice: 0,
                totalQuantity: 5000,
                maxPerOrder: 10,
                isFree: true,
            },
        }),
    ]);

    await Promise.all([
        prisma.ticketType.create({
            data: {
                eventId: eventKulinerMalam.id,
                name: "Free Entry",
                description: "Tiket masuk gratis, bayar per makanan",
                basePrice: 0,
                totalQuantity: 3000,
                maxPerOrder: 5,
                isFree: true,
            },
        }),
    ]);

    await Promise.all([
        prisma.ticketType.create({
            data: {
                eventId: eventStartupMeetup.id,
                name: "General Admission",
                description: "Akses penuh ke semua sesi dan networking",
                basePrice: 50000,
                totalQuantity: 100,
                maxPerOrder: 3,
                isFree: false,
            },
        }),
    ]);

    console.log("✅ Created ticket types for all events");

    await prisma.booking.create({
        data: {
            userId: customers[0].id,
            eventId: eventWayang.id,
            bookingCode: "GEL-WAYANG-001",
            guestName: customers[0].name,
            guestEmail: customers[0].email,
            guestPhone: customers[0].phone!,
            totalTickets: 2,
            subtotal: 150000,
            platformFee: 7500,
            taxAmount: 16500,
            totalAmount: 166500,
            platformRevenue: 7500,
            organizerRevenue: 142500,
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

    await prisma.booking.create({
        data: {
            userId: customers[2].id,
            eventId: eventSeminar.id,
            bookingCode: "GEL-SEMINAR-001",
            guestName: customers[2].name,
            guestEmail: customers[2].email,
            guestPhone: customers[2].phone!,
            totalTickets: 1,
            subtotal: 150000,
            platformFee: 7500,
            taxAmount: 16500,
            totalAmount: 166500,
            platformRevenue: 7500,
            organizerRevenue: 142500,
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
    console.log(`- Events: 10`);
    console.log(`  - Wayang Orang Sriwedari`);
    console.log(`  - Basket: Satria Muda vs Pelita Jaya`);
    console.log(`  - Seminar Digital Transformation`);
    console.log(`  - Solo Indie Gigs`);
    console.log(`  - New Year Party 2026`);
    console.log(`  - Workshop Batik Tulis`);
    console.log(`  - Solo Jazz Night`);
    console.log(`  - Car Free Day Festival`);
    console.log(`  - Night Culinary Festival`);
    console.log(`  - Startup Meetup`);
    console.log(`- Ticket Types: 18`);
    console.log(`- Bookings: 2 (with paid tickets)`);
    console.log(`- FAQs: Created`);
    console.log("\n✉️  Login credentials:");
    console.log(`Password untuk semua user: ${DEFAULT_PASSWORD}`);
    console.log("\nAdmin:");
    console.log("  - admin@gelaran.id");
    console.log("\nOrganizers:");
    console.log("  - info@sriwedari.solo.go.id");
    console.log("  - info@gormanahan.solo.go.id");
    console.log("  - hello@solocreativehub.id");
    console.log("  - contact@solomusicfest.id");
    console.log("  - party@solonightlife.id");
    console.log("\nCustomers:");
    console.log("  - budi.santoso@email.com");
    console.log("  - siti.nur@email.com");
    console.log("  - ahmad.rizki@email.com");
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
