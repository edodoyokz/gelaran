# Beta Verification Checklist

- Owner issue: `NUS-72`
- Purpose: provide a tight beta verification checklist for the backend/frontend wiring fixed in `NUS-68`, `NUS-69`, `NUS-70`, and `NUS-71`.
- Scope: customer browse and booking, organizer setup and gate operations, admin operational pages, waitlist and email, POS payment status redirects, and the highest-value local verification commands that are practical in this repository.

## Beta Preconditions

- Use a populated `.env` based on [Local Development](../setup/local-development.md).
- Prefer `NEXT_PUBLIC_APP_STAGE=beta` with `NEXT_PUBLIC_PAYMENTS_ENABLED=false` unless the verification pass explicitly targets payment redirect handling.
- Prepare these test actors and records before running browser checks:
  - one customer account
  - one organizer account
  - one admin account
  - one published event with at least one ticket type
  - one sold-out ticket type for waitlist checks
  - one gate or POS device token where applicable

## Manual Beta Checklist

### 1. Customer browse, booking, and payment

- [ ] Open `/events` and confirm cards, filters, and event detail navigation work without 404s or auth leaks.
- [ ] Open one published event and verify ticket selection renders correctly for both regular quantity booking and seat-based booking when the event has seating.
- [ ] Complete one complimentary or demo-safe checkout from `/checkout` and verify the booking lands in `/my-bookings`.
- [ ] Open `/my-bookings/[code]` and `/my-bookings/[code]/ticket` and verify booking details, QR/ticket rendering, and ticket download access still resolve.
- [ ] If payment redirect wiring is enabled in the target environment, verify customer checkout result routes `/checkout/success`, `/checkout/pending`, and `/checkout/failed` render the expected status UI instead of dead-end routes.

### 2. Organizer setup, seating, upload, and gate

- [ ] Open organizer event setup screens and confirm FAQ, media, seating, and gate pages load for an owned event:
  - `/organizer/events/[id]/faq`
  - `/organizer/events/[id]/seating`
  - `/organizer/events/[id]/gate`
- [ ] Upload one event asset through the organizer flow and confirm it reaches the real upload backend at `/api/upload`.
- [ ] Edit at least one seating section, row, or seat and confirm save/load round trips do not fail authorization or relation ownership checks.
- [ ] Use gate flow for one valid ticket, one duplicate scan, and one wrong-event or invalid ticket and confirm the operator feedback is correct.

### 3. Admin checks

- [ ] Open `/admin`, `/admin/events`, `/admin/bookings`, and `/admin/refunds` and confirm pages load without auth regressions.
- [ ] Open one booking detail and one event detail as admin and confirm ownership-sensitive data still resolves.
- [ ] Confirm finance or audit-log views load without server-side identity mismatch errors.
- [ ] From admin booking detail manual-payment review, confirm both verify and reject outcomes return stable booking/payment fields and that invalid state or concurrent-review failures surface explicit conflict metadata instead of requiring client heuristics.

### 4. Waitlist and email

- [ ] Use a sold-out ticket type and verify `/api/events/[slug]/waitlist` accepts a new entry, rejects duplicate waiting entries, and rejects entries when tickets are still available.
- [ ] Confirm the waitlist confirmation email path executes cleanly in logs or in the provider dashboard.
- [ ] Record whether email was truly delivered, provider-logged only, or unverified because `RESEND_API_KEY` or environment access was unavailable.

### 5. POS payment status pages

- [ ] Verify the POS payment redirect routes exist and render valid pages instead of 404s:
  - `/pos/payment-success`
  - `/pos/payment-pending`
  - `/pos/payment-failed`
- [ ] From the POS device flow, verify the cashier can return to `/pos` and `/pos/access` from each status page.
- [ ] Confirm pending state supports a manual refresh path and does not create a second transaction on refresh-only follow-up checks.

## Core Verification Commands

Run the smallest useful command set first. Escalate to `pnpm run verify` only if the branch is otherwise stable and a broader pass is needed.

```bash
pnpm run test:env
pnpm run test:auth-route-coverage
pnpm run test:auth-recovery-ui
pnpm run test:route-contracts
node --import tsx --test lib/runtime-env-wiring.test.ts lib/gate/check-in.test.ts lib/payments/pos-retry.test.ts
pnpm run typecheck
```

