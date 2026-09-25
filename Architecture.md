# Lecturer GitHub Tracker — Architecture

## 1. Tujuan Sistem

**Lecturer GitHub Tracker** adalah aplikasi full-stack sederhana untuk membantu dosen memantau aktivitas repository GitHub mahasiswa.

Aplikasi mengambil data commit dari repository GitHub mahasiswa **hanya ketika dosen menekan tombol sinkronisasi**. Data commit yang berhasil diambil disimpan ke MySQL dan digunakan untuk menampilkan ringkasan perkembangan mahasiswa pada dashboard.

Versi pertama tidak menggunakan autentikasi. Sistem diasumsikan digunakan oleh satu dosen pada lingkungan pengembangan atau jaringan yang sudah dipercaya.

### Prinsip utama

- Dashboard hanya membaca data dari MySQL.
- Aplikasi tidak memanggil GitHub secara otomatis ketika dashboard dibuka.
- Sinkronisasi GitHub selalu dipicu secara manual melalui tombol.
- Commit lama tidak dihapus dan tidak ditimpa selama sinkronisasi.
- Hanya commit baru yang dimasukkan ke database.
- Repository public menjadi target utama versi pertama.
- `GITHUB_TOKEN` bersifat opsional untuk meningkatkan akses rate limit dan mendukung repository yang membutuhkan autentikasi GitHub.

---

## 2. Technology Stack

| Layer | Technology |
|---|---|
| Frontend | React + TypeScript + Vite |
| Styling | Tailwind CSS |
| Backend | Node.js + TypeScript + Express |
| Database | MySQL |
| ORM | Prisma |
| API | REST API |
| External Integration | GitHub REST API |
| Container | Docker Compose |
| Package Management | npm workspaces |
| Monorepo | TypeScript workspace |
| Shared Types | `@lecturer-github-tracker/shared` |

---

## 3. Arsitektur Tingkat Tinggi

```text
┌───────────────────────────────┐
│         Lecturer User         │
│        Web Browser            │
└───────────────┬───────────────┘
                │ HTTP
                ▼
┌───────────────────────────────┐
│ React + TypeScript + Vite     │
│ Tailwind CSS                  │
│ apps/web                      │
└───────────────┬───────────────┘
                │ REST API
                ▼
┌───────────────────────────────┐
│ Express + TypeScript         │
│ apps/api                     │
│                               │
│ Routes → Controllers →        │
│ Services → Prisma             │
└───────┬───────────────┬───────┘
        │               │
        │ Prisma        │ HTTPS
        ▼               ▼
┌───────────────┐   ┌────────────────────┐
│    MySQL      │   │ GitHub REST API    │
│  Docker       │   │ Public Repositories│
└───────────────┘   └────────────────────┘

        ▲
        │ shared types
        │
┌───────┴────────────────────────┐
│ @lecturer-github-tracker/shared│
│ packages/shared                 │
└─────────────────────────────────┘
```

### Tanggung jawab komponen

#### `apps/web`

- Menampilkan UI dosen.
- Mengambil data melalui REST API.
- Menyimpan state UI lokal.
- Menjalankan aksi CRUD.
- Memicu sinkronisasi secara manual.
- Tidak mengakses Prisma atau MySQL secara langsung.
- Tidak memanggil GitHub REST API secara langsung.

#### `apps/api`

- Menyediakan REST API.
- Memvalidasi input request.
- Mengakses MySQL melalui Prisma.
- Mengelola aturan sinkronisasi GitHub.
- Memetakan data Prisma ke shared API models.
- Menangani error database dan GitHub API.

#### `packages/shared`

- Menyimpan model domain TypeScript.
- Menyimpan enum.
- Menyimpan DTO request/response yang dipakai lintas aplikasi.
- Menyimpan konstanta bersama.
- Tidak berisi kode yang hanya relevan untuk React, Express, atau Prisma.

#### MySQL

- Menyimpan seluruh data course, student, repository, dan commit.
- Menjadi source of truth dashboard.

#### GitHub REST API

- Menjadi source eksternal untuk mengambil commit saat sinkronisasi manual dijalankan.

---

## 4. Struktur Monorepo

```text
lecturer-github-tracker/
├── apps/
│   ├── web/
│   │   ├── src/
│   │   │   ├── components/
│   │   │   ├── features/
│   │   │   │   ├── courses/
│   │   │   │   ├── dashboard/
│   │   │   │   ├── students/
│   │   │   │   ├── repositories/
│   │   │   │   └── progress/
│   │   │   ├── layouts/
│   │   │   ├── pages/
│   │   │   ├── services/
│   │   │   ├── hooks/
│   │   │   ├── lib/
│   │   │   ├── App.tsx
│   │   │   └── main.tsx
│   │   ├── index.html
│   │   ├── package.json
│   │   ├── tsconfig.json
│   │   └── vite.config.ts
│   │
│   └── api/
│       ├── src/
│       │   ├── controllers/
│       │   ├── services/
│       │   ├── repositories/
│       │   ├── routes/
│       │   ├── middleware/
│       │   ├── validators/
│       │   ├── integrations/
│       │   │   └── github/
│       │   ├── mappers/
│       │   ├── lib/
│       │   ├── app.ts
│       │   └── server.ts
│       ├── prisma/
│       │   ├── schema.prisma
│       │   ├── migrations/
│       │   └── seed.ts
│       ├── package.json
│       └── tsconfig.json
│
├── packages/
│   └── shared/
│       ├── src/
│       │   ├── models/
│       │   │   ├── User.ts
│       │   │   ├── Course.ts
│       │   │   ├── Student.ts
│       │   │   ├── Repository.ts
│       │   │   └── Commit.ts
│       │   ├── enums/
│       │   │   └── ActivityStatus.ts
│       │   ├── dto/
│       │   │   ├── CourseDto.ts
│       │   │   ├── StudentDto.ts
│       │   │   ├── RepositoryDto.ts
│       │   │   ├── DashboardResponse.ts
│       │   │   ├── StudentProgressResponse.ts
│       │   │   └── SyncResult.ts
│       │   ├── constants/
│       │   │   └── index.ts
│       │   └── index.ts
│       ├── package.json
│       └── tsconfig.json
│
├── .env.example
├── .gitignore
├── docker-compose.yml
├── package.json
├── tsconfig.base.json
├── package-lock.json
├── README.md
└── Architecture.md
```

