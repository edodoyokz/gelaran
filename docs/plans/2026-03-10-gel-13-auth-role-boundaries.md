# GEL-13 Auth and Role Boundary Hardening Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Centralize critical auth guards, isolate service-role usage, and harden role checks across the release-critical admin and organizer routes.

**Architecture:** Add a shared route-authorization helper under `lib/auth/`, migrate the critical remaining routes to use it, tighten script/service-role boundaries, and add targeted tests for guard behavior before committing the route refactors.

**Tech Stack:** Next.js route handlers, Supabase SSR auth, Prisma, TypeScript, Node test runner, ESLint

---

### Task 1: Add auth-guard tests and helper

**Files:**
- Create: `lib/auth/route-auth.ts`
- Create: `lib/auth/route-auth.test.ts`

**Step 1: Write the failing test**

Cover:
- missing user returns unauthorized result
- existing user with wrong role returns forbidden result
- admin/super-admin and organizer guards accept the correct roles

**Step 2: Run test to verify it fails**

Run: `node --experimental-strip-types --test lib/auth/route-auth.test.ts`
Expected: FAIL until helper exists.

**Step 3: Write minimal implementation**

Implement a small helper that normalizes:
- current session lookup
- application user lookup
- role guard results for admin, super-admin, and organizer

**Step 4: Run test to verify it passes**

Run: `node --experimental-strip-types --test lib/auth/route-auth.test.ts`
Expected: PASS.

**Step 5: Commit**

Commit the helper and its test once green.

### Task 2: Refactor critical admin routes onto shared guards

**Files:**
- Modify: `app/api/admin/users/route.ts`
- Modify: `app/api/admin/events/route.ts`
- Modify: `app/api/admin/events/[id]/route.ts`
- Modify: `app/api/admin/site-content/route.ts`
- Modify: `app/api/admin/commission/route.ts`

**Step 1: Stage one route at a time conceptually**

Replace duplicated auth lookup logic with shared guard helper calls.

**Step 2: Keep route-specific business logic unchanged**

Only auth/authorization flow, role checks, and directly related typings should move.

**Step 3: Run targeted lint**

Run: `npx eslint app/api/admin/users/route.ts app/api/admin/events/route.ts app/api/admin/events/[id]/route.ts app/api/admin/site-content/route.ts app/api/admin/commission/route.ts lib/auth/route-auth.ts`
Expected: PASS.

**Step 4: Commit**

Commit the admin-route hardening batch.

### Task 3: Refactor critical organizer routes onto shared guards

**Files:**
- Modify: `app/api/organizer/team/route.ts`
- Modify: `app/api/organizer/events/route.ts`
- Modify: `app/api/organizer/performers/route.ts`
- Modify: `app/api/organizer/sponsors/route.ts`
- Modify: `app/api/organizer/events/[id]/gate/route.ts`

**Step 1: Replace duplicated organizer-role checks**

Use the shared organizer guard helper while preserving route business rules.

**Step 2: Keep request validation and ownership logic intact**

Do not broaden the scope into unrelated event or payment logic.

**Step 3: Run targeted lint**

Run: `npx eslint app/api/organizer/team/route.ts app/api/organizer/events/route.ts app/api/organizer/performers/route.ts app/api/organizer/sponsors/route.ts app/api/organizer/events/[id]/gate/route.ts lib/auth/route-auth.ts`
Expected: PASS.

**Step 4: Commit**

Commit the organizer-route hardening batch.

### Task 4: Tighten service-role and auth tooling boundaries

**Files:**
- Modify: `prisma/apply-rls.ts`
- Modify: `prisma/verify-rls.ts`
- Modify: `scripts/sync-users-to-auth.ts`

**Step 1: Review service-role and script boundaries**

Ensure script-only auth/admin paths are explicit and typed safely.

**Step 2: Keep scripts operationally focused**

Avoid request-time business logic in these files.

**Step 3: Run targeted lint**

Run: `npx eslint prisma/apply-rls.ts prisma/verify-rls.ts scripts/sync-users-to-auth.ts`
Expected: PASS.

**Step 4: Commit**

Commit the tooling hardening batch.

### Task 5: Final verification and GEL-13 summary

**Files:**
- Verify only

**Step 1: Run focused tests**

Run: `node --experimental-strip-types --test lib/auth/route-auth.test.ts`
Expected: PASS.

**Step 2: Run route-focused lint**

Run the admin + organizer + tooling lint commands from prior tasks.
Expected: PASS.

**Step 3: Inspect git diff and status**

Confirm only `GEL-13`-scoped files changed in the worktree.

**Step 4: Summarize evidence**

Prepare the commit SHAs, verification commands, and remaining out-of-scope files for the final handoff.
