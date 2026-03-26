import { notFound } from "next/navigation";
import { Metadata } from "next";
import { EventDetailView } from "@/components/features/events/EventDetailView";
import prisma from "@/lib/prisma/client";

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
        const event = await prisma.event.findUnique({
            where: { slug, deletedAt: null, status: "PUBLISHED" },
            include: {
                category: true,
                venue: true,
                organizer: {
                    select: {
                        id: true,
                        name: true,
                        avatarUrl: true,
                        organizerProfile: {
                            select: {
                                organizationName: true,
                                organizationSlug: true,
                                organizationLogo: true,
                                organizationDescription: true,
                                isVerified: true,
                            },
                        },
                    },
                },
                schedules: {
                    where: { isActive: true },
                    orderBy: { scheduleDate: "asc" },
                },
                ticketTypes: {
                    where: { isActive: true },
                    orderBy: { sortOrder: "asc" },
                    include: {
                        priceTiers: {
                            where: { isActive: true },
                            orderBy: { sortOrder: "asc" },
                        },
                    },
                },
                faqs: {
                    where: { isActive: true },
                    orderBy: { sortOrder: "asc" },
                },
                venueSections: {
                    where: { isActive: true },
                    orderBy: { sortOrder: "asc" },
                    include: {
                        rows: {
                            where: { isActive: true },
                            orderBy: { sortOrder: "asc" },
                            include: {
                                seats: {
                                    where: { isActive: true },
                                    include: {
                                        ticketType: true
                                    }
                                }
                            }
                        }
                    }
                },
            },
        });

        if (!event) {
            return null;
        }

        prisma.event.update({
            where: { id: event.id },
            data: { viewCount: { increment: 1 } },
        }).catch(() => { });

        return {
            id: event.id,
            slug: event.slug,
            title: event.title,
            shortDescription: event.shortDescription,
            description: event.description,
            posterImage: event.posterImage,
            bannerImage: event.bannerImage,
            eventType: event.eventType as "OFFLINE" | "ONLINE" | "HYBRID",
            status: event.status,
            isFeatured: event.isFeatured,
            hasSeatingChart: event.hasSeatingChart,
            minTicketsPerOrder: event.minTicketsPerOrder ?? undefined,
            maxTicketsPerOrder: event.maxTicketsPerOrder ?? undefined,
            termsAndConditions: event.termsAndConditions,
            refundPolicy: event.refundPolicy,
            viewCount: event.viewCount,
            category: event.category,
            venue: event.venue ? {
                id: event.venue.id,
                name: event.venue.name,
                address: event.venue.address || "",
                city: event.venue.city || "",
                province: event.venue.province || ""
            } : null,
            organizer: {
                id: event.organizer.id,
                name: event.organizer.organizerProfile?.organizationName || event.organizer.name,
                slug: event.organizer.organizerProfile?.organizationSlug ?? null,
                logo: event.organizer.organizerProfile?.organizationLogo ?? event.organizer.avatarUrl,
                description: event.organizer.organizerProfile?.organizationDescription ?? null,
                isVerified: event.organizer.organizerProfile?.isVerified ?? false,
            },
            schedules: event.schedules.map((s: { id: string; title: string | null; scheduleDate: Date; startTime: Date; endTime: Date }) => ({
                id: s.id,
                title: s.title,
                scheduleDate: s.scheduleDate.toISOString(),
                startTime: s.startTime.toISOString(),
                endTime: s.endTime.toISOString(),
            })),
            ticketTypes: event.ticketTypes.map((tt: { id: string; name: string; description: string | null; basePrice: number | { toNumber: () => number }; totalQuantity: number; soldQuantity: number; reservedQuantity: number; minPerOrder: number; maxPerOrder: number; isFree: boolean }) => ({
                id: tt.id,
                name: tt.name,
                description: tt.description,
                basePrice: Number(tt.basePrice),
                totalQuantity: tt.totalQuantity,
                availableQuantity: tt.totalQuantity - tt.soldQuantity - tt.reservedQuantity,
                minPerOrder: tt.minPerOrder,
                maxPerOrder: tt.maxPerOrder,
                isFree: tt.isFree,
            })),
            faqs: event.faqs,
        };
    } catch (error) {
        console.error("Error fetching event:", error);
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
        title: `${event.title} | Gelaran`,
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