Struktur di atas harus tetap sederhana. Folder baru hanya ditambahkan ketika memiliki tanggung jawab yang jelas.

---

## 5. Aturan Naming

### TypeScript

PascalCase digunakan untuk:

- Class
- Type
- Interface
- Enum
- React Component
- Database Model
- API DTO
- Shared domain model
- JSON property names

Contoh:

```ts
interface Student {
  Id: number;
  CourseId: number;
  StudentNumber: string;
  Name: string;
  Email: string;
  GithubUsername: string;
  CreatedAt: string;
}
```

Local variables tetap boleh menggunakan camelCase.

```ts
const studentRepository = ...;
const latestCommitAt = ...;
```

### API JSON

Semua property JSON menggunakan PascalCase.

Contoh:

```json
{
  "StudentId": 1,
  "StudentName": "Budi",
  "TotalCommits": 25,
  "ActivityStatus": "ACTIVE"
}
```

### Prisma

Prisma tetap menggunakan nama model dan field yang mengikuti requirement utama sistem. Mapping ke shared API model dilakukan di backend.

---

## 6. Domain Model

### 6.1 Course

```text
Course
├── Id
├── Name
├── Semester
├── Year
└── CreatedAt
```

Relasi:

- Satu `Course` memiliki banyak `Student`.

### 6.2 Student

```text
Student
├── Id
├── CourseId
├── StudentNumber
├── Name
├── Email
├── GithubUsername
└── CreatedAt
```

Relasi:

- Satu `Student` termasuk ke satu `Course`.
- Satu `Student` memiliki banyak `Repository`.

### 6.3 Repository

```text
Repository
├── Id
├── StudentId
├── Name
├── RepositoryUrl
├── Owner
├── RepositoryName
├── IsActive
├── LastSyncedAt
└── CreatedAt
```

Relasi:

- Satu `Repository` dimiliki oleh satu `Student`.
- Satu `Repository` memiliki banyak `Commit`.

### 6.4 Commit

```text
Commit
├── Id
├── RepositoryId
├── Sha
├── Message
├── AuthorName
├── AuthorEmail
├── CommittedAt
├── CommitUrl
└── CreatedAt
```

Relasi:

- Satu `Commit` berasal dari satu `Repository`.
- `RepositoryId + Sha` harus unik.

### 6.5 User

`User` disiapkan di shared package untuk kebutuhan domain yang dapat berkembang di masa depan, tetapi autentikasi **tidak diimplementasikan pada versi pertama**.

---

## 7. ERD Konseptual

```text
Course
  │
  │ 1
  │
  └───────────────< Student
                     │
                     │ 1
                     │
                     └───────────────< Repository
                                           │
                                           │ 1
                                           │
                                           └───────────────< Commit
```

### Cardinality

- `Course 1 : N Student`
- `Student 1 : N Repository`
- `Repository 1 : N Commit`

---

## 8. Database Design

### Prisma model requirements

Database harus memenuhi aturan berikut:

1. `Commit` memiliki unique constraint pada kombinasi `RepositoryId` dan `Sha`.
2. `Repository.RepositoryUrl` menyimpan URL GitHub canonical yang diberikan sistem setelah parsing.
3. `Owner` menyimpan GitHub owner.
4. `RepositoryName` menyimpan nama repository di GitHub.
5. `IsActive` menentukan apakah repository ikut dalam sinkronisasi seluruh course.
6. `LastSyncedAt` nullable sampai repository pernah berhasil disinkronkan.
7. `CreatedAt` dibuat oleh database/application saat record dibuat.
8. Prisma migration menjadi sumber perubahan schema database.
9. Seed menyediakan satu course contoh, tiga mahasiswa, dan repository GitHub publik.

### Commit uniqueness

Unique constraint harus direpresentasikan di Prisma sebagai composite unique key:

```prisma
@@unique([RepositoryId, Sha])
```

Tujuan utamanya adalah memastikan commit tidak tersimpan dua kali jika GitHub mengembalikan SHA yang sama pada sinkronisasi berbeda.

---

## 9. Data Integrity dan Penghapusan

Aturan sinkronisasi bersifat **append-only terhadap commit**:

- Jangan menghapus commit lama ketika sinkronisasi.
- Jangan mengganti isi commit lama.
- Commit yang sudah ada dianggap immutable untuk proses sinkronisasi.
- Jika SHA ditemukan kembali, commit hanya dihitung sebagai `ExistingCommitCount`.

Operasi CRUD `DELETE` terhadap course, student, atau repository adalah operasi administrasi terpisah dan bukan bagian dari proses sinkronisasi. Relasi database harus dikonfigurasi secara eksplisit sehingga perilaku child records saat parent dihapus selalu konsisten.

