# Laporan Implementasi: Local Data & Persistence (Fitur My Bookings - Availo)

Dokumen ini berisi dokumentasi teknis, struktur data, alur arsitektur, implementasi fungsi CRUD, pengujian persistensi data lokal, serta checklist demo untuk aplikasi mobile **Availo**.

---

## 1. Daftar File yang Dibuat dan Diubah

### File Baru

| Lokasi File | Deskripsi |
|---|---|
| [`apps/mobile/src/types/Booking.ts`](../apps/mobile/src/types/Booking.ts) | Model & interface TypeScript untuk `Booking`, `BookingFormData`, dan `BookingStatus` dengan konvensi PascalCase. |
| [`apps/mobile/src/services/BookingStorage.ts`](../apps/mobile/src/services/BookingStorage.ts) | Service persistence AsyncStorage dengan key `@availo/bookings` untuk menangani seluruh operasi CRUD data lokal. |
| [`apps/mobile/src/constants/Theme.ts`](../apps/mobile/src/constants/Theme.ts) | Token desain tema (warna status, palette indigo, radius sudut, typography). |
| [`apps/mobile/src/components/BookingForm.tsx`](../apps/mobile/src/components/BookingForm.tsx) | Komponen formulir shared untuk Create dan Edit booking, dilengkapi validasi jam (`EndTime > StartTime`) dan selector status. |
| [`apps/mobile/app/_layout.tsx`](../apps/mobile/app/_layout.tsx) | Root Stack Layout Expo Router dengan tema header Availo. |
| [`apps/mobile/app/index.tsx`](../apps/mobile/app/index.tsx) | Halaman utama (*My Bookings*) dengan daftar card, status badge, tombol Edit & Hapus, empty state, indikator loading, dan pull-to-refresh. |
| [`apps/mobile/app/create.tsx`](../apps/mobile/app/create.tsx) | Halaman Tambah Booking (*Create Booking*). |
| [`apps/mobile/app/edit/[id].tsx`](../apps/mobile/app/edit/[id].tsx) | Halaman Edit Booking berbasis *dynamic route* `[id]`. |
| [`apps/mobile/scripts/test-persistence.ts`](../apps/mobile/scripts/test-persistence.ts) | Test runner otomatis untuk memverifikasi 6 skenario persistensi & validasi data. |

### File yang Dikonfigurasi / Diubah

| Lokasi File | Perubahan |
|---|---|
| [`apps/mobile/package.json`](../apps/mobile/package.json) | Menambahkan dependency `@react-native-async-storage/async-storage`, `expo-router`, dan script `test:persistence`. |
| [`apps/mobile/app.json`](../apps/mobile/app.json) | Konfigurasi nama aplikasi Availo, scheme deep linking `availo`, dan plugin `expo-router`. |
| [`package.json`](../package.json) | Menambahkan script `"dev:mobile": "cd apps/mobile && npm run start"` di root workspace monorepo. |

---

## 2. Lokasi Kode Local Data & Persistence

Semua logika penyimpanan lokal diisolasi secara terpusat dan modular pada:

👉 **[`apps/mobile/src/services/BookingStorage.ts`](../apps/mobile/src/services/BookingStorage.ts)**

- **Storage Key:** `@availo/bookings`
- **Tanggung Jawab Teknis:**
  - Membaca data mentah dari `AsyncStorage.getItem(STORAGE_KEY)` dengan penanganan fallback array kosong `[]` jika storage belum memiliki data.
  - Serialisasi data objek ke string JSON sebelum disimpan dengan `AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(bookings))`.
  - Error handling terstruktur menggunakan blok `try...catch` pada setiap operasi I/O storage.
  - Pembuatan ID unik otomatis berbasis timestamp dan kombinasi string acak (`generateId()`).

---

## 3. Alur Data (Data Flow Architecture)

```
[ UI SCREEN / FORM ]
  │  (Input user & Validasi jam: EndTime > StartTime)
  ▼
[ SERVICE: BookingStorage.ts ]
  │  (createBooking / getAllBookings / updateBooking / deleteBooking)
  ▼
[ ASYNC STORAGE: @react-native-async-storage/async-storage ]
  │  (Penyimpanan persisten lokal pada disk perangkat - key: @availo/bookings)
  ▼
[ RE-HYDRATION KE UI ]
  │  (useFocusEffect memanggil getAllBookings() setiap layar dibuka kembali)
  ▼
[ TAMPILAN TERBARU PADA REACT NATIVE FLATLIST ]
```

