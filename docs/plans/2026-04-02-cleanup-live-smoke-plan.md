# Cleanup And Live Smoke Plan

Date: 2026-04-02
Repo: `/home/luckyn00b/Documents/PROJECT/BSC-FINAL`

## Goal

Establish the actual current status of the fix-plan work after the wiring pass, remove remaining contract drift where it is safe to do so, and run local live smoke checks on the most critical user and operator flows.

## Scope

- In scope:
  - local verification and local app boot
  - critical smoke flows tied to the wiring fix plan
  - concise documentation of current status, failures, and follow-up bugs
  - small cleanup that is directly exposed by verification
- Out of scope:
  - production deployment
  - non-critical UI polish unrelated to wiring/auth/contracts
  - large refactors outside the authenticated flow, route-contract, and env-normalization surface

## Checklist

- [ ] Reconfirm current implementation status against `FRONTEND_BACKEND_WIRING_FIX_PLAN.md`
- [ ] Run focused local verification commands for auth/env/route-contract coverage
- [ ] Start the app locally with the current `.env` and capture runtime blockers early
- [ ] Smoke critical auth flows: login, recovery entry, callback, reset page guards
- [ ] Smoke critical route contracts: `/api/upload`, POS result routes, booking-owned pages
- [ ] Smoke protected customer paths and verify auth boundary behavior
- [ ] Fix any locally actionable issues uncovered during the smoke pass
- [ ] Record verified status, remaining bugs, and next repair priorities
