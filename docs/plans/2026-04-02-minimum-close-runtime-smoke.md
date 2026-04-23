# Minimum Close Runtime Smoke Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Close the remaining minimum-fix items to 100% by normalizing runtime env access in the specified files, removing the redundant customer-layout client redirect while preserving shell bootstrap behavior, and completing focused verification plus a live smoke evidence pass for the named flows.

**Architecture:** Centralize runtime env reads through `lib/env.ts` so client and server code stop depending on ad-hoc `process.env` access at usage sites. Keep customer shell bootstrap in `app/(customer)/layout.tsx` responsible for fetching profile and notification state after mount, but remove the extra client-side auth redirect decision so route protection stays with the existing auth boundary. Verification stays narrow: exact file-level tests, typecheck, and a browser smoke checklist with captured evidence.

**Tech Stack:** Next.js 16 App Router, React 19, TypeScript, Supabase auth, Node test runner via `tsx`, pnpm.

---

## Scope Guardrails

- In scope only:
  - runtime env normalization in `app/api/admin/refunds/route.ts`, `app/pos/page.tsx`, and `app/checkout/page.tsx` via `lib/env.ts`
  - removing the redundant client-side auth redirect from `app/(customer)/layout.tsx` while preserving shell bootstrap behavior
  - targeted verification commands
  - full live smoke steps and evidence checklist for forgot password, auth callback, organizer upload, checkout, and POS payment redirect
- Explicitly out of scope:
  - schema or identity backfill for `supabaseUserId`
  - broad auth refactors outside `app/(customer)/layout.tsx`
  - unrelated payment, organizer, or POS feature work
  - production deploy or infra changes
- Deferred note:
  - `supabaseUserId` is **deferred optional-long-term / out of scope** for this plan and must not be included in implementation tasks or verification exit criteria.

## Implementation Notes Before Starting

- Reuse the existing env accessors in `lib/env.ts`:
  - `getServerEnv()` for server route usage
  - `getPublicEnv()` for client page usage
- Preserve current behavior wherever possible:
  - refunds route should still initialize Resend once at module scope, but from normalized env
  - POS page should still load Snap using the resolved public env values
  - checkout page should still compute demo/payment flags from env, but via normalized access
  - customer shell should still render skeleton first, fetch `/api/profile` and `/api/notifications/count`, and keep logout behavior unchanged
- Prefer additive or source-inspection tests over broad integration work for this closeout.

### Task 1: Lock in env normalization expectations with tests

**Files:**
- Modify: `lib/env.test.ts`
- Create: `lib/runtime-env-normalization.test.ts`

**Step 1: Add failing assertions for the public env values needed by checkout and POS**

- In `lib/env.test.ts`, add assertions that `parsePublicEnv(...)` returns:
  - boolean `NEXT_PUBLIC_ENABLE_DEMO_PAYMENT`
  - boolean `NEXT_PUBLIC_PAYMENTS_ENABLED`
  - resolved `NEXT_PUBLIC_MIDTRANS_SNAP_URL`
  - passthrough `NEXT_PUBLIC_MIDTRANS_CLIENT_KEY` when provided
- Add one case for explicit `NEXT_PUBLIC_MIDTRANS_SNAP_URL` and one case for the default sandbox URL fallback.

**Step 2: Add failing source-inspection coverage for the three scoped runtime call sites**

- In `lib/runtime-env-normalization.test.ts`, read these files as source text:
  - `app/api/admin/refunds/route.ts`
  - `app/pos/page.tsx`
  - `app/checkout/page.tsx`
- Assert the normalized imports/usages expected after the change:
  - `app/api/admin/refunds/route.ts` imports `getServerEnv` from `@/lib/env`
  - `app/api/admin/refunds/route.ts` does not contain `process.env.RESEND_API_KEY`
  - `app/pos/page.tsx` imports `getPublicEnv` from `@/lib/env`
  - `app/pos/page.tsx` does not contain `process.env.NEXT_PUBLIC_MIDTRANS_SNAP_URL`
  - `app/pos/page.tsx` does not contain `process.env.NEXT_PUBLIC_MIDTRANS_CLIENT_KEY`
  - `app/checkout/page.tsx` imports `getPublicEnv` from `@/lib/env`
  - `app/checkout/page.tsx` does not contain direct `process.env.NEXT_PUBLIC_ENABLE_DEMO_PAYMENT`
  - `app/checkout/page.tsx` does not contain direct `process.env.NEXT_PUBLIC_PAYMENTS_ENABLED`

**Step 3: Run the targeted tests to verify they fail first**

Run:

```bash
node --import tsx --test lib/env.test.ts lib/runtime-env-normalization.test.ts
```

