import type {
  DataTypeConfig,
  MetricConfig,
} from '../data/config/MetricConfigTypes'
import { MetricQueryResponse } from '../data/query/MetricQuery'
import {
  buildInsightFocusSuffix,
  countInsightRows,
  getInsightDataStatus,
  getPeerValues,
  getRegionAllRate,
  resolveTableShareMetrics,
  summarizePeerComparison,
} from './generateVisualizationInsight'

const DEMO = 'race_and_ethnicity'

const metricConfig = {
  metricId: 'rate',
  shortLabel: 'per 100k',
} as unknown as MetricConfig

const dataTypeConfig = {
  metrics: { per100k: metricConfig },
} as unknown as DataTypeConfig

describe('resolveTableShareMetrics', () => {
  const rate = {
    metricId: 'rate',
    shortLabel: 'per 100k',
    type: 'per100k',
  } as unknown as MetricConfig

  test('resolves both share columns off the pct_share config', () => {
    const population = {
      metricId: 'pop_pct',
      shortLabel: '% of population',
    } as unknown as MetricConfig
    const share = {
      metricId: 'share_pct',
      shortLabel: '% of cases',
      type: 'pct_share',
      populationComparisonMetric: population,
    } as unknown as MetricConfig
    const config = {
      metrics: { per100k: rate, pct_share: share },
    } as unknown as DataTypeConfig

    expect(resolveTableShareMetrics(config)).toEqual({
      shareConfig: share,
      populationConfig: population,
      generalPopulationLabel: undefined,
    })
  })

  test('picks up the pct_share_unknown column the adherence topics use in place of a true share', () => {
    const unknownShare = {
      metricId: 'unknown_pct',
      shortLabel: '% unknown',
      type: 'pct_share',
    } as unknown as MetricConfig
    const config = {
      metrics: { pct_rate: rate, pct_share_unknown: unknownShare },
    } as unknown as DataTypeConfig

    expect(resolveTableShareMetrics(config).shareConfig).toBe(unknownShare)
  })

  test('falls back to the rate’s own population column, and names who it counts', () => {
    const population = {
      metricId: 'adults_pct',
      shortLabel: '% of adults',
      generalPopulationLabel: 'all adults',
    } as unknown as MetricConfig
    const config = {
      metrics: {
        per100k: {
          ...rate,
          isGeneralPopulationComparison: true,
          populationComparisonMetric: population,
        },
      },
    } as unknown as DataTypeConfig

    expect(resolveTableShareMetrics(config)).toEqual({
      shareConfig: undefined,
      populationConfig: population,
      generalPopulationLabel: 'all adults',
    })
  })

  test('withholds the general-population caveat when the flag is not set', () => {
    const population = {
      metricId: 'pop_pct',
      shortLabel: '% of population',
      generalPopulationLabel: 'everyone',
    } as unknown as MetricConfig
    const config = {
      metrics: {
        per100k: { ...rate, populationComparisonMetric: population },
      },
    } as unknown as DataTypeConfig

    expect(
      resolveTableShareMetrics(config).generalPopulationLabel,
    ).toBeUndefined()
  })

  test('reports no share columns for a topic that publishes neither', () => {
    const config = {
      metrics: { pct_rate: rate },
    } as unknown as DataTypeConfig

    expect(resolveTableShareMetrics(config)).toEqual({
      shareConfig: undefined,
      populationConfig: undefined,
      generalPopulationLabel: undefined,
    })
  })
})

