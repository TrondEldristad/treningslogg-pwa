/*
  # Workout Tracker Schema

  ## Summary
  Creates all tables needed for the workout tracker app.

  ## New Tables

  ### training_days
  Represents a named training day (e.g. "Beindag", "Ryggdag").
  - id: UUID primary key
  - name: Display name for the training day
  - sort_order: Integer for ordering days
  - created_at: Timestamp

  ### exercises
  An exercise belonging to a training day.
  - id: UUID primary key
  - training_day_id: FK to training_days
  - name: Exercise name
  - type: 'strength' or 'cardio'
  - archived: Whether the exercise is hidden
  - sort_order: Integer for ordering
  - created_at: Timestamp

  ### strength_logs
  A single logged set for a strength exercise.
  - id: UUID primary key
  - exercise_id: FK to exercises
  - logged_at: Date of the session
  - sets: Number of sets
  - reps: Reps per set
  - weight_kg: Weight in kilograms
  - created_at: Timestamp

  ### cardio_logs
  A single logged session for a cardio exercise.
  - id: UUID primary key
  - exercise_id: FK to exercises
  - logged_at: Date of the session
  - steps: Step count
  - distance_km: Distance in kilometers
  - created_at: Timestamp

  ## Security
  RLS is enabled on all tables. Policies allow public access since there is no authentication in this app.
  These are intentionally permissive for a single-user personal tracker.

  ## Notes
  - All tables use UUID primary keys
  - Cascade deletes: deleting a training day removes its exercises and logs
*/

-- Training days
CREATE TABLE IF NOT EXISTS training_days (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL DEFAULT '',
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE training_days ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow all on training_days"
  ON training_days FOR SELECT
  TO anon
  USING (true);

CREATE POLICY "Allow insert on training_days"
  ON training_days FOR INSERT
  TO anon
  WITH CHECK (true);

CREATE POLICY "Allow update on training_days"
  ON training_days FOR UPDATE
  TO anon
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Allow delete on training_days"
  ON training_days FOR DELETE
  TO anon
  USING (true);

-- Exercises
CREATE TABLE IF NOT EXISTS exercises (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  training_day_id uuid NOT NULL REFERENCES training_days(id) ON DELETE CASCADE,
  name text NOT NULL DEFAULT '',
  type text NOT NULL DEFAULT 'strength' CHECK (type IN ('strength', 'cardio')),
  archived boolean NOT NULL DEFAULT false,
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE exercises ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow select on exercises"
  ON exercises FOR SELECT
  TO anon
  USING (true);

CREATE POLICY "Allow insert on exercises"
  ON exercises FOR INSERT
  TO anon
  WITH CHECK (true);

CREATE POLICY "Allow update on exercises"
  ON exercises FOR UPDATE
  TO anon
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Allow delete on exercises"
  ON exercises FOR DELETE
  TO anon
  USING (true);

-- Strength logs
CREATE TABLE IF NOT EXISTS strength_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  exercise_id uuid NOT NULL REFERENCES exercises(id) ON DELETE CASCADE,
  logged_at date NOT NULL DEFAULT CURRENT_DATE,
  sets integer NOT NULL DEFAULT 1,
  reps integer NOT NULL DEFAULT 0,
  weight_kg numeric(6,2) NOT NULL DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE strength_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow select on strength_logs"
  ON strength_logs FOR SELECT
  TO anon
  USING (true);

CREATE POLICY "Allow insert on strength_logs"
  ON strength_logs FOR INSERT
  TO anon
  WITH CHECK (true);

CREATE POLICY "Allow update on strength_logs"
  ON strength_logs FOR UPDATE
  TO anon
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Allow delete on strength_logs"
  ON strength_logs FOR DELETE
  TO anon
  USING (true);

-- Cardio logs
CREATE TABLE IF NOT EXISTS cardio_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  exercise_id uuid NOT NULL REFERENCES exercises(id) ON DELETE CASCADE,
  logged_at date NOT NULL DEFAULT CURRENT_DATE,
  steps integer NOT NULL DEFAULT 0,
  distance_km numeric(6,2) NOT NULL DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE cardio_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow select on cardio_logs"
  ON cardio_logs FOR SELECT
  TO anon
  USING (true);

CREATE POLICY "Allow insert on cardio_logs"
  ON cardio_logs FOR INSERT
  TO anon
  WITH CHECK (true);

CREATE POLICY "Allow update on cardio_logs"
  ON cardio_logs FOR UPDATE
  TO anon
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Allow delete on cardio_logs"
  ON cardio_logs FOR DELETE
  TO anon
  USING (true);

-- Indexes for common queries
CREATE INDEX IF NOT EXISTS idx_exercises_training_day ON exercises(training_day_id);
CREATE INDEX IF NOT EXISTS idx_strength_logs_exercise ON strength_logs(exercise_id, logged_at DESC);
CREATE INDEX IF NOT EXISTS idx_cardio_logs_exercise ON cardio_logs(exercise_id, logged_at DESC);
