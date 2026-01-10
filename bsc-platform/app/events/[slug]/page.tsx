import { notFound } from "next/navigation";
import { EventDetail } from "@/components/features/events/EventDetail";

// Mock data - akan diganti dengan fetch dari API
const EVENTS: Record<string, {
    id: string;
    title: string;
    date: string;
    time: string;
    location: string;
    price: number;
    image: string;
    category: string;
    organizer: string;
    description: string;
    tickets: Array<{ type: string; price: number; available: number }>;
}> = {
    "sound-of-jakarta-festival-2026": {
        id: "1",
        title: "Sound of Jakarta Festival 2026",
        date: "Sabtu, 24 Jan 2026",
        time: "15:00 WIB",
        location: "GBK Senayan, Jakarta",
        price: 350000,
        image: "https://images.unsplash.com/photo-1533174072545-e8d4aa97edf9?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80",
        category: "music",
        organizer: "Live Nation ID",
        description: "Festival musik terbesar tahun ini menghadirkan musisi papan atas internasional dan lokal dalam satu panggung spektakuler.",
        tickets: [
            { type: "Festival A (Standing)", price: 350000, available: 100 },
            { type: "VIP Seating", price: 850000, available: 20 },
            { type: "VVIP Experience", price: 1500000, available: 5 },
        ],
    },
    "tech-startup-summit-se-asia": {
        id: "2",
        title: "Tech Startup Summit SE Asia",
        date: "Senin, 12 Feb 2026",
        time: "09:00 WIB",
        location: "ICE BSD, Tangerang",
        price: 150000,
        image: "https://images.unsplash.com/photo-1544531586-fde5298cdd40?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80",
        category: "business",
        organizer: "TechInAsia",
        description: "Pertemuan para founder, investor, dan tech enthusiast terbesar di Asia Tenggara. Dapatkan insight eksklusif.",
        tickets: [
            { type: "General Pass", price: 150000, available: 500 },
            { type: "Investor Pass", price: 2500000, available: 50 },
        ],
    },
    "jogja-culinary-week": {
        id: "3",
        title: "Jogja Culinary Week",
        date: "Minggu, 05 Mar 2026",
        time: "10:00 WIB",
        location: "Alun-Alun Kidul, Yogyakarta",
        price: 0,
        image: "https://images.unsplash.com/photo-1555939594-58d7cb561ad1?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80",
        category: "food",
        organizer: "Pemkot Jogja",
        description: "Nikmati ribuan kuliner legendaris Yogyakarta dalam satu tempat. Gratis tiket masuk untuk registrasi online.",
        tickets: [
            { type: "Free Entry RSVP", price: 0, available: 1000 },
        ],
    },
    "workshop-digital-marketing-ai": {
        id: "4",
        title: "Workshop Digital Marketing AI",
        date: "Sabtu, 18 Jan 2026",
        time: "13:00 WIB",
        location: "Online (Zoom)",
        price: 75000,
        image: "https://images.unsplash.com/photo-1531482615713-2afd69097998?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80",
        category: "tech",
        organizer: "Digital Masterclass",
        description: "Pelajari cara menggunakan AI untuk meningkatkan konversi penjualan Anda hingga 300%.",
        tickets: [
            { type: "Webinar Access", price: 75000, available: 200 },
            { type: "Webinar + Recording", price: 125000, available: 100 },
        ],
    },
};

interface PageProps {
    params: Promise<{ slug: string }>;
}

export default async function EventPage({ params }: PageProps) {
    const { slug } = await params;
    const event = EVENTS[slug];

    if (!event) {
        notFound();
    }

    return <EventDetail event={event} />;
}

// Generate static params for pre-rendering
export async function generateStaticParams() {
    return Object.keys(EVENTS).map((slug) => ({ slug }));
}
