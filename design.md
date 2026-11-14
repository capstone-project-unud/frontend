---
name: capstone-design
description: Panduan visual login dan admin Capstone PSTI Udayana. Gunakan untuk pekerjaan UI Nuxt pada proyek ini, khususnya Urbanist, komposisi login 70:30, tabel pengguna, formulir terpisah per peran, dan komponen input modern.
---

# Capstone: panduan desain

Identitas: ruang kerja akademik yang tenang, hangat, dan teratur. Gunakan nama produk sebagai teks, bukan lambang universitas rekaan. ENERGY 2 / RHYTHM 3 / MOTION 1. Bahasa antarmuka: Indonesia.

## Membaca referensi

`design-reference.jpg` adalah dashboard logistik, 1114 × 783. Ambil prinsipnya: kanvas putih pudar, navigasi kiri, judul ringan yang besar, permukaan sekunder abu hangat, dan ungu pada tindakan utama. Jarak antar kelompok lebih besar daripada jarak label–nilai. Jangan menyalin truk, statistik, peta, watermark, dan menu logistik.

Gambar login dalam percakapan menampilkan bidang ilustrasi hijau sage dan bidang formulir putih. Ambil komposisi dan ruang kosongnya. Ukuran teks kecil dan input bergaris pada referensi telah disesuaikan berdasarkan evaluasi pemilik: label lebih besar, kolom berbatas penuh, dan fokus berada di dalam kolom. Desktop menggunakan 70% ilustrasi : 30% formulir; tablet 55:45 agar form tetap terbaca; ponsel menyusun header ilustrasi ringkas di atas form.

`apple-design.md` memberi prinsip respons langsung, hirarki tipografi, konsistensi spasial, dan reduced motion. Gunakan feedback `:active`, focus ring lembut, dan dialog modal yang intuitif dengan glassmorphism backdrop halus.

## Tipografi dan token

