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
import { TERRITORIES } from './mapTerritoryHelpers'
import { STROKE_WIDTH } from './mapUtils'
import {
  createEventHandler,
  createMouseEventOptions,
} from './mouseEventHandlers'
import { getTooltipLabel, hideTooltips } from './tooltipUtils'
import type { ColorScale, InitializeSvgProps, RenderMapOptions } from './types'

const { white: WHITE, borderColor: BORDER_GREY } = het
const MARGIN = { top: 0, right: 0, bottom: 0, left: 0 }

export const renderMap = (options: RenderMapOptions) => {
  const {
    svgRef,
    width,
    height,
    fips,
    isMobile,
    isUnknownsMap,
    geoData,
    isCawp,
    countColsMap,
    demographicType,
    activeDemographicGroup,
    dataWithHighestLowest,
    metricConfig,
    showCounties,
    signalListeners,
    isMulti,
    mapConfig,
    isExtremesMode,
    colorScale,
  } = options

  d3.select(svgRef.current).selectAll('*').remove()

  const territoryHeight = fips.isUsa()
    ? TERRITORIES.marginTop + TERRITORIES.radius * 2
    : 0
  const mapHeight = height - territoryHeight

  const { mapGroup } = initializeSvg({
    svgRef: svgRef,
    width: width,
    height: height,
    mapHeight,
    isMobile: isMobile,
    isUnknownsMap: isUnknownsMap,
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

  const mouseEventProps = createMouseEventOptions(
    options,
    dataMap,
    geographyType,
  )

  // Add event listeners
  window.addEventListener('wheel', hideTooltips)
  window.addEventListener('click', hideTooltips)
  window.addEventListener('touchmove', hideTooltips)

  // Create a cleanup function for event listeners
  const cleanupEventListeners = () => {
    window.removeEventListener('wheel', hideTooltips)
    window.removeEventListener('click', hideTooltips)
    window.removeEventListener('touchmove', hideTooltips)
  }

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
        colorScale: colorScale as ColorScale,
        isExtremesMode: isExtremesMode,
        mapConfig: mapConfig,
        isMultiMap: isMulti,
      }),
    )
    .attr('stroke', isExtremesMode ? BORDER_GREY : WHITE)
    .attr('stroke-width', STROKE_WIDTH)
    .on('mouseover', (event: any, d) => {
      hideTooltips()
      createEventHandler('mouseover', mouseEventProps)(event, d)
    })
    .on('pointerdown', (event: any, d) => {
      hideTooltips()
      createEventHandler('pointerdown', mouseEventProps)(event, d)
    })
    .on('mousemove', (event: any, d) => {
      createEventHandler('mousemove', mouseEventProps)(event, d)
    })
    .on('mouseout', (event: any, d) => {
      createEventHandler('mouseout', mouseEventProps)(event, d)
    })
    .on('touchstart', (event: any, d) => {
      hideTooltips()
      createEventHandler('touchstart', mouseEventProps)(event, d)
    })
    .on('touchend', (event: any, d) => {
      createEventHandler('touchend', mouseEventProps)(event, d)
    })
    .on('pointerup', (event: any, d) => {
      if (
        event.pointerType === 'mouse' &&
        typeof signalListeners.click === 'function'
      ) {
        signalListeners.click(event, d)
      }
    })

  return {
    dataMap,
    mapHeight,
    cleanupEventListeners, // Return the cleanup function for event listeners
  }
}

interface ExtendedInitializeSvgProps extends InitializeSvgProps {
  mapHeight: number
}

const initializeSvg = (options: ExtendedInitializeSvgProps) => {
  const { svgRef, width, height, isMobile } = options
  const { left, top } = MARGIN

  const svg = d3
    .select(svgRef.current)
    .attr('width', width)
    .attr('height', height)

  return {
    mapGroup: svg
      .append('g')
      .attr('class', 'map-container')
      .attr('transform', `translate(${left}, ${isMobile ? top + 10 : top})`),
  }
}
