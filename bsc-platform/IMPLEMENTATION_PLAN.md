# Catatan Implementasi BSC Platform

## Sudah Dikerjakan
- Seating chart builder organizer (`app/organizer/events/[id]/seating/page.tsx`) lengkap dengan CRUD section/row/seat.
- Seat selector untuk customer (`components/seating/SeatSelector.tsx`) dan integrasi di `EventDetailView` (checkout pakai kursi).
- Checkout seat lock + pricing seat-based (`app/checkout/page.tsx`).
- Booking API mendukung `seatIds` + `seatSessionId` dan menautkan seat ke booked ticket (`app/api/bookings/route.ts`).
- Validator booking diperbarui (`lib/validators/index.ts`).
- Halaman attendees (`app/organizer/events/[id]/attendees/page.tsx`) lengkap dengan filter, search, export.
- Halaman ticket PDF (`app/my-bookings/[code]/ticket/page.tsx`) lengkap dengan tampilan QR dan download PDF.
- Halaman refund customer (`app/my-bookings/[code]/refund/page.tsx`) lengkap dengan form ajukan dan riwayat.
- Halaman admin refunds (`app/admin/refunds/page.tsx`) lengkap dengan filter, status, dan approval actions.
- Halaman admin reviews (`app/admin/reviews/page.tsx`) lengkap dengan CRUD untuk moderation ulasan.
- Halaman organizer team (`app/organizer/team/page.tsx`) lengkap dengan manajemen anggota tim.
- Halaman admin analytics (`app/admin/analytics/page.tsx`) lengkap dengan dashboard finansial.
- Halaman notifications (`app/notifications/page.tsx`) lengkap dengan manajemen notifikasi.
- Halaman following (`app/following/page.tsx`) lengkap dengan daftar organizer yang diikuti.
- Halaman promo codes organizer (`app/organizer/events/[id]/promo-codes/page.tsx`) lengkap dengan CRUD dan tracking usage.
- Halaman event analytics organizer (`app/organizer/events/[id]/analytics/page.tsx`) lengkap dengan statistik penjualan tiket.

## Catatan Teknis
- Checkout kini menerima `seats` dan mengunci kursi via `/api/events/[slug]/seats`.
- Booking API memvalidasi seat lock dan menandai seat jadi `BOOKED`.
- Alur pembayaran (Midtrans/transaction) belum diubah; tetap berdasarkan total tiket.

## Rekomendasi Next Steps
- Lanjut ke implementasi fitur tambahan atau testing.
