---
name: capstone-design
description: Panduan visual login dan admin Capstone PSTI Udayana. Gunakan untuk pekerjaan UI Nuxt pada proyek ini, khususnya Urbanist, komposisi login 70:30, tabel pengguna, dan formulir.
---

# Capstone: panduan desain

Identitas: ruang kerja akademik yang tenang, hangat, dan teratur. Gunakan nama produk sebagai teks, bukan lambang universitas rekaan. ENERGY 2 / RHYTHM 3 / MOTION 1. Bahasa antarmuka: Indonesia.

## Membaca referensi

`design-reference.jpg` adalah dashboard logistik, 1114 × 783. Ambil prinsipnya: kanvas putih pudar, navigasi kiri, judul ringan yang besar, angka ringkasan tanpa kotak terpisah, permukaan sekunder abu hangat, dan ungu pada tindakan utama. Jarak antar kelompok lebih besar daripada jarak label–nilai. Jangan menyalin truk, statistik, peta, watermark, dan menu logistik.

Gambar login dalam percakapan menampilkan bidang ilustrasi hijau sage dan bidang formulir putih. Ambil komposisi dan ruang kosongnya. Ukuran teks kecil dan input bergaris pada referensi telah disesuaikan berdasarkan evaluasi pemilik: label lebih besar, kolom berbatas penuh, dan fokus berada di dalam kolom. Desktop menggunakan 70% ilustrasi : 30% formulir; tablet 55:45 agar form tetap terbaca; ponsel menyusun header ilustrasi ringkas di atas form.

`apple-design.md` memberi prinsip respons langsung, hirarki tipografi, konsistensi spasial, dan reduced motion. Gunakan feedback `:active`, outline fokus, dan dialog native. Tidak perlu spring, drag, atau lapisan kaca untuk formulir dan tabel.

## Tipografi dan token

