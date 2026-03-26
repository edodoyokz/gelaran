# Gelaran UI Color Palette Reference

Dokumen ini berisi detail palet warna resmi dari *brand guideline* yang digunakan sebagai referensi untuk proses *redesign* UI project BSC-FINAL.

## 1. Core Brand Colors

### 🟠 Primary Orange (Aksen / Action)
Warna ini cocok digunakan untuk elemen *Call to Action* (CTA), border aktif, dan *highlight* penting.
- **HEX**: `#F95D00`
- **RGB**: `249, 93, 0`
- **CMYK**: `0, 78, 100, 0`
- **LAB**: `61, 58, 70`
- **Grayscale**: `49`

### 🟡 Primary Yellow (Warning / Secondary Accent)
Digunakan sebagai warna sekunder, *warning state*, atau kombinasi gradien dengan Primary Orange.
- **HEX**: `#FBC117`
- **RGB**: `251, 193, 23`
- **CMYK**: `2, 25, 98, 0`
- **LAB**: `82, 12, 79`
- **Grayscale**: `25`

### 🟢 Dark Teal (Primary Base / Dark Mode Surface)
Cocok digunakan sebagai warna teks utama (*primary text*) pada tema terang, latar belakang (*background*) pada tema gelap, atau elemen solid *header*.
- **HEX**: `#015959`
- **RGB**: `1, 89, 89`
- **CMYK**: `91, 46, 58, 29`
- **LAB**: `34, -24, -7`
- **Grayscale**: `75`

### 🔵 Light Teal (Info / UI Elements / Accents)
Digunakan sebagai penyeimbang visual, tautan teks (*links*), fokus borders (*focus rings*), dan aksen pendukung.
- **HEX**: `#29B3B6`
- **RGB**: `41, 179, 182`
- **CMYK**: `73, 5, 32, 0`
- **LAB**: `66, -36, -13`
- **Grayscale**: `46`

---

## 2. Rekomendasi Pemetaan ke Variabel CSS (UI Design System)

Untuk mengaplikasikan palet ini ke dalam Tailwind CSS / `globals.css` di Next.js:

### Light Mode Mapping
```css
:root {
  --accent-primary: #015959;        /* Dark Teal untuk elemen CTA utama/Header */
  --accent-primary-hover: #014A4A; 
  --accent-secondary: #F95D00;      /* Orange untuk secondary action */
  --text-link: #29B3B6;             /* Light teal untuk links */
  --border-focus: #29B3B6;
  --accent-gradient: linear-gradient(135deg, #015959 0%, #29B3B6 100%);
}
```

### Dark Mode Mapping
```css
.dark {
  --accent-primary: #29B3B6;        /* Light Teal karena lebih kontras di dark mode */
  --accent-primary-hover: #4EDEE1;
  --accent-secondary: #FBC117;      /* Yellow/Orange untuk aksen kontras neon */
  --text-link: #FBC117; 
  --border-focus: #29B3B6;
  --accent-gradient: linear-gradient(135deg, #29B3B6 0%, #FBC117 100%);
}
```

Rekomendasi *tools* yang terpengaruh dalam *redesign* meliputi: 
- *Buttons*, *Badges*, *Focus Rings*, *Links*, dan komponen *Glassmorphism* gradient.*
