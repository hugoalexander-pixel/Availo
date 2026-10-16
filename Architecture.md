# KelasKosong — Architecture

Build a full-stack web application named **KelasKosong**.

Purpose:
Help university students find and reserve available campus facilities (classrooms, discussion rooms, labs, meeting rooms) without physically checking each location. The application shows real-time availability status, allows reservation, and features an "Early Finish" button that releases rooms back to other students when a group finishes early.

Use this stack:

* Frontend: React + TypeScript + Vite
* Styling: CSS (Responsive, Mobile-First)
* Backend: Node.js + TypeScript + Express
* Database: PostgreSQL
* ORM: Prisma
* API style: REST API
* Authentication: JWT + bcrypt
* Use Docker Compose for PostgreSQL
* Use `.env.example` for database URL, JWT secret, and ports

Code rules:

* Do not add comments unless truly necessary.
* Use PascalCase for all classes, types, interfaces, enums, React components, database models, API DTOs, and JSON property names.
* Local variables may use camelCase.
* Keep code lines below 150 characters where practical.
* Use a clean and simple folder structure.
* Use Indonesian language (Bahasa Indonesia) for all UI text, labels, buttons, messages, and error messages.

---

## Main Entities

1. User

   * Id
   * Name
   * Email (unique)
   * Password (hashed with bcrypt)
   * Role (enum: MAHASISWA, PENGELOLA)
   * CreatedAt
   * UpdatedAt

2. Building

   * Id
   * Name
   * Code (unique — e.g. "GD-A")
   * Description (optional)
   * CreatedAt
   * UpdatedAt

3. Facility

   * Id
   * BuildingId (FK → Building)
   * Name (e.g. "Ruang Diskusi 302")
   * Type (enum: RUANG_KELAS, RUANG_DISKUSI, LABORATORIUM, AULA, RUANG_RAPAT)
   * Capacity
   * Floor
   * Description (optional)
   * ImageUrl (optional)
   * CreatedAt
   * UpdatedAt

4. Amenity

   * Id
   * Name (unique — e.g. "Whiteboard", "AC", "Wi-Fi", "Proyektor")
   * Icon (optional)
   * CreatedAt
   * UpdatedAt

5. FacilityAmenity (junction table)

   * Id
   * FacilityId (FK → Facility)
   * AmenityId (FK → Amenity)
   * Unique constraint on `FacilityId + AmenityId`

6. Reservation

   * Id
   * UserId (FK → User)
   * FacilityId (FK → Facility)
   * Date
   * StartTime
   * EndTime
   * ActualEndTime (nullable — filled when "Early Finish" is used)
   * PartySize
   * Purpose (optional)
   * Status (enum: UPCOMING, ACTIVE, COMPLETED, CANCELLED, EARLY_ENDED)
   * CreatedAt
   * UpdatedAt

7. Notification

   * Id
   * UserId (FK → User)
   * FacilityId (FK → Facility)
   * Message
   * Type (enum: FACILITY_AVAILABLE, RESERVATION_REMINDER, RESERVATION_CANCELLED)
   * IsRead (default: false)
   * CreatedAt
   * UpdatedAt

---

## Database Rules

* Two reservations must not overlap on the same facility, same date, and overlapping time range. This is enforced at the service layer.
* Reservation status transitions:
  * UPCOMING → ACTIVE (automatic when current time >= StartTime)
  * UPCOMING → CANCELLED (user cancels before start)
  * ACTIVE → COMPLETED (automatic when current time >= EndTime)
  * ACTIVE → EARLY_ENDED (user presses "Early Finish")
  * Terminal states (COMPLETED, CANCELLED, EARLY_ENDED) cannot be changed.
* Facility availability status is computed dynamically from reservations, never stored as a static field.
* Passwords must be hashed with bcrypt before storage.
* Use Prisma migrations.
* Seed data must include: 3 buildings, 7 amenities, 6 facilities with amenities, 2 demo users (1 MAHASISWA, 1 PENGELOLA).
* Seed must be idempotent or safe to run multiple times.
* Use `onDelete: Cascade` for parent-child relationships.

---

## Backend Features

1. Authentication

   * Register a new user with Name, Email, Password, and Role.
   * Login with Email and Password.
   * Return JWT token on successful register/login.
   * JWT token contains UserId, Email, Role.
   * Protected routes require `Authorization: Bearer <token>` header.
   * Auth middleware verifies token and attaches user to request.

2. Building Management

   * List all buildings.
   * Create building (PENGELOLA only).

3. Facility Management

   * List facilities with filters (buildingId, type, minCapacity, date, time, status, search).
   * Get facility detail with current availability status and amenities.
   * Create facility with amenities (PENGELOLA only).
   * Update facility (PENGELOLA only).
   * Delete facility (PENGELOLA only).
   * Availability status calculation:
     * TERSEDIA (green): No active reservation at current time.
     * AKAN_TERSEDIA (yellow): Active reservation ending within 30 minutes.
     * SEDANG_DIGUNAKAN (red): Active reservation at current time.

4. Reservation Management

   * Create reservation: validate no overlapping reservation exists, validate party size <= capacity, validate date is not in the past.
   * List current user's reservations (filter by status).
   * Get reservation detail.
   * Cancel reservation (only UPCOMING, only owner).
   * Early finish (only ACTIVE, only owner): set ActualEndTime = now, status = EARLY_ENDED, trigger notification for watchers.
   * List reservations for a specific facility on a date.

