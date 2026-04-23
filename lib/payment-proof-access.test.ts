import test from "node:test";
import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import path from "node:path";

const projectRoot = process.cwd();

function readProjectFile(relativePath: string) {
  return readFileSync(path.join(projectRoot, relativePath), "utf8");
}

test("payment proof access helper exists for private-bucket reads", () => {
  assert.equal(
    existsSync(path.join(projectRoot, "lib/storage/payment-proof.ts")),
    true,
    "expected lib/storage/payment-proof.ts to exist"
  );
});

test("payment proof helper derives private storage paths and signed URLs", async () => {
  const modulePath = path.join(projectRoot, "lib/storage/payment-proof.ts");
  const paymentProofModule = await import(modulePath);

  assert.equal(
    paymentProofModule.resolveStoredPaymentProofPath("booking_123/1712559962000-proof.png"),
    "booking_123/1712559962000-proof.png"
  );

  assert.equal(
    paymentProofModule.resolveStoredPaymentProofPath("payment-proofs/booking_123/proof.png"),
    "booking_123/proof.png"
  );

  assert.equal(
    paymentProofModule.resolveStoredPaymentProofPath(
      "https://example.supabase.co/storage/v1/object/public/payment-proofs/payment-proofs/booking_123/proof.png"
    ),
    "booking_123/proof.png"
  );

  let receivedPath: string | null = null;
  const signedUrl = await paymentProofModule.createPaymentProofReadUrl(
    {
      storage: {
        from(bucket: string) {
          assert.equal(bucket, "payment-proofs");

          return {
            async createSignedUrl(objectPath: string, expiresIn: number) {
              receivedPath = objectPath;
              assert.equal(expiresIn, 60 * 10);

              return {
                data: { signedUrl: `https://signed.example/${objectPath}` },
                error: null,
              };
            },
          };
        },
      },
    },
    "https://example.supabase.co/storage/v1/object/public/payment-proofs/payment-proofs/booking_123/proof.png"
  );

  assert.equal(receivedPath, "booking_123/proof.png");
  assert.equal(signedUrl, "https://signed.example/booking_123/proof.png");

  receivedPath = null;

  const normalizedSignedUrl = await paymentProofModule.createPaymentProofReadUrl(
    {
      storage: {
        from(bucket: string) {
          assert.equal(bucket, "payment-proofs");

          return {
            async createSignedUrl(objectPath: string, expiresIn: number) {
              receivedPath = objectPath;
              assert.equal(expiresIn, 60 * 10);

              return {
                data: { signedUrl: `https://signed.example/${objectPath}` },
                error: null,
              };
            },
          };
        },
      },
    },
    "booking_123/1712559962000-proof.png"
  );

  assert.equal(receivedPath, "booking_123/1712559962000-proof.png");
  assert.equal(normalizedSignedUrl, "https://signed.example/booking_123/1712559962000-proof.png");
});

test("upload proof route persists storage path instead of public URL", () => {
  const source = readProjectFile("app/api/bookings/[bookingId]/upload-proof/route.ts");

  assert.doesNotMatch(source, /getPublicUrl\(/);
  assert.match(source, /paymentProofUrl:\s*path/);
});

test("upload proof route uses admin storage client and bucket-relative proof paths", () => {
  const source = readProjectFile("app/api/bookings/[bookingId]/upload-proof/route.ts");

  assert.match(source, /createAdminClient/);
  assert.doesNotMatch(source, /createServiceClient/);
  assert.match(source, /const path = `\$\{bookingId\}\/\$\{timestamp\}-\$\{file\.name\}`/);
  assert.match(source, /\.from\("payment-proofs"\)[\s\S]*\.upload\(path,/);
  assert.doesNotMatch(source, /payment-proofs\/\$\{bookingId\}/);
});

test("server supabase helper exposes uncoupled admin client", () => {
  const source = readProjectFile("lib/supabase/server.ts");

  assert.match(source, /export function createAdminClient\(/);
  assert.match(source, /from "@supabase\/supabase-js"/);
  assert.match(source, /auth:\s*\{[\s\S]*autoRefreshToken:\s*false,[\s\S]*persistSession:\s*false[\s\S]*\}/);
  assert.doesNotMatch(source, /export async function createAdminClient/);
});

test("customer and admin booking routes generate proof read URLs server-side", () => {
  const customerRouteSource = readProjectFile("app/api/my-bookings/[code]/route.ts");
  const adminRouteSource = readProjectFile("app/api/admin/bookings/[bookingId]/route.ts");

  for (const source of [customerRouteSource, adminRouteSource]) {
    assert.match(source, /createPaymentProofReadUrl/);
    assert.match(source, /paymentProofUrl:/);
  }
});

test("customer booking detail route signs payment proofs with the uncoupled admin client", () => {
  const source = readProjectFile("app/api/my-bookings/[code]/route.ts");

  assert.match(source, /import\s*\{\s*createAdminClient\s*\}\s*from\s*"@\/lib\/supabase\/server"/);
  assert.doesNotMatch(source, /import\s*\{\s*createServiceClient\s*\}\s*from\s*"@\/lib\/supabase\/server"/);
  assert.match(source, /const\s+storage\s*=\s*createAdminClient\(\)/);
  assert.match(source, /createPaymentProofReadUrl\(storage,\s*booking\.transaction\.paymentProofUrl\)/);
});

test("admin booking detail route signs payment proofs with the uncoupled admin client", () => {
  const source = readProjectFile("app/api/admin/bookings/[bookingId]/route.ts");

  assert.match(source, /import\s*\{\s*createAdminClient\s*\}\s*from\s*"@\/lib\/supabase\/server"/);
  assert.doesNotMatch(source, /import\s*\{\s*createServiceClient\s*\}\s*from\s*"@\/lib\/supabase\/server"/);
  assert.match(source, /const\s+storage\s*=\s*createAdminClient\(\)/);
  assert.match(source, /createPaymentProofReadUrl\(storage,\s*booking\.transaction\.paymentProofUrl\)/);
});
