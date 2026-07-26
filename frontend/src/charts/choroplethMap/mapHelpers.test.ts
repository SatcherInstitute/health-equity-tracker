import { describe, expect, it } from 'vitest'
import type { MetricConfig } from '../../data/config/MetricConfigTypes'
import { DATA_SUPPRESSED, DATA_UNAVAILABLE } from '../mapGlobals'
import { createDataMap } from './mapHelpers'

const metric = {
  metricId: 'gun_violence_homicide_per_100k',
  shortLabel: 'per 100k',
  type: 'per100k',
} as MetricConfig

const countColsMap = {
  numeratorConfig: { metricId: 'gun_homicides_estimated_total' },
  denominatorConfig: { metricId: 'fatal_population' },
}

const build = (row: Record<string, any>) =>
  createDataMap([row], 'homicides per 100k', metric, 'homicides', 'people', {
    ...countColsMap,
  }).get(row.fips) as Record<string, any>

describe('createDataMap suppressed vs unavailable labels', () => {
  it('labels a missing numerator as suppressed when the rate is flagged suppressed', () => {
    const entry = build({
      fips: '01001',
      gun_violence_homicide_per_100k: null,
      gun_violence_homicide_per_100k_is_suppressed: true,
      gun_homicides_estimated_total: null,
      fatal_population: 55000,
    })
    expect(entry['# homicides']).toEqual(DATA_SUPPRESSED)
  })

  it('labels a missing numerator as unavailable when the rate is not flagged suppressed', () => {
    const entry = build({
      fips: '01001',
      gun_violence_homicide_per_100k: null,
      gun_violence_homicide_per_100k_is_suppressed: false,
      gun_homicides_estimated_total: null,
      fatal_population: 55000,
    })
    expect(entry['# homicides']).toEqual(DATA_UNAVAILABLE)
  })

  it('never labels a missing denominator as suppressed, even on a suppressed row', () => {
    const entry = build({
      fips: '01001',
      gun_violence_homicide_per_100k: null,
      gun_violence_homicide_per_100k_is_suppressed: true,
      gun_homicides_estimated_total: null,
      fatal_population: null,
    })
    expect(entry['# people']).toEqual(DATA_UNAVAILABLE)
  })

  it('passes real counts through untouched', () => {
    const entry = build({
      fips: '01001',
      gun_violence_homicide_per_100k: 12.3,
      gun_homicides_estimated_total: 7,
      fatal_population: 55000,
    })
    expect(entry['# homicides']).toEqual(7)
    expect(entry['# people']).toEqual(55000)
  })

  it('keeps a zero count rather than treating it as missing', () => {
    const entry = build({
      fips: '01001',
      gun_violence_homicide_per_100k: 0,
      gun_homicides_estimated_total: 0,
      fatal_population: 0,
    })
    expect(entry['# homicides']).toEqual(0)
    expect(entry['# people']).toEqual(0)
  })
})
