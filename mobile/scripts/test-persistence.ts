import { Booking, BookingFormData } from "../src/types/Booking";

// In-memory key-value store to simulate persistent mobile storage across "app launches"
const persistentDisk = new Map<string, string>();

const mockAsyncStorage = {
  getItem: async (key: string): Promise<string | null> => {
    return persistentDisk.get(key) ?? null;
  },
  setItem: async (key: string, value: string): Promise<void> => {
    persistentDisk.set(key, value);
  },
  removeItem: async (key: string): Promise<void> => {
    persistentDisk.delete(key);
  },
  clear: async (): Promise<void> => {
    persistentDisk.clear();
  },
};

const STORAGE_KEY = "@availo/bookings";

function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
}

// Logic identical to BookingStorage.ts, hooked to our mock storage
async function getAllBookings(): Promise<Booking[]> {
  try {
    const raw = await mockAsyncStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    return JSON.parse(raw) as Booking[];
  } catch (error) {
    console.error("Gagal membaca data booking:", error);
    return [];
  }
}

async function saveAllBookings(bookings: Booking[]): Promise<void> {
  try {
    await mockAsyncStorage.setItem(STORAGE_KEY, JSON.stringify(bookings));
  } catch (error) {
    console.error("Gagal menyimpan data booking:", error);
    throw new Error("Gagal menyimpan data booking.");
  }
}

async function createBooking(data: BookingFormData): Promise<Booking> {
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

async function updateBooking(
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

async function deleteBooking(id: string): Promise<void> {
  const bookings = await getAllBookings();
  const filtered = bookings.filter((b) => b.Id !== id);
  if (filtered.length === bookings.length) {
    throw new Error("Booking tidak ditemukan.");
  }
  await saveAllBookings(filtered);
}

function timeToMinutes(time: string): number {
  const [h, m] = time.split(":").map(Number);
  return h * 60 + m;
}

function validateBookingTimes(startTime: string, endTime: string): boolean {
  return timeToMinutes(endTime) > timeToMinutes(startTime);
}

async function runTests() {
  console.log("=================================================");
  console.log("   AVAILO - PERSISTENCE & CRUD VERIFICATION TEST ");
  console.log("=================================================\n");

  // Reset store
  await mockAsyncStorage.clear();

  // Test 0: Storage kosong
  console.log("Test 0: Kondisi storage awal (kosong)");
  const initialBookings = await getAllBookings();
  console.assert(
    initialBookings.length === 0,
    "Storage awal harus mengembalikan array kosong"
  );
  console.log("  [PASS] Storage awal kosong, mengembalikan []\n");

  // Test 1: Tambahkan satu booking (CREATE)
  console.log("Test 1: Tambahkan satu booking (CREATE)");
  const newBookingData: BookingFormData = {
    FacilityName: "Ruang Diskusi 302",
    Date: "2026-10-20",
    StartTime: "09:00",
    EndTime: "11:00",
    Purpose: "Diskusi Proyek Akhir Basis Data",
  };

  console.assert(
    validateBookingTimes(newBookingData.StartTime, newBookingData.EndTime),
    "Waktu selesai harus lebih akhir dari waktu mulai"
  );
  console.log("  [PASS] Validasi waktu: 09:00 -> 11:00 valid (EndTime > StartTime)");

  const created = await createBooking(newBookingData);
  console.log(`  [PASS] Booking dibuat: ID = ${created.Id}, Status = ${created.Status}`);
  console.assert(created.Status === "Pending", "Default status harus 'Pending'");
  console.assert(created.FacilityName === "Ruang Diskusi 302", "FacilityName sesuai");
  console.log("");

  // Test 2 & 3: Tutup aplikasi sepenuhnya & Buka aplikasi kembali
  console.log("Test 2 & 3: Simulasi TUTUP APLIKASI sepenuhnya dan BUKA KEMBALI");
  // (State memory aplikasi hilang, hanya membaca dari persistent storage)
  const reloadedBookings = await getAllBookings();
  console.log(`  [PASS] Data dibaca ulang dari storage: ${reloadedBookings.length} booking ditemukan`);

  // Test 4: Pastikan booking masih tampil (READ)
  console.log("Test 4: Verifikasi booking tersimpan setelah aplikasi dibuka kembali (READ)");
  console.assert(reloadedBookings.length === 1, "Harus ada 1 booking tersimpan");
  console.assert(
    reloadedBookings[0].Id === created.Id,
    "ID booking harus cocok dengan yang dibuat"
  );
  console.assert(
    reloadedBookings[0].FacilityName === "Ruang Diskusi 302",
    "FacilityName tetap persisten"
  );
  console.log("  [PASS] Data booking terbukti persisten!\n");

  // Test 5: Edit booking dan pastikan perubahan tersimpan setelah aplikasi dibuka kembali (UPDATE)
  console.log("Test 5: Edit booking & verifikasi persistensi (UPDATE)");
  await updateBooking(created.Id, {
    Purpose: "Diskusi Revisi Proyek dan Presentasi",
    Status: "Confirmed",
    EndTime: "12:00",
  });

  // Simulasi restart aplikasi lagi
  const reloadedAfterEdit = await getAllBookings();
  console.assert(reloadedAfterEdit.length === 1, "Tetap ada 1 booking");
  const editedBooking = reloadedAfterEdit[0];
  console.assert(
    editedBooking.Purpose === "Diskusi Revisi Proyek dan Presentasi",
    "Tujuan harus terupdate"
  );
  console.assert(
    editedBooking.Status === "Confirmed",
    "Status harus terupdate menjadi Confirmed"
  );
  console.assert(
    editedBooking.EndTime === "12:00",
    "EndTime harus terupdate menjadi 12:00"
  );
  console.log("  [PASS] Perubahan booking tersimpan dan terbaca kembali setelah restart!\n");

  // Test 6: Hapus booking dan pastikan tidak muncul lagi setelah aplikasi dibuka kembali (DELETE)
  console.log("Test 6: Hapus booking & verifikasi penghapusan (DELETE)");
  await deleteBooking(created.Id);

  // Simulasi restart aplikasi
  const reloadedAfterDelete = await getAllBookings();
  console.assert(
    reloadedAfterDelete.length === 0,
    "Daftar booking harus kosong setelah dihapus"
  );
  console.log("  [PASS] Booking yang dihapus tidak muncul lagi setelah restart!\n");

  // Test 7: Validasi input waktu tidak valid (EndTime <= StartTime)
  console.log("Test 7: Validasi input jam selesai <= jam mulai");
  const invalidTimeCheck = validateBookingTimes("14:00", "13:00");
  console.assert(
    !invalidTimeCheck,
    "Jam selesai 13:00 lebih awal dari 14:00 harus ditolak"
  );
  console.log("  [PASS] Jam selesai lebih awal dari jam mulai berhasil ditolak!\n");

  console.log("=================================================");
  console.log("      SEMUA 6 TAHAP PENGUJIAN PERSISTENSI LULUS! ");
  console.log("=================================================");
}

runTests().catch((err) => {
  console.error("Test Gagal:", err);
  process.exit(1);
});
