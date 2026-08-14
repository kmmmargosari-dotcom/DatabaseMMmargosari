<div align="center">

<img src="logo.jpg" alt="Muda-Mudi Margosari Logo" width="110" />

# Muda-Mudi Margosari

**Satu platform buat absensi, kas, dan data anggota — cepat, rapi, dan selalu sinkron.**

<!-- Banner placeholder — ganti dengan screenshot/banner asli ukuran 1280x640 -->
<img src="https://via.placeholder.com/1280x640/1a2e1f/e8e2d0?text=Muda-Mudi+Margosari+%E2%80%94+App+Preview" alt="Banner preview" width="100%" />

<br/>

[![Version](https://img.shields.io/badge/version-1.0.0-2e7d55?style=flat-square)](#)
[![License](https://img.shields.io/badge/license-MIT-blue?style=flat-square)](#license)
[![Status](https://img.shields.io/badge/status-active-brightgreen?style=flat-square)](#)
[![Platform](https://img.shields.io/badge/platform-web-orange?style=flat-square)](#)
[![Made with](https://img.shields.io/badge/made%20with-JavaScript%20%26%20Firebase-F7DF1E?style=flat-square&logo=javascript&logoColor=black)](#)
[![Stars](https://img.shields.io/badge/⭐-star%20this%20repo-yellow?style=flat-square)](#)

</div>

<br/>

> [!NOTE]
> Dibangun murni dengan **HTML, CSS, dan JavaScript vanilla** — tanpa framework,
> tanpa build step, tanpa `npm install`. Tinggal buka dan jalan.

<br/>

## 📚 Daftar Isi

- [Overview](#-overview)
- [Preview](#-preview)
- [Features](#-features)
- [Tech Stack](#-tech-stack)
- [Folder Structure](#-folder-structure)
- [Installation](#-installation)
- [Usage](#-usage)
- [Screenshots](#-screenshots)
- [Roadmap](#-roadmap)
- [Configuration](#-configuration)
- [Contributing](#-contributing)
- [FAQ](#-faq)
- [Credits](#-credits)
- [License](#-license)

---

## 🧭 Overview

**Muda-Mudi Margosari** adalah aplikasi web internal untuk mengelola tiga hal
yang paling sering bikin pusing pengurus organisasi kepemudaan: **absensi
kegiatan**, **kas/keuangan**, dan **data anggota**.

Nggak ada lagi buku catatan yang bisa hilang, nggak ada lagi hitung kas manual
yang gampang keliru. Semua data tersimpan di cloud (Firebase), realtime, dan
bisa diakses siapa saja yang berhak — dari HP di tengah kegiatan sekalipun.

Dibangun sengaja **tanpa framework berat**, supaya siapa pun yang paham dasar
HTML/CSS/JS bisa langsung buka kode-nya, ubah, dan pahami alurnya tanpa harus
belajar tooling baru dulu.

<br/>

## 🖼️ Preview

<div align="center">

| Desktop | Mobile |
|:---:|:---:|
| <img src="https://via.placeholder.com/560x360/f4efe2/28322a?text=Desktop+View" width="100%" /> | <img src="https://via.placeholder.com/220x460/f4efe2/28322a?text=Mobile+View" width="60%" /> |

</div>

<br/>

## ⚡ Features

| Fitur | Deskripsi |
|---|---|
| 🏠 **Dashboard** | Ringkasan cepat: total anggota, sesi terakhir, dan saldo kas dalam satu layar |
| ✅ **Absensi** | Isi kehadiran per sesi dengan status Hadir / Izin / Alfa, termasuk mode pilih banyak (bulk) |
| 🗂️ **Sesi** | Riwayat seluruh sesi kegiatan, bisa dibuka ulang atau dihapus |
| 📊 **Rekap & Grafik** | Statistik bulanan, donut chart, dan grafik batang tren kehadiran per pertemuan |
| 💰 **Kas / Keuangan** | Catat pemasukan-pengeluaran dengan saldo berjalan otomatis |
| 👥 **Data Anggota** | CRUD anggota + detail rekap kehadiran per orang (khusus Admin) |
| 📤 **Export** | Export ke Excel (.xlsx), CSV, dan Print/PDF — grafik ikut tercetak |
| 🔐 **Authentication** | Login aman berbasis Firebase Auth dengan pemisahan peran (role) |
| 📱 **Responsive** | Tata letak didesain ulang total untuk mobile, bukan sekadar diciutkan |
| 🔔 **Popup Konsisten** | Semua konfirmasi & notifikasi pakai popup bergaya aplikasi sendiri, bukan `alert()` bawaan browser |

<br/>

### Penjelasan Fitur

**🏠 Dashboard**
Halaman pertama yang dilihat setelah login. Menampilkan ringkasan kondisi
kelompok secara sekilas — tanpa perlu buka satu-satu menu lain.

**✅ Absensi**
Buat sesi baru per tanggal lengkap dengan keterangan kegiatan, lalu isi status
kehadiran tiap anggota (dipisah Laki-laki & Perempuan). Ada mode **pilih
banyak** untuk set status beberapa anggota sekaligus dalam satu klik, dengan
interaksi yang halus tanpa reload/flicker pada daftar.

**📊 Rekap & Grafik**
Rekap otomatis per bulan lengkap dengan **donut chart** persentase kehadiran
dan **grafik batang per pertemuan**, sehingga tren naik-turun partisipasi
anggota langsung terlihat. Semua bisa diexport, termasuk grafiknya ikut
tercetak rapi di hasil Print/PDF.

**💰 Kas / Keuangan**
Pencatatan transaksi sederhana namun lengkap — saldo berjalan dihitung
otomatis setiap kali ada transaksi baru, siap diexport sebagai laporan.

**👥 Data Anggota**
Klik nama anggota untuk membuka detail lengkap: rekap semua sesi yang pernah
diikuti, status per pertemuan, dengan filter & pengurutan. Mengubah nama
anggota otomatis memindahkan seluruh riwayat lamanya — data historis tidak
pernah hilang.

**🔐 Authentication & Peran**
Login berbasis Firebase Authentication. Menu sensitif seperti Data Anggota
hanya tampil untuk akun dengan peran Admin.

<br/>

## 🧱 Tech Stack

<div align="center">

![HTML5](https://img.shields.io/badge/HTML5-E34F26?style=for-the-badge&logo=html5&logoColor=white)
![CSS3](https://img.shields.io/badge/CSS3-1572B6?style=for-the-badge&logo=css3&logoColor=white)
![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black)
![Firebase](https://img.shields.io/badge/Firebase-FFCA28?style=for-the-badge&logo=firebase&logoColor=black)
![Firestore](https://img.shields.io/badge/Firestore-039BE5?style=for-the-badge&logo=firebase&logoColor=white)

</div>

> [!TIP]
> Tidak ada bundler, tidak ada framework. Semua library eksternal (`xlsx`,
> `jszip`, `jspdf`) dimuat langsung lewat CDN — jadi "yang kamu lihat di kode,
> itulah yang berjalan di browser".

<br/>

## 🗂️ Folder Structure

```text
website_absensi/
├── index.html          # Markup utama — shell PC & Mobile, semua halaman/modal
├── logo.jpg             # Logo aplikasi
├── css/
│   ├── base.css         # Variabel desain (warna, radius, shadow) & style dasar
│   ├── layout.css       # Layout shell, sidebar, bottom-nav, responsive
│   ├── components.css   # Komponen UI umum (tombol, badge, popup)
│   └── modules.css      # Style spesifik per modul (kas, rekap, dsb)
├── js/
│   ├── boot.js           # Inisialisasi aplikasi & pengecekan status login
│   ├── auth.js            # Login/logout via Firebase Authentication
│   ├── firebase.js        # Konfigurasi & fungsi baca/tulis Firestore
│   ├── data.js             # Data awal (seed) & variabel state global
│   ├── helpers.js          # Utilitas: format tanggal/rupiah, popup app, dll
│   ├── nav.js               # Navigasi antar halaman (PC & Mobile)
│   ├── dashboard.js          # Halaman Dashboard
│   ├── absen.js               # Halaman Absensi
│   ├── sesi.js                 # Halaman Sesi
│   ├── rekap.js                 # Halaman Rekap Bulanan, grafik & export
│   ├── kas.js                    # Halaman Kas/Keuangan & export
│   └── anggota.js                 # Halaman Data Anggota (CRUD) & export
└── README.md
```

<br/>

## 🚀 Installation

```bash
# 1. Clone repository
git clone https://github.com/<username>/website_absensi.git
cd website_absensi
```

```bash
# 2. (Opsional) Jalankan dengan static server lokal
npx serve .
```

> [!IMPORTANT]
> Sebelum dipakai, kamu **wajib** menghubungkan project ini ke Firebase
> milikmu sendiri. Lihat bagian [Configuration](#-configuration) di bawah.

<br/>

## 🖥️ Usage

1. Buka `index.html` langsung di browser, atau akses lewat static server
   (lokal maupun hosting seperti Firebase Hosting / Netlify / Vercel).
2. Login menggunakan akun yang sudah didaftarkan di Firebase Authentication.
3. Mulai dari **Dashboard**, lalu jelajahi menu Absensi, Rekap, Kas, dan Data
   Anggota lewat sidebar (PC) atau bottom navigation (Mobile).
4. Gunakan tombol **Export** di halaman Rekap/Kas/Anggota untuk mengunduh
   laporan dalam format Excel, CSV, atau Print/PDF.

<br/>

## 📸 Screenshots

<div align="center">

<img src="https://via.placeholder.com/380x260/f4efe2/28322a?text=Dashboard" width="32%" />
<img src="https://via.placeholder.com/380x260/f4efe2/28322a?text=Absensi" width="32%" />
<img src="https://via.placeholder.com/380x260/f4efe2/28322a?text=Rekap+%26+Grafik" width="32%" />

<img src="https://via.placeholder.com/380x260/f4efe2/28322a?text=Kas" width="32%" />
<img src="https://via.placeholder.com/380x260/f4efe2/28322a?text=Data+Anggota" width="32%" />
<img src="https://via.placeholder.com/380x260/f4efe2/28322a?text=Detail+Anggota" width="32%" />

</div>

<br/>

## 🗺️ Roadmap

- [x] Dashboard ringkasan
- [x] Absensi dengan mode pilih banyak (bulk)
- [x] Rekap bulanan + grafik per pertemuan
- [x] Export Excel / CSV / Print-PDF
- [x] Authentication & pemisahan peran (Admin)
- [x] Detail riwayat kehadiran per anggota
- [ ] 🌙 Dark mode
- [ ] 🔔 Notifikasi/reminder sesi belum diisi
- [ ] 📴 Offline sync penuh (bukan cache saja)
- [ ] 📷 Absen via QR code / self check-in
- [ ] 🏅 Badge pencapaian kehadiran anggota

<br/>

## ⚙️ Configuration

Aplikasi ini membutuhkan project **Firebase** sendiri (Authentication +
Firestore).

<table>
<tr><th>Langkah</th><th>Detail</th></tr>
<tr>
<td>1. Buat project Firebase</td>
<td>Aktifkan <strong>Authentication</strong> (Email/Password) dan <strong>Firestore Database</strong>.</td>
</tr>
<tr>
<td>2. Salin konfigurasi</td>
<td>Ganti objek <code>firebaseConfig</code> di bagian atas <code>index.html</code> dengan konfigurasi project kamu.</td>
</tr>
<tr>
<td>3. Buat akun pengguna</td>
<td>Daftarkan user di Firebase Authentication, lalu petakan <code>username → email</code> di <code>js/auth.js</code> (<code>USERNAME_MAP</code>).</td>
</tr>
<tr>
<td>4. Amankan Firestore Rules</td>
<td>Pastikan Security Rules membatasi akses hanya untuk pengguna yang sudah login sebelum dipakai secara publik.</td>
</tr>
</table>

> [!WARNING]
> Jangan pernah men-deploy ke produksi dengan Firestore Rules default
> (`allow read, write: if true`). Siapa pun yang tahu konfigurasi Firebase-mu
> bisa membaca maupun mengubah data.

<br/>

## 🤝 Contributing

Kontribusi selalu terbuka! Alurnya:

1. **Fork** repository ini
2. Buat branch baru — `git checkout -b fitur/nama-fitur`
3. Commit perubahanmu — `git commit -m "feat: tambah fitur X"`
4. Push ke branch-mu — `git push origin fitur/nama-fitur`
5. Buka **Pull Request** dengan deskripsi perubahan yang jelas

> [!TIP]
> Karena project ini tanpa build step, pastikan perubahanmu diuji langsung di
> browser (buka `index.html`) sebelum membuka PR.

<br/>

## ❓ FAQ

<details>
<summary><strong>Apakah butuh server backend sendiri?</strong></summary>
<br/>
Tidak. Semua logic backend ditangani Firebase (Authentication + Firestore),
jadi cukup file statis HTML/CSS/JS yang bisa dihost di mana saja.
</details>

<details>
<summary><strong>Apakah bisa dipakai tanpa Firebase?</strong></summary>
<br/>
Secara default tidak, karena penyimpanan data mengandalkan Firestore. Ada
mekanisme cache <code>localStorage</code> sebagai cadangan sementara jika
koneksi ke Firebase gagal, namun ini bukan pengganti backend penuh.
</details>

<details>
<summary><strong>Apakah aplikasi ini responsif di HP?</strong></summary>
<br/>
Ya. Tata letak dirancang ulang penuh untuk layar kecil (bottom navigation,
kartu, popup yang menyesuaikan), bukan sekadar versi desktop yang diciutkan.
</details>

<details>
<summary><strong>Bagaimana cara menambah akun Admin baru?</strong></summary>
<br/>
Daftarkan akun baru di Firebase Authentication, lalu tambahkan pemetaan
<code>username → email</code>-nya di <code>USERNAME_MAP</code> pada
<code>js/auth.js</code>.
</details>

<br/>

## 🙌 Credits

Dibangun menggunakan:

- [Firebase](https://firebase.google.com/) — Authentication & Firestore Database
- [SheetJS (xlsx)](https://sheetjs.com/) — export laporan ke Excel
- [JSZip](https://stuk.github.io/jszip/) — kompresi file export
- [jsPDF](https://github.com/parallax/jsPDF) — export laporan ke PDF

<br/>

## 📄 License

Didistribusikan di bawah lisensi **MIT**. Lihat `LICENSE` untuk detail lebih
lanjut.

---

<div align="center">

Dibuat dengan ❤️ untuk memudahkan pengurus **Muda-Mudi Margosari**
mencatat kehadiran, kas, dan data anggota tanpa ribet.

<sub>Built with ❤️ for the community.</sub>

</div>
