# KelasKosong — Arsitektur Aplikasi

Dokumen ini menjelaskan rancangan teknis MVP KelasKosong. KelasKosong membantu mahasiswa menemukan dan memesan ruang kampus berdasarkan waktu, kapasitas, lokasi, dan fasilitas. Dokumen ini menjadi acuan implementasi; detail stack dapat disesuaikan dengan konfigurasi proyek saat kode aplikasi mulai dibuat.

## 1. Tujuan dan Ruang Lingkup

### Tujuan

- Menyediakan katalog ruang kampus dalam satu aplikasi.
- Membantu mahasiswa mencari ruang yang tersedia untuk rentang waktu tertentu.
- Mencegah dua reservasi aktif memakai ruang yang sama pada waktu yang bertumpang tindih.
- Memungkinkan pemesan mengakhiri penggunaan lebih awal agar ruang kembali dapat ditemukan.

### MVP

- Akun mahasiswa: registrasi, login, dan logout.
- Katalog serta detail ruang.
- Pencarian berdasarkan gedung, kapasitas, tipe ruang, fasilitas, tanggal, dan jam.
- Membuat, melihat, dan membatalkan reservasi.
- Status ketersediaan yang dihitung dari jadwal reservasi.
- Aksi “Selesai lebih awal” untuk pemesan yang sedang memakai ruang.
- Riwayat reservasi pengguna.
- Pengelolaan data ruang oleh pengelola melalui mekanisme administrasi sederhana.

Notifikasi push, integrasi sistem akademik, akses pintu, sensor ruangan, pembayaran, dan analitik prediktif berada di luar MVP. “Real-time” pada MVP berarti status diperbarui setelah perubahan reservasi tersimpan dan data layar dimuat ulang; pembaruan live melalui WebSocket/push bukan bagian dari janji awal.

## 2. Aktor dan Hak Akses

| Aktor | Hak akses |
|---|---|
| Pengunjung | Menjelajahi katalog dan melihat detail ruang; perlu login untuk memesan |
| Mahasiswa | Mencari ruang, membuat/membatalkan reservasi sendiri, mengakhiri reservasi sendiri lebih awal, melihat riwayat sendiri |
| Pengelola | Membuat, mengubah, menonaktifkan ruang, serta melihat reservasi untuk operasional |

MVP memerlukan autentikasi karena reservasi dan aksi selesai lebih awal harus terikat pada pemiliknya. Aturan otorisasi ditegakkan di backend, bukan hanya dengan menyembunyikan tombol di UI.

## 3. Stack dan Bentuk Sistem

Produk dirancang sebagai aplikasi mobile React Native dengan Expo. Prototype pertemuan 3 berjalan di emulator/perangkat melalui Expo dan memakai data lokal contoh. Backend produk menggunakan Node.js/TypeScript, PostgreSQL, dan Prisma:

| Lapisan | Teknologi rancangan |
|---|---|
| Aplikasi mobile | React Native, Expo SDK 57, TypeScript |
| Navigasi | Expo Router dengan bottom tabs |
| API | Node.js, TypeScript, Express |
| Database | PostgreSQL |
| ORM dan migrasi | Prisma |
| Komunikasi | REST/JSON melalui HTTPS |

Jika implementasi memilih stack berbeda, konsep domain, aturan ketersediaan, dan batas keamanan dalam dokumen ini tetap berlaku.

```text
Mahasiswa / Pengelola
        │ HTTPS
        ▼
Mobile app (React Native + Expo)
        │ REST API
        ▼
API (Express)
   ├── autentikasi dan otorisasi
   ├── aturan pencarian dan reservasi
   └── akses data melalui Prisma
        │
        ▼
  PostgreSQL
```

Klien React Native berkomunikasi dengan backend melalui REST API setelah backend tersedia. Klien tidak mengakses database secara langsung. Backend menjadi sumber kebenaran untuk hak akses, bentrok jadwal, status reservasi, dan ketersediaan ruang. Prototype pertemuan 3 memakai data contoh di memori aplikasi dan belum terhubung ke API maupun database.

## 4. Struktur Modul yang Disarankan

```text
kelas-kosong/
├── mobile/                      # React Native + Expo + TypeScript
│   ├── app/                       # Routing berbasis file (Expo Router)
│   │   ├── _layout.tsx            # Provider dan root stack
│   │   └── (tabs)/
│   │       ├── _layout.tsx        # Navigasi bawah
│   │       ├── index.tsx          # Pencarian ruang
│   │       ├── reservations.tsx
│   │       ├── saved.tsx
│   │       └── profile.tsx
│   ├── App.tsx                    # UI layar pencarian untuk prototype
│   ├── src/
│   │   ├── components/            # Button, input, room card, status badge
│   │   ├── features/rooms/data.ts # Data contoh ruang
│   │   ├── services/              # Klien REST API (tahap integrasi)
│   │   ├── state/                 # State sementara prototype
│   │   └── theme/                 # Warna, tipografi, spacing (berikutnya)
│   ├── assets/
│   ├── app.json
│   └── package.json
├── backend/                      # Target API Express + TypeScript
│   ├── src/
│   │   ├── routes/
│   │   ├── controllers/
│   │   ├── services/
│   │   ├── repositories/
│   │   ├── validators/
│   │   └── middleware/
│   └── prisma/
│       ├── schema.prisma
│       └── migrations/
├── README.md
└── Architecture.md
```