describe('countInsightRows', () => {
  test('a single-region map with only one labeled row yields one entry', () => {
    expect(
      countInsightRows(
        [
          {
            fips_name: 'Bartow County',
            race_and_ethnicity: 'White (NH)',
            rate: 13,
          },
        ],
        'rate-map',
        DEMO,
        metricConfig,
      ),
    ).toBe(1)
  })

  test('a single-region map with several groups yields one entry per group', () => {
    expect(
      countInsightRows(
        [
          {
            fips_name: 'Gwinnett County',
            race_and_ethnicity: 'All',
            rate: 7.3,
          },
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
        ],
        'rate-map',
        DEMO,
        metricConfig,
      ),
    ).toBe(3)
  })

  test('time-series entry count respects the selected groups', () => {
    expect(
      countInsightRows(
        [
          { race_and_ethnicity: 'Black (NH)', time_period: '2010', rate: 5 },
          { race_and_ethnicity: 'Black (NH)', time_period: '2020', rate: 8 },
          { race_and_ethnicity: 'White (NH)', time_period: '2010', rate: 3 },
          { race_and_ethnicity: 'White (NH)', time_period: '2020', rate: 4 },
        ],
        'rates-over-time',
        DEMO,
        metricConfig,
        { selectedGroups: ['Black (NH)'] },
      ),
    ).toBe(2)
  })

  test('a multi-place map narrows to the highlighted group plus the overall row', () => {
    expect(
      countInsightRows(
        [
          { fips_name: 'Fulton County', race_and_ethnicity: 'All', rate: 5 },
          {
            fips_name: 'Fulton County',
            race_and_ethnicity: 'Black (NH)',
            rate: 9,
          },
          {
            fips_name: 'Fulton County',
            race_and_ethnicity: 'White (NH)',
            rate: 4,
          },
          { fips_name: 'Cobb County', race_and_ethnicity: 'All', rate: 6 },
          {
            fips_name: 'Cobb County',
            race_and_ethnicity: 'Black (NH)',
            rate: 8,
          },
          {
            fips_name: 'Cobb County',
            race_and_ethnicity: 'White (NH)',
            rate: 3,
          },
        ],
        'rate-map',
        DEMO,
        metricConfig,
        { activeDemographicGroup: 'Black (NH)' },
      ),
    ).toBe(4)
  })
})
describe('getInsightDataStatus', () => {
  const oneRow = new MetricQueryResponse([
    { fips_name: 'Bartow County', race_and_ethnicity: 'All', rate: 13 },
  ])
  const twoRows = new MetricQueryResponse([
    { fips_name: 'Fulton County', race_and_ethnicity: 'All', rate: 9 },
    { fips_name: 'Bartow County', race_and_ethnicity: 'All', rate: 13 },
  ])
  const empty = new MetricQueryResponse([])

  test("'multi' when two or more values are present, regardless of region rate", () => {
    expect(
      getInsightDataStatus('rate-map', dataTypeConfig, DEMO, [twoRows]),
    ).toBe('multi')
  })

  test("'single-region' when a map has under two values but the region has an overall rate", () => {
    expect(
      getInsightDataStatus('rate-map', dataTypeConfig, DEMO, [oneRow], {
        regionHasAllRate: true,
      }),
    ).toBe('single-region')
  })

  test("'empty' when the region has no overall rate to rank (regionHasAllRate false)", () => {
    // A lone subgroup row leaves no overall rate, so the region can't be ranked
    // as an overall value against its peers — it stays hidden.
    expect(
      getInsightDataStatus('rate-map', dataTypeConfig, DEMO, [oneRow], {
        regionHasAllRate: false,
      }),
    ).toBe('empty')
  })

  test("a non-map chart is 'empty' even with an overall region rate", () => {
    // Peer ranking only makes sense for maps.
    expect(
      getInsightDataStatus('data-table', dataTypeConfig, DEMO, [oneRow], {
        regionHasAllRate: true,
      }),
    ).toBe('empty')
  })

  test("'single-region' for a state with no on-screen children but an overall rate", () => {
    // A state map whose county children have no data: entryCount 0, but the
    // state's own rate lets it rank against peer states.
    expect(
      getInsightDataStatus('rate-map', dataTypeConfig, DEMO, [empty], {
        regionHasAllRate: true,
      }),
    ).toBe('single-region')
  })

  test("'empty' when there is no query response at all", () => {
    expect(
      getInsightDataStatus('rate-map', dataTypeConfig, DEMO, undefined),
    ).toBe('empty')
  })
})

describe('summarizePeerComparison', () => {
  const base = { regionLabel: 'Bartow County', peerNoun: 'Georgia counties' }

  test('ranks the region among reporting peers and summarizes the spread', () => {
    const summary = summarizePeerComparison({
      ...base,
      regionValue: 13,
      peerValues: [2, 5, 8, 9, 21],
      shortLabel: 'per 100k',
    })
    expect(summary).toEqual({
      regionLabel: 'Bartow County',
      regionValue: 13,
      peerNoun: 'Georgia counties',
      reportingCount: 5,
      higherThanCount: 4, // 2, 5, 8, 9 are below 13
      median: 8,
      min: 2,
      max: 21,
      shortLabel: 'per 100k',
    })
  })

  test('averages the two middle values for an even peer count', () => {
    const summary = summarizePeerComparison({
      ...base,
      regionValue: 10,
      peerValues: [4, 6, 8, 10], // median of 6 and 8 = 7
      shortLabel: 'per 100k',
    })
    expect(summary?.median).toBe(7)
  })

  test('returns null when too few peers report', () => {
    expect(
      summarizePeerComparison({
        ...base,
        regionValue: 13,
        peerValues: [8, 9], // below MIN_REPORTING_PEERS
        shortLabel: 'per 100k',
      }),
    ).toBeNull()
  })
})

