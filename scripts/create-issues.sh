#!/usr/bin/env bash

# Script untuk membuat issue GitHub secara otomatis menggunakan GitHub CLI (gh)
# PERINGATAN: Jangan menjalankan script ini sebelum melakukan login via `gh auth login`
# dan mendapatkan konfirmasi repositori target.

set -e

echo "=== Availo (KelasKosong) - GitHub Issue Creator ==="

# 1. Periksa apakah GitHub CLI terpasang
if ! command -v gh &> /dev/null; then
    echo "❌ Error: GitHub CLI ('gh') tidak ditemukan di sistem Anda."
    echo "Silakan install gh terlebih dahulu: https://cli.github.com/"
    exit 1
fi

# 2. Periksa status autentikasi
echo "Memeriksa status autentikasi GitHub CLI..."
if ! gh auth status &> /dev/null; then
    echo "❌ Error: Anda belum login ke GitHub CLI."
    echo "Jalankan 'gh auth login' terlebih dahulu sebelum mengeksekusi script ini."
    exit 1
fi

echo "✅ Autentikasi GitHub CLI valid. Memulai pembuatan issue..."
echo ""

# Issue 1 (Bug)
echo "Membuat Issue 1 (Bug - Date Timezone)..."
gh issue create \
  --title "[BUG] Date comparison pada validasi reservasi lampau terpengaruh perbedaan zona waktu UTC dan lokal" \
  --label "bug" \
  --body "### Lokasi Kode
apps/api/src/services/reservationService.ts:29-31

