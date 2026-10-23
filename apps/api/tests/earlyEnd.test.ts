/**
 * Test US-4: Selesai Lebih Awal & Notifikasi
 * Menguji ReservationService.earlyEnd — status transition, notifikasi watcher, batasan.
 * Prisma di-mock untuk mengisolasi logika bisnis.
 */

const mockFacilityFindUniqueEE = jest.fn();
const mockReservationFindUniqueEE = jest.fn();
const mockReservationUpdateEE = jest.fn();
const mockFacilityWatchFindManyEE = jest.fn();
const mockFacilityWatchDeleteManyEE = jest.fn();
const mockNotificationCreateEE = jest.fn();
const mockReservationFindFirstEE = jest.fn();
const mockReservationCreateEE = jest.fn();
const mockReservationFindManyEE = jest.fn();

jest.mock('../src/utils/prisma', () => ({
  __esModule: true,
  default: {
    facility: {
      findUnique: (...args: any[]) => mockFacilityFindUniqueEE(...args),
    },
    reservation: {
      findFirst: (...args: any[]) => mockReservationFindFirstEE(...args),
      create: (...args: any[]) => mockReservationCreateEE(...args),
      findUnique: (...args: any[]) => mockReservationFindUniqueEE(...args),
      update: (...args: any[]) => mockReservationUpdateEE(...args),
      findMany: (...args: any[]) => mockReservationFindManyEE(...args),
    },
    facilityWatch: {
      findMany: (...args: any[]) => mockFacilityWatchFindManyEE(...args),
      deleteMany: (...args: any[]) => mockFacilityWatchDeleteManyEE(...args),
    },
    notification: {
      create: (...args: any[]) => mockNotificationCreateEE(...args),
    },
  },
}));

import { ReservationService } from '../src/services/reservationService';

const reservationService = new ReservationService();

describe('US-4: Selesai Lebih Awal & Notifikasi', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('selesai_lebih_awal_mengubah_status_ke_EARLY_ENDED', async () => {
    const reservation = {
      Id: 1, UserId: 1, FacilityId: 1, Status: 'ACTIVE',
      Facility: { Id: 1, Name: 'Ruang Diskusi 301' },
    };
    mockReservationFindUniqueEE.mockResolvedValue(reservation);

    const updated = {
      ...reservation,
      Status: 'EARLY_ENDED',
      ActualEndTime: new Date(),
      Facility: { Name: 'Ruang Diskusi 301', Building: { Name: 'Gedung A' } },
      User: { Id: 1, Name: 'Budi' },
    };
    mockReservationUpdateEE.mockResolvedValue(updated);
    mockFacilityWatchFindManyEE.mockResolvedValue([]);
    mockFacilityWatchDeleteManyEE.mockResolvedValue({});

    const result = await reservationService.earlyEnd(1, 1);

    expect(result.Status).toBe('EARLY_ENDED');
    expect(result.ActualEndTime).toBeTruthy();
  });

  test('selesai_lebih_awal_membuat_notifikasi_untuk_pemantau', async () => {
    const reservation = {
      Id: 1, UserId: 1, FacilityId: 1, Status: 'ACTIVE',
      Facility: { Id: 1, Name: 'Ruang Diskusi 301' },
    };
    mockReservationFindUniqueEE.mockResolvedValue(reservation);

    const updated = {
      ...reservation,
      Status: 'EARLY_ENDED',
      ActualEndTime: new Date(),
      Facility: { Name: 'Ruang Diskusi 301', Building: { Name: 'Gedung A' } },
      User: { Id: 1, Name: 'Budi' },
    };
    mockReservationUpdateEE.mockResolvedValue(updated);

    const watchers = [
      { Id: 10, UserId: 2, FacilityId: 1 },
      { Id: 11, UserId: 3, FacilityId: 1 },
    ];
    mockFacilityWatchFindManyEE.mockResolvedValue(watchers);
    mockFacilityWatchDeleteManyEE.mockResolvedValue({});
    mockNotificationCreateEE.mockResolvedValue({});

    await reservationService.earlyEnd(1, 1);

    expect(mockNotificationCreateEE).toHaveBeenCalledTimes(2);
    const firstCall = mockNotificationCreateEE.mock.calls[0][0];
    expect(firstCall.data.UserId).toBe(2);
    expect(firstCall.data.Type).toBe('FACILITY_AVAILABLE');
    expect(firstCall.data.Message).toContain('Ruang Diskusi 301');
  });

  test('selesai_lebih_awal_ditolak_jika_status_COMPLETED', async () => {
    mockReservationFindUniqueEE.mockResolvedValue({
      Id: 1, UserId: 1, FacilityId: 1, Status: 'COMPLETED',
      Facility: { Id: 1, Name: 'Ruang Diskusi 301' },
    });

    await expect(reservationService.earlyEnd(1, 1)).rejects.toThrow('CANNOT_EARLY_END');
  });

  test('selesai_lebih_awal_ditolak_jika_status_CANCELLED', async () => {
    mockReservationFindUniqueEE.mockResolvedValue({
      Id: 1, UserId: 1, FacilityId: 1, Status: 'CANCELLED',
      Facility: { Id: 1, Name: 'Ruang Diskusi 301' },
    });

    await expect(reservationService.earlyEnd(1, 1)).rejects.toThrow('CANNOT_EARLY_END');
  });

  test('selesai_lebih_awal_ditolak_jika_bukan_pemilik', async () => {
    mockReservationFindUniqueEE.mockResolvedValue({
      Id: 1, UserId: 1, FacilityId: 1, Status: 'ACTIVE',
      Facility: { Id: 1, Name: 'Ruang Diskusi 301' },
    });

    await expect(reservationService.earlyEnd(1, 999)).rejects.toThrow('NOT_OWNER');
  });

  test('selesai_lebih_awal_menghapus_semua_watch_pada_fasilitas', async () => {
    const reservation = {
      Id: 1, UserId: 1, FacilityId: 1, Status: 'ACTIVE',
      Facility: { Id: 1, Name: 'Ruang Diskusi 301' },
    };
    mockReservationFindUniqueEE.mockResolvedValue(reservation);

    const updated = {
      ...reservation,
      Status: 'EARLY_ENDED', ActualEndTime: new Date(),
      Facility: { Name: 'Ruang Diskusi 301', Building: { Name: 'Gedung A' } },
      User: { Id: 1, Name: 'Budi' },
    };
    mockReservationUpdateEE.mockResolvedValue(updated);
    mockFacilityWatchFindManyEE.mockResolvedValue([]);
    mockFacilityWatchDeleteManyEE.mockResolvedValue({});

    await reservationService.earlyEnd(1, 1);

    expect(mockFacilityWatchDeleteManyEE).toHaveBeenCalledWith({
      where: { FacilityId: 1 },
    });
  });
});
