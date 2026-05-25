export interface TrainingDay {
  id: string;
  name: string;
  sort_order: number;
  created_at: string;
}

export interface Exercise {
  id: string;
  training_day_id: string;
  name: string;
  type: 'strength' | 'cardio';
  archived: boolean;
  sort_order: number;
  created_at: string;
}

export type Intensity = 'light' | 'medium' | 'heavy';

export interface SetData {
  set: number;
  reps: number;
  weight_kg: number;
  intensity?: Intensity;
}

export interface StrengthLog {
  id: string;
  exercise_id: string;
  logged_at: string;
  sets: number;
  reps: number;
  weight_kg: number;
  sets_data: SetData[];
  created_at: string;
}

export interface CardioLog {
  id: string;
  exercise_id: string;
  logged_at: string;
  distance_km: number;
  duration_minutes: number;
  created_at: string;
}

export type Tab = 'log' | 'overview' | 'settings';
