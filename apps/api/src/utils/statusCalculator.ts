import { Reservation, ReservationStatus } from '@prisma/client';

export type FacilityStatus = 'TERSEDIA' | 'AKAN_TERSEDIA' | 'SEDANG_DIGUNAKAN';

export function calculateFacilityStatus(
  reservations: Reservation[],
  now: Date = new Date()
): FacilityStatus {
  const activeReservations = reservations.filter(
    (r) => r.Status === ReservationStatus.ACTIVE ||
      (r.Status === ReservationStatus.UPCOMING && r.StartTime <= now && r.EndTime > now)
  );

  if (activeReservations.length > 0) {
    const soonestEnd = activeReservations.reduce((min, r) =>
      r.EndTime < min ? r.EndTime : min, activeReservations[0].EndTime
    );

    const thirtyMinutes = 30 * 60 * 1000;
    const timeUntilEnd = soonestEnd.getTime() - now.getTime();

    if (timeUntilEnd <= thirtyMinutes && timeUntilEnd > 0) {
      return 'AKAN_TERSEDIA';
    }
    return 'SEDANG_DIGUNAKAN';
  }

  const upcomingSoon = reservations.filter(
    (r) => r.Status === ReservationStatus.UPCOMING && r.StartTime > now
  );

  if (upcomingSoon.length > 0) {
    const soonestStart = upcomingSoon.reduce((min, r) =>
      r.StartTime < min ? r.StartTime : min, upcomingSoon[0].StartTime
    );
    const thirtyMinutes = 30 * 60 * 1000;
    const timeUntilStart = soonestStart.getTime() - now.getTime();

    if (timeUntilStart <= thirtyMinutes) {
      return 'AKAN_TERSEDIA';
    }
  }

  return 'TERSEDIA';
}
