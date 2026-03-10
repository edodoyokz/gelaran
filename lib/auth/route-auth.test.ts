import assert from "node:assert/strict";
import test from "node:test";
import {
  createAuthFailure,
  hasRequiredRole,
  isAllowedRole,
  type AppRole,
} from "./role-helpers";

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