5. Notification Management

   * List notifications for current user.
   * Mark notification as read.
   * Watch a facility: when that facility becomes available (reservation ends or early-ended), create a notification for the watcher.

---

## Frontend Pages

1. Login Page

   * Email and password form.
   * Link to register page.
   * Redirect to facilities page on success.

2. Register Page

   * Name, email, password, confirm password form.
   * Link to login page.
   * Redirect to facilities page on success.

3. Facilities Page (main page)

   * Search bar for room name.
   * Filter panel: building, type, minimum capacity, date, time, status.
   * Grid of facility cards showing: name, building, capacity, amenities, status badge.
   * Click card to go to facility detail.
   * Empty state when no facilities match.
   * Loading state.

4. Facility Detail Page

   * Full facility info: name, building, floor, capacity, description, amenities list.
   * Current availability status badge.
   * Today's reservation timeline (simple list).
   * Reservation form: date, start time, end time, party size, purpose.
   * "Beritahu Saya" (Notify Me) button to watch for availability.
   * Success/error messages.

5. My Reservations Page

   * Tabs: Aktif | Akan Datang | Semua.
   * Each reservation shows: facility name, date, time, status badge.
   * "Batalkan" button for UPCOMING reservations.
   * "Saya Selesai Lebih Awal" button for ACTIVE reservations.
   * Confirmation dialog before cancel or early-end.

6. History Page

   * List of past reservations (COMPLETED, CANCELLED, EARLY_ENDED).
   * Status badge for each.

7. Notifications Page

   * List of notifications with unread badge.
   * Click to mark as read and navigate to facility.

---

## UI Requirements

* All text in Indonesian (Bahasa Indonesia).
* Mobile-first responsive design.
* Status badge colors for facility:
  * Tersedia: green
  * Akan Tersedia: yellow/orange
  * Sedang Digunakan: red
* Status badge colors for reservation:
  * Akan Datang: blue
  * Sedang Berlangsung: green
  * Selesai: gray
  * Dibatalkan: red
  * Selesai Lebih Awal: orange
* Required components: Card, Badge, Modal, Button, SearchBar, Form, Table, EmptyState, LoadingSpinner, Toast.
* Confirmation dialog before destructive actions (cancel, early-end).
* Toast messages for success and error.

---

## Required API Routes

### Authentication

* `POST /api/auth/register`
* `POST /api/auth/login`
* `GET /api/auth/me`

### Buildings

* `GET /api/buildings`
* `POST /api/buildings`

### Facilities

* `GET /api/facilities`
* `GET /api/facilities/:Id`
* `POST /api/facilities`
* `PUT /api/facilities/:Id`
* `DELETE /api/facilities/:Id`

### Reservations

* `POST /api/reservations`
* `GET /api/reservations/my`
* `GET /api/reservations/:Id`
* `PATCH /api/reservations/:Id/cancel`
* `PATCH /api/reservations/:Id/early-end`
* `GET /api/facilities/:Id/reservations`

### Notifications

* `GET /api/notifications`
* `PATCH /api/notifications/:Id/read`
* `POST /api/notifications/watch`

---

## Project Structure

Use a simple project structure:

```text
kelaskosong/
├── apps/
│   ├── web/
│   │   ├── src/
│   │   │   ├── components/
│   │   │   ├── features/
│   │   │   │   ├── auth/
│   │   │   │   ├── facilities/
│   │   │   │   ├── reservations/
│   │   │   │   ├── notifications/
│   │   │   │   └── history/
│   │   │   ├── layouts/
│   │   │   ├── pages/
│   │   │   ├── services/
│   │   │   ├── hooks/
│   │   │   ├── lib/
│   │   │   ├── types/
│   │   │   ├── App.tsx
│   │   │   ├── App.css
│   │   │   └── main.tsx
│   │   ├── public/
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
│       │   ├── utils/
│       │   ├── app.ts
│       │   └── server.ts
│       ├── prisma/
│       │   ├── schema.prisma
│       │   ├── migrations/
│       │   └── seed.ts
│       ├── package.json
│       └── tsconfig.json
│
├── .env.example
├── .gitignore
├── docker-compose.yml
├── package.json
├── README.md
└── Architecture.md
```

---

## Environment Configuration

`.env.example`:

```env
DATABASE_URL="postgresql://kelaskosong:kelaskosong_password@localhost:5432/kelaskosong"
JWT_SECRET="your-secret-key-change-in-production"
JWT_EXPIRES_IN="24h"
API_PORT=3000
WEB_PORT=5173
```

---

## Docker Compose

```yaml
services:
  postgres:
    image: postgres:16
    restart: unless-stopped
    environment:
      POSTGRES_DB: kelaskosong
      POSTGRES_USER: kelaskosong
      POSTGRES_PASSWORD: kelaskosong_password
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data

volumes:
  postgres_data:
```

---

## Deliverables

* Complete frontend and backend source code.
* Prisma schema, migration, and seed data.
* Docker Compose file for PostgreSQL.
* `.env.example`.
* README with installation, database migration, seed, frontend/backend startup, and Docker usage.
* Ensure the application builds successfully and all features work: authentication, facility listing with filters, reservation with double-booking prevention, early finish, notifications, and reservation history.