1. **Create Flow:** Pengguna mengisi formulir → `BookingForm` memvalidasi input penting dan memastikan `EndTime > StartTime` → memanggil fungsi `createBooking(data)` pada service → data baru dimasukkan ke array dan disimpan ke AsyncStorage → pengguna diarahkan kembali ke layar utama.
2. **Read Flow:** Layar `index.tsx` menerima fokus → hook `useFocusEffect` memicu fungsi `loadBookings()` → service membaca storage via `getAllBookings()` → mengurutkan data booking berdasarkan waktu pembuatan terbaru → `setBookings()` memperbarui state UI.
3. **Update Flow:** Pengguna menekan tombol Edit pada salah satu kartu booking → navigasi ke rute dinamis `/edit/[id]` → data awal dimuat via `getBookingById(id)` → form menampilkan data yang sudah ada → pengguna mengubah data/status → `updateBooking(id, data)` menyimpan perubahan ke AsyncStorage.
4. **Delete Flow:** Pengguna menekan tombol Hapus → muncul dialog konfirmasi bawaan `Alert.alert` → jika dikonfirmasi, fungsi `deleteBooking(id)` menghapus booking dari array dan menyimpan kembali array yang telah difilter ke AsyncStorage → UI langsung di-refresh tanpa reload manual.

---

## 4. Implementasi Fungsi CRUD

Kutipan implementasi fungsi CRUD dari file [`apps/mobile/src/services/BookingStorage.ts`](../apps/mobile/src/services/BookingStorage.ts):

### A. Read All & Helper Storage

```typescript
export async function getAllBookings(): Promise<Booking[]> {
  try {
    const raw = await AsyncStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    return JSON.parse(raw) as Booking[];
  } catch (error) {
    console.error("Gagal membaca data booking:", error);
    return [];
  }
}

export async function saveAllBookings(bookings: Booking[]): Promise<void> {
  try {
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(bookings));
  } catch (error) {
    console.error("Gagal menyimpan data booking:", error);
    throw new Error("Gagal menyimpan data booking.");
  }
}
```

### B. Create

```typescript
export async function createBooking(data: BookingFormData): Promise<Booking> {
  const bookings = await getAllBookings();
  const newBooking: Booking = {
    Id: generateId(),
    FacilityName: data.FacilityName,
    Date: data.Date,
    StartTime: data.StartTime,
    EndTime: data.EndTime,
    Purpose: data.Purpose,
    Status: data.Status || "Pending",
    CreatedAt: new Date().toISOString(),
  };
  bookings.push(newBooking);
  await saveAllBookings(bookings);
  return newBooking;
}
```

### C. Update

```typescript
export async function updateBooking(
  id: string,
  data: Partial<BookingFormData & { Status: Booking["Status"] }>
): Promise<Booking> {
  const bookings = await getAllBookings();
  const index = bookings.findIndex((b) => b.Id === id);
  if (index === -1) {
    throw new Error("Booking tidak ditemukan.");
  }
  const updated: Booking = { ...bookings[index], ...data };
  bookings[index] = updated;
  await saveAllBookings(bookings);
  return updated;
}
```

### D. Delete

```typescript
export async function deleteBooking(id: string): Promise<void> {
  const bookings = await getAllBookings();
  const filtered = bookings.filter((b) => b.Id !== id);
  if (filtered.length === bookings.length) {
    throw new Error("Booking tidak ditemukan.");
  }
  await saveAllBookings(filtered);
}
```

---

## 5. Cara Menjalankan Aplikasi dan Pengujian Persistence

### A. Uji Persistensi Otomatis (Persistence Test Runner)

Uji otomatis mencakup 6 skenario siklus hidup aplikasi (restart / reload storage):

```bash
# Masuk ke folder mobile:
cd mobile
# (atau jika monorepo apps: cd apps/mobile)

npm run test:persistence
```

**Hasil Pengujian:**

