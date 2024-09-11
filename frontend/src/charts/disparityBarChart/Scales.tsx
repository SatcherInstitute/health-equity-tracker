import type { Scale } from 'vega'
import { BAR_PADDING, DATASET, LEGEND_COLORS } from './constants'
import type { ScalesProps } from './types'

export function Scales({
  largerMeasure,
  demographicType,
  LEGEND_DOMAINS,
}: ScalesProps) {
  const xScales: Scale = {
    name: 'x',
    type: 'linear',
    domain: { data: DATASET, field: largerMeasure },
    range: [0, { signal: 'width' }],
    nice: true,
    zero: true,
  }

  const yScales: Scale = {
    name: 'y',
    type: 'band',
    domain: {
      data: DATASET,
      field: demographicType,
    },
    range: { step: { signal: 'y_step' } },
    paddingInner: BAR_PADDING,
  }

  const variables: Scale = {
    name: 'variables',
    type: 'ordinal',
    domain: LEGEND_DOMAINS,
    range: LEGEND_COLORS,
  }

  const scales: Scale[] = [xScales, yScales, variables]

  return scales
}
