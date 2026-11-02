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
    handlePreloadError(() => sessionStorage, reload)
    handlePreloadError(() => sessionStorage, reload)
    expect(reload).toHaveBeenCalledTimes(1)
  })

  test('still reloads when storage is blocked', () => {
    const reload = vi.fn()
    handlePreloadError(() => {
      throw new DOMException('blocked', 'SecurityError')
    }, reload)
    expect(reload).toHaveBeenCalledTimes(1)
  })
})