Untuk versi pertama, perilaku delete harus didokumentasikan di README dan migration, serta dikonfirmasi dari UI sebelum eksekusi.

---

## 10. Shared Package Architecture

Package:

```text
@lecturer-github-tracker/shared
```

Tujuan package adalah mencegah duplikasi definisi model antara frontend dan backend.

### Yang disimpan di shared

- `Course`
- `Student`
- `Repository`
- `Commit`
- `User`
- `ActivityStatus`
- API response types
- API DTO types
- Shared constants

### Yang tidak disimpan di shared

- Prisma Client types
- Express request/response types
- React-specific props yang hanya dipakai satu komponen
- Database query implementation
- GitHub HTTP client
- Environment configuration

### Contoh export

```ts
export * from './models/Course';
export * from './models/Student';
export * from './models/Repository';
export * from './models/Commit';
export * from './models/User';
export * from './enums/ActivityStatus';
export * from './dto/DashboardResponse';
export * from './dto/SyncResult';
```

Frontend dan backend harus mengimpor model dari package tersebut.

```ts
import type { Student, ActivityStatus } from '@lecturer-github-tracker/shared';
```

Frontend **tidak boleh** mengimpor Prisma model.

---

## 11. Backend Layering

Backend menggunakan layering sederhana berikut:

```text
HTTP Request
    ↓
Route
    ↓
Controller
    ↓
Validator
    ↓
Service
    ├── Prisma Repository
    └── GitHub Integration
    ↓
Mapper
    ↓
HTTP Response
```

### Routes

Mendaftarkan path REST dan menghubungkan endpoint ke controller.

### Controllers

- Membaca parameter, body, dan query.
- Memanggil service.
- Mengembalikan HTTP status dan JSON response.
- Tidak berisi query database kompleks.

### Services

Berisi business logic seperti:

- Course management.
- Student management.
- Repository management.
- GitHub synchronization.
- Dashboard calculation.

### Repositories

Abstraksi sederhana untuk operasi database Prisma agar query tidak tersebar di controller.

### Validators

Memastikan input memiliki format yang benar sebelum service dipanggil.

### Mappers

Mengubah Prisma entity menjadi model/DTO dari `@lecturer-github-tracker/shared`.

---

## 12. GitHub Integration Architecture

GitHub client diletakkan di:

```text
apps/api/src/integrations/github/
```

Contoh tanggung jawab:

```text
GitHubClient
├── getRepositoryCommits()
├── normalizeCommit()
└── mapGitHubError()
```

Service sinkronisasi tidak boleh menyebarkan detail HTTP GitHub ke layer controller.

### Repository URL parsing

Input contoh:

```text
https://github.com/owner/repository
```

Hasil parsing:

```text
Owner = owner
RepositoryName = repository
```

Validasi harus menolak URL yang tidak dapat dipastikan sebagai repository GitHub.

Canonical URL yang disimpan harus menghilangkan query string dan fragment yang tidak diperlukan.

Contoh valid:

```text
https://github.com/owner/repository
https://github.com/owner/repository/
```

Contoh invalid:

```text
https://example.com/owner/repository
https://github.com/
```

---

## 13. Manual Synchronization Flow

### 13.1 Sinkronisasi satu repository

```text
Dosen klik "Sinkronkan Commit"
        ↓
POST /api/repositories/:Id/sync
        ↓
Load Repository dari MySQL
        ↓
Validasi IsActive / owner / repository name
        ↓
Panggil GitHub REST API
        ↓
Ambil daftar commit
        ↓
Normalisasi data commit
        ↓
Untuk setiap commit:
    cari existing berdasarkan RepositoryId + Sha
        ↓
    jika belum ada → INSERT
    jika sudah ada → hitung existing
        ↓
Update Repository.LastSyncedAt
        ↓
Return SyncResult
```

### 13.2 Sinkronisasi seluruh repository aktif dalam course

```text
Dosen klik "Sinkronkan Semua Repository"
        ↓
POST /api/courses/:CourseId/sync
        ↓
Load semua repository aktif pada course
        ↓
Loop repository
        ↓
GitHub synchronization per repository
        ↓
Simpan commit baru
        ↓
Update LastSyncedAt untuk repository yang sukses
        ↓
Kembalikan aggregate result
```

Untuk sinkronisasi course, satu repository yang gagal tidak boleh membuat commit repository lain yang sudah sukses menjadi rollback secara global. Hasil setiap repository harus dapat diketahui oleh frontend.

---

## 14. Idempotency dan Commit Deduplication

Proses sinkronisasi harus aman ketika tombol ditekan berkali-kali.

Contoh:

```text
Sync #1:
Fetched = 20
New = 20
Existing = 0

Sync #2:
Fetched = 20
New = 0
Existing = 20
```

Keamanan utama berasal dari:

1. Pengecekan `RepositoryId + Sha` sebelum insert.
2. Composite unique constraint pada database.
3. Penggunaan insert yang aman terhadap record yang sudah ada.
4. Tidak melakukan update terhadap commit existing.

Database tetap menjadi lapisan terakhir untuk mencegah duplikasi.

---

## 15. GitHub API Authentication

### Tanpa token

Jika `GITHUB_TOKEN` tidak tersedia:

- GitHub request tetap dapat dilakukan untuk repository public.
- Sistem harus menampilkan error yang jelas jika GitHub menolak request atau rate limit tercapai.

### Dengan token

Jika `GITHUB_TOKEN` tersedia:

