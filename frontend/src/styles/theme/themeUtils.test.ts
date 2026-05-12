import { afterEach, beforeEach, describe, expect, vi } from 'vitest'
import { resolveCssVar } from './themeUtils'

describe('resolveCssVar()', () => {
  const mockGetPropertyValue = vi.fn()

  beforeEach(() => {
    vi.spyOn(window, 'getComputedStyle').mockReturnValue({
      getPropertyValue: mockGetPropertyValue,
    } as unknown as CSSStyleDeclaration)
  })

  afterEach(() => vi.clearAllMocks())

  test('returns non-variable values as-is', () => {
    expect(resolveCssVar('#ff0000')).toBe('#ff0000')
  })

  test('resolves var() syntax', () => {
    mockGetPropertyValue.mockReturnValue(' #123456 ')
    expect(resolveCssVar('var(--my-color)')).toBe('#123456')
  })

  test('returns fallback when variable is not found', () => {
    mockGetPropertyValue.mockReturnValue('')
    expect(resolveCssVar('var(--missing)', 'fallback')).toBe('fallback')
  })
})
