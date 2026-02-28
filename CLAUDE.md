# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**DebtMap** is a mortgage/loan amortization optimizer for the Colombian market. Users configure a loan, add extra payments (abonos), and the app calculates savings in interest and time. The domain language is Spanish throughout: `prestamo` (loan), `abonos` (extra payments), `cuota` (installment), `tasa` (rate), `plazo` (term).

---

## Commands

### Frontend

```bash
cd frontend
npm install          # install dependencies
npm start            # start Expo dev server (scan QR or press a/i)
npx expo start --android
npx expo start --ios
npm run lint         # ESLint
npm run reset-project  # reset to blank Expo template
```

### Backend

```bash
cd backend
pip install -r requirements.txt
uvicorn server:app --reload   # runs on http://localhost:8000
# Interactive API docs: http://localhost:8000/docs
```

Backend requires a `.env` file:
```env
MONGO_URL=mongodb+srv://<user>:<password>@cluster.mongodb.net/?retryWrites=true&w=majority
DB_NAME=app_deudas
```

---

## Architecture

### Data Flow

```
User Input (Screens)
  → useDebtStore (Zustand) [frontend/store/debtStore.ts]
  → calcularAmortizacion() [frontend/utils/amortizacion.ts]
  → resultado: AmortizationResult
  → UI components consume resultado directly from store
```

All financial calculations happen **client-side in TypeScript** — the backend is a minimal MVP (health check + MongoDB status) and is not yet wired to the frontend.

### Core Calculation Engine (`frontend/utils/amortizacion.ts`)

This is the heart of the app — a direct port of Excel amortization logic:
- `tasaEAtoEM(tasaEA)` — converts annual effective rate to monthly effective rate
- `calcularCuotaMensual(monto, tasaEM, plazoMeses)` — standard loan payment formula
- `calcularAmortizacion(params, abonos)` — builds two parallel schedules: one baseline (no extra payments) and one with extra payments, then returns a `resumen` comparing them

The `estrategia` field (`REDUCIR_PLAZO` vs `REDUCIR_CUOTA`) is stored in state but the current engine always uses `REDUCIR_PLAZO` behavior (extra payments reduce remaining term, not monthly payment).

### State Management (`frontend/store/debtStore.ts`)

Single Zustand store `useDebtStore` holds:
- `prestamo: LoanParams` — loan configuration
- `abonos: ExtraPayment[]` — list of extra payments indexed by `cuota` (installment number)
- `resultado: AmortizationResult | null` — computed output
- `hasSetup: boolean` — whether the user has configured a loan (gates the setup modal)

The store initializes with demo data (a $101.4M mortgage at 12.01% EA, 180 months) so the app is immediately usable.

`recalculate()` is called after every mutation; it uses a 100ms `setTimeout` to keep the UI responsive.

### Screen Organization (Expo Router tabs)

| File | Screen | Purpose |
|------|--------|---------|
| `app/(tabs)/index.tsx` | Dashboard | KPIs, ProgressRing, balance chart, savings summary |
| `app/(tabs)/abonos.tsx` | Abonos | Timeline of extra payments, modal to add/edit |
| `app/(tabs)/cronograma.tsx` | Cronograma | Full payment schedule table with filters |
| `app/(tabs)/simular.tsx` | Simular | What-if sliders + projection chart |
| `app/(tabs)/config.tsx` | Config | Loan params, reset, demo loader |
| `app/setup.tsx` | Setup | Modal for first-time loan configuration |

### Theme System (`frontend/constants/theme.ts`)

Dark premium theme (Uber/Robinhood-inspired):
- Primary: `#00D4FF` (electric cyan)
- Positive: `#00E676` (green)
- Alert: `#FF6B35` (orange)
- Background: `#0A0A0F` (near black)
- Glass cards use `rgba` with `expo-blur` for glassmorphism effect

All screens use `theme.colors`, `theme.typography`, and `theme.spacing` — do not hardcode color values.

### Backend (`backend/server.py`)

Minimal FastAPI app. All routes are under `/api`. Currently only has status check endpoints. MongoDB collections accessed via Motor async client.

---

## Key TypeScript Types

```typescript
LoanParams    // monto, tasaEA, plazoMeses, fechaDesembolso, estrategia
ExtraPayment  // cuota (installment #), monto, fecha
PaymentRow    // one row in the amortization table
AmortizationResult // { cronograma, cronogramaSinAbonos, resumen }
```

Currency formatting uses `es-CO` locale (Colombian Peso, COP). Use `formatCurrency()` and `formatShortCurrency()` from `amortizacion.ts` — never format money manually.
