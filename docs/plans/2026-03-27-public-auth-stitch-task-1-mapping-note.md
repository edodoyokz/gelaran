# Task 1 Mapping Note - Public/Auth Stitch Audit

## Inputs reviewed

- Design: `docs/plans/2026-03-27-public-auth-stitch-design.md`
- Stitch references: landing, listing, detail, checkout, checkout states, auth, organizer, about, contact, become-organizer HTML files under `stitch-designs/`
- Current shared surfaces: `app/layout.tsx`, `app/globals.css`, `components/layouts/Navbar.tsx`, `components/layouts/Footer.tsx`, `components/shared/public-marketing.tsx`, `components/shared/auth-ui.tsx`, `components/shared/phase-two-shells.tsx`, `components/features/events/discovery-primitives.tsx`, `components/features/checkout/checkout-primitives.tsx`, `components/customer/customer-dashboard-primitives.tsx`, `app/(auth)/layout.tsx`, `app/(customer)/layout.tsx`

## 1. Hero composition guidance

- Public marketing heroes should read as editorial first: small uppercase kicker, oversized serif headline, short body copy, then CTA cluster.
- Stitch repeatedly uses split heroes rather than single-column stacks: copy left, visual/supporting panel right for landing, event detail, organizer, and partner/conversion pages.
- Landing and organizer heroes use layered imagery and stat/support cards; route composition should preserve this asymmetry instead of centering everything in a generic shell.
- Discovery, about, and contact use headline-led heroes with restrained supporting controls underneath; these do not need the same image-heavy treatment as landing/auth/register.
- Auth heroes are bifurcated: a brand/editorial image panel plus a focused form panel. Login/register need stronger left-panel storytelling than forgot/reset, which can collapse to a simpler supportive frame.
- Checkout/result heroes are transactional editorial hybrids: prominent status/icon/title block plus a secondary summary/ticket block, not a plain form heading.

## 2. Section order guidance

- Landing order from Stitch: immersive hero -> category chips -> featured event grid/editorial picks -> supporting cultural/editorial sections -> proof/stats -> footer CTA cadence.
- Discovery order: headline + chips -> filter/sidebar and controls -> result stats/sort -> card grid -> supporting empty/filter states as needed.
- Event detail order: media hero + purchase/sidebar -> title/meta/story -> schedule -> venue/accessibility -> supplemental links/FAQ/support.
- Checkout order: event summary context -> attendee form -> payment selection -> reassurance/trust block -> sticky order summary.
- Checkout result order: status hero -> transaction facts/actions -> ticket or payment summary artifact -> follow-up notes/support.
- Auth order: shell framing first, then intro, then form, then fine print/secondary links. Register additionally includes value propositions; forgot/reset use security/support framing rather than marketing cards.

## 3. Card/button/input styling guidance

- Cards should move toward soft editorial surfaces: light borders, warm/teal-tinted backgrounds, large radii, layered shadows, occasional glass/backdrop treatment for hero-adjacent panels.
- Event and organizer cards in Stitch favor image-first cards with strong media crops, compact metadata, serif titles, orange price/CTA accents, and subtle hover lift.
- Buttons use two dominant families: filled orange primary CTA and bordered/light secondary CTA. Auth primary buttons skew toward darker brown-orange gradient fills; public/checkout CTAs skew bright orange.
- Inputs should not stay generic rounded app inputs everywhere. Stitch patterns split into two modes: editorial underline inputs for auth/contact/register and soft filled rounded inputs for checkout/filter/search.
- Badges/chips are a first-class styling pattern: uppercase micro-labels, rounded-full pills, warm yellow active states, teal soft states, and stronger contrast for transactional status.
- Status/result cards need tone-specific treatment beyond color text: icon container, tinted surface, stronger heading, and structured metadata blocks.

## 4. Shell background treatment guidance

- Public pages use light layered backgrounds with soft radial color fields, not flat white and not the current globally persistent patterned wash on every surface.
- Nav backgrounds in Stitch are usually translucent, blurred, and subtle; logo and nav typography are more editorial than the current product-style navbar.
- Auth shells need route-level background control: warm neutral or white form side, separate editorial image side, and optional directional overlays/chips.
- Checkout and result shells need cleaner white or pale-tinted canvases with concentrated emphasis on cards, rather than busy global gradients behind all content.
- Content pages like about/contact/become-organizer use occasional geometric shapes, large blocks of whitespace, and section-level background alternation.
- Customer continuity surfaces should inherit token language and surface softness, but should not be fully restyled into marketing/editorial page compositions.

## 5. Mobile layout expectations

