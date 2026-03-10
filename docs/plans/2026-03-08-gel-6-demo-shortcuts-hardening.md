# GEL-6 Demo Shortcuts Hardening Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Keep demo login conveniences available in local development only while ensuring beta and production never expose demo credentials or quick-login shortcuts.

**Architecture:** Add a small helper that derives whether auth demo shortcuts may render from validated env state. Test the helper first, then update the login page to gate demo UI and quick-login helpers behind that single source of truth, keeping the rest of the auth flow unchanged.

**Tech Stack:** Next.js 16, React 19, TypeScript, Node test runner

---

### Task 1: Add failing test for demo gating

**Files:**
- Create: `lib/demo-mode.test.ts`
- Modify: `package.json`

**Steps:**
1. Write test proving local stage enables auth demo shortcuts.
2. Write test proving beta and production disable them.
3. Add or reuse a targeted test script.

### Task 2: Implement demo gating helper

**Files:**
- Create: `lib/demo-mode.ts`

**Steps:**
1. Encode stage-based rule in one helper.
2. Keep output small and explicit.
3. Reuse validated env values where possible.

### Task 3: Apply helper to login page

**Files:**
- Modify: `app/(auth)/login/page.tsx`

**Steps:**
1. Remove unconditional demo account rendering.
2. Render demo card and quick-login only in local stage.
3. Keep manual login flow unchanged.

### Task 4: Verify and sync tracking

**Files:**
- Verify only

**Steps:**
1. Run targeted demo-mode tests.
2. Run lint on touched files.
3. Update Linear issue status and notes.
