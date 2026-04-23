# Implementation Plan: Audit Improvements

This plan outlines the steps to resolve the issues found during the audit of the Login, Signup, and Landing pages.

## Proposed Changes

### 1. Refactor Logic Auth (Login Page)

**File:** `app/(auth)/login/page.tsx`

**Tindakan:**
- Buat sebuah single helper asinkron (misalnya `doLogin(email, password)`) yang membungkus pemanggilan ke `signInWithPassword` milik Supabase.
- Pindahkan logika penanganan pesan error (contoh: string matching untuk "Invalid login credentials" dan "Email not confirmed") ke helper tersebut agar tidak perlu diulangi dua kali secara persis di `handleSubmit` dan `handleQuickLogin`.
- Panggil fungsi helper ini dari kedua event handler tersebut, menyederhanakan kode komponen login.

### 2. Migrasi Validasi Form (Register Page)

**File:** `app/(auth)/register/page.tsx`

**Tindakan:**
- Ubah pendekatan form yang sebelumnya menggunakan kumpulan *state* terisolasi dan validasi manual (contoh: regex cek huruf besar dan panjang string pada `validatePassword`).
- Implementasikan library `react-hook-form` untuk manajemen submission dan state, diintegrasikan dengan resolver dari `zod`.
- Buat file atau blok schema Zod yang mendeskripsikan secara eksplisit policy password (minimum 8 karakter, uppercase, number) serta memastikan `password === confirmPassword` terhitung sebagai kesalahan dalam *schema level*.
- Pasang pesan *error schema* ini ke dalam prop `error` milik komponen `AuthField`.

### 3. Migrasi ke React Server Components (Landing Page)

**File:** `app/page.tsx`

**Tindakan:**
- Hapus *directive* `"use client"` di urutan pertama file.
- Pindahkan *logic data fetching* (seperti ke end-point API categories, events, dll.) menjadi *server-side logic*, memanfaatkan kelebihan komponen asinkron App Router (contoh: ubah dari `useEffect` plus fetch menjadi fungsi `async function HomePage()` dan eksekusi `await fetch(...)` atau *Direct Database Query*).
- Pisahkan kumpulan tombol filter kategori (array logic dan `CategoryPill`) menjadi sub-komponen Client terpisah dan *import* ke dalam halaman (misalnya dengan nama komponen `EventFilterPanel`). Ini dibutuhkan agar bagian interaktif `onClick` dan URL filtering tetap berjalan tanpa menyebabkan seluruh halaman ikut ter-hydrate.
- Ganti baris penangkapan *error* `console.error` yang bersifat kosong dengan kemunculan UI komponen (seperti `EmptyState` namun dengan nuansa galat atau Alert) kepada para *user* jika keseluruhan fetching data terputus di *backend*.
