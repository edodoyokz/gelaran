import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma/client";
import { createClient } from "@/lib/supabase/server";

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
    const activeOnly = searchParams.get("activeOnly") === "true";

    const taxRates = await prisma.taxRate.findMany({
      where: activeOnly ? { isActive: true } : undefined,
      orderBy: [{ isDefault: "desc" }, { createdAt: "asc" }],
    });

    return NextResponse.json({
      success: true,
      data: taxRates,
    });
  } catch (error) {
    console.error("Get tax rates error:", error);
    return NextResponse.json(
      { success: false, error: { message: "Failed to get tax rates" } },
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
    const { name, code, taxType, rate, isInclusive, isDefault } = body;

    if (!name || !code || rate === undefined) {
      return NextResponse.json(
        { success: false, error: { message: "Name, code, and rate are required" } },
        { status: 400 }
      );
    }

    const existingCode = await prisma.taxRate.findUnique({
      where: { code },
    });

    if (existingCode) {
      return NextResponse.json(
        { success: false, error: { message: "Tax rate code already exists" } },
        { status: 400 }
      );
    }

    if (isDefault) {
      await prisma.taxRate.updateMany({
        where: { isDefault: true },
        data: { isDefault: false },
      });
    }

    const taxRate = await prisma.taxRate.create({
      data: {
        name,
        code,
        taxType: taxType || "PERCENTAGE",
        rate,
        isInclusive: isInclusive || false,
        isDefault: isDefault || false,
        isActive: true,
      },
    });

    await prisma.auditLog.create({
      data: {
        userId: user.id,
        action: "CREATE",
        entityType: "TaxRate",
        entityId: taxRate.id,
        newValues: taxRate,
      },
    });

    return NextResponse.json({
      success: true,
      data: taxRate,
    });
  } catch (error) {
    console.error("Create tax rate error:", error);
    return NextResponse.json(
      { success: false, error: { message: "Failed to create tax rate" } },
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
    const { id, name, code, taxType, rate, isInclusive, isDefault, isActive } = body;

    if (!id) {
      return NextResponse.json(
        { success: false, error: { message: "Tax rate ID is required" } },
        { status: 400 }
      );
    }

    const existingTaxRate = await prisma.taxRate.findUnique({
      where: { id },
    });

    if (!existingTaxRate) {
      return NextResponse.json(
        { success: false, error: { message: "Tax rate not found" } },
        { status: 404 }
      );
    }

    if (code && code !== existingTaxRate.code) {
      const codeExists = await prisma.taxRate.findUnique({
        where: { code },
      });
      if (codeExists) {
        return NextResponse.json(
          { success: false, error: { message: "Tax rate code already exists" } },
          { status: 400 }
        );
      }
    }

    if (isDefault === true) {
      await prisma.taxRate.updateMany({
        where: { isDefault: true, id: { not: id } },
        data: { isDefault: false },
      });
    }

    const taxRate = await prisma.taxRate.update({
      where: { id },
      data: {
        name: name !== undefined ? name : existingTaxRate.name,
        code: code !== undefined ? code : existingTaxRate.code,
        taxType: taxType !== undefined ? taxType : existingTaxRate.taxType,
        rate: rate !== undefined ? rate : existingTaxRate.rate,
        isInclusive: isInclusive !== undefined ? isInclusive : existingTaxRate.isInclusive,
        isDefault: isDefault !== undefined ? isDefault : existingTaxRate.isDefault,
        isActive: isActive !== undefined ? isActive : existingTaxRate.isActive,
      },
    });

    await prisma.auditLog.create({
      data: {
        userId: user.id,
        action: "UPDATE",
        entityType: "TaxRate",
        entityId: taxRate.id,
        oldValues: existingTaxRate,
        newValues: taxRate,
      },
    });

    return NextResponse.json({
      success: true,
      data: taxRate,
    });
  } catch (error) {
    console.error("Update tax rate error:", error);
    return NextResponse.json(
      { success: false, error: { message: "Failed to update tax rate" } },
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
        { success: false, error: { message: "Tax rate ID is required" } },
        { status: 400 }
      );
    }

    const existingTaxRate = await prisma.taxRate.findUnique({
      where: { id },
    });

    if (!existingTaxRate) {
      return NextResponse.json(
        { success: false, error: { message: "Tax rate not found" } },
        { status: 404 }
      );
    }

    await prisma.taxRate.delete({
      where: { id },
    });

    await prisma.auditLog.create({
      data: {
        userId: user.id,
        action: "DELETE",
        entityType: "TaxRate",
        entityId: id,
        oldValues: existingTaxRate,
      },
    });

    return NextResponse.json({
      success: true,
      data: { message: "Tax rate deleted successfully" },
    });
  } catch (error) {
    console.error("Delete tax rate error:", error);
    return NextResponse.json(
      { success: false, error: { message: "Failed to delete tax rate" } },
      { status: 500 }
    );
  }
}
