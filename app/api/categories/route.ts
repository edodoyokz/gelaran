import prisma from "@/lib/prisma/client";
import { successResponse, errorResponse } from "@/lib/api/response";

interface CategoryWithCount {
    id: string;
    name: string;
    slug: string;
    icon: string | null;
    colorHex: string | null;
    parentId: string | null;
    _count: {
        events: number;
    };
}

export async function GET() {
    try {
        const categories = await prisma.category.findMany({
            where: { isActive: true },
            orderBy: { sortOrder: "asc" },
            select: {
                id: true,
                name: true,
                slug: true,
                icon: true,
                colorHex: true,
                parentId: true,
                _count: {
                    select: {
                        events: {
                            where: {
                                status: "PUBLISHED",
                                deletedAt: null,
                            },
                        },
                    },
                },
            },
        });

        const transformedCategories = categories.map((cat: CategoryWithCount) => ({
            id: cat.id,
            name: cat.name,
            slug: cat.slug,
            icon: cat.icon,
            colorHex: cat.colorHex,
            parentId: cat.parentId,
            eventCount: cat._count.events,
        }));

        return successResponse(transformedCategories);
    } catch (error) {
        console.error("Error fetching categories:", error);
        return errorResponse("Failed to fetch categories", 500);
    }
}
