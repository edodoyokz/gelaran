Penjelasan Detail Tabel & Atribut Kunci

Berikut adalah detail teknis untuk tabel-tabel krusial dalam PostgreSQL:
1. Modul Pengguna (Users & Profiles)

    users: Tabel utama untuk login. Kolom role membedakan antara Admin, Organizer, dan Customer.

    organizer_profiles: Tabel terpisah (One-to-One dengan users) untuk menyimpan data sensitif penyelenggara seperti saldo dompet (wallet_balance) dan info rekening bank untuk pencairan dana.

2. Modul Event & Tiket

    events: Menyimpan data inti acara.

        has_seating_chart (Boolean): Flag penting. Jika true, maka pembelian tiket harus memilih kursi dari tabel SEATS. Jika false, hanya mengurangi stok di TICKET_TYPES.

    ticket_types: Mendefinisikan kelas tiket (VIP, Festival, Early Bird). Harga dan total stok diatur di sini.

3. Modul Seating Chart (Fitur "FullyLoaded")

Ini adalah bagian paling kompleks. Logikanya:

    seat_rows: Organizer membuat baris (Row A, Row B).

    seats: Di dalam baris, ada kursi (A1, A2, A3).

    Setiap seats direlasikan ke ticket_types (ticket_type_id). Mengapa? Agar sistem tahu: "Kursi A1 adalah kursi VIP seharga Rp1.000.000".

    Status Kursi: Saat user mengklik kursi di frontend, status berubah sementara menjadi locked (menggunakan Redis/Cache biasanya) agar tidak diambil orang lain, sebelum akhirnya menjadi booked setelah bayar.

4. Modul Transaksi (Bookings & Attendees)

    bookings: Header transaksi (Invoice). Di sini kita menyimpan snapshot keuangan:

        admin_commission: Berapa potongan admin untuk transaksi ini.

        organizer_net_income: Berapa yang masuk ke dompet organizer.

        Penting: Nilai ini harus disimpan di sini secara permanen (hardcoded saat transaksi) agar jika persentase komisi global berubah di masa depan, data historis tidak ikut berubah.

    booked_tickets (Attendees): Detail per lembar tiket.

        unique_code: String unik (UUID atau hash) yang akan digenerate menjadi QR Code.

        is_checked_in: Flag yang akan diubah oleh Scanner/Doorman app saat hari H.

5. Modul Keuangan (Payouts)

    payouts: Mencatat riwayat penarikan dana oleh Organizer. Admin akan memproses ini, mentransfer uang manual/gateway, lalu mengubah status menjadi processed, yang akan mengurangi wallet_balance di tabel organizer_profiles.

Catatan Implementasi untuk Developer

    Indexing:

        Index pada event_id di hampir semua tabel untuk mempercepat query saat menampilkan halaman event.

        Index pada unique_code di tabel booked_tickets agar proses scanning QR code super cepat (< 100ms).

    Concurrency Control (Penting!):

        Gunakan Database Transaction saat insert ke bookings dan booked_tickets.

        Untuk Seating, gunakan mekanisme "Optimistic Locking" atau Redis TTL key untuk mencegah double booking pada kursi yang sama.

    Soft Deletes:

        Disarankan menambahkan kolom deleted_at di tabel events dan users agar data tidak benar-benar hilang saat dihapus (untuk keperluan audit log).
