import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest'

import { resolveCssVar } from './cssVarUtils'

describe('resolveCssVar()', () => {
  const mockGetPropertyValue = vi.fn()

  beforeEach(() => {
    vi.spyOn(window, 'getComputedStyle').mockReturnValue({
      getPropertyValue: mockGetPropertyValue,
    } as unknown as CSSStyleDeclaration)
  })

  afterEach(() => {
    vi.clearAllMocks()
  })

  test('resolves a CSS variable from the document root', () => {
    mockGetPropertyValue.mockReturnValue(' 1300 ')

    expect(resolveCssVar('var(--mui-zIndex-modal)')).toBe('1300')

    expect(mockGetPropertyValue).toHaveBeenCalledWith('--mui-zIndex-modal')
  })
})
