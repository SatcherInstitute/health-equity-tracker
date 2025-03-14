import * as d3 from 'd3'
import type {
  MapConfig,
  MetricConfig,
} from '../../data/config/MetricConfigTypes'
import { TERRITORY_CODES } from '../../data/utils/ConstantsGeography'
import type { Fips } from '../../data/utils/Fips'
import { het } from '../../styles/DesignTokens'
import { getFillColor } from './colorSchemes'
import {
  createTerritoryFeature,
  extractTerritoryData,
} from './mapTerritoryHelpers'
import { generateTooltipHtml } from './tooltipUtils'
import type { DataPoint } from './types'

const { borderColor: BORDER_GREY, white: WHITE } = het

interface TerritoryCirclesProps {
  svgRef: React.RefObject<SVGSVGElement>
  width: number
  mapHeight: number
  fips: Fips
  dataWithHighestLowest: DataPoint[]
  colorScale: any
  metricConfig: MetricConfig
  dataMap: Map<string, any>
  tooltipContainer: any
  geographyType: string
  extremesMode: boolean
  mapConfig: MapConfig
  signalListeners: any
  isMobile: boolean
  isMulti?: boolean
  isPhrmaAdherence: boolean
}

const STROKE_WIDTH = 0.5
const TOOLTIP_OFFSET = { x: 10, y: 10 } as const

export const TERRITORIES_CONFIG = {
  radius: 16,
  radiusMobile: 12,
  radiusMultiMap: 12,
  verticalGapFromUsa: 50,
  marginTop: 40,
  marginRightForRow: 40,
}

export const TerritoryCircles = ({
  svgRef,
  width,
  mapHeight,
  fips,
  dataWithHighestLowest,
  colorScale,
  metricConfig,
  dataMap,
  tooltipContainer,
  geographyType,
  extremesMode,
  mapConfig,
  signalListeners,
  isMobile,
  isMulti,
  isPhrmaAdherence,
}: TerritoryCirclesProps) => {
  const renderTerritories = () => {
    if (!svgRef.current || !fips.isUsa()) return null

    const territoryRadius = isMobile
      ? TERRITORIES_CONFIG.radiusMobile
      : isMulti
        ? TERRITORIES_CONFIG.radiusMultiMap
        : TERRITORIES_CONFIG.radius

    const territorySpacing = territoryRadius * 2.5

    // Draw territory circles
    const territoryData = extractTerritoryData(fips.code, dataWithHighestLowest)

    const marginRightForTerrRow = isMulti
      ? 10
      : TERRITORIES_CONFIG.marginRightForRow

    const territoryStartX =
      width -
      (marginRightForTerrRow +
        (territoryData.length - 1) * territorySpacing +
        territoryRadius)

    const territoryX = (i: number) => territoryStartX + i * territorySpacing

    const territoryGroup = d3
      .select(svgRef.current)
      .select('.territory-container')
      .attr('transform', `translate(0, ${mapHeight})`)

    if (territoryGroup.empty()) {
      d3.select(svgRef.current)
        .append('g')
        .attr('class', 'territory-container')
        .attr('transform', `translate(0, ${mapHeight})`)
    }

    // Clear previous territories
    territoryGroup.selectAll('*').remove()

    // Draw territory circles
    territoryGroup
      .selectAll('circle')
      .data(territoryData)
      .join('circle')
      .attr('cx', (_, i) => territoryX(i))
      .attr('cy', territoryRadius + TERRITORIES_CONFIG.verticalGapFromUsa - 24)
      .attr('r', territoryRadius)
      .attr('fill', (d) =>
        getFillColor({
          d: createTerritoryFeature(d.fips),
          dataMap,
          colorScale,
          extremesMode,
          mapConfig,
          isPhrmaAdherence,
        }),
      )
      .attr('stroke', extremesMode ? BORDER_GREY : WHITE)
      .attr('stroke-width', STROKE_WIDTH)
      .on('mouseover', (event: any, d: any) =>
        handleMouseEvent('mouseover', event, createTerritoryFeature(d.fips), {
          colorScale,
          metricConfig,
          dataMap,
          tooltipContainer,
          geographyType,
          extremesMode,
          mapConfig,
          fips,
          isPhrmaAdherence,
        }),
      )
      .on('mousemove', (event: any, d: any) =>
        handleMouseEvent('mousemove', event, createTerritoryFeature(d.fips), {
          colorScale,
          metricConfig,
          dataMap,
          tooltipContainer,
          geographyType,
          extremesMode,
          mapConfig,
          fips,
          isPhrmaAdherence,
        }),
      )
      .on('mouseout', (event: any, d: any) =>
        handleMouseEvent('mouseout', event, createTerritoryFeature(d.fips), {
          colorScale,
          metricConfig,
          dataMap,
          tooltipContainer,
          geographyType,
          extremesMode,
          mapConfig,
          fips,
          isPhrmaAdherence,
        }),
      )
      .on('click', (event: any, d: any) => {
        const territoryFeature = createTerritoryFeature(d.fips)
        signalListeners.click(event, territoryFeature)
      })

    // Draw territory labels
    territoryGroup
      .selectAll('text')
      .data(territoryData)
      .join('text')
      .attr('x', (_, i) => territoryX(i))
      .attr('y', territoryRadius + TERRITORIES_CONFIG.verticalGapFromUsa + 5)
      .attr('text-anchor', 'middle')
      .attr('font-size', '12px')
      .text((d) => TERRITORY_CODES[d.fips] || d.fips)
  }

  // Execute rendering
  renderTerritories()

  return null
}

const handleMouseEvent = (
  type: 'mouseover' | 'mouseout' | 'mousemove',
  event: any,
  d: any,
  props: {
    colorScale: any
    metricConfig: MetricConfig
    dataMap: Map<string, any>
    tooltipContainer: any
    geographyType: string
    extremesMode: boolean
    mapConfig: MapConfig
    fips: Fips
    isPhrmaAdherence: boolean
  },
) => {
  const {
    colorScale,
    metricConfig,
    dataMap,
    tooltipContainer,
    geographyType,
    extremesMode,
    mapConfig,
    isPhrmaAdherence,
  } = props

  if (!tooltipContainer) return

  switch (type) {
    case 'mouseover': {
      if (!d || !dataMap) return
      const value = dataMap.get(d.id as string)?.value

      d3.select(event.currentTarget)
        .attr('fill', value !== undefined ? het.darkBlue : het.redOrange)
        .style('cursor', 'pointer')

      const tooltipHtml = generateTooltipHtml(
        d,
        dataMap,
        metricConfig,
        geographyType,
      )
      tooltipContainer.style('visibility', 'visible').html(tooltipHtml)
      break
    }
    case 'mousemove': {
      // Get screen width and cursor position
      const screenWidth = window.innerWidth
      const cursorX = event.pageX

      // If cursor is past halfway point, show tooltip to the left
      const tooltipX =
        cursorX > screenWidth / 2
          ? event.pageX -
            TOOLTIP_OFFSET.x -
            tooltipContainer.node()!.getBoundingClientRect().width
          : event.pageX + TOOLTIP_OFFSET.x

      tooltipContainer
        .style('top', `${event.pageY + TOOLTIP_OFFSET.y}px`)
        .style('left', `${tooltipX}px`)
      break
    }
    case 'mouseout': {
      d3.select(event.currentTarget).attr(
        'fill',
        getFillColor({
          d,
          dataMap,
          colorScale,
          extremesMode,
          mapConfig,
          isPhrmaAdherence,
        }),
      )
      tooltipContainer.style('visibility', 'hidden').html('')
      break
    }
  }
}

export default TerritoryCircles
