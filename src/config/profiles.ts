import type { UserName } from '../context/ProfileContext';

export interface User {
  username: string;          // 'marisol' (lowercase, for innlogging)
  displayName: UserName;     // 'Marisol' (for display i UI)
  passwordHash: string;      // Obfuskert passord
  color: 'rose' | 'cyan' | 'amber';
}

// Enkel obfuskering - ikke kryptografisk sikker, men skjuler klartekst
const obfuscate = (str: string): string => {
  return btoa(str.split('').reverse().join(''));
};

const deobfuscate = (str: string): string => {
  return atob(str).split('').reverse().join('');
};

// Brukerdatabase med individuelle passord
const users: User[] = [
  {
    username: 'marisol',
    displayName: 'Marisol',
    passwordHash: obfuscate('marisolPass2026'),
    color: 'rose'
  },
  {
    username: 'therese',
    displayName: 'Therese',
    passwordHash: obfuscate('theresePass2026'),
    color: 'cyan'
  },
  {
    username: 'trond',
    displayName: 'Trond',
    passwordHash: obfuscate('trondPass2026'),
    color: 'amber'
  }
];

/**
 * Validerer brukernavn og passord
 * @param username - Brukernavn (case-insensitive)
 * @param password - Passord i klartekst
 * @returns User-objekt hvis gyldig, null hvis ugyldig
 */
export const validateLogin = (username: string, password: string): User | null => {
  // Normaliser brukernavn (lowercase, trim whitespace)
  const normalizedUsername = username.toLowerCase().trim();
  
  // Finn bruker
  const user = users.find(u => u.username === normalizedUsername);
  if (!user) return null;
  
  // Valider passord
  const isValidPassword = deobfuscate(user.passwordHash) === password;
  if (!isValidPassword) return null;
  
  return user;
};

/**
 * Henter bruker basert på displayName (for bakoverkompatibilitet)
 */
export const getUserByDisplayName = (displayName: UserName): User | null => {
  return users.find(u => u.displayName === displayName) ?? null;
};

/**
 * Henter farge for en bruker (bakoverkompatibilitet)
 */
export const getProfileColor = (name: UserName): string => {
  const user = users.find(u => u.displayName === name);
  return user?.color ?? 'rose';
};

/**
 * Returnerer alle brukernavn (for fremtidig bruk)
 */
export const getAllUsernames = (): string[] => {
  return users.map(u => u.username);
};

// --- Deprecated funksjoner (bakoverkompatibilitet) ---

export interface ProfileConfig {
  name: UserName;
  color: 'rose' | 'cyan' | 'amber';
  _k: string;
}

export const getProfiles = (): ProfileConfig[] => {
  return users.map(u => ({
    name: u.displayName,
    color: u.color,
    _k: u.passwordHash
  }));
};

export const validatePassword = (name: UserName, password: string): boolean => {
  const user = users.find(u => u.displayName === name);
  if (!user) return false;
  return deobfuscate(user.passwordHash) === password;
};
