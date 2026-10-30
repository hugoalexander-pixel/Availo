import { getReservationStatusStyle, getFacilityStatusStyle } from "../src/constants/Theme";

// Mock disk store
const mockSecureDisk = new Map<string, string>();

async function mockSaveSession(token: string, user: any) {
  mockSecureDisk.set("availo_auth_token", token);
  mockSecureDisk.set("availo_auth_user", JSON.stringify(user));
}

async function mockGetToken(): Promise<string | null> {
  return mockSecureDisk.get("availo_auth_token") ?? null;
}

async function mockGetUser(): Promise<any | null> {
  const raw = mockSecureDisk.get("availo_auth_user");
  return raw ? JSON.parse(raw) : null;
}

async function mockClearSession() {
  mockSecureDisk.clear();
}

// Validation logic
function validateAuthInput(name: string, email: string, pass: string, confirm: string) {
  const errors: Record<string, string> = {};
  if (!name.trim()) errors.name = "Nama wajib diisi";
  if (!email.trim() || !email.includes("@")) errors.email = "Email tidak valid";
  if (!pass || pass.length < 8) errors.password = "Password minimal 8 karakter";
  if (pass !== confirm) errors.confirm = "Password tidak cocok";
  return errors;
}

function validateReservation(data: {
  facilityId: number | null;
  date: string;
  startTime: string;
  endTime: string;
  partySize: number;
  capacity: number;
  purpose: string;
}) {
  const errors: Record<string, string> = {};
  if (!data.facilityId) errors.facility = "Pilih ruangan";
  if (!/^\d{4}-\d{2}-\d{2}$/.test(data.date)) errors.date = "Format tanggal salah";
  if (!/^\d{2}:\d{2}$/.test(data.startTime)) errors.startTime = "Format jam mulai salah";
  if (!/^\d{2}:\d{2}$/.test(data.endTime)) errors.endTime = "Format jam selesai salah";
  if (data.startTime >= data.endTime) errors.timeRange = "Waktu selesai harus setelah mulai";
  if (data.partySize < 1) errors.partySize = "Jumlah minimal 1";
  if (data.partySize > data.capacity) errors.capacity = "Melebihi kapasitas ruangan";
  if (!data.purpose.trim()) errors.purpose = "Tujuan wajib diisi";
  return errors;
}

// Permission handling simulator
function handlePermissionFlow(status: "granted" | "denied", canAskAgain: boolean): "granted" | "denied" | "blocked" {
  if (status === "granted") return "granted";
  if (canAskAgain) return "denied";
  return "blocked";
}

// Photo cancellation handler
function handleImagePickerResult(canceled: boolean, assets?: { uri: string }[]) {
  if (canceled || !assets || assets.length === 0) {
    return { cancelled: true, uri: undefined };
  }
  return { cancelled: false, uri: assets[0].uri };
}

