# Panduan Rilis Google Play Store — Availo (KelasKosong)

Dokumen ini menyediakan seluruh materi persiapan untuk merilis aplikasi **Availo** ke Google Play Store melalui Google Play Console, mulai dari instruksi build AAB, teks listing toko, persyaratan aset visual, draf Kebijakan Privasi (Privacy Policy), hingga pengisian formulir Data Safety.

---

## 1. Checklist Persiapan Google Play Console

- [ ] Memiliki akun Google Play Developer Console (biaya registrasi satu kali \$25).
- [ ] Menyiapkan nama paket identitas unik: `com.availo.kelaskosong`.
- [ ] Menyiapkan file bundle produksi berekstensi `.aab` (*Android App Bundle*).
- [ ] Menyiapkan aset grafis (Ikon 512x512, Feature Graphic 1024x500, dan minimal 4 screenshot layar).
- [ ] Menyediakan tautan URL publik untuk dokumen Kebijakan Privasi (*Privacy Policy*).
- [ ] Melengkapi kuisioner **Target Audience & Content** (Kategori Pendidikan / Kampus, Usia 18+).
- [ ] Mengisi deklarasi formulir **Data Safety**.
- [ ] Membuat track **Internal Testing** dan menambahkan email daftar penguji (dosen / rekan tim).

---

## 2. Perintah Build Produksi (Android App Bundle - AAB)

Google Play Store mewajibkan format `.aab` untuk aplikasi baru (bukan `.apk`).

Profil `production` di `eas.json` telah dikonfigurasi dengan `buildType: "app-bundle"`. Jalankan:

```bash
cd apps/mobile
eas build -p android --profile production
```

Setelah build selesai di cloud EAS, unduh file `.aab` yang dihasilkan ke komputer Anda untuk diunggah ke Play Console.

---

## 3. Metadata Toko (Store Listing)

### Nama Aplikasi
```text
Availo - Reservasi Ruang Kampus
```

### Deskripsi Singkat (Short Description — Maks. 80 Karakter)
```text
Cari dan reservasi fasilitas ruang kelas & lab kampus secara real-time.
```

### Deskripsi Lengkap (Full Description — Maks. 4000 Karakter)
```text
Availo (KelasKosong) adalah solusi cerdas bagi mahasiswa dan sivitas akademika untuk menemukan dan mereservasi fasilitas kampus secara efisien tanpa perlu mengecek ruangan satu per satu.

Fitur Utama:
1. Status Ketersediaan Real-Time: Pantau status ruangan kampus secara langsung: Tersedia, Segera Tersedia (≤30 menit), atau Sedang Digunakan.
2. Pencarian & Filter Fasilitas: Temukan ruangan berdasarkan gedung, lantai, tipe ruangan (Ruang Kelas, Ruang Diskusi, Laboratorium Komputer, Ruang Rapat, dan Aula), serta kapasitas peserta.
3. Reservasi Ruangan Anti Double-Booking: Lakukan pemesanan ruangan dengan sistem validasi jadwal cerdas yang mencegah bentrok waktu.
4. Dokumentasi Kondisi Ruangan (Kamera): Ambil foto kondisi fasilitas ruangan sebelum digunakan sebagai bukti fisik inventaris kampus yang tersimpan di perangkat Anda.
5. Selesai Lebih Awal (Early-End): Selesaikan pemakaian ruangan lebih awal jika aktivitas telah usai, sehingga ruangan langsung terbuka bagi mahasiswa lain yang membutuhkan.
6. Pengingat & Notifikasi: Dapatkan pengingat jadwal otomatis sebelum waktu reservasi dimulai dan notifikasi saat ruangan yang dipantau telah kosong.
7. Manajemen Akun Berbasis Peran: Dukungan peran akun untuk Mahasiswa dan Pengelola Fasilitas dengan keamanan otentikasi token terenkripsi.

Availo membuat kolaborasi dan kegiatan belajar di lingkungan kampus menjadi lebih tertata, transparan, dan produktif.
```

---

## 4. Kebutuhan Aset Grafis (Creative Assets)

