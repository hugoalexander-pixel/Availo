/**
 * Test US-5: Status Ketersediaan Fasilitas Real-Time
 * Menguji calculateFacilityStatus — logika murni tanpa database.
 * Fungsi ini menentukan apakah fasilitas TERSEDIA, AKAN_TERSEDIA, atau SEDANG_DIGUNAKAN.
 */

import { calculateFacilityStatus } from '../src/utils/statusCalculator';
import { ReservationStatus } from '@prisma/client';

function createReservation(overrides: Partial<any> = {}): any {
  return {
    Id: 1,
    UserId: 1,
    FacilityId: 1,
    Date: new Date(),
    StartTime: new Date(),
    EndTime: new Date(),
    ActualEndTime: null,
    PartySize: 5,
    Purpose: null,
    Status: ReservationStatus.ACTIVE,
    CreatedAt: new Date(),
    UpdatedAt: new Date(),
    ...overrides,
  };
}

describe('US-5: Status Ketersediaan Fasilitas Real-Time', () => {
  test('status_TERSEDIA_jika_tidak_ada_reservasi', () => {
    const status = calculateFacilityStatus([]);
    expect(status).toBe('TERSEDIA');
  });

  test('status_SEDANG_DIGUNAKAN_jika_ada_reservasi_aktif_lebih_dari_30_menit', () => {
    const now = new Date('2026-10-23T10:00:00');
    const reservation = createReservation({
      Status: ReservationStatus.ACTIVE,
      StartTime: new Date('2026-10-23T09:00:00'),
      EndTime: new Date('2026-10-23T12:00:00'),
    });

    const status = calculateFacilityStatus([reservation], now);
    expect(status).toBe('SEDANG_DIGUNAKAN');
  });

  test('status_AKAN_TERSEDIA_jika_reservasi_aktif_berakhir_dalam_30_menit', () => {
    const now = new Date('2026-10-23T11:40:00');
    const reservation = createReservation({
      Status: ReservationStatus.ACTIVE,
      StartTime: new Date('2026-10-23T09:00:00'),
      EndTime: new Date('2026-10-23T12:00:00'),
    });

    const status = calculateFacilityStatus([reservation], now);
    expect(status).toBe('AKAN_TERSEDIA');
  });

  test('status_TERSEDIA_jika_semua_reservasi_sudah_selesai', () => {
    const now = new Date('2026-10-23T15:00:00');
    const reservation = createReservation({
      Status: ReservationStatus.COMPLETED,
      StartTime: new Date('2026-10-23T09:00:00'),
      EndTime: new Date('2026-10-23T12:00:00'),
    });

    const status = calculateFacilityStatus([reservation], now);
    expect(status).toBe('TERSEDIA');
  });

  test('status_SEDANG_DIGUNAKAN_untuk_reservasi_UPCOMING_yang_waktunya_sudah_mulai', () => {
    const now = new Date('2026-10-23T10:30:00');
    const reservation = createReservation({
      Status: ReservationStatus.UPCOMING,
      StartTime: new Date('2026-10-23T10:00:00'),
      EndTime: new Date('2026-10-23T12:00:00'),
    });

    const status = calculateFacilityStatus([reservation], now);
    expect(status).toBe('SEDANG_DIGUNAKAN');
  });

  test('status_AKAN_TERSEDIA_jika_ada_UPCOMING_dimulai_dalam_30_menit', () => {
    const now = new Date('2026-10-23T09:45:00');
    const reservation = createReservation({
      Status: ReservationStatus.UPCOMING,
      StartTime: new Date('2026-10-23T10:00:00'),
      EndTime: new Date('2026-10-23T12:00:00'),
    });

    const status = calculateFacilityStatus([reservation], now);
    expect(status).toBe('AKAN_TERSEDIA');
  });

  test('status_TERSEDIA_jika_UPCOMING_masih_lebih_dari_30_menit_lagi', () => {
    const now = new Date('2026-10-23T08:00:00');
    const reservation = createReservation({
      Status: ReservationStatus.UPCOMING,
      StartTime: new Date('2026-10-23T10:00:00'),
      EndTime: new Date('2026-10-23T12:00:00'),
    });

    const status = calculateFacilityStatus([reservation], now);
    expect(status).toBe('TERSEDIA');
  });

  test('status_dipilih_dari_reservasi_yang_paling_cepat_berakhir', () => {
    const now = new Date('2026-10-23T10:00:00');
    const reservations = [
      createReservation({
        Id: 1,
        Status: ReservationStatus.ACTIVE,
        StartTime: new Date('2026-10-23T09:00:00'),
        EndTime: new Date('2026-10-23T10:20:00'),
      }),
      createReservation({
        Id: 2,
        Status: ReservationStatus.ACTIVE,
        StartTime: new Date('2026-10-23T09:00:00'),
        EndTime: new Date('2026-10-23T14:00:00'),
      }),
    ];

    const status = calculateFacilityStatus(reservations, now);
    expect(status).toBe('AKAN_TERSEDIA');
  });

  describe('Boundary & Multi-slot Scenarios (Fix #17)', () => {
    test.each([
      ['tepat 30 menit sebelum StartTime', '2026-11-27T09:30:00', '09:30 -> AKAN_TERSEDIA', 'AKAN_TERSEDIA'],
      ['31 menit sebelum StartTime', '2026-11-27T09:29:00', '09:29 -> TERSEDIA', 'TERSEDIA'],
      ['tepat pada StartTime', '2026-11-27T10:00:00', '10:00 -> SEDANG_DIGUNAKAN', 'SEDANG_DIGUNAKAN'],
      ['tepat 30 menit sebelum EndTime', '2026-11-27T11:30:00', '11:30 -> AKAN_TERSEDIA', 'AKAN_TERSEDIA'],
      ['31 menit sebelum EndTime', '2026-11-27T11:29:00', '11:29 -> SEDANG_DIGUNAKAN', 'SEDANG_DIGUNAKAN'],
      ['tepat pada EndTime', '2026-11-27T12:00:00', '12:00 -> TERSEDIA', 'TERSEDIA'],
    ])('%s (%s)', (_label, refIso, _note, expected) => {
      const ref = new Date(refIso);
      const res = createReservation({
        Status: ReservationStatus.UPCOMING,
        StartTime: new Date('2026-11-27T10:00:00'),
        EndTime: new Date('2026-11-27T12:00:00'),
      });
      expect(calculateFacilityStatus([res], ref)).toBe(expected);
    });

    test('ruangan_sebagian_slot_pagi_dan_sore_dicek_siang_menghasilkan_TERSEDIA', () => {
      const ref = new Date('2026-11-27T11:00:00');
      const reservations = [
        createReservation({ Id: 1, Status: ReservationStatus.UPCOMING, StartTime: new Date('2026-11-27T08:00:00'), EndTime: new Date('2026-11-27T10:00:00') }),
        createReservation({ Id: 2, Status: ReservationStatus.UPCOMING, StartTime: new Date('2026-11-27T14:00:00'), EndTime: new Date('2026-11-27T16:00:00') }),
      ];
      expect(calculateFacilityStatus(reservations, ref)).toBe('TERSEDIA');
    });

    test('ruangan_sebagian_jeda_15_menit_antar_slot_menghasilkan_AKAN_TERSEDIA', () => {
      const ref = new Date('2026-11-27T10:00:00');
      const reservations = [
        createReservation({ Id: 1, Status: ReservationStatus.UPCOMING, StartTime: new Date('2026-11-27T08:00:00'), EndTime: new Date('2026-11-27T10:00:00') }),
        createReservation({ Id: 2, Status: ReservationStatus.UPCOMING, StartTime: new Date('2026-11-27T10:15:00'), EndTime: new Date('2026-11-27T12:00:00') }),
      ];
      expect(calculateFacilityStatus(reservations, ref)).toBe('AKAN_TERSEDIA');
    });
  });
});
