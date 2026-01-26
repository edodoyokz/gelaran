/**
 * Error codes untuk POS seat selection
 * Memberikan error spesifik untuk better UX dan debugging
 */

export enum SeatError {
    /** Seat sudah terbooking oleh user lain */
    ALREADY_BOOKED = 'ALREADY_BOOKED',

    /** Seat sedang dikunci oleh kasir lain (optimistic locking conflict) */
    LOCKED_BY_OTHER = 'LOCKED_BY_OTHER',

    /** Seat tidak tersedia (status bukan AVAILABLE) */
    NOT_AVAILABLE = 'NOT_AVAILABLE',

    /** Seat tidak valid atau tidak ditemukan */
    INVALID_SEAT = 'INVALID_SEAT',

    /** Conflict saat update (optimistic locking) */
    CONFLICT = 'CONFLICT',

    /** Seat tidak ditemukan di database */
    NOT_FOUND = 'NOT_FOUND',

    /** Seat tidak milik event ini */
    INVALID_EVENT = 'INVALID_EVENT',

    /** Seat tidak memiliki ticket type */
    MISSING_TICKET_TYPE = 'MISSING_TICKET_TYPE',
}

export interface SeatErrorResponse {
    error: SeatError;
    message: string;
    seatId?: string;
    seatLabel?: string;
    details?: any;
}

/**
 * Helper function untuk membuat error response dengan format konsisten
 */
export function createSeatErrorResponse(
    error: SeatError,
    message: string,
    seatId?: string,
    seatLabel?: string,
    details?: any
): SeatErrorResponse {
    return {
        error,
        message,
        seatId,
        seatLabel,
        details,
    };
}

/**
 * Mapping error codes ke HTTP status codes
 */
export function getHttpStatusForError(error: SeatError): number {
    switch (error) {
        case SeatError.NOT_FOUND:
        case SeatError.INVALID_SEAT:
            return 404;
        case SeatError.ALREADY_BOOKED:
        case SeatError.LOCKED_BY_OTHER:
        case SeatError.NOT_AVAILABLE:
        case SeatError.CONFLICT:
            return 409;
        case SeatError.INVALID_EVENT:
        case SeatError.MISSING_TICKET_TYPE:
            return 400;
        default:
            return 500;
    }
}
