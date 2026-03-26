import assert from "node:assert/strict";
import test from "node:test";
import { parsePublicEnv, parseServerEnv, type ServerEnvSource } from "./env";

function createValidServerEnv(): ServerEnvSource {
    return {
        NODE_ENV: "test",
        NEXT_PUBLIC_APP_STAGE: "beta",
        DATABASE_URL: "postgresql://postgres:postgres@localhost:5432/app",
        DIRECT_URL: "postgresql://postgres:postgres@localhost:5432/app",
        NEXT_PUBLIC_SUPABASE_URL: "https://example.supabase.co",
        NEXT_PUBLIC_SUPABASE_ANON_KEY: "anon-key",
        SUPABASE_SERVICE_ROLE_KEY: "service-role-key",
        RESEND_API_KEY: "re_test_key",
        EMAIL_FROM: "Gelaran <noreply@example.com>",
        NEXT_PUBLIC_APP_URL: "https://gelaran.test",
        NEXT_PUBLIC_ENABLE_DEMO_PAYMENT: "false",
        NEXT_PUBLIC_PAYMENTS_ENABLED: "false",
        MIDTRANS_IS_PRODUCTION: "false",
        CRON_SECRET: undefined,
        OPS_ALERT_WEBHOOK_URL: undefined,
    } as const;
}

test("beta complimentary mode passes without Midtrans secrets", () => {
    assert.doesNotThrow(() => parseServerEnv(createValidServerEnv()));
});

test("missing required server env fails with actionable error", () => {
    const env: ServerEnvSource = {
        ...createValidServerEnv(),
        DATABASE_URL: "",
    };

    assert.throws(() => parseServerEnv(env), /DATABASE_URL is required/);
});

test("payment-enabled mode requires Midtrans credentials", () => {
  const env: ServerEnvSource = {
    ...createValidServerEnv(),
        NEXT_PUBLIC_APP_STAGE: "production",
        NEXT_PUBLIC_PAYMENTS_ENABLED: "true",
    };

    assert.throws(() => parseServerEnv(env), /MIDTRANS_SERVER_KEY is required/);
});

test("demo payment flag is rejected outside local stage", () => {
    const env: ServerEnvSource = {
        ...createValidServerEnv(),
        NEXT_PUBLIC_ENABLE_DEMO_PAYMENT: "true",
    };

  assert.throws(
    () => parseServerEnv(env),
    /NEXT_PUBLIC_ENABLE_DEMO_PAYMENT can only be true in local stage/
  );
});

test("optional server env fields allow empty values without failing validation", () => {
  const env = parseServerEnv({
    ...createValidServerEnv(),
    CRON_SECRET: "",
    OPS_ALERT_WEBHOOK_URL: "",
  });

  assert.equal(env.CRON_SECRET, undefined);
  assert.equal(env.OPS_ALERT_WEBHOOK_URL, undefined);
});

test("optional server env fields are preserved when provided", () => {
  const env = parseServerEnv({
    ...createValidServerEnv(),
    CRON_SECRET: "top-secret",
    OPS_ALERT_WEBHOOK_URL: "https://alerts.example.test/hook",
  });

  assert.equal(env.CRON_SECRET, "top-secret");
  assert.equal(env.OPS_ALERT_WEBHOOK_URL, "https://alerts.example.test/hook");
});

test("public env derives default Midtrans snap URL", () => {
  const env = parsePublicEnv({
    NODE_ENV: "test",
        NEXT_PUBLIC_APP_STAGE: "local",
        NEXT_PUBLIC_SUPABASE_URL: "https://example.supabase.co",
        NEXT_PUBLIC_SUPABASE_ANON_KEY: "anon-key",
        NEXT_PUBLIC_APP_URL: "https://gelaran.test",
        NEXT_PUBLIC_ENABLE_DEMO_PAYMENT: "false",
        NEXT_PUBLIC_PAYMENTS_ENABLED: "false",
    });

    assert.equal(env.NEXT_PUBLIC_MIDTRANS_SNAP_URL, "https://app.sandbox.midtrans.com/snap/snap.js");
});
