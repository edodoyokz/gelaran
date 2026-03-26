# Master Launch Inventory Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Build one active documentation file that inventories Gelaran by role, journey, domain, and launch-readiness section for internal technical use and LLM parsing.

**Architecture:** The implementation will derive facts from active docs, route surfaces, API surfaces, and Prisma models, then normalize them into one Markdown document under `docs/`. The document will be structured in fixed sections so it can support manual audit, launch-readiness review, and future machine-assisted task generation.

**Tech Stack:** Markdown, Next.js app routes, Next.js route handlers, Prisma schema, existing operations docs, git history

---

### Task 1: Create the destination document scaffold

**Files:**
- Create: `docs/master-launch-inventory.md`
- Reference: `docs/README.md`
- Reference: `docs/product/requirements.md`

**Step 1: Write the initial document skeleton**

Add the top-level sections:

- title and metadata
- status legend
- role matrix
- journey matrix
- domain inventory
- surface inventory index
- beta readiness checklist
- launch summary

**Step 2: Verify the section order matches the approved design**

Check that the headings are stable and use plain Markdown without nested structures that are hard for LLM parsing.

**Step 3: Commit**

```bash
git add docs/master-launch-inventory.md
git commit -m "docs: add master launch inventory scaffold"
```

### Task 2: Populate document metadata and status rules

**Files:**
- Modify: `docs/master-launch-inventory.md`
- Reference: `README.md`
- Reference: `docs/README.md`
- Reference: `docs/go-live/README.md`

**Step 1: Add usage guidance**

Document:

- purpose
- audience
- how to use the file
- how it relates to `docs/operations/` and `docs/go-live/`

**Step 2: Add normalized status definitions**

Include exact definitions for:

- `implemented`
- `partial`
- `needs-validation`
- `missing`
- `beta-blocker`

**Step 3: Review for duplication risk**

Ensure this section points to runbooks instead of copying operational procedures.

**Step 4: Commit**

```bash
git add docs/master-launch-inventory.md
git commit -m "docs: define master launch inventory metadata and status model"
```

### Task 3: Build the role matrix from schema and route protections

**Files:**
- Modify: `docs/master-launch-inventory.md`
- Reference: `prisma/schema.prisma`
- Reference: `lib/auth/route-auth.ts`
- Reference: `lib/auth/role-helpers.ts`
- Reference: `app/admin/layout.tsx`
- Reference: `app/organizer/layout.tsx`
- Reference: `docs/operations/operator-ownership.md`

**Step 1: Enumerate application roles**

Map:

- `CUSTOMER`
- `ORGANIZER`
- `ADMIN`
- `SUPER_ADMIN`

And supporting operational roles from organizer team flows:

- `MANAGER`
- `SCANNER`
- `FINANCE`

**Step 2: For each role, write capability summaries**

For each role include:

- objective
- key pages
- key APIs
- critical permissions
- launch risks

**Step 3: Validate role wording against actual code**

Do not invent roles not backed by schema or protected routes.

**Step 4: Commit**

```bash
git add docs/master-launch-inventory.md
git commit -m "docs: add role matrix to master launch inventory"
```

### Task 4: Build the journey matrix from app routes and API handlers

**Files:**
- Modify: `docs/master-launch-inventory.md`
- Reference: `app/(auth)/**`
- Reference: `app/(customer)/**`
- Reference: `app/checkout/**`
- Reference: `app/organizer/**`
- Reference: `app/admin/**`
- Reference: `app/pos/**`
- Reference: `app/gate/**`
- Reference: `app/api/**`

**Step 1: List core journeys**

Add sections for:

- auth and onboarding
- organizer application
- event creation to publish
- discovery to checkout
- booking management
- ticket transfer
- refund flow
- complimentary request flow
- POS selling
- gate access and check-in
- admin moderation and finance
- organizer wallet and payouts

**Step 2: For each journey, map supporting surfaces**

For each journey include:

- actors
- entry points
- pages
- APIs
- core entities
- edge cases
- readiness checks

