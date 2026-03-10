# GEL-9 CI Quality Gates Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Introduce a pnpm-based quality gate that standardizes local verification and GitHub Actions CI for lint, build, and targeted tests.

**Architecture:** Define a single verification command in `package.json` and make GitHub Actions call that same command. Keep the workflow lightweight: install with frozen lockfile, provide safe placeholder env vars for build-time validation, and run the verify script as the blocking gate.

**Tech Stack:** pnpm, GitHub Actions, Next.js build, ESLint, Node test runner

---

### Task 1: Standardize scripts

**Files:**
- Modify: `package.json`

**Steps:**
1. Add a `test` aggregator for targeted tests.
2. Add a `verify` script for lint + test + build.
3. Ensure script names match CI usage.

### Task 2: Add GitHub Actions workflow

**Files:**
- Create: `.github/workflows/ci.yml`

**Steps:**
1. Set up checkout, pnpm, and Node.
2. Install dependencies with frozen lockfile.
3. Provide safe build-time env placeholders.
4. Run the verify command.

### Task 3: Document developer workflow

**Files:**
- Modify: `README.md`

**Steps:**
1. Declare `pnpm` as the official package manager.
2. Document `pnpm run test` and `pnpm run verify`.
3. Explain CI alignment with Vercel.

### Task 4: Verify and sync tracking

**Files:**
- Verify only

**Steps:**
1. Run targeted test aggregator locally.
2. Run lint and build to capture actual gate status.
3. Update Linear with implementation status and evidence.
