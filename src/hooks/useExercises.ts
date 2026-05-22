import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { Exercise } from '../types';

export function useExercises(trainingDayId: string | null) {
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [loading, setLoading] = useState(false);

  const fetch = useCallback(async () => {
    if (!trainingDayId) { setExercises([]); return; }
    setLoading(true);
    const { data } = await supabase
      .from('exercises')
      .select('*')
      .eq('training_day_id', trainingDayId)
      .order('sort_order', { ascending: true });
    setExercises(data ?? []);
    setLoading(false);
  }, [trainingDayId]);

  useEffect(() => { fetch(); }, [fetch]);

  const addExercise = async (name: string, type: 'strength' | 'cardio') => {
    if (!trainingDayId) return;
    const active = exercises.filter(e => !e.archived);
    const maxOrder = active.length > 0 ? Math.max(...active.map(e => e.sort_order)) + 1 : 0;
    const { data } = await supabase
      .from('exercises')
      .insert({ training_day_id: trainingDayId, name, type, sort_order: maxOrder })
      .select()
      .single();
    if (data) setExercises(prev => [...prev, data]);
  };

  const archiveExercise = async (id: string, archived: boolean) => {
    await supabase.from('exercises').update({ archived }).eq('id', id);
    setExercises(prev => prev.map(e => e.id === id ? { ...e, archived } : e));
  };

  const deleteExercise = async (id: string) => {
    await supabase.from('exercises').delete().eq('id', id);
    setExercises(prev => prev.filter(e => e.id !== id));
  };

  return { exercises, loading, addExercise, archiveExercise, deleteExercise, refetch: fetch };
}
