# 🤖 Agent Instructions

> **📅 Tanggal**: 9 Januari 2026  
> **🕐 Timezone**: Asia/Jakarta (WIB, UTC+7)

---

## 📋 Tentang Dokumen Ini

File ini adalah **entry point** untuk AI Agent/LLM yang bekerja di project ini. Baca dokumen ini terlebih dahulu sebelum mengerjakan task apapun.

---

## 🎯 Project: BSC Event Ticketing Platform

Platform manajemen acara dan penjualan tiket berbasis web untuk pasar Indonesia.

### Quick Facts
| Parameter | Nilai |
|-----------|-------|
| **Tech Stack** | Next.js 16, TypeScript, Supabase, Prisma, Tailwind CSS |
| **Target** | Indonesia (IDR, Midtrans, Xendit) |
| **Status** | Development Phase |

---

## 📚 Dokumentasi Utama

Baca dokumen-dokumen ini sebelum mulai bekerja:

| Prioritas | File | Deskripsi |
|-----------|------|-----------|
| ⭐⭐⭐ | `LLM_SPEC.md` | **Spesifikasi lengkap untuk LLM** - Baca ini! |
| ⭐⭐ | `PRD_v2.md` | Product Requirements Document |
| ⭐⭐ | `ERD_v2.md` | Database Schema (Entity Relationship Diagram) |
| ⭐⭐ | `API_SPEC.md` | API Endpoints Specification |

---

## 🛠️ MCP Tools yang Tersedia

### 1. Context7 - Dokumentasi Library (PRIORITAS UTAMA!)

**SELALU gunakan Context7** untuk mendapatkan dokumentasi terbaru dari library.

#### Library IDs yang Sering Digunakan:
```
Next.js          → /vercel/next.js
Supabase         → /supabase/supabase
Prisma           → /prisma/docs
TanStack Query   → /tanstack/query
React Hook Form  → /react-hook-form/react-hook-form
Zod              → /colinhacks/zod
Tailwind CSS     → /tailwindlabs/tailwindcss.com
shadcn/ui        → /shadcn-ui/ui
Inngest          → /inngest/inngest
Resend           → /resend/resend-node
Upstash Redis    → /upstash/docs
```

#### Cara Menggunakan:

**Step 1**: Resolve library ID (jika belum tahu)
```
mcp_context7_resolve-library-id
- libraryName: "nama library"
- query: "apa yang ingin dicari"
```

**Step 2**: Query dokumentasi
```
mcp_context7_query-docs
- libraryId: "/org/project"
- query: "pertanyaan spesifik"
```

#### Contoh Query yang Baik:
- ✅ "How to implement server-side authentication with cookies in Next.js App Router"
- ✅ "Prisma interactive transactions with error handling"
- ✅ "useMutation with optimistic updates and rollback"
- ❌ "auth" (terlalu pendek)
- ❌ "how to use" (terlalu umum)

### 2. Exa Search - Web & Code Search

```
mcp_exa_web_search_exa      → Cari artikel/tutorial
mcp_exa_get_code_context_exa → Cari contoh kode real-world
```

### 3. Sequential Thinking - Problem Solving

```
mcp_sequential-thinking_sequentialthinking → Pecahkan masalah kompleks step-by-step
```

---

## 📂 Workflows yang Tersedia

Gunakan workflows ini untuk memudahkan pekerjaan:

| Command | File | Deskripsi |
|---------|------|-----------|
| `/start-task` | `.agent/workflows/start-task.md` | Persiapan sebelum mulai task |
| `/create-feature` | `.agent/workflows/create-feature.md` | Panduan membuat fitur baru |

---

## ✅ Checklist Sebelum Mengerjakan Task

- [ ] Sudah baca `LLM_SPEC.md`?
- [ ] Sudah identifikasi module yang terlibat?
- [ ] Sudah cek dokumentasi terkait (PRD/ERD/API)?
- [ ] Sudah query Context7 untuk library yang digunakan?
- [ ] Sudah paham business flow yang terkait?
- [ ] Sudah pertimbangkan edge cases & security?

---

## 🏗️ Project Structure

```
bsc-platform/
├── app/                    # Next.js App Router
│   ├── (auth)/            # Auth routes
│   ├── (customer)/        # Customer frontend
│   ├── organizer/         # Organizer dashboard
│   ├── admin/             # Admin panel
│   └── api/               # API Routes
├── components/            # React components
│   ├── ui/               # shadcn/ui
│   └── features/         # Feature components
├── lib/                   # Utilities
│   ├── supabase/         # Supabase client
│   ├── prisma/           # Prisma client
│   └── validators/       # Zod schemas
├── prisma/               # Database
└── types/                # TypeScript types
```

---

## 📝 Coding Conventions

### Naming
| Type | Convention | Example |
|------|------------|---------|
| Components | PascalCase | `EventCard.tsx` |
| Utils | kebab-case | `format-currency.ts` |
| Functions | camelCase | `createBooking()` |
| Constants | SCREAMING_SNAKE | `MAX_TICKETS` |
| DB Tables | SCREAMING_SNAKE | `BOOKED_TICKETS` |

### Best Practices
- TypeScript strict mode (no `any`)
- Zod for all validation
- Path aliases (`@/components/...`)
- Server Components by default
- Atomic commits with conventional format

---

## ⚠️ Hal Penting yang Harus Diingat

### 1. Concurrency Control
- Seat locking → Redis dengan TTL 15 menit
- Stock management → Optimistic locking

### 2. Payment Security
- JANGAN log credit card data
- Verify webhook signatures
- Use official payment gateway SDK

### 3. Indonesian Localization
- Currency: `Rp 1.000.000`
- Timezone: `Asia/Jakarta`
- Date: `DD MMMM YYYY`

### 4. Mobile First
- Semua UI harus responsive
- QR scanner harus work di mobile

---

## 🚀 Quick Commands

```bash
# Development
pnpm dev                    # Start dev server
pnpm build                  # Production build
pnpm lint                   # Run linter

# Database
pnpm prisma generate        # Generate Prisma client
pnpm prisma migrate dev     # Run migrations
pnpm prisma studio          # Open Prisma Studio

# Background Jobs
pnpm inngest-dev            # Start Inngest dev server
```

---

## 📞 Ketika Butuh Bantuan

1. **Dokumentasi library tidak jelas** → Query Context7 dengan pertanyaan lebih spesifik
2. **Butuh contoh real-world** → Gunakan Exa Code Search
3. **Masalah kompleks** → Gunakan Sequential Thinking
4. **Tidak yakin dengan requirement** → Baca PRD_v2.md
5. **Tidak yakin dengan schema** → Baca ERD_v2.md
6. **Tidak yakin dengan API** → Baca API_SPEC.md

---

*Dokumen ini adalah entry point untuk AI Agent. Untuk dokumentasi lengkap, baca `LLM_SPEC.md`.*

---

**Last Updated**: 9 Januari 2026  
**Version**: 1.0
