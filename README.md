<div align="center">
  <h1>📄 PDF Gen Template</h1>
  <p><i>Template HTML/CSS Modern dan Minimalis untuk Generate PDF dari Markdown/HTML</i></p>

  [![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)
  [![HTML5](https://img.shields.io/badge/HTML5-E34F26?style=flat&logo=html5&logoColor=white)]()
  [![CSS3](https://img.shields.io/badge/CSS3-1572B6?style=flat&logo=css3&logoColor=white)]()
</div>

---

## ✨ Tentang Proyek
Template HTML ini dirancang khusus sebagai struktur dasar (boilerplate) untuk mengonversi dokumen HTML atau Markdown menjadi file PDF dengan format yang rapi, profesional, dan siap cetak [cite: 1]. Dilengkapi dengan tipografi modern, styling tabel yang bersih, dan *highlight syntax* otomatis.

## 🚀 Fitur Utama
- **Tipografi Modern**: Menggunakan sistem font (*system-fonts*) bawaan yang sangat nyaman dibaca seperti `-apple-system`, `Segoe UI`, `Roboto`, hingga `Noto Color Emoji` [cite: 1].
- **Hierarki Heading yang Jelas**: Warna biru elegan (`#1d4ed8`) untuk judul, dengan garis bawah yang tegas pada `<h1>` [cite: 1].
- **Siap Cetak (Print-Ready)**: Aturan `@media print` telah dikonfigurasi untuk menghindari elemen seperti tabel, blok kode (`pre`), dan *blockquote* terpotong di tengah halaman (`page-break-inside: avoid`) [cite: 1].
- **Syntax Highlighting**: Terintegrasi langsung dengan `highlight.js` (tema *Atom One Dark*) untuk menyorot blok kode secara estetik [cite: 1].
- **Tabel & Blockquote Estetik**: Desain elegan untuk tabel bergaris dengan baris warna selang-seling (Zebra striping) dan *blockquote* rapi beraksen biru [cite: 1].

## 🛠️ Cara Penggunaan

Gunakan file ini sebagai *template* utama Anda. Cukup *copy-paste* konten HTML atau hasil *render* Markdown Anda tepat di dalam tag `<body>` [cite: 1]:

```html
<body>
  <!-- Masukkan konten Anda di sini -->
  <h1>Laporan Analisis Data</h1>
  <p>Berikut adalah hasil laporan bulan ini...</p>
  
  <blockquote>Ini adalah quote penting.</blockquote>
</body>
```

Skrip `hljs.highlightAll();` yang berada di bawah sudah otomatis berjalan untuk mendeteksi dan memberi warna pada semua blok kode Anda [cite: 1].

## 🎨 Skema Warna Utama
- **Teks Utama**: `#333` (Abu-abu sangat gelap) [cite: 1]
- **Heading & Link**: `#1d4ed8` (Biru) [cite: 1]
- **Inline Code**: `#dc2626` (Merah dengan latar `#f3f4f6`) [cite: 1]
- **Blok Kode (Pre)**: `#1f2937` (Dark Slate) dengan teks `#f9fafb` [cite: 1]

## 🤝 Kontribusi
Silakan *fork* repository ini jika Anda memiliki ide gaya (style) CSS yang lebih menarik, tambahkan fitur Anda, dan kirimkan *Pull Request*. Segala bentuk kontribusi sangat dihargai!

---
<div align="center">
  Dibuat dengan ❤️ untuk developer yang sering mengekspor dokumen HTML ke PDF.
</div>
