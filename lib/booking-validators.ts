// Booking Validators for Duplicate Prevention and Eligibility Checks

import type { PrismaClient } from "@prisma/client";
import { findComplimentarySubmissionConflict, normalizeGuestEmail } from "./complimentary-flow";

interface BookingLimitConfig {
  maxBookingsPerUserPerDay: number;
  maxBookingsPerUserPerWeek: number;
  maxBookingsPerEventPerUser: number;
  bookingCooldownMinutes: number;
}

const DEFAULT_LIMITS: BookingLimitConfig = {
  maxBookingsPerUserPerDay: 5,
  maxBookingsPerUserPerWeek: 15,
  maxBookingsPerEventPerUser: 3,
  bookingCooldownMinutes: 5,
};

export interface BookingValidationError {
  valid: false;
  reason: string;
  code: string;
}

export interface BookingValidationSuccess {
  valid: true;
}

export type BookingValidationResult = BookingValidationSuccess | BookingValidationError;

export class BookingValidators {
  private limits: BookingLimitConfig;

  constructor(limits?: Partial<BookingLimitConfig>) {
    this.limits = { ...DEFAULT_LIMITS, ...limits };
  }

  async validateUserBookingLimits(
    prisma: PrismaClient,
    userId: string | null,
    guestEmail: string | null,
    eventId: string
  ): Promise<BookingValidationResult> {
    // Get user or guest identifier
    const identifier = userId || guestEmail;

    if (!identifier) {
      return {
        valid: false,
        reason: "User or guest email required",
        code: "NO_USER_IDENTIFIER",
      };
    }

    const now = new Date();
    const dayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

    // Check daily limit
    const dailyCount = await prisma.booking.count({
      where: {
        OR: [{ userId }, { guestEmail }],
        status: { notIn: ["CANCELLED", "REFUNDED", "EXPIRED"] },
        createdAt: { gte: dayAgo },
      },
    });

    if (dailyCount >= this.limits.maxBookingsPerUserPerDay) {
      return {
        valid: false,
        reason: `Daily booking limit reached (${this.limits.maxBookingsPerUserPerDay} per day)`,
        code: "DAILY_LIMIT_EXCEEDED",
      };
    }

    // Check weekly limit
    const weeklyCount = await prisma.booking.count({
      where: {
        OR: [{ userId }, { guestEmail }],
        status: { notIn: ["CANCELLED", "REFUNDED", "EXPIRED"] },
        createdAt: { gte: weekAgo },
      },
    });

    if (weeklyCount >= this.limits.maxBookingsPerUserPerWeek) {
      return {
        valid: false,
        reason: `Weekly booking limit reached (${this.limits.maxBookingsPerUserPerWeek} per week)`,
        code: "WEEKLY_LIMIT_EXCEEDED",
      };
    }

    // Check event-specific limit
    const eventCount = await prisma.booking.count({
      where: {
        OR: [{ userId }, { guestEmail }],
        eventId,
        status: { notIn: ["CANCELLED", "REFUNDED", "EXPIRED"] },
      },
    });

    if (eventCount >= this.limits.maxBookingsPerEventPerUser) {
      return {
        valid: false,
        reason: `Event booking limit reached (${this.limits.maxBookingsPerEventPerUser} per event)`,
        code: "EVENT_LIMIT_EXCEEDED",
      };
    }

    return { valid: true };
  }

  async validateBookingCooldown(
    prisma: PrismaClient,
    userId: string | null,
    guestEmail: string | null
  ): Promise<BookingValidationResult> {
    const identifier = userId || guestEmail;

    if (!identifier) {
      return { valid: true };
    }

    const cooldownEnd = new Date(Date.now() - this.limits.bookingCooldownMinutes * 60 * 1000);

    const recentBooking = await prisma.booking.findFirst({
      where: {
        OR: [{ userId }, { guestEmail }],
        createdAt: { gte: cooldownEnd },
      },
      orderBy: { createdAt: "desc" },
    });

    if (recentBooking) {
      const minutesSinceLastBooking = Math.floor(
        (Date.now() - recentBooking.createdAt.getTime()) / (60 * 1000)
      );
      const remainingCooldown = this.limits.bookingCooldownMinutes - minutesSinceLastBooking;

      return {
        valid: false,
        reason: `Please wait ${remainingCooldown} minutes before making another booking`,
        code: "BOOKING_COOLDOWN",
      };
    }

    return { valid: true };
  }

  async validateDuplicateBooking(
    prisma: PrismaClient,
    userId: string | null,
    guestEmail: string | null,
    eventId: string,
    eventScheduleId?: string | null,
    tickets?: Array<{ ticketTypeId: string; quantity: number }>,
    seatIds?: string[]
  ): Promise<BookingValidationResult> {
    const identifier = userId || guestEmail;

    if (!identifier) {
      return { valid: true };
    }

    // Check for duplicate booking with same details
    const duplicateBooking = await prisma.booking.findFirst({
      where: {
        OR: [{ userId }, { guestEmail }],
        eventId,
        status: { notIn: ["CANCELLED", "REFUNDED", "EXPIRED"] },
      },
      select: {
        id: true,
        bookedTickets: {
          select: {
            ticketTypeId: true,
            seatId: true,
            status: true,
          },
        },
      },
    });

    if (!duplicateBooking) {
      return { valid: true };
    }

    // Check if booking has same tickets
    const hasSameTickets = tickets?.some((ticket) =>
      duplicateBooking.bookedTickets.some(
        (bt) => bt.ticketTypeId === ticket.ticketTypeId && bt.status === "ACTIVE"
      )
    );

    // Check if booking has same seats
    const hasSameSeats = seatIds?.some((seatId) =>
      duplicateBooking.bookedTickets.some((bt) => bt.seatId === seatId && bt.status === "ACTIVE")
    );

    if (hasSameTickets || hasSameSeats) {
      return {
        valid: false,
        reason: "You already have an active booking for this event with the same tickets/seats",
        code: "DUPLICATE_BOOKING",
      };
    }

    return { valid: true };
  }

