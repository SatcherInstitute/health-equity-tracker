import { armInsightPreview } from './featureFlags'

function visit(url: string) {
  window.history.replaceState(null, '', url)
}

describe('armInsightPreview', () => {
  beforeEach(() => {
    sessionStorage.clear()
    visit('/exploredata')
  })

  test('stays off without the param', () => {
    expect(armInsightPreview()).toBe(false)
  })

  test('arms on the param', () => {
    visit('/exploredata?preview-insights=1')
    expect(armInsightPreview()).toBe(true)
  })

  test('ignores any other value', () => {
    visit('/exploredata?preview-insights=yes')
    expect(armInsightPreview()).toBe(false)
  })

  test('strips the param but keeps the rest of the report state', () => {
    visit('/exploredata?mls=1.hiv-3.00&preview-insights=1&demo=race')
    armInsightPreview()
    expect(window.location.search).toBe('?mls=1.hiv-3.00&demo=race')
  })

  test('leaves no trailing "?" when it was the only param', () => {
    visit('/exploredata?preview-insights=1')
    armInsightPreview()
    expect(window.location.search).toBe('')
    expect(window.location.pathname).toBe('/exploredata')
  })

  // The reason for latching at all: setMadLibWithParam rebuilds the query from a
  // fixed allowlist, so the param is gone from the URL after the first mode
  // change. Preview has to survive that.
  test('stays armed once the param is gone from the URL', () => {
    visit('/exploredata?preview-insights=1')
    armInsightPreview()
    visit('/exploredata?mls=1.hiv-3.00')
    expect(armInsightPreview()).toBe(true)
  })

  test('does not leak across sessions', () => {
    visit('/exploredata?preview-insights=1')
    expect(armInsightPreview()).toBe(true)
    sessionStorage.clear()
    visit('/exploredata')
    expect(armInsightPreview()).toBe(false)
  })
})
