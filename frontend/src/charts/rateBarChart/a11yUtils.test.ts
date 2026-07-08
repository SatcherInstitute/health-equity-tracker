import { describe, expect, it } from 'vitest'
import type { MetricConfig } from '../../data/config/MetricConfigTypes'
import type { HetRow } from '../../data/utils/DatasetTypes'
import { getRateBarA11ySummary } from './a11yUtils'

const metricConfig = {
  metricId: 'hiv_prevalence_per_100k',
  type: 'per100k',
} as MetricConfig

describe('getRateBarA11ySummary', () => {
  it('returns empty string for empty data', () => {
    expect(getRateBarA11ySummary([], metricConfig, 'sex')).toBe('')
  })

  it('returns empty string when only the All row is present', () => {
    const data: HetRow[] = [{ sex: 'All', hiv_prevalence_per_100k: 100 }]
    expect(getRateBarA11ySummary(data, metricConfig, 'sex')).toBe('')
  })

  it('names highest and lowest groups with a ratio to the All group', () => {
    const data: HetRow[] = [
      { sex: 'All', hiv_prevalence_per_100k: 100 },
      { sex: 'Male', hiv_prevalence_per_100k: 300 },
      { sex: 'Female', hiv_prevalence_per_100k: 50 },
    ]
    expect(getRateBarA11ySummary(data, metricConfig, 'sex')).toBe(
      'Male has the highest rate at 300 per 100k (3.0x the All group). Female has the lowest rate at 50 per 100k.',
    )
  })

  it('collapses to a single sentence when only one comparison group exists', () => {
    const data: HetRow[] = [{ sex: 'Male', hiv_prevalence_per_100k: 300 }]
    expect(getRateBarA11ySummary(data, metricConfig, 'sex')).toBe(
      'Male has the highest rate at 300 per 100k.',
    )
  })

  it('omits the ratio when the All value is zero', () => {
    const data: HetRow[] = [
      { sex: 'All', hiv_prevalence_per_100k: 0 },
      { sex: 'Male', hiv_prevalence_per_100k: 300 },
      { sex: 'Female', hiv_prevalence_per_100k: 50 },
    ]
    expect(getRateBarA11ySummary(data, metricConfig, 'sex')).toBe(
      'Male has the highest rate at 300 per 100k. Female has the lowest rate at 50 per 100k.',
    )
  })

  it('filters out NaN and null values', () => {
    const data: HetRow[] = [
      { sex: 'Male', hiv_prevalence_per_100k: Number.NaN },
      { sex: 'Female', hiv_prevalence_per_100k: null },
      { sex: 'Other', hiv_prevalence_per_100k: 75 },
    ]
    expect(getRateBarA11ySummary(data, metricConfig, 'sex')).toBe(
      'Other has the highest rate at 75 per 100k.',
    )
  })

  it('collapses to one sentence naming the first-found row when all values tie', () => {
    const data: HetRow[] = [
      { sex: 'Male', hiv_prevalence_per_100k: 100 },
      { sex: 'Female', hiv_prevalence_per_100k: 100 },
    ]
    expect(getRateBarA11ySummary(data, metricConfig, 'sex')).toBe(
      'Male has the highest rate at 100 per 100k.',
    )
  })
})
