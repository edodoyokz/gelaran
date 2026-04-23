import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma/client";
import { requireAuthenticatedAppUser, requireOrganizerContext } from "@/lib/auth/route-auth";

async function canAccessCheckInPoints(eventId: string, dbUserId: string) {
  const event = await prisma.event.findUnique({
    where: { id: eventId },
    select: { organizerId: true },
  });

  if (!event) {
    return { event: null, authorized: false as const };
  }

  if (event.organizerId === dbUserId) {
    return { event, authorized: true as const };
  }

  const organizerProfile = await prisma.organizerProfile.findUnique({
    where: { userId: event.organizerId },
    select: { id: true },
  });

  if (!organizerProfile) {
    return { event, authorized: false as const };
  }

  const teamMember = await prisma.organizerTeamMember.findFirst({
    where: {
      organizerProfileId: organizerProfile.id,
      userId: dbUserId,
      isActive: true,
    },
    select: { id: true },
  });

  return { event, authorized: Boolean(teamMember) };
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: eventId } = await params;

    const authContext = await requireAuthenticatedAppUser();

    if ("error" in authContext) {
      return NextResponse.json(
        { success: false, error: { message: authContext.error } },
        { status: authContext.status }
      );
    }

    const access = await canAccessCheckInPoints(eventId, authContext.dbUserId);

    if (!access.event) {
      return NextResponse.json(
        { success: false, error: { message: "Event not found" } },
        { status: 404 }
      );
    }

    if (!access.authorized) {
      return NextResponse.json(
        { success: false, error: { message: "Not authorized to access this event" } },
        { status: 403 }
      );
    }

    const checkInPoints = await prisma.checkInPoint.findMany({
      where: { eventId },
      include: {
        scannerSessions: {
          select: {
            id: true,
            userId: true,
            deviceInfo: true,
            startedAt: true,
            endedAt: true,
            totalScans: true,
            successfulScans: true,
            failedScans: true,
          },
        },
      },
      orderBy: { createdAt: "asc" },
    });

    return NextResponse.json({
      success: true,
      data: checkInPoints,
    });
  } catch (error) {
    console.error("Get check-in points error:", error);
    return NextResponse.json(
      { success: false, error: { message: "Failed to get check-in points" } },
      { status: 500 }
    );
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: eventId } = await params;
    const body = await request.json();
    const { name, locationDescription } = body;

    if (!name) {
      return NextResponse.json(
        { success: false, error: { message: "Name is required" } },
        { status: 400 }
      );
    }

    const authContext = await requireOrganizerContext();

    if ("error" in authContext) {
      return NextResponse.json(
        { success: false, error: { message: authContext.error } },
        { status: authContext.status }
      );
    }

    const event = await prisma.event.findUnique({
      where: { id: eventId },
      select: { organizerId: true },
    });

    if (!event) {
      return NextResponse.json(
        { success: false, error: { message: "Event not found" } },
        { status: 404 }
      );
    }

    if (event.organizerId !== authContext.dbUserId) {
      return NextResponse.json(
        { success: false, error: { message: "Not authorized to manage this event" } },
        { status: 403 }
      );
    }

    const checkInPoint = await prisma.checkInPoint.create({
      data: {
        eventId,
        name,
        locationDescription: locationDescription || null,
        isActive: true,
      },
    });

    return NextResponse.json({
      success: true,
      data: checkInPoint,
    });
  } catch (error) {
    console.error("Create check-in point error:", error);
    return NextResponse.json(
      { success: false, error: { message: "Failed to create check-in point" } },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: eventId } = await params;
    const body = await request.json();
    const { checkInPointId, name, locationDescription, isActive } = body;

    if (!checkInPointId) {
      return NextResponse.json(
        { success: false, error: { message: "Check-in point ID is required" } },
        { status: 400 }
      );
    }

    const authContext = await requireOrganizerContext();

    if ("error" in authContext) {
      return NextResponse.json(
        { success: false, error: { message: authContext.error } },
        { status: authContext.status }
      );
    }

    const event = await prisma.event.findUnique({
      where: { id: eventId },
      select: { organizerId: true },
    });

    if (!event) {
      return NextResponse.json(
        { success: false, error: { message: "Event not found" } },
        { status: 404 }
      );
    }

    if (event.organizerId !== authContext.dbUserId) {
      return NextResponse.json(
        { success: false, error: { message: "Not authorized to manage this event" } },
        { status: 403 }
      );
    }

    const existingPoint = await prisma.checkInPoint.findFirst({
      where: { id: checkInPointId, eventId },
    });

    if (!existingPoint) {
      return NextResponse.json(
        { success: false, error: { message: "Check-in point not found" } },
        { status: 404 }
      );
    }

    const checkInPoint = await prisma.checkInPoint.update({
      where: { id: checkInPointId },
      data: {
        name: name !== undefined ? name : existingPoint.name,
        locationDescription: locationDescription !== undefined ? locationDescription : existingPoint.locationDescription,
        isActive: isActive !== undefined ? isActive : existingPoint.isActive,
      },
    });

    return NextResponse.json({
      success: true,
      data: checkInPoint,
    });
  } catch (error) {
    console.error("Update check-in point error:", error);
    return NextResponse.json(
      { success: false, error: { message: "Failed to update check-in point" } },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: eventId } = await params;
    const { searchParams } = new URL(request.url);
    const checkInPointId = searchParams.get("checkInPointId");

    if (!checkInPointId) {
      return NextResponse.json(
        { success: false, error: { message: "Check-in point ID is required" } },
        { status: 400 }
      );
    }

    const authContext = await requireOrganizerContext();

    if ("error" in authContext) {
      return NextResponse.json(
        { success: false, error: { message: authContext.error } },
        { status: authContext.status }
      );
    }

    const event = await prisma.event.findUnique({
      where: { id: eventId },
      select: { organizerId: true },
    });

    if (!event) {
      return NextResponse.json(
        { success: false, error: { message: "Event not found" } },
        { status: 404 }
      );
    }

    if (event.organizerId !== authContext.dbUserId) {
      return NextResponse.json(
        { success: false, error: { message: "Not authorized to manage this event" } },
        { status: 403 }
      );
    }

    const existingPoint = await prisma.checkInPoint.findFirst({
      where: { id: checkInPointId, eventId },
    });

    if (!existingPoint) {
      return NextResponse.json(
        { success: false, error: { message: "Check-in point not found" } },
        { status: 404 }
      );
    }

    await prisma.checkInPoint.delete({
      where: { id: checkInPointId },
    });

    return NextResponse.json({
      success: true,
      data: { message: "Check-in point deleted successfully" },
    });
  } catch (error) {
    console.error("Delete check-in point error:", error);
    return NextResponse.json(
      { success: false, error: { message: "Failed to delete check-in point" } },
      { status: 500 }
    );
  }
}
