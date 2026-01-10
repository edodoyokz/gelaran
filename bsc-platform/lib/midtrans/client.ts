// lib/midtrans/client.ts
// Midtrans payment gateway configuration

import midtransClient from "midtrans-client";

// Sandbox/Production switch
const isProduction = process.env.MIDTRANS_IS_PRODUCTION === "true";

// Snap client for frontend payment popup
export const snap = new midtransClient.Snap({
    isProduction,
    serverKey: process.env.MIDTRANS_SERVER_KEY!,
    clientKey: process.env.NEXT_PUBLIC_MIDTRANS_CLIENT_KEY!,
});

// Core API client for backend operations
export const coreApi = new midtransClient.CoreApi({
    isProduction,
    serverKey: process.env.MIDTRANS_SERVER_KEY!,
    clientKey: process.env.NEXT_PUBLIC_MIDTRANS_CLIENT_KEY!,
});

// Generate unique order ID
export function generateOrderId(bookingCode: string): string {
    const timestamp = Date.now();
    return `BSC-${bookingCode}-${timestamp}`;
}

// Midtrans transaction status mapping
export function mapTransactionStatus(status: string) {
    switch (status) {
        case "capture":
        case "settlement":
            return "SUCCESS";
        case "pending":
            return "PENDING";
        case "deny":
        case "cancel":
            return "FAILED";
        case "expire":
            return "EXPIRED";
        case "refund":
        case "partial_refund":
            return "REFUNDED";
        default:
            return "PENDING";
    }
}
