# Production Readiness Implementation Map

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Complete all open production-readiness issues with concrete file paths and implementation patterns.

**Generated:** 2026-03-11 by parallel codebase exploration agents

---

## Executive Summary

**Critical Blockers (P0):**
1. Actual secrets committed to repo (`.env` file)
2. No middleware.ts for centralized route protection
3. No rate limiting on any API routes

**High Priority (P1):**
1. Missing security headers (CSP, HSTS, X-Frame-Options, etc.)
2. Missing secret scanning in CI
3. Webhook route handler lacks direct tests
4. No Sentry/error tracking service

**Medium Priority (P2):**
1. Inconsistent logging patterns
2. Missing API documentation
3. Hardcoded password in seed script

---

## Issue 1: Middleware & Auth Boundaries

### Current State
- **NO `middleware.ts` EXISTS** - Critical gap
- Auth checks scattered across layouts and API routes
- Customer layout uses client-side auth check (flash risk)

### Implementation Map

| File | Action | Priority |
|------|--------|----------|
| `middleware.ts` (CREATE) | Create centralized edge-level route protection | P0 |
| `lib/auth/route-auth.ts` | Reference for `requireAdmin()`, `requireOrganizer()` helpers | - |
| `app/(customer)/layout.tsx` | Convert to server component to prevent client-side flash | P1 |
| `app/admin/layout.tsx` | Already server-side protected | OK |
| `app/organizer/layout.tsx` | Already server-side protected | OK |

### middleware.ts Pattern to Implement

```typescript
// middleware.ts - CREATE THIS FILE
import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

const PUBLIC_PATHS = ['/', '/events', '/categories', '/auth', '/login', '/register']
const ADMIN_PATHS = ['/admin', '/api/admin']
const ORGANIZER_PATHS = ['/organizer', '/api/organizer']
const GATE_PATHS = ['/gate', '/api/gate']
const POS_PATHS = ['/pos', '/api/pos']

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({ request })
  
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { cookies: { getAll: () => request.cookies.getAll(), setAll: () => {} } }
  )
  
  const { data: { user } } = await supabase.auth.getUser()
  
  const pathname = request.nextUrl.pathname
  
  // Add security headers to all responses
  response.headers.set('X-Frame-Options', 'DENY')
  response.headers.set('X-Content-Type-Options', 'nosniff')
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin')
  
  // Rate limiting headers (actual limiting would need Redis/KV)
  response.headers.set('X-Request-ID', crypto.randomUUID())
  
  // Auth path protection
  if (ADMIN_PATHS.some(p => pathname.startsWith(p)) && !user) {
    return NextResponse.redirect(new URL('/login', request.url))
  }
  
  // TODO: Add role checking via database lookup
  
  return response
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|public).*)'],
}
```

### Risk Hotspots
- `/app/(customer)/layout.tsx` - Client-side auth flash
- `/app/api/gate/*` - Device token auth, needs middleware bypass or special handling
- `/app/api/cron/*` - Bearer token auth, should bypass session check

---

## Issue 2: Rate Limiting

### Current State
- **NO RATE LIMITING IMPLEMENTED ANYWHERE**
- All 105+ API routes vulnerable to abuse

### Implementation Map

| File | Action | Priority |
|------|--------|----------|
| `lib/rate-limit.ts` (CREATE) | Create rate limiting utility | P0 |
| `middleware.ts` | Add rate limiting logic | P0 |
| `app/api/auth/*` | Strict limits (10 req/min) | P0 |
| `app/api/payments/*` | Medium limits (20 req/min) | P0 |
| `app/api/bookings/route.ts` | Medium limits (20 req/min) | P1 |
| `app/api/gate/check-in/route.ts` | Device-based limits (100 req/min) | P1 |

### lib/rate-limit.ts Pattern (Upstash)

```typescript
// lib/rate-limit.ts - CREATE THIS FILE
import { Ratelimit } from '@upstash/ratelimit'
import { Redis } from '@upstash/redis'

const redis = Redis.fromEnv()

export const globalLimit = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(1000, '1 m'),
  analytics: true,
  prefix: 'ratelimit:global',
})

export const authLimit = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(10, '1 m'),
  prefix: 'ratelimit:auth',
})

export const paymentLimit = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(20, '1 m'),
  prefix: 'ratelimit:payment',
})
```

### API Routes Needing Priority Protection

| Route | Risk Level | Recommended Limit |
|-------|------------|-------------------|
| `/api/payments/webhook` | CRITICAL | Signature verification + IP allowlist |
| `/api/payments` | HIGH | 20 req/min per user |
| `/api/bookings` | HIGH | 20 req/min per user |
| `/api/auth/callback` | HIGH | 10 req/min per IP |
| `/api/gate/check-in` | MEDIUM | 100 req/min per device |
| `/api/admin/*` | MEDIUM | 100 req/min per user |

---

## Issue 3: Security Headers

### Current State
- **NO SECURITY HEADERS CONFIGURED**
- Missing: CSP, HSTS, X-Frame-Options, X-Content-Type-Options, Referrer-Policy, Permissions-Policy

### Implementation Map

