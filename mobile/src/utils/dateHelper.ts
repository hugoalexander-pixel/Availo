export interface DateOptionItem {
  value: string;
  label: string;
  description: string;
  badge?: string;
}

const INDO_DAYS = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
const INDO_MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];

export function generateDateOptions(startDate: Date = new Date(), count: number = 10): DateOptionItem[] {
  const options: DateOptionItem[] = [];

  for (let i = 0; i < count; i++) {
    const target = new Date(startDate);
    target.setDate(startDate.getDate() + i);

    const dayName = INDO_DAYS[target.getDay()];
    const dateNum = target.getDate();
    const monthName = INDO_MONTHS[target.getMonth()];
    const year = target.getFullYear();

    const formattedShort = `${dateNum} ${monthName} ${year}`;
    let label = `${dayName}, ${formattedShort}`;
    let description = 'Tersedia reservasi ruang';
    let badge: string | undefined;

    if (i === 0) {
      label = `Hari ini (${formattedShort})`;
      description = 'Pemesanan ruangan untuk hari ini';
      badge = 'Hari Ini';
    } else if (i === 1) {
      label = `Besok (${formattedShort})`;
      description = 'Pemesanan ruangan untuk besok';
      badge = 'Besok';
    } else if (target.getDay() === 0 || target.getDay() === 6) {
      description = 'Jadwal sesi akhir pekan / kegiatan mandiri';
    }

    options.push({
      value: formattedShort,
      label,
      description,
      badge,
    });
  }

  return options;
}
