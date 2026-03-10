import { type NextRequest } from "next/server";
import prisma from "@/lib/prisma/client";
import { successResponse, errorResponse } from "@/lib/api/response";
import { getServerEnv } from "@/lib/env";
import { sendBookingConfirmationEmail } from "@/lib/email/send";
import { generateOrderId } from "@/lib/midtrans/client";
import type { PrismaTransactionClient } from "@/types/prisma";

const env = getServerEnv();

export async function POST(request: NextRequest) {
    try {
        // SECURITY: Reject if demo mode not enabled in production
        if (!env.NEXT_PUBLIC_ENABLE_DEMO_PAYMENT) {
            return errorResponse("Demo payment is disabled", 403);
        }

        const { bookingId } = await request.json();

        if (!bookingId) {
            return errorResponse("Booking ID is required", 400);
        }

        const booking = await prisma.booking.findUnique({
            where: { id: bookingId },
            include: {
                bookedTickets: true,
                event: {
                    select: {
                        title: true,
                        slug: true,
                    },
                },
            },
        });

        if (!booking) {
            return errorResponse("Booking not found", 404);
        }

        if (booking.paymentStatus === "PAID") {
            return errorResponse("Booking already paid", 400);
        }

        if (booking.expiresAt && new Date() > booking.expiresAt) {
            return errorResponse("Booking has expired", 400);
        }

        const orderId = generateOrderId(booking.bookingCode);

        await prisma.$transaction(async (tx: PrismaTransactionClient) => {
            await tx.transaction.create({
                data: {
                    bookingId: booking.id,
                    transactionCode: orderId,
                    paymentGateway: "DEMO",
                    paymentMethod: "DEMO_PAYMENT",
                    amount: booking.totalAmount,
                    status: "SUCCESS",
                    paidAt: new Date(),
                    gatewayResponse: {
                        demo: true,
                        simulatedAt: new Date().toISOString(),
                    },
                },
            });

            await tx.booking.update({
                where: { id: booking.id },
                data: {
                    status: "CONFIRMED",
                    paymentStatus: "PAID",
                    paidAt: new Date(),
                    confirmedAt: new Date(),
                },
            });

            for (const ticket of booking.bookedTickets) {
                await tx.ticketType.update({
                    where: { id: ticket.ticketTypeId },
                    data: {
                        soldQuantity: { increment: 1 },
                        reservedQuantity: { decrement: 1 },
                    },
                });
            }
        });

        if (booking.guestEmail || booking.userId) {
            sendBookingConfirmationEmail(booking.id).catch((err) => {
                console.error("Failed to send confirmation email:", err);
            });
        }

        console.log(`[DEMO] Payment simulated for booking: ${booking.bookingCode}`);

        return successResponse({
            success: true,
            bookingCode: booking.bookingCode,
            message: "Demo payment successful",
        });
    } catch (error) {
        console.error("Demo payment error:", error);
        return errorResponse("Failed to process demo payment", 500);
    }
}
