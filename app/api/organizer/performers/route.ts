import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma/client";
import { createClient } from "@/lib/supabase/server";

function generateSlug(name: string): string {
  const baseSlug = name
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .trim();
  const suffix = Math.random().toString(36).substring(2, 6);
  return `${baseSlug}-${suffix}`;
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

    const organizerProfile = await prisma.organizerProfile.findUnique({
      where: { userId: user.id },
      select: { id: true },
    });

    if (!organizerProfile) {
      return NextResponse.json(
        { success: false, error: { message: "Organizer profile not found" } },
        { status: 404 }
      );
    }

    const performers = await prisma.performer.findMany({
      where: { organizerId: organizerProfile.id, isActive: true },
      orderBy: { name: "asc" },
    });

    return NextResponse.json({
      success: true,
      data: performers.map((p) => ({
        id: p.id,
        name: p.name,
        slug: p.slug,
        title: p.title,
        bio: p.bio,
        photoUrl: p.photoUrl,
        websiteUrl: p.websiteUrl,
        socialInstagram: p.socialInstagram,
        socialTwitter: p.socialTwitter,
        createdAt: p.createdAt,
      })),
    });
  } catch (error) {
    console.error("Get performers error:", error);
    return NextResponse.json(
      { success: false, error: { message: "Failed to get performers" } },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, title, bio, photoUrl, websiteUrl, socialInstagram, socialTwitter } = body;

    if (!name || !name.trim()) {
      return NextResponse.json(
        { success: false, error: { message: "Name is required" } },
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

    const organizerProfile = await prisma.organizerProfile.findUnique({
      where: { userId: user.id },
      select: { id: true },
    });

    if (!organizerProfile) {
      return NextResponse.json(
        { success: false, error: { message: "Organizer profile not found" } },
        { status: 404 }
      );
    }

    const performer = await prisma.performer.create({
      data: {
        organizerId: organizerProfile.id,
        name: name.trim(),
        slug: generateSlug(name),
        title: title || null,
        bio: bio || null,
        photoUrl: photoUrl || null,
        websiteUrl: websiteUrl || null,
        socialInstagram: socialInstagram || null,
        socialTwitter: socialTwitter || null,
      },
    });

    return NextResponse.json({
      success: true,
      data: {
        id: performer.id,
        name: performer.name,
        slug: performer.slug,
        title: performer.title,
        bio: performer.bio,
        photoUrl: performer.photoUrl,
        websiteUrl: performer.websiteUrl,
        socialInstagram: performer.socialInstagram,
        socialTwitter: performer.socialTwitter,
        createdAt: performer.createdAt,
      },
    });
  } catch (error) {
    console.error("Create performer error:", error);
    return NextResponse.json(
      { success: false, error: { message: "Failed to create performer" } },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, name, title, bio, photoUrl, websiteUrl, socialInstagram, socialTwitter } = body;

    if (!id) {
      return NextResponse.json(
        { success: false, error: { message: "Performer ID is required" } },
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

    const organizerProfile = await prisma.organizerProfile.findUnique({
      where: { userId: user.id },
      select: { id: true },
    });

    if (!organizerProfile) {
      return NextResponse.json(
        { success: false, error: { message: "Organizer profile not found" } },
        { status: 404 }
      );
    }

    const existingPerformer = await prisma.performer.findFirst({
      where: { id, organizerId: organizerProfile.id },
    });

    if (!existingPerformer) {
      return NextResponse.json(
        { success: false, error: { message: "Performer not found" } },
        { status: 404 }
      );
    }

    const performer = await prisma.performer.update({
      where: { id },
      data: {
        name: name !== undefined ? name.trim() : existingPerformer.name,
        title: title !== undefined ? title : existingPerformer.title,
        bio: bio !== undefined ? bio : existingPerformer.bio,
        photoUrl: photoUrl !== undefined ? photoUrl : existingPerformer.photoUrl,
        websiteUrl: websiteUrl !== undefined ? websiteUrl : existingPerformer.websiteUrl,
        socialInstagram: socialInstagram !== undefined ? socialInstagram : existingPerformer.socialInstagram,
        socialTwitter: socialTwitter !== undefined ? socialTwitter : existingPerformer.socialTwitter,
      },
    });

    return NextResponse.json({
      success: true,
      data: {
        id: performer.id,
        name: performer.name,
        slug: performer.slug,
        title: performer.title,
        bio: performer.bio,
        photoUrl: performer.photoUrl,
        websiteUrl: performer.websiteUrl,
        socialInstagram: performer.socialInstagram,
        socialTwitter: performer.socialTwitter,
        createdAt: performer.createdAt,
      },
    });
  } catch (error) {
    console.error("Update performer error:", error);
    return NextResponse.json(
      { success: false, error: { message: "Failed to update performer" } },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        { success: false, error: { message: "Performer ID is required" } },
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

    const organizerProfile = await prisma.organizerProfile.findUnique({
      where: { userId: user.id },
      select: { id: true },
    });

    if (!organizerProfile) {
      return NextResponse.json(
        { success: false, error: { message: "Organizer profile not found" } },
        { status: 404 }
      );
    }

    const performer = await prisma.performer.findFirst({
      where: { id, organizerId: organizerProfile.id },
    });

    if (!performer) {
      return NextResponse.json(
        { success: false, error: { message: "Performer not found" } },
        { status: 404 }
      );
    }

    await prisma.performer.update({
      where: { id },
      data: { isActive: false },
    });

    return NextResponse.json({
      success: true,
      data: { message: "Performer deleted successfully" },
    });
  } catch (error) {
    console.error("Delete performer error:", error);
    return NextResponse.json(
      { success: false, error: { message: "Failed to delete performer" } },
      { status: 500 }
    );
  }
}