| File | Action | Priority |
|------|--------|----------|
| `middleware.ts` | Add security headers to all responses | P0 |
| `next.config.ts` | Add headers as fallback for static assets | P1 |
| `vercel.json` | Add headers for Vercel edge | P2 |

### next.config.ts Headers to Add

```typescript
// next.config.ts - ADD TO EXISTING
const nextConfig: NextConfig = {
  // ... existing config
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          { key: 'X-Frame-Options', value: 'DENY' },
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          { key: 'X-XSS-Protection', value: '1; mode=block' },
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=63072000; includeSubDomains; preload',
          },
          {
            key: 'Content-Security-Policy',
            value: "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval' js.stripe.com; style-src 'self' 'unsafe-inline'; img-src 'self' data: blob: https:; font-src 'self' data:; connect-src 'self' https://api.midtrans.com https://app.sandbox.midtrans.com;",
          },
          {
            key: 'Permissions-Policy',
            value: 'camera=(self), microphone=(), geolocation=()',
          },
        ],
      },
    ]
  },
}
```

---

## Issue 4: Secret Scanning CI

### Current State
- NO secret scanning in CI pipeline
- `.env` file with ACTUAL SECRETS committed to repo (CRITICAL)

### Implementation Map

| File | Action | Priority |
|------|--------|----------|
| `.github/workflows/ci.yml` | Add secret scanning job | P0 |
| `.env` | REMOVE from repo, rotate ALL secrets | P0 |
| `.gitignore` | Ensure `.env` is ignored | P0 |
| `scripts/sync-users-to-auth.ts` | Remove hardcoded password `password123` | P1 |

### CI Secret Scanning Job to Add

```yaml
# .github/workflows/ci.yml - ADD THIS JOB
  secret-scan:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
        with:
          fetch-depth: 0
      - name: TruffleHog Secret Scanning
        uses: trufflesecurity/trufflehog@main
        with:
          extra_args: --only-verified --fail

  dependency-audit:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v4
        with:
          version: 10.28.0
      - uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: 'pnpm'
      - run: pnpm install --frozen-lockfile
      - run: pnpm audit --audit-level=moderate
```

### Secrets to Rotate Immediately

| Secret | File | Action |
|--------|------|--------|
| `DATABASE_URL` | `.env` | Rotate DB password |
| `SUPABASE_SERVICE_ROLE_KEY` | `.env` | Regenerate in Supabase dashboard |
| `RESEND_API_KEY` | `.env` | Regenerate in Resend dashboard |
| `MIDTRANS_SERVER_KEY` | `.env` | Regenerate in Midtrans dashboard |
| Hardcoded password | `scripts/sync-users-to-auth.ts:19` | Remove entirely |

---

## Issue 5: Observability (Logging/Sentry)

### Current State
- Custom structured logger exists (`lib/logging/logger.ts`)
- NO Sentry/error tracking service
- Inconsistent logging (console.log in cron jobs)
- NO middleware request logging

### Implementation Map

| File | Action | Priority |
|------|--------|----------|
| `package.json` | Add `@sentry/nextjs` dependency | P1 |
| `sentry.client.config.ts` (CREATE) | Sentry client config | P1 |
| `sentry.server.config.ts` (CREATE) | Sentry server config | P1 |
| `sentry.edge.config.ts` (CREATE) | Sentry edge config | P1 |
| `middleware.ts` | Add request logging | P1 |
| `lib/logging/logger.ts` | Already implemented, use everywhere | OK |
| `app/api/cron/*.ts` | Migrate to structured logger | P2 |

### Sentry Installation

```bash
pnpm add @sentry/nextjs
npx @sentry/wizard@latest -i nextjs
```

### Files Already Using Structured Logger
- `app/api/payments/webhook/route.ts`
- `app/api/payments/route.ts`
- `app/api/gate/check-in/route.ts`
- `app/api/bookings/route.ts`

### Files Using console.log (Need Migration)
- `app/api/cron/end-past-events/route.ts`
- `app/api/cron/send-reminders/route.ts`
- `app/api/cron/cleanup-expired-bookings/route.ts`
- `lib/email/send.ts`

---

## Issue 6: Webhook Idempotency Tests

### Current State
- Logic tested via `lib/payments/webhook-transitions.test.ts`
- Route handler NOT tested directly
- Idempotency logic tested via `lib/payments/idempotency.test.ts`

### Implementation Map

| File | Action | Priority |
|------|--------|----------|
| `app/api/payments/webhook/route.test.ts` (CREATE) | Integration tests for webhook route | P1 |
| `lib/payments/webhook-transitions.test.ts` | Already comprehensive | OK |
| `lib/payments/idempotency.test.ts` | Already comprehensive | OK |

### Webhook Route Test Cases to Add

