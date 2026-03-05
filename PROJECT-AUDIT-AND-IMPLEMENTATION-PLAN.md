# Project Audit & Implementation Plan (Execution Roadmap)

**Project:** Gelaran / BSC Event Ticketing Platform  
**Document purpose:** Single source of truth consolidating audit outputs + the implementation roadmap for execution.  
**Date:** 2026-02-09  

---

## Executive summary

The codebase contains a substantial, working baseline for a multi-role event ticketing platform (Admin / Organizer / Customer) with key operational modules already present (event catalog, booking, basic payments integration scaffolding, admin back-office, organizer tooling, seating models + endpoints, POS + gate flows). Core build/dev flows are working, but the repository is **not currently “release-ready”** due to quality and security gaps.

**Most important risks to address first**

1. **Secrets are committed to the repository** in [`env`](env) (DB credentials, Supabase service role key, Resend API key). Rotate/revoke immediately.
2. **Cron endpoints are effectively public** when `CRON_SECRET` is unset (fail-open auth pattern); see [`app/api/cron/send-reminders/route.ts`](app/api/cron/send-reminders/route.ts).
3. **No centralized security middleware** (no [`middleware.ts`](middleware.ts) present), leading to duplicated authz patterns and uneven protection across routes.
4. Engineering hygiene gaps: lint fails (42 errors), typecheck fails (missing Jest types), and there is no `test` script in [`package.json`](package.json).
5. Payments are blocked in non-demo environments because **Midtrans env vars are missing**; see [`lib/midtrans/client.ts`](lib/midtrans/client.ts).

This roadmap prioritizes: **(Milestone 0) stabilize + unblock CI**, **(Milestone 1) production hardening**, then feature delivery for planned items: **FAQ**, **CS ticket system**, **tax calculator**, **commission calculator**, and **seating integration**.

---

## Requirements & scope

### Objective (from requirements doc)

The platform is intended to provide a local Ticketing Management System (TMS) + on-ground ticketing for events/venues in Solo/Surakarta, with the expectation it can scale to broader adoption. (Source: [`PROJECT-REQ-UPDATE.md`](PROJECT-REQ-UPDATE.md))

### Planned items in scope (explicit “fitur yang akan di update”)

From [`PROJECT-REQ-UPDATE.md`](PROJECT-REQ-UPDATE.md):

- **FAQ page**
- **Customer Service (CS) ticket system** (fallback when Q&A not answered by FAQ)
- **Local/regional tax calculator** (“kalkulator pajak daerah”)
- **Commission fee calculator** (“kalkulator commission fee”)
- **Seating plan integration** (“seating plan (soon) … demo beli tiket duduk per kategori”)

### Roles (current + implied)

Documented demo roles and accounts (sources: [`QUICK-START.md`](QUICK-START.md), [`SEED-DATA.md`](SEED-DATA.md)):

- **Admin (SUPER_ADMIN / ADMIN)**: platform-wide operations and configuration.
- **Organizer**: manages events, ticket types, pricing, schedules, venue/seating, etc.
- **Customer**: browses events and purchases tickets.

Additional roles implied by routes/modules:

- **Gate / on-ground staff**: check-in + device sessions (see [`app/api/gate`](app/api/gate)).
- **POS operator**: on-site ticket selling (see [`app/pos/page.tsx`](app/pos/page.tsx)).

### Seed/demo scope

Seed instructions and demo credentials are explicitly documented in [`SEED-DATA.md`](SEED-DATA.md), and demo login behavior is documented in [`QUICK-START.md`](QUICK-START.md).

---

## Current implementation snapshot

### Product surface (high-level)

- **Auth & onboarding:** login/register/forgot/reset flows exist under [`app/(auth)`](app/(auth)).
- **Customer experience:** dashboard + bookings + profile + wishlist exist under [`app/(customer)`](app/(customer)).
- **Admin back-office:** extensive admin UI exists under [`app/admin`](app/admin).
- **Organizer tooling:** organizer UI exists (events management, FAQ management, gate settings, etc.) under [`app/organizer`](app/organizer).
- **POS & Gate flows:** POS UI at [`app/pos/page.tsx`](app/pos/page.tsx); gate APIs under [`app/api/gate`](app/api/gate).

