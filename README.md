# 🏋️ Treningslogg PWA

En moderne treningstracker-app for å logge og følge med på styrke- og kardioøvelser.

## ✨ Funksjoner

- 🎯 **Drag-and-drop:** Endre rekkefølgen på øvelser innenfor hver treningsdag
- 💪 **Intensitetsvurdering:** Marker hver styrkeøkt som lett, passe, eller tungt
- 📊 **Logg økter:** Detaljert logging av styrke (sett/reps/vekt) og kardio (distanse/varighet)
- 🔄 **Smart defaults:** Nye økter fylles automatisk med verdier fra siste økt
- 📅 **Treningsdager:** Organisér øvelser i ukentlige treningsdager
- 📈 **Ukentlig oversikt:** Se hvilke øvelser du har gjennomført denne uken
- 👥 **Multi-bruker:** Støtte for flere brukerprofiler med individuelle passord
- 🔐 **Moderne innlogging:** Tekstfelt-basert innlogging med autocomplete-støtte
- 📱 **PWA:** Installer som app på mobil og tablet
- 🎨 **Mørkt tema:** Øyevennlig dark mode design

## 🚀 Kom i gang

### Forutsetninger

- Node.js 18+ og npm
- Supabase-konto ([gratis tier](https://supabase.com))

### Installasjon

1. **Klon repository:**
   ```bash
   git clone https://github.com/<username>/treningslogg-pwa.git
   cd treningslogg-pwa
   ```

2. **Installer dependencies:**
   ```bash
   npm install
   ```

3. **Sett opp database:**
   - Opprett nytt prosjekt på [supabase.com](https://supabase.com)
   - Gå til SQL Editor i ditt nye prosjekt
   - Kjør migreringsfilene i `supabase/migrations/` i kronologisk rekkefølge:
     1. `20260513142646_create_workout_tracker_schema.sql`
     2. `20260513143249_add_user_id_and_fix_rls.sql`
     3. `20260513143609_relax_rls_to_anon_with_user_id_check.sql`
     4. `20260513143640_fix_rls_for_single_user_personal_app.sql`
     5. `20260514085322_fix_rls_policies_restrict_by_user_name.sql`
     6. `20260515052339_add_trond_user_and_duration_minutes.sql`
     7. `20260515113339_add_trond_to_user_name_check_constraint.sql`

4. **Konfigurer miljøvariabler:**
   - Kopier `.env.example` til `.env`
   - Fyll inn Supabase credentials:
     ```bash
     VITE_SUPABASE_URL=https://your-project.supabase.co
     VITE_SUPABASE_ANON_KEY=your-anon-key
     ```

5. **Konfigurer brukere og passord (VIKTIG!):**
   - Åpne `src/config/profiles.ts`
   - Standard brukere:
     - **Brukernavn:** `marisol` | **Passord:** `marisolPass2026`
     - **Brukernavn:** `therese` | **Passord:** `theresePass2026`
     - **Brukernavn:** `trond` | **Passord:** `trondPass2026`
   - **Endre passordene** før produksjon!
   
   For å legge til ny bruker:
   ```typescript
   // I profiles.ts, legg til i users array:
   {
     username: 'nyttbrukernavn',
     displayName: 'Visningsnavn',
     passwordHash: obfuscate('dittpassord'),
     color: 'rose' // eller 'cyan', 'amber'
   }
   ```
   
   Husk også å oppdatere:
   - `UserName` type i `src/context/ProfileContext.tsx`
   - RLS policies i Supabase (se `supabase/migrations/`)

6. **Start dev-server:**
   ```bash
   npm run dev
   ```

   Åpne [http://localhost:5173](http://localhost:5173)

## 📦 Deployment til Netlify

1. **Push til GitHub:**
   ```bash
   git remote add origin https://github.com/<username>/treningslogg-pwa.git
   git push -u origin main
   ```

2. **Koble Netlify:**
   - Gå til [netlify.com](https://netlify.com)
   - "Add new site" > "Import an existing project"
   - Velg GitHub og ditt repository

3. **Miljøvariabler:**
   - Site settings > Environment variables
   - Legg til:
     - `VITE_SUPABASE_URL`
     - `VITE_SUPABASE_ANON_KEY`

4. **Deploy:**
   - Build-settings hentes automatisk fra `netlify.toml`
   - Første deploy starter automatisk

## 🔐 Innlogging

**Standard brukere:**

| Brukernavn (case-insensitive) | Passord | Farge |
|-------------------------------|---------|-------|
| `marisol` | `marisolPass2026` | Rose |
| `therese` | `theresePass2026` | Cyan |
| `trond` | `trondPass2026` | Amber |

**Funksjoner:**
- Case-insensitive brukernavn (kan skrive "Marisol", "marisol", eller "MARISOL")
- Autocomplete-støtte for iOS Keychain og Chrome Password Manager
- 7-dagers session (automatisk pålogget i en uke)
- Vis/skjul passord-funksjonalitet

**⚠️ Endre passordene før produksjon!**

## 🛡️ Sikkerhet

⚠️ **Viktig sikkerhetsinformasjon:**

- Denne appen bruker **frontend-basert passordbeskyttelse**
- Passord er obfuskert (base64 + reversering), men **ikke kryptografisk sikret**
- Hvert brukernavn har sitt eget individuelle passord
- Egnet for **privat bruk** med betrodde brukere
- Supabase API-nøkler er synlige i kompilert kode (standard for frontend-apper)
- Row Level Security (RLS) beskytter database-operasjoner

**Anbefalt bruk:**
- ✅ Privat app for familie/venner
- ✅ Små lukkede grupper med individuelt passord
- ❌ Ikke for sensitive persondata
- ❌ Ikke for offentlige tjenester

**For bedre sikkerhet og skalering:**
Implementer Supabase Auth med bcrypt-hashing og database-basert brukerautentisering. Se issues/discussions for veiledning.

## 👤 Legge til nye brukere

**Steg 1: Oppdater brukerliste**
Åpne `src/config/profiles.ts` og legg til ny bruker i `users` array:

```typescript
{
  username: 'emma',              // Lowercase, brukes ved innlogging
  displayName: 'Emma',           // Visningsnavn i UI
  passwordHash: obfuscate('emmasPassord123'),
  color: 'rose'                  // 'rose', 'cyan', eller 'amber'
}
```

**Steg 2: Oppdater TypeScript type**
Åpne `src/context/ProfileContext.tsx` og legg til i `UserName` type:

```typescript
export type UserName = 'Marisol' | 'Therese' | 'Trond' | 'Emma';
```

**Steg 3: Oppdater database RLS policies**
Kjør SQL-kommando i Supabase SQL Editor:

```sql
-- Oppdater training_days policies
DROP POLICY IF EXISTS "Users can insert own training days" ON public.training_days;
CREATE POLICY "Users can insert own training days"
  ON public.training_days FOR INSERT
  WITH CHECK (user_name IN ('Marisol', 'Therese', 'Trond', 'Emma'));

-- Gjenta for alle policies i exercises, strength_logs, og cardio_logs tabeller
-- Se supabase/migrations/ for fullstendig liste
```

**Steg 4: Deploy**

```bash
npm run build
git add .
git commit -m "feat: Legg til Emma som ny bruker"
git push
```

Den nye brukeren kan nå logge inn med brukernavn `emma` (case-insensitive) og passordet du satte!

## 📱 Bruk som PWA

**iOS:**
1. Åpne app i Safari
2. Trykk "Del"-ikonet
3. Velg "Legg til på Hjem-skjerm"

**Android:**
1. Åpne app i Chrome
2. Trykk meny (tre prikker)
3. Velg "Installer app"

## 🏗️ Teknisk stack

- **Frontend:** React 18, TypeScript 5
- **Styling:** Tailwind CSS 3
- **Database:** Supabase (PostgreSQL)
- **Build:** Vite 5
- **Hosting:** Netlify
- **Ikoner:** Lucide React

## 📂 Prosjektstruktur

```
src/
├── components/      # Gjenbrukbare UI-komponenter
│   ├── ProfileSelector.tsx     # Innloggingsskjerm
│   ├── StrengthLogForm.tsx     # Styrkeøkt-skjema
│   ├── CardioLogForm.tsx       # Kardioøkt-skjema
│   └── ...
├── config/          # Konfigurasjon
│   └── profiles.ts             # Brukere og passord
├── context/         # React Context
│   └── ProfileContext.tsx      # Bruker-state og session
├── hooks/           # Custom React hooks
│   ├── useTrainingDays.ts
│   ├── useExercises.ts
│   └── useLogs.ts
├── lib/             # Tredjeparts-integrasjoner
│   └── supabase.ts             # Supabase client
├── views/           # Hovedvisninger
│   ├── LogView.tsx             # Logg økter
│   ├── OverviewView.tsx        # Statistikk
│   ├── SettingsView.tsx        # Innstillinger
│   └── ExerciseDetail.tsx      # Detaljer per øvelse
├── types.ts         # TypeScript type definitions
└── App.tsx          # Root komponent
```

## 🧪 Testing

```bash
# Type-sjekk
npm run typecheck

# Lint
npm run lint

# Build (test produksjon)
npm run build
npm run preview
```

## 📝 Scripts

- `npm run dev` - Start dev-server
- `npm run build` - Bygg for produksjon
- `npm run preview` - Preview produksjonsbygg
- `npm run lint` - Kjør ESLint
- `npm run typecheck` - TypeScript type-sjekk

## 🆕 Nylige endringer

### v2.1 - Drag-and-drop og intensitetsvurdering (2026-05-25)
- 🎯 **Drag-and-drop øvelser:** Endre rekkefølgen på øvelser innenfor en treningsdag med intuitiv dra-og-slipp
- 💪 **Intensitetsvurdering:** Vurder hver styrkeøkt som Lett (🟢), Passe (🟡), eller Tungt (🔴)
- 📱 **Touch-optimalisert:** 150ms delay på mobil for bedre touch-opplevelse
- 🎨 **Synlig grip-håndtak:** Tydelig visuelt håndtak for å dra øvelser
- 📊 **Intensitet i historikk:** Se intensitetsvurdering på tidligere økter med farget indikator
- 💾 **Bakoverkompatibel:** Gamle økter uten intensitetsvurdering vises som normalt

### v2.0 - Forbedret innlogging og smart defaults (2026-05-24)
- ✨ **Ny innloggingsmetode:** Tekstfelt-basert innlogging med brukernavn + passord
- 🔐 **Individuelle passord:** Hver bruker har nå sitt eget unike passord
- 🔄 **Smart defaults:** Loggskjemaer fylles automatisk med verdier fra siste økt
- 🎯 **Case-insensitive:** Brukernavn kan skrives med stor/liten bokstav
- 🔑 **Autocomplete:** Støtte for iOS Keychain og Chrome Password Manager
- 📱 **Bedre UX:** Enklere og mer intuitiv innloggingsprosess

### v1.0 - Initial release
- 📊 Grunnleggende logging av styrke- og kardioøvelser
- 👥 Multi-bruker støtte
- 📱 PWA-funksjonalitet
- 🎨 Mørkt tema

## 📄 Lisens

Private use only.

## 🙏 Credits

Bygget med moderne web-teknologier og kjærlighet til trening! 💪
