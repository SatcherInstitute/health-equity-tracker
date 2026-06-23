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
  test('map rows are labeled with both place and demographic group, keeping "All"', () => {
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
    expect(formatDataRows(rows, 'rate-map', DEMO, metricConfig)).toEqual(
      '- Gwinnett County (All): 7.3 per 100k\n' +
        '- Gwinnett County (Black (NH)): 8.7 per 100k\n' +
        '- Gwinnett County (White (NH)): 6.6 per 100k',
    )
  })

  test('multi-region map labels each place with its demographic group', () => {
    const rows: HetRow[] = [
      { fips_name: 'Alabama', race_and_ethnicity: 'All', rate: 9 },
      { fips_name: 'Alaska', race_and_ethnicity: 'All', rate: 5 },
    ]
    expect(formatDataRows(rows, 'rate-map', DEMO, metricConfig)).toEqual(
      '- Alabama (All): 9 per 100k\n- Alaska (All): 5 per 100k',
    )
  })

  test('non-map charts label rows by demographic group alone', () => {
    const rows: HetRow[] = [
      { race_and_ethnicity: 'Black (NH)', rate: 9 },
      { race_and_ethnicity: 'White (NH)', rate: 13 },
    ]
    expect(formatDataRows(rows, 'data-table', DEMO, metricConfig)).toEqual(
      '- Black (NH): 9 per 100k\n- White (NH): 13 per 100k',
    )
  })

  test('time-series rows are filtered to the selected groups', () => {
    const rows: HetRow[] = [
      { race_and_ethnicity: 'Black (NH)', time_period: '2010', rate: 5 },
      { race_and_ethnicity: 'Black (NH)', time_period: '2020', rate: 8 },
      { race_and_ethnicity: 'White (NH)', time_period: '2010', rate: 3 },
      { race_and_ethnicity: 'White (NH)', time_period: '2020', rate: 4 },
    ]
    expect(
      formatDataRows(rows, 'rates-over-time', DEMO, metricConfig, [
        'Black (NH)',
      ]),
    ).toEqual(
      '- Black (NH) (2010): 5 per 100k\n- Black (NH) (2020): 8 per 100k',
    )
  })

  test('time-series with no selection includes every group', () => {
    const rows: HetRow[] = [
      { race_and_ethnicity: 'Black (NH)', time_period: '2010', rate: 5 },
      { race_and_ethnicity: 'White (NH)', time_period: '2010', rate: 3 },
    ]
    expect(formatDataRows(rows, 'rates-over-time', DEMO, metricConfig)).toEqual(
      '- Black (NH) (2010): 5 per 100k\n- White (NH) (2010): 3 per 100k',
    )
  })
})

describe('prepareInsightData', () => {
  test('a single-region map with only one labeled row yields one entry', () => {
    const response = new MetricQueryResponse([
      {
        fips_name: 'Bartow County',
        race_and_ethnicity: 'White (NH)',
        rate: 13,
      },
    ])
    const result = prepareInsightData('rate-map', dataTypeConfig, DEMO, [
      response,
    ])
    expect(result.entryCount).toBe(1)
    expect(result.dataSection).toEqual(
      '- Bartow County (White (NH)): 13 per 100k',
    )
  })

  test('a single-region map with several groups yields one entry per group', () => {
    const response = new MetricQueryResponse([
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
    ])
    const result = prepareInsightData('rate-map', dataTypeConfig, DEMO, [
      response,
    ])
    expect(result.entryCount).toBe(3)
  })

  test('time-series entry count respects the selected groups', () => {
    const response = new MetricQueryResponse([
      { race_and_ethnicity: 'Black (NH)', time_period: '2010', rate: 5 },
      { race_and_ethnicity: 'Black (NH)', time_period: '2020', rate: 8 },
      { race_and_ethnicity: 'White (NH)', time_period: '2010', rate: 3 },
      { race_and_ethnicity: 'White (NH)', time_period: '2020', rate: 4 },
    ])
    const result = prepareInsightData(
      'rates-over-time',
      dataTypeConfig,
      DEMO,
      [response],
      ['Black (NH)'],
    )
    // first + last year for the one selected group
    expect(result.entryCount).toBe(2)
  })
})

describe('hasEnoughDataForInsight', () => {
  test('false when only one group has data (nothing to compare)', () => {
    const response = new MetricQueryResponse([
      {
        fips_name: 'Bartow County',
        race_and_ethnicity: 'White (NH)',
        rate: 13,
      },
    ])
    expect(
      hasEnoughDataForInsight('data-table', dataTypeConfig, DEMO, [response]),
    ).toBe(false)
  })

  test('true when two or more groups have data', () => {
    const response = new MetricQueryResponse([
      { fips_name: 'Bartow County', race_and_ethnicity: 'Black (NH)', rate: 9 },
      {
        fips_name: 'Bartow County',
        race_and_ethnicity: 'White (NH)',
        rate: 13,
      },
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
