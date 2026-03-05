import { NextResponse } from "next/server";
import prisma from "@/lib/prisma/client";

export async function GET() {
    try {
        const events = await prisma.event.findMany({
            where: {
                status: "PUBLISHED",
                deletedAt: null,
            },
            orderBy: [
                { viewCount: "desc" },
                { createdAt: "desc" },
            ],
            take: 6,
            include: {
                category: {
                    select: {
                        id: true,
                        name: true,
                        slug: true,
                        colorHex: true,
                    },
                },
                venue: {
                    select: {
                        id: true,
                        name: true,
                        city: true,
                        province: true,
                    },
                },
                organizer: {
                    select: {
                        id: true,
                        name: true,
                        organizerProfile: {
                            select: {
                                organizationName: true,
                                organizationSlug: true,
                                organizationLogo: true,
                            },
                        },
                    },
                },
                schedules: {
                    where: { isActive: true },
                    orderBy: { scheduleDate: "asc" },
                    take: 1,
                    select: {
                        scheduleDate: true,
                        startTime: true,
                    },
                },
                ticketTypes: {
                    where: { isActive: true, isHidden: false },
                    orderBy: { basePrice: "asc" },
                    take: 1,
                    select: {
                        basePrice: true,
                        isFree: true,
                    },
                },
            },
        });

        return NextResponse.json({
            success: true,
            data: events.map((event) => ({
                id: event.id,
                slug: event.slug,
                title: event.title,
                shortDescription: event.shortDescription,
                posterImage: event.posterImage,
                eventType: event.eventType,
                isFeatured: event.isFeatured,
                category: event.category,
                venue: event.venue,
                organizer: {
                    id: event.organizer.id,
                    name: event.organizer.organizerProfile?.organizationName || event.organizer.name,
                    slug: event.organizer.organizerProfile?.organizationSlug,
                    logo: event.organizer.organizerProfile?.organizationLogo,
                },
                schedule: event.schedules[0] || null,
                startingPrice: event.ticketTypes[0]?.isFree
                    ? 0
                    : event.ticketTypes[0]?.basePrice
                      ? Number(event.ticketTypes[0].basePrice)
                      : null,
                viewCount: event.viewCount,
            })),
        });
    } catch (error) {
        console.error("Failed to fetch top events:", error);
        return NextResponse.json(
            { success: false, error: { message: "Failed to fetch top events" } },
            { status: 500 }
        );
    }
}
