# Public + Auth Stitch Alignment Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Align the public, checkout, and auth customer journey to the approved Stitch designs with high visual fidelity while preserving the existing Next.js routes, data flow, and behavior-sensitive flows.

**Architecture:** Implement the redesign by updating shared customer-facing tokens, shells, and reusable primitives first, then apply those primitives to each page family in rollout waves. Treat Stitch HTML files as visual reference only; map their hierarchy and styling intent into the current route/component ownership without replacing route structure, client/server boundaries, or transactional logic.

**Tech Stack:** Next.js 16 App Router, React 19, TypeScript, Tailwind CSS v4, existing shared UI primitives under `components/`, node test runner via `tsx`, ESLint, TypeScript compiler, Next build verification.

---

## Implementation Notes

- Work in small TDD-style loops whenever there is a reusable primitive, rendering branch, or page-level state that can be asserted safely.
- Before changing any page family, open the corresponding Stitch HTML file(s) and capture the intended layout, spacing rhythm, typography treatment, CTA hierarchy, and responsive behavior to be reproduced in React.
- Preserve all existing data-fetching, auth, pricing, and checkout behavior; this plan changes presentation and shared page composition, not backend behavior.
- Prefer updating shared primitives before editing page-local markup. Only add new components when the current primitives cannot express the approved Stitch direction cleanly.
- Use focused commits after each finished task family so the rollout remains reviewable and reversible.

## Wave 1 - Foundations

### Task 1: Audit the current public/auth shell and map Stitch references

**Files:**
- Review: `docs/plans/2026-03-27-public-auth-stitch-design.md`
- Review: `stitch-designs/Gelaran_-_White_Theme_Landing_Page.html`
- Review: `stitch-designs/Gelaran_-_Events_Listing_Light_Mode.html`
- Review: `stitch-designs/Gelaran_-_Event_Detail_Light_Mode.html`
- Review: `stitch-designs/Gelaran_-_Checkout_Desktop_Light_Mode.html`
- Review: `stitch-designs/Checkout_Success_-_Gelaran.html`
- Review: `stitch-designs/Checkout_Pending_-_Gelaran.html`
- Review: `stitch-designs/Checkout_Failed_-_Gelaran.html`
- Review: `stitch-designs/Gelaran_-_Desktop_Login.html`
- Review: `stitch-designs/Gelaran_-_Desktop_Registration.html`
- Review: `stitch-designs/Forgot_Password_-_Gelaran.html`
- Review: `stitch-designs/Reset_Password_-_Gelaran.html`
- Review: `stitch-designs/Organizer_Profile_-_SoloCurator.html`
- Review: `stitch-designs/About_Gelaran_-_Cultural_Curation.html`
- Review: `stitch-designs/Contact_Us_-_Gelaran.html`
- Review: `stitch-designs/Become_an_Organizer_-_Gelaran.html`

**Step 1: Review the design doc and Stitch HTML references**

- Read the approved design doc and each page-family Stitch HTML file before editing implementation files.
- Capture a lightweight mapping note in the implementation branch or task log covering: hero composition, section order, card treatments, button/input styling, shell background treatment, and mobile layout expectations.

**Step 2: Inspect the shared implementation surfaces that currently own public/auth styling**

Review these files before any code changes:

- `app/layout.tsx`
- `app/globals.css`
- `components/layouts/Navbar.tsx`
- `components/layouts/Footer.tsx`
- `components/shared/public-marketing.tsx`
- `components/shared/auth-ui.tsx`
- `components/shared/phase-two-shells.tsx`
- `components/features/events/discovery-primitives.tsx`
- `components/features/checkout/checkout-primitives.tsx`
- `components/customer/customer-dashboard-primitives.tsx`
- `app/(auth)/layout.tsx`
- `app/(customer)/layout.tsx`

**Step 3: Record exact gaps between current primitives and Stitch direction**

- Identify which visual concerns belong in tokens/global CSS versus shared primitives versus route-local composition.
- Explicitly list any missing primitives likely needed, such as refined hero variants, editorial section wrappers, auth framing blocks, checkout summary/status treatments, or customer continuity shell tweaks.

