import assert from "node:assert/strict";
import test from "node:test";
import {
  createAuthFailure,
  hasRequiredRole,
  isAllowedRole,
  type AppRole,
} from "./role-helpers";
import {
  getBookingAccessError,
  getLocalUserId,
  ownsLocalUserResource,
} from "./local-identity";

test("createAuthFailure returns 401 for missing authenticated user", () => {
  assert.deepEqual(createAuthFailure("missing-user"), {
    error: "Unauthorized",
    status: 401,
  });
});

test("createAuthFailure returns 403 for missing application role", () => {
  assert.deepEqual(createAuthFailure("missing-role"), {
    error: "Forbidden",
    status: 403,
  });
});

test("createAuthFailure returns 403 when local app user mapping is missing", () => {
  assert.deepEqual(createAuthFailure("missing-app-user"), {
    error: "User not found",
    status: 403,
  });
});

test("isAllowedRole accepts only known application roles", () => {
  assert.equal(isAllowedRole("ADMIN"), true);
  assert.equal(isAllowedRole("ORGANIZER"), true);
  assert.equal(isAllowedRole("service_role"), false);
  assert.equal(isAllowedRole("UNKNOWN"), false);
});

test("hasRequiredRole allows admins and super-admins into admin guard", () => {
  const allowedRoles: AppRole[] = ["ADMIN", "SUPER_ADMIN"];

  assert.equal(hasRequiredRole("ADMIN", allowedRoles), true);
  assert.equal(hasRequiredRole("SUPER_ADMIN", allowedRoles), true);
  assert.equal(hasRequiredRole("ORGANIZER", allowedRoles), false);
});

test("hasRequiredRole keeps organizer guard separate from admin roles", () => {
  assert.equal(hasRequiredRole("ORGANIZER", ["ORGANIZER"]), true);
  assert.equal(hasRequiredRole("ADMIN", ["ORGANIZER"]), false);
});

test("authenticated booking flow keeps the local Prisma user identity across create, list, and payment checks", () => {
  const actor = {
    authUserId: "supabase-user-1",
    dbUserId: "prisma-user-1",
    email: "customer@example.com",
  };

  const createdBookingUserId = getLocalUserId(actor);

  assert.equal(createdBookingUserId, "prisma-user-1");
  assert.equal(ownsLocalUserResource(createdBookingUserId, actor), true);
  assert.equal(
    getBookingAccessError(
      {
        userId: createdBookingUserId,
        guestEmail: null,
      },
      actor
    ),
    null
  );
});

test("booking access uses the local Prisma user id instead of the raw Supabase subject", () => {
  const actor = {
    authUserId: "supabase-user-1",
    dbUserId: "prisma-user-1",
    email: "customer@example.com",
  };

  assert.equal(ownsLocalUserResource("supabase-user-1", actor), false);
  assert.deepEqual(
    getBookingAccessError(
      {
        userId: "supabase-user-1",
        guestEmail: null,
      },
      actor
    ),
    {
      message: "Unauthorized - you don't own this booking",
      status: 403,
    }
  );
});

test("guest booking access keeps using the booking email when no local user id is attached", () => {
  const actor = {
    authUserId: "supabase-user-1",
    dbUserId: "prisma-user-1",
    email: "customer@example.com",
  };

  assert.equal(
    getBookingAccessError(
      {
        userId: null,
        guestEmail: "customer@example.com",
      },
      actor
    ),
    null
  );
  assert.deepEqual(
    getBookingAccessError(
      {
        userId: null,
        guestEmail: "other@example.com",
      },
      actor
    ),
    {
      message: "Unauthorized - booking email mismatch",
      status: 403,
    }
  );
});

test("booking flow rejects a different local Prisma user during list and payment access", () => {
  const bookingOwner = {
    authUserId: "supabase-user-1",
    dbUserId: "prisma-user-1",
    email: "owner@example.com",
  };
  const otherActor = {
    authUserId: "supabase-user-2",
    dbUserId: "prisma-user-2",
    email: "other@example.com",
  };

  const createdBookingUserId = getLocalUserId(bookingOwner);

  assert.equal(createdBookingUserId, "prisma-user-1");
  assert.equal(ownsLocalUserResource(createdBookingUserId, otherActor), false);
  assert.deepEqual(
    getBookingAccessError(
      {
        userId: createdBookingUserId,
        guestEmail: null,
      },
      otherActor
    ),
    {
      message: "Unauthorized - you don't own this booking",
      status: 403,
    }
  );
});
