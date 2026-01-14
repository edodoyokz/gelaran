import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma/client";
import { createClient } from "@/lib/supabase/server";
import { z } from "zod";

const createReviewSchema = z.object({
    eventId: z.string().uuid(),
    bookingId: z.string().uuid(),
    rating: z.number().int().min(1).max(5),
    reviewText: z.string().max(1000).nullable().optional(),
});

export async function POST(request: NextRequest) {
    try {
        const supabase = await createClient();
        const { data: { user } } = await supabase.auth.getUser();
        
        if (!user) {
            return NextResponse.json(
                { success: false, error: { message: "Silakan login terlebih dahulu" } },
                { status: 401 }
            );
        }

        const dbUser = await prisma.user.findUnique({
            where: { email: user.email! },
            select: { id: true },
        });

        if (!dbUser) {
            return NextResponse.json(
                { success: false, error: { message: "User tidak ditemukan" } },
                { status: 404 }
            );
        }

        const body = await request.json();
        const validationResult = createReviewSchema.safeParse(body);

        if (!validationResult.success) {
            return NextResponse.json(
                { success: false, error: { message: "Data tidak valid", details: validationResult.error.issues } },
                { status: 400 }
            );
        }

        const { eventId, bookingId, rating, reviewText } = validationResult.data;

        const booking = await prisma.booking.findFirst({
            where: {
                id: bookingId,
                userId: dbUser.id,
                eventId,
                status: { in: ["PAID", "CONFIRMED"] },
            },
            include: {
                event: {
                    include: {
                        schedules: {
                            orderBy: { scheduleDate: "desc" },
                            take: 1,
                        },
                    },
                },
            },
        });

        if (!booking) {
            return NextResponse.json(
                { success: false, error: { message: "Booking tidak ditemukan atau tidak valid" } },
                { status: 404 }
            );
        }

        const lastSchedule = booking.event.schedules[0];
        if (lastSchedule) {
            const eventDate = new Date(lastSchedule.scheduleDate);
            if (eventDate > new Date()) {
                return NextResponse.json(
                    { success: false, error: { message: "Tidak bisa review sebelum event selesai" } },
                    { status: 400 }
                );
            }
        }

        const existingReview = await prisma.review.findFirst({
            where: {
                eventId,
                userId: dbUser.id,
            },
        });

        if (existingReview) {
            return NextResponse.json(
                { success: false, error: { message: "Anda sudah memberikan review untuk event ini" } },
                { status: 400 }
            );
        }

        const review = await prisma.review.create({
            data: {
                userId: dbUser.id,
                eventId,
                bookingId,
                rating,
                reviewText: reviewText || null,
                isVerified: true,
                status: "PUBLISHED",
            },
            include: {
                user: {
                    select: {
                        id: true,
                        name: true,
                        avatarUrl: true,
                    },
                },
            },
        });

        return NextResponse.json({
            success: true,
            data: {
                id: review.id,
                rating: review.rating,
                reviewText: review.reviewText,
                createdAt: review.createdAt.toISOString(),
                user: review.user,
            },
        });
    } catch (error) {
        console.error("Error creating review:", error);
        return NextResponse.json(
            { success: false, error: { message: "Gagal membuat review" } },
            { status: 500 }
        );
    }
}
