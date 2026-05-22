-- =============================================================================
-- KOMPLETT MIGRERING - Treningstracker
-- =============================================================================
-- INSTRUKSJONER:
-- 1. Opprett et nytt prosjekt på supabase.com
-- 2. Gå til SQL Editor i ditt nye prosjekt
-- 3. Lim inn hele dette scriptet og klikk "Run"
-- 4. Gi meg din nye Project URL og Anon Key så oppdaterer jeg koden
-- =============================================================================


-- -----------------------------------------------------------------------------
-- DEL 1: TABELLER
-- -----------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS training_days (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  user_name text NOT NULL DEFAULT ''
);

CREATE TABLE IF NOT EXISTS exercises (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  training_day_id uuid NOT NULL REFERENCES training_days(id) ON DELETE CASCADE,
  name text NOT NULL,
  type text NOT NULL CHECK (type IN ('strength', 'cardio')),
  archived boolean NOT NULL DEFAULT false,
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS strength_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  exercise_id uuid NOT NULL REFERENCES exercises(id) ON DELETE CASCADE,
  logged_at date NOT NULL DEFAULT CURRENT_DATE,
  sets integer NOT NULL DEFAULT 0,
  reps integer NOT NULL DEFAULT 0,
  weight_kg numeric NOT NULL DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  notes text NOT NULL DEFAULT '',
  sets_data jsonb NOT NULL DEFAULT '[]'
);

CREATE TABLE IF NOT EXISTS cardio_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  exercise_id uuid NOT NULL REFERENCES exercises(id) ON DELETE CASCADE,
  logged_at date NOT NULL DEFAULT CURRENT_DATE,
  steps integer NOT NULL DEFAULT 0,
  distance_km numeric NOT NULL DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  duration_minutes numeric,
  avg_heart_rate numeric,
  notes text NOT NULL DEFAULT ''
);


-- -----------------------------------------------------------------------------
-- DEL 2: ROW LEVEL SECURITY (åpen tilgang for anon - personlig app)
-- -----------------------------------------------------------------------------

ALTER TABLE training_days ENABLE ROW LEVEL SECURITY;
ALTER TABLE exercises ENABLE ROW LEVEL SECURITY;
ALTER TABLE strength_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE cardio_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow anon select training_days" ON training_days FOR SELECT TO anon USING (true);
CREATE POLICY "Allow anon insert training_days" ON training_days FOR INSERT TO anon WITH CHECK (true);
CREATE POLICY "Allow anon update training_days" ON training_days FOR UPDATE TO anon USING (true) WITH CHECK (true);
CREATE POLICY "Allow anon delete training_days" ON training_days FOR DELETE TO anon USING (true);

CREATE POLICY "Allow anon select exercises" ON exercises FOR SELECT TO anon USING (true);
CREATE POLICY "Allow anon insert exercises" ON exercises FOR INSERT TO anon WITH CHECK (true);
CREATE POLICY "Allow anon update exercises" ON exercises FOR UPDATE TO anon USING (true) WITH CHECK (true);
CREATE POLICY "Allow anon delete exercises" ON exercises FOR DELETE TO anon USING (true);

CREATE POLICY "Allow anon select strength_logs" ON strength_logs FOR SELECT TO anon USING (true);
CREATE POLICY "Allow anon insert strength_logs" ON strength_logs FOR INSERT TO anon WITH CHECK (true);
CREATE POLICY "Allow anon update strength_logs" ON strength_logs FOR UPDATE TO anon USING (true) WITH CHECK (true);
CREATE POLICY "Allow anon delete strength_logs" ON strength_logs FOR DELETE TO anon USING (true);

CREATE POLICY "Allow anon select cardio_logs" ON cardio_logs FOR SELECT TO anon USING (true);
CREATE POLICY "Allow anon insert cardio_logs" ON cardio_logs FOR INSERT TO anon WITH CHECK (true);
CREATE POLICY "Allow anon update cardio_logs" ON cardio_logs FOR UPDATE TO anon USING (true) WITH CHECK (true);
CREATE POLICY "Allow anon delete cardio_logs" ON cardio_logs FOR DELETE TO anon USING (true);


-- -----------------------------------------------------------------------------
-- DEL 3: DATA - training_days (16 rader)
-- -----------------------------------------------------------------------------