**Step 4: Commit the audit checkpoint**

```bash
git add docs/plans/2026-03-27-public-auth-stitch-implementation.md
git commit -m "docs: outline public auth stitch rollout"
```

### Task 2: Establish token and global shell updates needed by all waves

**Files:**
- Modify: `app/globals.css`
- Modify: `app/layout.tsx`
- Modify: `components/providers/ThemeProvider.tsx` (only if token/theme wiring must change)
- Modify: `components/layouts/Navbar.tsx`
- Modify: `components/layouts/Footer.tsx`
- Test: `lib/layout-fonts.test.ts`

**Step 1: Write or update a failing verification for shell-level assumptions if token wiring changes behavior**

- If fonts, layout class names, or theme wrappers change in a way covered by tests, update `lib/layout-fonts.test.ts` first.
- If no meaningful automated assertion exists for the visual token change, document manual verification instead of adding brittle cosmetic-only tests.

**Step 2: Run the targeted verification first**

Run: `pnpm run test:layout-fonts`

Expected: existing test passes before token changes, or a focused failure appears if the shell contract is being updated intentionally.

**Step 3: Implement the minimal shared token updates**

- Update global CSS variables for approved public/auth typography, spacing, surface layering, radii, shadows, gradients, and shell backgrounds.
- Keep the token changes scoped to customer-facing surfaces and avoid breaking admin/organizer/POS/gate pages.
- Adjust global app shell wiring only where required for the new visual language.

**Step 4: Verify the targeted shell contract**

Run: `pnpm run test:layout-fonts`

Expected: PASS.

**Step 5: Commit the token foundation**

```bash
git add app/globals.css app/layout.tsx components/providers/ThemeProvider.tsx components/layouts/Navbar.tsx components/layouts/Footer.tsx lib/layout-fonts.test.ts
git commit -m "feat: establish public auth visual foundations"
```

### Task 3: Refine shared public/auth/checkout primitives before page work

**Files:**
- Modify: `components/shared/public-marketing.tsx`
- Modify: `components/shared/auth-ui.tsx`
- Modify: `components/shared/phase-two-shells.tsx`
- Modify: `components/features/events/discovery-primitives.tsx`
- Modify: `components/features/checkout/checkout-primitives.tsx`
- Modify: `components/customer/customer-dashboard-primitives.tsx`
- Create: `components/shared/public-auth-tokens.ts` (only if a shared config object simplifies repeated variants)

**Step 1: Review the relevant Stitch references again before touching primitives**

- Public shell baseline: `stitch-designs/Gelaran_-_White_Theme_Landing_Page.html`
- Discovery/detail baseline: `stitch-designs/Gelaran_-_Events_Listing_Light_Mode.html`, `stitch-designs/Gelaran_-_Event_Detail_Light_Mode.html`
- Checkout baseline: `stitch-designs/Gelaran_-_Checkout_Desktop_Light_Mode.html`, `stitch-designs/Checkout_Success_-_Gelaran.html`, `stitch-designs/Checkout_Pending_-_Gelaran.html`, `stitch-designs/Checkout_Failed_-_Gelaran.html`
- Auth baseline: `stitch-designs/Gelaran_-_Desktop_Login.html`, `stitch-designs/Gelaran_-_Desktop_Registration.html`, `stitch-designs/Forgot_Password_-_Gelaran.html`, `stitch-designs/Reset_Password_-_Gelaran.html`

**Step 2: Add focused tests only where shared logic or render branching exists**

- If a new pure helper/config is introduced under `components/shared/` or `lib/`, add a small node test beside existing `lib/*.test.ts` coverage.
- Do not add brittle snapshot tests for purely cosmetic markup unless the repository already has that pattern.

**Step 3: Implement the minimal primitive updates**

- Bring hero, editorial panel, section wrappers, input shells, CTA treatments, status cards, and continuity primitives closer to Stitch.
- Keep APIs stable where possible so route files can migrate incrementally.

**Step 4: Verify primitive safety**

Run: `pnpm run lint`

Expected: PASS for updated shared components.

**Step 5: Commit the primitive layer**

