# Smoke Tests Guide

This guide defines the minimum smoke tests to run after each beta or production deployment.

## Test Inputs

Prepare these values before starting:

- `APP_URL=https://<deployment-domain>`
- One customer test account with access to complimentary booking
- One admin account
- One organizer or gate staff account
- One published event slug for browser checks
- One recent booking code for ticket and check-in validation

## Quick Smoke Tests (Run Immediately)

Run these checks as soon as the deployment is reachable.

### Public Page Reachability
```bash
APP_URL="https://<deployment-domain>"
curl -fsS "$APP_URL/" >/dev/null
curl -fsS "$APP_URL/events" >/dev/null
```
**Expected:** both pages return HTTP 200.

### Public API Reachability
```bash
APP_URL="https://<deployment-domain>"
curl -fsS "$APP_URL/api/events" >/dev/null
curl -fsS "$APP_URL/api/categories" >/dev/null
curl -fsS "$APP_URL/api/site-content" >/dev/null
```
**Expected:** all endpoints return HTTP 200 and no HTML error page.

### Deployment Metadata Check
```bash
APP_URL="https://<deployment-domain>"
curl -I "$APP_URL/"
```
**Expected:** the response is served by the expected environment and does not return `5xx`.

## Core User Journey Tests

### 1. Registration and Login

**Test Steps:**
1. Navigate to `/register`
2. Register a fresh customer account or use a pre-provisioned smoke-test account
3. Navigate to `/login`
4. Sign in
5. Confirm redirect to the expected authenticated screen

**Expected Results:**
- Registration flow loads without client or server error
- Login succeeds
- Session is persisted across page refresh

**Critical Path:** ✅ Must Pass

### 2. Event Discovery

**Test Steps:**
1. Navigate to `/events`
2. Verify event cards load
3. Filter by category
4. Search for an event
5. Open one event detail page

**Expected Results:**
- Event list loads within a few seconds
- Filters and search update results
- Event detail page loads without console errors

**Critical Path:** ✅ Must Pass

### 3. Complimentary Booking Flow

**Test Steps:**
1. Login as customer
2. Open a published event with complimentary inventory
3. Choose ticket quantity or seat when applicable
4. Submit the booking flow
5. Confirm redirect to booking confirmation or booking detail

**Expected Results:**
- Complimentary booking completes without payment errors
- Booking record is visible in `Pesanan Saya`
- Confirmation email is sent if email delivery is enabled

**Critical Path:** ✅ Must Pass

### 4. Ticket Access

**Test Steps:**
1. Navigate to `/my-bookings`
2. Open the latest booking
3. Confirm the booking detail route stays reachable at `/my-bookings/[code]`
4. Open the ticket page at `/my-bookings/[code]/ticket`
5. Verify QR code and downloadable ticket render correctly

**Expected Results:**
- Booking list loads
- Booking detail page loads on `/my-bookings/[code]`
- Ticket details are visible on `/my-bookings/[code]/ticket`
- QR code renders
- Download action succeeds when supported by the current build

**Critical Path:** ✅ Must Pass

### 5. Gate Check-in

**Test Steps:**
1. Login as organizer or gate staff
2. Open `/gate`
3. Continue to the gate/check-in page for the target event from the live gate flow
4. Scan or submit the ticket code
5. Re-scan the same ticket once

**Expected Results:**
- First scan is accepted
- Second scan is rejected or flagged as duplicate
- Invalid ticket produces clear operator feedback
- Wrong-event ticket produces clear operator feedback
- Attendance counters update correctly

**Critical Path:** ✅ Must Pass

## Admin and Operator Checks

### 1. Admin Dashboard Access

**Test Steps:**
1. Login as admin
2. Open `/admin`
3. Open `/admin/events`
4. Open `/admin/bookings`

**Expected Results:**
- Admin pages load without authorization errors
- Lists render with current data
- No blocking console or network errors

**Critical Path:** ⚠️ High Priority

### 2. Organizer Event Operations

**Test Steps:**
1. Login as organizer
2. Open one organizer event detail page
3. Verify attendees, gate, and complimentary request screens load

**Expected Results:**
- Organizer pages load with data
- No permission regression is visible
- Event operations remain usable after deployment

**Critical Path:** ⚠️ High Priority

### 3. POS Return Routes

**Test Steps:**
1. Open `/pos/payment-success`
2. Open `/pos/payment-pending`
3. Open `/pos/payment-failed`

