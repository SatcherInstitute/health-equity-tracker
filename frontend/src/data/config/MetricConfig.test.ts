import {
  buildTopicsString,
  type DropdownVarId,
  formatFieldValue,
  isPctType,
  type MetricType,
} from './MetricConfig'

describe('Test Metric Config Functions', () => {
  test('Test Detection of Percent Type', () => {
    expect(isPctType('pct_rate')).toBe(true)
    expect(isPctType('pct_relative_inequity')).toBe(true)
    expect(isPctType('pct_share')).toBe(true)
    expect(isPctType('per100k')).toBe(false)
    expect(isPctType('something broken' as MetricType)).toBe(false)
  })

  test('Test Formatting of Field Values', () => {
    expect(formatFieldValue('pct_relative_inequity', 33)).toBe('33%')
    expect(formatFieldValue('pct_rate', 33, true)).toBe('33')
    expect(formatFieldValue('pct_share', 3, false)).toBe('3.0%')
    expect(formatFieldValue('per100k', 30_000, false)).toBe('30,000')
    expect(formatFieldValue('per100k', 0, false)).toBe('< 0.1')
    expect(formatFieldValue('per100k', 3.33, false)).toBe('3.3')
  })

  test('Test buildTopicsString(): Topics without sub DataTypes', () => {
    const chronicTopics: ReadonlyArray<DropdownVarId> = ['diabetes', 'copd']
    expect(buildTopicsString(chronicTopics)).toBe('Diabetes, COPD')
  })
  test('Test buildTopicsString(): Topic with sub DataTypes', () => {
    const covidTopic: ReadonlyArray<DropdownVarId> = ['covid']
    expect(buildTopicsString(covidTopic)).toBe(
      'COVID-19 (Cases, Deaths, Hospitalizations)',
    )
  })
})
