# KelasKosong

## Deskripsi

**KelasKosong** adalah aplikasi untuk membantu mahasiswa menemukan dan mereservasi fasilitas kampus (ruang kelas, ruang diskusi, lab, aula) yang sedang kosong — tanpa harus datang langsung ke lokasi.

### Masalah yang Diselesaikan
Informasi ketersediaan ruangan kampus sering tidak terpusat. Mahasiswa harus datang langsung atau bertanya via grup chat untuk mengetahui ruangan mana yang kosong. KelasKosong menyediakan informasi ini secara digital dan real-time.

### 5 Fitur Inti (MVP)
1. **Registrasi & Login** — Akun mahasiswa dengan autentikasi JWT
2. **Pencarian & Filter Fasilitas** — Cari ruangan berdasarkan gedung, tipe, kapasitas
3. **Reservasi Ruangan** — Pesan ruangan di slot waktu tertentu dengan pencegahan double-booking
4. **Selesai Lebih Awal** — Lepas ruangan lebih awal agar mahasiswa lain bisa pakai, plus notifikasi otomatis
5. **Status Ketersediaan Real-Time** — Lihat status ruangan: Tersedia / Akan Tersedia / Sedang Digunakan

---

## Technology Stack

| Layer | Technology |
|---|---|
| Backend | Node.js + TypeScript + Express |
| Database | PostgreSQL |
| ORM | Prisma |
| Auth | JWT + bcrypt |
| Validasi | Zod (tersedia) |
| API | REST API |
| Container | Docker Compose (PostgreSQL) |

---

## Cara Install

### Prasyarat
- Node.js v18+
- npm
- Docker & Docker Compose (untuk PostgreSQL)

### Langkah-langkah

1. **Clone repository**
   ```bash
   git clone <repository-url>
   cd Availo
   ```

2. **Setup environment**
   ```bash
   cp .env.example .env
   ```

3. **Jalankan PostgreSQL via Docker**
   ```bash
   docker-compose up -d
   ```

4. **Install dependencies**
   ```bash
   cd apps/api
   npm install
   ```

5. **Jalankan migrasi database**
   ```bash
   npx prisma migrate dev
   ```

6. **Seed data awal**
   ```bash
   npx prisma db seed
   ```

---

## Cara Menjalankan

### Backend API
```bash
cd apps/api
npm run dev
```
API akan berjalan di `http://localhost:3000`.

### Verifikasi API berjalan
```bash
curl http://localhost:3000/api/health
```
Response: `{ "Status": "OK", "Message": "KelasKosong API berjalan." }`

### Akun Demo (dari seed data)
| Role | Email | Password |
|---|---|---|
| Mahasiswa | mahasiswa@kampus.ac.id | password123 |
| Pengelola | pengelola@kampus.ac.id | password123 |

---

## Cara Menjalankan Test

```bash
cd apps/api
npm test
```

Untuk menjalankan test dengan output detail:
```bash
npm test -- --verbose
```

---

## Struktur API Endpoints

### Authentication
- `POST /api/auth/register` — Registrasi akun baru
- `POST /api/auth/login` — Login
- `GET /api/auth/me` — Data user yang sedang login (perlu token)

### Buildings
- `GET /api/buildings` — Daftar semua gedung
- `POST /api/buildings` — Tambah gedung (Pengelola only)

### Facilities
- `GET /api/facilities` — Daftar fasilitas (dengan filter)
- `GET /api/facilities/:Id` — Detail fasilitas
- `POST /api/facilities` — Tambah fasilitas (Pengelola only)
- `PUT /api/facilities/:Id` — Update fasilitas (Pengelola only)
- `DELETE /api/facilities/:Id` — Hapus fasilitas (Pengelola only)
- `GET /api/facilities/:Id/reservations` — Reservasi di fasilitas tertentu

### Reservations
- `POST /api/reservations` — Buat reservasi
- `GET /api/reservations/my` — Daftar reservasi saya
- `GET /api/reservations/:Id` — Detail reservasi
- `PATCH /api/reservations/:Id/cancel` — Batalkan reservasi
- `PATCH /api/reservations/:Id/early-end` — Selesai lebih awal

### Notifications
- `GET /api/notifications` — Daftar notifikasi
- `PATCH /api/notifications/:Id/read` — Tandai sudah dibaca
- `POST /api/notifications/watch` — Pantau fasilitas

---

## Struktur Proyek (Backend)

```text
apps/api/
├── prisma/
│   ├── schema.prisma        # Database schema
│   ├── migrations/          # Prisma migrations
│   └── seed.ts              # Seed data
├── src/
│   ├── controllers/         # HTTP request handlers
│   │   ├── authController.ts
│   │   ├── buildingController.ts
│   │   ├── facilityController.ts
│   │   ├── notificationController.ts
│   │   └── reservationController.ts
│   ├── services/            # Business logic layer
│   │   ├── authService.ts
│   │   ├── buildingService.ts
│   │   ├── facilityService.ts
│   │   ├── notificationService.ts
│   │   └── reservationService.ts
│   ├── routes/              # Express route definitions
│   │   ├── authRoutes.ts
│   │   ├── buildingRoutes.ts
│   │   ├── facilityRoutes.ts
│   │   ├── notificationRoutes.ts
│   │   └── reservationRoutes.ts
│   ├── middleware/          # Express middleware
│   │   ├── authMiddleware.ts
│   │   └── errorHandler.ts
│   ├── utils/               # Utility functions
│   │   ├── jwt.ts
│   │   ├── password.ts
│   │   ├── prisma.ts
│   │   └── statusCalculator.ts
│   ├── app.ts               # Express app setup
│   └── server.ts            # Server entry point
├── tests/                   # Unit tests
├── package.json
└── tsconfig.json
```
