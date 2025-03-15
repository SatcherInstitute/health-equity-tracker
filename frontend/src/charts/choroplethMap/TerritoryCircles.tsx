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
import { createEventHandler, createMouseEventProps } from './mouseEventHandlers'
import type { DataPoint } from './types'

const { borderColor: BORDER_GREY, white: WHITE } = het

const STROKE_WIDTH = 0.5
const TOOLTIP_OFFSET = { x: 10, y: 10 } as const

const TERRITORIES_CONFIG = {
  radius: 16,
  radiusMobile: 12,
  radiusMultiMap: 12,
  verticalGapFromUsa: 50,
  marginTop: 40,
  marginRightForRow: 40,
}

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

export default function TerritoryCircles(props: TerritoryCirclesProps) {
  const renderTerritories = () => {
    if (!props.svgRef.current || !props.fips.isUsa()) return null

    const mouseEventProps = createMouseEventProps(props)

    const territoryRadius = props.isMobile
      ? TERRITORIES_CONFIG.radiusMobile
      : props.isMulti
        ? TERRITORIES_CONFIG.radiusMultiMap
        : TERRITORIES_CONFIG.radius

    const territorySpacing = territoryRadius * 2.5

    // Draw territory circles
    const territoryData = extractTerritoryData(
      props.fips.code,
      props.dataWithHighestLowest,
    )

    const marginRightForTerrRow = props.isMulti
      ? 10
      : TERRITORIES_CONFIG.marginRightForRow

    const territoryStartX =
      props.width -
      (marginRightForTerrRow +
        (territoryData.length - 1) * territorySpacing +
        territoryRadius)

    const territoryX = (i: number) => territoryStartX + i * territorySpacing

    const territoryGroup = d3
      .select(props.svgRef.current)
      .select('.territory-container')
      .attr('transform', `translate(0, ${props.mapHeight})`)

    if (territoryGroup.empty()) {
      d3.select(props.svgRef.current)
        .append('g')
        .attr('class', 'territory-container')
        .attr('transform', `translate(0, ${props.mapHeight})`)
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
          dataMap: props.dataMap,
          colorScale: props.colorScale,
          extremesMode: props.extremesMode,
          mapConfig: props.mapConfig,
          isPhrmaAdherence: props.isPhrmaAdherence,
        }),
      )
      .attr('stroke', props.extremesMode ? BORDER_GREY : WHITE)
      .attr('stroke-width', STROKE_WIDTH)
      .on(
        'mouseover',
        createEventHandler('mouseover', mouseEventProps, (d) =>
          createTerritoryFeature(d.fips),
        ),
      )
      .on(
        'mousemove',
        createEventHandler('mousemove', mouseEventProps, (d) =>
          createTerritoryFeature(d.fips),
        ),
      )
      .on(
        'mouseout',
        createEventHandler('mouseout', mouseEventProps, (d) =>
          createTerritoryFeature(d.fips),
        ),
      )
      .on('click', (event: any, d: any) => {
        const territoryFeature = createTerritoryFeature(d.fips)
        props.signalListeners.click(event, territoryFeature)
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
