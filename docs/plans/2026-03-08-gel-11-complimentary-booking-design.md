# GEL-11 Complimentary Booking Hardening Design

**Date:** 2026-03-08
**Status:** Approved
**Related Linear Issue:** `GEL-11`

## Context

Platform ini sedang berada pada fase beta dengan alur tiket gratis/complimentary lebih dulu, sementara integrasi payment gateway ditunda sampai setelah beta testing. Karena itu, alur complimentary harus diperlakukan sebagai business-critical path: aman dari duplikasi, konsisten saat approval, dan mudah diaudit oleh admin maupun organizer.

Saat ini organizer dapat membuat `PENDING` complimentary request, lalu admin dapat `APPROVE` atau `REJECT`. Pada approval, sistem langsung membuat booking complimentary dan menerbitkan tiket. Celah utamanya ada pada idempotensi, race condition approval, serta aturan duplikasi guest yang belum eksplisit sebagai policy sistem.

## Goals

- Menetapkan aturan state dan transisi complimentary request secara eksplisit.
- Mencegah duplicate request dan duplicate ticket issuance untuk guest yang sama pada event yang sama.
- Memastikan approval aman terhadap concurrency dan stale quota.
- Meningkatkan visibilitas organizer/admin terhadap hasil review dan issuance.
- Membuat failure mode mudah diuji dan mudah diaudit.

## Non-Goals

- Menambahkan payment gateway.
- Mendesain ulang checkout berbayar.
- Menambah lifecycle status besar seperti `ISSUED`, `FAILED`, atau `CANCELLED` pada fase ini.
- Mengubah struktur domain lebih besar dari yang dibutuhkan untuk beta complimentary flow.

## Considered Approaches

### Approach A — Minimal patch di route approval
Tambah guard duplicate dan idempotensi langsung di route admin approval.

**Pros**
- Cepat diimplementasikan.
- Risiko perubahan kecil.

**Cons**
- Aturan bisnis tetap tersebar.
- Sulit dites secara terisolasi.
- Sulit dipakai ulang saat organizer create flow juga perlu guard yang sama.

### Approach B — Service terpusat untuk complimentary flow (**Recommended**)
Pindahkan aturan bisnis complimentary request/review/issuance ke helper/service domain tunggal, sementara route organizer/admin menjadi tipis.

**Pros**
- Satu sumber kebenaran untuk validasi dan state transition.
- Lebih mudah dibuat test yang fokus dan deterministik.
- Mudah diperluas nanti saat masuk fase post-beta/payment.

**Cons**
- Perubahan sedikit lebih besar dibanding patch minimal.

### Approach C — Redesign status lengkap
Menambah status baru seperti `ISSUED`, `FAILED`, `CANCELLED`, dan memisahkan review state dari issuance state.

**Pros**
- Model domain paling ekspresif.

**Cons**
- Terlalu besar untuk fase fondasi beta.
- Membuka scope creep tanpa kebutuhan mendesak.

## Recommended Design

Gunakan **Approach B**: buat service complimentary flow terpusat untuk mengatur duplicate policy, transition guard, availability recheck, dan issuance transaction. Model status database tetap `PENDING`, `APPROVED`, `REJECTED` agar perubahan tetap ramping, tetapi invariants issuance dibuat eksplisit di service layer.

## Business Rules

### 1. Request lifecycle
- Request baru dibuat dengan status `PENDING`.
- `PENDING -> APPROVED` valid, hanya jika issuance belum pernah terjadi dan quota masih cukup.
- `PENDING -> REJECTED` valid.
- `APPROVED -> REJECTED` tidak valid.
- `REJECTED -> APPROVED` tidak valid.
- Request non-`PENDING` yang direview ulang harus ditolak sebagai conflict.

### 2. Duplicate guest policy
Untuk kombinasi `eventId + guestEmail`:
- Request baru **ditolak** jika masih ada request `PENDING`.
- Request baru **ditolak** jika sudah ada request `APPROVED` atau complimentary booking yang sudah terbit.
- Request baru **boleh** jika request sebelumnya `REJECTED`.

### 3. Issuance invariants
- Satu `ComplimentaryTicketRequest` hanya boleh punya maksimal satu booking complimentary.
- Approval ulang pada request yang sama tidak boleh membuat booking/tiket dobel.
- Sebelum menerbitkan tiket, sistem harus mengecek ulang booking existing berdasarkan `complimentaryRequestId`.
- Sebelum menerbitkan tiket, sistem harus mengecek ulang ketersediaan quota di dalam transaction.

### 4. Visibility
Organizer dan admin harus bisa melihat:
- status request
- reviewer, waktu review, dan catatan review
- booking result terakhir jika ada (`bookingId`, `bookingCode`, `bookingStatus`)
- alasan kegagalan approval jika quota berubah atau issuance conflict

## Technical Design

### Domain service
Tambahkan helper/service, misalnya di `lib/complimentary/flow.ts`, untuk fungsi-fungsi berikut:
- validasi duplicate request per `eventId + guestEmail`
- validasi state transition review
- approval transaction dengan recheck quota dan duplicate issuance guard
- helper response mapper untuk status review + issuance summary

### Organizer create flow
Route `app/api/organizer/events/[id]/complimentary-requests/route.ts` tetap menerima payload yang sama, tetapi sebelum create harus memanggil duplicate-request policy. Jika conflict, kembalikan `409` dengan pesan yang jelas.

### Admin review flow
Route `app/api/admin/complimentary-requests/[requestId]/route.ts` harus:
- membaca request terbaru
- menolak review jika status bukan `PENDING`
- saat approve, melakukan transaction yang:
  - memeriksa kembali apakah booking untuk request ini sudah ada
  - memeriksa ulang quota semua item
  - update status request ke `APPROVED`
  - membuat satu booking complimentary
  - membuat booked tickets
  - increment sold quantity
  - membuat notification dan audit log
- saat reject, update status request ke `REJECTED`, simpan metadata review, buat notification dan audit log

### Listing payloads
Route list organizer/admin cukup diperkaya agar frontend dapat menampilkan ringkasan issuance tanpa query tambahan. Tidak perlu redesign UI besar di tahap ini; cukup pastikan data siap dipakai.

## Error Handling

Gunakan error yang eksplisit dan stabil:
- `400` untuk validation error payload
- `401/403` untuk auth/authz
- `404` untuk request tidak ditemukan
- `409` untuk duplicate request, invalid transition, duplicate issuance, atau quota conflict saat approval
- `500` hanya untuk error tak terduga

Semua review outcome penting harus masuk audit log agar operasional bisa menelusuri masalah.

## Testing Strategy

Fokus test pada aturan domain dan approval flow:
- request baru ditolak jika ada `PENDING` request untuk `event + guestEmail` yang sama
- request baru ditolak jika sudah ada complimentary booking aktif untuk `event + guestEmail` yang sama
- request baru boleh jika request sebelumnya `REJECTED`
- approve dua kali tidak membuat booking/tiket ganda
- reject setelah approve gagal
- approve setelah reject gagal
- approval gagal bila quota berubah dan tidak cukup
- response list organizer/admin memuat summary review dan booking

## Delivery Notes

Implementasi harus TDD-first, minimal, dan tidak menyentuh alur pembayaran berbayar. Integrasi payment gateway akan dilakukan setelah beta, jadi complimentary flow harus menjadi jalur beta yang stabil, audit-friendly, dan idempotent.
