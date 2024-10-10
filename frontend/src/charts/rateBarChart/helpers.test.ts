import { describe, expect, it } from 'vitest'
import type { MetricConfig } from '../../data/config/MetricConfigTypes'
import { Fips } from '../../data/utils/Fips'
import {
  formatValue,
  getComparisonAllSubGroupLines,
  wrapLabel,
} from './helpers'

describe('wrapLabel', () => {
  it('wraps text based on width', () => {
    const result = wrapLabel('This is a long text that needs wrapping', 50)
    expect(result).toEqual([
      'This is',
      'a long',
      'text',
      'that',
      'needs',
      'wrapping',
    ])
  })

  it('handles single line text', () => {
    const result = wrapLabel('Short text', 100)
    expect(result).toEqual(['Short text'])
  })
})

describe('formatValue', () => {
  it('formats per100k values', () => {
    const config = { type: 'per100k' } as MetricConfig
    expect(formatValue(1234.56, config)).toBe('1,235 per 100k')
  })

  it('formats percentage values', () => {
    const config = { type: 'pct_rate' } as MetricConfig
    expect(formatValue(45.67, config)).toBe('46%')
  })

  it('formats percentage values', () => {
    const config = { type: 'pct_share' } as MetricConfig
    expect(formatValue(45.67, config)).toBe('45.7%')
  })

  it('formats regular numbers', () => {
    const config = { type: 'index' } as MetricConfig
    expect(formatValue(1234567, config)).toBe('1,234,567')
  })
})

describe('getComparisonAllSubGroupLines', () => {
  it('returns basic lines without comparison subgroup', () => {
    const mockFips = new Fips('01')
    const result = getComparisonAllSubGroupLines(mockFips)
    expect(result).toEqual(['State', 'Average', 'All People'])
  })

  it('includes comparison subgroup when provided', () => {
    const mockFips = new Fips('01001')
    const result = getComparisonAllSubGroupLines(mockFips, 'Test Subgroup')
    expect(result).toEqual(['County', 'Average', 'All People', 'Test Subgroup'])
  })
})