```bash
git add components/shared/public-marketing.tsx components/shared/auth-ui.tsx components/shared/phase-two-shells.tsx components/features/events/discovery-primitives.tsx components/features/checkout/checkout-primitives.tsx components/customer/customer-dashboard-primitives.tsx components/shared/public-auth-tokens.ts
git commit -m "feat: refine shared public auth ui primitives"
```

## Wave 2 - Public Pages

### Task 4: Align the landing page to the approved Stitch home direction

**Files:**
- Review: `stitch-designs/Gelaran_-_White_Theme_Landing_Page.html`
- Review: `stitch-designs/Gelaran_-_Home.html`
- Modify: `app/page.tsx`
- Modify: `components/features/home/Hero.tsx`
- Modify: `components/features/home/CategoryPill.tsx`
- Modify: `components/features/home/index.ts`
- Modify: `components/features/events/EventCard.tsx`
- Modify: `components/features/reviews/ReviewSection.tsx` (if reused on home)
- Modify: `components/shared/public-marketing.tsx`

**Step 1: Review the Stitch landing HTML before editing**

- Confirm hero visual hierarchy, featured-event composition, editorial content blocks, stat treatment, category filters, and CTA placement.
- Note how the mobile layout collapses hero and featured content.

**Step 2: Add or update any safe helper test if new transformation logic is introduced**

- If home-page data formatting or derived section mapping moves into a pure helper under `lib/` or `components/features/home/`, add a focused node test for that helper first.
- Otherwise skip test creation and rely on lint/typecheck/manual route verification.

**Step 3: Implement minimal landing-page composition updates**

- Recompose `app/page.tsx` using shared marketing primitives and existing data contracts.
- Update home-specific components only where the current primitives cannot express the approved Stitch composition.

**Step 4: Verify the route and shared components**

Run: `pnpm run lint -- app/page.tsx components/features/home/Hero.tsx components/features/home/CategoryPill.tsx components/features/events/EventCard.tsx components/shared/public-marketing.tsx`

Expected: PASS.

**Step 5: Perform manual route verification**

- Run: `pnpm run dev`
- Verify `/` against the approved Stitch hierarchy on desktop and mobile widths.
- Confirm loading, empty, and dynamic event states still render without crashes.

**Step 6: Commit the landing page**

```bash
git add app/page.tsx components/features/home/Hero.tsx components/features/home/CategoryPill.tsx components/features/home/index.ts components/features/events/EventCard.tsx components/features/reviews/ReviewSection.tsx components/shared/public-marketing.tsx
git commit -m "feat: align landing page with stitch direction"
```

### Task 5: Align public discovery surfaces for events listing

**Files:**
- Review: `stitch-designs/Gelaran_-_Events_Listing_Light_Mode.html`
- Modify: `app/events/page.tsx`
- Modify: `components/features/events/discovery-primitives.tsx`
- Modify: `components/features/events/EventCard.tsx`
- Modify: `components/features/events/index.ts`

**Step 1: Review the Stitch listing HTML before editing**

- Confirm filter panel placement, sort controls, chips, stat blocks, grid/list treatments, and responsive filter behavior.

**Step 2: Write a focused failing test only if new filter/query helper logic is extracted**

- If URL-filter parsing or chip-label generation is moved into a pure helper, add a small node test first under `lib/` or the new helper file.

**Step 3: Run the focused helper test if one was added**

Run: `node --import tsx --test path/to/new-helper.test.ts`

Expected: FAIL before implementation.

**Step 4: Implement the minimal listing-page changes**

- Keep the existing fetch/query behavior in `app/events/page.tsx` intact.
- Update layout, filters, cards, and section composition to match Stitch more closely.

**Step 5: Run verification**

Run: `pnpm run lint -- app/events/page.tsx components/features/events/discovery-primitives.tsx components/features/events/EventCard.tsx`

Expected: PASS.

**Step 6: Perform manual route verification**

- Verify `/events` desktop/mobile layouts.
- Confirm search, filter, sort, chip removal, pagination, grid/list switch, and empty/loading states still work.

**Step 7: Commit the discovery surface**

