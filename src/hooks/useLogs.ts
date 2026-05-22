import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { StrengthLog, CardioLog, SetData } from '../types';

export function useStrengthLogs(exerciseId: string | null) {
  const [logs, setLogs] = useState<StrengthLog[]>([]);

  const fetch = useCallback(async () => {
    if (!exerciseId) { setLogs([]); return; }
    const { data } = await supabase
      .from('strength_logs')
      .select('*')
      .eq('exercise_id', exerciseId)
      .order('logged_at', { ascending: false })
      .order('created_at', { ascending: false })
      .limit(50);
    setLogs(data ?? []);
  }, [exerciseId]);

  useEffect(() => { fetch(); }, [fetch]);

  const addLog = async (sets: number, reps: number, weight_kg: number, logged_at: string, sets_data: SetData[] = []) => {
    if (!exerciseId) return;
    const { data } = await supabase
      .from('strength_logs')
      .insert({ exercise_id: exerciseId, sets, reps, weight_kg, logged_at, sets_data })
      .select()
      .single();
    if (data) setLogs(prev => [data, ...prev]);
  };

  const deleteLog = async (id: string) => {
    await supabase.from('strength_logs').delete().eq('id', id);
    setLogs(prev => prev.filter(l => l.id !== id));
  };

  return { logs, addLog, deleteLog, refetch: fetch };
}

export function useCardioLogs(exerciseId: string | null) {
  const [logs, setLogs] = useState<CardioLog[]>([]);

  const fetch = useCallback(async () => {
    if (!exerciseId) { setLogs([]); return; }
    const { data } = await supabase
      .from('cardio_logs')
      .select('*')
      .eq('exercise_id', exerciseId)
      .order('logged_at', { ascending: false })
      .order('created_at', { ascending: false })
      .limit(50);
    setLogs(data ?? []);
  }, [exerciseId]);

  useEffect(() => { fetch(); }, [fetch]);

  const addLog = async (distance_km: number, duration_minutes: number, logged_at: string) => {
    if (!exerciseId) return;
    const { data } = await supabase
      .from('cardio_logs')
      .insert({ exercise_id: exerciseId, distance_km, duration_minutes, logged_at })
      .select()
      .single();
    if (data) setLogs(prev => [data, ...prev]);
  };

  const deleteLog = async (id: string) => {
    await supabase.from('cardio_logs').delete().eq('id', id);
    setLogs(prev => prev.filter(l => l.id !== id));
  };

  return { logs, addLog, deleteLog, refetch: fetch };
}
