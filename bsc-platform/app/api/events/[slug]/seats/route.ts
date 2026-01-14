import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma/client";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;

    const event = await prisma.event.findUnique({
      where: { slug },
      select: {
        id: true,
        hasSeatingChart: true,
        status: true,
      },
    });

    if (!event) {
      return NextResponse.json(
        { success: false, error: { message: "Event not found" } },
        { status: 404 }
      );
    }

    if (event.status !== "PUBLISHED") {
      return NextResponse.json(
        { success: false, error: { message: "Event not available" } },
        { status: 404 }
      );
    }

    if (!event.hasSeatingChart) {
      return NextResponse.json({
        success: true,
        data: {
          hasSeatingChart: false,
          sections: [],
        },
      });
    }

    const sections = await prisma.venueSection.findMany({
      where: { eventId: event.id, isActive: true },
      include: {
        rows: {
          where: { isActive: true },
          include: {
            seats: {
              where: { isActive: true },
              select: {
                id: true,
                seatLabel: true,
                seatNumber: true,
                status: true,
                isAccessible: true,
                priceOverride: true,
                ticketTypeId: true,
                lockedUntil: true,
              },
              orderBy: { seatNumber: "asc" },
            },
          },
          orderBy: { sortOrder: "asc" },
        },
      },
      orderBy: { sortOrder: "asc" },
    });

    const now = new Date();
    const sectionsWithAvailability = sections.map((section) => ({
      ...section,
      rows: section.rows.map((row) => ({
        ...row,
        seats: row.seats.map((seat) => {
          let effectiveStatus = seat.status;
          if (seat.status === "LOCKED" && seat.lockedUntil && seat.lockedUntil < now) {
            effectiveStatus = "AVAILABLE";
          }
          return {
            ...seat,
            status: effectiveStatus,
            priceOverride: seat.priceOverride?.toString() || null,
            lockedUntil: undefined,
          };
        }),
      })),
    }));

    return NextResponse.json({
      success: true,
      data: {
        hasSeatingChart: true,
        sections: sectionsWithAvailability,
      },
    });
  } catch (error) {
    console.error("Get seats error:", error);
    return NextResponse.json(
      { success: false, error: { message: "Failed to get seats" } },
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
    const { seatIds, sessionId } = body;

    if (!seatIds || !Array.isArray(seatIds) || seatIds.length === 0) {
      return NextResponse.json(
        { success: false, error: { message: "Seat IDs are required" } },
        { status: 400 }
      );
    }

    if (!sessionId) {
      return NextResponse.json(
        { success: false, error: { message: "Session ID is required" } },
        { status: 400 }
      );
    }

    const event = await prisma.event.findUnique({
      where: { slug },
      select: { id: true, status: true, maxTicketsPerOrder: true },
    });

    if (!event || event.status !== "PUBLISHED") {
      return NextResponse.json(
        { success: false, error: { message: "Event not available" } },
        { status: 404 }
      );
    }

    if (seatIds.length > event.maxTicketsPerOrder) {
      return NextResponse.json(
        { success: false, error: { message: `Maximum ${event.maxTicketsPerOrder} seats per order` } },
        { status: 400 }
      );
    }

    const now = new Date();
    const lockExpiry = new Date(now.getTime() + 15 * 60 * 1000);

    const seats = await prisma.seat.findMany({
      where: { id: { in: seatIds } },
      include: { row: { include: { section: true } } },
    });

    if (seats.length !== seatIds.length) {
      return NextResponse.json(
        { success: false, error: { message: "One or more seats not found" } },
        { status: 404 }
      );
    }

    for (const seat of seats) {
      if (seat.row.section.eventId !== event.id) {
        return NextResponse.json(
          { success: false, error: { message: "Seat does not belong to this event" } },
          { status: 400 }
        );
      }
    }

    const unavailableSeats = seats.filter((seat) => {
      if (seat.status === "BOOKED" || seat.status === "BLOCKED") return true;
      if (seat.status === "LOCKED" && seat.lockedUntil && seat.lockedUntil > now) {
        return true;
      }
      return false;
    });

    if (unavailableSeats.length > 0) {
      return NextResponse.json(
        {
          success: false,
          error: {
            message: "One or more seats are not available",
            unavailableSeats: unavailableSeats.map((s) => s.seatLabel),
          },
        },
        { status: 400 }
      );
    }

    await prisma.seat.updateMany({
      where: { id: { in: seatIds } },
      data: {
        status: "LOCKED",
        lockedByUserId: sessionId,
        lockedUntil: lockExpiry,
      },
    });

    const lockedSeats = await prisma.seat.findMany({
      where: { id: { in: seatIds } },
      include: { ticketType: { select: { id: true, name: true, basePrice: true } } },
    });

    return NextResponse.json({
      success: true,
      data: {
        lockedSeats: lockedSeats.map((seat) => ({
          id: seat.id,
          seatLabel: seat.seatLabel,
          ticketTypeId: seat.ticketTypeId,
          ticketTypeName: seat.ticketType?.name,
          price: seat.priceOverride?.toString() || seat.ticketType?.basePrice.toString(),
        })),
        expiresAt: lockExpiry.toISOString(),
      },
    });
  } catch (error) {
    console.error("Lock seats error:", error);
    return NextResponse.json(
      { success: false, error: { message: "Failed to lock seats" } },
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
    const sessionId = searchParams.get("sessionId");
    const seatIdsParam = searchParams.get("seatIds");

    if (!sessionId) {
      return NextResponse.json(
        { success: false, error: { message: "Session ID is required" } },
        { status: 400 }
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

    const seatIds = seatIdsParam ? seatIdsParam.split(",") : [];

    const whereClause = {
      status: "LOCKED" as const,
      lockedByUserId: sessionId,
      row: {
        section: {
          eventId: event.id,
        },
      },
      ...(seatIds.length > 0 ? { id: { in: seatIds } } : {}),
    };

    await prisma.seat.updateMany({
      where: whereClause,
      data: {
        status: "AVAILABLE",
        lockedByUserId: null,
        lockedUntil: null,
      },
    });

    return NextResponse.json({
      success: true,
      data: { message: "Seats released successfully" },
    });
  } catch (error) {
    console.error("Release seats error:", error);
    return NextResponse.json(
      { success: false, error: { message: "Failed to release seats" } },
      { status: 500 }
    );
  }
}