Prototype saat ini menggunakan routing tab Expo Router untuk layar Cari, Reservasi, Tersimpan, dan Profil. Kartu ruang masih dibuat bersama layar pencarian; saat fitur bertambah, pindahkan ke `src/components/`. State dalam provider masih sementara dan tidak persisten. Backend di folder `backend/` adalah target tahap berikutnya, belum dibuat.

### Routing

Expo Router menghubungkan berkas dalam `mobile/app/` menjadi layar aplikasi. `(tabs)/_layout.tsx` mendefinisikan navigasi bawah; layar tambahan seperti detail ruang atau login ditambahkan sebagai route baru, bukan dengan mengganti isi layar secara manual. Layar memakai komponen bersama dan mengakses API melalui `src/services/` setelah backend tersedia.

## 5. Model Domain dan Data

### User

```text
User: id, name, email, passwordHash, role, createdAt, updatedAt
role: STUDENT | MANAGER
```

Email unik. Password disimpan sebagai hash yang aman dan tidak pernah dikembalikan oleh API.

### Room

```text
Room: id, name, building, floor, capacity, type, description,
      amenities, isActive, createdAt, updatedAt
```

`amenities` adalah daftar fasilitas terstruktur, misalnya Wi-Fi, papan tulis, proyektor, dan AC. Ruang nonaktif tidak muncul sebagai pilihan reservasi baru, tetapi data riwayatnya tetap tersimpan.

### Reservation

```text
Reservation: id, userId, roomId, startsAt, endsAt,
             status, actualEndedAt, createdAt, updatedAt
status: CONFIRMED | CANCELLED | COMPLETED
```

- Waktu disimpan sebagai timestamp yang konsisten (UTC); UI menampilkan waktu lokal kampus.
- `startsAt` harus lebih awal dari `endsAt`.
- `actualEndedAt` hanya diisi ketika pemesan mengakhiri penggunaan lebih awal.
- Reservasi yang dibatalkan tidak menghalangi slot.
- Gunakan foreign key ke `User` dan `Room`; riwayat reservasi tidak dihapus otomatis ketika ruang atau akun dinonaktifkan.

### Relasi

```text
User 1 ─── N Reservation N ─── 1 Room
```

Data ruangan dan slot operasional dimasukkan oleh pengelola. Integrasi jadwal kuliah resmi kampus tidak tersedia pada MVP; bila jam operasional perlu dibatasi, pengelola mengatur jam buka/penutupan secara manual.

## 6. Aturan Ketersediaan dan Bentrok

Ketersediaan bukan kolom status permanen pada `Room`; backend menghitungnya dari reservasi aktif untuk rentang waktu yang dicari. Ini menghindari status tersimpan yang tertinggal dari jadwal sebenarnya.

Dua rentang waktu bertabrakan jika:

```text
existing.startsAt < requested.endsAt
AND effectiveEnd(existing) > requested.startsAt
```

`effectiveEnd` adalah `actualEndedAt` bila reservasi selesai lebih awal, selain itu `endsAt`. Hanya reservasi berstatus `CONFIRMED` yang menghalangi slot. Batas waktu yang bersinggungan tepat (misalnya satu reservasi selesai pukul 15:00 dan yang berikutnya mulai pukul 15:00) dianggap tidak bertabrakan.

Saat membuat reservasi, backend harus memeriksa bentrok dan menyimpan reservasi sebagai satu operasi yang aman terhadap permintaan bersamaan. Pemeriksaan di UI hanya untuk kenyamanan; database/backend tetap mencegah dua pemesanan pada slot sama, misalnya dengan transaksi dan penguncian yang sesuai untuk PostgreSQL.

### Status yang ditampilkan

Status bergantung pada waktu yang sedang dilihat:

- **Tersedia**: tidak ada reservasi aktif yang bertabrakan dengan slot pencarian.
- **Sedang digunakan**: waktu sekarang berada dalam reservasi aktif dan belum diakhiri.
- **Akan tersedia**: ada reservasi aktif yang sedang berlangsung tetapi akan selesai sebelum slot yang dipilih.

Untuk pencarian tanggal/jam tertentu, hasil utama adalah tersedia/tidak tersedia untuk keseluruhan rentang yang diminta. Status “akan tersedia” merupakan informasi pendukung, bukan jaminan bahwa rentang pilihan dapat dipesan.

## 7. Alur Reservasi

```text
Mahasiswa memilih tanggal, jam, jumlah orang, dan filter
        ↓
Web meminta hasil pencarian ke API
        ↓
API menyaring ruang aktif dan menghitung bentrok dari database
        ↓
Mahasiswa memilih ruang dan mengirim permintaan reservasi
        ↓
API memvalidasi waktu, kapasitas, aturan pemesanan, dan bentrok ulang
        ↓
Reservasi CONFIRMED disimpan secara atomik
        ↓
Web menampilkan konfirmasi dan reservasi pada riwayat
```