  async validateEventAvailability(
    prisma: PrismaClient,
    eventId: string,
    ticketTypeId?: string,
    quantity: number = 1
  ): Promise<BookingValidationResult> {
    const event = await prisma.event.findUnique({
      where: { id: eventId, status: "PUBLISHED", deletedAt: null },
      include: {
        ticketTypes: {
          where: { isActive: true },
        },
      },
    });

    if (!event) {
      return {
        valid: false,
        reason: "Event not found or not available",
        code: "EVENT_NOT_FOUND",
      };
    }

    if (ticketTypeId) {
      const ticketType = event.ticketTypes.find((t) => t.id === ticketTypeId);

      if (!ticketType) {
        return {
          valid: false,
          reason: "Ticket type not found",
          code: "TICKET_TYPE_NOT_FOUND",
        };
      }

      const available = ticketType.totalQuantity - ticketType.soldQuantity - ticketType.reservedQuantity;

      if (quantity > available) {
        return {
          valid: false,
          reason: `Only ${available} tickets available for ${ticketType.name}`,
          code: "INSUFFICIENT_TICKETS",
        };
      }
    }

    return { valid: true };
  }

  async validateComplimentaryBookingEligibility(
    prisma: PrismaClient,
    userId: string | null,
    guestEmail: string | null,
    eventId: string,
    totalAmount: number
  ): Promise<BookingValidationResult> {
    if (totalAmount !== 0) {
      return { valid: true };
    }

    const event = await prisma.event.findUnique({
      where: { id: eventId },
      select: { id: true },
    });

    if (!event) {
      return {
        valid: false,
        reason: "Event not found",
        code: "EVENT_NOT_FOUND",
      };
    }

    if (!guestEmail && !userId) {
      return {
        valid: false,
        reason: "Email is required for complimentary bookings",
        code: "GUEST_EMAIL_REQUIRED",
      };
    }

    if (guestEmail) {
      const conflict = await findComplimentarySubmissionConflict(prisma, {
        eventId,
        guestEmail: normalizeGuestEmail(guestEmail),
      });

      if (conflict) {
        return {
          valid: false,
          reason: conflict.message,
          code: conflict.code,
        };
      }
    }

    return { valid: true };
  }

  async validateBookingPrerequisites(
    prisma: PrismaClient,
    userId: string | null,
    guestEmail: string | null,
    guestName: string | null,
    _guestPhone: string | null
  ): Promise<BookingValidationResult> {
    // For authenticated users, no guest info needed
    if (userId) {
      return { valid: true };
    }

    // For guest bookings, require email and name
    if (!guestEmail) {
      return {
        valid: false,
        reason: "Email is required for guest bookings",
        code: "GUEST_EMAIL_REQUIRED",
      };
    }

    if (!guestName) {
      return {
        valid: false,
        reason: "Name is required for guest bookings",
        code: "GUEST_NAME_REQUIRED",
      };
    }

    return { valid: true };
  }

  async validateAll(
    prisma: PrismaClient,
    bookingDetails: {
      userId?: string | null;
      guestEmail?: string | null;
      guestName?: string | null;
      guestPhone?: string | null;
      eventId: string;
      eventScheduleId?: string | null;
      totalAmount: number;
      tickets?: Array<{ ticketTypeId: string; quantity: number }>;
      seatIds?: string[];
    }
  ): Promise<BookingValidationResult> {
    // Validate prerequisites
    const prerequisiteCheck = await this.validateBookingPrerequisites(
      prisma,
      bookingDetails.userId || null,
      bookingDetails.guestEmail || null,
      bookingDetails.guestName || null,
      bookingDetails.guestPhone || null
    );

    if (!prerequisiteCheck.valid) {
      return prerequisiteCheck;
    }

    // Validate user booking limits
    const limitCheck = await this.validateUserBookingLimits(
      prisma,
      bookingDetails.userId || null,
      bookingDetails.guestEmail || null,
      bookingDetails.eventId
    );

    if (!limitCheck.valid) {
      return limitCheck;
    }

    // Validate booking cooldown
    const cooldownCheck = await this.validateBookingCooldown(
      prisma,
      bookingDetails.userId || null,
      bookingDetails.guestEmail || null
    );

    if (!cooldownCheck.valid) {
      return cooldownCheck;
    }

    // Validate duplicate booking
    const duplicateCheck = await this.validateDuplicateBooking(
      prisma,
      bookingDetails.userId || null,
      bookingDetails.guestEmail || null,
      bookingDetails.eventId,
      bookingDetails.eventScheduleId,
      bookingDetails.tickets,
      bookingDetails.seatIds
    );

    if (!duplicateCheck.valid) {
      return duplicateCheck;
    }

    // Validate complimentary eligibility
    const complimentaryCheck = await this.validateComplimentaryBookingEligibility(
      prisma,
      bookingDetails.userId || null,
      bookingDetails.guestEmail || null,
      bookingDetails.eventId,
      bookingDetails.totalAmount
    );

    if (!complimentaryCheck.valid) {
      return complimentaryCheck;
    }

    return { valid: true };
  }
}