### Notable implemented “planned items” (partial)

- **FAQ:** exists in multiple forms (customer docs + per-event FAQ page + organizer FAQ management); see [`app/events/[slug]/faq/page.tsx`](app/events/[slug]/faq/page.tsx) and [`app/organizer/events/[id]/faq/page.tsx`](app/organizer/events/[id]/faq/page.tsx).
- **Tax + commission:** tax rate CRUD API exists (admin); see [`app/api/admin/tax-rates/route.ts`](app/api/admin/tax-rates/route.ts). Commission settings APIs exist under [`app/api/admin/commission-settings`](app/api/admin/commission-settings). A pricing calculation test exists in [`lib/pricing/__tests__/calculate.test.ts`](lib/pricing/__tests__/calculate.test.ts).
- **Seating:** Prisma models and seat endpoints exist (e.g. seat and venue map APIs); see [`app/api/events/[slug]/seats/route.ts`](app/api/events/[slug]/seats/route.ts) and [`app/api/events/[slug]/venue-map/route.ts`](app/api/events/[slug]/venue-map/route.ts).

---

## Technical audit

### Build / run status (as audited)

- `pnpm install`: ✅ OK
- `pnpm build`: ✅ OK
- `pnpm dev`: ✅ OK

### Quality gates

- **Lint:** ❌ fails with **42 errors** (needs cleanup before enforcing CI).
- **Typecheck:** ❌ fails due to missing Jest types (tests import Jest globals) and no test tooling wiring.
  - Evidence of Jest usage: [`lib/pricing/__tests__/calculate.test.ts`](lib/pricing/__tests__/calculate.test.ts)
  - Missing scripts: no `test` script in [`package.json`](package.json)

### Tooling & configuration notes

- ESLint uses Next.js presets (core web vitals + TypeScript); see [`eslint.config.mjs`](eslint.config.mjs).
- TypeScript is strict, `noEmit`, and uses `moduleResolution: bundler`; see [`tsconfig.json`](tsconfig.json).

### Environment / integration blockers

- **Missing Midtrans env vars** cause runtime failures where Midtrans is used:
  - `MIDTRANS_SERVER_KEY` and `NEXT_PUBLIC_MIDTRANS_CLIENT_KEY` are required by [`lib/midtrans/client.ts`](lib/midtrans/client.ts) and are currently missing from [`env`](env).

---

## Feature matrix & gaps

Legend: **Done** = end-to-end usable; **Partial** = exists but missing critical flows/UX/security; **Missing** = not implemented.

