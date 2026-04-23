# Go-Live Evidence Log

This log records the evidence gathered during the current readiness review. The package now reflects a beta-ready decision with live proof for the previously blocked critical flows plus the newly elevated beta-critical follow-up gates, with the remaining non-blocking caveats called out explicitly.

Back to package index: [Go-Live Readiness Package](./README.md)

## Launch Metadata

| Field | Record |
|-------|--------|
| Environment | Beta decision / go-live readiness |
| Deployment reference | No production deployment approved |
| Commit SHA or release tag | Readiness review only; mixed working tree |
| Operator | Ahmad Ridho |
| Start time | 2026-04-08 |
| End time | 2026-04-08 19:24 +07:00 |

## Beta Gate Snapshot

| Gate | Status | Evidence summary |
|------|--------|------------------|
| Critical flow complete | PASS | Manual-payment and complimentary cross-role proofs are both captured live |
| Quality gates clean | PASS | Targeted tests and `typecheck` are recorded as passing in the current local verification pass |
| Environment gates complete | PASS | `NEXT_PUBLIC_APP_STAGE="beta"`, private proof-storage posture was verified, and the app target was reachable |
| Real verification evidence | PASS | Live organizer/admin and customer/admin evidence now exists for both critical flows |
| Follow-up beta-critical gates complete | PASS | Gate/check-in and ticket print/download/QR fulfillment were elevated before beta and are now both proven live |

## Hardening and Verification Summary

| Item | Result | Evidence |
|------|--------|----------|
| Code hardening for manual-payment review path | Complete | Task 6 follow-up in `docs/operations/beta-verification-checklist.md` records fail-closed manual-payment review hardening and stable admin response fields |
| Code hardening for complimentary review path | Complete | Complimentary review remained guarded and was later proven live end-to-end |
| Payment-verification migration readiness | Complete | Migration file exists at `prisma/migrations/20260408032512_add_payment_verification_fields/migration.sql`; Task 11 live verification exercised the migrated verification fields successfully |
| Targeted tests and typecheck | Passed where verified | See `docs/operations/beta-verification-checklist.md:107` for the recorded command table and clean `typecheck` result |

## Public Route and API Checks

Reference: [Smoke Tests Guide](../operations/smoke-tests.md)

| Check | Result | Time | Notes |
|-------|--------|------|-------|
| Home page (`/`) | Reachable | 2026-04-08 14:46 +07:00 | Running app returned HTTP `200` during live verification |
| Events page (`/events`) | Exercised via live flow prerequisites | 2026-04-08 15:49-15:57 +07:00 | Event selection and published event prerequisites were exercised during manual-payment and complimentary verification |
| Public events API (`/api/events`) | Validated in repo | 2026-04-08 | Route file exists at `app/api/events/route.ts` |
| Categories API (`/api/categories`) | Validated in repo | 2026-04-08 | Route file exists at `app/api/categories/route.ts` |
| Site content API (`/api/site-content`) | Validated in repo | 2026-04-08 | Route file exists at `app/api/site-content/route.ts` |

## Critical Journey Evidence

Reference: [Smoke Tests Guide](../operations/smoke-tests.md)

| Journey | Result | Owner | Notes |
|---------|--------|-------|-------|
| Registration and login | Proven | Operations / Engineering | Real customer, organizer, and admin logins succeeded during Tasks 11-12 |
| Event discovery | Proven where needed for critical flows | Operations / Engineering | Published event selection and event-specific route/API access were exercised during the live payment and complimentary scenarios |
| Complimentary booking | Proven | Operations / Engineering | Task 12 evidence on `2026-04-08 15:57 +07:00`: organizer `party@solonightlife.id` created request `45dba042-371c-4066-89cb-639400d56a5f` for event `new-year-party-2026-sky-lounge` through the live organizer route, admin `admin@gelaran.id` saw it in pending review, approved it once, and the flow issued complimentary booking `BSC-8F8G6GL0` as `CONFIRMED` / `PAID` with 2 tickets |
| Manual payment proof review | Proven | Operations / Engineering | Task 11 evidence on `2026-04-08 15:49 +07:00`: booking `BSC-4O1QUFNE` progressed from unpaid to `PROOF_UPLOADED`, admin review rendered successfully, `VERIFY` completed, and the booking finished as `CONFIRMED` / `PAID` with transaction `VERIFIED` / `SUCCESS` |
| Ticket access | Proven | Operations / Engineering | Task 6 final rerun on `2026-04-08 19:22 +07:00` confirmed `/my-bookings`, `/my-bookings/[code]`, `/my-bookings/[code]/ticket`, QR artifact rendering, PDF download, and print behavior for booking `BSC-4O1QUFNE` |
| Gate check-in | Proven | Engineering | Task 3 live verification on `2026-04-08 18:39 +07:00` proved success, duplicate, invalid, and wrong-event outcomes; Task 6 final rerun then also proved same-event fulfillment for `BSC-4O1QUFNE-8B55-001` |
| Admin access | Proven where needed for critical flows | Operations / Engineering | Admin booking review and admin complimentary review were both exercised successfully |
| Organizer operations | Proven where needed for critical flows | Operations / Engineering | Organizer complimentary request creation path was exercised successfully |