Expected before implementation:
- FAIL in `lib/runtime-env-normalization.test.ts` because the scoped files still use direct env access.

**Step 4: Commit checkpoint**

```bash
git add lib/env.test.ts lib/runtime-env-normalization.test.ts
git commit -m "test: pin minimum runtime env normalization"
```

### Task 2: Normalize server env usage in the refunds admin route

**Files:**
- Modify: `app/api/admin/refunds/route.ts`
- Reference: `lib/env.ts`

**Step 1: Replace the direct Resend env read with normalized server env access**

- Import `getServerEnv` from `@/lib/env`.
- Create a module-scope `const env = getServerEnv();` near the imports.
- Change the Resend client initialization from:

```ts
const resend = new Resend(process.env.RESEND_API_KEY);
```

to:

```ts
const env = getServerEnv();
const resend = new Resend(env.RESEND_API_KEY);
```

- Do not change unrelated refund logic, status transitions, or response payloads.

**Step 2: Re-run the narrow env tests**

Run:

```bash
node --import tsx --test lib/runtime-env-normalization.test.ts
```

Expected:
- the refunds-route assertions pass
- POS and checkout assertions may still fail until the next tasks are completed

**Step 3: Commit checkpoint**

```bash
git add app/api/admin/refunds/route.ts lib/runtime-env-normalization.test.ts
git commit -m "refactor: normalize refunds route env access"
```

### Task 3: Normalize client env usage in POS

**Files:**
- Modify: `app/pos/page.tsx`
- Reference: `lib/env.ts`

**Step 1: Switch the page to normalized public env access**

- Import `getPublicEnv` from `@/lib/env`.
- Define a stable module-scope env object:

```ts
const env = getPublicEnv();
```

- Replace the Snap script source expression with `env.NEXT_PUBLIC_MIDTRANS_SNAP_URL`.
- Replace the Snap client key attribute with `env.NEXT_PUBLIC_MIDTRANS_CLIENT_KEY ?? ""`.
- Keep the script insertion/removal behavior exactly the same.

**Step 2: Verify only the POS-specific source contract**

Run:

```bash
node --import tsx --test lib/runtime-env-normalization.test.ts
```

Expected:
- POS assertions pass
- checkout assertions may still fail until Task 4 is done

**Step 3: Commit checkpoint**

```bash
git add app/pos/page.tsx lib/runtime-env-normalization.test.ts
git commit -m "refactor: normalize pos public env access"
```

### Task 4: Normalize client env usage in checkout

**Files:**
- Modify: `app/checkout/page.tsx`
- Reference: `lib/env.ts`

**Step 1: Replace direct checkout env reads with normalized public env access**

- Import `getPublicEnv` from `@/lib/env`.
- Define a stable module-scope env object:

```ts
const env = getPublicEnv();
```

- Replace:

```ts
const isDemoMode = process.env.NEXT_PUBLIC_ENABLE_DEMO_PAYMENT === "true";
const isPaymentsEnabled = process.env.NEXT_PUBLIC_PAYMENTS_ENABLED === "true";
```

with:

```ts
const isDemoMode = env.NEXT_PUBLIC_ENABLE_DEMO_PAYMENT;
const isPaymentsEnabled = env.NEXT_PUBLIC_PAYMENTS_ENABLED;
```

- Do not alter any checkout pricing, seat locking, profile prefill, or submit behavior.

**Step 2: Re-run the env-focused test pair**

Run:

```bash
node --import tsx --test lib/env.test.ts lib/runtime-env-normalization.test.ts
```

Expected:
- PASS for both files

**Step 3: Commit checkpoint**

```bash
git add app/checkout/page.tsx lib/env.test.ts lib/runtime-env-normalization.test.ts
git commit -m "refactor: normalize checkout runtime flags"
```

### Task 5: Remove the redundant customer-layout client redirect while preserving shell bootstrap

**Files:**
- Modify: `app/(customer)/layout.tsx`
- Create: `lib/customer-layout-shell-bootstrap.test.ts`

**Step 1: Add a failing source-inspection test for the desired customer shell behavior**

- In `lib/customer-layout-shell-bootstrap.test.ts`, assert that `app/(customer)/layout.tsx`:
  - still imports `createClient` from `@/lib/supabase/client`
  - still fetches `/api/profile`
  - still fetches `/api/notifications/count`
  - no longer contains `router.push("/login?returnUrl=/dashboard")`
  - no longer returns early on missing `authUser` solely to redirect client-side
  - still keeps `setIsLoading(false)` in `finally`
- Keep this test source-based so it stays narrow and fast.

**Step 2: Run the test to confirm it fails first**

Run:

```bash
node --import tsx --test lib/customer-layout-shell-bootstrap.test.ts
```

