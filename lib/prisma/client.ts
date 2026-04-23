import { PrismaClient } from "@prisma/client";
import { getDatabaseEnv } from "@/lib/env";

const env = getDatabaseEnv();

const globalForPrisma = globalThis as unknown as {
    prisma: PrismaClient | undefined;
};

export const prisma =
    globalForPrisma.prisma ??
    new PrismaClient({
        log: env.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
        datasources: {
            db: {
                url: env.DATABASE_URL,
            },
        },
    });

if (env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;

export default prisma;
