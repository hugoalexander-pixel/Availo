import AsyncStorage from "@react-native-async-storage/async-storage";

const PHOTO_STORAGE_PREFIX = "@availo/reservation_photos";

export async function saveReservationPhoto(reservationId: number, photoUri: string): Promise<void> {
  try {
    const raw = await AsyncStorage.getItem(PHOTO_STORAGE_PREFIX);
    const map: Record<string, string> = raw ? JSON.parse(raw) : {};
    map[reservationId.toString()] = photoUri;
    await AsyncStorage.setItem(PHOTO_STORAGE_PREFIX, JSON.stringify(map));
  } catch (e) {
    console.warn("Gagal menyimpan URI foto reservasi:", e);
  }
}

export async function getReservationPhoto(reservationId: number): Promise<string | null> {
  try {
    const raw = await AsyncStorage.getItem(PHOTO_STORAGE_PREFIX);
    if (!raw) return null;
    const map: Record<string, string> = JSON.parse(raw);
    return map[reservationId.toString()] || null;
  } catch {
    return null;
  }
}

export async function getAllReservationPhotos(): Promise<Record<string, string>> {
  try {
    const raw = await AsyncStorage.getItem(PHOTO_STORAGE_PREFIX);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}
