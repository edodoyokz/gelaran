# Pages Audit Roadmap Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Audit all 86 route pages, close correctness and content gaps per page, and execute a safe implementation roadmap without missing any route.

**Architecture:** The work is organized per route domain so engineers can audit page behavior, shared dependencies, and API contracts in bounded batches while still tracking cross-cutting overlap. Shared shells, auth guards, data loaders, and route-specific primitives are treated as hotspots first so page-level fixes do not diverge across domains. Verification is wave-based: stabilize foundations and high-risk transactional flows first, then complete content, SEO, and docs alignment.

**Tech Stack:** Next.js App Router, React, TypeScript, Supabase, Prisma, shared UI components, route handlers under `app/api`, role-based layouts, docs shells.

---

## Scope & Route Inventory Summary

- Total audited route pages: 86
- Domain split: Public non-docs 23, Auth/Customer 13, Organizer 17, Admin 17, Docs 16
- Route grouping principle: inventory every `page.tsx` route, map it to main shared files, classify maturity, identify gap types, then sequence implementation by overlap risk
- Out of scope for this document: direct code edits, API redesign specs in full detail, infra rollout steps, and non-page assets unless they are required shared hotspots for route completion

| Domain | Page count | Main risk pattern | Primary shared hotspots |
| --- | ---: | --- | --- |
| Public | 23 | transactional correctness, SEO/performance, static copy drift | `components/shared/public-marketing.tsx`, `components/shared/phase-two-shells.tsx`, `components/features/events/EventCard.tsx`, `components/features/events/discovery-primitives.tsx`, `components/features/events/EventDetailView.tsx`, `components/features/home/Hero.tsx`, `components/features/checkout/checkout-primitives.tsx`, `components/features/checkout/checkout-result-primitives.tsx`, `components/pos/pos-payment-status-page.tsx`, `components/gate/QRScanner.tsx`, `lib/home/landing-page.ts`, `lib/utils.ts` |
| Auth/Customer | 13 | auth boundary inconsistency, booking contract mismatch, duplicated state | `proxy.ts`, `app/auth/callback/route.ts`, `app/(customer)/layout.tsx`, `components/shared/auth-ui.tsx`, `components/customer/customer-dashboard-primitives.tsx`, `lib/auth/route-auth.ts`, `app/api/profile/route.ts`, `app/api/my-bookings/[code]/route.ts`, `app/api/notifications/count/route.ts` |
| Organizer | 17 | uneven maturity, workspace contract drift, placeholder actions | `app/organizer/layout.tsx`, `components/organizer/OrganizerLayoutWrapper.tsx`, `components/organizer/OrganizerSidebar.tsx`, `components/organizer/organizer-workspace-primitives.tsx`, `lib/supabase/server.ts`, `lib/prisma/client.ts`, `lib/utils.ts` |
| Admin | 17 | auth/capability mismatch, UI/API contract drift, moderation/finance hardening | `components/admin/admin-workspace.tsx`, `components/admin/AdminLayoutWrapper.tsx`, `components/admin/AdminSidebar.tsx`, `components/admin/AdminProfileProvider.tsx`, `components/admin/AdminProviders.tsx`, `components/ui/toast-provider.tsx`, `components/ui/confirm-provider.tsx`, `lib/auth/route-auth.ts`, `lib/platform-settings.ts`, `app/api/admin/finance/route.ts`, `app/api/admin/settings/route.ts`, `app/api/admin/settings/commission/route.ts`, `app/api/admin/site-content/route.ts`, `lib/supabase/server.ts`, `lib/prisma/client.ts`, `lib/utils.ts` |
| Docs | 16 | content accuracy, IA mismatch, access policy ambiguity, nav inconsistency | `app/docs/layout.tsx`, `app/docs/admin/layout.tsx`, `app/docs/customer/layout.tsx`, `app/docs/organizer/layout.tsx`, `components/docs/docs-shell.tsx`, `components/docs/DocsSidebar.tsx`, `components/docs/Breadcrumb.tsx`, `components/docs/BrowserFrame.tsx`, `components/docs/FeatureCard.tsx`, `components/shared/phase-two-shells.tsx`, `lib/supabase/server.ts`, `lib/prisma/client.ts` |

## Shared Dependency Hotspots / Overlap Map