What each command covers:

- `pnpm run test:env`: validates the decoupled env parsing required by `NUS-70`.
- `pnpm run test:auth-route-coverage`: checks admin and organizer auth guards plus shared identity-helper usage from `NUS-68`.
- `pnpm run test:auth-recovery-ui`: checks recovery callback and reset-password wiring from `NUS-71`.
- `pnpm run test:route-contracts`: checks the repaired route/page contracts from `NUS-69`, including upload and POS status routes.
- `node --import tsx --test lib/runtime-env-wiring.test.ts lib/gate/check-in.test.ts lib/payments/pos-retry.test.ts`: adds focused coverage for runtime payment wiring, gate scan behavior, and POS retry behavior.
- `pnpm run typecheck`: confirms the current repository still compiles at the TypeScript level after the wiring fixes.

## Latest Targeted Local Pass

- Date: `2026-04-04`
- Environment note: local repo only; this pass does not claim live browser E2E, payment gateway callbacks, real email delivery, or a fully booted beta-like deployment unless explicitly stated below.
- Shell note: `pnpm` was not on `PATH` in this environment, so the package scripts were executed via `corepack pnpm`.

Task 6 follow-up on `2026-04-08`:

- Manual-payment admin verify/reject route was tightened to keep fail-closed checks explicit for missing booking, missing transaction, invalid verification status, missing proof URL, and concurrent review conflicts.
- Verify and reject success payloads now expose the same booking/payment fields so the beta admin UI does not need branch-specific response heuristics.
- Conflict and validation error handling now carries explicit `error.details.reason` metadata for admin review edge cases.
- Repository-wide `typecheck` is currently clean in the local repo after the latest Task 6 verification rerun.

Task 12 follow-up on `2026-04-08 15:57 +07:00`:

- Complimentary-flow cross-role verification is now proven end-to-end in the reachable local app environment.
- Fresh live organizer/admin evidence for this task:
  - `http://localhost:3000/` returned HTTP `200` at verification time.
  - Real organizer auth succeeded for `party@solonightlife.id` and real admin auth succeeded for `admin@gelaran.id` using the same live Supabase-backed login flow exposed by `/login` demo-mode accounts.
  - Organizer-side precondition evidence: `GET /api/organizer/events/e3eb13a2-12a4-4a75-b8ff-031439be0dac/complimentary-requests` returned HTTP `200` with `data=[]` before submission.
  - Organizer-side creation evidence: `POST /api/organizer/events/e3eb13a2-12a4-4a75-b8ff-031439be0dac/complimentary-requests` returned HTTP `201` and created request `45dba042-371c-4066-89cb-639400d56a5f` for guest `complimentary.task12.1775638630660@example.com`, event `new-year-party-2026-sky-lounge`, with `requestedTotal=2` across `VIP Pass x1` and `Regular Pass x1`, initial `status=PENDING`, and no booking yet.
  - Organizer-side post-create evidence: a second `GET /api/organizer/events/e3eb13a2-12a4-4a75-b8ff-031439be0dac/complimentary-requests` returned HTTP `200` and included request `45dba042-371c-4066-89cb-639400d56a5f` in `PENDING` state.
  - Admin pending-review evidence: `GET /api/admin/complimentary-requests?status=PENDING` returned HTTP `200` and included request `45dba042-371c-4066-89cb-639400d56a5f` with the same organizer, event, guest, and item details.
  - Admin approval evidence: `PUT /api/admin/complimentary-requests/45dba042-371c-4066-89cb-639400d56a5f` with `{ "action": "APPROVE" }` returned HTTP `200`, moved the request to `status=APPROVED`, and returned booking `BSC-8F8G6GL0` (`bookingId=2af0877d-f1d5-4d36-a4e2-9ca66ef75a15`) in `status=CONFIRMED`.
  - Admin post-review evidence: `GET /api/admin/complimentary-requests?status=APPROVED` returned HTTP `200` and showed request `45dba042-371c-4066-89cb-639400d56a5f` with `approvedTotal=2`, reviewer `admin@gelaran.id`, booking summary `BSC-8F8G6GL0`, and final `status=APPROVED`.
  - Database cross-check after the live app actions confirmed request `45dba042-371c-4066-89cb-639400d56a5f` as `APPROVED`, booking `BSC-8F8G6GL0` as `CONFIRMED` / `PAID`, `isComplimentary=true`, and `ticketCount=2`.

