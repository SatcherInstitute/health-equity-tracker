import * as d3 from 'd3'
import type { MetricConfig } from '../../data/config/MetricConfigTypes'
import { het } from '../../styles/DesignTokens'
import { formatMetricValue } from './mapHelpers'
import type { MetricData, TooltipFeature } from './types'

const { white, greyGridColorDarker, altGrey } = het

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

export function getTooltipContent(
  feature: TooltipFeature,
  dataMap: Map<string, MetricData>,
  metricConfig: MetricConfig,
  geographyType?: string,
): string {
  const name = feature.properties?.name || String(feature.id)
  const data = dataMap.get(feature.id as string)

  if (!data)
    return `<div><strong>${name} ${geographyType || ''}</strong><br/>No data available</div>`

  const entries = Object.entries(data).filter(([key]) => key !== 'value')
  const [firstLabel, firstValue] = entries[0]
  const remainingEntries = entries.slice(1)

  return `
    <div>
      <strong>${name} ${geographyType || ''}</strong>
      <div style="text-align: center">
        <div style="margin-bottom: 4px">
          <span style="color: ${altGrey}">${firstLabel}:</span> ${formatMetricValue(firstValue as number, metricConfig)}
        </div>
        ${remainingEntries
          .map(
            ([label, value]) =>
              `<div style="margin-bottom: 4px">
                <span style="color: ${altGrey}">${label}:</span> ${value}
              </div>`,
          )
          .join('')}
      </div>
    </div>`
}
