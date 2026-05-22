/*
  # Add Trond as a valid user and duration_minutes to cardio_logs

  ## Changes

  ### cardio_logs
  - Add `duration_minutes` column (numeric, default 0) to store workout duration

  ### RLS policies
  - Update all write policies across training_days, exercises, strength_logs,
    and cardio_logs to also allow 'Trond' as a valid user_name

  ## Notes
  - Existing rows are not affected; duration_minutes defaults to 0
  - 'Trond' gets identical access to 'Marisol' and 'Therese'
*/

-- =========================================================
-- cardio_logs: add duration_minutes column
-- =========================================================
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'cardio_logs' AND column_name = 'duration_minutes'
  ) THEN
    ALTER TABLE cardio_logs ADD COLUMN duration_minutes numeric DEFAULT 0;
  END IF;
END $$;

-- =========================================================
-- training_days: update policies to include Trond
-- =========================================================
DROP POLICY IF EXISTS "insert_training_days" ON training_days;
DROP POLICY IF EXISTS "update_training_days" ON training_days;
DROP POLICY IF EXISTS "delete_training_days" ON training_days;

CREATE POLICY "insert_training_days"
  ON training_days FOR INSERT
  TO anon, authenticated
  WITH CHECK (user_name IN ('Marisol', 'Therese', 'Trond'));

CREATE POLICY "update_training_days"
  ON training_days FOR UPDATE
  TO anon, authenticated
  USING (user_name IN ('Marisol', 'Therese', 'Trond'))
  WITH CHECK (user_name IN ('Marisol', 'Therese', 'Trond'));

CREATE POLICY "delete_training_days"
  ON training_days FOR DELETE
  TO anon, authenticated
  USING (user_name IN ('Marisol', 'Therese', 'Trond'));

-- =========================================================
-- exercises: update policies to include Trond
-- =========================================================
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
        AND td.user_name IN ('Marisol', 'Therese', 'Trond')
    )
  );

CREATE POLICY "update_exercises"
  ON exercises FOR UPDATE
  TO anon, authenticated
  USING (
    EXISTS (
      SELECT 1 FROM training_days td
      WHERE td.id = training_day_id
        AND td.user_name IN ('Marisol', 'Therese', 'Trond')
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM training_days td
      WHERE td.id = training_day_id
        AND td.user_name IN ('Marisol', 'Therese', 'Trond')
    )
  );

CREATE POLICY "delete_exercises"
  ON exercises FOR DELETE
  TO anon, authenticated
  USING (
    EXISTS (
      SELECT 1 FROM training_days td
      WHERE td.id = training_day_id
        AND td.user_name IN ('Marisol', 'Therese', 'Trond')
    )
  );

-- =========================================================
-- strength_logs: update policies to include Trond
-- =========================================================
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
        AND td.user_name IN ('Marisol', 'Therese', 'Trond')
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
        AND td.user_name IN ('Marisol', 'Therese', 'Trond')
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM exercises e
      JOIN training_days td ON td.id = e.training_day_id
      WHERE e.id = exercise_id
        AND td.user_name IN ('Marisol', 'Therese', 'Trond')
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
        AND td.user_name IN ('Marisol', 'Therese', 'Trond')
    )
  );

-- =========================================================
-- cardio_logs: update policies to include Trond
-- =========================================================
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
        AND td.user_name IN ('Marisol', 'Therese', 'Trond')
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
        AND td.user_name IN ('Marisol', 'Therese', 'Trond')
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM exercises e
      JOIN training_days td ON td.id = e.training_day_id
      WHERE e.id = exercise_id
        AND td.user_name IN ('Marisol', 'Therese', 'Trond')
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
        AND td.user_name IN ('Marisol', 'Therese', 'Trond')
    )
  );