## Repo Gate Evidence

Reference: `docs/operations/beta-verification-checklist.md`

| Command group | Result | Notes |
|---------------|--------|-------|
| `corepack pnpm run test:env` | Passed | Env parsing/runtime coverage re-verified |
| `corepack pnpm run test:auth-route-coverage` | Passed | Admin and organizer route guard coverage re-verified |
| `corepack pnpm run test:auth-recovery-ui` | Passed | Auth recovery UI wiring re-verified |
| `corepack pnpm run test:route-contracts` | Passed | Route/page contract checks re-verified |
| `node --import tsx --test lib/runtime-env-wiring.test.ts lib/gate/check-in.test.ts lib/payments/pos-retry.test.ts` | Passed | 3 tests passed, 0 failed |
| `corepack pnpm run typecheck` | Passed | Repository-wide TypeScript check recorded clean after hardening updates |

## Gate And Ticket Follow-Up Evidence

Reference: `docs/operations/beta-verification-checklist.md`

| Time | Follow-up gate | Evidence | Result | Notes |
|------|----------------|----------|--------|-------|
| 2026-04-08 18:39 +07:00 | Gate/check-in live verification | Live `/gate` run for event `12bde9e9-96d0-40da-ac2d-20a9e2768ec8` / `wayang-orang-rama-tambak-sriwedari` accepted valid code `TICK-WAY-001-01`, rejected an immediate duplicate with `ALREADY_CHECKED_IN`, returned explicit invalid-ticket result for `INVALID-UNKNOWN-999`, and returned explicit wrong-event result for `BSC-8F8G6GL0-C002`; DB cross-checks confirmed success and rejection logs | PASS | This closes the elevated beta-critical gate/check-in follow-up requirement before beta start |
| 2026-04-08 19:22 +07:00 | Ticket print/download/QR fulfillment live verification | Live customer flow for booking `BSC-4O1QUFNE` proved `/my-bookings`, `/my-bookings/BSC-4O1QUFNE`, and `/my-bookings/BSC-4O1QUFNE/ticket`; QR artifact rendered on the dedicated ticket page; `GET /api/tickets/514f1ff7-ab4e-4d1e-8475-22e844d225a9/pdf` returned `200`; same-event gate setup created active session `b17890d1-2b13-4ed8-992b-86682ab0c962`; live gate submission of `BSC-4O1QUFNE-8B55-001` succeeded with `Check-in Berhasil!` and DB cross-check recorded `SUCCESS` | PASS | This closes the elevated beta-critical ticket fulfillment requirement before beta start |

## Environment Readiness Evidence

| Time | Check | Result | Notes |
|------|-------|--------|-------|
| 2026-04-08 13:41 +07:00 | `NEXT_PUBLIC_APP_STAGE` present in target `.env` | Blocked | `.env` still had `NEXT_PUBLIC_APP_STAGE` missing |
| 2026-04-08 14:45 +07:00 | `NEXT_PUBLIC_APP_STAGE` present in target `.env` | Passed | `.env` showed `NEXT_PUBLIC_APP_STAGE="beta"` |
| 2026-04-08 13:41 +07:00 | Reachable browser/app target at `NEXT_PUBLIC_APP_URL` | Blocked | `curl http://localhost:3000/` returned connection failure |
| 2026-04-08 14:46 +07:00 | Reachable browser/app target at `NEXT_PUBLIC_APP_URL` | Passed | `corepack pnpm dev` started and `curl http://localhost:3000/` returned `200` |
| 2026-04-08 13:46 +07:00 | Alternate local targets | Blocked | `localhost:3000`, `127.0.0.1:3000`, `localhost:3001`, and `127.0.0.1:3001` all returned connection refused |
| 2026-04-08 15:20 +07:00 | Private `payment-proofs` posture verified from live metadata | Passed | Private bucket state/policy posture was verified from live DB/storage metadata before the final successful proof-upload/read/admin-review run |
| 2026-04-08 15:49 +07:00 | Payment-verification fields usable in target environment | Passed | Live customer/admin flow exercised `PROOF_UPLOADED` to `VERIFIED` transitions successfully |

