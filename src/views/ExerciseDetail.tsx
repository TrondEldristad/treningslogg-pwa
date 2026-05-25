import { useState } from 'react';
import { ArrowLeft, Trash2, ChevronDown, ChevronUp } from 'lucide-react';
import type { Exercise, Intensity } from '../types';
import { useStrengthLogs, useCardioLogs } from '../hooks/useLogs';
import StrengthLogForm from '../components/StrengthLogForm';
import CardioLogForm from '../components/CardioLogForm';

const intensityConfig: Record<Intensity, { dot: string; label: string }> = {
  light:  { dot: 'bg-green-500',  label: 'Lett'  },
  medium: { dot: 'bg-yellow-500', label: 'Passe' },
  heavy:  { dot: 'bg-red-500',    label: 'Tungt' },
};

function formatDate(dateStr: string) {
  const d = new Date(dateStr + 'T00:00:00');
  return d.toLocaleDateString('nb-NO', { day: 'numeric', month: 'short', year: 'numeric' });
}

interface Props {
  exercise: Exercise;
  onBack: () => void;
}

function StrengthView({ exercise }: Props) {
  const { logs, addLog, deleteLog } = useStrengthLogs(exercise.id);
  const [expanded, setExpanded] = useState<string | null>(null);

  const lastLog = logs.length > 0 ? logs[0] : null;

  const allSame = (sets: { reps: number; weight_kg: number }[]) =>
    sets.every(s => s.reps === sets[0].reps && s.weight_kg === sets[0].weight_kg);

  return (
    <div>
      <StrengthLogForm onAdd={addLog} lastLog={lastLog} />
      {logs.length === 0 ? (
        <p className="text-center text-[#444] text-sm py-6">Ingen registreringer ennå</p>
      ) : (
        <div className="space-y-2">
          {logs.map(log => {
            const hasSetsData = Array.isArray(log.sets_data) && log.sets_data.length > 0;
            const isExpanded = expanded === log.id;
            const uniform = hasSetsData && allSame(log.sets_data);

            return (
              <div key={log.id} className="bg-[#161616] border border-[#222] rounded-xl overflow-hidden">
                <div className="px-4 py-3 flex items-center justify-between">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 flex-wrap">
                      <span className="text-lg font-black text-orange-400">{log.weight_kg} kg</span>
                      <span className="text-sm text-[#555]">{log.sets} sett × {log.reps} reps</span>
                      {(() => {
                        const intensity = log.sets_data?.[0]?.intensity;
                        if (!intensity) return null;
                        const cfg = intensityConfig[intensity];
                        return (
                          <span className="flex items-center gap-1">
                            <span className={`w-2 h-2 rounded-full ${cfg.dot}`} />
                            <span className="text-xs text-[#666]">{cfg.label}</span>
                          </span>
                        );
                      })()}
                    </div>
                    <p className="text-xs text-[#444] mt-0.5">{formatDate(log.logged_at)}</p>
                  </div>
                  <div className="flex items-center gap-1 ml-2">
                    {hasSetsData && !uniform && (
                      <button
                        onClick={() => setExpanded(isExpanded ? null : log.id)}
                        className="p-2 text-[#555] hover:text-orange-400 hover:bg-orange-500/10 rounded-lg transition-colors cursor-pointer"
                      >
                        {isExpanded ? <ChevronUp size={15} /> : <ChevronDown size={15} />}
                      </button>
                    )}
                    <button
                      onClick={() => deleteLog(log.id)}
                      className="p-2 text-[#666] hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors cursor-pointer"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
                {hasSetsData && !uniform && isExpanded && (
                  <div className="border-t border-[#1e1e1e] px-4 pb-3 pt-2">
                    <div className="grid grid-cols-3 gap-2 mb-1">
                      <span className="text-xs text-[#3a3a3a] font-bold uppercase tracking-wide text-center">Sett</span>
                      <span className="text-xs text-[#3a3a3a] font-bold uppercase tracking-wide text-center">Reps</span>
                      <span className="text-xs text-[#3a3a3a] font-bold uppercase tracking-wide text-center">Kilo</span>
                    </div>
                    {log.sets_data.map(s => (
                      <div key={s.set} className="grid grid-cols-3 gap-2 py-1 border-b border-[#1e1e1e] last:border-0">
                        <span className="text-xs text-[#555] text-center font-bold">{s.set}</span>
                        <span className="text-xs text-white text-center">{s.reps}</span>
                        <span className="text-xs text-orange-400 text-center font-bold">{s.weight_kg} kg</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

function formatDuration(totalMinutes: number): string {
  const min = Math.floor(totalMinutes);
  const sec = Math.round((totalMinutes - min) * 60);
  return `${min}:${String(sec).padStart(2, '0')}`;
}

function formatPace(km: number, totalMinutes: number): string | null {
  if (km <= 0 || totalMinutes <= 0) return null;
  const paceDecimal = totalMinutes / km;
  const min = Math.floor(paceDecimal);
  const sec = Math.round((paceDecimal - min) * 60);
  return `${min}:${String(sec).padStart(2, '0')}`;
}

function CardioView({ exercise }: Props) {
  const { logs, addLog, deleteLog } = useCardioLogs(exercise.id);

  const lastLog = logs.length > 0 ? logs[0] : null;

  return (
    <div>
      <CardioLogForm onAdd={addLog} lastLog={lastLog} />
      {logs.length === 0 ? (
        <p className="text-center text-[#444] text-sm py-6">Ingen registreringer ennå</p>
      ) : (
        <div className="space-y-2">
          {logs.map(log => {
            const pace = formatPace(log.distance_km, log.duration_minutes);
            return (
              <div key={log.id} className="bg-[#161616] border border-[#222] rounded-xl px-4 py-3 flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-3 flex-wrap">
                    {log.distance_km > 0 && (
                      <span className="text-lg font-black text-emerald-400">{log.distance_km} km</span>
                    )}
                    {log.duration_minutes > 0 && (
                      <span className="text-sm text-[#555]">{formatDuration(log.duration_minutes)} min</span>
                    )}
                    {pace && (
                      <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
                        {pace}/km
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-[#444] mt-0.5">{formatDate(log.logged_at)}</p>
                </div>
                <button
                  onClick={() => deleteLog(log.id)}
                  className="p-2 text-[#666] hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors cursor-pointer"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default function ExerciseDetail({ exercise, onBack }: Props) {
  return (
    <div>
      <div className="flex items-center gap-3 mb-6">
        <button
          onClick={onBack}
          className="p-2 -ml-2 text-[#555] hover:text-white hover:bg-[#1e1e1e] rounded-lg transition-colors cursor-pointer"
        >
          <ArrowLeft size={20} />
        </button>
        <div>
          <h2 className="text-lg font-black text-white">{exercise.name}</h2>
          <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${
            exercise.type === 'cardio'
              ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/20'
              : 'bg-orange-500/15 text-orange-400 border border-orange-500/20'
          }`}>
            {exercise.type === 'cardio' ? 'Kardio' : 'Styrke'}
          </span>
        </div>
      </div>
      {exercise.type === 'strength'
        ? <StrengthView exercise={exercise} onBack={onBack} />
        : <CardioView exercise={exercise} onBack={onBack} />
      }
    </div>
  );
}
