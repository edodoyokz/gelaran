# Beta-Ready Hardening Design

**Date:** 2026-04-08
**Status:** Approved

## Context

BSC-FINAL sudah memiliki banyak fondasi fitur dan hardening parsial, tetapi keputusan beta tidak boleh didasarkan pada asumsi bahwa fitur yang ada otomatis siap dipakai end-to-end. Beberapa area penting masih berisiko: alur pembayaran manual dan complimentary harus benar-benar selesai di level repo, environment, dan verifikasi lintas peran; quality gates harus bersih; serta bukti operasional harus tersedia untuk mendukung keputusan sign-off.

Tujuan dokumen ini adalah mendefinisikan desain hardening yang membawa repo ke kondisi *beta-candidate*: siap dievaluasi untuk beta sign-off melalui bukti yang nyata. Dokumen ini tidak menyatakan bahwa beta sudah siap. Beta sign-off tetap membutuhkan evidence, bukan asumsi dari implementasi kode.

## Goals

- Menyatukan hardening beta sebagai alur operasional yang jelas dari repo state sampai keputusan sign-off.
- Menutup blocker kritikal yang memutus alur user/operator/admin pada jalur pembayaran manual dan complimentary.
- Memastikan quality gates, environment gates, dan verifikasi lintas peran menghasilkan bukti yang dapat diaudit.
- Menetapkan aturan keputusan yang fail-closed bila bukti readiness belum lengkap.

## Non-Goals

- Melakukan redesign produk besar di luar jalur beta kritikal.
- Menstabilkan seluruh permukaan aplikasi tanpa prioritas risiko.
- Mengganti keputusan manusia dengan automasi sign-off.
- Mengklaim readiness beta hanya karena typecheck/build tertentu sudah hijau.

## Considered Approaches

### Approach A - Patch blocker langsung
Perbaiki blocker yang terlihat saat ini satu per satu sampai alur utama tampak berjalan.

**Pros**
- Paling cepat untuk menghapus error yang sudah diketahui.
- Scope perubahan awal kecil.

**Cons**
- Mudah melewatkan dependency antar blocker.
- Tidak menjamin environment dan verification readiness.
- Cenderung menghasilkan "terlihat jalan" tanpa paket bukti yang cukup.

### Approach B - Beta gate hardening end-to-end (**Recommended**)
Lakukan hardening sebagai rangkaian gate: truth pass, repo fixes, environment readiness, verifikasi lintas peran, lalu paket keputusan beta.

**Pros**
- Menjaga fokus pada syarat beta yang benar-benar bisa dibuktikan.
- Menyatukan repo, environment, dan operational evidence dalam satu alur.
- Mengurangi risiko sign-off berbasis asumsi parsial.

**Cons**
- Membutuhkan disiplin eksekusi lintas area, bukan hanya patch kode.
- Membutuhkan artefak verifikasi yang lebih lengkap.

### Approach C - Full stabilization sweep
Lakukan sweep besar ke seluruh repo untuk menutup sebanyak mungkin issue sebelum beta.

**Pros**
- Potensi kualitas umum meningkat lebih luas.
- Bisa mengurangi backlog teknis jangka menengah.

**Cons**
- Scope terlalu besar untuk target beta readiness yang terarah.
- Sulit menjaga momentum dan definisi selesai.
- Meningkatkan risiko churn pada area non-kritikal.

## Recommended Design

Gunakan **Approach B**. Beta readiness diperlakukan sebagai pipeline hardening operasional dengan lima wave yang berurutan dan evidence-driven. Setiap wave memiliki output eksplisit dan menjadi prasyarat wave berikutnya. Jika satu wave belum menghasilkan bukti yang cukup, proses berhenti sebagai blocker terbuka, bukan diteruskan dengan asumsi.

Desain ini memusatkan keputusan beta pada empat gate akhir: critical flow complete, quality gates clean, environment gates complete, dan real verification evidence. Kode yang terlihat benar belum cukup; setiap gate harus dibuktikan melalui hasil run, artefak, atau catatan verifikasi yang bisa ditinjau ulang.

## Outcome Criteria for Beta Ready

### 1. Critical flow complete
- Alur manual payment selesai dari intent sampai outcome operasional yang diharapkan.
- Alur complimentary selesai dari request/review sampai booking/ticket issuance tanpa duplicate side effect.
- Jalur lintas peran yang menyentuh customer, organizer, admin, dan operator tidak memiliki blocker kritikal yang belum ditutup.

### 2. Quality gates clean
- Gate repo yang disepakati untuk beta berjalan bersih pada scope yang relevan.
- Tidak ada failure yang diketahui dan sengaja diabaikan pada jalur beta kritikal.
- Warning atau debt non-blocking harus terdokumentasi eksplisit bila tetap diterima.

### 3. Environment gates complete
- Environment yang dipakai untuk verifikasi memiliki konfigurasi, secret, service dependency, dan callback URL yang lengkap.
- Tidak ada langkah manual tersembunyi yang hanya diketahui satu orang.
- Semua precondition environment untuk flow beta dapat diulang dan dicek ulang.

### 4. Real verification evidence
- Bukti verifikasi berasal dari eksekusi nyata, bukan pembacaan kode saja.
- Evidence mencakup hasil test/run, route verification, dan catatan outcome lintas peran.
- Beta sign-off membutuhkan evidence, bukan code assumptions.

## Scope In/Out

**In scope**
- Hardening repo untuk blocker yang memutus jalur beta kritikal.
- Readiness environment untuk payment manual dan complimentary verification.
- Verifikasi lintas peran customer, organizer, admin, dan operator.
- Paket keputusan beta berisi status gate, risiko terbuka, dan evidence log.

