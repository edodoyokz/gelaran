import { Prisma, type PrismaClient } from "@prisma/client";

type BaseAuditEntry = {
  action: string;
  entityType: string;
  entityId: string;
  oldValues?: unknown;
  newValues?: unknown;
  userId?: string | null;
  ipAddress?: string | null;
  userAgent?: string | null;
};

type PaymentOrderCreatedAuditInput = {
  transactionId: string;
  bookingId: string;
  transactionCode: string;
  paymentMethod: string;
  amount: number;
  mode: "created" | "reused" | "repaired";
};

type PaymentStatusChangedAuditInput = {
  transactionId: string;
  bookingId: string;
  transactionCode: string;
  fromStatus: string;
  toStatus: string;
  gatewayTransactionId?: string | null;
  reason: string;
};

type PaymentWebhookIgnoredAuditInput = {
  transactionId: string;
  bookingId: string;
  transactionCode: string;
  status: string;
  reason: string;
};

type PaymentRecoveryAppliedAuditInput = {
  transactionId: string;
  bookingId: string;
  transactionCode: string;
  recoveryType: string;
  fromStatus: string;
  toStatus: string;
};

export function createPaymentOrderCreatedAudit(input: PaymentOrderCreatedAuditInput): BaseAuditEntry {
  return {
    action: "PAYMENT_ORDER_CREATED",
    entityType: "Booking",
    entityId: input.bookingId,
    newValues: {
      transactionId: input.transactionId,
      transactionCode: input.transactionCode,
      paymentMethod: input.paymentMethod,
      amount: input.amount,
      mode: input.mode,
    },
  };
}

export function createPaymentStatusChangedAudit(input: PaymentStatusChangedAuditInput): BaseAuditEntry {
  return {
    action: "PAYMENT_STATUS_CHANGED",
    entityType: "Booking",
    entityId: input.bookingId,
    oldValues: {
      transactionId: input.transactionId,
      status: input.fromStatus,
    },
    newValues: {
      transactionCode: input.transactionCode,
      status: input.toStatus,
      gatewayTransactionId: input.gatewayTransactionId,
      reason: input.reason,
    },
  };
}

export function createPaymentWebhookIgnoredAudit(
  input: PaymentWebhookIgnoredAuditInput,
): BaseAuditEntry {
  return {
    action: "PAYMENT_WEBHOOK_IGNORED",
    entityType: "Booking",
    entityId: input.bookingId,
    newValues: {
      transactionId: input.transactionId,
      transactionCode: input.transactionCode,
      status: input.status,
      reason: input.reason,
    },
  };
}

export function createPaymentRecoveryAppliedAudit(
  input: PaymentRecoveryAppliedAuditInput,
): BaseAuditEntry {
  return {
    action: "PAYMENT_RECOVERY_APPLIED",
    entityType: "Booking",
    entityId: input.bookingId,
    oldValues: {
      transactionId: input.transactionId,
      status: input.fromStatus,
    },
    newValues: {
      transactionCode: input.transactionCode,
      recoveryType: input.recoveryType,
      status: input.toStatus,
    },
  };
}

export class AuditLogger {
  constructor(private prisma: PrismaClient) {}

  async log(entry: BaseAuditEntry): Promise<void> {
    try {
      await this.prisma.auditLog.create({
        data: {
          action: entry.action,
          userId: entry.userId,
          entityType: entry.entityType,
          entityId: entry.entityId,
          oldValues: (entry.oldValues ?? Prisma.JsonNull) as Prisma.InputJsonValue,
          newValues: (entry.newValues ?? Prisma.JsonNull) as Prisma.InputJsonValue,
          ipAddress: entry.ipAddress,
          userAgent: entry.userAgent,
        },
      });
    } catch (error) {
      console.error("Failed to write audit log:", error);
    }
  }

  async logPaymentOrderCreated(input: PaymentOrderCreatedAuditInput & { userId?: string | null; ipAddress?: string | null; userAgent?: string | null }) {
    await this.log({
      ...createPaymentOrderCreatedAudit(input),
      userId: input.userId,
      ipAddress: input.ipAddress,
      userAgent: input.userAgent,
    });
  }

  async logPaymentStatusChanged(input: PaymentStatusChangedAuditInput & { userId?: string | null; ipAddress?: string | null; userAgent?: string | null }) {
    await this.log({
      ...createPaymentStatusChangedAudit(input),
      userId: input.userId,
      ipAddress: input.ipAddress,
      userAgent: input.userAgent,
    });
  }

  async logPaymentWebhookIgnored(input: PaymentWebhookIgnoredAuditInput & { userId?: string | null; ipAddress?: string | null; userAgent?: string | null }) {
    await this.log({
      ...createPaymentWebhookIgnoredAudit(input),
      userId: input.userId,
      ipAddress: input.ipAddress,
      userAgent: input.userAgent,
    });
  }

  async logPaymentRecoveryApplied(input: PaymentRecoveryAppliedAuditInput & { userId?: string | null; ipAddress?: string | null; userAgent?: string | null }) {
    await this.log({
      ...createPaymentRecoveryAppliedAudit(input),
      userId: input.userId,
      ipAddress: input.ipAddress,
      userAgent: input.userAgent,
    });
  }
}

export function createAuditLogger(prisma: PrismaClient) {
  return new AuditLogger(prisma);
}
