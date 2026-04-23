import assert from "node:assert/strict";
import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import path from "node:path";
import test from "node:test";

const projectRoot = process.cwd();

function listRouteFiles(dir: string): string[] {
  const entries = readdirSync(dir);
  const files: string[] = [];

  for (const entry of entries) {
    const fullPath = path.join(dir, entry);
    const stat = statSync(fullPath);

    if (stat.isDirectory()) {
      files.push(...listRouteFiles(fullPath));
      continue;
    }

    if (entry === "route.ts") {
      files.push(fullPath);
    }
  }

  return files;
}

function hasAuthGuard(routeSource: string) {
  return (
    routeSource.includes("requireAdmin(") ||
    routeSource.includes("requireAdminContext(") ||
    routeSource.includes("requireOrganizer(") ||
    routeSource.includes("requireOrganizerContext(") ||
    routeSource.includes("requireAuthenticatedAppUser(") ||
    routeSource.includes("getOptionalAuthenticatedAppUser(") ||
    routeSource.includes("requireRoles(") ||
    routeSource.includes("supabase.auth.getUser(")
  );
}

test("all admin and organizer API routes enforce auth guard", () => {
  const routeRoots = [
    path.join(projectRoot, "app/api/admin"),
    path.join(projectRoot, "app/api/organizer"),
  ];

  const missingGuards: string[] = [];

  for (const routeRoot of routeRoots) {
    const routeFiles = listRouteFiles(routeRoot);

    for (const routeFile of routeFiles) {
      const source = readFileSync(routeFile, "utf8");

      if (!hasAuthGuard(source)) {
        missingGuards.push(path.relative(projectRoot, routeFile));
      }
    }
  }

  assert.deepEqual(missingGuards, []);
});

test("critical identity routes use shared auth helpers instead of raw Supabase IDs", () => {
  const sharedHelperRoutes = [
    "app/api/bookings/route.ts",
    "app/api/payments/route.ts",
    "app/api/events/[slug]/reviews/route.ts",
    "app/api/events/[slug]/waitlist/route.ts",
    "app/api/my-bookings/route.ts",
    "app/api/my-bookings/[code]/route.ts",
    "app/api/my-bookings/[code]/refund/route.ts",
    "app/api/tickets/[ticketId]/pdf/route.ts",
    "app/api/tickets/[ticketId]/transfer/route.ts",
    "app/api/tickets/transfer/accept/route.ts",
    "app/api/admin/audit-logs/route.ts",
    "app/api/admin/bookings/route.ts",
    "app/api/admin/bookings/[bookingId]/route.ts",
    "app/api/admin/commission-settings/route.ts",
    "app/api/admin/refunds/route.ts",
    "app/api/admin/reviews/route.ts",
    "app/api/organizer/events/[id]/check-in-points/route.ts",
    "app/api/organizer/events/[id]/faq/route.ts",
    "app/api/organizer/events/[id]/media/route.ts",
    "app/api/organizer/events/[id]/recurring/route.ts",
    "app/api/organizer/followers/route.ts",
    "app/api/organizer/events/[id]/seating/sections/route.ts",
    "app/api/organizer/events/[id]/seating/rows/route.ts",
    "app/api/organizer/events/[id]/seating/seats/route.ts",
    "app/api/organizer/events/[id]/tags/route.ts",
    "app/api/organizer/events/[id]/venue-layout/route.ts",
    "app/api/organizer/events/[id]/route.ts",
  ];

  const missingSharedHelpers: string[] = [];
  const rawIdentityLeaks: string[] = [];

  for (const relativePath of sharedHelperRoutes) {
    const source = readFileSync(path.join(projectRoot, relativePath), "utf8");

    if (
      !source.includes("requireAuthenticatedAppUser(") &&
      !source.includes("getOptionalAuthenticatedAppUser(") &&
      !source.includes("requireAdmin(") &&
      !source.includes("requireAdminContext(") &&
      !source.includes("requireOrganizer(") &&
      !source.includes("requireOrganizerContext(")
    ) {
      missingSharedHelpers.push(relativePath);
    }

    if (
      source.includes("userId: user.id") ||
      source.includes("booking.userId !== user.id") ||
      source.includes("organizerId !== user.id") ||
      source.includes("fromUserId: user.id") ||
      source.includes("requestedBy: user.id") ||
      source.includes("processedBy: user.id") ||
      source.includes("organizerId: user.id") ||
      source.includes("event.organizerId !== user.id")
    ) {
      rawIdentityLeaks.push(relativePath);
    }
  }

  assert.deepEqual(missingSharedHelpers, []);
  assert.deepEqual(rawIdentityLeaks, []);
});

test("customer auth proxy exists without the deprecated middleware conflict", () => {
  assert.equal(existsSync(path.join(projectRoot, "proxy.ts")), true);
  assert.equal(existsSync(path.join(projectRoot, "middleware.ts")), false);
});
