/* eslint-disable @typescript-eslint/no-namespace */
// Prisma-compatible types for Vercel deployment
// These types mirror @prisma/client types but work without prisma generate

export type UserRole = "SUPER_ADMIN" | "ADMIN" | "ORGANIZER" | "CUSTOMER" | "SCANNER";
export type Gender = "MALE" | "FEMALE" | "OTHER" | "PREFER_NOT_TO_SAY";
export type BookingStatus = "PENDING" | "AWAITING_PAYMENT" | "PAID" | "CONFIRMED" | "CANCELLED" | "REFUNDED" | "EXPIRED";
export type EventStatus = "DRAFT" | "PENDING_REVIEW" | "PUBLISHED" | "CANCELLED" | "ENDED";

export interface PrismaUser {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  passwordHash: string | null;
  role: UserRole;
  isVerified: boolean;
  isActive: boolean;
  avatarUrl: string | null;
  locale: string;
  timezone: string;
  emailVerifiedAt: Date | null;
  lastLoginAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | null;
  gender?: Gender | null;
  birthDate?: Date | null;
}

export interface PrismaEvent {
  id: string;
  organizerId: string;
  categoryId: string;
  venueId: string | null;
  title: string;
  slug: string;
  shortDescription: string | null;
  description: string | null;
  posterImage: string | null;
  bannerImage: string | null;
  eventType: string;
  status: EventStatus;
  visibility: string;
  isFeatured: boolean;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | null;
}

// Re-export as User/Event for compatibility
export type User = PrismaUser;
export type Event = PrismaEvent;

// Prisma namespace mock for type compatibility
export namespace Prisma {
  export type VenueWhereInput = Record<string, unknown>;
  export type BookingWhereInput = Record<string, unknown>;
  export type JsonValue = string | number | boolean | null | JsonValue[] | { [key: string]: JsonValue };
}

// Transaction client type - used for prisma.$transaction(async (tx) => {...})
export type PrismaTransactionClient = Omit<typeof import("@/lib/prisma/client").default, "$connect" | "$disconnect" | "$on" | "$transaction" | "$use" | "$extends">;
