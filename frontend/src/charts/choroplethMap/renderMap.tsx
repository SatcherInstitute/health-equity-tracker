import * as d3 from 'd3'
import type { Feature, GeoJsonProperties, Geometry } from 'geojson'
import { het } from '../../styles/DesignTokens'
import { getCountyAddOn } from '../mapHelperFunctions'
import { getFillColor } from './colorSchemes'
import {
  createDataMap,
  getDenominatorPhrase,
  getNumeratorPhrase,
} from './mapHelpers'
import { createUnknownLegend } from './mapLegendUtils'
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
const MARGIN = { top: -40, right: 0, bottom: 0, left: 0 }
const TERRITORY_CIRCLE_RADIUS = 15
const TERRITORY_CIRCLE_RADIUS_MOBILE = 12

const TERRITORY_MARGIN_TOP = 50
const TERRITORY_RIGHT_MARGIN = 50 // Space from right edge of map
const TERRITORY_US_VERTICAL_GAP = 50

// Territory abbreviations mapping
const TERRITORY_ABBR: Record<string, string> = {
  '11': 'DC',
  '72': 'PR',
  '78': 'VI',
  '66': 'GU',
  '69': 'MP',
  '60': 'AS',
}

// List of FIPS codes for territories and DC
const TERRITORY_FIPS = ['11', '72', '78', '66', '69', '60'] // DC, PR, VI, GU, MP, AS

// Helper to create a fake Feature for territory circles
const createTerritoryFeature = (
  fipsCode: string,
): Feature<Geometry, GeoJsonProperties> => ({
  type: 'Feature',
  geometry: {
    type: 'Point',
    coordinates: [0, 0],
  },
  properties: {},
  id: fipsCode,
})

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
}: RenderMapProps) => {
  const territoryRadius = isMobile
    ? TERRITORY_CIRCLE_RADIUS_MOBILE
    : TERRITORY_CIRCLE_RADIUS

  const territorySpacing = territoryRadius * 3

  const { features, projection } = geoData
  const geographyType = getCountyAddOn(fips, showCounties)

  d3.select(svgRef.current).selectAll('*').remove()

  // Adjust height to accommodate territory circles
  const territoryHeight = TERRITORY_MARGIN_TOP + territoryRadius * 2
  const mapHeight = height - territoryHeight

  const { legendGroup, mapGroup, territoryGroup } = initializeSvg({
    svgRef,
    width,
    height,
    mapHeight,
    isMobile,
    isUnknownsMap,
  })

  projection.fitSize(
    [width, isUnknownsMap ? mapHeight * 0.8 : mapHeight],
    features,
  )
  const path = d3.geoPath(projection)

  const tooltipLabel = getTooltipLabel(
    isUnknownsMap,
    metric,
    isCawp,
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
    .data(
      features.features.filter(
        (f) => f.id && !TERRITORY_FIPS.includes(f.id.toString()),
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

  // Draw territory circles
  const territoryData = dataWithHighestLowest.filter((d) =>
    TERRITORY_FIPS.includes(d.fips),
  )

  const territoryStartX =
    width -
    (TERRITORY_RIGHT_MARGIN +
      (territoryData.length - 1) * territorySpacing +
      territoryRadius)

  const territoryX = (i: number) => territoryStartX + i * territorySpacing

  territoryGroup
    .selectAll('circle')
    .data(territoryData)
    .join('circle')
    .attr('cx', (_, i) => territoryX(i))
    .attr('cy', territoryRadius + TERRITORY_US_VERTICAL_GAP - 24)
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
    .on('click', signalListeners.click)

  // Draw territory labels
  territoryGroup
    .selectAll('text')
    .data(territoryData)
    .join('text')
    .attr('x', (_, i) => territoryX(i))
    .attr('y', territoryRadius + TERRITORY_US_VERTICAL_GAP + 5)
    .attr('text-anchor', 'middle')
    .attr('font-size', '12px')
    .text((d) => TERRITORY_ABBR[d.fips] || d.fips)

  if (!hideLegend && !fips.isCounty() && isUnknownsMap) {
    createUnknownLegend(legendGroup, {
      dataWithHighestLowest,
      metricId: metric.metricId,
      width,
      colorScale,
      title: '% unknown',
      isMobile,
      isPct: true,
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
  }
  if (isMobile) {
    top = 0
  }
  const svg = d3
    .select(svgRef.current)
    .attr('width', width)
    .attr('height', height)

  return {
    svg,
    legendGroup: svg
      .append('g')
      .attr('class', 'legend-container')
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
      tooltipContainer
        .style('top', `${event.pageY + TOOLTIP_OFFSET.y}px`)
        .style('left', `${event.pageX + TOOLTIP_OFFSET.x}px`)
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
