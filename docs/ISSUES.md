# Daftar Masalah & Rencana Pengembangan — GitHub Issues (Availo)

Dokumen ini berisi daftar minimal 10 issue nyata (6 Bug dan 5 Enhancement) yang ditemukan melalui audit kode statis dan pengujian aplikasi Availo (KelasKosong).

---

## Issue 1 (BUG)
- **Judul:** `[BUG] Date comparison pada validasi reservasi lampau terpengaruh perbedaan zona waktu UTC dan lokal`
- **Label:** `bug`
- **Severity:** `high`
- **Lokasi Kode:** `apps/api/src/services/reservationService.ts:29-31`
- **Deskripsi:**
  Pada fungsi `reservationService.create()`, validasi tanggal lampau dilakukan dengan membandingkan `new Date(data.Date) < new Date(new Date().toDateString())`. Di lingkungan runtime dengan zona waktu Indonesia (WIB / UTC+7), parsing `new Date("2026-11-19")` mengasumsikan UTC midnight (`2026-11-19T00:00:00.000Z` yang setara jam 07:00 WIB). Ketika dibandingkan dengan `toDateString()` lokal server, pemesanan untuk hari yang sama di pagi hari berpotensi keliru ditolak dengan error `DATE_IN_PAST`.
- **Langkah Reproduksi:**
  1. Jalankan backend API pada server dengan zona waktu GMT+7 (Asia/Jakarta).
  2. Kirim request `POST /api/reservations` pada pukul 05:00 WIB dengan tanggal hari ini (`data.Date = "YYYY-MM-DD"` hari ini).
  3. Amati respon dari server.
- **Expected vs Actual:**
  - *Expected:* Reservasi untuk hari ini dengan jam mulai di masa mendatang diterima.
  - *Actual:* Server melempar `DATE_IN_PAST` karena perbandingan objek `Date` UTC vs lokal string.
- **Saran Perbaikan / Acceptance Criteria:**
  - Lakukan normalisasi tanggal hanya pada level string tanggal kalender lokal (`YYYY-MM-DD`) atau gunakan library manipulasi tanggal seperti `date-fns` / `dayjs` dengan zona waktu seragam.

---

## Issue 2 (BUG)
- **Judul:** `[BUG] Kalkulasi status ketersediaan fasilitas mengabaikan parameter filter tanggal masa depan`
- **Label:** `bug`
- **Severity:** `high`
- **Lokasi Kode:** `apps/api/src/services/facilityService.ts:36-39` & `apps/api/src/utils/statusCalculator.ts`
- **Deskripsi:**
  Saat pengguna memanggil `GET /api/facilities?date=2026-11-25`, query Prisma menyaring reservasi hanya untuk tanggal `2026-11-25`. Namun, `facilityService` kemudian memanggil `calculateFacilityStatus(f.Reservations, now)` dengan `now = new Date()` (hari ini). Fungsi tersebut membandingkan reservasi tanggal 25 November terhadap jam saat ini, sehingga kamar yang penuh di tanggal 25 November tetap berstatus `TERSEDIA` hari ini.
- **Langkah Reproduksi:**
  1. Buat reservasi ruangan A untuk tanggal esok hari pukul 09:00 - 12:00.
  2. Buka daftar fasilitas dengan filter tanggal esok hari (`GET /api/facilities?date=<besok>`).
  3. Perhatikan badge status ruangan A.
- **Expected vs Actual:**
  - *Expected:* Status ruangan menunjukkan keterisian pada tanggal yang dicari.
  - *Actual:* Ruangan tetap berstatus `TERSEDIA` karena kalkulator selalu membandingkan waktu terhadap jam saat ini (*current timestamp*).
- **Saran Perbaikan / Acceptance Criteria:**
  - Berikan parameter `referenceDate` ke `calculateFacilityStatus()` yang mengambil nilai dari `filters.date` jika tersedia.

---

## Issue 3 (BUG)
- **Judul:** `[BUG] Endpoint GET /api/facilities dan GET /api/reservations/my belum mendukung pagination`
- **Label:** `bug`
- **Severity:** `medium`
- **Lokasi Kode:** `apps/api/src/services/facilityService.ts:21` & `apps/api/src/services/reservationService.ts:78`
- **Deskripsi:**
  Query `prisma.facility.findMany()` dan `prisma.reservation.findMany()` tidak membatasi jumlah data (`take` / `skip`). Seiring bertambahnya riwayat peminjaman kampus hingga ribuan baris, pemanggilan endpoint ini akan mengakibatkan transfer data JSON yang sangat besar, memperlambat rendering `FlatList` di mobile, dan boros memori.