| Command | Result | Notes |
| --- | --- | --- |
| `corepack pnpm run test:env` | Passed | `lib/env.test.ts` passed. This keeps the `NUS-70` env-decoupling coverage green at runtime. |
| `corepack pnpm run test:auth-route-coverage` | Passed | `lib/auth/route-auth-coverage.test.ts` passed. Admin and organizer route guards plus shared auth-helper usage stayed intact. |
| `corepack pnpm run test:auth-recovery-ui` | Passed | `lib/auth-recovery-ui.test.ts` passed. Recovery callback and reset-password route wiring stayed intact. |
| `corepack pnpm run test:route-contracts` | Passed | `lib/route-contracts.test.ts` passed. Upload route and POS status pages exist, and the reviewed navigation links still point to real routes. |
| `node --import tsx --test lib/runtime-env-wiring.test.ts lib/gate/check-in.test.ts lib/payments/pos-retry.test.ts` | Passed | 3 tests passed, 0 failed. This covers runtime env reads for checkout/POS/refunds, gate result handling, and POS retry decisions. |
| `corepack pnpm run typecheck` | Passed | `tsc --noEmit` completed cleanly in the current local verification pass. |

Task 3 follow-up on `2026-04-08 18:39 +07:00`:

- Gate/check-in live verification is now proven against the reachable local beta-like app at `http://localhost:3000` with a real active gate device session.
- Route and operator session used for this pass:
  - Gate route: `/gate`
  - Check-in API route: `/api/gate/check-in`
  - Actor role: gate staff on an active `GATE` device session
  - Staff/device record: `Ibe` via `deviceAccess.id=5bbed86c-43ca-4bec-aad1-9419edceae7b`
  - Event identifier: `12bde9e9-96d0-40da-ac2d-20a9e2768ec8` / `wayang-orang-rama-tambak-sriwedari`
- First valid scan evidence:
  - Manual entry of `TICK-WAY-001-01` on `/gate` returned `POST /api/gate/check-in => 200` with the live UI state `Check-in Berhasil!`.
  - UI feedback showed attendee `Budi Santoso`, ticket type `Reguler`, booking `BSC-WAYANG-001`, event `Pertunjukan Wayang Orang Sriwedari - Rama Tambak`, and `Check-in pada: 8/4/2026, 18.37.46`.
  - Event counters on `/gate` updated from `Checked in 1 / Belum masuk 4 / 20%` to `Checked in 2 / Belum masuk 3 / 40%` after the success response.
  - Database cross-check after the live request confirmed `bookedTicket.uniqueCode=TICK-WAY-001-01` moved to `isCheckedIn=true` with `checkedInAt=2026-04-08T11:37:46.057Z`.
- Duplicate scan evidence:
  - Immediate re-submit of the same code `TICK-WAY-001-01` on `/gate` returned `POST /api/gate/check-in => 400`.
  - Live UI feedback on `/gate` showed `Sudah Check-in` with message `Tiket sudah di-check-in` and retained the prior check-in timestamp.
  - Database cross-check recorded `checkInLog.result=ALREADY_CHECKED_IN` at `2026-04-08T11:38:15.308Z` for the same scanner device.
- Invalid or unknown ticket evidence:
  - Real request `POST /api/gate/check-in` with `ticketCode=INVALID-UNKNOWN-999` returned `404` with payload `{"success":false,"error":{"code":404,"message":"Tiket tidak ditemukan","details":{"result":"INVALID"}}}`.
  - This confirms the operator-facing invalid result vocabulary is explicit at the live route level even though the browser session had already closed before an additional UI capture could be taken.
- Wrong-event ticket evidence:
  - Real request `POST /api/gate/check-in` with `ticketCode=BSC-8F8G6GL0-C002` against the Sriwedari gate session returned `400` with payload `{"success":false,"error":{"code":400,"message":"Tiket untuk event berbeda","details":{"result":"WRONG_EVENT"}}}`.
  - The wrong-event ticket belongs to booking `BSC-8F8G6GL0` for event `e3eb13a2-12a4-4a75-b8ff-031439be0dac` / `new-year-party-2026-sky-lounge`, proving cross-event rejection with seeded live data.
  - Database cross-check recorded `checkInLog.result=WRONG_EVENT` at `2026-04-08T11:39:36.377Z` for the same scanner device.
