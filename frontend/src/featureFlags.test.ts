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

  test('arms several flags at once', () => {
    visit(
      '/exploredata?VITE_SHOW_INSIGHT_GENERATION=1&VITE_SHOW_CORRELATION_CARD=1',
    )
    expect(armFeatureFlagOverridesFromUrl()).toEqual({
      VITE_SHOW_INSIGHT_GENERATION: true,
      VITE_SHOW_CORRELATION_CARD: true,
    })
  })

  test('ignores a VITE_ param that is not a registered flag', () => {
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