- **Langkah Reproduksi:**
  1. Isi database dengan 500+ data reservasi via seed script.
  2. Buka aplikasi mobile pada tab Riwayat.
  3. Pantau konsol log durasi response API.
- **Expected vs Actual:**
  - *Expected:* Data diambil bertahap (misal 10 atau 20 item per halaman) dengan mekanisme infinite scroll.
  - *Actual:* Seluruh 500+ record ditarik sekaligus dalam satu payload HTTP tunggal.
- **Saran Perbaikan / Acceptance Criteria:**
  - Tambahkan query parameter `page` dan `limit` pada controller dan service backend, serta implementasikan `onEndReached` pada `FlatList` mobile.

---

## Issue 4 (BUG)
- **Judul:** `[BUG] Keyboard virtual menutupi tombol submit dan error message pada layar buat reservasi Android`
- **Label:** `bug`
- **Severity:** `medium`
- **Lokasi Kode:** `apps/mobile/app/create.tsx:116` & `apps/mobile/app/edit/[id].tsx`
- **Deskripsi:**
  Pada perangkat Android fisik, saat pengguna mengisi field "Tujuan Penggunaan" di bagian bawah form, keyboard virtual menutupi tombol "Konfirmasi Reservasi" dan pesan error validasi. Pengguna harus menekan tombol *Back* sistem Android terlebih dahulu untuk menyembunyikan keyboard agar tombol simpan terlihat.
- **Langkah Reproduksi:**
  1. Buka layar Tambah Reservasi (`/create`) di HP Android.
  2. Tap pada text input "Tujuan Penggunaan Ruangan".
  3. Masukkan teks dan perhatikan posisi tombol konfirmasi di bawah.
- **Expected vs Actual:**
  - *Expected:* Scroll view otomatis bergeser ke atas (*auto scroll on focus*) sehingga input dan tombol aksi tetap terlihat di atas keyboard.
  - *Actual:* Input dan tombol tertutup oleh keyboard virtual Android.
- **Saran Perbaikan / Acceptance Criteria:**
  - Tambahkan properti `behavior={Platform.OS === "ios" ? "padding" : "height"}` atau integrasikan library `react-native-keyboard-aware-scroll-view` dengan padding bawah ekstra.

---

## Issue 5 (BUG)
- **Judul:** `[BUG] Tidak ada penanganan bentrok waktu saat admin mengubah kapasitas fasilitas lebih kecil dari reservasi aktif`
- **Label:** `bug`
- **Severity:** `medium`
- **Lokasi Kode:** `apps/api/src/services/facilityService.ts:149-152`
- **Deskripsi:**
  Saat Pengelola mengupdate kapasitas ruangan via `PUT /api/facilities/:Id` (misal dari kapasitas 40 menjadi 10 orang), sistem tidak memvalidasi apakah ada reservasi berstatus `UPCOMING` yang memiliki `PartySize` lebih besar dari kapasitas baru (misal reservasi kelompok 30 orang). Hal ini menyebabkan inkonsistensi data integritas di sistem.
- **Langkah Reproduksi:**
  1. Mahasiswa membuat reservasi di Lab Komputer dengan jumlah peserta 25 orang.
  2. Pengelola gedung mengubah data Lab Komputer sehingga kapasitasnya menjadi 15 orang.
  3. Buka detail reservasi mahasiswa.
- **Expected vs Actual:**
  - *Expected:* Sistem memberi peringatan/menolak penurunan kapasitas jika terdapat reservasi aktif yang melebihi kapasitas baru, atau mengirimkan notifikasi perubahan ke pemesan.
  - *Actual:* Perubahan fasilitas berhasil tanpa validasi, sehingga reservasi yang melanggar batas kapasitas tetap aktif.
- **Saran Perbaikan / Acceptance Criteria:**
  - Tambahkan pengecekan pada `facilityService.update` untuk memastikan `data.Capacity` tidak lebih kecil dari `MAX(PartySize)` reservasi berstatus `UPCOMING` pada ruangan tersebut.

---

## Issue 6 (BUG)
- **Judul:** `[BUG] Badge notifikasi belum menampilkan indikator jumlah pesan belum dibaca (unread count badge)`
- **Label:** `bug`
- **Severity:** `low`
- **Lokasi Kode:** `apps/mobile/app/index.tsx:210-218`
- **Deskripsi:**
  Ikon lonceng notifikasi (🔔) di bilah navigasi atas layar utama tidak memiliki *badge counter* merah yang menandakan adanya notifikasi baru yang belum dibaca (`IsRead = false`). Pengguna tidak mengetahui adanya informasi ruangan kosong kecuali secara manual membuka layar notifikasi.
