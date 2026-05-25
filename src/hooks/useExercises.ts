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
    try {
      if (!trainingDayId) return;
      const active = exercises.filter(e => !e.archived);
      const maxOrder = active.length > 0 ? Math.max(...active.map(e => e.sort_order)) + 1 : 0;
      const { data, error } = await supabase
        .from('exercises')
        .insert({ training_day_id: trainingDayId, name, type, sort_order: maxOrder })
        .select()
        .single();
      if (error) throw error;
      if (data) setExercises(prev => [...prev, data]);
    } catch (err) {
      console.error('Kunne ikke legge til øvelse:', err);
      alert('Kunne ikke legge til øvelse. Prøv igjen senere.');
      throw err;
    }
  };

  const archiveExercise = async (id: string, archived: boolean) => {
    try {
      const { error } = await supabase
        .from('exercises')
        .update({ archived })
        .eq('id', id);
      if (error) throw error;
      setExercises(prev => prev.map(e => e.id === id ? { ...e, archived } : e));
    } catch (err) {
      console.error('Kunne ikke arkivere øvelse:', err);
      alert('Kunne ikke arkivere øvelse. Prøv igjen senere.');
      throw err;
    }
  };

  const deleteExercise = async (id: string) => {
    try {
      const { error } = await supabase
        .from('exercises')
        .delete()
        .eq('id', id);
      if (error) throw error;
      setExercises(prev => prev.filter(e => e.id !== id));
    } catch (err) {
      console.error('Kunne ikke slette øvelse:', err);
      alert('Kunne ikke slette øvelse. Prøv igjen senere.');
      throw err;
    }
  };

  const reorderExercises = async (reordered: Exercise[]) => {
    // Optimistisk oppdatering av lokal state
    setExercises(prev => {
      const archived = prev.filter(e => e.archived);
      return [...reordered, ...archived];
    });
    try {
      await Promise.all(
        reordered.map((ex, index) =>
          supabase
            .from('exercises')
            .update({ sort_order: index })
            .eq('id', ex.id)
        )
      );
    } catch (err) {
      console.error('Kunne ikke endre rekkefølge:', err);
      alert('Kunne ikke endre rekkefølge. Prøv igjen senere.');
      fetch(); // Reverter ved feil
      throw err;
    }
  };

  return { exercises, loading, addExercise, archiveExercise, deleteExercise, reorderExercises, refetch: fetch };
}