```http
Authorization: Bearer <GITHUB_TOKEN>
Accept: application/vnd.github+json
```

Token hanya digunakan oleh backend.

Token **tidak boleh** dikirim ke frontend atau disimpan di database.

---

## 16. Sinkronisasi Commit dan Pagination

GitHub dapat mengembalikan commit dalam beberapa halaman. GitHub client harus mendukung pagination yang diperlukan untuk versi pertama.

Minimal implementasi:

- Request page pertama.
- Gunakan `per_page` yang wajar.
- Lanjutkan ke halaman berikutnya selama masih terdapat data.

Batas pengambilan dapat ditambahkan pada service bila dibutuhkan untuk menjaga runtime tetap realistis, tetapi batas tersebut harus didokumentasikan.

---

## 17. Mapping Data GitHub ke Database

Data GitHub harus dipetakan secara eksplisit.

Contoh mapping:

| GitHub Data | Database Commit |
|---|---|
| `sha` | `Sha` |
| `commit.message` | `Message` |
| `commit.author.name` | `AuthorName` |
| `commit.author.email` | `AuthorEmail` |
| `commit.author.date` | `CommittedAt` |
| `html_url` | `CommitUrl` |
| current repository | `RepositoryId` |

Jika field author tertentu tidak tersedia, backend harus menangani nilai nullable sesuai schema yang dipilih.

---

## 18. Sync Result Contract

Sinkronisasi satu repository mengembalikan object dengan format shared DTO.

```json
{
  "RepositoryId": 1,
  "FetchedCommitCount": 25,
  "NewCommitCount": 5,
  "ExistingCommitCount": 20,
  "LastSyncedAt": "2026-09-25T08:30:00.000Z",
  "Message": "Sinkronisasi repository berhasil."
}
```

`LastSyncedAt` hanya diperbarui setelah proses sinkronisasi repository tersebut berhasil diselesaikan sesuai aturan service.

---

## 19. Activity Status

Activity status dihitung berdasarkan commit terakhir yang tersimpan.

### `NO_COMMIT`

Tidak terdapat commit untuk student.

### `INACTIVE`

Commit terakhir lebih lama dari 14 hari dibanding waktu saat data progress dihitung.

### `ACTIVE`

Commit terakhir berada dalam rentang 14 hari terakhir.

### Perhitungan

```text
Tidak ada commit
    → NO_COMMIT

Ada commit dan usia commit > 14 hari
    → INACTIVE

Ada commit dan usia commit <= 14 hari
    → ACTIVE
```

Status harus dihitung di backend agar frontend tidak menggandakan business rule.

---

## 20. Dashboard Calculation

Endpoint dashboard membaca MySQL dan tidak memanggil GitHub.

### Summary

```text
TotalStudents
TotalRepositories
TotalCommits
ActiveStudents
InactiveStudents
StudentsWithoutCommits
```

### Student progress

```text
StudentId
StudentName
StudentNumber
RepositoryCount
TotalCommits
LatestCommitAt
ActivityStatus
```

### Source data

Dashboard diperoleh dari:

- `Course`
- `Student`
- `Repository`
- `Commit`

Tidak ada request external ke GitHub dalam endpoint dashboard.

---

## 21. REST API

Base URL development:

```text
http://localhost:3000/api
```

Port dapat diubah melalui environment variable.

### Course

| Method | Route | Fungsi |
|---|---|---|
| GET | `/api/courses` | List course |
| POST | `/api/courses` | Create course |
| GET | `/api/courses/:Id` | Detail course |
| PUT | `/api/courses/:Id` | Update course |
| DELETE | `/api/courses/:Id` | Delete course |

### Student

| Method | Route | Fungsi |
|---|---|---|
| GET | `/api/courses/:CourseId/students` | List student dalam course |
| POST | `/api/courses/:CourseId/students` | Create student |
| PUT | `/api/students/:Id` | Update student |
| DELETE | `/api/students/:Id` | Delete student |

### Repository

| Method | Route | Fungsi |
|---|---|---|
| GET | `/api/students/:Id/repositories` | List repository student |
| POST | `/api/students/:Id/repositories` | Create repository |
| PUT | `/api/repositories/:Id` | Update repository |
| DELETE | `/api/repositories/:Id` | Delete repository |
| POST | `/api/repositories/:Id/sync` | Sinkronkan repository |

### Course synchronization

| Method | Route | Fungsi |
|---|---|---|
| POST | `/api/courses/:CourseId/sync` | Sinkronkan semua repository aktif dalam course |

### Dashboard

| Method | Route | Fungsi |
|---|---|---|
| GET | `/api/courses/:CourseId/dashboard` | Summary + progress student |
| GET | `/api/students/:Id/progress` | Detail progress student |

---

## 22. API Response Standard

Semua response JSON menggunakan PascalCase property names.

### Success

```json
{
  "Data": {},
  "Message": "Operasi berhasil."
}
```

### Error

```json
{
  "Message": "Repository GitHub tidak ditemukan.",
  "Code": "GITHUB_REPOSITORY_NOT_FOUND"
}
```

HTTP status digunakan secara semantik:

- `200 OK` untuk read/update dan operasi berhasil.
- `201 Created` untuk create.
- `204 No Content` dapat digunakan untuk delete yang tidak mengembalikan body.
- `400 Bad Request` untuk input invalid.
- `404 Not Found` untuk entity tidak ditemukan.
- `409 Conflict` untuk konflik data.
- `422 Unprocessable Entity` dapat digunakan jika data syntactically valid tetapi tidak dapat diproses.
- `429 Too Many Requests` untuk rate limit yang berasal dari upstream dan dipetakan secara sesuai.
- `500 Internal Server Error` untuk error yang tidak terduga.
- `502 Bad Gateway` dapat digunakan ketika dependency GitHub gagal dan backend tidak dapat memberikan hasil normal.

