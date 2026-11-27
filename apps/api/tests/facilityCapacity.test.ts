/**
 * Regression & Unit Test Fix #19: Validasi kapasitas fasilitas terhadap reservasi aktif
 */

const mockFacilityFindUnique = jest.fn();
const mockFacilityUpdate = jest.fn();
const mockReservationFindMany = jest.fn();

jest.mock('../src/utils/prisma', () => ({
  __esModule: true,
  default: {
    facility: {
      findUnique: (...args: any[]) => mockFacilityFindUnique(...args),
      update: (...args: any[]) => mockFacilityUpdate(...args),
    },
    reservation: {
      findMany: (...args: any[]) => mockReservationFindMany(...args),
    },
  },
}));

import { FacilityService } from '../src/services/facilityService';
import { FacilityController } from '../src/controllers/facilityController';

const facilityService = new FacilityService();
const facilityController = new FacilityController();

function createMockRes() {
  const res: any = {};
  res.statusCode = 200;
  res.body = null;
  res.status = jest.fn((code: number) => {
    res.statusCode = code;
    return res;
  });
  res.json = jest.fn((data: any) => {
    res.body = data;
    return res;
  });
  return res;
}

function buildFacilityDetails(id: number, capacity: number) {
  return {
    Id: id,
    Name: 'Lab Komputer 201',
    Type: 'LABORATORIUM',
    Capacity: capacity,
    Floor: 2,
    Description: 'Lab komputer',
    ImageUrl: null,
    Building: { Id: 1, Name: 'Gedung B', Code: 'GD-B' },
    Amenities: [],
    Reservations: [],
  };
}

