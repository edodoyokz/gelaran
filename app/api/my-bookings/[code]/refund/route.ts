import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma/client";
import { createClient } from "@/lib/supabase/server";
import { Resend } from "resend";
import type { Decimal } from "@prisma/client/runtime/library";

interface RefundRecord {
  id: string;
  refundType: string;
  refundAmount: Decimal;
  reason: string | null;
  status: string;
  adminNotes: string | null;
  requestedAt: Date;
  processedAt: Date | null;
  completedAt: Date | null;
}

const resend = new Resend(process.env.RESEND_API_KEY);

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ code: string }> }
) {
  try {
    const { code: bookingCode } = await params;

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

    const booking = await prisma.booking.findUnique({
      where: { bookingCode },
      include: {
        refunds: {
          orderBy: { requestedAt: "desc" },
        },
        event: {
          select: { refundPolicy: true },
        },
      },
    });

    if (!booking) {
      return NextResponse.json(
        { success: false, error: { message: "Booking not found" } },
        { status: 404 }
      );
    }

    if (booking.userId !== user.id) {
      return NextResponse.json(
        { success: false, error: { message: "Not authorized" } },
        { status: 403 }
      );
    }

    return NextResponse.json({
      success: true,
      data: {
        refunds: booking.refunds.map((refund: RefundRecord) => ({
          id: refund.id,
          refundType: refund.refundType,
          refundAmount: refund.refundAmount.toString(),
          reason: refund.reason,
          status: refund.status,
          adminNotes: refund.adminNotes,
          requestedAt: refund.requestedAt,
          processedAt: refund.processedAt,
          completedAt: refund.completedAt,
        })),
        refundPolicy: booking.event.refundPolicy,
        canRequestRefund:
          (booking.status === "CONFIRMED" || booking.status === "PAID") &&
          !booking.refunds.some((r) => r.status === "REQUESTED" || r.status === "APPROVED" || r.status === "PROCESSING"),
      },
    });
  } catch (error) {
    console.error("Get refunds error:", error);
    return NextResponse.json(
      { success: false, error: { message: "Failed to get refunds" } },
      { status: 500 }
    );
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ code: string }> }
) {
  try {
    const { code: bookingCode } = await params;
    const body = await request.json();
    const { reason, refundType } = body;

    if (!reason) {
      return NextResponse.json(
        { success: false, error: { message: "Reason is required" } },
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

    const booking = await prisma.booking.findUnique({
      where: { bookingCode },
      include: {
        transaction: true,
        refunds: true,
        event: {
          select: { title: true, refundPolicy: true },
        },
      },
    });

    if (!booking) {
      return NextResponse.json(
        { success: false, error: { message: "Booking not found" } },
        { status: 404 }
      );
    }

    if (booking.userId !== user.id) {
      return NextResponse.json(
        { success: false, error: { message: "Not authorized" } },
        { status: 403 }
      );
    }

    if (booking.status !== "CONFIRMED" && booking.status !== "PAID") {
      return NextResponse.json(
        { success: false, error: { message: "Booking is not eligible for refund" } },
        { status: 400 }
      );
    }

    const pendingRefund = booking.refunds.find(
      (r) => r.status === "REQUESTED" || r.status === "APPROVED" || r.status === "PROCESSING"
    );

    if (pendingRefund) {
      return NextResponse.json(
        { success: false, error: { message: "A refund request is already pending" } },
        { status: 400 }
      );
    }

    if (!booking.transaction) {
      return NextResponse.json(
        { success: false, error: { message: "No transaction found for this booking" } },
        { status: 400 }
      );
    }

    const refund = await prisma.refund.create({
      data: {
        transactionId: booking.transaction.id,
        bookingId: booking.id,
        requestedBy: user.id,
        refundType: refundType === "PARTIAL" ? "PARTIAL" : "FULL",
        refundAmount: booking.totalAmount,
        reason,
        status: "REQUESTED",
      },
    });

    try {
      const userData = await prisma.user.findUnique({
        where: { id: user.id },
        select: { email: true, name: true },
      });

      if (userData) {
        await resend.emails.send({
          from: `BSC Events <${process.env.RESEND_FROM_EMAIL || "noreply@bsc.events"}>`,
          to: userData.email,
          subject: `Permintaan Refund Diterima - ${booking.bookingCode}`,
          html: `
            <!DOCTYPE html>
            <html>
            <head>
              <meta charset="utf-8">
              <meta name="viewport" content="width=device-width, initial-scale=1.0">
            </head>
            <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
              <div style="background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%); padding: 32px; border-radius: 16px 16px 0 0; text-align: center;">
                <h1 style="color: white; margin: 0; font-size: 24px;">Permintaan Refund Diterima</h1>
              </div>
              <div style="background: #f8fafc; padding: 32px; border-radius: 0 0 16px 16px; border: 1px solid #e2e8f0; border-top: none;">
                <p style="font-size: 18px; margin-bottom: 24px;">Halo ${userData.name || ""},</p>
                <p>Permintaan refund untuk booking <strong>${booking.bookingCode}</strong> telah kami terima.</p>
                
                <div style="background: white; padding: 16px; border-radius: 8px; margin: 16px 0;">
                  <p style="margin: 4px 0;"><strong>Event:</strong> ${booking.event.title}</p>
                  <p style="margin: 4px 0;"><strong>Jumlah Refund:</strong> Rp ${Number(booking.totalAmount).toLocaleString("id-ID")}</p>
                  <p style="margin: 4px 0;"><strong>Alasan:</strong> ${reason}</p>
                </div>
                
                <p style="color: #64748b; font-size: 14px; margin-top: 24px;">
                  Tim kami akan meninjau permintaan refund Anda dalam 1-3 hari kerja. Anda akan menerima notifikasi email ketika refund diproses.
                </p>
              </div>
            </body>
            </html>
          `,
        });
      }
    } catch (emailError) {
      console.error("Failed to send refund request email:", emailError);
    }

    return NextResponse.json({
      success: true,
      data: {
        id: refund.id,
        refundType: refund.refundType,
        refundAmount: refund.refundAmount.toString(),
        status: refund.status,
        requestedAt: refund.requestedAt,
      },
    });
  } catch (error) {
    console.error("Create refund request error:", error);
    return NextResponse.json(
      { success: false, error: { message: "Failed to create refund request" } },
      { status: 500 }
    );
  }
}
