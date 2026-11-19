# Dokumentasi Runtime Logging — Availo (KelasKosong)

Dokumen ini menjelaskan strategi logging terstruktur, format data, mekanisme redaksi data sensitif, dan panduan penelusuran masalah (*end-to-end tracing*) antara aplikasi mobile (`apps/mobile`) dan backend API (`apps/api`).

---

## 1. Arsitektur & Prinsip Logging

Sistem logging Availo dirancang untuk memberikan visibilitas penuh saat aplikasi berjalan di lingkungan pengembangan maupun produksi tanpa membahayakan data pribadi pengguna:

1. **Struktur & Terpusat:** Log dicatat dalam format konsisten dengan metadata terstruktur (bukan sekadar `console.log` acak).
2. **Korelasi ID (`X-Request-Id`):** Setiap request HTTP dari mobile dilengkapi header `X-Request-Id` (atau di-generate otomatis oleh backend jika tidak disertakan). ID ini dicatat di log mobile dan log backend sehingga satu transaksi pengguna dapat ditelusuri dari ujung ke ujung.
3. **Penyaringan Data Sensitif (Zero-Leak Redaction):** Password, token JWT, header otorisasi, dan rahasia lainnya otomatis disensor (`[REDACTED]`).
4. **Pengendalian Level Berbasis Lingkungan:**
   - **Backend:** Diatur melalui variabel lingkungan `LOG_LEVEL` (`error`, `warn`, `info`, `debug`). Default: `info` di production, `debug` di development.
   - **Mobile:** Level `debug` dan `info` hanya aktif pada mode pengembangan (`__DEV__`). Pada build rilis produksi, hanya `warn` dan `error` yang dicatat.

---

## 2. Logging Backend (`apps/api`)

### Teknologi
- **Library:** `winston` v3
- **Lokasi Kode:**
  - Logger Core & Redaksi: `apps/api/src/utils/logger.ts`
  - Request Logger Middleware: `apps/api/src/middleware/requestLogger.ts`
  - Error Handler Middleware: `apps/api/src/middleware/errorHandler.ts`

### Format Log
Pada mode development:
```text
[2026-11-19 17:15:30.125] [INFO] [req-1732005521-abc1234]: HTTP GET /api/facilities 200 - 14ms {"requestId":"req-1732005521-abc1234","method":"GET","path":"/api/facilities","status":200,"durationMs":14}
```
Pada mode production (`NODE_ENV=production`):
```json
{
  "timestamp": "2026-11-19 17:15:30.125",
  "level": "info",
  "message": "HTTP GET /api/facilities 200 - 14ms",
  "requestId": "req-1732005521-abc1234",
  "method": "GET",
  "path": "/api/facilities",
  "status": 200,
  "durationMs": 14
}
```

### Event Kunci yang Dicatat
- **Autentikasi:**
  - Login berhasil: `userId`, `email`, `role`, `requestId` (tanpa password/token).
  - Login gagal: `email`, alasan kegagalan, `requestId`.
  - Registrasi berhasil & gagal: status validasi, duplikasi email.
- **Reservasi:**
  - Reservasi dibuat: `reservationId`, `userId`, `facilityId`, `date`, `requestId`.
  - Reservasi ditolak: alasan validasi (misal `RESERVATION_CONFLICT`, `CAPACITY_EXCEEDED`).
  - Pembatalan & Selesai Lebih Awal (*Early End*).
- **Infrastruktur & Database:**
  - Verifikasi koneksi PostgreSQL saat booting server.
  - Kesalahan query / kegagalan koneksi DB dicatat dengan stack trace.

---

## 3. Logging Mobile (`apps/mobile`)

### Teknologi
- **Utility:** `AppLogger` (`apps/mobile/src/utils/logger.ts`)
- **Global Error Handling:**
  - React Error Boundary: `apps/mobile/src/components/ErrorBoundary.tsx`
  - React Native Global Error Handler: `ErrorUtils.setGlobalHandler` di `apps/mobile/app/_layout.tsx`

### Format Log Mobile
```text
[2026-11-19 17:15:29.800] [DEBUG] [API] -> POST /reservations {"requestId":"1732005521-abc1234","method":"POST","endpoint":"/reservations"}
[2026-11-19 17:15:30.150] [INFO]  [API] <- POST /reservations [201] 350ms {"requestId":"1732005521-abc1234","status":201,"durationMs":350}
[2026-11-19 17:15:31.000] [INFO]  [NAV] Navigasi ke layar: /index
```

