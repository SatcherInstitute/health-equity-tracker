import type {
  DataTypeConfig,
  MetricConfig,
} from '../data/config/MetricConfigTypes'
import { MetricQueryResponse } from '../data/query/MetricQuery'
import type { HetRow } from '../data/utils/DatasetTypes'
import {
  buildInsightFocusSuffix,
  buildPrompt,
  formatDataRows,
  formatPeerComparison,
  getInsightDataStatus,
  getPeerValues,
  getRegionAllRate,
  prepareInsightData,
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

  test('a multi-place map defaults to the active demographic group plus each place\'s "All" baseline', () => {
    const rows: HetRow[] = [
      { fips_name: 'Alabama', race_and_ethnicity: 'All', rate: 9 },
      { fips_name: 'Alabama', race_and_ethnicity: 'Black (NH)', rate: 12 },
      { fips_name: 'Alabama', race_and_ethnicity: 'White (NH)', rate: 6 },
      { fips_name: 'Alaska', race_and_ethnicity: 'All', rate: 5 },
      { fips_name: 'Alaska', race_and_ethnicity: 'Black (NH)', rate: 7 },
      { fips_name: 'Alaska', race_and_ethnicity: 'White (NH)', rate: 4 },
    ]
    const result = formatDataRows(
      rows,
      'rate-map',
      DEMO,
      metricConfig,
      undefined,
      'Black (NH)',
    )
    expect(result).toEqual(
      '- Alabama (All): 9 per 100k\n' +
        '- Alabama (Black (NH)): 12 per 100k\n' +
        '- Alaska (All): 5 per 100k\n' +
        '- Alaska (Black (NH)): 7 per 100k',
    )
  })

  test('an active group of "All" on a multi-place map sends every group', () => {
    const rows: HetRow[] = [
      { fips_name: 'Alabama', race_and_ethnicity: 'All', rate: 9 },
      { fips_name: 'Alabama', race_and_ethnicity: 'Black (NH)', rate: 12 },
      { fips_name: 'Alaska', race_and_ethnicity: 'All', rate: 5 },
    ]
    const result = formatDataRows(
      rows,
      'rate-map',
      DEMO,
      metricConfig,
      undefined,
      'All',
    )
    expect(result.split('\n')).toHaveLength(3)
  })

  test('a single-place map falls back to every group in that place, ignoring the active group filter', () => {
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
    const result = formatDataRows(
      rows,
      'rate-map',
      DEMO,
      metricConfig,
      undefined,
      'Black (NH)',
    )
    expect(result.split('\n')).toHaveLength(3)
    expect(result).toContain('- Gwinnett County (All): 7.3 per 100k')
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

  test('a short time series is sent in full, not just first/last', () => {
    const rows: HetRow[] = Array.from({ length: 10 }, (_, i) => ({
      race_and_ethnicity: 'Black (NH)',
      time_period: `${2010 + i}`,
      rate: i,
    }))
    const result = formatDataRows(rows, 'rates-over-time', DEMO, metricConfig)
    expect(result.split('\n')).toHaveLength(10)
  })

  test('a time series too large for the prompt budget keeps the recent tail plus the earliest point', () => {
    const rows: HetRow[] = Array.from({ length: 1000 }, (_, i) => ({
      race_and_ethnicity: 'Black (NH)',
      time_period: `${1017 + i}`,
      rate: i,
    }))
    const result = formatDataRows(rows, 'rates-over-time', DEMO, metricConfig)
    const lines = result.split('\n')
    expect(lines.length).toBeLessThan(1000)
    expect(lines[0]).toEqual('- Black (NH) (1017): 0 per 100k')
    expect(lines[lines.length - 1]).toEqual('- Black (NH) (2016): 999 per 100k')
    // Everything after the anchor is an unbroken run of the most recent years.
    const tail = lines.slice(1)
    const tailYears = tail.map((line) => Number(line.match(/\((\d+)\)/)?.[1]))
    expect(tailYears).toEqual(
      tailYears.map((_, i) => 2016 - (tail.length - 1) + i),
    )
    expect(new TextEncoder().encode(result).length).toBeLessThanOrEqual(
      12 * 1024,
    )
  })

  test('more groups than fit the budget yields whole lines only, never a truncated one', () => {
    const rows: HetRow[] = Array.from({ length: 800 }, (_, i) => ({
      race_and_ethnicity: `Group ${i}`,
      time_period: '2020',
      rate: i,
    }))
    const result = formatDataRows(rows, 'rates-over-time', DEMO, metricConfig)
    const lines = result.split('\n')
    expect(lines.length).toBeLessThan(800)
    for (const line of lines) {
      expect(line).toMatch(/^- Group \d+ \(2020\): \d+ per 100k$/)
    }
    expect(new TextEncoder().encode(result).length).toBeLessThanOrEqual(
      12 * 1024,
    )
  })

  test('a multi-place map keeps the "All women" baseline for women-only topics', () => {
    const rows: HetRow[] = [
      { fips_name: 'Georgia', race_and_ethnicity: 'All women', rate: 5 },
      { fips_name: 'Georgia', race_and_ethnicity: 'Black women', rate: 9 },
      { fips_name: 'Georgia', race_and_ethnicity: 'White women', rate: 4 },
      { fips_name: 'Alabama', race_and_ethnicity: 'All women', rate: 6 },
      { fips_name: 'Alabama', race_and_ethnicity: 'Black women', rate: 11 },
      { fips_name: 'Alabama', race_and_ethnicity: 'White women', rate: 3 },
    ]
    const result = formatDataRows(
      rows,
      'rate-map',
      DEMO,
      metricConfig,
      undefined,
      'Black women',
    )
    expect(result.split('\n')).toHaveLength(4)
    expect(result).toContain('- Georgia (All women): 5 per 100k')
    expect(result).toContain('- Alabama (All women): 6 per 100k')
    expect(result).not.toContain('White women')
  })

  test('an "All women" active group skips filtering, like "All" does', () => {
    const rows: HetRow[] = [
      { fips_name: 'Georgia', race_and_ethnicity: 'All women', rate: 5 },
      { fips_name: 'Georgia', race_and_ethnicity: 'Black women', rate: 9 },
      { fips_name: 'Alabama', race_and_ethnicity: 'All women', rate: 6 },
      { fips_name: 'Alabama', race_and_ethnicity: 'Black women', rate: 11 },
    ]
    const result = formatDataRows(
      rows,
      'rate-map',
      DEMO,
      metricConfig,
      undefined,
      'All women',
    )
    expect(result.split('\n')).toHaveLength(4)
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
      getInsightDataStatus(
        'rate-map',
        dataTypeConfig,
        DEMO,
        [oneRow],
        undefined,
        true,
      ),
    ).toBe('single-region')
  })

  test("'empty' when the region has no overall rate to rank (regionHasAllRate false)", () => {
    // A lone subgroup row leaves no overall rate, so the region can't be ranked
    // as an overall value against its peers — it stays hidden.
    expect(
      getInsightDataStatus(
        'rate-map',
        dataTypeConfig,
        DEMO,
        [oneRow],
        undefined,
        false,
      ),
    ).toBe('empty')
  })

  test("a non-map chart is 'empty' even with an overall region rate", () => {
    // Peer ranking only makes sense for maps.
    expect(
      getInsightDataStatus(
        'data-table',
        dataTypeConfig,
        DEMO,
        [oneRow],
        undefined,
        true,
      ),
    ).toBe('empty')
  })

  test("'single-region' for a state with no on-screen children but an overall rate", () => {
    // A state map whose county children have no data: entryCount 0, but the
    // state's own rate lets it rank against peer states.
    expect(
      getInsightDataStatus(
        'rate-map',
        dataTypeConfig,
        DEMO,
        [empty],
        undefined,
        true,
      ),
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

describe('formatPeerComparison', () => {
  test('renders the region rate, its qualitative standing, and the peer spread', () => {
    const text = formatPeerComparison({
      regionLabel: 'Bartow County',
      regionValue: 13,
      peerNoun: 'Georgia counties',
      reportingCount: 52,
      higherThanCount: 41,
      median: 8.1,
      min: 2.3,
      max: 21,
      shortLabel: 'per 100k',
    })
    expect(text).toContain('- Bartow County: 13 per 100k')
    // 41/52 = 0.788 -> "higher than most"; raw fraction must not appear
    expect(text).toContain('Among 52 Georgia counties: higher than most')
    expect(text).not.toContain('41 of')
    expect(text).toContain('Peer median 8.1 per 100k; range 2.3–21 per 100k')
  })

  test('uses correct label at each tier boundary', () => {
    const base = {
      regionLabel: 'X',
      regionValue: 10,
      peerNoun: 'places',
      median: 8,
      min: 2,
      max: 20,
      shortLabel: 'per 100k',
    }
    const label = (higher: number, total: number) =>
      formatPeerComparison({
        ...base,
        reportingCount: total,
        higherThanCount: higher,
      })
    expect(label(9, 10)).toContain('among the highest') // 0.90 (>=0.9 boundary)
    expect(label(3, 4)).toContain('higher than most') // 0.75 (>=0.75 boundary)
    expect(label(6, 10)).toContain('above the typical') // 0.60 (>=0.6 boundary)
    expect(label(2, 5)).toContain('near the typical') // 0.40 (>=0.4 boundary)
    expect(label(1, 4)).toContain('below the typical') // 0.25 (>=0.25 boundary)
    expect(label(1, 10)).toContain('lower than most') // 0.10 (>=0.1 boundary)
    expect(label(0, 10)).toContain('among the lowest') // 0.00
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

describe('buildPrompt peer framing', () => {
  const args = [
    'rate-map',
    'Gun Deaths',
    'Bartow County, Georgia',
    'race and ethnicity',
    '- Bartow County: 13 per 100k\n- Ranked against 52 Georgia counties...',
  ] as const

  test('uses same-level peer framing when a peer comparison is present', () => {
    const prompt = buildPrompt(...args, undefined, true)
    expect(prompt).toContain('ranked against its peer places')
    expect(prompt).toContain('same data source and methodology')
    // Must not imply a cross-level (state/national) comparison.
    expect(prompt).not.toContain('national average')
  })

  test('falls back to the standard disparity framing without a peer comparison', () => {
    const prompt = buildPrompt(...args, undefined, false)
    expect(prompt).not.toContain('peer places')
    expect(prompt).toContain('most important health equity disparity')
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
