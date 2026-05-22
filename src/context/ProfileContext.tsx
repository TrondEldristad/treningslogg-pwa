import { createContext, useContext, useState, type ReactNode } from 'react';
import { validatePassword } from '../config/profiles';

export type UserName = 'Marisol' | 'Therese' | 'Trond';

const STORAGE_KEY = 'workout_active_profile';
const STORAGE_HASH_KEY = 'workout_password_hash';

interface ProfileContextValue {
  activeProfile: UserName | null;
  setActiveProfile: (name: UserName | null) => void;
  logout: () => void;
}

const ProfileContext = createContext<ProfileContextValue | null>(null);

export function ProfileProvider({ children }: { children: ReactNode }) {
  const [activeProfile, setActiveProfileState] = useState<UserName | null>(() => {
    // Sjekk om bruker har lagret profil og passord-hash
    const storedProfile = localStorage.getItem(STORAGE_KEY);
    const storedHash = localStorage.getItem(STORAGE_HASH_KEY);
    
    if (storedProfile && storedHash) {
      // Valider at profilen er gyldig
      if (storedProfile === 'Marisol' || storedProfile === 'Therese' || storedProfile === 'Trond') {
        try {
          // Dekode hash og valider passord
          const password = atob(storedHash);
          if (validatePassword(storedProfile, password)) {
            return storedProfile;
          }
        } catch {
          // Ugyldig hash - tøm storage
          localStorage.removeItem(STORAGE_KEY);
          localStorage.removeItem(STORAGE_HASH_KEY);
        }
      }
    }
    
    return null;
  });

  const setActiveProfile = (name: UserName | null) => {
    setActiveProfileState(name);
    if (name) {
      localStorage.setItem(STORAGE_KEY, name);
    } else {
      localStorage.removeItem(STORAGE_KEY);
    }
  };

  const logout = () => {
    setActiveProfileState(null);
    localStorage.removeItem(STORAGE_KEY);
    localStorage.removeItem(STORAGE_HASH_KEY);
  };

  return (
    <ProfileContext.Provider value={{ activeProfile, setActiveProfile, logout }}>
      {children}
    </ProfileContext.Provider>
  );
}

export function useProfile() {
  const ctx = useContext(ProfileContext);
  if (!ctx) throw new Error('useProfile must be used inside ProfileProvider');
  return ctx;
}
