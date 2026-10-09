export type BookingFormValues = {
  date: string;
  startTime: string;
  endTime: string;
  people: string;
};

export type BookingFieldErrors = Partial<Record<keyof BookingFormValues, string>>;

export function validateBookingForm(values: BookingFormValues, capacity: number, now = new Date()): BookingFieldErrors {
  const errors: BookingFieldErrors = {};
  const dateMatch = /^(\d{4})-(\d{2})-(\d{2})$/.exec(values.date.trim());
  if (!dateMatch) {
    errors.date = 'Tanggal wajib diisi dengan format YYYY-MM-DD.';
  } else {
    const [, year, month, day] = dateMatch;
    const parsedDate = new Date(Number(year), Number(month) - 1, Number(day));
    const normalized = `${parsedDate.getFullYear()}-${String(parsedDate.getMonth() + 1).padStart(2, '0')}-${String(parsedDate.getDate()).padStart(2, '0')}`;
    if (normalized !== values.date.trim()) errors.date = 'Tanggal tidak valid.';
    else {
      const today = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
      if (normalized < today) errors.date = 'Tanggal reservasi tidak boleh di masa lalu.';
      else if (normalized === today && /^([01]\d|2[0-3]):[0-5]\d$/.test(values.startTime)) {
        const currentTime = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
        if (values.startTime <= currentTime) errors.startTime = 'Jam mulai harus lebih dari waktu sekarang.';
      }
    }
  }

  const timePattern = /^([01]\d|2[0-3]):[0-5]\d$/;
  if (!timePattern.test(values.startTime)) errors.startTime = 'Jam mulai harus berformat HH:MM.';
  if (!timePattern.test(values.endTime)) errors.endTime = 'Jam selesai harus berformat HH:MM.';
  if (timePattern.test(values.startTime) && timePattern.test(values.endTime) && values.endTime <= values.startTime) {
    errors.endTime = 'Jam selesai harus setelah jam mulai.';
  }

  const people = Number(values.people);
  if (!/^\d+$/.test(values.people) || !Number.isInteger(people) || people < 1) {
    errors.people = 'Jumlah orang minimal 1.';
  } else if (people > capacity) {
    errors.people = `Maksimal ${capacity} orang untuk ruang ini.`;
  }

  return errors;
}
