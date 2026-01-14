import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma/client";
import { createClient } from "@/lib/supabase/server";

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

    const { searchParams } = new URL(request.url);
    const organizerSlug = searchParams.get("organizerSlug");

    if (organizerSlug) {
      const organizer = await prisma.organizerProfile.findUnique({
        where: { organizationSlug: organizerSlug },
        select: { id: true },
      });

      if (!organizer) {
        return NextResponse.json(
          { success: false, error: { message: "Organizer not found" } },
          { status: 404 }
        );
      }

      const isFollowing = await prisma.organizerFollower.findUnique({
        where: {
          organizerProfileId_userId: {
            organizerProfileId: organizer.id,
            userId: user.id,
          },
        },
      });

      return NextResponse.json({
        success: true,
        data: {
          isFollowing: !!isFollowing,
          notifyNewEvents: isFollowing?.notifyNewEvents ?? true,
        },
      });
    }

    const following = await prisma.organizerFollower.findMany({
      where: { userId: user.id },
    });

    const enrichedFollowing = await Promise.all(
      following.map(async (f) => {
        const organizer = await prisma.organizerProfile.findUnique({
          where: { id: f.organizerProfileId },
          select: {
            id: true,
            organizationName: true,
            organizationSlug: true,
            organizationLogo: true,
            isVerified: true,
          },
        });

        return {
          id: f.id,
          notifyNewEvents: f.notifyNewEvents,
          followedAt: f.createdAt,
          organizer,
        };
      })
    );

    return NextResponse.json({
      success: true,
      data: enrichedFollowing.filter((f) => f.organizer !== null),
    });
  } catch (error) {
    console.error("Get following error:", error);
    return NextResponse.json(
      { success: false, error: { message: "Failed to get following" } },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { organizerSlug, notifyNewEvents } = body;

    if (!organizerSlug) {
      return NextResponse.json(
        { success: false, error: { message: "Organizer slug is required" } },
        { status: 400 }
      );
    }

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

    const organizer = await prisma.organizerProfile.findUnique({
      where: { organizationSlug: organizerSlug },
      select: { id: true, userId: true, organizationName: true },
    });

    if (!organizer) {
      return NextResponse.json(
        { success: false, error: { message: "Organizer not found" } },
        { status: 404 }
      );
    }

    if (organizer.userId === user.id) {
      return NextResponse.json(
        { success: false, error: { message: "Cannot follow yourself" } },
        { status: 400 }
      );
    }

    const existingFollow = await prisma.organizerFollower.findUnique({
      where: {
        organizerProfileId_userId: {
          organizerProfileId: organizer.id,
          userId: user.id,
        },
      },
    });

    if (existingFollow) {
      return NextResponse.json(
        { success: false, error: { message: "Already following this organizer" } },
        { status: 400 }
      );
    }

    const follow = await prisma.organizerFollower.create({
      data: {
        organizerProfileId: organizer.id,
        userId: user.id,
        notifyNewEvents: notifyNewEvents !== false,
      },
    });

    return NextResponse.json({
      success: true,
      data: {
        id: follow.id,
        organizerName: organizer.organizationName,
        notifyNewEvents: follow.notifyNewEvents,
        followedAt: follow.createdAt,
      },
    });
  } catch (error) {
    console.error("Follow organizer error:", error);
    return NextResponse.json(
      { success: false, error: { message: "Failed to follow organizer" } },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { organizerSlug, notifyNewEvents } = body;

    if (!organizerSlug) {
      return NextResponse.json(
        { success: false, error: { message: "Organizer slug is required" } },
        { status: 400 }
      );
    }

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

    const organizer = await prisma.organizerProfile.findUnique({
      where: { organizationSlug: organizerSlug },
      select: { id: true },
    });

    if (!organizer) {
      return NextResponse.json(
        { success: false, error: { message: "Organizer not found" } },
        { status: 404 }
      );
    }

    const existingFollow = await prisma.organizerFollower.findUnique({
      where: {
        organizerProfileId_userId: {
          organizerProfileId: organizer.id,
          userId: user.id,
        },
      },
    });

    if (!existingFollow) {
      return NextResponse.json(
        { success: false, error: { message: "Not following this organizer" } },
        { status: 400 }
      );
    }

    const follow = await prisma.organizerFollower.update({
      where: { id: existingFollow.id },
      data: {
        notifyNewEvents: notifyNewEvents !== undefined ? notifyNewEvents : existingFollow.notifyNewEvents,
      },
    });

    return NextResponse.json({
      success: true,
      data: {
        id: follow.id,
        notifyNewEvents: follow.notifyNewEvents,
      },
    });
  } catch (error) {
    console.error("Update follow error:", error);
    return NextResponse.json(
      { success: false, error: { message: "Failed to update follow settings" } },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const organizerSlug = searchParams.get("organizerSlug");

    if (!organizerSlug) {
      return NextResponse.json(
        { success: false, error: { message: "Organizer slug is required" } },
        { status: 400 }
      );
    }

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

    const organizer = await prisma.organizerProfile.findUnique({
      where: { organizationSlug: organizerSlug },
      select: { id: true },
    });

    if (!organizer) {
      return NextResponse.json(
        { success: false, error: { message: "Organizer not found" } },
        { status: 404 }
      );
    }

    const existingFollow = await prisma.organizerFollower.findUnique({
      where: {
        organizerProfileId_userId: {
          organizerProfileId: organizer.id,
          userId: user.id,
        },
      },
    });

    if (!existingFollow) {
      return NextResponse.json(
        { success: false, error: { message: "Not following this organizer" } },
        { status: 400 }
      );
    }

    await prisma.organizerFollower.delete({
      where: { id: existingFollow.id },
    });

    return NextResponse.json({
      success: true,
      data: { message: "Unfollowed successfully" },
    });
  } catch (error) {
    console.error("Unfollow organizer error:", error);
    return NextResponse.json(
      { success: false, error: { message: "Failed to unfollow organizer" } },
      { status: 500 }
    );
  }
}
