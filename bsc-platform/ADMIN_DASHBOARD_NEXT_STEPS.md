# Admin Dashboard — Next Steps Plan

Tanggal: 2026-01-14

Dokumen ini menyimpan rencana lanjutan setelah implementasi **Admin Shell** (layout + sidebar) dan **Toast/Confirm**.

## State Saat Ini (Done)
- Admin shell terpadu:
  - `app/admin/layout.tsx`
  - `components/admin/AdminSidebar.tsx`
- Admin providers:
  - `components/admin/AdminProviders.tsx`
  - `components/ui/toast-provider.tsx`
  - `components/ui/confirm-provider.tsx`
- Header tidak flicker (profile dari server layout):
  - `components/admin/AdminProfileProvider.tsx`
  - `components/admin/AdminHeader.tsx`
- Build lulus: `npm run build`

## Target Outcome (Kenapa Ini Penting)
Admin area harus terasa seperti “control center”:
- Konsisten (layout, spacing, header, feedback)
- Cepat (tidak fetch semua data untuk table besar)
- Aman (aksi destructive selalu terkonfirmasi)
- Scalable (pagination, filter, search via query params)

## Next Steps (Prioritas)

### P0 — Data Product untuk halaman list besar
**Scope**: `Events`, `Bookings`, `Payouts` (minimal)

1) Server-side pagination + filter + search
- Implement query params: `page`, `q`, `status`, `dateFrom`, `dateTo`.
- Update API agar menerima parameter dan mengembalikan `pagination` metadata.
- Update UI toolbar agar mendorong filter yang sama.

**Acceptance Criteria**
- Tidak ada lagi pola “fetch semua lalu filter di client” untuk dataset besar.
- Navigasi page/filter tetap shareable (URL mengandung query params).
- Response API konsisten: `{ items, pagination: { page, pageSize, total, totalPages } }`.

2) List UI: table yang lebih profesional
- Empty state yang designed, loading skeleton per table.
- Aksi per row (view/approve/reject) dengan toast + confirm.


### P1 — Konsolidasi komponen UI admin (mengurangi duplikasi)
**Scope**: shared components untuk admin

- `StatusBadge` (warna + label konsisten)
- `DataToolbar` (Search + Filter + actions)
- `EmptyState`
- `Skeleton` (untuk page/table)

**Acceptance Criteria**
- Minimal 3 admin pages memakai komponen shared yang sama.
- Warna/status label konsisten lintas halaman.


### P2 — Mobile UX Admin (drawer)
Saat ini sidebar fixed + `pl-64`.

- Tambahkan mode mobile: hamburger untuk membuka sidebar sebagai drawer.
- Pastikan focus/scroll lock saat drawer open.

**Acceptance Criteria**
- Admin usable di layar kecil tanpa horizontal scroll.
- Sidebar bisa dibuka/tutup dengan keyboard.


### P3 — Dashboard `/admin` jadi “Action Inbox”
**Scope**: menambah panel tindakan & ringkasan yang actionable

- “Urgent actions”: pending payouts, pending event review, refund requests.
- “Health metrics”: revenue, successful payments, failed payments, active events.
- Recent activity dengan status chips + quick actions.

**Acceptance Criteria**
- Admin bisa menyelesaikan 80% tugas rutin dari dashboard tanpa hunting menu.


## Non-goals (untuk menjaga scope)
- Tidak menambah dependency chart library dulu.
- Tidak refactor business logic besar.
- Tidak ubah permission model.

## Risiko & Catatan Teknis
- Pastikan provider (Toast/Confirm/AdminProfile) hanya dipasang di admin layout.
- Perubahan API pagination perlu menyesuaikan UI tanpa breaking behavior.
- Jika ada warning `middleware` deprecated: gunakan `proxy.ts` (sudah ada di repo). Hindari menambah `middleware.ts` baru.

## Checklist Verifikasi (setiap milestone)
- `npm run build`
- Navigasi: sidebar active state benar untuk nested routes
- Confirm dialog: Esc close + click overlay close
- Toast: multiple messages berurutan tidak overlap secara merusak
- URL query params: back/forward browser bekerja
