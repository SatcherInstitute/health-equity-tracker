import { describe, expect, it } from 'vitest'
import type {
  MapConfig,
  MetricConfig,
} from '../../data/config/MetricConfigTypes'
import { TERRITORY_CODES } from '../../data/utils/ConstantsGeography'
import { Fips } from '../../data/utils/Fips'
import { colors } from '../../styles/tokens/colors'
import { DATA_SUPPRESSED, NO_DATA_MESSAGE } from '../mapGlobals'
import { processLegendData } from './legendDataProcessor'
import type { ColorScale } from './types'

const metricConfig = {
  metricId: 'gun_violence_homicide_per_100k',
  shortLabel: 'per 100k',
  type: 'per100k',
  suppressionFlagMetricId: 'gun_violence_homicide_per_100k_is_suppressed',
} as MetricConfig

const mapConfig = { mid: '#008somewhere', zero: '#eee' } as MapConfig

const colorScale = (() => '#123456') as unknown as ColorScale

const labelsFor = (data: Array<Record<string, any>>) =>
  processLegendData({
    data,
    metricConfig,
    mapConfig,
    colorScale,
  }).specialItems.map((item) => item.label)

describe('processLegendData absence swatches', () => {
  it('shows both swatches when a map holds both kinds of absence', () => {
    expect(
      labelsFor([
        { gun_violence_homicide_per_100k: 5 },
        { gun_violence_homicide_per_100k: 12 },
        {
          gun_violence_homicide_per_100k: null,
          gun_violence_homicide_per_100k_is_suppressed: true,
        },
        { gun_violence_homicide_per_100k: null },
      ]),
    ).toEqual([NO_DATA_MESSAGE, DATA_SUPPRESSED])
  })

  it('shows only the suppressed swatch when every gap is suppressed', () => {
    expect(
      labelsFor([
        { gun_violence_homicide_per_100k: 5 },
        { gun_violence_homicide_per_100k: 12 },
        {
          gun_violence_homicide_per_100k: null,
          gun_violence_homicide_per_100k_is_suppressed: true,
        },
      ]),
    ).toEqual([DATA_SUPPRESSED])
  })

  it('treats gaps as unexplained when the metric declares no suppression flag', () => {
    const labels = processLegendData({
      data: [
        { gun_violence_homicide_per_100k: 5 },
        { gun_violence_homicide_per_100k: 12 },
        {
          gun_violence_homicide_per_100k: null,
          gun_violence_homicide_per_100k_is_suppressed: true,
        },
      ],
      metricConfig: {
        ...metricConfig,
        suppressionFlagMetricId: undefined,
      } as MetricConfig,
      mapConfig,
      colorScale,
    }).specialItems.map((item) => item.label)
    expect(labels).toEqual([NO_DATA_MESSAGE])
  })

  it('adds no absence swatch when nothing is missing', () => {
    expect(
      labelsFor([
        { gun_violence_homicide_per_100k: 5 },
        { gun_violence_homicide_per_100k: 12 },
      ]),
    ).toEqual([])
  })

  it('gives the two kinds of absence distinguishable swatches', () => {
    const items = processLegendData({
      data: [
        { gun_violence_homicide_per_100k: 5 },
        {
          gun_violence_homicide_per_100k: null,
          gun_violence_homicide_per_100k_is_suppressed: true,
        },
        { gun_violence_homicide_per_100k: null },
      ],
      metricConfig,
      mapConfig,
      colorScale,
    }).specialItems
    const missing = items.find((item) => item.label === NO_DATA_MESSAGE)
    const suppressed = items.find((item) => item.label === DATA_SUPPRESSED)
    expect(missing?.color).toEqual(colors.altWhite)
    // without this the white swatch is invisible against the legend background
    expect(missing?.borderColor).toEqual(colors.altGray)
    expect(suppressed?.color).toEqual(colors.altGray)
    expect(missing?.color).not.toEqual(suppressed?.color)
  })
})

describe('processLegendData renderedFipsIds filtering', () => {
  it('suppresses No data swatch when the only null rows are orphan FIPS with no drawn shape', () => {
    expect(
      processLegendData({
        data: [
          { fips: '13001', gun_violence_homicide_per_100k: 5 },
          { fips: '13002', gun_violence_homicide_per_100k: 12 },
          { fips: '99999', gun_violence_homicide_per_100k: null },
        ],
        metricConfig,
        mapConfig,
        colorScale,
        renderedFipsIds: new Set(['13001', '13002']),
      }).specialItems.map((i) => i.label),
    ).toEqual([])
  })

  it('shows No data swatch when a rendered feature has a missing value', () => {
    expect(
      processLegendData({
        data: [
          { fips: '13001', gun_violence_homicide_per_100k: 5 },
          { fips: '13002', gun_violence_homicide_per_100k: null },
          { fips: '99999', gun_violence_homicide_per_100k: null },
        ],
        metricConfig,
        mapConfig,
        colorScale,
        renderedFipsIds: new Set(['13001', '13002']),
      }).specialItems.map((i) => i.label),
    ).toEqual([NO_DATA_MESSAGE])
  })

  it('suppresses Suppressed swatch when the only suppressed rows are orphan FIPS', () => {
    expect(
      processLegendData({
        data: [
          { fips: '13001', gun_violence_homicide_per_100k: 5 },
          {
            fips: '99999',
            gun_violence_homicide_per_100k: null,
            gun_violence_homicide_per_100k_is_suppressed: true,
          },
        ],
        metricConfig,
        mapConfig,
        colorScale,
        renderedFipsIds: new Set(['13001']),
      }).specialItems.map((i) => i.label),
    ).toEqual([])
  })
})

describe('processLegendData territory coverage', () => {
  const everyTerritory = Object.keys(TERRITORY_CODES).map((fips) => ({
    fips,
    gun_violence_homicide_per_100k: 5,
  }))

  const labelsForUsa = (data: Array<Record<string, any>>) =>
    processLegendData({
      data,
      metricConfig,
      mapConfig,
      colorScale,
      fips: new Fips('00'),
    }).specialItems.map((item) => item.label)

  it('explains a territory the source omits entirely', () => {
    // the national map still draws a circle for it, so the legend must too
    expect(labelsForUsa(everyTerritory.slice(1))).toEqual([NO_DATA_MESSAGE])
  })

  it('adds no swatch when every territory is covered', () => {
    expect(labelsForUsa(everyTerritory)).toEqual([])
  })

  it('ignores absent territories on a state map, which draws no circles', () => {
    expect(
      processLegendData({
        data: everyTerritory.slice(1),
        metricConfig,
        mapConfig,
        colorScale,
        fips: new Fips('01'),
      }).specialItems,
    ).toEqual([])
  })

  it('adds no absence swatch in extremes mode, where white means filtered out', () => {
    expect(
      processLegendData({
        data: everyTerritory.slice(1),
        metricConfig,
        mapConfig,
        colorScale,
        fips: new Fips('00'),
        isExtremesMode: true,
      }).specialItems,
    ).toEqual([])
  })
})
