# GEL-8 Platform Settings Database Persistence Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Replace file-based platform settings with a dedicated database-backed singleton record seeded from defaults and used as the single source of truth.

**Architecture:** Add a dedicated `platform_settings` table with typed columns and a unique singleton key. Create a small helper layer to map between DB rows and the API shape, bootstrap the singleton row from defaults (or legacy file data if present), then refactor the admin settings route to read/write only through the database and emit audit logs on update.

**Tech Stack:** Prisma schema + SQL migration, Next.js route handlers, TypeScript, Node test runner

---

### Task 1: Add failing tests for settings helpers

**Files:**
- Create: `lib/platform-settings.test.ts`
- Modify: `package.json`

**Steps:**
1. Write test for deep merge behavior.
2. Write test for DB-row to API-shape mapping.
3. Add a targeted test script.

### Task 2: Add DB model and helper layer

**Files:**
- Modify: `prisma/schema.prisma`
- Create: `prisma/migrations/20260308_platform_settings/migration.sql`
- Create: `lib/platform-settings.ts`

**Steps:**
1. Add typed `PlatformSettings` model.
2. Add SQL migration for the singleton table.
3. Add helper functions for defaults, mapping, bootstrap, and save.

### Task 3: Refactor admin settings route

**Files:**
- Modify: `app/api/admin/settings/route.ts`

**Steps:**
1. Remove file-based reads and writes.
2. Bootstrap settings row from defaults/legacy file if missing.
3. Persist updates in DB and create audit log entries.

### Task 4: Verify and sync tracking

**Files:**
- Verify only

**Steps:**
1. Run targeted settings tests.
2. Run lint on touched files.
3. Update Linear issue status and notes.
