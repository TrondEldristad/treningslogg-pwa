import { Dumbbell } from 'lucide-react';
import type { UserName } from '../context/ProfileContext';

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
  return (
    <div className="min-h-screen bg-[#0f0f0f] flex flex-col items-center justify-center px-6">
      <div className="w-full max-w-sm">
        <div className="text-center mb-12">
          <div className="w-16 h-16 bg-[#1a1a1a] border border-[#2a2a2a] rounded-2xl flex items-center justify-center mx-auto mb-6">
            <Dumbbell size={30} className="text-orange-400" />
          </div>
          <h1 className="text-3xl font-black text-white tracking-tight">TRENINGSLOGG</h1>
          <p className="text-[#666] text-sm mt-2 font-medium">Velg profil for å fortsette</p>
        </div>

        <div className="flex flex-col gap-4">
          {profiles.map(p => (
            <button
              key={p.name}
              onClick={() => onSelect(p.name)}
              className={`group flex items-center gap-4 px-5 py-5 rounded-2xl border-2 bg-[#1a1a1a] transition-all duration-150 active:scale-[0.98] cursor-pointer ${p.ring}`}
            >
              <div className={`w-10 h-10 rounded-full flex items-center justify-center text-base font-black bg-[#111] ${p.accent}`}>
                {p.name[0]}
              </div>
              <span className={`text-xl font-bold ${p.accent}`}>{p.name}</span>
              <svg className="ml-auto w-5 h-5 text-[#444] group-hover:text-[#666] transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
