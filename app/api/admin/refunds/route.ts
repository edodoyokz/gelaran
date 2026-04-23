import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma/client";
import { requireAdminContext } from "@/lib/auth/route-auth";
import { getEmailEnv } from "@/lib/env";
import { Resend } from "resend";
import type { Decimal } from "@prisma/client/runtime/library";

const env = getEmailEnv();
const resend = new Resend(env.RESEND_API_KEY);
const refundEmailFrom = env.EMAIL_FROM;

interface RefundRecord {
  id: string;
  bookingId: string;
  transactionId: string | null;
  requestedBy: string;
  processedBy: string | null;
  refundAmount: Decimal;
  reason: string | null;
  status: string;
  adminNotes: string | null;
  requestedAt: Date;
  processedAt: Date | null;
  booking: {
    bookingCode: string;
    guestName: string | null;
    guestEmail: string | null;
    event: { title: string };
  };
  transaction: {
    transactionCode: string;
    paymentMethod: string;
  } | null;
}

export async function GET(request: NextRequest) {
  try {
    const authContext = await requireAdminContext();

    if ("error" in authContext) {
      return NextResponse.json(
        { success: false, error: { message: authContext.error } },
        { status: authContext.status }
      );
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status") as "REQUESTED" | "APPROVED" | "REJECTED" | "PROCESSING" | "COMPLETED" | "FAILED" | null;
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "20");

    const where = status ? { status } : undefined;

    const [refunds, total] = await Promise.all([
      prisma.refund.findMany({
        where,
        include: {
          booking: {
            select: {
              bookingCode: true,
              guestName: true,
              guestEmail: true,
              event: { select: { title: true } },
            },
          },
          transaction: {
            select: { transactionCode: true, paymentMethod: true },
          },
        },
        orderBy: { requestedAt: "desc" },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.refund.count({
        where,
      }),
    ]);

    const enrichedRefunds = await Promise.all(
      refunds.map(async (refund: RefundRecord) => {
        let requesterName = null;
        let processorName = null;

        const requester = await prisma.user.findUnique({
          where: { id: refund.requestedBy },
          select: { name: true, email: true },
        });
        requesterName = requester?.name || requester?.email;

        if (refund.processedBy) {
          const processor = await prisma.user.findUnique({
            where: { id: refund.processedBy },
            select: { name: true },
          });
          processorName = processor?.name;
        }

        return {
          ...refund,
          refundAmount: refund.refundAmount.toString(),
          requesterName,
          processorName,
        };
      })
    );

    return NextResponse.json({
      success: true,
      data: enrichedRefunds,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
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

export async function PUT(request: NextRequest) {
  try {
    const authContext = await requireAdminContext();

    if ("error" in authContext) {
      return NextResponse.json(
        { success: false, error: { message: authContext.error } },
        { status: authContext.status }
      );
    }

    const body = await request.json();
    const { refundId, action, adminNotes, refundAmount } = body;

    if (!refundId || !action) {
      return NextResponse.json(
        { success: false, error: { message: "Refund ID and action are required" } },
        { status: 400 }
      );
    }

    if (!["APPROVE", "REJECT", "COMPLETE", "FAIL"].includes(action)) {
      return NextResponse.json(
        { success: false, error: { message: "Invalid action" } },
        { status: 400 }
      );
    }

    const refund = await prisma.refund.findUnique({
      where: { id: refundId },
      include: {
        booking: {
          include: {
            event: { select: { title: true, organizerId: true } },
          },
        },
      },
    });

    if (!refund) {
      return NextResponse.json(
        { success: false, error: { message: "Refund not found" } },
        { status: 404 }
      );
    }

    let newStatus = refund.status;
    const updateData: {
      status?: "REQUESTED" | "APPROVED" | "REJECTED" | "PROCESSING" | "COMPLETED" | "FAILED";
      processedBy?: string;
      processedAt?: Date;
      completedAt?: Date;
      adminNotes?: string;
      refundAmount?: number;
    } = {};

    if (action === "APPROVE") {
      if (refund.status !== "REQUESTED") {
        return NextResponse.json(
          { success: false, error: { message: "Can only approve REQUESTED refunds" } },
          { status: 400 }
        );
      }
      newStatus = "APPROVED";
      updateData.status = newStatus;
      updateData.processedBy = authContext.dbUserId;
      updateData.processedAt = new Date();
      if (refundAmount !== undefined) {
        updateData.refundAmount = refundAmount;
      }
    } else if (action === "REJECT") {
      if (refund.status !== "REQUESTED") {
        return NextResponse.json(
          { success: false, error: { message: "Can only reject REQUESTED refunds" } },
          { status: 400 }
        );
      }
      newStatus = "REJECTED";
      updateData.status = newStatus;
      updateData.processedBy = authContext.dbUserId;
      updateData.processedAt = new Date();
    } else if (action === "COMPLETE") {
      if (refund.status !== "APPROVED" && refund.status !== "PROCESSING") {
        return NextResponse.json(
          { success: false, error: { message: "Can only complete APPROVED or PROCESSING refunds" } },
          { status: 400 }
        );
      }
      newStatus = "COMPLETED";
      updateData.status = newStatus;
      updateData.completedAt = new Date();
    } else if (action === "FAIL") {
      if (refund.status !== "PROCESSING") {
        return NextResponse.json(
          { success: false, error: { message: "Can only fail PROCESSING refunds" } },
          { status: 400 }
        );
      }
      newStatus = "FAILED";
      updateData.status = newStatus;
    }

    if (adminNotes) {
      updateData.adminNotes = adminNotes;
    }

    const updatedRefund = await prisma.refund.update({
      where: { id: refundId },
      data: updateData,
    });

    if (newStatus === "COMPLETED") {
      await prisma.booking.update({
        where: { id: refund.bookingId },
        data: { status: "REFUNDED" },
      });

      const organizerProfile = await prisma.organizerProfile.findUnique({
        where: { userId: refund.booking.event.organizerId },
      });

      if (organizerProfile) {
        const refundAmountNum = Number(updatedRefund.refundAmount);
        await prisma.organizerProfile.update({
          where: { id: organizerProfile.id },
          data: {
            walletBalance: { decrement: refundAmountNum },
          },
        });
      }
    }

    try {
      const requester = await prisma.user.findUnique({
        where: { id: refund.requestedBy },
        select: { email: true, name: true },
      });

      if (requester) {
        const statusMessages: Record<string, string> = {
          APPROVED: "disetujui",
          REJECTED: "ditolak",
          COMPLETED: "telah selesai diproses",
          FAILED: "gagal diproses",
        };

        await resend.emails.send({
          from: refundEmailFrom,
          to: requester.email,
          subject: `Update Refund - ${refund.booking.bookingCode}`,
          html: `
            <!DOCTYPE html>
            <html>
            <head>
              <meta charset="utf-8">
              <meta name="viewport" content="width=device-width, initial-scale=1.0">
            </head>
            <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
              <div style="background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%); padding: 32px; border-radius: 16px 16px 0 0; text-align: center;">
                <h1 style="color: white; margin: 0; font-size: 24px;">Update Status Refund</h1>
              </div>
              <div style="background: #f8fafc; padding: 32px; border-radius: 0 0 16px 16px; border: 1px solid #e2e8f0; border-top: none;">
                <p style="font-size: 18px; margin-bottom: 24px;">Halo ${requester.name || ""},</p>
                <p>Permintaan refund untuk booking <strong>${refund.booking.bookingCode}</strong> telah <strong>${statusMessages[newStatus] || newStatus}</strong>.</p>
                
                <div style="background: white; padding: 16px; border-radius: 8px; margin: 16px 0;">
                  <p style="margin: 4px 0;"><strong>Event:</strong> ${refund.booking.event.title}</p>
                  <p style="margin: 4px 0;"><strong>Jumlah Refund:</strong> Rp ${Number(updatedRefund.refundAmount).toLocaleString("id-ID")}</p>
                  <p style="margin: 4px 0;"><strong>Status:</strong> ${newStatus}</p>
                  ${adminNotes ? `<p style="margin: 4px 0;"><strong>Catatan:</strong> ${adminNotes}</p>` : ""}
                </div>
              </div>
            </body>
            </html>
          `,
        });
      }
    } catch (emailError) {
      console.error("Failed to send refund update email:", emailError);
    }

    await prisma.auditLog.create({
      data: {
        userId: authContext.dbUserId,
        action: `REFUND_${action}`,
        entityType: "Refund",
        entityId: refundId,
        oldValues: refund,
        newValues: updatedRefund,
      },
    });

    return NextResponse.json({
      success: true,
      data: {
        ...updatedRefund,
        refundAmount: updatedRefund.refundAmount.toString(),
      },
    });
  } catch (error) {
    console.error("Update refund error:", error);
    return NextResponse.json(
      { success: false, error: { message: "Failed to update refund" } },
      { status: 500 }
    );
  }
}
