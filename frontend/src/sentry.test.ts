import { handlePreloadError, isNoise } from './sentry'

describe('isNoise', () => {
  test('filters stale-chunk errors from Chrome and Safari', () => {
    expect(
      isNoise('Failed to fetch dynamically imported module: /assets/a.js'),
    ).toBe(true)
    expect(isNoise('Importing a module script failed.')).toBe(true)
  })

  test('keeps real errors', () => {
    expect(isNoise('Invalid FIPS code: undefined')).toBe(false)
  })
})

describe('handlePreloadError', () => {
  beforeEach(() => sessionStorage.clear())

  test('reloads once, then not again within the cooldown', () => {
    const reload = vi.fn()
    const first = new Event('vite:preloadError', { cancelable: true })
    handlePreloadError(first, sessionStorage, reload)
    expect(reload).toHaveBeenCalledTimes(1)
    expect(first.defaultPrevented).toBe(true)

    const second = new Event('vite:preloadError', { cancelable: true })
    handlePreloadError(second, sessionStorage, reload)
    expect(reload).toHaveBeenCalledTimes(1)
    expect(second.defaultPrevented).toBe(false)
  })
})