- Split heroes collapse to single-column stacks with copy first and supporting imagery/panels second unless the transactional context requires summary first.
- Large desktop editorial headlines still need strong scale on mobile, but with controlled line length and reduced decorative whitespace.
- Discovery filters cannot rely on a permanently visible left sidebar on mobile; they need collapse/drawer or top-stack behavior while preserving chips and sort access.
- Checkout stacks form content above summary on mobile unless a sticky bottom action/summary is introduced locally.
- Auth pages should hide or compress the left editorial panel on smaller widths while preserving brand framing through a compact top chip, heading, or backdrop treatment.
- Cards, chips, buttons, and controls need tap-safe sizing; Stitch consistently implies generous vertical rhythm and avoids dense dashboard-style mobile packing.

## 6. Exact gap analysis

### Tokens / global CSS

- Keep fonts, public/auth color tokens, radius scale, shared shadows, section gutters, and shell background recipes in `app/globals.css`.
- Add customer-facing semantic tokens for editorial backgrounds, card tints, status surfaces, chip tones, auth neutrals, and navbar glass treatment rather than repeating raw hex values.
- Move public/auth typography intent into global tokens: serif display family usage, uppercase label tracking, tighter display tracking, and page-family spacing steps.
- Do not keep current body-wide background treatment as the only customer-facing shell language; it is too opinionated and too globally applied for checkout/auth/detail parity.

### Shared primitives

- `components/shared/public-marketing.tsx` should own marketing hero variants, editorial panels, section wrappers, feature/info cards, and content-page rich text framing.
- `components/shared/auth-ui.tsx` should own field shells, auth messaging, CTA variants, fine print, and auth-specific support/meta blocks.
- `components/shared/phase-two-shells.tsx` should own public/auth layouts, section headers, stat cards, and dashboard continuity wrappers, but not route-specific content order.
- `components/features/events/discovery-primitives.tsx` should own discovery hero/filter/stat/badge/panel patterns and later detail-adjacent shared event framing where truly reused.
- `components/features/checkout/checkout-primitives.tsx` should own checkout cards, event summary, status hero, callouts, action bars, and transactional framing primitives.
- `components/customer/customer-dashboard-primitives.tsx` should only absorb continuity-level token/surface refinements, not marketing hero patterns.

### Route-local composition

- Exact section order, page-specific imagery combinations, and page-family storytelling belong in route files and route-local feature components.
- Landing-only asymmetric hero collage, about-page story cadence, organizer profile tab composition, and contact page support-channel sequencing should remain route-composed.
- Event detail purchase/sidebar ordering, FAQ placement, checkout field grouping, and auth page copy hierarchy are route-level decisions using shared primitives.
- Route-local composition should be where dynamic data, empty states, long text, and responsive branch decisions adapt the shared primitives to real content.

## 7. Missing primitives likely needed

- `PublicHeroVisualStack` or equivalent for layered landing/partner/organizer hero imagery plus floating stat/support cards.
- `EditorialSectionBand` for alternating full-width section backgrounds and roomy content-page blocks.
- `MarketingChipRow` / `FilterChipRow` with active, inactive, and icon variants.
- `PublicCardShell` variants for image cards, metric cards, support cards, and editorial text cards with consistent radius/shadow rules.
- `AuthFramingAside` for login/register/forgot/reset brand panel content and compact mobile fallback.
- `AuthSupportCard` or `AuthMetaCard` for security, help, and recovery guidance blocks.
- `CheckoutSummaryCard` and `CheckoutStatusArtifact` variants for summary, payment instructions, ticket stub, and failure/pending detail blocks.
- `ContinuitySurfaceCard` or tokenized dashboard surface variant for customer pages so customer shell stays visually compatible without importing marketing composition.

## Current implementation observations affecting follow-up work

- `app/layout.tsx` already swaps to closer font families than the older app baseline, but `app/globals.css` still carries broad product-wide defaults and a body background treatment that does not map cleanly to Stitch page families.
- `Navbar.tsx` and `Footer.tsx` are still product/app styled rather than editorial/public-auth styled; both contain branding, spacing, and color decisions that will fight the Stitch direction.
- Public/shared primitives are partially aligned in spirit, but they currently stop at generic panel/section abstractions and do not yet cover the more specific hero, chip, or transactional artifact patterns seen in Stitch.
- Auth primitives use hard-coded colors close to the target direction, but they are not token-driven and do not yet expose enough framing variants for the distinct login/register/recovery layouts.
- Checkout primitives are the closest conceptual fit, but still need stronger result-state artifact patterns and clearer separation between shell-level styling and route-level transactional order.

## Self-review

- The note separates global-token concerns from primitive concerns from route composition concerns, which is the main decision Task 1 needs before UI work starts.
- The guidance stays implementation-facing and avoids copying Stitch markup.
- The missing primitive list is intentionally short and reusable so later tasks can add only what is needed.
