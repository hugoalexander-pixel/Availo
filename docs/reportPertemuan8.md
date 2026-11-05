# Laporan Pertemuan 8: UX Polish pada Aplikasi Mobile KelasKosong (Availo)

Dokumen ini berisi dokumentasi teknis pemolesan UX (*UX Polish*) pada aplikasi mobile **KelasKosong (Availo)** (`apps/mobile` - React Native Expo). Seluruh perbaikan berfokus pada 4 pilar utama: **Layout Adaptif**, **Keyboard-Safe UI**, **Accessibility Dasar**, dan **Feedback Aksi** tanpa mengubah logika bisnis atau kontrak API backend.

---

## 1. Ringkasan Perubahan per Item (01–04)

### Daftar File yang Dibuat & Dimodifikasi

| Lokasi File | Jenis | Deskripsi Perubahan |
|---|---|---|
| [`mobile/src/hooks/useResponsive.ts`](file:///C:/Users/Medwin/Availo/mobile/src/hooks/useResponsive.ts) | Baru | Hook responsive berbasis `useWindowDimensions()` dinamis (breakpoint compact `< 600dp`, medium/large `≥ 600dp`, `isLandscape`, `numColumns: 1 | 2`, dan `contentMaxWidth: 720`). |
| [`mobile/src/components/ScreenContainer.tsx`](file:///C:/Users/Medwin/Availo/mobile/src/components/ScreenContainer.tsx) | Baru | Komponen pembungkus shared dengan `SafeAreaView`, `KeyboardAvoidingView`, `ScrollView` (`keyboardShouldPersistTaps="handled"`), `RefreshControl`, dan auto-centering `maxWidth: 720` pada layar lebar. |
| [`mobile/src/components/AppButton.tsx`](file:///C:/Users/Medwin/Availo/mobile/src/components/AppButton.tsx) | Baru | Tombol konsisten dengan varian (primary, secondary, outline, destructive), indikator loading spinner, disabled state cegah double-submit, `accessibilityRole="button"`, dan touch target $\ge 44 \times 44\text{dp}$. |
| [`mobile/src/components/FormField.tsx`](file:///C:/Users/Medwin/Availo/mobile/src/components/FormField.tsx) | Baru | Komponen input teks berbasis `forwardRef` dengan label tampak yang terhubung secara semantik, validasi error inline merah + ikon peringatan (`accessibilityRole="alert"`), serta chaining `returnKeyType`. |
| [`mobile/src/components/Toast.tsx`](file:///C:/Users/Medwin/Availo/mobile/src/components/Toast.tsx) | Baru | Komponen snackbar/toast terapung dengan animasi slide-fade, pembeda jenis (sukses hijau, galat merah, info biru), teks kontras tinggi, dan `accessibilityRole="alert"`. |
| [`mobile/App.tsx`](file:///C:/Users/Medwin/Availo/mobile/App.tsx) | Diubah | Layout adaptif (1 kolom di HP, 2 kolom di tablet/layar lebar), input pencarian kata kunci interaktif, modal formulir reservasi keyboard-safe, accessibility label & role, pull-to-refresh, dan feedback loading submit. |
| [`mobile/app/(tabs)/_layout.tsx`](file:///C:/Users/Medwin/Availo/mobile/app/(tabs)/_layout.tsx) | Diubah | Optimasi accessibility tab bar (`tabBarAccessibilityLabel`), font size 12sp, dan peningkatan kontras warna aktif (`#204d35`) dan inaktif (`#526052`) $\ge 4.5:1$. |
| [`mobile/app/(tabs)/reservations.tsx`](file:///C:/Users/Medwin/Availo/mobile/app/(tabs)/reservations.tsx) | Diubah | Layout adaptif `ScreenContainer`, status badge teks + indikator ("● Dikonfirmasi"), dialog konfirmasi destruktif `Alert.alert` sebelum membatalkan, loading spinner, toast sukses, dan empty state interaktif. |
| [`mobile/app/(tabs)/saved.tsx`](file:///C:/Users/Medwin/Availo/mobile/app/(tabs)/saved.tsx) | Diubah | Layout grid adaptif, touch target tombol favorit $\ge 44 \times 44\text{dp}$, pull-to-refresh, toast hasil aksi, dan empty state dengan tombol CTA navigasi ke katalog. |
| [`mobile/app/(tabs)/profile.tsx`](file:///C:/Users/Medwin/Availo/mobile/app/(tabs)/profile.tsx) | Diubah | Profil adaptif terpusat, formulir ubah data keyboard-safe (Nama $\to$ NIM $\to$ Email $\to$ Submit), validasi format inline, tombol simpan berindikator loading, dan dialog konfirmasi keluar akun. |
| [`mobile/src/state/PrototypeStore.tsx`](file:///C:/Users/Medwin/Availo/mobile/src/state/PrototypeStore.tsx) | Diubah | Menambahkan fungsi `removeBooking(id)` untuk mendukung alur pembatalan reservasi serta default state awal untuk demonstrasi reviewer. |

---

### Rincian Perbaikan per Item

#### ITEM 01 – Layout Adaptif (Layar Kecil & Layar Besar)
* **Breakpoints Dinamis:** Menggunakan `useWindowDimensions()` dalam [`useResponsive.ts`](file:///C:/Users/Medwin/Availo/mobile/src/hooks/useResponsive.ts) untuk mendeteksi perubahan dimensi dan orientasi layar secara real-time.
* **Kolom Dinamis:** Layar ponsel kompak (`< 600dp`) menampilkan 1 kolom penuh; layar tablet atau desktop web (`≥ 600dp`) membatasi lebar konten maksimal pada `720dp` yang dipusatkan (`alignSelf: 'center'`) dan daftar kartu ruang disajikan dalam grid 2 kolom yang seimbang.
* **Bebas Overflow & Notched-Safe:** Menghapus batasan tinggi teks yang kaku dan mengganti fixed-width dengan flexbox / wrap. Menggunakan `SafeAreaView` dari `react-native-safe-area-context` pada [`ScreenContainer.tsx`](file:///C:/Users/Medwin/Availo/mobile/src/components/ScreenContainer.tsx) untuk memastikan konten aman dari notch, dynamic island, dan navigation bar.

#### ITEM 02 – Keyboard-Safe UI
* **Keyboard Avoiding & Scroll Handling:** Seluruh screen yang memiliki input dibungkus dengan `KeyboardAvoidingView` (`padding` di iOS, `height` di Android) dipadukan dengan `ScrollView` berproperti `keyboardShouldPersistTaps="handled"`.
* **Visibilitas Input & Submit Saat Keyboard Aktif:** Saat keyboard muncul, area input yang sedang aktif dan tombol submit tetap berada di atas keyboard dan tidak tertutup.
* **Focus Chaining & Dismiss Keyboard:** Input form memanfaatkan `returnKeyType` dan `onSubmitEditing` secara terstruktur (pada Profil: *Nama* `next` $\to$ *NIM* `next` $\to$ *Email* `done` $\to$ *Simpan*; pada Modal Reservasi: *Nama* `next` $\to$ *Keperluan* `done` $\to$ *Konfirmasi*). Keyboard dapat ditutup dengan tap di luar input atau scroll.

#### ITEM 03 – Accessibility Dasar
* **Semantik & Role:** Setiap tombol dan ikon interaktif (termasuk tombol bookmark/hati, tombol notifikasi, tombol tutup modal, dan tombol aksi kartu) telah memiliki `accessibilityRole="button"`, `accessibilityLabel` yang deskriptif, serta `accessibilityState` (`selected`, `disabled`, `busy`).
* **Keterhubungan Label Input:** Seluruh `TextInput` dibungkus komponen [`FormField.tsx`](file:///C:/Users/Medwin/Availo/mobile/src/components/FormField.tsx) yang memiliki label teks visible di atas input dan terhubung dengan `accessibilityLabel` serta `aria-invalid`.
* **Touch Target & Ukuran Fisik:** Minimal area sentuh $\ge 44 \times 44\text{dp}$ pada seluruh kontrol interaktif (menggunakan `minHeight: 44`, `minWidth: 44`, dan `hitSlop`).
* **Kontras Warna & Tipografi:** Warna teks diperbarui ke warna dengan rasio kontras tinggi di atas $4.5:1$ terhadap background putih/abu-abu terang (`#192820`, `#3d4f40`, `#204d35`). Ukuran body text dipertahankan $\ge 13 - 16\text{sp}$ dengan dukungan font scaling sistem.
* **Status Non-Color Only:** Status ketersediaan ruangan maupun status reservasi tidak hanya dibedakan lewat warna, melainkan dilengkapi badge teks dan ikon eksplisit ("● Tersedia", "● Dikonfirmasi"). Elemen grafis/dekoratif murni ditandai `accessible={false}` agar tidak membingungkan pembaca layar (*screen reader*).

#### ITEM 04 – Feedback Aksi
* **Indikator Loading:** Tombol pencarian dan tombol konfirmasi reservasi menampilkan `ActivityIndicator` dan berada dalam status `disabled` saat proses berlangsung untuk mencegah *double-submit*.
* **Toast & Snackbar:** Umpan balik visual langsung via [`Toast.tsx`](file:///C:/Users/Medwin/Availo/mobile/src/components/Toast.tsx) dengan status warna dan ikon yang jelas saat reservasi berhasil, reservasi dibatalkan, filter diatur ulang, atau data disimpan.
* **Konfirmasi Aksi Destruktif:** Tindakan membatalkan reservasi pada tab Reservasi maupun keluar akun pada Profil dilindungi dialog konfirmasi `Alert.alert` sebelum data dieksekusi.
* **Validasi Form Inline:** Kesalahan input (misal kolom keperluan kosong atau format email tidak valid) langsung menampilkan teks galat berwarna merah dengan ikon peringatan tepat di bawah input (`accessibilityRole="alert"`).
* **Pull-to-Refresh & Empty State:** Tersedia pull-to-refresh (`RefreshControl`) dengan warna tema Availo pada tab Cari, Reservasi, dan Tersimpan. Ketika daftar kosong, ditampilkan *empty state card* informatif lengkap dengan tombol aksi pemulihan (*Call to Action*).

---

## 2. Checklist Verifikasi per Screen

| Screen | Item 01: Layout Adaptif | Item 02: Keyboard-Safe UI | Item 03: Accessibility Dasar | Item 04: Feedback Aksi | Hasil Verifikasi |
|---|:---:|:---:|:---:|:---:|:---:|
| **Daftar & Cari Ruangan** (`App.tsx` / `(tabs)/index.tsx`) | **LULUS**<br>(1 kolom di HP, 2 kolom di tablet/layar lebar, `maxWidth: 720`, tanpa teks terpotong) | **LULUS**<br>(Input cari berlabel, `returnKeyType="search"`, auto-dismiss keyboard) | **LULUS**<br>(Touch target $\ge 44\text{dp}$, kontras $\ge 4.5:1$, role & label bermakna) | **LULUS**<br>(Spinner loading cari, pull-to-refresh, toast hasil, empty state + reset filter) | **LULUS** |
| **Form Reservasi Modal** (`App.tsx` modal) | **LULUS**<br>(Modal card proporsional responsif, scrollable di orientasi landscape) | **LULUS**<br>(`returnKeyType="next/done"`, input & tombol submit tetap terlihat di atas keyboard) | **LULUS**<br>(Label input terhubung, tombol tutup $\ge 44\text{dp}$, status busy pada tombol) | **LULUS**<br>(Validasi inline merah, spinner loading submit, toast sukses) | **LULUS** |
| **Reservasi Saya** (`(tabs)/reservations.tsx`) | **LULUS**<br>(Card responsif, centering di layar lebar `maxWidth: 720`) | **LULUS**<br>(Dibungkus `ScreenContainer` scrollable & safe area) | **LULUS**<br>(Status teks + indikator "● Dikonfirmasi", tombol pembatalan a11y) | **LULUS**<br>(Konfirmasi dialog pembatalan, spinner pembatalan, toast sukses, empty state) | **LULUS** |
| **Ruang Tersimpan** (`(tabs)/saved.tsx`) | **LULUS**<br>(Grid adaptif 1/2 kolom, konten terpusat) | **LULUS**<br>(Dibungkus `ScreenContainer` scrollable) | **LULUS**<br>(Tombol hati favorit $\ge 44\text{dp}$, label dinamis tambah/hapus) | **LULUS**<br>(Pull-to-refresh, toast hasil simpan/hapus, empty state dengan CTA) | **LULUS** |
| **Profil Pengguna** (`(tabs)/profile.tsx`) | **LULUS**<br>(Card profil dan form terpusat rapi di tablet/desktop) | **LULUS**<br>(Chaining input: Nama $\to$ NIM $\to$ Email $\to$ Submit, keyboard persist) | **LULUS**<br>(Label terhubung semantik, touch target $\ge 44\text{dp}$, kontras $\ge 4.5:1$) | **LULUS**<br>(Validasi email/nama inline, loading submit, konfirmasi dialog logout) | **LULUS** |

---

## 3. Panduan 4 Screenshot untuk Reviewer

Untuk menjalankan aplikasi di emulator atau web:
```bash
cd mobile
npx expo start
```
*Tekan `w` pada terminal untuk membuka di browser Web, atau tekan `a` untuk membuka di Android Emulator / pindai QR code via aplikasi Expo Go.*

---

### 📸 Screenshot 1: Layout Adaptif (Layar Kecil vs Layar Besar)
* **Screen:** Tab **Cari** (`index`)
* **Kondisi / Ukuran Layar:** 
  * **Layar Kecil:** Tampilan smartphone portrait (lebar $\approx 360 - 412\text{dp}$) atau resize browser ke lebar $< 600\text{px}$.
  * **Layar Besar:** Tampilan browser desktop lebar $\ge 900\text{px}$ atau tablet (lebar $\ge 768\text{dp}$).
* **Langkah Persis untuk Memunculkannya:**
  1. Buka tab **Cari** (halaman beranda aplikasi).
  2. Perhatikan penyajian kartu ruangan (misal: *Ruang Diskusi 302* dan *Ruang Belajar Fokus*):
     * **Pada layar kecil:** Kartu ruangan tersusun rapi secara vertikal **1 kolom penuh**, tidak ada teks yang terpotong atau tumpang tindih.
     * **Pada layar besar:** Seluruh konten otomatis dibatasi pada lebar maksimal (`720dp`) di tengah layar (*centered*), dan kartu ruangan otomatis bertransformasi menjadi **grid 2 kolom** berdampingan.
  3. Ambil screenshot perbandingan kedua kondisi ukuran layar tersebut sebagai bukti pemenuhan **ITEM 01**.

---

### 📸 Screenshot 2: Keyboard Aktif dengan Input dan Tombol Submit Tetap Terlihat
* **Screen:** Formulir Reservasi (Modal) pada Tab **Cari**
* **Kondisi / Ukuran Layar:** Layar smartphone / emulator portrait dengan keyboard virtual aktif.
* **Langkah Persis untuk Memunculkannya:**
  1. Pada tab **Cari**, tekan tombol **"Pesan Ruang →"** pada salah satu kartu ruangan (misal *Ruang Diskusi 302*).
  2. Modal *Formulir Reservasi* akan muncul di layar.
  3. Ketuk pada field input **"Keperluan Reservasi"** hingga keyboard virtual muncul di layar.
  4. Perhatikan bahwa berkat integrasi `KeyboardAvoidingView` + `ScrollView`, dialog tidak terpotong: field input yang sedang aktif beserta tombol **"Konfirmasi Reservasi →"** terdorong naik dan tetap terlihat sepenuhnya di atas keyboard.
  5. Ambil screenshot saat keyboard aktif memperlihatkan input aktif dan tombol konfirmasi yang tetap terlihat sebagai bukti pemenuhan **ITEM 02**.

---

### 📸 Screenshot 3: Bukti Accessibility Dasar
* **Screen:** Tab **Cari** atau Tab **Reservasi Saya**
* **Kondisi / Ukuran Layar:** Bebas (Mobile atau Web Browser Inspect Element / Accessibility Tree Inspector).
* **Langkah Persis untuk Memunculkannya:**
  1. Buka tab **Cari** atau tab **Reservasi Saya**.
  2. Arahkan kursor atau aktifkan accessibility inspector pada elemen interaktif:
     * **Touch Target & Label:** Tombol ikon simpan favorit (♥) memiliki area sentuh $\ge 44 \times 44\text{dp}$ dengan label deskriptif (*"Simpan Ruang Diskusi 302 ke favorit"* / *"Hapus Ruang Diskusi 302 dari tersimpan"*).
     * **Status Non-Color Only:** Status ketersediaan ruang menampilkan teks dan simbol badge visible (*"● Tersedia"* dan *"● Dikonfirmasi"*).
     * **Kontras Warna & Label Terhubung:** Label formulir input tampak jelas dan terhubung semantik, dengan kontras teks di atas $4.5:1$.
  3. Ambil screenshot tampilan UI yang memperlihatkan elemen touch target tombol yang lega, label status eksplisit, dan kontras warna yang tajam sebagai bukti pemenuhan **ITEM 03**.

---

### 📸 Screenshot 4: Feedback Aksi (Loading, Sukses, Error & Dialog Konfirmasi)
* **Screen:** Tab **Cari** (Form Reservasi) $\to$ Tab **Reservasi Saya**
* **Kondisi / Ukuran Layar:** Layar smartphone / emulator bebas.
* **Langkah Persis untuk Memunculkannya:**
  1. **Alur Feedback Error & Validasi Inline:**
     * Tekan tombol **"Pesan Ruang →"** pada salah satu kartu.
     * Kosongkan kolom input *"Keperluan Reservasi"*, lalu tekan tombol **"Konfirmasi Reservasi →"**.
     * Perhatikan feedback error muncul: pesan merah berikon peringatan `⚠️ Keperluan reservasi wajib diisi` di bawah input serta Toast galat merah di bagian atas.
  2. **Alur Feedback Loading & Sukses:**
     * Masukkan keperluan penggunaan (misal: *"Diskusi Tugas Akhir"*), lalu tekan tombol **"Konfirmasi Reservasi →"**.
     * Tombol konfirmasi langsung menampilkan spinner loading putih dan masuk ke kondisi disabled (mencegah *double-submit*).
     * Dialog tertutup dan muncul Toast notifikasi sukses berwarna hijau: *"Reservasi berhasil: Ruang Diskusi 302. Lihat di tab Reservasi."*
  3. **Alur Feedback Konfirmasi Destruktif:**
     * Buka tab **Reservasi**. Tarik ke bawah untuk memicu *Pull-to-Refresh*.
     * Tekan tombol **"Batalkan Reservasi"** pada kartu reservasi aktif.
     * Muncul dialog konfirmasi bawaan (*"Apakah Anda yakin ingin membatalkan reservasi...?"*).
     * Tekan *"Ya, Batalkan"* $\to$ proses pembatalan menampilkan spinner dan memicu Toast sukses hasil pembatalan.
  4. Ambil screenshot salah satu tahapan feedback aksi di atas (misal saat validasi inline & Toast aktif, atau saat dialog konfirmasi pembatalan muncul) sebagai bukti pemenuhan **ITEM 04**.

---

## 4. Hasil Pengujian Mutu Kode

Seluruh pengujian tipe, linting, persistensi, dan ekspor bundler berhasil dijalankan dengan status **0 error** dan **0 warning**:

* **TypeScript Compilation:** `npx tsc --noEmit` $\to$ **LULUS (Exit Code 0)**
* **ESLint Code Quality:** `npx eslint .` $\to$ **LULUS (Exit Code 0)**
* **Local Persistence Test:** `npm run test:persistence` $\to$ **LULUS (Semua 6 Tahap Pengujian Persistence Berhasil)**
* **Expo Bundler Build:** `npx expo export --platform android` & `npx expo export -p web` $\to$ **LULUS (Bundling Sukses 100%)**
