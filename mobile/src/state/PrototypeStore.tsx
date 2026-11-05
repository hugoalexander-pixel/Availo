import { createContext, PropsWithChildren, useContext, useMemo, useState } from 'react';

export interface UserProfile {
  name: string;
  nim: string;
  email: string;
  prodi: string;
}

export const DEMO_USER: UserProfile = {
  name: 'Nadia Aulia',
  nim: '2024010192',
  email: 'nadia.aulia@student.nusantara.ac.id',
  prodi: 'Sistem Informasi',
};

type PrototypeStoreValue = {
  // Auth state
  user: UserProfile | null;
  isAuthenticated: boolean;
  login: (email: string, password?: string) => Promise<{ success: boolean; error?: string }>;
  loginDemo: () => void;
  register: (data: UserProfile & { password?: string }) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  updateProfile: (data: Partial<Pick<UserProfile, 'name' | 'nim' | 'prodi'>>) => void;

  // Booking & Saved state
  savedRoomIds: number[];
  bookedRoomIds: number[];
  toggleSaved: (id: number) => void;
  addBooking: (id: number) => void;
  removeBooking: (id: number) => void;
};

const PrototypeStore = createContext<PrototypeStoreValue | null>(null);

export function PrototypeStoreProvider({ children }: PropsWithChildren) {
  // Authentication starts as false so login & signup are mandatory
  const [user, setUser] = useState<UserProfile | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);

  const [savedRoomIds, setSavedRoomIds] = useState<number[]>([1]);
  const [bookedRoomIds, setBookedRoomIds] = useState<number[]>([2]);

  const value = useMemo(
    () => ({
      user,
      isAuthenticated,
      login: async (email: string, _password?: string) => {
        const cleanEmail = email.trim().toLowerCase();
        if (
          cleanEmail === DEMO_USER.email.toLowerCase() ||
          cleanEmail === 'nadia' ||
          cleanEmail.includes('@student.nusantara.ac.id')
        ) {
          const loggedUser: UserProfile = {
            ...DEMO_USER,
            email: cleanEmail.includes('@') ? cleanEmail : DEMO_USER.email,
          };
          setUser(loggedUser);
          setIsAuthenticated(true);
          return { success: true };
        }

        if (cleanEmail.includes('@')) {
          const derivedName = cleanEmail.split('@')[0].replace(/[._-]/g, ' ');
          const formattedName = derivedName
            .split(' ')
            .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
            .join(' ');
          const loggedUser: UserProfile = {
            name: formattedName || 'Mahasiswa Nusantara',
            nim: '2024010888',
            email: cleanEmail,
            prodi: 'Teknik Informatika',
          };
          setUser(loggedUser);
          setIsAuthenticated(true);
          return { success: true };
        }

        return {
          success: false,
          error: 'Email kampus tidak dikenali. Gunakan format @student.nusantara.ac.id',
        };
      },
      loginDemo: () => {
        setUser(DEMO_USER);
        setIsAuthenticated(true);
      },
      register: async (data: UserProfile & { password?: string }) => {
        setUser({
          name: data.name,
          nim: data.nim,
          email: data.email,
          prodi: data.prodi || 'Sistem Informasi',
        });
        setIsAuthenticated(true);
        return { success: true };
      },
      logout: () => {
        setUser(null);
        setIsAuthenticated(false);
      },
      updateProfile: (data: Partial<Pick<UserProfile, 'name' | 'nim' | 'prodi'>>) => {
        setUser((prev) => (prev ? { ...prev, ...data } : null));
      },

      savedRoomIds,
      bookedRoomIds,
      toggleSaved: (id: number) =>
        setSavedRoomIds((current) =>
          current.includes(id) ? current.filter((item) => item !== id) : [...current, id]
        ),
      addBooking: (id: number) =>
        setBookedRoomIds((current) =>
          current.includes(id) ? current : [id, ...current]
        ),
      removeBooking: (id: number) =>
        setBookedRoomIds((current) => current.filter((item) => item !== id)),
    }),
    [user, isAuthenticated, savedRoomIds, bookedRoomIds]
  );

  return <PrototypeStore.Provider value={value}>{children}</PrototypeStore.Provider>;
}

export function usePrototypeStore() {
  const store = useContext(PrototypeStore);
  if (!store) throw new Error('PrototypeStoreProvider belum dipasang.');
  return store;
}
