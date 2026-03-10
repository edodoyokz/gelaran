# GEL-18 Go-Live Readiness Package Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Create a complete go-live readiness package that operators and approvers can use to review blockers, record launch evidence, and capture go/no-go sign-off.

**Architecture:** Add a small documentation package under `docs/go-live/` that orchestrates the existing operational runbooks in `docs/operations/`. Keep procedures DRY by linking to the existing runbooks for deployment, rollback, smoke tests, and incident response, while the new package focuses on readiness review, evidence capture, and sign-off.

**Tech Stack:** Markdown documentation, Linear issue references, existing operations docs

---

### Task 1: Create go-live package index

**Files:**
- Create: `docs/go-live/README.md`
- Review: `docs/operations/README.md`
- Review: `docs/plans/2026-03-10-gel-18-go-live-readiness-design.md`

**Steps:**
1. Create `docs/go-live/README.md` with a short purpose statement for the package.
2. Add an ordered usage flow covering readiness review, checklist execution, evidence capture, and sign-off.
3. Link the index to `docs/operations/pre-deployment-checklist.md`, `docs/operations/deployment-procedure.md`, `docs/operations/smoke-tests.md`, `docs/operations/rollback-procedure.md`, and `docs/operations/incident-response.md`.
4. Add a concise definition of `GO`, `GO WITH CONDITIONS`, and `NO-GO`.
5. Verify links are relative and clickable from the repository.

### Task 2: Create readiness review template

**Files:**
- Create: `docs/go-live/go-live-readiness-review.md`
- Review: `docs/operations/README.md`
- Review: `docs/operations/operator-ownership.md`
- Review: `docs/operations/smoke-tests.md`

**Steps:**
1. Add a header section for release date, deployment reference, environment, review owner, and review time.
2. Add a release-blocker review table with columns for issue, status, owner, notes, and blocking impact.
3. Add readiness sections for deployment, rollback, smoke tests, monitoring, communications, and operator coverage.
4. Add a risk register section with severity, mitigation, and owner fields.
5. Add a launch recommendation section with explicit `GO`, `GO WITH CONDITIONS`, and `NO-GO` options.

### Task 3: Create launch-day execution checklist

**Files:**
- Create: `docs/go-live/go-live-checklist.md`
- Review: `docs/operations/pre-deployment-checklist.md`
- Review: `docs/operations/deployment-procedure.md`
- Review: `docs/operations/rollback-procedure.md`
- Review: `docs/operations/smoke-tests.md`

**Steps:**
1. Add a pre-launch checklist section that references pre-deployment validation and owner confirmation.
2. Add a deployment checkpoint section for release start, migration confirmation, and deployment completion.
3. Add a smoke-test checkpoint section that points to the required public and operator checks.
4. Add a monitoring watch-window checklist with owner assignment and escalation triggers.
5. Add a final decision gate section that requires evidence log and sign-off completion before declaring launch complete.

### Task 4: Create evidence log template

**Files:**
- Create: `docs/go-live/go-live-evidence-log.md`
- Review: `docs/operations/smoke-tests.md`
- Review: `docs/operations/rollback-procedure.md`
- Review: `docs/operations/incident-response.md`

**Steps:**
1. Add fields for deployment reference, environment, operator, and timestamps.
2. Add sections for public route checks, smoke-test results, booking/check-in validation, and monitoring observations.
3. Add a section for issues found, including severity, owner, and linked Linear issue or incident reference.
4. Add a rollback readiness confirmation section that records whether rollback remains viable after launch checks.
5. Add a final summary section for launch outcome and follow-up actions.

### Task 5: Create sign-off template

**Files:**
- Create: `docs/go-live/go-live-signoff.md`
- Review: `docs/operations/operator-ownership.md`
- Review: `docs/operations/incident-response.md`

**Steps:**
1. Add approver rows for engineering owner, operator/on-call owner, product owner, and final decision owner.
2. Add allowed status values: `APPROVED`, `APPROVED WITH CONDITIONS`, and `BLOCKED`.
3. Add fields for timestamp, condition notes, and blocker notes.
4. Add a final decision summary section with `GO`, `GO WITH CONDITIONS`, or `NO-GO`.
5. Add a reminder that names and private contact details live in the secure roster, not in the repository.

### Task 6: Cross-link and align package language

**Files:**
- Modify: `docs/go-live/README.md`
- Modify: `docs/go-live/go-live-readiness-review.md`
- Modify: `docs/go-live/go-live-checklist.md`
- Modify: `docs/go-live/go-live-evidence-log.md`
- Modify: `docs/go-live/go-live-signoff.md`
- Review: `docs/operations/README.md`

**Steps:**
1. Re-read all new go-live docs and make terminology consistent across `owner`, `approver`, `decision owner`, and `secure ops roster`.
2. Ensure every document links back to the package index or the relevant operations runbook.
3. Remove any duplicate procedural detail that should instead reference an existing operations doc.
4. Ensure no sensitive placeholders or fake endpoints are introduced.
5. Update the package index if any file names or flows changed during drafting.

### Task 7: Verify the package and update Linear

**Files:**
- Review: `docs/go-live/README.md`
- Review: `docs/go-live/go-live-readiness-review.md`
- Review: `docs/go-live/go-live-checklist.md`
- Review: `docs/go-live/go-live-evidence-log.md`
- Review: `docs/go-live/go-live-signoff.md`

**Steps:**
1. Run: `test -f docs/go-live/README.md && test -f docs/go-live/go-live-readiness-review.md && test -f docs/go-live/go-live-checklist.md && test -f docs/go-live/go-live-evidence-log.md && test -f docs/go-live/go-live-signoff.md`
2. Run: `rg -n '\[TODO\]|gelaran\.example\.com|api/health|Reviewed by' docs/go-live docs/operations`
3. Manually inspect links and headings in the new package for clarity and flow.
4. Add a Linear progress comment summarizing the new package and the remaining human sign-off requirement.
5. Move `GEL-18` to the appropriate workflow state once the documentation package is reviewed.
