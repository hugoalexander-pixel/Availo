import { act, fireEvent, render, waitFor } from '@testing-library/react-native';
import { ReactNode } from 'react';
import { Text } from 'react-native';
import { describe, expect, it, jest } from '@jest/globals';
import { Room, rooms } from '../src/features/rooms/data';
import { RoomSearchCriteria, RoomSearchRepository } from '../src/features/room-search/data/roomSearchRepository';
import { RoomSearchStateView } from '../src/features/room-search/components/RoomSearchStateView';
import { RoomSearchProvider, useRoomSearch } from '../src/features/room-search/state/RoomSearchProvider';
import { BookingForm } from '../src/features/bookings/components/BookingForm';
import { NewReservation, ReservationRecord, ReservationRepository } from '../src/features/bookings/data/reservationRepository';
import { BookingProvider } from '../src/features/bookings/state/BookingProvider';
import { PrototypeStoreProvider } from '../src/state/PrototypeStore';

function SearchStateProbe({ onRetry }: { onRetry?: () => void }) {
  const { state, retry } = useRoomSearch();
  return (
    <RoomSearchStateView status={state.status} error={state.error} onRetry={() => { onRetry?.(); void retry(); }}>
      {state.rooms.map((room) => <RoomName key={room.id} room={room} />)}
    </RoomSearchStateView>
  );
}

function RoomName({ room }: { room: Room }) {
  return <Text>{room.name}</Text>;
}

function deferred<T>() {
  let resolve!: (value: T) => void;
  let reject!: (reason?: unknown) => void;
  const promise = new Promise<T>((res, rej) => { resolve = res; reject = rej; });
  return { promise, resolve, reject };
}

function localDate() {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
}

