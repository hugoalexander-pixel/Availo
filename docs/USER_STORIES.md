# User Stories – KelasKosong MVP

## US-1: Registrasi & Login

**Sebagai** mahasiswa, **saya ingin** mendaftar akun dan login, **agar** saya bisa mengakses fitur reservasi fasilitas kampus.

### Acceptance Criteria

#### AC-1.1: Registrasi berhasil
- **Given** data registrasi valid (nama, email unik, password ≥ 8 karakter)
- **When** saya mengirim request registrasi
- **Then** akun terbuat dan JWT token dikembalikan

#### AC-1.2: Registrasi gagal — email duplikat (negative case)
- **Given** email "mahasiswa@kampus.ac.id" sudah terdaftar
- **When** saya registrasi dengan email yang sama
- **Then** request ditolak dengan status 409 dan pesan "Email sudah terdaftar"

#### AC-1.3: Login berhasil
- **Given** akun dengan email dan password terdaftar
- **When** saya login dengan email dan password yang benar
- **Then** JWT token dikembalikan

#### AC-1.4: Login gagal — password salah (negative case)
- **Given** akun terdaftar
- **When** saya login dengan password yang salah
- **Then** request ditolak dengan status 401 dan pesan "Email atau password salah"

---

## US-2: Pencarian & Filter Fasilitas

**Sebagai** mahasiswa, **saya ingin** mencari dan menyaring fasilitas kampus berdasarkan gedung, tipe, dan kapasitas minimum, **agar** saya bisa menemukan ruangan yang sesuai kebutuhan.

### Acceptance Criteria

#### AC-2.1: Filter berdasarkan tipe fasilitas
- **Given** ada beberapa fasilitas di database dengan tipe berbeda
- **When** saya filter berdasarkan tipe RUANG_DISKUSI
- **Then** hanya fasilitas bertipe RUANG_DISKUSI yang dikembalikan

#### AC-2.2: Filter kapasitas minimum — tidak ada hasil (negative/edge case)
- **Given** fasilitas dengan kapasitas maksimal 200
- **When** saya filter dengan kapasitas minimum 500
- **Then** hasil kosong (array kosong) dikembalikan, bukan error

#### AC-2.3: Pencarian nama (case-insensitive)
- **Given** ada fasilitas bernama "Ruang Diskusi 301"
- **When** saya cari dengan kata kunci "diskusi"
- **Then** fasilitas tersebut muncul di hasil pencarian

---

## US-3: Reservasi Ruangan

**Sebagai** mahasiswa, **saya ingin** memesan ruangan pada tanggal dan jam tertentu, **agar** saya mendapat kepastian tempat untuk belajar/diskusi.

### Acceptance Criteria

#### AC-3.1: Reservasi berhasil
- **Given** ruangan tersedia di slot waktu yang dipilih
- **When** saya membuat reservasi dengan jumlah peserta ≤ kapasitas
- **Then** reservasi berhasil dibuat dengan status UPCOMING

#### AC-3.2: Reservasi gagal — kapasitas terlampaui (negative case)
- **Given** ruangan berkapasitas 8 orang
- **When** saya membuat reservasi dengan 10 peserta
- **Then** ditolak dengan error "CAPACITY_EXCEEDED"

#### AC-3.3: Reservasi gagal — slot waktu bertabrakan (negative case)
- **Given** sudah ada reservasi di ruangan X jam 10:00-12:00
- **When** saya membuat reservasi di ruangan X jam 11:00-13:00
- **Then** ditolak dengan error "RESERVATION_CONFLICT"

#### AC-3.4: Reservasi gagal — tanggal di masa lalu (edge case)
- **Given** hari ini tanggal 23 Oktober 2026
- **When** saya membuat reservasi untuk tanggal 1 Januari 2020
- **Then** ditolak dengan error "DATE_IN_PAST"

---

## US-4: Selesai Lebih Awal & Notifikasi

**Sebagai** mahasiswa yang sedang menggunakan ruangan, **saya ingin** melaporkan bahwa saya selesai lebih awal, **agar** mahasiswa lain bisa segera menggunakan ruangan tersebut.

### Acceptance Criteria

#### AC-4.1: Selesai lebih awal berhasil
- **Given** reservasi saya berstatus ACTIVE atau UPCOMING
- **When** saya tekan "Selesai Lebih Awal"
- **Then** status berubah menjadi EARLY_ENDED dan ActualEndTime terisi waktu saat ini

#### AC-4.2: Notifikasi otomatis untuk pemantau
- **Given** ada mahasiswa lain yang memantau (watch) fasilitas tersebut
- **When** saya selesai lebih awal
- **Then** notifikasi otomatis dibuat untuk semua pemantau dengan pesan bahwa fasilitas tersedia

#### AC-4.3: Gagal — status tidak sesuai (negative case)
- **Given** reservasi berstatus COMPLETED atau CANCELLED
- **When** saya coba "Selesai Lebih Awal"
- **Then** ditolak dengan error "CANNOT_EARLY_END"

#### AC-4.4: Gagal — bukan pemilik (negative case)
- **Given** reservasi milik user lain
- **When** saya coba "Selesai Lebih Awal"
- **Then** ditolak dengan error "NOT_OWNER"

---

## US-5: Status Ketersediaan Fasilitas Real-Time

**Sebagai** mahasiswa, **saya ingin** melihat status ketersediaan fasilitas (Tersedia / Akan Tersedia / Sedang Digunakan), **agar** saya tahu ruangan mana yang bisa langsung dipakai.

### Acceptance Criteria

#### AC-5.1: Status TERSEDIA
- **Given** tidak ada reservasi aktif pada fasilitas saat ini
- **When** status ketersediaan dihitung
- **Then** hasilnya TERSEDIA (hijau)

#### AC-5.2: Status SEDANG_DIGUNAKAN
- **Given** ada reservasi aktif yang berakhir lebih dari 30 menit lagi
- **When** status ketersediaan dihitung
- **Then** hasilnya SEDANG_DIGUNAKAN (merah)

#### AC-5.3: Status AKAN_TERSEDIA
- **Given** ada reservasi aktif yang akan berakhir dalam ≤ 30 menit
- **When** status ketersediaan dihitung
- **Then** hasilnya AKAN_TERSEDIA (kuning)

#### AC-5.4: Tidak ada reservasi sama sekali (edge case)
- **Given** fasilitas baru dibuat tanpa reservasi apa pun
- **When** status ketersediaan dihitung
- **Then** hasilnya TERSEDIA