## Complimentary Flow Verification Evidence

Reference: `docs/operations/beta-verification-checklist.md`

| Time | Scenario | Evidence | Result | Notes |
|------|----------|----------|--------|-------|
| 2026-04-08 13:46 +07:00 | Attempt to create or locate a complimentary request, then verify organizer creation evidence and admin review evidence | `.env` check showed `NEXT_PUBLIC_APP_STAGE=MISSING` and `NEXT_PUBLIC_APP_URL="http://localhost:3000"`; HTTP reachability checks to `http://localhost:3000/`, `http://127.0.0.1:3000/`, `http://localhost:3001/`, and `http://127.0.0.1:3001/` all returned connection refused; direct SQL `select status, count(*) from complimentary_ticket_requests group by status` returned `[]`; direct SQL confirmed published event `e3eb13a2-12a4-4a75-b8ff-031439be0dac` / `new-year-party-2026-sky-lounge` with `2` active ticket types and `130` available units; direct SQL confirmed organizer `party@solonightlife.id` owns that event and active super admin `admin@gelaran.id` exists | Blocked | The environment contains the role actors and event inventory needed for the flow, but no complimentary request currently exists and no reachable app instance was available to authenticate as organizer/admin and create or review one through the live path |
| 2026-04-08 15:57 +07:00 | Create a real complimentary request through the live organizer path, then verify pending review and approval through the live admin path | `http://localhost:3000/` returned HTTP `200`; real Supabase-backed organizer auth succeeded for `party@solonightlife.id` and admin auth succeeded for `admin@gelaran.id`; organizer pre-check `GET /api/organizer/events/e3eb13a2-12a4-4a75-b8ff-031439be0dac/complimentary-requests` returned `200` with `data=[]`; organizer `POST /api/organizer/events/e3eb13a2-12a4-4a75-b8ff-031439be0dac/complimentary-requests` returned HTTP `201` and created request `45dba042-371c-4066-89cb-639400d56a5f` for guest `complimentary.task12.1775638630660@example.com` with `requestedTotal=2` (`VIP Pass x1`, `Regular Pass x1`) in `PENDING`; organizer refetch returned HTTP `200` and included the same request in `PENDING`; admin pending fetch `GET /api/admin/complimentary-requests?status=PENDING` returned HTTP `200` and included request `45dba042-371c-4066-89cb-639400d56a5f`; admin review `PUT /api/admin/complimentary-requests/45dba042-371c-4066-89cb-639400d56a5f` with `action=APPROVE` returned HTTP `200` and booking `BSC-8F8G6GL0` (`bookingId=2af0877d-f1d5-4d36-a4e2-9ca66ef75a15`) in `CONFIRMED`; admin approved refetch returned HTTP `200` with request `status=APPROVED`, `approvedTotal=2`, reviewer `admin@gelaran.id`, and booking summary `BSC-8F8G6GL0`; direct DB cross-check confirmed request `APPROVED`, booking `CONFIRMED` / `PAID`, `is_complimentary=true`, and `ticketCount=2` | Proven | The complimentary organizer-to-admin flow is now evidenced end-to-end in the reachable local app environment |

## Manual Payment Verification Evidence

Reference: `docs/operations/beta-verification-checklist.md`