Urbanist variable 100–900, disimpan lokal dengan lisensi OFL. Bentuk geometrisnya mengikuti pilihan pemilik dan melunakkan kepadatan tabel. Font ini [dirancang Corey Hu](https://fonts.googleblog.com/2021/10/new-font.html).

| Peran | Ukuran / tinggi baris | Berat | Tracking |
| --- | --- | --- | --- |
| Judul ilustrasi login | 40–64 px desktop, 32 px ponsel / 1.05 | 500 | -0.045em |
| Judul halaman | clamp(30, 3vw, 40) px / 1.2 | 600 | -0.035em |
| Judul login / dialog | 24–32 px / 1.2 | 600–700 | -0.03em |
| Judul panel / section | 18 px / 1.5 | 600 | -0.02em |
| Angka ringkasan | 36 px / 1.15 | 500 | -0.04em |
| Isi / input / penjelasan form | 15–16 px / 1.5–1.65 | 500 | 0 |
| Navigasi / tombol / isi tabel / label field | 14–15 px / 1.5 | 500–600 | 0 |
| Metadata / email tabel / petunjuk / header tabel | 13–14 px / 1.5 | 500–600 | 0 |

Ukuran dasar 16 px. Teks yang terlihat tidak boleh lebih kecil dari 13–14 px, termasuk email, peran, status, pagination, bantuan, dan label pada ponsel. Jangan mengecilkan teks untuk memaksakan tabel atau sidebar masuk ke layar. Ubah susunannya. Gunakan bobot 500 untuk isi dan 600 untuk label agar Urbanist tetap jelas.

### Mode Terang dan Mode Gelap (White Mode & Dark Mode)

Sistem mengusung arsitektur visual token CSS yang mendukung penuh **Mode Terang (White Mode)** dan **Mode Gelap (Dark Mode)**. Perubahan tema mendeteksi preferensi sistem pengguna (`prefers-color-scheme: dark`) secara otomatis serta menyediakan toggle manual di sidebar yang tersimpan pada `localStorage` (`capstone_theme`).

| Peran Token | Variabel CSS | Mode Terang (White Mode) | Mode Gelap (Dark Mode) |
| --- | --- | --- | --- |
| Latar Halaman (Canvas) | `--canvas` | `#f5f5f3` (abu-abu hangat studio) | `#121217` (charcoal gelap) |
| Latar Kartu / Panel | `--panel` | `#ffffff` (putih bersih) | `#1b1b22` (elevated slate) |
| Hover Panel / Item | `--panel-hover` | `#fafaf8` | `#23232c` |
| Teks Utama | `--ink` | `#25252b` (tinta gelap kontras tinggi) | `#f1f1f4` (putih gading lembut) |
| Teks Sekunder / Keterangan | `--muted` | `#63636d` | `#9d9da8` |
| Garis Pembatas (Divider) | `--line` | `#e8e8e6` | `#2b2b36` |
| Garis Tepi Input / Border | `--border` | `#dcdcd8` (hover `#bebeb7`) | `#363644` (hover `#4c4c5e`) |
| Aksen Utama (Brand Purple) | `--accent` | `#6741cf` | `#8e6ef5` (dipertajam untuk kontras gelap) |
| Aksen Hover | `--accent-hover` | `#5532b1` | `#a084f5` |
| Latar Aksen Lembut (Tint) | `--accent-soft` | `#f0ebfc` | `#251e38` |
| Status Sukses (Hijau) | `--success` | `#15803d` (latar `#e9f3ed`) | `#34d399` (latar `#142e24`) |
| Status Kesalahan (Merah) | `--error` | `#a32732` (latar `#fff0f1`) | `#f87171` (latar `#351a1d`) |
| Status Peringatan (Kuning) | `--warning` | `#b45309` (latar `#fffbeb`) | `#fbbf24` (latar `#342612`) |
| Latar Tombol Default | `--btn-default-bg` | `#efefed` (hover `#e5e5e2`) | `#282834` (hover `#333342`) |
| Bayangan Panel / Sidebar | `--shadow-panel` | `0 8px 28px rgba(37, 37, 43, 0.04)` | `0 8px 28px rgba(0, 0, 0, 0.35)` |

Prinsip Kontras:
- **Purity Mode Gelap (Zero Hardcoded White/Light Elements)**: Seluruh komponen (termasuk header tabel `<th>`, textbox pencarian, dropdown filter, badge peran, tombol pagination, card modal, dialog konfirmasi, dan formulir input) dilarang keras menggunakan warna latar putih atau terang (`#ffffff`, `#fff`, `#f9f9f7`, `#fdfdfc`, `#fafaf8`) secara *hardcoded*. Seluruh elemen wajib mengonsumsi token CSS semantik (`var(--panel)`, `var(--canvas)`, `var(--btn-default-bg)`, `var(--border)`, `var(--line)`) sehingga ketika berada di mode gelap, tampilan benar-benar murni bertema gelap tanpa adanya bidang putih yang bocor atau menyilaukan.
- Mode gelap tidak menggunakan warna hitam pekat `#000000` untuk mencegah kelelahan mata (*eye strain*) dan efek *halation*.
- Seluruh kombinasi warna teks dan latar belakang wajib memenuhi ambang batas kontras WCAG AA (minimal 4.5:1 untuk teks biasa, 3:1 untuk teks besar/tebal).
- Transisi perubahan warna antar tema dibatasi pada `150ms ease` dan dimatikan saat preferensi `prefers-reduced-motion` aktif.

Spasi: 4, 8, 12, 16, 20, 24, 32, 40, 48, 64 px. Label–input 8–10 px, antar field 20–24 px, judul–penjelasan 8–12 px, antarkelompok 24–32 px. Area interaksi minimal 44 × 44 px; input/tombol tinggi 44–48 px, kolom dan tombol login 52 px. Radius tombol/input 12 px, panel/sidebar/card ringkasan 20 px, dialog modal 24 px, badge peran 5–6 px. Bayangan tipis pada sidebar dan card panel; soft deep shadow pada dialog modal (`box-shadow: 0 24px 64px -12px rgba(25, 20, 50, 0.22)`).

## Teks dan informasi

- Judul utama menjelaskan pekerjaan: “Manajemen pengguna” atau “Profil saya”. Maksimal satu kalimat penjelas yang membantu tindakan berikutnya. Halaman aktivitas telah dihapus.
- Hapus banner “Akses yang tepat, untuk setiap peran” beserta penjelasannya. Aturan akun tetap dijelaskan di bantuan login dan konfirmasi tindakan yang relevan.
- Tidak ada tanggal hari ini, label “Ruang kerja admin”, header institusi, footer kampus, atau pengulangan nama sistem pada ruang kerja admin. Identitas produk cukup wordmark di sidebar.
- Login tidak memakai label “Portal akademik”, “Sistem Layanan”, “Satu akun, sesuai peran Anda”, daftar “Mahasiswa · Dosen · Admin”, atau footer tambahan.
- Status akun ditulis “Aktif” atau “Nonaktif” didukung indikator visual titik status halus pada filter/tabel. Angka ringkasan statistik mengambil data langsung dari API tanpa kalimat pengisi.
- **Larangan Penggunaan Emoji**: Dilarang menggunakan karakter emoji (seperti lingkaran warna, centang emoji, tanda seru/peringatan, simbol tameng, panah putar, atau emoji apa pun) pada teks antarmuka, judul, dialog modal, kartu ringkasan, badge status, tabel, pesan notifikasi, maupun dokumentasi dan komunikasi sistem. Gunakan teks deskriptif yang tenang, tipografi Urbanist yang jernih, kode warna status terdefinisi, atau ikon SVG garis (*stroke*) monokrom.

## Komposisi dan perilaku

- **Login**: ilustrasi arsitektur kampus Bali berbasis SVG bidang sage penuh, judul editorial di bawah. Form email dan kata sandi, toggle tampil/sembunyikan sandi, tombol Masuk, bantuan akses yang menjelaskan akun dibuat admin.
- **Card Ringkasan Statistik**: metrik statistik (Total pengguna, Mahasiswa, Dosen, Akun aktif) dibungkus dalam card panel putih (`.panel.statistics-panel`) dengan sudut membulat 20 px, padding proporsional, dan garis pemisah vertikal antar metrik yang responsif di desktop maupun ponsel.
- **Daftar Pengguna & Tindakan Tambah**:
  - Tombol tambah pengguna tidak diletakkan di header halaman, melainkan di header card **Daftar pengguna** (`.section-heading`).
  - **Fokus Langsung per Peran (Tanpa Tab Semua Pengguna)**:
    - Tab **Semua pengguna** ditiadakan agar antarmuka langsung berfokus pada entitas akademik yang terdefinisi.
    - Tampilan default saat membuka halaman adalah tab **Mahasiswa**.
    - Tab **Mahasiswa**: menampilkan tombol `+ Tambah Mahasiswa` (solid ungu `#6741cf`), `Import` (solid sekunder), `Ekspor` (solid sekunder), serta `Deaktivasi Akun` (solid merah `#dc2626` teks putih `#ffffff`).
    - Tab **Dosen**: menampilkan tombol `+ Tambah Dosen` (solid ungu `#6741cf`), `Import` (solid sekunder), `Ekspor` (solid sekunder), serta `Unduh Template` (solid hijau `#15803d` teks putih). Deaktivasi akun dosen bersifat individual melalui aksi baris tabel (bukan batch angkatan).
    - Tab **Admin**: menampilkan tombol `+ Tambah Admin`.
  - **Keadaan Kosong (Empty State Tanpa Tombol Redundan)**:
    - Saat tabel kosong atau filter pencarian tidak menemukan hasil, area `empty-state` hanya menampilkan judul dan satu kalimat keterangan yang jelas.
    - Dilarang menampilkan tombol tambah di dalam area empty state karena tombol tindakan utama sudah tersedia secara konsisten dan terpusat pada header card daftar pengguna.
- **Standar Tombol Solid (Larangan Latar Transparan / Pudar)**:
  - Seluruh tombol wajib memiliki latar belakang yang **padat (*solid*)**, kontras tinggi, dan batas visual yang tegas.
  - **Dilarang keras** menggunakan tombol berlatar transparan (`background: transparent`), tombol hantu (*ghost button*), maupun tombol berlatar pudar/setengah transparan (*washed-out / translucent tint* seperti merah muda pucat atau abu-abu pudar).
  - Varian tombol yang diizinkan:
    - **Primary (`.button.primary`)**: Solid ungu aksen (`#6741cf`, hover `#5532b1`) dengan teks putih solid (`#ffffff`).
    - **Template / Success (`.button.template`)**: Solid hijau tebal (`#15803d`, hover `#166534`) dengan teks putih solid (`#ffffff`).
    - **Secondary (`.button.secondary`)**: Solid panel (`var(--panel)` yaitu `#ffffff` di mode terang / `#1b1b22` di mode gelap) dengan garis tepi tegas (`border: 1px solid var(--border)`), bayangan mikro, dan teks tinta solid (`var(--ink)`).
    - **Danger (`.button.danger`)**: Solid merah tegas (`#dc2626`, hover `#b91c1c`) dengan teks putih solid (`#ffffff`).
- **Larangan Mutlak Latar Belakang pada Ikon (No Icon Background Container)**:
  - Seluruh ikon (seperti ikon header modal, ikon tombol tutup/close, ikon upload/dropzone file, ikon clear pencarian, ikon chevron dropdown, maupun ikon toggle sidebar) **dilarang keras** dibungkus atau diberi latar belakang berbentuk kotak, lingkaran, atau pil warna-warni (*no circular, rounded, or tinted background behind icons*).
  - Ikon wajib tampil murni (*bare icon*) berupa garis (*stroke*) SVG yang bersih dan langsung menempel pada permukaan panel atau tombol induk tanpa kontainer latar tambahan (`background: transparent; border: 0;`).
- **Larangan Mutlak Warna Samar (No Washed-Out, Tinted, or Pastel Backgrounds)**:
  - **Dilarang keras** menggunakan warna latar belakang yang samar, pudar, pastel, atau *tinted* (`var(--accent-soft)`, `var(--success-soft)`, `var(--warning-soft)`, `var(--error-soft)`, `#fef2f2`, `#f0fdf4`, `#fffbeb`, atau sejenisnya) pada card, stat box, kotak metrik, banner, badge, notifikasi, maupun tombol.
  - Warna samar membuat antarmuka terlihat kusam/berembun pada mode terang dan merusak kontras pada mode gelap.
  - Seluruh kartu (*cards*), kotak ringkasan (*stat boxes*), kontainer audit, banner informasi, dan badge wajib menggunakan latar permukaan netral yang bersih dan solid (`var(--panel)`), dengan diferensiasi status dikomunikasikan secara eksklusif melalui:
    - Tipografi warna teks/angka tebal (misalnya: angka metrik hijau untuk siap dinonaktifkan, angka metrik oranye untuk tanggungan aktif, angka metrik merah untuk kegagalan).
    - Garis batas tegas (*solid border*) netral (`var(--border)`) atau aksen status bergaris tepi tipis (*solid border-left*).
    - Titik indikator status (*dot indicator* 7px) yang solid.
- **Fitur Batch & Template Mahasiswa (Excel .xlsx)**:
  - `StudentImportModal.vue`: modal upload drag-and-drop file Excel (`.xlsx`, `.xls`) dan `.csv`, parsing otomatis client-side, validasi baris real-time, preview tabel, dan progress bar import.
  - **Smart Upsert / Overwrite by Unique NIM**: Jika NIM sudah terdaftar di sistem, sistem otomatis memperbarui (*overwrite*) data mahasiswa bila ada perubahan (nama, email, angkatan, telepon) tanpa duplikasi akun. Bila data persis sama, baris dilewati secara aman. Jika NIM belum ada, akun baru dibuat secara otomatis (*insert*). Hasil impor merinci jumlah akun baru, akun diperbarui, dan akun dilewati.
  - Template standar impor Excel: file berekstensi `.xlsx` resmi (`Template_Import_Mahasiswa_Capstone.xlsx`) dengan lebar kolom yang rapi terformat (`NIM`, `Nama Lengkap`, `Email Institusi`, `Angkatan`, `Nomor Telepon`, `Kata Sandi Awal`). Tombol unduh template berlatar hijau bold `#15803d` teks putih.
  - Ekspor data: mengunduh seluruh data mahasiswa saat ini ke format Excel `.xlsx` dengan 1 klik. Jika data kosong, tombol dinonaktifkan dengan cursor `not-allowed` (bukan loading) dan tooltip penjelasan.
- **Fitur Batch & Template Dosen (Excel .xlsx)**:
  - `LecturerImportModal.vue`: modal upload drag-and-drop file Excel (`.xlsx`, `.xls`) dan `.csv`, parsing client-side, validasi real-time NIP/NIDN, nama lengkap & gelar, email, telepon, bidang keahlian, status Koprodi, dan password.
  - **Smart Upsert / Overwrite Dosen**: Identifikasi keberadaan dosen berdasarkan Email institusi atau NIP/NIDN unik. Jika sudah ada, memperbarui data profil dan peran Koprodi tanpa duplikasi. Jika belum ada, membuat akun dosen baru secara otomatis (*insert*).
  - Template standar impor Excel: `Template_Import_Dosen_Capstone.xlsx` dengan lebar kolom terformat rapi (`NIP`, `NIDN`, `Nama Lengkap & Gelar`, `Email Institusi`, `Nomor Telepon`, `Bidang Keahlian`, `Peran Koprodi`, `Kata Sandi Awal`). Tombol unduh template berlatar hijau bold `#15803d` teks putih.
  - Ekspor data: mengunduh seluruh data dosen ke format Excel `.xlsx` (`Data_Dosen_Capstone_YYYY-MM-DD.xlsx`).
  - Tampilan Tabel Dosen (`UserTable.vue`): Kolom kontekstual untuk dosen mencakup Nama Dosen & Kontak (telepon WhatsApp), NIP / NIDN secara lengkap, Bidang Keahlian riset/fokus Capstone, Peran (Dosen, Koprodi), Status akun, serta Aksi Ubah dan Nonaktifkan/Aktifkan.
- **Deaktivasi Massal Angkatan & Safety Guard (`CohortDeactivateModal.vue`)**:
  - Filter daftar mahasiswa per tahun angkatan (misal Angkatan 2020) di `UserFilters.vue`.
  - Tombol **Deaktivasi Akun** membuka modal audit interaktif, bukan tombol buta satu kali klik.
  - **Proteksi Otomatis Mahasiswa Belum Lulus (*Always-On Default Protection*)**:
    - Tombol/toggle kartu proteksi manual telah ditiadakan agar proteksi keselamatan data aktif secara otomatis dan permanen (*default on*).
    - Sistem mengidentifikasi status akademik setiap mahasiswa: mahasiswa yang masih memiliki proyek berjalan (`USULAN_TOPIK`, `PROPOSAL`, `PENGERJAAN`), dalam masa revisi ujian (`LULUS_DENGAN_REVISI`), atau bimbingan aktif masuk ke dalam kolom **Kategori Deaktivasi** sebagai **"Belum Boleh Dinonaktifkan"** dengan checkbox terkunci (*disabled*) dan tidak dicentang (*unchecked*).
    - Hanya mahasiswa yang status Capstone-nya telah `SELESAI` / yudisium yang masuk kategori **"Siap Dinonaktifkan"** dan dicentang secara default.
    - Admin tetap memiliki kontrol checklist manual pada mahasiswa yang berstatus siap dinonaktifkan, dilengkapi ringkasan dampak dan konfirmasi ganda (*double confirmation*) sebelum pemutusan sesi login dijalankan.
    - Soft-deactivate (`is_active = false`) menjaga integritas relasi foreign key data historis dan dapat diaktifkan kembali sewaktu-waktu.
- **Formulir Pengguna (Terpisah per Peran)**:
  - Tidak menggunakan formulir monolitik tunggal. Dipisah menjadi komponen mandiri:
    - `StudentForm.vue`: input nama lengkap, email institusi, NIM, tahun angkatan, telepon, dan sandi awal. Status akun secara default langsung aktif tanpa checkbox manual.
    - `LecturerForm.vue`: input nama & gelar, email, NIP, NIDN, peran Koprodi (check-card), telepon, keahlian riset, sandi awal, aktifkan akun.
    - `AdminForm.vue`: input nama, email sistem, telepon, sandi awal, aktifkan akun.
  - Setiap modal dialog memiliki glassmorphism backdrop blur (`backdrop-filter: blur(6px)`), animasi pop-up lembut, tombol close SVG murni tanpa background (`background: transparent; border: 0;`), embedded password toggle, dan tombol aksi berbayangan ungu aksen (`box-shadow: 0 4px 14px rgba(103, 65, 207, 0.28)`).
- **Komponen Input & Dropdown Modern**:
  - Textbox pencarian: pembungkus berlatar `#fdfdfc`, border `#dededb`, `border-radius: 12px`, ikon kaca pembesar terintegrasi di kiri, tombol 'x' clear cepat, dan tombol submit "Cari" sebagai pill ungu di dalam input. Focus ring: `box-shadow: 0 0 0 3px rgba(103, 65, 207, 0.12)`.
  - Dropdown status: Custom Floating Popover Dropdown menggantikan `<select>` native. Memiliki panah chevron berputar halus, dot indikator status aktif/nonaktif, menu mengambang bersudut 14 px dengan bayangan lembut, checkmark pada opsi terpilih, serta penutup otomatis via click-outside dan tombol Escape.
- **Sidebar**:
  - Jarak 16 px dari tepi desktop, radius 20 px, border tipis, bayangan ringan. Lebar terbuka 264 px, diminimalkan 88 px.
  - Menu navigasi mencakup: **Manajemen pengguna** (`/admin/users`) dan **Profil saya** (`/account`). Halaman aktivitas telah ditiadakan.
  - Toggle collapse/expand dapat dioperasikan via keyboard, memiliki `aria-expanded`, dan preferensi disimpan dalam cookie.
- **Komponen Fitur**:
  - Auth: `LoginView` + `LoginForm` + `CampusIllustration`
  - Users: `UserManagement` + `UserFilters` + `UserTable` + `StudentForm` + `LecturerForm` + `AdminForm` + `UserPasswordReset`
  - Profile: `ProfileView`
  - Workspace: `AppSidebar` + `WorkspaceIcon`