INSERT INTO training_days (id, name, sort_order, created_at, user_name) VALUES
('3825b75e-cbb9-43ba-b284-eca65ee892a1', 'Mandag- glute tung', 0, '2026-05-14 08:58:52.234096+00', 'Marisol'),
('ee5ea88d-64a7-4061-80c4-8b3ced678b0f', 'Tirsdag- overkropp', 1, '2026-05-14 08:58:01.344496+00', 'Marisol'),
('3263b0af-92f7-4441-b89d-c020c8a891d2', 'Onsdag- glute/ben', 2, '2026-05-14 08:40:39.971742+00', 'Marisol'),
('029fb3e7-8d91-4c6b-8578-360e0c9515b6', 'Torsdag- overkropp/rygg', 3, '2026-05-14 08:51:30.79602+00', 'Marisol'),
('53b689d5-443a-4984-be8c-d40312758d03', 'Fredag- glute pump', 4, '2026-05-14 08:53:20.114182+00', 'Marisol'),
('c272a855-6af5-4a6a-aad9-d147724117dd', 'Morgen tur', 5, '2026-05-14 11:33:52.035148+00', 'Marisol'),
('a41dee0f-b37e-40fd-883b-05ae84650b8a', 'Overkropp', 0, '2026-05-14 13:26:07.926445+00', 'Therese'),
('a3a78937-78ae-4c2d-8adf-6b8819e8e445', 'glutes og core', 1, '2026-05-14 13:27:08.467432+00', 'Therese'),
('673de365-f841-458c-adc5-e2ee904fc958', 'cardio (løping)', 2, '2026-05-14 13:27:42.077843+00', 'Therese'),
('f70efa5a-1968-445f-88eb-9e859b450f20', 'aktiv hvile', 3, '2026-05-14 13:28:01.994835+00', 'Therese'),
('359daccc-8df6-4495-b964-4fc6d91062e6', 'underkropp og glutes', 4, '2026-05-14 13:29:06.911511+00', 'Therese'),
('8c2b501e-5138-458a-8bc5-af976847bcc2', 'cardio (intervall løping)', 5, '2026-05-14 13:29:33.590181+00', 'Therese'),
('b5dd15aa-e2ed-4a17-b39c-d69b3673e377', 'hvile', 6, '2026-05-14 13:29:53.883378+00', 'Therese'),
('597c7620-78ab-42f0-a11d-6c5cb089dbbc', 'Beindag', 0, '2026-05-15 11:37:43.568476+00', 'Trond'),
('f2c9cd22-30e4-4e8c-bd8d-dbb582194add', 'Overkropp', 1, '2026-05-15 20:30:05.498603+00', 'Trond'),
('53aba60c-f7f6-4d92-bc52-bc62d9979d65', 'Cardio', 2, '2026-05-21 16:45:48.517208+00', 'Trond');


-- -----------------------------------------------------------------------------
-- DEL 4: DATA - exercises (44 rader)
-- -----------------------------------------------------------------------------

