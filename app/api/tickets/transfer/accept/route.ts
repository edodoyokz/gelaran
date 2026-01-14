import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma/client";
import { createClient } from "@/lib/supabase/server";
import { Resend } from "resend";
import type { PrismaTransactionClient } from "@/types/prisma";

const resend = new Resend(process.env.RESEND_API_KEY);

function generateNewTicketCode(): string {
  const timestamp = Date.now().toString(36).toUpperCase();
  const random = Math.random().toString(36).substring(2, 10).toUpperCase();
  return `TKT-${timestamp}-${random}`;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { token } = body;

    if (!token) {
      return NextResponse.json(
        { success: false, error: { message: "Transfer token is required" } },
        { status: 400 }
      );
    }

    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json(
        { success: false, error: { message: "Authentication required. Please login to accept the ticket transfer." } },
        { status: 401 }
      );
    }

    const transfer = await prisma.ticketTransfer.findUnique({
      where: { id: token },
    });

    if (!transfer) {
      return NextResponse.json(
        { success: false, error: { message: "Transfer not found" } },
        { status: 404 }
      );
    }

    if (transfer.status !== "PENDING") {
      return NextResponse.json(
        { success: false, error: { message: `Transfer is already ${transfer.status.toLowerCase()}` } },
        { status: 400 }
      );
    }

    if (new Date() > transfer.expiresAt) {
      await prisma.ticketTransfer.update({
        where: { id: token },
        data: { status: "EXPIRED" },
      });
      return NextResponse.json(
        { success: false, error: { message: "Transfer has expired" } },
        { status: 400 }
      );
    }

    if (transfer.recipientEmail.toLowerCase() !== user.email?.toLowerCase()) {
      return NextResponse.json(
        { success: false, error: { message: "This transfer is intended for a different email address" } },
        { status: 403 }
      );
    }

    if (transfer.fromUserId === user.id) {
      return NextResponse.json(
        { success: false, error: { message: "Cannot accept a transfer from yourself" } },
        { status: 400 }
      );
    }

    const ticket = await prisma.bookedTicket.findUnique({
      where: { id: transfer.bookedTicketId },
      include: {
        ticketType: true,
        booking: {
          include: {
            user: { select: { id: true, name: true, email: true } },
            event: {
              include: {
                venue: { select: { name: true, city: true } },
                schedules: {
                  take: 1,
                  orderBy: { scheduleDate: "asc" },
                },
              },
            },
          },
        },
      },
    });

    if (!ticket) {
      return NextResponse.json(
        { success: false, error: { message: "Ticket not found" } },
        { status: 404 }
      );
    }

    if (ticket.status !== "ACTIVE") {
      return NextResponse.json(
        { success: false, error: { message: "Ticket is no longer active" } },
        { status: 400 }
      );
    }

    if (ticket.isCheckedIn) {
      return NextResponse.json(
        { success: false, error: { message: "Ticket has already been checked in" } },
        { status: 400 }
      );
    }

    const newUniqueCode = generateNewTicketCode();

    const recipientBooking = await prisma.booking.findFirst({
      where: {
        userId: user.id,
        eventId: ticket.booking.eventId,
        status: { in: ["PAID", "CONFIRMED"] },
      },
    });

    await prisma.$transaction(async (tx: PrismaTransactionClient) => {
      await tx.bookedTicket.update({
        where: { id: ticket.id },
        data: {
          uniqueCode: newUniqueCode,
          status: "ACTIVE",
        },
      });

      if (recipientBooking) {
        await tx.bookedTicket.update({
          where: { id: ticket.id },
          data: { bookingId: recipientBooking.id },
        });

        await tx.booking.update({
          where: { id: recipientBooking.id },
          data: { totalTickets: { increment: 1 } },
        });
      }

      await tx.ticketTransfer.update({
        where: { id: token },
        data: {
          status: "ACCEPTED",
          toUserId: user.id,
          newUniqueCode,
          acceptedAt: new Date(),
        },
      });
    });

    const fromUser = await prisma.user.findUnique({
      where: { id: transfer.fromUserId },
      select: { email: true, name: true },
    });

    if (fromUser?.email) {
      try {
        const recipientName = user.user_metadata?.name || user.email?.split("@")[0] || "the recipient";
        await resend.emails.send({
          from: `BSC Events <${process.env.RESEND_FROM_EMAIL || "noreply@bsc.events"}>`,
          to: fromUser.email,
          subject: `Tiket Anda berhasil ditransfer`,
          html: `
            <!DOCTYPE html>
            <html>
            <head>
              <meta charset="utf-8">
              <meta name="viewport" content="width=device-width, initial-scale=1.0">
            </head>
            <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
              <div style="background: linear-gradient(135deg, #10b981 0%, #059669 100%); padding: 32px; border-radius: 16px 16px 0 0; text-align: center;">
                <h1 style="color: white; margin: 0; font-size: 24px;">Transfer Berhasil</h1>
              </div>
              <div style="background: #f8fafc; padding: 32px; border-radius: 0 0 16px 16px; border: 1px solid #e2e8f0; border-top: none;">
                <p style="font-size: 18px; margin-bottom: 24px;">Halo${fromUser.name ? ` ${fromUser.name}` : ""},</p>
                <p>Tiket Anda untuk event <strong>${ticket.booking.event.title}</strong> telah berhasil ditransfer kepada <strong>${recipientName}</strong>.</p>
                
                <div style="background: white; padding: 24px; border-radius: 12px; margin: 24px 0; border: 1px solid #e2e8f0;">
                  <p style="margin: 8px 0;"><strong>Tipe Tiket:</strong> ${ticket.ticketType.name}</p>
                  <p style="margin: 8px 0;"><strong>Kode Tiket Lama:</strong> <span style="text-decoration: line-through; color: #94a3b8;">${transfer.oldUniqueCode}</span></p>
                  <p style="margin: 8px 0; color: #64748b; font-size: 14px;">Tiket lama sudah tidak berlaku lagi.</p>
                </div>
                
                <p style="color: #64748b; font-size: 14px;">
                  Jika Anda tidak melakukan transfer ini, segera hubungi customer support kami.
                </p>
              </div>
            </body>
            </html>
          `,
          text: `
Halo${fromUser.name ? ` ${fromUser.name}` : ""},

Tiket Anda untuk event ${ticket.booking.event.title} telah berhasil ditransfer kepada ${recipientName}.

Tipe Tiket: ${ticket.ticketType.name}
Kode Tiket Lama: ${transfer.oldUniqueCode} (sudah tidak berlaku)

Jika Anda tidak melakukan transfer ini, segera hubungi customer support kami.
          `.trim(),
        });
      } catch (emailError) {
        console.error("Failed to send transfer confirmation to sender:", emailError);
      }
    }

    return NextResponse.json({
      success: true,
      data: {
        message: "Ticket transfer accepted successfully",
        ticket: {
          id: ticket.id,
          uniqueCode: newUniqueCode,
          eventTitle: ticket.booking.event.title,
          ticketType: ticket.ticketType.name,
        },
      },
    });
  } catch (error) {
    console.error("Accept transfer error:", error);
    return NextResponse.json(
      { success: false, error: { message: "Failed to accept transfer" } },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const token = searchParams.get("token");

    if (!token) {
      return NextResponse.json(
        { success: false, error: { message: "Transfer token is required" } },
        { status: 400 }
      );
    }

    const transfer = await prisma.ticketTransfer.findUnique({
      where: { id: token },
    });

    if (!transfer) {
      return NextResponse.json(
        { success: false, error: { message: "Transfer not found" } },
        { status: 404 }
      );
    }

    const ticket = await prisma.bookedTicket.findUnique({
      where: { id: transfer.bookedTicketId },
      include: {
        ticketType: { select: { name: true } },
        booking: {
          include: {
            user: { select: { name: true } },
            event: {
              include: {
                venue: { select: { name: true, city: true } },
                schedules: {
                  take: 1,
                  orderBy: { scheduleDate: "asc" },
                },
              },
            },
          },
        },
      },
    });

    if (!ticket) {
      return NextResponse.json(
        { success: false, error: { message: "Ticket not found" } },
        { status: 404 }
      );
    }

    const schedule = ticket.booking.event.schedules[0];

    return NextResponse.json({
      success: true,
      data: {
        transferId: transfer.id,
        status: transfer.status,
        expiresAt: transfer.expiresAt,
        isExpired: new Date() > transfer.expiresAt,
        fromName: ticket.booking.user?.name || "Anonymous",
        recipientEmail: transfer.recipientEmail,
        event: {
          title: ticket.booking.event.title,
          date: schedule?.scheduleDate || null,
          venue: ticket.booking.event.venue,
        },
        ticketType: ticket.ticketType.name,
      },
    });
  } catch (error) {
    console.error("Get transfer info error:", error);
    return NextResponse.json(
      { success: false, error: { message: "Failed to get transfer info" } },
      { status: 500 }
    );
  }
}
