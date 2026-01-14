import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma/client";
import { createClient } from "@/lib/supabase/server";

async function isAdmin(userId: string): Promise<boolean> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { role: true },
  });
  return user?.role === "SUPER_ADMIN" || user?.role === "ADMIN";
}

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json(
        { success: false, error: { message: "Authentication required" } },
        { status: 401 }
      );
    }

    if (!(await isAdmin(user.id))) {
      return NextResponse.json(
        { success: false, error: { message: "Admin access required" } },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status") as "PENDING" | "PUBLISHED" | "HIDDEN" | "REJECTED" | null;
    const eventId = searchParams.get("eventId");
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "20");

    const where: { status?: "PENDING" | "PUBLISHED" | "HIDDEN" | "REJECTED"; eventId?: string } = {};
    if (status) {
      where.status = status;
    }
    if (eventId) {
      where.eventId = eventId;
    }

    const whereClause = Object.keys(where).length > 0 ? where : undefined;

    const [reviews, total] = await Promise.all([
      prisma.review.findMany({
        where: whereClause,
        include: {
          user: {
            select: { id: true, name: true, email: true, avatarUrl: true },
          },
          event: {
            select: { id: true, title: true, slug: true },
          },
        },
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.review.count({
        where: whereClause,
      }),
    ]);

    return NextResponse.json({
      success: true,
      data: reviews,
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

export async function PUT(request: NextRequest) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json(
        { success: false, error: { message: "Authentication required" } },
        { status: 401 }
      );
    }

    if (!(await isAdmin(user.id))) {
      return NextResponse.json(
        { success: false, error: { message: "Admin access required" } },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { reviewId, status } = body;

    if (!reviewId || !status) {
      return NextResponse.json(
        { success: false, error: { message: "Review ID and status are required" } },
        { status: 400 }
      );
    }

    if (!["PENDING", "PUBLISHED", "HIDDEN", "REJECTED"].includes(status)) {
      return NextResponse.json(
        { success: false, error: { message: "Invalid status" } },
        { status: 400 }
      );
    }

    const existingReview = await prisma.review.findUnique({
      where: { id: reviewId },
    });

    if (!existingReview) {
      return NextResponse.json(
        { success: false, error: { message: "Review not found" } },
        { status: 404 }
      );
    }

    const review = await prisma.review.update({
      where: { id: reviewId },
      data: { status },
      include: {
        user: {
          select: { name: true, email: true },
        },
        event: {
          select: { title: true },
        },
      },
    });

    await prisma.auditLog.create({
      data: {
        userId: user.id,
        action: "REVIEW_MODERATION",
        entityType: "Review",
        entityId: reviewId,
        oldValues: { status: existingReview.status },
        newValues: { status: review.status },
      },
    });

    return NextResponse.json({
      success: true,
      data: review,
    });
  } catch (error) {
    console.error("Update review error:", error);
    return NextResponse.json(
      { success: false, error: { message: "Failed to update review" } },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json(
        { success: false, error: { message: "Authentication required" } },
        { status: 401 }
      );
    }

    if (!(await isAdmin(user.id))) {
      return NextResponse.json(
        { success: false, error: { message: "Admin access required" } },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(request.url);
    const reviewId = searchParams.get("reviewId");

    if (!reviewId) {
      return NextResponse.json(
        { success: false, error: { message: "Review ID is required" } },
        { status: 400 }
      );
    }

    const existingReview = await prisma.review.findUnique({
      where: { id: reviewId },
    });

    if (!existingReview) {
      return NextResponse.json(
        { success: false, error: { message: "Review not found" } },
        { status: 404 }
      );
    }

    await prisma.review.delete({
      where: { id: reviewId },
    });

    await prisma.auditLog.create({
      data: {
        userId: user.id,
        action: "REVIEW_DELETE",
        entityType: "Review",
        entityId: reviewId,
        oldValues: existingReview,
      },
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
