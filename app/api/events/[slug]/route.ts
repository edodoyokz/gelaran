import prisma from "@/lib/prisma/client";
import { successResponse, errorResponse } from "@/lib/api/response";
import type { Decimal } from "@prisma/client/runtime/library";

interface TicketTypeWithTiers {
    id: string;
    name: string;
    description: string | null;
    basePrice: Decimal;
    currency: string;
    totalQuantity: number;
    soldQuantity: number;
    reservedQuantity: number;
    minPerOrder: number;
    maxPerOrder: number;
    isFree: boolean;
    requiresAttendeeInfo: boolean;
    saleStartAt: Date | null;
    saleEndAt: Date | null;
    priceTiers: Array<{
        id: string;
        name: string;
        price: Decimal;
        quantityLimit: number | null;
        soldQuantity: number;
        startAt: Date;
        endAt: Date;
    }>;
}

interface PriceTier {
    id: string;
    name: string;
    price: Decimal;
    quantityLimit: number | null;
    soldQuantity: number;
    startAt: Date;
    endAt: Date;
}

export async function GET(
    _request: Request,
    { params }: { params: Promise<{ slug: string }> }
) {
    try {
        const { slug } = await params;

        const event = await prisma.event.findUnique({
            where: { slug, deletedAt: null },
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
                                websiteUrl: true,
                                socialFacebook: true,
                                socialInstagram: true,
                                socialTwitter: true,
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
            },
        });

        if (!event) {
            return errorResponse("Event not found", 404);
        }

        // Note: viewCount tracking removed to prevent row-level lock contention
        // on hot event rows that was causing statement timeouts

        // Transform ticket types with availability
        const ticketTypes = event.ticketTypes.map((ticket: TicketTypeWithTiers) => ({
            id: ticket.id,
            name: ticket.name,
            description: ticket.description,
            basePrice: Number(ticket.basePrice),
            currency: ticket.currency,
            totalQuantity: ticket.totalQuantity,
            soldQuantity: ticket.soldQuantity,
            availableQuantity: ticket.totalQuantity - ticket.soldQuantity - ticket.reservedQuantity,
            minPerOrder: ticket.minPerOrder,
            maxPerOrder: ticket.maxPerOrder,
            isFree: ticket.isFree,
            requiresAttendeeInfo: ticket.requiresAttendeeInfo,
            saleStartAt: ticket.saleStartAt,
            saleEndAt: ticket.saleEndAt,
            priceTiers: ticket.priceTiers.map((tier: PriceTier) => ({
                id: tier.id,
                name: tier.name,
                price: Number(tier.price),
                quantityLimit: tier.quantityLimit,
                soldQuantity: tier.soldQuantity,
                startAt: tier.startAt,
                endAt: tier.endAt,
            })),
        }));

        const response = {
            id: event.id,
            slug: event.slug,
            title: event.title,
            shortDescription: event.shortDescription,
            description: event.description,
            posterImage: event.posterImage,
            bannerImage: event.bannerImage,
            trailerVideoUrl: event.trailerVideoUrl,
            eventType: event.eventType,
            status: event.status,
            visibility: event.visibility,
            isFeatured: event.isFeatured,
            hasSeatingChart: event.hasSeatingChart,
            minTicketsPerOrder: event.minTicketsPerOrder,
            maxTicketsPerOrder: event.maxTicketsPerOrder,
            onlineMeetingUrl: event.status === "PUBLISHED" ? event.onlineMeetingUrl : null,
            termsAndConditions: event.termsAndConditions,
            refundPolicy: event.refundPolicy,
            viewCount: event.viewCount,
            category: event.category,
            venue: event.venue,
            organizer: {
                id: event.organizer.id,
                name: event.organizer.organizerProfile?.organizationName || event.organizer.name,
                slug: event.organizer.organizerProfile?.organizationSlug,
                logo: event.organizer.organizerProfile?.organizationLogo,
                description: event.organizer.organizerProfile?.organizationDescription,
                website: event.organizer.organizerProfile?.websiteUrl,
                socials: {
                    facebook: event.organizer.organizerProfile?.socialFacebook,
                    instagram: event.organizer.organizerProfile?.socialInstagram,
                    twitter: event.organizer.organizerProfile?.socialTwitter,
                },
                isVerified: event.organizer.organizerProfile?.isVerified || false,
            },
            schedules: event.schedules,
            ticketTypes,
            faqs: event.faqs,
            createdAt: event.createdAt,
            updatedAt: event.updatedAt,
        };

        return successResponse(response);
    } catch (error) {
        console.error("Error fetching event:", error);
        return errorResponse("Failed to fetch event", 500);
    }
}
