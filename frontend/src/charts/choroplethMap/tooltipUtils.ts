import * as d3 from 'd3'
import type { MetricConfig } from '../../data/config/MetricConfigTypes'
import { isPctType } from '../../data/config/MetricConfigUtils'
import {
  CAWP_METRICS,
  getWomenRaceLabel,
} from '../../data/providers/CawpProvider'
import type { DemographicType } from '../../data/query/Breakdowns'
import { ThemeZIndexValues, het } from '../../styles/DesignTokens'
import { getMapGroupLabel } from '../mapHelperFunctions'
import type { MetricData } from './types'

const { white: WHITE, greyGridColorDarker: BORDER_GREY, borderColor } = het
const { multimapModalTooltip, mapTooltip } = ThemeZIndexValues

// Shared constants
export const TOOLTIP_OFFSET = { x: 10, y: 10 } as const

export const GEO_HOVERED_OPACITY = 0.5
export const GEO_HOVERED_BORDER_COLOR = het.white
export const GEO_HOVERED_BORDER_WIDTH = 2

export const createTooltipContainer = (isMulti?: boolean) => {
  const tooltipZnumber = isMulti ? multimapModalTooltip : mapTooltip
  const tooltipZIndex = tooltipZnumber.toString()

  return d3
    .select('body')
    .append('div')
    .style('position', 'absolute')
    .style('visibility', 'hidden')
    .style('max-width', '40vw')
    .style('background-color', WHITE)
    .style('border', `1px solid ${BORDER_GREY}`)
    .style('border-radius', '4px')
    .style('padding', '8px')
    .style('font-size', '12px')
    .style('z-index', tooltipZIndex)
}

export const formatMetricValue = (
  value: number | undefined,
  metricConfig: MetricConfig,
  isLegendLabel?: boolean,
): string => {
  if (value === undefined || value === null) return 'no data'

  if (metricConfig.type === 'per100k') {
    const suffix = isLegendLabel ? '' : '  per 100k'
    return `${d3.format(',.2s')(value)}${suffix}`
  }

  if (isPctType(metricConfig.type)) {
    return `${d3.format('d')(value)}%`
  }

  return d3.format(',.2r')(value)
}

export const getTooltipLabel = (
  isUnknownsMap: boolean | undefined,
  metric: MetricConfig,
  activeDemographicGroup: string,
  demographicType: DemographicType,
): string => {
  if (isUnknownsMap) {
    return metric.unknownsLabel || '% unknown'
  }

  if (CAWP_METRICS.includes(metric.metricId)) {
    return `Rate — ${getWomenRaceLabel(activeDemographicGroup)}`
  }

  return getMapGroupLabel(
    demographicType,
    activeDemographicGroup,
    metric.type === 'index' ? 'Score' : 'Rate',
  )
}

export const generateTooltipHtml = (
  feature: any,
  dataMap: Map<string, MetricData>,
  metricConfig: MetricConfig,
  geographyType: string = '',
  isSummaryMap: boolean = false,
) => {
  const name = feature.properties?.name || String(feature.id)
  const data = dataMap.get(feature.id as string)

  if (!data) {
    return `
      <div>
        <strong>${name} ${geographyType}</strong><br/>
        No data available
      </div>
    `
  }

  const entries = Object.entries(data)
    .filter(([key]) => !(key === 'County SVI' && geographyType !== 'County'))
    .filter(([key]) => key !== 'value')

  const [firstLabel, firstValue] = entries[0] ?? ['', 0]
  const remainingEntries = entries.slice(1)

  const exploreText = isSummaryMap
    ? ''
    : `Click region to explore map of ${name} ${geographyType.toLowerCase()} →`

  return `
    <div>
      <p><span class="font-bold">${name} ${geographyType}</span></p>
      <p> <span class="text-sm">${exploreText} </span></p>
      <hr>
      <div style="text-align: left;">
        <div style="margin-bottom: 4px;">
          <span style="color: ${borderColor};">${firstLabel}:</span> ${formatMetricValue(firstValue as number, metricConfig)}
        </div>
        ${remainingEntries
          .map(
            ([label, value]) =>
              `<div style="margin-bottom: 4px;"><span style="color: ${borderColor};">${label}:</span> ${value?.toLocaleString()}</div>`,
          )
          .join('')}
      </div>
    </div>
  `
}
