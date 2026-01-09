Product Requirements Document (PRD): BSC
Atribut	Deskripsi
Versi Dokumen	1.0
Status	Draft
Tipe Produk	Multi-Vendor Event Ticketing System
Target Launch	Beta (Januari 2026)
1. Ringkasan Eksekutif (Executive Summary)

Membangun platform manajemen acara dan penjualan tiket berbasis web yang memungkinkan Multi-Organizer. Platform ini memungkinkan penyelenggara acara (Organizer) untuk membuat acara, menjual tiket, mengelola kursi (seating), dan memeriksa kehadiran (check-in). Pemilik platform (Admin) mendapatkan keuntungan melalui komisi dari setiap tiket yang terjual.
2. User Personas (Aktor)

Sistem ini akan memiliki 4 aktor utama:

    Super Admin (Platform Owner): Mengelola seluruh website, pengguna, pengaturan komisi, pembayaran (payouts), dan konten statis.

    Organizer (Penyelenggara): Mendaftar untuk membuat event, mengelola penjualan, melihat laporan, dan request pencairan dana.

    Customer (Pembeli): Mencari event, memilih kursi, membeli tiket, dan mengakses riwayat tiket.

    Scanner/Doorman: Akun khusus (atau fitur di app) untuk memindai QR Code tiket saat hari H.

3. Fitur Utama (Core Functional Requirements)

Fitur ini dipetakan langsung dengan kapabilitas Eventmie Pro FullyLoaded.
A. Manajemen Event (Event Management)

    Tipe Event: Online (Webinar/Zoom integration), Offline (Venue), dan Recurring Events (Acara berulang mingguan/bulanan).

    Detail Event: Deskripsi kaya (Rich text), Galeri foto, Video trailer, Google Maps integration untuk lokasi.

    Seating Chart (Fitur Kunci FullyLoaded):

        Organizer dapat membuat layout kursi custom (row & column).

        Tier harga berbeda untuk setiap zona kursi (VIP, Regular, Balcony).

    Jadwal (Schedules): Dukungan untuk acara multihari dengan jadwal berbeda.

B. Booking & Checkout

    Alur Pembelian: Pilih Event -> Pilih Tanggal -> Pilih Kursi/Jumlah -> Checkout -> Pembayaran -> Tiket Terbit.

    Countdown Timer: Timer saat checkout untuk menahan kursi agar tidak dipesan orang lain (concurrency handling).

    Guest Checkout: Opsi beli tanpa login (opsional, tapi disarankan mewajibkan login untuk data retention).

    Kupon & Diskon: Kode promo yang bisa diatur oleh Organizer atau Admin.

    Pajak & Biaya Admin: Penambahan pajak (Tax) dan biaya layanan otomatis di checkout.

C. Tiket & Check-in

    Format Tiket: PDF otomatis yang berisi QR Code unik dan detail acara.

    QR Scanning: Modul untuk memindai tiket valid/tidak valid/sudah dipakai.

    RSVP: Formulir konfirmasi kehadiran.

D. Keuangan & Monetisasi (Multi-Vendor Logic)

    Komisi Admin: Admin dapat mengatur % komisi per tiket yang terjual.

    Wallet Organizer: Saldo organizer bertambah saat tiket terjual (dikurangi komisi admin).

    Payout Request: Organizer mengajukan penarikan dana ke Admin. Admin menyetujui dan mentransfer manual/otomatis.

    Split Payment (Opsional/Advanced): Integrasi gateway seperti Stripe Connect/Xendit untuk split otomatis.

E. Fitur Tambahan (Marketing & Content)

    Review & Rating: User bisa mereview event setelah acara selesai.

    Blog Module: Untuk keperluan SEO platform.

    Contact Organizer: Fitur chat atau formulir kontak ke penyelenggara.

    Social Share: Tombol share ke WA/FB/Twitter.

4. Struktur Modul & Detail Fungsional
I. Panel Super Admin

    Dashboard: Total Sales, Total Events, Top Organizers, Recent Bookings.

    Manage Users: Ban/Unban user, Verifikasi Organizer.

    Manage Events: Approve/Reject event yang dibuat organizer (Moderasi).

    Bookings: Lihat semua transaksi, Refund tiket, Cancel order.

    Payouts: Daftar request pencairan dana dari Organizer, status (Paid/Pending).

    Settings:

        Global Commission (%).

        Currency & Language.

        Payment Gateway API Keys.

        Email SMTP Settings.

II. Panel Organizer

    Dashboard: Grafik penjualan, Tiket terjual, Total pendapatan bersih.

    Create/Edit Event Wizard:

        Step 1: Info Dasar (Nama, Kategori).

        Step 2: Media (Poster, Video).

        Step 3: Lokasi & Waktu.

        Step 4: Tiket (Gratis/Berbayar, Variasi, Stok).

        Step 5: Seating Chart (Drag & drop creator).

    My Bookings: Daftar pembeli tiket event mereka.

    Check-in Tools: Akses ke scanner web-based.

    Financial: Request Payout, Setup akun bank penerima.

III. Frontend (Customer View)

    Homepage: Hero banner, Featured events, Search bar, Filter (Date, Category, Location).

    Event Page: Tampilan detail, sticky "Book Now" button, sisa tiket.

    User Profile:

        My Tickets: Download PDF, lihat QR Code.

        Wishlist: Event yang disimpan.

        Change Password.

5. Rekomendasi Technical Stack

Mengingat preferensi Anda pada Node.js dan Linux, berikut adalah rekomendasi stack yang setara atau lebih performan dari Eventmie (yang berbasis Laravel):

    Backend: Node.js (NestJS atau Express). NestJS sangat disarankan untuk struktur enterprise yang rapi seperti Eventmie.

    Database: PostgreSQL (Relational DB sangat wajib untuk integritas transaksi tiket & booking).

    Frontend: Next.js (React) atau Vue.js. Menggunakan SSR (Server Side Rendering) sangat penting untuk SEO event.

    ORM: Prisma atau TypeORM.

    Infrastructure: Docker container di VPS Linux (Ubuntu), atau deploy ke Vercel (Frontend) + Render/Railway (Backend).

    Payment Gateway: Midtrans atau Xendit (untuk pasar Indonesia), Stripe (Global).

    PDF Generator: puppeteer atau pdfkit (Node.js).

6. Non-Functional Requirements (NFR)

    Concurrency: Sistem harus menangani "Race Condition" saat 2 orang memilih kursi yang sama di waktu bersamaan (Database locking).

    Security: Proteksi terhadap IDOR (agar user tidak bisa download tiket orang lain) dan SQL Injection.

    Scalability: Siap menangani lonjakan traffic saat "Ticket War".

    Performance: Load time halaman event < 2 detik.

7. Roadmap Pengembangan (Target Jan 2026)

    Phase 1 (Core - Bulan 1-2): Setup DB, Auth (Admin/Org/User), CRUD Event sederhana, Basic Booking.

    Phase 2 (Commerce - Bulan 3-4): Integrasi Payment Gateway, PDF Ticket Generation, QR Code logic.

    Phase 3 (Complex Features - Bulan 5-6): Seating Chart System (ini paling rumit), Recurring Events, Wallet/Payout system.

    Phase 4 (Refinement - Bulan 7-8): Admin Dashboard Analytics, Email Notifications, Scanner App/Page.

    Phase 5 (Testing & Beta): Load testing, Security audit, Deploy Beta.
