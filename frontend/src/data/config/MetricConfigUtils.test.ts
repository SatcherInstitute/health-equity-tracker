import type { CategoryTypeId } from '../../utils/MadLibs'
import type {
  DataTypeConfig,
  MapConfig,
  MetricConfig,
  MetricId,
  MetricType,
} from './MetricConfigTypes'
import {
  formatFieldValue,
  isPctType,
  metricConfigFromDtConfig,
} from './MetricConfigUtils'

describe('metricConfigFromDtConfig', () => {
  const fakeDataTypeConfig: DataTypeConfig = {
    categoryId: 'fake_category' as CategoryTypeId,
    dataTypeId: 'fake_data_type',
    dataTableTitle: 'fake_data_table_title',
    fullDisplayName: 'fake_full_display_name',
    dataTypeShortLabel: 'fake_data_type_short_label',
    mapConfig: {} as MapConfig,
    metrics: {
      pct_rate: {
        type: 'pct_rate',
        metricId: 'fake_pct_rate' as MetricId,
      } as MetricConfig,
      pct_share: {
        type: 'pct_share',
        metricId: 'fake_pct_share' as MetricId,
      } as MetricConfig,
      pct_relative_inequity: {
        type: 'pct_relative_inequity',
        metricId: 'fake_pct_relative_inequity' as MetricId,
      } as MetricConfig,
      age_adjusted_ratio: {
        type: 'age_adjusted_ratio',
        metricId: 'fake_age_adjusted_ratio' as MetricId,
      } as MetricConfig,
    },
  }

  test('returns undefined when dtConfig is null', () => {
    expect(metricConfigFromDtConfig('rate', null)).toBeUndefined()
  })

  test('returns correct metric config for rate card type', () => {
    const result = metricConfigFromDtConfig('rate', fakeDataTypeConfig)
    expect(result).toEqual(fakeDataTypeConfig.metrics.pct_rate)
  })

  test('returns correct metric config for share card type', () => {
    const result = metricConfigFromDtConfig('share', fakeDataTypeConfig)
    expect(result).toEqual(fakeDataTypeConfig.metrics.pct_share)
  })

  test('returns correct metric config for inequity card type', () => {
    const result = metricConfigFromDtConfig('inequity', fakeDataTypeConfig)
    expect(result).toEqual(fakeDataTypeConfig.metrics.pct_relative_inequity)
  })

  test('returns correct metric config for age adjusted ratio card type', () => {
    const result = metricConfigFromDtConfig('ratio', fakeDataTypeConfig)
    expect(result).toEqual(fakeDataTypeConfig.metrics.age_adjusted_ratio)
  })
})

describe('Test Metric Config Functions', () => {
  test('Test Detection of Percent Type', () => {
    expect(isPctType('pct_rate')).toBe(true)
    expect(isPctType('pct_relative_inequity')).toBe(true)
    expect(isPctType('pct_share')).toBe(true)
    expect(isPctType('per100k')).toBe(false)
    expect(isPctType('something broken' as MetricType)).toBe(false)
  })
})

test('Test Formatting of Field Values', () => {
  expect(formatFieldValue('pct_relative_inequity', 33)).toBe('33%')
  expect(formatFieldValue('pct_rate', 33, true)).toBe('33')
  expect(formatFieldValue('pct_share', 3, false)).toBe('3.0%')
  expect(formatFieldValue('per100k', 30_000, false)).toBe('30,000')
  expect(formatFieldValue('per100k', 0, false)).toBe('< 0.1')
  expect(formatFieldValue('per100k', 3.33, false)).toBe('3.3')
})
