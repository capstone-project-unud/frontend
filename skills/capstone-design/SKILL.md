---
name: capstone-design
description: Membangun dan mengubah antarmuka Nuxt Capstone PSTI Udayana dengan Urbanist, login 70:30, serta manajemen pengguna sesuai SOP.
---

Baca [design.md](../../design.md) sebelum mengubah UI proyek ini. File tersebut menjadi sumber token, interpretasi dua referensi visual, breakpoint, kontrak komponen, dan perilaku aksesibel.

Pertahankan pemisahan `app/features/auth`, `users`, `profile`, dan `activity`. Pages menyusun feature views. Hindari registrasi mandiri: akun mahasiswa dan dosen dibuat admin menurut SOP-001. Ambil angka ringkasan, profil, peran, dan status dari API. Saat mengubah visual, verifikasi login dan admin pada ponsel, tablet, serta desktop, termasuk loading, empty, error, fokus keyboard, dan dialog.

Gunakan isi/input 16 px, navigasi/tombol 15 px, dan teks pendukung minimal 14 px. Hindari footer institusi, tanggal, banner penjelas berulang, serta titik dekoratif. Sidebar berupa panel mengambang yang dapat diperluas/diminimalkan; fokus input tetap di dalam batas kontrol dan tidak menimpa label. Rincian ukuran, keadaan responsif, serta perilaku toggle ada di `design.md`.
