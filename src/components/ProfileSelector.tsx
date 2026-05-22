import { useState } from 'react';
import { Dumbbell, Lock, Eye, EyeOff } from 'lucide-react';
import type { UserName } from '../context/ProfileContext';
import { validatePassword } from '../config/profiles';

interface Props {
  onSelect: (name: UserName) => void;
}

const profiles: { name: UserName; accent: string; ring: string; dot: string }[] = [
  {
    name: 'Marisol',
    accent: 'text-rose-400',
    ring: 'border-rose-500/50 hover:border-rose-400',
    dot: 'bg-rose-500',
  },
  {
    name: 'Therese',
    accent: 'text-cyan-400',
    ring: 'border-cyan-500/50 hover:border-cyan-400',
    dot: 'bg-cyan-500',
  },
  {
    name: 'Trond',
    accent: 'text-amber-400',
    ring: 'border-amber-500/50 hover:border-amber-400',
    dot: 'bg-amber-500',
  },
];

export default function ProfileSelector({ onSelect }: Props) {
  const [selectedProfile, setSelectedProfile] = useState<UserName | null>(null);
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');

  const handleProfileClick = (name: UserName) => {
    setSelectedProfile(name);
    setPassword('');
    setError('');
    setShowPassword(false);
  };

  const handleLogin = () => {
    if (!selectedProfile) return;
    
    if (validatePassword(selectedProfile, password)) {
      // Lagre hash for "husk meg"
      const hash = btoa(password);
      localStorage.setItem('workout_password_hash', hash);
      onSelect(selectedProfile);
    } else {
      setError('Feil passord. Prøv igjen.');
      setPassword('');
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && password.length > 0) {
      handleLogin();
    }
  };

  return (
    <div className="min-h-screen bg-[#0f0f0f] flex flex-col items-center justify-center px-6">
      <div className="w-full max-w-sm">
        <div className="text-center mb-12">
          <div className="w-16 h-16 bg-[#1a1a1a] border border-[#2a2a2a] rounded-2xl flex items-center justify-center mx-auto mb-6">
            <Dumbbell aria-label="Treningslogg ikon" size={30} className="text-orange-400" />
          </div>
          <h1 className="text-3xl font-black text-white tracking-tight">TRENINGSLOGG</h1>
          <p className="text-[#666] text-sm mt-2 font-medium">
            {selectedProfile ? 'Skriv inn passord' : 'Velg profil for å fortsette'}
          </p>
        </div>

        {!selectedProfile ? (
          <div className="flex flex-col gap-4">
            {profiles.map(p => (
              <button
                key={p.name}
                onClick={() => handleProfileClick(p.name)}
                className={`group flex items-center gap-4 px-5 py-5 rounded-2xl border-2 bg-[#1a1a1a] transition-all duration-150 active:scale-[0.98] cursor-pointer ${p.ring}`}
                aria-label={`Velg ${p.name} profil`}
              >
                <div className={`w-10 h-10 rounded-full flex items-center justify-center text-base font-black bg-[#111] ${p.accent}`}>
                  {p.name[0]}
                </div>
                <span className={`text-xl font-bold ${p.accent}`}>{p.name}</span>
                <Lock className="ml-auto w-5 h-5 text-[#444] group-hover:text-[#666] transition-colors" aria-label="Passordbeskyttet" />
              </button>
            ))}
          </div>
        ) : (
          <div className="space-y-4">
            {/* Valgt profil */}
            <div className={`flex items-center gap-4 px-5 py-4 rounded-2xl border-2 bg-[#1a1a1a] ${
              profiles.find(p => p.name === selectedProfile)?.ring
            }`}>
              <div className={`w-10 h-10 rounded-full flex items-center justify-center text-base font-black bg-[#111] ${
                profiles.find(p => p.name === selectedProfile)?.accent
              }`}>
                {selectedProfile[0]}
              </div>
              <span className={`text-xl font-bold ${
                profiles.find(p => p.name === selectedProfile)?.accent
              }`}>{selectedProfile}</span>
            </div>

            {/* Passord input */}
            <div className="space-y-3">
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => { setPassword(e.target.value); setError(''); }}
                  onKeyPress={handleKeyPress}
                  placeholder="Passord"
                  className="w-full px-4 py-3 bg-[#1a1a1a] border-2 border-[#2a2a2a] rounded-xl text-white placeholder:text-[#666] focus:outline-none focus:border-[#444] transition-colors"
                  autoFocus
                  aria-label="Skriv inn passord"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#666] hover:text-[#999] transition-colors"
                  aria-label={showPassword ? 'Skjul passord' : 'Vis passord'}
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>

              {error && (
                <p className="text-red-400 text-sm font-medium px-1" role="alert">
                  {error}
                </p>
              )}

              <div className="flex gap-3">
                <button
                  onClick={() => setSelectedProfile(null)}
                  className="flex-1 px-4 py-3 bg-[#1a1a1a] border-2 border-[#2a2a2a] rounded-xl text-[#999] font-bold hover:border-[#444] transition-all active:scale-[0.98]"
                  aria-label="Tilbake til profil-valg"
                >
                  Tilbake
                </button>
                <button
                  onClick={handleLogin}
                  disabled={password.length === 0}
                  className={`flex-1 px-4 py-3 rounded-xl font-bold transition-all active:scale-[0.98] ${
                    password.length === 0
                      ? 'bg-[#2a2a2a] text-[#666] cursor-not-allowed'
                      : 'bg-orange-500 text-white hover:bg-orange-600'
                  }`}
                  aria-label={`Logg inn som ${selectedProfile}`}
                >
                  Logg inn
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
