# Frontend

React app built with TypeScript, Vite, MUI, Tailwind, D3, and Jotai.
All commands below run from `frontend/`.

## Commands

```bash
npm run localhost        # Start dev server at localhost:3000 (also starts tsc --watch)
npm run test             # Run Vitest unit tests once
npm run test:watch       # Run Vitest in watch mode
npm run cleanup          # Lint + format with Biome (runs pre-commit)
npx tsc --noEmit         # Type-check TypeScript
npm run tokens           # Regenerate design token files (auto-runs on install/dev/build)

# Run a single E2E test file (dev server must be running)
npm run e2e statins.nightly.spec.ts
npm run e2e hiv          # Matches any filename containing "hiv"
```

> **CI note:** In CI, e2e tests run against `vite preview` serving the locally-built `dist/`
> (not a Netlify preview URL). `VITE_BASE_API_URL` still points to the live dev GCP backend.

## Frontend Data Flow

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

**Two-tier URL param system** — URL params split into two write paths:

| Tier | Params | Written via | Read via |
|---|---|---|---|
| MadLib | `mls`, `dt1`, `dt2`, `group1`, `group2`, `mlp`, `extremes` | `setParameters` → `history.pushState` (bypasses Jotai) | `window.location.search` |
| UI / modal | `demo`, `topic-info`, `multiple-maps`, `chlp-maps`, `vote-dot-org`, `report-insight`, `atl` | `useParamState` → `locationAtom` | `urlParamAtom(key)` — fine-grained, only re-renders on that param's change |

`useParamState` (`src/utils/hooks/useParamState.tsx`) is the hook for Tier 2 params. Its setter reads from `window.location.search` (not Jotai state) so that MadLib params written outside Jotai are preserved in the URL.

**MadLib navigation invariants** — critical rules for the `ExploreDataPage` / `MadLibUI` navigation machinery. Violating these causes duplicate history entries or blank DataTypeSelector buttons.

- `setMadLibWithParam` is the single point of truth for all MadLib URL writes. It calls `history.replaceState` (cleanup only — deletes `dt2` when not in comparevars mode) and then `setParameters` → `history.pushState`. Never call `setParameters` or `history.pushState` separately before or after `setMadLibWithParam` for the same user action — that creates duplicate history entries.
- Pass `dtOverrides: { dt1: newId }` (or `dt2`) when changing data sub-types so the new value reaches `setParameters` in one shot. Do not write the dt param to the URL via a separate call first.
- On topic changes (`handleOptionUpdate` with a non-Fips value), pass `dtOverrides: { dt1: '' }` to delete the stale dt from the pushed URL and reset the corresponding `selectedDataTypeConfig` atom. The old data type ID does not apply to the new topic, so carrying it forward causes the DataTypeSelector to render an empty button.
- `readParams` (the `psSubscribe` popstate handler in `ExploreDataPage`) is responsible for restoring full UI state on browser back/forward. It must sync the `selectedDataTypeConfig1`/`2` jotai atoms from `dt1`/`dt2` in the URL, in addition to calling `setMadLib`. If you add a new atom that should survive back-navigation, restore it in `readParams`.

## Adding a New Frontend Feature (health topic)

1. Create `src/data/config/MetricConfig<Topic>.ts` — define `MetricId`s, `DataTypeId`s, and chart configs
2. Register the new `DropdownVarId` in `src/data/config/DropDownIds.ts`
3. Create `src/data/config/DatasetMetadata<Topic>.ts` — list dataset IDs consumed
4. Create `src/data/providers/<Topic>Provider.ts` — extends `VariableProvider`, maps metrics to dataset files
5. Register provider in `src/data/loading/VariableProviderMap.ts`

## Design System / Token Pipeline

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
import { colors }                  from '../../styles/tokens/colors'
import { typography }              from '../../styles/tokens/typography'
import { dimensions, breakpoints } from '../../styles/tokens/dimensions'
import { type Breakpoint }         from '../../styles/tokens/dimensions'

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

## Environment Variables

No secrets are stored in `.env` files — all are checked into git. Environments:

| `.env` file | Frontend URL | GCP Project |
|---|---|---|
| `.env.localhost` | `localhost:3000` | `het-infra-test` |
| `.env.deploy_preview` | Netlify PR preview | `het-infra-test` |
| `.env.dev` | `dev.healthequitytracker.org` | `het-infra-test` |
| `.env.prod` | `healthequitytracker.org` | `het-infra-prod` |

To serve local data files instead of a real API during development, set `VITE_BASE_API_URL` to empty and drop `.json` files into `frontend/public/tmp/`. Or use `VITE_FORCE_STATIC=file1.json,file2.json` to override specific files while keeping the rest live.

## Key File Locations

| Purpose | Path |
|---|---|
| Topic metric definitions | `src/data/config/MetricConfig*.ts` |
| All topic dropdown IDs | `src/data/config/DropDownIds.ts` |
| Topic category map & type | `src/data/config/CategoryTypes.ts` |
| Data provider per topic | `src/data/providers/*Provider.ts` |
| Provider registration | `src/data/loading/VariableProviderMap.ts` |
| Data catalog page | `src/pages/DataCatalog/DataCatalogPage.tsx` |
| URL parameter constants | `src/utils/urlutils.tsx` |
| Shared Jotai state | `src/utils/sharedSettingsState.ts` |
| MUI theme | `src/styles/theme/muiTheme.tsx` |
| Design token sources | `tokens/*.tokens.json` |
| Token build script | `run-tokens.ts`, `terrazzo.config.ts` |
| Generated token files | `src/styles/tokens/` (gitignored) |
