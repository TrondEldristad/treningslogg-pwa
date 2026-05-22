import { createContext, useContext, useState, type ReactNode } from 'react';

export type UserName = 'Marisol' | 'Therese' | 'Trond';

const STORAGE_KEY = 'workout_active_profile';

interface ProfileContextValue {
  activeProfile: UserName | null;
  setActiveProfile: (name: UserName | null) => void;
}

const ProfileContext = createContext<ProfileContextValue | null>(null);

export function ProfileProvider({ children }: { children: ReactNode }) {
  const [activeProfile, setActiveProfileState] = useState<UserName | null>(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored === 'Marisol' || stored === 'Therese' || stored === 'Trond' ? stored : null;
  });

  const setActiveProfile = (name: UserName | null) => {
    setActiveProfileState(name);
    if (name) localStorage.setItem(STORAGE_KEY, name);
    else localStorage.removeItem(STORAGE_KEY);
  };

  return (
    <ProfileContext.Provider value={{ activeProfile, setActiveProfile }}>
      {children}
    </ProfileContext.Provider>
  );
}

export function useProfile() {
  const ctx = useContext(ProfileContext);
  if (!ctx) throw new Error('useProfile must be used inside ProfileProvider');
  return ctx;
}
