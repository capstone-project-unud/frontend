# Frontend Sistem Layanan Capstone Project

Repositori ini memuat antarmuka web Sistem Layanan Capstone Project Program Studi Teknologi Informasi, Universitas Udayana. Aplikasi dikembangkan menggunakan Nuxt 4, Vue 3, dan TypeScript dengan pengelompokan kode berdasarkan fitur.

Implementasi saat ini mencakup autentikasi, pengelolaan profil pribadi, serta halaman administrasi pengguna. Mahasiswa dan dosen menggunakan akun yang dibuat oleh administrator sesuai SOP registrasi pengguna.

## Ruang Lingkup

- Login dan logout berdasarkan sesi pengguna.
- Penyuntingan profil pribadi dan perubahan kata sandi.
- Pembuatan dan penyuntingan akun mahasiswa atau dosen oleh administrator.
- Pencarian, penyaringan peran, pengaturan status akun, dan pengaturan ulang kata sandi.
- Penyajian ringkasan pengguna dan riwayat perubahan akun.

Halaman yang tersedia adalah `/login`, `/admin/users`, `/admin/activity`, dan `/account`. Pengelolaan proyek, bimbingan, ujian, publikasi karya, dan chatbot berada di luar implementasi tahap ini.

## Struktur Aplikasi

| Direktori | Tanggung jawab |
| --- | --- |
| `app/features/` | Komponen dan logika fitur autentikasi, pengguna, profil, dan aktivitas |
| `app/pages/` | Definisi halaman dan penyusunan komponen fitur |
| `app/layouts/` | Kerangka navigasi dan ruang kerja |
| `app/middleware/` | Pengalihan halaman berdasarkan sesi dan peran |
| `app/types/` | Kontrak data yang digunakan antarmuka |
| `server/api/v1/` | Perantara permintaan dari browser menuju API gateway |

Browser mengakses API melalui origin yang sama dengan aplikasi Nuxt. Sesi disimpan dalam cookie `HttpOnly`; pemeriksaan kewenangan tetap dilakukan oleh layanan backend.

## Konfigurasi dan Pengembangan

Aplikasi memerlukan Node.js yang memenuhi ketentuan `engines` pada `package.json`. Alamat gateway ditetapkan melalui `NUXT_GATEWAY_URL` dalam `.env`, dengan contoh konfigurasi pada `.env.example`.

```sh
npm ci
npm run dev
```

Aplikasi lokal tersedia pada `http://localhost:3000`. Pemeriksaan tipe dan kompilasi produksi dijalankan melalui `npm run typecheck` dan `npm run build`.

Panduan tampilan terdapat dalam [design.md](design.md). Antarmuka menggunakan Urbanist, komposisi login 70:30 pada desktop lebar, dan penyesuaian tata letak untuk tablet serta ponsel. Lisensi font tersedia pada `public/fonts/OFL.txt`.

Pengembangan melalui Docker menggunakan `Dockerfile.dev` bersama tambahan `compose.dev.yaml` pada repositori infrastructure. Container memasang dependensi sesuai lockfile dan menjalankan Nuxt dev server; perubahan source pada host diproses melalui bind mount. Dependensi dan keluaran Nuxt disimpan dalam volume Docker terpisah dari berkas host.
