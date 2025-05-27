import * as d3 from 'd3'
import { useEffect } from 'react'
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
import { STROKE_WIDTH } from './mapUtils'
import {
  createEventHandler,
  createMouseEventOptions,
} from './mouseEventHandlers'
import { hideTooltips } from './tooltipUtils'
import type { DataPoint } from './types'

const { borderColor: BORDER_GREY, white: WHITE } = het

const TERRITORIES_CONFIG = {
  radius: 16,
  radiusMobile: 12,
  radiusMultiMap: 12,
  verticalGapFromUsa: 50,
  marginTop: 40,
  marginRightForRow: 40,
}

interface TerritoryCirclesProps {
  svgRef: React.RefObject<SVGSVGElement | null>
  width: number
  mapHeight: number
  fips: Fips
  dataWithHighestLowest: DataPoint[]
  colorScale: any
  metricConfig: MetricConfig
  dataMap: Map<string, any>
  tooltipContainer: any
  geographyType: string
  isExtremesMode: boolean
  mapConfig: MapConfig
  signalListeners: any
  isMobile: boolean
  isMulti?: boolean
  isPhrmaAdherence: boolean
  isSummaryLegend?: boolean
  updateFipsCallback: (fips: Fips) => void
}
export default function TerritoryCircles(props: TerritoryCirclesProps) {
  useEffect(() => {
    // Only run if we have a valid SVG ref and it's a USA map
    if (!props.svgRef.current || !props.fips.isUsa()) return

    const mouseEventOptions = createMouseEventOptions(props)

    const territoryRadius = props.isMobile
      ? TERRITORIES_CONFIG.radiusMobile
      : props.isMulti
        ? TERRITORIES_CONFIG.radiusMultiMap
        : TERRITORIES_CONFIG.radius

    const territorySpacing = territoryRadius * 2.5

    // Draw territory circles
    const territoryData = extractTerritoryData(props.dataWithHighestLowest)

    const marginRightForTerrRow = props.isMulti
      ? 10
      : TERRITORIES_CONFIG.marginRightForRow

    const territoryStartX =
      props.width -
      (marginRightForTerrRow +
        (territoryData.length - 1) * territorySpacing +
        territoryRadius)

    const territoryX = (i: number) => territoryStartX + i * territorySpacing

    const svg = d3.select(props.svgRef.current)
    let territoryContainer = svg.select<SVGGElement>('.territory-container')
    if (territoryContainer.empty()) {
      territoryContainer = svg
        .append<SVGGElement>('g')
        .attr('class', 'territory-container')
    }

    territoryContainer.attr('transform', `translate(0, ${props.mapHeight})`)
    territoryContainer.selectAll('*').remove()

    window.addEventListener('wheel', hideTooltips)
    window.addEventListener('click', hideTooltips)
    window.addEventListener('touchmove', hideTooltips)

    // Draw territory circles with click handlers
    territoryContainer
      .selectAll<SVGCircleElement, any>('circle')
      .data(territoryData)
      .join('circle')
      .attr('cx', (_, i) => territoryX(i))
      .attr('cy', territoryRadius + TERRITORIES_CONFIG.verticalGapFromUsa - 24)
      .attr('r', territoryRadius)
      .attr('fill', (d) =>
        getFillColor({
          d: createTerritoryFeature(d.fips),
          dataMap: props.dataMap,
          colorScale: props.colorScale,
          isExtremesMode: props.isExtremesMode,
          mapConfig: props.mapConfig,
          isMultiMap: props.isMulti,
        }),
      )
      .attr('stroke', props.isExtremesMode ? BORDER_GREY : WHITE)
      .attr('stroke-width', STROKE_WIDTH)
      .on('mouseover', (event: any, d) => {
        hideTooltips()
        createEventHandler('mouseover', mouseEventOptions, (d) =>
          createTerritoryFeature(d.fips),
        )(event, d)
      })
      .on('pointerdown', (event: any, d) => {
        hideTooltips()
        createEventHandler('pointerdown', mouseEventOptions, (d) =>
          createTerritoryFeature(d.fips),
        )(event, d)
      })
      .on('mousemove', (event: any, d) => {
        createEventHandler('mousemove', mouseEventOptions, (d) =>
          createTerritoryFeature(d.fips),
        )(event, d)
      })
      .on('mouseout', (event: any, d) => {
        createEventHandler('mouseout', mouseEventOptions, (d) =>
          createTerritoryFeature(d.fips),
        )(event, d)
      })
      .on('touchstart', (event: any, d) => {
        hideTooltips()
        createEventHandler('touchstart', mouseEventOptions, (d) =>
          createTerritoryFeature(d.fips),
        )(event, d)
      })
      .on('touchend', (event: any, d) => {
        createEventHandler('touchend', mouseEventOptions, (d) =>
          createTerritoryFeature(d.fips),
        )(event, d)
      })
      .on('pointerup', (event: any, d) => {
        if (
          event.pointerType === 'mouse' &&
          typeof props.signalListeners.click === 'function'
        ) {
          const territoryFeature = createTerritoryFeature(d.fips)
          props.signalListeners.click(event, territoryFeature)
        }
      })

    // Draw territory labels
    territoryContainer
      .selectAll<SVGTextElement, any>('text')
      .data(territoryData)
      .join('text')
      .attr('x', (_, i) => territoryX(i))
      .attr('y', territoryRadius + TERRITORIES_CONFIG.verticalGapFromUsa + 5)
      .attr('text-anchor', 'middle')
      .attr('font-size', '12px')
      .text((d) => TERRITORY_CODES[d.fips] || d.fips)

    // Return cleanup function for event listeners
    return () => {
      window.removeEventListener('wheel', hideTooltips)
      window.removeEventListener('click', hideTooltips)
      window.removeEventListener('touchmove', hideTooltips)
    }
  }, [
    // Dependencies that should trigger a re-render of territories
    props.svgRef,
    props.width,
    props.mapHeight,
    props.fips,
    props.dataWithHighestLowest,
    props.dataMap,
    props.colorScale,
    props.isExtremesMode,
    props.mapConfig,
    props.isPhrmaAdherence,
    props.signalListeners,
    props.isMobile,
    props.isMulti,
  ])

  // Return null since we're rendering directly with D3
  return null
}
