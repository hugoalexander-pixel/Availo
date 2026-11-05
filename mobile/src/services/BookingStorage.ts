import AsyncStorage from "@react-native-async-storage/async-storage";
import { Booking, BookingFormData } from "../types/Booking";

const STORAGE_KEY = "@availo/bookings";

function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
}

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

export async function deleteBooking(id: string): Promise<void> {
  const bookings = await getAllBookings();
  const filtered = bookings.filter((b) => b.Id !== id);
  if (filtered.length === bookings.length) {
    throw new Error("Booking tidak ditemukan.");
  }
  await saveAllBookings(filtered);
}

export async function getBookingById(id: string): Promise<Booking | null> {
  const bookings = await getAllBookings();
  return bookings.find((b) => b.Id === id) ?? null;
}
