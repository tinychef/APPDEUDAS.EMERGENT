# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**FreeDueda / AppDeudas** — A mobile-first debt and loan management app. Users enter mortgage/loan parameters and extra payments; the app calculates amortization schedules and savings.

The repo is structured as a monorepo under `apps/`:
- `apps/mobile/` — Expo (React Native) frontend (primary active codebase)
- `apps/api/` — FastAPI + MongoDB backend (Python)

> Note: The README references `frontend/` and `backend/` directories, but the actual code lives under `apps/mobile/` and `apps/api/`.

## Mobile App Commands

All commands run from `apps/mobile/`:

```bash
cd apps/mobile

# Start dev server
yarn start

# Platform-specific
yarn android
yarn ios
yarn web

# Lint
yarn lint
```

The project uses **yarn** (v1.22) as its package manager — not npm.

## Backend Commands

From `apps/api/`:

```bash
cd apps/api

# Install dependencies
pip install -r requirements.txt

# Run dev server
uvicorn server:app --reload
# API at http://localhost:8000, docs at http://localhost:8000/docs
```

Backend requires a `.env` file with:
```
MONGO_URL=mongodb+srv://...
DB_NAME=app_deudas
```

## Architecture

### Mobile App (`apps/mobile/`)

**Routing**: Expo Router (file-based). Entry at `app/_layout.tsx`.
- `app/_layout.tsx` — Root layout: initializes SQLite DB, handles Supabase auth session, shows animated splash screen, redirects to `/login` or `/(tabs)` based on auth state.
- `app/login.tsx` — Auth screen
- `app/setup.tsx` — Modal for initial loan setup
- `app/(tabs)/` — Main tab navigator: Home (`index`), Pagos (`abonos`), Stats (`cronograma`), Simular, Perfil (`config`)

**State Management**: Zustand (`store/debtStore.ts`)
- Central store for `LoanParams`, `ExtraPayment[]`, and computed `AmortizationResult`
- Calls `calcularAmortizacion()` synchronously (wrapped in 100ms setTimeout for UX) on every mutation
- Initializes with hardcoded demo data (a real mortgage from an Excel spreadsheet)

**Core Calculation Engine** (`utils/amortizacion.ts`)
- Pure TypeScript — no dependencies
- `calcularAmortizacion(params, abonos)` produces two parallel schedules: with and without extra payments
- Implements **REDUCIR_PLAZO** strategy only (extra payments reduce term, not monthly payment). `REDUCIR_CUOTA` field exists but is not yet implemented.
- Rate conversion: EA (annual effective) → EM (monthly effective) via `tasaEAtoEM()`
- Currency formatted as Colombian Pesos (COP) via `Intl.NumberFormat('es-CO')`

**Local Persistence**: SQLite via `expo-sqlite`
- `data/local/db.ts` — Singleton DB with versioned migrations (WAL mode, FK constraints enabled)
- `data/local/migrations.ts` — Migration functions per schema version
- `data/local/repositories/debtsRepository.ts` — Repository pattern for DB access
- To add a new migration: create `migrateToVN(db)`, add to `MIGRATIONS` registry in `db.ts`, increment `CURRENT_SCHEMA_VERSION`

**Auth**: Supabase (`lib/supabase.ts`)
- Uses `AsyncStorage` for session persistence on native, standard storage on web
- Auth flow managed in root `_layout.tsx` via `supabase.auth.onAuthStateChange`

**Design System** (`constants/theme.ts`)
- Brand color: `#820AD1` (purple)
- Exports `DarkColors`, `LightColors`, and `Colors` (= `DarkColors` for backwards compat)
- Also exports `Typography`, `Spacing`, `BorderRadius`, `Shadows`, `Animation`
- `GlassCard` is the primary card primitive; use `variant` prop for semantic borders

**Key Components**:
- `components/GlassCard.tsx` and `components/ui/GlassCard.tsx` — glass-morphism card (two copies exist; prefer `components/ui/`)
- `components/layout/ResponsiveLayout.tsx` — wraps tablet/desktop layout
- `hooks/useIsDesktop.ts` — detects desktop breakpoint via `@expo/match-media`

### Path Aliases

`@/*` maps to `apps/mobile/*` (configured in `tsconfig.json`).

### TypeScript

Strict mode enabled. Expo SDK 54, React 19, React Native 0.81.
