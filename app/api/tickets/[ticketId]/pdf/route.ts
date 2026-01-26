import { NextRequest, NextResponse } from "next/server";
import { renderToBuffer } from "@react-pdf/renderer";
import prisma from "@/lib/prisma/client";
import { createClient } from "@/lib/supabase/server";
import { generateTicketPdfData } from "@/lib/pdf/ticket-template";
import { EVoucherTemplate } from "@/lib/pdf/evoucher-template";
import { formatVoucherDateTimeRange } from "@/lib/pdf/utils";
import QRCode from "qrcode";

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

    const isOwner =
      (user && ticket.booking.userId === user.id) ||
      (!user && !ticket.booking.userId);

    if (!isOwner && ticket.booking.userId) {
      return NextResponse.json(
        { success: false, error: { message: "Unauthorized" } },
        { status: 401 }
      );
    }

    // Allow generating PDF even if not paid for testing in dev, or strictly check status
    // Keeping original strict check
    if (
      ticket.booking.status !== "PAID" &&
      ticket.booking.status !== "CONFIRMED"
    ) {
      return NextResponse.json(
        {
          success: false,
          error: { message: "Ticket is not available for download" },
        },
        { status: 400 }
      );
    }

    if (ticket.status !== "ACTIVE") {
      return NextResponse.json(
        { success: false, error: { message: "Ticket is no longer active" } },
        { status: 400 }
      );
    }

    // Generate basic data
    const pdfData = generateTicketPdfData(ticket.booking, ticket);

    // Generate QR Code
    const qrCodeDataUrl = await QRCode.toDataURL(ticket.uniqueCode);

    // Format specific fields for Voucher
    const schedule = ticket.booking.event.schedules[0];
    const scheduleDate = schedule ? new Date(schedule.scheduleDate) : new Date();
    const startTime = schedule ? new Date(schedule.startTime) : new Date();
    // Assuming 23:00 end time as default or needs to be fetched if available. Using default from util for now.

    // Override date/time display with specific voucher format
    // "15 JUN 2025 15:00 – 23:00" logic in template relies on separate date/time or combined?
    // The template uses pdfData.eventDate + pdfData.eventTime. 
    // Let's rely on the template's logic but we can also update pdfData properties if we want specific overrides.
    // Actually our new template uses:
    // {ticket.eventDate} {ticket.eventTime} – 23:00
    // So we just need to make sure eventDate and eventTime are formatted nicely. 
    // The existing generateTicketPdfData uses 'id-ID' locale. 
    // The reference PDF used English format "15 JUN 2025".

    // Let's create a specialized data object for the voucher
    const voucherData = {
      ...pdfData,
      eventDate: schedule ? new Date(schedule.scheduleDate).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" }).toUpperCase() : pdfData.eventDate,
      eventTime: schedule ? new Date(schedule.startTime).toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit", hour12: false }) : pdfData.eventTime,
      qrCodeDataUrl
    };

    const pdfBuffer = await renderToBuffer(
      EVoucherTemplate({ ticket: voucherData })
    );

    const filename = `voucher-${ticket.uniqueCode.substring(0, 8)}.pdf`;

    return new NextResponse(new Uint8Array(pdfBuffer), {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${filename}"`,
        "Cache-Control": "private, max-age=3600",
      },
    });
  } catch (error) {
    console.error("PDF generation error:", error);
    return NextResponse.json(
      { success: false, error: { message: "Failed to generate PDF" } },
      { status: 500 }
    );
  }
}