| Aset | Dimensi | Format | Keterangan |
|---|---|---|---|
| **App Icon** | 512 x 512 px | PNG 32-bit (tanpa transparansi) | Menggunakan aset `./assets/icon.png` |
| **Feature Graphic** | 1024 x 500 px | PNG / JPEG | Banner promosi di bagian atas halaman listing Play Store |
| **Phone Screenshots** | Min. 2 screenshot (Rasio 16:9 / 9:16) | JPEG / PNG | Tangkapan layar beresolusi minimal 1080p: Layar Beranda, Jelajah Fasilitas, Form Reservasi + Kamera, dan Notifikasi |

---

## 5. Draf Kebijakan Privasi (Privacy Policy)

*Teks berikut dapat dipublikasikan di GitHub Pages atau Notion/Google Sites sebagai URL Privacy Policy resmi:*

```markdown
# Kebijakan Privasi Availo (KelasKosong)
Terakhir diperbarui: November 2026

Aplikasi Availo menghormati privasi pengguna. Kebijakan ini menjelaskan data apa yang kami proses dan bagaimana data tersebut digunakan.

1. Data yang Dikumpulkan:
- Informasi Akun: Nama lengkap, alamat email kampus, dan peran (Mahasiswa atau Pengelola).
- Data Aktivitas: Jadwal tanggal, waktu, jumlah peserta, dan tujuan reservasi fasilitas ruangan.
- Data Keamanan: Token otentikasi sesi yang disimpan secara terenkripsi di penyimpanan aman perangkat (Android KeyStore) melalui modul SecureStore.

2. Penggunaan Izin Perangkat (Permissions):
- KAMERA & GALERI FOTO (CAMERA & READ_EXTERNAL_STORAGE):
  Digunakan semata-mata saat pengguna memilih fitur dokumentasi kondisi ruangan sebelum menggunakan fasilitas. Foto disimpan secara lokal di media penyimpanan perangkat pengguna dan TIDAK diunggah atau disebarluaskan ke server publik.
- NOTIFIKASI (POST_NOTIFICATIONS):
  Digunakan untuk mengirimkan pengingat jadwal reservasi di ponsel Anda dan pemberitahuan saat ruangan yang dipantau kembali tersedia.

3. Keamanan Data:
Seluruh komunikasi data antara aplikasi dan server backend menggunakan protokol aman HTTPS. Password pengguna disimpan dalam bentuk hash satu arah (bcrypt) di database server dan tidak dapat dibaca oleh pihak mana pun.

4. Penghapusan Data:
Pengguna dapat mengakhiri sesi kapan saja dengan menekan tombol "Keluar dari Akun" di halaman Profil, yang akan menghapus seluruh token otentikasi dari perangkat. Untuk permintaan penghapusan akun permanen dari database, hubungi pengembang di: support@kelaskosong.ac.id.
```

---

## 6. Panduan Pengisian Data Safety Form (Play Console)

Pada bagian **App content -> Data safety** di Play Console:

1. **Apakah aplikasi mengumpulkan data?** -> Ya.
2. **Apakah semua data pengguna dienkripsi saat transit?** -> Ya (menggunakan protokol HTTPS).
3. **Kategori Data yang Dikumpulkan:**
   - **Personal info:**
     - Name (Digunakan untuk fungsionalitas aplikasi / identitas pemesan).
     - Email address (Digunakan untuk autentikasi akun & login).
   - **App activity:**
     - App interactions (Riwayat peminjaman ruangan).
4. **Apakah data dibagikan ke pihak ketiga (*Data shared*)?** -> Tidak (No data shared with third parties).
5. **Apakah pengguna dapat meminta penghapusan data?** -> Ya.

---

## 7. Alur Peluncuran Jalur Pengujian Internal (Internal Testing Track)

Untuk mendemokan aplikasi tanpa harus menunggu proses review publik Google yang memakan waktu beberapa hari:

1. Buka Play Console -> Pilih Aplikasi **Availo**.
2. Masuk ke menu **Testing -> Internal testing**.
3. Klik **Create new release** -> unggah file `.aab` hasil build EAS.
4. Tulis *Release notes* singkat (misal: "Versi 1.0.0 - Pengujian MVP Lengkap Sistem Reservasi Ruangan").
5. Klik **Save** lalu **Review and roll out release**.
6. Masuk ke tab **Testers** -> buat daftar email (misal: `penguji-kelompok@gmail.com`).
7. Salin tautan **Join on Android** atau **Join on Web** dan bagikan kepada penguji/dosen untuk memasang aplikasi langsung dari Play Store.

