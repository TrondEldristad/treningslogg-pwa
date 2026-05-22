/*
  # Add user_id ownership and fix RLS policies

  ## Summary
  Replaces always-true RLS policies with ownership-based policies using auth.uid().
  Adds a user_id column to training_days so each row is owned by a specific user.
  Child tables (exercises, strength_logs, cardio_logs) enforce ownership by checking
  the parent chain back to training_days.

  ## Changes

  ### training_days
  - Add `user_id` column (uuid, references auth.users)
  - Replace always-true policies with auth.uid() = user_id checks

  ### exercises
  - Replace always-true policies with existence check through training_days

  ### strength_logs / cardio_logs
  - Replace always-true policies with existence check through exercises -> training_days

  ## Security
  Each user can only access rows they own. Anonymous users authenticated via
  supabase.auth.signInAnonymously() are treated as regular authenticated users.
*/

-- Add user_id to training_days
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'training_days' AND column_name = 'user_id'
  ) THEN
    ALTER TABLE training_days ADD COLUMN user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE;
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_training_days_user_id ON training_days(user_id);

-- Drop old always-true policies for training_days
DROP POLICY IF EXISTS "Allow all on training_days" ON training_days;
DROP POLICY IF EXISTS "Allow insert on training_days" ON training_days;
DROP POLICY IF EXISTS "Allow update on training_days" ON training_days;
DROP POLICY IF EXISTS "Allow delete on training_days" ON training_days;

-- Secure policies for training_days
CREATE POLICY "Users can select own training days"
  ON training_days FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own training days"
  ON training_days FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own training days"
  ON training_days FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own training days"
  ON training_days FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Drop old always-true policies for exercises
DROP POLICY IF EXISTS "Allow select on exercises" ON exercises;
DROP POLICY IF EXISTS "Allow insert on exercises" ON exercises;
DROP POLICY IF EXISTS "Allow update on exercises" ON exercises;
DROP POLICY IF EXISTS "Allow delete on exercises" ON exercises;

-- Secure policies for exercises (ownership via training_days)
CREATE POLICY "Users can select own exercises"
  ON exercises FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM training_days
      WHERE training_days.id = exercises.training_day_id
      AND training_days.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert own exercises"
  ON exercises FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM training_days
      WHERE training_days.id = exercises.training_day_id
      AND training_days.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update own exercises"
  ON exercises FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM training_days
      WHERE training_days.id = exercises.training_day_id
      AND training_days.user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM training_days
      WHERE training_days.id = exercises.training_day_id
      AND training_days.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete own exercises"
  ON exercises FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM training_days
      WHERE training_days.id = exercises.training_day_id
      AND training_days.user_id = auth.uid()
    )
  );

-- Drop old always-true policies for strength_logs
DROP POLICY IF EXISTS "Allow select on strength_logs" ON strength_logs;
DROP POLICY IF EXISTS "Allow insert on strength_logs" ON strength_logs;
DROP POLICY IF EXISTS "Allow update on strength_logs" ON strength_logs;
DROP POLICY IF EXISTS "Allow delete on strength_logs" ON strength_logs;

-- Secure policies for strength_logs (ownership via exercises -> training_days)
CREATE POLICY "Users can select own strength logs"
  ON strength_logs FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM exercises
      JOIN training_days ON training_days.id = exercises.training_day_id
      WHERE exercises.id = strength_logs.exercise_id
      AND training_days.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert own strength logs"
  ON strength_logs FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM exercises
      JOIN training_days ON training_days.id = exercises.training_day_id
      WHERE exercises.id = strength_logs.exercise_id
      AND training_days.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update own strength logs"
  ON strength_logs FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM exercises
      JOIN training_days ON training_days.id = exercises.training_day_id
      WHERE exercises.id = strength_logs.exercise_id
      AND training_days.user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM exercises
      JOIN training_days ON training_days.id = exercises.training_day_id
      WHERE exercises.id = strength_logs.exercise_id
      AND training_days.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete own strength logs"
  ON strength_logs FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM exercises
      JOIN training_days ON training_days.id = exercises.training_day_id
      WHERE exercises.id = strength_logs.exercise_id
      AND training_days.user_id = auth.uid()
    )
  );

-- Drop old always-true policies for cardio_logs
DROP POLICY IF EXISTS "Allow select on cardio_logs" ON cardio_logs;
DROP POLICY IF EXISTS "Allow insert on cardio_logs" ON cardio_logs;
DROP POLICY IF EXISTS "Allow update on cardio_logs" ON cardio_logs;
DROP POLICY IF EXISTS "Allow delete on cardio_logs" ON cardio_logs;

-- Secure policies for cardio_logs (ownership via exercises -> training_days)
CREATE POLICY "Users can select own cardio logs"
  ON cardio_logs FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM exercises
      JOIN training_days ON training_days.id = exercises.training_day_id
      WHERE exercises.id = cardio_logs.exercise_id
      AND training_days.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert own cardio logs"
  ON cardio_logs FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM exercises
      JOIN training_days ON training_days.id = exercises.training_day_id
      WHERE exercises.id = cardio_logs.exercise_id
      AND training_days.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update own cardio logs"
  ON cardio_logs FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM exercises
      JOIN training_days ON training_days.id = exercises.training_day_id
      WHERE exercises.id = cardio_logs.exercise_id
      AND training_days.user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM exercises
      JOIN training_days ON training_days.id = exercises.training_day_id
      WHERE exercises.id = cardio_logs.exercise_id
      AND training_days.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete own cardio logs"
  ON cardio_logs FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM exercises
      JOIN training_days ON training_days.id = exercises.training_day_id
      WHERE exercises.id = cardio_logs.exercise_id
      AND training_days.user_id = auth.uid()
    )
  );