- `app/layout.tsx`, `app/error.tsx`, `app/(auth)/layout.tsx`, `app/(customer)/layout.tsx`, `app/organizer/layout.tsx`, `app/admin/layout.tsx`, `app/docs/layout.tsx`, `app/docs/admin/layout.tsx`, `app/docs/customer/layout.tsx`, `app/docs/organizer/layout.tsx`: global shell, metadata, guard, and navigation dependencies that can break multiple routes at once
- Transaction stack overlap: `components/features/checkout/checkout-primitives.tsx`, `components/features/checkout/checkout-result-primitives.tsx`, `components/pos/pos-payment-status-page.tsx`, `components/gate/QRScanner.tsx`, scanner/gate/pos access routes, and related route handlers must be audited together to avoid divergent token, session, and status semantics
- Event discovery overlap: `components/features/events/EventCard.tsx`, `components/features/events/discovery-primitives.tsx`, `components/features/events/EventDetailView.tsx`, `components/features/home/Hero.tsx`, `lib/home/landing-page.ts`, and organizer/admin event pages all share assumptions about event status, pricing, venue, FAQ, and organizer data shapes
- Auth and customer overlap: `proxy.ts`, `app/auth/callback/route.ts`, `lib/auth/route-auth.ts`, `app/api/profile/route.ts`, `app/api/my-bookings/[code]/route.ts`, `app/api/notifications/count/route.ts`, and `components/shared/auth-ui.tsx` should be normalized before fine-tuning individual authenticated pages
- Organizer/admin workspace overlap: duplicated organizer/admin loading, role policy checks, toast/confirm flows, and mutable form schemas should be centralized before fixing page-local actions
- Docs overlap: docs layouts, nav metadata, and browser-frame components must be centralized before content rewrites so all docs pages inherit the same IA and language policy

## Planning Principles

- Start with shared contracts before page cosmetics when the page is transactional, auth-protected, or policy-driven
- Treat P0 as correctness, access control, API response shape, financial impact, or documentation that could mislead real users
- Use route-domain batches, but stop and centralize a shared helper if the same contract bug appears in three or more pages
- Prefer one source of truth for status enums, auth redirects, event detail shape, wallet data, and docs IA metadata before continuing broad page cleanup
- For highly repetitive pages, use one audit template and one verification matrix rather than forcing isolated TDD loops for all 86 pages
- Preserve scope control: page plan items should name route file, probable shared file touchpoints, dependency checks, and verification evidence required for sign-off

## Public

| Route | File | Current status | Main gaps | Shared files likely touched | Priority |
| --- | --- | --- | --- | --- | --- |
| `/` | `app/page.tsx` | UI matang, client-fetched | SEO/performance risk, hardcoded ratings/copy | `components/features/home/Hero.tsx`, `components/shared/public-marketing.tsx`, `lib/home/landing-page.ts`, `app/layout.tsx` | P1 |
| `/about` | `app/about/page.tsx` | Static lengkap | Hardcoded company copy, no freshness source | `components/shared/public-marketing.tsx`, `app/layout.tsx` | P2 |
| `/contact` | `app/contact/page.tsx` | Presentational form | Form not truly wired, hardcoded contact/social, metadata gap | `components/shared/public-marketing.tsx`, `lib/utils.ts`, `app/layout.tsx` | P1 |
| `/privacy` | `app/privacy/page.tsx` | Static legal page | Accuracy and legal freshness audit needed | `components/shared/public-marketing.tsx`, `app/layout.tsx` | P2 |
| `/terms` | `app/terms/page.tsx` | Static legal page | Fee/copy may be stale, legal accuracy audit | `components/shared/public-marketing.tsx`, `app/layout.tsx` | P2 |
| `/events` | `app/events/page.tsx` | Listing functional | Client-only fetch, SEO risk, synthetic ratings | `components/features/events/discovery-primitives.tsx`, `components/features/events/EventCard.tsx`, `app/layout.tsx` | P1 |
| `/events/[slug]` | `app/events/[slug]/page.tsx` | Feature-rich, SSR present | Contract cleanup, performance tuning, shared schema review | `components/features/events/EventDetailView.tsx`, `components/features/events/EventCard.tsx`, `lib/utils.ts`, `app/layout.tsx` | P1 |
| `/events/[slug]/faq` | `app/events/[slug]/faq/page.tsx` | Simple SSR page | Metadata/schema missing, FAQ parity with event detail | `components/features/events/EventDetailView.tsx`, `app/layout.tsx` | P1 |
| `/organizers/[slug]` | `app/organizers/[slug]/page.tsx` | Backend-wired, client-only | SEO risk, loading/error state audit, metadata gap | `components/shared/phase-two-shells.tsx`, `components/features/events/EventCard.tsx`, `app/layout.tsx` | P1 |
| `/tickets/transfer/accept` | `app/tickets/transfer/accept/page.tsx` | Flow looks complete | High correctness/security risk, token validation and replay audit | `components/shared/phase-two-shells.tsx`, `lib/utils.ts` | P0 |
| `/checkout` | `app/checkout/page.tsx` | Operational | Pricing, seat lock, attendee validation audit | `components/features/checkout/checkout-primitives.tsx`, `lib/utils.ts` | P0 |
| `/checkout/success` | `app/checkout/success/page.tsx` | Presentational but live | API response mismatch risk, fulfillment correctness | `components/features/checkout/checkout-result-primitives.tsx`, `lib/utils.ts` | P0 |
| `/checkout/pending` | `app/checkout/pending/page.tsx` | Mostly presentational | Needs backend verification for status semantics | `components/features/checkout/checkout-result-primitives.tsx` | P0 |
| `/checkout/failed` | `app/checkout/failed/page.tsx` | Mostly presentational | Needs backend verification for retry and failure reason mapping | `components/features/checkout/checkout-result-primitives.tsx` | P0 |
| `/pos` | `app/pos/page.tsx` | Operational | Totals, seating, auth contract audit | `components/shared/phase-two-shells.tsx`, `components/features/checkout/checkout-primitives.tsx`, `lib/utils.ts` | P0 |
| `/pos/payment-failed` | `app/pos/payment-failed/page.tsx` | Thin wrapper | Needs authoritative status lookup | `components/pos/pos-payment-status-page.tsx` | P0 |
| `/pos/payment-pending` | `app/pos/payment-pending/page.tsx` | Thin wrapper | Needs authoritative status lookup | `components/pos/pos-payment-status-page.tsx` | P0 |
| `/pos/payment-success` | `app/pos/payment-success/page.tsx` | Thin wrapper | Needs authoritative status lookup | `components/pos/pos-payment-status-page.tsx` | P0 |
| `/pos/access` | `app/pos/access/page.tsx` | Backend-wired | Fingerprint/session/rate-limit audit | `components/shared/phase-two-shells.tsx`, `lib/utils.ts` | P0 |
| `/gate` | `app/gate/page.tsx` | Operational | Auth/session/polling cleanup and parity checks | `components/gate/QRScanner.tsx`, `components/shared/phase-two-shells.tsx` | P0 |
| `/gate/access` | `app/gate/access/page.tsx` | Backend-wired | Fingerprint/token model risk, access hardening | `components/shared/phase-two-shells.tsx`, `lib/utils.ts` | P0 |
| `/scanner` | `app/scanner/page.tsx` | Functional overlap route | High contract mismatch risk with gate flows | `components/gate/QRScanner.tsx`, `components/shared/phase-two-shells.tsx` | P0 |
| `/become-organizer` | `app/become-organizer/page.tsx` | Wired marketing/application page | Metadata/legal/copy cleanup, conversion analytics review | `components/shared/public-marketing.tsx`, `components/shared/phase-two-shells.tsx`, `app/layout.tsx` | P1 |

