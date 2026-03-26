import { z } from "zod";

const appStageSchema = z.enum(["local", "beta", "production"]);
const nodeEnvSchema = z.enum(["development", "test", "production"]);
const booleanStringSchema = z.enum(["true", "false"]);
const emptyStringToUndefined = <T extends z.ZodTypeAny>(schema: T) =>
    z.preprocess((value) => {
        if (typeof value === "string" && value.trim() === "") {
            return undefined;
        }

        return value;
    }, schema.optional());

const publicEnvSchema = z.object({
    NODE_ENV: nodeEnvSchema.default("development"),
    NEXT_PUBLIC_APP_STAGE: appStageSchema.default("local"),
    NEXT_PUBLIC_SUPABASE_URL: z.string().url("NEXT_PUBLIC_SUPABASE_URL must be a valid URL"),
    NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string().min(1, "NEXT_PUBLIC_SUPABASE_ANON_KEY is required"),
    NEXT_PUBLIC_APP_URL: z.string().url("NEXT_PUBLIC_APP_URL must be a valid URL"),
    NEXT_PUBLIC_ENABLE_DEMO_PAYMENT: booleanStringSchema.default("false"),
    NEXT_PUBLIC_PAYMENTS_ENABLED: booleanStringSchema.default("false"),
    NEXT_PUBLIC_MIDTRANS_CLIENT_KEY: z.string().min(1).optional(),
    NEXT_PUBLIC_MIDTRANS_SNAP_URL: z.string().url("NEXT_PUBLIC_MIDTRANS_SNAP_URL must be a valid URL").optional(),
});

const serverEnvSchema = publicEnvSchema.extend({
    DATABASE_URL: z.string().min(1, "DATABASE_URL is required"),
    DIRECT_URL: z.string().min(1, "DIRECT_URL is required"),
    SUPABASE_SERVICE_ROLE_KEY: z.string().min(1, "SUPABASE_SERVICE_ROLE_KEY is required"),
    RESEND_API_KEY: z.string().min(1, "RESEND_API_KEY is required"),
    EMAIL_FROM: z.string().min(1, "EMAIL_FROM is required"),
    MIDTRANS_IS_PRODUCTION: booleanStringSchema.default("false"),
    MIDTRANS_SERVER_KEY: z.string().min(1).optional(),
    CRON_SECRET: emptyStringToUndefined(z.string().min(1, "CRON_SECRET cannot be empty")),
    OPS_ALERT_WEBHOOK_URL: emptyStringToUndefined(
        z.string().url("OPS_ALERT_WEBHOOK_URL must be a valid URL")
    ),
});

export type PublicEnvSource = z.input<typeof publicEnvSchema>;
export type ServerEnvSource = z.input<typeof serverEnvSchema>;
type EnvSource = Record<string, string | undefined>;

export type PublicEnv = {
    NODE_ENV: z.infer<typeof nodeEnvSchema>;
    NEXT_PUBLIC_APP_STAGE: z.infer<typeof appStageSchema>;
    NEXT_PUBLIC_SUPABASE_URL: string;
    NEXT_PUBLIC_SUPABASE_ANON_KEY: string;
    NEXT_PUBLIC_APP_URL: string;
    NEXT_PUBLIC_ENABLE_DEMO_PAYMENT: boolean;
    NEXT_PUBLIC_PAYMENTS_ENABLED: boolean;
    NEXT_PUBLIC_MIDTRANS_CLIENT_KEY?: string;
    NEXT_PUBLIC_MIDTRANS_SNAP_URL: string;
};

export type ServerEnv = PublicEnv & {
    DATABASE_URL: string;
    DIRECT_URL: string;
    SUPABASE_SERVICE_ROLE_KEY: string;
    RESEND_API_KEY: string;
    EMAIL_FROM: string;
    MIDTRANS_IS_PRODUCTION: boolean;
    MIDTRANS_SERVER_KEY?: string;
    CRON_SECRET?: string;
    OPS_ALERT_WEBHOOK_URL?: string;
};

let cachedPublicEnv: PublicEnv | undefined;
let cachedServerEnv: ServerEnv | undefined;

function formatZodError(error: z.ZodError) {
    return error.issues
        .map((issue) => {
            const path = issue.path.join(".") || "env";
            return `- ${path}: ${issue.message}`;
        })
        .join("\n");
}

function buildEnvError(message: string) {
    return new Error(`Invalid environment configuration:\n${message}`);
}

function getDefaultMidtransSnapUrl(isProduction: boolean) {
    return isProduction
        ? "https://app.midtrans.com/snap/snap.js"
        : "https://app.sandbox.midtrans.com/snap/snap.js";
}

