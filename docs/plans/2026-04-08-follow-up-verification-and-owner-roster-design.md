# Follow-Up Verification and Owner Roster Design

**Date:** 2026-04-08
**Status:** Approved

## Context

Keputusan beta saat ini adalah **GO WITH CONDITIONS**. Artinya, repo dan operasi sudah cukup untuk bergerak ke fase beta terbatas, tetapi masih ada pekerjaan lanjutan yang perlu diselesaikan agar coverage verifikasi, kesiapan operasional, dan akuntabilitas owner menjadi lebih kuat.

Dokumen ini menggantikan framing sebelumnya yang menempatkan seluruh paket sebagai follow-up **non-blocking**. Scope kini dipecah menjadi dua kelompok kerja yang berbeda:

- **Beta-critical expansion:** gate/check-in verification serta ticket print/download/QR fulfillment readiness harus `PASS` sebelum beta test dimulai.
- **Remaining non-blocking follow-up:** waitlist verification, POS status dan return flow, route smoke expansion yang lebih luas, serta owner roster contract tetap berjalan sebagai hardening lanjutan yang tidak menahan dimulainya beta test.

Dengan perubahan ini, desain ini **supersedes** framing sebelumnya yang sepenuhnya non-blocking. Keputusan beta tetap **GO WITH CONDITIONS**, tetapi ada perluasan syarat readiness: beta test tidak boleh dimulai sebelum dua jalur beta-critical tersebut benar-benar lolos verifikasi.

Dokumen ini juga menetapkan kontrak owner roster operasional. Roster owner lengkap tetap berada **di luar repo** sebagai artefak operasional. Repo hanya menyimpan kebutuhan role, checkpoint konfirmasi, dan field status yang diperlukan agar handoff dan evidence bisa dilacak tanpa menyalin data personel sensitif atau roster aktif ke source control.

## Goals

- Menetapkan pemisahan yang jelas antara workstream beta-critical dan follow-up non-blocking setelah keputusan **GO WITH CONDITIONS**.
- Memastikan gate/check-in verification serta ticket print/download/QR fulfillment readiness lulus sebelum beta test dimulai.
- Memperkeras bukti operasional pada area follow-up non-blocking: waitlist, POS return-to-cashier, smoke route penting, dan owner roster contract.
- Mendefinisikan kontrak minimum owner roster agar setiap area operasional memiliki kebutuhan role, checkpoint konfirmasi, dan status tracking yang jelas.
- Menjaga batas antara artefak operasional di luar repo dan metadata pelacakan yang aman untuk disimpan di repo.

## Non-Goals

- Mengembalikan seluruh paket ke framing lama yang sepenuhnya non-blocking.
- Membangun launch-ops system penuh atau menyimpan roster personel lengkap di dalam repo.
- Mengubah repo menjadi sumber kebenaran untuk jadwal, nomor kontak, atau penugasan shift individu.
- Memperluas scope ke redesign produk atau automasi operasional besar yang tidak dibutuhkan untuk follow-up ini.

## Considered Approaches

### Checklist only
Tambahkan daftar cek sederhana untuk seluruh area tanpa pemisahan tegas antara beta-critical readiness dan follow-up non-blocking.

**Pros**
- Paling cepat untuk dieksekusi.
- Dokumentasi ringan dan mudah ditambahkan.

**Cons**
- Ownership tetap longgar dan mudah menjadi implicit knowledge.
- Sulit membuktikan status beta-critical versus non-blocking per workstream secara konsisten.
- Tidak cukup kuat untuk menjaga kesinambungan antara repo evidence dan operasi lapangan.

### Verification hardening plan (**Recommended**)
Tetapkan desain split-scope: jalur beta-critical diperlakukan sebagai gate yang wajib `PASS` sebelum beta test, sementara sisa area tetap berjalan sebagai follow-up non-blocking dengan model evidence dan kontrak owner roster minimum.

**Pros**
- Menjaga jalur yang benar-benar beta-critical terlihat eksplisit dan dapat ditahan sampai `PASS`.
- Menjaga scope follow-up non-blocking tetap fokus pada area hardening operasional yang tersisa.
- Memberi struktur status yang cukup untuk audit tanpa memindahkan roster aktif ke repo.
- Memudahkan sequencing pekerjaan dan review outcome per workstream.

