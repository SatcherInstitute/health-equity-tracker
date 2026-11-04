import { describe, expect, it } from 'vitest'
import type { MetricConfig } from '../../data/config/MetricConfigTypes'
import { ALL, BLACK_NH, RACE } from '../../data/utils/Constants'
import { DATA_SUPPRESSED, DATA_UNAVAILABLE } from '../mapGlobals'
import {
  createDataMap,
  getMaternalContextByFips,
  getMaternalContextEntries,
} from './mapHelpers'

const metric = {
  metricId: 'gun_violence_homicide_per_100k',
  shortLabel: 'per 100k',
  type: 'per100k',
  suppressionFlagMetricId: 'gun_violence_homicide_per_100k_is_suppressed',
} as MetricConfig

const countColsMap = {
  numeratorConfig: { metricId: 'gun_homicides_estimated_total' },
  denominatorConfig: { metricId: 'fatal_population_estimated_total' },
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
      fatal_population_estimated_total: 55000,
    })
    expect(entry['# homicides']).toEqual(DATA_SUPPRESSED)
  })

  it('labels a missing numerator as unavailable when the rate is not flagged suppressed', () => {
    const entry = build({
      fips: '01001',
      gun_violence_homicide_per_100k: null,
      gun_violence_homicide_per_100k_is_suppressed: false,
      gun_homicides_estimated_total: null,
      fatal_population_estimated_total: 55000,
    })
    expect(entry['# homicides']).toEqual(DATA_UNAVAILABLE)
  })

  it('never labels a missing denominator as suppressed, even on a suppressed row', () => {
    const entry = build({
      fips: '01001',
      gun_violence_homicide_per_100k: null,
      gun_violence_homicide_per_100k_is_suppressed: true,
      gun_homicides_estimated_total: null,
      fatal_population_estimated_total: null,
    })
    expect(entry['# people']).toEqual(DATA_UNAVAILABLE)
  })

  it('passes real counts through untouched', () => {
    const entry = build({
      fips: '01001',
      gun_violence_homicide_per_100k: 12.3,
      gun_homicides_estimated_total: 7,
      fatal_population_estimated_total: 55000,
    })
    expect(entry['# homicides']).toEqual(7)
    expect(entry['# people']).toEqual(55000)
  })

  it('ignores a suppression column the metric config never declared', () => {
    const metricWithoutFlag = {
      metricId: 'gun_violence_homicide_per_100k',
      shortLabel: 'per 100k',
      type: 'per100k',
    } as MetricConfig
    const entry = createDataMap(
      [
        {
          fips: '01001',
          gun_violence_homicide_per_100k: null,
          gun_violence_homicide_per_100k_is_suppressed: true,
          gun_homicides_estimated_total: null,
          fatal_population_estimated_total: 55000,
        },
      ],
      'homicides per 100k',
      metricWithoutFlag,
      'homicides',
      'people',
      { ...countColsMap },
    ).get('01001') as Record<string, any>
    expect(entry.isSuppressed).toBe(false)
    expect(entry['# homicides']).toEqual(DATA_UNAVAILABLE)
  })

  it('carries the per-row suppression verdict for downstream consumers', () => {
    const suppressed = build({
      fips: '01001',
      gun_violence_homicide_per_100k: null,
      gun_violence_homicide_per_100k_is_suppressed: true,
    })
    const absent = build({
      fips: '01003',
      gun_violence_homicide_per_100k: null,
    })
    expect(suppressed.isSuppressed).toBe(true)
    expect(absent.isSuppressed).toBe(false)
  })

  it('keeps a zero count rather than treating it as missing', () => {
    const entry = build({
      fips: '01001',
      gun_violence_homicide_per_100k: 0,
      gun_homicides_estimated_total: 0,
      fatal_population_estimated_total: 0,
    })
    expect(entry['# homicides']).toEqual(0)
    expect(entry['# people']).toEqual(0)
  })
})

describe('maternal care context tooltip entries', () => {
  it('takes context values from "All" rows only, keyed by fips', () => {
    const contextByFips = getMaternalContextByFips([
      {
        fips: '28',
        [RACE]: ALL,
        maternity_care_desert_pct_rate: 18.1,
        adequate_prenatal_care_pct_rate: 70.2,
        maternity_practices_index: 75,
      },
      { fips: '28', [RACE]: BLACK_NH, maternity_care_desert_pct_rate: null },
      { fips: '06', [RACE]: ALL, maternity_care_desert_pct_rate: null },
    ])

    expect(contextByFips.get('28')).toEqual({
      maternity_care_desert_pct_rate: 18.1,
      adequate_prenatal_care_pct_rate: 70.2,
      maternity_practices_index: 75,
    })
    // a state with no context values gets no entry, so its tooltip is unchanged
    expect(contextByFips.has('06')).toBe(false)
  })

  it('formats each available value with its unit and skips missing ones', () => {
    expect(
      getMaternalContextEntries({
        fips: '28',
        maternity_care_desert_pct_rate: 18.1,
        maternity_practices_index: 75,
      }),
    ).toEqual({
      'Living in a maternity care desert': '18.1% of females ages 15-44',
      'Maternity practices (mPINC) score': '75 out of 100',
    })
  })

  it('adds the context entries to the map tooltip data', () => {
    const entry = build({
      fips: '28',
      gun_violence_homicide_per_100k: 20,
      adequate_prenatal_care_pct_rate: 70.2,
    })
    expect(entry['Adequate prenatal care']).toEqual('70.2% of live births')
    expect(entry['Living in a maternity care desert']).toBeUndefined()
  })
})
