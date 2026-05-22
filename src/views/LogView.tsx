import { useState } from 'react';
import { Plus, ChevronRight, Archive, ArchiveRestore, Dumbbell, Activity, Pencil, Trash2, ChevronDown, ChevronUp, Check } from 'lucide-react';
import type { TrainingDay, Exercise } from '../types';
import type { UserName } from '../context/ProfileContext';
import { useTrainingDays } from '../hooks/useTrainingDays';
import { useExercises } from '../hooks/useExercises';
import { useWeeklyActivity } from '../hooks/useWeeklyActivity';
import Modal from '../components/Modal';
import ExerciseDetail from './ExerciseDetail';

interface Props {
  userName: UserName;
  onSwitchProfile: () => void;
}

function AddDayModal({ onAdd, onClose }: { onAdd: (name: string) => Promise<void>; onClose: () => void }) {
  const [name, setName] = useState('');
  const [saving, setSaving] = useState(false);
  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    setSaving(true);
    await onAdd(name.trim());
    onClose();
  };
  return (
    <Modal title="Ny treningsdag" onClose={onClose}>
      <form onSubmit={submit}>
        <input
          autoFocus
          type="text"
          placeholder="F.eks. Beindag, Ryggdag..."
          value={name}
          onChange={e => setName(e.target.value)}
          className="w-full border border-[#2a2a2a] rounded-xl px-4 py-3 text-sm text-white bg-[#111] focus:outline-none focus:ring-2 focus:ring-orange-500/40 placeholder:text-[#444] mb-4"
        />
        <button
          type="submit"
          disabled={saving || !name.trim()}
          className="w-full bg-orange-500 hover:bg-orange-400 disabled:bg-[#222] disabled:text-[#444] text-white font-bold rounded-xl py-3 text-sm transition-colors cursor-pointer"
        >
          Opprett dag
        </button>
      </form>
    </Modal>
  );
}

function EditDayModal({ day, onUpdate, onClose }: { day: TrainingDay; onUpdate: (id: string, name: string) => Promise<void>; onClose: () => void }) {
  const [name, setName] = useState(day.name);
  const [saving, setSaving] = useState(false);
  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    setSaving(true);
    await onUpdate(day.id, name.trim());
    onClose();
  };
  return (
    <Modal title="Rediger dag" onClose={onClose}>
      <form onSubmit={submit}>
        <input
          autoFocus
          type="text"
          value={name}
          onChange={e => setName(e.target.value)}
          className="w-full border border-[#2a2a2a] rounded-xl px-4 py-3 text-sm text-white bg-[#111] focus:outline-none focus:ring-2 focus:ring-orange-500/40 mb-4"
        />
        <button
          type="submit"
          disabled={saving || !name.trim()}
          className="w-full bg-orange-500 hover:bg-orange-400 disabled:bg-[#222] disabled:text-[#444] text-white font-bold rounded-xl py-3 text-sm transition-colors cursor-pointer"
        >
          Lagre
        </button>
      </form>
    </Modal>
  );
}

function AddExerciseModal({ onAdd, onClose }: { onAdd: (name: string, type: 'strength' | 'cardio') => Promise<void>; onClose: () => void }) {
  const [name, setName] = useState('');
  const [type, setType] = useState<'strength' | 'cardio'>('strength');
  const [saving, setSaving] = useState(false);
  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    setSaving(true);
    await onAdd(name.trim(), type);
    onClose();
  };
  return (
    <Modal title="Ny øvelse" onClose={onClose}>
      <form onSubmit={submit}>
        <input
          autoFocus
          type="text"
          placeholder="Navn på øvelse..."
          value={name}
          onChange={e => setName(e.target.value)}
          className="w-full border border-[#2a2a2a] rounded-xl px-4 py-3 text-sm text-white bg-[#111] focus:outline-none focus:ring-2 focus:ring-orange-500/40 placeholder:text-[#444] mb-4"
        />
        <div className="grid grid-cols-2 gap-2 mb-4">
          {(['strength', 'cardio'] as const).map(t => (
            <button
              key={t}
              type="button"
              onClick={() => setType(t)}
              className={`flex items-center justify-center gap-2 py-3 rounded-xl border-2 text-sm font-bold transition-colors cursor-pointer ${
                type === t
                  ? t === 'strength'
                    ? 'border-orange-500 bg-orange-500/10 text-orange-400'
                    : 'border-emerald-500 bg-emerald-500/10 text-emerald-400'
                  : 'border-[#2a2a2a] text-[#555] hover:border-[#3a3a3a]'
              }`}
            >
              {t === 'strength' ? <Dumbbell size={16} /> : <Activity size={16} />}
              {t === 'strength' ? 'Styrke' : 'Kardio'}
            </button>
          ))}
        </div>
        <button
          type="submit"
          disabled={saving || !name.trim()}
          className="w-full bg-orange-500 hover:bg-orange-400 disabled:bg-[#222] disabled:text-[#444] text-white font-bold rounded-xl py-3 text-sm transition-colors cursor-pointer"
        >
          Legg til øvelse
        </button>
      </form>
    </Modal>
  );
}