### Public Task Breakdown

1. Stabilize shared public metadata and discovery primitives used by `/`, `/events`, `/events/[slug]`, `/events/[slug]/faq`, `/organizers/[slug]`, and `/become-organizer` before editing page copy or cards.
2. Audit transactional status contracts together for `/checkout`, `/checkout/success`, `/checkout/pending`, `/checkout/failed`, `/pos`, `/pos/payment-success`, `/pos/payment-pending`, `/pos/payment-failed` and align page assumptions with authoritative backend status models.
3. Audit access-control surfaces together for `/tickets/transfer/accept`, `/gate`, `/gate/access`, `/scanner`, `/pos/access`; document token lifetime, session establishment, replay protection, and rate-limit expectations.
4. Replace synthetic or stale public content sources on `/`, `/events`, `/about`, `/contact`, `/privacy`, `/terms`, `/become-organizer` with explicit content ownership or TODO markers tied to real source-of-truth files.
5. Add missing metadata/schema and route-specific audit notes for SEO-sensitive pages `/`, `/events`, `/events/[slug]`, `/events/[slug]/faq`, `/organizers/[slug]`, `/contact`.
6. Re-run a public route matrix covering anonymous browsing, deep-link entry, not-found handling, and transactional callback entry points.

## Auth / Customer

