import { NextRequest, NextResponse } from "next/server";
import { renderToBuffer } from "@react-pdf/renderer";
import prisma from "@/lib/prisma/client";
import { createClient } from "@/lib/supabase/server";
import {
  TicketPdfDocument,
  generateTicketPdfData,
} from "@/lib/pdf/ticket-template";

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

    const pdfData = generateTicketPdfData(ticket.booking, ticket);

    const pdfBuffer = await renderToBuffer(
      TicketPdfDocument({ ticket: pdfData })
    );

    const filename = `ticket-${ticket.uniqueCode.substring(0, 8)}.pdf`;

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
