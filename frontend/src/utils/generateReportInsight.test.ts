import type { MetricConfig } from '../data/config/MetricConfigTypes'
import type { HetRow } from '../data/utils/DatasetTypes'
import {
  formatAgeAdjustedRatios,
  formatDemographicRates,
  formatGeographicSpread,
  formatTemporalChange,
  formatUnknownShare,
} from './generateReportInsight'

const DEMO = 'race_and_ethnicity'

const metricConfig = {
  metricId: 'rate',
  shortLabel: 'per 100k',
} as unknown as MetricConfig

describe('formatDemographicRates', () => {
  test('puts the overall row first, then groups from highest to lowest', () => {
    const rows: HetRow[] = [
      { race_and_ethnicity: 'White (NH)', rate: 4.1 },
      { race_and_ethnicity: 'Black (NH)', rate: 9.2 },
      { race_and_ethnicity: 'All', rate: 6.5 },
    ]

    expect(formatDemographicRates(rows, DEMO, metricConfig)).toBe(
      [
        '- All: 6.5 per 100k',
        '- Black (NH): 9.2 per 100k',
        '- White (NH): 4.1 per 100k',
      ].join('\n'),
    )
  })

  test('drops rows with no group or no numeric rate so no null reaches the model', () => {
    const rows: HetRow[] = [
      { race_and_ethnicity: 'All', rate: 6.5 },
      { race_and_ethnicity: 'Asian (NH)', rate: null },
      { race_and_ethnicity: null, rate: 3.3 },
    ]

    expect(formatDemographicRates(rows, DEMO, metricConfig)).toBe(
      '- All: 6.5 per 100k',
    )
  })

  test('renders identically regardless of row order, so the prompt hash is stable', () => {
    const rows: HetRow[] = [
      { race_and_ethnicity: 'All', rate: 6.5 },
      { race_and_ethnicity: 'Black (NH)', rate: 9.2 },
      { race_and_ethnicity: 'White (NH)', rate: 4.1 },
    ]

    expect(
      formatDemographicRates([...rows].reverse(), DEMO, metricConfig),
    ).toBe(formatDemographicRates(rows, DEMO, metricConfig))
  })
})

describe('formatGeographicSpread', () => {
  const place = (name: string, rate: number): HetRow => ({
    fips_name: name,
    rate,
  })

  test('names every place when the list is short enough to fit', () => {
    const rows = [place('Fulton', 8), place('Cobb', 5), place('Clarke', 2)]

    expect(formatGeographicSpread(rows, metricConfig, 'counties')).toBe(
      '- All 3 counties: Fulton 8, Cobb 5, Clarke 2 per 100k',
    )
  })

  test('summarizes as highest, lowest, and median once the list is long', () => {
    const rows = [
      place('A', 10),
      place('B', 9),
      place('C', 8),
      place('D', 7),
      place('E', 6),
      place('F', 5),
      place('G', 4),
    ]

    expect(formatGeographicSpread(rows, metricConfig, 'counties')).toBe(
      [
        '- Highest: A 10, B 9, C 8 per 100k',
        '- Lowest: G 4, F 5, E 6 per 100k',
        '- Median across 7 counties: 7 per 100k',
      ].join('\n'),
    )
  })

  test('says nothing for a single place, since one value is not a spread', () => {
    expect(
      formatGeographicSpread([place('Fulton', 8)], metricConfig, 'counties'),
    ).toBe('')
  })

  test('ignores places with no numeric rate', () => {
    const rows = [place('Fulton', 8), { fips_name: 'Cobb', rate: null }]

    expect(formatGeographicSpread(rows, metricConfig, 'counties')).toBe('')
  })
})