function validateSharedFlags(env: {
    NEXT_PUBLIC_APP_STAGE: PublicEnv["NEXT_PUBLIC_APP_STAGE"];
    NEXT_PUBLIC_ENABLE_DEMO_PAYMENT: boolean;
    NEXT_PUBLIC_PAYMENTS_ENABLED: boolean;
}) {
    const issues: string[] = [];

    if (env.NEXT_PUBLIC_APP_STAGE !== "local" && env.NEXT_PUBLIC_ENABLE_DEMO_PAYMENT) {
        issues.push("NEXT_PUBLIC_ENABLE_DEMO_PAYMENT can only be true in local stage");
    }

    if (env.NEXT_PUBLIC_APP_STAGE === "beta" && env.NEXT_PUBLIC_PAYMENTS_ENABLED) {
        issues.push(
            "NEXT_PUBLIC_PAYMENTS_ENABLED must remain false while beta uses complimentary ticketing"
        );
    }

    if (env.NEXT_PUBLIC_ENABLE_DEMO_PAYMENT && env.NEXT_PUBLIC_PAYMENTS_ENABLED) {
        issues.push(
            "NEXT_PUBLIC_ENABLE_DEMO_PAYMENT and NEXT_PUBLIC_PAYMENTS_ENABLED cannot both be true"
        );
    }

    if (issues.length > 0) {
        throw buildEnvError(issues.map((issue) => `- ${issue}`).join("\n"));
    }
}

export function parsePublicEnv(rawEnv: PublicEnvSource | EnvSource): PublicEnv {
    const parsed = publicEnvSchema.safeParse(rawEnv);

    if (!parsed.success) {
        throw buildEnvError(formatZodError(parsed.error));
    }

    const env: PublicEnv = {
        ...parsed.data,
        NEXT_PUBLIC_ENABLE_DEMO_PAYMENT:
            parsed.data.NEXT_PUBLIC_ENABLE_DEMO_PAYMENT === "true",
        NEXT_PUBLIC_PAYMENTS_ENABLED:
            parsed.data.NEXT_PUBLIC_PAYMENTS_ENABLED === "true",
        NEXT_PUBLIC_MIDTRANS_SNAP_URL:
            parsed.data.NEXT_PUBLIC_MIDTRANS_SNAP_URL ??
            getDefaultMidtransSnapUrl(false),
    };

    validateSharedFlags(env);

    return env;
}

export function parseServerEnv(rawEnv: ServerEnvSource | EnvSource): ServerEnv {
    const parsed = serverEnvSchema.safeParse(rawEnv);

    if (!parsed.success) {
        throw buildEnvError(formatZodError(parsed.error));
    }

    const env: ServerEnv = {
        ...parsed.data,
        NEXT_PUBLIC_ENABLE_DEMO_PAYMENT:
            parsed.data.NEXT_PUBLIC_ENABLE_DEMO_PAYMENT === "true",
        NEXT_PUBLIC_PAYMENTS_ENABLED:
            parsed.data.NEXT_PUBLIC_PAYMENTS_ENABLED === "true",
        MIDTRANS_IS_PRODUCTION: parsed.data.MIDTRANS_IS_PRODUCTION === "true",
        NEXT_PUBLIC_MIDTRANS_SNAP_URL:
            parsed.data.NEXT_PUBLIC_MIDTRANS_SNAP_URL ??
            getDefaultMidtransSnapUrl(parsed.data.MIDTRANS_IS_PRODUCTION === "true"),
    };

    validateSharedFlags(env);

    if (env.NEXT_PUBLIC_PAYMENTS_ENABLED) {
        const issues: string[] = [];

        if (!env.MIDTRANS_SERVER_KEY) {
            issues.push("- MIDTRANS_SERVER_KEY is required when NEXT_PUBLIC_PAYMENTS_ENABLED=true");
        }

        if (!env.NEXT_PUBLIC_MIDTRANS_CLIENT_KEY) {
            issues.push(
                "- NEXT_PUBLIC_MIDTRANS_CLIENT_KEY is required when NEXT_PUBLIC_PAYMENTS_ENABLED=true"
            );
        }

        if (issues.length > 0) {
            throw buildEnvError(issues.join("\n"));
        }
    }

    return env;
}

export function getPublicEnv() {
    if (!cachedPublicEnv) {
        cachedPublicEnv = parsePublicEnv({
            NODE_ENV: process.env.NODE_ENV,
            NEXT_PUBLIC_APP_STAGE: process.env.NEXT_PUBLIC_APP_STAGE,
            NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
            NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
            NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL,
            NEXT_PUBLIC_ENABLE_DEMO_PAYMENT: process.env.NEXT_PUBLIC_ENABLE_DEMO_PAYMENT,
            NEXT_PUBLIC_PAYMENTS_ENABLED: process.env.NEXT_PUBLIC_PAYMENTS_ENABLED,
            NEXT_PUBLIC_MIDTRANS_CLIENT_KEY: process.env.NEXT_PUBLIC_MIDTRANS_CLIENT_KEY,
            NEXT_PUBLIC_MIDTRANS_SNAP_URL: process.env.NEXT_PUBLIC_MIDTRANS_SNAP_URL,
        });
    }

    return cachedPublicEnv;
}

export function getServerEnv() {
    if (!cachedServerEnv) {
        cachedServerEnv = parseServerEnv(process.env as EnvSource);
    }

    return cachedServerEnv;
}

export function resetEnvCache() {
    cachedPublicEnv = undefined;
    cachedServerEnv = undefined;
}
