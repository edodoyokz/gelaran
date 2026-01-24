// Common type definitions for Gelaran

// ===========================================
// USER TYPES
// ===========================================

export type UserRole = "super_admin" | "admin" | "organizer" | "customer" | "scanner";

export interface User {
    id: string;
    name: string;
    email: string;
    phone?: string;
    role: UserRole;
    avatarUrl?: string;
    isVerified: boolean;
    locale: string;
    timezone: string;
    createdAt: Date;
    updatedAt: Date;
}

export interface OrganizerProfile {
    id: string;
    userId: string;
    organizationName: string;
    organizationSlug: string;
    organizationLogo?: string;
    organizationBanner?: string;
    organizationDescription?: string;
    websiteUrl?: string;
    socialFacebook?: string;
    socialInstagram?: string;
    socialTwitter?: string;
    walletBalance: number;
    totalEarned: number;
    totalWithdrawn: number;
    isVerified: boolean;
    verificationStatus: "pending" | "approved" | "rejected";
}

// ===========================================
// EVENT TYPES
// ===========================================

export type EventType = "offline" | "online" | "hybrid";
export type EventStatus = "draft" | "pending_review" | "published" | "cancelled" | "ended";
export type EventVisibility = "public" | "private" | "password_protected";

export interface Category {
    id: string;
    name: string;
    slug: string;
    icon?: string;
    colorHex?: string;
    sortOrder: number;
    isActive: boolean;
}

export interface Venue {
    id: string;
    name: string;
    slug: string;
    address: string;
    city: string;
    province: string;
    postalCode?: string;
    country: string;
    latitude?: number;
    longitude?: number;
    capacity?: number;
    imageUrl?: string;
}

export interface Event {
    id: string;
    organizerId: string;
    categoryId: string;
    venueId?: string;
    title: string;
    slug: string;
    shortDescription?: string;
    description?: string;
    posterImage?: string;
    bannerImage?: string;
    trailerVideoUrl?: string;
    eventType: EventType;
    status: EventStatus;
    visibility: EventVisibility;
    isFeatured: boolean;
    hasSeatingChart: boolean;
    minTicketsPerOrder: number;
    maxTicketsPerOrder: number;
    onlineMeetingUrl?: string;
    termsAndConditions?: string;
    refundPolicy?: string;
    viewCount: number;
    publishAt?: Date;
    createdAt: Date;
    updatedAt: Date;

    // Relations (optional)
    organizer?: OrganizerProfile;
    category?: Category;
    venue?: Venue;
    ticketTypes?: TicketType[];
    schedules?: EventSchedule[];
}

export interface EventSchedule {
    id: string;
    eventId: string;
    title?: string;
    scheduleDate: Date;
    startTime: string;
    endTime: string;
    description?: string;
    sortOrder: number;
    isActive: boolean;
}

// ===========================================
// TICKET TYPES
// ===========================================

export interface TicketType {
    id: string;
    eventId: string;
    name: string;
    description?: string;
    basePrice: number;
    currency: string;
    totalQuantity: number;
    soldQuantity: number;
    reservedQuantity: number;
    minPerOrder: number;
    maxPerOrder: number;
    isFree: boolean;
    isHidden: boolean;
    requiresAttendeeInfo: boolean;
    isTransferable: boolean;
    saleStartAt?: Date;
    saleEndAt?: Date;
    sortOrder: number;
    isActive: boolean;
}

export interface TicketPriceTier {
    id: string;
    ticketTypeId: string;
    name: string;
    price: number;
    quantityLimit?: number;
    soldQuantity: number;
    startAt: Date;
    endAt: Date;
    sortOrder: number;
    isActive: boolean;
}

// ===========================================
// BOOKING TYPES
// ===========================================

export type BookingStatus =
    | "pending"
    | "awaiting_payment"
    | "paid"
    | "confirmed"
    | "cancelled"
    | "refunded"
    | "expired";

export type PaymentStatus = "unpaid" | "paid" | "partial_refund" | "full_refund";

export interface Booking {
    id: string;
    bookingCode: string;
    userId?: string;
    eventId: string;
    eventScheduleId?: string;
    guestEmail?: string;
    guestName?: string;
    guestPhone?: string;
    totalTickets: number;
    subtotal: number;
    discountAmount: number;
    taxAmount: number;
    platformFee: number;
    paymentGatewayFee: number;
    totalAmount: number;
    organizerRevenue: number;
    platformRevenue: number;
    status: BookingStatus;
    paymentStatus: PaymentStatus;
    expiresAt?: Date;
    paidAt?: Date;
    confirmedAt?: Date;
    createdAt: Date;
    updatedAt: Date;

    // Relations
    event?: Event;
    bookedTickets?: BookedTicket[];
    transaction?: Transaction;
}

export interface BookedTicket {
    id: string;
    bookingId: string;
    ticketTypeId: string;
    ticketPriceTierId?: string;
    seatId?: string;
    uniqueCode: string;
    qrCodeUrl?: string;
    unitPrice: number;
    taxAmount: number;
    finalPrice: number;
    isCheckedIn: boolean;
    checkedInAt?: Date;
    status: "active" | "transferred" | "cancelled" | "refunded";

    // Relations
    ticketType?: TicketType;
}

// ===========================================
// TRANSACTION TYPES
// ===========================================

export type TransactionStatus =
    | "pending"
    | "processing"
    | "success"
    | "failed"
    | "expired"
    | "refunded";

export interface Transaction {
    id: string;
    bookingId: string;
    transactionCode: string;
    paymentGateway: string;
    paymentMethod: string;
    paymentChannel?: string;
    amount: number;
    currency: string;
    status: TransactionStatus;
    gatewayTransactionId?: string;
    failureReason?: string;
    paidAt?: Date;
    expiresAt?: Date;
    createdAt: Date;
    updatedAt: Date;
}

// ===========================================
// API RESPONSE TYPES
// ===========================================

export interface ApiResponse<T> {
    success: boolean;
    data?: T;
    error?: {
        code: number;
        message: string;
        details?: Record<string, unknown>;
    };
    meta?: {
        page: number;
        limit: number;
        total: number;
        totalPages: number;
    };
    requestId?: string;
}

export interface PaginationParams {
    page?: number;
    limit?: number;
}
