# E-Voucher Template System Implementation Plan

## Context

### Original Request
Implement an E-Voucher Template system where Admins create global templates and Organizers customize them (images, colors, text) for their events.

### Design Decisions
- **Architecture**: Static React Components (`@react-pdf/renderer`) mapped by DB key.
- **Data Model**: `VoucherTemplate` (Global) + `EventVoucherConfig` (Per-Event).
- **Storage**: Supabase Storage for assets.
- **Preview**: Client-side real-time preview (On-Demand).
- **Testing**: Manual verification (No automated tests).

### Metis Review
**Guardrails Applied**:
- **NO** Drag-and-drop layout builder (Visual Editor).
- **NO** Image cropping/editing (Upload only).
- **NO** Multi-language support for custom text (Single language MVP).
- **NO** Complex rich text (Plain text only).

---

## Work Objectives

### Core Objective
Enable organizers to generate professional, branded E-Vouchers by selecting and customizing pre-built templates.

### Concrete Deliverables
- **DB**: Migration for `VoucherTemplate` and `EventVoucherConfig`.
- **Backend**: API Routes for managing templates and configs.
- **UI**: Admin Seeder, Organizer Customization Page (Selector, Form, Preview).
- **PDF Engine**: Registry of templates and rendering logic.

### Definition of Done
- [ ] Organizer can select a template.
- [ ] Organizer can upload logo/background.
- [ ] Organizer can change primary color.
- [ ] PDF generates correctly with overrides.
- [ ] Config saves to database.

---

## Verification Strategy

**Test Decision**: Manual Verification Only (User Request).

**Critical**: Since there are no automated tests, every task MUST include a verification command or procedure.

### Manual Verification Procedure
1.  **DB Changes**: Verify tables exist in Supabase Studio or via `prisma studio`.
2.  **API**: Use `curl` or Postman to check endpoints.
3.  **UI/PDF**:
    -   Open Browser.
    -   Navigate to `/organizer/events/[id]/voucher-design`.
    -   Change settings.
    -   Click "Preview".
    -   Verify visual output matches settings.

---

## Task Flow

```
1. Schema & DB (Foundation)
       ↓
2. Backend Services (API & Storage)
       ↓
3. PDF Engine & Templates (Core Logic)
       ↓
4. Organizer UI (Frontend)
       ↓
5. Integration & Polish
```

---

## TODOs

- [ ] 1. **Schema Update & Migration**
  **What to do**:
  - Update `prisma/schema.prisma` with `VoucherTemplate` and `EventVoucherConfig` models.
  - Add `voucherConfig` relation to `Event`.
  - Run `npx prisma migrate dev --name add_voucher_templates`.
  
  **References**:
  - `prisma/schema.prisma` (Existing schema to extend)
  - Design Doc Section 1 (Model definitions)

  **Acceptance Criteria**:
  - [ ] `npx prisma studio` shows new tables.
  - [ ] Can create a dummy `VoucherTemplate` via Prisma Studio.

- [ ] 2. **Seed Initial Templates**
  **What to do**:
  - Create `prisma/seed-templates.ts`.
  - Add "Modern", "Classic", "Minimal" templates to `VoucherTemplate` table.
  - Run the seed script.

  **References**:
  - `prisma/seed.ts` (Existing seed pattern)

  **Acceptance Criteria**:
  - [ ] `npx prisma db seed` runs without error.
  - [ ] DB contains at least 3 templates.

- [ ] 3. **PDF Template Registry & Components**
  **What to do**:
  - Create `lib/pdf/templates/registry.ts` (Map keys to components).
  - Create `lib/pdf/templates/modern.tsx` (Migrate/Refactor existing logic).
  - Create `lib/pdf/templates/classic.tsx` (New simple variation).
  - Create `lib/pdf/types.ts` (Define `VoucherConfig` interface).

  **References**:
  - `lib/pdf/ticket-template.tsx` (Existing code to refactor)
  - `@react-pdf/renderer` docs

  **Acceptance Criteria**:
  - [ ] `registry.ts` exports `getTemplate(key)`.
  - [ ] Components accept `config` prop and render correctly.