Expected before implementation:
- FAIL because the layout still contains the client-side redirect.

**Step 3: Remove only the redundant redirect branch in the layout**

- In `app/(customer)/layout.tsx`:
  - keep the client shell component and skeleton
  - keep `supabase.auth.getUser()` if it is still needed to enrich fallback user data
  - remove the explicit `router.push("/login?returnUrl=/dashboard")` redirect path
  - remove the catch-path redirect as well
  - preserve bootstrap behavior: attempt profile + notification fetch, set user state when possible, and finish loading cleanly
- The post-change behavior should be:
  - authenticated users still see the shell with populated/fallback user data
  - unauthenticated users no longer trigger a duplicate client redirect here
  - the layout can safely render `null` after loading when no user data is available, leaving route/auth handling to the existing boundary

**Step 4: Re-run the customer shell test**

Run:

```bash
node --import tsx --test lib/customer-layout-shell-bootstrap.test.ts
```

Expected:
- PASS

**Step 5: Commit checkpoint**

```bash
git add app/(customer)/layout.tsx lib/customer-layout-shell-bootstrap.test.ts
git commit -m "refactor: remove redundant customer shell redirect"
```

### Task 6: Run the targeted verification commands for the scoped closeout

**Files:**
- Verify: `lib/env.test.ts`
- Verify: `lib/runtime-env-normalization.test.ts`
- Verify: `lib/customer-layout-shell-bootstrap.test.ts`
- Verify: `lib/auth-recovery-ui.test.ts`
- Verify: `lib/route-contracts.test.ts`
- Verify: `app/api/admin/refunds/route.ts`
- Verify: `app/pos/page.tsx`
- Verify: `app/checkout/page.tsx`
- Verify: `app/(customer)/layout.tsx`

**Step 1: Run env verification**

Run:

```bash
pnpm run test:env
```

Expected:
- PASS

**Step 2: Run the scoped source-contract tests together**

Run:

```bash
node --import tsx --test lib/runtime-env-normalization.test.ts lib/customer-layout-shell-bootstrap.test.ts lib/auth-recovery-ui.test.ts lib/route-contracts.test.ts
```

Expected:
- PASS

**Step 3: Run route/auth coverage already present in the repo**

Run:

```bash
pnpm run test:auth-route-coverage && pnpm run test:auth-recovery-ui && pnpm run test:route-contracts
```

Expected:
- PASS

**Step 4: Run typecheck on the scoped change set**

Run:

```bash
pnpm run typecheck
```

Expected:
- PASS

**Step 5: Optional lint pass if the repo is already lint-clean for these files**

Run:

```bash
pnpm exec eslint app/api/admin/refunds/route.ts app/pos/page.tsx app/checkout/page.tsx "app/(customer)/layout.tsx" lib/env.test.ts lib/runtime-env-normalization.test.ts lib/customer-layout-shell-bootstrap.test.ts
```

Expected:
- PASS or only pre-existing unrelated failures outside this scope

**Step 6: Commit checkpoint**

```bash
git add app/api/admin/refunds/route.ts app/pos/page.tsx app/checkout/page.tsx app/(customer)/layout.tsx lib/env.test.ts lib/runtime-env-normalization.test.ts lib/customer-layout-shell-bootstrap.test.ts
git commit -m "test: verify minimum runtime smoke closeout"
```

### Task 7: Execute the full live smoke pass and capture evidence

**Files:**
- Evidence target: `docs/plans/2026-04-02-minimum-close-runtime-smoke.md`
- Runtime surfaces:
  - `app/(auth)/forgot-password/page.tsx`
  - `app/auth/callback/route.ts`
  - `app/api/upload/route.ts`
  - `app/checkout/page.tsx`
  - `app/pos/page.tsx`
  - `app/pos/payment-success/page.tsx`
  - `app/pos/payment-pending/page.tsx`
  - `app/pos/payment-failed/page.tsx`

**Step 1: Start the app with the local runtime env**

Run:

```bash
pnpm dev
```

Expected:
- local app boots without env validation failure
- no startup error from `lib/env.ts`

**Step 2: Smoke forgot password flow and capture evidence**

Browser steps:
- Open `/forgot-password`
- Submit a valid test email
- Confirm the loading copy uses `Mengirim…`
- Confirm no client crash or console error
- Confirm the success UI explains the recovery email was sent

Evidence checklist:
- screenshot of the success state
- browser console capture showing no new errors
- note whether Supabase email delivery is locally observable or only request-success observable

**Step 3: Smoke auth callback flow and capture evidence**

Browser steps:
- Open a valid recovery or auth callback URL that routes through `/auth/callback`
- Confirm the callback resolves to an in-app relative destination only
- Confirm malicious or absolute `next` parameters are not honored if manually tested
- Confirm reset-password handoff still works for a valid recovery link