function DayExercises({
  day,
  onSelectExercise,
  exerciseLogCounts,
  onActivityChange,
}: {
  day: TrainingDay;
  onSelectExercise: (ex: Exercise) => void;
  exerciseLogCounts: Record<string, number>;
  onActivityChange: () => void;
}) {
  const { exercises, addExercise, archiveExercise } = useExercises(day.id);
  const [showAddExercise, setShowAddExercise] = useState(false);
  const [showArchived, setShowArchived] = useState(false);

  const active = exercises.filter(e => !e.archived);
  const archived = exercises.filter(e => e.archived);

  return (
    <div className="mt-3 space-y-1.5">
      {active.length === 0 && (
        <p className="text-sm text-[#444] text-center py-3">Ingen øvelser ennå</p>
      )}
      {active.map(ex => {
        const logCount = exerciseLogCounts[ex.id] ?? 0;
        const doneThisWeek = logCount > 0;
        return (
          <div key={ex.id} className="flex items-center gap-2">
            <button
              onClick={() => onSelectExercise(ex)}
              className={`flex-1 flex items-center justify-between rounded-xl px-4 py-3 transition-colors group border ${
                doneThisWeek
                  ? 'bg-emerald-500/5 border-emerald-500/20 hover:border-emerald-500/40 hover:bg-emerald-500/10'
                  : 'bg-[#111] border-[#2a2a2a] hover:border-orange-500/30 hover:bg-orange-500/5'
              }`}
            >
              <div className="flex items-center gap-2.5">
                {doneThisWeek ? (
                  <span className="w-5 h-5 rounded-full bg-emerald-500/20 border border-emerald-500/50 flex items-center justify-center flex-shrink-0">
                    <Check size={10} className="text-emerald-400" strokeWidth={3} />
                  </span>
                ) : (
                  <span className={`w-2 h-2 rounded-full flex-shrink-0 ${ex.type === 'cardio' ? 'bg-emerald-500' : 'bg-orange-500'}`} />
                )}
                <span className={`text-sm font-semibold transition-colors ${doneThisWeek ? 'text-emerald-300 group-hover:text-emerald-200' : 'text-[#ccc] group-hover:text-white'}`}>
                  {ex.name}
                </span>
                {logCount > 1 && (
                  <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/15 border border-emerald-500/25 px-1.5 py-0.5 rounded-full">
                    x{logCount}
                  </span>
                )}
              </div>
              <ChevronRight size={16} className={`transition-colors flex-shrink-0 ${doneThisWeek ? 'text-emerald-500/40 group-hover:text-emerald-400' : 'text-[#333] group-hover:text-orange-400'}`} />
            </button>
            <button
              onClick={() => archiveExercise(ex.id, true)}
              title="Arkiver"
              className="p-2.5 text-[#666] hover:text-amber-400 hover:bg-amber-500/10 rounded-lg transition-colors cursor-pointer"
            >
              <Archive size={16} />
            </button>
          </div>
        );
      })}

      <button
        onClick={() => setShowAddExercise(true)}
        className="w-full flex items-center justify-center gap-2 border-2 border-dashed border-[#333] rounded-xl py-2.5 text-sm text-[#666] hover:border-orange-500/40 hover:text-orange-400 hover:bg-orange-500/5 transition-colors cursor-pointer"
      >
        <Plus size={15} />
        Legg til øvelse
      </button>

      {archived.length > 0 && (
        <div>
          <button
            onClick={() => setShowArchived(v => !v)}
            className="flex items-center gap-1.5 text-xs text-[#444] hover:text-[#666] transition-colors mt-2 mb-1 cursor-pointer"
          >
            <Archive size={13} />
            {showArchived ? 'Skjul arkiv' : `Arkiv (${archived.length})`}
          </button>
          {showArchived && archived.map(ex => (
            <div key={ex.id} className="flex items-center gap-2 mb-1.5">
              <div className="flex-1 flex items-center bg-[#111] border border-[#1e1e1e] rounded-xl px-4 py-2.5">
                <span className={`w-1.5 h-1.5 rounded-full opacity-30 mr-2.5 ${ex.type === 'cardio' ? 'bg-emerald-500' : 'bg-orange-500'}`} />
                <span className="text-sm text-[#444] line-through">{ex.name}</span>
              </div>
              <button
                onClick={() => archiveExercise(ex.id, false)}
                title="Reaktiver"
                className="p-2.5 text-[#666] hover:text-emerald-400 hover:bg-emerald-500/10 rounded-lg transition-colors cursor-pointer"
              >
                <ArchiveRestore size={16} />
              </button>
            </div>
          ))}
        </div>
      )}

      {showAddExercise && (
        <AddExerciseModal
          onAdd={async (name, type) => { await addExercise(name, type); onActivityChange(); }}
          onClose={() => setShowAddExercise(false)}
        />
      )}
    </div>
  );
}

