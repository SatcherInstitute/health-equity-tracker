import * as d3 from 'd3'
import { isPctType } from '../../data/config/MetricConfigUtils'
import { TERRITORY_CODES } from '../../data/utils/ConstantsGeography'
import { het } from '../../styles/DesignTokens'
import { getCountyAddOn } from '../mapHelperFunctions'
import { getFillColor } from './colorSchemes'
import {
  createDataMap,
  getDenominatorPhrase,
  getNumeratorPhrase,
} from './mapHelpers'
import { createRateMapLegend, createUnknownLegend } from './mapLegendUtils'
import {
  TERRITORIES,
  createTerritoryFeature,
  extractTerritoryData,
} from './mapTerritoryHelpers'
import { generateTooltipHtml, getTooltipLabel } from './tooltipUtils'
import type {
  InitializeSvgProps,
  MouseEventHandlerProps,
  RenderMapProps,
} from './types'

const {
  darkBlue: DARK_BLUE,
  redOrange: RED_ORANGE,
  white: WHITE,
  borderColor: BORDER_GREY,
} = het

const STROKE_WIDTH = 0.5
const TOOLTIP_OFFSET = { x: 10, y: 10 } as const
const MARGIN = { top: -40, right: 150, bottom: 0, left: 0 }

export const renderMap = ({
  geoData,
  fips,
  showCounties,
  colorScale,
  height,
  width,
  svgRef,
  tooltipContainer,
  isMobile,
  metric,
  extremesMode,
  dataWithHighestLowest,
  isUnknownsMap,
  isCawp,
  activeDemographicGroup,
  demographicType,
  countColsMap,
  mapConfig,
  hideLegend,
  signalListeners,
  isMulti,
}: RenderMapProps) => {
  const territoryRadius = isMobile
    ? TERRITORIES.radiusMobile
    : isMulti
      ? TERRITORIES.radiusMultiMap
      : TERRITORIES.radius

  const territorySpacing = territoryRadius * 3

  const { features, projection } = geoData
  const geographyType = getCountyAddOn(fips, showCounties)

  d3.select(svgRef.current).selectAll('*').remove()

  // Adjust height to accommodate territory circles
  const territoryHeight = fips.isUsa()
    ? TERRITORIES.marginTop + territoryRadius * 2
    : 0
  const mapHeight = height - territoryHeight

  const { unknownsLegendGroup, mapGroup, territoryGroup, rateMapLegendGroup } =
    initializeSvg({
      svgRef,
      width,
      height,
      mapHeight,
      isMobile,
      isUnknownsMap,
    })

  projection.fitSize(
    [width - MARGIN.right, isUnknownsMap ? mapHeight * 0.8 : mapHeight],
    features,
  )
  const path = d3.geoPath(projection)

  const tooltipLabel = getTooltipLabel(
    isUnknownsMap,
    metric,
    activeDemographicGroup,
    demographicType,
  )
  const numeratorPhrase = getNumeratorPhrase(
    isCawp,
    countColsMap,
    demographicType,
    activeDemographicGroup,
  )
  const denominatorPhrase = getDenominatorPhrase(
    isCawp,
    countColsMap,
    demographicType,
    activeDemographicGroup,
  )

  const dataMap = createDataMap(
    dataWithHighestLowest,
    tooltipLabel,
    metric,
    numeratorPhrase,
    denominatorPhrase,
    countColsMap,
  )

  // Draw main map
  mapGroup
    .selectAll('path')
    // skip territory shapes on national map
    .data(
      features.features.filter(
        (f) => f.id && (!fips.isUsa() || !TERRITORY_CODES[f.id.toString()]),
      ),
    )
    .join('path')
    .attr('d', (d) => path(d) || '')
    .attr('fill', (d) =>
      getFillColor({
        d,
        dataMap,
        colorScale,
        extremesMode,
        zeroColor: mapConfig.min,
        countyColor: mapConfig.mid,
        fips,
      }),
    )
    .attr('stroke', extremesMode ? BORDER_GREY : WHITE)
    .attr('stroke-width', STROKE_WIDTH)
    .on('mouseover', (event, d) =>
      handleMouseEvent('mouseover', event, d, {
        colorScale,
        metric,
        dataMap,
        tooltipContainer,
        geographyType,
        extremesMode,
        mapConfig,
        fips,
      }),
    )
    .on('mousemove', (event, d) =>
      handleMouseEvent('mousemove', event, d, {
        colorScale,
        metric,
        dataMap,
        tooltipContainer,
        geographyType,
        extremesMode,
        mapConfig,
        fips,
      }),
    )
    .on('mouseout', (event, d) =>
      handleMouseEvent('mouseout', event, d, {
        colorScale,
        metric,
        dataMap,
        tooltipContainer,
        geographyType,
        extremesMode,
        mapConfig,
        fips,
      }),
    )
    .on('click', signalListeners.click)

  // Draw territory circles, including grayed out for missing data
  const territoryData = extractTerritoryData(fips.code, dataWithHighestLowest)

  const marginRightForTerrRow = isMulti ? 0 : TERRITORIES.marginRightForRow

  const territoryStartX =
    width -
    (marginRightForTerrRow +
      (territoryData.length - 1) * territorySpacing +
      territoryRadius)

  const territoryX = (i: number) => territoryStartX + i * territorySpacing

  territoryGroup
    .selectAll('circle')
    .data(territoryData)
    .join('circle')
    .attr('cx', (_, i) => territoryX(i))
    .attr('cy', territoryRadius + TERRITORIES.verticalGapFromUsa - 24)
    .attr('r', territoryRadius)
    .attr('fill', (d) =>
      getFillColor({
        d: createTerritoryFeature(d.fips),
        dataMap,
        colorScale,
        extremesMode,
        zeroColor: mapConfig.min,
        countyColor: mapConfig.mid,
        fips,
      }),
    )
    .attr('stroke', extremesMode ? BORDER_GREY : WHITE)
    .attr('stroke-width', STROKE_WIDTH)
    .on('mouseover', (event, d) =>
      handleMouseEvent('mouseover', event, createTerritoryFeature(d.fips), {
        colorScale,
        metric,
        dataMap,
        tooltipContainer,
        geographyType,
        extremesMode,
        mapConfig,
        fips,
      }),
    )
    .on('mousemove', (event, d) =>
      handleMouseEvent('mousemove', event, createTerritoryFeature(d.fips), {
        colorScale,
        metric,
        dataMap,
        tooltipContainer,
        geographyType,
        extremesMode,
        mapConfig,
        fips,
      }),
    )
    .on('mouseout', (event, d) =>
      handleMouseEvent('mouseout', event, createTerritoryFeature(d.fips), {
        colorScale,
        metric,
        dataMap,
        tooltipContainer,
        geographyType,
        extremesMode,
        mapConfig,
        fips,
      }),
    )
    .on('click', (event, d) => {
      const territoryFeature = createTerritoryFeature(d.fips)
      signalListeners.click(event, territoryFeature)
    })

  // Draw territory labels
  territoryGroup
    .selectAll('text')
    .data(territoryData)
    .join('text')
    .attr('x', (_, i) => territoryX(i))
    .attr('y', territoryRadius + TERRITORIES.verticalGapFromUsa + 5)
    .attr('text-anchor', 'middle')
    .attr('font-size', '12px')
    .text((d) => TERRITORY_CODES[d.fips] || d.fips)

  if (!hideLegend && !fips.isCounty() && isUnknownsMap) {
    createUnknownLegend(unknownsLegendGroup, {
      dataWithHighestLowest,
      metricId: metric.metricId,
      width,
      colorScale,
      title: '% unknown',
      isMobile,
      isPct: true,
    })
  } else if (!hideLegend && !isUnknownsMap) {
    createRateMapLegend(rateMapLegendGroup, {
      dataWithHighestLowest,
      metricId: metric.metricId,
      metricConfig: metric,
      width,
      colorScale,
      isMobile,
      isPct: isPctType(metric.type),
      mapConfig,
    })
  }
}

