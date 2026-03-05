import { NextResponse } from "next/server";
import prisma from "@/lib/prisma/client";

export async function GET() {
    try {
        const reviews = await prisma.review.findMany({
            where: {
                status: "PUBLISHED",
                reviewText: { not: null },
            },
            orderBy: [{ rating: "desc" }, { createdAt: "desc" }],
            take: 6,
            select: {
                id: true,
                rating: true,
                reviewText: true,
                createdAt: true,
                user: {
                    select: {
                        name: true,
                        avatarUrl: true,
                    },
                },
                event: {
                    select: {
                        title: true,
                        slug: true,
                    },
                },
            },
        });

        return NextResponse.json({
            success: true,
            data: reviews,
        });
    } catch (error) {
        console.error("Failed to fetch review highlights:", error);
        return NextResponse.json(
            { success: false, error: { message: "Failed to fetch review highlights" } },
            { status: 500 }
        );
    }
}
