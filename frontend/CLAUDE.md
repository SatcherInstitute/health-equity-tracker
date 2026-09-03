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
npm run geo              # Regenerate split geography topojson files (auto-runs on install/dev/build)
npm run places:refresh   # Rebuild the committed place-index.json from census.gov (run manually)

# Run a single E2E test file (dev server must be running)
npm run e2e statins.nightly.spec.ts
npm run e2e hiv          # Matches any filename containing "hiv"
```

**Always start servers through these npm scripts, never a bare `npx vite` or `vite preview`.** The scripts wrap Vite in `env-cmd -f .env.localhost`, which is where `VITE_BASE_API_URL` lives. Without it the app still builds and renders, but every data fetch 404s and cards come up empty, so the failure looks like a product bug rather than a missing env.

**Always serve on port 3000.** Vite silently increments to the next free port when 3000 is taken, and other tooling hardcodes 3000: the Go server's insight origin allowlist only accepts `http://localhost:3000`, so an app served from 3009 gets a 403 on every `/insight` call and the AI insight card renders an error. Never work around a server that landed elsewhere, and never spin up a scratch server on another port. Free 3000 and restart, or reuse what is already there:

```bash
lsof -ti :3000            # what holds it, if anything
kill $(lsof -ti :3000)    # free it, then npm run localhost
```

**Important: Package Dependency Workflow**

Any time you modify `package.json` (add, remove, or update packages), you must run `npm install` afterward and **commit the resulting lock file changes**. The lock file must always be in sync with package.json, or CI's `npm ci` step will fail with "package-lock.json or npm-shrinkwrap.json are not in sync."

```bash
# After modifying package.json
npm install               # Resolves full dependency tree and updates package-lock.json
git add frontend/package-lock.json
git commit -m "chore(deps): update lock file"
```

If you forget and push without updating the lock file, the CI will fail. If that happens, pull the latest, run `npm install`, and commit the lock file fix.

**You must use npm >= 11.16.0 (matching CI).** Older npm writes lock files that omit hoisted transitive entries (e.g. `@emnapi/core`), which newer npm's stricter `npm ci` rejects as out of sync. `frontend/.npmrc` sets `engine-strict=true` and `package.json` pins `engines.npm`, so an under-versioned npm fails fast with a bad-engine error instead of silently corrupting the lock file. Upgrade with `npm install -g npm@latest` if blocked.

> **CI note:** In CI, e2e tests run against `vite preview` serving the locally-built `dist/`
> (not a Netlify preview URL). `VITE_BASE_API_URL` still points to the live dev GCP backend.
>
> **E2E file naming convention:**
> - `*.ci.spec.ts` — runs on every PR push via the `E2E_CI` Playwright project (Chromium only, fast)
> - `*.spec.ts` (without `.ci.`) — runs nightly only via `E2E_NIGHTLY` + the browser/viewport matrix (`MOBILE_NIGHTLY`, `TABLET_NIGHTLY`, `FIREFOX_NIGHTLY`, `WEBKIT_NIGHTLY`)
>
> Use `npm run e2e-nightly-matrix` to run the full nightly matrix locally against the live prod URL.

## Frontend Data Flow

The URL encodes the entire report state via URL params. The "MadLib" pattern (`disparity` / `comparegeos` / `comparevars` modes) is the query-builder UI — users fill in topic, geography, and demographic group.

```
URL params (mls, dt1, demo, etc.)
  → MadLib selection state (src/utils/MadLibs.ts)
    → MetricQuery (src/data/query/MetricQuery.ts)
      → DataManager (src/data/loading/DataManager.ts) — LRU cache
        → VariableProvider (per-topic, src/data/providers/)
          → JSON fetch from server (Go server GCS proxy)
            → MetricQueryResponse {data, consumedDatasetIds, usedAllsFallback}
              → Cards render charts, surface fallback alert when needed
```

Each `VariableProvider` computes `usedAllsFallback` via `resolveDatasetId()` when the requested demographic dataset is not registered but its `alls_` fallback is (see `MetricQuery.ts`). The flag flows through `DataManager` into `MetricQueryResponse` and informs whether cards render `AllsFallbackAlert` (bar, trend, and table cards show it; the map card does not, since showing the overall rate is its default behavior) and which card-level features are available (e.g., compare mode fallback behavior).

