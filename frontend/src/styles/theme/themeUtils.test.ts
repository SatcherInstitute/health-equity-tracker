import { afterEach, beforeEach, describe, expect, vi } from 'vitest'
import { resolveColor } from './themeUtils'

describe('resolveColor()', () => {
  const mockGetPropertyValue = vi.fn()

  beforeEach(() => {
    vi.spyOn(window, 'getComputedStyle').mockReturnValue({
      getPropertyValue: mockGetPropertyValue,
    } as unknown as CSSStyleDeclaration)
  })

  afterEach(() => vi.clearAllMocks())

  test('returns hex as-is', () => {
    expect(resolveColor('#ff0000')).toBe('#ff0000')
  })

  test('returns rgb as-is', () => {
    expect(resolveColor('rgb(255, 0, 0)')).toBe('rgb(255, 0, 0)')
  })

  test('returns named color as-is', () => {
    expect(resolveColor('red')).toBe('red')
  })

  test('resolves a css variable via var()', () => {
    mockGetPropertyValue.mockReturnValue(' #123456 ')
    expect(resolveColor('var(--my-color)')).toBe('#123456')
  })

  test('resolves a bare css variable name', () => {
    mockGetPropertyValue.mockReturnValue('#abcdef')
    expect(resolveColor('--my-color')).toBe('#abcdef')
  })

  test('handles whitespace inside var()', () => {
    mockGetPropertyValue.mockReturnValue('#ffffff')
    expect(resolveColor('var( --my-color )')).toBe('#ffffff')
  })

  test('strips fallback value from var()', () => {
    mockGetPropertyValue.mockReturnValue('#123456')
    expect(resolveColor('var(--my-color, #ff0000)')).toBe('#123456')
  })

  test('falls back to #000000 when variable is not found', () => {
    mockGetPropertyValue.mockReturnValue('')
    expect(resolveColor('var(--missing-color)')).toBe('#000000')
  })

  test('returns color as-is when window is undefined', () => {
    const originalWindow = global.window
    // @ts-expect-error
    delete global.window
    expect(resolveColor('var(--my-color)')).toBe('var(--my-color)')
    global.window = originalWindow
  })

  test('returns #000000 and logs error on exception', () => {
    vi.spyOn(window, 'getComputedStyle').mockImplementation(() => {
      throw new Error('test error')
    })
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
    expect(resolveColor('var(--my-color)')).toBe('#000000')
    expect(consoleSpy).toHaveBeenCalledWith(
      'Error resolving color:',
      expect.any(Error),
    )
  })
})
