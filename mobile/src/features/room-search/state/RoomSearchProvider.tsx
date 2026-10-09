import { createContext, PropsWithChildren, useCallback, useContext, useEffect, useMemo, useReducer, useRef } from 'react';
import { RoomSearchCriteria, RoomSearchRepository, localRoomSearchRepository } from '../data/roomSearchRepository';
import { createInitialRoomSearchState, createInitialSearchCriteria, roomSearchReducer } from './roomSearchReducer';

type RoomSearchContextValue = {
  state: ReturnType<typeof roomSearchReducer>;
  search: (criteria?: RoomSearchCriteria) => Promise<void>;
  updateCriteria: (criteria: RoomSearchCriteria) => void;
  retry: () => Promise<void>;
};

const RoomSearchContext = createContext<RoomSearchContextValue | null>(null);

export function RoomSearchProvider({ children, repository = localRoomSearchRepository }: PropsWithChildren<{ repository?: RoomSearchRepository }>) {
  const [state, dispatch] = useReducer(roomSearchReducer, undefined, () => createInitialRoomSearchState());
  const criteriaRef = useRef<RoomSearchCriteria | null>(null);
  const sequence = useRef(0);

  const search = useCallback(async (nextCriteria?: RoomSearchCriteria) => {
    const criteria = nextCriteria ?? criteriaRef.current ?? createInitialSearchCriteria();
    criteriaRef.current = criteria;
    const requestId = ++sequence.current;
    dispatch({ type: 'searchStarted', criteria, requestId });
    try {
      const results = await repository.search(criteria);
      dispatch({ type: 'searchSucceeded', rooms: results, requestId });
    } catch (error) {
      dispatch({
        type: 'searchFailed',
        message: error instanceof Error ? error.message : 'Pencarian ruang gagal. Coba lagi.',
        requestId,
      });
    }
  }, [repository]);

  const updateCriteria = useCallback((criteria: RoomSearchCriteria) => {
    criteriaRef.current = criteria;
    dispatch({ type: 'criteriaChanged', criteria });
  }, []);

  useEffect(() => {
    void search(createInitialSearchCriteria());
  }, [search]);

  const value = useMemo(() => ({ state, search, updateCriteria, retry: () => search() }), [state, search, updateCriteria]);
  return <RoomSearchContext.Provider value={value}>{children}</RoomSearchContext.Provider>;
}

export function useRoomSearch() {
  const context = useContext(RoomSearchContext);
  if (!context) throw new Error('RoomSearchProvider belum dipasang.');
  return context;
}