| Time | Scenario | Evidence | Result | Notes |
|------|----------|----------|--------|-------|
| 2026-04-08 13:41 +07:00 | Locate/create a booking in manual proof review state and run customer/admin verification | `.env` check showed `NEXT_PUBLIC_APP_STAGE=MISSING`; `curl http://localhost:3000/` returned `000` / connection failed; Prisma `transaction.groupBy({ by: ["verificationStatus"] })` returned only `{ verificationStatus: null, _count: { _all: 6 } }`; recent bookings included `BSC-0829ECFD` and `BSC-D0548E8D` in `AWAITING_PAYMENT` with no transaction, while paid bookings such as `BSC-HI3LVJGN` had `DEMO_PAYMENT` transactions with `paymentProofUrl=null` and `verificationStatus=null` | Blocked | No real booking code could be advanced through customer waiting-for-review and admin `/admin/bookings/[id]` review with evidence in this environment; storage-policy proof for `payment-proofs` remains manually unverified |
| 2026-04-08 14:52 +07:00 | Create a real customer booking, upload payment proof, and continue to admin review through the running local app | `corepack pnpm dev` started successfully and `curl http://localhost:3000/` returned `200`; customer login as `budi.santoso@email.com` succeeded; `POST /api/bookings` created booking `BSC-KCJZXEDT` (`bookingId=2f113216-d301-4fc4-8327-7f12c9df3e3d`) for `New Year Party 2026: Sky Lounge Edition`; customer `GET /api/my-bookings/BSC-KCJZXEDT` before upload returned `status=AWAITING_PAYMENT`, `paymentStatus=UNPAID`, `transaction=null`, `paidAt=null`, `confirmedAt=null`; `POST /api/bookings/2f113216-d301-4fc4-8327-7f12c9df3e3d/upload-proof` with a real PDF multipart payload returned HTTP `500` and `Upload failed: new row violates row-level security policy`; the app log captured `upload_proof.upload_failed` with `StorageApiError: new row violates row-level security policy` | Blocked | Customer-side pre-review unpaid state is evidenced on a real booking, but the flow cannot reach `verificationStatus=PROOF_UPLOADED`, so admin `/admin/bookings/[id]` proof rendering and verify/reject transition could not be executed |
| 2026-04-08 15:32 +07:00 | Create a real customer booking, upload proof successfully, then continue to customer/admin proof-review reads through the restarted app | `corepack pnpm dev` restarted cleanly and `curl http://localhost:3000/` returned `200`; customer login as `budi.santoso@email.com` succeeded; `POST /api/bookings` created booking `BSC-LLEFRVFZ` (`bookingId=4e221421-e4a6-42c6-b1fc-6240e1623d65`) for `New Year Party 2026: Sky Lounge Edition`; customer pre-upload `GET /api/my-bookings/BSC-LLEFRVFZ` returned `status=AWAITING_PAYMENT`, `paymentStatus=UNPAID`, `transaction=null`, `paidAt=null`, `confirmedAt=null`; `POST /api/bookings/4e221421-e4a6-42c6-b1fc-6240e1623d65/upload-proof` with a real PDF multipart payload returned HTTP `200`, created transaction `a1fcfca0-4e24-4f3e-9dba-298f9085197f`, returned `verificationStatus=PROOF_UPLOADED`, and logged `upload_proof.success`; the next customer fetch `GET /api/my-bookings/BSC-LLEFRVFZ` returned HTTP `500` / `Failed to fetch booking`; the app log shows `createPaymentProofReadUrl` throwing `Error: Object not found` in `app/api/my-bookings/[code]/route.ts`; admin login as `admin@gelaran.id` succeeded and `/admin/bookings` listed `BSC-LLEFRVFZ`, but `GET /api/admin/bookings/4e221421-e4a6-42c6-b1fc-6240e1623d65` also returned HTTP `500` / `Failed to fetch booking` with the same `Object not found` signed-read failure in `app/api/admin/bookings/[bookingId]/route.ts` | Blocked | The manual-payment flow now reaches real `PROOF_UPLOADED`, but customer waiting-for-review and admin proof review are both blocked by payment-proof signed-read generation failing after upload |
| 2026-04-08 15:49 +07:00 | Create a real customer booking, upload proof, confirm customer waiting state, then verify from admin booking detail and confirm final customer/admin state | `corepack pnpm dev` was reachable at `http://localhost:3000`; customer login as `budi.santoso@email.com` succeeded; `POST /api/bookings` created booking `BSC-4O1QUFNE` (`bookingId=3cf54407-ee46-427c-991b-f4852101b62c`) for `New Year Party 2026: Sky Lounge Edition`; customer pre-upload `GET /api/my-bookings/BSC-4O1QUFNE` returned `status=AWAITING_PAYMENT`, `paymentStatus=UNPAID`, `transaction=null`, `paidAt=null`, `confirmedAt=null`; `POST /api/bookings/3cf54407-ee46-427c-991b-f4852101b62c/upload-proof` returned HTTP `200`, created transaction `536beff3-9635-4641-a655-4db3465b1d91`, stored proof path `3cf54407-ee46-427c-991b-f4852101b62c/1775638115091-proof.pdf`, and returned `verificationStatus=PROOF_UPLOADED`; customer waiting-state `GET /api/my-bookings/BSC-4O1QUFNE` then returned HTTP `200` with `status=AWAITING_PAYMENT`, `paymentStatus=UNPAID`, `transaction.status=PENDING`, `verificationStatus=PROOF_UPLOADED`; admin login as `admin@gelaran.id` succeeded, `/admin/bookings/3cf54407-ee46-427c-991b-f4852101b62c` rendered proof details including signed proof URL and review actions, `GET /api/admin/bookings/3cf54407-ee46-427c-991b-f4852101b62c` returned HTTP `200`, and `PUT /api/admin/bookings/3cf54407-ee46-427c-991b-f4852101b62c/verify-payment` returned HTTP `200` with `status=CONFIRMED`, `paymentStatus=PAID`, `verificationStatus=VERIFIED`, `paidAt=2026-04-08T08:49:18.869Z`, `confirmedAt=2026-04-08T08:49:18.869Z`; admin refetch returned HTTP `200` with transaction `status=SUCCESS` / `verificationStatus=VERIFIED`; customer post-review `GET /api/my-bookings/BSC-4O1QUFNE` returned HTTP `200` with booking `status=CONFIRMED`, `paymentStatus=PAID`, transaction `status=SUCCESS`, `verificationStatus=VERIFIED` | Proven | The real manual-payment path is now proven end-to-end through the customer upload state and admin verify state transition. A non-blocking Resend `403` warning appeared because `gmail.com` is not a verified sending domain, but the verification route still returned `200` and persisted the expected booking/transaction state |

