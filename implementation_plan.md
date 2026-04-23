# UI Audit & Refactor — Halaman vs Stitch Designs

## Ringkasan

Setelah mengaudit seluruh **74 halaman aktual** vs **80 desain stitch**, ditemukan:

- ✅ **Halaman sudah selesai dioverhaul** (sesuai task.md)
- ⚠️ **Halaman yang perlu dikonfirmasi kesesuaian** dengan desain stitch meski tandanya "selesai"
- ❌ **Halaman tanpa desain stitch** — perlu desain baru atau tetap mengikuti design system yang ada
- 🔴 **Halaman yang jelas belum sesuai** desain stitch

---

## Matriks Perbandingan Lengkap

| Halaman Aktual | Desain Stitch | Status |
|---|---|---|
| `/` (Landing) | Gelaran - White Theme Landing Page | ✅ Sudah overhaul |
| `/login` | Gelaran - Desktop Login | ✅ Sudah overhaul |
| `/register` | Gelaran - Desktop Registration | ✅ Sudah overhaul |
| `/forgot-password` | Forgot Password - Gelaran | ✅ Sudah overhaul |
| `/reset-password` | Reset Password - Gelaran | ✅ Sudah overhaul |
| `/about` | About Gelaran (3 varian) | ✅ Overhaul sebelumnya |
| `/contact` | Contact Us - Gelaran | ✅ Overhaul sebelumnya |
| `/events` | Events Listing (Light/Dark Mode) | ✅ Overhaul sebelumnya |
| `/events/[slug]` | Gelaran - Event Detail Light Mode | ✅ Overhaul sebelumnya |
| `/checkout` | Gelaran - Checkout | ✅ Overhaul sebelumnya |
| `/checkout/success` | Checkout Success - Gelaran | ✅ Overhaul sebelumnya |
| `/checkout/failed` | Checkout Failed - Gelaran | ✅ Overhaul sebelumnya |
| `/checkout/pending` | Checkout Pending - Gelaran | ✅ Overhaul sebelumnya |
| `/dashboard` | Gelaran - Customer Dashboard | ✅ Overhaul sebelumnya |
| `/my-bookings` | My Bookings - Gelaran | ✅ Overhaul sebelumnya |
| `/organizer` | Organizer Dashboard - Gelaran | ✅ Overhaul sebelumnya |
| `/organizer/events` | Organizer Event Listings | ✅ Overhaul sebelumnya |
| `/organizer/events/new` | Create & Edit Event - Gelaran Curator | ✅ Overhaul sebelumnya |
| `/organizer/events/[id]` | Organizer Event Details | ✅ Overhaul sebelumnya |
| `/organizer/wallet` | Organizer Wallet - Gelaran | ✅ Overhaul sebelumnya |
| `/organizer/settings` | Organizer Settings | ✅ Overhaul sebelumnya |
| `/organizer/team` | Organizer Team Management | ✅ Overhaul sebelumnya |
| `/admin` | Gelaran - Admin Dashboard Desktop | ✅ Overhaul sebelumnya |
| `/admin/events` | Admin Events Management | ✅ Overhaul sebelumnya |
| `/admin/users` | Admin User Management - Gelaran | ✅ Overhaul sebelumnya |
| `/gate` | Gate Check-in - Gelaran | ✅ Overhaul sebelumnya |
| `/gate/access` | Gate Access Terminal - Gelaran | ✅ Overhaul sebelumnya |
| `/scanner` | Gelaran Scanner Utility | ✅ Overhaul sebelumnya |
| `/pos` | Gelaran POS Terminal | ✅ Overhaul sebelumnya |
| `/pos/access` | Gelaran POS Access - Desktop Light | ✅ Overhaul sebelumnya |
| **`/following`** | Following - Gelaran Cultural Discovery | ⚠️ **PERLU CEK** |
| **`/notifications`** | Notifications - Gelaran | ⚠️ **PERLU CEK** |
| **`/wishlist`** | Wishlist - Gelaran | ⚠️ **PERLU CEK** |
| **`/profile`** | Customer Profile Settings | ⚠️ **PERLU CEK** |
| **`/become-organizer`** | Become an Organizer - Gelaran | ⚠️ **PERLU CEK** |
| **`/organizers/[slug]`** | Organizer Profile - SoloCurator | ⚠️ **PERLU CEK** |
| **`/admin/analytics`** | Admin Executive Analytics | ⚠️ **PERLU CEK** |
| **`/admin/bookings`** | Admin Bookings Management | ⚠️ **PERLU CEK** |
| **`/admin/categories`** | Admin Category Management | ⚠️ **PERLU CEK** |
| **`/admin/complimentary-requests`** | Admin Complimentary Requests | ⚠️ **PERLU CEK** |
| **`/admin/finance`** | Admin Finance Console | ⚠️ **PERLU CEK** |
| **`/admin/landing-page`** | Landing Page Manager - Gelaran Admin | ⚠️ **PERLU CEK** |
| **`/admin/refunds`** | Admin Refund Management | ⚠️ **PERLU CEK** |
| **`/admin/reviews`** | Admin Review Moderation | ⚠️ **PERLU CEK** |
| **`/admin/venues`** | Admin Venue Management | ⚠️ **PERLU CEK** |
| **`/admin/settings`** | Gelaran Admin Settings | ⚠️ **PERLU CEK** |
| `/my-bookings/[code]` | ❌ Tidak ada desain spesifik | Ikuti design system |
| `/my-bookings/[code]/refund` | ❌ Tidak ada desain | Ikuti design system |
| `/my-bookings/[code]/ticket` | ❌ Tidak ada desain | Ikuti design system |
| `/tickets/transfer/accept` | ❌ Tidak ada desain | Ikuti design system |
| `/privacy` | ❌ Tidak ada desain | Ikuti design system |
| `/terms` | ❌ Tidak ada desain | Ikuti design system |
| `/events/[slug]/faq` | ❌ Tidak ada desain | Ikuti design system |
| `/organizer/events/[id]/analytics` | ❌ Tidak ada desain | Ikuti design system |
| `/organizer/events/[id]/attendees` | ❌ Tidak ada desain | Ikuti design system |
| `/organizer/events/[id]/promo-codes` | ❌ Tidak ada desain | Ikuti design system |
| `/organizer/events/[id]/seating` | ❌ Tidak ada desain | Ikuti design system |
| `/organizer/events/[id]/gate` | ❌ Tidak ada desain | Ikuti design system |
| `/organizer/events/[id]/faq` | ❌ Tidak ada desain | Ikuti design system |
| `/organizer/wallet/bank-account` | ❌ Tidak ada desain | Ikuti design system |
| `/organizer/wallet/withdraw` | ❌ Tidak ada desain | Ikuti design system |
| `/organizer/gate` | ❌ Tidak ada desain | Ikuti design system |
| `/admin/bookings/[id]` | ❌ Tidak ada desain | Ikuti design system |
| `/admin/events/[id]` | ❌ Tidak ada desain | Ikuti design system |
| `/admin/users/[id]` | ❌ Tidak ada desain | Ikuti design system |
| `/admin/payouts` | Admin Payouts Management | ⚠️ PERLU CEK |
| `/docs/*` | Help Center - Gelaran | 🔶 Prioritas rendah |

