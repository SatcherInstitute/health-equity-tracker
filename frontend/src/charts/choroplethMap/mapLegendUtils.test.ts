import { describe, expect, it } from 'vitest'
import {
  createLegendForSmallDataset,
  createQuantileLegend,
} from './mapLegendUtils'
import type { ColorScale } from './types'

function makeScale(
  quantiles: number[],
  colorFn: (v: number) => string,
): ColorScale & { quantiles(): number[] } {
  return Object.assign(colorFn, {
    quantiles: () => quantiles,
  }) as unknown as ColorScale & { quantiles(): number[] }
}

describe('createQuantileLegend', () => {
  it('deduplicates repeated quantile thresholds', () => {
    const scale = makeScale([11, 11, 31, 31], (v) =>
      v <= 11 ? '#low' : v <= 31 ? '#mid' : '#high',
    )
    const labels = createQuantileLegend(scale, String).map((i) => i.label)
    expect(labels).toEqual(['< 11', '11 – 31', '≥ 31'])
  })

  it('returns empty array when all thresholds collapse to a single value', () => {
    const scale = makeScale([11, 11, 11, 11], () => '#same')
    expect(createQuantileLegend(scale, String)).toHaveLength(0)
  })

  it('passes through clean (no-duplicate) thresholds unchanged', () => {
    const scale = makeScale([10, 20, 30], (v) =>
      v <= 10 ? '#a' : v <= 20 ? '#b' : v <= 30 ? '#c' : '#d',
    )
    const labels = createQuantileLegend(scale, String).map((i) => i.label)
    expect(labels).toEqual(['< 10', '10 – 20', '20 – 30', '≥ 30'])
  })
})

describe('createLegendForSmallDataset', () => {
  const scale = (() => '#fill') as unknown as ColorScale
  // Rates render to two significant figures, so 119.6 and 123 both read "120".
  const twoSigFigs = (v: number) => String(Math.round(v / 10) * 10)

  it('collapses values that share a rounded label', () => {
    const labels = createLegendForSmallDataset(
      [92, 119.6, 123, 240],
      scale,
      twoSigFigs,
    ).map((i) => i.label)
    expect(labels).not.toContain('120 – 120')
    expect(labels).toEqual(['90 – 120', '120 – 240', '≥ 240'])
  })

  it('keeps values whose labels differ', () => {
    const labels = createLegendForSmallDataset([10, 20, 30], scale, String).map(
      (i) => i.label,
    )
    expect(labels).toEqual(['10 – 19.99', '20 – 29.99', '≥ 30'])
  })

  it('renders a single item when every value shares one label', () => {
    expect(
      createLegendForSmallDataset([119, 120, 121], scale, twoSigFigs),
    ).toHaveLength(1)
  })
})
