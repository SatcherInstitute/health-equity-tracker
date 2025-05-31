import * as d3 from 'd3'
import type { MetricConfig } from '../../data/config/MetricConfigTypes'
import { isPctType } from '../../data/config/MetricConfigUtils'
import {
  CAWP_METRICS,
  getWomenRaceLabel,
} from '../../data/providers/CawpProvider'
import type { DemographicType } from '../../data/query/Breakdowns'
import { Fips } from '../../data/utils/Fips'
import { ThemeZIndexValues, het } from '../../styles/DesignTokens'
import { NO_DATA_MESSAGE } from '../mapGlobals'
import { getMapGroupLabel } from '../mapHelperFunctions'
import type { MouseEventHandlerOptions, MouseEventType } from './types'

const { white: WHITE, greyGridColorDarker: BORDER_GREY } = het
const { multimapModalTooltip, mapTooltip } = ThemeZIndexValues

// Shared constants
export const TOOLTIP_OFFSET = { x: 10, y: 10 } as const

export const createTooltipContainer = (isMulti?: boolean) => {
  const tooltipZnumber = isMulti ? multimapModalTooltip : mapTooltip
  const tooltipZIndex = tooltipZnumber.toString()

  return d3
    .select('body')
    .append('div')
    .attr('class', 'tooltip-container')
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
  type: MouseEventType,
  options: MouseEventHandlerOptions,
) => {
  const { geographyType, isSummaryLegend, updateFipsCallback } = options
  const name = feature.properties?.name || String(feature.id)
  const data = options.dataMap.get(feature.id as string)
  const featureId = feature.id

  const exploreText = isSummaryLegend
    ? ''
    : `${type === 'mouseover' ? 'Click current region to explore' : 'Explore'} ${name} ${geographyType} →`

  const entries =
    data &&
    Object.entries(data)
      .filter(([key]) => !(key === 'County SVI' && geographyType !== 'County'))
      .filter(([key]) => key !== 'value')

  // Create the HTML for the tooltip
  const tooltipHtml = `
    <div>
      <p class="font-bold">${name} ${geographyType}</p>
      ${exploreText ? `<button class="pl-2 explore-btn text-sm text-alt-black bg-transparent border-0 " data-feature-id="${featureId}">${exploreText}</button>` : ''}
      <hr class="pl-2 mx-2 " >
      <div style="text-align: left;">

        ${
          entries
            ? entries
                .map(([label, value]: [string, number | undefined]) => {
                  const displayValue =
                    value == null ? NO_DATA_MESSAGE : value.toLocaleString()
                  return `<div class='pl-2 mb-1 text-sm text-alt-black'><span>${label}:</span> ${displayValue}</div>`
                })
                .join('')
            : `<div class='pl-2 mb-1 text-sm text-alt-black'><span>No data</span></div>`
        }
      </div>
    </div>
  `

  // After the tooltip is added to the DOM, attach click handlers
  setTimeout(() => {
    const exploreButtons = document.querySelectorAll(
      '.tooltip-container .explore-btn',
    )
    exploreButtons.forEach((button) => {
      const btn = button as HTMLButtonElement
      const featureId = btn.getAttribute('data-feature-id')

      if (featureId && updateFipsCallback) {
        btn.onclick = (e) => {
          e.preventDefault()
          updateFipsCallback(new Fips(featureId))
        }
      }
    })
  }, 0)

  return tooltipHtml
}

// hide tooltip when user clicks outside the map, scrolls, or drags
export const hideTooltips = () => {
  d3.selectAll('.tooltip-container').style('visibility', 'hidden')
}
