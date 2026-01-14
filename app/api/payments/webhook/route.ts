import { type NextRequest } from "next/server";
import prisma from "@/lib/prisma/client";
import { mapTransactionStatus } from "@/lib/midtrans/client";
import { sendBookingConfirmationEmail } from "@/lib/email/send";
import crypto from "crypto";

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();

        const {
            order_id,
            status_code,
            gross_amount,
            signature_key,
            transaction_status,
            fraud_status,
            payment_type,
        } = body;

        // Verify signature
        const serverKey = process.env.MIDTRANS_SERVER_KEY!;
        const expectedSignature = crypto
            .createHash("sha512")
            .update(`${order_id}${status_code}${gross_amount}${serverKey}`)
            .digest("hex");

        if (signature_key !== expectedSignature) {
            console.error("Invalid Midtrans signature");
            return new Response("Invalid signature", { status: 403 });
        }

        // Find transaction
        const transaction = await prisma.transaction.findUnique({
            where: { transactionCode: order_id },
            include: {
                booking: {
                    include: {
                        bookedTickets: true,
                    },
                },
            },
        });

        if (!transaction) {
            console.error("Transaction not found:", order_id);
            return new Response("Transaction not found", { status: 404 });
        }

        // Map status
        const newStatus = mapTransactionStatus(transaction_status);
        const isPaid = ["capture", "settlement"].includes(transaction_status) && fraud_status === "accept";

        // Update transaction
        await prisma.transaction.update({
            where: { id: transaction.id },
            data: {
                status: newStatus,
                paymentMethod: payment_type?.toUpperCase() || transaction.paymentMethod,
                paymentChannel: body.bank || body.issuer || null,
                gatewayTransactionId: body.transaction_id,
                gatewayResponse: body,
                paidAt: isPaid ? new Date() : null,
            },
        });

        // Update booking if paid
        if (isPaid) {
            const isOnSiteSale = transaction.booking.salesChannel === "ON_SITE";
            
            await prisma.$transaction(async (tx) => {
                // Update booking status
                await tx.booking.update({
                    where: { id: transaction.bookingId },
                    data: {
                        status: "CONFIRMED",
                        paymentStatus: "PAID",
                        paidAt: new Date(),
                        confirmedAt: new Date(),
                    },
                });

                // Update ticket types sold count and auto check-in for POS sales
                for (const ticket of transaction.booking.bookedTickets) {
                    await tx.ticketType.update({
                        where: { id: ticket.ticketTypeId },
                        data: {
                            soldQuantity: { increment: 1 },
                            reservedQuantity: { decrement: 1 },
                        },
                    });
                    
                    if (isOnSiteSale) {
                        await tx.bookedTicket.update({
                            where: { id: ticket.id },
                            data: {
                                isCheckedIn: true,
                                checkedInAt: new Date(),
                            },
                        });
                    }
                }
            });

            // Send confirmation email with tickets (skip for on-site sales without email)
            if (transaction.booking.guestEmail || transaction.booking.userId) {
                sendBookingConfirmationEmail(transaction.bookingId).catch((err) => {
                    console.error("Failed to send confirmation email:", err);
                });
            }
            console.log(`Payment confirmed for booking: ${transaction.booking.bookingCode}${isOnSiteSale ? " (POS - auto checked-in)" : ""}`);
        }

        // Handle failed/expired
        if (["FAILED", "EXPIRED"].includes(newStatus)) {
            await prisma.$transaction(async (tx) => {
                // Update booking status
                await tx.booking.update({
                    where: { id: transaction.bookingId },
                    data: {
                        status: newStatus === "EXPIRED" ? "EXPIRED" : "CANCELLED",
                        cancellationReason: `Payment ${newStatus.toLowerCase()}`,
                    },
                });

                // Release reserved tickets
                for (const ticket of transaction.booking.bookedTickets) {
                    await tx.ticketType.update({
                        where: { id: ticket.ticketTypeId },
                        data: {
                            reservedQuantity: { decrement: 1 },
                        },
                    });
                }
            });
        }

        return new Response("OK", { status: 200 });
    } catch (error) {
        console.error("Webhook error:", error);
        return new Response("Internal error", { status: 500 });
    }
}
