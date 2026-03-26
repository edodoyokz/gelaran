# Multi-Role Stitch UI System Design

**Date:** 2026-03-26

## Goal

Define one shared UI system for Gelaran across `customer`, `organizer`, `admin`, `POS`, and `gate` flows, then use Stitch to generate consistent screens in both `light` and `dark` modes.

## Context

Gelaran is a multi-role event ticketing platform for Solo/Surakarta. The product spans public event discovery, customer booking, organizer operations, admin oversight, and event-day operations such as POS and gate check-in. The UI must feel like one coherent platform instead of separate products stitched together.

The current Stitch project already contains an initial landing page direction, but the approved correction is that `light mode` must use a true white base canvas, while `dark mode` must use a premium dark teal atmosphere derived from the brand palette.

## Brand Direction

### Palette

- Primary Orange: `#F95D00`
- Primary Yellow: `#FBC117`
- Dark Teal: `#015959`
- Light Teal: `#29B3B6`

### Mode Rules

#### Light Mode

- Base page background must be pure white.
- The global canvas must not be tinted aqua, mint, teal, or soft blue.
- Dark Teal anchors headers, premium sections, strong headings, footer blocks, and important structure.
- Orange is reserved for primary CTA and purchase intent.
- Yellow is used for supportive emphasis, promo chips, and warning-like highlights.
- Light Teal is used for links, filters, focus states, and supporting interactive accents.

#### Dark Mode

- Base page background must be a premium dark teal family derived from `#015959`.
- Dark mode must not collapse into near-black or generic dark SaaS.
- Orange remains the primary CTA color.
- Yellow remains the warm accent.
- Light Teal remains the interactive support color.

## Creative North Star

The system should feel editorial, warm, local, and premium. Customer-facing surfaces should present events like curated cultural experiences rather than commodity listings. Internal tools should remain clearly operational, but still inherit the same brand family, spacing system, typography hierarchy, and color logic.

The product should feel grounded in Solo/Surakarta cultural energy without becoming costume-like or overly traditional. Avoid purple bias, neon cyberpunk styling, or flat template aesthetics.

## Layout System

### Shared Foundations

- One visual family across all roles.
- Shared typography hierarchy, spacing rhythm, rounded corners, and component logic.
- Theme toggle visible in public pages and standard dashboards.
- Soft depth and tonal layering preferred over hard borders.

### Role-Specific Tone

#### Customer

- Editorial, image-led, warm, and conversion-oriented.
- More whitespace, stronger storytelling, richer hero sections.

#### Organizer

- Task-focused, capable, and productive.
- More cards, filters, tables, and form blocks.

#### Admin

- Analytical, authoritative, and modular.
- Dense information layout with stats, charts, tables, and approval flows.

#### POS / Gate

- Fast, clear, and operational.
- Larger touch targets, stronger contrast, minimal distraction, obvious status states.

## Shared Component Rules

### Buttons

- Primary: Orange
- Secondary: Dark Teal
- Tertiary / outline / subtle interactive: Light Teal

### Cards

- Rounded corners
- Soft depth
- No heavy border dependency by default

### Tables and Data Surfaces

- Clean, readable rows
- Clear actions
- Strong hierarchy for filters and bulk actions in organizer/admin

### Forms

- High-contrast surfaces
- Clear grouping
- Focus states using Light Teal

### Badges and Chips

- Yellow for promo, warning, support, or category emphasis
- Teal for info, filters, or secondary metadata
- Orange only when tied to conversion or a high-emphasis action

### Feedback States

The platform needs a consistent visual language for:

- success
- pending
- failed
- approved
- rejected
- scanned
- refunded

These states must stay recognizable across customer, organizer, admin, POS, and gate flows.

## Approved Screen Inventory

### Public / Customer

- Landing Page
- Events Listing
- Event Detail
- Organizer Profile
- Checkout
- Checkout Success
- Checkout Pending
- Checkout Failed
- Login
- Register
- Forgot Password
- Reset Password
- Customer Dashboard
- My Bookings
- Wishlist
- Profile
- Notifications
- Following
- FAQ / Customer Docs
- Become Organizer
- About
- Contact

### Organizer

- Organizer Dashboard
- Organizer Events List
- Organizer Event Create / Edit
- Organizer Event Detail Management
- Organizer Team
- Organizer Wallet
- Organizer Gate Management
- Organizer Settings
- Organizer Docs

### Admin

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
- Admin Docs

### Event-Day Ops

- POS Access
- POS Main
- POS Seat Selection
- Gate Access
- Gate Check-In Main
- Gate Scan Result States
- Scanner Utility

## Generation Strategy

The screen generation should be executed in four batches:

1. Public / Customer
2. Organizer
3. Admin
4. Event-Day Ops

Each batch should reuse a shared prompt structure so the system remains visually consistent across roles.

### Naming Convention

Generated screens should use explicit naming for role, page, and mode, for example:

- `Gelaran - Customer Event Detail - Light`
- `Gelaran - Organizer Dashboard - Dark`
- `Gelaran - Admin Users - Light`
- `Gelaran - Gate Check-In - Dark`

### Prioritization

- Desktop first for all major screens
- Light and dark counterparts for primary customer, organizer, and admin pages
- POS and gate prioritize operational clarity before full mode parity

## Acceptance Criteria

- All roles feel like one platform.
- Light mode uses a true white base canvas.
- Dark mode uses premium dark teal, not near-black.
- Public pages feel editorial and conversion-oriented.
- Organizer and admin pages feel operational and product-grade.
- POS and gate pages feel fast, obvious, and field-ready.
- Generated outputs are organized in Stitch with consistent naming.

## Constraints and Notes

- Stitch MCP asset-level design-system updates were rejected with invalid-argument validation during this session.
- Screen-level generation works and should be the primary execution path.
- Existing project screen IDs should be preserved where useful, but corrected or regenerated screens should be created as explicit new screens when targeted edits fail.
