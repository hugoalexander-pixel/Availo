# Panduan Build APK & Distribusi — Availo (KelasKosong)

Dokumen ini berisi panduan langkah demi langkah untuk membangun (*build*) file APK Android standalone untuk pengujian langsung di ponsel fisik, serta opsi agar backend API dapat diakses dari luar localhost.

---

## 1. Prasyarat Build

Sebelum memulai build, pastikan Anda memiliki:
1. **Node.js v18+** dan npm.
2. Akun **Expo** (buat gratis di [expo.dev/signup](https://expo.dev/signup) jika belum punya).
3. **EAS CLI** terpasang secara global:
   ```bash
   npm install -g eas-cli
   ```

---

## 2. Langkah Persis Membangun APK Android (Preview Profile)

Profil `preview` di `eas.json` telah dikonfigurasi khusus dengan `buildType: "apk"` sehingga menghasilkan file `.apk` yang bisa langsung dipasang (*sideload*) tanpa melalui Google Play Store.

### Langkah 1: Masuk ke Akun Expo
Buka terminal dan jalankan:
```bash
cd apps/mobile
eas login
```
*Masukkan email/username dan password akun Expo Anda.*

### Langkah 2: Hubungkan Proyek ke Expo Project (Hanya Sekali)
Jika ini pertama kali proyek dibuild dengan akun Anda:
```bash
eas project:init
```
Perintah ini akan mendaftarkan project di dashboard Expo Anda dan mengisi ID proyek di `app.json`.

### Langkah 3: Jalankan Build APK
Jalankan perintah berikut untuk memulai build cloud di server Expo:
```bash
eas build -p android --profile preview
```
- EAS akan menanyakan: *"Generate a new Android Keystore?"* Pilih **Yes** (tekan Enter). Expo akan otomatis mengelola sertifikat penandatanganan aplikasi untuk Anda.
- Proses build cloud akan berjalan selama sekitar 5–12 menit.

---

## 3. Cara Mengunduh & Memasang APK di HP Android

Setelah proses build selesai, EAS akan menampilkan tautan unduhan dan QR Code di terminal:

### Opsi A: Unduh Langsung via Browser HP
1. Arahkan kamera HP ke QR Code yang muncul di terminal (atau buka tautan `https://expo.dev/artifacts/eas/...apk` di Chrome HP).
2. Unduh file `.apk`.
3. Buka file hasil unduhan di notifikasi atau File Manager.
4. Jika muncul peringatan keamanan *"Aplikasi dari sumber tidak dikenal"*, pilih **Setelan (Settings)** lalu aktifkan **Izinkan dari sumber ini (Allow from this source)**.
5. Tekan **Instal (Install)** lalu buka aplikasi Availo.

### Opsi B: Pasang via Kabel Data (ADB)
Jika ponsel terhubung ke laptop/PC dengan mode *USB Debugging* aktif:
```bash
adb install path/ke/file-availo.apk
```

---

## 4. Menghubungkan Backend ke HP Fisik (3 Pilihan)

Agar aplikasi di HP fisik dapat menghubungi backend Express + PostgreSQL di laptop Anda, gunakan salah satu opsi berikut:

### OPSI 1: Menggunakan Tunnel (Paling Cepat & Praktis — Rekomendasi Demo)
Anda tidak perlu deploy backend ke cloud. Cukup buat tunnel aman ke server lokal:

1. **Jalankan Backend Lokal:**
   ```bash
   cd apps/api
   npm run dev
   ```
2. **Buka Terminal Baru dan Jalankan Localtunnel:**
   ```bash
   npx localtunnel --port 3000
   ```
   *Atau jika menggunakan ngrok:*
   ```bash
   ngrok http 3000
   ```
3. Anda akan mendapatkan URL publik HTTPS, contoh: `https://availo-demo.loca.lt`.
4. Buka aplikasi Availo di HP -> buka menu **Profil (👤)** di kanan atas -> ubah Base URL menjadi `https://availo-demo.loca.lt/api` -> tekan **Simpan URL**.

---

### OPSI 2: Menggunakan Jaringan Wi-Fi Lokal yang Sama
Jika laptop dan HP berada dalam satu jaringan Wi-Fi:

1. Cek alamat IP lokal laptop Anda di PowerShell:
   ```powershell
   ipconfig
   ```
   Cari baris `IPv4 Address`, misalnya `192.168.1.15`.
2. Pastikan Windows Firewall mengizinkan koneksi port 3000.
3. Di HP Anda, buka aplikasi Availo -> buka tab **Profil (👤)** -> set URL ke `http://192.168.1.15:3000/api`.

---

### OPSI 3: Deploy Backend ke Cloud (Railway / Render)
Jika ingin backend online 24/7 tanpa laptop harus menyala:

1. **Railway (Rekomendasi Tercepat):**
   - Buat akun di [railway.app](https://railway.app).
   - Buat project baru -> tambah plugin **PostgreSQL**.
   - Tambah service dari GitHub repo ini -> set direktori root ke `apps/api`.
   - Tambahkan variabel lingkungan:
     - `DATABASE_URL` = `${{Postgres.DATABASE_URL}}`
     - `JWT_SECRET` = `kelaskosong-prod-secret-key-2026`
     - `NODE_ENV` = `production`
     - `LOG_LEVEL` = `info`
   - Salin public domain yang diberikan Railway (contoh: `https://kelaskosong-api-production.up.railway.app`).
2. Masukkan URL tersebut saat build EAS dengan menambahkan flag:
   ```bash
   eas build -p android --profile preview --env EXPO_PUBLIC_API_URL=https://kelaskosong-api-production.up.railway.app/api
   ```

---

## 5. Troubleshooting Masalah Umum

| Gejala | Penyebab | Solusi |
|---|---|---|
| **"Server tidak dapat dihubungi" di HP** | HP tidak bisa mengakses `localhost` laptop | Jangan gunakan `localhost` di HP. Gunakan URL tunnel (Opsi 1) atau IP Wi-Fi lokal (Opsi 2). |
| **"Cleartext HTTP traffic to ... not permitted"** | Android 9+ memblokir HTTP biasa tanpa enkripsi | Gunakan tunnel HTTPS (`https://...`) atau tambahkan konfigurasi domain keamanan jaringan. |
| **Izin Kamera / Galeri Ditolak Permanen** | Pengguna memilih *"Jangan tanya lagi"* | Buka menu **Pengaturan HP** -> Aplikasi -> Availo -> Izin -> aktifkan Kamera dan Foto. Di aplikasi, dialog konfirmasi otomatis mengarahkan ke halaman ini jika ditekan. |
| **Notifikasi tidak muncul di Android 13+** | Izin `POST_NOTIFICATIONS` belum diberikan | Buka menu Notifikasi (🔔) di aplikasi -> tekan tombol **🔔 Uji Notifikasi** untuk memicu permintaan izin sistem, lalu pilih *Izinkan*. |
| **EAS Build Antre Terlalu Lama** | Kuota concurrent gratis sedang padat | Anda dapat memantau progres build langsung di terminal atau dashboard [expo.dev](https://expo.dev). |