### Kategori Tag Log
| Tag | Keterangan |
|---|---|
| `[NAV]` | Perpindahan layar pengguna (misal: `/login`, `/facilities/[id]`, `/create`) |
| `[API]` | Request keluar dan response masuk, status HTTP, durasi ms, serta korelasi `requestId` |
| `[AUTH]` | Pemeriksaan token lokal, sesi kedaluwarsa, pengalihan login |
| `[PERMISSION]` | Penolakan izin perangkat (`denied` atau `blocked`) untuk kamera atau notifikasi |
| `[CAMERA]` | Peluncuran kamera/galeri dan pembatalan oleh pengguna |
| `[NOTIFICATION]`| Penjadwalan pengingat lokal dan pemicuan notifikasi instan |
| `[CRASH]` | Komponen React crash yang ditangkap oleh ErrorBoundary beserta component stack |
| `[CRASH_GLOBAL]`| Fatal uncaught JavaScript runtime exception |

---

## 4. Cara Melihat & Memantau Log

### 1. Backend (`apps/api`)
- **Lokal saat pengembangan:**
  ```bash
  cd apps/api
  npm run dev
  ```
  Output log langsung muncul secara real-time di terminal dengan format yang mudah dibaca.
- **Mengatur Verbosity Level:**
  ```bash
  # Windows PowerShell
  $env:LOG_LEVEL="debug"; npm run dev

  # Linux / macOS / Bash
  LOG_LEVEL=debug npm run dev
  ```
- **Jika dijalankan via Docker:**
  ```bash
  docker logs -f kelaskosong-api
  ```

### 2. Mobile (`apps/mobile`)
- **Metro Bundler Terminal:**
  Log dicetak langsung di konsol terminal saat menjalankan `npx expo start`.
- **Android Logcat:**
  ```bash
  npx react-native log-android
  # atau
  adb logcat *:S ReactNative:V ReactNativeJS:V
  ```
- **Browser Developer Tools:**
  Buka React Native Dev Menu (Ctrl+M di emulator atau goyang perangkat) -> pilih **Open JS Debugger** -> buka tab **Console**.

---

## 5. Panduan Menelusuri Masalah dari Mobile ke Backend (Contoh Kasus)

### Skenario Kasus:
Pengguna melaporkan pesan error *"Sudah ada reservasi lain di slot waktu tersebut"* saat membuat reservasi ruangan.

### Langkah Penelusuran:

#### Langkah 1: Cek Log di Sisi Mobile
Pada log mobile, cari tag `[API]` saat pengguna menekan tombol simpan:
```text
[2026-11-19 17:18:02.100] [DEBUG] [API] -> POST /reservations {"requestId":"1795082100-xy78ab","method":"POST","endpoint":"/reservations"}
[2026-11-19 17:18:02.320] [WARN]  [API] API Error POST /reservations [409]: Sudah ada reservasi lain di slot waktu tersebut. {"requestId":"1795082100-xy78ab","status":409,"message":"Sudah ada reservasi lain di slot waktu tersebut."}
```
👉 **Kunci Ditemukan:** Request ID adalah `1795082100-xy78ab`.

#### Langkah 2: Cocokkan Request ID di Log Backend
Buka log backend dan cari `1795082100-xy78ab` (bisa menggunakan `grep` atau fitur pencarian log):
```text
[2026-11-19 17:18:02.105] [INFO] [1795082100-xy78ab]: HTTP POST /api/reservations incoming {"userId":1}
[2026-11-19 17:18:02.315] [WARN] [1795082100-xy78ab]: Pembuatan reservasi ditolak oleh validasi bisnis {"userId":1,"facilityId":2,"reason":"Sudah ada reservasi lain di slot waktu tersebut."}
[2026-11-19 17:18:02.318] [WARN] [1795082100-xy78ab]: HTTP POST /api/reservations 409 - 213ms {"requestId":"1795082100-xy78ab","status":409,"durationMs":213,"userId":1}
```

#### Langkah 3: Analisis & Kesimpulan
1. Dari log backend, kita mengetahui bahwa user ID `1` mencoba memesan fasilitas ID `2` pada slot waktu yang bertabrakan.
2. Tidak ada password atau token yang bocor dalam log.
3. Durasi eksekusi adalah 213ms.
4. Masalah ini bukan bug crash server melainkan penolakan bisnis valid (*409 Conflict*).

