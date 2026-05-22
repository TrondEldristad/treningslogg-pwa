# 🏋️ Treningslogg PWA

En moderne treningstracker-app for å logge og følge med på styrke- og kardioøvelser.

## ✨ Funksjoner

- 📊 **Logg økter:** Detaljert logging av styrke (sett/reps/vekt) og kardio (distanse/varighet)
- 📅 **Treningsdager:** Organisér øvelser i ukentlige treningsdager
- 📈 **Ukentlig oversikt:** Se hvilke øvelser du har gjennomført denne uken
- 👥 **Multi-bruker:** Støtte for 3 brukerprofiler med passordbeskyttelse
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
   - Gå til SQL Editor
   - Kjør `MIGRATE_TO_NEW_SUPABASE.sql` (i rot-mappen)

4. **Konfigurer miljøvariabler:**
   - Kopier `.env.example` til `.env`
   - Fyll inn Supabase credentials:
     ```bash
     VITE_SUPABASE_URL=https://your-project.supabase.co
     VITE_SUPABASE_ANON_KEY=your-anon-key
     ```

5. **Endre passord (VIKTIG!):**
   - Åpne `src/config/profiles.ts`
   - Endre passord for hver bruker
   - Default passord: `treninglogg2026`

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

## 🛡️ Sikkerhet

⚠️ **Viktig sikkerhetsinformasjon:**

- Denne appen bruker **frontend-basert passordbeskyttelse**
- Passord er obfuskert i kildekode, men **ikke kryptografisk sikret**
- Egnet for **privat bruk** med betrodde brukere
- Supabase API-nøkler er synlige i kompilert kode (standard for frontend-apper)
- Row Level Security (RLS) beskytter database-operasjoner

**Anbefalt bruk:**
- ✅ Privat app for familie/venner
- ❌ Ikke for sensitive persondata
- ❌ Ikke for offentlige tjenester

**For skalering:**
Implementer Supabase Auth med `auth.uid()` for ekte brukerautentisering.

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
├── config/          # Konfigurasjon (passord, etc.)
├── context/         # React Context (profil-state)
├── hooks/           # Custom React hooks
├── lib/             # Supabase client
├── views/           # Hovedvisninger (Logg, Oversikt, Innstillinger)
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

## 📄 Lisens

Private use only.

## 🙏 Credits

Bygget med moderne web-teknologier og kjærlighet til trening! 💪