```bash
git add app/events/page.tsx components/features/events/discovery-primitives.tsx components/features/events/EventCard.tsx components/features/events/index.ts path/to/new-helper.test.ts
git commit -m "feat: refresh event discovery surfaces"
```

### Task 6: Align event detail and FAQ surfaces

**Files:**
- Review: `stitch-designs/Gelaran_-_Event_Detail_Light_Mode.html`
- Modify: `app/events/[slug]/page.tsx`
- Modify: `app/events/[slug]/faq/page.tsx`
- Modify: `components/features/events/EventDetailView.tsx`
- Modify: `components/features/events/TicketModal.tsx`
- Modify: `components/features/events/VenueMapViewer.tsx`
- Modify: `components/features/events/index.ts`

**Step 1: Review the Stitch detail HTML before editing**

- Confirm hero media treatment, metadata grouping, pricing/CTA hierarchy, FAQ structure, sticky purchase behavior, and responsive order of sections.

**Step 2: Add a focused failing test if pure detail-mapping helpers are extracted**

- Example candidates: schedule formatting helper, ticket summary helper, FAQ grouping helper.
- Put helper tests under `lib/` if logic becomes reusable.

**Step 3: Run the targeted helper test if created**

Run: `node --import tsx --test path/to/new-detail-helper.test.ts`

Expected: FAIL before implementation.

**Step 4: Implement the minimal detail/FAQ updates**

- Keep `getEvent` and route ownership intact.
- Express the approved Stitch layout through `EventDetailView` and related reusable detail primitives.
- Preserve seat-selection, pricing, sold-out, schedule, and FAQ behavior.

**Step 5: Verify route safety**

Run: `pnpm run lint -- app/events/[slug]/page.tsx app/events/[slug]/faq/page.tsx components/features/events/EventDetailView.tsx components/features/events/TicketModal.tsx components/features/events/VenueMapViewer.tsx`

Expected: PASS.

**Step 6: Perform manual route verification**

- Verify `/events/[slug]` with a published event containing schedules, ticket types, and FAQs.
- Confirm sticky CTA, modal flows, seating/price branches, long descriptions, and mobile stacking remain functional.
- Verify `/events/[slug]/faq` visually matches the same family language.

**Step 7: Commit the detail family**

```bash
git add app/events/[slug]/page.tsx app/events/[slug]/faq/page.tsx components/features/events/EventDetailView.tsx components/features/events/TicketModal.tsx components/features/events/VenueMapViewer.tsx components/features/events/index.ts path/to/new-detail-helper.test.ts
git commit -m "feat: align event detail journey with stitch"
```

### Task 7: Align organizer profile and public content pages

**Files:**
- Review: `stitch-designs/Organizer_Profile_-_SoloCurator.html`
- Review: `stitch-designs/About_Gelaran_-_Cultural_Curation.html`
- Review: `stitch-designs/Contact_Us_-_Gelaran.html`
- Review: `stitch-designs/Become_an_Organizer_-_Gelaran.html`
- Modify: `app/organizers/[slug]/page.tsx`
- Modify: `app/about/page.tsx`
- Modify: `app/contact/page.tsx`
- Modify: `app/become-organizer/page.tsx`
- Modify: `components/shared/public-marketing.tsx`

**Step 1: Review the Stitch references before editing**

- Confirm organizer-profile editorial framing, bio/event modules, and content-page section rhythm.
- Re-check CTA hierarchy and how informational pages inherit the public marketing language.

**Step 2: Add a failing test only if pure page-content mapping helpers are introduced**

- If no pure helper is extracted, skip automated test creation for this purely compositional work.

**Step 3: Implement the minimal content-page changes**

- Update these routes to reuse the same public primitives and token language established earlier.
- Preserve metadata, navigation, and existing link behavior.

**Step 4: Verify**

Run: `pnpm run lint -- app/organizers/[slug]/page.tsx app/about/page.tsx app/contact/page.tsx app/become-organizer/page.tsx components/shared/public-marketing.tsx`

Expected: PASS.

**Step 5: Perform manual route verification**

- Verify `/organizers/[slug]`, `/about`, `/contact`, and `/become-organizer` on desktop/mobile.
- Confirm long text, missing logos/images, and CTA blocks degrade gracefully.