- Focused regression command for this workstream also remained green during the same pass: `node --import tsx --test lib/gate/check-in.test.ts` -> `8` tests passed, `0` failed.
- Final gate/check-in status: `PASS`.

Task 6 follow-up on `2026-04-08 18:58 +07:00`:

- Ticket fulfillment was re-verified against the reachable beta-like local app at `http://localhost:3000` using real customer account `budi.santoso@email.com` and confirmed booking `BSC-4O1QUFNE` for event `new-year-party-2026-sky-lounge`.
- Retrieval evidence on the real customer path:
  - Login through `/login?returnUrl=/my-bookings/BSC-4O1QUFNE` completed successfully and redirected to `/my-bookings/BSC-4O1QUFNE`.
  - `/my-bookings` loaded with HTTP-backed data and showed booking card `BSC-4O1QUFNE` in `Dikonfirmasi` state with `Lihat tiket`, `Unduh ringkasan`, and `Detail booking` actions.
  - `/my-bookings/BSC-4O1QUFNE` loaded and showed `Cetak ringkasan`, ticket summary `Regular Pass`, payment status `SUCCESS`, and the ticket-management copy `Buka QR, unduh PDF, atau transfer tiket yang masih aktif ke penerima lain.`
  - `/my-bookings/BSC-4O1QUFNE/ticket` loaded and `GET /api/my-bookings/BSC-4O1QUFNE` returned HTTP `200` during the browser session.
- QR / scannable-artifact evidence from the real ticket view:
  - The visible ticket artifact showed customer-facing code `BSC-4O1QUFNE-8B55-001` and the copy `Scan QR Code untuk proses check-in.`
  - Database cross-check for booking `BSC-4O1QUFNE` showed `bookedTicket.id=514f1ff7-ab4e-4d1e-8475-22e844d225a9`, `uniqueCode=BSC-4O1QUFNE-8B55-001`, `status=ACTIVE`, `isCheckedIn=false`, but `qrCodeUrl=null`.
  - The live ticket page rendered `qrImgCount=0` in browser evidence, so the customer page did not expose a real QR image asset; only static QR-related copy and the ticket code were present.
  - Gate-path usability check failed for the exact ticket code surfaced in the customer view: `POST /api/gate/check-in` with active gate device token `c95b904406c83aa55d9379b7a589d1a213ab82084290a4b832b5464999d5d716` returned HTTP `400` with `{"success":false,"error":{"code":400,"message":"Tiket untuk event berbeda","details":{"result":"WRONG_EVENT"}}}` because the only currently active live gate session in evidence belongs to event `wayang-orang-rama-tambak-sriwedari`, not the booking event.
- Print / download evidence on the supported happy path:
  - The booking-detail print action was exposed and browser instrumentation confirmed `Cetak ringkasan` triggered `window.print` without an auth error or dead-button failure.
  - The ticket download action was exposed and `GET /api/tickets/514f1ff7-ab4e-4d1e-8475-22e844d225a9/pdf` returned HTTP `200`.
  - The browser saved `tiket-BSC-4O1QUFNE.pdf` successfully with `size=6146` bytes and `download.failure=null`, so at least one supported beta download path works.
- Final ticket fulfillment status: `non-PASS`.
- Beta-critical rule applied: retrieval works and PDF download/print do not break on the main happy path, but the real customer ticket view does not render a real QR image and the surfaced artifact was not proven usable through the intended live gate fulfillment path for the same event, so this workstream cannot be marked `PASS`.

Task 6 rerun on `2026-04-08 19:21 +07:00` after the dedicated ticket-page QR fix:

