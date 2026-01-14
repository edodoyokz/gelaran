import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma/client";
import { createClient } from "@/lib/supabase/server";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: eventId } = await params;

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
      select: { organizerId: true, isRecurring: true },
    });

    if (!event) {
      return NextResponse.json(
        { success: false, error: { message: "Event not found" } },
        { status: 404 }
      );
    }

    if (event.organizerId !== user.id) {
      return NextResponse.json(
        { success: false, error: { message: "Not authorized" } },
        { status: 403 }
      );
    }

    const patterns = await prisma.recurringPattern.findMany({
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({
      success: true,
      data: {
        isRecurring: event.isRecurring,
        patterns,
      },
    });
  } catch (error) {
    console.error("Get recurring patterns error:", error);
    return NextResponse.json(
      { success: false, error: { message: "Failed to get recurring patterns" } },
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
    const {
      frequency,
      intervalValue,
      daysOfWeek,
      dayOfMonth,
      startDate,
      endDate,
      maxOccurrences,
      skipDates,
    } = body;

    if (!frequency || !startDate) {
      return NextResponse.json(
        { success: false, error: { message: "Frequency and start date are required" } },
        { status: 400 }
      );
    }

    if (!["DAILY", "WEEKLY", "MONTHLY"].includes(frequency)) {
      return NextResponse.json(
        { success: false, error: { message: "Invalid frequency" } },
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

    if (!event) {
      return NextResponse.json(
        { success: false, error: { message: "Event not found" } },
        { status: 404 }
      );
    }

    if (event.organizerId !== user.id) {
      return NextResponse.json(
        { success: false, error: { message: "Not authorized" } },
        { status: 403 }
      );
    }

    const pattern = await prisma.recurringPattern.create({
      data: {
        frequency,
        intervalValue: intervalValue || 1,
        daysOfWeek: daysOfWeek || null,
        dayOfMonth: dayOfMonth || null,
        startDate: new Date(startDate),
        endDate: endDate ? new Date(endDate) : null,
        maxOccurrences: maxOccurrences || null,
        skipDates: skipDates || null,
      },
    });

    await prisma.event.update({
      where: { id: eventId },
      data: { isRecurring: true },
    });

    return NextResponse.json({
      success: true,
      data: pattern,
    });
  } catch (error) {
    console.error("Create recurring pattern error:", error);
    return NextResponse.json(
      { success: false, error: { message: "Failed to create recurring pattern" } },
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
    const {
      patternId,
      frequency,
      intervalValue,
      daysOfWeek,
      dayOfMonth,
      startDate,
      endDate,
      maxOccurrences,
      skipDates,
    } = body;

    if (!patternId) {
      return NextResponse.json(
        { success: false, error: { message: "Pattern ID is required" } },
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

    const existingPattern = await prisma.recurringPattern.findUnique({
      where: { id: patternId },
    });

    if (!existingPattern) {
      return NextResponse.json(
        { success: false, error: { message: "Pattern not found" } },
        { status: 404 }
      );
    }

    const pattern = await prisma.recurringPattern.update({
      where: { id: patternId },
      data: {
        frequency: frequency !== undefined ? frequency : existingPattern.frequency,
        intervalValue: intervalValue !== undefined ? intervalValue : existingPattern.intervalValue,
        daysOfWeek: daysOfWeek !== undefined ? daysOfWeek : existingPattern.daysOfWeek,
        dayOfMonth: dayOfMonth !== undefined ? dayOfMonth : existingPattern.dayOfMonth,
        startDate: startDate !== undefined ? new Date(startDate) : existingPattern.startDate,
        endDate: endDate !== undefined ? (endDate ? new Date(endDate) : null) : existingPattern.endDate,
        maxOccurrences: maxOccurrences !== undefined ? maxOccurrences : existingPattern.maxOccurrences,
        skipDates: skipDates !== undefined ? skipDates : existingPattern.skipDates,
      },
    });

    return NextResponse.json({
      success: true,
      data: pattern,
    });
  } catch (error) {
    console.error("Update recurring pattern error:", error);
    return NextResponse.json(
      { success: false, error: { message: "Failed to update recurring pattern" } },
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
    const patternId = searchParams.get("patternId");

    if (!patternId) {
      return NextResponse.json(
        { success: false, error: { message: "Pattern ID is required" } },
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

    await prisma.recurringPattern.delete({
      where: { id: patternId },
    });

    const remainingPatterns = await prisma.recurringPattern.count();
    if (remainingPatterns === 0) {
      await prisma.event.update({
        where: { id: eventId },
        data: { isRecurring: false },
      });
    }

    return NextResponse.json({
      success: true,
      data: { message: "Pattern deleted successfully" },
    });
  } catch (error) {
    console.error("Delete recurring pattern error:", error);
    return NextResponse.json(
      { success: false, error: { message: "Failed to delete recurring pattern" } },
      { status: 500 }
    );
  }
}
