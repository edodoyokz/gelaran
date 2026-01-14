import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma/client";
import { createClient } from "@/lib/supabase/server";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: eventId } = await params;
    const body = await request.json();
    const { rowId, ticketTypeId, seats, generateSeats } = body;

    if (!rowId) {
      return NextResponse.json(
        { success: false, error: { message: "Row ID is required" } },
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

    const event = await prisma.event.findUnique({
      where: { id: eventId },
      select: { organizerId: true },
    });

    if (!event || event.organizerId !== user.id) {
      return NextResponse.json(
        { success: false, error: { message: "Not authorized" } },
        { status: 403 }
      );
    }

    const row = await prisma.venueRow.findUnique({
      where: { id: rowId },
      include: { section: true },
    });

    if (!row || row.section.eventId !== eventId) {
      return NextResponse.json(
        { success: false, error: { message: "Row not found" } },
        { status: 404 }
      );
    }

    if (ticketTypeId) {
      const ticketType = await prisma.ticketType.findFirst({
        where: { id: ticketTypeId, eventId },
      });
      if (!ticketType) {
        return NextResponse.json(
          { success: false, error: { message: "Ticket type not found" } },
          { status: 404 }
        );
      }
    }

    let createdSeats: Awaited<ReturnType<typeof prisma.seat.findMany>> = [];

    if (generateSeats && generateSeats.count > 0) {
      const startNumber = generateSeats.startNumber || 1;
      const prefix = generateSeats.prefix || "";
      const count = generateSeats.count;

      const seatData = [];
      for (let i = 0; i < count; i++) {
        const seatNumber = startNumber + i;
        seatData.push({
          rowId,
          ticketTypeId: ticketTypeId || null,
          seatLabel: `${prefix}${seatNumber}`,
          seatNumber,
          status: "AVAILABLE" as const,
          isAccessible: false,
          sortOrder: i,
          isActive: true,
        });
      }

      await prisma.seat.createMany({ data: seatData });
      createdSeats = await prisma.seat.findMany({
        where: { rowId },
        orderBy: { seatNumber: "asc" },
      });
    } else if (seats && Array.isArray(seats)) {
      const seatData = seats.map((seat: { seatLabel: string; seatNumber: number; isAccessible?: boolean; priceOverride?: number }, index: number) => ({
        rowId,
        ticketTypeId: ticketTypeId || null,
        seatLabel: seat.seatLabel,
        seatNumber: seat.seatNumber,
        status: "AVAILABLE" as const,
        isAccessible: seat.isAccessible || false,
        priceOverride: seat.priceOverride || null,
        sortOrder: index,
        isActive: true,
      }));

      await prisma.seat.createMany({ data: seatData });
      createdSeats = await prisma.seat.findMany({
        where: { rowId },
        orderBy: { seatNumber: "asc" },
      });
    }

    return NextResponse.json({
      success: true,
      data: createdSeats,
    });
  } catch (error) {
    console.error("Create seats error:", error);
    return NextResponse.json(
      { success: false, error: { message: "Failed to create seats" } },
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
    const { seatId, seatLabel, ticketTypeId, priceOverride, isAccessible, status, isActive } = body;

    if (!seatId) {
      return NextResponse.json(
        { success: false, error: { message: "Seat ID is required" } },
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

    const event = await prisma.event.findUnique({
      where: { id: eventId },
      select: { organizerId: true },
    });

    if (!event || event.organizerId !== user.id) {
      return NextResponse.json(
        { success: false, error: { message: "Not authorized" } },
        { status: 403 }
      );
    }

    const existingSeat = await prisma.seat.findUnique({
      where: { id: seatId },
      include: { row: { include: { section: true } } },
    });

    if (!existingSeat || existingSeat.row.section.eventId !== eventId) {
      return NextResponse.json(
        { success: false, error: { message: "Seat not found" } },
        { status: 404 }
      );
    }

    if (existingSeat.status === "BOOKED" && status && status !== "BOOKED") {
      return NextResponse.json(
        { success: false, error: { message: "Cannot change status of booked seat" } },
        { status: 400 }
      );
    }

    const seat = await prisma.seat.update({
      where: { id: seatId },
      data: {
        seatLabel: seatLabel !== undefined ? seatLabel : existingSeat.seatLabel,
        ticketTypeId: ticketTypeId !== undefined ? ticketTypeId : existingSeat.ticketTypeId,
        priceOverride: priceOverride !== undefined ? priceOverride : existingSeat.priceOverride,
        isAccessible: isAccessible !== undefined ? isAccessible : existingSeat.isAccessible,
        status: status !== undefined ? status : existingSeat.status,
        isActive: isActive !== undefined ? isActive : existingSeat.isActive,
      },
    });

    return NextResponse.json({
      success: true,
      data: seat,
    });
  } catch (error) {
    console.error("Update seat error:", error);
    return NextResponse.json(
      { success: false, error: { message: "Failed to update seat" } },
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
    const seatId = searchParams.get("seatId");
    const rowId = searchParams.get("rowId");

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

    const event = await prisma.event.findUnique({
      where: { id: eventId },
      select: { organizerId: true },
    });

    if (!event || event.organizerId !== user.id) {
      return NextResponse.json(
        { success: false, error: { message: "Not authorized" } },
        { status: 403 }
      );
    }

    if (rowId) {
      const row = await prisma.venueRow.findUnique({
        where: { id: rowId },
        include: { section: true, seats: true },
      });

      if (!row || row.section.eventId !== eventId) {
        return NextResponse.json(
          { success: false, error: { message: "Row not found" } },
          { status: 404 }
        );
      }

      const hasBookedSeats = row.seats.some((seat) => seat.status === "BOOKED");
      if (hasBookedSeats) {
        return NextResponse.json(
          { success: false, error: { message: "Cannot delete seats from row with booked seats" } },
          { status: 400 }
        );
      }

      await prisma.seat.deleteMany({ where: { rowId } });

      return NextResponse.json({
        success: true,
        data: { message: "All seats in row deleted successfully" },
      });
    }

    if (seatId) {
      const seat = await prisma.seat.findUnique({
        where: { id: seatId },
        include: { row: { include: { section: true } } },
      });

      if (!seat || seat.row.section.eventId !== eventId) {
        return NextResponse.json(
          { success: false, error: { message: "Seat not found" } },
          { status: 404 }
        );
      }

      if (seat.status === "BOOKED") {
        return NextResponse.json(
          { success: false, error: { message: "Cannot delete booked seat" } },
          { status: 400 }
        );
      }

      await prisma.seat.delete({ where: { id: seatId } });

      return NextResponse.json({
        success: true,
        data: { message: "Seat deleted successfully" },
      });
    }

    return NextResponse.json(
      { success: false, error: { message: "Seat ID or Row ID is required" } },
      { status: 400 }
    );
  } catch (error) {
    console.error("Delete seat error:", error);
    return NextResponse.json(
      { success: false, error: { message: "Failed to delete seat" } },
      { status: 500 }
    );
  }
}
