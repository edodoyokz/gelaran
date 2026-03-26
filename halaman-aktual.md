# Daftar Halaman Aktual - Project BSC

Dokumen ini berisi daftar semua rute (routes) yang tersedia di aplikasi berdasarkan struktur direktori `app`.

## 🌐 Publik & Umum
- `/` - Home Page
- `/about` - Tentang Kami
- `/contact` - Hubungi Kami
- `/become-organizer` - Jadi Penyelenggara
- `/following` - Mengikuti Penyelenggara
- `/notifications` - Notifikasi
- `/privacy` - Kebijakan Privasi
- `/terms` - Syarat & Ketentuan

## 🔐 Autentikasi
- `/login` - Masuk
- `/register` - Daftar
- `/forgot-password` - Lupa Password
- `/reset-password` - Reset Password

## 🎟️ Event & Tiket
- `/events` - Jelajah Event
- `/events/[slug]` - Detail Event
- `/events/[slug]/faq` - FAQ Event
- `/organizers/[slug]` - Profil Penyelenggara
- `/tickets/transfer/accept` - Terima Transfer Tiket

## 👤 Area Pelanggan (Customer)
- `/dashboard` - Dashboard Pelanggan
- `/profile` - Pengaturan Profil
- `/wishlist` - Event Difavoritkan
- `/my-bookings` - Riwayat Pemesanan
- `/my-bookings/[code]` - Detail Pemesanan
- `/my-bookings/[code]/ticket` - E-Tiket
- `/my-bookings/[code]/refund` - Pengajuan Refund

## 🛒 Checkout & Pembayaran
- `/checkout` - Proses Pembayaran
- `/checkout/success` - Pembayaran Berhasil
- `/checkout/pending` - Pembayaran Menunggu
- `/checkout/failed` - Pembayaran Gagal

## 🏢 Panel Penyelenggara (Organizer)
- `/organizer` - Dashboard Penyelenggara
- `/organizer/settings` - Pengaturan Akun Organizer
- `/organizer/team` - Manajemen Tim
- `/organizer/events` - Daftar Event Saya
- `/organizer/events/new` - Buat Event Baru
- `/organizer/events/[id]` - Dashboard Detail Event
- `/organizer/events/[id]/edit` - Edit Event
- `/organizer/events/[id]/analytics` - Analitik Event
- `/organizer/events/[id]/attendees` - Daftar Peserta
- `/organizer/events/[id]/faq` - Kelola FAQ Event
- `/organizer/events/[id]/gate` - Kelola Akses Pintu
- `/organizer/events/[id]/promo-codes` - Kode Promo
- `/organizer/events/[id]/seating` - Manajemen Tempat Duduk
- `/organizer/gate` - Dashboard Gate
- `/organizer/wallet` - Dompet Organizer
- `/organizer/wallet/bank-account` - Pengaturan Rekening
- `/organizer/wallet/withdraw` - Penarikan Dana

## 🛡️ Panel Admin
- `/admin` - Dashboard Utama
- `/admin/analytics` - Statistik Platform
- `/admin/bookings` - Semua Pemesanan
- `/admin/bookings/[id]` - Detail Pemesanan (Admin)
- `/admin/categories` - Manajemen Kategori
- `/admin/complimentary-requests` - Permintaan Tiket Gratis
- `/admin/events` - Manajemen Semua Event
- `/admin/events/[id]` - Moderasi Event
- `/admin/finance` - Laporan Keuangan
- `/admin/landing-page` - Pengaturan Halaman Utama
- `/admin/payouts` - Manajemen Pembayaran ke Penyelenggara
- `/admin/refunds` - Manajemen Pengembalian Dana
- `/admin/reviews` - Manajemen Ulasan
- `/admin/settings` - Pengaturan Sistem
- `/admin/users` - Manajemen Pengguna
- `/admin/users/[id]` - Detail & Kontrol Pengguna
- `/admin/venues` - Manajemen Lokasi/Venue

## 📖 Dokumentasi (Docs)
- `/docs` - Beranda Dokumentasi
- `/docs/admin` - Panduan Admin
- `/docs/customer` - Panduan Pelanggan
- `/docs/organizer` - Panduan Penyelenggara

## 🛠️ Alat & Operasional
- `/scanner` - Scan Tiket (Umum)
- `/gate` - Gate Management
- `/gate/access` - Gate Access Control
- `/pos` - Point of Sale Dashboard
- `/pos/access` - POS Access
