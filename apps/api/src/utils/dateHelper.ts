/**
 * Mengubah objek Date menjadi string tanggal kalender lokal (YYYY-MM-DD).
 * Menghindari pergeseran tanggal akibat konversi ke UTC.
 */
export function formatLocalDate(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Memeriksa apakah string tanggal (YYYY-MM-DD) berada di masa lalu
 * relatif terhadap tanggal kalender lokal saat ini (referenceDate).
 * Perbandingan dilakukan pada string YYYY-MM-DD agar bebas dari bug perbedaan zona waktu UTC vs lokal.
 */
export function isDateInPast(dateStr: string, referenceDate: Date = new Date()): boolean {
  const normalizedInput = dateStr.trim().slice(0, 10);
  const todayStr = formatLocalDate(referenceDate);
  return normalizedInput < todayStr;
}

/**
 * Membangun objek Date referensi berdasarkan filter tanggal & jam dari request.
 * Jika filter tidak diberikan, mengembalikan waktu sekarang (now).
 */
export function buildReferenceDate(
  filterDate?: string,
  filterTime?: string,
  now: Date = new Date()
): Date {
  if (!filterDate && !filterTime) {
    return now;
  }

  const todayStr = formatLocalDate(now);
  const datePart = filterDate ? filterDate.trim().slice(0, 10) : todayStr;

  if (!filterTime && datePart === todayStr) {
    return now;
  }

  let timePart: string;
  if (filterTime) {
    const trimmed = filterTime.trim();
    timePart = trimmed.length === 5 ? `${trimmed}:00` : trimmed;
  } else {
    const hh = String(now.getHours()).padStart(2, '0');
    const mm = String(now.getMinutes()).padStart(2, '0');
    const ss = String(now.getSeconds()).padStart(2, '0');
    timePart = `${hh}:${mm}:${ss}`;
  }

  const parsed = new Date(`${datePart}T${timePart}`);
  return Number.isNaN(parsed.getTime()) ? now : parsed;
}
