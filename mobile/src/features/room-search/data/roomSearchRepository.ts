import { rooms, Room } from '../../rooms/data';
import { localReservationRepository, ReservationRecord } from '../../bookings/data/reservationRepository';

export type RoomSearchCriteria = {
  date: string;
  startTime: string;
  endTime: string;
  people: number;
  type: 'Semua' | Room['type'];
};

export interface RoomSearchRepository {
  search(criteria: RoomSearchCriteria): Promise<Room[]>;
}

function isAvailable(roomId: number, start: number, end: number, reservations: ReservationRecord[]) {
  return !reservations.some((reservation) => {
    if (reservation.roomId !== roomId || reservation.status !== 'CONFIRMED') return false;
    const existingStart = Date.parse(reservation.startsAt);
    const existingEnd = Date.parse(reservation.actualEndedAt ?? reservation.endsAt);
    return existingStart < end && existingEnd > start;
  });
}

export const localRoomSearchRepository: RoomSearchRepository = {
  async search(criteria) {
    await new Promise<void>((resolve) => setTimeout(resolve, 120));
    const start = Date.parse(`${criteria.date}T${criteria.startTime}:00`);
    const end = Date.parse(`${criteria.date}T${criteria.endTime}:00`);
    if (!Number.isFinite(start) || !Number.isFinite(end) || end <= start) return [];

    const reservations = await localReservationRepository.listAll();
    return rooms.filter((room) => room.capacity >= criteria.people && (criteria.type === 'Semua' || room.type === criteria.type)
      && isAvailable(room.id, start, end, reservations));
  },
};
