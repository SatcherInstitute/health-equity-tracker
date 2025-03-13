import * as d3 from 'd3'
import { TERRITORY_CODES } from '../../data/utils/ConstantsGeography'
import { het } from '../../styles/DesignTokens'
import { getCountyAddOn } from '../mapHelperFunctions'
import { getFillColor } from './colorSchemes'
import {
  createDataMap,
  getDenominatorPhrase,
  getNumeratorPhrase,
} from './mapHelpers'
import { createUnknownLegend } from './mapLegendUtils'
import { TERRITORIES } from './mapTerritoryHelpers'
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
  metricConfig,
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
  isPhrmaAdherence,
}: RenderMapProps) => {
  d3.select(svgRef.current).selectAll('*').remove()

  const territoryHeight = fips.isUsa()
    ? TERRITORIES.marginTop + TERRITORIES.radius * 2
    : 0
  const mapHeight = height - territoryHeight

  const { legendGroup, mapGroup } = initializeSvg({
    svgRef,
    width,
    height,
    mapHeight,
    isMobile,
    isUnknownsMap,
  })

  const { features, projection } = geoData
  const geographyType = getCountyAddOn(fips, showCounties)

  projection.fitSize(
    [width, isUnknownsMap ? mapHeight * 0.8 : mapHeight],
    features,
  )
  const path = d3.geoPath(projection)

  const tooltipLabel = getTooltipLabel(
    isUnknownsMap,
    metricConfig,
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
    metricConfig,
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
        mapConfig,
        isPhrmaAdherence,
      }),
    )
    .attr('stroke', extremesMode ? BORDER_GREY : WHITE)
    .attr('stroke-width', STROKE_WIDTH)
    .on('mouseover', (event, d) =>
      handleMouseEvent('mouseover', event, d, {
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
    .on('mousemove', (event, d) =>
      handleMouseEvent('mousemove', event, d, {
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
    .on('mouseout', (event, d) =>
      handleMouseEvent('mouseout', event, d, {
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
    .on('click', signalListeners.click)

  if (!hideLegend && !fips.isCounty() && isUnknownsMap) {
    createUnknownLegend(legendGroup, {
      dataWithHighestLowest,
      metricId: metricConfig.metricId,
      width,
      colorScale,
      title: '% unknown',
      isMobile,
      isPct: true,
    })
  }

  return {
    dataMap,
    mapHeight,
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
        .attr('fill', value !== undefined ? DARK_BLUE : RED_ORANGE)
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
