# GEL-13 Auth and Role Boundary Hardening Design

## Goal

Strengthen permission boundaries between customer, organizer, admin, and service-role access so privileged routes use a consistent authorization path, service-role usage stays isolated, and privileged mutations leave an audit trail.

## Problem Summary

The current API layer repeats many ad-hoc auth checks:

- admin routes often inline the same `createClient()` + `auth.getUser()` + Prisma role lookup flow,
- organizer routes repeat role checks with small variations,
- service-role access exists as an available primitive but the boundary for when it should be used is not explicit,
- some leftover route changes are only typing/lint cleanup and do not by themselves guarantee stronger authorization behavior,
- audit requirements for privileged operations are partially implemented but not consistently routed through a common helper.

This creates drift risk: one route may deny correctly while a neighboring route accidentally becomes too permissive or loses useful audit context.

## Approaches Considered

### Approach A — Centralized route guards with targeted refactor

Create a small auth guard module for the most critical role checks (`admin`, `super-admin`, `organizer`) and migrate the release-critical routes that are already in flight.

**Pros**
- Directly addresses consistency.
- Smallest safe change set.
- Easy to verify route by route.

**Cons**
- Does not instantly refactor every route in the codebase.

### Approach B — Full auth framework sweep

Refactor every admin/organizer route in one pass onto a brand-new authorization abstraction.

**Pros**
- Maximum consistency if completed perfectly.

**Cons**
- Too wide for the current release-blocker window.
- Higher regression risk.

### Approach C — Script/RLS-only hardening

Limit changes to RLS verification scripts and service-role tooling, leaving route guards mostly as-is.

**Pros**
- Lowest implementation effort.

**Cons**
- Does not satisfy the acceptance criterion that role checks are consistent across critical routes.

## Selected Approach

Use **Approach A**.

We will introduce a narrow shared auth/authorization helper, apply it to the critical admin and organizer routes currently represented in the working tree, and explicitly separate script-only/service-role code from request-time auth. This gives us a meaningful security improvement without trying to rewrite the whole application at once.

## Architecture

### 1. Shared route auth helper

Add a helper under `lib/auth/` that:

- reads the current Supabase session via the existing server client,
- loads the corresponding application user record once,
- returns normalized auth results,
- exposes guard helpers such as:
  - `requireAdmin()`
  - `requireSuperAdmin()`
  - `requireOrganizer()`
- provides consistent `{ error, status }` failures for route handlers.

This removes duplicated guard logic from critical routes and makes allowed roles explicit.

### 2. Explicit privileged-operation boundary

Use the shared helper only for request-time auth. Keep service-role usage isolated to:

- server-side helper creation where explicitly intended,
- scripts such as auth user synchronization,
- non-request operational tooling.

No request route should silently use service-role access to bypass the caller’s boundary check.

### 3. Audit shape for privileged mutations

For privileged mutations already in scope, prefer a consistent audit write pattern:

- actor user id,
- action name,
- entity type/id,
- old/new value snapshots when practical.

This will focus on the routes touched by this batch instead of trying to retrofit every existing admin mutation.

### 4. Scope of route migration

Target the routes already clustered under the remaining `GEL-13` working tree:

- admin listing/filter routes with privileged access checks,
- organizer management routes,
- helper scripts for RLS verification and auth sync,
- any directly related boundary leak or unsafe shortcut encountered while refactoring.

Likely targets:

- `app/api/admin/users/route.ts`
- `app/api/admin/events/route.ts`
- `app/api/admin/events/[id]/route.ts`
- `app/api/admin/site-content/route.ts`
- `app/api/admin/commission/route.ts`
- `app/api/organizer/team/route.ts`
- `app/api/organizer/events/route.ts`
- `app/api/organizer/performers/route.ts`
- `app/api/organizer/sponsors/route.ts`
- `app/api/organizer/events/[id]/gate/route.ts`
- `prisma/apply-rls.ts`
- `prisma/verify-rls.ts`
- `scripts/sync-users-to-auth.ts`

## Error Handling

Route guards will return normalized auth failures:

- `401` for missing authenticated user,
- `403` for authenticated users lacking the required application role,
- `404` only where the business object is missing after authorization succeeds.

This avoids mixing auth failures with data-not-found behavior.

## Testing Strategy

Add focused tests for the new guard/helper behavior first, then verify route-adjacent changes with targeted lint/tests. For scripts and utility-only changes, verify via static checks and existing testable helpers where direct execution is heavy.

## Out of Scope

This batch does **not** try to finish:

- payment idempotency and webhook hardening (`GEL-17`),
- broad observability expansion beyond auth-boundary needs (`GEL-15`),
- unrelated UI polish or theme cleanup.
