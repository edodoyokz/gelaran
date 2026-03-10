# GEL-19 Prisma Config Migration Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Move deprecated Prisma CLI configuration out of `package.json` into `prisma.config.ts` without breaking seed or verification flows.

**Architecture:** Add a tiny regression test that fails while `package.json#prisma` still exists, then introduce root-level `prisma.config.ts` using Prisma's official `defineConfig` API and remove the deprecated package.json block. Keep the seed command unchanged from the developer perspective.

**Tech Stack:** pnpm, Prisma ORM, TypeScript, Node test runner

---

### Task 1: Add failing regression test

**Files:**
- Create: `lib/prisma-config.test.ts`
- Modify: `package.json`

**Steps:**
1. Add a test that asserts `package.json` has no `prisma` key and `prisma.config.ts` defines the seed command.
2. Add the test to the aggregated `test` script.
3. Run the test and confirm it fails before implementation.

### Task 2: Migrate Prisma config

**Files:**
- Create: `prisma.config.ts`
- Modify: `package.json`

**Steps:**
1. Add official Prisma config via `defineConfig`.
2. Move seed command definition into `prisma.config.ts`.
3. Remove deprecated `package.json#prisma` block.

### Task 3: Verify and sync

**Files:**
- Verify only

**Steps:**
1. Run the new regression test and confirm it passes.
2. Run `pnpm run verify` and confirm build warning is gone.
3. Update `GEL-19` in Linear with evidence.