```typescript
// app/api/payments/webhook/route.test.ts - CREATE THIS FILE
import { describe, it, expect, beforeEach, mock } from 'node:test'
import assert from 'node:assert/strict'

describe('POST /api/payments/webhook', () => {
  it('should reject requests without signature', async () => {})
  it('should reject requests with invalid signature', async () => {})
  it('should process valid webhook once (idempotency)', async () => {})
  it('should handle duplicate webhooks gracefully', async () => {})
  it('should ignore webhooks for unknown orders', async () => {})
  it('should update booking status on payment success', async () => {})
  it('should send confirmation email on success', async () => {})
  it('should log audit trail for all webhooks', async () => {})
  it('should handle concurrent webhooks for same order', async () => {})
})
```

---

## Issue 7: Runbook Docs

### Current State
- Operations runbooks EXIST and are comprehensive
- Missing: API documentation, Database schema docs, Architecture docs

### Implementation Map

| File | Action | Priority |
|------|--------|----------|
| `docs/api/README.md` (CREATE) | API endpoint documentation | P1 |
| `docs/database/README.md` (CREATE) | Prisma schema documentation | P2 |
| `docs/architecture/README.md` (CREATE) | System architecture overview | P2 |
| `docs/operations/README.md` | Already comprehensive | OK |
| `docs/operations/incident-response.md` | Already comprehensive | OK |

### Existing Runbooks (Already Good)
- `docs/operations/deployment-procedure.md`
- `docs/operations/rollback-procedure.md`
- `docs/operations/pre-deployment-checklist.md`
- `docs/operations/smoke-tests.md`
- `docs/operations/incident-response.md`
- `docs/operations/operator-ownership.md`

---

## Risk Hotspots Summary

| Risk | Severity | Files | Action |
|------|----------|-------|--------|
| Secrets in repo | CRITICAL | `.env` | Remove, rotate, add to .gitignore |
| No middleware | CRITICAL | `middleware.ts` (missing) | Create with auth + headers |
| No rate limiting | CRITICAL | All API routes | Implement Upstash rate limiting |
| Client-side auth flash | HIGH | `app/(customer)/layout.tsx` | Convert to server component |
| Hardcoded password | HIGH | `scripts/sync-users-to-auth.ts:19` | Remove |
| No secret scanning CI | HIGH | `.github/workflows/ci.yml` | Add TruffleHog |
| Missing security headers | HIGH | `middleware.ts`, `next.config.ts` | Add OWASP headers |
| No Sentry | MEDIUM | All | Install @sentry/nextjs |
| Inconsistent logging | MEDIUM | Cron jobs, email | Migrate to structured logger |
| Webhook route untested | MEDIUM | `app/api/payments/webhook/route.ts` | Add integration tests |

---

## Priority Implementation Order

### Phase 1: Critical Security (Do First)
1. **Remove `.env` from repo** - Rotate all secrets
2. **Create `middleware.ts`** - Auth boundaries + security headers
3. **Add rate limiting** - Protect all API routes
4. **Add secret scanning to CI** - Prevent future leaks

### Phase 2: Hardening
5. **Add Sentry** - Production error tracking
6. **Convert customer layout to server component** - Prevent auth flash
7. **Remove hardcoded password** - Security hygiene
8. **Add security headers to next.config.ts** - Fallback for static

### Phase 3: Observability & Tests
9. **Migrate cron jobs to structured logger** - Consistent logging
10. **Add webhook route integration tests** - Critical path coverage
11. **Create API documentation** - `docs/api/README.md`

### Phase 4: Documentation
12. **Create database schema docs** - `docs/database/README.md`
13. **Create architecture docs** - `docs/architecture/README.md`
14. **Add Dependabot** - `.github/dependabot.yml`

---

## Files to Create

| File | Purpose |
|------|---------|
| `middleware.ts` | Auth boundaries, security headers, rate limiting |
| `lib/rate-limit.ts` | Rate limiting utilities |
| `sentry.client.config.ts` | Sentry client configuration |
| `sentry.server.config.ts` | Sentry server configuration |
| `sentry.edge.config.ts` | Sentry edge configuration |
| `app/api/payments/webhook/route.test.ts` | Webhook integration tests |
| `docs/api/README.md` | API documentation |
| `docs/database/README.md` | Database schema documentation |
| `docs/architecture/README.md` | Architecture documentation |
| `.github/dependabot.yml` | Dependency updates |

## Files to Modify

| File | Change |
|------|--------|
| `.gitignore` | Ensure `.env` is ignored |
| `next.config.ts` | Add security headers |
| `.github/workflows/ci.yml` | Add secret scanning, dependency audit |
| `app/(customer)/layout.tsx` | Convert to server component |
| `scripts/sync-users-to-auth.ts` | Remove hardcoded password |
| `lib/env.ts` | Add CRON_SECRET, OPS_ALERT_WEBHOOK_URL validation |
| `.env.example` | Document missing env vars |

## Files to Delete

| File | Reason |
|------|--------|
| `.env` | Contains actual secrets - should never be committed |

---

## Next Steps

1. **Confirm this map with user** - Validate priorities match business needs
2. **Create implementation plan** - Break into bite-sized tasks per writing-plans skill
3. **Execute in priority order** - P0 blockers first, then P1, P2

**Ready for execution? Choose approach:**
- **Subagent-Driven (this session)** - I dispatch fresh subagent per task, review between tasks
- **Parallel Session (separate)** - Open new session with executing-plans skill