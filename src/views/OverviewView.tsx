import { useState, useEffect } from 'react';
import { TrendingUp, Dumbbell, Activity, MapPin } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useWeeklyActivity } from '../hooks/useWeeklyActivity';
import type { TrainingDay, Exercise } from '../types';
import type { UserName } from '../context/ProfileContext';

interface Props {
  userName: UserName;
  onSwitchProfile: () => void;
}

interface ExerciseStat {
  exercise: Exercise;
  dayName: string;
  lastStrength?: { weight_kg: number; sets: number; reps: number; logged_at: string };
  lastCardio?: { distance_km: number; duration_minutes: number; logged_at: string };
  totalSessions: number;
}

function formatDate(dateStr: string) {
  const d = new Date(dateStr + 'T00:00:00');
  return d.toLocaleDateString('nb-NO', { day: 'numeric', month: 'short' });
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

function getCurrentWeekBounds(): { monday: string; sunday: string } {
  const now = new Date();
  const day = now.getDay();
  const diffToMonday = day === 0 ? -6 : 1 - day;
  const monday = new Date(now);
  monday.setDate(now.getDate() + diffToMonday);
  const sunday = new Date(monday);
  sunday.setDate(monday.getDate() + 6);
  const fmt = (d: Date) => d.toISOString().split('T')[0];
  return { monday: fmt(monday), sunday: fmt(sunday) };
}

function ThisWeekBadge({ count }: { count: number }) {
  return (
    <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-400 bg-emerald-500/15 border border-emerald-500/25 px-2 py-0.5 rounded-full">
      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shadow-[0_0_4px_rgba(52,211,153,0.7)]" />
      {count > 1 ? `x${count} denne uken` : 'Denne uken'}
    </span>
  );
}

export default function OverviewView({ userName, onSwitchProfile }: Props) {
  const [stats, setStats] = useState<ExerciseStat[]>([]);
  const [loading, setLoading] = useState(true);
  const [weeklyKm, setWeeklyKm] = useState(0);
  const { exerciseLogCounts } = useWeeklyActivity(userName);

  useEffect(() => {
    async function load() {
      setLoading(true);
      const [daysRes, exercisesRes] = await Promise.all([
        supabase.from('training_days').select('*').eq('user_name', userName).order('sort_order'),
        supabase.from('exercises').select('*').eq('archived', false),
      ]);
      const days: TrainingDay[] = daysRes.data ?? [];
      const allExercises: Exercise[] = exercisesRes.data ?? [];

      const dayIds = new Set(days.map(d => d.id));
      const exercises = allExercises.filter(e => dayIds.has(e.training_day_id));
      const dayMap = Object.fromEntries(days.map(d => [d.id, d.name]));

      const { monday, sunday } = getCurrentWeekBounds();
      const statsArr: ExerciseStat[] = [];
      let totalWeeklyKm = 0;

      for (const ex of exercises) {
        const stat: ExerciseStat = { exercise: ex, dayName: dayMap[ex.training_day_id] ?? '', totalSessions: 0 };
        if (ex.type === 'strength') {
          const { data: logs, count } = await supabase
            .from('strength_logs')
            .select('*', { count: 'exact' })
            .eq('exercise_id', ex.id)
            .order('logged_at', { ascending: false })
            .limit(1);
          stat.totalSessions = count ?? 0;
          if (logs && logs.length > 0) stat.lastStrength = logs[0];
        } else {
          const { data: logs, count } = await supabase
            .from('cardio_logs')
            .select('*', { count: 'exact' })
            .eq('exercise_id', ex.id)
            .order('logged_at', { ascending: false })
            .limit(1);
          stat.totalSessions = count ?? 0;
          if (logs && logs.length > 0) stat.lastCardio = logs[0];

          const { data: weekLogs } = await supabase
            .from('cardio_logs')
            .select('distance_km')
            .eq('exercise_id', ex.id)
            .gte('logged_at', monday)
            .lte('logged_at', sunday);
          if (weekLogs) {
            totalWeeklyKm += weekLogs.reduce((s, l) => s + Number(l.distance_km ?? 0), 0);
          }
        }
        statsArr.push(stat);
      }

      setStats(statsArr);
      setWeeklyKm(totalWeeklyKm);
      setLoading(false);
    }
    load();
  }, [userName]);

  const strengthStats = stats.filter(s => s.exercise.type === 'strength');
  const cardioStats = stats.filter(s => s.exercise.type === 'cardio');

  if (loading) {
    return (
      <div className="px-4 py-5 space-y-3">
        {[1, 2, 3, 4].map(i => <div key={i} className="h-24 bg-[#1a1a1a] rounded-2xl animate-pulse" />)}
      </div>
    );
  }

  return (
    <div className="px-4 py-5">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-black text-white tracking-tight">OVERSIKT</h1>
          <p className="text-xs text-[#444] font-medium mt-0.5">Profil: {userName}</p>
        </div>
        <button
          onClick={onSwitchProfile}
          className="text-xs text-orange-400 hover:text-orange-300 font-semibold px-3 py-1.5 bg-orange-500/10 border border-orange-500/25 rounded-lg transition-colors cursor-pointer"
        >
          Bytt
        </button>
      </div>

      {cardioStats.length > 0 && (
        <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-2xl p-4 mb-6">
          <div className="flex items-center gap-2 mb-1">
            <MapPin size={16} className="text-emerald-400" />
            <span className="text-xs font-bold text-emerald-400 uppercase tracking-wide">Distanse denne uken</span>
          </div>
          <p className="text-2xl font-black text-emerald-300">
            {weeklyKm.toFixed(1)} <span className="text-sm font-bold">km</span>
          </p>
        </div>
      )}

      {strengthStats.length > 0 && (
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-3">
            <Dumbbell size={16} className="text-orange-400" />
            <h2 className="text-xs font-black text-[#555] uppercase tracking-wider">Styrkeøvelser</h2>
          </div>
          <div className="space-y-2">
            {strengthStats.map(({ exercise, dayName, lastStrength, totalSessions }) => {
              const weekCount = exerciseLogCounts[exercise.id] ?? 0;
              const doneThisWeek = weekCount > 0;
              return (
                <div
                  key={exercise.id}
                  className={`rounded-2xl px-4 py-3.5 border transition-colors ${
                    doneThisWeek
                      ? 'bg-[#141a14] border-emerald-500/20'
                      : 'bg-[#161616] border-[#222]'
                  }`}
                >
                  <div className="flex items-start justify-between mb-1">
                    <div className="flex-1 min-w-0 mr-2">
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className={`font-bold text-sm ${doneThisWeek ? 'text-emerald-200' : 'text-[#ccc]'}`}>
                          {exercise.name}
                        </p>
                        {doneThisWeek && <ThisWeekBadge count={weekCount} />}
                      </div>
                      <p className="text-xs text-[#444]">{dayName}</p>
                    </div>
                    <span className="text-xs text-[#444] bg-[#1e1e1e] px-2 py-1 rounded-full border border-[#2a2a2a] flex-shrink-0">{totalSessions} økter</span>
                  </div>
                  {lastStrength ? (
                    <div className="flex items-center gap-3 mt-2">
                      <div className="flex items-center gap-1.5">
                        <TrendingUp size={13} className={doneThisWeek ? 'text-emerald-500' : 'text-orange-500'} />
                        <span className={`text-sm font-black ${doneThisWeek ? 'text-emerald-400' : 'text-orange-400'}`}>{lastStrength.weight_kg} kg</span>
                      </div>
                      <span className="text-xs text-[#555]">{lastStrength.sets} sett × {lastStrength.reps} reps</span>
                      <span className="text-xs text-[#333] ml-auto">{formatDate(lastStrength.logged_at)}</span>
                    </div>
                  ) : (
                    <p className="text-xs text-[#333] mt-1">Ingen registreringer</p>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {cardioStats.length > 0 && (
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-3">
            <Activity size={16} className="text-emerald-400" />
            <h2 className="text-xs font-black text-[#555] uppercase tracking-wider">Kardioøvelser</h2>
          </div>
          <div className="space-y-2">
            {cardioStats.map(({ exercise, dayName, lastCardio, totalSessions }) => {
              const pace = lastCardio ? formatPace(lastCardio.distance_km, lastCardio.duration_minutes) : null;
              const weekCount = exerciseLogCounts[exercise.id] ?? 0;
              const doneThisWeek = weekCount > 0;
              return (
                <div
                  key={exercise.id}
                  className={`rounded-2xl px-4 py-3.5 border transition-colors ${
                    doneThisWeek
                      ? 'bg-[#141a14] border-emerald-500/20'
                      : 'bg-[#161616] border-[#222]'
                  }`}
                >
                  <div className="flex items-start justify-between mb-1">
                    <div className="flex-1 min-w-0 mr-2">
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className={`font-bold text-sm ${doneThisWeek ? 'text-emerald-200' : 'text-[#ccc]'}`}>
                          {exercise.name}
                        </p>
                        {doneThisWeek && <ThisWeekBadge count={weekCount} />}
                      </div>
                      <p className="text-xs text-[#444]">{dayName}</p>
                    </div>
                    <span className="text-xs text-[#444] bg-[#1e1e1e] px-2 py-1 rounded-full border border-[#2a2a2a] flex-shrink-0">{totalSessions} økter</span>
                  </div>
                  {lastCardio ? (
                    <div className="flex items-center gap-3 mt-2 flex-wrap">
                      {lastCardio.distance_km > 0 && (
                        <span className={`text-sm font-black ${doneThisWeek ? 'text-emerald-300' : 'text-emerald-400'}`}>{lastCardio.distance_km} km</span>
                      )}
                      {lastCardio.duration_minutes > 0 && (
                        <span className="text-xs text-[#555]">{formatDuration(lastCardio.duration_minutes)} min</span>
                      )}
                      {pace && (
                        <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
                          {pace}/km
                        </span>
                      )}
                      <span className="text-xs text-[#333] ml-auto">{formatDate(lastCardio.logged_at)}</span>
                    </div>
                  ) : (
                    <p className="text-xs text-[#333] mt-1">Ingen registreringer</p>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {stats.length === 0 && (
        <div className="text-center py-16">
          <div className="w-16 h-16 bg-[#1a1a1a] border border-[#2a2a2a] rounded-2xl flex items-center justify-center mx-auto mb-4">
            <TrendingUp size={28} className="text-[#333]" />
          </div>
          <p className="text-[#555] font-semibold mb-1">Ingen data ennå</p>
          <p className="text-[#333] text-sm">Start med å legge til treningsdager og øvelser</p>
        </div>
      )}
    </div>
  );
}
