# 🚀 Quick Start - Demo Login

## Halaman Login Demo Mode

Untuk memudahkan demo dan testing, halaman login sekarang dilengkapi dengan **Quick Login** yang memungkinkan login dengan 1 klik tanpa perlu mengetik email dan password.

---

## 📸 Fitur Demo Mode

### ✨ Quick Login Buttons

Halaman login menampilkan tombol-tombol untuk setiap akun demo yang tersedia, dikelompokkan berdasarkan role:

#### 1. **Admin** (Merah)
- Admin Gelaran Solo

#### 2. **Organizers** (Biru)
- Taman Sriwedari
- GOR Manahan
- Solo Creative Hub
- Solo Music Fest
- Solo Nightlife

#### 3. **Customers** (Hijau)
- Budi Santoso
- Siti Nurhaliza
- Ahmad Rizki

---

## 🎯 Cara Menggunakan

### Opsi 1: Quick Login (1-Click) ⚡

1. Buka halaman `/login`
2. Klik tombol akun yang ingin digunakan
3. Otomatis login dan redirect ke dashboard

**Sangat mudah! Tidak perlu mengetik apapun.**

### Opsi 2: Manual Login

1. Klik "atau login manual"
2. Masukkan email dan password
3. Password untuk semua akun: `password123`

---

## 🎨 Tampilan Demo Mode

```
┌─────────────────────────────────────┐
│         🔔 Demo Mode Alert          │
│  Klik tombol akun untuk login      │
│  Password: password123              │
│  [Sembunyikan Akun Demo]            │
└─────────────────────────────────────┘

┌─────────────────────────────────────┐
│  🛡️ Admin                           │
│  ┌─────────────────────────────┐   │
│  │ Admin Gelaran Solo          │   │
│  │ admin@gelaran.id            │   │
│  └─────────────────────────────┘   │
└─────────────────────────────────────┘

┌─────────────────────────────────────┐
│  💼 Organizers                      │
│  ┌─────────────────────────────┐   │
│  │ Taman Sriwedari             │   │
│  │ info@sriwedari.solo.go.id   │   │
│  └─────────────────────────────┘   │
│  ┌─────────────────────────────┐   │
│  │ GOR Manahan                 │   │
│  │ info@gormanahan.solo.go.id  │   │
│  └─────────────────────────────┘   │
│  ... (3 more)                       │
└─────────────────────────────────────┘

┌─────────────────────────────────────┐
│  🛍️ Customers                       │
│  ┌─────────────────────────────┐   │
│  │ Budi Santoso                │   │
│  │ budi.santoso@email.com      │   │
│  └─────────────────────────────┘   │
│  ... (2 more)                       │
└─────────────────────────────────────┘

────── atau login manual ──────

Email: [________________]
Password: [________________]

[Masuk]
```

---

## 🔧 Konfigurasi

### Menonaktifkan Demo Mode (Production)

Untuk production, Anda bisa:

**Opsi 1:** Set environment variable
```env
NEXT_PUBLIC_DEMO_MODE=false
```

**Opsi 2:** Edit `app/(auth)/login/page.tsx`
```typescript
const [showDemoMode, setShowDemoMode] = useState(false); // ubah dari true ke false
```

---

## 💡 Tips

1. **Toggle Demo Mode:** Klik "Sembunyikan Akun Demo" untuk menyembunyikan tombol quick login
2. **Warna-warni:** Setiap role punya warna berbeda untuk mudah dibedakan
3. **Hover Effect:** Tombol akan berubah warna saat di-hover
4. **Loading State:** Tombol disabled saat sedang proses login

---

## 🎬 Demo Workflow

### Scenario 1: Test sebagai Customer
```
1. Buka /login
2. Klik tombol "Budi Santoso" (hijau)
3. Otomatis login dan redirect ke homepage
4. Bisa langsung browse events dan beli tiket
```

### Scenario 2: Test sebagai Organizer
```
1. Buka /login
2. Klik tombol "Taman Sriwedari" (biru)
3. Otomatis login dan redirect ke dashboard organizer
4. Bisa langsung manage events
```

### Scenario 3: Test sebagai Admin
```
1. Buka /login
2. Klik tombol "Admin Gelaran Solo" (merah)
3. Otomatis login dan redirect ke admin panel
4. Bisa manage seluruh platform
```

---

## 📱 Responsive Design

- **Desktop:** Tampilan grid untuk quick login buttons
- **Mobile:** Stack vertical, mudah di-tap
- **Tablet:** Optimized untuk landscape dan portrait

---

## ✅ Best Practices

### Untuk Demo/Presentation:
- ✅ Biarkan Demo Mode aktif
- ✅ Gunakan Quick Login untuk switch antar akun dengan cepat
- ✅ Perlihatkan berbagai role (admin, organizer, customer)

### Untuk Development:
- ✅ Gunakan Quick Login untuk testing cepat
- ✅ Test semua akun untuk memastikan authorization works
- ✅ Verifikasi redirect ke dashboard yang benar

### Untuk Production:
- ❌ Nonaktifkan Demo Mode
- ❌ Jangan deploy dengan quick login buttons
- ✅ Gunakan environment variable untuk control

---

## 🔒 Security Notes

⚠️ **PENTING:** 
- Demo mode HANYA untuk development dan demo
- Password `password123` TIDAK aman untuk production
- Pastikan demo mode disabled di production
- Gunakan password yang kuat untuk production users

---

## 📚 Related Documentation

- [SEED-DATA.md](./SEED-DATA.md) - Complete list of demo accounts
- [README.md](./README.md) - Main project documentation

---

**Happy Testing! 🎉**