**Step 6: Commit the public content family**

```bash
git add app/organizers/[slug]/page.tsx app/about/page.tsx app/contact/page.tsx app/become-organizer/page.tsx components/shared/public-marketing.tsx
git commit -m "feat: align public content pages with stitch"
```

## Wave 3 - Checkout

### Task 8: Align checkout shell and transactional framing

**Files:**
- Review: `stitch-designs/Gelaran_-_Checkout_Desktop_Light_Mode.html`
- Modify: `app/checkout/page.tsx`
- Modify: `components/features/checkout/checkout-primitives.tsx`
- Modify: `components/shared/public-marketing.tsx` (if checkout depends on shared editorial wrapper changes)
- Test: `lib/payments/stage-guard.test.ts`

**Step 1: Review the Stitch checkout HTML before editing**

- Confirm summary card layout, form grouping, pricing breakdown, reassurance panels, and desktop/mobile layout behavior.

**Step 2: Write the failing test first if checkout logic helpers move or change behavior**

- If any pricing, paid-order guard, or seat-checkout helper is extracted/changed, update or add targeted node tests first.
- Use `lib/payments/stage-guard.test.ts` when the stage-guard contract changes; otherwise add a new focused helper test.

**Step 3: Run the targeted test**

Run: `pnpm run test:stage-guard`

Expected: PASS before visual changes, or FAIL only for the intentionally updated helper contract.

**Step 4: Implement the minimal checkout composition changes**

- Rework `app/checkout/page.tsx` and `checkout-primitives` to match the approved Stitch framing.
- Preserve all transactional behavior: guest fields, locked seats, promo flow, pricing fetches, disabled states, and processing guards.

**Step 5: Re-run targeted verification**

Run: `pnpm run test:stage-guard`

Expected: PASS.

**Step 6: Perform route verification**

- Run: `pnpm run dev`
- Verify `/checkout?event=...` with standard tickets and seat-based checkout if data exists.
- Confirm logged-in and guest autofill branches, promo code states, demo payment branch, disabled payment branch, and error handling remain correct.

**Step 7: Commit the checkout shell**

```bash
git add app/checkout/page.tsx components/features/checkout/checkout-primitives.tsx components/shared/public-marketing.tsx lib/payments/stage-guard.test.ts
git commit -m "feat: align checkout page with stitch"
```

### Task 9: Align checkout result states

**Files:**
- Review: `stitch-designs/Checkout_Success_-_Gelaran.html`
- Review: `stitch-designs/Checkout_Pending_-_Gelaran.html`
- Review: `stitch-designs/Checkout_Failed_-_Gelaran.html`
- Modify: `app/checkout/success/page.tsx`
- Modify: `app/checkout/pending/page.tsx`
- Modify: `app/checkout/failed/page.tsx`
- Modify: `components/features/checkout/checkout-primitives.tsx`

**Step 1: Review the Stitch result-state HTML files before editing**

- Confirm tone differences, headline treatment, action hierarchy, booking code emphasis, and support/reassurance modules.

**Step 2: Write a failing test only if a new pure status helper is introduced**

- Example candidate: status-config mapper if moved to a separate helper.

**Step 3: Run the focused test if added**

Run: `node --import tsx --test path/to/new-checkout-status-helper.test.ts`

Expected: FAIL before implementation.

**Step 4: Implement the minimal result-state updates**

- Bring success, pending, and failed pages into the same Stitch-aligned family.
- Preserve all functional flows including booking lookups, download actions, and navigation targets.

**Step 5: Verify**

Run: `pnpm run lint -- app/checkout/success/page.tsx app/checkout/pending/page.tsx app/checkout/failed/page.tsx components/features/checkout/checkout-primitives.tsx`

Expected: PASS.

**Step 6: Perform manual route verification**

- Verify `/checkout/success`, `/checkout/pending`, and `/checkout/failed` with representative query params.
- Confirm loading spinners, unavailable booking data, and disabled action branches render safely.

**Step 7: Commit the result states**