| Route | File | Current status | Main gaps | Shared files likely touched | Priority |
| --- | --- | --- | --- | --- | --- |
| `/login` | `app/(auth)/login/page.tsx` | Usable auth entry | Validator/error mapping/demo config need standardization | `components/shared/auth-ui.tsx`, `proxy.ts`, `lib/auth/route-auth.ts` | P1 |
| `/register` | `app/(auth)/register/page.tsx` | Validation relatively clean | Resend verification, legal copy, final redirect audit | `components/shared/auth-ui.tsx`, `proxy.ts`, `app/auth/callback/route.ts` | P1 |
| `/forgot-password` | `app/(auth)/forgot-password/page.tsx` | Basic flow works | Redirect/env/rate-limit UX audit | `components/shared/auth-ui.tsx`, `proxy.ts`, `app/auth/callback/route.ts` | P1 |
| `/reset-password` | `app/(auth)/reset-password/page.tsx` | Implemented | Granular invalid/expired/session errors missing | `components/shared/auth-ui.tsx`, `proxy.ts`, `app/auth/callback/route.ts` | P0 |
| `/dashboard` | `app/(customer)/dashboard/page.tsx` | Rich UI | Fallback/mock trend data, auth/API consistency audit | `app/(customer)/layout.tsx`, `components/customer/customer-dashboard-primitives.tsx`, `lib/auth/route-auth.ts` | P1 |
| `/following` | `app/(customer)/following/page.tsx` | Functional | Auth redirect and endpoint performance audit | `app/(customer)/layout.tsx`, `components/customer/customer-dashboard-primitives.tsx`, `lib/auth/route-auth.ts` | P1 |
| `/notifications` | `app/(customer)/notifications/page.tsx` | Full inbox UI | Mutation feedback weak, count mismatch with layout | `app/(customer)/layout.tsx`, `app/api/notifications/count/route.ts`, `components/customer/customer-dashboard-primitives.tsx` | P0 |
| `/profile` | `app/(customer)/profile/page.tsx` | Feature-rich | Upload/provisioning/validation inconsistent | `app/(customer)/layout.tsx`, `app/api/profile/route.ts`, `lib/auth/route-auth.ts` | P1 |
| `/wishlist` | `app/(customer)/wishlist/page.tsx` | Functional | Duplicate delete contract, parity with public detail actions | `app/(customer)/layout.tsx`, `components/customer/customer-dashboard-primitives.tsx`, `components/features/events/EventCard.tsx` | P1 |
| `/my-bookings` | `app/(customer)/my-bookings/page.tsx` | Usable list | Status semantics and dead actions need audit | `app/(customer)/layout.tsx`, `app/api/my-bookings/[code]/route.ts`, `components/customer/customer-dashboard-primitives.tsx` | P1 |
| `/my-bookings/[code]` | `app/(customer)/my-bookings/[code]/page.tsx` | Feature-rich but monolithic | `alert()` usage, local action rules, contract sprawl | `app/(customer)/layout.tsx`, `app/api/my-bookings/[code]/route.ts`, `components/customer/customer-dashboard-primitives.tsx` | P0 |
| `/my-bookings/[code]/refund` | `app/(customer)/my-bookings/[code]/refund/page.tsx` | Implemented but fragile | API shape mismatch, misleading partial refund states | `app/api/my-bookings/[code]/route.ts`, `components/customer/customer-dashboard-primitives.tsx` | P0 |
| `/my-bookings/[code]/ticket` | `app/(customer)/my-bookings/[code]/ticket/page.tsx` | Implemented but fragile | API shape mismatch, minimal action UX | `app/api/my-bookings/[code]/route.ts`, `components/customer/customer-dashboard-primitives.tsx` | P0 |

### Auth / Customer Task Breakdown

1. Normalize auth/session boundaries across `/login`, `/register`, `/forgot-password`, `/reset-password`, and `app/auth/callback/route.ts` so redirects, callback outcomes, and error states are consistent.
2. Establish one booking detail source of truth for `/my-bookings`, `/my-bookings/[code]`, `/my-bookings/[code]/refund`, `/my-bookings/[code]/ticket`; document shared booking, refund, and ticket status semantics before page rewrites.
3. Fix P0 customer contract mismatches first: `/notifications` count semantics, `/my-bookings/[code]/refund` API shape, `/my-bookings/[code]/ticket` API shape, and `/reset-password` token/session edge cases.
4. Decompose `/my-bookings/[code]` into smaller primitives or shared helpers after the response shape is stabilized; remove local ad hoc action logic and browser alerts.
5. Audit user profile and dashboard consistency on `/dashboard`, `/profile`, `/following`, `/wishlist` after auth and booking contracts are stable.
6. Verify authenticated route entry, expired session behavior, callback redirects, and post-auth navigation parity across all 13 pages in this domain.

## Organizer