describe('buildInsightFocusSuffix', () => {
  test('empty when no context is given', () => {
    expect(buildInsightFocusSuffix()).toBe('')
    expect(buildInsightFocusSuffix({})).toBe('')
  })

  test('ignores an activeDemographicGroup of "All"', () => {
    expect(buildInsightFocusSuffix({ activeDemographicGroup: 'All' })).toBe('')
  })

  test('includes a non-All highlighted map group', () => {
    expect(
      buildInsightFocusSuffix({ activeDemographicGroup: 'Black (NH)' }),
    ).toBe('Black (NH)')
  })

  test('sorts selectedGroups so legend order does not change the key', () => {
    expect(
      buildInsightFocusSuffix({ selectedGroups: ['White (NH)', 'Black (NH)'] }),
    ).toBe('Black (NH),White (NH)')
    expect(
      buildInsightFocusSuffix({ selectedGroups: ['Black (NH)', 'White (NH)'] }),
    ).toBe('Black (NH),White (NH)')
  })

  test('combines highlighted group and selected groups with a pipe', () => {
    expect(
      buildInsightFocusSuffix({
        activeDemographicGroup: 'Black (NH)',
        selectedGroups: ['White (NH)', 'Asian (NH)'],
      }),
    ).toBe('Black (NH)|Asian (NH),White (NH)')
  })

  test('empty selectedGroups array contributes nothing', () => {
    expect(buildInsightFocusSuffix({ selectedGroups: [] })).toBe('')
  })
})

describe('getRegionAllRate', () => {
  const label = 'Bartow County'

  test('returns the labeled overall rate from the region-self response', () => {
    const response = new MetricQueryResponse([
      { fips: '13015', race_and_ethnicity: 'All', rate: 2.6 },
      { fips: '13015', race_and_ethnicity: 'White (NH)', rate: 1.9 },
    ])
    expect(getRegionAllRate(response, metricConfig, DEMO, label)).toEqual({
      label: 'Bartow County',
      value: 2.6,
      shortLabel: 'per 100k',
    })
  })

  test('returns undefined when the region has no "All" row', () => {
    const response = new MetricQueryResponse([
      { fips: '13015', race_and_ethnicity: 'White (NH)', rate: 1.9 },
    ])
    expect(
      getRegionAllRate(response, metricConfig, DEMO, label),
    ).toBeUndefined()
  })

  test('returns undefined when the "All" rate is non-finite (null or NaN)', () => {
    for (const rate of [null, Number.NaN, Number.POSITIVE_INFINITY]) {
      const response = new MetricQueryResponse([
        { fips: '13015', race_and_ethnicity: 'All', rate },
      ])
      expect(
        getRegionAllRate(response, metricConfig, DEMO, label),
      ).toBeUndefined()
    }
  })

  test('returns undefined when the response is undefined', () => {
    expect(
      getRegionAllRate(undefined, metricConfig, DEMO, label),
    ).toBeUndefined()
  })
})

describe('getPeerValues', () => {
  const SELF = '13015' // Bartow County

  test('returns peer "All" rates, excluding self, subgroups, and non-finite values', () => {
    const peers = new MetricQueryResponse([
      { fips: '13015', race_and_ethnicity: 'All', rate: 2.6 }, // self — excluded
      { fips: '13089', race_and_ethnicity: 'All', rate: 8.1 },
      { fips: '13121', race_and_ethnicity: 'All', rate: 12.4 },
      { fips: '13135', race_and_ethnicity: 'All', rate: null }, // suppressed — excluded
      { fips: '13157', race_and_ethnicity: 'All', rate: Number.NaN }, // NaN — excluded
      { fips: '13089', race_and_ethnicity: 'Black (NH)', rate: 15 }, // subgroup — excluded
    ])
    expect(getPeerValues(peers, metricConfig, DEMO, SELF)).toEqual([8.1, 12.4])
  })

  test('returns an empty array when only the selected region reports', () => {
    const peers = new MetricQueryResponse([
      { fips: '13015', race_and_ethnicity: 'All', rate: 2.6 },
    ])
    expect(getPeerValues(peers, metricConfig, DEMO, SELF)).toEqual([])
  })

  test('returns an empty array when the response is undefined', () => {
    expect(getPeerValues(undefined, metricConfig, DEMO, SELF)).toEqual([])
  })
})
