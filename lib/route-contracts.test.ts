import test from "node:test";
import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import path from "node:path";

const projectRoot = process.cwd();

function readProjectFile(relativePath: string) {
  return readFileSync(path.join(projectRoot, relativePath), "utf8");
}

test("follow-up smoke routes and POS callback pages exist", () => {
  const requiredPaths = [
    "app/api/upload/route.ts",
    "app/gate/page.tsx",
    "app/(customer)/my-bookings/[code]/page.tsx",
    "app/(customer)/my-bookings/[code]/ticket/page.tsx",
    "app/pos/payment-success/page.tsx",
    "app/pos/payment-failed/page.tsx",
    "app/pos/payment-pending/page.tsx",
  ];

  for (const requiredPath of requiredPaths) {
    assert.equal(existsSync(path.join(projectRoot, requiredPath)), true, requiredPath);
  }
});

test("public gate and POS access routes enforce credential rate limiting", () => {
  const gateSource = readProjectFile("app/api/gate/access/route.ts");
  const posSource = readProjectFile("app/api/pos/access/route.ts");

  for (const source of [gateSource, posSource]) {
    assert.match(source, /rateLimiters\.accessCredential\.check/);
    assert.match(source, /getClientIdentifier/);
    assert.match(source, /getRateLimitHeaders/);
    assert.match(source, /429/);
  }
});

test("organizer gate CTA targets the real new-event route", () => {
  const source = readProjectFile("app/organizer/gate/page.tsx");

  assert.match(source, /router\.push\("\/organizer\/events\/new"\)/);
  assert.doesNotMatch(source, /router\.push\("\/organizer\/events\/create"\)/);
});

test("customer header partner link points to an existing page", () => {
  const source = readProjectFile("components/customer/CustomerHeader.tsx");

  assert.match(source, /href="\/become-organizer"/);
  assert.doesNotMatch(source, /href="\/partner"/);
});

test("customer ticket and refund pages consume the nested booking detail payload contract", () => {
  const ticketSource = readProjectFile("app/(customer)/my-bookings/[code]/ticket/page.tsx");
  const refundSource = readProjectFile("app/(customer)/my-bookings/[code]/refund/page.tsx");

  assert.match(ticketSource, /setBooking\(data\.data\.booking\)/);
  assert.doesNotMatch(ticketSource, /setBooking\(data\.data\)/);

  assert.match(refundSource, /const\s+bookingSummary\s*=\s*bookingData\.data\.booking/);
  assert.match(
    refundSource,
    /setBooking\(\s*\{\s*id:\s*bookingSummary\.id,[\s\S]*bookingCode:\s*bookingSummary\.bookingCode,[\s\S]*status:\s*bookingSummary\.status,[\s\S]*totalAmount:\s*bookingSummary\.totalAmount,[\s\S]*event:\s*bookingSummary\.event,[\s\S]*\}\s*\)/
  );
  assert.doesNotMatch(refundSource, /bookingData\.data\.id/);
  assert.doesNotMatch(refundSource, /bookingData\.data\.bookingCode/);
});

test("dedicated customer ticket page renders QR from uniqueCode instead of qrCodeUrl assets", () => {
  const ticketSource = readProjectFile("app/(customer)/my-bookings/[code]/ticket/page.tsx");

  assert.match(ticketSource, /import\s*\{\s*QRCodeSVG\s*\}\s*from\s*"qrcode\.react"/);
  assert.match(ticketSource, /<QRCodeSVG\s+value=\{ticket\.uniqueCode\}/);
  assert.doesNotMatch(ticketSource, /ticket\.qrCodeUrl\s*\?/);
});

test("customer refund page does not advertise unsupported partial refunds", () => {
  const refundSource = readProjectFile("app/(customer)/my-bookings/[code]/refund/page.tsx");

  assert.doesNotMatch(refundSource, /setRefundType\("PARTIAL"\)/);
  assert.match(refundSource, /Full refund \(100%\)/);
  assert.match(refundSource, /refund parsial belum didukung/i);
});

test("ticket PDF generation prefers the booking schedule over the event default schedule", () => {
  const pdfRouteSource = readProjectFile("app/api/tickets/[ticketId]/pdf/route.ts");
  const ticketTemplateSource = readProjectFile("lib/pdf/ticket-template.tsx");

  assert.match(pdfRouteSource, /eventSchedule:/);
  assert.match(ticketTemplateSource, /booking\.eventSchedule\s*\?\?\s*booking\.event\.schedules\[0\]/);
});

test("customer and admin proof views handle signed PDF URLs as PDFs", () => {
  const customerSource = readProjectFile("app/(customer)/my-bookings/[code]/page.tsx");
  const adminHelperSource = readProjectFile("lib/admin/payment-verification-ui.ts");

  assert.match(customerSource, /const\s+paymentProofKind\s*=\s*getPaymentProofKind\(booking\.transaction\?\.paymentProofUrl\)/);
  assert.doesNotMatch(customerSource, /paymentProofUrl\.endsWith\("\.pdf"\)/);

  assert.match(adminHelperSource, /normalizedUrl\.endsWith\("\.pdf"\)/);
  assert.doesNotMatch(adminHelperSource, /url\.startsWith\("\/api\/"\)\s*\|\|\s*url\.includes\("\/storage\/v1\/object\/sign\/"\)/);
});
