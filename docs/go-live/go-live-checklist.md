# Go-Live Checklist

Use this checklist during the launch window. Execute detailed procedures from the linked operations docs and record actual evidence in [Go-Live Evidence Log](./go-live-evidence-log.md) before requesting the final decision.

Back to package index: [Go-Live Readiness Package](./README.md)

## Pre-Launch

References: [Pre-Deployment Checklist](../operations/pre-deployment-checklist.md) and [Operator Ownership](../operations/operator-ownership.md)

- [ ] Confirm the latest readiness review is complete in [Go-Live Readiness Review](./go-live-readiness-review.md).
- [ ] Confirm deployment owner, on-call owner, and decision owner against the secure ops roster.
- [ ] Confirm stakeholder communication channel is active for launch updates.
- [ ] Confirm pre-deployment validation is complete before starting the release window.

## Deployment Checkpoints

Reference: [Deployment Procedure](../operations/deployment-procedure.md)

- [ ] Record release start time and deployment reference in [Go-Live Evidence Log](./go-live-evidence-log.md).
- [ ] Confirm migration execution result or note that no migration was required.
- [ ] Confirm application deployment completed and the target environment is serving the new release.
- [ ] Pause before smoke tests if any deployment concern needs immediate review.

## Smoke-Test Checkpoints

Reference: [Smoke Tests Guide](../operations/smoke-tests.md)

- [ ] Complete required public route and public API checks.
- [ ] Complete required customer journey checks.
- [ ] Complete required operator or admin checks.
- [ ] Record failures, degraded behavior, or skipped checks in [Go-Live Evidence Log](./go-live-evidence-log.md).

## Monitoring Watch Window

References: [Incident Response Runbook](../operations/incident-response.md) and [Rollback Procedure](../operations/rollback-procedure.md)

- [ ] Assign the active watch-window owner and backup owner.
- [ ] Confirm dashboards, alerts, and logs are visible before declaring launch stable.
- [ ] Record any alert, anomaly, or user report in [Go-Live Evidence Log](./go-live-evidence-log.md).
- [ ] Escalate through the incident runbook if a blocking issue appears during the watch window.
- [ ] Re-check rollback viability if the launch state changes after deployment.

## Final Decision Gate

References: [Go-Live Sign-Off](./go-live-signoff.md) and [Rollback Procedure](../operations/rollback-procedure.md)

- [ ] Confirm [Go-Live Evidence Log](./go-live-evidence-log.md) is current and complete.
- [ ] Confirm required approvers have recorded status in [Go-Live Sign-Off](./go-live-signoff.md).
- [ ] Confirm unresolved conditions or blockers are explicit and have owners.
- [ ] Declare launch complete only after the decision owner records `GO`, `GO WITH CONDITIONS`, or `NO-GO`.