INSERT INTO exercises (id, training_day_id, name, type, archived, sort_order, created_at) VALUES
-- Torsdag- overkropp/rygg (Marisol)
('642cf421-5ef8-491b-9366-4d6e09494f28', '029fb3e7-8d91-4c6b-8578-360e0c9515b6', 'Nedtrekk', 'strength', false, 0, '2026-05-14 08:52:08.706459+00'),
('3c8eb44e-63e4-4be4-af65-6c19b27c94a1', '029fb3e7-8d91-4c6b-8578-360e0c9515b6', 'En arm pull down', 'strength', false, 1, '2026-05-14 08:52:17.527445+00'),
('ef12cec5-1a58-4d78-b8c4-dd8cf01d9462', '029fb3e7-8d91-4c6b-8578-360e0c9515b6', 'Sittende roing', 'strength', false, 2, '2026-05-14 08:52:28.888844+00'),
('2ab4ba0b-9dc2-40df-b45f-2e4d02df53c4', '029fb3e7-8d91-4c6b-8578-360e0c9515b6', 'Stående roing', 'strength', false, 3, '2026-05-14 08:52:35.687482+00'),
('5b4c79eb-5099-4c4b-9561-c633ab031cb5', '029fb3e7-8d91-4c6b-8578-360e0c9515b6', 'En arm roing', 'strength', false, 4, '2026-05-14 08:52:45.391551+00'),
('a17fddf0-2beb-4f98-b215-c4b6cf5d6b1e', '029fb3e7-8d91-4c6b-8578-360e0c9515b6', 'Rygghev', 'strength', false, 5, '2026-05-14 08:52:57.272136+00'),
-- Onsdag- glute/ben (Marisol)
('1d23e1e5-3293-4a39-925a-c2b6379fbdd9', '3263b0af-92f7-4441-b89d-c020c8a891d2', 'Hack lift', 'strength', false, 0, '2026-05-14 08:41:36.995906+00'),
('7a0f02c8-9c8f-4c08-be0c-1f692899702e', '3263b0af-92f7-4441-b89d-c020c8a891d2', 'Gående utfall', 'strength', false, 1, '2026-05-14 08:42:23.661027+00'),
('d03ffc45-5bdc-4640-acdf-934d19f3b5fe', '3263b0af-92f7-4441-b89d-c020c8a891d2', 'Leg curl', 'strength', false, 2, '2026-05-14 08:43:56.147649+00'),
('227b2ddb-c31d-4b7e-8091-11213cf94f78', '3263b0af-92f7-4441-b89d-c020c8a891d2', 'Hiptrust', 'strength', false, 3, '2026-05-14 08:44:07.80879+00'),
('3e692fa5-a3df-4975-a5a6-a11971db3690', '3263b0af-92f7-4441-b89d-c020c8a891d2', 'Kickback', 'strength', false, 4, '2026-05-14 08:44:20.413067+00'),
-- Mandag- glute tung (Marisol)
('6f6f2caa-59ee-408f-8d2b-11f3c6e7ee9d', '3825b75e-cbb9-43ba-b284-eca65ee892a1', 'Hiptrust', 'strength', false, 0, '2026-05-15 11:31:27.959695+00'),
('47d6ec61-1052-48de-82c0-bead4679967b', '3825b75e-cbb9-43ba-b284-eca65ee892a1', 'Rumensk markløft', 'strength', false, 1, '2026-05-15 11:31:42.021966+00'),
('c37e7f3f-cc23-4fc6-8093-19a2d9844d6b', '3825b75e-cbb9-43ba-b284-eca65ee892a1', 'Bulgarsk utfall', 'strength', false, 2, '2026-05-15 11:31:54.060832+00'),
('9fc90a57-d96d-4a1e-b203-6efb977829e0', '3825b75e-cbb9-43ba-b284-eca65ee892a1', 'Hofte side kabel', 'strength', false, 3, '2026-05-15 11:32:07.553816+00'),
('17dec6bf-a644-4d7b-9f57-4be89fa71195', '3825b75e-cbb9-43ba-b284-eca65ee892a1', 'Beinpress', 'strength', false, 4, '2026-05-15 11:32:19.489023+00'),
-- Fredag- glute pump (Marisol)
('43fb4a07-b3ae-42a3-9c87-11a74fe30ca9', '53b689d5-443a-4984-be8c-d40312758d03', 'Bulgarsk utfall', 'strength', false, 0, '2026-05-14 08:53:38.407555+00'),
('23b2504b-8b19-4ba8-8cd5-e0d63c9abdf6', '53b689d5-443a-4984-be8c-d40312758d03', 'Hiptrust', 'strength', false, 1, '2026-05-14 08:53:51.078282+00'),
('1c5304d9-0e27-4095-be73-906780609e92', '53b689d5-443a-4984-be8c-d40312758d03', 'Strake markløft', 'strength', false, 2, '2026-05-14 08:56:23.933756+00'),
('4f6034df-00a6-4f35-9785-52db4e4c7878', '53b689d5-443a-4984-be8c-d40312758d03', 'Kickbacks', 'strength', false, 3, '2026-05-14 08:56:50.089155+00'),
('c32f03a2-2f63-43a7-945c-ca4906c7e5eb', '53b689d5-443a-4984-be8c-d40312758d03', 'Hofte side kabel', 'strength', false, 4, '2026-05-14 08:57:16.554486+00'),
-- Beindag (Trond)
('1338acee-a620-48ed-a6f9-ab9c60483ca5', '597c7620-78ab-42f0-a11d-6c5cb089dbbc', 'Calfraises', 'strength', false, 0, '2026-05-15 11:37:57.906555+00'),
('8d9d6c74-d8a7-46de-a1a5-5116cd69a79d', '597c7620-78ab-42f0-a11d-6c5cb089dbbc', 'Knebøy apparat', 'strength', true, 1, '2026-05-15 13:47:12.426191+00'),
('1ef22887-b2f5-45cc-b46d-e4e3715729eb', '597c7620-78ab-42f0-a11d-6c5cb089dbbc', 'Beinpress', 'strength', false, 2, '2026-05-15 13:57:00.272855+00'),
('5842fac1-8bdb-4ed1-829a-099db06dfd2e', '597c7620-78ab-42f0-a11d-6c5cb089dbbc', 'Leg Curl', 'strength', false, 3, '2026-05-15 14:03:26.957897+00'),
('e346a163-b4ba-4e97-b024-fba843c42d0d', '597c7620-78ab-42f0-a11d-6c5cb089dbbc', 'Leg Ex', 'strength', false, 4, '2026-05-15 14:10:15.425877+00'),
('5e7f7286-f0e7-4b37-b661-4a3148033851', '597c7620-78ab-42f0-a11d-6c5cb089dbbc', 'Markløft', 'strength', false, 5, '2026-05-15 14:19:32.254649+00'),
('7801d28a-7193-43ec-9239-f86d923b9e72', '597c7620-78ab-42f0-a11d-6c5cb089dbbc', 'Knebøy i Smith maskin', 'strength', false, 6, '2026-05-21 12:06:54.09672+00'),
-- Morgen tur (Marisol)
('2c9553d7-345b-49bc-b93a-e96acb9aa513', 'c272a855-6af5-4a6a-aad9-d147724117dd', 'Tur ute', 'cardio', false, 0, '2026-05-14 11:34:12.587513+00'),
-- Tirsdag- overkropp (Marisol)
('2dfce00b-ddf6-4879-aae4-897d1036bfb9', 'ee5ea88d-64a7-4061-80c4-8b3ced678b0f', 'Skråbenk med manualer', 'strength', false, 0, '2026-05-15 11:33:51.047586+00'),
('efe29a38-0875-4751-a604-81c3c5044f99', 'ee5ea88d-64a7-4061-80c4-8b3ced678b0f', 'Flyes i maskin', 'strength', false, 1, '2026-05-15 11:34:04.638961+00'),
('41551b96-f903-40fc-abc1-52a9995fe645', 'ee5ea88d-64a7-4061-80c4-8b3ced678b0f', 'Cable cross', 'strength', false, 2, '2026-05-15 11:34:14.400517+00'),
('cd4e1e01-3fef-4373-8e5c-f4997ca28a41', 'ee5ea88d-64a7-4061-80c4-8b3ced678b0f', 'Handel curl', 'strength', false, 3, '2026-05-15 11:34:26.012122+00'),
('143a47fa-7e8f-443d-bd85-5dd245281222', 'ee5ea88d-64a7-4061-80c4-8b3ced678b0f', 'Scott curl stang', 'strength', false, 4, '2026-05-15 11:34:39.394512+00'),
('22872463-cae6-4fc1-826f-607b533f503d', 'ee5ea88d-64a7-4061-80c4-8b3ced678b0f', 'Chrunches', 'strength', false, 5, '2026-05-15 11:34:54.506999+00'),
('e680ed0c-337d-4fdd-a74b-8be3ebc2ab8d', 'ee5ea88d-64a7-4061-80c4-8b3ced678b0f', 'Beintøft', 'strength', false, 6, '2026-05-15 11:35:00.902796+00'),
-- Overkropp (Trond)
('156e68cc-fdfe-47ec-ba34-fc152e9faef6', 'f2c9cd22-30e4-4e8c-bd8d-dbb582194add', 'Skulderpress m/manualer', 'strength', false, 0, '2026-05-15 20:30:21.378484+00'),
('a16ce327-61e7-4776-ba43-ad032ea8cde6', 'f2c9cd22-30e4-4e8c-bd8d-dbb582194add', 'Skråbenk m/manualer', 'strength', false, 1, '2026-05-15 20:30:34.570826+00'),
('2e7306d9-aa52-42c5-b795-ee1baca9b947', 'f2c9cd22-30e4-4e8c-bd8d-dbb582194add', 'Lateral raises', 'strength', false, 2, '2026-05-15 20:30:53.074701+00'),
('d4634eb2-fbba-4e58-bed5-b89166ddbcc6', 'f2c9cd22-30e4-4e8c-bd8d-dbb582194add', 'Biceps skråbenk', 'strength', false, 3, '2026-05-15 20:31:12.720798+00'),
('74d2e808-f2d1-4e22-a757-dc999c89433a', 'f2c9cd22-30e4-4e8c-bd8d-dbb582194add', 'Triceps pulldown', 'strength', false, 4, '2026-05-15 20:31:35.346611+00'),
('c752e60a-0650-4cd5-8db9-1401cdc781db', 'f2c9cd22-30e4-4e8c-bd8d-dbb582194add', 'Nedtrekk smalt grep', 'strength', false, 5, '2026-05-15 20:31:45.392105+00'),
('b95611b4-40cc-4ba7-9665-3028e624c9dd', 'f2c9cd22-30e4-4e8c-bd8d-dbb582194add', 'Sittende roing', 'strength', false, 6, '2026-05-15 20:31:51.983702+00'),
('f858fc81-e335-4f65-bc11-bb1473e863d2', 'f2c9cd22-30e4-4e8c-bd8d-dbb582194add', 'Brystpress apparat', 'strength', false, 7, '2026-05-15 20:32:06.076598+00');