**Expected Results:**
- Each route renders a real page instead of `404`
- Each route presents a clear return path back to `/pos` or `/pos/access`

**Critical Path:** ⚠️ Follow-up Scope

## API Checks

Use only endpoints that exist in the current codebase.

### Public Endpoints
```bash
APP_URL="https://<deployment-domain>"
curl -fsS "$APP_URL/api/events" >/dev/null
curl -fsS "$APP_URL/api/categories" >/dev/null
curl -fsS "$APP_URL/api/site-content" >/dev/null
curl -fsS "$APP_URL/api/home/top-events" >/dev/null
```

### Authenticated Operator Endpoints

These should be checked from the browser after login because they rely on the application session:

- `/api/admin/settings`
- `/api/admin/bookings`
- `/api/organizer/settings`
- `/api/gate/check-in`

**Expected:** authenticated requests succeed and unauthorized requests fail cleanly without `500` errors.

## Minimum Follow-Up Route List

Re-run at least these route checks for the gate and ticket follow-up scope:

- `/my-bookings/[code]`
- `/my-bookings/[code]/ticket`
- `/gate`
- `/pos/payment-success`
- `/pos/payment-pending`
- `/pos/payment-failed`

### Expected Response Times

| Endpoint | P50 | P95 | P99 |
|----------|-----|-----|-----|
| Home page | 300ms | 800ms | 1500ms |
| Events list page | 500ms | 1500ms | 2500ms |
| Public events API | 200ms | 700ms | 1500ms |
| Check-in submission | 300ms | 1000ms | 2000ms |

## Database Health Checks

### Connectivity Test
```bash
psql "$DATABASE_URL" -c "SELECT 1"
```
**Expected:** returns `1`.

### Critical Tables
```sql
SELECT COUNT(*) FROM "User";
SELECT COUNT(*) FROM "Event" WHERE status = 'PUBLISHED';
SELECT COUNT(*) FROM "Booking" WHERE "createdAt" > NOW() - INTERVAL '1 hour';
```

### Performance Check
```sql
SELECT count(*) FROM pg_stat_activity;
```
**Expected:** connection count is within the environment limit and not steadily increasing after deployment.

## External Service Checks

### Email Delivery
Use a real application flow that sends email, such as registration verification, organizer invitation, or complimentary booking confirmation.

**Expected:** the email is received or logged successfully in the provider dashboard.

### File Upload and Storage
Use one browser flow that uploads media or venue assets from the admin/organizer UI.

**Expected:** upload succeeds and the resulting file can be viewed from the application.

### Vendor Status
Check provider status pages when deployment symptoms suggest an upstream outage:

- Supabase: `https://status.supabase.com`
- Resend: `https://status.resend.com`
- Vercel: `https://status.vercel.com`

## Automation Snippet

This snippet is safe to run from any terminal with `curl` and validates only public routes that exist today.

```bash
#!/usr/bin/env bash
set -euo pipefail

APP_URL="${APP_URL:-https://<deployment-domain>}"

echo "Running smoke checks against $APP_URL"
curl -fsS "$APP_URL/" >/dev/null
curl -fsS "$APP_URL/events" >/dev/null
curl -fsS "$APP_URL/api/events" >/dev/null
curl -fsS "$APP_URL/api/categories" >/dev/null
curl -fsS "$APP_URL/api/site-content" >/dev/null

echo "Public smoke checks passed"
```

## Reporting

Record each deployment smoke test in the deployment report with this template:

```text
Smoke Test Report - YYYY-MM-DD
==============================

Environment: beta|production
Deployment reference: <commit or deployment id>
Operator: <name from secure ops roster>
Time started: HH:MM UTC
Time completed: HH:MM UTC

Results:
- Public pages: PASS/FAIL
- Public API endpoints: PASS/FAIL
- Registration + login: PASS/FAIL
- Complimentary booking: PASS/FAIL
- Ticket access: PASS/FAIL
- Gate check-in: PASS/FAIL
- Admin dashboard: PASS/FAIL
- Organizer operations: PASS/FAIL
- Email delivery: PASS/FAIL
- Storage upload: PASS/FAIL

Notes:
- Any degraded behavior
- Follow-up Linear issue, if created
```

## When to Run

**Required:**
- After every deployment
- After database migrations
- After configuration changes
- After rollback

**Recommended:**
- Before enabling a release-blocker fix
- After changes to auth, booking, gate, or admin flows
- During go-live readiness review

---

**Last updated:** 2026-03-10
**Operational sign-off:** Pending named owner assignment in the secure ops roster
