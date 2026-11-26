import { formatLocalDate, isDateInPast } from '../src/utils/dateHelper';

describe('dateHelper (Regression Test Fix #16: Timezone UTC vs Lokal)', () => {
  test('formatLocalDate memformat tanggal lokal menjadi YYYY-MM-DD dengan padding 0', () => {
    const d = new Date(2026, 0, 5, 5, 30, 0); // 5 Jan 2026 05:30 lokal
    expect(formatLocalDate(d)).toBe('2026-01-05');
  });

  test('formatLocalDate tidak bergeser ke hari sebelumnya pada jam 00:01 lokal', () => {
    const d = new Date(2026, 10, 26, 0, 1, 0); // 26 Nov 2026 00:01 lokal
    expect(formatLocalDate(d)).toBe('2026-11-26');
  });

  test.each([
    ['2026-11-25', new Date(2026, 10, 26, 5, 0, 0), true],   // Kemarin jam 05:00 -> lampau
    ['2026-11-26', new Date(2026, 10, 26, 0, 1, 0), false],  // Hari ini jam 00:01 -> bukan lampau
    ['2026-11-26', new Date(2026, 10, 26, 5, 0, 0), false],  // Hari ini jam 05:00 -> bukan lampau
    ['2026-11-26', new Date(2026, 10, 26, 23, 59, 0), false],// Hari ini jam 23:59 -> bukan lampau
    ['2026-11-27', new Date(2026, 10, 26, 23, 59, 0), false],// Besok -> bukan lampau
    ['2025-12-31', new Date(2026, 0, 1, 0, 1, 0), true],     // Batas tahun -> lampau
  ])('isDateInPast(%s) relatif terhadap %s harus mengembalikan %s', (dateStr, ref, expected) => {
    expect(isDateInPast(dateStr, ref)).toBe(expected);
  });
});
