import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma/client";
import { requireAuthenticatedAppUser } from "@/lib/auth/route-auth";

interface ReviewWithUser {
  id: string;
  rating: number;
  reviewText: string | null;
  isVerified: boolean;
  createdAt: Date;
  user: {
    name: string;
    avatarUrl: string | null;
  };
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");

    const event = await prisma.event.findUnique({
      where: { slug },
      select: { id: true, status: true },
    });

    if (!event) {
      return NextResponse.json(
        { success: false, error: { message: "Event not found" } },
        { status: 404 }
      );
    }

    const [reviews, total] = await Promise.all([
      prisma.review.findMany({
        where: { eventId: event.id, status: "PUBLISHED" },
        include: {
          user: {
            select: { name: true, avatarUrl: true },
          },
        },
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.review.count({
        where: { eventId: event.id, status: "PUBLISHED" },
      }),
    ]);

    const avgRating = await prisma.review.aggregate({
      where: { eventId: event.id, status: "PUBLISHED" },
      _avg: { rating: true },
    });

    const ratingDistribution = await prisma.review.groupBy({
      by: ["rating"],
      where: { eventId: event.id, status: "PUBLISHED" },
      _count: { rating: true },
    });

    const distribution: Record<number, number> = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    ratingDistribution.forEach((r) => {
      distribution[r.rating] = r._count.rating;
    });

    return NextResponse.json({
      success: true,
      data: {
        reviews: reviews.map((review: ReviewWithUser) => ({
          id: review.id,
          rating: review.rating,
          reviewText: review.reviewText,
          isVerified: review.isVerified,
          createdAt: review.createdAt,
          user: {
            name: review.user.name,
            avatarUrl: review.user.avatarUrl,
          },
        })),
        stats: {
          averageRating: avgRating._avg.rating || 0,
          totalReviews: total,
          distribution,
        },
      },
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Get reviews error:", error);
    return NextResponse.json(
      { success: false, error: { message: "Failed to get reviews" } },
      { status: 500 }
    );
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    const body = await request.json();
    const { rating, reviewText } = body;

    if (!rating || rating < 1 || rating > 5) {
      return NextResponse.json(
        { success: false, error: { message: "Rating must be between 1 and 5" } },
        { status: 400 }
      );
    }

    const authContext = await requireAuthenticatedAppUser();

    if ("error" in authContext) {
      return NextResponse.json(
        { success: false, error: { message: authContext.error } },
        { status: authContext.status }
      );
    }

    const event = await prisma.event.findUnique({
      where: { slug },
      select: { id: true, status: true },
    });

    if (!event) {
      return NextResponse.json(
        { success: false, error: { message: "Event not found" } },
        { status: 404 }
      );
    }

    if (event.status !== "ENDED") {
      return NextResponse.json(
        { success: false, error: { message: "Reviews can only be posted for ended events" } },
        { status: 400 }
      );
    }

    const booking = await prisma.booking.findFirst({
      where: {
        userId: authContext.dbUserId,
        eventId: event.id,
        status: { in: ["CONFIRMED", "PAID"] },
      },
    });

    if (!booking) {
      return NextResponse.json(
        { success: false, error: { message: "You must have attended this event to leave a review" } },
        { status: 400 }
      );
    }

    const existingReview = await prisma.review.findFirst({
      where: { userId: authContext.dbUserId, eventId: event.id },
    });

    if (existingReview) {
      return NextResponse.json(
        { success: false, error: { message: "You have already reviewed this event" } },
        { status: 400 }
      );
    }

    const review = await prisma.review.create({
      data: {
        userId: authContext.dbUserId,
        eventId: event.id,
        bookingId: booking.id,
        rating,
        reviewText: reviewText || null,
        isVerified: true,
        status: "PUBLISHED",
      },
      include: {
        user: {
          select: { name: true, avatarUrl: true },
        },
      },
    });

    return NextResponse.json({
      success: true,
      data: {
        id: review.id,
        rating: review.rating,
        reviewText: review.reviewText,
        isVerified: review.isVerified,
        createdAt: review.createdAt,
        user: {
          name: review.user.name,
          avatarUrl: review.user.avatarUrl,
        },
      },
    });
  } catch (error) {
    console.error("Create review error:", error);
    return NextResponse.json(
      { success: false, error: { message: "Failed to create review" } },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    const body = await request.json();
    const { reviewId, rating, reviewText } = body;

    if (!reviewId) {
      return NextResponse.json(
        { success: false, error: { message: "Review ID is required" } },
        { status: 400 }
      );
    }

    const authContext = await requireAuthenticatedAppUser();

    if ("error" in authContext) {
      return NextResponse.json(
        { success: false, error: { message: authContext.error } },
        { status: authContext.status }
      );
    }

    const event = await prisma.event.findUnique({
      where: { slug },
      select: { id: true },
    });

    if (!event) {
      return NextResponse.json(
        { success: false, error: { message: "Event not found" } },
        { status: 404 }
      );
    }

    const existingReview = await prisma.review.findFirst({
      where: { id: reviewId, userId: authContext.dbUserId, eventId: event.id },
    });

    if (!existingReview) {
      return NextResponse.json(
        { success: false, error: { message: "Review not found or not authorized" } },
        { status: 404 }
      );
    }

    const review = await prisma.review.update({
      where: { id: reviewId },
      data: {
        rating: rating !== undefined ? rating : existingReview.rating,
        reviewText: reviewText !== undefined ? reviewText : existingReview.reviewText,
      },
      include: {
        user: {
          select: { name: true, avatarUrl: true },
        },
      },
    });

    return NextResponse.json({
      success: true,
      data: {
        id: review.id,
        rating: review.rating,
        reviewText: review.reviewText,
        isVerified: review.isVerified,
        createdAt: review.createdAt,
        user: {
          name: review.user.name,
          avatarUrl: review.user.avatarUrl,
        },
      },
    });
  } catch (error) {
    console.error("Update review error:", error);
    return NextResponse.json(
      { success: false, error: { message: "Failed to update review" } },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    const { searchParams } = new URL(request.url);
    const reviewId = searchParams.get("reviewId");

    if (!reviewId) {
      return NextResponse.json(
        { success: false, error: { message: "Review ID is required" } },
        { status: 400 }
      );
    }

    const authContext = await requireAuthenticatedAppUser();

    if ("error" in authContext) {
      return NextResponse.json(
        { success: false, error: { message: authContext.error } },
        { status: authContext.status }
      );
    }

    const event = await prisma.event.findUnique({
      where: { slug },
      select: { id: true },
    });

    if (!event) {
      return NextResponse.json(
        { success: false, error: { message: "Event not found" } },
        { status: 404 }
      );
    }

    const existingReview = await prisma.review.findFirst({
      where: { id: reviewId, userId: authContext.dbUserId, eventId: event.id },
    });

    if (!existingReview) {
      return NextResponse.json(
        { success: false, error: { message: "Review not found or not authorized" } },
        { status: 404 }
      );
    }

    await prisma.review.delete({
      where: { id: reviewId },
    });

    return NextResponse.json({
      success: true,
      data: { message: "Review deleted successfully" },
    });
  } catch (error) {
    console.error("Delete review error:", error);
    return NextResponse.json(
      { success: false, error: { message: "Failed to delete review" } },
      { status: 500 }
    );
  }
}
