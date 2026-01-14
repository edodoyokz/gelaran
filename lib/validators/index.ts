import { z } from "zod";

// ===========================================
// EVENT VALIDATORS
// ===========================================

// Helper to transform null to undefined (searchParams.get returns null for missing params)
const nullToUndefined = <T extends z.ZodTypeAny>(schema: T) =>
    z.preprocess((val) => (val === null ? undefined : val), schema);

export const eventQuerySchema = z.object({
    page: nullToUndefined(z.coerce.number().min(1).default(1)),
    limit: nullToUndefined(z.coerce.number().min(1).max(50).default(12)),
    category: nullToUndefined(z.string().optional()),
    city: nullToUndefined(z.string().optional()),
    search: nullToUndefined(z.string().optional()),
    eventType: nullToUndefined(z.enum(["OFFLINE", "ONLINE", "HYBRID"]).optional()),
    status: nullToUndefined(z.enum(["PUBLISHED"]).default("PUBLISHED")),
    startDate: nullToUndefined(z.string().datetime().optional()),
    endDate: nullToUndefined(z.string().datetime().optional()),
    isFeatured: nullToUndefined(z.coerce.boolean().optional()),
    sortBy: nullToUndefined(z.enum(["createdAt", "scheduleDate", "title", "price", "viewCount"]).default("createdAt")),
    sortOrder: nullToUndefined(z.enum(["asc", "desc"]).default("desc")),
});

export type EventQueryInput = z.infer<typeof eventQuerySchema>;

// ===========================================
// BOOKING VALIDATORS
// ===========================================

export const createBookingSchema = z.object({
    eventId: z.string().uuid(),
    eventScheduleId: z.string().uuid().optional(),
    tickets: z.array(
        z.object({
            ticketTypeId: z.string().uuid(),
            quantity: z.number().min(1).max(10),
        })
    ).min(1),
    seatIds: z.array(z.string().uuid()).optional(),
    seatSessionId: z.string().uuid().optional(),
    promoCode: z.string().optional(),
    guestEmail: z.string().email().optional(),
    guestName: z.string().min(2).optional(),
    guestPhone: z.string().optional(),
});

export type CreateBookingInput = z.infer<typeof createBookingSchema>;

// ===========================================
// AUTH VALIDATORS
// ===========================================

export const loginSchema = z.object({
    email: z.string().email("Email tidak valid"),
    password: z.string().min(6, "Password minimal 6 karakter"),
});

export const registerSchema = z.object({
    name: z.string().min(2, "Nama minimal 2 karakter"),
    email: z.string().email("Email tidak valid"),
    password: z
        .string()
        .min(8, "Password minimal 8 karakter")
        .regex(/[A-Z]/, "Password harus mengandung huruf besar")
        .regex(/[0-9]/, "Password harus mengandung angka"),
});

// ===========================================
// PROMO CODE VALIDATORS
// ===========================================

export const validatePromoSchema = z.object({
    code: z.string().min(1),
    eventId: z.string().uuid(),
    ticketTypeIds: z.array(z.string().uuid()).optional(),
});

// ===========================================
// REVIEW VALIDATORS
// ===========================================

export const createReviewSchema = z.object({
    eventId: z.string().uuid(),
    bookingId: z.string().uuid(),
    rating: z.number().min(1).max(5),
    reviewText: z.string().max(1000).optional(),
});

// ===========================================
// CREATE EVENT VALIDATORS
// ===========================================

export const ticketTypeSchema = z.object({
    name: z.string().min(1, "Nama tiket wajib diisi"),
    description: z.string().optional(),
    basePrice: z.coerce.number().min(0, "Harga minimal 0"),
    totalQuantity: z.coerce.number().min(1, "Kuota minimal 1"),
    minPerOrder: z.coerce.number().min(1).default(1),
    maxPerOrder: z.coerce.number().min(1).max(10).default(10),
    isFree: z.boolean().default(false),
    isHidden: z.boolean().default(false),
    requiresAttendeeInfo: z.boolean().default(false),
    saleStartAt: z.string().datetime().optional().nullable(),
    saleEndAt: z.string().datetime().optional().nullable(),
});

export const eventScheduleSchema = z.object({
    title: z.string().optional(),
    scheduleDate: z.string().min(1, "Tanggal wajib diisi"),
    startTime: z.string().min(1, "Waktu mulai wajib diisi"),
    endTime: z.string().min(1, "Waktu selesai wajib diisi"),
    description: z.string().optional(),
    locationOverride: z.string().optional(),
});

export const createEventSchema = z.object({
    // Basic Info
    title: z.string().min(5, "Judul minimal 5 karakter").max(200),
    shortDescription: z.string().max(200).optional(),
    description: z.string().min(20, "Deskripsi minimal 20 karakter"),
    categoryId: z.string().uuid("Pilih kategori"),
    eventType: z.enum(["OFFLINE", "ONLINE", "HYBRID"]),
    
    // Venue / Location
    venueId: z.string().uuid().optional().nullable(),
    venueName: z.string().optional(), // For creating new venue
    venueAddress: z.string().optional(),
    venueCity: z.string().optional(),
    venueProvince: z.string().optional(),
    onlineMeetingUrl: z.string().url().optional().nullable(),
    onlineMeetingPassword: z.string().optional().nullable(),
    
    // Media
    posterImage: z.string().url().optional().nullable(),
    bannerImage: z.string().url().optional().nullable(),
    trailerVideoUrl: z.string().url().optional().nullable(),
    
    // Settings
    visibility: z.enum(["PUBLIC", "PRIVATE", "PASSWORD_PROTECTED"]).default("PUBLIC"),
    accessPassword: z.string().optional().nullable(),
    minTicketsPerOrder: z.coerce.number().min(1).default(1),
    maxTicketsPerOrder: z.coerce.number().min(1).max(20).default(10),
    termsAndConditions: z.string().optional(),
    refundPolicy: z.string().optional(),
    
    // SEO
    metaTitle: z.string().max(70).optional(),
    metaDescription: z.string().max(160).optional(),
    
    // Schedules
    schedules: z.array(eventScheduleSchema).min(1, "Minimal 1 jadwal"),
    
    // Tickets
    ticketTypes: z.array(ticketTypeSchema).min(1, "Minimal 1 tipe tiket"),
});

export type CreateEventInput = z.infer<typeof createEventSchema>;
export type TicketTypeInput = z.infer<typeof ticketTypeSchema>;
export type EventScheduleInput = z.infer<typeof eventScheduleSchema>;

// ===========================================
// UPDATE EVENT VALIDATORS
// ===========================================

export const updateEventSchema = createEventSchema.partial().extend({
    status: z.enum(["DRAFT", "PENDING_REVIEW", "PUBLISHED", "CANCELLED"]).optional(),
});

export type UpdateEventInput = z.infer<typeof updateEventSchema>;