| Route | File | Current status | Main gaps | Shared files likely touched | Priority |
| --- | --- | --- | --- | --- | --- |
| `/organizer` | `app/organizer/page.tsx` | Dashboard mature | Dedupe organizer loading, auth/data overlap cleanup | `app/organizer/layout.tsx`, `components/organizer/OrganizerLayoutWrapper.tsx`, `components/organizer/organizer-workspace-primitives.tsx` | P1 |
| `/organizer/gate` | `app/organizer/gate/page.tsx` | Thin launcher | Needs readiness indicators and flow parity with event gate pages | `components/organizer/OrganizerLayoutWrapper.tsx`, `components/shared/phase-two-shells.tsx` | P1 |
| `/organizer/events` | `app/organizer/events/page.tsx` | Usable listing | Search/filter not wired | `components/organizer/OrganizerSidebar.tsx`, `components/organizer/organizer-workspace-primitives.tsx`, `lib/prisma/client.ts` | P1 |
| `/organizer/events/new` | `app/organizer/events/new/page.tsx` | Wizard mature | Media/upload/validation/redirect audit | `components/organizer/organizer-workspace-primitives.tsx`, `lib/supabase/server.ts`, `lib/prisma/client.ts` | P1 |
| `/organizer/events/[id]` | `app/organizer/events/[id]/page.tsx` | Large, mostly functional | Monolithic, promo route mismatch, publish field mismatch, alert/confirm usage | `components/organizer/organizer-workspace-primitives.tsx`, `components/ui/confirm-provider.tsx`, `lib/prisma/client.ts` | P0 |
| `/organizer/events/[id]/edit` | `app/organizer/events/[id]/edit/page.tsx` | Mostly complete | Shared type/schema missing | `components/organizer/organizer-workspace-primitives.tsx`, `lib/prisma/client.ts`, `lib/utils.ts` | P0 |
| `/organizer/events/[id]/analytics` | `app/organizer/events/[id]/analytics/page.tsx` | Partial | Export not wired, dedicated analytics endpoint needed | `components/organizer/organizer-workspace-primitives.tsx`, `lib/prisma/client.ts` | P1 |
| `/organizer/events/[id]/attendees` | `app/organizer/events/[id]/attendees/page.tsx` | Fairly mature | Search debounce and export parity needed | `components/organizer/organizer-workspace-primitives.tsx`, `lib/prisma/client.ts` | P1 |
| `/organizer/events/[id]/faq` | `app/organizer/events/[id]/faq/page.tsx` | Minimal | Edit/delete/reorder missing, weak states | `components/organizer/organizer-workspace-primitives.tsx`, `lib/prisma/client.ts` | P1 |
| `/organizer/events/[id]/gate` | `app/organizer/events/[id]/gate/page.tsx` | Quite complete | Needs parity audit with `/organizer/gate`, `/gate`, `/gate/access` | `components/organizer/organizer-workspace-primitives.tsx`, `components/gate/QRScanner.tsx` | P1 |
| `/organizer/events/[id]/promo-codes` | `app/organizer/events/[id]/promo-codes/page.tsx` | Fairly complete | Edit/update missing, alert/confirm still ad hoc | `components/organizer/organizer-workspace-primitives.tsx`, `components/ui/confirm-provider.tsx`, `lib/prisma/client.ts` | P1 |
| `/organizer/events/[id]/seating` | `app/organizer/events/[id]/seating/page.tsx` | Feature-rich but unfinished | Resize/rotation/persistence incomplete | `components/organizer/organizer-workspace-primitives.tsx`, `lib/prisma/client.ts`, `lib/utils.ts` | P1 |
| `/organizer/team` | `app/organizer/team/page.tsx` | Functional | Invite flow not real, role/status UI weak | `components/organizer/OrganizerSidebar.tsx`, `components/organizer/organizer-workspace-primitives.tsx`, `lib/prisma/client.ts` | P1 |
| `/organizer/settings` | `app/organizer/settings/page.tsx` | Substantial | Verification display-only, validation/upload audit | `components/organizer/OrganizerLayoutWrapper.tsx`, `lib/supabase/server.ts`, `lib/prisma/client.ts` | P1 |
| `/organizer/wallet` | `app/organizer/wallet/page.tsx` | Read-only mature | Wallet service consistency needed | `components/organizer/OrganizerLayoutWrapper.tsx`, `lib/prisma/client.ts`, `lib/utils.ts` | P0 |
| `/organizer/wallet/bank-account` | `app/organizer/wallet/bank-account/page.tsx` | Partial/minimal | Set primary/edit/delete/verify not wired | `components/organizer/OrganizerLayoutWrapper.tsx`, `lib/prisma/client.ts` | P0 |
| `/organizer/wallet/withdraw` | `app/organizer/wallet/withdraw/page.tsx` | Usable but old-style | Boundary data messy, depends on settings API | `components/organizer/OrganizerLayoutWrapper.tsx`, `lib/prisma/client.ts`, `lib/utils.ts` | P0 |

### Organizer Task Breakdown

1. Centralize organizer auth and organizer-loading logic in `app/organizer/layout.tsx` and wrapper primitives before touching dashboard, settings, or wallet pages.
2. Define one event workspace contract covering `/organizer/events/[id]`, `/organizer/events/[id]/edit`, `/organizer/events/[id]/analytics`, `/organizer/events/[id]/attendees`, `/organizer/events/[id]/faq`, `/organizer/events/[id]/gate`, `/organizer/events/[id]/promo-codes`, `/organizer/events/[id]/seating`.
3. Address P0 organizer pages first: split monolithic `/organizer/events/[id]`, align `/organizer/events/[id]/edit` schema, and consolidate wallet data for `/organizer/wallet`, `/organizer/wallet/bank-account`, `/organizer/wallet/withdraw`.
4. Wire placeholder organizer actions next: events search/filter, analytics export, FAQ CRUD/reorder, promo edit/update, team invite realism, bank account lifecycle actions.
5. Run parity audit across organizer gate surfaces: `/organizer/gate`, `/organizer/events/[id]/gate`, public `/gate`, public `/gate/access`, and `/scanner`.
6. Finish domain by auditing media upload, redirect flows, and server validation on `/organizer/events/new`, `/organizer/settings`, and event workspace mutation pages.

## Admin

