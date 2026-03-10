# GEL-7 Structured Logging Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Add a reusable structured logging foundation with request correlation IDs, then adopt it in critical API routes first.

**Architecture:** Introduce a lightweight logging layer under `lib/logging` that emits JSON logs with consistent fields and per-request correlation context. Add request-context helpers to read or generate `x-request-id`, attach it to responses, and let route handlers log `info`, `warn`, and `error` without raw `console.*` usage.

**Tech Stack:** Next.js 16 route handlers, TypeScript, Node test runner

---

### Task 1: Add failing tests for request context helpers

**Files:**
- Create: `lib/logging/request.test.ts`
- Modify: `package.json`

**Steps:**
1. Write test proving request context reuses incoming `x-request-id`.
2. Write test proving helper generates a request id when header is absent.
3. Write test proving response helper writes `x-request-id` header.

### Task 2: Implement logging foundation

**Files:**
- Create: `lib/logging/request.ts`
- Create: `lib/logging/logger.ts`

**Steps:**
1. Add request-context factory and response header helper.
2. Add JSON logger with consistent payload shape.
3. Keep API surface small and framework-friendly.

### Task 3: Adopt logger in critical routes

**Files:**
- Modify: `app/api/bookings/route.ts`
- Modify: `app/api/payments/route.ts`
- Modify: `app/api/payments/webhook/route.ts`

**Steps:**
1. Create route context at request start.
2. Replace `console.*` in target routes with logger calls.
3. Return `x-request-id` header in target responses.

### Task 4: Verify and sync tracking

**Files:**
- Verify only

**Steps:**
1. Run targeted logging tests.
2. Run lint for touched files.
3. Update Linear issue status and notes.
