import { createContext, PropsWithChildren, useContext, useMemo, useState } from 'react';

type PrototypeStoreValue = {
  isAuthenticated: boolean;
  isDark: boolean;
  userProfile: { name: string; email: string; photoUri: string | null } | null;
  savedRoomIds: number[];
  signIn: (email: string) => void;
  signUp: (name: string, email: string) => void;
  signOut: () => void;
  toggleTheme: () => void;
  updateProfile: (profile: Partial<{ name: string; photoUri: string | null }>) => void;
  toggleSaved: (id: number) => void;
};

const PrototypeStore = createContext<PrototypeStoreValue | null>(null);

export function PrototypeStoreProvider({ children }: PropsWithChildren) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isDark, setIsDark] = useState(false);
  const [userProfile, setUserProfile] = useState<PrototypeStoreValue['userProfile']>(null);
  const [savedRoomIds, setSavedRoomIds] = useState<number[]>([]);

  const getDisplayName = (email: string) => email.split('@')[0]
    .replace(/[._-]+/g, ' ')
    .replace(/\b\w/g, (letter) => letter.toUpperCase());

  const value = useMemo(() => ({
    isAuthenticated,
    isDark,
    userProfile,
    savedRoomIds,
    signIn: (email: string) => {
      setUserProfile((current) => current?.email === email
        ? current
        : { name: getDisplayName(email), email, photoUri: null });
      setIsAuthenticated(true);
    },
    signUp: (name: string, email: string) => {
      setUserProfile({ name, email, photoUri: null });
      setIsAuthenticated(true);
    },
    signOut: () => setIsAuthenticated(false),
    toggleTheme: () => setIsDark((current) => !current),
    updateProfile: (profile: Partial<{ name: string; photoUri: string | null }>) => {
      setUserProfile((current) => current ? { ...current, ...profile } : current);
    },
    toggleSaved: (id: number) => setSavedRoomIds((current) => current.includes(id) ? current.filter((item) => item !== id) : [...current, id]),
  }), [isAuthenticated, isDark, userProfile, savedRoomIds]);

  return <PrototypeStore.Provider value={value}>{children}</PrototypeStore.Provider>;
}

export function usePrototypeStore() {
  const store = useContext(PrototypeStore);
  if (!store) throw new Error('PrototypeStoreProvider belum dipasang.');
  return store;
}
