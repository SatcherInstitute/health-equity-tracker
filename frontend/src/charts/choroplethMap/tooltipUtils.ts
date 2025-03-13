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

export const createTooltipContainer = (isMulti?: boolean) => {
  const tooltipZnumber = isMulti ? multimapModalTooltip : mapTooltip
  const tooltipZIndex = tooltipZnumber.toString()

  return d3
    .select('body')
    .append('div')
    .style('position', 'absolute')
    .style('visibility', 'hidden')
    .style('background-color', WHITE)
    .style('border', `1px solid ${BORDER_GREY}`)
    .style('border-radius', '4px')
    .style('padding', '8px')
    .style('font-size', '12px')
    .style('z-index', tooltipZIndex)
}

const formatMetricValue = (
  value: number | undefined,
  metricConfig: MetricConfig,
): string => {
  if (value === undefined) return 'no data'

  if (metricConfig.type === 'per100k') {
    return `${d3.format(',.2s')(value)} per 100k`
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
    return metric.unknownsVegaLabel || '% unknown'
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

  return `
    <div>
      <strong>${name} ${geographyType}</strong>
      <div style="text-align: center;">
        <div style="margin-bottom: 4px;">
          <span style="color: ${borderColor};">${firstLabel}:</span> ${formatMetricValue(firstValue as number, metricConfig)}
        </div>
        ${remainingEntries
          .map(
            ([label, value]) =>
              `<div style="margin-bottom: 4px;"><span style="color: ${borderColor};">${label}:</span> ${value}</div>`,
          )
          .join('')}
      </div>
    </div>
  `
}
