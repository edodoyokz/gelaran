---
description: Langkah membuat fitur baru di project BSC
---

# Create Feature Workflow

## 1. Analisis Requirements
- Baca section terkait di `PRD_v2.md`
- Identifikasi user stories dan acceptance criteria
- Identifikasi user persona yang terlibat

## 2. Query Context7 untuk Dokumentasi Library
**PENTING!** Sebelum implementasi, query dokumentasi library yang akan digunakan.

### Contoh Query:
```
# Untuk fitur dengan Supabase Auth
mcp_context7_query-docs
- libraryId: "/supabase/supabase"
- query: "How to implement [specific feature]"

# Untuk Next.js App Router
mcp_context7_query-docs
- libraryId: "/vercel/next.js"
- query: "Server actions with form handling"

# Untuk Prisma transactions
mcp_context7_query-docs
- libraryId: "/prisma/docs"
- query: "Interactive transactions with error handling"
```

## 3. Database Schema
- Cek `ERD_v2.md` untuk entitas yang dibutuhkan
- Jika perlu schema baru:
  ```bash
  # Edit prisma/schema.prisma
  # Run migration
  pnpm prisma migrate dev --name nama_fitur
  ```

## 4. API Development
- Cek `API_SPEC.md` untuk endpoint yang dibutuhkan
- Buat Zod validation schema di `lib/validators/`
- Implementasi API route di `app/api/`

## 5. Frontend Development
- Buat component di `components/features/`
- Buat page di `app/(group)/`
- Gunakan shadcn/ui components
- Pastikan responsive design

### Query Context7 untuk UI Components:
```
mcp_context7_query-docs
- libraryId: "/shadcn-ui/ui"
- query: "Dialog component with form"
```

## 6. Integration
- Connect frontend ke API menggunakan TanStack Query
- Handle loading states dan error states
- Implement optimistic updates jika applicable

### Query Context7 untuk TanStack Query:
```
mcp_context7_query-docs
- libraryId: "/tanstack/query"
- query: "useMutation with optimistic updates"
```

## 7. Testing Considerations
- List test cases
- Edge cases yang perlu dihandle
- Error scenarios

## 8. Documentation
- Update API documentation jika ada perubahan
- Add JSDoc comments untuk functions kompleks