---

## 23. GitHub Error Handling

Backend harus memberikan pesan yang dapat dipahami pengguna dalam Bahasa Indonesia.

### Private repository

```text
Repository tidak dapat diakses. Pastikan repository bersifat publik atau GITHUB_TOKEN memiliki akses yang sesuai.
```

### Repository tidak ditemukan

```text
Repository GitHub tidak ditemukan. Periksa URL repository dan pastikan repository masih tersedia.
```

### URL invalid

```text
URL repository GitHub tidak valid. Gunakan format https://github.com/owner/repository.
```

### Rate limit

```text
Batas permintaan GitHub telah tercapai. Coba lagi setelah rate limit tersedia atau gunakan GITHUB_TOKEN.
```

### GitHub unavailable

```text
GitHub tidak dapat diakses saat ini. Silakan coba sinkronisasi kembali.
```

Pesan internal error yang mengandung token, credential, stack trace, atau detail sensitif tidak boleh dikirim ke frontend.

---

## 24. Frontend Architecture

Frontend menggunakan pendekatan feature-based yang sederhana.

```text
src/
├── components/
│   ├── Button.tsx
│   ├── Card.tsx
│   ├── Badge.tsx
│   ├── Modal.tsx
│   ├── Table.tsx
│   └── EmptyState.tsx
├── features/
│   ├── courses/
│   ├── dashboard/
│   ├── students/
│   ├── repositories/
│   └── progress/
├── layouts/
│   └── LecturerLayout.tsx
├── pages/
├── services/
│   └── api.ts
├── hooks/
├── lib/
└── App.tsx
```

Komponen reusable diletakkan di `components`. Logic yang khusus terhadap suatu domain diletakkan di `features`.

---

## 25. Frontend Pages

### 25.1 Dashboard

Isi:

- Course selector.
- Summary cards.
- Tabel progress mahasiswa.
- Tombol `Sinkronkan Semua Repository`.
- Loading state.
- Success message.
- Error message.
- Empty state jika course belum memiliki data.

Aturan penting:

> Membuka dashboard tidak memicu request ke GitHub.

Urutan data:

```text
Dashboard mounted
    ↓
GET /api/courses/:CourseId/dashboard
    ↓
MySQL
    ↓
Render summary
```

Ketika tombol sync ditekan:

```text
Button click
    ↓
POST /api/courses/:CourseId/sync
    ↓
GitHub + MySQL
    ↓
Refresh dashboard from MySQL
```

---

### 25.2 Course Management

Fitur:

- List course.
- Create course.
- Edit course.
- Delete course dengan confirmation dialog.
- Buka dashboard course.

Form field:

- `Name`
- `Semester`
- `Year`

---

### 25.3 Student Management

Fitur:

- Menampilkan mahasiswa pada course terpilih.
- Add student.
- Edit student.
- Delete student dengan confirmation.
- Menampilkan GitHub username.

Form field:

- `StudentNumber`
- `Name`
- `Email`
- `GithubUsername`

---

### 25.4 Repository Management

Fitur:

- List repository mahasiswa.
- Add repository.
- Edit repository URL.
- Delete repository dengan confirmation.
- Sinkronisasi commit satu repository.
- Menampilkan `LastSyncedAt`.
- Menampilkan jumlah commit tersimpan.

Tombol:

```text
Sinkronkan Commit
```

Saat sync berjalan, tombol harus masuk loading/disabled state agar pengguna tidak tidak sengaja mengirim request berulang kali dari UI.

---

### 25.5 Student Progress Detail

Isi:

- Informasi mahasiswa.
- Daftar repository.
- Total commit.
- Commit terbaru.
- Tabel riwayat commit.

Kolom commit history:

- Pesan commit.
- Author.
- Tanggal.
- SHA.
- Link commit GitHub.

---

## 26. UI/UX Rules

Semua label, tombol, pesan, placeholder, error, dan validation message menggunakan Bahasa Indonesia.

### Status badge

| Status | Label | Warna |
|---|---|---|
| `ACTIVE` | Aktif | Hijau |
| `INACTIVE` | Tidak Aktif | Oranye |
| `NO_COMMIT` | Belum Ada Commit | Merah |

### Komponen wajib

- Card.
- Table.
- Badge.
- Form.
- Confirmation dialog.
- Empty state.
- Loading state.
- Success message.
- Error message.

### Responsive

UI harus tetap usable pada:

- Desktop laptop.
- Tablet.
- Mobile width sederhana.

Dashboard tidak menggunakan chart pada versi pertama.

---

## 27. Form Validation

Validation dilakukan minimal di dua sisi:

### Frontend

Untuk feedback cepat pengguna.

### Backend

Sebagai source of truth keamanan dan data integrity.

Contoh validation repository URL:

```text
Wajib terisi.
Harus berupa URL GitHub.
Harus memiliki owner.
Harus memiliki repository name.
```

Validation backend tidak boleh bergantung pada validation frontend.

---

## 28. Environment Configuration

Root `.env.example`:

```env
DATABASE_URL="mysql://lecturer_tracker:lecturer_tracker_password@localhost:3306/lecturer_github_tracker"
GITHUB_TOKEN=""
API_PORT=3000
WEB_PORT=5173
```