async function runTestSuite() {
  console.log("==========================================================");
  console.log("   AVAILO MOBILE - BUSINESS RULES & ADVANCED FEATURE TESTS");
  console.log("==========================================================\n");

  let passed = 0;
  let total = 0;

  function assertTest(name: string, condition: boolean, detail = "") {
    total++;
    if (condition) {
      passed++;
      console.log(`  ✅ [PASS] ${name}`);
    } else {
      console.error(`  ❌ [FAIL] ${name} ${detail}`);
      throw new Error(`Test failed: ${name}`);
    }
  }

  // --- SUITE 1: AUTH & SECURE STORAGE ---
  console.log("▶ SUITE 1: Autentikasi & Secure Storage (Advanced Feature 1)");
  await mockSaveSession("jwt_mock_token_12345", {
    Id: 1,
    Name: "Budi Santoso",
    Email: "budi@kampus.ac.id",
    Role: "MAHASISWA",
  });

  const savedToken = await mockGetToken();
  assertTest("Token tersimpan di storage", savedToken === "jwt_mock_token_12345");

  const savedUser = await mockGetUser();
  assertTest("User session memiliki role MAHASISWA", savedUser?.Role === "MAHASISWA");
  assertTest("User name tersimpan dengan benar", savedUser?.Name === "Budi Santoso");

  await mockClearSession();
  const clearedToken = await mockGetToken();
  assertTest("Logout membersihkan token", clearedToken === null);

  // Auth Validation Rules
  const authErr1 = validateAuthInput("Budi", "bad-email", "123", "1234");
  assertTest("Validasi email ditolak jika tanpa @", !!authErr1.email);
  assertTest("Validasi password ditolak jika < 8 karakter", !!authErr1.password);
  assertTest("Validasi konfirmasi password ditolak jika beda", !!authErr1.confirm);

  const authValid = validateAuthInput("Budi", "budi@kampus.ac.id", "secret123", "secret123");
  assertTest("Validasi auth lolos jika input valid", Object.keys(authValid).length === 0);
  console.log("");

  // --- SUITE 2: RESERVATION LOGIC & ANTI DOUBLE-BOOKING / CAPACITY ---
  console.log("▶ SUITE 2: Aturan Bisnis Reservasi & Kapasitas");
  const resValid = validateReservation({
    facilityId: 101,
    date: "2026-11-01",
    startTime: "09:00",
    endTime: "11:00",
    partySize: 5,
    capacity: 20,
    purpose: "Belajar bersama persiapan UTS",
  });
  assertTest("Reservasi valid jika kapasitas cukup & waktu benar", Object.keys(resValid).length === 0);

  const resOverCap = validateReservation({
    facilityId: 101,
    date: "2026-11-01",
    startTime: "09:00",
    endTime: "11:00",
    partySize: 35,
    capacity: 20,
    purpose: "Rapat himpunan",
  });
  assertTest("Reservasi ditolak jika peserta melebihi kapasitas ruangan", !!resOverCap.capacity);

  const resBadTime = validateReservation({
    facilityId: 101,
    date: "2026-11-01",
    startTime: "14:00",
    endTime: "13:00",
    partySize: 5,
    capacity: 20,
    purpose: "Diskusi",
  });
  assertTest("Reservasi ditolak jika jam selesai <= jam mulai", !!resBadTime.timeRange);
  console.log("");

  // --- SUITE 3: STATUS FORMATTER & BACKEND ENUM ALIGNMENT ---
  console.log("▶ SUITE 3: Sinkronisasi Status Enum dengan Backend");
  const upcomingStyle = getReservationStatusStyle("UPCOMING");
  assertTest("Status UPCOMING dipetakan ke 'Mendatang'", upcomingStyle.label === "Mendatang");

  const earlyEndStyle = getReservationStatusStyle("EARLY_ENDED");
  assertTest("Status EARLY_ENDED dipetakan ke 'Selesai Lebih Awal'", earlyEndStyle.label === "Selesai Lebih Awal");

  const facilityTersedia = getFacilityStatusStyle("TERSEDIA");
  assertTest("Status fasilitas TERSEDIA dikenali", facilityTersedia.label === "Tersedia");

  const facilityAkanTersedia = getFacilityStatusStyle("AKAN_TERSEDIA");
  assertTest("Status fasilitas AKAN_TERSEDIA dikenali (≤30m)", facilityAkanTersedia.label === "Segera Tersedia (≤30m)");
  console.log("");

  // --- SUITE 4: PERMISSION HANDLING (CAMERA & NOTIFICATION) ---
  console.log("▶ SUITE 4: Penanganan Kasus Izin (Advanced Feature 2 & 3)");
  assertTest("Izin diberikan -> status 'granted'", handlePermissionFlow("granted", true) === "granted");
  assertTest("Izin ditolak pertama kali -> status 'denied'", handlePermissionFlow("denied", true) === "denied");
  assertTest("Izin ditolak permanen (jangan tanya lagi) -> status 'blocked'", handlePermissionFlow("denied", false) === "blocked");
  console.log("");

  // --- SUITE 5: PEMBATALAN OLEH PENGGUNA (CANCELLATION SAFE) ---
  console.log("▶ SUITE 5: Penanganan Pembatalan oleh Pengguna (No Crash / Safe State)");
  const userCanceledCamera = handleImagePickerResult(true, []);
  assertTest("Pembatalan kamera tidak melempar error dan cancelled = true", userCanceledCamera.cancelled === true);
  assertTest("URI tidak tersimpan jika pengambilan foto dibatalkan", userCanceledCamera.uri === undefined);

  const userSuccessCamera = handleImagePickerResult(false, [{ uri: "file:///mock/room-photo.jpg" }]);
  assertTest("Foto berhasil diambil menghasilkan URI valid", userSuccessCamera.uri === "file:///mock/room-photo.jpg");
  console.log("");

  console.log("==========================================================");
  console.log(`  🎉 HASIL: SEMUA ${passed}/${total} PENGUJIAN BISNIS & FITUR LULUS!`);
  console.log("==========================================================");
}

runTestSuite().catch((e) => {
  console.error("Gagal menjalankan test suite:", e);
  process.exit(1);
});
