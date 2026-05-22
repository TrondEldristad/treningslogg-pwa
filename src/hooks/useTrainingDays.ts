import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import type { TrainingDay } from '../types';
import type { UserName } from '../context/ProfileContext';

export function useTrainingDays(userName: UserName) {
  const [days, setDays] = useState<TrainingDay[]>([]);
  const [loading, setLoading] = useState(true);

  const fetch = useCallback(async () => {
    setLoading(true);
    const { data } = await supabase
      .from('training_days')
      .select('*')
      .eq('user_name', userName)
      .order('sort_order', { ascending: true });
    setDays(data ?? []);
    setLoading(false);
  }, [userName]);

  useEffect(() => { fetch(); }, [fetch]);

  const addDay = async (name: string) => {
    try {
      const maxOrder = days.length > 0 ? Math.max(...days.map(d => d.sort_order)) + 1 : 0;
      const { data, error } = await supabase
        .from('training_days')
        .insert({ name, sort_order: maxOrder, user_name: userName })
        .select()
        .single();
      if (error) throw error;
      if (data) setDays(prev => [...prev, data]);
    } catch (err) {
      console.error('Kunne ikke legge til treningsdag:', err);
      alert('Kunne ikke legge til treningsdag. Prøv igjen senere.');
      throw err;
    }
  };

  const updateDay = async (id: string, name: string) => {
    try {
      const { error } = await supabase
        .from('training_days')
        .update({ name })
        .eq('id', id);
      if (error) throw error;
      setDays(prev => prev.map(d => d.id === id ? { ...d, name } : d));
    } catch (err) {
      console.error('Kunne ikke oppdatere treningsdag:', err);
      alert('Kunne ikke oppdatere treningsdag. Prøv igjen senere.');
      throw err;
    }
  };

  const deleteDay = async (id: string) => {
    try {
      const { error } = await supabase
        .from('training_days')
        .delete()
        .eq('id', id);
      if (error) throw error;
      setDays(prev => prev.filter(d => d.id !== id));
    } catch (err) {
      console.error('Kunne ikke slette treningsdag:', err);
      alert('Kunne ikke slette treningsdag. Prøv igjen senere.');
      throw err;
    }
  };

  const reorderDay = async (id: string, direction: 'up' | 'down') => {
    try {
      const idx = days.findIndex(d => d.id === id);
      const swapIdx = direction === 'up' ? idx - 1 : idx + 1;
      if (swapIdx < 0 || swapIdx >= days.length) return;

      const a = days[idx];
      const b = days[swapIdx];
      const newDays = [...days];
      newDays[idx] = { ...a, sort_order: b.sort_order };
      newDays[swapIdx] = { ...b, sort_order: a.sort_order };
      newDays.sort((x, y) => x.sort_order - y.sort_order);
      setDays(newDays);

      const [res1, res2] = await Promise.all([
        supabase.from('training_days').update({ sort_order: b.sort_order }).eq('id', a.id),
        supabase.from('training_days').update({ sort_order: a.sort_order }).eq('id', b.id),
      ]);
      
      if (res1.error) throw res1.error;
      if (res2.error) throw res2.error;
    } catch (err) {
      console.error('Kunne ikke endre rekkefølge:', err);
      alert('Kunne ikke endre rekkefølge. Prøv igjen senere.');
      await fetch(); // Reload for å sikre konsistens
      throw err;
    }
  };

  return { days, loading, addDay, updateDay, deleteDay, reorderDay, refetch: fetch };
}
