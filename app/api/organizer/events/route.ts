import { type NextRequest } from "next/server";
import prisma from "@/lib/prisma/client";
import { successResponse, errorResponse } from "@/lib/api/response";
import { createClient } from "@/lib/supabase/server";
import { createEventSchema } from "@/lib/validators";
import { generateSlug } from "@/lib/storage/upload";

export async function POST(request: NextRequest) {
    try {
        const supabase = await createClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
            return errorResponse("Unauthorized", 401);
        }

        const organizer = await prisma.user.findUnique({
            where: { email: user.email! },
            include: { organizerProfile: true },
        });

        if (!organizer || organizer.role !== "ORGANIZER") {
            return errorResponse("Only organizers can create events", 403);
        }

        const body = await request.json();
        const parsed = createEventSchema.safeParse(body);

        if (!parsed.success) {
            return errorResponse("Validation error", 400, {
                errors: parsed.error.flatten().fieldErrors,
            });
        }

        const data = parsed.data;

        let baseSlug = generateSlug(data.title);
        let slug = baseSlug;
        let counter = 1;
        
        while (await prisma.event.findUnique({ where: { slug } })) {
            slug = `${baseSlug}-${counter}`;
            counter++;
        }

        let venueId = data.venueId;
        
        if (!venueId && data.venueName && data.venueCity) {
            const venueSlug = generateSlug(data.venueName);
            let uniqueVenueSlug = venueSlug;
            let venueCounter = 1;
            
            while (await prisma.venue.findUnique({ where: { slug: uniqueVenueSlug } })) {
                uniqueVenueSlug = `${venueSlug}-${venueCounter}`;
                venueCounter++;
            }

            const newVenue = await prisma.venue.create({
                data: {
                    name: data.venueName,
                    slug: uniqueVenueSlug,
                    address: data.venueAddress || "",
                    city: data.venueCity,
                    province: data.venueProvince || "",
                    organizerId: organizer.id,
                },
            });
            venueId = newVenue.id;
        }

        const event = await prisma.$transaction(async (tx) => {
            const createdEvent = await tx.event.create({
                data: {
                    organizerId: organizer.id,
                    categoryId: data.categoryId,
                    venueId: data.eventType === "ONLINE" ? null : venueId,
                    title: data.title,
                    slug,
                    shortDescription: data.shortDescription,
                    description: data.description,
                    eventType: data.eventType,
                    status: "DRAFT",
                    visibility: data.visibility,
                    accessPassword: data.accessPassword,
                    posterImage: data.posterImage,
                    bannerImage: data.bannerImage,
                    trailerVideoUrl: data.trailerVideoUrl,
                    onlineMeetingUrl: data.onlineMeetingUrl,
                    onlineMeetingPassword: data.onlineMeetingPassword,
                    minTicketsPerOrder: data.minTicketsPerOrder,
                    maxTicketsPerOrder: data.maxTicketsPerOrder,
                    termsAndConditions: data.termsAndConditions,
                    refundPolicy: data.refundPolicy,
                    metaTitle: data.metaTitle,
                    metaDescription: data.metaDescription,
                },
            });

            for (let i = 0; i < data.schedules.length; i++) {
                const schedule = data.schedules[i];
                await tx.eventSchedule.create({
                    data: {
                        eventId: createdEvent.id,
                        title: schedule.title,
                        scheduleDate: new Date(schedule.scheduleDate),
                        startTime: new Date(`1970-01-01T${schedule.startTime}:00`),
                        endTime: new Date(`1970-01-01T${schedule.endTime}:00`),
                        description: schedule.description,
                        locationOverride: schedule.locationOverride,
                        sortOrder: i,
                    },
                });
            }

            for (let i = 0; i < data.ticketTypes.length; i++) {
                const ticket = data.ticketTypes[i];
                await tx.ticketType.create({
                    data: {
                        eventId: createdEvent.id,
                        name: ticket.name,
                        description: ticket.description,
                        basePrice: ticket.isFree ? 0 : ticket.basePrice,
                        totalQuantity: ticket.totalQuantity,
                        minPerOrder: ticket.minPerOrder,
                        maxPerOrder: ticket.maxPerOrder,
                        isFree: ticket.isFree,
                        isHidden: ticket.isHidden,
                        requiresAttendeeInfo: ticket.requiresAttendeeInfo,
                        saleStartAt: ticket.saleStartAt ? new Date(ticket.saleStartAt) : null,
                        saleEndAt: ticket.saleEndAt ? new Date(ticket.saleEndAt) : null,
                        sortOrder: i,
                    },
                });
            }

            return createdEvent;
        });

        const fullEvent = await prisma.event.findUnique({
            where: { id: event.id },
            include: {
                category: true,
                venue: true,
                schedules: { orderBy: { sortOrder: "asc" } },
                ticketTypes: { orderBy: { sortOrder: "asc" } },
            },
        });

        return successResponse(fullEvent, undefined, 201);
    } catch (error) {
        console.error("Error creating event:", error);
        return errorResponse("Failed to create event", 500);
    }
}

export async function GET(request: NextRequest) {
    try {
        const supabase = await createClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
            return errorResponse("Unauthorized", 401);
        }

        const organizer = await prisma.user.findUnique({
            where: { email: user.email! },
        });

        if (!organizer || organizer.role !== "ORGANIZER") {
            return errorResponse("Only organizers can access this", 403);
        }

        const searchParams = request.nextUrl.searchParams;
        const statusParam = searchParams.get("status") || undefined;
        const search = searchParams.get("search") || undefined;

        const validStatuses = ["DRAFT", "PENDING_REVIEW", "PUBLISHED", "CANCELLED", "ENDED"] as const;
        type EventStatusType = typeof validStatuses[number];

        let statusFilter: { status?: EventStatusType | { in: EventStatusType[] } } = {};
        if (statusParam) {
            const statuses = statusParam.split(",").filter((s): s is EventStatusType => 
                validStatuses.includes(s as EventStatusType)
            );
            if (statuses.length === 1) {
                statusFilter = { status: statuses[0] };
            } else if (statuses.length > 1) {
                statusFilter = { status: { in: statuses } };
            }
        }

        const events = await prisma.event.findMany({
            where: {
                organizerId: organizer.id,
                deletedAt: null,
                ...statusFilter,
                ...(search && {
                    OR: [
                        { title: { contains: search, mode: "insensitive" } },
                        { description: { contains: search, mode: "insensitive" } },
                    ],
                }),
            },
            orderBy: { createdAt: "desc" },
            include: {
                category: { select: { name: true, colorHex: true } },
                venue: { select: { name: true, city: true } },
                _count: { select: { bookings: true } },
                schedules: { take: 1, orderBy: { scheduleDate: "asc" } },
            },
        });

        return successResponse(events);
    } catch (error) {
        console.error("Error fetching organizer events:", error);
        return errorResponse("Failed to fetch events", 500);
    }
}
