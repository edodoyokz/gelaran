// lib/email/send.ts
// Email sending functions

import { resend, FROM_EMAIL } from "./client";
import { bookingConfirmationHtml, bookingConfirmationText } from "./templates";
import prisma from "@/lib/prisma/client";
import { formatCurrency, formatDate } from "@/lib/utils";

export async function sendBookingConfirmationEmail(bookingId: string) {
    try {
        const booking = await prisma.booking.findUnique({
            where: { id: bookingId },
            include: {
                event: {
                    include: {
                        venue: true,
                        schedules: { take: 1, orderBy: { scheduleDate: "asc" } },
                    },
                },
                user: { select: { name: true, email: true } },
                bookedTickets: {
                    include: {
                        ticketType: { select: { name: true } },
                    },
                },
            },
        });

        if (!booking) {
            console.error("Booking not found for email:", bookingId);
            return { success: false, error: "Booking not found" };
        }

        const recipientEmail = booking.user?.email || booking.guestEmail;
        const recipientName = booking.user?.name || booking.guestName || "Customer";

        if (!recipientEmail) {
            console.error("No email address for booking:", bookingId);
            return { success: false, error: "No email address" };
        }

        const schedule = booking.event.schedules[0];
        const eventDate = schedule
            ? formatDate(schedule.scheduleDate.toString())
            : "TBA";
        const eventTime = schedule
            ? new Date(schedule.startTime).toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" })
            : "TBA";
        const eventLocation = booking.event.eventType === "ONLINE"
            ? "Online Event"
            : booking.event.venue
                ? `${booking.event.venue.name}, ${booking.event.venue.city}`
                : "TBA";

        const emailData = {
            customerName: recipientName,
            eventTitle: booking.event.title,
            eventDate,
            eventTime,
            eventLocation,
            bookingCode: booking.bookingCode,
            tickets: booking.bookedTickets.map((t) => ({
                name: t.ticketType.name,
                uniqueCode: t.uniqueCode,
            })),
            totalAmount: formatCurrency(Number(booking.totalAmount)),
        };

        const { data, error } = await resend.emails.send({
            from: FROM_EMAIL,
            to: recipientEmail,
            subject: `✅ Booking Confirmed - ${booking.event.title}`,
            html: bookingConfirmationHtml(emailData),
            text: bookingConfirmationText(emailData),
        });

        if (error) {
            console.error("Resend error:", error);
            return { success: false, error: error.message };
        }

        console.log("Email sent:", data?.id);
        return { success: true, emailId: data?.id };
    } catch (error) {
        console.error("Send email error:", error);
        return { success: false, error: "Failed to send email" };
    }
}
