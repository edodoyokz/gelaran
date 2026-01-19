import { notFound } from "next/navigation";
import { Metadata } from "next";
import { EventDetailView } from "@/components/features/events/EventDetailView";

interface EventData {
    id: string;
    slug: string;
    title: string;
    shortDescription: string | null;
    description: string | null;
    posterImage: string | null;
    bannerImage: string | null;
    eventType: "OFFLINE" | "ONLINE" | "HYBRID";
    status: string;
    isFeatured: boolean;
    hasSeatingChart: boolean;
    minTicketsPerOrder?: number;
    maxTicketsPerOrder?: number;
    termsAndConditions: string | null;
    refundPolicy: string | null;
    viewCount: number;
    category: {
        id: string;
        name: string;
        slug: string;
        colorHex: string | null;
    } | null;
    venue: {
        id: string;
        name: string;
        address: string;
        city: string;
        province: string;
    } | null;
    organizer: {
        id: string;
        name: string;
        slug: string | null;
        logo: string | null;
        description: string | null;
        isVerified: boolean;
    };
    schedules: Array<{
        id: string;
        title: string | null;
        scheduleDate: string;
        startTime: string;
        endTime: string;
    }>;
    ticketTypes: Array<{
        id: string;
        name: string;
        description: string | null;
        basePrice: number;
        totalQuantity: number;
        availableQuantity: number;
        minPerOrder: number;
        maxPerOrder: number;
        isFree: boolean;
    }>;
    faqs: Array<{
        id: string;
        question: string;
        answer: string;
    }>;
}

async function getEvent(slug: string): Promise<EventData | null> {
    try {
        const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
        const res = await fetch(`${baseUrl}/api/events/${slug}`, {
            cache: "no-store",
        });

        if (!res.ok) {
            return null;
        }

        const data = await res.json();
        return data.success ? data.data : null;
    } catch {
        return null;
    }
}

interface PageProps {
    params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
    const { slug } = await params;
    const event = await getEvent(slug);

    if (!event) {
        return {
            title: "Event Tidak Ditemukan",
        };
    }

    return {
        title: `${event.title} | BSC Events`,
        description: event.shortDescription || event.description?.slice(0, 160),
        openGraph: {
            title: event.title,
            description: event.shortDescription || undefined,
            images: event.posterImage ? [event.posterImage] : undefined,
        },
    };
}

export default async function EventPage({ params }: PageProps) {
    const { slug } = await params;
    const event = await getEvent(slug);

    if (!event) {
        notFound();
    }

    return <EventDetailView event={event} />;
}
