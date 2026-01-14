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
    const { sectionId, rowLabel, sortOrder } = body;

    if (!sectionId || !rowLabel) {
      return NextResponse.json(
        { success: false, error: { message: "Section ID and row label are required" } },
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

    const section = await prisma.venueSection.findFirst({
      where: { id: sectionId, eventId },
    });

    if (!section) {
      return NextResponse.json(
        { success: false, error: { message: "Section not found" } },
        { status: 404 }
      );
    }

    const row = await prisma.venueRow.create({
      data: {
        sectionId,
        rowLabel,
        sortOrder: sortOrder || 0,
        isActive: true,
      },
    });

    return NextResponse.json({
      success: true,
      data: row,
    });
  } catch (error) {
    console.error("Create row error:", error);
    return NextResponse.json(
      { success: false, error: { message: "Failed to create row" } },
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
    const { rowId, rowLabel, sortOrder, isActive } = body;

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

    const existingRow = await prisma.venueRow.findUnique({
      where: { id: rowId },
      include: { section: true },
    });

    if (!existingRow || existingRow.section.eventId !== eventId) {
      return NextResponse.json(
        { success: false, error: { message: "Row not found" } },
        { status: 404 }
      );
    }

    const row = await prisma.venueRow.update({
      where: { id: rowId },
      data: {
        rowLabel: rowLabel !== undefined ? rowLabel : existingRow.rowLabel,
        sortOrder: sortOrder !== undefined ? sortOrder : existingRow.sortOrder,
        isActive: isActive !== undefined ? isActive : existingRow.isActive,
      },
    });

    return NextResponse.json({
      success: true,
      data: row,
    });
  } catch (error) {
    console.error("Update row error:", error);
    return NextResponse.json(
      { success: false, error: { message: "Failed to update row" } },
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
    const rowId = searchParams.get("rowId");

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
        { success: false, error: { message: "Cannot delete row with booked seats" } },
        { status: 400 }
      );
    }

    await prisma.venueRow.delete({
      where: { id: rowId },
    });

    return NextResponse.json({
      success: true,
      data: { message: "Row deleted successfully" },
    });
  } catch (error) {
    console.error("Delete row error:", error);
    return NextResponse.json(
      { success: false, error: { message: "Failed to delete row" } },
      { status: 500 }
    );
  }
}