Nilai aktual disimpan pada `.env` lokal dan tidak boleh di-commit.

### Variable utama

`DATABASE_URL`

Connection string Prisma ke MySQL.

`GITHUB_TOKEN`

Opsional. Digunakan backend untuk request GitHub dengan Bearer token.

`API_PORT`

Port Express API.

`WEB_PORT`

Port development server Vite bila project memilih konfigurasi custom.

---

## 29. Docker Compose

Docker Compose digunakan untuk MySQL.

Contoh struktur:

```yaml
services:
  mysql:
    image: mysql:8.0
    restart: unless-stopped
    environment:
      MYSQL_DATABASE: lecturer_github_tracker
      MYSQL_USER: lecturer_tracker
      MYSQL_PASSWORD: lecturer_tracker_password
      MYSQL_ROOT_PASSWORD: root_password
    ports:
      - "3306:3306"
    volumes:
      - mysql_data:/var/lib/mysql

volumes:
  mysql_data:
```

Application web dan API dapat dijalankan dari host pada versi pertama. Containerization aplikasi Node/React dapat ditambahkan kemudian tanpa mengubah domain architecture.

---

## 30. Workspace Configuration

Root `package.json` menggunakan npm workspaces.

```json
{
  "private": true,
  "workspaces": [
    "apps/*",
    "packages/*"
  ]
}
```

### Workspace dependency

`apps/web/package.json` dan `apps/api/package.json` harus mendeklarasikan:

```json
"@lecturer-github-tracker/shared": "workspace:*"
```

Jika environment npm yang digunakan tidak menerima format tersebut pada versi tertentu, gunakan workspace dependency version yang kompatibel dengan npm yang dipilih. Yang penting dependency tetap merujuk ke package lokal, bukan package registry eksternal.

---

## 31. TypeScript Configuration

Gunakan `tsconfig.base.json` di root sebagai konfigurasi umum.

Contoh arah konfigurasi:

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "strict": true,
    "skipLibCheck": true,
    "noUncheckedIndexedAccess": true,
    "esModuleInterop": true,
    "forceConsistentCasingInFileNames": true
  }
}
```

Setiap workspace memperluas konfigurasi dasar dan mengatur `outDir`, `rootDir`, serta module settings sesuai runtime masing-masing.

Shared package harus bisa dibuild sebelum dipakai pada build production frontend/backend jika menggunakan compiled package output.

---

## 32. Development Scripts

Root scripts direkomendasikan:

```text
npm run dev
npm run dev:web
npm run dev:api
npm run build
npm run build:shared
npm run build:web
npm run build:api
npm run lint
npm run typecheck
npm run db:migrate
npm run db:seed
```

Tujuan:

- `dev` menjalankan web dan API secara bersamaan.
- `build` membuild seluruh workspace.
- `typecheck` memastikan shared models, frontend, dan backend konsisten.
- `db:migrate` menjalankan Prisma migration.
- `db:seed` mengisi data contoh.

---

## 33. Prisma Migration Flow

Urutan setup database:

```text
Docker Compose MySQL
        ↓
Create / configure .env
        ↓
npx prisma migrate dev
        ↓
npx prisma db seed
        ↓
Run API
        ↓
Run Web
```

Migration harus menjadi version-controlled file di repository.

Jangan mengandalkan `prisma db push` sebagai workflow utama project karena project membutuhkan Prisma migrations.

---

## 34. Seed Data

Seed harus membuat minimal:

### Course

Satu course contoh.

Contoh:

```text
Name: Pemrograman Web
Semester: Ganjil
Year: 2026
```

### Students

Tiga mahasiswa contoh:

```text
Mahasiswa 1
Mahasiswa 2
Mahasiswa 3
```

Setiap mahasiswa memiliki:

- Student number.
- Name.
- Email.
- Github username.
- Minimal satu repository GitHub publik untuk demo.

Seed harus idempotent atau setidaknya aman dijalankan ulang sesuai strategi upsert yang dipilih.

---

## 35. GitHub Sync Service Design

Service utama dapat dipisahkan menjadi:

```text
RepositorySyncService
├── syncRepository(RepositoryId)
├── syncCourse(CourseId)
└── calculateSyncResult(...)
```

### Pseudocode satu repository

```text
load repository
validate repository
fetch commits from GitHub
fetchedCommitCount = commits.length

newCommitCount = 0
existingCommitCount = 0

for each commit:
    if RepositoryId + Sha already exists:
        existingCommitCount++
    else:
        insert commit
        newCommitCount++