```bash
git add app/checkout/success/page.tsx app/checkout/pending/page.tsx app/checkout/failed/page.tsx components/features/checkout/checkout-primitives.tsx path/to/new-checkout-status-helper.test.ts
git commit -m "feat: refresh checkout status pages"
```

## Wave 4 - Auth

### Task 10: Align the shared auth shell before updating auth pages

**Files:**
- Review: `stitch-designs/Gelaran_-_Desktop_Login.html`
- Review: `stitch-designs/Gelaran_-_Desktop_Registration.html`
- Review: `stitch-designs/Forgot_Password_-_Gelaran.html`
- Review: `stitch-designs/Reset_Password_-_Gelaran.html`
- Modify: `app/(auth)/layout.tsx`
- Modify: `components/shared/auth-ui.tsx`
- Modify: `components/shared/phase-two-shells.tsx`

**Step 1: Review all auth Stitch HTML files before editing the shared shell**

- Confirm shell framing, side art/editorial panel treatment, form width, message/callout style, and mobile layout collapse shared by the auth family.

**Step 2: Add a failing test only if auth shell logic is extracted into a pure helper**

- If auth shell work is presentational only, skip new automated tests.

**Step 3: Implement the minimal auth shell updates**

- Update `app/(auth)/layout.tsx` and `components/shared/auth-ui.tsx` first so every auth route inherits the correct framing.
- Preserve accessibility semantics, focus styling, and compatibility with current page-level form logic.

**Step 4: Verify**

Run: `pnpm run lint -- app/(auth)/layout.tsx components/shared/auth-ui.tsx components/shared/phase-two-shells.tsx`

Expected: PASS.

**Step 5: Commit the auth shell**

```bash
git add app/(auth)/layout.tsx components/shared/auth-ui.tsx components/shared/phase-two-shells.tsx
git commit -m "feat: align auth shell with stitch"
```

### Task 11: Align login and registration pages

**Files:**
- Review: `stitch-designs/Gelaran_-_Desktop_Login.html`
- Review: `stitch-designs/Gelaran_-_Desktop_Registration.html`
- Modify: `app/(auth)/login/page.tsx`
- Modify: `app/(auth)/register/page.tsx`
- Modify: `components/shared/auth-ui.tsx`
- Test: `lib/demo-mode.test.ts` (if demo presentation changes reveal contract changes)

**Step 1: Review the Stitch login/registration HTML before editing**

- Confirm intro copy block, field order, CTA weight, support text, demo-account placement, and mobile treatment.

**Step 2: Write the failing test first when touching reusable auth helper logic**

- If demo-mode or validation helper contracts change, update the relevant focused node test first.
- Otherwise keep testing manual because this task is primarily presentational.

**Step 3: Run the targeted auth helper test if changed**

Run: `pnpm run test:demo-mode`

Expected: PASS before and after visual work unless helper behavior is intentionally updated.

**Step 4: Implement the minimal login/register updates**

- Recompose page sections to match Stitch while preserving Supabase sign-in/sign-up flows, loading states, validation messages, and demo shortcuts.

**Step 5: Re-run verification**

Run: `pnpm run test:demo-mode`

Expected: PASS.

**Step 6: Perform manual route verification**

- Verify `/login` and `/register` on desktop/mobile.
- Confirm invalid credentials, loading states, password visibility toggles, demo account actions, and return-url behavior still work.

**Step 7: Commit login/register**

```bash
git add app/(auth)/login/page.tsx app/(auth)/register/page.tsx components/shared/auth-ui.tsx lib/demo-mode.test.ts
git commit -m "feat: refresh auth entry pages"
```

### Task 12: Align forgot-password and reset-password pages

**Files:**
- Review: `stitch-designs/Forgot_Password_-_Gelaran.html`
- Review: `stitch-designs/Reset_Password_-_Gelaran.html`
- Modify: `app/(auth)/forgot-password/page.tsx`
- Modify: `app/(auth)/reset-password/page.tsx`
- Modify: `components/shared/auth-ui.tsx`

**Step 1: Review the Stitch password-recovery HTML before editing**

- Confirm spacing rhythm, password guidance treatment, message severity styling, and CTA hierarchy.

**Step 2: Write a failing test only if password-validation helpers are extracted or changed**

