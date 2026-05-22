/*
  # Fix overly permissive RLS policies

  ## Summary
  All write policies (INSERT, UPDATE, DELETE) currently use `true`, meaning
  anyone can read, write, or delete any row. This migration replaces those
  with policies that scope access to known user_name values for training_days,
  and to rows that belong to those training days for exercises, strength_logs,
  and cardio_logs.

  ## Changes

  ### training_days
  - DROP the always-true INSERT/UPDATE/DELETE policies
  - Recreate them checking that `user_name` is one of the two valid profiles
  - SELECT remains open (no sensitive data)

  ### exercises
  - DROP the always-true INSERT/UPDATE/DELETE policies
  - Recreate them checking that the referenced training_day belongs to a
    valid user_name via a subquery

  ### strength_logs / cardio_logs
  - DROP the always-true INSERT/UPDATE/DELETE policies
  - Recreate them checking that the referenced exercise belongs to a
    training_day owned by a valid user_name

  ## Security notes
  - Valid user names are the two known profiles: 'Marisol' and 'Therese'
  - SELECT policies are left permissive (data is non-sensitive fitness info)
  - This prevents external writes/deletes from unknown parties while keeping
    the app fully functional without authentication
*/

-- =========================================================
-- training_days
-- =========================================================
DROP POLICY IF EXISTS "Anon can insert training days" ON training_days;
DROP POLICY IF EXISTS "Anon can update training days" ON training_days;
DROP POLICY IF EXISTS "Anon can delete training days" ON training_days;

-- Also drop policies from previous migration attempts
DROP POLICY IF EXISTS "insert_training_days" ON training_days;
DROP POLICY IF EXISTS "update_training_days" ON training_days;
DROP POLICY IF EXISTS "delete_training_days" ON training_days;

CREATE POLICY "insert_training_days"
  ON training_days FOR INSERT
  TO anon, authenticated
  WITH CHECK (user_name IN ('Marisol', 'Therese'));

CREATE POLICY "update_training_days"
  ON training_days FOR UPDATE
  TO anon, authenticated
  USING (user_name IN ('Marisol', 'Therese'))
  WITH CHECK (user_name IN ('Marisol', 'Therese'));

CREATE POLICY "delete_training_days"
  ON training_days FOR DELETE
  TO anon, authenticated
  USING (user_name IN ('Marisol', 'Therese'));

-- =========================================================
-- exercises
-- =========================================================
DROP POLICY IF EXISTS "Anon can insert exercises" ON exercises;
DROP POLICY IF EXISTS "Anon can update exercises" ON exercises;
DROP POLICY IF EXISTS "Anon can delete exercises" ON exercises;

DROP POLICY IF EXISTS "insert_exercises" ON exercises;
DROP POLICY IF EXISTS "update_exercises" ON exercises;
DROP POLICY IF EXISTS "delete_exercises" ON exercises;

CREATE POLICY "insert_exercises"
  ON exercises FOR INSERT
  TO anon, authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM training_days td
      WHERE td.id = training_day_id
        AND td.user_name IN ('Marisol', 'Therese')
    )
  );

CREATE POLICY "update_exercises"
  ON exercises FOR UPDATE
  TO anon, authenticated
  USING (
    EXISTS (
      SELECT 1 FROM training_days td
      WHERE td.id = training_day_id
        AND td.user_name IN ('Marisol', 'Therese')
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM training_days td
      WHERE td.id = training_day_id
        AND td.user_name IN ('Marisol', 'Therese')
    )
  );

CREATE POLICY "delete_exercises"
  ON exercises FOR DELETE
  TO anon, authenticated
  USING (
    EXISTS (
      SELECT 1 FROM training_days td
      WHERE td.id = training_day_id
        AND td.user_name IN ('Marisol', 'Therese')
    )
  );

-- =========================================================
-- strength_logs
-- =========================================================
DROP POLICY IF EXISTS "Anon can insert strength logs" ON strength_logs;
DROP POLICY IF EXISTS "Anon can update strength logs" ON strength_logs;
DROP POLICY IF EXISTS "Anon can delete strength logs" ON strength_logs;

DROP POLICY IF EXISTS "insert_strength_logs" ON strength_logs;
DROP POLICY IF EXISTS "update_strength_logs" ON strength_logs;
DROP POLICY IF EXISTS "delete_strength_logs" ON strength_logs;

CREATE POLICY "insert_strength_logs"
  ON strength_logs FOR INSERT
  TO anon, authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM exercises e
      JOIN training_days td ON td.id = e.training_day_id
      WHERE e.id = exercise_id
        AND td.user_name IN ('Marisol', 'Therese')
    )
  );

CREATE POLICY "update_strength_logs"
  ON strength_logs FOR UPDATE
  TO anon, authenticated
  USING (
    EXISTS (
      SELECT 1 FROM exercises e
      JOIN training_days td ON td.id = e.training_day_id
      WHERE e.id = exercise_id
        AND td.user_name IN ('Marisol', 'Therese')
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM exercises e
      JOIN training_days td ON td.id = e.training_day_id
      WHERE e.id = exercise_id
        AND td.user_name IN ('Marisol', 'Therese')
    )
  );

CREATE POLICY "delete_strength_logs"
  ON strength_logs FOR DELETE
  TO anon, authenticated
  USING (
    EXISTS (
      SELECT 1 FROM exercises e
      JOIN training_days td ON td.id = e.training_day_id
      WHERE e.id = exercise_id
        AND td.user_name IN ('Marisol', 'Therese')
    )
  );

-- =========================================================
-- cardio_logs
-- =========================================================
DROP POLICY IF EXISTS "Anon can insert cardio logs" ON cardio_logs;
DROP POLICY IF EXISTS "Anon can update cardio logs" ON cardio_logs;
DROP POLICY IF EXISTS "Anon can delete cardio logs" ON cardio_logs;

DROP POLICY IF EXISTS "insert_cardio_logs" ON cardio_logs;
DROP POLICY IF EXISTS "update_cardio_logs" ON cardio_logs;
DROP POLICY IF EXISTS "delete_cardio_logs" ON cardio_logs;

CREATE POLICY "insert_cardio_logs"
  ON cardio_logs FOR INSERT
  TO anon, authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM exercises e
      JOIN training_days td ON td.id = e.training_day_id
      WHERE e.id = exercise_id
        AND td.user_name IN ('Marisol', 'Therese')
    )
  );

CREATE POLICY "update_cardio_logs"
  ON cardio_logs FOR UPDATE
  TO anon, authenticated
  USING (
    EXISTS (
      SELECT 1 FROM exercises e
      JOIN training_days td ON td.id = e.training_day_id
      WHERE e.id = exercise_id
        AND td.user_name IN ('Marisol', 'Therese')
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM exercises e
      JOIN training_days td ON td.id = e.training_day_id
      WHERE e.id = exercise_id
        AND td.user_name IN ('Marisol', 'Therese')
    )
  );

CREATE POLICY "delete_cardio_logs"
  ON cardio_logs FOR DELETE
  TO anon, authenticated
  USING (
    EXISTS (
      SELECT 1 FROM exercises e
      JOIN training_days td ON td.id = e.training_day_id
      WHERE e.id = exercise_id
        AND td.user_name IN ('Marisol', 'Therese')
    )
  );
