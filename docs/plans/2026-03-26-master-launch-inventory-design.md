# Master Launch Inventory Design

## Summary

Create one master documentation file for Gelaran that inventories the entire project in a way that is useful for internal technical readers and LLM-based analysis. The document must combine role-based understanding, end-to-end flow mapping, and domain-level system inventory so the team can review, validate, and finish the project section by section until it is ready for at least beta launch.

## Problem

The repository already contains active product, operations, and go-live documentation, but it does not yet have one consolidated inventory that answers these questions in one place:

- what roles exist in the system
- what each role can do
- what user journeys exist end to end
- what pages, APIs, and entities support each journey
- what is already implemented versus what still needs validation
- which sections block beta launch

Without that document, launch-readiness work becomes fragmented across code, runbooks, and historical plans.

## Goals

- Produce one source-of-truth inventory file inside `docs/`
- Cover the full implemented surface of the codebase, not just planned scope
- Make the document easy to scan by engineers
- Make the structure stable enough for LLM parsing and task generation
- Turn inventory into section-by-section beta-readiness execution guidance

## Non-Goals

- Replace detailed runbooks in `docs/operations/`
- Replace formal go-live approval artifacts in `docs/go-live/`
- Duplicate every low-level implementation detail from code
- Write user-facing product documentation

## Audience

- Internal technical team
- Engineering reviewers
- Future LLM-assisted implementation and audit workflows

## Recommended Approach

Use a hybrid structure:

1. Role-first at the top for fast operational and product understanding
2. Journey-first in the middle for end-to-end flow review
3. Domain-first in the core inventory for engineering completeness
4. Beta-readiness checklist at the end for execution sequencing

This is the strongest option because it avoids the main weakness of pure role-first or pure domain-first structures.

## Document Location

Recommended output file:

`docs/master-launch-inventory.md`

This keeps the file in active documentation, not in historical planning notes.

## Proposed Structure

### 1. Document Metadata

Purpose, audience, maintenance rules, status definitions, and usage guidance.

Required status vocabulary:

- `implemented`
- `partial`
- `needs-validation`
- `missing`
- `beta-blocker`

### 2. Role Matrix

Primary roles:

- Customer
- Organizer
- Admin
- Super Admin

Secondary operational roles:

- Organizer team manager
- Organizer team scanner
- Organizer team finance
- Event-day scanner / gate operator
- POS operator, when applicable

Each role section should include:

- objective
- main capabilities
- accessible pages
- accessible API families
- critical dependencies
- beta risks

### 3. Journey Matrix

Cross-role journeys to document:

- authentication and account onboarding
- organizer application and organizer setup
- event creation, editing, and publishing
- event discovery and event detail browsing
- seating and ticket selection
- checkout and payment
- booking success, pending, and failure handling
- booking management, refund, and ticket access
- ticket transfer
- organizer attendee management
- complimentary request handling
- POS selling flow
- gate event access and check-in
- review and social flows
- admin operations and moderation
- organizer wallet and payout flow
- notifications and reminders

Each journey section should include:

- actors
- entry point
- happy path
- edge cases
- pages involved
- APIs involved
- entities involved
- readiness checks

### 4. Domain Inventory

Core domains to inventory:

- authentication and identity
- users and roles
- organizer management
- event management
- venue and seating
- ticketing and pricing
- booking lifecycle
- payment processing and webhook handling
- refunds and complimentary flows
- customer experience surfaces
- reviews, wishlist, and following
- notifications
- POS operations
- gate operations
- admin back office
- finance, wallet, payouts, commission, tax
- site content and landing page management
- cron and background automation
- operational and launch documentation

Each domain should follow the same schema:

- purpose
- involved roles
- primary pages
- primary APIs
- core entities
- business rules
- dependencies
- current status
- gaps and blockers
- section checklist

### 5. Surface Inventory Index

Provide normalized indices for:

- page routes
- API routes
- major component groups
- Prisma model groups

This index should be grouped, not dumped raw, so it remains readable.

### 6. Beta Readiness Checklist

This should convert the inventory into execution order:

- must validate before beta
- must fix before beta
- should improve before public launch
- can defer after beta

Each item should reference the relevant role, journey, and domain section.

### 7. Launch Summary

Short decision-focused section:

- ready areas
- partially ready areas
- blocked areas
- recommended next sequence

## Content Sources

The inventory should be derived from active repository sources:

- `README.md`
- `docs/product/requirements.md`
- `docs/operations/*`
- `docs/go-live/*`
- `app/**`
- `app/api/**`
- `components/**`
- `prisma/schema.prisma`
- recent implementation history from git

## Authoring Rules

- Prefer explicit section labels over prose-heavy explanation
- Use consistent naming with the current codebase
- Separate implemented facts from assumptions
- Mark unknowns or unverified flows as `needs-validation`
- Keep the file maintainable as a living document

## Expected Output Quality

The final file should let a new engineer or an LLM answer:

- which roles exist
- how each role moves through the system
- which pages and APIs support each capability
- which features are implemented
- where the beta blockers are
- what should be worked on next

## Risks

- The file may become too long if route-level detail is not normalized
- The file may become stale if statuses are not maintained
- Repeating operations/go-live content verbatim would create duplication risk

## Mitigations

- Use stable section templates
- Keep deep runbook details linked, not copied
- Summarize technical surfaces by grouped function
- Clearly distinguish inventory from operational procedure

## Implementation Direction

The next step is to create a detailed implementation plan for assembling the inventory from the current codebase and active docs, then write the master file in active documentation.