-- -----------------------------------------------------------------------------
-- DEL 5: DATA - strength_logs (56 rader)
-- -----------------------------------------------------------------------------

INSERT INTO strength_logs (id, exercise_id, logged_at, sets, reps, weight_kg, created_at, notes, sets_data) VALUES
('b49313a7-69f9-4e48-a836-07707a22ddbc', '1338acee-a620-48ed-a6f9-ab9c60483ca5', '2026-05-15', 3, 10, 45.00, '2026-05-15 13:41:12.71801+00', '', '[{"set":1,"reps":10,"weight_kg":45},{"set":2,"reps":10,"weight_kg":40},{"set":3,"reps":10,"weight_kg":40}]'),
('14b55c73-0d3f-45da-8e9b-157a77ae253b', '1338acee-a620-48ed-a6f9-ab9c60483ca5', '2026-05-21', 3, 10, 60.00, '2026-05-21 14:02:48.248325+00', '', '[{"set":1,"reps":10,"weight_kg":50},{"set":2,"reps":10,"weight_kg":60},{"set":3,"reps":10,"weight_kg":60}]'),
('4137004f-f892-461a-87a1-1a3cf8f90a5e', '143a47fa-7e8f-443d-bd85-5dd245281222', '2026-05-17', 3, 9, 10.00, '2026-05-17 13:12:07.597933+00', '', '[{"set":1,"reps":12,"weight_kg":5},{"set":2,"reps":8,"weight_kg":10},{"set":3,"reps":8,"weight_kg":10}]'),
('59e8ebf6-3742-484a-8e77-a38290db6fb7', '143a47fa-7e8f-443d-bd85-5dd245281222', '2026-05-20', 3, 9, 10.00, '2026-05-20 14:08:27.126053+00', '', '[{"set":1,"reps":10,"weight_kg":10},{"set":2,"reps":9,"weight_kg":10},{"set":3,"reps":9,"weight_kg":10}]'),
('b669accb-c7f7-4e89-8319-fcabd267222b', '156e68cc-fdfe-47ec-ba34-fc152e9faef6', '2026-05-16', 3, 10, 15.00, '2026-05-16 10:45:25.803343+00', '', '[{"set":1,"reps":10,"weight_kg":15},{"set":2,"reps":10,"weight_kg":15},{"set":3,"reps":10,"weight_kg":15}]'),
('251c2920-fd8d-4274-bdef-f65b59ec92ab', '17dec6bf-a644-4d7b-9f57-4be89fa71195', '2026-05-19', 3, 8, 120.00, '2026-05-19 15:14:03.69768+00', '', '[{"set":1,"reps":8,"weight_kg":120},{"set":2,"reps":8,"weight_kg":120},{"set":3,"reps":8,"weight_kg":120}]'),
('de0482af-2ee4-4e14-9713-45f987316e51', '1c5304d9-0e27-4095-be73-906780609e92', '2026-05-16', 3, 8, 50.00, '2026-05-16 11:08:00.757005+00', '', '[{"set":1,"reps":8,"weight_kg":50},{"set":2,"reps":8,"weight_kg":50},{"set":3,"reps":8,"weight_kg":50}]'),
('f3df560d-2e74-4ec7-acc9-6eaea343e7e4', '1d23e1e5-3293-4a39-925a-c2b6379fbdd9', '2026-05-14', 3, 12, 60.00, '2026-05-14 08:41:59.054193+00', '', '[]'),
('8d0171d4-d153-4c65-b918-f472cf4b22a4', '1ef22887-b2f5-45cc-b46d-e4e3715729eb', '2026-05-15', 3, 10, 80.00, '2026-05-15 13:57:36.666174+00', '', '[{"set":1,"reps":10,"weight_kg":80},{"set":2,"reps":10,"weight_kg":80},{"set":3,"reps":10,"weight_kg":80}]'),
('136cc8d1-6a89-4472-a8d6-7342b79afbf8', '1ef22887-b2f5-45cc-b46d-e4e3715729eb', '2026-05-21', 3, 10, 80.00, '2026-05-21 14:20:55.835069+00', '', '[{"set":1,"reps":10,"weight_kg":80},{"set":2,"reps":10,"weight_kg":80},{"set":3,"reps":10,"weight_kg":80}]'),
('ab0a73be-28ae-4ff2-84cd-99c8233c809d', '227b2ddb-c31d-4b7e-8091-11213cf94f78', '2026-05-14', 3, 12, 20.00, '2026-05-14 08:44:33.52782+00', '', '[]'),
('540c34d5-9162-4ad4-80a8-48e1fc4ecaac', '22872463-cae6-4fc1-826f-607b533f503d', '2026-05-17', 3, 14, 0.00, '2026-05-17 13:12:24.873442+00', '', '[{"set":1,"reps":14,"weight_kg":0},{"set":2,"reps":14,"weight_kg":0},{"set":3,"reps":14,"weight_kg":0}]'),
('2c0f4d8f-77c8-495d-9d8e-efdb5dd1e6cd', '22872463-cae6-4fc1-826f-607b533f503d', '2026-05-20', 3, 12, 2.50, '2026-05-20 14:28:42.805087+00', '', '[{"set":1,"reps":12,"weight_kg":2.5},{"set":2,"reps":12,"weight_kg":2.5},{"set":3,"reps":12,"weight_kg":2.5}]'),
('b2e3851b-ef32-47f2-b3c7-6a32b0aa0eaa', '23b2504b-8b19-4ba8-8cd5-e0d63c9abdf6', '2026-05-16', 3, 12, 20.00, '2026-05-16 10:54:03.225474+00', '', '[{"set":1,"reps":12,"weight_kg":20},{"set":2,"reps":12,"weight_kg":20},{"set":3,"reps":12,"weight_kg":20}]'),
('9d70dc11-d91a-4952-b7e8-56a8819ebeb7', '2ab4ba0b-9dc2-40df-b45f-2e4d02df53c4', '2026-05-15', 3, 12, 15.00, '2026-05-15 09:14:15.147194+00', '', '[{"set":1,"reps":12,"weight_kg":15},{"set":2,"reps":12,"weight_kg":15},{"set":3,"reps":12,"weight_kg":15}]'),
('bfd18e7b-7aed-4934-a481-b27bfa15388f', '2dfce00b-ddf6-4879-aae4-897d1036bfb9', '2026-05-17', 3, 7, 12.50, '2026-05-17 13:08:39.31683+00', '', '[{"set":1,"reps":8,"weight_kg":12.5},{"set":2,"reps":7,"weight_kg":12.5},{"set":3,"reps":7,"weight_kg":12.5}]'),
('c7c1a8eb-573f-4365-85ce-fad0a4491890', '2dfce00b-ddf6-4879-aae4-897d1036bfb9', '2026-05-20', 3, 7, 12.50, '2026-05-20 13:53:10.142581+00', '', '[{"set":1,"reps":7,"weight_kg":12.5},{"set":2,"reps":7,"weight_kg":12.5},{"set":3,"reps":7,"weight_kg":12.5}]'),
('6974cfd4-9c66-4fbd-9fd1-5855105d839a', '2e7306d9-aa52-42c5-b795-ee1baca9b947', '2026-05-16', 3, 10, 5.00, '2026-05-16 11:11:57.261416+00', '', '[{"set":1,"reps":10,"weight_kg":5},{"set":2,"reps":10,"weight_kg":5},{"set":3,"reps":10,"weight_kg":5}]'),
('1d10f9d8-402c-4044-91be-f97d89e3e10e', '3c8eb44e-63e4-4be4-af65-6c19b27c94a1', '2026-05-15', 3, 12, 25.00, '2026-05-15 08:58:50.44855+00', '', '[{"set":1,"reps":12,"weight_kg":25},{"set":2,"reps":12,"weight_kg":25},{"set":3,"reps":12,"weight_kg":25}]'),
('0daca5fa-97f6-43a6-86cd-7bc1bb2c6e4e', '3e692fa5-a3df-4975-a5a6-a11971db3690', '2026-05-14', 3, 12, 30.00, '2026-05-14 09:07:14.454991+00', '', '[]'),
('e839e239-a056-46b0-8483-b477ac718001', '41551b96-f903-40fc-abc1-52a9995fe645', '2026-05-17', 3, 12, 11.00, '2026-05-17 13:10:21.660389+00', '', '[{"set":1,"reps":12,"weight_kg":11},{"set":2,"reps":12,"weight_kg":11},{"set":3,"reps":12,"weight_kg":11}]'),
('e4941d92-6ab1-49cf-b819-53084cd4ce65', '41551b96-f903-40fc-abc1-52a9995fe645', '2026-05-20', 3, 12, 12.00, '2026-05-20 14:22:37.443797+00', '', '[{"set":1,"reps":12,"weight_kg":12},{"set":2,"reps":12,"weight_kg":12},{"set":3,"reps":12,"weight_kg":12}]'),
('d9a4a1a1-aaa5-4c33-9c63-877e55b670f0', '43fb4a07-b3ae-42a3-9c87-11a74fe30ca9', '2026-05-16', 3, 8, 12.50, '2026-05-16 10:43:52.358476+00', '', '[{"set":1,"reps":8,"weight_kg":12.5},{"set":2,"reps":8,"weight_kg":12.5},{"set":3,"reps":8,"weight_kg":12.5}]'),
('1483552a-8cfa-45ae-bb77-2a7e64839522', '47d6ec61-1052-48de-82c0-bead4679967b', '2026-05-15', 3, 12, 50.00, '2026-05-15 11:32:54.338547+00', '', '[{"set":1,"reps":12,"weight_kg":50},{"set":2,"reps":12,"weight_kg":50},{"set":3,"reps":12,"weight_kg":50}]'),
('3ee7d942-99d6-4a58-b36a-783da2333810', '47d6ec61-1052-48de-82c0-bead4679967b', '2026-05-19', 3, 12, 50.00, '2026-05-19 14:48:56.291661+00', '', '[{"set":1,"reps":12,"weight_kg":50},{"set":2,"reps":12,"weight_kg":50},{"set":3,"reps":12,"weight_kg":50}]'),
('d28ee71e-3600-48ee-afb4-64acc45e93c2', '4f6034df-00a6-4f35-9785-52db4e4c7878', '2026-05-16', 3, 12, 30.00, '2026-05-16 11:22:57.103714+00', '', '[{"set":1,"reps":12,"weight_kg":30},{"set":2,"reps":12,"weight_kg":30},{"set":3,"reps":12,"weight_kg":30}]'),
('69305883-a668-4395-a40d-b577f5c71635', '5842fac1-8bdb-4ed1-829a-099db06dfd2e', '2026-05-15', 3, 10, 30.00, '2026-05-15 14:03:38.454352+00', '', '[{"set":1,"reps":10,"weight_kg":30},{"set":2,"reps":10,"weight_kg":30},{"set":3,"reps":10,"weight_kg":30}]'),
('c66bc863-defd-4dfa-8142-5e9852e4acf9', '5842fac1-8bdb-4ed1-829a-099db06dfd2e', '2026-05-21', 3, 10, 40.00, '2026-05-21 14:33:12.731935+00', '', '[{"set":1,"reps":10,"weight_kg":40},{"set":2,"reps":10,"weight_kg":40},{"set":3,"reps":10,"weight_kg":40}]'),
('4af700f2-95f1-420a-8d01-92e9ef6ee53f', '5b4c79eb-5099-4c4b-9561-c633ab031cb5', '2026-05-15', 3, 10, 10.00, '2026-05-15 09:19:59.837462+00', '', '[{"set":1,"reps":10,"weight_kg":10},{"set":2,"reps":10,"weight_kg":10},{"set":3,"reps":10,"weight_kg":10}]'),
('dab53138-dce2-44c1-819e-7328bc1ed535', '5e7f7286-f0e7-4b37-b661-4a3148033851', '2026-05-15', 3, 10, 60.00, '2026-05-15 14:19:39.473599+00', '', '[{"set":1,"reps":10,"weight_kg":60},{"set":2,"reps":10,"weight_kg":60},{"set":3,"reps":10,"weight_kg":60}]'),
('d3307bb2-bf7c-45e8-930c-12d87c520183', '5e7f7286-f0e7-4b37-b661-4a3148033851', '2026-05-21', 3, 10, 60.00, '2026-05-21 14:33:02.204862+00', '', '[{"set":1,"reps":10,"weight_kg":60},{"set":2,"reps":10,"weight_kg":60},{"set":3,"reps":10,"weight_kg":60}]'),
('bca44529-d4bb-44bb-bdb4-b00331677d75', '642cf421-5ef8-491b-9366-4d6e09494f28', '2026-05-15', 3, 10, 40.00, '2026-05-15 08:51:28.326028+00', '', '[{"set":1,"reps":10,"weight_kg":40},{"set":2,"reps":10,"weight_kg":40},{"set":3,"reps":10,"weight_kg":40}]'),
('4bf70667-bc27-4985-b128-aafdc1430be4', '6f6f2caa-59ee-408f-8d2b-11f3c6e7ee9d', '2026-05-15', 3, 12, 20.00, '2026-05-15 11:32:38.164681+00', '', '[{"set":1,"reps":12,"weight_kg":20},{"set":2,"reps":12,"weight_kg":20},{"set":3,"reps":12,"weight_kg":20}]'),
('40f24da6-d1a2-4bc7-90a3-9806f5b0ebdf', '6f6f2caa-59ee-408f-8d2b-11f3c6e7ee9d', '2026-05-19', 3, 12, 30.00, '2026-05-19 14:30:53.993979+00', '', '[{"set":1,"reps":12,"weight_kg":30},{"set":2,"reps":12,"weight_kg":30},{"set":3,"reps":12,"weight_kg":30}]'),
('8677a4f8-89e8-4652-aa98-23b308330527', '74d2e808-f2d1-4e22-a757-dc999c89433a', '2026-05-16', 3, 10, 25.00, '2026-05-16 11:21:25.786801+00', '', '[{"set":1,"reps":10,"weight_kg":25},{"set":2,"reps":10,"weight_kg":25},{"set":3,"reps":10,"weight_kg":25}]'),
('6de1e245-4e2a-475e-b4a5-4ba7696d1831', '7801d28a-7193-43ec-9239-f86d923b9e72', '2026-05-21', 3, 10, 50.00, '2026-05-21 14:02:16.226017+00', '', '[{"set":1,"reps":10,"weight_kg":50},{"set":2,"reps":10,"weight_kg":50},{"set":3,"reps":10,"weight_kg":50}]'),
('2164e0f2-6e5a-4ecf-be24-656a2a10ab55', '7a0f02c8-9c8f-4c08-be0c-1f692899702e', '2026-05-14', 3, 16, 20.00, '2026-05-14 08:42:41.634266+00', '', '[]'),
('aa4825e6-c74e-4267-9b7e-754fc71893db', '8d9d6c74-d8a7-46de-a1a5-5116cd69a79d', '2026-05-15', 3, 10, 40.00, '2026-05-15 13:47:39.291644+00', '', '[{"set":1,"reps":10,"weight_kg":30},{"set":2,"reps":10,"weight_kg":40},{"set":3,"reps":10,"weight_kg":40}]'),
('b4db8495-11ef-46d6-8571-f18b40c717a1', '9fc90a57-d96d-4a1e-b203-6efb977829e0', '2026-05-15', 3, 8, 10.00, '2026-05-15 11:33:32.23925+00', '', '[{"set":1,"reps":8,"weight_kg":10},{"set":2,"reps":8,"weight_kg":10},{"set":3,"reps":8,"weight_kg":10}]'),
('71e04054-76ae-46cc-9bfd-dc63327c86b9', '9fc90a57-d96d-4a1e-b203-6efb977829e0', '2026-05-19', 3, 9, 10.00, '2026-05-19 15:27:51.833986+00', '', '[{"set":1,"reps":9,"weight_kg":10},{"set":2,"reps":9,"weight_kg":10},{"set":3,"reps":9,"weight_kg":10}]'),
('1dcf1a8a-c190-48d4-b0b4-5a5585a50cc2', 'a16ce327-61e7-4776-ba43-ad032ea8cde6', '2026-05-16', 3, 10, 17.50, '2026-05-16 10:59:14.505089+00', '', '[{"set":1,"reps":10,"weight_kg":15},{"set":2,"reps":10,"weight_kg":17.5},{"set":3,"reps":10,"weight_kg":17.5}]'),
('4c337dfd-39d6-485f-8dcd-32b2fe81817d', 'c32f03a2-2f63-43a7-945c-ca4906c7e5eb', '2026-05-16', 3, 10, 10.00, '2026-05-16 11:28:27.903749+00', '', '[{"set":1,"reps":10,"weight_kg":10},{"set":2,"reps":10,"weight_kg":10},{"set":3,"reps":10,"weight_kg":10}]'),
('919e0377-b21f-4bef-8472-86b7c3335021', 'c37e7f3f-cc23-4fc6-8093-19a2d9844d6b', '2026-05-15', 3, 8, 10.00, '2026-05-15 11:33:13.200549+00', '', '[{"set":1,"reps":8,"weight_kg":10},{"set":2,"reps":8,"weight_kg":10},{"set":3,"reps":8,"weight_kg":10}]'),
('6b1c087a-32c6-4b6f-ae83-d771928fe575', 'c37e7f3f-cc23-4fc6-8093-19a2d9844d6b', '2026-05-19', 3, 9, 10.00, '2026-05-19 15:00:30.476263+00', '', '[{"set":1,"reps":9,"weight_kg":10},{"set":2,"reps":9,"weight_kg":10},{"set":3,"reps":9,"weight_kg":10}]'),
('0e4a4fa5-ed00-42b9-9d71-246790a79d32', 'c752e60a-0650-4cd5-8db9-1401cdc781db', '2026-05-16', 3, 10, 45.00, '2026-05-16 11:22:34.948679+00', '', '[{"set":1,"reps":10,"weight_kg":45},{"set":2,"reps":10,"weight_kg":40},{"set":3,"reps":10,"weight_kg":40}]'),
('ff3aa979-10c3-46b4-a7f7-908c98781395', 'cd4e1e01-3fef-4373-8e5c-f4997ca28a41', '2026-05-17', 3, 9, 10.00, '2026-05-17 13:10:45.635646+00', '', '[{"set":1,"reps":10,"weight_kg":10},{"set":2,"reps":9,"weight_kg":10},{"set":3,"reps":9,"weight_kg":10}]'),
('52d35189-037d-4e63-bb8a-d694c81030f5', 'cd4e1e01-3fef-4373-8e5c-f4997ca28a41', '2026-05-20', 3, 10, 10.00, '2026-05-20 13:59:18.915943+00', '', '[{"set":1,"reps":10,"weight_kg":10},{"set":2,"reps":10,"weight_kg":10},{"set":3,"reps":10,"weight_kg":10}]'),
('e3941e99-0a5c-4479-a9de-52476ab6082d', 'd03ffc45-5bdc-4640-acdf-934d19f3b5fe', '2026-05-14', 3, 12, 15.00, '2026-05-14 09:21:21.861038+00', '', '[]'),
('8070ad49-9289-4bd7-8330-d4d84de10425', 'd4634eb2-fbba-4e58-bed5-b89166ddbcc6', '2026-05-16', 3, 10, 10.00, '2026-05-16 10:59:26.327784+00', '', '[{"set":1,"reps":10,"weight_kg":10},{"set":2,"reps":10,"weight_kg":10},{"set":3,"reps":10,"weight_kg":10}]'),
('6764fd13-3ce4-48c2-a1ce-a34a1013b5fe', 'e346a163-b4ba-4e97-b024-fba843c42d0d', '2026-05-15', 3, 10, 45.00, '2026-05-15 14:10:38.595056+00', '', '[{"set":1,"reps":10,"weight_kg":45},{"set":2,"reps":10,"weight_kg":45},{"set":3,"reps":10,"weight_kg":45}]'),
('a6012ca2-c95f-4fd7-8933-77c8b97290a1', 'e346a163-b4ba-4e97-b024-fba843c42d0d', '2026-05-21', 3, 10, 40.00, '2026-05-21 14:41:31.229867+00', '', '[{"set":1,"reps":10,"weight_kg":40},{"set":2,"reps":10,"weight_kg":40},{"set":3,"reps":10,"weight_kg":40}]'),
('e7d29def-d3a8-4e24-baf1-8a4b2818681b', 'e680ed0c-337d-4fdd-a74b-8be3ebc2ab8d', '2026-05-17', 3, 12, 0.00, '2026-05-17 13:12:37.615212+00', '', '[{"set":1,"reps":12,"weight_kg":0},{"set":2,"reps":12,"weight_kg":0},{"set":3,"reps":12,"weight_kg":0}]'),
('00fc7b6b-5d40-4b4f-a97a-8a9a34ed7b18', 'e680ed0c-337d-4fdd-a74b-8be3ebc2ab8d', '2026-05-20', 3, 12, 0.00, '2026-05-20 14:35:33.778258+00', '', '[{"set":1,"reps":12,"weight_kg":0},{"set":2,"reps":12,"weight_kg":0},{"set":3,"reps":12,"weight_kg":0}]'),
('da842c6e-d8a3-4c30-8dc6-ae5d541305a1', 'ef12cec5-1a58-4d78-b8c4-dd8cf01d9462', '2026-05-15', 3, 8, 40.00, '2026-05-15 09:05:28.112856+00', '', '[{"set":1,"reps":8,"weight_kg":40},{"set":2,"reps":8,"weight_kg":40},{"set":3,"reps":8,"weight_kg":40}]'),
('0b732ef4-f738-40d0-b21d-c208b42691b2', 'efe29a38-0875-4751-a604-81c3c5044f99', '2026-05-17', 3, 12, 12.00, '2026-05-17 13:10:05.643707+00', '', '[{"set":1,"reps":12,"weight_kg":10},{"set":2,"reps":12,"weight_kg":12},{"set":3,"reps":12,"weight_kg":12}]'),
('0dc8e7b8-4b31-4975-82e1-f6b8c8cb6621', 'efe29a38-0875-4751-a604-81c3c5044f99', '2026-05-20', 3, 10, 15.00, '2026-05-20 14:15:46.029356+00', '', '[{"set":1,"reps":10,"weight_kg":15},{"set":2,"reps":10,"weight_kg":15},{"set":3,"reps":10,"weight_kg":15}]');