function futureBookingValues() {
  const start = new Date();
  start.setSeconds(0, 0);
  start.setMinutes(start.getMinutes() + 60);
  const end = new Date(start.getTime() + 60 * 60 * 1000);
  const formatDate = (date: Date) => `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
  const formatTime = (date: Date) => `${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`;
  return { date: formatDate(start), startTime: formatTime(start), endTime: formatTime(end), people: '4' };
}

function bookingRecord(room: Room): ReservationRecord {
  return {
    id: 'test-1',
    userId: 'mahasiswa@student.pradita.ac.id',
    roomId: room.id,
    startsAt: `${localDate()}T10:00:00.000Z`,
    endsAt: `${localDate()}T12:00:00.000Z`,
    actualEndedAt: null,
    people: 4,
    status: 'CONFIRMED',
    createdAt: new Date().toISOString(),
  };
}

const emptyReservationRepository: ReservationRepository = {
  listAll: jest.fn(async () => [] as ReservationRecord[]),
  listMine: jest.fn(async (_userId: string) => [] as ReservationRecord[]),
  create: jest.fn(async (_input: NewReservation): Promise<ReservationRecord> => bookingRecord(rooms[0])),
};

function BookingTestWrapper({ children, repository = emptyReservationRepository }: { children: ReactNode; repository?: ReservationRepository }) {
  return (
    <PrototypeStoreProvider>
      <BookingProvider repository={repository}>{children}</BookingProvider>
    </PrototypeStoreProvider>
  );
}

describe('room search state management', () => {
  it('shows initial loading then loaded room data', async () => {
    const request = deferred<Room[]>();
    const repository: RoomSearchRepository = { search: jest.fn(async (_criteria: RoomSearchCriteria) => request.promise) };
    const view = await render(<RoomSearchProvider repository={repository}><SearchStateProbe /></RoomSearchProvider>);

    expect(view.getByText('Memuat daftar ruang...')).toBeTruthy();
    await act(async () => {
      request.resolve([rooms[0]]);
      await request.promise;
    });
    expect(await view.findByText(rooms[0].name)).toBeTruthy();
  });

  it('shows the empty state when no room matches', async () => {
    const request = deferred<Room[]>();
    const repository: RoomSearchRepository = { search: jest.fn(async (_criteria: RoomSearchCriteria) => request.promise) };
    const view = await render(<RoomSearchProvider repository={repository}><SearchStateProbe /></RoomSearchProvider>);
    await act(async () => {
      request.resolve([]);
      await request.promise;
    });
    expect(await view.findByText('Ruang tidak ditemukan')).toBeTruthy();
  });

  it('shows an error and retries the repository request', async () => {
    const onRetry = jest.fn();
    const retryRequest = deferred<Room[]>();
    const search = jest.fn(async (_criteria: RoomSearchCriteria): Promise<Room[]> => retryRequest.promise);
    search.mockRejectedValueOnce(new Error('Server tidak terhubung'));
    const repository: RoomSearchRepository = { search };
    const view = await render(<RoomSearchProvider repository={repository}><SearchStateProbe onRetry={onRetry} /></RoomSearchProvider>);

    expect(await view.findByText('Pencarian gagal')).toBeTruthy();
    expect(view.getByText('Server tidak terhubung')).toBeTruthy();
    await act(async () => {
      fireEvent.press(view.getByRole('button', { name: 'Coba lagi' }));
    });
    await act(async () => {
      retryRequest.resolve([rooms[1]]);
      await retryRequest.promise;
    });
    expect(await view.findByText(rooms[1].name)).toBeTruthy();
    expect(onRetry).toHaveBeenCalledTimes(1);
    expect(repository.search).toHaveBeenCalledTimes(2);
  });
});

describe('booking form state management', () => {
  const room = rooms[0];
  const validValues = futureBookingValues();

  it('shows inline validation errors and does not submit invalid values', async () => {
    const create = jest.fn(async (_input: NewReservation): Promise<ReservationRecord> => bookingRecord(room));
    const repository: ReservationRepository = {
      ...emptyReservationRepository,
      create,
    };
    const view = await render(
      <BookingTestWrapper repository={repository}>
        <BookingForm room={room} userId="mahasiswa@student.pradita.ac.id" initialValues={{ date: '', startTime: '13:00', endTime: '12:00', people: '20' }} onSuccess={jest.fn()} />
      </BookingTestWrapper>,
    );

    fireEvent.press(view.getByRole('button', { name: 'Konfirmasi booking' }));
    expect(await view.findByText('Tanggal wajib diisi dengan format YYYY-MM-DD.')).toBeTruthy();
    expect(view.getByText('Jam selesai harus setelah jam mulai.')).toBeTruthy();
    expect(view.getByText(`Maksimal ${room.capacity} orang untuk ruang ini.`)).toBeTruthy();
    expect(create).not.toHaveBeenCalled();
  });

  it('shows submit loading, blocks double tap, and confirms success', async () => {
    const request = deferred<ReservationRecord>();
    const create = jest.fn(async (_input: NewReservation): Promise<ReservationRecord> => request.promise);
    const repository: ReservationRepository = {
      ...emptyReservationRepository,
      create,
    };
    const onSuccess = jest.fn();
    const view = await render(
      <BookingTestWrapper repository={repository}>
        <BookingForm room={room} userId="mahasiswa@student.pradita.ac.id" initialValues={validValues} onSuccess={onSuccess} />
      </BookingTestWrapper>,
    );

    fireEvent.press(view.getByRole('button', { name: 'Konfirmasi booking' }));
    await waitFor(() => expect(view.getByText('Menyimpan reservasi...')).toBeTruthy());
    expect(view.getByRole('button', { name: 'Konfirmasi booking' }).props.accessibilityState.disabled).toBe(true);
    fireEvent.press(view.getByRole('button', { name: 'Konfirmasi booking' }));
    expect(create).toHaveBeenCalledTimes(1);

    await act(async () => {
      request.resolve(bookingRecord(room));
      await request.promise;
    });
    await waitFor(() => expect(onSuccess).toHaveBeenCalledTimes(1));
  });

  it('shows repository submission errors and allows another attempt', async () => {
    const create = jest.fn(async (_input: NewReservation): Promise<ReservationRecord> => { throw new Error('Slot ruang ini baru saja dipesan. Cari waktu lain.'); });
    const repository: ReservationRepository = {
      ...emptyReservationRepository,
      create,
    };
    const view = await render(
      <BookingTestWrapper repository={repository}>
        <BookingForm room={room} userId="mahasiswa@student.pradita.ac.id" initialValues={validValues} onSuccess={jest.fn()} />
      </BookingTestWrapper>,
    );

    await act(async () => {
      fireEvent.press(view.getByRole('button', { name: 'Konfirmasi booking' }));
      await Promise.resolve();
    });
    expect(await view.findByText('Slot ruang ini baru saja dipesan. Cari waktu lain.')).toBeTruthy();
    expect(view.getByRole('button', { name: 'Konfirmasi booking' }).props.accessibilityState.disabled).toBe(false);
  });
});
