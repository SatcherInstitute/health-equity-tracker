import { describe, expect, it } from 'vitest'
import { createQuantileLegend } from './mapLegendUtils'
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
