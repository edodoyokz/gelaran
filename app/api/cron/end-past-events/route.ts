import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma/client";
import { isCronAuthorized } from "@/lib/cron-auth";
import { rateLimiters, getClientIdentifier } from "@/lib/rate-limit";
import { getServerEnv } from "@/lib/env";

interface PastEvent {
  id: string;
  title: string;
  schedules: Array<{
    scheduleDate: Date;
    startTime: Date;
    endTime: Date;
  }>;
}

const env = getServerEnv();

export async function GET(request: NextRequest) {
  // Rate limiting for cron endpoints
  const clientId = getClientIdentifier(request.headers);
  const rateLimit = rateLimiters.cron.check(clientId);
  
  if (!rateLimit.success) {
    return NextResponse.json({ error: "Too many requests" }, { status: 429 });
  }
  
  if (!isCronAuthorized(request, env.CRON_SECRET)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const now = new Date();

    const pastEvents = await prisma.event.findMany({
      where: {
        status: "PUBLISHED",
        deletedAt: null,
        schedules: {
          every: {
            scheduleDate: { lt: now },
          },
        },
      },
      include: {
        schedules: {
          orderBy: { scheduleDate: "desc" },
          take: 1,
        },
      },
    });

    const eventsToEnd = pastEvents.filter((event) => {
      if (event.schedules.length === 0) return false;

      const lastSchedule = event.schedules[0];
      const lastEndTime = new Date(lastSchedule.scheduleDate);
      lastEndTime.setHours(
        new Date(lastSchedule.endTime).getHours(),
        new Date(lastSchedule.endTime).getMinutes()
      );

      return lastEndTime < now;
    });

    if (eventsToEnd.length === 0) {
      return NextResponse.json({
        success: true,
        message: "No events to end",
        processed: 0,
      });
    }

    const eventIds = eventsToEnd.map((e: PastEvent) => e.id);

    await prisma.event.updateMany({
      where: { id: { in: eventIds } },
      data: { status: "ENDED" },
    });

    console.log(
      `[CRON] Ended ${eventsToEnd.length} past events:`,
      eventsToEnd.map((e: PastEvent) => e.title)
    );

    return NextResponse.json({
      success: true,
      message: `Ended ${eventsToEnd.length} past events`,
      processed: eventsToEnd.length,
      events: eventsToEnd.map((e: PastEvent) => ({ id: e.id, title: e.title })),
    });
  } catch (error) {
    console.error("[CRON] End past events error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to end past events" },
      { status: 500 }
    );
  }
}
