import { describe, expect, it } from 'vitest'
import type {
  MapConfig,
  MetricConfig,
} from '../../data/config/MetricConfigTypes'
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