```text
=================================================
   AVAILO - PERSISTENCE & CRUD VERIFICATION TEST 
=================================================

Test 0: Kondisi storage awal (kosong)
  [PASS] Storage awal kosong, mengembalikan []

Test 1: Tambahkan satu booking (CREATE)
  [PASS] Validasi waktu: 09:00 -> 11:00 valid (EndTime > StartTime)
  [PASS] Booking dibuat: ID = 1792119745736-j835ez2, Status = Pending

Test 2 & 3: Simulasi TUTUP APLIKASI sepenuhnya dan BUKA KEMBALI
  [PASS] Data dibaca ulang dari storage: 1 booking ditemukan
Test 4: Verifikasi booking tersimpan setelah aplikasi dibuka kembali (READ)
  [PASS] Data booking terbukti persisten!

Test 5: Edit booking & verifikasi persistensi (UPDATE)
  [PASS] Perubahan booking tersimpan dan terbaca kembali setelah restart!

Test 6: Hapus booking & verifikasi penghapusan (DELETE)
  [PASS] Booking yang dihapus tidak muncul lagi setelah restart!

Test 7: Validasi input jam selesai <= jam mulai
  [PASS] Jam selesai lebih awal dari jam mulai berhasil ditolak!

=================================================
      SEMUA 6 TAHAP PENGUJIAN PERSISTENSI LULUS! 
=================================================
```

### B. Menjalankan Aplikasi Mobile di Expo

Dari folder `mobile`:

```bash
cd mobile
npx expo start
```

Opsi perangkat:
- Tekan **`a`** untuk emulator Android.
- Tekan **`i`** untuk simulator iOS.
- Tekan **`w`** untuk browser web.
- Pindai QR Code dengan aplikasi **Expo Go** pada smartphone fisik.

---

## 6. Verifikasi TypeScript

Pemeriksaan tipe data TypeScript pada project mobile:

```bash
cd mobile
npx tsc --noEmit
```

*Output:* `0 error` (Lolos kompilasi penuh tanpa ada type issue).

---

## 7. Checklist Demo untuk Dosen / Reviewer

Berikut panduan langkah demi langkah saat melakukan presentasi atau evaluasi fitur:

- [ ] **1. Tampilan Awal (Empty State):** Buka aplikasi dalam keadaan storage belum terisi data, tunjukkan icon 📋 *"Belum Ada Booking"* beserta pesan panduan yang rapi.
- [ ] **2. Uji Validasi Form:**
  - Tekan tombol **`+`** (Floating Action Button).
  - Biarkan form kosong atau masukkan jam selesai yang lebih awal daripada jam mulai (misal `14:00` ke `12:00`).
  - Tunjukkan indikator error validasi warna merah yang mencegah penyimpanan data tidak valid.
- [ ] **3. Tambah Booking (Create):**
  - Pilih fasilitas kampus (contoh: *"Ruang Diskusi 302"*).
  - Masukkan tanggal (format `YYYY-MM-DD`), jam mulai (misal `09:00`), jam selesai (misal `11:00`), dan tujuan penggunaan.
  - Tekan **Tambah Booking**. Tunjukkan alert sukses dan data baru langsung muncul di daftar dengan badge status **Menunggu (Pending)**.
- [ ] **4. Uji Persistensi Data (Tutup & Buka Aplikasi):**
  - Tutup aplikasi sepenuhnya (kill task / tekan tombol `r` di Metro bundler untuk reload penuh).
  - Buka kembali aplikasi.
  - Tunjukkan bahwa data booking tetap tampil dan tidak hilang, membuktikan data tersimpan pada AsyncStorage fisik dan bukan hanya pada memory `useState`.
- [ ] **5. Edit Booking (Update):**
  - Tekan tombol **✏️ Edit** pada kartu booking.
  - Ubah deskripsi tujuan atau ubah status menjadi **Dikonfirmasi (Confirmed)** menggunakan chip selector status.
  - Tekan **Simpan Perubahan**. Tunjukkan bahwa kartu di halaman utama berubah status menjadi hijau.
  - Reload aplikasi kembali untuk membuktikan perubahan data tersimpan permanen.
- [ ] **6. Hapus Booking (Delete):**
  - Tekan tombol **🗑️ Hapus** pada kartu booking.
  - Tunjukkan dialog konfirmasi pembatalan/penghapusan.
  - Tekan **Hapus**. Data terhapus seketika dari storage dan layar kembali ke tampilan *empty state*.