Urbanist variable 100–900, disimpan lokal dengan lisensi OFL. Bentuk geometrisnya mengikuti pilihan pemilik dan melunakkan kepadatan tabel. Font ini [dirancang Corey Hu](https://fonts.googleblog.com/2021/10/new-font.html).

| Peran | Ukuran / tinggi baris | Berat | Tracking |
| --- | --- | --- | --- |
| Judul ilustrasi login | 40–64 px desktop, 32 px ponsel / 1.05 | 500 | -0.045em |
| Judul halaman | clamp(30, 3vw, 40) px / 1.2 | 600 | -0.035em |
| Judul login / dialog | 28–36 px / 1.2 | 600 | -0.04em |
| Judul panel | 18 px / 1.5 | 600 | -0.02em |
| Angka ringkasan | 36 px / 1.15 | 500 | -0.04em |
| Isi / input / penjelasan form | 16 px / 1.5–1.65 | 500 | 0 |
| Navigasi / tombol / isi tabel / label field | 15 px / 1.5 | 500–600 | 0 |
| Metadata / email tabel / petunjuk / header tabel | 14 px / 1.5 | 500–600 | 0 |

Ukuran dasar 16 px. Teks yang terlihat tidak boleh lebih kecil dari 14 px, termasuk email, peran, status, pagination, bantuan, dan label pada ponsel. Jangan mengecilkan teks untuk memaksakan tabel atau sidebar masuk ke layar. Ubah susunannya. Gunakan bobot 500 untuk isi dan 600 untuk label agar Urbanist tetap jelas; bobot tipis bukan cara mengurangi kepadatan.

Warna: ink `#25252b`, muted `#63636d`, canvas `#f5f5f3`, putih `#ffffff`, accent `#6741cf`, accent-soft `#f0ebfc`. Ilustrasi sage `#adc8b8`, foliage `#315747`, arsitektur krem `#f3e9d2`, terakota `#a04e3f`. Hijau status `#285e46` pada `#e9f3ed`; merah kesalahan `#a32732` pada `#fff0f1`. Warna tambahan pada ilustrasi membedakan bangunan dan vegetasi, bukan elemen interaktif.

Spasi: 4, 8, 12, 16, 20, 24, 32, 40, 48, 64 px. Label–input 12 px, antar field 24 px, judul–penjelasan 12 px, antarkelompok 32–48 px. Konten desktop berjarak sekitar 40 px dari batas sidebar; ponsel sekitar 20 px dari tepi layar. Form login maksimal 340 px desktop dan 400 px ponsel. Area interaksi minimal 44 × 44 px; tombol/input umumnya 48 px, kolom dan tombol login 52 px. Radius tombol/input 8–10 px, panel/sidebar 20 px, dialog 24 px, badge peran 5–6 px. Bayangan tipis hanya pada sidebar untuk menegaskan jaraknya dari kanvas; bayangan dialog menunjukkan lapisan modal.

## Teks dan informasi

- Judul utama menjelaskan pekerjaan: “Manajemen pengguna”, “Aktivitas pengguna”, atau “Profil saya”. Maksimal satu kalimat penjelas yang membantu tindakan berikutnya.
- Hapus banner “Akses yang tepat, untuk setiap peran” beserta penjelasannya. Aturan akun tetap dijelaskan di bantuan login dan konfirmasi tindakan yang relevan.
- Tidak ada tanggal hari ini, label “Ruang kerja admin”, header institusi, footer kampus, atau pengulangan nama sistem pada ruang kerja admin. Identitas produk cukup wordmark di sidebar.
- Login tidak memakai label “Portal akademik”, “Sistem Layanan”, “Satu akun, sesuai peran Anda”, daftar “Mahasiswa · Dosen · Admin”, atau footer tambahan. Pertahankan satu instruksi akses dan bantuan yang dapat dibuka.
- Tidak ada titik dekoratif, indikator “live”, atau titik status. Status akun ditulis “Aktif” atau “Nonaktif”; warna hanya membantu membaca teks tersebut. Angka ringkasan cukup label dan nilai dari API, tanpa kalimat pengisi.
- Pesan validasi, kesalahan, hasil simpan, petunjuk kata sandi, dan konsekuensi penonaktifan tetap ditampilkan karena diperlukan untuk mengambil tindakan.

## Komposisi dan perilaku

- Login: satu ilustrasi arsitektur kampus Bali berbasis SVG, bidang sage penuh, judul editorial di bawah. Ini ilustrasi konseptual, bukan foto kampus aktual. Form email dan kata sandi, tampil/sembunyikan sandi, tombol Masuk, bantuan akses yang menjelaskan akun dibuat admin. Jangan menambahkan registrasi mandiri atau OAuth yang belum ada dalam SOP.
- Admin: judul dan tindakan Tambah pengguna di atas ringkasan nyata dari API; tab peran dan pencarian; tabel sebagai bidang utama. Aksen ungu menandai posisi dan tindakan. Tidak ada statistik dummy atau fitur capstone yang belum dibangun.
- Sidebar mengambang memiliki jarak 16 px dari tepi desktop, radius 20 px, border tipis, dan bayangan ringan. Lebar terbuka 264 px, tablet 248 px, diminimalkan 88 px. Gunakan grid agar konten mendapat ruang saat sidebar berubah; sidebar tidak menutupi konten.
- Tombol toggle selalu terlihat, dapat dioperasikan dengan keyboard, dan memiliki `aria-expanded`, `aria-controls`, serta nama “Minimalkan sidebar” atau “Perluas sidebar”. Simpan preferensi buka/tutup dalam cookie agar tetap konsisten setelah navigasi dan render server. Saat diminimalkan, ikon tetap memiliki nama aksesibel dan tooltip. Ikon mewakili pengguna, aktivitas, profil, keluar akun, serta toggle; tidak ada ikon dekoratif tambahan.
- Desktop memakai sidebar sticky dengan tinggi mengikuti viewport dan scroll internal jika perlu. Pada ponsel sidebar menjadi panel atas mengikuti alur dokumen; tombol toggle membuka/menutup navigasi berlabel, tanpa overlay. Keluar akun tersedia pada halaman Profil saya saat panel identitas sidebar tidak ditampilkan di ponsel.
- Halaman tipis menyusun feature components. Auth: `LoginView` + `LoginForm` + `CampusIllustration`; users: `UserManagement` + `UserFilters` + `UserTable` + `UserEditor`; profile: `ProfileView`; activity: `ActivityView`; workspace: `AppSidebar` + `WorkspaceIcon`. Form menerima `user`, `busy`, `error`, lalu emit `save`/`close`. Tabel menerima `users`/`busy`, lalu emit `edit`/`status`.
- Loading, gagal memuat, hasil kosong, validasi, dan konfirmasi simpan harus terlihat. Jangan mengaku berhasil sebelum API berhasil. Status akun selalu disertai teks. Tidak ada hover-only actions.
- Dialog native mengunci fokus, Escape menutup saat tidak menyimpan, fokus kembali ke pemicu. Fokus ungu 2 px tetap terlihat. Untuk input/select/textarea gunakan outline ke dalam (`outline-offset: -2px`) agar tidak menyentuh label atau kolom tetangga. Kolom gabungan kata sandi dan pencarian menggunakan `:focus-within` pada pembungkus; hilangkan outline anak hanya jika pembungkus sudah menampilkan fokus yang setara. Tombol di dalam kolom juga memakai fokus ke dalam.
- Pertahankan kontras teks minimal 4.5:1 dan kontrol 3:1. Transisi toggle sidebar cukup 180 ms; pada `prefers-reduced-motion`, matikan animasi dan transform transisi.
- Breakpoint: ≥1200 login 70:30; 768–1199 login 55:45; <768 login satu kolom dan sidebar panel atas. Tabel mengikuti lebar panel, bukan hanya viewport: pada panel ≤700 px ubah baris menjadi kartu tanpa menyembunyikan identitas akademik. Uji 375, 768, 1024, 1440 px dan zoom 200%, dalam keadaan sidebar terbuka maupun diminimalkan.

Sumber framework: [Nuxt installation](https://nuxt.com/docs/4.x/getting-started/installation), [Fiber v3](https://docs.gofiber.io/). Versi implementasi dikunci dalam lockfiles, bukan ditentukan oleh skill ini.
