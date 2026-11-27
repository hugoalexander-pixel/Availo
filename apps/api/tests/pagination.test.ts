/**
 * Regression & Unit Test Fix #18: Pagination pada GET /api/facilities dan GET /api/reservations/my
 */

const mockFacilityFindMany = jest.fn();
const mockFacilityCount = jest.fn();
const mockReservationFindMany = jest.fn();
const mockReservationCount = jest.fn();

jest.mock('../src/utils/prisma', () => ({
  __esModule: true,
  default: {
    facility: {
      findMany: (...args: any[]) => mockFacilityFindMany(...args),
      count: (...args: any[]) => mockFacilityCount(...args),
    },
    reservation: {
      findMany: (...args: any[]) => mockReservationFindMany(...args),
      count: (...args: any[]) => mockReservationCount(...args),
    },
  },
}));

import { parsePaginationParams, buildPaginationMeta, MAX_LIMIT } from '../src/utils/pagination';
import { FacilityService } from '../src/services/facilityService';
import { ReservationService } from '../src/services/reservationService';
import { FacilityController } from '../src/controllers/facilityController';
import { ReservationController } from '../src/controllers/reservationController';

const facilityService = new FacilityService();
const reservationService = new ReservationService();
const facilityController = new FacilityController();
const reservationController = new ReservationController();

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

const sampleFacilityRow = (id: number) => ({
  Id: id,
  Name: `Ruang ${id}`,
  Type: 'RUANG_KELAS',
  Capacity: 30,
  Floor: 1,
  Description: 'Ruang kelas',
  ImageUrl: null,
  Building: { Id: 1, Name: 'Gedung A', Code: 'GD-A' },
  Amenities: [],
  Reservations: [],
});

const sampleReservationRow = (id: number) => ({
  Id: id,
  FacilityId: 1,
  Date: new Date('2027-01-15'),
  StartTime: new Date('2027-01-15T09:00:00'),
  EndTime: new Date('2027-01-15T11:00:00'),
  ActualEndTime: null,
  PartySize: 5,
  Purpose: `Kegiatan ${id}`,
  Status: 'UPCOMING',
  CreatedAt: new Date(),
  Facility: { Name: 'Ruang 1', Building: { Name: 'Gedung A' } },
  User: { Id: 1, Name: 'Budi' },
});

