import { successResponse, errorResponse } from "@/lib/api/response";
import { createClient } from "@/lib/supabase/server";
import prisma from "@/lib/prisma/client";

export async function GET() {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user || !user.email) {
      return errorResponse("Unauthorized", 401);
    }

    const admin = await prisma.user.findUnique({
      where: { email: user.email },
    });

    if (!admin || !["ADMIN", "SUPER_ADMIN"].includes(admin.role)) {
      return errorResponse("Admin access required", 403);
    }

    const globalCommission = await prisma.commissionSetting.findFirst({
      where: {
        organizerId: null,
        isActive: true,
      },
    });

    if (!globalCommission) {
      const defaultCommission = await prisma.commissionSetting.create({
        data: {
          organizerId: null,
          commissionType: "PERCENTAGE",
          commissionValue: 5,
          isActive: true,
        },
      });
      return successResponse(defaultCommission);
    }

    return successResponse(globalCommission);
  } catch (error) {
    console.error("Error fetching global commission:", error);
    return errorResponse("Failed to fetch global commission", 500);
  }
}

export async function PUT(request: Request) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user || !user.email) {
      return errorResponse("Unauthorized", 401);
    }

    const admin = await prisma.user.findUnique({
      where: { email: user.email },
    });

    if (!admin || admin.role !== "SUPER_ADMIN") {
      return errorResponse("Super Admin access required", 403);
    }

    const body = await request.json();
    const { commissionValue } = body;

    if (typeof commissionValue !== "number" || commissionValue < 0 || commissionValue > 100) {
      return errorResponse("Invalid commission value", 400);
    }

    await prisma.commissionSetting.updateMany({
      where: { organizerId: null, isActive: true },
      data: { isActive: false },
    });

    const newGlobalCommission = await prisma.commissionSetting.create({
      data: {
        organizerId: null,
        commissionType: "PERCENTAGE",
        commissionValue,
        isActive: true,
      },
    });

    return successResponse(newGlobalCommission);
  } catch (error) {
    console.error("Error updating global commission:", error);
    return errorResponse("Failed to update global commission", 500);
  }
}