- If reset-password strength/rule logic is moved into a pure helper, create a focused node test first.

**Step 3: Run the targeted helper test if added**

Run: `node --import tsx --test path/to/new-password-helper.test.ts`

Expected: FAIL before implementation.

**Step 4: Implement the minimal forgot/reset updates**

- Preserve all request flows, token handling, validation messages, and success/error behavior.
- Keep visual continuity with login/register and the broader public journey.

**Step 5: Verify**

Run: `pnpm run lint -- app/(auth)/forgot-password/page.tsx app/(auth)/reset-password/page.tsx components/shared/auth-ui.tsx`

Expected: PASS.

**Step 6: Perform manual route verification**

- Verify `/forgot-password` and `/reset-password` on desktop/mobile.
- Confirm valid and invalid password states, loading, success messages, and token-expired/error branches remain correct.

**Step 7: Commit password recovery pages**

```bash
git add app/(auth)/forgot-password/page.tsx app/(auth)/reset-password/page.tsx components/shared/auth-ui.tsx path/to/new-password-helper.test.ts
git commit -m "feat: align auth recovery pages with stitch"
```

## Wave 5 - Customer Continuity Cleanup

### Task 13: Align customer shell surfaces for continuity only

**Files:**
- Review: `stitch-designs/Gelaran_-_Customer_Dashboard.html`
- Review: `stitch-designs/My_Bookings_-_Gelaran.html`
- Review: `stitch-designs/Customer_Profile_Settings.html`
- Review: `stitch-designs/Wishlist_-_Gelaran.html`
- Review: `stitch-designs/Notifications_-_Gelaran.html`
- Review: `stitch-designs/Following_-_Gelaran_Cultural_Discovery.html`
- Modify: `app/(customer)/layout.tsx`
- Modify: `app/(customer)/dashboard/page.tsx`
- Modify: `app/(customer)/my-bookings/page.tsx`
- Modify: `app/(customer)/profile/page.tsx`
- Modify: `app/(customer)/wishlist/page.tsx`
- Modify: `app/following/page.tsx`
- Modify: `app/notifications/page.tsx`
- Modify: `components/customer/CustomerHeader.tsx`
- Modify: `components/customer/CustomerSidebar.tsx`
- Modify: `components/customer/CustomerMobileNav.tsx`
- Modify: `components/customer/customer-dashboard-primitives.tsx`

**Step 1: Review the Stitch continuity references before editing**

- Focus on shell compatibility, spacing, card treatment, and tone continuity, not a full dashboard redesign.

**Step 2: Add a failing test only if a reusable continuity helper is extracted**

- If no pure helper is introduced, rely on lint/typecheck/manual verification.

**Step 3: Implement the minimal continuity updates**

- Update customer shell/header/sidebar/mobile nav tokens and selected dashboard primitives so the authenticated customer area no longer clashes with the new public/auth language.
- Avoid broad workflow or information-architecture changes.

**Step 4: Verify**

Run: `pnpm run lint -- app/(customer)/layout.tsx app/(customer)/dashboard/page.tsx app/(customer)/my-bookings/page.tsx app/(customer)/profile/page.tsx app/(customer)/wishlist/page.tsx app/following/page.tsx app/notifications/page.tsx components/customer/CustomerHeader.tsx components/customer/CustomerSidebar.tsx components/customer/CustomerMobileNav.tsx components/customer/customer-dashboard-primitives.tsx`

Expected: PASS.

**Step 5: Perform manual route verification**

- Verify `/dashboard`, `/my-bookings`, `/profile`, `/wishlist`, `/following`, and `/notifications` on desktop/mobile.
- Confirm authenticated layout, sidebar/mobile-nav behavior, notification count, and empty states remain functional.

**Step 6: Commit the continuity cleanup**

```bash
git add app/(customer)/layout.tsx app/(customer)/dashboard/page.tsx app/(customer)/my-bookings/page.tsx app/(customer)/profile/page.tsx app/(customer)/wishlist/page.tsx app/following/page.tsx app/notifications/page.tsx components/customer/CustomerHeader.tsx components/customer/CustomerSidebar.tsx components/customer/CustomerMobileNav.tsx components/customer/customer-dashboard-primitives.tsx
git commit -m "feat: harmonize customer shell with public auth refresh"
```