| Module | Status | Notes / evidence |
|---|---:|---|
| Authentication (Supabase) | Partial | Flows exist under [`app/(auth)`](app/(auth)); needs production hardening (demo mode, policy, rate limiting). |
| Demo login mode | Done (dev/demo) | Documented in [`QUICK-START.md`](QUICK-START.md); must be disabled in production. |
| Customer event discovery + purchase | Partial | Core pages exist under [`app/events`](app/events) and customer area under [`app/(customer)`](app/(customer)); confirm full paid checkout path w/ Midtrans env + webhook validation. |
| Admin back-office (events/users/finance/etc.) | Partial | Many pages exist under [`app/admin`](app/admin); needs lint/typecheck stabilization + security consistency. |
| Organizer event management | Partial | Present under [`app/organizer`](app/organizer); confirm permissions and consistency across APIs. |
| Payments (Midtrans) | Partial | Integration scaffold exists in [`lib/midtrans/client.ts`](lib/midtrans/client.ts); env vars missing in [`env`](env). |
| Refund workflow | Partial | Customer refund route exists under [`app/(customer)/my-bookings/[code]/refund`](app/(customer)/my-bookings/[code]/refund); verify end-to-end behavior + admin controls. |
| Notifications/email (Resend) | Partial | Used by cron reminders and other routes; must secure cron + remove committed secrets in [`env`](env). |
| Cron jobs (cleanup, end events, reminders) | Partial | Implemented under [`app/api/cron`](app/api/cron); auth is fail-open when `CRON_SECRET` unset. |
| Seating (data models + APIs) | Partial | Seat/venue-map APIs exist; full checkout seat locking/concurrency and organizer UX integration need completion. |
| POS (on-ground selling) | Partial | UI exists in [`app/pos/page.tsx`](app/pos/page.tsx); seat-based pricing logic noted as simplified. |
| Gate check-in | Partial | Gate endpoints exist under [`app/api/gate`](app/api/gate); confirm device auth + rate limiting + audit logging completeness. |
| FAQ page | Partial | Event FAQ pages exist; also docs FAQ exists under [`app/docs/customer/faq/page.tsx`](app/docs/customer/faq/page.tsx). Need official “FAQ” per requirements and a support escalation flow. |
| CS ticket system | Missing | Requirement from [`PROJECT-REQ-UPDATE.md`](PROJECT-REQ-UPDATE.md). |
| Tax calculator | Partial | Admin tax rate management exists (`TaxRate`), but no dedicated calculator UX and no explicit “regional tax calculator” flow. |
| Commission calculator | Partial | Commission settings exist; dedicated calculator UX not evident. |

---

## Data & integrations

### Summary

Data layer and integrations were audited in detail in [`DATA-INTEGRATIONS-AUDIT.md`](DATA-INTEGRATIONS-AUDIT.md). Key takeaways:

- Prisma schema validate/generate are **OK**.
- There are **migration risks** (manual migration outside Prisma’s tracking) and naming/lockfile concerns.
- **Seed reproducibility** is not fully reliable due to pooled connection timeouts and non-idempotent assumptions.
- Several **missing or ambiguous constraints** should be addressed (e.g., review uniqueness, default tax enforcement).
- Integration env coverage is incomplete (Midtrans keys missing).

### Key findings (high-signal)

- Prisma is healthy (`validate`/`generate` ✅) and has many indexes, but schema-level invariants are not complete (see report).
- Manual SQL migration exists and must be carefully coordinated to avoid drift; see [`prisma/migrations/manual_phase3_venue_editor.sql`](prisma/migrations/manual_phase3_venue_editor.sql).
- Seed scripts rely on `DIRECT_URL` to avoid pooler issues; ensure the deployment/dev story is consistent and documented.

---

## Security audit

### Critical findings (must fix before production)

1. **Committed secrets:** repository contains live credentials in [`env`](env) (DB URLs, Supabase service role key, Resend API key). Immediate rotation + remove from git history is required.
2. **Cron auth fail-open:** cron endpoints only enforce Authorization if `CRON_SECRET` is set; otherwise they run without auth. Evidence: [`app/api/cron/send-reminders/route.ts`](app/api/cron/send-reminders/route.ts), [`app/api/cron/cleanup-expired-bookings/route.ts`](app/api/cron/cleanup-expired-bookings/route.ts), [`app/api/cron/end-past-events/route.ts`](app/api/cron/end-past-events/route.ts).
3. **No centralized middleware:** there is no Next.js middleware layer (no [`middleware.ts`](middleware.ts)) to apply uniform authn/authz, rate limits, request validation, and security headers.

### High findings

- **Demo mode risks:** quick-login and shared demo passwords are documented in [`QUICK-START.md`](QUICK-START.md) and [`SEED-DATA.md`](SEED-DATA.md). If enabled in production, this becomes a critical auth bypass.
- **Server-side Supabase service role usage:** service role key is present in [`env`](env) and referenced by server utilities (see integration mapping in [`DATA-INTEGRATIONS-AUDIT.md`](DATA-INTEGRATIONS-AUDIT.md)). Must ensure it is never exposed client-side and access paths are minimal.
- **Payment/webhook trust boundary:** Midtrans integration exists in [`lib/midtrans/client.ts`](lib/midtrans/client.ts) and webhook route exists (see integration mapping in [`DATA-INTEGRATIONS-AUDIT.md`](DATA-INTEGRATIONS-AUDIT.md)). Ensure webhook verification and idempotency are enforced.