Evidence checklist:
- screenshot of callback landing state or redirected destination
- copied test URL used, with secrets/redemption codes redacted
- note confirming relative-path sanitization behavior

**Step 4: Smoke organizer upload entry and capture evidence**

Browser/API steps:
- Sign in as an organizer-capable user
- Navigate to the organizer flow that can reach upload behavior
- Attempt one representative upload interaction using the current local storage/backend setup
- If full upload cannot complete because of local storage or provider limitations, still verify that the route and page entry are reachable and fail gracefully

Evidence checklist:
- screenshot of organizer upload entry page
- screenshot or saved response for the upload attempt
- note whether the result is full success, graceful validation failure, or provider-blocked-but-routed-correctly

**Step 5: Smoke checkout flow and capture evidence**

Browser steps:
- Open a real local event checkout URL
- Verify attendee fields render and remain editable
- Verify ticket quantity or locked-seat state loads
- Verify checkout loads without runtime env crash
- If demo mode is on, run the demo payment path
- If payments are enabled, verify the real payment handoff button renders with no missing Snap config error

Evidence checklist:
- screenshot of checkout loaded state
- screenshot of demo modal or payment handoff state
- console/network capture showing no env-related runtime error
- exact event URL used

**Step 6: Smoke POS payment redirect/result flow and capture evidence**

Browser steps:
- Open `/pos` with a valid local POS session if available
- Initiate a POS transaction to the point where payment redirect/result handling is exercised
- Verify the app can reach the relevant result pages:
  - `/pos/payment-success`
  - `/pos/payment-pending`
  - `/pos/payment-failed`
- Confirm the POS page loads Snap using normalized env values and no direct env access regression is visible at runtime

Evidence checklist:
- screenshot of POS shell before payment
- screenshot of at least one payment result page actually reached
- note for the other result pages: directly smoke-tested page load vs full transactional reachability
- console capture showing no missing Midtrans client key / Snap URL runtime issue

**Step 7: Record the smoke outcome in this plan file before declaring done**

- Append a short execution note section with:
  - date/time run
  - commands executed
  - pass/fail by flow
  - links or filenames for screenshots if stored locally
  - unresolved blockers, if any
- Do not expand scope during recording.

### Task 8: Final closeout check

**Files:**
- Verify: `docs/plans/2026-04-02-minimum-close-runtime-smoke.md`

**Step 1: Reconfirm the scope stayed narrow**

- Ensure only these implementation surfaces were changed:
  - `app/api/admin/refunds/route.ts`
  - `app/pos/page.tsx`
  - `app/checkout/page.tsx`
  - `app/(customer)/layout.tsx`
  - the new/updated scoped tests
- Ensure `supabaseUserId` was not introduced into code or exit criteria.

**Step 2: Run the final exact verification set one more time**

Run:

```bash
pnpm run test:env && node --import tsx --test lib/runtime-env-normalization.test.ts lib/customer-layout-shell-bootstrap.test.ts lib/auth-recovery-ui.test.ts lib/route-contracts.test.ts && pnpm run test:auth-route-coverage && pnpm run test:auth-recovery-ui && pnpm run test:route-contracts && pnpm run typecheck
```

Expected:
- PASS across the entire scoped verification set

**Step 3: Final commit**

```bash
git add app/api/admin/refunds/route.ts app/pos/page.tsx app/checkout/page.tsx app/(customer)/layout.tsx lib/env.test.ts lib/runtime-env-normalization.test.ts lib/customer-layout-shell-bootstrap.test.ts docs/plans/2026-04-02-minimum-close-runtime-smoke.md
git commit -m "chore: close minimum runtime smoke fixes"
```

## Definition of Done

- `app/api/admin/refunds/route.ts` uses `getServerEnv()` instead of direct `process.env.RESEND_API_KEY`
- `app/pos/page.tsx` uses `getPublicEnv()` for Snap URL and client key
- `app/checkout/page.tsx` uses `getPublicEnv()` for demo/payment flags
- `app/(customer)/layout.tsx` no longer performs the redundant client-side auth redirect, while shell bootstrap fetches still exist
- targeted tests and typecheck pass with the exact commands listed here
- live smoke evidence exists for forgot password, auth callback, organizer upload, checkout, and POS payment redirect/result handling
- `supabaseUserId` remains deferred optional-long-term / out of scope

Plan complete and saved to `docs/plans/2026-04-02-minimum-close-runtime-smoke.md`. Two execution options:

**1. Subagent-Driven (this session)** - I dispatch fresh subagent per task, review between tasks, fast iteration

**2. Parallel Session (separate)** - Open new session with executing-plans, batch execution with checkpoints
