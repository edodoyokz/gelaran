import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma/client";
import { createClient } from "@/lib/supabase/server";
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

function generateNewTicketCode(): string {
  const timestamp = Date.now().toString(36).toUpperCase();
  const random = Math.random().toString(36).substring(2, 10).toUpperCase();
  return `TKT-${timestamp}-${random}`;
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ ticketId: string }> }
) {
  try {
    const { ticketId } = await params;
    const body = await request.json();
    const { recipientEmail, recipientName } = body;

    if (!recipientEmail) {
      return NextResponse.json(
        { success: false, error: { message: "Recipient email is required" } },
        { status: 400 }
      );
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(recipientEmail)) {
      return NextResponse.json(
        { success: false, error: { message: "Invalid email format" } },
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

    const ticket = await prisma.bookedTicket.findUnique({
      where: { id: ticketId },
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

    if (ticket.booking.userId !== user.id) {
      return NextResponse.json(
        { success: false, error: { message: "You do not own this ticket" } },
        { status: 403 }
      );
    }

    if (ticket.status !== "ACTIVE") {
      return NextResponse.json(
        { success: false, error: { message: "Ticket is not active" } },
        { status: 400 }
      );
    }

    if (ticket.booking.status !== "PAID" && ticket.booking.status !== "CONFIRMED") {
      return NextResponse.json(
        { success: false, error: { message: "Booking is not confirmed" } },
        { status: 400 }
      );
    }

    if (ticket.isCheckedIn) {
      return NextResponse.json(
        { success: false, error: { message: "Ticket has already been checked in" } },
        { status: 400 }
      );
    }

    const eventSchedule = ticket.booking.event.schedules[0];
    if (eventSchedule) {
      const eventDate = new Date(eventSchedule.scheduleDate);
      const now = new Date();
      if (eventDate < now) {
        return NextResponse.json(
          { success: false, error: { message: "Event has already passed" } },
          { status: 400 }
        );
      }
    }

    if (recipientEmail.toLowerCase() === user.email?.toLowerCase()) {
      return NextResponse.json(
        { success: false, error: { message: "Cannot transfer ticket to yourself" } },
        { status: 400 }
      );
    }

    const pendingTransfer = await prisma.ticketTransfer.findFirst({
      where: {
        bookedTicketId: ticketId,
        status: "PENDING",
      },
    });

    if (pendingTransfer) {
      return NextResponse.json(
        { success: false, error: { message: "There is already a pending transfer for this ticket" } },
        { status: 400 }
      );
    }

    const recipientUser = await prisma.user.findUnique({
      where: { email: recipientEmail.toLowerCase() },
      select: { id: true, name: true },
    });

    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + 48);

    const transfer = await prisma.ticketTransfer.create({
      data: {
        bookedTicketId: ticketId,
        fromUserId: user.id,
        toUserId: recipientUser?.id || null,
        recipientEmail: recipientEmail.toLowerCase(),
        recipientName: recipientName || recipientUser?.name || null,
        status: "PENDING",
        oldUniqueCode: ticket.uniqueCode,
        expiresAt,
      },
    });

    const acceptUrl = `${process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000"}/tickets/transfer/accept?token=${transfer.id}`;
    const fromName = ticket.booking.user?.name || "Someone";
    const eventTitle = ticket.booking.event.title;
    const ticketTypeName = ticket.ticketType.name;
    const schedule = eventSchedule;
    const eventDate = schedule
      ? new Date(schedule.scheduleDate).toLocaleDateString("id-ID", {
          weekday: "long",
          year: "numeric",
          month: "long",
          day: "numeric",
        })
      : "TBA";

    try {
      await resend.emails.send({
        from: `BSC Events <${process.env.RESEND_FROM_EMAIL || "noreply@bsc.events"}>`,
        to: recipientEmail,
        subject: `Anda menerima tiket untuk ${eventTitle}`,
        html: `
          <!DOCTYPE html>
          <html>
          <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
          </head>
          <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
            <div style="background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%); padding: 32px; border-radius: 16px 16px 0 0; text-align: center;">
              <h1 style="color: white; margin: 0; font-size: 24px;">Tiket Transfer</h1>
            </div>
            <div style="background: #f8fafc; padding: 32px; border-radius: 0 0 16px 16px; border: 1px solid #e2e8f0; border-top: none;">
              <p style="font-size: 18px; margin-bottom: 24px;">Halo${recipientName ? ` ${recipientName}` : ""},</p>
              <p><strong>${fromName}</strong> ingin mengirimkan tiket event kepada Anda:</p>
              
              <div style="background: white; padding: 24px; border-radius: 12px; margin: 24px 0; border: 1px solid #e2e8f0;">
                <h2 style="margin: 0 0 16px 0; color: #6366f1;">${eventTitle}</h2>
                <p style="margin: 8px 0;"><strong>Tipe Tiket:</strong> ${ticketTypeName}</p>
                <p style="margin: 8px 0;"><strong>Tanggal:</strong> ${eventDate}</p>
                ${ticket.booking.event.venue ? `<p style="margin: 8px 0;"><strong>Lokasi:</strong> ${ticket.booking.event.venue.name}, ${ticket.booking.event.venue.city}</p>` : ""}
              </div>
              
              <p style="color: #64748b; font-size: 14px; margin-bottom: 24px;">
                Link ini akan kadaluarsa dalam 48 jam. Setelah diterima, tiket lama akan dinonaktifkan dan tiket baru akan diterbitkan atas nama Anda.
              </p>
              
              <div style="text-align: center; margin: 32px 0;">
                <a href="${acceptUrl}" style="display: inline-block; background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%); color: white; padding: 16px 32px; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 16px;">
                  Terima Tiket
                </a>
              </div>
              
              <p style="color: #94a3b8; font-size: 12px; text-align: center; margin-top: 32px;">
                Jika Anda tidak mengenal pengirim atau tidak ingin menerima tiket ini, abaikan saja email ini.
              </p>
            </div>
          </body>
          </html>
        `,
        text: `
Halo${recipientName ? ` ${recipientName}` : ""},

${fromName} ingin mengirimkan tiket event kepada Anda:

Event: ${eventTitle}
Tipe Tiket: ${ticketTypeName}
Tanggal: ${eventDate}
${ticket.booking.event.venue ? `Lokasi: ${ticket.booking.event.venue.name}, ${ticket.booking.event.venue.city}` : ""}

Untuk menerima tiket, kunjungi link berikut:
${acceptUrl}

Link ini akan kadaluarsa dalam 48 jam.

Jika Anda tidak mengenal pengirim, abaikan email ini.
        `.trim(),
      });
    } catch (emailError) {
      console.error("Failed to send transfer email:", emailError);
    }

    return NextResponse.json({
      success: true,
      data: {
        transferId: transfer.id,
        recipientEmail: recipientEmail.toLowerCase(),
        expiresAt: transfer.expiresAt,
        message: `Transfer invitation sent to ${recipientEmail}`,
      },
    });
  } catch (error) {
    console.error("Ticket transfer error:", error);
    return NextResponse.json(
      { success: false, error: { message: "Failed to initiate transfer" } },
      { status: 500 }
    );
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ ticketId: string }> }
) {
  try {
    const { ticketId } = await params;

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

    const transfers = await prisma.ticketTransfer.findMany({
      where: {
        bookedTicketId: ticketId,
        fromUserId: user.id,
      },
      orderBy: { initiatedAt: "desc" },
    });

    return NextResponse.json({
      success: true,
      data: transfers.map((t) => ({
        id: t.id,
        recipientEmail: t.recipientEmail,
        recipientName: t.recipientName,
        status: t.status,
        initiatedAt: t.initiatedAt,
        acceptedAt: t.acceptedAt,
        expiresAt: t.expiresAt,
      })),
    });
  } catch (error) {
    console.error("Get transfer status error:", error);
    return NextResponse.json(
      { success: false, error: { message: "Failed to get transfer status" } },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ ticketId: string }> }
) {
  try {
    const { ticketId } = await params;

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

    const transfer = await prisma.ticketTransfer.findFirst({
      where: {
        bookedTicketId: ticketId,
        fromUserId: user.id,
        status: "PENDING",
      },
    });

    if (!transfer) {
      return NextResponse.json(
        { success: false, error: { message: "No pending transfer found" } },
        { status: 404 }
      );
    }

    await prisma.ticketTransfer.update({
      where: { id: transfer.id },
      data: { status: "CANCELLED" },
    });

    return NextResponse.json({
      success: true,
      data: { message: "Transfer cancelled successfully" },
    });
  } catch (error) {
    console.error("Cancel transfer error:", error);
    return NextResponse.json(
      { success: false, error: { message: "Failed to cancel transfer" } },
      { status: 500 }
    );
  }
}
