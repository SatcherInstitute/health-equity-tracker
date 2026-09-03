// Every VITE_SHOW_* var is a feature flag, and nothing else is. The prefix is
// what separates a flag from a config var like VITE_BASE_API_URL, both when
// reading the env and when reading params off the URL, so a flag needs no
// declaration here at all: add the line to a .env file, or pass the param.
const FLAG_PREFIX = 'VITE_SHOW_'

export type FeatureFlagKey = `VITE_SHOW_${string}`

export type FeatureFlagSource = 'env' | 'param'

export interface FeatureFlagState {
  key: string
  on: boolean
  source: FeatureFlagSource
}

const OVERRIDE_STORAGE_KEY = 'featureFlagOverrides'

// Vite emits `import.meta.env` as a whole object literal, so a computed key
// resolves fine. An unset var is simply absent, which reads as off.
const ENV = import.meta.env as unknown as Record<string, string | undefined>

// Launching a feature means deleting its flag gate, never switching the flag on
// for everyone, so an env-set flag on prod is always a mistake — and a loud one,
// since it would show the 🧑🏽‍🔬 indicator to every public visitor. Prod therefore
// ignores the env side outright, which also covers a flag set in Netlify's own
// environment rather than in a committed .env file. Params still work, so a
// single tab can still preview an unlaunched feature against real prod data.
const ENV_FLAGS_IGNORED = ENV.VITE_DEPLOY_CONTEXT === 'prod'

// One rule for both env values and URL params: present, non-empty, and not '0'.
function parseFlagValue(raw: string | undefined): boolean {
  return raw !== undefined && raw !== '' && raw !== '0'
}

// sessionStorage throws outright when cookies are fully blocked. This module is
// imported by CardWrapper and Report, so an uncaught throw at module scope
// white-screens the app for every visitor, not just one arming a flag.
function readOverrides(): Record<string, boolean> {
  try {
    const raw = sessionStorage.getItem(OVERRIDE_STORAGE_KEY)
    return raw ? JSON.parse(raw) : {}
  } catch {
    return {}
  }
}

function writeOverrides(overrides: Record<string, boolean>) {
  try {
    if (Object.keys(overrides).length > 0) {
      sessionStorage.setItem(OVERRIDE_STORAGE_KEY, JSON.stringify(overrides))
    } else {
      sessionStorage.removeItem(OVERRIDE_STORAGE_KEY)
    }
  } catch {
    // The override stays off for this tab; nothing else depends on the write.
  }
}

// Params are stripped once read, rather than left in the URL, because
// setMadLibWithParam rebuilds the query string from a fixed allowlist on every
// mode change. Left in place they would silently disappear on the first mode
// switch while the flag stayed on, so the URL would stop describing the state.
// sessionStorage is the single source of truth instead, and links a reviewer
// copies or screenshots do not carry an override to anyone else.
export function armFeatureFlagOverridesFromUrl(): Record<string, boolean> {
  if (typeof window === 'undefined') return {}

  const params = new URLSearchParams(window.location.search)
  const overrides = readOverrides()
  let armedAny = false

  for (const [key, value] of [...params]) {
    if (!key.startsWith(FLAG_PREFIX)) continue
    overrides[key] = parseFlagValue(value)
    params.delete(key)
    armedAny = true
  }

  if (armedAny) {
    writeOverrides(overrides)
    const query = params.toString()
    window.history.replaceState(
      null,
      '',
      `${window.location.pathname}${query ? `?${query}` : ''}${window.location.hash}`,
    )
  }

  return overrides
}

const FLAG_OVERRIDES = armFeatureFlagOverridesFromUrl()

// Keyed by the env var name so the identical string reads across the .env file,
// the URL param, and the call site.
export function flag(key: FeatureFlagKey): boolean {
  return FLAG_OVERRIDES[key] ?? (!ENV_FLAGS_IGNORED && parseFlagValue(ENV[key]))
}

// An unset var is absent from import.meta.env, so the env side can only name the
// flags that are on. Overrides supply the rest, including any forced off.
export function describeFeatureFlags(): FeatureFlagState[] {
  const keys = new Set([
    ...Object.keys(ENV).filter((key) => key.startsWith(FLAG_PREFIX)),
    ...Object.keys(FLAG_OVERRIDES),
  ])

  return [...keys].sort().map((key) => ({
    key,
    on: flag(key as FeatureFlagKey),
    source: FLAG_OVERRIDES[key] === undefined ? 'env' : 'param',
  }))
}

export function logFeatureFlags() {
  console.table(
    Object.fromEntries(
      describeFeatureFlags().map(({ key, on, source }) => [
        key,
        { on, source },
      ]),
    ),
  )
  console.info(
    `Override any ${FLAG_PREFIX}* flag for this browser tab with a URL param of the same name, e.g. ?VITE_SHOW_CORRELATION_CARD=1 to turn it on or =0 to force it off.`,
  )
}

// Evaluated once, at import. Both inputs are themselves fixed by then: the env is
// baked in at build time and the overrides were armed from the URL at module load.
// Nothing can arm a flag later in the session, so there is no reactive source for
// this to miss — but a future flag armed at runtime would not light the indicator.
export const ANY_FEATURE_FLAG_ON = describeFeatureFlags().some(({ on }) => on)