- Ticket fulfillment was re-verified again against the reachable beta-like local app at `http://localhost:3000` using the same real customer account `budi.santoso@email.com` and confirmed booking `BSC-4O1QUFNE` for event `new-year-party-2026-sky-lounge`.
- Retrieval evidence on the rerun:
  - Login through `/login?returnUrl=/my-bookings/BSC-4O1QUFNE` completed and redirected into the live customer area for booking `BSC-4O1QUFNE`.
  - `/my-bookings` loaded successfully and browser evidence captured booking card `BSC-4O1QUFNE` in `Dikonfirmasi` state with `Lihat tiket`, `Unduh ringkasan`, and `Detail booking` actions.
  - `/my-bookings/BSC-4O1QUFNE` loaded successfully and browser evidence captured `Cetak ringkasan`, `Bagikan detail`, ticket summary `Regular Pass`, and payment status `SUCCESS`.
  - `/my-bookings/BSC-4O1QUFNE/ticket` loaded successfully during the same browser session; the rerun captured repeated `GET /api/my-bookings/BSC-4O1QUFNE => 200` responses and the dedicated ticket UI with booking code `BSC-4O1QUFNE` and ticket code `BSC-4O1QUFNE-8B55-001`.
- QR / scannable-artifact evidence on the rerun:
  - The dedicated ticket page no longer behaves like the earlier placeholder-only state. Fresh browser evidence for `/my-bookings/BSC-4O1QUFNE/ticket` recorded `bigSvgCount=1`, `canvasCount=0`, `hasTicketCode=true`, and `hasDownloadButton=true`, which is consistent with the QR now rendering directly as an inline SVG artifact rather than an external `img` URL.
  - The page body still shows the customer-facing scan instruction `Scan QR Code untuk proses check-in.` and the visible scannable code `BSC-4O1QUFNE-8B55-001`.
  - Database cross-check still shows booking `BSC-4O1QUFNE` as `CONFIRMED` / `PAID` with active booked ticket `514f1ff7-ab4e-4d1e-8475-22e844d225a9` and `uniqueCode=BSC-4O1QUFNE-8B55-001`.
  - Same-event live fulfillment could not be proven in this rerun because `eventDeviceSession.findFirst` for event `e3eb13a2-12a4-4a75-b8ff-031439be0dac` / `new-year-party-2026-sky-lounge` with `sessionType=GATE` and `isActive=true` returned `null`; the only active gate session currently present in the environment remains for another event (`12bde9e9-96d0-40da-ac2d-20a9e2768ec8` / `wayang-orang-rama-tambak-sriwedari`).
- Print / download evidence on the rerun:
  - The booking-detail page exposed `Cetak ringkasan`, and direct browser instrumentation on the live page found the print button in the DOM (`printButtonFound=true`) and confirmed it triggered `window.print` (`printTriggered=true`).
  - The ticket PDF download path still worked on the rerun: `GET /api/tickets/514f1ff7-ab4e-4d1e-8475-22e844d225a9/pdf` returned HTTP `200`.
  - The browser saved `tiket-BSC-4O1QUFNE.pdf` successfully with `size=6146` bytes and `download.failure=null`.
- Final ticket fulfillment status after rerun: `non-PASS`.
- Beta-critical rule applied on the rerun: the dedicated ticket page now shows a real scannable SVG QR artifact and the supported print/download path still works, but live use through the intended same-event gate fulfillment path remains unproven because no active gate session exists for the booking event in this environment, so this workstream still cannot be upgraded to `PASS`.

Task 6 final rerun on `2026-04-08 19:22 +07:00` with same-event gate setup:

- The remaining setup-only blocker was closed through the real organizer and gate-access flows for event `e3eb13a2-12a4-4a75-b8ff-031439be0dac` / `new-year-party-2026-sky-lounge`.
- Same-event gate-session setup evidence:
  - Real organizer login succeeded for `party@solonightlife.id` and loaded `/organizer/events/e3eb13a2-12a4-4a75-b8ff-031439be0dac/gate` for `New Year Party 2026: Sky Lounge Edition`.
  - The organizer gate-management page exposed an active Gate Scanner control and `Regenerate PIN` was executed through the live UI.
  - The live organizer modal returned fresh credentials for the correct event: `Kode Event=new-year-party-2026-sky-lounge`, `PIN Akses=9488-8564`, `URL Akses=http://localhost:3000/gate/access`.
  - Database cross-check after the organizer action confirmed a fresh active same-event gate session `eventDeviceSession.id=b17890d1-2b13-4ed8-992b-86682ab0c962`, `sessionType=GATE`, `isActive=true`, `deviceLimit=3`, `createdAt=2026-04-08T12:21:59.546Z`.
  - Real `/gate/access` login with those credentials succeeded and created same-event device access `deviceAccess.id=7a7113b1-a90c-4c07-b26d-8e5d279c8129`, `staffName=Task6 Gate Rerun`, `deviceToken=9669d163caff0876e39251072a759044fe09b284c62344cec7d77e1dfa0c6202`, `isActive=true`.
