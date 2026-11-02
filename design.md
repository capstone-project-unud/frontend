---
name: capstone-design
description: Panduan visual login dan admin Capstone PSTI Udayana. Gunakan untuk pekerjaan UI Nuxt pada proyek ini, khususnya Urbanist, komposisi login 70:30, tabel pengguna, dan formulir.
---

# Capstone — design direction

Identitas: ruang kerja akademik yang tenang, hangat, dan teratur. Gunakan nama produk sebagai teks, bukan lambang universitas rekaan. ENERGY 2 / RHYTHM 3 / MOTION 1. Bahasa antarmuka: Indonesia.

## Membaca referensi

`design-reference.jpg` adalah dashboard logistik, 1114 × 783. Ambil prinsipnya: kanvas putih pudar, navigasi kiri, judul ringan yang besar, angka ringkasan tanpa kotak terpisah, permukaan sekunder abu hangat, dan ungu pada tindakan utama. Jarak antar kelompok lebih besar daripada jarak label–nilai. Jangan menyalin truk, statistik, peta, watermark, dan menu logistik.

Gambar login dalam percakapan menampilkan bidang ilustrasi hijau sage dan bidang formulir putih. Formulir sempit, label kecil, input bergaris, dan banyak ruang kosong. Instruksi pemilik mengganti perbandingan aslinya menjadi 70% ilustrasi : 30% formulir. Pada desktop lebar gunakan proporsi ini; tablet 55:45 agar form tetap terbaca; ponsel susun header ilustrasi ringkas di atas form.

`apple-design.md` memberi prinsip respons langsung, hirarki tipografi, konsistensi spasial, dan reduced motion. Gunakan feedback `:active`, outline fokus, dan dialog native. Tidak perlu spring, drag, atau lapisan kaca untuk formulir dan tabel.

## Tipografi dan token

Urbanist variable 100–900, disimpan lokal dengan lisensi OFL. Bentuk geometrisnya mengikuti pilihan pemilik dan melunakkan kepadatan tabel. Font ini [dirancang Corey Hu](https://fonts.googleblog.com/2021/10/new-font.html).

| Peran | Ukuran / tinggi baris | Berat | Tracking |
| --- | --- | --- | --- |
| Judul ilustrasi login | clamp(36, 4.1vw, 64) px / 1.05 | 500 | -0.045em |
| Judul halaman | clamp(28, 3vw, 40) px / 1.15 | 500 | -0.04em |
| Judul formulir | 30 px / 1.2 | 600 | -0.035em |
| Angka ringkasan | 36 px / 1.15 | 500 | -0.04em |
| Isi / input | 15–16 px / 1.5 | 400–500 | 0 |
| Label / metadata | 12–13 px / 1.4 | 500–600 | 0.01em |

Warna: ink `#25252b`, muted `#63636d`, canvas `#f5f5f3`, putih `#ffffff`, accent `#6741cf`, accent-soft `#f0ebfc`. Ilustrasi sage `#adc8b8`, foliage `#315747`, arsitektur krem `#f3e9d2`, terakota `#a04e3f`. Hijau status `#285e46` pada `#e9f3ed`; merah kesalahan `#a32732` pada `#fff0f1`. Warna tambahan pada ilustrasi membedakan bangunan dan vegetasi, bukan elemen interaktif.

Spasi: 4, 8, 12, 16, 20, 24, 32, 40, 48, 64 px. Label–input 8 px, antar field 24 px, judul–penjelasan 12 px, antarkelompok 32–48 px. Desktop padding konten 40 px; tablet 24 px; ponsel 20 px. Form login maksimal 320 px. Tombol/input minimal 44 px; input 48 px. Radius tombol 10 px, panel 20 px, dialog 24 px, badge 6 px. Bayangan hanya pada dialog untuk menunjukkan elevasi.

## Komposisi dan perilaku

- Login: satu ilustrasi arsitektur kampus Bali berbasis SVG, bidang sage penuh, judul editorial di bawah. Ini ilustrasi konseptual, bukan foto kampus aktual. Form email dan kata sandi, tampil/sembunyikan sandi, tombol Masuk, bantuan akses yang menjelaskan akun dibuat admin. Jangan menambahkan registrasi mandiri atau OAuth yang belum ada dalam SOP.
- Admin: sidebar 224 px, greeting dan tindakan Tambah pengguna di header; ringkasan nyata dari API; tab peran dan pencarian; tabel sebagai bidang utama. Aksen ungu menandai posisi dan tindakan. Tidak ada statistik dummy atau fitur capstone yang belum dibangun.
- Halaman tipis menyusun feature components. Auth: `LoginView` + `LoginForm` + `CampusIllustration`; users: `UserManagement` + `UserFilters` + `UserTable` + `UserEditor`; profile: `ProfileView`; activity: `ActivityView`. Form menerima `user`, `busy`, `error`, lalu emit `save`/`close`. Tabel menerima `users`/`currentUserId`, lalu emit `edit`/`status`.
- Loading, gagal memuat, hasil kosong, validasi, dan konfirmasi simpan harus terlihat. Jangan mengaku berhasil sebelum API berhasil. Status akun selalu disertai teks. Tidak ada hover-only actions.
- Dialog native mengunci fokus, Escape menutup saat tidak menyimpan, fokus kembali ke pemicu. Fokus ungu 3 px, tidak dihilangkan. Pertahankan kontras teks minimal 4.5:1 dan kontrol 3:1. Pada `prefers-reduced-motion`, matikan transform transisi.
- Breakpoint: ≥1200 login 70:30; 768–1199 login 55:45 dan sidebar ringkas; <768 login satu kolom, admin navigasi horizontal berlabel, tabel menjadi daftar kartu. Uji 375, 768, 1024, 1440 px dan zoom 200%.

Sumber framework: [Nuxt installation](https://nuxt.com/docs/4.x/getting-started/installation), [Fiber v3](https://docs.gofiber.io/). Versi implementasi dikunci dalam lockfiles, bukan ditentukan oleh skill ini.
