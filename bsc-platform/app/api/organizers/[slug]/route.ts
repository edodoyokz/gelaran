import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma/client";
import { createClient } from "@/lib/supabase/server";

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ slug: string }> }
) {
    try {
        const { slug } = await params;

        const organizerProfile = await prisma.organizerProfile.findUnique({
            where: { organizationSlug: slug },
            include: {
                user: {
                    select: {
                        id: true,
                        name: true,
                        avatarUrl: true,
                        createdAt: true,
                    },
                },
            },
        });

        if (!organizerProfile) {
            return NextResponse.json(
                { success: false, error: { message: "Organizer tidak ditemukan" } },
                { status: 404 }
            );
        }

        const now = new Date();
        const [
            totalEvents,
            upcomingEvents,
            pastEvents,
            followersCount,
            totalTicketsSold,
        ] = await Promise.all([
            prisma.event.count({
                where: {
                    organizerId: organizerProfile.userId,
                    status: "PUBLISHED",
                    deletedAt: null,
                },
            }),
            prisma.event.findMany({
                where: {
                    organizerId: organizerProfile.userId,
                    status: "PUBLISHED",
                    deletedAt: null,
                    schedules: {
                        some: {
                            scheduleDate: { gte: now },
                        },
                    },
                },
                include: {
                    category: { select: { name: true, slug: true } },
                    venue: { select: { name: true, city: true } },
                    schedules: {
                        where: { scheduleDate: { gte: now } },
                        orderBy: { scheduleDate: "asc" },
                        take: 1,
                    },
                    ticketTypes: {
                        where: { isActive: true, isHidden: false },
                        select: { basePrice: true, isFree: true },
                        orderBy: { basePrice: "asc" },
                    },
                    _count: {
                        select: { reviews: true },
                    },
                },
                orderBy: {
                    schedules: { _count: "desc" },
                },
                take: 12,
            }),
            prisma.event.findMany({
                where: {
                    organizerId: organizerProfile.userId,
                    status: { in: ["PUBLISHED", "ENDED"] },
                    deletedAt: null,
                    schedules: {
                        every: {
                            scheduleDate: { lt: now },
                        },
                    },
                },
                include: {
                    category: { select: { name: true, slug: true } },
                    venue: { select: { name: true, city: true } },
                    schedules: {
                        orderBy: { scheduleDate: "desc" },
                        take: 1,
                    },
                    _count: {
                        select: { reviews: true },
                    },
                },
                orderBy: {
                    createdAt: "desc",
                },
                take: 6,
            }),
            prisma.organizerFollower.count({
                where: { organizerProfileId: organizerProfile.id },
            }),
            prisma.bookedTicket.count({
                where: {
                    booking: {
                        event: { organizerId: organizerProfile.userId },
                        status: { in: ["PAID", "CONFIRMED"] },
                    },
                },
            }),
        ]);

        let isFollowing = false;
        const supabase = await createClient();
        const { data: { user } } = await supabase.auth.getUser();
        
        if (user) {
            const dbUser = await prisma.user.findUnique({
                where: { email: user.email! },
                select: { id: true },
            });
            
            if (dbUser) {
                const follow = await prisma.organizerFollower.findUnique({
                    where: {
                        organizerProfileId_userId: {
                            organizerProfileId: organizerProfile.id,
                            userId: dbUser.id,
                        },
                    },
                });
                isFollowing = !!follow;
            }
        }

        const reviews = await prisma.review.aggregate({
            where: {
                event: { organizerId: organizerProfile.userId },
                status: "PUBLISHED",
            },
            _avg: { rating: true },
            _count: { rating: true },
        });

        const formatEvent = (event: typeof upcomingEvents[0]) => ({
            id: event.id,
            slug: event.slug,
            title: event.title,
            posterImage: event.posterImage,
            bannerImage: event.bannerImage,
            eventType: event.eventType,
            category: event.category,
            venue: event.venue,
            schedule: event.schedules[0] || null,
            lowestPrice: event.ticketTypes.length > 0
                ? event.ticketTypes.some((t: { isFree: boolean }) => t.isFree)
                    ? 0
                    : Number(event.ticketTypes[0].basePrice)
                : null,
            reviewCount: event._count.reviews,
        });

        return NextResponse.json({
            success: true,
            data: {
                organizer: {
                    id: organizerProfile.id,
                    userId: organizerProfile.userId,
                    organizationName: organizerProfile.organizationName,
                    organizationSlug: organizerProfile.organizationSlug,
                    organizationLogo: organizerProfile.organizationLogo,
                    organizationBanner: organizerProfile.organizationBanner,
                    organizationDescription: organizerProfile.organizationDescription,
                    websiteUrl: organizerProfile.websiteUrl,
                    socialFacebook: organizerProfile.socialFacebook,
                    socialInstagram: organizerProfile.socialInstagram,
                    socialTwitter: organizerProfile.socialTwitter,
                    socialTiktok: organizerProfile.socialTiktok,
                    isVerified: organizerProfile.isVerified,
                    createdAt: organizerProfile.createdAt,
                    user: organizerProfile.user,
                },
                stats: {
                    totalEvents,
                    followersCount,
                    totalTicketsSold,
                    averageRating: reviews._avg.rating || 0,
                    totalReviews: reviews._count.rating,
                },
                upcomingEvents: upcomingEvents.map(formatEvent),
                pastEvents: pastEvents.map((e: typeof pastEvents[0]) => ({
                    id: e.id,
                    slug: e.slug,
                    title: e.title,
                    posterImage: e.posterImage,
                    category: e.category,
                    venue: e.venue,
                    schedule: e.schedules[0] || null,
                    reviewCount: e._count.reviews,
                })),
                isFollowing,
            },
        });
    } catch (error) {
        console.error("Error fetching organizer profile:", error);
        return NextResponse.json(
            { success: false, error: { message: "Gagal memuat profil organizer" } },
            { status: 500 }
        );
    }
}