describe('formatTemporalChange', () => {
  const point = (
    group: string,
    time_period: string,
    rate: number | null,
  ): HetRow => ({ race_and_ethnicity: group, time_period, rate })

  test('reduces each series to its first and latest reported points', () => {
    const rows = [
      point('All', '2020', 5),
      point('All', '2022', 8),
      point('All', '2021', 6),
    ]

    expect(formatTemporalChange(rows, DEMO, metricConfig)).toBe(
      '- All: 5 in 2020, 8 in 2022 per 100k',
    )
  })

  test('puts the overall series first, then groups by latest rate', () => {
    const rows = [
      point('White (NH)', '2020', 3),
      point('White (NH)', '2022', 4),
      point('Black (NH)', '2020', 7),
      point('Black (NH)', '2022', 9),
      point('All', '2020', 5),
      point('All', '2022', 6),
    ]

    expect(formatTemporalChange(rows, DEMO, metricConfig)).toBe(
      [
        '- All: 5 in 2020, 6 in 2022 per 100k',
        '- Black (NH): 7 in 2020, 9 in 2022 per 100k',
        '- White (NH): 3 in 2020, 4 in 2022 per 100k',
      ].join('\n'),
    )
  })

  test('drops a series with only one period, since one point is not a change', () => {
    const rows = [
      point('All', '2022', 5),
      point('Black (NH)', '2020', 7),
      point('Black (NH)', '2022', 9),
    ]

    expect(formatTemporalChange(rows, DEMO, metricConfig)).toBe(
      '- Black (NH): 7 in 2020, 9 in 2022 per 100k',
    )
  })

  test('picks endpoints from the periods that actually report a rate', () => {
    const rows = [
      point('All', '2019', null),
      point('All', '2020', 5),
      point('All', '2022', 8),
      point('All', '2023', null),
    ]

    expect(formatTemporalChange(rows, DEMO, metricConfig)).toBe(
      '- All: 5 in 2020, 8 in 2022 per 100k',
    )
  })
})

describe('formatAgeAdjustedRatios', () => {
  const ratioConfig = {
    metricId: 'death_ratio_age_adjusted',
    shortLabel: 'Ratio compared to White (NH)',
  } as unknown as MetricConfig

  test('ranks groups by how far their burden exceeds the baseline', () => {
    const rows: HetRow[] = [
      { race_and_ethnicity: 'Asian (NH)', death_ratio_age_adjusted: 1.1 },
      { race_and_ethnicity: 'Black (NH)', death_ratio_age_adjusted: 2.4 },
    ]

    expect(formatAgeAdjustedRatios(rows, DEMO, ratioConfig)).toBe(
      [
        '- Black (NH): 2.4x the White (NH) rate',
        '- Asian (NH): 1.1x the White (NH) rate',
      ].join('\n'),
    )
  })

  test('says nothing when no group has a computable ratio', () => {
    const rows: HetRow[] = [
      { race_and_ethnicity: 'Black (NH)', death_ratio_age_adjusted: null },
    ]

    expect(formatAgeAdjustedRatios(rows, DEMO, ratioConfig)).toBe('')
  })
})

describe('formatUnknownShare', () => {
  const shareConfig = {
    metricId: 'share_unknown',
    shortLabel: '%',
  } as unknown as MetricConfig

  test('keeps only the unknown rows, so known groups are not double-counted', () => {
    const rows: HetRow[] = [
      { race_and_ethnicity: 'Black (NH)', share_unknown: 0 },
      { race_and_ethnicity: 'Unknown', share_unknown: 14.2 },
    ]

    expect(formatUnknownShare(rows, DEMO, shareConfig)).toBe(
      '- Unknown: 14.2% of cases',
    )
  })

  test('names both rows when race and ethnicity are reported separately', () => {
    const rows: HetRow[] = [
      { race_and_ethnicity: 'Unknown race', share_unknown: 9 },
      { race_and_ethnicity: 'Unknown ethnicity', share_unknown: 21 },
    ]

    expect(formatUnknownShare(rows, DEMO, shareConfig)).toBe(
      ['- Unknown race: 9% of cases', '- Unknown ethnicity: 21% of cases'].join(
        '\n',
      ),
    )
  })

  test('says nothing when no unknown row reports a number', () => {
    const rows: HetRow[] = [
      { race_and_ethnicity: 'All', share_unknown: 100 },
      { race_and_ethnicity: 'Unknown', share_unknown: null },
    ]

    expect(formatUnknownShare(rows, DEMO, shareConfig)).toBe('')
  })
})
