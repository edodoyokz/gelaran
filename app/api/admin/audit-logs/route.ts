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
    const entityType = searchParams.get("entityType");
    const entityId = searchParams.get("entityId");
    const userId = searchParams.get("userId");
    const action = searchParams.get("action");
    const fromDate = searchParams.get("fromDate");
    const toDate = searchParams.get("toDate");
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "50");

    interface AuditLogWhere {
      entityType?: string;
      entityId?: string;
      userId?: string;
      action?: string;
      createdAt?: {
        gte?: Date;
        lte?: Date;
      };
    }

    const where: AuditLogWhere = {};

    if (entityType) {
      where.entityType = entityType;
    }
    if (entityId) {
      where.entityId = entityId;
    }
    if (userId) {
      where.userId = userId;
    }
    if (action) {
      where.action = action;
    }
    if (fromDate || toDate) {
      where.createdAt = {};
      if (fromDate) {
        where.createdAt.gte = new Date(fromDate);
      }
      if (toDate) {
        where.createdAt.lte = new Date(toDate);
      }
    }

    const [logs, total] = await Promise.all([
      prisma.auditLog.findMany({
        where: Object.keys(where).length > 0 ? where : undefined,
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.auditLog.count({
        where: Object.keys(where).length > 0 ? where : undefined,
      }),
    ]);

    const enrichedLogs = await Promise.all(
      logs.map(async (log) => {
        let userName = null;
        let userEmail = null;

        if (log.userId) {
          const logUser = await prisma.user.findUnique({
            where: { id: log.userId },
            select: { name: true, email: true },
          });
          userName = logUser?.name;
          userEmail = logUser?.email;
        }

        return {
          ...log,
          userName,
          userEmail,
        };
      })
    );

    return NextResponse.json({
      success: true,
      data: enrichedLogs,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Get audit logs error:", error);
    return NextResponse.json(
      { success: false, error: { message: "Failed to get audit logs" } },
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
    const { id } = body;

    if (!id) {
      return NextResponse.json(
        { success: false, error: { message: "Audit log ID is required" } },
        { status: 400 }
      );
    }

    const log = await prisma.auditLog.findUnique({
      where: { id },
    });

    if (!log) {
      return NextResponse.json(
        { success: false, error: { message: "Audit log not found" } },
        { status: 404 }
      );
    }

    let userName = null;
    let userEmail = null;

    if (log.userId) {
      const logUser = await prisma.user.findUnique({
        where: { id: log.userId },
        select: { name: true, email: true },
      });
      userName = logUser?.name;
      userEmail = logUser?.email;
    }

    return NextResponse.json({
      success: true,
      data: {
        ...log,
        userName,
        userEmail,
      },
    });
  } catch (error) {
    console.error("Get audit log error:", error);
    return NextResponse.json(
      { success: false, error: { message: "Failed to get audit log" } },
      { status: 500 }
    );
  }
}
