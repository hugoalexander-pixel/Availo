# Availo (KelasKosong) — MVP Lengkap

Aplikasi reservasi fasilitas kampus (ruang kelas, ruang diskusi, laboratorium, ruang rapat, aula) secara digital dan real-time untuk mahasiswa dan pengelola fasilitas kampus.

---

## 📱 Ringkasan Aplikasi Mobile (Availo)

Aplikasi mobile dibangun menggunakan **React Native + Expo SDK 58 + Expo Router (file-based routing)** dan terintegrasi penuh (*Full API Integration*) dengan backend REST API KelasKosong.

### Fitur Inti yang Selesai
1. **Navigasi Lengkap & Konsisten:**
   - Stack Navigator dengan header terstruktur, back button native, bebas dari dead-end.
   - Layar: Masuk (Login) ⇄ Daftar (Register) ⇄ Beranda Reservasi Saya ⇄ Cari Fasilitas ⇄ Detail Fasilitas ⇄ Buat Reservasi ⇄ Ubah Reservasi ⇄ Notifikasi ⇄ Profil Pengguna.
2. **Form & Validasi:**
   - Semua input memiliki validasi format per-field: tanggal (`YYYY-MM-DD`), jam mulai dan selesai (`HH:MM`), validasi `jam selesai > jam mulai`, batasan kapasitas peserta ruangan, dan pesan error ramah.
3. **Penyimpanan Data Persisten & Sinkronisasi:**
   - Token otentikasi JWT disimpan secara terenkripsi di keychain/keystore perangkat via `expo-secure-store`.
   - Data reservasi dan ketersediaan ruangan tersinkronisasi langsung dengan backend PostgreSQL.
   - Foto kondisi ruangan disimpan persisten secara lokal di penyimpanan perangkat menggunakan `AsyncStorage`.

---

## 🚀 3 Advanced Features (Implementasi Nyata)

| # | Fitur | Library / API Asli | Manfaat bagi Pengguna | Penanganan Izin & Pembatalan |
|---|---|---|---|---|
| **1** | **Autentikasi & Secure Storage** | `expo-secure-store` | Sesi user aman di hardware keychain/keystore; akses berbasis peran (*Role-Based*: Mahasiswa & Pengelola); token otomatis terlampir di setiap request API. | Fallback otomatis ke penyimpanan lokal terenkripsi jika platform tidak mendukung SecureStore. |
| **2** | **Kamera & Dokumentasi Ruangan** | `expo-image-picker` | Pengguna dapat mengambil foto kondisi awal ruangan sebelum dipakai sebagai bukti dokumentasi fasilitas kampus. | Menangani 3 status izin: *Diminta*, *Ditolak* (tampilkan pesan alternatif), dan *Ditolak Permanen* (konfirmasi buka Pengaturan perangkat). Pembatalan oleh pengguna tidak menyebabkan crash atau kerusakan data. |
| **3** | **Notifikasi Lokal Terjadwal** | `expo-notifications` + `expo-device` | Pengguna menerima pengingat notifikasi otomatis di perangkat sebelum jadwal reservasi ruangan dimulai, serta konfirmasi visual instan saat reservasi berhasil dibuat. | Menangani izin notifikasi sistem (Android 13+ POST_NOTIFICATIONS & iOS), banner foreground, dan tombol demo uji coba langsung di layar Notifikasi. |

---

## 🛡️ Penanganan State & Kasus di Seluruh Layar

