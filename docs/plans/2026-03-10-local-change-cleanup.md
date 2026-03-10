# Local Change Cleanup Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Split the current mixed working tree into safe, issue-aligned commits for completed Linear work before starting the next open issue.

**Architecture:** Work from the existing `main` working tree because the changes already live there. Inventory and stage only high-confidence files per issue, run targeted verification for each batch, commit with issue-specific messages, and leave mixed/open-issue files unstaged for later handling.

**Tech Stack:** Git, Next.js app routes, Prisma, TypeScript, Node test runner, ESLint, Linear MCP

---

### Task 1: Confirm issue batches and file membership

**Files:**
- Modify: `docs/plans/2026-03-10-local-change-cleanup-design.md:1`
- Modify: `docs/plans/2026-03-10-local-change-cleanup.md:1`
- Review: `git status`
- Review: `git diff --stat`

**Step 1: Reconfirm the current working-tree inventory**

Run: `git status --short && git diff --stat`
Expected: large mixed working tree with high-confidence buckets for `GEL-5`, `GEL-6`, `GEL-7`, `GEL-8`, `GEL-9`, `GEL-11`, and `GEL-19`.

**Step 2: Reconfirm the selected cleanup policy**

Use the design doc as the source of truth: only high-confidence issue-aligned files are eligible for staging.

**Step 3: Commit the planning docs**

Run: `git add docs/plans/2026-03-10-local-change-cleanup-design.md docs/plans/2026-03-10-local-change-cleanup.md`
Expected: only the cleanup docs are staged.

**Step 4: Commit**

Run:
`git commit -m "docs: add local cleanup design and execution plan"`
Expected: a documentation-only commit exists before cleanup execution continues.

### Task 2: Stage and verify `GEL-5` runtime config batch

**Files:**
- Create: `lib/env.ts`
- Create: `lib/env.test.ts`
- Create: `docs/plans/2026-03-08-gel-5-runtime-config-validation.md`
- Modify: `next.config.ts`
- Modify: `package.json`
- Modify: `app/layout.tsx`

**Step 1: Stage the known `GEL-5` files**

Run: `git add lib/env.ts lib/env.test.ts docs/plans/2026-03-08-gel-5-runtime-config-validation.md next.config.ts package.json app/layout.tsx`
Expected: only runtime-config related files are staged.

**Step 2: Review the staged diff**

Run: `git diff --cached --stat && git diff --cached -- lib/env.ts lib/env.test.ts next.config.ts app/layout.tsx package.json`
Expected: runtime validation, fail-fast wiring, and related docs only.

**Step 3: Run targeted verification**

Run: `node --experimental-strip-types --test lib/env.test.ts`
Expected: PASS.

**Step 4: Commit**

Run: `git commit -m "feat: add GEL-5 runtime config validation"`
Expected: runtime config batch is committed cleanly.

### Task 3: Stage and verify `GEL-6` demo hardening batch

**Files:**
- Create: `lib/demo-mode.ts`
- Create: `lib/demo-mode.test.ts`
- Create: `docs/plans/2026-03-08-gel-6-demo-shortcuts-hardening.md`
- Modify: `app/api/payments/demo/route.ts`
- Review: any UI-only demo shortcut removals before staging

**Step 1: Stage the safe `GEL-6` core files**

Run: `git add lib/demo-mode.ts lib/demo-mode.test.ts docs/plans/2026-03-08-gel-6-demo-shortcuts-hardening.md app/api/payments/demo/route.ts`
Expected: only demo shortcut hardening files are staged.

**Step 2: Review the staged diff**

Run: `git diff --cached --stat && git diff --cached -- lib/demo-mode.ts lib/demo-mode.test.ts app/api/payments/demo/route.ts`
Expected: demo toggles are isolated to local/dev-safe paths.

**Step 3: Run targeted verification**

Run: `node --experimental-strip-types --test lib/demo-mode.test.ts`
Expected: PASS.

**Step 4: Commit**

Run: `git commit -m "feat: harden GEL-6 demo shortcuts"`
Expected: demo hardening batch is committed cleanly.

### Task 4: Stage and verify `GEL-7` structured logging batch

**Files:**
- Create: `instrumentation.ts`
- Create: `lib/logging/logger.ts`
- Create: `lib/logging/request.ts`
- Create: `lib/logging-request.test.ts`
- Create: `lib/audit-log.ts`
- Create: `docs/plans/2026-03-08-gel-7-structured-logging.md`
- Modify: `lib/prisma/client.ts`
- Modify: route files that only add logging/correlation

**Step 1: Stage the core logging files first**

Run: `git add instrumentation.ts lib/logging/logger.ts lib/logging/request.ts lib/logging-request.test.ts lib/audit-log.ts docs/plans/2026-03-08-gel-7-structured-logging.md lib/prisma/client.ts`
Expected: base logging infrastructure is staged.

**Step 2: Inspect route-level logging changes before adding them**

Run: `git diff -- app/api/cron/send-reminders/route.ts app/api/admin/events/route.ts app/api/admin/site-content/route.ts`
Expected: stage only hunks that add logging or request ids, not unrelated business logic.

**Step 3: Run targeted verification**

Run: `node --experimental-strip-types --test lib/logging-request.test.ts`
Expected: PASS.

**Step 4: Commit**

Run: `git commit -m "feat: add GEL-7 structured request logging"`
Expected: structured logging batch is committed cleanly.

### Task 5: Stage and verify `GEL-8` platform settings batch

**Files:**
- Create: `lib/platform-settings.ts`
- Create: `lib/platform-settings.test.ts`
- Create: `prisma/migrations/20260308_platform_settings/migration.sql`
- Create: `docs/plans/2026-03-08-gel-8-platform-settings-db.md`
- Modify: `app/api/admin/settings/route.ts`
- Modify: `prisma/schema.prisma`
- Modify: `prisma/seed.ts`
- Modify: `types/prisma.ts`