- [ ] 4. **Backend API: Event Voucher Config**
  **What to do**:
  - Create `app/api/organizer/events/[eventId]/voucher-config/route.ts`.
  - Implement GET (fetch config) and POST/PUT (upsert config).
  - Validate input using Zod.

  **References**:
  - `app/api/events/route.ts` (API pattern)
  - `lib/validations/voucher.ts` (Create this Zod schema)

  **Acceptance Criteria**:
  - [ ] `curl -X GET ...` returns 200 with config.
  - [ ] `curl -X POST ...` updates the config.

- [ ] 5. **Asset Upload API (if needed)**
  **What to do**:
  - Ensure `app/api/upload/route.ts` handles image uploads to `evoucher-assets` bucket.
  - Or verify existing upload logic works for this use case.

  **References**:
  - `scripts/setup-storage.ts` (Check bucket existence)
  - `components/ui/image-upload.tsx` (Frontend component)

  **Acceptance Criteria**:
  - [ ] Can upload an image and get a public URL back.

- [ ] 6. **Organizer UI: Template Selector**
  **What to do**:
  - Create `app/(organizer)/events/[eventId]/voucher/page.tsx`.
  - Fetch available templates.
  - Render Grid of Cards (Preview Image + Name).
  - Handle selection state.

  **References**:
  - `components/ui/card.tsx`
  - `app/(organizer)/layout.tsx`

  **Acceptance Criteria**:
  - [ ] Page loads with templates.
  - [ ] Selecting a template updates local state.

- [ ] 7. **Organizer UI: Customization Form**
  **What to do**:
  - Build form with React Hook Form.
  - Inputs: Color Pickers (Input type="color"), Image Uploaders, Toggles, Custom Text Array.
  - Bind to `VoucherConfig` state.

  **References**:
  - `components/ui/form.tsx`
  - `components/ui/image-upload.tsx`

  **Acceptance Criteria**:
  - [ ] Changing color input updates state.
  - [ ] Uploading logo updates state URL.

- [ ] 8. **Organizer UI: Live Preview & Save**
  **What to do**:
  - Add "Preview" button.
  - Render `@react-pdf/renderer`'s `<PDFViewer>` or generate Blob URL in a Modal.
  - Add "Save Changes" button calling the API.

  **References**:
  - `lib/pdf/render.ts` (Client-side rendering helper)

  **Acceptance Criteria**:
  - [ ] Preview shows the PDF with current form values.
  - [ ] Save persists to DB.

- [ ] 9. **Integration: Ticket PDF Route**
  **What to do**:
  - Update `app/api/tickets/[ticketId]/pdf/route.ts`.
  - Fetch `EventVoucherConfig` for the ticket's event.
  - Resolve Template Component.
  - Render PDF with `configOverrides`.

  **References**:
  - `app/api/tickets/[ticketId]/pdf/route.ts`

  **Acceptance Criteria**:
  - [ ] Downloading a ticket PDF shows the CUSTOMIZED version (Logo, Colors).

---

## Commit Strategy

| Task | Message | Files |
|------|---------|-------|
| 1 | `feat(db): add voucher template models` | `schema.prisma`, `migrations/*` |
| 2 | `chore(seed): add initial voucher templates` | `seed-templates.ts` |
| 3 | `feat(pdf): implement template registry and components` | `lib/pdf/*` |
| 4 | `feat(api): add voucher config endpoints` | `app/api/organizer/*` |
| 5 | `feat(ui): add template selector page` | `app/(organizer)/.../voucher/page.tsx` |
| 6 | `feat(ui): add customization form and preview` | `app/(organizer)/.../voucher/page.tsx` |
| 7 | `feat(pdf): integrate config into ticket generation` | `app/api/tickets/.../pdf/route.ts` |

---

## Success Criteria

### Verification Commands
```bash
# 1. Check DB
npx prisma studio

# 2. Check API
curl http://localhost:3000/api/organizer/events/[id]/voucher-config

# 3. Check PDF
# Open browser to ticket download link
```

### Final Checklist
- [ ] Admin can seed templates.
- [ ] Organizer can customize Logo, Background, Colors.
- [ ] Organizer can add Custom Text.
- [ ] PDF generation reflects all customizations.
- [ ] "Must NOT Have" guardrails respected (No drag-and-drop).
