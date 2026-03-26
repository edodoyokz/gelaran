# Multi-Role Stitch UI Generation Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Generate a complete multi-role UI screen set for Gelaran in Stitch with consistent light and dark mode behavior across customer, organizer, admin, POS, and gate flows.

**Architecture:** Use the approved multi-role design system as the source of truth, then generate screens in Stitch batch-by-batch starting from public/customer flow and moving inward to operations. Reuse prompt structure, naming, and role-specific shell patterns so outputs remain consistent even when individual screen regeneration is needed.

**Tech Stack:** Stitch MCP, approved design docs in `docs/plans/`, existing route inventory from Next.js App Router, project `3864492234997357662`

---

### Task 1: Establish the generation backlog

**Files:**
- Review: `docs/plans/2026-03-26-multi-role-stitch-ui-system-design.md`
- Review: `app/page.tsx`
- Review: `app/events/page.tsx`
- Review: `app/events/[slug]/page.tsx`
- Review: `app/organizer/page.tsx`
- Review: `app/admin/page.tsx`
- Review: `app/pos/page.tsx`
- Review: `app/gate/page.tsx`

**Step 1: Confirm the approved screen inventory**

Read the design doc and route list, then map each required Stitch screen to a product route or operational flow.

**Step 2: Write the ordered backlog**

Create an execution checklist outside Stitch in working notes:

1. Customer core screens
2. Customer account screens
3. Organizer core screens
4. Admin core screens
5. POS and gate screens

**Step 3: Verify no critical route is missing**

Expected result: each high-value route has a planned Stitch counterpart or an intentional omission.

### Task 2: Normalize prompt templates

**Files:**
- Review: `docs/plans/2026-03-26-multi-role-stitch-ui-system-design.md`
- Review: `color-palette-reference.md`

**Step 1: Write a shared prompt backbone**

Include:

- brand palette
- light mode white background rule
- dark mode dark teal rule
- theme toggle rule
- typography direction
- no-purple / no-generic-SaaS constraint
- role-specific shell guidance

**Step 2: Write role modifiers**

Prepare prompt fragments for:

- customer editorial mode
- organizer productivity mode
- admin analytics mode
- POS / gate operational mode

**Step 3: Verify prompt DRYness**

Expected result: the majority of prompt wording is shared, with only role-specific and page-specific deltas changing.

### Task 3: Generate and refine public/customer desktop screens

**Files:**
- Review: `app/page.tsx`
- Review: `app/events/page.tsx`
- Review: `app/events/[slug]/page.tsx`
- Review: `app/checkout/page.tsx`
- Review: `app/checkout/success/page.tsx`
- Review: `app/checkout/pending/page.tsx`
- Review: `app/checkout/failed/page.tsx`
- Review: `app/(customer)/dashboard/page.tsx`
- Review: `app/(customer)/my-bookings/page.tsx`
- Review: `app/(customer)/wishlist/page.tsx`
- Review: `app/(customer)/profile/page.tsx`

**Step 1: Generate light desktop screens**

Generate:

- Landing
- Events Listing
- Event Detail
- Organizer Profile
- Checkout
- Checkout Success
- Checkout Pending
- Checkout Failed
- Customer Dashboard
- My Bookings
- Wishlist
- Profile

**Step 2: Generate dark desktop counterparts for priority screens**

Generate dark versions for:

- Landing
- Events Listing
- Event Detail
- Checkout
- Customer Dashboard
- My Bookings

**Step 3: Refine off-brand outputs**

If any screen drifts into tinted light mode or near-black dark mode, regenerate that screen with a tighter page-specific prompt.

**Step 4: Verify naming**

Expected result: generated screens are clearly named by role, page, and mode.

### Task 4: Generate and refine auth plus support screens

**Files:**
- Review: `app/(auth)/login/page.tsx`
- Review: `app/(auth)/register/page.tsx`
- Review: `app/(auth)/forgot-password/page.tsx`
- Review: `app/(auth)/reset-password/page.tsx`
- Review: `app/docs/customer/page.tsx`
- Review: `app/about/page.tsx`
- Review: `app/contact/page.tsx`
- Review: `app/become-organizer/page.tsx`

**Step 1: Generate light desktop screens**

Generate:

- Login
- Register
- Forgot Password
- Reset Password
- FAQ / Customer Docs
- About
- Contact
- Become Organizer

**Step 2: Generate dark counterparts for auth**

Generate dark versions for:

- Login
- Register

**Step 3: Check continuity**

Expected result: auth and support screens feel like the same product family as the public/customer core screens.

### Task 5: Generate organizer desktop screens

