import { createContext, useContext, useState, type ReactNode } from 'react';
import { validatePassword, getUserByDisplayName } from '../config/profiles';

export type UserName = 'Marisol' | 'Therese' | 'Trond';

const STORAGE_KEY = 'workout_active_profile';
const STORAGE_HASH_KEY = 'workout_password_hash';
const STORAGE_TIMESTAMP_KEY = 'workout_login_timestamp';

// Session varer i 7 dager
const SESSION_DURATION_DAYS = 7;
const SESSION_DURATION_MS = SESSION_DURATION_DAYS * 24 * 60 * 60 * 1000;

interface ProfileContextValue {
  activeProfile: UserName | null;
  setActiveProfile: (name: UserName | null) => void;
  logout: () => void;
}

const ProfileContext = createContext<ProfileContextValue | null>(null);

export function ProfileProvider({ children }: { children: ReactNode }) {
  const [activeProfile, setActiveProfileState] = useState<UserName | null>(() => {
    // Sjekk om bruker har lagret profil, passord-hash og timestamp
    const storedProfile = localStorage.getItem(STORAGE_KEY);
    const storedHash = localStorage.getItem(STORAGE_HASH_KEY);
    const loginTimestamp = localStorage.getItem(STORAGE_TIMESTAMP_KEY);
    
    if (storedProfile && storedHash && loginTimestamp) {
      // Sjekk om session er utløpt (7 dager)
      const now = Date.now();
      const loginTime = parseInt(loginTimestamp, 10);
      const sessionAge = now - loginTime;
      
      if (sessionAge > SESSION_DURATION_MS) {
        // Session utløpt - tøm storage
        localStorage.removeItem(STORAGE_KEY);
        localStorage.removeItem(STORAGE_HASH_KEY);
        localStorage.removeItem(STORAGE_TIMESTAMP_KEY);
        return null;
      }
      
      // Session fortsatt gyldig - valider profil og passord
      if (storedProfile === 'Marisol' || storedProfile === 'Therese' || storedProfile === 'Trond') {
        try {
          // Dekode hash og valider passord
          const password = atob(storedHash);
          // Ny validering via getUserByDisplayName for å støtte nye passord
          const user = getUserByDisplayName(storedProfile);
          if (user && validatePassword(storedProfile, password)) {
            return storedProfile;
          }
        } catch {
          // Ugyldig hash - tøm storage
          localStorage.removeItem(STORAGE_KEY);
          localStorage.removeItem(STORAGE_HASH_KEY);
          localStorage.removeItem(STORAGE_TIMESTAMP_KEY);
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
    localStorage.removeItem(STORAGE_TIMESTAMP_KEY);
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