**Out of scope**
- Penyempurnaan UX umum yang tidak mempengaruhi beta gate.
- Refactor besar domain yang tidak dibutuhkan untuk flow kritikal.
- Release automation baru, observability platform baru, atau redesign infra besar.
- Menutup seluruh backlog teknis di luar kebutuhan sign-off beta.

## Execution Architecture

### Wave 1 - Truth pass
Bangun baseline kebenaran sebelum melakukan fix. Wave ini memetakan kondisi repo, known failing gates, flow yang belum benar-benar selesai, dependency environment, dan artefak verifikasi yang sudah/ belum ada. Output wave ini adalah daftar blocker dan gap readiness yang dibuktikan, bukan opini.

### Wave 2 - Repo critical fixes
Perbaiki blocker di level kode dan konfigurasi repo yang memutus jalur beta kritikal. Prioritasnya adalah perubahan yang membuat manual payment dan complimentary flow dapat dijalankan konsisten, serta membersihkan gate kualitas yang memang menjadi syarat beta. Wave ini tidak memasukkan cleanup opportunistic di area non-kritikal.

### Wave 3 - Environment readiness
Pastikan environment verifikasi benar-benar siap dipakai. Ini mencakup runtime config, secret presence, external integration settings, callback path, seeded/reference data, dan operator run prerequisites. Output wave ini adalah checklist environment yang lengkap dan dapat dipakai ulang.

### Wave 4 - Cross-role E2E verification
Jalankan verifikasi nyata lintas peran pada flow manual payment dan complimentary. Fokusnya adalah membuktikan bahwa transisi state, akses per role, side effect, dan hasil akhir sesuai harapan pada environment yang sudah siap. Semua hasil harus dicatat sebagai evidence, termasuk failure dan recovery decision.

### Wave 5 - Beta decision package
Satukan hasil wave sebelumnya ke paket keputusan beta: status gate, daftar blocker terbuka, risiko yang diterima, evidence log, dan rekomendasi `ready for beta review` atau `not ready`. Paket ini menjadi dasar sign-off manusia; tanpa paket ini, beta tidak boleh dianggap siap.

## Data Flow Design

### Manual payment flow
1. Customer memulai checkout pada event/booking yang valid.
2. Sistem membuat atau memulihkan intent pembayaran manual sesuai policy idempotensi yang berlaku.
3. Customer menerima instruksi/manual payment reference dan status booking masuk ke state menunggu penyelesaian yang tepat.
4. Admin atau operator memverifikasi pembayaran berdasarkan bukti pembayaran dan policy operasional.
5. Sistem menerapkan transition yang diterima tepat satu kali: update status transaksi/booking, issue ticket bila relevan, kirim notifikasi, dan tulis audit/evidence.
6. Jika verifikasi gagal, expired, atau conflict, sistem fail closed dengan status/error yang eksplisit dan tidak membuat side effect ganda.

### Complimentary flow
1. Organizer membuat complimentary request untuk guest pada event yang valid.
2. Sistem mengecek duplicate policy dan menyimpan request hanya bila request tersebut sah.
3. Admin meninjau request dalam state `PENDING`.
4. Saat approve, sistem menjalankan guard concurrency, recheck quota, issuance guard, lalu membuat booking/ticket tepat satu kali.
5. Saat reject, sistem menyimpan hasil review, alasan, notifikasi, dan audit tanpa side effect issuance.
6. Listing/admin view menampilkan outcome review dan booking summary agar hasil dapat diverifikasi lintas peran.

## Error Handling / Decision Rules

- Semua gate beta bersifat fail-closed: jika bukti belum ada atau tidak meyakinkan, status tetap `not ready`.
- Repo failure yang memutus jalur kritikal diklasifikasikan sebagai blocker, bukan deferred cleanup.
- Environment mismatch yang menghalangi verifikasi nyata diperlakukan sebagai blocker readiness walaupun kode lokal terlihat benar.
- Duplicate callback, retry, atau repeat action harus ditangani idempotent; side effect hanya boleh diterapkan sekali.
- Jika ditemukan ketidaksesuaian state yang aman untuk dipulihkan, recovery boleh dijalankan hanya bila aturan recovery eksplisit dan hasilnya dicatat.
- Jika state ambigu atau evidence bertentangan, keputusan default adalah stop, catat blocker, dan eskalasi ke paket keputusan beta.

## Testing and Verification Strategy

Verifikasi dilakukan berlapis dan evidence-driven:

- Mulai dari truth pass terhadap gate repo dan known critical path untuk memastikan baseline akurat.
- Jalankan test/quality commands yang menjadi syarat beta pada scope yang relevan dan simpan hasil aktualnya.
- Verifikasi environment gates dengan checklist operasional, bukan hanya membaca `.env.example` atau kode konfigurasi.
- Jalankan cross-role E2E untuk manual payment dan complimentary flow pada environment yang siap, lalu catat outcome per langkah.
- Simpan bukti nyata: command result, route outcome, status transition, booking/ticket result, dan catatan blocker bila ada.
- Jangan menyatakan beta siap hanya karena implementasi tampak lengkap; semua klaim harus ditopang evidence yang dapat ditinjau.

## Success Criteria

- Semua wave selesai dengan output yang jelas dan terdokumentasi.
- Empat beta gates terpenuhi: critical flow complete, quality gates clean, environment gates complete, dan real verification evidence.
- Tidak ada blocker kritikal terbuka pada flow manual payment dan complimentary yang masih menghalangi penggunaan beta.
- Paket keputusan beta tersedia dan cukup untuk ditinjau stakeholder/operator tanpa asumsi tambahan.
- Sign-off beta hanya dapat diberikan setelah evidence review selesai; code assumptions saja tidak cukup.
