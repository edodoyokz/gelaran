# Public + Auth Stitch High-Fidelity Alignment Design

**Date:** 2026-03-27

## Goal

Deliver high-fidelity visual alignment for the Public + Auth experience against the approved Stitch designs while preserving the existing Next.js app architecture, route structure, data flow, and reusable component model.

This effort is about making the shipped UI look and feel materially closer to the approved Stitch direction, not about exporting or pasting Stitch HTML into the application.

## Scope

The scope for this effort includes the customer-facing public marketing, discovery, and account-entry surfaces that define first impressions and conversion flow continuity:

- landing / home page,
- public events listing,
- event detail and event FAQ surfaces,
- organizer profile surface,
- checkout and checkout result pages,
- auth entry flow: login, register, forgot password, reset password,
- authenticated customer shell surfaces that must visually harmonize with the public/auth direction where already part of the customer journey,
- shared Public + Auth navigation, footer, page shells, content blocks, and design tokens required to support the visual update.

The scope includes layout, spacing, typography, color application, imagery treatment, card design, CTA hierarchy, responsive behavior, and component-level visual refinement needed to match the approved Stitch fidelity within the application's existing patterns.

## Non-Goals

This effort does not include:

- copying Stitch HTML, CSS, or generated structure directly into the app,
- replacing the existing route architecture, server/client boundaries, or data fetching model,
- broad workspace redesigns for organizer, admin, POS, or gate pages,
- net-new product functionality, workflow changes, or API behavior changes,
- schema, auth backend, payment backend, or authorization logic changes,
- a full design-system rewrite beyond the token/component work required for Public + Auth alignment,
- dark-mode expansion or theme-system replacement outside the approved Public + Auth use case.

## Guiding Principles

### 1. Match the design, not the generated markup

Stitch is the visual source of truth for look, hierarchy, rhythm, and interaction tone. The application remains the source of truth for implementation structure, routing, state, and behavior.

### 2. Reuse architecture before adding new abstractions

Prefer updating existing page compositions and shared primitives over creating parallel component trees. New components should only be introduced when the current structure cannot express the approved design cleanly.

### 3. Preserve behavior while upgrading fidelity

Visual alignment must not break auth flow behavior, validation, accessibility, navigation, loading states, checkout continuity, or responsive rendering.

### 4. Build one coherent customer-facing language

Public and Auth pages should feel like one connected product journey, with auth screens acting as premium extensions of the public brand rather than isolated utility pages.

### 5. Keep implementation maintainable

The result should remain understandable to engineers working in the existing codebase. Avoid one-off page hacks that achieve short-term visual parity at the cost of long-term maintainability.

## Approved Design Direction

The approved direction is high-fidelity visual alignment to Stitch for Public + Auth pages using the application's current architecture.

That means:

- replicate the approved visual hierarchy, composition, spacing rhythm, color usage, typography intent, and component styling,
- preserve existing Next.js routes and component ownership,
- map Stitch sections into existing React page structures and shared primitives,
- translate Stitch-only visual ideas into reusable app components instead of embedding exported HTML,
- allow implementation-level deviations only where required by accessibility, responsiveness, real data, or framework constraints.

## Page / Design Mapping

The implementation should map approved Stitch directions onto the existing application pages as follows.

### Public Marketing and Discovery

- `app/page.tsx` <- Stitch landing / home direction
- `app/events/page.tsx` <- Stitch events discovery / listing direction
- `app/events/[slug]/page.tsx` <- Stitch event detail direction
- `app/events/[slug]/faq/page.tsx` <- Stitch event FAQ support treatment when included in event detail flow
- `app/organizers/[slug]/page.tsx` <- Stitch organizer profile direction
- `app/about/page.tsx` <- align to public content-page language derived from Stitch
- `app/contact/page.tsx` <- align to public content-page language derived from Stitch
- `app/become-organizer/page.tsx` <- align to public conversion-page language derived from Stitch

### Checkout Journey

- `app/checkout/page.tsx` <- Stitch checkout direction translated into existing checkout flow
- `app/checkout/success/page.tsx` <- Stitch success-state direction
- `app/checkout/pending/page.tsx` <- Stitch pending-state direction
- `app/checkout/failed/page.tsx` <- Stitch failure-state direction

### Auth Journey

- `app/(auth)/layout.tsx` <- shared auth shell derived from Stitch auth framing
- `app/(auth)/login/page.tsx` <- Stitch login direction
- `app/(auth)/register/page.tsx` <- Stitch register direction
- `app/(auth)/forgot-password/page.tsx` <- Stitch forgot-password direction
- `app/(auth)/reset-password/page.tsx` <- Stitch reset-password direction

### Customer Continuity Surfaces

These pages are not full Public + Auth marketing surfaces, but they should remain visually compatible where they share the same customer-facing language:

- `app/(customer)/layout.tsx`
- `app/(customer)/dashboard/page.tsx`
- `app/(customer)/my-bookings/page.tsx`
- `app/(customer)/profile/page.tsx`
- `app/(customer)/wishlist/page.tsx`
- `app/following/page.tsx`
- `app/notifications/page.tsx`

For this effort, continuity means token/component alignment and shell compatibility, not a full dashboard redesign.

## Architecture Approach

### Page composition strategy

Each target page should continue to be implemented in React/Next.js using the current route files, server/client boundaries, and existing data access patterns. Stitch layouts should be interpreted as compositional guidance and re-expressed using the app's component system.

### Shared primitive strategy

Where the approved design introduces repeated patterns, they should be implemented as shared primitives in the existing component areas rather than page-local markup duplication. Likely shared areas include:

