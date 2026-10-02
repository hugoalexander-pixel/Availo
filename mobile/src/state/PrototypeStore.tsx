import { createContext, PropsWithChildren, useContext, useMemo, useState } from 'react';

type PrototypeStoreValue = {
  savedRoomIds: number[];
  bookedRoomIds: number[];
  toggleSaved: (id: number) => void;
  addBooking: (id: number) => void;
};

const PrototypeStore = createContext<PrototypeStoreValue | null>(null);

export function PrototypeStoreProvider({ children }: PropsWithChildren) {
  const [savedRoomIds, setSavedRoomIds] = useState<number[]>([]);
  const [bookedRoomIds, setBookedRoomIds] = useState<number[]>([]);
  const value = useMemo(() => ({
    savedRoomIds,
    bookedRoomIds,
    toggleSaved: (id: number) => setSavedRoomIds((current) => current.includes(id) ? current.filter((item) => item !== id) : [...current, id]),
    addBooking: (id: number) => setBookedRoomIds((current) => current.includes(id) ? current : [...current, id]),
  }), [savedRoomIds, bookedRoomIds]);

  return <PrototypeStore.Provider value={value}>{children}</PrototypeStore.Provider>;
}

export function usePrototypeStore() {
  const store = useContext(PrototypeStore);
  if (!store) throw new Error('PrototypeStoreProvider belum dipasang.');
  return store;
}
