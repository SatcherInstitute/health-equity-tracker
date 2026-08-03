import { describe, expect, test } from 'vitest'
import type { MetricConfig } from '../data/config/MetricConfigTypes'
import { resolveGeneralPopulation } from './TableCard'

const populationMetric: MetricConfig = {
  chartTitle: '',
  metricId: 'ahr_18plus_population_pct',
  columnTitleHeader: 'Adult population share',
  shortLabel: '% of adults',
  type: 'pct_share',
  generalPopulationLabel: 'all adults',
}

const rateWithGeneralPopulation: MetricConfig = {
  chartTitle: 'Voter participation',
  metricId: 'voter_participation_pct_rate',
  shortLabel: '% voter participation',
  type: 'pct_rate',
  isGeneralPopulationComparison: true,
  populationComparisonMetric: populationMetric,
}

describe('resolveGeneralPopulation', () => {
  test('resolves when the flag is set and the rate has data', () => {
    const resolved = resolveGeneralPopulation(rateWithGeneralPopulation, false)
    expect(resolved?.config.metricId).toBe('ahr_18plus_population_pct')
    expect(resolved?.label).toBe('all adults')
  })

  test('withholds when the rate is missing for the whole breakdown', () => {
    expect(
      resolveGeneralPopulation(rateWithGeneralPopulation, true),
    ).toBeUndefined()
  })

  test('withholds when the population metric carries no label', () => {
    const { generalPopulationLabel, ...unlabeled } = populationMetric
    expect(
      resolveGeneralPopulation(
        {
          ...rateWithGeneralPopulation,
          populationComparisonMetric: unlabeled,
        },
        false,
      ),
    ).toBeUndefined()
  })

  test('withholds for a topic whose population column matches its denominator', () => {
    const { isGeneralPopulationComparison, ...unflagged } =
      rateWithGeneralPopulation
    expect(resolveGeneralPopulation(unflagged, false)).toBeUndefined()
  })

  test('withholds when there is no rate config at all', () => {
    expect(resolveGeneralPopulation(undefined, true)).toBeUndefined()
  })
})
