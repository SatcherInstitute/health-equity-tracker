import type {
  DataTypeConfig,
  MetricConfig,
} from '../data/config/MetricConfigTypes'
import { MetricQueryResponse } from '../data/query/MetricQuery'
import type { HetRow } from '../data/utils/DatasetTypes'
import {
  formatDataRows,
  hasEnoughDataForInsight,
  prepareInsightData,
} from './generateVisualizationInsight'

const DEMO = 'race_and_ethnicity'

const metricConfig = {
  metricId: 'rate',
  shortLabel: 'per 100k',
} as unknown as MetricConfig

const dataTypeConfig = {
  metrics: { per100k: metricConfig },
} as unknown as DataTypeConfig

describe('formatDataRows', () => {
  test('single-region map labels rows by demographic group and drops "All"', () => {
    const rows: HetRow[] = [
      { fips_name: 'Gwinnett County', race_and_ethnicity: 'All', rate: 7.3 },
      {
        fips_name: 'Gwinnett County',
        race_and_ethnicity: 'Black (NH)',
        rate: 8.7,
      },
      {
        fips_name: 'Gwinnett County',
        race_and_ethnicity: 'White (NH)',
        rate: 6.6,
      },
    ]
    expect(formatDataRows(rows, 'rate-map', DEMO, metricConfig, true)).toEqual(
      '- Black (NH): 8.7 per 100k\n- White (NH): 6.6 per 100k',
    )
  })

  test('multi-region map still labels rows by place name', () => {
    const rows: HetRow[] = [
      { fips_name: 'Alabama', race_and_ethnicity: 'All', rate: 9 },
      { fips_name: 'Alaska', race_and_ethnicity: 'All', rate: 5 },
    ]
    expect(formatDataRows(rows, 'rate-map', DEMO, metricConfig, false)).toEqual(
      '- Alabama: 9 per 100k\n- Alaska: 5 per 100k',
    )
  })
})

describe('prepareInsightData', () => {
  test('flags a county-level map as single-region', () => {
    const response = new MetricQueryResponse([
      { fips_name: 'Bartow County', race_and_ethnicity: 'White (NH)', rate: 13 },
    ])
    const result = prepareInsightData('rate-map', dataTypeConfig, DEMO, [
      response,
    ])
    expect(result.isSingleRegionMap).toBe(true)
    expect(result.entryCount).toBe(1)
  })
})

describe('hasEnoughDataForInsight', () => {
  test('false when only one group has data (nothing to compare)', () => {
    const response = new MetricQueryResponse([
      { fips_name: 'Bartow County', race_and_ethnicity: 'White (NH)', rate: 13 },
    ])
    expect(
      hasEnoughDataForInsight('data-table', dataTypeConfig, DEMO, [response]),
    ).toBe(false)
  })

  test('true when two or more groups have data', () => {
    const response = new MetricQueryResponse([
      { fips_name: 'Bartow County', race_and_ethnicity: 'Black (NH)', rate: 9 },
      { fips_name: 'Bartow County', race_and_ethnicity: 'White (NH)', rate: 13 },
    ])
    expect(
      hasEnoughDataForInsight('data-table', dataTypeConfig, DEMO, [response]),
    ).toBe(true)
  })

  test('false when there is no query response at all', () => {
    expect(
      hasEnoughDataForInsight('data-table', dataTypeConfig, DEMO, undefined),
    ).toBe(false)
  })
})
