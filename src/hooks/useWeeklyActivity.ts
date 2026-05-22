import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import type { UserName } from '../context/ProfileContext';

function getWeekBounds(): { monday: string; sunday: string } {
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

export interface WeeklyActivity {
  // exercise_id -> number of logs this week
  exerciseLogCounts: Record<string, number>;
  // training_day_id -> number of distinct dates this week where >=1 exercise was logged
  daySessionCounts: Record<string, number>;
  refetch: () => void;
}

export function useWeeklyActivity(userName: UserName): WeeklyActivity {
  const [exerciseLogCounts, setExerciseLogCounts] = useState<Record<string, number>>({});
  const [daySessionCounts, setDaySessionCounts] = useState<Record<string, number>>({});

  const fetch = useCallback(async () => {
    const { monday, sunday } = getWeekBounds();

    const [daysRes, exercisesRes] = await Promise.all([
      supabase.from('training_days').select('id').eq('user_name', userName),
      supabase.from('exercises').select('id, training_day_id').eq('archived', false),
    ]);

    const userDayIds = new Set((daysRes.data ?? []).map((d: { id: string }) => d.id));
    const allExercises: { id: string; training_day_id: string }[] = (exercisesRes.data ?? []).filter(
      (e: { id: string; training_day_id: string }) => userDayIds.has(e.training_day_id)
    );

    if (allExercises.length === 0) {
      setExerciseLogCounts({});
      setDaySessionCounts({});
      return;
    }

    const exerciseIds = allExercises.map(e => e.id);
    const exerciseToDay: Record<string, string> = Object.fromEntries(
      allExercises.map(e => [e.id, e.training_day_id])
    );

    const [strengthRes, cardioRes] = await Promise.all([
      supabase
        .from('strength_logs')
        .select('exercise_id, logged_at')
        .in('exercise_id', exerciseIds)
        .gte('logged_at', monday)
        .lte('logged_at', sunday),
      supabase
        .from('cardio_logs')
        .select('exercise_id, logged_at')
        .in('exercise_id', exerciseIds)
        .gte('logged_at', monday)
        .lte('logged_at', sunday),
    ]);

    const allLogs: { exercise_id: string; logged_at: string }[] = [
      ...(strengthRes.data ?? []),
      ...(cardioRes.data ?? []),
    ];

    // Count logs per exercise
    const exCounts: Record<string, number> = {};
    for (const log of allLogs) {
      exCounts[log.exercise_id] = (exCounts[log.exercise_id] ?? 0) + 1;
    }

    // Count distinct dates per training day where at least one exercise was logged
    // day -> Set of dates
    const dayDates: Record<string, Set<string>> = {};
    for (const log of allLogs) {
      const dayId = exerciseToDay[log.exercise_id];
      if (!dayId) continue;
      if (!dayDates[dayId]) dayDates[dayId] = new Set();
      dayDates[dayId].add(log.logged_at);
    }

    const dayCounts: Record<string, number> = {};
    for (const [dayId, dates] of Object.entries(dayDates)) {
      dayCounts[dayId] = dates.size;
    }

    setExerciseLogCounts(exCounts);
    setDaySessionCounts(dayCounts);
  }, [userName]);

  useEffect(() => { fetch(); }, [fetch]);

  return { exerciseLogCounts, daySessionCounts, refetch: fetch };
}
