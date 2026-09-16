# Sistem Rekap Absensi Muda-Mudi Margosari

> Aplikasi absensi & rekap kehadiran **Muda-Mudi Margosari** — rekap bulanan per anggota, ringkasan kas, insight kehadiran, serta tampilan **print-ready** (A4 landscape).

![Status](https://img.shields.io/badge/status-Private-red) ![Maintained](https://img.shields.io/badge/maintained-yes-brightgreen) ![Platform](https://img.shields.io/badge/platform-Web-blue) ![Language](https://img.shields.io/badge/language-JavaScript-yellow)

---

## Tentang Project

Web ini dibuat untuk mempermudah **pengelolaan data internal** muda-mudi: mencatat kehadiran, memantau kehadiran per anggota, mengelola kas, melihat rekap bulanan, hingga mengekspor laporan — dalam satu aplikasi yang rapi, ringan, dan mudah dipakai di HP maupun laptop.

---

## Fitur Utama

- **Rekap Bulanan** — tabel kehadiran per anggota, grafik per pertemuan, distribusi Hadir/Izin/Alfa, insight (tren vs bulan lalu).
- **Manajemen Kas** — pencatatan masuk/keluar lengkap dengan saldo, cash flow, dan laporan.
- **Data Anggota** — kelola anggota aktif & arsip, detail riwayat per orang.
- **Ekspor Data** — Excel, CSV, dan Print untuk rekap absensi, kas, gabungan, dan anggota.
- **Responsive** — layout terpisah untuk PC & mobile, navigasi bawah ala iOS.

---

## Tampilan Layar

> Tambahkan tangkapan layar di folder `docs/screenshots/`, lalu ganti jalurnya di bawah ini.

| Preview Layar | Preview Print |
| --- | --- |
| ![Preview Layar](docs/screenshots/preview-screen.png) | ![Preview Print](docs/screenshots/preview-print.png) |

---

## Teknologi yang Digunakan

| Bagian | Teknologi |
| --- | --- |
| Struktur & Style | HTML5, CSS3 (variabel desain, media query) |
| Logika | JavaScript (vanilla, tanpa framework / build-step) |
| Backend | Firebase — Authentication + Firestore (realtime, offline cache) |
| Ekspor file | SheetJS (XLSX), jsPDF, JSZip |
| Font | Google Fonts (Zilla Slab, IBM Plex Sans, IBM Plex Mono) |

> Project ini **tidak memakai** React/Vue/Tailwind/Node build — cukup buka di browser.

---

## Cara Instalasi & Menjalankan

Project ini murni **file statis** (tanpa build). Ikuti langkah berikut:

```bash
# 1. Clone repository
git clone <url-repository-anda>
cd <nama-folder-project>

# 2. (Opsional) Sajikan lewat server statis
npx serve .
# atau dengan Python:
# python -m http.server 8080
```

1. **Siapkan Firebase** — buat project Firebase, aktifkan *Authentication* (Email/Password) dan *Firestore*.
2. **Ganti konfigurasi** — ubah `firebaseConfig` di bagian atas `index.html` dengan milik Anda.
3. **Buat akun** — tambahkan pengguna di Firebase Auth, lalu sesuaikan pemetaan `USERNAME_MAP` di `js/auth.js`.
4. **Buka** `http://localhost:8080` (atau buka `index.html` langsung di browser).

> Catatan: atur *Firestore Security Rules* agar hanya pengguna yang sudah login yang bisa mengakses data sebelum dipakai produksi.

---

## Struktur Direktori

```
.
├── index.html              # Markup utama (shell PC & Mobile, semua halaman/modal)
├── css/
│   ├── base.css            # Variabel desain (warna, radius, shadow) & style dasar
│   ├── layout.css          # Layout shell, sidebar, bottom-nav, responsive
│   ├── components.css      # Komponen UI umum (tombol, badge, popup)
│   └── modules.css         # Style spesifik per modul (kas, rekap, tentang, dll)
├── js/
│   ├── boot.js             # Inisialisasi aplikasi & pengecekan status login
│   ├── auth.js             # Login/logout via Firebase Authentication
│   ├── firebase.js         # Konfigurasi & baca/tulis Firestore
│   ├── data.js             # Data awal (seed) & variabel state global
│   ├── helpers.js          # Utilitas (format tanggal, rupiah, escape HTML, swipe)
│   ├── nav.js              # Navigasi antar halaman (PC & Mobile)
│   ├── dashboard.js        # Halaman Dashboard
│   ├── absen.js            # Halaman Absensi (isi kehadiran per sesi)
│   ├── sesi.js             # Halaman Sesi (daftar seluruh sesi absensi)
│   ├── rekap.js            # Halaman Rekap Bulanan, insight & grafik
│   ├── kas.js              # Halaman Kas/Keuangan + export
│   ├── anggota.js          # Halaman Data Anggota (CRUD) + export
│   └── ekspor.js           # Halaman Ekspor terpusat
└── docs/
    └── screenshots/        # (Anda) tempat meletakkan gambar preview
```

---

*Dibuat untuk pengelolaan data internal secara lebih mudah, cepat, dan terorganisir.*
