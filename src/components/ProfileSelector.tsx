import { useState } from 'react';
import { Dumbbell, Eye, EyeOff } from 'lucide-react';
import type { UserName } from '../context/ProfileContext';
import { validateLogin } from '../config/profiles';

interface Props {
  onSelect: (name: UserName) => void;
}

export default function ProfileSelector({ onSelect }: Props) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Valider input
    if (!username.trim() || !password) {
      setError('Vennligst fyll ut begge feltene');
      return;
    }

    // Valider brukernavn og passord
    const user = validateLogin(username, password);

    if (user) {
      // Suksess - lagre session (7 dager)
      const hash = btoa(password);
      const timestamp = Date.now().toString();
      
      localStorage.setItem('workout_active_profile', user.displayName);
      localStorage.setItem('workout_password_hash', hash);
      localStorage.setItem('workout_login_timestamp', timestamp);
      
      onSelect(user.displayName);
    } else {
      // Feil brukernavn eller passord
      setError('Feil brukernavn eller passord');
      setPassword(''); // Tøm passord-felt
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && username.trim() && password) {
      handleSubmit(e as any);
    }
  };

  return (
    <div className="min-h-screen bg-[#0f0f0f] flex flex-col items-center justify-center px-6">
      <div className="w-full max-w-sm">
        {/* Logo og tittel */}
        <div className="text-center mb-12">
          <div className="w-16 h-16 bg-[#1a1a1a] border border-[#2a2a2a] rounded-2xl flex items-center justify-center mx-auto mb-6">
            <Dumbbell aria-label="Treningslogg ikon" size={30} className="text-orange-400" />
          </div>
          <h1 className="text-3xl font-black text-white tracking-tight">TRENINGSLOGG</h1>
          <p className="text-[#666] text-sm mt-2 font-medium">Logg inn for å fortsette</p>
        </div>

        {/* Innloggingsskjema */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Brukernavn */}
          <div>
            <label htmlFor="username" className="text-xs text-[#666] font-bold block mb-2 uppercase tracking-wide">
              Brukernavn
            </label>
            <input
              type="text"
              id="username"
              name="username"
              autoComplete="username"
              value={username}
              onChange={(e) => { setUsername(e.target.value); setError(''); }}
              onKeyPress={handleKeyPress}
              placeholder="Ditt brukernavn"
              className="w-full px-4 py-3 bg-[#1a1a1a] border-2 border-[#2a2a2a] rounded-xl text-white placeholder:text-[#666] focus:outline-none focus:border-orange-500/60 transition-colors"
              autoFocus
              aria-label="Brukernavn"
            />
          </div>

          {/* Passord */}
          <div>
            <label htmlFor="password" className="text-xs text-[#666] font-bold block mb-2 uppercase tracking-wide">
              Passord
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                id="password"
                name="password"
                autoComplete="current-password"
                value={password}
                onChange={(e) => { setPassword(e.target.value); setError(''); }}
                onKeyPress={handleKeyPress}
                placeholder="Ditt passord"
                className="w-full px-4 py-3 bg-[#1a1a1a] border-2 border-[#2a2a2a] rounded-xl text-white placeholder:text-[#666] focus:outline-none focus:border-orange-500/60 transition-colors pr-12"
                aria-label="Passord"
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
          </div>

          {/* Feilmelding */}
          {error && (
            <p className="text-red-400 text-sm font-medium px-1" role="alert">
              {error}
            </p>
          )}

          {/* Logg inn knapp */}
          <button
            type="submit"
            disabled={!username.trim() || !password}
            className={`w-full px-4 py-3 rounded-xl font-bold transition-all active:scale-[0.98] ${
              !username.trim() || !password
                ? 'bg-[#2a2a2a] text-[#666] cursor-not-allowed'
                : 'bg-orange-500 text-white hover:bg-orange-600'
            }`}
            aria-label="Logg inn"
          >
            Logg inn
          </button>
        </form>
      </div>
    </div>
  );
}