**Step 1: Stage known `GEL-8` files**

Run: `git add lib/platform-settings.ts lib/platform-settings.test.ts prisma/migrations/20260308_platform_settings/migration.sql docs/plans/2026-03-08-gel-8-platform-settings-db.md app/api/admin/settings/route.ts prisma/schema.prisma prisma/seed.ts types/prisma.ts`
Expected: platform-settings changes are staged.

**Step 2: Review staged diff for scope purity**

Run: `git diff --cached --stat && git diff --cached -- app/api/admin/settings/route.ts prisma/schema.prisma prisma/seed.ts lib/platform-settings.ts`
Expected: only DB-backed settings persistence and migration support.

**Step 3: Run targeted verification**

Run: `node --experimental-strip-types --test lib/platform-settings.test.ts`
Expected: PASS.

**Step 4: Commit**

Run: `git commit -m "feat: persist GEL-8 platform settings in database"`
Expected: platform settings batch is committed cleanly.

### Task 6: Stage and verify `GEL-9` CI quality gates batch

**Files:**
- Create: `.github/workflows/ci.yml`
- Create: `scripts/run-build-with-ci-env.mjs`
- Create: `docs/plans/2026-03-08-gel-9-ci-quality-gates.md`
- Create: `README.md`
- Modify: `eslint.config.mjs`
- Modify: `package.json`

**Step 1: Stage the CI files**

Run: `git add .github/workflows/ci.yml scripts/run-build-with-ci-env.mjs docs/plans/2026-03-08-gel-9-ci-quality-gates.md README.md eslint.config.mjs package.json`
Expected: CI/documentation changes are staged.

**Step 2: Review staged diff**

Run: `git diff --cached --stat && git diff --cached -- .github/workflows/ci.yml scripts/run-build-with-ci-env.mjs README.md eslint.config.mjs package.json`
Expected: lint/build/test verification workflow only.

**Step 3: Run targeted verification**

Run: `pnpm run verify`
Expected: PASS, or if too broad for current mixed tree, record why and fall back to verifying specific scripts/config shape.

**Step 4: Commit**

Run: `git commit -m "ci: add GEL-9 quality gates and verification docs"`
Expected: CI quality gates batch is committed cleanly.

### Task 7: Stage and verify `GEL-11` complimentary hardening batch

**Files:**
- Create: `lib/complimentary-flow.ts`
- Create: `lib/complimentary-flow.test.ts`
- Create: `lib/booking-state-machine.ts`
- Create: `lib/booking-validators.ts`
- Create: `docs/plans/2026-03-08-gel-11-complimentary-booking-design.md`
- Create: `docs/plans/2026-03-08-gel-11-complimentary-booking.md`
- Modify: `app/api/bookings/route.ts`
- Modify: complimentary-related admin and organizer routes/pages

**Step 1: Stage the core complimentary domain files**

Run: `git add lib/complimentary-flow.ts lib/complimentary-flow.test.ts lib/booking-state-machine.ts lib/booking-validators.ts docs/plans/2026-03-08-gel-11-complimentary-booking-design.md docs/plans/2026-03-08-gel-11-complimentary-booking.md`
Expected: the complimentary domain layer is staged.

**Step 2: Stage only complementary route/UI files that match the issue scope**

Run: `git add app/api/bookings/route.ts app/api/admin/complimentary-requests/route.ts app/api/admin/complimentary-requests/[requestId]/route.ts app/api/organizer/events/[id]/complimentary-requests/route.ts app/admin/complimentary-requests/page.tsx`
Expected: request creation, approval, duplicate prevention, and issuance visibility changes are staged.

**Step 3: Run targeted verification**

Run: `node --experimental-strip-types --test lib/complimentary-flow.test.ts`
Expected: PASS.

**Step 4: Commit**

Run: `git commit -m "feat: harden GEL-11 complimentary booking flow"`
Expected: complimentary flow batch is committed cleanly.

### Task 8: Stage and verify `GEL-19` Prisma config migration batch

**Files:**
- Create: `prisma.config.ts`
- Create: `lib/prisma-config.test.ts`
- Create: `docs/plans/2026-03-08-gel-19-prisma-config-migration.md`
- Modify: `package.json`

**Step 1: Stage the Prisma migration files**

Run: `git add prisma.config.ts lib/prisma-config.test.ts docs/plans/2026-03-08-gel-19-prisma-config-migration.md package.json`
Expected: only Prisma config migration changes are staged.

**Step 2: Review staged diff**

Run: `git diff --cached --stat && git diff --cached -- prisma.config.ts lib/prisma-config.test.ts package.json`
Expected: package.json Prisma config removed, standalone Prisma config added.

**Step 3: Run targeted verification**

Run: `node --experimental-strip-types --test lib/prisma-config.test.ts`
Expected: PASS.

**Step 4: Commit**

Run: `git commit -m "build: migrate GEL-19 Prisma config"`
Expected: Prisma config migration batch is committed cleanly.

### Task 9: Audit the remaining working tree and sync Linear

**Files:**
- Review: remaining `git status --short`
- Update: relevant Linear issues with progress notes if needed

**Step 1: Inspect leftovers**

Run: `git status --short`
Expected: remaining files are mostly `GEL-13`, `GEL-15`, `GEL-17`, or mixed items requiring manual split.

**Step 2: Summarize what was integrated**

List commit SHAs and issue identifiers.

**Step 3: Update Linear where appropriate**

Attach commit summary or comment to affected issues if needed.

**Step 4: Choose the next task**

Default next task: `GEL-13`, unless the remaining working tree proves `GEL-17` is more ready.
