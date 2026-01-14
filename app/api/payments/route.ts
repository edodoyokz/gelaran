import { type NextRequest } from "next/server";
import prisma from "@/lib/prisma/client";
import { successResponse, errorResponse } from "@/lib/api/response";
import { snap, generateOrderId } from "@/lib/midtrans/client";
import { createClient } from "@/lib/supabase/server";
import type { Decimal } from "@prisma/client/runtime/library";

interface BookedTicketWithType {
    ticketTypeId: string;
    unitPrice: Decimal;
    ticketType: {
        name: string;
    };
}

export async function POST(request: NextRequest) {
    try {
        const { bookingId } = await request.json();

        if (!bookingId) {
            return errorResponse("Booking ID is required", 400);
        }

        const booking = await prisma.booking.findUnique({
            where: { id: bookingId },
            include: {
                event: {
                    select: {
                        title: true,
                        slug: true,
                    },
                },
                user: {
                    select: {
                        name: true,
                        email: true,
                        phone: true,
                    },
                },
                bookedTickets: {
                    include: {
                        ticketType: {
                            select: { name: true },
                        },
                    },
                },
            },
        });

        if (!booking) {
            return errorResponse("Booking not found", 404);
        }

        const supabase = await createClient();
        const { data: { user } } = await supabase.auth.getUser();
        
        if (booking.userId) {
            if (user) {
                const dbUser = await prisma.user.findUnique({
                    where: { email: user.email! },
                    select: { id: true },
                });
                
                if (!dbUser || booking.userId !== dbUser.id) {
                    return errorResponse("Unauthorized - you don't own this booking", 403);
                }
            } else {
                return errorResponse("Unauthorized", 403);
            }
        } else if (booking.guestEmail) {
            if (user && user.email !== booking.guestEmail) {
                return errorResponse("Unauthorized - booking email mismatch", 403);
            }
        }

        if (booking.paymentStatus === "PAID") {
            return errorResponse("Booking already paid", 400);
        }

        if (booking.expiresAt && new Date() > booking.expiresAt) {
            return errorResponse("Booking has expired", 400);
        }

        const customerDetails = {
            first_name: booking.guestName || booking.user?.name || "Guest",
            email: booking.guestEmail || booking.user?.email || user?.email || "",
            phone: booking.guestPhone || booking.user?.phone || "",
        };

        const itemDetails = booking.bookedTickets.map((ticket: BookedTicketWithType) => ({
            id: ticket.ticketTypeId,
            name: ticket.ticketType.name,
            price: Number(ticket.unitPrice),
            quantity: 1,
        }));

        if (Number(booking.platformFee) > 0) {
            itemDetails.push({
                id: "platform-fee",
                name: "Platform Fee",
                price: Number(booking.platformFee),
                quantity: 1,
            });
        }

        if (Number(booking.taxAmount) > 0) {
            itemDetails.push({
                id: "tax",
                name: "PPN 11%",
                price: Number(booking.taxAmount),
                quantity: 1,
            });
        }

        const orderId = generateOrderId(booking.bookingCode);

        const parameter = {
            transaction_details: {
                order_id: orderId,
                gross_amount: Number(booking.totalAmount),
            },
            item_details: itemDetails,
            customer_details: customerDetails,
            callbacks: {
                finish: `${process.env.NEXT_PUBLIC_APP_URL}/checkout/success?booking=${booking.bookingCode}`,
                error: `${process.env.NEXT_PUBLIC_APP_URL}/checkout/failed?booking=${booking.bookingCode}`,
                pending: `${process.env.NEXT_PUBLIC_APP_URL}/checkout/pending?booking=${booking.bookingCode}`,
            },
            expiry: {
                unit: "minutes",
                duration: 30,
            },
        };

        const snapTransaction = await snap.createTransaction(parameter);

        await prisma.transaction.create({
            data: {
                bookingId: booking.id,
                transactionCode: orderId,
                paymentGateway: "MIDTRANS",
                paymentMethod: "SNAP",
                amount: booking.totalAmount,
                status: "PENDING",
                expiresAt: new Date(Date.now() + 30 * 60 * 1000),
            },
        });

        await prisma.booking.update({
            where: { id: booking.id },
            data: {
                status: "AWAITING_PAYMENT",
            },
        });

        return successResponse({
            token: snapTransaction.token,
            redirectUrl: snapTransaction.redirect_url,
            orderId,
        });
    } catch (error) {
        console.error("Error creating payment:", error);
        return errorResponse("Failed to create payment", 500);
    }
}