- **Langkah Reproduksi:**
  1. Login ke aplikasi sebagai mahasiswa.
  2. Buat notifikasi baru di database atau picu notifikasi ketersediaan.
  3. Perhatikan ikon lonceng di pojok kanan atas beranda.
- **Expected vs Actual:**
  - *Expected:* Terdapat badge lingkaran merah dengan angka jumlah notifikasi unread di atas ikon lonceng.
  - *Actual:* Ikon lonceng selalu tampil statis tanpa penanda visual.
- **Saran Perbaikan / Acceptance Criteria:**
  - Buat endpoint `GET /api/notifications/unread-count` dan pasang komponen Badge di atas ikon lonceng header.

---

## Issue 7 (ENHANCEMENT)
- **Judul:** `[ENHANCEMENT] Background cron job / scheduler untuk transisi otomatis status UPCOMING -> ACTIVE -> COMPLETED`
- **Label:** `enhancement`
- **Deskripsi:**
  Saat ini, status reservasi di database tidak berubah secara otomatis saat waktu mulai atau waktu selesai tercapai. Perubahan status hanya terjadi bila diakhiri manual (*Early End*) atau dibatalkan. Diperlukan worker terjadwal di backend untuk otomatis memperbarui status reservasi yang sudah lewat waktunya.
- **Acceptance Criteria:**
  - Tambahkan background job (misal menggunakan `node-cron` setiap 5 menit) untuk:
    - Mengubah status reservasi dari `UPCOMING` ke `ACTIVE` jika `now >= StartTime` dan `now < EndTime`.
    - Mengubah status dari `ACTIVE` ke `COMPLETED` jika `now >= EndTime`.

---

## Issue 8 (ENHANCEMENT)
- **Judul:** `[ENHANCEMENT] Filter pencarian fasilitas berdasarkan kelengkapan fasilitas pendukung (Amenities)`
- **Label:** `enhancement`
- **Deskripsi:**
  Saat ini filter pencarian fasilitas hanya mendukung filter berdasarkan Gedung, Tipe Ruangan, dan Kapasitas Minimal. Mahasiswa sering kali membutuhkan ruangan dengan kriteria khusus, seperti ruangan yang memiliki Proyektor LCD, AC, atau Smart TV.
- **Acceptance Criteria:**
  - Tambahkan filter query `amenityIds` pada endpoint `GET /api/facilities`.
  - Tambahkan komponen filter chip fasilitas (AC, Proyektor, Wi-Fi) di layar mobile `app/facilities/index.tsx`.

---

## Issue 9 (ENHANCEMENT)
- **Judul:** `[ENHANCEMENT] Sinkronisasi jadwal reservasi ke Google Calendar / Kalender Native perangkat (ICS)`
- **Label:** `enhancement`
- **Deskripsi:**
  Setelah mahasiswa berhasil mereservasi ruangan kampus, akan sangat membantu jika mahasiswa dapat langsung memasukkan jadwal tersebut ke kalender ponsel native mereka dengan satu klik.
- **Acceptance Criteria:**
  - Pasang library `expo-calendar` di `apps/mobile`.
  - Tambahkan tombol "Tambahkan ke Kalender HP" di kartu reservasi berhasil atau detail reservasi.

---

## Issue 10 (ENHANCEMENT)
- **Judul:** `[ENHANCEMENT] Fitur Unggah Foto Ruangan ke Cloud Storage (S3 / Cloudinary)`
- **Label:** `enhancement`
- **Deskripsi:**
  Saat ini foto dokumentasi kondisi ruangan hanya disimpan secara lokal di cache penyimpanan perangkat mahasiswa (`AsyncStorage`). Jika mahasiswa berganti ponsel atau aplikasi di-uninstall, foto tersebut hilang dan pengelola kampus tidak dapat melihat foto tersebut dari dashboard mereka.
- **Acceptance Criteria:**
  - Tambahkan endpoint `POST /api/upload` di backend yang mengintegrasikan AWS S3 atau Cloudinary.
  - Unggah foto kondisi ruangan saat reservasi dibuat dan simpan URL publiknya di model `Reservation`.

---

## Issue 11 (ENHANCEMENT)
- **Judul:** `[ENHANCEMENT] Fitur lupa password dan reset password berbasis token email`
- **Label:** `enhancement`
- **Deskripsi:**
  Saat ini sistem otentikasi hanya mendukung registrasi dan login. Jika mahasiswa lupa password akun kampusnya, tidak ada mekanisme swalayan untuk mereset kata sandi.
- **Acceptance Criteria:**
  - Endpoint `POST /api/auth/forgot-password` untuk mengirimkan token reset ke email.
  - Endpoint `POST /api/auth/reset-password` untuk memverifikasi token dan mengubah hash password baru.
  - Layar "Lupa Password" di aplikasi mobile.

