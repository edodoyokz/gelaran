import { NextRequest, NextResponse } from "next/server";
import { renderToBuffer } from "@react-pdf/renderer";
import prisma from "@/lib/prisma/client";
import { createClient } from "@/lib/supabase/server";
import { generateTicketPdfData } from "@/lib/pdf/ticket-template";
import { EVoucherTemplate } from "@/lib/pdf/evoucher-template";
import { getTemplate, mergeVoucherConfig } from "@/lib/pdf/templates/registry";
import type { VoucherConfig } from "@/lib/pdf/types";
import QRCode from "qrcode";

const DEFAULT_VOUCHER_CONFIG: VoucherConfig = {
  colors: {
    primary: "#4F46E5",
    background: "#FFFFFF",
    text: "#111827",
  },
  assets: {
    logoUrl: null,
    backgroundUrl: null,
  },
  toggles: {
    showQr: true,
    showPrice: true,
    showVenueMap: true,
  },
  customSections: [],
};

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
                voucherConfig: {
                  include: {
                    template: true,
                  },
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
    const qrCodeDataUrl = await QRCode.toDataURL(ticket.uniqueCode);

    const schedule = ticket.booking.event.schedules[0];
    const voucherData = {
      ...pdfData,
      eventDate: schedule
        ? new Date(schedule.scheduleDate)
            .toLocaleDateString("en-GB", {
              day: "numeric",
              month: "short",
              year: "numeric",
            })
            .toUpperCase()
        : pdfData.eventDate,
      eventTime: schedule
        ? new Date(schedule.startTime).toLocaleTimeString("en-GB", {
            hour: "2-digit",
            minute: "2-digit",
            hour12: false,
          })
        : pdfData.eventTime,
      qrCodeDataUrl,
    };

    let documentNode = EVoucherTemplate({ ticket: voucherData });

    const eventVoucherConfig = ticket.booking.event.voucherConfig;
    if (eventVoucherConfig?.template?.isActive) {
      try {
        const template = getTemplate(eventVoucherConfig.template.componentKey);
        const configFromTemplate =
          (eventVoucherConfig.template.defaultConfig as Partial<VoucherConfig>) ??
          null;
        const configOverrides =
          (eventVoucherConfig.configOverrides as Partial<VoucherConfig>) ?? null;

        const mergedConfig = mergeVoucherConfig(
          mergeVoucherConfig(DEFAULT_VOUCHER_CONFIG, configFromTemplate),
          configOverrides
        );

        documentNode = template({ ticket: pdfData, config: mergedConfig });
      } catch (templateError) {
        console.error("Template rendering fallback to EVoucherTemplate:", templateError);
      }
    }

    const pdfBuffer = await renderToBuffer(documentNode);
    const filename = `voucher-${ticket.uniqueCode.substring(0, 8)}.pdf`;

    return new NextResponse(new Uint8Array(pdfBuffer), {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${filename}"`,
        "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate",
        Pragma: "no-cache",
        Expires: "0",
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