- public marketing sections,
- event discovery primitives,
- event detail sections,
- checkout primitives,
- auth UI shell and form framing,
- navbar, footer, and shared customer-facing shell components,
- design-token and theme-level CSS used by these surfaces.

### Token-first fidelity strategy

High-fidelity alignment should be driven through tokens and reusable styling decisions before page-specific overrides. Typical alignment levers include:

- color tokens,
- type scale and font usage,
- spacing scale,
- section max-width and gutters,
- radii, shadows, borders, and surface layering,
- button, input, badge, and card treatments,
- motion and hover/focus affordances.

### Data-safe adaptation strategy

Stitch concepts must be adapted to real content and dynamic states already present in the app. Static design sections should not force brittle assumptions about image counts, title lengths, pricing states, sold-out states, validation errors, or empty states.

## Rollout Waves

### Wave 1 - Foundations

Establish shared tokens, shell decisions, customer-facing spacing rules, typography choices, and reusable primitives needed by both Public and Auth surfaces.

### Wave 2 - Public Marketing and Discovery

Align the landing page, events listing, event detail, organizer profile, and public informational pages to the approved Stitch direction.

### Wave 3 - Checkout and Result States

Align checkout framing, summary surfaces, and the success/pending/failed states so the full purchase journey remains visually coherent.

### Wave 4 - Auth Surfaces

Apply the approved Stitch auth direction to the auth shell and the login/register/forgot/reset pages, ensuring strong continuity with the public journey.

### Wave 5 - Customer Continuity Cleanup

Apply any necessary token and shared-component adjustments to customer-shell surfaces that would otherwise visually drift from the new Public + Auth language.

## File Areas Impacted

This design effort is expected to concentrate work in the following areas.

### Route files

- `app/page.tsx`
- `app/events/page.tsx`
- `app/events/[slug]/page.tsx`
- `app/events/[slug]/faq/page.tsx`
- `app/organizers/[slug]/page.tsx`
- `app/about/page.tsx`
- `app/contact/page.tsx`
- `app/become-organizer/page.tsx`
- `app/checkout/page.tsx`
- `app/checkout/success/page.tsx`
- `app/checkout/pending/page.tsx`
- `app/checkout/failed/page.tsx`
- `app/(auth)/layout.tsx`
- `app/(auth)/login/page.tsx`
- `app/(auth)/register/page.tsx`
- `app/(auth)/forgot-password/page.tsx`
- `app/(auth)/reset-password/page.tsx`
- selective continuity updates in customer-shell pages under `app/(customer)/`

### Shared component areas

- `components/shared/public-marketing.tsx`
- `components/shared/auth-ui.tsx`
- `components/layouts/Navbar.tsx`
- `components/layouts/Footer.tsx`
- `components/features/home/`
- `components/features/events/`
- `components/features/checkout/`
- `components/customer/`

### Global styling and providers

- `app/layout.tsx`
- theme or token-bearing CSS files already used by the app,
- `components/providers/ThemeProvider.tsx` only if required for token or theme-consistency support.

This list is intentionally focused on Public + Auth areas. Organizer, admin, POS, and gate implementation files are outside this effort unless a shared component dependency requires a safe, non-visual compatibility update.

## Acceptance Criteria

- Public + Auth pages visibly align with the approved Stitch designs at a high-fidelity level for hierarchy, spacing, typography, color use, and component styling.
- The implementation uses existing app routes and React architecture rather than embedded Stitch HTML.
- Shared visual patterns are expressed through reusable components or tokens instead of duplicated page-local markup.
- Responsive behavior remains production-ready on desktop and mobile.
- Accessibility baselines remain intact for navigation, focus states, form usage, and readable contrast.
- Auth flows, checkout flows, and existing page behavior continue to work without regression.
- Public pages and auth pages feel like one continuous branded experience.
- Customer-shell continuity surfaces do not visually clash with the new Public + Auth direction.

## Risks and Guardrails

### Risk: overfitting to static design comps

Guardrail: validate every major surface against real dynamic data conditions, long text, missing images, empty states, validation messages, and transactional states.

### Risk: accidental architecture drift

Guardrail: do not introduce exported Stitch markup trees or parallel page implementations. Keep changes inside existing route/component ownership.

### Risk: visual parity through excessive one-off CSS

Guardrail: prefer shared tokens and reusable primitives first. Page-specific styling should only handle composition differences that cannot be generalized.

### Risk: auth and checkout regression

Guardrail: treat these pages as behavior-sensitive surfaces. UI refactors must preserve form semantics, validation rendering, loading states, and success/error handling.

### Risk: customer-shell inconsistency after public refresh

Guardrail: include a continuity pass so the public/auth redesign does not make adjacent customer pages feel unrelated.

### Risk: scope expansion into non-target workspaces

Guardrail: keep organizer, admin, POS, and gate redesign work out of scope for this effort except for shared dependency safety adjustments.

## Definition of Done

This effort is done when all of the following are true:

- the approved Public + Auth Stitch direction has been translated into an implementation-ready plan across the identified routes and component areas,
- implementation work aligns the target pages visually without copying Stitch HTML,
- shared tokens/primitives support the new fidelity level in a maintainable way,
- responsive and accessibility checks are satisfied for the touched surfaces,
- checkout and auth flows retain existing functionality,
- the resulting Public + Auth experience is reviewable side-by-side against Stitch and judged materially aligned by product/design approval,
- no out-of-scope workspace redesign has been pulled into the delivery.

## Implementation Notes for the Follow-On Plan

The follow-on implementation plan should be organized by rollout wave and should explicitly separate:

- shared foundation work,
- public page alignment,
- checkout alignment,
- auth alignment,
- customer continuity cleanup,
- verification tasks for responsiveness, accessibility, and regression-sensitive flows.

No UI implementation is part of this document.
