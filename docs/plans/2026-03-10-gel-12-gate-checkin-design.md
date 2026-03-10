# GEL-12 Gate Check-In Stabilization Design

**Date:** 2026-03-10
**Status:** Approved
**Related Linear Issue:** `GEL-12`

## Context

Flow gate check-in Gelaran saat ini sudah memiliki endpoint scan dan UI operator, tetapi aturan bisnis check-in masih tertanam langsung di route API dan hasil scan di UI masih terlalu generik. Untuk fase beta, gate flow harus aman untuk repeated scan, mudah dipahami operator, dan memiliki jejak audit yang cukup saat tiket invalid, salah event, atau sudah dipakai.

Saat ini `app/api/gate/check-in/route.ts` sudah membedakan beberapa hasil seperti `INVALID`, `WRONG_EVENT`, dan `ALREADY_CHECKED_IN`, tetapi:
- log check-in hanya dicatat untuk success
- validasi dan pemetaan result tersebar di route
- UI operator di `app/gate/page.tsx` memetakan hasil scan dengan logika yang berulang antara manual input dan QR scan
- feedback device/session bermasalah belum diekspresikan sebagai result operator yang stabil

## Goals

- Menstabilkan hasil check-in agar repeated scan dan invalid scan menghasilkan outcome yang konsisten.
- Menyediakan feedback operator yang jelas untuk sukses, sudah check-in, tiket invalid, tiket event lain, dan akses gate yang tidak valid.
- Menambah auditability untuk hasil scan penting, bukan hanya check-in sukses.
- Menyatukan mapping hasil check-in agar manual input dan QR scanner memakai perilaku yang sama.

## Non-Goals

- Mendesain ulang flow gate access secara penuh.
- Menambahkan offline mode sungguhan.
- Mengubah arsitektur QR generation atau tiket PDF.
- Membangun dashboard audit baru untuk gate.

## Considered Approaches

### Approach A — Patch route dan UI langsung
Tambahkan beberapa error code baru di route, lalu perbaiki mapping di page gate.

**Pros**
- Cepat.
- Perubahan kecil.

**Cons**
- Aturan check-in tetap tersebar.
- Sulit dites secara terisolasi.
- Risiko inkonsistensi saat flow scanner/manual berkembang.

### Approach B — Service check-in terpusat + UI result mapping (**Recommended**)
Pindahkan aturan bisnis dan result mapping backend ke helper domain kecil, lalu buat UI gate memakai hasil yang stabil dan satu mapper operator.

**Pros**
- Satu sumber kebenaran untuk outcome check-in.
- Lebih mudah diuji.
- Memudahkan audit dan operator feedback yang konsisten.

**Cons**
- Perubahan sedikit lebih luas daripada patch kecil.

### Approach C — Redesign gate flow penuh
Redesign gate access, scanner state, audit panel, dan fallback offline.

**Pros**
- Solusi paling lengkap.

**Cons**
- Scope terlalu besar untuk blocker beta.
- Berisiko menunda penutupan issue release-blocker.

## Recommended Design

Gunakan **Approach B**. Buat helper/service kecil di layer `lib/gate/` untuk mengelola validasi session/device, lookup ticket, evaluasi result scan, dan logging scan result. Route API menjadi tipis, sementara UI gate memakai result code backend yang konsisten melalui mapper presentasi tunggal.

## Backend Design

### Gate check-in service
Tambahkan helper/service, misalnya `lib/gate/check-in.ts`, yang menangani:
- membaca dan memvalidasi `deviceToken`
- memastikan `deviceAccess` aktif
- memastikan session bertipe `GATE` dan aktif
- normalisasi `ticketCode`
- lookup ticket dan booking terkait
- evaluasi outcome scan
- update `bookedTicket` saat sukses
- pencatatan log scan untuk outcome penting

### Result contract
Gunakan hasil yang eksplisit dan stabil:
- `SUCCESS`
- `ALREADY_CHECKED_IN`
- `INVALID`
- `WRONG_EVENT`
- `ACCESS_DENIED`
- `SESSION_INACTIVE`

Catatan:
- `INVALID` mencakup tiket tidak ditemukan atau booking belum valid untuk check-in.
- `ACCESS_DENIED` dipakai untuk device token tidak valid atau device bukan untuk gate.
- `SESSION_INACTIVE` dipakai bila gate session ada tetapi tidak aktif.

### Audit logging
Tambahkan pencatatan `checkInLog` tidak hanya untuk success, tetapi juga untuk outcome yang penting secara operasional:
- tiket tidak ditemukan
- tiket event berbeda
- tiket sudah check-in
- akses gate tidak valid bila ada tiket yang dicoba scan

Struktur log tidak perlu diperluas besar-besaran; cukup gunakan model yang ada bila memungkinkan.

## UI Design

### Shared operator result mapping
`app/gate/page.tsx` harus memakai satu mapper helper untuk mengubah result backend menjadi kartu feedback operator dengan:
- ikon
- warna status
- judul
- pesan detail
- metadata seperti `checkedInAt` atau nama attendee bila tersedia

### Operator outcomes
- `SUCCESS`: tampilkan attendee, ticket type, booking code, event title, dan waktu check-in
- `ALREADY_CHECKED_IN`: tampilkan peringatan jelas bahwa tiket sudah dipakai dan kapan dipakai
- `WRONG_EVENT`: tampilkan bahwa tiket valid tetapi untuk event lain
- `INVALID`: tampilkan bahwa tiket tidak valid / booking belum memenuhi syarat
- `ACCESS_DENIED` / `SESSION_INACTIVE`: tampilkan error operasional dan arahkan operator untuk login ulang / cek akses gate

### Repeatable scan behavior
- Repeated scan untuk tiket yang sama harus konsisten: pertama `SUCCESS`, scan berikutnya `ALREADY_CHECKED_IN`
- QR scanner dan manual input harus memanggil fungsi check-in yang sama
- Stats event hanya di-refresh setelah `SUCCESS`

## Error Handling

- `401/403` tetap dipakai untuk masalah akses device/session
- `404` dapat tetap dipakai untuk ticket not found bila dibutuhkan, tetapi payload operator harus tetap konsisten dengan `result`
- `400` dipakai untuk invalid ticket, wrong event, atau already checked in
- `500` hanya untuk failure tak terduga

UI tidak boleh menelan semua error sebagai `INVALID`; outcome operasional penting harus dipertahankan.

## Testing Strategy

Fokus test pada hasil check-in, bukan browser flow penuh:
- device token tidak ada → `ACCESS_DENIED`
- device bukan gate → `ACCESS_DENIED`
- session tidak aktif → `SESSION_INACTIVE`
- ticket tidak ditemukan → `INVALID`
- ticket event berbeda → `WRONG_EVENT`
- booking belum confirmed → `INVALID`
- ticket sudah check-in → `ALREADY_CHECKED_IN`
- success scan menandai ticket checked-in dan membuat log
- repeat scan setelah success mengembalikan `ALREADY_CHECKED_IN`

Jika ada tempat test ringan untuk mapper UI, tambahkan validasi bahwa result code diubah menjadi label operator yang benar.

## Delivery Notes

Implementasi harus tetap kecil, fokus pada stabilitas beta event-day. Jangan melebar ke offline mode atau redesign gate access penuh. Tujuan utama adalah membuat operator mendapat feedback yang tegas dan backend menghasilkan audit trail yang cukup untuk investigasi masalah saat event berlangsung.
