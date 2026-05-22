import { useState } from 'react';
import { Plus, ChevronRight } from 'lucide-react';
import type { SetData } from '../types';

interface Props {
  onAdd: (sets: number, reps: number, weight: number, date: string, setsData: SetData[]) => Promise<void>;
}

interface SetFormData {
  set: number;
  reps: string;
  weight_kg: string;
}

const inputCls = 'w-full min-w-0 border border-[#2a2a2a] rounded-lg px-2 py-2.5 text-sm font-medium text-white bg-[#111] focus:outline-none focus:ring-2 focus:ring-orange-500/40 focus:border-orange-500/60';
const smallInputCls = 'w-full min-w-0 border border-[#2a2a2a] rounded-lg px-1.5 py-2 text-sm font-medium text-white bg-[#111] focus:outline-none focus:ring-2 focus:ring-orange-500/40 focus:border-orange-500/60 text-center';

function buildSets(count: number, reps: number, weight: number): SetFormData[] {
  return Array.from({ length: count }, (_, i) => ({ set: i + 1, reps: String(reps), weight_kg: String(weight) }));
}

export default function StrengthLogForm({ onAdd }: Props) {
  const today = new Date().toISOString().split('T')[0];
  const [step, setStep] = useState<'config' | 'sets'>('config');
  const [numSets, setNumSets] = useState('3');
  const [defaultReps, setDefaultReps] = useState('10');
  const [defaultWeight, setDefaultWeight] = useState('');
  const [date, setDate] = useState(today);
  const [setsData, setSetsData] = useState<SetFormData[]>([]);
  const [saving, setSaving] = useState(false);

  const handleGenerate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!defaultWeight) return;
    setSetsData(buildSets(Number(numSets), Number(defaultReps), Number(defaultWeight)));
    setStep('sets');
  };

  const updateSet = (idx: number, field: 'reps' | 'weight_kg', value: string) => {
    setSetsData(prev => prev.map((s, i) => i === idx ? { ...s, [field]: value } : s));
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    const numeric: SetData[] = setsData.map(s => ({
      set: s.set,
      reps: Number(s.reps) || 0,
      weight_kg: Number(s.weight_kg) || 0,
    }));
    const avgReps = Math.round(numeric.reduce((sum, s) => sum + s.reps, 0) / numeric.length);
    const maxWeight = Math.max(...numeric.map(s => s.weight_kg));
    await onAdd(numeric.length, avgReps, maxWeight, date, numeric);
    setStep('config');
    setDefaultWeight('');
    setNumSets('3');
    setDefaultReps('10');
    setSaving(false);
  };

  if (step === 'sets') {
    return (
      <form onSubmit={submit} className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-xl p-4 mb-4">
        <div className="flex items-center justify-between mb-3">
          <button
            type="button"
            onClick={() => setStep('config')}
            className="text-xs text-[#555] hover:text-white transition-colors cursor-pointer"
          >
            ← Tilbake
          </button>
          <div>
            <label className="text-xs text-[#555] font-bold block mb-1 uppercase tracking-wide text-right">Dato</label>
            <input type="date" value={date} onChange={e => setDate(e.target.value)} className={inputCls} />
          </div>
        </div>

        <div className="mb-4">
          <div className="grid grid-cols-3 gap-2 mb-1 px-1">
            <span className="text-xs text-[#444] font-bold uppercase tracking-wide text-center">Sett</span>
            <span className="text-xs text-[#444] font-bold uppercase tracking-wide text-center">Reps</span>
            <span className="text-xs text-[#444] font-bold uppercase tracking-wide text-center">Kilo</span>
          </div>
          <div className="space-y-2">
            {setsData.map((s, i) => (
              <div key={i} className="grid grid-cols-3 gap-2 items-center bg-[#141414] rounded-lg px-2 py-1.5 border border-[#222] overflow-hidden">
                <div className="flex items-center justify-center">
                  <span className="w-7 h-7 rounded-full bg-orange-500/15 border border-orange-500/25 flex items-center justify-center text-xs font-black text-orange-400">
                    {s.set}
                  </span>
                </div>
                <input
                  type="number"
                  min="1"
                  value={s.reps}
                  onChange={e => updateSet(i, 'reps', e.target.value)}
                  className={smallInputCls}
                />
                <input
                  type="number"
                  min="0"
                  step="0.5"
                  value={s.weight_kg}
                  onChange={e => updateSet(i, 'weight_kg', e.target.value)}
                  className={smallInputCls}
                />
              </div>
            ))}
          </div>
        </div>

        <button
          type="submit"
          disabled={saving}
          className="w-full flex items-center justify-center gap-2 bg-orange-500 hover:bg-orange-400 disabled:bg-[#222] disabled:text-[#444] text-white font-bold rounded-lg py-2.5 text-sm transition-colors cursor-pointer"
        >
          <Plus size={16} />
          Lagre økt
        </button>
      </form>
    );
  }

  return (
    <form onSubmit={handleGenerate} className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-xl p-4 mb-4">
      <div className="grid grid-cols-3 gap-2 mb-3 overflow-hidden">
        <div className="min-w-0">
          <label className="text-xs text-[#555] font-bold block mb-1 uppercase tracking-wide">Sett</label>
          <input type="number" min="1" value={numSets} onChange={e => setNumSets(e.target.value)} className={inputCls} />
        </div>
        <div className="min-w-0">
          <label className="text-xs text-[#555] font-bold block mb-1 uppercase tracking-wide">Reps</label>
          <input type="number" min="1" value={defaultReps} onChange={e => setDefaultReps(e.target.value)} className={inputCls} />
        </div>
        <div className="min-w-0">
          <label className="text-xs text-[#555] font-bold block mb-1 uppercase tracking-wide">Kilo</label>
          <input type="number" min="0" step="0.5" value={defaultWeight} onChange={e => setDefaultWeight(e.target.value)} placeholder="0" className={inputCls} />
        </div>
      </div>
      <div className="mb-3">
        <label className="text-xs text-[#555] font-bold block mb-1 uppercase tracking-wide">Dato</label>
        <input type="date" value={date} onChange={e => setDate(e.target.value)} className={inputCls} />
      </div>
      <button
        type="submit"
        disabled={!defaultWeight}
        className="w-full flex items-center justify-center gap-2 bg-[#1e1e1e] hover:bg-[#252525] disabled:opacity-40 disabled:cursor-default border border-[#2a2a2a] text-white font-bold rounded-lg py-2.5 text-sm transition-colors cursor-pointer"
      >
        Sett opp sett
        <ChevronRight size={16} />
      </button>
    </form>
  );
}
