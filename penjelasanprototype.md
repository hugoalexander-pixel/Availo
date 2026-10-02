# Penjelasan Prototype KelasKosong

## Tujuan

KelasKosong adalah prototype aplikasi mobile untuk membantu mahasiswa menjelajahi ruang kampus, menyaring pilihan berdasarkan kapasitas dan tipe, menyimpan ruang favorit, serta mencoba alur pemesanan. Prototype dibuat dengan React Native, Expo, TypeScript, dan Expo Router.

Prototype ini berfokus pada rancangan UI/UX dan demonstrasi alur. Data ruang dan profil masih contoh. Belum ada login sungguhan, server API, database, maupun pemeriksaan bentrok jadwal di backend. Reservasi dan ruang tersimpan hanya disimpan sementara selama aplikasi berjalan.

## Menjalankan aplikasi

Persyaratan: Node.js dan npm, serta Expo Go pada ponsel atau Android Emulator.

```bash
cd mobile
npm install
npx expo start
```

Pindai QR yang ditampilkan terminal dengan Expo Go. Jika perangkat tidak dapat tersambung ke alamat jaringan lokal, jalankan `npx expo start --tunnel`. Untuk Android Emulator, tekan `a` pada terminal Expo. Teks `exp://...` adalah alamat untuk Expo Go, bukan URL halaman website biasa.

## Alur yang dapat dicoba

1. **Cari** — melihat kartu ruang contoh, mengganti kapasitas, jam mulai/selesai, dan menyaring tipe ruang.
2. **Simpan ruang** — tekan ikon hati pada kartu. Daftar pilihan terlihat pada tab **Tersimpan**; tekan hati lagi untuk menghapusnya.
3. **Pesan ruang** — tekan tombol **Pesan ruang** pada kartu, lalu konfirmasi. Ruang yang dipesan muncul di tab **Reservasi**.
4. **Profil** — menampilkan profil contoh untuk memberi gambaran area akun.

Pilihan tanggal, notifikasi, urutkan, serta beberapa interaksi pencarian saat ini masih berupa simulasi/pesan prototype, belum menjalankan layanan sungguhan.

## Struktur proyek saat ini

```text
mobile/
├── app/                         # Route Expo Router
│   ├── _layout.tsx              # Provider dan root stack
│   └── (tabs)/
│       ├── _layout.tsx          # Navigasi bawah: Cari, Reservasi, Tersimpan, Profil
│       ├── index.tsx            # Route Cari
│       ├── reservations.tsx     # Daftar reservasi contoh
│       ├── saved.tsx            # Daftar ruang tersimpan
│       └── profile.tsx          # Profil contoh
├── src/
│   ├── features/rooms/data.ts   # Tipe dan data contoh ruang
│   └── state/PrototypeStore.tsx # State sementara untuk simpan dan reservasi
├── App.tsx                      # UI utama pencarian dan komponen kartu ruang
├── app.json                     # Konfigurasi Expo
└── package.json                 # Dependency dan perintah aplikasi
```

## Hubungan dengan rancangan arsitektur

Rancangan target yang lebih lengkap dijelaskan di [Architecture.md](Architecture.md). Implementasi prototype sudah memakai React Native/Expo, routing berbasis file dengan Expo Router, tab bawah, data domain ruang yang terpisah, dan provider state sementara. Ini memenuhi bagian dasar prototype UI, struktur proyek, routing, dan pemisahan data/state.

Penerapannya masih **sebagian**, sesuai tahap prototype: kartu ruang masih berada di `App.tsx`, belum ada folder komponen reusable khusus; folder service/API, backend, database, autentikasi, dan otorisasi belum dibuat. Fitur seperti pemeriksaan ketersediaan dan pencegahan bentrok pada dokumen arsitektur juga belum diimplementasikan. Untuk tahap berikutnya, ekstrak kartu/tombol berulang ke `src/components/`, lalu tambahkan service API dan backend sesuai rancangan ketika masuk tahap integrasi.

## Jika aplikasi belum terbuka

- Pastikan Expo Go terinstall di hp android masing-masing, lalu pindai QR yang baru.
- Jika alamat `exp://` lokal tidak terjangkau, hentikan server dan jalankan `npx expo start --tunnel`.
- Jika Metro melaporkan error kode, baca file dan nomor baris pada log. Contohnya, teks biasa di React Native harus berada di dalam komponen `<Text>`.
- Setelah perubahan kode, lakukan reload dari menu developer Expo Go.
