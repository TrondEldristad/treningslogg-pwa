import { useState, useEffect } from 'react';
import { Archive, ArchiveRestore, Trash2, ChevronDown, ChevronUp, LogOut } from 'lucide-react';
import { supabase } from '../lib/supabase';
import type { TrainingDay, Exercise } from '../types';
import type { UserName } from '../context/ProfileContext';
import { useProfile } from '../context/ProfileContext';
import Modal from '../components/Modal';

interface Props {
  userName: UserName;
  onSwitchProfile: () => void;
}

interface DayWithExercises {
  day: TrainingDay;
  exercises: Exercise[];
}

export default function SettingsView({ userName, onSwitchProfile }: Props) {
  const { logout } = useProfile();
  const [data, setData] = useState<DayWithExercises[]>([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState<string | null>(null);
  const [confirmDeleteExercise, setConfirmDeleteExercise] = useState<Exercise | null>(null);

  const handleLogout = () => {
    if (confirm('Er du sikker på at du vil logge ut?')) {
      logout();
    }
  };

  const getSessionInfo = () => {
    const timestamp = localStorage.getItem('workout_login_timestamp');
    if (!timestamp) return null;
    
    const loginTime = parseInt(timestamp, 10);
    const expiryTime = loginTime + (7 * 24 * 60 * 60 * 1000); // 7 dager
    const now = Date.now();
    const daysLeft = Math.ceil((expiryTime - now) / (24 * 60 * 60 * 1000));
    
    if (daysLeft <= 0) return null;
    
    return {
      daysLeft,
      expiryDate: new Date(expiryTime).toLocaleDateString('nb-NO', { 
        day: 'numeric', 
        month: 'short' 
      })
    };
  };

  const sessionInfo = getSessionInfo();

  async function load() {
    setLoading(true);
    const [daysRes, exRes] = await Promise.all([
      supabase.from('training_days').select('*').eq('user_name', userName).order('sort_order'),
      supabase.from('exercises').select('*').eq('archived', true).order('sort_order'),
    ]);
    const days: TrainingDay[] = daysRes.data ?? [];
    const exercises: Exercise[] = exRes.data ?? [];
    const dayIds = new Set(days.map(d => d.id));
    const grouped: DayWithExercises[] = days
      .map(day => ({ day, exercises: exercises.filter(e => e.training_day_id === day.id) }))
      .filter(d => d.exercises.length > 0 && dayIds.has(d.day.id));
    setData(grouped);
    setLoading(false);
  }

  useEffect(() => { 
    load(); 
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userName]);

  const restore = async (exercise: Exercise) => {
    await supabase.from('exercises').update({ archived: false }).eq('id', exercise.id);
    await load();
  };

  const hardDelete = async (exercise: Exercise) => {
    await supabase.from('exercises').delete().eq('id', exercise.id);
    setConfirmDeleteExercise(null);
    await load();
  };

  return (
    <div className="px-4 py-5">
      <div className="flex items-center justify-between mb-2">
        <div>
          <h1 className="text-xl font-black text-white tracking-tight">INNSTILLINGER</h1>
          <p className="text-xs text-[#444] font-medium mt-0.5">Profil: {userName}</p>
        </div>
        <button
          onClick={onSwitchProfile}
          className="text-xs text-orange-400 hover:text-orange-300 font-semibold px-3 py-1.5 bg-orange-500/10 border border-orange-500/25 rounded-lg transition-colors cursor-pointer"
        >
          Bytt
        </button>
      </div>

      {/* Logg ut-seksjon */}
      <div className="mb-6 p-4 bg-[#1a1a1a] border border-[#2a2a2a] rounded-xl">
        <div className="flex items-center justify-between mb-3">
          <span className="text-sm text-[#888]">Innlogget som</span>
          <span className="text-sm font-bold text-white">{userName}</span>
        </div>
        
        {sessionInfo && (
          <div className="mb-3 pb-3 border-b border-[#2a2a2a]">
            <div className="text-xs text-[#666]">
              Innlogget i <span className="text-orange-400 font-semibold">{sessionInfo.daysLeft} dag{sessionInfo.daysLeft !== 1 ? 'er' : ''}</span> til
            </div>
            <div className="text-xs text-[#555] mt-1">
              Session utløper {sessionInfo.expiryDate}
            </div>
          </div>
        )}
        
        <button 
          onClick={handleLogout}
          className="flex items-center gap-3 text-red-400 hover:text-red-300 transition-colors cursor-pointer"
          aria-label="Logg ut"
        >
          <LogOut size={20} aria-label="Logg ut ikon" />
          <span className="font-semibold">Logg ut</span>
        </button>
      </div>

      <p className="text-sm text-[#444] mb-6">Administrer arkiverte øvelser</p>

      <div className="flex items-center gap-2 mb-4">
        <Archive size={16} className="text-amber-400" />
        <h2 className="text-xs font-black text-[#555] uppercase tracking-wider">Arkiverte øvelser</h2>
      </div>

      {loading ? (
        <div className="space-y-3">
          {[1, 2].map(i => <div key={i} className="h-16 bg-[#1a1a1a] rounded-2xl animate-pulse" />)}
        </div>
      ) : data.length === 0 ? (
        <div className="text-center py-12 bg-[#1a1a1a] border border-[#222] rounded-2xl">
          <Archive size={28} className="text-[#333] mx-auto mb-3" />
          <p className="text-[#444] text-sm font-semibold">Ingen arkiverte øvelser</p>
          <p className="text-[#333] text-xs mt-1">Arkiverte øvelser vises her</p>
        </div>
      ) : (
        <div className="space-y-3">
          {data.map(({ day, exercises }) => (
            <div key={day.id} className="bg-[#161616] border border-[#222] rounded-2xl overflow-hidden">
              <button
                onClick={() => setExpanded(expanded === day.id ? null : day.id)}
                className="w-full flex items-center justify-between px-4 py-3.5 cursor-pointer"
              >
                <span className="font-bold text-[#bbb] text-sm">{day.name}</span>
                <div className="flex items-center gap-2">
                  <span className="text-xs bg-amber-500/10 text-amber-400 border border-amber-500/20 px-2 py-0.5 rounded-full font-bold">
                    {exercises.length} arkivert
                  </span>
                  {expanded === day.id
                    ? <ChevronUp size={16} className="text-[#444]" />
                    : <ChevronDown size={16} className="text-[#444]" />
                  }
                </div>
              </button>
              {expanded === day.id && (
                <div className="px-4 pb-4 border-t border-[#1e1e1e] space-y-2 pt-2">
                  {exercises.map(ex => (
                    <div key={ex.id} className="flex items-center gap-2">
                      <div className="flex-1 flex items-center gap-2.5 bg-[#111] border border-[#1e1e1e] rounded-xl px-3 py-2.5">
                        <span className={`w-1.5 h-1.5 rounded-full opacity-30 ${ex.type === 'cardio' ? 'bg-emerald-500' : 'bg-orange-500'}`} />
                        <span className="text-sm text-[#444]">{ex.name}</span>
                        <span className="text-xs text-[#333] ml-auto">{ex.type === 'cardio' ? 'Kardio' : 'Styrke'}</span>
                      </div>
                      <button
                        onClick={() => restore(ex)}
                        title="Reaktiver"
                        className="p-2.5 text-[#666] hover:text-emerald-400 hover:bg-emerald-500/10 rounded-lg transition-colors cursor-pointer"
                      >
                        <ArchiveRestore size={16} />
                      </button>
                      <button
                        onClick={() => setConfirmDeleteExercise(ex)}
                        title="Slett permanent"
                        className="p-2.5 text-[#666] hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors cursor-pointer"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {confirmDeleteExercise && (
        <Modal title="Slett øvelse permanent?" onClose={() => setConfirmDeleteExercise(null)}>
          <p className="text-sm text-[#888] mb-5">
            Er du sikker på at du vil slette <strong className="text-white">{confirmDeleteExercise.name}</strong> permanent?
            All treningshistorikk for denne øvelsen vil gå tapt.
          </p>
          <div className="flex gap-3">
            <button
              onClick={() => setConfirmDeleteExercise(null)}
              className="flex-1 border border-[#2a2a2a] rounded-xl py-3 text-sm font-bold text-[#666] hover:bg-[#1e1e1e] transition-colors cursor-pointer"
            >
              Avbryt
            </button>
            <button
              onClick={() => hardDelete(confirmDeleteExercise)}
              className="flex-1 bg-red-500 hover:bg-red-400 text-white rounded-xl py-3 text-sm font-bold transition-colors cursor-pointer"
            >
              Slett permanent
            </button>
          </div>
        </Modal>
      )}
    </div>
  );
}
