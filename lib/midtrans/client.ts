// lib/midtrans/client.ts
// Midtrans payment gateway configuration

import midtransClient from "midtrans-client";
import { getServerEnv } from "@/lib/env";

function getPaymentCredentials() {
    const env = getServerEnv();

    if (!env.NEXT_PUBLIC_PAYMENTS_ENABLED) {
        throw new Error("Payments are disabled for the current stage");
    }

    if (!env.MIDTRANS_SERVER_KEY || !env.NEXT_PUBLIC_MIDTRANS_CLIENT_KEY) {
        throw new Error("Midtrans configuration is incomplete");
    }

    return {
        serverKey: env.MIDTRANS_SERVER_KEY,
        clientKey: env.NEXT_PUBLIC_MIDTRANS_CLIENT_KEY,
    };
}

export function getSnap() {
    const env = getServerEnv();
    const { serverKey, clientKey } = getPaymentCredentials();

    return new midtransClient.Snap({
        isProduction: env.MIDTRANS_IS_PRODUCTION,
        serverKey,
        clientKey,
    });
}

export function getCoreApi() {
    const env = getServerEnv();
    const { serverKey, clientKey } = getPaymentCredentials();

    return new midtransClient.CoreApi({
        isProduction: env.MIDTRANS_IS_PRODUCTION,
        serverKey,
        clientKey,
    });
}

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