### Medium findings

- **Inconsistent authorization patterns across APIs:** several routes do per-route `isAdmin` checks (e.g. [`app/api/admin/tax-rates/route.ts`](app/api/admin/tax-rates/route.ts)), which is correct but inconsistent at scale without shared middleware.
- **Operational safety:** cron endpoints perform impactful operations (expiring bookings, sending emails) and should have strict auth + logging + rate limiting.

### Production hardening checklist

**Secrets & configuration**

- [ ] Rotate/revoke all credentials present in [`env`](env) and remove secrets from repository history.
- [ ] Replace committed env with `.env.example` pattern and ensure `.env` is gitignored.
- [ ] Ensure `CRON_SECRET` is required in production and consistently enforced.
- [ ] Add missing Midtrans env vars (`MIDTRANS_SERVER_KEY`, `NEXT_PUBLIC_MIDTRANS_CLIENT_KEY`) and validate deployment config.

**Security controls**

- [ ] Implement centralized request authn/authz policy (middleware and/or shared route guard utilities) and apply uniformly across sensitive routes.
- [ ] Add rate limiting and abuse protections for auth endpoints, cron, and webhooks.
- [ ] Ensure webhook verification, signature checks, and idempotency for Midtrans notifications.

**Auditability & ops**

- [ ] Ensure sensitive operations are logged (who/what/when), and logs do not leak secrets.
- [ ] Establish minimal monitoring for cron executions and failures.

---

## Milestones plan (0..4)

### Milestone 0 — Stabilize the engineering baseline (CI-ready)

**Goal:** make the repo reliably buildable and “merge-safe.”

**Deliverables**

- Lint passing (address existing 42 errors).
- Typecheck passing (add Jest types/tooling or refactor tests).
- Add a test script + minimal runner wiring.
- Ensure local onboarding is documented (install/build/dev/seed).

**Exit criteria**

- `pnpm lint` passes.
- `pnpm build` passes.
- `pnpm` typecheck step (or equivalent) passes.
- `pnpm test` (or equivalent) runs and passes.

### Milestone 1 — Production hardening & security fixes

**Goal:** close critical security gaps and harden public-facing interfaces.

**Deliverables**

- Secrets rotation + removal from repo.
- Cron endpoints require auth (no fail-open) and are monitored.
- Centralized authn/authz patterns (middleware/shared guards).
- Payment/webhook verification and idempotency.

**Exit criteria**

- No secrets in repo; deployment uses proper secret management.
- Cron cannot be triggered without credentials.
- Webhook endpoint rejects invalid signatures and handles retries safely.

### Milestone 2 — Finance feature completion (tax + commission)

**Goal:** complete “tax calculator” + “commission calculator” as user-facing/admin-facing tools.

**Deliverables**

- Tax calculation rules documented and exposed in UI.
- Commission fee calculator UI consistent with stored commission settings.
- Pricing logic covered with unit tests (starting with [`lib/pricing/__tests__/calculate.test.ts`](lib/pricing/__tests__/calculate.test.ts)).

**Exit criteria**

- Users/admin can compute totals with tax + commission reliably.
- Tests cover core pricing logic.

### Milestone 3 — Support experience (FAQ + CS tickets)

**Goal:** fulfill the planned support flow: FAQ first, then CS ticket escalation.

**Deliverables**

- Canonical FAQ page(s) and structured FAQ management.
- CS ticket system (customer creates ticket; staff/admin responds; status tracking; notifications).
- Optional: SLA tags, categories, and reporting.

**Exit criteria**

- Customers can self-serve via FAQ and open/track support tickets.
- Admin/staff can manage tickets with audit trails.

### Milestone 4 — Seating integration end-to-end

**Goal:** deliver robust seating selection, locking, purchase, and on-ground flows.

**Deliverables**