| Route | File | Current status | Main gaps | Shared files likely touched | Priority |
| --- | --- | --- | --- | --- | --- |
| `/admin` | `app/admin/page.tsx` | Dashboard mature | Heavy queries, auth duplication | `app/admin/layout.tsx`, `components/admin/AdminLayoutWrapper.tsx`, `components/admin/admin-workspace.tsx` | P1 |
| `/admin/analytics` | `app/admin/analytics/page.tsx` | Reasonably good | Top events and date-range semantics audit | `components/admin/admin-workspace.tsx`, `app/api/admin/finance/route.ts` | P1 |
| `/admin/bookings` | `app/admin/bookings/page.tsx` | Usable | Filter/search client-side only, no pagination | `components/admin/admin-workspace.tsx`, `lib/prisma/client.ts` | P1 |
| `/admin/bookings/[id]` | `app/admin/bookings/[id]/page.tsx` | Detail is rich | Cancel flow finance/refund/inventory audit | `components/admin/admin-workspace.tsx`, `components/ui/confirm-provider.tsx`, `lib/prisma/client.ts` | P0 |
| `/admin/categories` | `app/admin/categories/page.tsx` | CRUD mostly complete | Child/circular/pagination/tree integrity audit | `components/admin/admin-workspace.tsx`, `lib/prisma/client.ts` | P1 |
| `/admin/complimentary-requests` | `app/admin/complimentary-requests/page.tsx` | Moderation mature | Notes, pagination, linking improvements | `components/admin/admin-workspace.tsx`, `components/ui/toast-provider.tsx` | P1 |
| `/admin/events` | `app/admin/events/page.tsx` | Moderation list fairly mature | UI exposes subset of API capabilities | `components/admin/admin-workspace.tsx`, `lib/prisma/client.ts` | P1 |
| `/admin/events/[id]` | `app/admin/events/[id]/page.tsx` | Broad page | Backend schema mismatch, governance/capability audit | `components/admin/admin-workspace.tsx`, `components/ui/confirm-provider.tsx`, `lib/prisma/client.ts` | P0 |
| `/admin/finance` | `app/admin/finance/page.tsx` | Good monitoring page | Date range, trend, export, server-side needs | `components/admin/admin-workspace.tsx`, `app/api/admin/finance/route.ts` | P1 |
| `/admin/landing-page` | `app/admin/landing-page/page.tsx` | Usable CMS | Contract mismatch for copyright fields, fallback vs error | `components/admin/admin-workspace.tsx`, `app/api/admin/site-content/route.ts`, `lib/platform-settings.ts` | P0 |
| `/admin/payouts` | `app/admin/payouts/page.tsx` | Finance actions live | Transition/idempotency/proof/audit trail weak | `components/admin/admin-workspace.tsx`, `components/ui/confirm-provider.tsx`, `lib/prisma/client.ts` | P0 |
| `/admin/refunds` | `app/admin/refunds/page.tsx` | Mostly read-only | Backend actions not surfaced, contract mismatch | `components/admin/admin-workspace.tsx`, `components/ui/confirm-provider.tsx`, `lib/prisma/client.ts` | P0 |
| `/admin/reviews` | `app/admin/reviews/page.tsx` | Likely fragile | Pagination/data contract mismatch may break page | `components/admin/admin-workspace.tsx`, `lib/prisma/client.ts` | P0 |
| `/admin/settings` | `app/admin/settings/page.tsx` | Usable but inconsistent | Permission mismatch with super_admin endpoint, split saves | `components/admin/admin-workspace.tsx`, `app/api/admin/settings/route.ts`, `app/api/admin/settings/commission/route.ts`, `lib/platform-settings.ts` | P0 |
| `/admin/users` | `app/admin/users/page.tsx` | Good monitoring UI | UI exposes subset of backend capability | `components/admin/admin-workspace.tsx`, `lib/prisma/client.ts` | P1 |
| `/admin/users/[id]` | `app/admin/users/[id]/page.tsx` | Feature-rich | Verification/governance/commission mapping audit | `components/admin/admin-workspace.tsx`, `components/ui/confirm-provider.tsx`, `lib/prisma/client.ts` | P1 |
| `/admin/venues` | `app/admin/venues/page.tsx` | Read-only directory | Create/edit/detail flows absent | `components/admin/admin-workspace.tsx`, `lib/prisma/client.ts` | P1 |

### Admin Task Breakdown

1. Create one admin capability/auth policy reference used by `app/admin/layout.tsx`, `lib/auth/route-auth.ts`, and admin workspace wrappers before page-level fixes.
2. Resolve P0 contract failures first for `/admin/reviews`, `/admin/refunds`, `/admin/events/[id]`, `/admin/bookings/[id]`, `/admin/settings`, `/admin/landing-page`, `/admin/payouts`.
3. Align admin forms and actions with backend schemas: event detail governance, settings permissions, landing-page CMS payloads, payout transitions, and refund moderation actions.
4. Move heavy list pages toward server-backed filtering/pagination after critical correctness is stable: `/admin/bookings`, `/admin/events`, `/admin/users`, `/admin/venues`, `/admin/categories`.
5. Audit finance semantics across `/admin/analytics`, `/admin/finance`, `/admin/payouts`, `/admin/refunds`, and booking detail actions so totals, trends, and transitions match one policy.
6. Verify admin role access, destructive action confirmations, audit trail expectations, and list-detail navigation flows for all 17 admin pages.

## Docs