update LastSyncedAt
return result
```

Service tidak boleh menghapus atau meng-update row `Commit` yang sudah ada.

---

## 36. Transaction Strategy

Operasi CRUD biasa dapat menggunakan transaksi Prisma ketika membutuhkan beberapa write yang harus konsisten.

Untuk sinkronisasi commit:

- Setiap commit baru harus berhasil tersimpan tanpa menghapus existing commit.
- Composite unique constraint menjadi pengaman utama terhadap duplicate insert.
- `LastSyncedAt` hanya diubah ketika sinkronisasi repository dianggap berhasil.

Untuk sinkronisasi seluruh course, repository diproses secara independen sehingga satu repository gagal tidak menghapus hasil repository lain yang telah berhasil.

Aggregate response sebaiknya memberikan hasil per repository, misalnya:

```json
{
  "Message": "Sinkronisasi course selesai.",
  "Results": [
    {
      "RepositoryId": 1,
      "FetchedCommitCount": 10,
      "NewCommitCount": 3,
      "ExistingCommitCount": 7,
      "LastSyncedAt": "2026-09-25T08:30:00.000Z",
      "Message": "Sinkronisasi repository berhasil."
    }
  ]
}
```

Jika satu repository gagal, aggregate response harus tetap menunjukkan repository yang berhasil dan error repository yang gagal melalui result structure yang konsisten.

---

## 37. Concurrency Protection

Karena aplikasi digunakan oleh satu dosen, concurrency kebutuhan pertama relatif sederhana. Namun backend tetap harus mencegah duplicate data ketika dua request sync terjadi hampir bersamaan.

Mekanisme:

1. Database unique constraint pada `RepositoryId + Sha`.
2. Insert handling terhadap unique conflict.
3. Frontend men-disable tombol selama request aktif.

Backend tidak boleh hanya mengandalkan frontend untuk mencegah duplikasi.

---

## 38. API Client di Frontend

Frontend menggunakan satu lapisan API client:

```text
apps/web/src/services/api.ts
```

Tanggung jawab:

- Menentukan base URL.
- Melakukan HTTP request.
- Parse JSON.
- Menangani error response.
- Mengembalikan type dari shared package.

Contoh grouping:

```text
courseApi
studentApi
repositoryApi
dashboardApi
syncApi
```

Tidak ada komponen React yang melakukan `fetch` GitHub secara langsung.

---

## 39. State Management

Versi pertama tidak membutuhkan state-management library besar.

Gunakan:

- React state untuk state UI lokal.
- Custom hooks untuk fetch/mutation sederhana.
- API client untuk request.

Contoh hook:

```text
useCourses()
useStudents(CourseId)
useRepositories(StudentId)
useDashboard(CourseId)
useStudentProgress(StudentId)
```

Sync dapat menggunakan mutation function yang melakukan request POST lalu refresh data dashboard/repository.

---

## 40. Routing Frontend

Halaman yang disarankan:

```text
/                         → redirect ke dashboard course
/courses                  → Course Management
/courses/:CourseId        → Course Dashboard
/courses/:CourseId/students → Student Management
/students/:Id             → Student Progress Detail
/students/:Id/repositories → Repository Management
```

Tidak ada route login pada versi pertama.

---

## 41. Confirmation dan Error UX

Delete action selalu memakai confirmation dialog.

Contoh:

```text
Apakah Anda yakin ingin menghapus mahasiswa ini?
Tindakan ini tidak dapat dibatalkan.

[Batal] [Hapus]
```

Untuk sync:

### Loading

```text
Sedang menyinkronkan commit...
```

### Success

```text
Sinkronisasi berhasil. 5 commit baru ditambahkan.
```

### Warning

```text
Repository berhasil diakses, tetapi tidak ada commit baru.
```

### Error

```text
Sinkronisasi gagal. Periksa URL repository atau akses GitHub.
```

---

## 42. Empty States

Setiap list utama memiliki empty state.

### Course kosong

```text
Belum ada course.
Tambahkan course pertama untuk mulai menggunakan aplikasi.
```

### Student kosong

```text
Belum ada mahasiswa pada course ini.
```

### Repository kosong

```text
Belum ada repository untuk mahasiswa ini.
```

### Commit kosong

```text
Belum ada commit tersimpan.
Sinkronkan repository untuk mengambil aktivitas terbaru.
```

---

## 43. Security Baseline

Meskipun tidak ada authentication pada versi pertama, beberapa aturan keamanan tetap wajib:

- `GITHUB_TOKEN` hanya disimpan di backend.
- Jangan pernah mengirim token ke frontend.
- Jangan mencetak token ke log.
- Jangan memasukkan `.env` ke Git.
- Validasi seluruh input backend.
- Batasi error response agar tidak membocorkan stack trace ke client.
- Gunakan parameterized queries melalui Prisma.
- Jangan membangun SQL mentah dari input pengguna kecuali benar-benar diperlukan.
- Aktifkan CORS secara eksplisit untuk origin frontend pada deployment.

---

## 44. Logging

Backend minimal mencatat:

- HTTP method dan route.
- Status response.
- Waktu proses.
- Sync start/end.
- RepositoryId yang disinkronkan.
- Jumlah commit fetched/new/existing.
- Error code internal.

Jangan log:

- `GITHUB_TOKEN`.
- Credential database.
- Sensitive headers.

---

## 45. Testing Strategy

Testing minimum yang direkomendasikan:

### Backend unit tests

- Repository URL parser.
- Activity status calculator.
- GitHub response mapper.
- Sync result calculator.

### Backend integration tests

- CRUD Course.
- CRUD Student.
- CRUD Repository.
- Sync repository dengan mock GitHub API.
- Duplicate SHA tidak membuat duplicate row.
- Existing commit tidak berubah.
- `LastSyncedAt` berubah setelah sync sukses.

### Frontend tests

- Dashboard render.
- Status badge.
- Form validation.
- Delete confirmation.
- Loading state sync.
- Success/error sync message.

Testing GitHub menggunakan mock HTTP response, bukan bergantung pada repository GitHub tertentu untuk setiap test.

---

## 46. Build Verification

Sebelum project dianggap selesai, jalankan:

```text
npm install
npm run build
npm run typecheck
npm run lint
```

Kemudian verifikasi database:

```text
docker compose up -d
npm run db:migrate
npm run db:seed
```

Uji manual:

1. Web berhasil dibuka.
2. API berhasil merespons.
3. Course dapat dibuat/diedit/dihapus.
4. Student dapat dibuat/diedit/dihapus.
5. Repository dapat dibuat/diedit/dihapus.
6. URL GitHub invalid ditolak.
7. Sync satu repository berhasil.
8. Sync repository kedua kali tidak menggandakan commit.
9. Sync seluruh course bekerja untuk repository aktif.
10. Dashboard tidak memanggil GitHub saat dibuka.
11. Status Active/Inactive/No Commit sesuai rule 14 hari.
12. Link commit membuka halaman GitHub yang benar.

---

## 47. Definition of Done

Project versi pertama dinyatakan selesai ketika seluruh kondisi berikut terpenuhi:

- Monorepo npm workspace berjalan.
- `packages/shared` berhasil dibangun dan digunakan oleh web serta API.
- Prisma migration berhasil dibuat dan dijalankan.
- Seed berhasil membuat satu course, tiga mahasiswa, dan repository publik contoh.
- MySQL berjalan melalui Docker Compose.
- Semua route CRUD utama bekerja.
- Repository URL GitHub divalidasi dan di-parse dengan benar.
- Sync repository mengambil commit dari GitHub secara manual.
- Sync course mengambil commit semua repository aktif.
- Commit duplicate tidak dibuat.
- Commit existing tidak dihapus atau diubah selama sync.
- `LastSyncedAt` diperbarui setelah sync sukses.
- Dashboard hanya membaca MySQL.
- Activity status mengikuti rule 14 hari.
- UI menggunakan Bahasa Indonesia.
- Badge warna sesuai status.
- Delete memiliki confirmation dialog.
- Tidak ada chart pada versi pertama.
- `.env.example` tersedia.
- README installation dan GitHub token configuration tersedia.
- Frontend dan backend berhasil build.

---

## 48. Batasan Versi Pertama

Fitur berikut tidak termasuk dalam architecture versi pertama:

- Authentication.
- Multi-lecturer authorization.
- Role-based access control.
- Private repository management yang kompleks.
- Webhook GitHub otomatis.
- Background sync scheduler.
- Realtime WebSocket updates.
- Chart atau analytics visualization.
- AI-based activity prediction.
- Email notification.
- Mobile native application.

Arsitektur sengaja dibuat sederhana agar seluruh fitur inti realistis diselesaikan tanpa menambah kompleksitas yang tidak diperlukan.

---

## 49. Alur Penggunaan Utama

### Dosen membuat course

```text
Course Management
    ↓