For intersectional topics (e.g. HIV prevalence for Black women), `MetricConfig.metrics.per100k.rateComparisonMetricForAlls` names a second metric from a reference dataset. `RateBarChartCard` and `RateTrendsChartCard` both detect this field, issue a second `MetricQuery` for the reference "All" population, and merge the result into the chart data so a comparison series renders alongside the intersectional group. The `shortLabel` on `rateComparisonMetricForAlls` is typed as `DemographicGroup` (via `ComparisonMetricConfig`) — add the label as a named constant in `Constants.ts` and include it in `INTERSECTIONAL_COMPARISON_LABELS` so `GROUP_COLOR_MAP` can key on it with the correct color.

Global UI state is managed with Jotai atoms, URL-synced via `jotai-location` (`src/utils/sharedSettingsState.ts`).

**Absence taxonomy for maps:** Three distinct reasons a geography's value can be absent, each requiring a different visual signal and label (see `src/charts/mapGlobals.ts`):

- `DATA_SUPPRESSED` (grey fill, "Suppressed"): the source measured this rate and withheld it to protect privacy. Only provable from the rate's own `suppressionFlagMetricId` column and applies only to that metric and its numerator.
- `NO_DATA_MESSAGE` (white fill, "No data"): the source publishes this field but measured no value for this geography.
- `DATA_UNAVAILABLE` (unavailable in tooltips, "Unavailable"): the source does not publish this field at all. Denominators come from a separate source (ACS), so a topic's suppression rules can never apply to them.

A `MetricConfig` must declare its `suppressionFlagMetricId` so the map can distinguish suppressed from missing. Cards must include that column in their requested `metricIds` or data preprocessing strips it.

**Population comparison columns.** `populationComparisonMetric` normally hangs off `pct_share`, where the population share and the outcome share are measured on the same basis. Two topics have no `pct_share` at all (`voter_participation`, `preventable_hospitalizations`), so it hangs off their rate config instead and draws from the general ACS population, which is broader than the rate's own denominator. Those configs must set `isGeneralPopulationComparison: true`; `TableCard` keys the caveat notice off that flag, so the notice can never fire on a topic whose population column already matches its denominator. The population metric must also carry a `generalPopulationLabel` naming who it counts (`'all adults'` for the 18+ column, `'everyone'` for the all-ages county column), since the notice states that population outright and a wrong label would be a factual error rather than a styling one. Do not infer the mismatch from the absence of `rateDenominatorMetric`. The AHR/CHR split is handled with `geoOverrides.county` pointing at `chr_population_pct` (all ages) instead of `ahr_18plus_population_pct` (adults), so the column title differs by geography.

**`geoOverrides` can delete, not just replace.** A `null` override value removes the key from the resolved config; `undefined` is ignored. This is how a geography whose source publishes fewer columns drops the cards that would otherwise request data that cannot exist: county cancer comes from NCI State Cancer Profiles (one point-in-time rate, no shares, no time series), so its `geoOverrides.county` nulls `pct_share`, `pct_relative_inequity`, and `per100k.timeSeriesCadence`. `Report.tsx` gates each card on the presence of its metric config, so the cards and their TOC steps disappear together. Prefer this over adding a geography check inside a card.

`metricConfigFromDtConfig('share', ...)` returns the *first* `pct_share`-typed entry in `metrics`, so a config that declares `pct_share_unknown` before `pct_share` resolves to the unknown-share config and any `populationComparisonMetric` on the real `pct_share` is never reached. Thirteen configs land there today (the eight Medicare adherence topics, which have no `pct_share` at all, and the five cancer screening topics, which declare `pct_share_unknown` first). Their data table renders no population column. The insight prompt for that card resolves its columns the same way on purpose, since the insight describes the table the reader is looking at rather than the topic config in the abstract; the two must not be allowed to drift apart.

**Unified URL param system** — all params written through a single path:

| Params | Written via | Read via |
|---|---|---|
| `mls`, `dt1`, `dt2`, `mlp` | `setLocationAtom({ searchParams })` → jotai-location → `history.pushState` | `urlParamAtom(key)` |
| `group1`, `group2` (user selection) | `setLocationAtom({ searchParams })` → jotai-location → `history.pushState` | `urlParamAtom(key)` (derived in MapCard, no local state) |
| `group1`, `group2` (auto-reset on topic/data-type/demo change) | deleted inside the same `setLocationAtom` write as the triggering change: `setMadLibWithParam` clears the group when `dtOverrides` is passed; `DemographicSelector` clears both groups when `demo` changes | `urlParamAtom(key)` (derived in MapCard, no local state) |
| `demo`, `topic-info`, `multiple-maps`, `chlp-maps`, `vote-dot-org`, `report-insight`, `atl`, `extremes` | `useParamState` → `setLocationAtom` (`demo` writes directly via `setLocationAtom` to bundle the group reset) | `urlParamAtom(key)` |