- Seat selection integrated into checkout and POS.
- Concurrency controls (locking/expiry) validated.
- Organizer seating/venue management workflows finalized.

**Exit criteria**

- Seat-based events support category-based and seat-specific purchasing without double-booking.

---

## Backlog (top 15)

1. **Rotate/revoke committed secrets** and eliminate [`env`](env) from repo history; replace with `.env.example`.
2. **Fix cron auth fail-open** by making `CRON_SECRET` required (at least in production) and enforcing strict auth in [`app/api/cron`](app/api/cron).
3. Add centralized authn/authz policy (middleware/shared utilities); address absence of [`middleware.ts`](middleware.ts).
4. Make lint pass (resolve the 42 ESLint errors).
5. Make typecheck pass (add Jest types + runner or refactor tests).
6. Add `test` script and minimal unit testing pipeline in [`package.json`](package.json).
7. Add missing Midtrans env vars and validate payment flows using [`lib/midtrans/client.ts`](lib/midtrans/client.ts).
8. Ensure Midtrans webhook verification + idempotency (see webhook route referenced in [`DATA-INTEGRATIONS-AUDIT.md`](DATA-INTEGRATIONS-AUDIT.md)).
9. Seed reliability: document/standardize seeding approach; mitigate pooler timeouts (see [`DATA-INTEGRATIONS-AUDIT.md`](DATA-INTEGRATIONS-AUDIT.md)).
10. Resolve migration drift risks around manual SQL migration [`prisma/migrations/manual_phase3_venue_editor.sql`](prisma/migrations/manual_phase3_venue_editor.sql).
11. Add missing/ambiguous DB constraints (review uniqueness, default tax enforcement, commission scope precedence) per [`DATA-INTEGRATIONS-AUDIT.md`](DATA-INTEGRATIONS-AUDIT.md).
12. Implement canonical FAQ UX per requirements (customer-facing) and connect to organizer/admin-managed FAQ content.
13. Implement CS ticket system (customer → staff/admin), including notifications.
14. Implement tax calculator UX (regional rules + transparency) and ensure it maps to `TaxRate` data via [`app/api/admin/tax-rates/route.ts`](app/api/admin/tax-rates/route.ts).
15. Implement commission calculator UX tied to commission settings APIs under [`app/api/admin/commission-settings`](app/api/admin/commission-settings).

---

## Delivery checklist (Definition of Done)

**Engineering / quality**

- [ ] Lint passes and no new lint errors introduced.
- [ ] Typecheck passes.
- [ ] Automated tests exist for critical logic and pass in CI.
- [ ] Changes are documented (user-facing + developer-facing).

**Security / compliance**

- [ ] No secrets committed; all sensitive config is injected via deployment secrets.
- [ ] Authn/authz is consistently enforced for protected routes.
- [ ] Sensitive endpoints (cron/webhooks/admin) are protected and monitored.

**Data integrity**

- [ ] Migrations are reproducible and tracked; manual steps are documented.
- [ ] Seed is reproducible for demo/dev.
- [ ] Constraints cover business invariants where feasible.

**Operational readiness**

- [ ] Observability: logs/metrics for critical background jobs.
- [ ] On-call runbook notes for cron failures, webhook failures, and seed/migration issues.

---

## Immediate next actions

Execute these in order to reduce risk fastest:

1. **Revoke and rotate all secrets** currently present in [`env`](env) and remove them from the repository.
2. **Set and enforce `CRON_SECRET`** for all cron routes under [`app/api/cron`](app/api/cron) to eliminate unauthenticated execution.
3. **Decide the testing approach** (Jest vs alternative) and wire it into scripts; address `@jest/globals` usage in [`lib/pricing/__tests__/calculate.test.ts`](lib/pricing/__tests__/calculate.test.ts).
4. **Fix lint errors** and make `pnpm lint` a required CI step.
5. **Add Midtrans env vars** required by [`lib/midtrans/client.ts`](lib/midtrans/client.ts), then validate the full paid checkout + webhook path.