## Monitoring Observations

Reference: [Incident Response Runbook](../operations/incident-response.md)

- Watch-window owner: role path documented; named person not captured in repository
- Backup owner: role path documented; named person not captured in repository
- Dashboards/logs checked: logging and incident procedures reviewed in the runbooks
- Alerts triggered: none during documentation review
- User reports observed: none during documentation review
- Actions taken: recorded final beta decision recommendation as `GO WITH CONDITIONS` because critical blockers are resolved and only non-blocking caveats remain

## Issues Found During Launch

| Issue | Severity | Owner | Linked reference | Current status |
|------|----------|-------|------------------|----------------|
| Complimentary organizer/admin verification scenario cannot be proven in target environment | High | Engineering / Operations | Task 12 / `docs/operations/beta-verification-checklist.md` | Resolved by live evidence on `2026-04-08 15:57 +07:00` |
| Manual payment proof-review scenario cannot be proven in target environment | High | Engineering / Operations | Task 11 / `docs/operations/beta-verification-checklist.md` | Resolved by live evidence on `2026-04-08 15:49 +07:00` |
| Gate/check-in follow-up gate had not yet been proven live after elevation to beta-critical | High | Engineering / Operations | Task 3 / `docs/operations/beta-verification-checklist.md` | Resolved by live evidence on `2026-04-08 18:39 +07:00` |
| Ticket print/download/QR fulfillment follow-up gate had not yet been proven live after elevation to beta-critical | High | Engineering / Operations | Task 6 / `docs/operations/beta-verification-checklist.md` | Resolved by live evidence on `2026-04-08 19:22 +07:00` |
| Waitlist follow-up scope remains open | Medium | Engineering / Operations | `docs/operations/beta-verification-checklist.md` | Open, non-blocking |
| POS cashier return-flow follow-up remains open | Medium | Engineering / Operations | `docs/operations/beta-verification-checklist.md` | Open, non-blocking |
| Route smoke expansion remains open | Medium | Engineering / Operations | `docs/operations/smoke-tests.md` | Open, non-blocking |
| Owner roster contract remains open | Medium | Operations | Secure ops roster / launch records | Open, non-blocking |
| Outbound email delivery proof is limited by sender-domain configuration | Medium | Engineering / Operations | Task 11 follow-on log evidence / `docs/operations/beta-verification-checklist.md` | Open, non-blocking |

## Rollback Readiness Confirmation

Reference: [Rollback Procedure](../operations/rollback-procedure.md)

- Last known stable deployment still identified: must be recorded during the approved launch window
- Rollback path still available: yes, procedure exists and is part of the readiness package
- Conditions that would trigger rollback now: any failed smoke check, blocking auth issue, failed payment/manual-proof verification, complimentary-flow failure, or release regression during live launch
- Decision owner aware of rollback state: captured in the readiness review as part of the `GO WITH CONDITIONS` recommendation

## Launch Outcome Summary

- Outcome: `GO WITH CONDITIONS`
- Summary: code hardening, migration/client readiness, environment readiness, manual-payment E2E, complimentary-flow E2E, gate/check-in, and ticket print/download/QR fulfillment are now all evidenced; beta can proceed, with only non-blocking follow-up remaining
- Conditions or follow-up actions: keep waitlist, POS cashier return flow, route smoke expansion, and owner roster contract visible as follow-up scope; keep the outbound email sender-domain limitation visible until provider-backed delivery proof is available
- Follow-up issue references: Task 11 evidence, Task 12 evidence, Task 3 gate evidence, Task 6 ticket evidence, `docs/operations/beta-verification-checklist.md`, `docs/operations/smoke-tests.md`, `docs/operations/storage-policy.md`
