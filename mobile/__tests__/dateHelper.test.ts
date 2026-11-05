import { generateDateOptions } from '../src/utils/dateHelper';

describe('dateHelper', () => {
  it('menghasilkan 10 opsi tanggal secara default', () => {
    const options = generateDateOptions(new Date('2026-11-05T00:00:00Z'));
    expect(options).toHaveLength(10);
    expect(options[0].badge).toBe('Hari Ini');
    expect(options[0].label).toContain('Hari ini');
    expect(options[1].badge).toBe('Besok');
    expect(options[1].label).toContain('Besok');
  });

  it('dapat menghasilkan jumlah opsi kustom', () => {
    const options = generateDateOptions(new Date('2026-11-05T00:00:00Z'), 5);
    expect(options).toHaveLength(5);
  });
});