- Same-event gate fulfillment evidence for the real customer ticket:
  - The live gate page loaded for `New Year Party 2026: Sky Lounge Edition` with operator label `Staff: Task6 Gate Rerun` and pre-scan counters `TOTAL TIKET 3 / CHECKED IN 0 / BELUM MASUK 3 / 0%`.
  - Manual submission of customer ticket code `BSC-4O1QUFNE-8B55-001` on the same-event live gate page returned the operator success state `Check-in Berhasil!`.
  - Live UI evidence showed `Booking: BSC-4O1QUFNE`, `Tiket: Regular Pass`, `Event: New Year Party 2026: Sky Lounge Edition`, and `Check-in pada: 8/4/2026, 19.22.06`.
  - Live gate counters updated to `CHECKED IN 1 / BELUM MASUK 2 / 33%` after the successful scan.
  - Database cross-check confirmed ticket `bookedTicket.id=514f1ff7-ab4e-4d1e-8475-22e844d225a9` / `uniqueCode=BSC-4O1QUFNE-8B55-001` is now `isCheckedIn=true` with `checkedInAt=2026-04-08T12:22:06.609Z`.
  - Database cross-check also confirmed latest `checkInLog.id=20b660f8-bfb8-4e81-ac97-81b5c0cc7360` with `result=SUCCESS`, `scannedAt=2026-04-08T12:22:07.398Z`, `bookedTicketId=514f1ff7-ab4e-4d1e-8475-22e844d225a9`, and `scannedBy=7a7113b1-a90c-4c07-b26d-8e5d279c8129`.
- Retrieval / QR / print-download status remained clean during the same final rerun window:
  - `/my-bookings`, `/my-bookings/BSC-4O1QUFNE`, and `/my-bookings/BSC-4O1QUFNE/ticket` continued to load with live `200` responses.
  - The dedicated ticket page still exposed the customer-visible scannable artifact for `BSC-4O1QUFNE-8B55-001` and the supported download control.
  - The booking-detail print control still existed and browser instrumentation had already confirmed `Cetak ringkasan` triggers `window.print`.
  - Ticket PDF download still succeeded through `GET /api/tickets/514f1ff7-ab4e-4d1e-8475-22e844d225a9/pdf => 200` with saved file `tiket-BSC-4O1QUFNE.pdf` and no download failure.
- Final ticket fulfillment status after same-event setup: `PASS`.
- Beta-critical rule applied on the final rerun: the ticket is retrievable on the customer route, the dedicated ticket page exposes a real scannable artifact, the supported print/download path works on the happy path, and the exact surfaced ticket code is now proven usable through the intended same-event live gate fulfillment path.

Task 8 waitlist follow-up on `2026-04-08 19:32 +07:00`:

- Contract audit result:
  - `app/api/events/[slug]/waitlist/route.ts` still accepts waitlist creation only after resolving a published event, validating the ticket type for that event, and confirming computed availability is `<= 0`; it still rejects duplicate `WAITING` entries for the same lowercased email and ticket type.
  - `components/features/events/EventDetailView.tsx` still exposes the waitlist path only for sold-out ticket types (`availableQuantity === 0`), posts `ticketTypeId`, `email`, `name`, and `quantity: 1` to `/api/events/[slug]/waitlist`, shows inline error copy from `data.error?.message`, and swaps to a visible success state (`Berhasil bergabung`) after a successful response.
  - `lib/auth/route-auth-coverage.test.ts` still explicitly includes `app/api/events/[slug]/waitlist/route.ts` in the shared-auth-helper coverage set.
