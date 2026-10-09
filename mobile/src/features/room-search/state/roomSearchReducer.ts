import { Room } from '../../rooms/data';
import { RoomSearchCriteria } from '../data/roomSearchRepository';

export type RoomSearchState = {
  status: 'loading' | 'success' | 'empty' | 'error';
  rooms: Room[];
  criteria: RoomSearchCriteria;
  error: string | null;
  requestId: number;
};

export type RoomSearchAction =
  | { type: 'criteriaChanged'; criteria: RoomSearchCriteria }
  | { type: 'searchStarted'; criteria: RoomSearchCriteria; requestId: number }
  | { type: 'searchSucceeded'; rooms: Room[]; requestId: number }
  | { type: 'searchFailed'; message: string; requestId: number };

export function createInitialSearchCriteria(): RoomSearchCriteria {
  const now = new Date();
  const date = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
  return { date, startTime: '10:00', endTime: '12:00', people: 4, type: 'Semua' };
}

export function createInitialRoomSearchState(criteria = createInitialSearchCriteria()): RoomSearchState {
  return { status: 'loading', rooms: [], criteria, error: null, requestId: 0 };
}

export function roomSearchReducer(state: RoomSearchState, action: RoomSearchAction): RoomSearchState {
  switch (action.type) {
    case 'criteriaChanged':
      return { ...state, criteria: action.criteria };
    case 'searchStarted':
      return { ...state, status: 'loading', rooms: [], error: null, criteria: action.criteria, requestId: action.requestId };
    case 'searchSucceeded':
      if (action.requestId !== state.requestId) return state;
      return { ...state, status: action.rooms.length ? 'success' : 'empty', rooms: action.rooms, error: null };
    case 'searchFailed':
      if (action.requestId !== state.requestId) return state;
      return { ...state, status: 'error', rooms: [], error: action.message };
  }
}