`jotai-location` owns `locationAtom` and handles `popstate` automatically — back/forward navigation keeps all atoms in sync with no manual handlers.

`useParamState` (`src/utils/hooks/useParamState.tsx`) is the hook for UI / modal params.

**MadLib navigation invariants** — critical rules for the `ExploreDataPage` / `MadLibUI` navigation machinery.

- `setMadLibWithParam` is the single point of truth for all MadLib URL writes. It builds the complete new `URLSearchParams` and calls `setLocationAtom` once (one `pushState`). Never write to the URL separately before or after — that creates duplicate history entries.
- Pass `dtOverrides: { dt1: newId }` (or `dt2`) when changing data sub-types so the new value is included in the same write.
- On topic changes (`handleOptionUpdate` with a non-Fips value), pass `dtOverrides: { dt1: '' }` to clear the stale dt. `setMadLibWithParam` will then write the new topic's first data type as the default, keeping `dt1` always present in the URL for topics with multiple data types. Passing `dtOverrides` also clears the corresponding `group1`/`group2` param, since a group valid for one topic or data type may not exist in another. In comparegeos mode a `dt1` change clears both groups, since both panels share `dt1`.
- On mode changes (`handleModeChange`), pass a `baseParams` containing only `demo`, `dt1`, `dt2`, and `onboard`. This resets all card-level display state (extremes, atl, multiple-maps, alt-table-view, group selections, modals) so the user sees a clean report layout in the new mode. `onboard` is preserved so an active guided tour is not abruptly terminated. `setMadLibWithParam` accepts an optional `baseParams?: URLSearchParams`; when omitted it seeds from `window.location.search` (preserving all params).
- `dt1` (and `dt2` in comparevars mode) is always written to the URL when the topic has multiple data types, defaulting to the first config's `dataTypeId` if no explicit value is provided. This prevents the demographic selector from showing options from unrelated topics.
- `selectedDataTypeConfig1Atom` and `selectedDataTypeConfig2Atom` are **read-only derived atoms** — they derive from `urlParamAtom('dt1')` / `urlParamAtom('dt2')`. Never call their setters directly. Update dt values by writing the URL param via `setMadLibWithParam` with `dtOverrides`.
- `madLib` in `ExploreDataPage` is a `useMemo` derived from `urlParamAtom('mls')` + `urlParamAtom('mlp')`. It is not owned state — never call `setMadLib`. Back/forward automatically updates the URL atoms which recomputes `madLib`.
- If you add a new atom that should survive back-navigation, derive it from a `urlParamAtom` rather than wiring up a manual `popstate` handler.
- AI insights collapse on every report change. `cardInsightOpenAtom` and `contrastInsightOpenAtom` hold at most one open key each and are cleared by an effect in `ExploreDataPage` whenever `mls`, `mlp`, `dt1`, `dt2`, or `demo` changes; `setMadLibWithParam` and `DemographicSelector` delete `report-insight` in the same write that changes the report. Every insight is keyed by topic, place, and demographic, so a report change misses the cache for all of them at once, and anything left open would call the model again unasked.
- Derive UI flags directly from URL atoms rather than seeding `useState` with a derived value. `useState(derivedValue)` only captures the value at mount; the flag won't react to URL changes unless the component remounts. Example: `activelyOnboarding` is `onboardParam === 'true' && location.hash === ''`, not a `useState` copy of it.

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
- **Responsive JS:** detect breakpoints with `useIsBreakpointAndUp(breakpoint)` (`src/utils/hooks/useIsBreakpointAndUp.tsx`)
- **Never use default Tailwind color utilities** (e.g. `text-zinc-500`, `bg-gray-100`, `text-slate-400`). All colors must come from our design token system — use Tailwind utilities generated from our tokens (e.g. `text-alt-dark`, `bg-alt-green`). To pick a color, consult `tokens/colors.tokens.json`. Do not create new color tokens for one-off use; find the closest existing token. If a new token is genuinely needed, add it to `tokens/colors.tokens.json` and run `npm run tokens`.

