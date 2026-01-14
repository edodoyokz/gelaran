import { type NextRequest } from "next/server";
import prisma from "@/lib/prisma/client";
import { successResponse, errorResponse } from "@/lib/api/response";
import { snap, generateOrderId } from "@/lib/midtrans/client";
import { generateBookingCode } from "@/lib/utils";

interface TicketRequest {
    ticketTypeId: string;
    quantity: number;
}

export async function POST(request: NextRequest) {
    try {
        const deviceToken = request.headers.get("x-device-token");

        if (!deviceToken) {
            return errorResponse("Device token diperlukan", 401);
        }

        const deviceAccess = await prisma.deviceAccess.findUnique({
            where: { deviceToken },
            include: {
                session: {
                    include: {
                        event: {
                            include: {
                                ticketTypes: { where: { isActive: true } },
                            },
                        },
                    },
                },
            },
        });

        if (!deviceAccess || !deviceAccess.isActive) {
            return errorResponse("Akses tidak valid", 401);
        }

        if (deviceAccess.session.sessionType !== "POS") {
            return errorResponse("Device ini tidak memiliki akses POS", 403);
        }

        if (!deviceAccess.session.isActive) {
            return errorResponse("Session POS tidak aktif", 403);
        }

        const body = await request.json();
        const { tickets, buyerName, buyerPhone, buyerEmail, autoCheckIn = false } = body as {
            tickets: TicketRequest[];
            buyerName: string;
            buyerPhone?: string;
            buyerEmail?: string;
            autoCheckIn?: boolean;
        };

        if (!tickets || tickets.length === 0) {
            return errorResponse("Pilih minimal 1 tiket", 400);
        }

        if (!buyerName || buyerName.length < 2) {
            return errorResponse("Nama pembeli diperlukan", 400);
        }

        const event = deviceAccess.session.event;

        let subtotal = 0;
        const ticketDetails: Array<{
            ticketTypeId: string;
            quantity: number;
            unitPrice: number;
            name: string;
        }> = [];

        for (const ticketRequest of tickets) {
            if (ticketRequest.quantity <= 0) continue;

            const ticketType = event.ticketTypes.find((t) => t.id === ticketRequest.ticketTypeId);

            if (!ticketType) {
                return errorResponse(`Tipe tiket tidak ditemukan`, 400);
            }

            const available = ticketType.totalQuantity - ticketType.soldQuantity - ticketType.reservedQuantity;
            if (ticketRequest.quantity > available) {
                return errorResponse(`Hanya tersedia ${available} tiket untuk ${ticketType.name}`, 400);
            }

            if (ticketRequest.quantity > ticketType.maxPerOrder) {
                return errorResponse(`Maksimal ${ticketType.maxPerOrder} tiket untuk ${ticketType.name}`, 400);
            }

            const unitPrice = ticketType.isFree ? 0 : Number(ticketType.basePrice);
            subtotal += unitPrice * ticketRequest.quantity;

            ticketDetails.push({
                ticketTypeId: ticketType.id,
                quantity: ticketRequest.quantity,
                unitPrice,
                name: ticketType.name,
            });
        }

        if (ticketDetails.length === 0) {
            return errorResponse("Pilih minimal 1 tiket", 400);
        }

        const totalTickets = ticketDetails.reduce((sum, t) => sum + t.quantity, 0);

        const platformFeePercent = 0.05;
        const platformFee = Math.round(subtotal * platformFeePercent);
        const taxPercent = 0.11;
        const taxAmount = Math.round(subtotal * taxPercent);
        const totalAmount = subtotal + platformFee + taxAmount;
        const organizerRevenue = subtotal;
        const platformRevenue = platformFee;

        const bookingCode = generateBookingCode();

        const booking = await prisma.$transaction(async (tx) => {
            const newBooking = await tx.booking.create({
                data: {
                    bookingCode,
                    userId: null,
                    eventId: event.id,
                    guestEmail: buyerEmail || null,
                    guestName: buyerName,
                    guestPhone: buyerPhone || null,
                    totalTickets,
                    subtotal,
                    discountAmount: 0,
                    taxAmount,
                    platformFee,
                    paymentGatewayFee: 0,
                    totalAmount,
                    organizerRevenue,
                    platformRevenue,
                    status: totalAmount === 0 ? "CONFIRMED" : "AWAITING_PAYMENT",
                    paymentStatus: totalAmount === 0 ? "PAID" : "UNPAID",
                    salesChannel: "ON_SITE",
                    soldByStaff: deviceAccess.staffName,
                    soldByDevice: deviceAccess.deviceFingerprint,
                    expiresAt: totalAmount === 0 ? null : new Date(Date.now() + 15 * 60 * 1000),
                    paidAt: totalAmount === 0 ? new Date() : null,
                    confirmedAt: totalAmount === 0 ? new Date() : null,
                    ipAddress: request.headers.get("x-forwarded-for") || undefined,
                },
            });

            const createdTickets = [];

            for (const detail of ticketDetails) {
                for (let i = 0; i < detail.quantity; i++) {
                    const uniqueCode = `${bookingCode}-${detail.ticketTypeId.slice(0, 4).toUpperCase()}-${String(i + 1).padStart(3, "0")}`;

                    const ticket = await tx.bookedTicket.create({
                        data: {
                            bookingId: newBooking.id,
                            ticketTypeId: detail.ticketTypeId,
                            uniqueCode,
                            unitPrice: detail.unitPrice,
                            taxAmount: Math.round(detail.unitPrice * taxPercent),
                            finalPrice: detail.unitPrice + Math.round(detail.unitPrice * taxPercent),
                            status: "ACTIVE",
                            isCheckedIn: autoCheckIn && totalAmount === 0,
                            checkedInAt: autoCheckIn && totalAmount === 0 ? new Date() : null,
                        },
                    });

                    createdTickets.push({
                        id: ticket.id,
                        uniqueCode: ticket.uniqueCode,
                        ticketType: detail.name,
                        unitPrice: detail.unitPrice,
                    });
                }

                await tx.ticketType.update({
                    where: { id: detail.ticketTypeId },
                    data: {
                        reservedQuantity: { increment: detail.quantity },
                    },
                });
            }

            return { booking: newBooking, tickets: createdTickets };
        });

        if (totalAmount === 0) {
            for (const detail of ticketDetails) {
                await prisma.ticketType.update({
                    where: { id: detail.ticketTypeId },
                    data: {
                        soldQuantity: { increment: detail.quantity },
                        reservedQuantity: { decrement: detail.quantity },
                    },
                });
            }

            return successResponse({
                bookingCode: booking.booking.bookingCode,
                status: "CONFIRMED",
                totalAmount: 0,
                tickets: booking.tickets,
                message: "Tiket gratis berhasil dibuat",
            });
        }

        const orderId = generateOrderId(bookingCode);

        const itemDetails = ticketDetails.map((detail: { ticketTypeId: string; quantity: number; unitPrice: number; name: string }) => ({
            id: detail.ticketTypeId,
            name: detail.name,
            price: detail.unitPrice,
            quantity: detail.quantity,
        }));

        if (platformFee > 0) {
            itemDetails.push({
                id: "platform-fee",
                name: "Platform Fee",
                price: platformFee,
                quantity: 1,
            });
        }

        if (taxAmount > 0) {
            itemDetails.push({
                id: "tax",
                name: "PPN 11%",
                price: taxAmount,
                quantity: 1,
            });
        }

        const parameter = {
            transaction_details: {
                order_id: orderId,
                gross_amount: totalAmount,
            },
            item_details: itemDetails,
            customer_details: {
                first_name: buyerName,
                email: buyerEmail || "guest@bsc.events",
                phone: buyerPhone || "",
            },
            callbacks: {
                finish: `${process.env.NEXT_PUBLIC_APP_URL}/pos/payment-success?booking=${bookingCode}`,
                error: `${process.env.NEXT_PUBLIC_APP_URL}/pos/payment-failed?booking=${bookingCode}`,
                pending: `${process.env.NEXT_PUBLIC_APP_URL}/pos/payment-pending?booking=${bookingCode}`,
            },
            expiry: {
                unit: "minutes",
                duration: 15,
            },
        };

        const snapTransaction = await snap.createTransaction(parameter);

        await prisma.transaction.create({
            data: {
                bookingId: booking.booking.id,
                transactionCode: orderId,
                paymentGateway: "MIDTRANS",
                paymentMethod: "SNAP_POS",
                amount: totalAmount,
                status: "PENDING",
                expiresAt: new Date(Date.now() + 15 * 60 * 1000),
            },
        });

        return successResponse({
            bookingCode: booking.booking.bookingCode,
            bookingId: booking.booking.id,
            status: "AWAITING_PAYMENT",
            totalAmount,
            paymentToken: snapTransaction.token,
            paymentUrl: snapTransaction.redirect_url,
            orderId,
            tickets: booking.tickets,
            autoCheckIn,
        });
    } catch (error) {
        console.error("POS sell error:", error);
        return errorResponse("Gagal membuat pesanan", 500);
    }
}
