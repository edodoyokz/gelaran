# Local Change Cleanup Design

## Goal

Rapikan working tree `main` yang masih berisi banyak perubahan lintas issue Linear, lalu integrasikan hanya batch perubahan yang bisa dipetakan dengan aman ke issue yang memang sudah punya scope jelas. Hasil akhir yang diinginkan adalah histori git yang lebih rapi, status Linear yang sinkron, dan sisa perubahan lokal yang hanya berisi pekerjaan issue terbuka atau perubahan yang memang masih perlu dipilah.

## Scope

Cleanup ini fokus pada perubahan lokal yang saat ini sudah ada di workspace utama. Cleanup **tidak** menambah fitur baru. Cleanup hanya:

- memetakan perubahan ke issue Linear,
- mengelompokkan file per issue,
- memverifikasi batch yang aman,
- membuat commit terpisah per issue,
- menyisakan file campuran untuk issue yang belum siap.

## Recommended Approach

### Approach A — Safe-first issue batching

Kelompokkan dan commit hanya batch yang confidence-nya tinggi:

- `GEL-5` runtime config validation
- `GEL-6` demo shortcut hardening
- `GEL-7` structured logging
- `GEL-8` platform settings in database
- `GEL-9` CI quality gates
- `GEL-11` complimentary booking hardening
- `GEL-19` Prisma config migration

Sisakan perubahan campuran atau issue yang masih aktif/terbuka seperti `GEL-13`, `GEL-15`, dan `GEL-17` untuk ditangani setelah tree jauh lebih bersih.

**Kelebihan:** risiko salah commit paling rendah, histori tetap jelas, dan mudah dikaitkan ke issue Linear.
**Kekurangan:** perlu beberapa putaran staging/verifikasi.

### Approach B — Full split by hunk

Pecah semua perubahan hingga level hunk, termasuk file campuran yang menyentuh auth, payments, dan observability.

**Kelebihan:** working tree bisa sangat bersih.
**Kekurangan:** paling lambat dan paling berisiko salah pisah konteks bisnis.

### Approach C — Bulk snapshot

Commit seluruh sisa perubahan sebagai satu snapshot besar.

**Kelebihan:** cepat.
**Kekurangan:** mengaburkan histori, menyulitkan audit Linear, dan membuat langkah berikutnya lebih sulit.

## Selected Design

Pakai **Approach A — Safe-first issue batching**.

Desain ini dipilih karena sebagian besar untracked/new files sudah punya pemetaan yang sangat kuat ke issue Linear yang telah didefinisikan sebelumnya. Di sisi lain, banyak tracked modifications masih overlap antara `GEL-13`, `GEL-15`, dan `GEL-17`, jadi lebih aman jika perubahan-perubahan itu dibiarkan sementara sebagai working state sampai dipisah dengan konteks implementasi yang benar.

## Batch Map

### Batch 1 — `GEL-5`

Target utama:

- `lib/env.ts`
- `lib/env.test.ts`
- kemungkinan wiring terkait seperti `next.config.ts`, `app/layout.tsx`, `package.json`
- `docs/plans/2026-03-08-gel-5-runtime-config-validation.md`

### Batch 2 — `GEL-6`

Target utama:

- `lib/demo-mode.ts`
- `lib/demo-mode.test.ts`
- `app/api/payments/demo/route.ts`
- kemungkinan page changes yang hanya menghapus shortcut demo
- `docs/plans/2026-03-08-gel-6-demo-shortcuts-hardening.md`

### Batch 3 — `GEL-7`

Target utama:

- `instrumentation.ts`
- `lib/logging/logger.ts`
- `lib/logging/request.ts`
- `lib/logging-request.test.ts`
- `lib/audit-log.ts`
- route/infra changes yang hanya menambah request correlation atau structured logging
- `docs/plans/2026-03-08-gel-7-structured-logging.md`

### Batch 4 — `GEL-8`

Target utama:

- `lib/platform-settings.ts`
- `lib/platform-settings.test.ts`
- `prisma/migrations/20260308_platform_settings/migration.sql`
- `prisma/schema.prisma`
- `prisma/seed.ts`
- `app/api/admin/settings/route.ts`
- `docs/plans/2026-03-08-gel-8-platform-settings-db.md`

### Batch 5 — `GEL-9`

Target utama:

- `.github/workflows/ci.yml`
- `scripts/run-build-with-ci-env.mjs`
- `eslint.config.mjs`
- `README.md`
- `package.json`
- `docs/plans/2026-03-08-gel-9-ci-quality-gates.md`

### Batch 6 — `GEL-11`

Target utama:

- `lib/complimentary-flow.ts`
- `lib/complimentary-flow.test.ts`
- `lib/booking-state-machine.ts`
- `lib/booking-validators.ts`
- complimentary-related API/UI files
- `docs/plans/2026-03-08-gel-11-complimentary-booking-design.md`
- `docs/plans/2026-03-08-gel-11-complimentary-booking.md`

### Batch 7 — `GEL-19`

Target utama:

- `prisma.config.ts`
- `lib/prisma-config.test.ts`
- `package.json`
- `docs/plans/2026-03-08-gel-19-prisma-config-migration.md`

## Out of Scope for Cleanup Batch

Perubahan berikut tidak akan dipaksa masuk ke batch aman sebelum dipilah lebih lanjut:

- auth / role boundary hardening (`GEL-13`)
- expanded observability / audit coverage lintas flow (`GEL-15`)
- payment idempotency + webhook hardening (`GEL-17`)
- perubahan UI styling atau layout yang tidak jelas terkait issue mana

## Verification Strategy

Setiap batch hanya boleh diklaim rapi kalau:

- file yang distage memang sesuai scope issue,
- test terdekat untuk batch itu dijalankan bila tersedia,
- lint atau targeted verification dijalankan untuk file yang disentuh,
- commit message dan catatan Linear menjelaskan ruang lingkup batch.

## Execution Notes

Karena task ini adalah cleanup terhadap perubahan yang **sudah ada** di workspace utama, eksekusi dilakukan in-place pada `main` untuk menghindari pemindahan state yang berisiko. Setelah cleanup selesai, task implementasi berikutnya akan kembali memakai worktree terpisah.