Tambah Course
    ↓
Isi Name / Semester / Year
    ↓
POST /api/courses
    ↓
Course tersimpan
```

### Dosen menambahkan mahasiswa

```text
Pilih Course
    ↓
Student Management
    ↓
Tambah Student
    ↓
POST /api/courses/:CourseId/students
```

### Dosen menambahkan repository

```text
Pilih Student
    ↓
Repository Management
    ↓
Masukkan GitHub URL
    ↓
Parse Owner + RepositoryName
    ↓
POST /api/students/:Id/repositories
```

### Dosen melakukan sinkronisasi

```text
Dashboard / Repository Management
    ↓
Klik tombol Sync
    ↓
POST sync endpoint
    ↓
GitHub REST API
    ↓
Insert commit baru
    ↓
Update LastSyncedAt
    ↓
Frontend refresh dari MySQL
```

### Dosen melihat progress

```text
Dashboard
    ↓
GET dashboard
    ↓
MySQL
    ↓
Summary + Student Progress
```

---

## 50. Architectural Rules yang Tidak Boleh Dilanggar

1. Frontend tidak boleh mengakses MySQL secara langsung.
2. Frontend tidak boleh mengakses GitHub REST API secara langsung.
3. Backend adalah satu-satunya komponen yang memegang `GITHUB_TOKEN`.
4. Dashboard tidak boleh memicu sinkronisasi otomatis.
5. Sinkronisasi hanya terjadi melalui endpoint POST sync.
6. Commit existing tidak boleh di-overwrite saat sync.
7. Commit existing tidak boleh dihapus saat sync.
8. `RepositoryId + Sha` harus unik.
9. Shared domain models tidak boleh diduplikasi di frontend/backend.
10. Prisma types tidak boleh diexpose langsung ke frontend.
11. Semua API JSON property names menggunakan PascalCase.
12. Business rule `ActivityStatus` berada di backend/shared domain logic, bukan hanya di UI.
13. GitHub integration hanya berada pada backend.
14. Error harus ditampilkan dalam Bahasa Indonesia pada UI.
15. Kode harus menghindari komentar yang tidak diperlukan.
16. Baris kode dijaga di bawah 150 karakter jika praktis.

---

## 51. Ringkasan Arsitektur

```text
                    ┌─────────────────┐
                    │  React Web App  │
                    │  TypeScript     │
                    │  Tailwind CSS   │
                    └────────┬────────┘
                             │
                             │ REST
                             ▼
                 ┌────────────────────────┐
                 │ Express API            │
                 │ TypeScript              │
                 │                         │
                 │ Controller              │
                 │ Service                 │
                 │ Repository               │
                 │ GitHub Integration       │
                 └───────┬─────────┬──────┘
                         │         │
                         │         │ HTTPS
                         ▼         ▼
                    ┌────────┐  ┌────────────┐
                    │ MySQL  │  │   GitHub   │
                    │ Prisma │  │ REST API   │
                    └────────┘  └────────────┘
                         ▲
                         │
                         │
             ┌───────────┴───────────────┐
             │ @lecturer-github-tracker  │
             │         /shared           │
             │ Models / DTO / Enums      │
             └───────────────────────────┘
```
