import {
  getAllBookings,
  createBooking,
  updateBooking,
  deleteBooking,
  getBookingById,
} from '../src/services/BookingStorage';

jest.mock('@react-native-async-storage/async-storage', () =>
  require('@react-native-async-storage/async-storage/jest/async-storage-mock')
);

describe('BookingStorage', () => {
  beforeEach(async () => {
    const AsyncStorage = require('@react-native-async-storage/async-storage');
    await AsyncStorage.clear();
  });

  it('mengembalikan array kosong saat belum ada booking', async () => {
    const bookings = await getAllBookings();
    expect(bookings).toEqual([]);
  });

  it('dapat membuat booking baru', async () => {
    const newBooking = await createBooking({
      FacilityName: 'Ruang Seminar 101',
      Date: '2026-11-10',
      StartTime: '09:00',
      EndTime: '11:00',
      Purpose: 'Workshop Pengembangan Mobile',
    });

    expect(newBooking.Id).toBeDefined();
    expect(newBooking.FacilityName).toBe('Ruang Seminar 101');
    expect(newBooking.Status).toBe('Pending');

    const all = await getAllBookings();
    expect(all).toHaveLength(1);
    expect(all[0].Id).toBe(newBooking.Id);
  });

  it('dapat mengupdate data booking', async () => {
    const created = await createBooking({
      FacilityName: 'Lab Komputer 3',
      Date: '2026-11-12',
      StartTime: '13:00',
      EndTime: '15:00',
      Purpose: 'Praktikum Basis Data',
    });

    const updated = await updateBooking(created.Id, {
      Status: 'Confirmed',
    });

    expect(updated.Status).toBe('Confirmed');

    const found = await getBookingById(created.Id);
    expect(found?.Status).toBe('Confirmed');
  });

  it('dapat menghapus data booking', async () => {
    const created = await createBooking({
      FacilityName: 'Ruang Diskusi 202',
      Date: '2026-11-15',
      StartTime: '10:00',
      EndTime: '12:00',
      Purpose: 'Diskusi Kelompok',
    });

    await deleteBooking(created.Id);
    const all = await getAllBookings();
    expect(all).toHaveLength(0);
  });
});
