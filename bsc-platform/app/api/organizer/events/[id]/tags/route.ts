import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma/client";
import { createClient } from "@/lib/supabase/server";

function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .trim();
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

    const eventTags = await prisma.eventTag.findMany({
      where: { eventId },
      include: { tag: true },
    });

    return NextResponse.json({
      success: true,
      data: eventTags.map((et) => ({
        id: et.id,
        tagId: et.tag.id,
        name: et.tag.name,
        slug: et.tag.slug,
      })),
    });
  } catch (error) {
    console.error("Get event tags error:", error);
    return NextResponse.json(
      { success: false, error: { message: "Failed to get event tags" } },
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
    const { tags } = body;

    if (!tags || !Array.isArray(tags)) {
      return NextResponse.json(
        { success: false, error: { message: "Tags array is required" } },
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

    const tagIds: string[] = [];
    for (const tagName of tags) {
      if (typeof tagName !== "string" || !tagName.trim()) continue;

      const normalizedName = tagName.trim();
      const slug = generateSlug(normalizedName);

      let tag = await prisma.tag.findFirst({
        where: {
          OR: [{ name: normalizedName }, { slug }],
        },
      });

      if (!tag) {
        tag = await prisma.tag.create({
          data: {
            name: normalizedName,
            slug,
          },
        });
      }

      tagIds.push(tag.id);
    }

    await prisma.eventTag.deleteMany({
      where: { eventId },
    });

    if (tagIds.length > 0) {
      await prisma.eventTag.createMany({
        data: tagIds.map((tagId) => ({
          eventId,
          tagId,
        })),
        skipDuplicates: true,
      });
    }

    const updatedTags = await prisma.eventTag.findMany({
      where: { eventId },
      include: { tag: true },
    });

    return NextResponse.json({
      success: true,
      data: updatedTags.map((et) => ({
        id: et.id,
        tagId: et.tag.id,
        name: et.tag.name,
        slug: et.tag.slug,
      })),
    });
  } catch (error) {
    console.error("Update event tags error:", error);
    return NextResponse.json(
      { success: false, error: { message: "Failed to update event tags" } },
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
    const tagId = searchParams.get("tagId");

    if (!tagId) {
      return NextResponse.json(
        { success: false, error: { message: "Tag ID is required" } },
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

    await prisma.eventTag.deleteMany({
      where: { eventId, tagId },
    });

    return NextResponse.json({
      success: true,
      data: { message: "Tag removed from event" },
    });
  } catch (error) {
    console.error("Delete event tag error:", error);
    return NextResponse.json(
      { success: false, error: { message: "Failed to delete event tag" } },
      { status: 500 }
    );
  }
}
