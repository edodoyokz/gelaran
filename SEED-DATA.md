# 🎫 GELARAN - Seed Data Documentation

## 📊 Solo/Surakarta Event Platform

Platform ini sudah di-seed dengan data event dan aktivitas di Kota Solo/Surakarta.

---

## 🔧 Cara Menjalankan Seed

### Opsi 1: Reset Database dan Seed (RECOMMENDED)

```bash
npx prisma migrate reset
```

**Proses ini akan:**
1. Drop semua tabel
2. Re-run migrations
3. Run seed script otomatis
4. Hash password untuk semua user

### Opsi 2: Manual Seed

```bash
npx tsx prisma/seed.ts
```

**NOTE:** Jika sudah ada data, akan error. Gunakan Opsi 1 untuk reset total.

---

## 🔑 Login Credentials

**Password untuk SEMUA user:**
```
password123
```

### Admin
- **Email:** `admin@gelaran.id`
- **Password:** `password123`
- **Role:** SUPER_ADMIN

### Organizers
| Email | Organisasi |
|-------|------------|
| `info@sriwedari.solo.go.id` | Taman Sriwedari Solo |
| `info@gormanahan.solo.go.id` | GOR Manahan Solo |
| `hello@solocreativehub.id` | Solo Creative Hub |
| `contact@solomusicfest.id` | Solo Music Fest |
| `party@solonightlife.id` | Solo Nightlife Events |

### Customers
| Email | Nama |
|-------|------|
| `budi.santoso@email.com` | Budi Santoso |
| `siti.nur@email.com` | Siti Nurhaliza |
| `ahmad.rizki@email.com` | Ahmad Rizki |

---

## 📅 Event yang Tersedia

### 1. 🎭 Pertunjukan Wayang Orang Sriwedari - Rama Tambak
- **Tanggal:** 15 Februari 2026, 19:30 - 22:00
- **Lokasi:** Taman Sriwedari, Jl. Slamet Riyadi No.275
- **Tiket:**
  - Reguler: Rp 50,000
  - VIP: Rp 100,000
- **Organizer:** Taman Sriwedari Solo

### 2. 🏀 Pertandingan Basket: Satria Muda vs Pelita Jaya
- **Tanggal:** 20 Februari 2026, 18:00 - 21:00
- **Lokasi:** GOR Manahan, Jl. Menteri Supeno No.14
- **Tiket:**
  - Tribun: Rp 75,000
  - VIP: Rp 150,000
- **Organizer:** GOR Manahan Solo

### 3. 📚 Seminar Nasional: Digital Transformation untuk UMKM
- **Tanggal:** 25 Februari 2026, 08:00 - 16:00
- **Lokasi:** Solo Paragon Hotel & Convention, Jl. Yosodipuro No.111
- **Tiket:**
  - Early Bird: Rp 150,000
  - Regular: Rp 250,000
- **Organizer:** Solo Creative Hub

### 4. 🎵 Solo Indie Gigs: Featuring Efek Rumah Kaca & Hindia
- **Tanggal:** 1 Maret 2026, 18:00 - 23:00
- **Lokasi:** De Tjolomadoe, Jl. Adi Sumarmo, Paulan, Karanganyar
- **Tiket:**
  - Presale: Rp 200,000
  - Regular: Rp 300,000
- **Organizer:** Solo Music Fest

### 5. 🎉 New Year Party 2026: Sky Lounge Edition
- **Tanggal:** 31 Desember 2026, 20:00 - 03:00
- **Lokasi:** The Sunan Hotel Solo, Jl. Adi Sucipto No.47
- **Tiket:**
  - Regular Pass: Rp 500,000
  - VIP Pass: Rp 1,000,000
- **Organizer:** Solo Nightlife Events

---

## 🛒 Bookings (Sample Transactions)

### Existing Paid Bookings:

1. **Budi Santoso** - Wayang Orang
   - 2 tiket (1 Reguler + 1 VIP)
   - Total: Rp 174,825
   - Status: PAID ✅

2. **Siti Nurhaliza** - Basket
   - 3 tiket (Tribun)
   - Total: Rp 262,262.5
   - Status: PAID ✅

3. **Ahmad Rizki** - Seminar
   - 1 tiket (Early Bird)
   - Total: Rp 174,825
   - Status: PAID ✅

4. **Budi Santoso** - Indie Gigs
   - 2 tiket (Presale)
   - Total: Rp 466,200
   - Status: PAID ✅

---

## 🏢 Venues

| Venue | Lokasi | Kapasitas |
|-------|--------|-----------|
| Taman Sriwedari | Jl. Slamet Riyadi No.275 | 500 |
| GOR Manahan | Jl. Menteri Supeno No.14 | 10,000 |
| Solo Paragon Hotel | Jl. Yosodipuro No.111 | 800 |
| The Sunan Hotel | Jl. Adi Sucipto No.47 | 500 |
| De Tjolomadoe | Jl. Adi Sumarmo, Paulan | 1,000 |

---

## 📂 Categories

- 🎭 Seni & Budaya
- 🏀 Olahraga
- 📚 Seminar & Workshop
- 🎵 Musik
- 🎉 Party & Hiburan

---

## 💰 Pricing Configuration

- **Tax Rate:** PPN 11% (PERCENTAGE)
- **Default Commission:** 5% platform fee
- **Payment Gateway Fee:** 2.9% (configured in code)

---

## 🚀 Quick Start

```bash
# 1. Reset database dan seed
npx prisma migrate reset

# 2. Login sebagai admin
Email: admin@gelaran.id
Password: password123

# 3. Explore events di Solo!
```

---

## 📝 Notes

- Semua user menggunakan password yang sama: `password123`
- Password di-hash menggunakan bcryptjs (10 rounds)
- Data ini cocok untuk demo dan development
- Untuk production, gunakan password yang kuat dan unik
