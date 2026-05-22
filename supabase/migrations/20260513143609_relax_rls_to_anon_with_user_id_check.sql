/*
  # Relax RLS to work with anon role + user_id claim

  ## Summary
  The previous policies required `authenticated` role, but the app uses
  anonymous sign-in (anon role) or a device-local UUID passed via a
  custom claim. This migration drops the role restriction so anon users
  can access their own rows, while still scoping by user_id.

  Since this is a single-user personal tracker with no auth server enforcing
  identity, we scope access by matching the user_id column value passed
  from the client. We extend access to both `anon` and `authenticated` roles.

  ## Changes
  - Drop all existing ownership policies
  - Re-create them allowing both anon and authenticated roles
  - training_days: USING/WITH CHECK auth.uid() = user_id
  - child tables: ownership check through training_days
*/

-- training_days
DROP POLICY IF EXISTS "Users can select own training days" ON training_days;
DROP POLICY IF EXISTS "Users can insert own training days" ON training_days;
DROP POLICY IF EXISTS "Users can update own training days" ON training_days;
DROP POLICY IF EXISTS "Users can delete own training days" ON training_days;

CREATE POLICY "Users can select own training days"
  ON training_days FOR SELECT
  TO anon, authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own training days"
  ON training_days FOR INSERT
  TO anon, authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own training days"
  ON training_days FOR UPDATE
  TO anon, authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own training days"
  ON training_days FOR DELETE
  TO anon, authenticated
  USING (auth.uid() = user_id);

-- exercises
DROP POLICY IF EXISTS "Users can select own exercises" ON exercises;
DROP POLICY IF EXISTS "Users can insert own exercises" ON exercises;
DROP POLICY IF EXISTS "Users can update own exercises" ON exercises;
DROP POLICY IF EXISTS "Users can delete own exercises" ON exercises;

CREATE POLICY "Users can select own exercises"
  ON exercises FOR SELECT
  TO anon, authenticated
  USING (
    EXISTS (
      SELECT 1 FROM training_days
      WHERE training_days.id = exercises.training_day_id
      AND training_days.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert own exercises"
  ON exercises FOR INSERT
  TO anon, authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM training_days
      WHERE training_days.id = exercises.training_day_id
      AND training_days.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update own exercises"
  ON exercises FOR UPDATE
  TO anon, authenticated
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
  TO anon, authenticated
  USING (
    EXISTS (
      SELECT 1 FROM training_days
      WHERE training_days.id = exercises.training_day_id
      AND training_days.user_id = auth.uid()
    )
  );

-- strength_logs
DROP POLICY IF EXISTS "Users can select own strength logs" ON strength_logs;
DROP POLICY IF EXISTS "Users can insert own strength logs" ON strength_logs;
DROP POLICY IF EXISTS "Users can update own strength logs" ON strength_logs;
DROP POLICY IF EXISTS "Users can delete own strength logs" ON strength_logs;

CREATE POLICY "Users can select own strength logs"
  ON strength_logs FOR SELECT
  TO anon, authenticated
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
  TO anon, authenticated
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
  TO anon, authenticated
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
  TO anon, authenticated
  USING (
    EXISTS (
      SELECT 1 FROM exercises
      JOIN training_days ON training_days.id = exercises.training_day_id
      WHERE exercises.id = strength_logs.exercise_id
      AND training_days.user_id = auth.uid()
    )
  );

-- cardio_logs
DROP POLICY IF EXISTS "Users can select own cardio logs" ON cardio_logs;
DROP POLICY IF EXISTS "Users can insert own cardio logs" ON cardio_logs;
DROP POLICY IF EXISTS "Users can update own cardio logs" ON cardio_logs;
DROP POLICY IF EXISTS "Users can delete own cardio logs" ON cardio_logs;

CREATE POLICY "Users can select own cardio logs"
  ON cardio_logs FOR SELECT
  TO anon, authenticated
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
  TO anon, authenticated
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
  TO anon, authenticated
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
  TO anon, authenticated
  USING (
    EXISTS (
      SELECT 1 FROM exercises
      JOIN training_days ON training_days.id = exercises.training_day_id
      WHERE exercises.id = cardio_logs.exercise_id
      AND training_days.user_id = auth.uid()
    )
  );