| Route | File | Current status | Main gaps | Shared files likely touched | Priority |
| --- | --- | --- | --- | --- | --- |
| `/docs` | `app/docs/page.tsx` | Mature landing | Needs centralized IA metadata | `app/docs/layout.tsx`, `components/docs/docs-shell.tsx`, `components/docs/FeatureCard.tsx` | P1 |
| `/docs/admin` | `app/docs/admin/page.tsx` | Mature | Needs nav/metadata consistency with docs system | `app/docs/admin/layout.tsx`, `components/docs/DocsSidebar.tsx`, `components/docs/Breadcrumb.tsx` | P1 |
| `/docs/admin/users` | `app/docs/admin/users/page.tsx` | Fairly good | List vs detail actions need clearer explanation | `app/docs/admin/layout.tsx`, `components/docs/docs-shell.tsx` | P1 |
| `/docs/admin/events` | `app/docs/admin/events/page.tsx` | Fairly aligned | List-to-detail moderation flow needs explicitness | `app/docs/admin/layout.tsx`, `components/docs/docs-shell.tsx` | P1 |
| `/docs/admin/transactions` | `app/docs/admin/transactions/page.tsx` | IA-problematic | No real `/admin/transactions` route, content misaligned | `app/docs/admin/layout.tsx`, `components/docs/docs-shell.tsx`, `components/docs/Breadcrumb.tsx` | P0 |
| `/docs/admin/settings` | `app/docs/admin/settings/page.tsx` | Too conceptual | Needs actual control mapping and permission nuance | `app/docs/admin/layout.tsx`, `components/docs/docs-shell.tsx` | P1 |
| `/docs/customer` | `app/docs/customer/page.tsx` | Polished | Access model and nav policy ambiguous | `app/docs/customer/layout.tsx`, `components/docs/DocsSidebar.tsx` | P0 |
| `/docs/customer/account` | `app/docs/customer/account/page.tsx` | Fairly consistent | Needs policy and UI accuracy audit | `app/docs/customer/layout.tsx`, `components/docs/docs-shell.tsx` | P1 |
| `/docs/customer/faq` | `app/docs/customer/faq/page.tsx` | Old/manual page | Hardcoded, mixed language, inconsistent pattern | `app/docs/customer/layout.tsx`, `components/docs/docs-shell.tsx` | P0 |
| `/docs/customer/support` | `app/docs/customer/support/page.tsx` | Usable | 24/7 vs office-hours contradiction | `app/docs/customer/layout.tsx`, `components/docs/docs-shell.tsx` | P0 |
| `/docs/customer/buying-tickets` | `app/docs/customer/buying-tickets/page.tsx` | Static guide | Hardcoded payment methods, accuracy risk | `app/docs/customer/layout.tsx`, `components/docs/BrowserFrame.tsx` | P1 |
| `/docs/organizer` | `app/docs/organizer/page.tsx` | Polished | Needs centralized nav and metadata parity | `app/docs/organizer/layout.tsx`, `components/docs/DocsSidebar.tsx` | P1 |
| `/docs/organizer/events` | `app/docs/organizer/events/page.tsx` | Behind actual product | Product flow and screenshots/content outdated | `app/docs/organizer/layout.tsx`, `components/docs/BrowserFrame.tsx`, `components/docs/docs-shell.tsx` | P1 |
| `/docs/organizer/wallet` | `app/docs/organizer/wallet/page.tsx` | Intro ok | Inaccurate and incomplete wallet guidance | `app/docs/organizer/layout.tsx`, `components/docs/docs-shell.tsx` | P1 |
| `/docs/organizer/team` | `app/docs/organizer/team/page.tsx` | Misleading | Roles/docs do not match product | `app/docs/organizer/layout.tsx`, `components/docs/docs-shell.tsx` | P0 |
| `/docs/organizer/gate` | `app/docs/organizer/gate/page.tsx` | Too thin | Can overstate capability, lacks operational detail | `app/docs/organizer/layout.tsx`, `components/docs/BrowserFrame.tsx`, `components/docs/docs-shell.tsx` | P1 |

### Docs Task Breakdown

1. Decide and document docs access policy first: public vs protected expectations for `/docs/layout`, `/docs/customer`, `/docs/customer/*`, and role-specific layouts.
2. Centralize docs IA metadata and sidebar/nav source of truth for `/docs`, `/docs/admin/*`, `/docs/customer/*`, `/docs/organizer/*` before rewriting individual pages.
3. Fix P0 factual mismatches first: `/docs/admin/transactions`, `/docs/customer`, `/docs/customer/faq`, `/docs/customer/support`, `/docs/organizer/team`.
4. Audit each docs page against its real product counterpart and note unsupported claims, stale steps, missing caveats, screenshot drift, and mixed-language copy.
5. Standardize language policy, metadata, breadcrumb labels, and feature framing across all 16 docs pages.
6. Finish by verifying that docs navigation, route existence claims, and protected/public access rules match the product exactly.

## Sequencing / Wave Plan

### Wave 0 - Foundation Mapping

