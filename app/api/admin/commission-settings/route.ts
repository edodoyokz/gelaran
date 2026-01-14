import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma/client";
import { createClient } from "@/lib/supabase/server";
import type { Decimal } from "@prisma/client/runtime/library";

interface CommissionSetting {
  id: string;
  organizerId: string | null;
  eventId: string | null;
  commissionType: string;
  commissionValue: Decimal;
  minCommission: Decimal | null;
  maxCommission: Decimal | null;
  isActive: boolean;
  validFrom: Date | null;
  validUntil: Date | null;
  createdAt: Date;
  updatedAt?: Date;
}

async function isAdmin(userId: string): Promise<boolean> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { role: true },
  });
  return user?.role === "SUPER_ADMIN" || user?.role === "ADMIN";
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

    if (!(await isAdmin(user.id))) {
      return NextResponse.json(
        { success: false, error: { message: "Admin access required" } },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(request.url);
    const organizerId = searchParams.get("organizerId");
    const eventId = searchParams.get("eventId");
    const activeOnly = searchParams.get("activeOnly") === "true";

    interface CommissionWhere {
      organizerId?: string | null;
      eventId?: string | null;
      isActive?: boolean;
    }

    const where: CommissionWhere = {};

    if (organizerId) {
      where.organizerId = organizerId;
    }
    if (eventId) {
      where.eventId = eventId;
    }
    if (activeOnly) {
      where.isActive = true;
    }

    const commissionSettings = await prisma.commissionSetting.findMany({
      where: Object.keys(where).length > 0 ? where : undefined,
      orderBy: [
        { eventId: "asc" },
        { organizerId: "asc" },
        { createdAt: "desc" },
      ],
    });

    const enrichedSettings = await Promise.all(
      commissionSettings.map(async (setting: CommissionSetting) => {
        let organizerName = null;
        let eventTitle = null;

        if (setting.organizerId) {
          const organizer = await prisma.organizerProfile.findUnique({
            where: { id: setting.organizerId },
            select: { organizationName: true },
          });
          organizerName = organizer?.organizationName;
        }

        if (setting.eventId) {
          const event = await prisma.event.findUnique({
            where: { id: setting.eventId },
            select: { title: true },
          });
          eventTitle = event?.title;
        }

        return {
          ...setting,
          organizerName,
          eventTitle,
          scope: setting.eventId
            ? "EVENT"
            : setting.organizerId
            ? "ORGANIZER"
            : "GLOBAL",
        };
      })
    );

    return NextResponse.json({
      success: true,
      data: enrichedSettings,
    });
  } catch (error) {
    console.error("Get commission settings error:", error);
    return NextResponse.json(
      { success: false, error: { message: "Failed to get commission settings" } },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
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

    if (!(await isAdmin(user.id))) {
      return NextResponse.json(
        { success: false, error: { message: "Admin access required" } },
        { status: 403 }
      );
    }

    const body = await request.json();
    const {
      organizerId,
      eventId,
      commissionType,
      commissionValue,
      minCommission,
      maxCommission,
      validFrom,
      validUntil,
    } = body;

    if (commissionValue === undefined) {
      return NextResponse.json(
        { success: false, error: { message: "Commission value is required" } },
        { status: 400 }
      );
    }

    if (organizerId) {
      const organizer = await prisma.organizerProfile.findUnique({
        where: { id: organizerId },
      });
      if (!organizer) {
        return NextResponse.json(
          { success: false, error: { message: "Organizer not found" } },
          { status: 404 }
        );
      }
    }

    if (eventId) {
      const event = await prisma.event.findUnique({
        where: { id: eventId },
      });
      if (!event) {
        return NextResponse.json(
          { success: false, error: { message: "Event not found" } },
          { status: 404 }
        );
      }
    }

    const commissionSetting = await prisma.commissionSetting.create({
      data: {
        organizerId: organizerId || null,
        eventId: eventId || null,
        commissionType: commissionType || "PERCENTAGE",
        commissionValue,
        minCommission: minCommission || null,
        maxCommission: maxCommission || null,
        validFrom: validFrom ? new Date(validFrom) : null,
        validUntil: validUntil ? new Date(validUntil) : null,
        isActive: true,
      },
    });

    await prisma.auditLog.create({
      data: {
        userId: user.id,
        action: "CREATE",
        entityType: "CommissionSetting",
        entityId: commissionSetting.id,
        newValues: commissionSetting,
      },
    });

    return NextResponse.json({
      success: true,
      data: commissionSetting,
    });
  } catch (error) {
    console.error("Create commission setting error:", error);
    return NextResponse.json(
      { success: false, error: { message: "Failed to create commission setting" } },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
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

    if (!(await isAdmin(user.id))) {
      return NextResponse.json(
        { success: false, error: { message: "Admin access required" } },
        { status: 403 }
      );
    }

    const body = await request.json();
    const {
      id,
      organizerId,
      eventId,
      commissionType,
      commissionValue,
      minCommission,
      maxCommission,
      validFrom,
      validUntil,
      isActive,
    } = body;

    if (!id) {
      return NextResponse.json(
        { success: false, error: { message: "Commission setting ID is required" } },
        { status: 400 }
      );
    }

    const existingSetting = await prisma.commissionSetting.findUnique({
      where: { id },
    });

    if (!existingSetting) {
      return NextResponse.json(
        { success: false, error: { message: "Commission setting not found" } },
        { status: 404 }
      );
    }

    const commissionSetting = await prisma.commissionSetting.update({
      where: { id },
      data: {
        organizerId: organizerId !== undefined ? organizerId : existingSetting.organizerId,
        eventId: eventId !== undefined ? eventId : existingSetting.eventId,
        commissionType: commissionType !== undefined ? commissionType : existingSetting.commissionType,
        commissionValue: commissionValue !== undefined ? commissionValue : existingSetting.commissionValue,
        minCommission: minCommission !== undefined ? minCommission : existingSetting.minCommission,
        maxCommission: maxCommission !== undefined ? maxCommission : existingSetting.maxCommission,
        validFrom: validFrom !== undefined ? (validFrom ? new Date(validFrom) : null) : existingSetting.validFrom,
        validUntil: validUntil !== undefined ? (validUntil ? new Date(validUntil) : null) : existingSetting.validUntil,
        isActive: isActive !== undefined ? isActive : existingSetting.isActive,
      },
    });

    await prisma.auditLog.create({
      data: {
        userId: user.id,
        action: "UPDATE",
        entityType: "CommissionSetting",
        entityId: commissionSetting.id,
        oldValues: existingSetting,
        newValues: commissionSetting,
      },
    });

    return NextResponse.json({
      success: true,
      data: commissionSetting,
    });
  } catch (error) {
    console.error("Update commission setting error:", error);
    return NextResponse.json(
      { success: false, error: { message: "Failed to update commission setting" } },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
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

    if (!(await isAdmin(user.id))) {
      return NextResponse.json(
        { success: false, error: { message: "Admin access required" } },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        { success: false, error: { message: "Commission setting ID is required" } },
        { status: 400 }
      );
    }

    const existingSetting = await prisma.commissionSetting.findUnique({
      where: { id },
    });

    if (!existingSetting) {
      return NextResponse.json(
        { success: false, error: { message: "Commission setting not found" } },
        { status: 404 }
      );
    }

    await prisma.commissionSetting.delete({
      where: { id },
    });

    await prisma.auditLog.create({
      data: {
        userId: user.id,
        action: "DELETE",
        entityType: "CommissionSetting",
        entityId: id,
        oldValues: existingSetting,
      },
    });

    return NextResponse.json({
      success: true,
      data: { message: "Commission setting deleted successfully" },
    });
  } catch (error) {
    console.error("Delete commission setting error:", error);
    return NextResponse.json(
      { success: false, error: { message: "Failed to delete commission setting" } },
      { status: 500 }
    );
  }
}
