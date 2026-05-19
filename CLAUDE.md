# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

The [Health Equity Tracker](https://healthequitytracker.org/) aggregates demographic health data by race, ethnicity, sex, and socioeconomic status across the US. It consists of a React frontend, lightweight Node server, Python data server, and a GCP-hosted data pipeline.

## Commands

All frontend commands run from `frontend/`:

```bash
npm run localhost        # Start dev server at localhost:3000 (also starts tsc --watch)
npm run test             # Run Vitest unit tests once
npm run test:watch       # Run Vitest in watch mode
npm run cleanup          # Lint + format with Biome (runs pre-commit)
npx tsc --noEmit         # Type-check TypeScript

# Run a single E2E test file (dev server must be running)
npm run e2e statins.nightly.spec.ts
npm run e2e hiv          # Matches any filename containing "hiv"
```

Python tests run from the repo root with the venv activated (`source .venv/bin/activate`):

```bash
pip install python/data_server/ python/datasources/ python/ingestion/ && pytest python/tests/
pip install python/datasources/ && pytest python/tests/datasources/test_cdc_hiv.py -s
```

## Architecture

### Three-Tier Frontend

```
frontend/         React app (TypeScript, Vite, MUI v7, Tailwind v4, D3, Jotai)
frontend_server/  Lightweight Node server — serves React static files, proxies data requests
data_server/      Python Flask server — responds with JSON files exported from BigQuery
```

### Backend Data Pipeline

```
run_ingestion/  →  GCS bucket  →  run_gcs_to_bq/  →  BigQuery  →  exporter/  →  GCS JSON  →  data_server/
(fetch raw data)                  (runs DataSource                  (splits county
                                   modules in /python)               files by state)
```

Each backend microservice is a Docker container triggered by Cloud Run. GitHub Actions workflows in `.github/workflows/dag*.yml` orchestrate the pipeline runs (one DAG per data source).

**Testing backend changes:** Push your branch to the shared `infra-test` branch to trigger a GCP deployment:
```bash
git push origin HEAD:infra-test -f
```
Then run the relevant DAG workflow from GitHub Actions against the test project.

### Frontend Data Flow

The URL encodes the entire report state via URL params. The "MadLib" pattern (`disparity` / `comparegeos` / `comparevars` modes) is the query-builder UI — users fill in topic, geography, and demographic group.

```
URL params (mls, dt1, demo, etc.)
  → MadLib selection state (src/utils/MadLibs.ts)
    → MetricQuery (src/data/query/MetricQuery.ts)
      → DataManager (src/data/loading/DataManager.ts) — LRU cache
        → VariableProvider (per-topic, src/data/providers/)
          → JSON fetch from data_server
            → MetricQueryResponse → Cards render charts
```

Global UI state is managed with Jotai atoms, URL-synced via `jotai-location` (`src/utils/sharedSettingsState.ts`).

### Adding a New Health Topic

Both frontend and backend changes are required:

**Frontend:**
1. Create `src/data/config/MetricConfig<Topic>.ts` — define `MetricId`s, `DataTypeId`s, and chart configs
2. Register the new `DropdownVarId` in `src/data/config/DropDownIds.ts`
3. Create `src/data/config/DatasetMetadata<Topic>.ts` — list dataset IDs consumed
4. Create `src/data/providers/<Topic>Provider.ts` — extends `VariableProvider`, maps metrics to dataset files
5. Register provider in `src/data/loading/VariableProviderMap.ts`

**Backend:**
1. Create `python/datasources/<source>.py` — extends `DataSource`, implements `write_to_bq()`
2. Register in `python/datasources/data_sources.py`
3. Add a DAG GitHub Actions workflow `.github/workflows/dag<Source>.yml`

### Design System / Theme Architecture

Design tokens are defined once in W3C DTCG JSON and generated into typed TS + CSS files by [Terrazzo](https://terrazzo.app/) (`tsx run-tokens.ts`):

```
frontend/tokens/                   ← edit these
  colors.tokens.json
  typography.tokens.json
  dimensions.tokens.json
        ↓  npm run tokens  (auto-runs on install, predev, prebuild)
src/styles/tokens/                 ← DO NOT EDIT (gitignored, generated)
  colors.ts      — colors { altGreen: '#0b5240', … }
  colors.css     — @theme block for Tailwind utility generation
  typography.ts  — typography { fontSansText: "'Inter Variable'…", … }
  typography.css
  dimensions.ts  — dimensions { radiusSm: '4px', … } + breakpoints { sm: '600px', … }
  dimensions.css
```

**Token API — always import raw values, use directly:**
```ts
import { colors }                             from '../../styles/tokens/colors'
import { typography }                         from '../../styles/tokens/typography'
import { dimensions, breakpoints }            from '../../styles/tokens/dimensions'
import { type Breakpoint }                    from '../../styles/tokens/dimensions'

colors.altGreen          // '#0b5240'
typography.fontSansText  // "'Inter Variable', sans-serif"
dimensions.radiusSm      // '4px'
breakpoints.sm           // '600px'  ← short keys for useIsBreakpointAndUp
```

CSS vars are a Tailwind implementation detail — `@theme` registers tokens so utility classes like `bg-alt-green` work; app code never references `var(--color-*)` directly.

**Styling rules:**
- Always prefer Tailwind utility classes as the primary method
- For inline/computed styles in TypeScript, import from `src/styles/tokens/` and use the raw value
- Only modify MUI components via `styleOverrides` in `muiTheme.tsx` — avoid `sx` props and inline styles
- **To add or change a token:** edit the relevant `tokens/*.tokens.json` file and run `npm run tokens`

### Environment Variables

No secrets are stored in `.env` files — all are checked into git. Environments:

| `.env` file | Frontend URL | GCP Project |
|---|---|---|
| `.env.localhost` | `localhost:3000` | `het-infra-test` |
| `.env.deploy_preview` | Netlify PR preview | `het-infra-test` |
| `.env.dev` | `dev.healthequitytracker.org` | `het-infra-test` |
| `.env.prod` | `healthequitytracker.org` | `het-infra-prod` |

To serve local data files instead of a real API during frontend development, set `VITE_BASE_API_URL` to empty and drop `.json` files into `frontend/public/tmp/`. Or use `VITE_FORCE_STATIC=file1.json,file2.json` to override specific files while keeping the rest live.

## Pre-Commit Hooks

All of the following run automatically on `git commit`:
- **cspell** — spell-checks staged `.md`, `.html`, `.tsx`, `.ts`, `.py`, `.yaml` files
- **biome** — formats and lints JS/TS/JSON (`npm run cleanup` in `frontend/`)
- **tsc** — TypeScript type check (no emit)
- **black** — formats Python
- **pylint** — lints Python
- **dotenv-linter** — lints `.env` files

## Key File Locations

| Purpose | Path |
|---|---|
| Topic metric definitions | `frontend/src/data/config/MetricConfig*.ts` |
| All topic dropdown IDs | `frontend/src/data/config/DropDownIds.ts` |
| Data provider per topic | `frontend/src/data/providers/*Provider.ts` |
| Provider registration | `frontend/src/data/loading/VariableProviderMap.ts` |
| URL parameter constants | `frontend/src/utils/urlutils.tsx` |
| Shared Jotai state | `frontend/src/utils/sharedSettingsState.ts` |
| MUI theme | `frontend/src/styles/theme/muiTheme.tsx` |
| Design token sources | `frontend/tokens/*.tokens.json` |
| Token build script | `frontend/run-tokens.ts`, `frontend/terrazzo.config.ts` |
| Generated token files | `frontend/src/styles/tokens/` (gitignored) |
| Python DataSource base class | `python/datasources/data_source.py` |
| Python BQ/GCS utilities | `python/ingestion/gcs_to_bq_util.py` |
| Python type definitions | `python/ingestion/het_types.py` |
| GCP pipeline DAG workflows | `.github/workflows/dag*.yml` |
