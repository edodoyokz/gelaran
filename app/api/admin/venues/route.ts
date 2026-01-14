import prisma from "@/lib/prisma/client";
import { successResponse, errorResponse } from "@/lib/api/response";
import { createClient } from "@/lib/supabase/server";
import { z } from "zod";
import type { Prisma } from "@/types/prisma";

type AdminResult = { admin: { id: string } } | { error: string; status: number };

async function verifyAdmin(): Promise<AdminResult> {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user || !user.email) {
        return { error: "Unauthorized", status: 401 };
    }

    const admin = await prisma.user.findUnique({
        where: { email: user.email },
    });

    if (!admin || !["ADMIN", "SUPER_ADMIN"].includes(admin.role)) {
        return { error: "Admin access required", status: 403 };
    }

    return { admin };
}

export async function GET(request: Request) {
    try {
        const authResult = await verifyAdmin();

        if ("error" in authResult) {
            return errorResponse(authResult.error, authResult.status);
        }

        const { searchParams } = new URL(request.url);
        const search = searchParams.get("search") || "";
        const city = searchParams.get("city") || "";
        const page = parseInt(searchParams.get("page") || "1");
        const limit = parseInt(searchParams.get("limit") || "20");
        const skip = (page - 1) * limit;

        const where: Prisma.VenueWhereInput = {};

        if (search) {
            where.OR = [
                { name: { contains: search, mode: "insensitive" } },
                { address: { contains: search, mode: "insensitive" } },
            ];
        }

        if (city) {
            where.city = { equals: city, mode: "insensitive" };
        }

        const [venues, total, cities] = await Promise.all([
            prisma.venue.findMany({
                where,
                orderBy: { createdAt: "desc" },
                skip,
                take: limit,
                include: {
                    _count: {
                        select: { events: true },
                    },
                },
            }),
            prisma.venue.count({ where }),
            prisma.venue.findMany({
                select: { city: true },
                distinct: ["city"],
                orderBy: { city: "asc" },
            }),
        ]);

        const formattedVenues = venues.map((v) => ({
            ...v,
            latitude: v.latitude?.toString() || null,
            longitude: v.longitude?.toString() || null,
        }));

        return successResponse({
            venues: formattedVenues,
            cities: cities.map((c) => c.city),
            pagination: {
                page,
                limit,
                total,
                totalPages: Math.ceil(total / limit),
            },
        });
    } catch (error) {
        console.error("Error fetching venues:", error);
        return errorResponse("Failed to fetch venues", 500);
    }
}

const createVenueSchema = z.object({
    name: z.string().min(3).max(200),
    address: z.string().min(5).max(500),
    city: z.string().min(2).max(100),
    province: z.string().min(2).max(100),
    postalCode: z.string().max(10).optional(),
    country: z.string().default("Indonesia"),
    latitude: z.number().optional(),
    longitude: z.number().optional(),
    googlePlaceId: z.string().optional(),
    capacity: z.number().int().positive().optional(),
    description: z.string().max(2000).optional(),
    amenities: z.array(z.string()).optional(),
    imageUrl: z.string().url().optional(),
});

export async function POST(request: Request) {
    try {
        const authResult = await verifyAdmin();

        if ("error" in authResult) {
            return errorResponse(authResult.error, authResult.status);
        }

        const body = await request.json();
        const parsed = createVenueSchema.safeParse(body);

        if (!parsed.success) {
            return errorResponse("Validation error", 400, {
                errors: parsed.error.flatten().fieldErrors,
            });
        }

        const slug = parsed.data.name
            .toLowerCase()
            .replace(/[^a-z0-9\s-]/g, "")
            .replace(/\s+/g, "-")
            .replace(/-+/g, "-")
            .trim();

        let uniqueSlug = slug;
        let counter = 1;
        while (true) {
            const existing = await prisma.venue.findUnique({
                where: { slug: uniqueSlug },
            });
            if (!existing) break;
            uniqueSlug = `${slug}-${counter}`;
            counter++;
        }

        const { amenities, ...restData } = parsed.data;

        const venue = await prisma.venue.create({
            data: {
                ...restData,
                slug: uniqueSlug,
                amenities: amenities ? amenities : undefined,
            },
        });

        return successResponse({
            ...venue,
            latitude: venue.latitude?.toString() || null,
            longitude: venue.longitude?.toString() || null,
        }, undefined, 201);
    } catch (error) {
        console.error("Error creating venue:", error);
        return errorResponse("Failed to create venue", 500);
    }
}
