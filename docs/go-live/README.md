# Go-Live Readiness Package

This package gives operators and approvers a single go-live flow for reviewing blockers, recording launch evidence, and documenting the final launch decision. Detailed deployment, rollback, smoke-test, and incident procedures stay in [`../operations/`](../operations/README.md).

## Usage Flow

1. Complete the release review in [Go-Live Readiness Review](./go-live-readiness-review.md).
2. Confirm the launch team and decision owner against the secure ops roster in [Operator Ownership](../operations/operator-ownership.md).
3. Execute launch-day checkpoints in [Go-Live Checklist](./go-live-checklist.md) alongside the operational runbooks.
4. Record observed results, issues, and rollback viability in [Go-Live Evidence Log](./go-live-evidence-log.md).
5. Capture approver status and the final decision in [Go-Live Sign-Off](./go-live-signoff.md).

## Required Operations Runbooks

- [Operations Overview](../operations/README.md)
- [Pre-Deployment Checklist](../operations/pre-deployment-checklist.md)
- [Deployment Procedure](../operations/deployment-procedure.md)
- [Smoke Tests Guide](../operations/smoke-tests.md)
- [Rollback Procedure](../operations/rollback-procedure.md)
- [Incident Response Runbook](../operations/incident-response.md)

## Decision Definitions

### `GO`

Use when release blockers are resolved or explicitly accepted, launch evidence is complete, rollback remains viable, and required approvers are aligned.

### `GO WITH CONDITIONS`

Use when launch can proceed with bounded non-blocking risk, every condition is written down, and each condition has an owner and follow-up deadline outside this repository.

### `NO-GO`

Use when a blocker is unresolved, evidence is incomplete, rollback readiness is unclear, or an approver stops the launch.