function DaySessionDots({ count }: { count: number }) {
  if (count === 0) return null;
  const MAX_DOTS = 3;
  if (count <= MAX_DOTS) {
    return (
      <div className="flex items-center gap-1">
        {Array.from({ length: count }).map((_, i) => (
          <span key={i} className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_4px_rgba(16,185,129,0.5)]" />
        ))}
      </div>
    );
  }
  return (
    <div className="flex items-center gap-1.5">
      {Array.from({ length: MAX_DOTS }).map((_, i) => (
        <span key={i} className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_4px_rgba(16,185,129,0.5)]" />
      ))}
      <span className="text-[10px] font-black text-emerald-400">+{count - MAX_DOTS}</span>
    </div>
  );
}

export default function LogView({ userName, onSwitchProfile }: Props) {
  const { days, loading, addDay, updateDay, deleteDay, reorderDay } = useTrainingDays(userName);
  const { exerciseLogCounts, daySessionCounts, refetch: refetchActivity } = useWeeklyActivity(userName);
  const [expandedDay, setExpandedDay] = useState<string | null>(null);
  const [showAddDay, setShowAddDay] = useState(false);
  const [editingDay, setEditingDay] = useState<TrainingDay | null>(null);
  const [selectedExercise, setSelectedExercise] = useState<Exercise | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<TrainingDay | null>(null);

  const handleBack = () => {
    setSelectedExercise(null);
    refetchActivity();
  };

  if (selectedExercise) {
    return (
      <div className="px-4 py-5">
        <ExerciseDetail exercise={selectedExercise} onBack={handleBack} />
      </div>
    );
  }

  return (
    <div className="px-4 py-5">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-black text-white tracking-tight">TRENINGSDAGER</h1>
          <p className="text-xs text-[#444] font-medium mt-0.5">Profil: {userName}</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={onSwitchProfile}
            className="text-xs text-orange-400 hover:text-orange-300 font-semibold px-3 py-1.5 bg-orange-500/10 border border-orange-500/25 rounded-lg transition-colors cursor-pointer"
          >
            Bytt
          </button>
          <button
            onClick={() => setShowAddDay(true)}
            className="flex items-center gap-1.5 bg-orange-500 hover:bg-orange-400 text-white text-sm font-bold px-4 py-2 rounded-xl transition-colors cursor-pointer"
          >
            <Plus size={16} />
            Ny dag
          </button>
        </div>
      </div>

      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-16 bg-[#1a1a1a] rounded-2xl animate-pulse" />
          ))}
        </div>
      ) : days.length === 0 ? (
        <div className="text-center py-16">
          <div className="w-16 h-16 bg-[#1a1a1a] border border-[#2a2a2a] rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Dumbbell size={28} className="text-[#444]" />
          </div>
          <p className="text-[#555] font-semibold mb-1">Ingen treningsdager ennå</p>
          <p className="text-[#3a3a3a] text-sm">Trykk «Ny dag» for å komme i gang</p>
        </div>
      ) : (
        <div className="space-y-3">
          {days.map((day, idx) => {
            const sessionCount = daySessionCounts[day.id] ?? 0;
            const isDoneThisWeek = sessionCount > 0;
            return (
              <div
                key={day.id}
                className={`border rounded-2xl overflow-hidden transition-colors ${
                  isDoneThisWeek
                    ? 'bg-[#141a14] border-emerald-500/20'
                    : 'bg-[#161616] border-[#222]'
                }`}
              >
                <div className="flex items-center">
                  <button
                    onClick={() => setExpandedDay(expandedDay === day.id ? null : day.id)}
                    className="flex-1 flex items-center gap-3 px-4 py-4 text-left cursor-pointer"
                  >
                    <span className={`w-7 h-7 rounded-full text-xs font-black flex items-center justify-center flex-shrink-0 border transition-colors ${
                      isDoneThisWeek
                        ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30'
                        : 'bg-orange-500/10 text-orange-400 border-orange-500/20'
                    }`}>
                      {idx + 1}
                    </span>
                    <span className={`font-bold transition-colors ${isDoneThisWeek ? 'text-emerald-200' : 'text-[#ccc]'}`}>
                      {day.name || `Dag ${idx + 1}`}
                    </span>
                    <div className="ml-auto flex items-center gap-2 mr-1">
                      <DaySessionDots count={sessionCount} />
                      <ChevronDown
                        size={16}
                        className={`transition-transform ${expandedDay === day.id ? 'rotate-180' : ''} ${isDoneThisWeek ? 'text-emerald-500/40' : 'text-[#333]'}`}
                      />
                    </div>
                  </button>
                  <div className="flex items-center gap-1 pr-3">
                    <div className="flex flex-col mr-0.5">
                      <button
                        onClick={() => reorderDay(day.id, 'up')}
                        disabled={idx === 0}
                        className="p-1 text-[#555] hover:text-orange-400 disabled:opacity-20 disabled:cursor-default transition-colors cursor-pointer"
                      >
                        <ChevronUp size={13} />
                      </button>
                      <button
                        onClick={() => reorderDay(day.id, 'down')}
                        disabled={idx === days.length - 1}
                        className="p-1 text-[#555] hover:text-orange-400 disabled:opacity-20 disabled:cursor-default transition-colors cursor-pointer"
                      >
                        <ChevronDown size={13} />
                      </button>
                    </div>
                    <button
                      onClick={() => setEditingDay(day)}
                      className="p-2 text-[#666] hover:text-orange-400 hover:bg-orange-500/10 rounded-lg transition-colors cursor-pointer"
                    >
                      <Pencil size={15} />
                    </button>
                    <button
                      onClick={() => setConfirmDelete(day)}
                      className="p-2 text-[#666] hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors cursor-pointer"
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                </div>
                {expandedDay === day.id && (
                  <div className={`px-4 pb-4 border-t ${isDoneThisWeek ? 'border-emerald-500/10' : 'border-[#1e1e1e]'}`}>
                    <DayExercises
                      day={day}
                      onSelectExercise={setSelectedExercise}
                      exerciseLogCounts={exerciseLogCounts}
                      onActivityChange={refetchActivity}
                    />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {showAddDay && <AddDayModal onAdd={addDay} onClose={() => setShowAddDay(false)} />}
      {editingDay && <EditDayModal day={editingDay} onUpdate={updateDay} onClose={() => setEditingDay(null)} />}

      {confirmDelete && (
        <Modal title="Slett treningsdag?" onClose={() => setConfirmDelete(null)}>
          <p className="text-sm text-[#888] mb-5">
            Er du sikker på at du vil slette <strong className="text-white">{confirmDelete.name}</strong>? Alle øvelser og loggene for denne dagen blir også slettet.
          </p>
          <div className="flex gap-3">
            <button
              onClick={() => setConfirmDelete(null)}
              className="flex-1 border border-[#2a2a2a] rounded-xl py-3 text-sm font-bold text-[#888] hover:bg-[#1e1e1e] transition-colors cursor-pointer"
            >
              Avbryt
            </button>
            <button
              onClick={async () => { await deleteDay(confirmDelete.id); setConfirmDelete(null); setExpandedDay(null); }}
              className="flex-1 bg-red-500 hover:bg-red-400 text-white rounded-xl py-3 text-sm font-bold transition-colors cursor-pointer"
            >
              Slett
            </button>
          </div>
        </Modal>
      )}
    </div>
  );
}
