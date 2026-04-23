import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma/client";
import { requireOrganizer } from "@/lib/auth/route-auth";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: eventId } = await params;

    const authResult = await requireOrganizer();

    if ("error" in authResult) {
      return NextResponse.json(
        { success: false, error: { message: authResult.error } },
        { status: authResult.status }
      );
    }

    const event = await prisma.event.findUnique({
      where: { id: eventId },
      select: { organizerId: true, hasSeatingChart: true },
    });

    if (!event) {
      return NextResponse.json(
        { success: false, error: { message: "Event not found" } },
        { status: 404 }
      );
    }

    if (event.organizerId !== authResult.user.id) {
      return NextResponse.json(
        { success: false, error: { message: "Not authorized" } },
        { status: 403 }
      );
    }

    const sections = await prisma.venueSection.findMany({
      where: { eventId },
      include: {
        rows: {
          include: {
            seats: {
              orderBy: { seatNumber: "asc" },
            },
          },
          orderBy: { sortOrder: "asc" },
        },
      },
      orderBy: { sortOrder: "asc" },
    });

    return NextResponse.json({
      success: true,
      data: {
        hasSeatingChart: event.hasSeatingChart,
        sections,
      },
    });
  } catch (error) {
    console.error("Get sections error:", error);
    return NextResponse.json(
      { success: false, error: { message: "Failed to get sections" } },
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
    const { name, colorHex, capacity, sortOrder } = body;

    if (!name) {
      return NextResponse.json(
        { success: false, error: { message: "Section name is required" } },
        { status: 400 }
      );
    }

    const authResult = await requireOrganizer();

    if ("error" in authResult) {
      return NextResponse.json(
        { success: false, error: { message: authResult.error } },
        { status: authResult.status }
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

    if (event.organizerId !== authResult.user.id) {
      return NextResponse.json(
        { success: false, error: { message: "Not authorized" } },
        { status: 403 }
      );
    }

    const section = await prisma.venueSection.create({
      data: {
        eventId,
        name,
        colorHex: colorHex || null,
        capacity: capacity || null,
        sortOrder: sortOrder || 0,
        isActive: true,
      },
    });

    await prisma.event.update({
      where: { id: eventId },
      data: { hasSeatingChart: true },
    });

    return NextResponse.json({
      success: true,
      data: section,
    });
  } catch (error) {
    console.error("Create section error:", error);
    return NextResponse.json(
      { success: false, error: { message: "Failed to create section" } },
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
    const { sectionId, name, colorHex, capacity, sortOrder, isActive } = body;

    if (!sectionId) {
      return NextResponse.json(
        { success: false, error: { message: "Section ID is required" } },
        { status: 400 }
      );
    }

    const authResult = await requireOrganizer();

    if ("error" in authResult) {
      return NextResponse.json(
        { success: false, error: { message: authResult.error } },
        { status: authResult.status }
      );
    }

    const event = await prisma.event.findUnique({
      where: { id: eventId },
      select: { organizerId: true },
    });

    if (!event || event.organizerId !== authResult.user.id) {
      return NextResponse.json(
        { success: false, error: { message: "Not authorized" } },
        { status: 403 }
      );
    }

    const existingSection = await prisma.venueSection.findFirst({
      where: { id: sectionId, eventId },
    });

    if (!existingSection) {
      return NextResponse.json(
        { success: false, error: { message: "Section not found" } },
        { status: 404 }
      );
    }

    const section = await prisma.venueSection.update({
      where: { id: sectionId },
      data: {
        name: name !== undefined ? name : existingSection.name,
        colorHex: colorHex !== undefined ? colorHex : existingSection.colorHex,
        capacity: capacity !== undefined ? capacity : existingSection.capacity,
        sortOrder: sortOrder !== undefined ? sortOrder : existingSection.sortOrder,
        isActive: isActive !== undefined ? isActive : existingSection.isActive,
      },
    });

    return NextResponse.json({
      success: true,
      data: section,
    });
  } catch (error) {
    console.error("Update section error:", error);
    return NextResponse.json(
      { success: false, error: { message: "Failed to update section" } },
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
    const sectionId = searchParams.get("sectionId");

    if (!sectionId) {
      return NextResponse.json(
        { success: false, error: { message: "Section ID is required" } },
        { status: 400 }
      );
    }

    const authResult = await requireOrganizer();

    if ("error" in authResult) {
      return NextResponse.json(
        { success: false, error: { message: authResult.error } },
        { status: authResult.status }
      );
    }

    const event = await prisma.event.findUnique({
      where: { id: eventId },
      select: { organizerId: true },
    });

    if (!event || event.organizerId !== authResult.user.id) {
      return NextResponse.json(
        { success: false, error: { message: "Not authorized" } },
        { status: 403 }
      );
    }

    const section = await prisma.venueSection.findFirst({
      where: { id: sectionId, eventId },
      include: { rows: { include: { seats: true } } },
    });

    if (!section) {
      return NextResponse.json(
        { success: false, error: { message: "Section not found" } },
        { status: 404 }
      );
    }

    const hasBookedSeats = section.rows.some((row) =>
      row.seats.some((seat) => seat.status === "BOOKED")
    );

    if (hasBookedSeats) {
      return NextResponse.json(
        { success: false, error: { message: "Cannot delete section with booked seats" } },
        { status: 400 }
      );
    }

    await prisma.venueSection.delete({
      where: { id: sectionId },
    });

    const remainingSections = await prisma.venueSection.count({
      where: { eventId },
    });

    if (remainingSections === 0) {
      await prisma.event.update({
        where: { id: eventId },
        data: { hasSeatingChart: false },
      });
    }

    return NextResponse.json({
      success: true,
      data: { message: "Section deleted successfully" },
    });
  } catch (error) {
    console.error("Delete section error:", error);
    return NextResponse.json(
      { success: false, error: { message: "Failed to delete section" } },
      { status: 500 }
    );
  }
}
