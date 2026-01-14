import { type NextRequest } from "next/server";
import prisma from "@/lib/prisma/client";
import { successResponse, errorResponse } from "@/lib/api/response";
import { createClient } from "@/lib/supabase/server";
import { z } from "zod";
import type { User } from "@prisma/client";

type AdminResult = { admin: User } | { error: string; status: number };

const createCategorySchema = z.object({
    name: z.string().min(2).max(50),
    slug: z.string().min(2).max(50).regex(/^[a-z0-9-]+$/),
    icon: z.string().optional().nullable(),
    colorHex: z.string().regex(/^#[0-9A-Fa-f]{6}$/).optional().nullable(),
    sortOrder: z.number().int().min(0).optional().default(0),
    isActive: z.boolean().optional().default(true),
    parentId: z.string().uuid().optional().nullable(),
});

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

export async function GET() {
    try {
        const authResult = await verifyAdmin();

        if ("error" in authResult) {
            return errorResponse(authResult.error, authResult.status);
        }

        const categories = await prisma.category.findMany({
            orderBy: { sortOrder: "asc" },
            include: {
                _count: {
                    select: { events: true, children: true },
                },
                parent: {
                    select: { id: true, name: true },
                },
            },
        });

        return successResponse(categories);
    } catch (error) {
        console.error("Error fetching categories:", error);
        return errorResponse("Failed to fetch categories", 500);
    }
}

export async function POST(request: NextRequest) {
    try {
        const authResult = await verifyAdmin();

        if ("error" in authResult) {
            return errorResponse(authResult.error, authResult.status);
        }

        const body = await request.json();
        const parsed = createCategorySchema.safeParse(body);

        if (!parsed.success) {
            return errorResponse("Validation error", 400, {
                errors: parsed.error.flatten().fieldErrors,
            });
        }

        const data = parsed.data;

        const existingSlug = await prisma.category.findUnique({
            where: { slug: data.slug },
        });

        if (existingSlug) {
            return errorResponse("Slug already exists", 400);
        }

        const category = await prisma.category.create({
            data: {
                name: data.name,
                slug: data.slug,
                icon: data.icon,
                colorHex: data.colorHex,
                sortOrder: data.sortOrder,
                isActive: data.isActive,
                parentId: data.parentId,
            },
            include: {
                _count: {
                    select: { events: true, children: true },
                },
            },
        });

        return successResponse(category, undefined, 201);
    } catch (error) {
        console.error("Error creating category:", error);
        return errorResponse("Failed to create category", 500);
    }
}
