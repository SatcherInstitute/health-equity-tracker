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
