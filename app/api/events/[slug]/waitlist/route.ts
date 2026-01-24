import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma/client";
import { createClient } from "@/lib/supabase/server";
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    const body = await request.json();
    const { ticketTypeId, email, name, quantity = 1 } = body;

    if (!ticketTypeId) {
      return NextResponse.json(
        { success: false, error: { message: "Ticket type is required" } },
        { status: 400 }
      );
    }

    if (!email) {
      return NextResponse.json(
        { success: false, error: { message: "Email is required" } },
        { status: 400 }
      );
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { success: false, error: { message: "Invalid email format" } },
        { status: 400 }
      );
    }

    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    const event = await prisma.event.findUnique({
      where: { slug },
      select: { id: true, title: true, status: true },
    });

    if (!event) {
      return NextResponse.json(
        { success: false, error: { message: "Event not found" } },
        { status: 404 }
      );
    }

    if (event.status !== "PUBLISHED") {
      return NextResponse.json(
        { success: false, error: { message: "Event is not available" } },
        { status: 400 }
      );
    }

    const ticketType = await prisma.ticketType.findFirst({
      where: { id: ticketTypeId, eventId: event.id },
      select: {
        id: true,
        name: true,
        totalQuantity: true,
        soldQuantity: true,
        reservedQuantity: true,
      },
    });

    if (!ticketType) {
      return NextResponse.json(
        { success: false, error: { message: "Ticket type not found" } },
        { status: 404 }
      );
    }

    const available = ticketType.totalQuantity - ticketType.soldQuantity - ticketType.reservedQuantity;
    if (available > 0) {
      return NextResponse.json(
        { success: false, error: { message: "Tickets are still available. No need to join waitlist." } },
        { status: 400 }
      );
    }

    const existingEntry = await prisma.waitlistEntry.findFirst({
      where: {
        ticketTypeId,
        email: email.toLowerCase(),
        status: "WAITING",
      },
    });

    if (existingEntry) {
      return NextResponse.json(
        { success: false, error: { message: "You are already on the waitlist for this ticket type" } },
        { status: 400 }
      );
    }

    const waitlistEntry = await prisma.waitlistEntry.create({
      data: {
        ticketTypeId,
        userId: user?.id || null,
        email: email.toLowerCase(),
        name: name || null,
        quantityRequested: Math.min(Math.max(1, quantity), 10),
        status: "WAITING",
      },
    });

    try {
      await resend.emails.send({
        from: `Gelaran <${process.env.RESEND_FROM_EMAIL || "noreply@gelaran.id"}>`,
        to: email,
        subject: `Anda terdaftar di waitlist untuk ${event.title}`,
        html: `
          <!DOCTYPE html>
          <html>
          <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
          </head>
          <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
            <div style="background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%); padding: 32px; border-radius: 16px 16px 0 0; text-align: center;">
              <h1 style="color: white; margin: 0; font-size: 24px;">Waitlist Confirmation</h1>
            </div>
            <div style="background: #f8fafc; padding: 32px; border-radius: 0 0 16px 16px; border: 1px solid #e2e8f0; border-top: none;">
              <p style="font-size: 18px; margin-bottom: 24px;">Halo${name ? ` ${name}` : ""},</p>
              <p>Anda telah berhasil terdaftar di <strong>waitlist</strong> untuk:</p>
              
              <div style="background: white; padding: 24px; border-radius: 12px; margin: 24px 0; border: 1px solid #e2e8f0;">
                <h2 style="margin: 0 0 8px 0; color: #6366f1;">${event.title}</h2>
                <p style="margin: 8px 0; color: #64748b;"><strong>Tipe Tiket:</strong> ${ticketType.name}</p>
                <p style="margin: 8px 0; color: #64748b;"><strong>Jumlah:</strong> ${quantity} tiket</p>
              </div>
              
              <p style="color: #64748b; font-size: 14px;">
                Kami akan mengirimkan notifikasi via email ketika tiket tersedia. Pastikan email Anda aktif dan periksa folder spam secara berkala.
              </p>
              
              <p style="color: #94a3b8; font-size: 12px; text-align: center; margin-top: 32px;">
                Tidak ada jaminan bahwa tiket akan tersedia. Ini hanya untuk notifikasi ketersediaan.
              </p>
            </div>
          </body>
          </html>
        `,
        text: `
Halo${name ? ` ${name}` : ""},

Anda telah berhasil terdaftar di waitlist untuk:

Event: ${event.title}
Tipe Tiket: ${ticketType.name}
Jumlah: ${quantity} tiket

Kami akan mengirimkan notifikasi via email ketika tiket tersedia.

Tidak ada jaminan bahwa tiket akan tersedia. Ini hanya untuk notifikasi ketersediaan.
        `.trim(),
      });
    } catch (emailError) {
      console.error("Failed to send waitlist confirmation email:", emailError);
    }

    return NextResponse.json({
      success: true,
      data: {
        id: waitlistEntry.id,
        message: "Successfully joined the waitlist",
        position: await prisma.waitlistEntry.count({
          where: {
            ticketTypeId,
            status: "WAITING",
            createdAt: { lte: waitlistEntry.createdAt },
          },
        }),
      },
    });
  } catch (error) {
    console.error("Waitlist join error:", error);
    return NextResponse.json(
      { success: false, error: { message: "Failed to join waitlist" } },
      { status: 500 }
    );
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    const { searchParams } = new URL(request.url);
    const ticketTypeId = searchParams.get("ticketTypeId");

    const event = await prisma.event.findUnique({
      where: { slug },
      select: { id: true },
    });

    if (!event) {
      return NextResponse.json(
        { success: false, error: { message: "Event not found" } },
        { status: 404 }
      );
    }

    if (!ticketTypeId) {
      return NextResponse.json(
        { success: false, error: { message: "Ticket type ID is required" } },
        { status: 400 }
      );
    }

    const waitlistCount = await prisma.waitlistEntry.count({
      where: {
        ticketTypeId,
        status: "WAITING",
      },
    });

    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    let userEntry = null;
    if (user) {
      userEntry = await prisma.waitlistEntry.findFirst({
        where: {
          ticketTypeId,
          userId: user.id,
          status: "WAITING",
        },
        select: {
          id: true,
          quantityRequested: true,
          createdAt: true,
        },
      });
    }

    return NextResponse.json({
      success: true,
      data: {
        waitlistCount,
        userOnWaitlist: !!userEntry,
        userEntry,
      },
    });
  } catch (error) {
    console.error("Get waitlist error:", error);
    return NextResponse.json(
      { success: false, error: { message: "Failed to get waitlist info" } },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    const { searchParams } = new URL(request.url);
    const ticketTypeId = searchParams.get("ticketTypeId");

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

    const event = await prisma.event.findUnique({
      where: { slug },
      select: { id: true },
    });

    if (!event) {
      return NextResponse.json(
        { success: false, error: { message: "Event not found" } },
        { status: 404 }
      );
    }

    if (!ticketTypeId) {
      return NextResponse.json(
        { success: false, error: { message: "Ticket type ID is required" } },
        { status: 400 }
      );
    }

    const waitlistEntry = await prisma.waitlistEntry.findFirst({
      where: {
        ticketTypeId,
        userId: user.id,
        status: "WAITING",
      },
    });

    if (!waitlistEntry) {
      return NextResponse.json(
        { success: false, error: { message: "Waitlist entry not found" } },
        { status: 404 }
      );
    }

    await prisma.waitlistEntry.delete({
      where: { id: waitlistEntry.id },
    });

    return NextResponse.json({
      success: true,
      data: { message: "Successfully removed from waitlist" },
    });
  } catch (error) {
    console.error("Remove from waitlist error:", error);
    return NextResponse.json(
      { success: false, error: { message: "Failed to remove from waitlist" } },
      { status: 500 }
    );
  }
}
