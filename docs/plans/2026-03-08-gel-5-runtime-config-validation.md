# GEL-5 Runtime Config Validation Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Add a typed environment configuration layer that validates required runtime variables early and fails startup with actionable errors while keeping beta complimentary mode independent from payment credentials.

**Architecture:** Introduce a small `lib/env.ts` module backed by `zod` that parses raw `process.env`, normalizes booleans, and applies conditional validation. Load it from an `instrumentation.ts` startup hook so server instances fail early, and migrate a few high-risk modules to use the typed env object instead of direct `process.env` access.

**Tech Stack:** Next.js 16, TypeScript, Zod, Node test runner, Prisma, Supabase

---

### Task 1: Add failing env validation tests

**Files:**
- Create: `lib/env.test.ts`
- Modify: `package.json`

**Steps:**
1. Write tests for missing required vars in beta mode.
2. Write tests proving payments can stay disabled without Midtrans secrets.
3. Write tests proving payment-enabled mode requires Midtrans secrets.
4. Add a test script that runs the env test file.

### Task 2: Implement typed env module

**Files:**
- Create: `lib/env.ts`

**Steps:**
1. Add raw schema and boolean coercion.
2. Parse once into a typed object.
3. Add conditional validation for beta/payment modes.
4. Export helpers for `isProduction`, `paymentsEnabled`, and public app URL.

### Task 3: Wire startup fail-fast behavior

**Files:**
- Create: `instrumentation.ts`
- Modify: `next.config.ts`

**Steps:**
1. Import env validation in startup path.
2. Ensure server startup throws on invalid configuration.
3. Keep client build unaffected.

### Task 4: Migrate critical modules and docs

**Files:**
- Modify: `lib/prisma/client.ts`
- Modify: `lib/supabase/server.ts`
- Modify: `lib/supabase/client.ts`
- Modify: `lib/email/client.ts`
- Modify: `lib/midtrans/client.ts`
- Modify: `.env.example`

**Steps:**
1. Replace fragile non-null env assertions in critical modules.
2. Document new feature flags for beta vs payments.
3. Keep payment credentials optional when payments are disabled.

### Task 5: Verify end-to-end

**Files:**
- Verify only

**Steps:**
1. Run targeted env tests.
2. Run lint for touched files or full lint if practical.
3. Report exact evidence and any remaining gaps.