interface ExtendedInitializeSvgProps extends InitializeSvgProps {
  mapHeight: number
}

const initializeSvg = ({
  svgRef,
  width,
  height,
  mapHeight,
  isMobile,
  isUnknownsMap,
}: ExtendedInitializeSvgProps) => {
  let { left, top } = MARGIN
  if (isUnknownsMap) {
    top = 20
  } else if (isMobile) {
    top = 0
  }
  const svg = d3
    .select(svgRef.current)
    .attr('width', width)
    .attr('height', height)

  return {
    svg,
    unknownsLegendGroup: svg
      .append('g')
      .attr('class', 'unknowns-legend-container')
      .attr('transform', `translate(${left}, ${isMobile ? 0 : top})`),

    mapGroup: svg
      .append('g')
      .attr('class', 'map-container')
      .attr(
        'transform',
        `translate(${left}, ${isMobile ? top + 10 : top + 50})`,
      ),
    territoryGroup: svg
      .append('g')
      .attr('class', 'territory-container')
      .attr('transform', `translate(0, ${mapHeight})`),
    rateMapLegendGroup: svg
      .append('g')
      .attr('class', 'rate-map-legend-container')
      .attr('transform', `translate(${left}, ${isMobile ? 0 : top})`),
    // .attr('transform', `translate(${width - MARGIN.right + 10}, ${isMobile ? 0 : top})`),
  }
}
const handleMouseEvent = (
  type: 'mouseover' | 'mouseout' | 'mousemove',
  event: any,
  d: any,
  props: MouseEventHandlerProps,
) => {
  const {
    colorScale,
    metric,
    dataMap,
    tooltipContainer,
    geographyType,
    extremesMode,
    mapConfig,
    fips,
  } = props

  if (!tooltipContainer) return

  switch (type) {
    case 'mouseover': {
      if (!d || !dataMap) return
      const value = dataMap.get(d.id as string)?.value

      d3.select(event.currentTarget)
        .attr('fill', value !== undefined ? DARK_BLUE : RED_ORANGE)
        .style('cursor', 'pointer')

      const tooltipHtml = generateTooltipHtml(d, dataMap, metric, geographyType)
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
          zeroColor: mapConfig?.min || '',
          countyColor: mapConfig?.mid || '',
          fips,
        }),
      )
      tooltipContainer.style('visibility', 'hidden').html('')
      break
    }
  }
}
