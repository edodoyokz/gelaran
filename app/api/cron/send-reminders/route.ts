import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma/client";
import { resend, FROM_EMAIL } from "@/lib/email/client";
import { eventReminderHtml, eventReminderText } from "@/lib/email/templates";
import { formatDate } from "@/lib/utils";
import { isCronAuthorized } from "@/lib/cron-auth";
import { rateLimiters, getClientIdentifier } from "@/lib/rate-limit";
import { getServerEnv } from "@/lib/env";

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
    const _oneHourFromNow = new Date(now.getTime() + 60 * 60 * 1000);
    const twentyFourHoursFromNow = new Date(
      now.getTime() + 24 * 60 * 60 * 1000
    );

    const upcomingSchedules = await prisma.eventSchedule.findMany({
      where: {
        isActive: true,
        scheduleDate: {
          gte: new Date(now.toISOString().split("T")[0]),
          lte: new Date(twentyFourHoursFromNow.toISOString().split("T")[0]),
        },
        event: {
          status: "PUBLISHED",
          deletedAt: null,
        },
      },
      include: {
        event: {
          include: {
            venue: true,
            bookings: {
              where: {
                status: { in: ["PAID", "CONFIRMED"] },
              },
              include: {
                user: { select: { email: true, name: true } },
              },
            },
          },
        },
      },
    });

    let emailsSent = 0;
    const errors: string[] = [];

    for (const schedule of upcomingSchedules) {
      const scheduleDateTime = new Date(schedule.scheduleDate);
      scheduleDateTime.setHours(
        new Date(schedule.startTime).getHours(),
        new Date(schedule.startTime).getMinutes()
      );

      const hoursUntilEvent =
        (scheduleDateTime.getTime() - now.getTime()) / (1000 * 60 * 60);

      let reminderType: "24h" | "1h" | null = null;
      if (hoursUntilEvent > 23 && hoursUntilEvent <= 25) {
        reminderType = "24h";
      } else if (hoursUntilEvent > 0.5 && hoursUntilEvent <= 1.5) {
        reminderType = "1h";
      }

      if (!reminderType) continue;

      for (const booking of schedule.event.bookings) {
        const email = booking.user?.email || booking.guestEmail;
        const name = booking.user?.name || booking.guestName || "Peserta";

        if (!email) continue;

        try {
          const eventDate = formatDate(schedule.scheduleDate.toISOString());
          const eventTime = new Date(schedule.startTime).toLocaleTimeString(
            "id-ID",
            { hour: "2-digit", minute: "2-digit" }
          );
          const eventLocation =
            schedule.event.eventType === "ONLINE"
              ? "Online Event"
              : schedule.event.venue
                ? `${schedule.event.venue.name}, ${schedule.event.venue.city}`
                : "TBA";

          const templateData = {
            customerName: name,
            eventTitle: schedule.event.title,
            eventDate,
            eventTime,
            eventLocation,
            bookingCode: booking.bookingCode,
            reminderType,
            onlineMeetingUrl:
              schedule.event.eventType === "ONLINE"
                ? schedule.event.onlineMeetingUrl
                : null,
          };

          await resend.emails.send({
            from: FROM_EMAIL,
            to: email,
            subject:
              reminderType === "24h"
                ? `⏰ Reminder: ${schedule.event.title} besok!`
                : `🎉 ${schedule.event.title} dimulai dalam 1 jam!`,
            html: eventReminderHtml(templateData),
            text: eventReminderText(templateData),
          });

          emailsSent++;
        } catch (err) {
          errors.push(`Failed to send to ${email}: ${err}`);
        }
      }
    }

    console.log(`[CRON] Sent ${emailsSent} reminder emails`);

    return NextResponse.json({
      success: true,
      emailsSent,
      errors: errors.length > 0 ? errors : undefined,
    });
  } catch (error) {
    console.error("[CRON] Send reminders error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to send reminders" },
      { status: 500 }
    );
  }
}
