export type ReservationStatus = 'CONFIRMED' | 'CANCELLED' | 'COMPLETED';

export type ReservationRecord = {
  id: string;
  userId: string;
  roomId: number;
  startsAt: string;
  endsAt: string;
  actualEndedAt: string | null;
  people: number;
  status: ReservationStatus;
  createdAt: string;
};

export type NewReservation = Pick<ReservationRecord, 'userId' | 'roomId' | 'startsAt' | 'endsAt' | 'people'>;

export interface ReservationRepository {
  listAll(): Promise<ReservationRecord[]>;
  listMine(userId: string): Promise<ReservationRecord[]>;
  create(input: NewReservation): Promise<ReservationRecord>;
}

export class ReservationConflictError extends Error {
  constructor() {
    super('Slot ruang ini baru saja dipesan. Cari waktu lain.');
    this.name = 'ReservationConflictError';
  }
}

let reservations: ReservationRecord[] = [];
let nextId = 1;

function delay() {
  return new Promise<void>((resolve) => setTimeout(resolve, 120));
}

function overlaps(existing: ReservationRecord, requested: NewReservation) {
  if (existing.status !== 'CONFIRMED' || existing.roomId !== requested.roomId) return false;
  const existingStart = Date.parse(existing.startsAt);
  const existingEnd = Date.parse(existing.actualEndedAt ?? existing.endsAt);
  const requestedStart = Date.parse(requested.startsAt);
  const requestedEnd = Date.parse(requested.endsAt);
  return existingStart < requestedEnd && existingEnd > requestedStart;
}

export const localReservationRepository: ReservationRepository = {
  async listAll() {
    await delay();
    return [...reservations];
  },
  async listMine(userId) {
    await delay();
    return reservations.filter((item) => item.userId === userId).sort((a, b) => a.startsAt.localeCompare(b.startsAt));
  },
  async create(input) {
    await delay();
    if (reservations.some((item) => overlaps(item, input))) throw new ReservationConflictError();
    const record: ReservationRecord = {
      ...input,
      id: `local-${nextId++}`,
      actualEndedAt: null,
      status: 'CONFIRMED',
      createdAt: new Date().toISOString(),
    };
    reservations = [record, ...reservations];
    return record;
  },
};

export function resetLocalReservations() {
  reservations = [];
  nextId = 1;
}
