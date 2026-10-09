import { ReservationRecord } from '../data/reservationRepository';

export type BookingState = {
  submitStatus: 'idle' | 'submitting' | 'success' | 'error';
  historyStatus: 'idle' | 'loading' | 'success' | 'error';
  error: string | null;
  reservations: ReservationRecord[];
};

export type BookingAction =
  | { type: 'submitStarted' }
  | { type: 'submitSucceeded'; reservation: ReservationRecord }
  | { type: 'submitFailed'; message: string }
  | { type: 'historyLoading' }
  | { type: 'historyLoaded'; reservations: ReservationRecord[] }
  | { type: 'historyFailed' }
  | { type: 'reset' };

export const initialBookingState: BookingState = { submitStatus: 'idle', historyStatus: 'idle', error: null, reservations: [] };

export function bookingReducer(state: BookingState, action: BookingAction): BookingState {
  switch (action.type) {
    case 'submitStarted':
      return { ...state, submitStatus: 'submitting', error: null };
    case 'submitSucceeded':
      return { ...state, submitStatus: 'success', error: null, reservations: [action.reservation, ...state.reservations] };
    case 'submitFailed':
      return { ...state, submitStatus: 'error', error: action.message };
    case 'historyLoading':
      return { ...state, historyStatus: 'loading', reservations: [] };
    case 'historyLoaded':
      return {
        ...state,
        historyStatus: 'success',
        reservations: [...state.reservations, ...action.reservations.filter((item) => !state.reservations.some((existing) => existing.id === item.id))],
      };
    case 'historyFailed':
      return { ...state, historyStatus: 'error' };
    case 'reset':
      return { ...state, submitStatus: 'idle', error: null };
  }
}