**TypeScript conventions:**

- No JSDoc (`/** */`) — types already document the interface; plain `//` comments are fine when the why is non-obvious
- **JSX quote rules:** Typographic apostrophes (’ U+2019) are fine in JSX *text content* (e.g. `We’re`). They break Biome only as *attribute string delimiters* — `className='...'` with curly quotes causes a parse error. AI editing tools can silently introduce curly-quote delimiters. Symptom: pre-commit Biome fails with `Unexpected token` on a `className=` line. Fix (only replaces curly-quote delimiter *pairs* after `=`, leaves text apostrophes intact):
  ```bash
  python3 -c '
  import re, sys
  f = sys.argv[1]
  b = open(f, "rb").read()
  b = re.sub(b"=\\xe2\\x80\\x98(.*?)\\xe2\\x80\\x99", lambda m: b"='" + m.group(1) + b"'", b, flags=re.DOTALL)
  open(f, "wb").write(b)
  ' -- <file>
  ```

## Environment Variables

No secrets are stored in `.env` files — all are checked into git. Environments:

| `.env` file | Frontend URL | GCP Project |
|---|---|---|
| `.env.localhost` | `localhost:3000` | `het-infra-test` |
| `.env.deploy_preview` | Netlify PR preview | `het-infra-test` |
| `.env.dev` | `dev.healthequitytracker.org` | `het-infra-test` |
| `.env.prod` | `healthequitytracker.org` | `het-infra-prod` |

To serve local data files instead of a real API during development, set `VITE_BASE_API_URL` to empty and drop `.json` files into `frontend/public/tmp/`. Or use `VITE_FORCE_STATIC=file1.json,file2.json` to override specific files while keeping the rest live.

## Feature Flags

**Any `VITE_SHOW_*` var is a feature flag, and nothing else is.** The prefix is the whole convention — there is no registry, and a flag needs no declaration in `src/featureFlags.ts` or anywhere else. Adding one means adding the `.env` line, or just passing the param:

```
VITE_SHOW_MY_FEATURE=1            # in .env.localhost / .env.dev / .env.deploy_preview
?VITE_SHOW_MY_FEATURE=1           # or as a URL param, on any environment
```

Read it with `flag('VITE_SHOW_MY_FEATURE')`. The identical string appears in the `.env` file, the URL param, and the call site. It is verbose, which is appropriate: a flag reference should look temporary at the point of use. The tradeoff of having no registry is no typo safety — a misspelled key reads `false` forever rather than failing to compile.

One rule covers env values and params alike: present, non-empty, and not `0` means on. A param **overrides** the env for that browser tab only, so `?VITE_SHOW_INSIGHT_GENERATION=0` is how you see the prod experience on dev.

Vite emits `import.meta.env` as a whole object literal, so the computed lookup `ENV[key]` resolves fine at runtime. What does *not* work is enumeration: a var not set in that environment's `.env` is absent from the object entirely, so `describeFeatureFlags()` can only name the env flags that are **on**. Overrides supply the rest, including any forced off.

Flag params are **stripped from the URL** once read, because `setMadLibWithParam` rebuilds the query from a fixed allowlist on every mode change. Left in place they would vanish on the first mode switch while the flag stayed on, so the URL would stop describing the state. `sessionStorage` is the single source of truth instead, which also means a link someone copies or screenshots does not arm a flag for anyone else.

`HetFeatureFlagIndicator` renders a 🧑🏽‍🔬 in both the desktop and mobile toolbars whenever **any** flag is on, from either source, so a flagged environment is never silently flagged. Clicking it prints a table of every flag with its state and whether it came from `env` or `param`.

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
| Feature flag resolution | `src/featureFlags.ts` |
| Shared Jotai state | `src/utils/sharedSettingsState.ts` |
| MUI theme | `src/styles/theme/muiTheme.tsx` |
| Design token sources | `tokens/*.tokens.json` |
| Token build script | `run-tokens.ts`, `terrazzo.config.ts` |
| Generated token files | `src/styles/tokens/` (gitignored) |
| Geography topojson source + split script | `scripts/geo/` |
| Generated geography files | `src/assets/geo/` (gitignored, except `place-index.json`) |
| Committed place index + refresh script | `src/assets/geo/place-index.json`, `scripts/geo/build-place-index.ts` (`npm run places:refresh`) |