**Cons**
- Membutuhkan disiplin pembaruan status dan checkpoint confirmation.
- Membutuhkan pemisahan status yang jelas antara gate beta test dan hardening lanjutan.
- Masih bergantung pada artefak operasional eksternal untuk roster owner aktual.

### Full launch-ops package
Bangun paket operasional penuh di repo, termasuk roster, schedule, owner mapping detail, evidentiary checklist, dan runbook ekspansi untuk seluruh beta.

**Pros**
- Sangat lengkap untuk koordinasi lintas tim.
- Potensi visibilitas operasional tinggi bila selalu dipelihara.

**Cons**
- Terlalu besar untuk kebutuhan split antara beta-critical gating dan follow-up non-blocking saat ini.
- Berisiko menyimpan detail operasional yang seharusnya tidak hidup di repo.
- Menambah maintenance overhead yang tidak proporsional terhadap kebutuhan saat ini.

## Recommended Design

Gunakan **Verification hardening plan** dengan split yang eksplisit antara **beta-critical expansion** dan **remaining non-blocking follow-up**. Workstream beta-critical harus menghasilkan status `PASS` sebelum beta test dimulai. Workstream non-blocking tetap dieksekusi sebagai hardening lanjutan setelah keputusan beta saat ini, tetapi tidak menjadi syarat untuk memulai beta test.

Beta-critical expansion terdiri dari:

- gate/check-in verification
- ticket print/download/QR fulfillment verification

Remaining non-blocking follow-up terdiri dari:

- waitlist verification
- POS status and cashier return flow
- route smoke expansion
- operational owner roster contract

Setiap workstream tetap menghasilkan outcome yang bisa dibuktikan: status, evidence link/reference, open issues, dan checkpoint confirmation. Perubahan desain ini menggantikan framing lama yang memperlakukan semua area sebagai non-blocking follow-up. Keputusan beta tetap **GO WITH CONDITIONS**, tetapi dimulainya beta test sekarang bergantung pada kelulusan dua workstream beta-critical.

Desain ini memisahkan dua lapisan dengan tegas:

- **Operational roster outside repo:** owner name, jadwal jaga, nomor kontak, dan rotasi shift tetap dikelola di artefak operasional eksternal.
- **Tracking contract inside repo:** repo hanya menyimpan definisi role yang dibutuhkan, checkpoint konfirmasi yang harus dipenuhi, dan field status untuk menandai readiness, evidence availability, serta open issue state.

Dengan pemisahan ini, repo tetap menjadi tempat untuk requirement operasional yang dapat diaudit oleh engineering, sementara data roster aktual tetap berada pada sistem atau dokumen operasional yang lebih tepat.

## Outcome Definition

Follow-up ini dianggap selesai bila setiap workstream memiliki:

- status akhir yang eksplisit (`not-started`, `in-progress`, `needs-external-confirmation`, `done`, atau `risk-accepted`)
- evidence nyata atau referensi evidence untuk hasil verifikasi
- daftar issue terbuka yang tersisa, bila ada
- checkpoint confirmation yang menunjukkan siapa/role mana yang harus mengonfirmasi outcome

Untuk workstream beta-critical, definisi outcome lebih ketat: status akhirnya harus `PASS` sebelum beta test dimulai. Status selain `PASS` berarti beta test belum boleh berjalan pada jalur yang membutuhkan capability tersebut.

Untuk owner roster contract, outcome selesai berarti repo sudah memiliki template atau field contract yang cukup untuk menyatakan kebutuhan role dan state konfirmasi, sementara roster owner aktual tetap berada di luar repo.

## Scope in / out

**In scope**
- Beta-critical verification untuk gate/check-in serta ticket print/download/QR fulfillment.
- Follow-up verifikasi non-blocking untuk waitlist, POS status dan cashier return flow, dan smoke route expansion.
- Definisi field status dan checkpoint confirmation yang dibutuhkan untuk melacak outcome operasional.
- Kontrak role requirement untuk owner roster operasional.
- Penyelarasan evidence model agar hasil follow-up dapat direview konsisten.

**Out of scope**
- Penyimpanan daftar owner individu, kontak, shift table, atau roster operasional lengkap di repo.
- Menjadikan seluruh paket non-blocking sebagai syarat `PASS` sebelum beta test dimulai.
- Pembuatan command center operasional penuh atau tooling launch management baru.
- Perubahan produk besar di luar jalur verifikasi dan tracking follow-up.

