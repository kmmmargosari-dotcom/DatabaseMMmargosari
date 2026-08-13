# Database Muda-Mudi Margosari

Website absensi, rekap kehadiran, kas/keuangan, dan data anggota untuk
kelompok Muda-Mudi Margosari. Single Page Application berbasis HTML/CSS/
JavaScript (vanilla, tanpa framework/build-step) dengan backend
[Firebase](https://firebase.google.com/) (Authentication + Firestore).

## Struktur Project

```
index.html          Markup utama (shell PC & Mobile, semua halaman/modal)
logo.jpg             Logo aplikasi
css/
  base.css           Variabel desain (warna, radius, shadow) & style dasar
  layout.css         Layout shell, sidebar, bottom-nav, responsive/media query
  components.css     Komponen UI umum (tombol, badge, dll)
  modules.css        Style spesifik per modul (kas, rekap, dsb)
js/
  boot.js            Inisialisasi aplikasi & pengecekan status login
  auth.js            Login/logout via Firebase Authentication
  firebase.js        Konfigurasi & fungsi baca/tulis Firestore
  data.js            Data awal (seed) & variabel state global
  helpers.js         Fungsi utilitas (format tanggal, format rupiah, escape HTML)
  nav.js             Navigasi antar halaman (PC & Mobile)
  dashboard.js       Halaman Dashboard
  absen.js           Halaman Absensi (isi kehadiran per sesi)
  sesi.js            Halaman Sesi (daftar seluruh sesi absensi)
  rekap.js           Halaman Rekap Bulanan & export
  kas.js             Halaman Kas/Keuangan & export
  anggota.js         Halaman Data Anggota (CRUD) & export
```

## Menjalankan Project

Project ini murni file statis (HTML/CSS/JS), tidak perlu proses build.

1. Siapkan project Firebase sendiri (Authentication dengan Email/Password,
   dan Firestore Database).
2. Ganti konfigurasi Firebase (`firebaseConfig`) di bagian atas `index.html`
   dengan konfigurasi project Firebase Anda.
3. Buat akun pengguna di Firebase Authentication, lalu sesuaikan pemetaan
   username → email di `js/auth.js` (`USERNAME_MAP`).
4. Buka `index.html` langsung di browser, atau sajikan lewat web server
   statis (mis. `npx serve .`, GitHub Pages, Firebase Hosting, dll).

## Keamanan

Akses data (baca/tulis) yang sesungguhnya diatur oleh **Firestore Security
Rules** di project Firebase Anda — pastikan Rules tersebut membatasi akses
hanya untuk pengguna yang sudah login sebelum project ini digunakan secara
publik/produksi.

## Catatan

- Aplikasi mendukung mode offline terbatas (cache di `localStorage`) apabila
  koneksi ke Firebase gagal dimuat sama sekali.
- Data anggota, sesi, dan kas disimpan di Firestore; array data di
  `js/data.js` dan `js/kas.js` hanya dipakai sebagai data awal (seed) saat
  instalasi pertama kali pada Firestore yang masih kosong.
