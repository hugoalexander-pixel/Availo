import { usePrototypeStore } from '../../state/PrototypeStore';

export interface ProfileRepository {
  updateProfile: (profile: { name: string; photoUri?: string | null }) => void;
  getProfile: () => { name: string; email: string; photoUri: string | null } | null;
}

export const useProfileRepository = () => {
  const store = usePrototypeStore();

  const getProfile = () => {
    return store.userProfile;
  };

  const updateProfile = (data: { name: string; photoUri?: string | null }) => {
    store.updateProfile(data);
  };

  const signOut = () => {
    store.signOut();
  };

  return {
    getProfile,
    updateProfile,
    signOut,
  };
};

