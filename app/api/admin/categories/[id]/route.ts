import { type NextRequest } from "next/server";
import prisma from "@/lib/prisma/client";
import { successResponse, errorResponse } from "@/lib/api/response";
import { createClient } from "@/lib/supabase/server";
import { z } from "zod";
import type { User } from "@/types/prisma";

type AdminResult = { admin: User } | { error: string; status: number };

const updateCategorySchema = z.object({
    name: z.string().min(2).max(50).optional(),
    slug: z.string().min(2).max(50).regex(/^[a-z0-9-]+$/).optional(),
    icon: z.string().optional().nullable(),
    colorHex: z.string().regex(/^#[0-9A-Fa-f]{6}$/).optional().nullable(),
    sortOrder: z.number().int().min(0).optional(),
    isActive: z.boolean().optional(),
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

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const authResult = await verifyAdmin();

        if ("error" in authResult) {
            return errorResponse(authResult.error, authResult.status);
        }

        const category = await prisma.category.findUnique({
            where: { id },
            include: {
                _count: {
                    select: { events: true, children: true },
                },
                parent: {
                    select: { id: true, name: true },
                },
                children: {
                    select: { id: true, name: true, slug: true },
                },
            },
        });

        if (!category) {
            return errorResponse("Category not found", 404);
        }

        return successResponse(category);
    } catch (error) {
        console.error("Error fetching category:", error);
        return errorResponse("Failed to fetch category", 500);
    }
}

export async function PUT(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const authResult = await verifyAdmin();

        if ("error" in authResult) {
            return errorResponse(authResult.error, authResult.status);
        }

        const category = await prisma.category.findUnique({
            where: { id },
        });

        if (!category) {
            return errorResponse("Category not found", 404);
        }

        const body = await request.json();
        const parsed = updateCategorySchema.safeParse(body);

        if (!parsed.success) {
            return errorResponse("Validation error", 400, {
                errors: parsed.error.flatten().fieldErrors,
            });
        }

        const data = parsed.data;

        if (data.slug && data.slug !== category.slug) {
            const existingSlug = await prisma.category.findUnique({
                where: { slug: data.slug },
            });

            if (existingSlug) {
                return errorResponse("Slug already exists", 400);
            }
        }

        const updateData: Record<string, unknown> = {};

        if (data.name !== undefined) updateData.name = data.name;
        if (data.slug !== undefined) updateData.slug = data.slug;
        if (data.icon !== undefined) updateData.icon = data.icon;
        if (data.colorHex !== undefined) updateData.colorHex = data.colorHex;
        if (data.sortOrder !== undefined) updateData.sortOrder = data.sortOrder;
        if (data.isActive !== undefined) updateData.isActive = data.isActive;
        if (data.parentId !== undefined) updateData.parentId = data.parentId;

        const updatedCategory = await prisma.category.update({
            where: { id },
            data: updateData,
            include: {
                _count: {
                    select: { events: true, children: true },
                },
            },
        });

        return successResponse(updatedCategory);
    } catch (error) {
        console.error("Error updating category:", error);
        return errorResponse("Failed to update category", 500);
    }
}

export async function DELETE(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const authResult = await verifyAdmin();

        if ("error" in authResult) {
            return errorResponse(authResult.error, authResult.status);
        }

        const category = await prisma.category.findUnique({
            where: { id },
            include: {
                _count: {
                    select: { events: true, children: true },
                },
            },
        });

        if (!category) {
            return errorResponse("Category not found", 404);
        }

        if (category._count.events > 0) {
            return errorResponse("Cannot delete category with existing events", 400);
        }

        if (category._count.children > 0) {
            return errorResponse("Cannot delete category with subcategories", 400);
        }

        await prisma.category.delete({
            where: { id },
        });

        return successResponse({ message: "Category deleted successfully" });
    } catch (error) {
        console.error("Error deleting category:", error);
        return errorResponse("Failed to delete category", 500);
    }
}
