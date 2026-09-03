import { readFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { armFeatureFlagOverridesFromUrl } from './featureFlags'

function visit(url: string) {
  window.history.replaceState(null, '', url)
}

describe('armFeatureFlagOverridesFromUrl', () => {
  beforeEach(() => {
    sessionStorage.clear()
    visit('/exploredata')
  })

  test('no overrides without a param', () => {
    expect(armFeatureFlagOverridesFromUrl()).toEqual({})
  })

  test('turns a flag on', () => {
    visit('/exploredata?VITE_SHOW_INSIGHT_GENERATION=1')
    expect(armFeatureFlagOverridesFromUrl()).toEqual({
      VITE_SHOW_INSIGHT_GENERATION: true,
    })
  })

  // The override has to be able to beat an env-on flag, otherwise there is no
  // way to preview the prod experience on dev.
  test('forces a flag off with 0', () => {
    visit('/exploredata?VITE_SHOW_INSIGHT_GENERATION=0')
    expect(armFeatureFlagOverridesFromUrl()).toEqual({
      VITE_SHOW_INSIGHT_GENERATION: false,
    })
  })

  test('treats any other value as on', () => {
    visit('/exploredata?VITE_SHOW_CORRELATION_CARD=yes')
    expect(armFeatureFlagOverridesFromUrl()).toEqual({
      VITE_SHOW_CORRELATION_CARD: true,
    })
  })

  test('treats an empty value as off, matching the env files', () => {
    visit('/exploredata?VITE_SHOW_CORRELATION_CARD=')
    expect(armFeatureFlagOverridesFromUrl()).toEqual({
      VITE_SHOW_CORRELATION_CARD: false,
    })
  })

  // The point of the prefix rule: a flag needs no declaration anywhere. This key
  // exists in no .env file and in no code, and still arms.
  test('arms a flag that is declared nowhere', () => {
    visit('/exploredata?VITE_SHOW_NOT_A_REAL_FLAG=1')
    expect(armFeatureFlagOverridesFromUrl()).toEqual({
      VITE_SHOW_NOT_A_REAL_FLAG: true,
    })
  })

  test('arms several flags at once', () => {
    visit(
      '/exploredata?VITE_SHOW_INSIGHT_GENERATION=1&VITE_SHOW_CORRELATION_CARD=1',
    )
    expect(armFeatureFlagOverridesFromUrl()).toEqual({
      VITE_SHOW_INSIGHT_GENERATION: true,
      VITE_SHOW_CORRELATION_CARD: true,
    })
  })

  test('ignores a VITE_ param without the SHOW_ prefix', () => {
    visit('/exploredata?VITE_BASE_API_URL=http://evil.test')
    expect(armFeatureFlagOverridesFromUrl()).toEqual({})
    // Untouched: with no flag param present the URL is never rewritten at all.
    expect(window.location.search).toBe('?VITE_BASE_API_URL=http://evil.test')
  })

  test('strips the flag param but keeps the rest of the report state', () => {
    visit(
      '/exploredata?mls=1.hiv-3.00&VITE_SHOW_INSIGHT_GENERATION=1&demo=race',
    )
    armFeatureFlagOverridesFromUrl()
    expect(window.location.search).toBe('?mls=1.hiv-3.00&demo=race')
  })

  test('leaves no trailing "?" when it was the only param', () => {
    visit('/exploredata?VITE_SHOW_INSIGHT_GENERATION=1')
    armFeatureFlagOverridesFromUrl()
    expect(window.location.search).toBe('')
    expect(window.location.pathname).toBe('/exploredata')
  })

  // The reason for latching at all: setMadLibWithParam rebuilds the query from a
  // fixed allowlist, so the param is gone from the URL after the first mode
  // change. The override has to survive that.
  test('stays armed once the param is gone from the URL', () => {
    visit('/exploredata?VITE_SHOW_INSIGHT_GENERATION=1')
    armFeatureFlagOverridesFromUrl()
    visit('/exploredata?mls=1.hiv-3.00')
    expect(armFeatureFlagOverridesFromUrl()).toEqual({
      VITE_SHOW_INSIGHT_GENERATION: true,
    })
  })

  test('does not leak across sessions', () => {
    visit('/exploredata?VITE_SHOW_INSIGHT_GENERATION=1')
    armFeatureFlagOverridesFromUrl()
    sessionStorage.clear()
    visit('/exploredata')
    expect(armFeatureFlagOverridesFromUrl()).toEqual({})
  })
})

// The overrides latch at module load, so each case needs its own module instance
// with the URL already in place — the same sequence the real app goes through.
async function loadFlagsAt(url: string) {
  visit(url)
  vi.resetModules()
  return import('./featureFlags')
}

describe('describeFeatureFlags', () => {
  beforeEach(() => {
    sessionStorage.clear()
    visit('/exploredata')
  })

  afterEach(() => {
    vi.unstubAllEnvs()
  })

  test('attributes an env-set flag to env', async () => {
    vi.stubEnv('VITE_SHOW_FROM_ENV', '1')
    const { describeFeatureFlags } = await loadFlagsAt('/exploredata')
    expect(describeFeatureFlags()).toContainEqual({
      key: 'VITE_SHOW_FROM_ENV',
      on: true,
      source: 'env',
    })
  })

  test('a param beats the env and is attributed to param', async () => {
    vi.stubEnv('VITE_SHOW_BEATEN', '1')
    const { describeFeatureFlags } = await loadFlagsAt(
      '/exploredata?VITE_SHOW_BEATEN=0',
    )
    expect(describeFeatureFlags()).toContainEqual({
      key: 'VITE_SHOW_BEATEN',
      on: false,
      source: 'param',
    })
  })

  // An unset var is absent from import.meta.env entirely, so enumeration alone
  // can never name a flag that is off. Overrides are the only way one appears.
  test('lists a flag that exists only as a forced-off override', async () => {
    const { describeFeatureFlags } = await loadFlagsAt(
      '/exploredata?VITE_SHOW_ONLY_OFF=0',
    )
    expect(describeFeatureFlags()).toContainEqual({
      key: 'VITE_SHOW_ONLY_OFF',
      on: false,
      source: 'param',
    })
  })

  test('a prod env flag reads off, and a param still turns it on', async () => {
    vi.stubEnv('VITE_DEPLOY_CONTEXT', 'prod')
    vi.stubEnv('VITE_SHOW_LEAKED_TO_PROD', '1')

    const onProd = await loadFlagsAt('/exploredata')
    expect(onProd.flag('VITE_SHOW_LEAKED_TO_PROD')).toBe(false)
    expect(onProd.ANY_FEATURE_FLAG_ON).toBe(false)

    sessionStorage.clear()
    const withParam = await loadFlagsAt(
      '/exploredata?VITE_SHOW_LEAKED_TO_PROD=1',
    )
    expect(withParam.flag('VITE_SHOW_LEAKED_TO_PROD')).toBe(true)
  })

  test('the same env flag reads on outside prod', async () => {
    vi.stubEnv('VITE_DEPLOY_CONTEXT', 'dev')
    vi.stubEnv('VITE_SHOW_LEAKED_TO_PROD', '1')
    const { flag } = await loadFlagsAt('/exploredata')
    expect(flag('VITE_SHOW_LEAKED_TO_PROD')).toBe(true)
  })

  test('sorts by key and excludes non-flag env vars', async () => {
    vi.stubEnv('VITE_SHOW_ZEBRA', '1')
    vi.stubEnv('VITE_SHOW_APPLE', '1')
    vi.stubEnv('VITE_BASE_API_URL', 'http://example.test')
    const { describeFeatureFlags } = await loadFlagsAt('/exploredata')

    const keys = describeFeatureFlags().map(({ key }) => key)
    expect(keys).toContain('VITE_SHOW_APPLE')
    expect(keys).toContain('VITE_SHOW_ZEBRA')
    expect(keys).not.toContain('VITE_BASE_API_URL')
    expect(keys).toEqual([...keys].sort())
  })
})

// Prod ignores env flags at runtime, so a line here is inert rather than harmful.
// It is still wrong, and the reason it is wrong does not show up in review: whoever
// adds it is reaching for the wrong tool, because launching a feature means
// deleting its flag gate, not switching the flag on for everyone. Failing here
// says that at the moment the line is written.
test('no feature flag is declared in .env.prod', () => {
  // Resolved from this module rather than the cwd, and via node:path rather than
  // the URL constructor, which jsdom overrides to resolve against the page origin.
  const envProd = readFileSync(
    join(dirname(fileURLToPath(import.meta.url)), '..', '.env.prod'),
    'utf8',
  )

  const declared = envProd
    .split('\n')
    .filter((line) => /^\s*(export\s+)?VITE_SHOW_/.test(line))

  expect(declared).toEqual([])
})
