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
    const maxOrder = days.length > 0 ? Math.max(...days.map(d => d.sort_order)) + 1 : 0;
    const { data, error } = await supabase
      .from('training_days')
      .insert({ name, sort_order: maxOrder, user_name: userName })
      .select()
      .single();
    if (error) { console.error('addDay error:', error); return; }
    if (data) setDays(prev => [...prev, data]);
  };

  const updateDay = async (id: string, name: string) => {
    await supabase.from('training_days').update({ name }).eq('id', id);
    setDays(prev => prev.map(d => d.id === id ? { ...d, name } : d));
  };

  const deleteDay = async (id: string) => {
    await supabase.from('training_days').delete().eq('id', id);
    setDays(prev => prev.filter(d => d.id !== id));
  };

  const reorderDay = async (id: string, direction: 'up' | 'down') => {
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

    await Promise.all([
      supabase.from('training_days').update({ sort_order: b.sort_order }).eq('id', a.id),
      supabase.from('training_days').update({ sort_order: a.sort_order }).eq('id', b.id),
    ]);
  };

  return { days, loading, addDay, updateDay, deleteDay, reorderDay, refetch: fetch };
}
