import type { Legend } from 'vega'
import type { LegendsProps } from './types'
import { LEGEND_TEXT_FONT } from '../mapGlobals'

export const Legends = ({ chartDimensions }: LegendsProps) => {
  const circleLegends: Legend = {
    fill: 'variables',
    orient: chartDimensions.legendOrient,
    // legendX and legendY are ignored when orient isn't "none"
    legendX: -100,
    legendY: -35,
    labelFont: LEGEND_TEXT_FONT,
    labelLimit: 500,
  }

  const legends = [circleLegends]

  return legends
}
