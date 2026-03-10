import { spawn } from "node:child_process";

const defaults = {
  DATABASE_URL: "postgresql://postgres:postgres@localhost:5432/gelaran",
  DIRECT_URL: "postgresql://postgres:postgres@localhost:5432/gelaran",
  NEXT_PUBLIC_SUPABASE_URL: "https://example.supabase.co",
  NEXT_PUBLIC_SUPABASE_ANON_KEY: "anon-key",
  SUPABASE_SERVICE_ROLE_KEY: "service-role-key",
  RESEND_API_KEY: "re_test_key",
  EMAIL_FROM: "Gelaran <noreply@example.com>",
  NEXT_PUBLIC_APP_URL: "https://gelaran.test",
  NEXT_PUBLIC_APP_STAGE: "beta",
  NEXT_PUBLIC_PAYMENTS_ENABLED: "false",
  NEXT_PUBLIC_ENABLE_DEMO_PAYMENT: "false",
  MIDTRANS_IS_PRODUCTION: "false",
  CI_BUILD_SKIP_NEXT_TYPECHECK: "true",
  CI_BUILD_DISABLE_WEBPACK_WORKER: "true",
};

const child = spawn(
  process.platform === "win32" ? "pnpm.cmd" : "pnpm",
  ["run", "build:ci"],
  {
    stdio: "inherit",
    env: {
      ...defaults,
      ...process.env,
    },
  }
);

child.on("exit", (code) => {
  process.exit(code ?? 1);
});
