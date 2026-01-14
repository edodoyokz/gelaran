import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma/client";
import type { PrismaTransactionClient } from "@/types/prisma";

interface ExpiredBooking {
  id: string;
  bookingCode: string;
}

interface TicketToRelease {
  ticketTypeId: string;
  seatId: string | null;
}

const CRON_SECRET = process.env.CRON_SECRET;

export async function GET(request: NextRequest) {
  const authHeader = request.headers.get("authorization");
  if (CRON_SECRET && authHeader !== `Bearer ${CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const now = new Date();

    const expiredBookings = await prisma.booking.findMany({
      where: {
        status: { in: ["PENDING", "AWAITING_PAYMENT"] },
        expiresAt: { lt: now },
      },
      select: { id: true, bookingCode: true },
    });

    if (expiredBookings.length === 0) {
      return NextResponse.json({
        success: true,
        message: "No expired bookings found",
        processed: 0,
      });
    }

    const bookingIds = expiredBookings.map((b: ExpiredBooking) => b.id);

    const ticketsToRelease = await prisma.bookedTicket.findMany({
      where: { bookingId: { in: bookingIds } },
      select: { ticketTypeId: true, seatId: true },
    });

    const ticketTypeQuantities = ticketsToRelease.reduce(
      (acc, t) => {
        acc[t.ticketTypeId] = (acc[t.ticketTypeId] || 0) + 1;
        return acc;
      },
      {} as Record<string, number>
    );

    await prisma.$transaction(async (tx: PrismaTransactionClient) => {
      await tx.booking.updateMany({
        where: { id: { in: bookingIds } },
        data: {
          status: "EXPIRED",
          cancelledAt: now,
          cancellationReason: "Payment timeout - auto expired",
        },
      });

      await tx.bookedTicket.updateMany({
        where: { bookingId: { in: bookingIds } },
        data: { status: "CANCELLED" },
      });

      await tx.transaction.updateMany({
        where: { bookingId: { in: bookingIds } },
        data: { status: "EXPIRED" },
      });

      for (const [ticketTypeId, quantity] of Object.entries(
        ticketTypeQuantities
      )) {
        await tx.ticketType.update({
          where: { id: ticketTypeId },
          data: { reservedQuantity: { decrement: quantity } },
        });
      }

      const seatIds = ticketsToRelease
        .filter((t: TicketToRelease) => t.seatId)
        .map((t: TicketToRelease) => t.seatId as string);

      if (seatIds.length > 0) {
        await tx.seat.updateMany({
          where: { id: { in: seatIds } },
          data: {
            status: "AVAILABLE",
            bookedTicketId: null,
            lockedByUserId: null,
            lockedUntil: null,
          },
        });
      }
    });

    console.log(
      `[CRON] Cleaned up ${expiredBookings.length} expired bookings:`,
      expiredBookings.map((b: ExpiredBooking) => b.bookingCode)
    );

    return NextResponse.json({
      success: true,
      message: `Processed ${expiredBookings.length} expired bookings`,
      processed: expiredBookings.length,
      bookingCodes: expiredBookings.map((b: ExpiredBooking) => b.bookingCode),
    });
  } catch (error) {
    console.error("[CRON] Cleanup expired bookings error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to cleanup expired bookings" },
      { status: 500 }
    );
  }
}
