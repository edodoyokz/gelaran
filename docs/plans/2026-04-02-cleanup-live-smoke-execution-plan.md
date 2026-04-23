# Plan

Run a narrow cleanup and local live-smoke pass for the BSC-FINAL wiring fixes so we can state the current project status with evidence. The approach is to avoid broad code changes, boot the app against the existing local env, smoke the highest-risk auth and POS/upload paths, and record only actionable failures for follow-up fixing.

## Scope
- In:
- Local app boot with the current `.env`
- Focused verification and browser smoke for auth, recovery, POS callback pages, and organizer upload entry points
- Directly actionable cleanup only when the smoke pass exposes a concrete local issue
- A concise failure log and follow-up bug list
- Out:
- Production deployment
- External provider validation that requires third-party dashboard access
- Unrelated UI polish and broad refactors outside the wiring-fix surface

## Action items
[ ] Reconfirm current local prerequisites and note env/runtime risks that affect smoke execution
[ ] Run focused verification commands that gate the smoke pass (`test:env`, `test:auth-route-coverage`, `test:auth-recovery-ui`, `test:route-contracts`, `typecheck`)
[ ] Boot the Next.js app locally and capture startup/runtime blockers before browser work
[ ] Smoke public auth flows in the browser: `/login`, `/forgot-password`, `/reset-password`, and the auth callback guard behavior
[ ] Smoke POS result flows in the browser: `/pos/payment-success`, `/pos/payment-pending`, `/pos/payment-failed`, plus the POS entry guard
[ ] Smoke protected and contract-sensitive paths: organizer upload/API entry points and customer-owned booking paths where locally reachable
[ ] Fix only small local issues that are directly exposed by the smoke pass and re-run the affected checks
[ ] Record the verified status, remaining bugs, repro steps, and recommended next fixes

## Open questions
- Whether the current `.env` is complete enough to exercise all protected flows without adding new secrets
- Whether organizer upload can be smoke-tested end-to-end locally or only at the route/guard level
- Whether any remaining failures are true code regressions versus expected gaps from missing external-service callbacks
