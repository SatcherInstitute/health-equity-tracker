import { geoPath, select } from 'd3'
import { TERRITORY_CODES } from '../../data/utils/ConstantsGeography'
import { colors } from '../../styles/tokens/colors'
import { getCountyAddOn } from '../mapHelperFunctions'
import { getFillColor } from './colorSchemes'
import {
  createDataMap,
  getDenominatorPhrase,
  getNumeratorPhrase,
  getTooltipLabel,
} from './mapHelpers'
import { TERRITORIES } from './mapTerritoryHelpers'
import { STROKE_WIDTH } from './mapUtils'
import {
  createEventHandler,
  createMouseEventOptions,
} from './mouseEventHandlers'
import type {
  ColorScale,
  InitializeSvgOptions,
  RenderMapOptions,
} from './types'

const MARGIN = { top: 0, right: 0, bottom: 0, left: 0 }
// Extra downward nudge of the map group on mobile; must also be subtracted
// from the projection fit height or the bottom of the map clips off the SVG
const MOBILE_TOP_OFFSET = 10

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

  select(svgRef.current).selectAll('*').remove()

  const territoryHeight = fips.isUsa()
    ? TERRITORIES.marginTop + TERRITORIES.radius * 2
    : 0
  const mapHeight =
    height - territoryHeight - (isMobile ? MOBILE_TOP_OFFSET : 0)

  const { mapGroup } = initializeSvg({
    svgRef: svgRef,
    width: width,
    height: height,
    isMobile: isMobile,
    isUnknownsMap: isUnknownsMap,
  })

  const { features, projection } = geoData
  const geographyType = getCountyAddOn(fips, showCounties)

  projection.fitSize([width, mapHeight], features)
  const path = geoPath(projection)

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

  const mouseEventOptions = createMouseEventOptions(
    options,
    dataMap,
    geographyType,
    demographicType,
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
        colorScale: colorScale as ColorScale,
        isExtremesMode: isExtremesMode,
        mapConfig: mapConfig,
        isMultiMap: isMulti,
      }),
    )
    .attr('stroke', isExtremesMode ? colors.altGray : colors.altWhite)
    .attr('stroke-width', STROKE_WIDTH)
    .on('mouseover', (event: any, d) => {
      createEventHandler('mouseover', mouseEventOptions)(event, d)
    })
    .on('mouseout', (event: any, d) => {
      createEventHandler('mouseout', mouseEventOptions)(event, d)
    })
    .on('touchstart', (event: any, d) => {
      createEventHandler('touchstart', mouseEventOptions)(event, d)
    })
    .on('touchend', (event: any, d) => {
      createEventHandler('touchend', mouseEventOptions)(event, d)
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
  }
}

const initializeSvg = (options: InitializeSvgOptions) => {
  const { svgRef, width, height, isMobile } = options
  const { left, top } = MARGIN

  const svg = select(svgRef.current).attr('width', width).attr('height', height)

  return {
    mapGroup: svg
      .append('g')
      .attr('class', 'map-container')
      .attr(
        'transform',
        `translate(${left}, ${isMobile ? top + MOBILE_TOP_OFFSET : top})`,
      ),
  }
}
