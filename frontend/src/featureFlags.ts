// The one place a feature flag is declared. Vite string-replaces
// `import.meta.env.VITE_*` at build time and cannot resolve a computed key, so
// each env value has to be read through a literal member access; the key list
// and the key type are both derived from this object rather than repeated.
const ENV_FLAG_VALUES = {
  VITE_SHOW_INSIGHT_GENERATION: import.meta.env.VITE_SHOW_INSIGHT_GENERATION,
  VITE_SHOW_CORRELATION_CARD: import.meta.env.VITE_SHOW_CORRELATION_CARD,
} as const

export type FeatureFlagKey = keyof typeof ENV_FLAG_VALUES

export const FEATURE_FLAG_KEYS = Object.keys(
  ENV_FLAG_VALUES,
) as FeatureFlagKey[]

export type FeatureFlagSource = 'env' | 'param'

export interface FeatureFlagState {
  key: FeatureFlagKey
  on: boolean
  source: FeatureFlagSource
}

type FeatureFlagOverrides = Partial<Record<FeatureFlagKey, boolean>>

const OVERRIDE_STORAGE_KEY = 'featureFlagOverrides'

// One rule for both env values and URL params: present, non-empty, and not '0'.
function parseFlagValue(raw: string | undefined): boolean {
  return raw !== undefined && raw !== '' && raw !== '0'
}

// sessionStorage throws outright when cookies are fully blocked. This module is
// imported by CardWrapper and Report, so an uncaught throw at module scope
// white-screens the app for every visitor, not just one arming a flag.
function readOverrides(): FeatureFlagOverrides {
  try {
    const raw = sessionStorage.getItem(OVERRIDE_STORAGE_KEY)
    return raw ? JSON.parse(raw) : {}
  } catch {
    return {}
  }
}

function writeOverrides(overrides: FeatureFlagOverrides) {
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
export function armFeatureFlagOverridesFromUrl(): FeatureFlagOverrides {
  if (typeof window === 'undefined') return {}

  const params = new URLSearchParams(window.location.search)
  const overrides = readOverrides()
  let armedAny = false

  for (const key of FEATURE_FLAG_KEYS) {
    if (!params.has(key)) continue
    overrides[key] = parseFlagValue(params.get(key) ?? undefined)
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

function isFlagOn(key: FeatureFlagKey): boolean {
  return FLAG_OVERRIDES[key] ?? parseFlagValue(ENV_FLAG_VALUES[key])
}

export function describeFeatureFlags(): FeatureFlagState[] {
  return FEATURE_FLAG_KEYS.map((key) => ({
    key,
    on: isFlagOn(key),
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
    'Override any flag for this browser tab with a URL param of the same name, e.g. ?VITE_SHOW_CORRELATION_CARD=1 to turn it on or =0 to force it off.',
  )
}

export const ANY_FEATURE_FLAG_ON = FEATURE_FLAG_KEYS.some(isFlagOn)

export const SHOW_INSIGHT_GENERATION = isFlagOn('VITE_SHOW_INSIGHT_GENERATION')

export const SHOW_CORRELATION_CARD = isFlagOn('VITE_SHOW_CORRELATION_CARD')