## Workstreams

### Gate / check-in verification
Workstream ini sekarang masuk kategori **beta-critical**. Tujuannya adalah memastikan operator day-of-event dapat menjalankan scan, duplicate handling, dan reject path dengan bukti nyata yang cukup sebelum beta test dimulai. Fokusnya bukan redesign gate flow, tetapi pembuktian bahwa flow yang ada dapat dipakai aman selama beta test.

Output minimum:

- bukti check-in success, duplicate scan handling, dan reject/invalid path
- catatan rule operasional yang harus diketahui gate operator
- status akhir `PASS` untuk readiness gate/check-in sebelum beta test dimulai

### Ticket print / download / QR fulfillment verification
Workstream ini masuk kategori **beta-critical** karena tiket harus dapat diakses, diunduh, dicetak, atau dipakai melalui QR fulfillment pada kondisi beta. Fokusnya adalah membuktikan bahwa jalur ticket delivery dan retrieval yang diperlukan untuk peserta dan operator benar-benar tersedia dan tidak gagal pada jalur utama.

Output minimum:

- bukti ticket download atau print readiness pada jalur yang dipakai saat beta
- bukti QR fulfillment dapat diakses dan dipakai pada kondisi sukses yang relevan
- catatan failure mode penting seperti missing asset, broken access, atau fulfillment mismatch
- status akhir `PASS` untuk readiness ticket print/download/QR fulfillment sebelum beta test dimulai

### Waitlist verification
Workstream ini memverifikasi bahwa jalur waitlist yang sudah diterima untuk beta memiliki bukti perilaku minimum yang cukup pada kondisi normal dan state transition penting. Fokusnya adalah memastikan visibility status, eligibility transition, dan operator/admin understanding terhadap outcome waitlist tidak ambigu.

Output minimum:

- bukti jalur join/view/update waitlist pada route atau UI yang relevan
- catatan state transition penting dan hasil yang diharapkan
- issue list bila ada gap non-blocking yang masih diterima

### POS status and cashier return flow
Workstream ini memperkeras pembuktian flow POS pada saat transaksi perlu kembali ke cashier state atau memerlukan penanganan status yang berulang. Fokusnya adalah memastikan transisi status tidak membingungkan operator dan tidak menciptakan side effect ganda saat retry atau return dilakukan.

Output minimum:

- bukti status transition sebelum dan sesudah cashier return
- validasi bahwa retry/return tidak menghasilkan duplicate side effect
- checkpoint confirmation untuk role operator/cashier requirement

### Route smoke expansion
Workstream ini menambahkan coverage smoke pada route yang penting tetapi belum masuk paket minimum sebelumnya. Tujuannya adalah memperluas confidence permukaan repo tanpa mengubah follow-up ini menjadi program full regression.

Output minimum:

- daftar route prioritas yang ditambah ke smoke pass
- hasil run aktual untuk route yang dipilih
- pencatatan failure baru sebagai follow-up issue, bukan hidden knowledge

### Operational owner roster contract
Workstream ini mendefinisikan kontrak repo untuk ownership operasional tanpa menyimpan roster aktif. Repo hanya menyimpan:

- role requirement per workstream atau checkpoint
- confirmation checkpoint yang harus dipenuhi sebelum status dianggap selesai
- status fields untuk menunjukkan readiness dan confirmation progress

Field contract minimum yang harus konsisten di repo:

- `checkpoint_id`: identifier stabil untuk checkpoint konfirmasi
- `required_role`: role yang wajib tersedia di roster eksternal
- `coverage_window`: window/handoff yang harus dicakup
- `roster_status`: `pending`, `confirmed`, atau `blocked`
- `evidence_ref`: referensi ke dokumen repo yang mencatat hasil checkpoint
- `last_confirmed_at`: timestamp konfirmasi terakhir yang dicatat di repo
- `notes`: catatan non-sensitif tentang gap, caveat, atau tindak lanjut

Checkpoint minimum yang harus terlihat di repo:

- `deployment-owner-confirmed`
- `rollback-owner-confirmed`
- `primary-oncall-confirmed`
- `backup-oncall-confirmed`
- `watch-window-owner-confirmed`
- `decision-owner-confirmed`

