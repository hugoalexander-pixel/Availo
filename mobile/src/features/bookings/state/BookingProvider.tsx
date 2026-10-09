import { createContext, PropsWithChildren, useCallback, useContext, useEffect, useMemo, useReducer, useRef } from 'react';
import { NewReservation, ReservationRepository, localReservationRepository } from '../data/reservationRepository';
import { bookingReducer, initialBookingState } from './bookingReducer';
import { usePrototypeStore } from '../../../state/PrototypeStore';

type BookingContextValue = {
  state: ReturnType<typeof bookingReducer>;
  submit: (reservation: NewReservation) => Promise<boolean>;
  reset: () => void;
  refreshHistory: () => Promise<void>;
};

const BookingContext = createContext<BookingContextValue | null>(null);

export function BookingProvider({ children, repository = localReservationRepository }: PropsWithChildren<{ repository?: ReservationRepository }>) {
  const [state, dispatch] = useReducer(bookingReducer, initialBookingState);
  const inFlight = useRef(false);
  const { userProfile } = usePrototypeStore();
  const userEmail = userProfile?.email;

  const refreshHistory = useCallback(async () => {
    dispatch({ type: 'historyLoading' });
    if (!userEmail) {
      dispatch({ type: 'historyLoaded', reservations: [] });
      return;
    }
    try {
      dispatch({ type: 'historyLoaded', reservations: await repository.listMine(userEmail) });
    } catch {
      dispatch({ type: 'historyFailed' });
    }
  }, [repository, userEmail]);

  useEffect(() => {
    void refreshHistory();
  }, [refreshHistory]);

  const submit = useCallback(async (reservation: NewReservation) => {
    if (inFlight.current) return false;
    inFlight.current = true;
    dispatch({ type: 'submitStarted' });
    try {
      const created = await repository.create(reservation);
      dispatch({ type: 'submitSucceeded', reservation: created });
      return true;
    } catch (error) {
      dispatch({ type: 'submitFailed', message: error instanceof Error ? error.message : 'Reservasi gagal disimpan. Coba lagi.' });
      return false;
    } finally {
      inFlight.current = false;
    }
  }, [repository]);

  const reset = useCallback(() => dispatch({ type: 'reset' }), []);
  const value = useMemo(() => ({ state, submit, reset, refreshHistory }), [state, submit, reset, refreshHistory]);
  return <BookingContext.Provider value={value}>{children}</BookingContext.Provider>;
}

export function useBooking() {
  const context = useContext(BookingContext);
  if (!context) throw new Error('BookingProvider belum dipasang.');
  return context;
}