---

## Proposed Changes

### Phase 1: Customer Pages (Prioritas Tinggi)

Halaman customer yang sudah ada desain stitch tapi belum dikonfirmasi visual parity:

#### [MODIFY] [following/page.tsx](file:///home/luckyn00b/Documents/PROJECT/BSC-FINAL/app/following/page.tsx)
- Sesuaikan dengan desain `Following - Gelaran Cultural Discovery.png`
- Tambahkan hero styling editorial yang lebih bold
- Grid organizer cards dengan layout yang lebih premium
- Hapus pemakaian `alert()` native, ganti dengan toast/feedback inline

#### [MODIFY] [(customer)/profile/page.tsx](file:///home/luckyn00b/Documents/PROJECT/BSC-FINAL/app/(customer)/profile/page.tsx)
- Sesuaikan dengan `Customer Profile Settings.png`
- Form settings dengan layout split (sidebar + content)

#### [MODIFY] [(customer)/wishlist/page.tsx](file:///home/luckyn00b/Documents/PROJECT/BSC-FINAL/app/(customer)/wishlist/page.tsx)
- Sesuaikan dengan `Wishlist - Gelaran.png`
- Grid cards event dengan aksi remove yang jelas

#### [MODIFY] [notifications/page.tsx](file:///home/luckyn00b/Documents/PROJECT/BSC-FINAL/app/notifications/page.tsx)
- Sesuaikan dengan `Notifications - Gelaran.png`
- Timeline style notifications feed

---

### Phase 2: Public Pages (Prioritas Tinggi)

#### [MODIFY] [become-organizer/page.tsx](file:///home/luckyn00b/Documents/PROJECT/BSC-FINAL/app/become-organizer/page.tsx)
- Sesuaikan dengan `Become an Organizer - Gelaran.png`
- Landing page persuasive dengan CTA jelas

#### [MODIFY] [organizers/[slug]/page.tsx](file:///home/luckyn00b/Documents/PROJECT/BSC-FINAL/app/organizers/[slug]/page.tsx)
- Sesuaikan dengan `Organizer Profile - SoloCurator.png`
- Profile header, event grid, follow button

---

### Phase 3: Admin Sub-Pages (Prioritas Menengah)

