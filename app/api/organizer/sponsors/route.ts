import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma/client";
import { requireOrganizer } from "@/lib/auth/route-auth";

interface SponsorRecord {
  id: string;
  name: string;
  logoUrl: string | null;
  websiteUrl: string | null;
  description: string | null;
  createdAt: Date;
}

async function getOrganizerProfileId(): Promise<{ organizerProfileId: string } | { error: string; status: 401 | 403 | 404 }> {
  const authResult = await requireOrganizer();

  if ("error" in authResult) {
    return authResult;
  }

  const organizerProfile = await prisma.organizerProfile.findUnique({
    where: { userId: authResult.user.id },
    select: { id: true },
  });

  if (!organizerProfile) {
    return { error: "Organizer profile not found", status: 404 };
  }

  return { organizerProfileId: organizerProfile.id };
}

export async function GET(_request: NextRequest) {
  try {
    const access = await getOrganizerProfileId();

    if ("error" in access) {
      return NextResponse.json(
        { success: false, error: { message: access.error === "Unauthorized" ? "Authentication required" : access.error } },
        { status: access.status }
      );
    }

    const _organizerProfileId = access.organizerProfileId;

    const sponsors = await prisma.sponsor.findMany({
      where: { organizerId: access.organizerProfileId, isActive: true },
      orderBy: { name: "asc" },
    });

    return NextResponse.json({
      success: true,
      data: sponsors.map((s: SponsorRecord) => ({
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

    const access = await getOrganizerProfileId();

    if ("error" in access) {
      return NextResponse.json(
        { success: false, error: { message: access.error === "Unauthorized" ? "Authentication required" : access.error } },
        { status: access.status }
      );
    }

    const organizerProfileId = access.organizerProfileId;

    const sponsor = await prisma.sponsor.create({
      data: {
        organizerId: organizerProfileId,
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

    const access = await getOrganizerProfileId();

    if ("error" in access) {
      return NextResponse.json(
        { success: false, error: { message: access.error === "Unauthorized" ? "Authentication required" : access.error } },
        { status: access.status }
      );
    }

    const organizerProfileId = access.organizerProfileId;

    const existingSponsor = await prisma.sponsor.findFirst({
      where: { id, organizerId: organizerProfileId },
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

    const access = await getOrganizerProfileId();

    if ("error" in access) {
      return NextResponse.json(
        { success: false, error: { message: access.error === "Unauthorized" ? "Authentication required" : access.error } },
        { status: access.status }
      );
    }

    const organizerProfileId = access.organizerProfileId;

    const sponsor = await prisma.sponsor.findFirst({
      where: { id, organizerId: organizerProfileId },
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