-- -----------------------------------------------------------------------------
-- DEL 6: DATA - cardio_logs (7 rader)
-- -----------------------------------------------------------------------------

INSERT INTO cardio_logs (id, exercise_id, logged_at, steps, distance_km, created_at, duration_minutes, avg_heart_rate, notes) VALUES
('bde33872-36c9-4261-a45a-67ab2031d306', '2c9553d7-345b-49bc-b93a-e96acb9aa513', '2026-05-14', 0, 3.00, '2026-05-15 05:15:26.178744+00', NULL, NULL, ''),
('2898231a-0aa6-43b6-b564-5c01f2bdcfad', '2c9553d7-345b-49bc-b93a-e96acb9aa513', '2026-05-14', 0, 9.10, '2026-05-15 05:16:04.973272+00', NULL, NULL, ''),
('12615a1b-6e62-41cb-a3d2-72a57f52225c', '2c9553d7-345b-49bc-b93a-e96acb9aa513', '2026-05-15', 0, 4.50, '2026-05-15 05:16:44.978057+00', NULL, NULL, ''),
('61121835-1363-458a-8647-9dddd8baf4ad', '2c9553d7-345b-49bc-b93a-e96acb9aa513', '2026-05-18', 0, 3.08, '2026-05-21 05:11:55.427225+00', 34.96666666666667, NULL, ''),
('1da4ea7f-678a-4a7e-85f9-66f5d471a949', '2c9553d7-345b-49bc-b93a-e96acb9aa513', '2026-05-19', 0, 3.07, '2026-05-21 05:12:32.558482+00', 35.31666666666667, NULL, ''),
('46e64a1f-f232-4cd5-917b-d7e88289d80b', '2c9553d7-345b-49bc-b93a-e96acb9aa513', '2026-05-20', 0, 3.12, '2026-05-21 05:13:54.55182+00', 36.35, NULL, ''),
('2ff058d4-c6a3-4bf7-85ad-afbf15ef29e5', '2c9553d7-345b-49bc-b93a-e96acb9aa513', '2026-05-21', 0, 3.08, '2026-05-21 05:14:35.940193+00', 35.916666666666664, NULL, '');


-- =============================================================================
-- FERDIG! Alle tabeller er opprettet og all data er importert.
-- Send meg din nye Project URL og Anon Key så oppdaterer jeg koden.
-- =============================================================================
