import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

/**
 * Format number to Indonesian Rupiah currency
 */
export function formatCurrency(
    amount: number,
    options?: {
        showSymbol?: boolean;
        abbreviated?: boolean;
    }
): string {
    const { showSymbol = true, abbreviated = false } = options || {};
    const safeAmount = Number.isFinite(amount) ? amount : 0;

    if (abbreviated) {
        if (safeAmount >= 1_000_000_000) {
            return `${showSymbol ? "Rp " : ""}${(safeAmount / 1_000_000_000).toFixed(1)}M`;
        }
        if (safeAmount >= 1_000_000) {
            return `${showSymbol ? "Rp " : ""}${(safeAmount / 1_000_000).toFixed(1)}Jt`;
        }
        if (safeAmount >= 1_000) {
            return `${showSymbol ? "Rp " : ""}${(safeAmount / 1_000).toFixed(0)}Rb`;
        }
    }

    const formatted = new Intl.NumberFormat("id-ID").format(safeAmount);
    return showSymbol ? `Rp ${formatted}` : formatted;
}

/**
 * Format date to Indonesian locale
 */
export function formatDate(
    date: Date | string,
    options?: {
        includeTime?: boolean;
        format?: "short" | "long" | "full";
    }
): string {
    const { includeTime = false, format = "long" } = options || {};
    const dateObj = typeof date === "string" ? new Date(date) : date;

    const dateOptions: Intl.DateTimeFormatOptions = {
        timeZone: "Asia/Jakarta",
    };

    switch (format) {
        case "short":
            dateOptions.day = "numeric";
            dateOptions.month = "short";
            dateOptions.year = "numeric";
            break;
        case "full":
            dateOptions.weekday = "long";
            dateOptions.day = "numeric";
            dateOptions.month = "long";
            dateOptions.year = "numeric";
            break;
        case "long":
        default:
            dateOptions.day = "numeric";
            dateOptions.month = "long";
            dateOptions.year = "numeric";
            break;
    }

    if (includeTime) {
        dateOptions.hour = "2-digit";
        dateOptions.minute = "2-digit";
    }

    return dateObj.toLocaleDateString("id-ID", dateOptions);
}

/**
 * Format time to Indonesian locale (WIB)
 */
export function formatTime(date: Date | string): string {
    const dateObj = typeof date === "string" ? new Date(date) : date;
    return `${dateObj.toLocaleTimeString("id-ID", {
        hour: "2-digit",
        minute: "2-digit",
        timeZone: "Asia/Jakarta",
    })} WIB`;
}

/**
 * Generate a random booking code
 */
export function generateBookingCode(): string {
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    let result = "BSC-";
    for (let i = 0; i < 8; i++) {
        result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
}

/**
 * Sleep for a specified number of milliseconds
 */
export function sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
}
