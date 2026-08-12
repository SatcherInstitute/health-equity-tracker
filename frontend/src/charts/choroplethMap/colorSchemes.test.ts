import { describe, expect, it } from 'vitest'
import type { MapConfig } from '../../data/config/MetricConfigTypes'
import { colors } from '../../styles/tokens/colors'
import { getFillColor, getStrokeColor } from './colorSchemes'
import type { ColorScale, MetricData } from './types'

const mapConfig = { mid: '#mid', zero: '#zero' } as unknown as MapConfig
const colorScale = ((v: number) => `#scale${v}`) as unknown as ColorScale

const feature = (id: string) => ({ id }) as any

const build = (
  entries: Array<[string, Partial<MetricData>]>,
  isExtremesMode = false,
) => {
  const dataMap = new Map(entries as Array<[string, MetricData]>)
  return (id: string) => {
    const options = {
      d: feature(id),
      dataMap,
      colorScale,
      mapConfig,
      isExtremesMode,
      isMultiMap: true,
    }
    return {
      fill: getFillColor(options),
      stroke: getStrokeColor(options),
    }
  }
}

describe('getFillColor absence encoding', () => {
  const at = build([
    ['01', { value: 12 }],
    ['02', { value: 0 }],
    ['03', { value: undefined, isSuppressed: true }],
    ['04', { value: undefined, isSuppressed: false }],
  ])

  it('fills a suppressed geography grey', () => {
    expect(at('03').fill).toEqual(colors.altGray)
  })

  it('fills an unexplained gap white so it reads as a hole in the data', () => {
    expect(at('04').fill).toEqual(colors.altWhite)
  })

  it('treats a geography absent from the map entirely as unexplained', () => {
    expect(at('99').fill).toEqual(colors.altWhite)
  })

  it('leaves real values on the color scale', () => {
    expect(at('01').fill).toEqual('#scale12')
    expect(at('02').fill).toEqual('#zero')
  })

  it('keeps white meaning "outside the selection" in extremes mode', () => {
    const extremes = build(
      [['03', { value: undefined, isSuppressed: true }]],
      true,
    )
    expect(extremes('03').fill).toEqual(colors.altWhite)
    expect(extremes('99').fill).toEqual(colors.altWhite)
  })
})

describe('getStrokeColor', () => {
  const at = build([
    ['01', { value: 12 }],
    ['03', { value: undefined, isSuppressed: true }],
    ['04', { value: undefined, isSuppressed: false }],
  ])

  it('outlines a white geography in grey so it stays visible', () => {
    expect(at('04').stroke).toEqual(colors.altGray)
  })

  it('strokes suppressed data with dark border for grayscale distinction', () => {
    expect(at('01').stroke).toEqual(colors.altWhite)
    expect(at('03').stroke).toEqual(colors.altBlack)
  })

  it('never leaves a fill and stroke both white', () => {
    for (const id of ['01', '03', '04', '99']) {
      const { fill, stroke } = at(id)
      expect(fill === colors.altWhite && stroke === colors.altWhite).toBe(false)
    }
  })
})
