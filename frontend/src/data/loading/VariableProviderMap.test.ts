import { describe, expect, it } from 'vitest'
import { METRIC_CONFIG } from '../config/MetricConfig'
import type { DataTypeConfig } from '../config/MetricConfigTypes'
import { Breakdowns } from '../query/Breakdowns'
import { MetricQuery } from '../query/MetricQuery'
import VariableProviderMap from './VariableProviderMap'

const providerMap = new VariableProviderMap()

describe('VariableProviderMap', () => {
  it('routes two topics that share a population column to their own providers', () => {
    // The #5266 case: county preventable_hospitalizations and county gun_deaths
    // both read chr_data and both need the same all-ages CHR population column.
    // Selecting on the topic keeps that unambiguous; selecting on the column
    // could not, which is why the column used to be duplicated under two names.
    const ahrQuery = new MetricQuery(
      ['preventable_hospitalizations_per_100k', 'chr_population_pct'],
      Breakdowns.byCounty().andRace(),
      'preventable_hospitalizations',
    )
    const gunQuery = new MetricQuery(
      ['gun_deaths_per_100k', 'chr_population_pct'],
      Breakdowns.byCounty().andRace(),
      'gun_deaths',
    )

    expect(providerMap.getProvider(ahrQuery).providerId).toBe('ahr_provider')
    expect(providerMap.getProvider(gunQuery).providerId).toBe(
      'gun_violence_provider',
    )
  })

  it('routes a topic to the same provider at every geography', () => {
    const geographies = [
      Breakdowns.national(),
      Breakdowns.byState(),
      Breakdowns.byCounty(),
    ]
    const providerIds = geographies.map(
      (breakdowns) =>
        providerMap.getProvider(
          new MetricQuery(['gun_deaths_per_100k'], breakdowns, 'gun_deaths'),
        ).providerId,
    )

    expect(new Set(providerIds)).toEqual(new Set(['gun_violence_provider']))
  })

  it('serves queries with no data type from the geo context provider', () => {
    // Population and SVI map overlays describe a place rather than a topic.
    const query = new MetricQuery(['population'], Breakdowns.byCounty())

    expect(providerMap.getProvider(query).providerId).toBe(
      'geo_context_provider',
    )
  })

  it('throws for a data type that has no registered provider', () => {
    const query = new MetricQuery(
      ['population'],
      Breakdowns.national(),
      // @ts-expect-error - deliberately unregistered data type
      'not_a_real_data_type',
    )

    expect(() => providerMap.getProvider(query)).toThrow(
      /No provider configured for data type: not_a_real_data_type/,
    )
  })

  it('has a provider registered for every configured topic', () => {
    // Guards the one invariant this scheme depends on: a topic that reaches the
    // dropdowns but was never registered here would throw at query time rather
    // than at build time, so assert the whole catalog resolves.
    const allDataTypeConfigs: DataTypeConfig[] =
      Object.values(METRIC_CONFIG).flat()
    expect(allDataTypeConfigs.length).toBeGreaterThan(0)

    const unroutable = allDataTypeConfigs
      .map((config) => config.dataTypeId)
      .filter((dataTypeId) => {
        try {
          providerMap.getProvider(
            new MetricQuery(['population'], Breakdowns.national(), dataTypeId),
          )
          return false
        } catch {
          return true
        }
      })

    expect(unroutable).toEqual([])
  })
})
