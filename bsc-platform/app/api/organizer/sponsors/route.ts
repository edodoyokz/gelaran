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

    const sponsors = await prisma.sponsor.findMany({
      where: { organizerId: organizerProfile.id, isActive: true },
      orderBy: { name: "asc" },
    });

    return NextResponse.json({
      success: true,
      data: sponsors.map((s) => ({
        id: s.id,
        name: s.name,
        logoUrl: s.logoUrl,
        websiteUrl: s.websiteUrl,
        description: s.description,
        createdAt: s.createdAt,
      })),
    });
  } catch (error) {
    console.error("Get sponsors error:", error);
    return NextResponse.json(
      { success: false, error: { message: "Failed to get sponsors" } },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, logoUrl, websiteUrl, description } = body;

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

    const sponsor = await prisma.sponsor.create({
      data: {
        organizerId: organizerProfile.id,
        name: name.trim(),
        logoUrl: logoUrl || null,
        websiteUrl: websiteUrl || null,
        description: description || null,
      },
    });

    return NextResponse.json({
      success: true,
      data: {
        id: sponsor.id,
        name: sponsor.name,
        logoUrl: sponsor.logoUrl,
        websiteUrl: sponsor.websiteUrl,
        description: sponsor.description,
        createdAt: sponsor.createdAt,
      },
    });
  } catch (error) {
    console.error("Create sponsor error:", error);
    return NextResponse.json(
      { success: false, error: { message: "Failed to create sponsor" } },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, name, logoUrl, websiteUrl, description } = body;

    if (!id) {
      return NextResponse.json(
        { success: false, error: { message: "Sponsor ID is required" } },
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

    const existingSponsor = await prisma.sponsor.findFirst({
      where: { id, organizerId: organizerProfile.id },
    });

    if (!existingSponsor) {
      return NextResponse.json(
        { success: false, error: { message: "Sponsor not found" } },
        { status: 404 }
      );
    }

    const sponsor = await prisma.sponsor.update({
      where: { id },
      data: {
        name: name !== undefined ? name.trim() : existingSponsor.name,
        logoUrl: logoUrl !== undefined ? logoUrl : existingSponsor.logoUrl,
        websiteUrl: websiteUrl !== undefined ? websiteUrl : existingSponsor.websiteUrl,
        description: description !== undefined ? description : existingSponsor.description,
      },
    });

    return NextResponse.json({
      success: true,
      data: {
        id: sponsor.id,
        name: sponsor.name,
        logoUrl: sponsor.logoUrl,
        websiteUrl: sponsor.websiteUrl,
        description: sponsor.description,
        createdAt: sponsor.createdAt,
      },
    });
  } catch (error) {
    console.error("Update sponsor error:", error);
    return NextResponse.json(
      { success: false, error: { message: "Failed to update sponsor" } },
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
        { success: false, error: { message: "Sponsor ID is required" } },
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

    const sponsor = await prisma.sponsor.findFirst({
      where: { id, organizerId: organizerProfile.id },
    });

    if (!sponsor) {
      return NextResponse.json(
        { success: false, error: { message: "Sponsor not found" } },
        { status: 404 }
      );
    }

    await prisma.sponsor.update({
      where: { id },
      data: { isActive: false },
    });

    return NextResponse.json({
      success: true,
      data: { message: "Sponsor deleted successfully" },
    });
  } catch (error) {
    console.error("Delete sponsor error:", error);
    return NextResponse.json(
      { success: false, error: { message: "Failed to delete sponsor" } },
      { status: 500 }
    );
  }
}
