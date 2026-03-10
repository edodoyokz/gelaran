# GEL-18 Go-Live Readiness Review Design

**Date:** 2026-03-10
**Status:** Approved
**Related Linear Issue:** `GEL-18`

## Context

Gelaran sudah memiliki artefak operasional inti untuk deployment, rollback, smoke tests, incident response, dan operator ownership. Namun belum ada paket readiness review yang menyatukan artefak-artefak itu menjadi satu alur go-live yang bisa dipakai operator, engineering lead, dan stakeholder saat keputusan launch dibuat.

`GEL-18` membutuhkan paket readiness yang bukan hanya menjelaskan prosedur, tetapi juga memberi ruang untuk review release blocker, pencatatan bukti, keputusan go/no-go, dan sign-off lintas peran. Paket ini harus siap dipakai manusia saat hari-H tanpa bergantung pada automasi approval.

## Goals

- Menyediakan paket readiness go-live yang lengkap dan mudah dipakai sebelum launch.
- Menyatukan release-blocker review, smoke-check validation, rollback readiness, monitoring readiness, dan sign-off dalam satu paket dokumen yang konsisten.
- Membuat keputusan `go / no-go / go with conditions` terdokumentasi dan dapat diaudit.
- Menghubungkan paket readiness ke runbook operasional yang sudah ada tanpa duplikasi berlebihan.

## Non-Goals

- Mengotomasi approval atau sign-off final.
- Menyimpan kontak pribadi, kredensial, atau data sensitif di repository.
- Mengubah workflow deployment aplikasi atau menambah tooling observability baru.
- Menutup issue release-blocker lain secara otomatis.

## Considered Approaches

### Approach A — Satu dokumen master
Buat satu dokumen besar berisi readiness summary, checklist, evidence, dan sign-off.

**Pros**
- Cepat dibuat.
- Mudah dicari karena hanya satu file.

**Cons**
- Sulit dipakai saat hari-H karena operator dan approver bekerja di bagian yang berbeda.
- Bukti, keputusan, dan checklist bercampur.
- Sulit dipelihara saat proses go-live diulang.

### Approach B — Paket readiness terstruktur (**Recommended**)
Pisahkan readiness review, eksekusi checklist, evidence log, sign-off, dan index ke file yang berbeda namun saling terhubung.

**Pros**
- Setiap peran memakai dokumen yang paling relevan.
- Bukti dan keputusan lebih mudah diaudit.
- Mengurangi duplikasi dengan cukup menautkan runbook operasional yang sudah ada.
- Cocok untuk dipakai berulang pada beberapa deployment.

**Cons**
- Butuh beberapa file baru.
- Perlu index yang rapi agar operator tidak bingung.

### Approach C — Paket readiness + automasi status Linear
Selain dokumen, tambahkan alur otomatis update status/checklist ke Linear.

**Pros**
- Status proyek lebih sinkron.
- Mengurangi update manual.

**Cons**
- Menambah scope dan integrasi yang tidak dibutuhkan untuk readiness package awal.
- Approval manusia tetap tidak bisa digantikan.

## Recommended Design

Gunakan **Approach B**. Buat paket readiness terstruktur di `docs/go-live/` dengan satu index utama dan empat artefak pendukung: readiness review, day-of checklist, evidence log, dan sign-off sheet. Dokumen-dokumen ini mengacu ke `docs/operations/*` untuk prosedur rinci, sehingga paket go-live menjadi lapisan orkestrasi keputusan, bukan salinan runbook.

## Package Structure

### 1. `docs/go-live/README.md`
Index utama untuk seluruh paket readiness:
- tujuan paket
- urutan penggunaan dokumen
- tautan ke runbook operasional terkait
- definisi singkat keputusan `go / no-go / go with conditions`

### 2. `docs/go-live/go-live-readiness-review.md`
Dokumen ringkasan review sebelum launch:
- target release / deployment reference
- daftar release-blocker dan statusnya
- readiness per area: deployment, rollback, smoke tests, monitoring, operator ownership
- daftar risiko terbuka dan mitigasinya
- rekomendasi keputusan launch

### 3. `docs/go-live/go-live-checklist.md`
Checklist hari-H yang dieksekusi operator:
- pre-launch checks
- deployment execution handoff
- smoke test completion
- monitoring watch window
- rollback trigger confirmation
- final decision checkpoint

### 4. `docs/go-live/go-live-evidence-log.md`
Template bukti operasional:
- link deployment/build
- commit SHA / release reference
- hasil smoke tests
- hasil health/public route checks
- issue yang ditemukan selama readiness review
- tautan ke Linear issue atau incident doc jika ada

### 5. `docs/go-live/go-live-signoff.md`
Template approval lintas peran:
- engineering owner
- operator/on-call owner
- product owner
- go-live decision owner
- status `approved / approved with conditions / blocked`
- timestamp, catatan, dan kondisi blokir

## Process Flow

### Before launch window
1. Isi `go-live-readiness-review.md` berdasarkan issue release-blocker dan `docs/operations/*`.
2. Pastikan owner manusia untuk on-call, incident commander, dan approver sudah ditentukan di secure roster.
3. Catat risiko terbuka dan keputusan mitigasi.

### During launch window
1. Operator menjalankan `go-live-checklist.md`.
2. Hasil aktual dicatat ke `go-live-evidence-log.md`.
3. Bila ada anomali, operator mengacu ke `docs/operations/rollback-procedure.md` atau `docs/operations/incident-response.md`.

### Final decision
1. Approver mengisi `go-live-signoff.md`.
2. Decision owner menetapkan status `GO`, `GO WITH CONDITIONS`, atau `NO-GO`.
3. Jika `GO WITH CONDITIONS`, semua syarat harus tertulis eksplisit dan punya owner.

## Decision Rules

### GO
Dipakai bila:
- release-blocker sudah ditinjau
- smoke checks penting lulus
- rollback siap dijalankan
- monitoring/watch window punya owner
- semua approver utama setuju

### GO WITH CONDITIONS
Dipakai bila:
- ada risiko terbuka non-blocking
- mitigasi dan owner sudah ditentukan
- risiko dapat diterima untuk launch terbatas

### NO-GO
Dipakai bila:
- ada release-blocker belum terselesaikan
- smoke check kritikal gagal
- rollback tidak siap
- operator ownership belum jelas
- approver utama menolak launch

## Error Handling and Safety

- Paket ini tidak boleh mengklaim readiness tanpa ruang untuk bukti.
- Semua placeholder owner harus merujuk ke secure roster, bukan kontak pribadi di repo.
- Checklist harus menekankan bahwa incident handling dan rollback memakai runbook resmi, bukan instruksi ad-hoc.
- Jika informasi belum tersedia, dokumen harus menandainya sebagai blocker eksplisit, bukan asumsi diam-diam.

## Testing Strategy

Validasi paket readiness dilakukan dengan review tekstual:
- semua file paket tersedia dan saling tertaut
- semua referensi ke runbook operasional valid
- tidak ada placeholder sensitif (`TODO` kontak pribadi, domain palsu, endpoint yang tidak ada)
- status keputusan dan sign-off punya struktur yang eksplisit

## Delivery Notes

Paket readiness harus ringan, operasional, dan bisa digunakan ulang. Fokusnya adalah kualitas keputusan launch dan kejelasan peran, bukan automasi. Jika di masa depan dibutuhkan integrasi ke Linear atau dashboard, paket ini menjadi baseline proses yang lebih dulu distabilkan.