- Confirm the 86-page inventory against route files and keep this plan as the audit ledger of record
- Establish shared status enums and route ownership notes for checkout, POS, gate, scanner, bookings, wallets, admin finance, and docs IA
- Normalize layout and guard expectations across `app/layout.tsx`, `app/(auth)/layout.tsx`, `app/(customer)/layout.tsx`, `app/organizer/layout.tsx`, `app/admin/layout.tsx`, `app/docs/layout.tsx`, `app/docs/admin/layout.tsx`, `app/docs/customer/layout.tsx`, `app/docs/organizer/layout.tsx`

### Wave 1 - High-Risk Transactional and Access Flows

- Public P0: `/checkout/success`, `/checkout/pending`, `/checkout/failed`, `/checkout`, `/tickets/transfer/accept`, `/gate`, `/gate/access`, `/scanner`, `/pos`, `/pos/access`, `/pos/payment-success`, `/pos/payment-pending`, `/pos/payment-failed`
- Customer P0: `/reset-password`, `/notifications`, `/my-bookings/[code]`, `/my-bookings/[code]/refund`, `/my-bookings/[code]/ticket`
- Organizer P0: `/organizer/events/[id]`, `/organizer/events/[id]/edit`, `/organizer/wallet`, `/organizer/wallet/bank-account`, `/organizer/wallet/withdraw`
- Admin P0: `/admin/bookings/[id]`, `/admin/events/[id]`, `/admin/landing-page`, `/admin/payouts`, `/admin/refunds`, `/admin/reviews`, `/admin/settings`
- Docs P0: `/docs/admin/transactions`, `/docs/customer`, `/docs/customer/faq`, `/docs/customer/support`, `/docs/organizer/team`

### Wave 2 - Shared Contract Consolidation

- Event discovery/detail alignment across public, organizer, and admin event pages
- Auth redirect and session handling alignment across auth and customer pages
- Wallet and finance semantics alignment across organizer wallet and admin finance/payout/refund pages
- Docs IA/nav alignment after route truth is confirmed

### Wave 3 - Domain Breadth Completion

- Public SEO/content pages and organizer/admin list/detail parity work
- Customer dashboard/profile/following/wishlist polish after contract stabilization
- Organizer placeholder action wiring and analytics/export completion
- Admin pagination/filtering/UX expansion where backend capability already exists
- Docs content refresh for all remaining non-P0 pages

### Wave 4 - Final Audit Closure

- Route-by-route sign-off against this master table
- Cross-domain regression checks for auth, role guards, metadata, and route availability
- Update docs and plan notes with residual backlog items that are intentionally deferred

## Verification Checklist Per Wave

### Wave 0

- Inventory still equals 86 route pages and matches domain counts 23/13/17/17/16
- Every page in this document has an owner domain, current status, gap summary, hotspot list, and priority
- Shared layout/guard assumptions are documented before page implementation starts

### Wave 1

- Transactional routes render the correct state from authoritative backend status, not inferred client heuristics
- Access/token/session flows reject invalid, expired, replayed, or unauthorized entry consistently
- Booking, refund, payout, finance, and admin moderation actions use documented API contracts and clear failure states
- P0 docs pages no longer claim unavailable routes, unsupported roles, or contradictory support policies

### Wave 2

- Shared response shapes are reused by all pages that read the same entity type
- Auth callback, redirect, and role checks behave consistently across public-to-auth and auth-to-customer/admin/organizer transitions
- Metadata and canonical routing strategy are defined for public discovery and docs shells

### Wave 3

- Remaining pages no longer rely on stale hardcoded claims where a real source of truth exists
- Search/filter/export affordances either work end-to-end or are clearly removed/deferred
- Docs screenshots, browser frames, labels, and narratives reflect the actual current product

### Wave 4

- All 86 routes have a final audit disposition: fixed, intentionally deferred with rationale, or accepted as-is
- Role-based navigation, deep links, not-found behavior, and metadata/SEO behavior have been spot-checked across all domains
- Master plan remains accurate enough for execution handoff and future verification notes

## Highest-Risk Pages To Prioritize

- Public: `/checkout/success`, `/checkout/pending`, `/checkout/failed`, `/tickets/transfer/accept`, `/gate/access`, `/pos/access`, `/scanner`
- Customer: `/reset-password`, `/notifications`, `/my-bookings/[code]`, `/my-bookings/[code]/refund`, `/my-bookings/[code]/ticket`
- Organizer: `/organizer/events/[id]`, `/organizer/events/[id]/edit`, `/organizer/wallet/bank-account`, `/organizer/wallet/withdraw`
- Admin: `/admin/reviews`, `/admin/refunds`, `/admin/events/[id]`, `/admin/bookings/[id]`, `/admin/settings`, `/admin/landing-page`, `/admin/payouts`
- Docs: `/docs/admin/transactions`, `/docs/customer`, `/docs/customer/faq`, `/docs/customer/support`, `/docs/organizer/team`

## Coverage Check

- Public non-docs covered explicitly: 23 routes
- Auth/Customer covered explicitly: 13 routes
- Organizer covered explicitly: 17 routes
- Admin covered explicitly: 17 routes
- Docs covered explicitly: 16 routes
- Total explicit route coverage in tables: 86 routes, with no page omitted from the approved domain inventory
