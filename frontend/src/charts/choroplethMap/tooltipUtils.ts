import * as d3 from 'd3'
import type { MetricConfig } from '../../data/config/MetricConfigTypes'
import {
  CAWP_METRICS,
  getWomenRaceLabel,
} from '../../data/providers/CawpProvider'
import type { DemographicType } from '../../data/query/Breakdowns'
import type { DemographicGroup } from '../../data/utils/Constants'
import { het } from '../../styles/DesignTokens'
import { getMapGroupLabel } from '../mapHelperFunctions'
import type { TooltipFeature, TooltipPairs } from './types'

const { white, greyGridColorDarker } = het

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
    .style('background-color', white)
    .style('border', `1px solid ${greyGridColorDarker}`)
    .style('border-radius', '4px')
    .style('padding', '8px')
    .style('font-size', '12px')
    .style('z-index', '1000')
}

/**
 * Formats the tooltip content based on the provided data.
 */

export function getTooltipContent(
  feature: TooltipFeature,
  value: number | undefined,
  tooltipPairs: TooltipPairs,
  geographyType?: any,
): string {
  const name = feature.properties?.name || String(feature.id)
  return `
    <div>
      <strong>${name} ${geographyType}</strong><br/>
      ${Object.entries(tooltipPairs)
        .map(([label, formatter]) => `${label}: ${formatter(value)}`)
        .join('<br/>')}
    </div>
  `
}

export const createTooltipLabel = (
  metric: MetricConfig,
  activeDemographicGroup: DemographicGroup,
  demographicType: DemographicType,
  isUnknownsMap?: boolean,
): string => {
  if (isUnknownsMap) return metric.unknownsVegaLabel || '% unknown'
  if (CAWP_METRICS.includes(metric.metricId)) {
    return `Rate — ${getWomenRaceLabel(activeDemographicGroup)}`
  }
  return getMapGroupLabel(
    demographicType,
    activeDemographicGroup,
    metric.type === 'index' ? 'Score' : 'Rate',
  )
}

export const getTooltipPairs = (tooltipLabel: string): TooltipPairs => {
  return {
    [tooltipLabel]: (value: string | number | undefined) =>
      value !== undefined ? value.toString() : 'no data',
  }
}