describe('Fix #18: Pagination Helper & Endpoints', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('parsePaginationParams - input valid', () => {
    test.each([
      ['tanpa parameter', undefined, undefined, null],
      ['hanya page=1 (default limit 10)', '1', undefined, { page: 1, limit: 10, skip: 0, take: 10 }],
      ['hanya limit=5 (default page 1)', undefined, '5', { page: 1, limit: 5, skip: 0, take: 5 }],
      ['halaman pertama (page=1, limit=10)', '1', '10', { page: 1, limit: 10, skip: 0, take: 10 }],
      ['halaman tengah (page=3, limit=10)', '3', '10', { page: 3, limit: 10, skip: 20, take: 10 }],
      ['halaman ke-5 dengan limit=20', '5', '20', { page: 5, limit: 20, skip: 80, take: 20 }],
      ['limit besar 500 dibatasi ke MAX_LIMIT', '1', '500', { page: 1, limit: MAX_LIMIT, skip: 0, take: MAX_LIMIT }],
      ['input bertipe number (page=2, limit=15)', 2, 15, { page: 2, limit: 15, skip: 15, take: 15 }],
    ])('%s -> page=%s limit=%s', (_desc, rawPage, rawLimit, expected) => {
      expect(parsePaginationParams(rawPage, rawLimit)).toEqual(expected);
    });
  });

  describe('parsePaginationParams - input tidak valid', () => {
    test.each([
      ['page nol', '0', '10'],
      ['page negatif', '-1', '10'],
      ['page non-angka', 'abc', '10'],
      ['page desimal', '1.5', '10'],
      ['page string kosong', '', '10'],
      ['limit nol', '1', '0'],
      ['limit negatif', '1', '-5'],
      ['limit non-angka', '1', 'xyz'],
      ['limit desimal', '1', '2.5'],
      ['limit string kosong', '1', ''],
    ])('menolak %s (page=%s, limit=%s) dengan INVALID_PAGINATION', (_desc, rawPage, rawLimit) => {
      expect(() => parsePaginationParams(rawPage, rawLimit)).toThrow('INVALID_PAGINATION');
    });
  });

  describe('buildPaginationMeta - kalkulasi metadata', () => {
    test.each([
      ['data kosong', 0, 1, 10, { total: 0, page: 1, limit: 10, totalPages: 0 }],
      ['total kurang dari limit', 5, 1, 10, { total: 5, page: 1, limit: 10, totalPages: 1 }],
      ['halaman pertama dari 3', 25, 1, 10, { total: 25, page: 1, limit: 10, totalPages: 3 }],
      ['halaman tengah dari 3', 25, 2, 10, { total: 25, page: 2, limit: 10, totalPages: 3 }],
      ['halaman terakhir dari 3', 25, 3, 10, { total: 25, page: 3, limit: 10, totalPages: 3 }],
      ['halaman melebihi totalPages', 25, 10, 10, { total: 25, page: 10, limit: 10, totalPages: 3 }],
      ['batas max limit 100', 100, 1, 100, { total: 100, page: 1, limit: 100, totalPages: 1 }],
    ])('%s (total=%i, page=%i, limit=%i)', (_desc, total, page, limit, expected) => {
      expect(buildPaginationMeta(total, page, limit)).toEqual(expected);
    });
  });

  describe('FacilityService.listPaginated & FacilityController.list', () => {
    test('tanpa parameter page dan limit menjaga perilaku lama (tanpa skip/take dan tanpa Pagination)', async () => {
      mockFacilityFindMany.mockResolvedValue([sampleFacilityRow(1), sampleFacilityRow(2)]);
      const req: any = { query: {} };
      const res = createMockRes();

      await facilityController.list(req, res);

      expect(res.statusCode).toBe(200);
      expect(res.body.Data).toHaveLength(2);
      expect(res.body.Total).toBe(2);
      expect(res.body.Pagination).toBeUndefined();
      expect(mockFacilityFindMany.mock.calls[0][0].skip).toBeUndefined();
      expect(mockFacilityFindMany.mock.calls[0][0].take).toBeUndefined();
    });

    test.each([
      ['halaman pertama', 1, 2, 5, 0, 2, 3],
      ['halaman tengah', 2, 2, 5, 2, 2, 3],
      ['halaman terakhir', 3, 2, 5, 4, 2, 3],
      ['halaman melebihi total', 99, 10, 5, 980, 10, 1],
    ])('%s (page=%i, limit=%i, total=%i)', async (_desc, page, limit, total, expectedSkip, expectedTake, expectedTotalPages) => {
      const returnedRows = expectedSkip < total ? [sampleFacilityRow(1)] : [];
      mockFacilityFindMany.mockResolvedValue(returnedRows);
      mockFacilityCount.mockResolvedValue(total);

      const result = await facilityService.listPaginated({ page, limit });

      expect(mockFacilityFindMany.mock.calls[0][0].skip).toBe(expectedSkip);
      expect(mockFacilityFindMany.mock.calls[0][0].take).toBe(expectedTake);
      expect(result.pagination).toEqual({
        total,
        page,
        limit,
        totalPages: expectedTotalPages,
      });
    });

    test('controller mengembalikan 400 jika query page/limit tidak valid', async () => {
      const req: any = { query: { page: '-2', limit: 'abc' } };
      const res = createMockRes();

      await facilityController.list(req, res);

      expect(res.statusCode).toBe(400);
      expect(res.body.Message).toContain('pagination');
    });
  });

  describe('ReservationService.getMyReservationsPaginated & ReservationController.getMyReservations', () => {
    test('tanpa parameter page dan limit menjaga perilaku lama', async () => {
      mockReservationFindMany.mockResolvedValue([sampleReservationRow(1)]);
      const req: any = { query: {}, user: { UserId: 1 } };
      const res = createMockRes();

      await reservationController.getMyReservations(req, res);

      expect(res.statusCode).toBe(200);
      expect(res.body.Data).toHaveLength(1);
      expect(res.body.Pagination).toBeUndefined();
    });

    test.each([
      ['halaman pertama', '1', '5', 12, 0, 5, 3],
      ['halaman tengah dengan status active', '2', '5', 12, 5, 5, 3],
      ['data kosong', '1', '10', 0, 0, 10, 0],
    ])('%s (page=%s, limit=%s, total=%i)', async (_desc, page, limit, total, expectedSkip, expectedTake, expectedTotalPages) => {
      mockReservationFindMany.mockResolvedValue(total > 0 ? [sampleReservationRow(1)] : []);
      mockReservationCount.mockResolvedValue(total);

      const result = await reservationService.getMyReservationsPaginated(1, 'active', page, limit);

      expect(mockReservationFindMany.mock.calls[0][0].skip).toBe(expectedSkip);
      expect(mockReservationFindMany.mock.calls[0][0].take).toBe(expectedTake);
      expect(result.pagination).toEqual({
        total,
        page: Number(page),
        limit: Number(limit),
        totalPages: expectedTotalPages,
      });
    });

    test('controller mengembalikan 400 jika page=0 atau limit=-3', async () => {
      const req: any = { query: { page: '0', limit: '-3' }, user: { UserId: 1 } };
      const res = createMockRes();

      await reservationController.getMyReservations(req, res);

      expect(res.statusCode).toBe(400);
      expect(res.body.Message).toContain('pagination');
    });
  });
});
