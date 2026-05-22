import { Dumbbell, BarChart2, Settings } from 'lucide-react';
import type { Tab } from '../types';

interface Props {
  active: Tab;
  onChange: (tab: Tab) => void;
}

export default function BottomNav({ active, onChange }: Props) {
  const items: { tab: Tab; label: string; icon: React.ReactNode }[] = [
    { tab: 'log', label: 'Logg', icon: <Dumbbell size={22} aria-label="Logg-ikon" /> },
    { tab: 'overview', label: 'Oversikt', icon: <BarChart2 size={22} aria-label="Oversikt-ikon" /> },
    { tab: 'settings', label: 'Innstillinger', icon: <Settings size={22} aria-label="Innstillinger-ikon" /> },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-[#111] border-t border-[#1e1e1e] z-50 safe-area-pb" aria-label="Hovednavigasjon">
      <div className="flex max-w-lg mx-auto">
        {items.map(({ tab, label, icon }) => (
          <button
            key={tab}
            onClick={() => onChange(tab)}
            className={`flex-1 flex flex-col items-center justify-center py-3 gap-0.5 transition-colors cursor-pointer ${
              active === tab ? 'text-orange-400' : 'text-[#444] hover:text-[#666]'
            }`}
            aria-label={`Gå til ${label}`}
            aria-current={active === tab ? 'page' : undefined}
          >
            {icon}
            <span className="text-[11px] font-semibold">{label}</span>
          </button>
        ))}
      </div>
    </nav>
  );
}