- **Loading:** Indikator spinner (`LoadingView`) saat memuat data dari server atau memproses form.
- **Empty:** Tampilan informatif (`EmptyView`) dengan ilustrasi ikon dan tombol aksi (misal: "Cari & Reservasi Ruangan" saat belum ada jadwal aktif).
- **Error:** Pesan kesalahan ramah (`ErrorView`) jika server backend belum aktif atau koneksi terputus, dilengkapi tombol **🔄 Coba Lagi**.
- **Izin (Permissions):** Mendukung dialog izin platform, pesan penjelasan saat ditolak, dan tautan langsung ke Pengaturan (`Linking.openSettings()`) saat ditolak permanen.
- **Pembatalan:** Pengguna dapat membatalkan pengambilan foto atau membatalkan pengisian form tanpa crash dan tanpa data tersimpan setengah.
- **Konfirmasi Aksi Destruktif:** Tindakan pembatalan reservasi, pelepasan ruangan lebih awal, dan keluar akun (logout) selalu meminta konfirmasi pengguna (`Alert.alert`).

---

## 🛠️ Tech Stack

| Layer | Teknologi |
|---|---|
| **Mobile App** | React Native 0.88, Expo SDK 58, Expo Router, TypeScript |
| **Mobile Security** | `expo-secure-store`, `@react-native-async-storage/async-storage` |
| **Mobile Hardware/Sensors** | `expo-image-picker`, `expo-notifications`, `expo-device` |
| **Backend API** | Node.js, Express, TypeScript |
| **Database & ORM** | PostgreSQL 16, Prisma ORM 6.1 |
| **Testing** | Jest, ts-jest, Node test runner via tsx |

---

## 💻 Cara Install & Menjalankan

### 1. Prasyarat
- Node.js v18+ dan npm
- Docker (opsional untuk database PostgreSQL lokal)
- Expo Go di HP fisik atau Android Emulator

### 2. Backend API
```bash
# 1. Masuk ke direktori backend
cd apps/api

# 2. Install dependencies
npm install

# 3. Jalankan server backend (port 3000)
npm run dev
```
Backend akan aktif di `http://localhost:3000`. Cek kesehatan server via:
```bash
curl http://localhost:3000/api/health
```

### 3. Mobile App (Availo)
```bash
# 1. Masuk ke direktori mobile
cd apps/mobile

# 2. Jalankan Expo dev server
npm start
```
- Tekan `a` untuk membuka di **Android Emulator** (otomatis memakai base URL `http://10.0.2.2:3000/api`).
- Scan QR code menggunakan aplikasi **Expo Go** pada perangkat fisik Android/iOS.
- Di layar **Profil**, Anda dapat mengubah URL API ke alamat IP lokal Wi-Fi komputer Anda (contoh: `http://192.168.1.10:3000/api`).

---

## 🧪 Pengujian (Unit Tests)

### Menjalankan Semua Test Backend (36 Tests):
```bash
cd apps/api
npm test
```
*Hasil:* 5 test suites passed (US-1: Auth, US-2: Filter Fasilitas, US-3: Reservasi & Update, US-4: Early End, US-5: Kalkulator Status).

### Menjalankan Semua Test Mobile (28 Tests):
```bash
cd apps/mobile
npm run test:all
```
*Hasil:*
1. `scripts/test-persistence.ts`: 7/7 pengujian siklus CRUD & persistensi AsyncStorage setelah restart aplikasi.
2. `scripts/test-business-rules.ts`: 21/21 pengujian aturan bisnis:
   - Validasi autentikasi & penyimpanan token SecureStore
   - Validasi batasan kapasitas ruangan & anti bentrok waktu
   - Penyelarasan enum status backend (`UPCOMING`, `ACTIVE`, `COMPLETED`, `CANCELLED`, `EARLY_ENDED`, `TERSEDIA`, `AKAN_TERSEDIA`)
   - Penanganan 3 status izin (`granted`, `denied`, `blocked`)
   - Penanganan pembatalan kamera pengguna tanpa crash

---

## 👤 Akun Demo Bawaan

| Peran (Role) | Email | Password | Hak Akses |
|---|---|---|---|
| **Mahasiswa** | `budi@kampus.ac.id` | `password123` | Cari ruangan kosong, buat reservasi, ambil foto dokumentasi, batal/akhiri jadwal |
| **Pengelola** | `pengelola@kampus.ac.id` | `adminpass123` | Kelola gedung dan ruangan fasilitas kampus |