describe('Fix #19: Validasi Kapasitas Fasilitas Terhadap Reservasi Aktif', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers().setSystemTime(new Date('2026-11-27T10:00:00'));
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  // ---------------------------------------------------------------------------
  // GROUP 1: kapasitas baru vs reservasi aktif (UPCOMING/ACTIVE, hari ini & mendatang)
  // ---------------------------------------------------------------------------
  describe('Skenario kapasitas baru vs reservasi aktif (UPCOMING/ACTIVE hari ini & mendatang)', () => {
    test.each([
      { desc: 'lebih kecil dari peserta UPCOMING hari ini',       cap: 20, reservations: [{ Id: 1,  PartySize: 25, Status: 'UPCOMING', Date: new Date('2026-11-27') }], reject: true  },
      { desc: 'lebih kecil dari peserta ACTIVE hari ini',         cap: 10, reservations: [{ Id: 2,  PartySize: 15, Status: 'ACTIVE',   Date: new Date('2026-11-27') }], reject: true  },
      { desc: 'lebih kecil 1 orang dari peserta UPCOMING besok',  cap: 19, reservations: [{ Id: 3,  PartySize: 20, Status: 'UPCOMING', Date: new Date('2026-11-28') }], reject: true  },
      { desc: 'lebih kecil jauh dari UPCOMING minggu depan',      cap: 5,  reservations: [{ Id: 4,  PartySize: 30, Status: 'UPCOMING', Date: new Date('2026-12-04') }], reject: true  },
      { desc: 'sama persis dengan peserta UPCOMING hari ini',     cap: 25, reservations: [{ Id: 5,  PartySize: 25, Status: 'UPCOMING', Date: new Date('2026-11-27') }], reject: false },
      { desc: 'sama persis dengan peserta ACTIVE hari ini',       cap: 15, reservations: [{ Id: 6,  PartySize: 15, Status: 'ACTIVE',   Date: new Date('2026-11-27') }], reject: false },
      { desc: 'lebih besar 1 orang dari UPCOMING besok',          cap: 21, reservations: [{ Id: 7,  PartySize: 20, Status: 'UPCOMING', Date: new Date('2026-11-28') }], reject: false },
      { desc: 'lebih besar jauh dari peserta UPCOMING',           cap: 50, reservations: [{ Id: 8,  PartySize: 10, Status: 'UPCOMING', Date: new Date('2026-11-28') }], reject: false },
      { desc: 'tanpa reservasi, turunkan kapasitas ke 5',         cap: 5,  reservations: [],                                                                           reject: false },
      { desc: 'kapasitas dinaikkan ke 40 saat ada reservasi 20',  cap: 40, reservations: [{ Id: 9,  PartySize: 20, Status: 'UPCOMING', Date: new Date('2026-11-27') }], reject: false },
      { desc: 'kapasitas 1 dengan reservasi 1 peserta',           cap: 1,  reservations: [{ Id: 10, PartySize: 1,  Status: 'UPCOMING', Date: new Date('2026-11-27') }], reject: false },
    ])('$desc (kapasitas=$cap) -> ditolak=$reject', async ({ cap, reservations, reject }) => {
      mockFacilityFindUnique.mockResolvedValue(buildFacilityDetails(1, cap));
      mockReservationFindMany.mockImplementation((args: any) => {
        const statuses: string[] = args?.where?.Status?.in || [];
        const minDate: Date | undefined = args?.where?.Date?.gte;
        return Promise.resolve(
          reservations.filter((r: any) => {
            const statusOk = statuses.length === 0 || statuses.includes(r.Status);
            const dateOk = !minDate || r.Date >= minDate;
            return statusOk && dateOk;
          })
        );
      });
      mockFacilityUpdate.mockResolvedValue({ Id: 1, Capacity: cap });

      if (reject) {
        await expect(facilityService.update(1, { Capacity: cap })).rejects.toThrow('CAPACITY_CONFLICT');
        expect(mockFacilityUpdate).not.toHaveBeenCalled();
      } else {
        const updated = await facilityService.update(1, { Capacity: cap });
        expect(updated.Capacity).toBe(cap);
        expect(mockFacilityUpdate).toHaveBeenCalledTimes(1);
      }
    });

    test('update field non-kapasitas (hanya Name) tetap berhasil meski ada reservasi aktif', async () => {
      mockFacilityFindUnique.mockResolvedValue(buildFacilityDetails(1, 30));
      mockFacilityUpdate.mockResolvedValue({ Id: 1, Name: 'Lab Komputer Baru' });

      const updated = await facilityService.update(1, { Name: 'Lab Komputer Baru' });
      expect(updated.Id).toBe(1);
      expect(mockReservationFindMany).not.toHaveBeenCalled();
    });
  });

  // ---------------------------------------------------------------------------
  // GROUP 2: reservasi non-aktif / tanggal lampau diabaikan
  // ---------------------------------------------------------------------------
  describe('Skenario reservasi non-aktif (COMPLETED/CANCELLED/EARLY_ENDED) & tanggal lampau diabaikan', () => {
    test.each([
      { desc: 'COMPLETED diabaikan',                   cap: 10, reservations: [{ Id: 1, PartySize: 30, Status: 'COMPLETED',  Date: new Date('2026-11-27') }], reject: false },
      { desc: 'CANCELLED diabaikan',                   cap: 10, reservations: [{ Id: 2, PartySize: 30, Status: 'CANCELLED',  Date: new Date('2026-11-27') }], reject: false },
      { desc: 'EARLY_ENDED diabaikan',                 cap: 10, reservations: [{ Id: 3, PartySize: 30, Status: 'EARLY_ENDED', Date: new Date('2026-11-27') }], reject: false },
      { desc: 'UPCOMING tanggal lampau (kemarin)',      cap: 10, reservations: [{ Id: 4, PartySize: 30, Status: 'UPCOMING',  Date: new Date('2026-11-26') }], reject: false },
      { desc: 'ACTIVE tanggal lampau (2 hari lalu)',    cap: 10, reservations: [{ Id: 5, PartySize: 30, Status: 'ACTIVE',    Date: new Date('2026-11-25') }], reject: false },
      { desc: 'campuran COMPLETED(35) + UPCOMING(12), kapasitas 15 diizinkan', cap: 15, reservations: [
        { Id: 6, PartySize: 35, Status: 'COMPLETED', Date: new Date('2026-11-27') },
        { Id: 7, PartySize: 12, Status: 'UPCOMING',  Date: new Date('2026-11-28') },
      ], reject: false },
      { desc: 'campuran CANCELLED(40) + ACTIVE(20), kapasitas 18 ditolak', cap: 18, reservations: [
        { Id: 8, PartySize: 40, Status: 'CANCELLED', Date: new Date('2026-11-27') },
        { Id: 9, PartySize: 20, Status: 'ACTIVE',    Date: new Date('2026-11-27') },
      ], reject: true },
      { desc: 'campuran EARLY_ENDED(50) + UPCOMING lampau(45) + UPCOMING besok(8), kapasitas 10', cap: 10, reservations: [
        { Id: 10, PartySize: 50, Status: 'EARLY_ENDED', Date: new Date('2026-11-27') },
        { Id: 11, PartySize: 45, Status: 'UPCOMING',    Date: new Date('2026-11-20') },
        { Id: 12, PartySize: 8,  Status: 'UPCOMING',    Date: new Date('2026-11-28') },
      ], reject: false },
    ])('$desc (kapasitas=$cap) -> ditolak=$reject', async ({ cap, reservations, reject }) => {
      mockFacilityFindUnique.mockResolvedValue(buildFacilityDetails(1, cap));
      mockReservationFindMany.mockImplementation((args: any) => {
        const statuses: string[] = args?.where?.Status?.in || [];
        const minDate: Date | undefined = args?.where?.Date?.gte;
        return Promise.resolve(
          reservations.filter((r: any) => {
            const statusOk = statuses.length === 0 || statuses.includes(r.Status);
            const dateOk = !minDate || r.Date >= minDate;
            return statusOk && dateOk;
          })
        );
      });
      mockFacilityUpdate.mockResolvedValue({ Id: 1, Capacity: cap });

      if (reject) {
        await expect(facilityService.update(1, { Capacity: cap })).rejects.toThrow('CAPACITY_CONFLICT');
      } else {
        const updated = await facilityService.update(1, { Capacity: cap });
        expect(updated.Capacity).toBe(cap);
      }
    });
  });

  // ---------------------------------------------------------------------------
  // GROUP 3: banyak reservasi aktif sekaligus
  // ---------------------------------------------------------------------------
  describe('Skenario banyak reservasi aktif sekaligus', () => {
    test.each([
      { sizes: [5, 12, 25],     cap: 24, reject: true  },
      { sizes: [5, 12, 25],     cap: 25, reject: false },
      { sizes: [5, 12, 25],     cap: 26, reject: false },
      { sizes: [10, 10, 10],    cap: 9,  reject: true  },
      { sizes: [30, 15, 20],    cap: 20, reject: true  },
      { sizes: [8, 12, 16, 20], cap: 20, reject: false },
    ])('peserta aktif $sizes dengan kapasitas baru $cap -> ditolak=$reject', async ({ sizes, cap, reject }) => {
      const reservations = sizes.map((size: number, idx: number) => ({
        Id: idx + 1,
        PartySize: size,
        Status: 'UPCOMING',
        Date: new Date('2026-11-28'),
      }));

      mockFacilityFindUnique.mockResolvedValue(buildFacilityDetails(1, cap));
      mockReservationFindMany.mockResolvedValue(reservations);
      mockFacilityUpdate.mockResolvedValue({ Id: 1, Capacity: cap });

      if (reject) {
        await expect(facilityService.update(1, { Capacity: cap })).rejects.toThrow('CAPACITY_CONFLICT');
      } else {
        const updated = await facilityService.update(1, { Capacity: cap });
        expect(updated.Capacity).toBe(cap);
      }
    });
  });

  // ---------------------------------------------------------------------------
  // GROUP 4: validasi input & respon HTTP (controller layer)
  // ---------------------------------------------------------------------------
  describe('Validasi input & respon HTTP FacilityController.update', () => {
    test.each([
      { desc: 'kapasitas nol',      val: 0    },
      { desc: 'kapasitas negatif',   val: -5   },
      { desc: 'kapasitas desimal',   val: 10.5 },
      { desc: 'kapasitas non-angka', val: 'abc' as any },
    ])('menolak $desc ($val) dengan status 400', async ({ val }) => {
      const req: any = { params: { Id: '1' }, body: { Capacity: val } };
      const res = createMockRes();

      await facilityController.update(req, res);

      expect(res.statusCode).toBe(400);
      expect(mockFacilityUpdate).not.toHaveBeenCalled();
    });

    test('controller mengembalikan 409 dengan pesan jelas saat CAPACITY_CONFLICT', async () => {
      mockFacilityFindUnique.mockResolvedValue(buildFacilityDetails(1, 30));
      mockReservationFindMany.mockResolvedValue([
        { Id: 1, PartySize: 25, Status: 'UPCOMING', Date: new Date('2026-11-28') },
      ]);

      const req: any = { params: { Id: '1' }, body: { Capacity: 15 } };
      const res = createMockRes();

      await facilityController.update(req, res);

      expect(res.statusCode).toBe(409);
      expect(res.body.Message).toContain('25');
      expect(res.body.Message).toContain('15');
    });

    test('controller mengembalikan 404 saat fasilitas tidak ditemukan', async () => {
      mockFacilityFindUnique.mockResolvedValue(null);

      const req: any = { params: { Id: '999' }, body: { Capacity: 15 } };
      const res = createMockRes();

      await facilityController.update(req, res);

      expect(res.statusCode).toBe(404);
    });

    test('controller mengembalikan 200 saat update kapasitas berhasil', async () => {
      mockFacilityFindUnique.mockResolvedValue(buildFacilityDetails(1, 20));
      mockReservationFindMany.mockResolvedValue([
        { Id: 1, PartySize: 10, Status: 'UPCOMING', Date: new Date('2026-11-28') },
      ]);
      mockFacilityUpdate.mockResolvedValue({ Id: 1, Capacity: 20 });

      const req: any = { params: { Id: '1' }, body: { Capacity: 20 } };
      const res = createMockRes();

      await facilityController.update(req, res);

      expect(res.statusCode).toBe(200);
      expect(res.body.Data.Capacity).toBe(20);
    });
  });
});
