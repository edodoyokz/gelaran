---
description: Langkah yang harus dilakukan sebelum memulai task apapun di project BSC
---

# Start Task Workflow

Ikuti langkah-langkah berikut sebelum mengerjakan task apapun di project BSC:

## 1. Baca LLM Specification Document
// turbo
Baca file `LLM_SPEC.md` di root project untuk memahami konteks lengkap project.

## 2. Identifikasi Module yang Terkait
Berdasarkan task yang diminta, identifikasi module mana yang terlibat:
- Auth & User Management
- Event Management
- Ticketing
- Booking & Checkout
- Payment
- Check-in
- Financial
- Organizer Panel
- Admin Panel
- Customer Frontend
- dst.

## 3. Cek Dokumentasi Terkait
Baca dokumentasi yang relevan:
- `PRD_v2.md` - Untuk detail fitur dan requirements
- `ERD_v2.md` - Untuk database schema
- `API_SPEC.md` - Untuk API endpoints

## 4. Identifikasi Dependencies
Cek apakah task membutuhkan:
- Database migration baru?
- API endpoint baru?
- Component baru?
- External integration?

## 5. Query Context7 untuk Library Documentation
**PENTING!** Gunakan MCP Context7 untuk mendapatkan dokumentasi terbaru dari library yang akan digunakan.

### Library IDs yang sering digunakan:
| Library | Context7 ID |
|---------|-------------|
| Next.js | `/vercel/next.js` |
| Supabase | `/supabase/supabase` |
| Prisma | `/prisma/docs` |
| TanStack Query | `/tanstack/query` |
| React Hook Form | `/react-hook-form/react-hook-form` |
| Zod | `/colinhacks/zod` |
| Tailwind CSS | `/tailwindlabs/tailwindcss.com` |
| shadcn/ui | `/shadcn-ui/ui` |
| Inngest | `/inngest/inngest` |
| Resend | `/resend/resend-node` |
| Upstash Redis | `/upstash/docs` |

### Cara Query:
```
mcp_context7_query-docs
- libraryId: "/vercel/next.js"
- query: "Pertanyaan spesifik tentang implementasi"
```

## 6. Rencanakan Implementasi
Buat rencana langkah-langkah implementasi sebelum coding.

## 7. Mulai Implementasi
Ikuti urutan:
1. Database schema (jika perlu)
2. API routes
3. Frontend components/pages
4. Testing considerations
