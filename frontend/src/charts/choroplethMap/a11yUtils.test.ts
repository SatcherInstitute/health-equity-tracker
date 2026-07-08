import { describe, expect, it } from 'vitest'
import type { MetricConfig } from '../../data/config/MetricConfigTypes'
import { Fips } from '../../data/utils/Fips'
import { getMapA11ySummary } from './a11yUtils'
import type { DataPoint } from './types'

const pctShareConfig = {
  metricId: 'hiv_prevalence_pct_share',
  type: 'pct_share',
} as MetricConfig

const usa = new Fips('00')

describe('getMapA11ySummary', () => {
  it('reports no data for empty input', () => {
    expect(getMapA11ySummary([], pctShareConfig, usa)).toBe(
      'No data available for this map.',
    )
  })

  it('names highest and lowest with a coverage sentence', () => {
    const data = [
      { fips: '13', fips_name: 'Georgia', hiv_prevalence_pct_share: 40 },
      { fips: '49', fips_name: 'Utah', hiv_prevalence_pct_share: 5 },
      { fips: '01', fips_name: 'Alabama', hiv_prevalence_pct_share: 20 },
    ] as DataPoint[]
    expect(getMapA11ySummary(data, pctShareConfig, usa)).toBe(
      'Georgia has the highest value at 40%. Utah has the lowest at 5%. Data available for 3 states/territories.',
    )
  })

  it('collapses to a single sentence when only one row is valid', () => {
    const data = [
      { fips: '13', fips_name: 'Georgia', hiv_prevalence_pct_share: 40 },
      { fips: '49', fips_name: 'Utah', hiv_prevalence_pct_share: Number.NaN },
      { fips: '01', fips_name: 'Alabama', hiv_prevalence_pct_share: null },
    ] as DataPoint[]
    expect(getMapA11ySummary(data, pctShareConfig, usa)).toBe(
      'Georgia has a value of 40%. Data available for 1 states/territories.',
    )
  })

  it('falls back to the fips code when fips_name is missing', () => {
    const data = [{ fips: '13', hiv_prevalence_pct_share: 40 }] as DataPoint[]
    expect(getMapA11ySummary(data, pctShareConfig, usa)).toContain(
      '13 has a value of 40%.',
    )
  })

  it('uses the largest-share-of-unknowns phrasing on the unknowns map', () => {
    const data = [
      { fips: '13', fips_name: 'Georgia', hiv_prevalence_pct_share: 12 },
      { fips: '49', fips_name: 'Utah', hiv_prevalence_pct_share: 3 },
    ] as DataPoint[]
    expect(
      getMapA11ySummary(data, pctShareConfig, usa, true, 'race and ethnicity'),
    ).toBe(
      'Georgia has the largest share of cases with unknown race and ethnicity at 12%.',
    )
  })

  it('still reports no data on the unknowns map with empty input', () => {
    expect(
      getMapA11ySummary([], pctShareConfig, usa, true, 'race and ethnicity'),
    ).toBe('No data available for this map.')
  })
})
