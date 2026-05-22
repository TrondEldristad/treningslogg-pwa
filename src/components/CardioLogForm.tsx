import { useState } from 'react';
import { Plus } from 'lucide-react';

interface Props {
  onAdd: (distance_km: number, duration_minutes: number, date: string) => Promise<void>;
}

const inputCls = 'w-full min-w-0 border border-[#2a2a2a] rounded-lg px-2 py-2.5 text-sm font-medium text-white bg-[#111] focus:outline-none focus:ring-2 focus:ring-emerald-500/40 focus:border-emerald-500/60';

function calcPace(km: number, totalMinutes: number): string | null {
  if (km <= 0 || totalMinutes <= 0) return null;
  const paceDecimal = totalMinutes / km;
  const min = Math.floor(paceDecimal);
  const sec = Math.round((paceDecimal - min) * 60);
  return `${min}:${String(sec).padStart(2, '0')}`;
}

export default function CardioLogForm({ onAdd }: Props) {
  const today = new Date().toISOString().split('T')[0];
  const [distance, setDistance] = useState('');
  const [minutes, setMinutes] = useState('');
  const [seconds, setSeconds] = useState('');
  const [date, setDate] = useState(today);
  const [saving, setSaving] = useState(false);

  const totalMinutes = (Number(minutes) || 0) + (Number(seconds) || 0) / 60;
  const pace = calcPace(Number(distance), totalMinutes);
  const canSubmit = Number(distance) > 0 && totalMinutes > 0;

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validering
    const dist = Number(distance);
    const totalMins = (Number(minutes) || 0) + (Number(seconds) || 0) / 60;
    
    if (dist <= 0) {
      alert('Distanse må være større enn 0');
      return;
    }
    if (totalMins <= 0) {
      alert('Varighet må være større enn 0');
      return;
    }
    if (Number(seconds) > 59) {
      alert('Sekunder må være mellom 0 og 59');
      return;
    }
    
    setSaving(true);
    try {
      await onAdd(dist, totalMins, date);
      setDistance('');
      setMinutes('');
      setSeconds('');
    } catch {
      // Feil håndteres i onAdd
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={submit} className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-xl p-4 mb-4">
      <div className="grid grid-cols-3 gap-2 mb-3 overflow-hidden">
        <div className="min-w-0">
          <label className="text-xs text-[#555] font-bold block mb-1 uppercase tracking-wide">Km</label>
          <input
            type="number"
            min="0.01"
            step="0.01"
            max="500"
            required
            value={distance}
            onChange={e => setDistance(e.target.value)}
            placeholder="0.00"
            className={inputCls}
            aria-label="Distanse i kilometer"
          />
        </div>
        <div className="min-w-0">
          <label className="text-xs text-[#555] font-bold block mb-1 uppercase tracking-wide">Min</label>
          <input
            type="number"
            min="0"
            max="999"
            required
            value={minutes}
            onChange={e => setMinutes(e.target.value)}
            placeholder="0"
            className={inputCls}
            aria-label="Minutter"
          />
        </div>
        <div className="min-w-0">
          <label className="text-xs text-[#555] font-bold block mb-1 uppercase tracking-wide">Sek</label>
          <input
            type="number"
            min="0"
            max="59"
            value={seconds}
            onChange={e => setSeconds(e.target.value)}
            placeholder="0"
            className={inputCls}
            aria-label="Sekunder"
          />
        </div>
      </div>

      {pace && (
        <div className="flex items-center gap-2 mb-3 px-3 py-2 bg-[#141414] border border-emerald-500/20 rounded-lg">
          <span className="text-xs text-[#555] font-bold uppercase tracking-wide">Pace</span>
          <span className="text-sm font-black text-emerald-400">{pace} min/km</span>
        </div>
      )}

      <div className="mb-3">
        <label className="text-xs text-[#555] font-bold block mb-1 uppercase tracking-wide">Dato</label>
        <input type="date" value={date} onChange={e => setDate(e.target.value)} className={inputCls} />
      </div>
      <button
        type="submit"
        disabled={saving || !canSubmit}
        className="w-full flex items-center justify-center gap-2 bg-emerald-500 hover:bg-emerald-400 disabled:bg-[#222] disabled:text-[#444] text-white font-bold rounded-lg py-2.5 text-sm transition-colors cursor-pointer"
      >
        <Plus size={16} />
        Legg til
      </button>
    </form>
  );
}
