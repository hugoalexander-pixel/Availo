# Implementasi state management

Dokumen ini menjelaskan dua alur pada prototype mobile KelasKosong: pencarian ruang dan proses booking. Implementasi mengikuti stack pada `README.md` dan `Architecture.md`: React Native, Expo, dan TypeScript. State memakai `useReducer` + Context karena dependensi Riverpod khusus Flutter tidak sesuai dengan aplikasi ini.

## Posisi kode

| Tanggung jawab | Pencarian ruang | Booking |
|---|---|---|
| UI | `src/features/room-search/components/RoomSearchStateView.tsx`, `App.tsx` | `src/features/bookings/components/BookingForm.tsx`, `app/(tabs)/reservations.tsx` |
| State/reducer | `src/features/room-search/state/RoomSearchProvider.tsx`, `roomSearchReducer.ts` | `src/features/bookings/state/BookingProvider.tsx`, `bookingReducer.ts` |
| Repository | `src/features/room-search/data/roomSearchRepository.ts` | `src/features/bookings/data/reservationRepository.ts` |
| Validasi domain | Filter pencarian di repository | `src/features/bookings/domain/validateBookingForm.ts` |
| Provider dipasang | `app/_layout.tsx` | `app/_layout.tsx` |
| Widget tests | `__tests__/stateManagement.test.tsx` | `__tests__/stateManagement.test.tsx` |

## Alur dan state UI

1. `RoomSearchProvider` memulai pencarian saat dipasang, lalu reducer mengubah state menjadi `loading`.
2. Repository lokal memfilter kapasitas, tipe, dan bentrok jadwal. Respons sukses berisi ruang (`success`) atau daftar kosong (`empty`); kegagalan menjadi `error` dengan tombol **Coba lagi**.
3. Form booking memvalidasi format/tanggal, jam mulai dan selesai, serta jumlah orang terhadap kapasitas sebelum memanggil repository.
4. Saat submit, provider segera mengunci permintaan lewat `inFlight` dan reducer mengatur `submitting`. Tombol dinonaktifkan, indikator tampil, dan input tidak dapat diubah. Submit kedua ditolak.
5. Repository mengembalikan reservasi (`success`) atau error (termasuk bentrok waktu), yang tetap ditampilkan agar pengguna dapat memperbaiki input atau mencoba lagi.
6. Tab **Reservasi** memuat `loading`, daftar (`success`), `empty`, atau `error` dengan tombol retry.

### State penting

- Search: `loading | success | empty | error`, dilindungi `requestId` agar hasil pencarian lama tidak menimpa permintaan baru.
- Booking submit: `idle | submitting | success | error`.
- Riwayat booking: `idle | loading | success | error`.
- Konflik jadwal memakai interval setengah terbuka: `existing.start < requested.end && effectiveEnd > requested.start`. `actualEndedAt` dipakai bila ada, sesuai aturan Architecture.md.

## Repository dan batas prototype

Repository lokal adalah seam untuk mengganti sumber data dengan REST API tanpa memindahkan logika fetch ke widget. Data booking hanya berada di memori dan hilang saat aplikasi dimulai ulang. Validasi bentrok di aplikasi ini hanya simulasi. Untuk penggunaan sungguhan, API dan PostgreSQL harus memvalidasi ulang serta menyimpan booking secara atomik; UI tidak menjadi sumber kebenaran dan tidak memberi jaminan bebas bentrok lintas perangkat. Email pemilik berasal dari sesi prototype, bukan nilai identitas yang dipercaya dari form.

## Widget tests

Jalankan dari folder `mobile`:

```bash
npm test -- --runInBand
npx tsc --noEmit
npm run lint
```

`__tests__/stateManagement.test.tsx` mencakup enam skenario: loading lalu data berhasil, hasil kosong, error pencarian lalu retry, validasi input, submit loading dengan double tap yang ditolak, serta error bentrok dari repository.

## Bukti visual

Hasil perilaku state didokumentasikan lewat enam widget test di atas. Lingkungan pengembangan ini tidak memiliki `react-native-web` atau Android emulator, sehingga screenshot yang menangkap aplikasi aktual belum dapat dibuat di sini. Untuk melengkapi bukti visual pada perangkat reviewer:

1. Jalankan `npx expo start`, buka aplikasi melalui Expo Go, lalu ambil screenshot layar pencarian dan tab Reservasi.
2. Buka form booking, tekan tombol konfirmasi tanpa mengisi field untuk screenshot validasi.
3. Untuk screenshot submit loading, gunakan repository/API yang sengaja menunda respons, lalu tekan konfirmasi. Jangan gunakan data produksi.
4. Simpan hasil sebagai `docs/evidence/room-search.png`, `docs/evidence/booking-validation.png`, dan `docs/evidence/booking-loading.png`, lalu tautkan di bagian ini.

## Prompt AI dan pemeriksaan manual

Prompt yang digunakan:

> Terapkanlah 2 fitur untuk mengimplementasikan state management. Contohnya: Proses Booking. Buat feature pada project saya yang sesuai dengan architecture dan README, menggunakan state management, form, validasi, state loading/loaded/empty/error-retry/submitting anti double tap, widget test untuk state utama, serta dokumentasikan posisi kode, alur, dan prompt AI.

Bagian yang diperiksa dan disesuaikan secara manual: pemisahan UI/provider/repository mengikuti struktur fitur TypeScript yang sudah ada; aturan konflik interval dan `actualEndedAt` mengikuti `Architecture.md`; validasi kapasitas/jam/tanggal; tombol dan input terkunci saat submit; retry; serta test bahwa repository hanya dipanggil sekali pada double tap. Batas lokal prototype dan kebutuhan pengecekan atomik pada backend dicatat agar hasil tidak disalahartikan sebagai sistem booking produksi.