## Wave 6 - Verification

### Task 14: Run targeted automated verification after each wave

**Files:**
- Review: `package.json`
- Review: `lib/layout-fonts.test.ts`
- Review: `lib/demo-mode.test.ts`
- Review: `lib/payments/stage-guard.test.ts`
- Review: any new focused helper tests created during implementation

**Step 1: Run lint after each completed wave**

Run: `pnpm run lint`

Expected: PASS.

**Step 2: Run wave-specific targeted tests after each behavior-sensitive family**

Run these when their related files change:

- `pnpm run test:layout-fonts`
- `pnpm run test:demo-mode`
- `pnpm run test:stage-guard`
- `node --import tsx --test path/to/new-helper.test.ts` for any new focused helper tests added during the rollout

Expected: PASS.

**Step 3: Fix failures immediately before moving to the next wave**

- Do not stack unrelated UI work on top of failing lint or failing targeted tests.

### Task 15: Run full repo verification before final review

**Files:**
- Review only; no file changes required unless failures are found

**Step 1: Run type safety verification**

Run: `pnpm run typecheck`

Expected: PASS.

**Step 2: Run the full automated test suite**

Run: `pnpm run test`

Expected: PASS.

**Step 3: Run production-oriented build verification**

Run: `pnpm run build:verify`

Expected: PASS.

**Step 4: If all three commands pass, run the combined verification command**

Run: `pnpm run verify`

Expected: PASS.

### Task 16: Perform route-by-route manual review against Stitch before handoff

**Files:**
- Review: all touched route files and the corresponding Stitch HTML references

**Step 1: Start the app locally for visual QA**

Run: `pnpm run dev`

**Step 2: Compare each route family side-by-side with its Stitch reference**

Verify these routes:

- `/`
- `/events`
- `/events/[slug]`
- `/events/[slug]/faq`
- `/organizers/[slug]`
- `/about`
- `/contact`
- `/become-organizer`
- `/checkout`
- `/checkout/success`
- `/checkout/pending`
- `/checkout/failed`
- `/login`
- `/register`
- `/forgot-password`
- `/reset-password`
- `/dashboard`
- `/my-bookings`
- `/profile`
- `/wishlist`
- `/following`
- `/notifications`

**Step 3: Confirm responsive and regression-sensitive behavior**

- Desktop and mobile widths both match intended hierarchy.
- Navbar/footer/auth shell/customer shell remain visually coherent.
- Focus states, form labels, button states, and contrast remain accessible.
- Dynamic states still behave correctly: loading, empty, error, sold-out, invalid credentials, password feedback, promo states, pending/success/failed checkout outcomes.

**Step 4: Capture final implementation notes for review**

- Document any deliberate deviations from Stitch caused by accessibility, real data, or framework constraints.

### Task 17: Final commit and review handoff

**Files:**
- Modify: `docs/plans/2026-03-27-public-auth-stitch-implementation.md` (only if implementation notes or deviations need to be recorded after execution)

**Step 1: Stage the final verified implementation set**

```bash
git add app app/globals.css components lib docs/plans/2026-03-27-public-auth-stitch-implementation.md
```

**Step 2: Create the final integration commit**

```bash
git commit -m "feat: complete public auth stitch alignment"
```

**Step 3: Prepare review notes**

- Summarize touched route families.
- List verification commands executed and their results.
- List any acceptable deviations from Stitch with reasons.

## Definition of Done Checklist

- Shared public/auth tokens and primitives reflect the approved Stitch direction.
- Public routes are visually aligned without copying Stitch HTML.
- Checkout remains behavior-safe while matching the approved visual framing.
- Auth routes feel continuous with public marketing and preserve all form behavior.
- Customer continuity pages no longer visually clash with the refreshed customer-facing language.
- `pnpm run lint`, `pnpm run typecheck`, `pnpm run test`, `pnpm run build:verify`, and `pnpm run verify` pass before handoff.
- Manual route review against the corresponding Stitch HTML files is complete on desktop and mobile.