- Live verification evidence gathered in the reachable local app environment:
  - `http://localhost:3000/` returned HTTP `200` during this pass.
  - Published-event inventory check found only one reachable published event, `new-year-party-2026-sky-lounge`, and both ticket types still had positive availability (`VIP Pass available=28`, `Regular Pass available=96`), so no sold-out live ticket type was available for a real join or duplicate-join exercise in this environment.
  - Real route rejection proof for the available-ticket guard: `POST /api/events/new-year-party-2026-sky-lounge/waitlist` with `ticketTypeId=8b55716f-f5e3-434c-b495-def7b66cb0d7` returned HTTP `400` with `{"success":false,"error":{"message":"Tickets are still available. No need to join waitlist."}}`.
- Accepted gaps kept explicitly non-blocking:
  - Live proof of successful waitlist creation and duplicate-entry rejection remains uncollected in this pass because the required sold-out published ticket precondition was absent in the reachable dataset.
  - Provider-backed confirmation-email delivery remains unproven in this pass because no successful live waitlist creation could be triggered without manufacturing new sold-out data.
- Final waitlist follow-up status: `non-blocking`.

Task 9 POS cashier return-flow follow-up on `2026-04-08 19:37 +07:00`:

- POS retry contract and focused test status:
  - `node --import tsx --test lib/payments/pos-retry.test.ts` passed with `6` tests passed and `0` failed in the current local verification pass.
  - `lib/payments/pos-retry.ts` still preserves the intended retry contract: duplicate paid/completed requests return the existing booking, active pending requests reuse the current payment intent, and expired pending requests refresh the payment intent on the same booking rather than creating a second booking.
  - `app/api/pos/sell/route.ts` still routes duplicate POS sell requests through `decidePosSellRetryAction(...)` before any new-booking path, and its refresh branch updates or reuses the existing transaction record for the same booking before requesting a new gateway intent.
- Live route evidence from the reachable local app at `http://localhost:3000`:
  - `GET /pos/payment-success?booking=BSC-VERIFY-001` returned a real rendered page containing `Pembayaran POS berhasil`, `Kembali ke POS`, `Akses ulang perangkat`, and `Kembali ke dashboard POS`.
  - `GET /pos/payment-pending?booking=BSC-VERIFY-001` returned a real rendered page containing `Pembayaran POS menunggu konfirmasi`, `Refresh status`, `Kembali ke POS`, `Akses ulang perangkat`, and `Kembali ke dashboard POS`.
  - `GET /pos/payment-failed?booking=BSC-VERIFY-001` returned a real rendered page containing `Pembayaran POS gagal`, `Kembali ke POS`, `Akses ulang perangkat`, and `Kembali ke dashboard POS`.
  - The shared status-page component still points the cashier return actions to `/pos` and `/pos/access` for all three routes.
- Pending refresh follow-up result:
  - `components/pos/pos-payment-status-page.tsx` still wires the pending-only refresh control to `window.location.reload()` and does not submit a sell request or post any new payment payload from the status page itself.
  - Because the live pending page is refresh-only and the POS sell API remains idempotent for duplicate follow-up requests on the same request identity, this verification pass found no concrete path where using the pending-page refresh control alone would create a duplicate transaction.
- Final POS cashier return-flow status: `non-blocking`.

## Remaining Beta Gaps and Blockers