**Step 3: Mark uncertain areas as `needs-validation`**

If code exists but business completion is unclear, do not mark it fully ready.

**Step 4: Commit**

```bash
git add docs/master-launch-inventory.md
git commit -m "docs: add journey matrix to master launch inventory"
```

### Task 5: Build the domain inventory

**Files:**
- Modify: `docs/master-launch-inventory.md`
- Reference: `app/**`
- Reference: `app/api/**`
- Reference: `components/**`
- Reference: `prisma/schema.prisma`

**Step 1: Group the codebase into domains**

Create normalized sections for:

- auth and identity
- users and profiles
- organizer operations
- events
- venue and seating
- ticketing and pricing
- bookings
- payments and webhooks
- refunds and complimentary
- customer surfaces
- reviews and social
- notifications
- POS
- gate
- admin
- finance and payouts
- content management
- cron jobs
- ops and launch docs

**Step 2: For each domain, fill the fixed schema**

Each domain must include:

- purpose
- involved roles
- pages
- APIs
- entities
- business rules
- dependencies
- current status
- blockers
- checklist

**Step 3: Keep sections factual**

Only state what can be derived from the current repository and active docs.

**Step 4: Commit**

```bash
git add docs/master-launch-inventory.md
git commit -m "docs: add domain inventory to master launch inventory"
```

### Task 6: Add the surface inventory index

**Files:**
- Modify: `docs/master-launch-inventory.md`
- Reference: `app/**`
- Reference: `app/api/**`
- Reference: `components/**`
- Reference: `prisma/schema.prisma`

**Step 1: Create grouped page route index**

Group routes by audience and feature area instead of a raw dump.

**Step 2: Create grouped API index**

Group route handlers by business domain.

**Step 3: Create grouped component and entity indices**

Summarize:

- feature components
- admin components
- organizer components
- POS/gate components
- Prisma entities

**Step 4: Commit**

```bash
git add docs/master-launch-inventory.md
git commit -m "docs: add surface inventory index"
```

### Task 7: Add beta readiness checklist and launch summary

**Files:**
- Modify: `docs/master-launch-inventory.md`
- Reference: `docs/go-live/go-live-readiness-review.md`
- Reference: `docs/go-live/go-live-checklist.md`
- Reference: `docs/operations/smoke-tests.md`
- Reference: `docs/operations/pre-deployment-checklist.md`

**Step 1: Add per-section readiness checklist**

Categorize by:

- must validate before beta
- must fix before beta
- should improve before public launch
- can defer after beta

**Step 2: Add launch summary**

Summarize:

- ready areas
- partial areas
- blocked areas
- recommended next execution order

**Step 3: Cross-check with known go-live blockers**

Ensure open blocker areas match the go-live review package and current code reality.

**Step 4: Commit**

```bash
git add docs/master-launch-inventory.md
git commit -m "docs: add beta readiness summary to master launch inventory"
```

### Task 8: Validate the document for technical and LLM readability

**Files:**
- Modify: `docs/master-launch-inventory.md`

**Step 1: Run a manual structure review**

Check:

- heading consistency
- stable terminology
- section completeness
- absence of duplicated runbook detail

**Step 2: Run repository verification if any links or docs tooling is affected**

Run:

```bash
pnpm run verify
```

Expected:

- existing verification passes, or
- failures are documented if unrelated to the documentation change

**Step 3: Final commit**

```bash
git add docs/master-launch-inventory.md
git commit -m "docs: finalize master launch inventory"
```

### Task 9: Update documentation index if needed

**Files:**
- Modify: `docs/README.md`
- Possibly modify: `README.md`

**Step 1: Link the new active inventory document**

Add `docs/master-launch-inventory.md` to the active docs index if it is intended to be part of the standard documentation entry points.

**Step 2: Verify link placement**

Keep the root README concise and avoid duplicating the docs index.

**Step 3: Commit**

```bash
git add docs/README.md README.md
git commit -m "docs: link master launch inventory from documentation index"
```
