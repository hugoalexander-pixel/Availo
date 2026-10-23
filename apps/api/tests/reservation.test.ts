/**
 * Test US-3: Reservasi Ruangan
 * Menguji ReservationService — validasi kapasitas, konflik jadwal, tanggal lampau.
 * Prisma di-mock untuk mengisolasi logika bisnis.
 */

const mockFacilityFindUnique = jest.fn();
const mockReservationFindFirst = jest.fn();
const mockReservationCreate = jest.fn();
const mockReservationFindUnique = jest.fn();
const mockReservationUpdate = jest.fn();
const mockReservationFindMany = jest.fn();
const mockFacilityWatchFindMany = jest.fn();
const mockFacilityWatchDeleteMany = jest.fn();
const mockNotificationCreate = jest.fn();

jest.mock('../src/utils/prisma', () => ({
  __esModule: true,
  default: {
    facility: {
      findUnique: (...args: any[]) => mockFacilityFindUnique(...args),
    },
    reservation: {
      findFirst: (...args: any[]) => mockReservationFindFirst(...args),
      create: (...args: any[]) => mockReservationCreate(...args),
      findUnique: (...args: any[]) => mockReservationFindUnique(...args),
      update: (...args: any[]) => mockReservationUpdate(...args),
      findMany: (...args: any[]) => mockReservationFindMany(...args),
    },
    facilityWatch: {
      findMany: (...args: any[]) => mockFacilityWatchFindMany(...args),
      deleteMany: (...args: any[]) => mockFacilityWatchDeleteMany(...args),
    },
    notification: {
      create: (...args: any[]) => mockNotificationCreate(...args),
    },
  },
}));

import { ReservationService } from '../src/services/reservationService';

const reservationService = new ReservationService();

describe('US-3: Reservasi Ruangan', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('reservasi_berhasil_jika_slot_tersedia_dan_kapasitas_cukup', async () => {
    mockFacilityFindUnique.mockResolvedValue({ Id: 1, Capacity: 8 });
    mockReservationFindFirst.mockResolvedValue(null);

    const createdReservation = {
      Id: 1, UserId: 1, FacilityId: 1,
      Date: new Date('2027-01-15'),
      StartTime: new Date('2027-01-15T10:00:00'),
      EndTime: new Date('2027-01-15T12:00:00'),
      ActualEndTime: null, PartySize: 5, Purpose: 'Diskusi tugas',
      Status: 'UPCOMING', CreatedAt: new Date(),
      Facility: { Name: 'Ruang Diskusi 301', Building: { Name: 'Gedung A' } },
      User: { Id: 1, Name: 'Budi' },
    };
    mockReservationCreate.mockResolvedValue(createdReservation);

    const result = await reservationService.create({
      UserId: 1, FacilityId: 1, Date: '2027-01-15',
      StartTime: '10:00', EndTime: '12:00', PartySize: 5, Purpose: 'Diskusi tugas',
    });

    expect(result.Status).toBe('UPCOMING');
    expect(result.PartySize).toBe(5);
    expect(result.FacilityName).toBe('Ruang Diskusi 301');
  });

  test('reservasi_ditolak_jika_jumlah_peserta_melebihi_kapasitas', async () => {
    mockFacilityFindUnique.mockResolvedValue({ Id: 1, Capacity: 8 });

    await expect(
      reservationService.create({
        UserId: 1, FacilityId: 1, Date: '2027-01-15',
        StartTime: '10:00', EndTime: '12:00', PartySize: 10,
      })
    ).rejects.toThrow('CAPACITY_EXCEEDED');
  });

  test('reservasi_ditolak_jika_slot_waktu_bertabrakan', async () => {
    mockFacilityFindUnique.mockResolvedValue({ Id: 1, Capacity: 40 });
    mockReservationFindFirst.mockResolvedValue({
      Id: 99, FacilityId: 1, Date: new Date('2027-01-15'),
      StartTime: new Date('2027-01-15T10:00:00'),
      EndTime: new Date('2027-01-15T12:00:00'),
      Status: 'UPCOMING',
    });

    await expect(
      reservationService.create({
        UserId: 2, FacilityId: 1, Date: '2027-01-15',
        StartTime: '11:00', EndTime: '13:00', PartySize: 5,
      })
    ).rejects.toThrow('RESERVATION_CONFLICT');
  });

  test('reservasi_ditolak_jika_tanggal_di_masa_lalu', async () => {
    mockFacilityFindUnique.mockResolvedValue({ Id: 1, Capacity: 40 });

    await expect(
      reservationService.create({
        UserId: 1, FacilityId: 1, Date: '2020-01-01',
        StartTime: '10:00', EndTime: '12:00', PartySize: 5,
      })
    ).rejects.toThrow('DATE_IN_PAST');
  });

  test('reservasi_ditolak_jika_waktu_mulai_setelah_waktu_selesai', async () => {
    mockFacilityFindUnique.mockResolvedValue({ Id: 1, Capacity: 40 });

    await expect(
      reservationService.create({
        UserId: 1, FacilityId: 1, Date: '2027-01-15',
        StartTime: '14:00', EndTime: '12:00', PartySize: 5,
      })
    ).rejects.toThrow('INVALID_TIME_RANGE');
  });

  test('reservasi_ditolak_jika_fasilitas_tidak_ditemukan', async () => {
    mockFacilityFindUnique.mockResolvedValue(null);

    await expect(
      reservationService.create({
        UserId: 1, FacilityId: 999, Date: '2027-01-15',
        StartTime: '10:00', EndTime: '12:00', PartySize: 5,
      })
    ).rejects.toThrow('FACILITY_NOT_FOUND');
  });
});