Semua halaman admin berikut perlu dikonfirmasi visual dengan desain stitch:

#### [MODIFY] [admin/analytics/page.tsx](file:///home/luckyn00b/Documents/PROJECT/BSC-FINAL/app/admin/analytics/page.tsx)
→ `Admin Executive Analytics.png`

#### [MODIFY] [admin/bookings/page.tsx](file:///home/luckyn00b/Documents/PROJECT/BSC-FINAL/app/admin/bookings/page.tsx)
→ `Admin Bookings Management.png`

#### [MODIFY] [admin/categories/page.tsx](file:///home/luckyn00b/Documents/PROJECT/BSC-FINAL/app/admin/categories/page.tsx)
→ `Admin Category Management.png`

#### [MODIFY] [admin/complimentary-requests/page.tsx](file:///home/luckyn00b/Documents/PROJECT/BSC-FINAL/app/admin/complimentary-requests/page.tsx)
→ `Admin Complimentary Requests.png`

#### [MODIFY] [admin/finance/page.tsx](file:///home/luckyn00b/Documents/PROJECT/BSC-FINAL/app/admin/finance/page.tsx)
→ `Admin Finance Console.png`

#### [MODIFY] [admin/landing-page/page.tsx](file:///home/luckyn00b/Documents/PROJECT/BSC-FINAL/app/admin/landing-page/page.tsx)
→ `Landing Page Manager - Gelaran Admin.png`

#### [MODIFY] [admin/refunds/page.tsx](file:///home/luckyn00b/Documents/PROJECT/BSC-FINAL/app/admin/refunds/page.tsx)
→ `Admin Refund Management.png`

#### [MODIFY] [admin/reviews/page.tsx](file:///home/luckyn00b/Documents/PROJECT/BSC-FINAL/app/admin/reviews/page.tsx)
→ `Admin Review Moderation.png`

#### [MODIFY] [admin/venues/page.tsx](file:///home/luckyn00b/Documents/PROJECT/BSC-FINAL/app/admin/venues/page.tsx)
→ `Admin Venue Management.png`

#### [MODIFY] [admin/settings/page.tsx](file:///home/luckyn00b/Documents/PROJECT/BSC-FINAL/app/admin/settings/page.tsx)
→ `Gelaran Admin Settings.png`

#### [MODIFY] [admin/payouts/page.tsx](file:///home/luckyn00b/Documents/PROJECT/BSC-FINAL/app/admin/payouts/page.tsx)
→ `Admin Payouts Management.png`

---

### Phase 4: Halaman Tanpa Desain Stitch (Prioritas Rendah)

Halaman-halaman berikut tidak memiliki desain stitch. Pengembangan mengikuti **design system yang sudah ada** (CSS variables, component primitives) tanpa referensi spesifik:

- `/my-bookings/[code]` — detail booking dengan tiket QR
- `/my-bookings/[code]/refund` — form refund request
- `/my-bookings/[code]/ticket` — tampilan tiket digital
- `/tickets/transfer/accept` — accept ticket transfer
- `/privacy` & `/terms` — legal pages editorial
- `/events/[slug]/faq` — FAQ accordion di event detail
- `/organizer/events/[id]/analytics` — analitik event organizer
- `/organizer/events/[id]/attendees` — list peserta
- `/organizer/events/[id]/promo-codes` — manajemen promo
- `/organizer/events/[id]/seating` — layout kursi
- `/organizer/events/[id]/gate` — gate management per event
- `/organizer/wallet/bank-account` & `/withdraw` — wallet operations
- `/organizer/gate` — dashboard gate organizer
- `/admin/bookings/[id]` & `/admin/events/[id]` & `/admin/users/[id]` — detail views

---

## Verification Plan

### Visual Comparison (Browser-based)

Untuk setiap halaman yang dimodifikasi, lakukan verifikasi visual dengan membuka browser:

```bash
# Dev server sudah running via npm run dev
# Buka browser ke http://localhost:3000
```

**Langkah verifikasi setiap halaman:**
1. Buka halaman di browser (`http://localhost:3000/<route>`)
2. Buka file PNG desain stitch di `stitch-designs/` sebagai referensi
3. Bandingkan: layout, typography, warna, spacing, komponen

### Checklist Kesesuaian Visual

Setiap halaman dinyatakan ✅ sesuai jika memenuhi kriteria:
- [ ] Menggunakan CSS variables `--accent-primary`, `--surface`, `--border`, dll
- [ ] Typography mengikuti sistem (font weight, size, tracking)
- [ ] Dark/Light mode berfungsi dengan benar
- [ ] Border radius, shadow, spacing konsisten dengan design system
- [ ] Tidak ada hardcoded colors (hex, rgb, named colors) di luar design system
