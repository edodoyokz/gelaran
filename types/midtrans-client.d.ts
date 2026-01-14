// Type declarations for midtrans-client
declare module "midtrans-client" {
    interface MidtransConfig {
        isProduction?: boolean;
        serverKey: string;
        clientKey: string;
    }

    interface TransactionDetails {
        order_id: string;
        gross_amount: number;
    }

    interface ItemDetails {
        id: string;
        name: string;
        price: number;
        quantity: number;
        merchant_name?: string;
    }

    interface CustomerDetails {
        first_name?: string;
        last_name?: string;
        email?: string;
        phone?: string;
        billing_address?: object;
        shipping_address?: object;
    }

    interface SnapTransactionOptions {
        transaction_details: TransactionDetails;
        item_details?: ItemDetails[];
        customer_details?: CustomerDetails;
        credit_card?: object;
        callbacks?: {
            finish?: string;
            error?: string;
            pending?: string;
        };
        expiry?: {
            unit: string;
            duration: number;
        };
        custom_field1?: string;
        custom_field2?: string;
        custom_field3?: string;
    }

    interface SnapTransaction {
        token: string;
        redirect_url: string;
    }

    class Snap {
        constructor(config: MidtransConfig);
        createTransaction(options: SnapTransactionOptions): Promise<SnapTransaction>;
        createTransactionToken(options: SnapTransactionOptions): Promise<string>;
    }

    class CoreApi {
        constructor(config: MidtransConfig);
        charge(parameter: object): Promise<object>;
        capture(parameter: object): Promise<object>;
        cardToken(parameter: object): Promise<object>;
        transaction: {
            status(transactionId: string): Promise<object>;
            statusb2b(transactionId: string): Promise<object>;
            cancel(transactionId: string): Promise<object>;
            expire(transactionId: string): Promise<object>;
            refund(transactionId: string, parameter?: object): Promise<object>;
            refundDirect(transactionId: string, parameter?: object): Promise<object>;
            deny(transactionId: string): Promise<object>;
        };
    }

    const _exports: {
        Snap: typeof Snap;
        CoreApi: typeof CoreApi;
    };

    export default _exports;
}
