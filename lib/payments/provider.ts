import { getCoreApi, getSnap } from "@/lib/midtrans/client";

type CreateTransactionPayload = Parameters<ReturnType<typeof getSnap>["createTransaction"]>[0];

export interface PaymentProvider {
    createTransaction(payload: CreateTransactionPayload): Promise<{ token: string; redirect_url: string }>;
}

class MidtransPaymentProvider implements PaymentProvider {
    async createTransaction(payload: CreateTransactionPayload) {
        return getSnap().createTransaction(payload);
    }
}

export function createPaymentProvider(): PaymentProvider {
    return new MidtransPaymentProvider();
}

export function getPaymentReconciliationClient() {
    return getCoreApi();
}