MVP tidak mengandalkan informasi ketersediaan yang sebelumnya dimuat oleh browser saat pemesanan disimpan. Backend selalu memeriksa ulang karena pengguna lain mungkin memesan slot yang sama.

### Pembatalan

Pemesan dapat membatalkan reservasinya sesuai aturan pembatalan yang ditetapkan pengelola. MVP dapat menggunakan aturan sederhana: reservasi hanya dapat dibatalkan sebelum waktu mulai. Pengelola dapat membatalkan untuk kebutuhan operasional; alasan pembatalan sebaiknya dicatat.

### Selesai lebih awal

Hanya pemesan reservasi yang sedang berlangsung dapat mengakhiri penggunaan. Backend mencatat `actualEndedAt` dan menandai reservasi `COMPLETED`. Ruang kemudian dapat tersedia untuk pencarian slot yang dimulai setelah waktu selesai aktual. Tindakan ini tidak mengubah reservasi lain atau menghapus catatan jadwal aslinya.

## 8. API Utama

Semua rute menggunakan prefix `/api`. Rute pengelola memerlukan role `MANAGER`; rute pengguna memerlukan autentikasi sesuai kebutuhan.

| Method | Route | Fungsi |
|---|---|---|
| POST | `/auth/register` | Membuat akun mahasiswa |
| POST | `/auth/login` | Masuk dan membuat sesi/token |
| POST | `/auth/logout` | Mengakhiri sesi |
| GET | `/me` | Profil pengguna yang sedang masuk |
| GET | `/rooms` | Cari/daftar ruang; filter waktu, kapasitas, gedung, tipe, fasilitas |
| GET | `/rooms/:id` | Detail ruang |
| POST | `/reservations` | Membuat reservasi |
| GET | `/reservations/me` | Riwayat dan reservasi pengguna |
| GET | `/reservations/:id` | Detail reservasi milik pengguna/pengelola |
| POST | `/reservations/:id/cancel` | Membatalkan reservasi |
| POST | `/reservations/:id/finish-early` | Mencatat selesai lebih awal |
| POST/GET | `/admin/rooms` | Membuat ruang / daftar ruang untuk pengelola |
| PATCH | `/admin/rooms/:id` | Mengubah atau menonaktifkan ruang |
| GET | `/admin/reservations` | Melihat reservasi untuk operasional |

Gunakan format JSON konsisten, kode HTTP semantik, validasi input backend, serta respons error yang tidak membocorkan detail internal. Hindari mengirim password hash atau data sensitif.

## 9. Keamanan dan Privasi

- Hash password menggunakan algoritma password hashing yang sesuai, seperti Argon2id atau bcrypt dengan konfigurasi aman.
- Gunakan cookie sesi `HttpOnly`, `Secure` pada HTTPS, dan perlindungan CSRF bila autentikasi memakai cookie; atau gunakan mekanisme token yang aman dan berumur terbatas.
- Terapkan otorisasi kepemilikan reservasi di setiap operasi baca/ubah.
- Batasi pembuatan reservasi pada akun terautentikasi, ruang aktif, kapasitas yang sesuai, dan aturan waktu.
- Validasi serta normalisasi semua input di backend.
- Jangan mencatat password, token sesi, atau informasi autentikasi ke log.
- Konfigurasikan CORS hanya untuk origin aplikasi yang diperlukan.
- Gunakan HTTPS di deployment dan simpan rahasia di environment/secret store, bukan di repository.

## 10. Waktu, Zona Kampus, dan Batas MVP

Waktu reservasi ditampilkan dalam zona waktu kampus yang ditetapkan saat deployment. Backend menyimpan timestamp konsisten dan mengonversi masukan/keluaran dengan jelas agar perubahan zona waktu tidak menggeser slot. Nilai tanggal dan jam lokal harus divalidasi, termasuk reservasi yang melintasi tengah malam bila memang diperbolehkan.

Belum termasuk: sinkronisasi kalender akademik, push notification, live update lintas perangkat, pembayaran, IoT, smart lock, integrasi kartu mahasiswa, aplikasi native, serta prediksi atau rekomendasi AI. Email/push notifikasi baru ditambahkan setelah kanal pengiriman dan kebutuhan operasional ditetapkan.

## 11. Kriteria Selesai Arsitektur MVP

- Pengunjung dapat melihat katalog dan mencari ruang berdasarkan slot waktu.
- Mahasiswa dapat registrasi/login dan hanya mengelola reservasinya sendiri.
- Bentrok slot ditolak di backend, termasuk dua permintaan yang datang hampir bersamaan.
- Pembatalan membebaskan slot sesuai aturan yang berlaku.
- Selesai lebih awal mengubah akhir efektif slot dan tersimpan dalam riwayat.
- Status ruang dihitung konsisten dari data reservasi.
- Pengelola dapat memperbarui data ruang tanpa menghapus riwayat reservasi.
- UI bekerja pada layar ponsel dan desktop serta menggunakan Bahasa Indonesia.
- Dokumentasi setup, konfigurasi environment, dan akun/data demo sesuai implementasi aktual.
