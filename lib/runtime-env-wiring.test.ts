import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import path from "node:path";
import test from "node:test";

const projectRoot = process.cwd();

function readProjectFile(relativePath: string) {
  return readFileSync(path.join(projectRoot, relativePath), "utf8");
}

test("POS page reads Midtrans runtime config from public env helper", () => {
  const source = readProjectFile("app/pos/page.tsx");

  assert.match(source, /import\s+\{\s*getPublicEnv\s*\}\s+from\s+"@\/lib\/env"/);
  assert.match(source, /const\s+env\s*=\s*getPublicEnv\(\)/);
  assert.match(source, /script\.src\s*=\s*env\.NEXT_PUBLIC_MIDTRANS_SNAP_URL/);
  assert.match(source, /script\.setAttribute\("data-client-key",\s*env\.NEXT_PUBLIC_MIDTRANS_CLIENT_KEY\s*\|\|\s*""\)/);
  assert.doesNotMatch(source, /process\.env\.NEXT_PUBLIC_MIDTRANS_SNAP_URL/);
  assert.doesNotMatch(source, /process\.env\.NEXT_PUBLIC_MIDTRANS_CLIENT_KEY/);
});

test("checkout page reads demo and payment flags from public env helper", () => {
  const source = readProjectFile("app/checkout/page.tsx");

  assert.match(source, /import\s+\{\s*getPublicEnv\s*\}\s+from\s+"@\/lib\/env"/);
  assert.match(source, /const\s+env\s*=\s*getPublicEnv\(\)/);
  assert.match(source, /const\s+isDemoMode\s*=\s*env\.NEXT_PUBLIC_ENABLE_DEMO_PAYMENT/);
  assert.match(source, /const\s+isPaymentsEnabled\s*=\s*env\.NEXT_PUBLIC_PAYMENTS_ENABLED/);
  assert.doesNotMatch(source, /process\.env\.NEXT_PUBLIC_ENABLE_DEMO_PAYMENT/);
  assert.doesNotMatch(source, /process\.env\.NEXT_PUBLIC_PAYMENTS_ENABLED/);
});

test("refund admin route reads email env through env helper", () => {
  const source = readProjectFile("app/api/admin/refunds/route.ts");

  assert.match(source, /import\s+\{\s*getEmailEnv\s*\}\s+from\s+"@\/lib\/env"/);
  assert.match(source, /const\s+env\s*=\s*getEmailEnv\(\)/);
  assert.match(source, /new Resend\(env\.RESEND_API_KEY\)/);
  assert.match(source, /const\s+refundEmailFrom\s*=\s*env\.EMAIL_FROM/);
  assert.match(source, /from:\s*refundEmailFrom/);
  assert.doesNotMatch(source, /process\.env\.RESEND_API_KEY/);
  assert.doesNotMatch(source, /process\.env\.RESEND_FROM_EMAIL/);
  assert.doesNotMatch(source, /process\.env\.EMAIL_FROM/);
});