### Deskripsi
Pada fungsi \`reservationService.create()\`, validasi tanggal lampau membandingkan \`new Date(data.Date) < new Date(new Date().toDateString())\`. Parsing \`new Date(\"YYYY-MM-DD\")\` menghasilkan UTC midnight (07:00 WIB), sehingga reservasi pagi hari berpotensi keliru ditolak dengan error DATE_IN_PAST.

### Langkah Reproduksi
1. Jalankan backend API pada server dengan zona waktu GMT+7.
2. Kirim POST /api/reservations pada jam 05:00 WIB untuk tanggal hari ini.
3. Server melempar error DATE_IN_PAST.

### Expected vs Actual
- Expected: Reservasi untuk hari ini dengan jam mendatang diterima.
- Actual: Ditolak karena perbandingan UTC vs lokal string.

### Saran Perbaikan
Normalisasi tanggal menggunakan format string kalender YYYY-MM-DD seragam atau gunakan library date-fns dengan zona waktu tetap."

# Issue 2 (Bug)
echo "Membuat Issue 2 (Bug - Facility Status Calculator)..."
gh issue create \
  --title "[BUG] Kalkulasi status ketersediaan fasilitas mengabaikan parameter filter tanggal masa depan" \
  --label "bug" \
  --body "### Lokasi Kode
apps/api/src/services/facilityService.ts:36-39 & apps/api/src/utils/statusCalculator.ts

### Deskripsi
Saat filter tanggal masa depan disertakan pada \`GET /api/facilities?date=YYYY-MM-DD\`, kalkulator status tetap membandingkan data reservasi terhadap jam saat ini (\`new Date()\`). Akibatnya, ruangan yang penuh di tanggal yang dicari tetap tampil sebagai TERSEDIA.

### Langkah Reproduksi
1. Reservasi ruangan A untuk besok jam 09:00 - 12:00.
2. Buka daftar fasilitas dengan filter tanggal besok.
3. Status ruangan tetap TERSEDIA.

### Expected vs Actual
- Expected: Menampilkan status keterisian untuk tanggal yang dicari.
- Actual: Menampilkan status hari ini (TERSEDIA).

### Saran Perbaikan
Teruskan parameter filter tanggal sebagai \`referenceDate\` ke fungsi \`calculateFacilityStatus\`."

# Issue 3 (Bug)
echo "Membuat Issue 3 (Bug - Pagination Missing)..."
gh issue create \
  --title "[BUG] Endpoint GET /api/facilities dan GET /api/reservations/my belum mendukung pagination" \
  --label "bug" \
  --body "### Lokasi Kode
apps/api/src/services/facilityService.ts:21 & apps/api/src/services/reservationService.ts:78

### Deskripsi
Endpoint list fasilitas dan reservasi mengambil seluruh data dari database tanpa limitasi \`take\` / \`skip\`. Ini dapat menyebabkan penurunan performa dan konsumsi memori tinggi di perangkat mobile.

### Expected vs Actual
- Expected: Data dipaginasi (misal 10 atau 20 item per halaman) dengan dukungan infinite scroll.
- Actual: Seluruh record ditarik sekaligus dalam satu payload HTTP tunggal.

### Saran Perbaikan
Tambahkan query parameter \`page\` dan \`limit\` pada backend dan integrasikan \`onEndReached\` pada FlatList mobile."

# Issue 4 (Bug)
echo "Membuat Issue 4 (Bug - Keyboard Avoiding on Android)..."
gh issue create \
  --title "[BUG] Keyboard virtual menutupi tombol submit dan error message pada layar buat reservasi Android" \
  --label "bug" \
  --body "### Lokasi Kode
apps/mobile/app/create.tsx:116 & apps/mobile/app/edit/[id].tsx

### Deskripsi
Pada perangkat Android fisik, keyboard virtual menutupi input bagian bawah dan tombol 'Konfirmasi Reservasi'. Pengguna harus menekan tombol back sistem untuk menutup keyboard sebelum bisa menekan tombol submit.

### Expected vs Actual
- Expected: Layar otomatis menyesuaikan offset saat keyboard terbuka sehingga tombol submit tetap dapat dijangkau.
- Actual: Input tujuan dan tombol submit tertutup keyboard.

### Saran Perbaikan
Gunakan konfigurasi behavior height pada Android atau pasang react-native-keyboard-aware-scroll-view."

# Issue 5 (Bug)
echo "Membuat Issue 5 (Bug - Facility Capacity Update Inconsistency)..."
gh issue create \
  --title "[BUG] Tidak ada penanganan bentrok waktu saat admin mengubah kapasitas fasilitas lebih kecil dari reservasi aktif" \
  --label "bug" \
  --body "### Lokasi Kode
apps/api/src/services/facilityService.ts:149-152

### Deskripsi
Saat pengelola menurunkan kapasitas ruangan pada \`PUT /api/facilities/:Id\`, tidak ada validasi apakah ada reservasi berstatus UPCOMING yang jumlah pesertanya melebihi kapasitas baru tersebut.

### Expected vs Actual
- Expected: Sistem menolak pembaruan atau memberi peringatan bahwa kapasitas baru lebih kecil dari reservasi aktif.
- Actual: Data terupdate tanpa peringatan, menyebabkan inkonsistensi data.

### Saran Perbaikan
Tambahkan validasi pada service update fasilitas untuk memverifikasi kapasitas baru terhadap reservasi mendatang."

# Issue 6 (Bug)
echo "Membuat Issue 6 (Bug - Unread Notification Counter)..."
gh issue create \
  --title "[BUG] Badge notifikasi belum menampilkan indikator jumlah pesan belum dibaca (unread count badge)" \
  --label "bug" \
  --body "### Lokasi Kode
apps/mobile/app/index.tsx:210-218

### Deskripsi
Ikon lonceng notifikasi di bilah navigasi atas layar utama tidak memiliki counter badge merah untuk notifikasi yang belum dibaca (IsRead = false).

### Expected vs Actual
- Expected: Muncul badge lingkaran merah dengan angka unread count di atas lonceng.
- Actual: Ikon lonceng statis tanpa indikator notifikasi baru.

### Saran Perbaikan
Sediakan endpoint GET /api/notifications/unread-count dan pasang komponen Badge di atas ikon lonceng header."

# Issue 7 (Enhancement)
echo "Membuat Issue 7 (Enhancement - Automatic Status Transition)..."
gh issue create \
  --title "[ENHANCEMENT] Background cron job / scheduler untuk transisi otomatis status UPCOMING -> ACTIVE -> COMPLETED" \
  --label "enhancement" \
  --body "Implementasikan background worker terjadwal (misal node-cron) di backend untuk mengubah status reservasi secara otomatis berdasarkan waktu mulai dan waktu selesai pemakaian ruangan."

# Issue 8 (Enhancement)
echo "Membuat Issue 8 (Enhancement - Amenities Filter)..."
gh issue create \
  --title "[ENHANCEMENT] Filter pencarian fasilitas berdasarkan kelengkapan fasilitas pendukung (Amenities)" \
  --label "enhancement" \
  --body "Tambahkan filter pencarian fasilitas kampus berdasarkan fasilitas pendukung (seperti Proyektor LCD, AC, Wi-Fi, dan Sound System) baik di endpoint backend maupun UI filter mobile."

# Issue 9 (Enhancement)
echo "Membuat Issue 9 (Enhancement - Device Calendar Sync)..."
gh issue create \
  --title "[ENHANCEMENT] Sinkronisasi jadwal reservasi ke Google Calendar / Kalender Native perangkat (ICS)" \
  --label "enhancement" \
  --body "Sediakan tombol 'Tambahkan ke Kalender' pada kartu reservasi menggunakan modul expo-calendar agar jadwal peminjaman ruangan otomatis tersinkronisasi ke kalender ponsel mahasiswa."

# Issue 10 (Enhancement)
echo "Membuat Issue 10 (Enhancement - Cloud Storage Photo Upload)..."
gh issue create \
  --title "[ENHANCEMENT] Fitur Unggah Foto Ruangan ke Cloud Storage (S3 / Cloudinary)" \
  --label "enhancement" \
  --body "Dukung pengunggahan foto kondisi ruangan ke cloud storage (AWS S3 atau Cloudinary) sehingga foto tersimpan secara terpusat di server dan dapat ditinjau oleh pengelola gedung kampus."

# Issue 11 (Enhancement)
echo "Membuat Issue 11 (Enhancement - Password Reset Flow)..."
gh issue create \
  --title "[ENHANCEMENT] Fitur lupa password dan reset password berbasis token email" \
  --label "enhancement" \
  --body "Tambahkan alur pemulihan akun bagi mahasiswa yang lupa password melalui email verification token/OTP dan layar reset password di mobile."

echo ""
echo "🎉 Semua 11 issue berhasil dibuat di repositori GitHub!"
