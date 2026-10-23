/**
 * Test US-2: Pencarian & Filter Fasilitas
 * Menguji FacilityService — logika filter berdasarkan tipe, kapasitas, dan nama.
 * Prisma di-mock untuk mengisolasi logika bisnis.
 */

const mockFindMany = jest.fn();
const mockFindUnique = jest.fn();

jest.mock('../src/utils/prisma', () => ({
  __esModule: true,
  default: {
    facility: {
      findMany: (...args: any[]) => mockFindMany(...args),
      findUnique: (...args: any[]) => mockFindUnique(...args),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
    facilityAmenity: { createMany: jest.fn() },
  },
}));

import { FacilityService } from '../src/services/facilityService';

const facilityService = new FacilityService();

const sampleFacilities = [
  {
    Id: 1, Name: 'Ruang Diskusi 301', Type: 'RUANG_DISKUSI', Capacity: 8,
    Floor: 3, Description: 'Ruang diskusi kecil', ImageUrl: null, BuildingId: 1,
    Building: { Id: 1, Name: 'Gedung A', Code: 'GD-A' },
    Amenities: [{ Amenity: { Id: 1, Name: 'Whiteboard', Icon: '📝' } }],
    Reservations: [],
  },
  {
    Id: 2, Name: 'Ruang Diskusi 302', Type: 'RUANG_DISKUSI', Capacity: 6,
    Floor: 3, Description: 'Ruang diskusi kecil nyaman', ImageUrl: null, BuildingId: 1,
    Building: { Id: 1, Name: 'Gedung A', Code: 'GD-A' },
    Amenities: [{ Amenity: { Id: 2, Name: 'AC', Icon: '❄️' } }],
    Reservations: [],
  },
  {
    Id: 3, Name: 'Kelas 101', Type: 'RUANG_KELAS', Capacity: 40,
    Floor: 1, Description: 'Ruang kelas besar', ImageUrl: null, BuildingId: 2,
    Building: { Id: 2, Name: 'Gedung B', Code: 'GD-B' },
    Amenities: [{ Amenity: { Id: 3, Name: 'Proyektor', Icon: '📽️' } }],
    Reservations: [],
  },
  {
    Id: 4, Name: 'Lab Komputer 201', Type: 'LABORATORIUM', Capacity: 30,
    Floor: 2, Description: 'Lab komputer', ImageUrl: null, BuildingId: 3,
    Building: { Id: 3, Name: 'Gedung C', Code: 'GD-C' },
    Amenities: [],
    Reservations: [],
  },
];

describe('US-2: Pencarian & Filter Fasilitas', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('filter_tipe_RUANG_DISKUSI_mengembalikan_hanya_ruang_diskusi', async () => {
    const diskusiOnly = sampleFacilities.filter(f => f.Type === 'RUANG_DISKUSI');
    mockFindMany.mockResolvedValue(diskusiOnly);

    const result = await facilityService.list({ type: 'RUANG_DISKUSI' as any });

    expect(result.length).toBe(2);
    result.forEach(f => {
      expect(f.Type).toBe('RUANG_DISKUSI');
    });

    const callArgs = mockFindMany.mock.calls[0][0];
    expect(callArgs.where.Type).toBe('RUANG_DISKUSI');
  });

  test('filter_kapasitas_minimum_500_mengembalikan_array_kosong', async () => {
    mockFindMany.mockResolvedValue([]);

    const result = await facilityService.list({ minCapacity: 500 });

    expect(result).toEqual([]);
    expect(result.length).toBe(0);

    const callArgs = mockFindMany.mock.calls[0][0];
    expect(callArgs.where.Capacity).toEqual({ gte: 500 });
  });

  test('pencarian_nama_diskusi_case_insensitive', async () => {
    const diskusiOnly = sampleFacilities.filter(f =>
      f.Name.toLowerCase().includes('diskusi')
    );
    mockFindMany.mockResolvedValue(diskusiOnly);

    const result = await facilityService.list({ search: 'diskusi' });

    expect(result.length).toBe(2);
    result.forEach(f => {
      expect(f.Name.toLowerCase()).toContain('diskusi');
    });

    const callArgs = mockFindMany.mock.calls[0][0];
    expect(callArgs.where.Name).toEqual({ contains: 'diskusi', mode: 'insensitive' });
  });

  test('filter_gedung_tertentu_mengirim_buildingId_ke_query', async () => {
    mockFindMany.mockResolvedValue([sampleFacilities[0]]);

    const result = await facilityService.list({ buildingId: 1 });

    expect(result.length).toBe(1);
    const callArgs = mockFindMany.mock.calls[0][0];
    expect(callArgs.where.BuildingId).toBe(1);
  });

  test('tanpa_filter_mengembalikan_semua_fasilitas', async () => {
    mockFindMany.mockResolvedValue(sampleFacilities);

    const result = await facilityService.list({});

    expect(result.length).toBe(4);
  });

  test('hasil_mengandung_data_gedung_dan_amenities', async () => {
    mockFindMany.mockResolvedValue([sampleFacilities[0]]);

    const result = await facilityService.list({});

    expect(result[0].Building).toEqual({ Id: 1, Name: 'Gedung A', Code: 'GD-A' });
    expect(result[0].Amenities).toEqual([{ Id: 1, Name: 'Whiteboard', Icon: '📝' }]);
    expect(result[0].Status).toBe('TERSEDIA');
  });
});
