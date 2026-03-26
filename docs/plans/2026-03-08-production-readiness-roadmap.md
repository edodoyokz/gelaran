# Production Readiness Roadmap Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Build a foundation-first roadmap for Gelaran that makes the beta stable around complimentary/free ticketing, then adds payment integration safely after beta.

**Architecture:** The roadmap is split into staged tracks. First establish platform guardrails and operational safety. Next stabilize the beta around complimentary booking, ticket issuance, gate access, and admin oversight. Only after those tracks are reliable should payment orchestration, webhook processing, reconciliation, and finance automation be introduced.

**Tech Stack:** Next.js 16, React 19, TypeScript, Prisma, PostgreSQL/Supabase, Midtrans, Resend, Linear MCP

---

## Scope Summary

### In scope for beta
- Runtime config validation and fail-fast startup
- Security/config hardening
- Structured logging and request correlation
- CI quality gates
- Complimentary/free ticket flow hardening
- QR issuance and gate check-in stabilization
- Admin oversight, auditability, and release checklist

### Out of scope for beta
- Live payment gateway checkout
- Real payment webhook handling in production
- Refund and reconciliation automation for paid orders

### Post-beta scope
- Payment provider abstraction
- Midtrans checkout integration
- Idempotent webhook processing
- Transaction reconciliation and refund workflows
- Finance reporting tied to paid transactions

## Phase Plan

### Phase 1: Foundation

**Outcome:** The app starts safely, deploys consistently, and exposes fewer operational risks.

**Primary files to inspect/modify later:**
- `package.json`
- `.env.example`
- `next.config.ts`
- `vercel.json`
- `lib/api/response.ts`
- `lib/supabase/server.ts`
- `app/api/admin/settings/route.ts`
- `middleware.ts`
- `.github/workflows/*` (if introduced)

**Tasks:**
1. Define env schema and fail-fast startup validation.
2. Remove demo credentials and unsafe beta shortcuts.
3. Introduce structured logging and request correlation.
4. Persist runtime/admin settings in database instead of local file writes.
5. Add baseline security headers and rate-limiting strategy.
6. Add CI commands for lint, build, and targeted tests.
7. Write release checklist and production runbook.

### Phase 2: Beta Free Ticket Core

**Outcome:** Complimentary booking works reliably end-to-end for beta users.

**Primary files to inspect/modify later:**
- `app/api/bookings/route.ts`
- `app/api/complimentary-requests/*`
- `app/api/gate/check-in/route.ts`
- `app/api/check-in/route.ts`
- `app/api/gate/access/route.ts`
- `app/api/my-bookings/*`
- `components/gate/QRScanner.tsx`
- `lib/pdf/*`
- `lib/email/send.ts`

**Tasks:**
1. Define complimentary booking state machine.
2. Harden free ticket issuance and duplicate-prevention rules.
3. Stabilize QR generation and ticket delivery.
4. Stabilize gate access and repeat check-in handling.
5. Add admin and organizer audit visibility for complimentary flows.
6. Add smoke tests for booking, ticket retrieval, and check-in.

### Phase 3: Production Hardening

**Outcome:** Core beta flows are observable, safer, and ready for broader usage.

**Primary files to inspect/modify later:**
- `lib/storage/upload.ts`
- `lib/email/client.ts`
- `lib/email/send.ts`
- `app/api/admin/*`
- `app/api/organizer/*`
- `app/api/profile/route.ts`
- `prisma/schema.prisma`

**Tasks:**
1. Tighten auth/service-role boundaries.
2. Add upload validation and safer storage policy.
3. Improve error taxonomy and operator-facing diagnostics.
4. Expand audit logs for critical mutations.
5. Add operational dashboards and alerts.

### Phase 4: Post-Beta Payments

**Outcome:** Payments are added without destabilizing the complimentary-first beta foundation.

**Primary files to inspect/modify later:**
- `app/api/payments/route.ts`
- `app/api/payments/webhook/route.ts`
- `app/api/payments/demo/route.ts`
- `lib/midtrans/client.ts`
- `prisma/schema.prisma`
- `app/admin/finance/page.tsx`
- `app/admin/refunds/page.tsx`

**Tasks:**
1. Introduce payment abstraction boundary.
2. Add idempotent order creation and webhook processing.
3. Add reconciliation model and operator tooling.
4. Add refund and payment-failure handling.
5. Add finance reporting tied to transaction truth.

## Linear Translation

### Milestones
- `Foundation`
- `Beta Free Ticket Core`
- `Production Hardening`
- `Post-Beta Payments`
- `Go-Live Readiness`

### Labels
- `foundation`
- `security`
- `ops`
- `quality`
- `complimentary`
- `auth`
- `storage`
- `observability`
- `payments`
- `release-blocker`

### Initial backlog
1. Establish runtime config validation and fail-fast startup.
2. Remove demo credentials and unsafe beta shortcuts.
3. Add structured logging and request correlation.
4. Persist admin/platform settings in database.
5. Introduce CI quality gates for lint, build, and tests.
6. Harden complimentary booking and ticket issuance flow.
7. Stabilize gate check-in and access validation.
8. Strengthen auth and role boundaries.
9. Add file upload validation and safer storage policy.
10. Design payment abstraction for post-beta Midtrans integration.
11. Create production release checklist and runbook.

## Success Criteria
- Beta can run without payment gateway dependency.
- Complimentary booking, ticket issuance, and gate validation are reliable and auditable.
- Deployment has basic safety rails: env validation, CI checks, structured logs, and release checklist.
- Payment work is isolated into a later phase without reworking booking fundamentals.
