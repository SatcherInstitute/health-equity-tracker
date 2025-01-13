import * as d3 from 'd3'
import type { TooltipPairs } from '../ChoroplethTypes'

/**
 * Creates and styles a tooltip container.
 * @returns {d3.Selection} A D3 selection for the tooltip container.
 */
export const createTooltipContainer = () => {
  return d3
    .select('body')
    .append('div')
    .style('position', 'absolute')
    .style('visibility', 'hidden')
    .style('background-color', '#fff')
    .style('border', '1px solid #ddd')
    .style('border-radius', '4px')
    .style('padding', '8px')
    .style('font-size', '12px')
    .style('z-index', '1000')
}

/**
 * Formats the tooltip content based on the provided data.
 * @param {object} d - GeoJSON feature data.
 * @param {string | number | undefined} value - The data value for the feature.
 * @param {TooltipPairs} tooltipPairs - Key-value pairs for tooltip labels and formatters.
 * @returns {string} The HTML content for the tooltip.
 */
export const getTooltipContent = (
  d: { properties: { name: string } },
  value: string | number | undefined,
  tooltipPairs: TooltipPairs,
) => {
  const name = d.properties?.name || 'Unknown'
  return `
    <div>
      <strong>${name}</strong><br/>
      ${Object.entries(tooltipPairs)
        .map(([label, formatter]) => `${label}: ${formatter(value)}`)
        .join('<br/>')}
    </div>
  `
}
