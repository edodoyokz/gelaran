# Catatan Implementasi BSC Platform

## Sudah Dikerjakan

### Seating & Checkout
- Seating chart builder organizer (`app/organizer/events/[id]/seating/page.tsx`) lengkap dengan CRUD section/row/seat.
- Seat selector untuk customer (`components/seating/SeatSelector.tsx`) dan integrasi di `EventDetailView` (checkout pakai kursi).
- Checkout seat lock + pricing seat-based (`app/checkout/page.tsx`).
- Booking API mendukung `seatIds` + `seatSessionId` dan menautkan seat ke booked ticket (`app/api/bookings/route.ts`).
- Validator booking diperbarui (`lib/validators/index.ts`).

### Organizer Dashboard
- `/organizer/events/[id]/attendees` - Halaman daftar attendees
- `/organizer/events/[id]/promo-codes` - Halaman manajemen promo codes
- `/organizer/events/[id]/analytics` - Halaman analytics event
- `/organizer/team` - Halaman manajemen tim organizer

### Admin Dashboard
- `/admin/refunds` - Halaman manajemen refund requests
- `/admin/reviews` - Halaman moderasi reviews
- `/admin/analytics` - Halaman analytics platform

### User Features
- `/notifications` - Halaman notifikasi user
- `/following` - Halaman daftar organizer yang diikuti
- `/my-bookings/[code]/ticket` - Halaman view & download tiket dengan QR code
- `/my-bookings/[code]/refund` - Halaman request refund dengan form dan riwayat

### Public Pages
- `/organizers/[slug]` - Halaman profil publik organizer dengan:
  - Info organizer (logo, banner, deskripsi, social links)
  - Stats (total events, followers, tickets sold, rating)
  - Follow/unfollow functionality
  - Daftar upcoming dan past events
  - API: `GET /api/organizers/[slug]` dan `/api/organizers/[slug]/follow` (POST/DELETE)

### Components
- `ReviewSection.tsx` - Komponen untuk menampilkan daftar reviews dengan stats dan rating distribution
- `ReviewForm.tsx` - Komponen form untuk submit review dengan star rating
- Export via `components/features/reviews/index.ts`
- `ReviewSection` terintegrasi ke `EventDetailView.tsx`

### Wishlist
- `/api/wishlist` - API list wishlist (GET), add to wishlist (POST), remove (DELETE)
- `/api/wishlist/[eventId]` - API check wishlist status (GET), remove specific (DELETE)
- Wishlist toggle button di `EventDetailView.tsx`

### Seat Release
- Seats direlease saat booking dibatalkan (`app/api/my-bookings/[code]/route.ts`)
- Seats direlease saat booking expire (`app/api/cron/cleanup-expired-bookings/route.ts`)

### Email Notifications
- Notifikasi email ke followers saat event dipublish (`app/api/admin/events/[id]/route.ts`)
- Email dikirim ke semua follower dengan `notifyNewEvents: true`

## Catatan Teknis
- Checkout kini menerima `seats` dan mengunci kursi via `/api/events/[slug]/seats`.
- Booking API memvalidasi seat lock dan menandai seat jadi `BOOKED`.
- Alur pembayaran (Midtrans/transaction) belum diubah; tetap berdasarkan total tiket.
- Review API sudah ada di `/api/events/[slug]/reviews` (GET/POST/PUT/DELETE).
- Organizer follow menggunakan tabel `OrganizerFollower`.

## Rekomendasi Next Steps
1. ~~Integrasi `ReviewSection` ke halaman event detail (`EventDetailView`)~~ ✅
2. ~~Tambahkan release seats pada cancel/expire booking~~ ✅
3. ~~Implementasi email notification untuk follower saat organizer buat event baru~~ ✅
4. ~~Tambahkan fitur wishlist di event detail~~ ✅

## Possible Future Enhancements
1. Tambahkan fitur share event ke social media
2. Implementasi in-app notification (push notification)
3. Tambahkan fitur recurring events
4. Implementasi multi-language support
