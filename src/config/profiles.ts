import type { UserName } from '../context/ProfileContext';

export interface ProfileConfig {
  name: UserName;
  color: 'rose' | 'cyan' | 'amber';
  // Obfuskert passord (base64 + reversering)
  _k: string;
}

// Enkel obfuskering - ikke kryptografisk sikker, men skjuler klartekst
const obfuscate = (str: string): string => {
  return btoa(str.split('').reverse().join(''));
};

const deobfuscate = (str: string): string => {
  return atob(str).split('').reverse().join('');
};

// VIKTIG: Endre disse passordene ved første gangs bruk!
// Nåværende passord for alle: "treninglogg2026"
const profiles: ProfileConfig[] = [
  { 
    name: 'Marisol', 
    color: 'rose',
    _k: obfuscate('treninglogg2026')
  },
  { 
    name: 'Therese', 
    color: 'cyan',
    _k: obfuscate('treninglogg2026')
  },
  { 
    name: 'Trond', 
    color: 'amber',
    _k: obfuscate('treninglogg2026')
  },
];

export const getProfiles = () => profiles;

export const validatePassword = (name: UserName, password: string): boolean => {
  const profile = profiles.find(p => p.name === name);
  if (!profile) return false;
  return deobfuscate(profile._k) === password;
};

export const getProfileColor = (name: UserName): string => {
  const profile = profiles.find(p => p.name === name);
  return profile?.color ?? 'rose';
};
