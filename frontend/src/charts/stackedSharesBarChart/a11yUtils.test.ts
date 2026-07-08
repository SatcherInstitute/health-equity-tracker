import { describe, expect, it } from 'vitest'
import type { MetricConfig } from '../../data/config/MetricConfigTypes'
import type { HetRow } from '../../data/utils/DatasetTypes'
import { getStackedBarA11ySummary } from './a11yUtils'

const lightMetric = {
  metricId: 'hiv_population_pct',
  shortLabel: '% of population',
  type: 'pct_share',
} as MetricConfig

const darkMetric = {
  metricId: 'hiv_prevalence_pct_share',
  shortLabel: '% of cases',
  type: 'pct_share',
} as MetricConfig

describe('getStackedBarA11ySummary', () => {
  it('returns empty string for empty data', () => {
    expect(
      getStackedBarA11ySummary(
        [],
        lightMetric,
        darkMetric,
        'race_and_ethnicity',
      ),
    ).toBe('')
  })

  it('returns empty string when only the All row is present', () => {
    const data: HetRow[] = [
      {
        race_and_ethnicity: 'All',
        hiv_population_pct: 100,
        hiv_prevalence_pct_share: 100,
      },
    ]
    expect(
      getStackedBarA11ySummary(
        data,
        lightMetric,
        darkMetric,
        'race_and_ethnicity',
      ),
    ).toBe('')
  })

  it('names the largest-gap and most-proportionate groups', () => {
    const data: HetRow[] = [
      {
        race_and_ethnicity: 'Black or African American (NH)',
        hiv_population_pct: 12,
        hiv_prevalence_pct_share: 40,
      },
      {
        race_and_ethnicity: 'White (NH)',
        hiv_population_pct: 60,
        hiv_prevalence_pct_share: 58,
      },
    ]
    expect(
      getStackedBarA11ySummary(
        data,
        lightMetric,
        darkMetric,
        'race_and_ethnicity',
      ),
    ).toBe(
      'Black or African American (NH) has the largest gap: 40 % of cases vs. 12 % of population. White (NH) has the most proportionate representation.',
    )
  })

  it('collapses to a single sentence when only one group exists', () => {
    const data: HetRow[] = [
      {
        race_and_ethnicity: 'White (NH)',
        hiv_population_pct: 60,
        hiv_prevalence_pct_share: 58,
      },
    ]
    expect(
      getStackedBarA11ySummary(
        data,
        lightMetric,
        darkMetric,
        'race_and_ethnicity',
      ),
    ).toBe(
      'White (NH) has the largest gap: 58 % of cases vs. 60 % of population.',
    )
  })

  it('filters out rows where either metric is NaN or null', () => {
    const data: HetRow[] = [
      {
        race_and_ethnicity: 'Asian (NH)',
        hiv_population_pct: Number.NaN,
        hiv_prevalence_pct_share: 5,
      },
      {
        race_and_ethnicity: 'Some other race (NH)',
        hiv_population_pct: 3,
        hiv_prevalence_pct_share: null,
      },
      {
        race_and_ethnicity: 'White (NH)',
        hiv_population_pct: 60,
        hiv_prevalence_pct_share: 58,
      },
    ]
    expect(
      getStackedBarA11ySummary(
        data,
        lightMetric,
        darkMetric,
        'race_and_ethnicity',
      ),
    ).toBe(
      'White (NH) has the largest gap: 58 % of cases vs. 60 % of population.',
    )
  })
})
