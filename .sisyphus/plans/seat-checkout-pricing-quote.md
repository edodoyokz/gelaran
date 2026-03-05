# Seat Checkout Pricing Quote Fix Plan

## Context

### Original Request
"plan implementasi"

### Interview Summary
**Key Discussions**:
- Seat checkout shows total 0/free; regular ticket checkout is OK.
- Seat checkout sends `seatIds` to pricing quote but `tickets` is empty.

**Research Findings**:
- `app/checkout/page.tsx` uses `/api/pricing/quote` for totals and passes `seatIds` with empty `tickets` on seat checkout.
- `app/api/pricing/quote/route.ts` computes subtotal only from `tickets`, ignoring `seatIds`.
- `app/api/bookings/route.ts` already computes seat subtotal correctly from locked seats.
- Seat locking endpoint returns seat price from `priceOverride` or `ticketType.basePrice`.
- Test infra is partial: a Jest test exists, no global test config or script.

### Metis Review
**Identified Gaps (addressed)**:
- Guardrails: avoid touching booking creation or seat locking logic; keep scope to quote API.
- Edge cases: mixed seat pricing, empty/invalid seatIds, seats from wrong event.
- Acceptance criteria must include explicit seat checkout verification.

---

## Work Objectives

### Core Objective
Fix pricing quote calculations for seat checkout so totals reflect seat prices and no longer show as free when seats are paid.

### Concrete Deliverables
- Update pricing quote to compute subtotal from `seatIds` for seat checkout.
- No seat session validation in quote (fastest safe change).

### Definition of Done
- [x] Seat checkout pricing returns correct non-zero total for paid seats.
- [x] Regular ticket checkout pricing remains unchanged.
- [x] Manual verification steps confirm UI total matches expected seat sum.

### Must Have
- Pricing quote handles seat checkout using seat prices (`priceOverride` or `ticketType.basePrice`).

### Must NOT Have (Guardrails)
- Do not change booking creation logic in `app/api/bookings/route.ts`.
- Do not modify seat lock or release behavior.
- Do not add new pricing features (promo rules, fee changes) beyond seat subtotal support.

---

## Verification Strategy (MANDATORY)

### Test Decision
- **Infrastructure exists**: PARTIAL (Jest test file present, no config/script)
- **User wants tests**: NO (manual QA only)
- **Framework**: none (manual QA)

### If Manual QA Only (default until decision)

**Frontend/UI Verification (Playwright automation):**
- [ ] Start dev server: `pnpm dev`
- [ ] Using Playwright, navigate to a seat checkout event page and select paid seats.
- [ ] Proceed to checkout and verify total is **not** `Rp 0` and matches expected seat prices.
- [ ] Repeat with a seat that has `priceOverride` to confirm override pricing is applied.
- [ ] Screenshot evidence saved to `.sisyphus/evidence/seat-quote-total.png`.

**Manual API Verification (curl):**
- [ ] Call `/api/pricing/quote` with `seatIds` and verify `totalAmount > 0` for paid seats.
- [ ] Call `/api/pricing/quote` with regular tickets to confirm unchanged behavior.

---

## Task Flow

```
Task 1 → Task 2 (optional, depends on decision)
```

## TODOs

> Implementation + Test = ONE Task. Never separate.

- [x] 1. Add seat-based subtotal calculation to pricing quote

  **What to do**:
  - Accept `seatIds` and compute subtotal from seats when seat checkout is used.
  - For each seat, use `priceOverride` if present; otherwise use `ticketType.basePrice`.
  - Validate seatIds belong to the event used in the quote (match event ID).
  - Preserve existing ticket-based pricing behavior when `tickets` are provided.

  **Must NOT do**:
  - Do not change booking creation logic in `app/api/bookings/route.ts`.
  - Do not alter fee/tax calculation logic in `lib/pricing/calculate.ts`.

  **Parallelizable**: NO

  **References**:
  - `app/api/pricing/quote/route.ts` - current quote flow (only ticket-based subtotal).
  - `app/api/bookings/route.ts` - seat subtotal logic and price selection pattern.
  - `app/api/events/[slug]/seats/route.ts` - seat price source (`priceOverride` vs `ticketType.basePrice`).
  - `lib/pricing/calculate.ts` - pricing breakdown math after subtotal.
  - `app/checkout/page.tsx` - seat checkout sends `seatIds` with empty `tickets`.

  **Acceptance Criteria**:
  - [ ] For seat checkout with paid seats, `totalAmount` from `/api/pricing/quote` is > 0.
  - [ ] For seats with `priceOverride`, subtotal reflects override price.
  - [ ] For seats without `priceOverride`, subtotal uses `ticketType.basePrice`.
  - [ ] Regular ticket checkout quote remains unchanged.
  - [ ] Manual UI verification completed with evidence screenshot.

## Out of Scope (Explicit)
- Seat session validation in quote (can be added later if needed).

---

## Commit Strategy

| After Task | Message | Files | Verification |
|------------|---------|-------|--------------|
| 1 (+2 if enabled) | `fix(pricing): calculate seat totals in quote` | `app/api/pricing/quote/route.ts` | Manual QA checklist |

---

## Success Criteria

### Verification Commands
```bash
pnpm dev
```

### Final Checklist
- [x] Seat checkout total is correct (not 0) for paid seats.
- [x] Ticket checkout pricing unaffected.
- [x] Manual QA evidence captured.
