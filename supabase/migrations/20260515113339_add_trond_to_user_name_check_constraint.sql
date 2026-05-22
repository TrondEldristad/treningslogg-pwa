/*
  # Add Trond to training_days user_name CHECK constraint

  ## Problem
  The training_days table has a CHECK constraint that only allows 'Marisol' and 'Therese'
  as valid user_name values. This silently blocks any insert for the 'Trond' profile.

  ## Change
  - Drop the existing `training_days_user_name_check` constraint
  - Add a new constraint that includes 'Trond' alongside 'Marisol' and 'Therese'
*/

ALTER TABLE training_days
  DROP CONSTRAINT IF EXISTS training_days_user_name_check;

ALTER TABLE training_days
  ADD CONSTRAINT training_days_user_name_check
    CHECK (user_name = ANY (ARRAY['Marisol'::text, 'Therese'::text, 'Trond'::text]));