- Task 11 manual-payment cross-role verification is proven end-to-end as of `2026-04-08 15:49 +07:00`.
- Task 12 complimentary-flow cross-role verification is proven end-to-end as of `2026-04-08 15:57 +07:00`.
- Task 3 gate/check-in live verification is now `PASS` as of `2026-04-08 18:39 +07:00`; valid scan, duplicate scan, invalid ticket, and wrong-event ticket outcomes are all evidenced against the live beta-like app.
- Task 6 ticket print/download/QR fulfillment is now `PASS` as of `2026-04-08 19:22 +07:00`; same-event gate setup and fulfillment are now proven live for booking `BSC-4O1QUFNE` / ticket `BSC-4O1QUFNE-8B55-001`.
- Fresh environment evidence for this task:
  - `.env` now has `NEXT_PUBLIC_APP_STAGE="beta"`, and `corepack pnpm dev` booted cleanly with `curl http://localhost:3000/` returning `200`.
  - Real route execution on the fixed app created booking `BSC-4O1QUFNE` for `New Year Party 2026: Sky Lounge Edition`; customer-side pre-upload booking data showed `status=AWAITING_PAYMENT`, `paymentStatus=UNPAID`, `transaction=null`, `paidAt=null`, and `confirmedAt=null`.
  - The real proof upload attempt to `POST /api/bookings/3cf54407-ee46-427c-991b-f4852101b62c/upload-proof` succeeded with HTTP `200`, created transaction `536beff3-9635-4641-a655-4db3465b1d91`, stored proof path `3cf54407-ee46-427c-991b-f4852101b62c/1775638115091-proof.pdf`, and returned `verificationStatus=PROOF_UPLOADED`.
  - The customer waiting-for-review fetch `GET /api/my-bookings/BSC-4O1QUFNE` succeeded with HTTP `200` and showed `status=AWAITING_PAYMENT`, `paymentStatus=UNPAID`, `transaction.status=PENDING`, `verificationStatus=PROOF_UPLOADED`, `paidAt=null`, and `confirmedAt=null`.
  - Admin login succeeded, `/admin/bookings/3cf54407-ee46-427c-991b-f4852101b62c` rendered proof review details, and `PUT /api/admin/bookings/3cf54407-ee46-427c-991b-f4852101b62c/verify-payment` succeeded with HTTP `200`, moving the booking to `status=CONFIRMED`, `paymentStatus=PAID`, and the transaction to `status=SUCCESS`, `verificationStatus=VERIFIED`.
  - Customer post-review fetch `GET /api/my-bookings/BSC-4O1QUFNE` then succeeded with HTTP `200` and showed `status=CONFIRMED`, `paymentStatus=PAID`, `transaction.status=SUCCESS`, `verificationStatus=VERIFIED`, `paidAt=2026-04-08T08:49:18.869Z`, and `confirmedAt=2026-04-08T08:49:18.869Z`.
  - A non-blocking follow-on email provider warning appeared in the app log after verification: Resend returned `403` because `gmail.com` is not a verified domain. The verification route still returned `200` and persisted the correct booking/transaction state transition.
- Live browser verification is still required for the full customer, organizer, admin, waitlist, and POS journeys because this document only records local repository checks unless a reachable app instance is available.
- Waitlist follow-up remains open as non-blocking scope, including provider-backed email delivery proof where that path matters.
- Route smoke expansion remains open as non-blocking scope beyond the critical flows evidenced in this package.
- Owner roster contract follow-up remains open as non-blocking operational scope outside this repository's named-contact boundaries.

## Final Beta Decision Snapshot

- Verdict: `GO WITH CONDITIONS`
- Decision time: `2026-04-08 19:24 +07:00`
- What is truly complete:
  - repo-level hardening for manual-payment admin review and complimentary review is complete where scoped
  - payment-verification migration/client readiness is complete; the target environment exercised `PROOF_UPLOADED` and `VERIFIED` transitions successfully
  - targeted verification commands listed in this document passed where recorded, including repository-wide `typecheck`
  - `NEXT_PUBLIC_APP_STAGE` is set to `beta` and the app booted successfully at `http://localhost:3000`
  - private `payment-proofs` bucket posture was verified from live metadata before the final successful proof-review run
  - manual-payment customer/admin E2E is proven in a reachable app target
  - complimentary organizer/admin E2E is proven in a reachable app target
  - gate/check-in is proven in a reachable app target with live success, duplicate, invalid, and wrong-event evidence
  - ticket print/download/QR fulfillment is proven in a reachable app target, including same-event gate fulfillment for the surfaced customer ticket artifact
- What remains blocked:
  - no beta-blocking follow-up gate remains before beta start; the elevated gate/check-in and ticket fulfillment requirements are now satisfied
- Remaining non-blocking caveats:
  - waitlist follow-up remains open, including stronger delivery/notification proof where required
  - route smoke expansion remains open beyond the minimum critical-flow evidence captured here
  - owner roster contract follow-up remains open outside this repository's documentation boundary
  - outbound email delivery proof is still limited by sender-domain/provider configuration in this environment
- Decision rule applied: fail closed. The newly elevated beta-critical follow-up gates for gate/check-in and ticket fulfillment are now evidenced as `PASS`, while the remaining follow-up items stay explicitly non-blocking, so the package continues to support `GO WITH CONDITIONS` rather than `NO-GO`.