**Files:**
- Review: `app/organizer/page.tsx`
- Review: `app/organizer/events/page.tsx`
- Review: `app/organizer/team/page.tsx`
- Review: `app/organizer/wallet/page.tsx`
- Review: `app/organizer/gate/page.tsx`
- Review: `app/organizer/settings/page.tsx`

**Step 1: Generate light desktop screens**

Generate:

- Organizer Dashboard
- Organizer Events List
- Organizer Event Create / Edit
- Organizer Event Detail Management
- Organizer Team
- Organizer Wallet
- Organizer Gate Management
- Organizer Settings

**Step 2: Generate dark desktop counterparts for priority screens**

Generate dark versions for:

- Organizer Dashboard
- Organizer Events List
- Organizer Wallet

**Step 3: Verify operational density**

Expected result: organizer screens are task-focused, not marketing-like, while still using the shared visual language.

### Task 6: Generate admin desktop screens

**Files:**
- Review: `app/admin/page.tsx`
- Review: `app/admin/users/page.tsx`
- Review: `app/admin/events/page.tsx`
- Review: `app/admin/bookings/page.tsx`
- Review: `app/admin/finance/page.tsx`
- Review: `app/admin/analytics/page.tsx`
- Review: `app/admin/categories/page.tsx`
- Review: `app/admin/venues/page.tsx`
- Review: `app/admin/refunds/page.tsx`
- Review: `app/admin/payouts/page.tsx`
- Review: `app/admin/reviews/page.tsx`
- Review: `app/admin/complimentary-requests/page.tsx`
- Review: `app/admin/landing-page/page.tsx`
- Review: `app/admin/settings/page.tsx`

**Step 1: Generate light desktop screens**

Generate:

- Admin Dashboard
- Admin Users
- Admin Events
- Admin Bookings
- Admin Finance
- Admin Analytics
- Admin Categories
- Admin Venues
- Admin Refunds
- Admin Payouts
- Admin Reviews
- Admin Complimentary Requests
- Admin Landing Page Manager
- Admin Settings

**Step 2: Generate dark desktop counterparts for priority screens**

Generate dark versions for:

- Admin Dashboard
- Admin Users
- Admin Events
- Admin Analytics

**Step 3: Verify data density**

Expected result: admin screens prioritize charts, stats, tables, filters, and control surfaces without breaking the shared system.

### Task 7: Generate POS and gate operational screens

**Files:**
- Review: `app/pos/access/page.tsx`
- Review: `app/pos/page.tsx`
- Review: `components/pos/POSSeatSelector.tsx`
- Review: `app/gate/access/page.tsx`
- Review: `app/gate/page.tsx`
- Review: `components/gate/QRScanner.tsx`
- Review: `app/scanner/page.tsx`

**Step 1: Generate light operational desktop screens**

Generate:

- POS Access
- POS Main
- POS Seat Selection
- Gate Access
- Gate Check-In Main
- Gate Scan Result States
- Scanner Utility

**Step 2: Generate dark operational counterparts where useful**

Generate dark versions for:

- POS Main
- Gate Check-In Main

**Step 3: Verify field usability**

Expected result: these screens use larger touch targets, stronger status messaging, and less decorative complexity than dashboard or public pages.

### Task 8: Organize outputs and reconcile duplicates

**Files:**
- Review: Stitch screen list in project `3864492234997357662`

**Step 1: Review generated screen names**

Rename or regenerate screens whose names are unclear, duplicate, or missing role/mode/page labels.

**Step 2: Flag obsolete exploratory screens**

Identify early exploratory screens that should not be treated as final references.

**Step 3: Write an inventory summary**

Record final screen IDs and titles in follow-up notes so implementation has a stable reference set.

Expected result: the Stitch project has a clear, navigable screen set rather than a loose collection of experiments.

### Task 9: Final review against acceptance criteria

**Files:**
- Review: `docs/plans/2026-03-26-multi-role-stitch-ui-system-design.md`

**Step 1: Check mode rules**

Confirm:

- light mode uses true white base canvas
- dark mode uses premium dark teal

**Step 2: Check family consistency**

Confirm:

- customer feels editorial
- organizer feels productive
- admin feels analytical
- POS / gate feels operational

**Step 3: Check project completeness**

Confirm each priority role has its core screens present.

**Step 4: Commit**

```bash
git add docs/plans/2026-03-26-multi-role-stitch-ui-system-design.md docs/plans/2026-03-26-multi-role-stitch-ui-generation.md
git commit -m "docs: add multi-role stitch ui design and generation plan"
```

Expected result: planning artifacts are preserved locally before further execution.
