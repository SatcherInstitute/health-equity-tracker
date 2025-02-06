import * as d3 from 'd3'
import { het } from '../../styles/DesignTokens'

const { white, greyGridColorDarker } = het

export const createTooltipContainer = () => {
  return d3
    .select('body')
    .append('div')
    .style('position', 'absolute')
    .style('visibility', 'hidden')
    .style('background-color', white)
    .style('border', `1px solid ${greyGridColorDarker}`)
    .style('border-radius', '4px')
    .style('padding', '8px')
    .style('font-size', '12px')
    .style('z-index', '1000')
}
