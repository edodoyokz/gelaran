import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma/client";
import { createClient } from "@/lib/supabase/server";

interface MediaRecord {
  id: string;
  mediaType: string;
  fileUrl: string;
  thumbnailUrl: string | null;
  title: string | null;
  altText: string | null;
  sortOrder: number;
  createdAt: Date;
}

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

    const event = await prisma.event.findFirst({
      where: { id: eventId, organizerId: user.id },
      select: { id: true },
    });

    if (!event) {
      return NextResponse.json(
        { success: false, error: { message: "Event not found" } },
        { status: 404 }
      );
    }

    const media = await prisma.eventMedia.findMany({
      where: { eventId },
      orderBy: { sortOrder: "asc" },
    });

    return NextResponse.json({
      success: true,
      data: media.map((m: MediaRecord) => ({
        id: m.id,
        mediaType: m.mediaType,
        fileUrl: m.fileUrl,
        thumbnailUrl: m.thumbnailUrl,
        title: m.title,
        altText: m.altText,
        sortOrder: m.sortOrder,
        createdAt: m.createdAt,
      })),
    });
  } catch (error) {
    console.error("Get event media error:", error);
    return NextResponse.json(
      { success: false, error: { message: "Failed to get event media" } },
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
    const { mediaType, fileUrl, thumbnailUrl, title, altText, sortOrder } = body;

    if (!mediaType || !fileUrl) {
      return NextResponse.json(
        { success: false, error: { message: "Media type and file URL are required" } },
        { status: 400 }
      );
    }

    if (!["IMAGE", "VIDEO", "DOCUMENT"].includes(mediaType)) {
      return NextResponse.json(
        { success: false, error: { message: "Invalid media type" } },
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

    const event = await prisma.event.findFirst({
      where: { id: eventId, organizerId: user.id },
      select: { id: true },
    });

    if (!event) {
      return NextResponse.json(
        { success: false, error: { message: "Event not found" } },
        { status: 404 }
      );
    }

    const maxOrder = await prisma.eventMedia.aggregate({
      where: { eventId },
      _max: { sortOrder: true },
    });

    const media = await prisma.eventMedia.create({
      data: {
        eventId,
        mediaType,
        fileUrl,
        thumbnailUrl: thumbnailUrl || null,
        title: title || null,
        altText: altText || null,
        sortOrder: sortOrder ?? (maxOrder._max.sortOrder ?? 0) + 1,
      },
    });

    return NextResponse.json({
      success: true,
      data: {
        id: media.id,
        mediaType: media.mediaType,
        fileUrl: media.fileUrl,
        thumbnailUrl: media.thumbnailUrl,
        title: media.title,
        altText: media.altText,
        sortOrder: media.sortOrder,
        createdAt: media.createdAt,
      },
    });
  } catch (error) {
    console.error("Create event media error:", error);
    return NextResponse.json(
      { success: false, error: { message: "Failed to create event media" } },
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
    const { mediaId, title, altText, sortOrder } = body;

    if (!mediaId) {
      return NextResponse.json(
        { success: false, error: { message: "Media ID is required" } },
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

    const event = await prisma.event.findFirst({
      where: { id: eventId, organizerId: user.id },
      select: { id: true },
    });

    if (!event) {
      return NextResponse.json(
        { success: false, error: { message: "Event not found" } },
        { status: 404 }
      );
    }

    const media = await prisma.eventMedia.findFirst({
      where: { id: mediaId, eventId },
    });

    if (!media) {
      return NextResponse.json(
        { success: false, error: { message: "Media not found" } },
        { status: 404 }
      );
    }

    const updatedMedia = await prisma.eventMedia.update({
      where: { id: mediaId },
      data: {
        title: title !== undefined ? title : media.title,
        altText: altText !== undefined ? altText : media.altText,
        sortOrder: sortOrder !== undefined ? sortOrder : media.sortOrder,
      },
    });

    return NextResponse.json({
      success: true,
      data: {
        id: updatedMedia.id,
        mediaType: updatedMedia.mediaType,
        fileUrl: updatedMedia.fileUrl,
        thumbnailUrl: updatedMedia.thumbnailUrl,
        title: updatedMedia.title,
        altText: updatedMedia.altText,
        sortOrder: updatedMedia.sortOrder,
        createdAt: updatedMedia.createdAt,
      },
    });
  } catch (error) {
    console.error("Update event media error:", error);
    return NextResponse.json(
      { success: false, error: { message: "Failed to update event media" } },
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
    const mediaId = searchParams.get("mediaId");

    if (!mediaId) {
      return NextResponse.json(
        { success: false, error: { message: "Media ID is required" } },
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

    const event = await prisma.event.findFirst({
      where: { id: eventId, organizerId: user.id },
      select: { id: true },
    });

    if (!event) {
      return NextResponse.json(
        { success: false, error: { message: "Event not found" } },
        { status: 404 }
      );
    }

    const media = await prisma.eventMedia.findFirst({
      where: { id: mediaId, eventId },
    });

    if (!media) {
      return NextResponse.json(
        { success: false, error: { message: "Media not found" } },
        { status: 404 }
      );
    }

    await prisma.eventMedia.delete({
      where: { id: mediaId },
    });

    return NextResponse.json({
      success: true,
      data: { message: "Media deleted successfully" },
    });
  } catch (error) {
    console.error("Delete event media error:", error);
    return NextResponse.json(
      { success: false, error: { message: "Failed to delete event media" } },
      { status: 500 }
    );
  }
}