Checkpoint ini hanya membuktikan bahwa role sudah dikonfirmasi terhadap artefak roster eksternal; checkpoint tidak menyimpan nama orang, nomor telepon, atau tabel shift.

Repo **tidak** menyimpan:

- nama owner aktif
- kontak pribadi atau nomor telepon
- jadwal shift
- roster operasional lengkap

Roster owner lengkap tetap berada di luar repo sebagai artefak operasional terpisah. Kontrak di repo hanya memastikan bahwa ketika artefak eksternal tersebut digunakan, engineering dan operations memiliki schema yang sama untuk menandai role requirement, confirmation checkpoint, dan status outcome.

Pemisahan tanggung jawab harus tetap eksplisit:

- **Role requirements kept in repo:** definisi role yang wajib ada untuk workstream atau launch checkpoint
- **Confirmation checkpoints kept in repo:** status dan evidence bahwa role tersebut sudah dikonfirmasi terhadap roster eksternal
- **Actual owner roster stored externally:** nama owner, kontak, assignment harian, dan shift coverage aktual

## Deliverables

- Satu design doc follow-up yang menyatukan split scope, workstream, outcome model, dan owner roster contract.
- Satu atau lebih artefak repo-level ringan untuk status tracking follow-up, bila dibutuhkan pada implementasi.
- Evidence references atau verification notes per workstream.
- Kontrak field/status yang dapat dipakai untuk sinkronisasi dengan roster operasional di luar repo.

## Proposed execution order

1. Tetapkan kontrak status dan checkpoint confirmation agar semua workstream memakai model yang sama.
2. Jalankan `Gate / check-in verification` sebagai beta-critical gate pertama.
3. Jalankan `Ticket print / download / QR fulfillment verification` sebagai beta-critical gate kedua.
4. Konfirmasi kedua workstream beta-critical mencapai status `PASS` sebelum beta test dimulai.
5. Jalankan `Route smoke expansion` untuk menangkap failure permukaan lebih awal pada follow-up non-blocking.
6. Jalankan `POS status and cashier return flow` untuk memastikan retry/return semantics aman.
7. Jalankan `Waitlist verification` untuk melengkapi coverage follow-up pada area customer/admin yang tersisa.
8. Tutup dengan sinkronisasi evidence dan pembaruan status akhir terhadap owner roster contract.

Urutan ini memprioritaskan semua gate yang kini beta-critical lebih dulu, lalu melanjutkan hardening non-blocking setelah syarat mulai beta test sudah terpenuhi.

## Testing / evidence model

Semua follow-up harus evidence-driven. Bukti dapat berupa hasil command, hasil route smoke, catatan verifikasi UI/flow, atau verification note yang merujuk ke outcome nyata. Pembacaan kode saja tidak cukup untuk menyatakan suatu workstream selesai.

Aturan model evidence:

- setiap workstream harus punya minimal satu bukti run atau outcome nyata
- setiap hasil harus dipetakan ke status akhir yang eksplisit
- workstream beta-critical harus dipetakan ke status `PASS` atau non-`PASS`, bukan hanya `done`
- gap yang belum ditutup harus dicatat sebagai open issue atau `risk-accepted`, bukan dibiarkan implicit
- checkpoint confirmation harus menyatakan role yang perlu mengonfirmasi, bukan nama individu di repo
- referensi ke roster owner aktual harus menunjuk artefak eksternal bila diperlukan, tanpa menyalin isi roster ke repo

## Success criteria

- Dokumen ini jelas menggantikan framing lama yang sepenuhnya non-blocking.
- Gate/check-in serta ticket print/download/QR fulfillment terdokumentasi jelas sebagai workstream **beta-critical** yang harus `PASS` sebelum beta test dimulai.
- Semua workstream memiliki outcome definition, evidence expectation, dan status model yang konsisten.
- Kontrak owner roster tegas: roster lengkap tetap di luar repo, repo hanya menyimpan role requirements, confirmation checkpoints, dan status fields.
- Contract field minimum dan checkpoint minimum untuk owner roster terlihat konsisten di seluruh dokumen repo yang relevan.
- Follow-up menghasilkan bukti tambahan yang cukup untuk memperkecil risiko operasional tanpa memperluas scope menjadi launch-ops package penuh.
- Tidak ada ambiguity tentang apa yang harus dilacak di repo versus apa yang harus dikelola di artefak operasional eksternal.
