import { geoPath, select } from 'd3'
import { TERRITORY_CODES } from '../../data/utils/ConstantsGeography'
import { DATA_SUPPRESSED, NO_DATA_MESSAGE } from '../mapGlobals'
import { getCountyAddOn } from '../mapHelperFunctions'
import { getFillColor, getStrokeColor } from './colorSchemes'
import {
  createDataMap,
  formatMetricValue,
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

  // Extremes mode draws only the highest and lowest geographies; the rest are
  // background context carrying no value. Announcing each one would make a
  // screen reader user walk thousands of counties to reach the handful that
  // hold the answer, so they leave the accessibility tree entirely.
  const isExtremesContext = (d: any) =>
    isExtremesMode && dataMap.get(d.id?.toString())?.value == null

  const renderedFeatures = features.features.filter(
    (f) => f.id && (!fips.isUsa() || !TERRITORY_CODES[f.id.toString()]),
  )
  const renderedFipsIds = new Set(renderedFeatures.map((f) => f.id!.toString()))

  // Draw main map
  mapGroup
    .selectAll('path')
    // skip territory shapes on national map
    .data(renderedFeatures)
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
    .attr('stroke', (d) =>
      getStrokeColor({
        d,
        dataMap,
        colorScale: colorScale as ColorScale,
        isExtremesMode: isExtremesMode,
        mapConfig: mapConfig,
        isMultiMap: isMulti,
      }),
    )
    .attr('stroke-width', STROKE_WIDTH)
    .attr('aria-hidden', (d: any) => (isExtremesContext(d) ? 'true' : null))
    .attr('role', (d: any) => (isExtremesContext(d) ? null : 'img'))
    .attr('tabindex', '-1')
    .attr('aria-label', (d: any) => {
      if (isExtremesContext(d)) return null
      const id = d.id?.toString()
      const name = d.properties?.name ?? id ?? 'Unknown'
      const namePlace = geographyType ? `${name} ${geographyType}` : name
      const mapData = dataMap.get(id)
      if (!mapData || mapData.value == null) {
        return `${namePlace}: ${
          mapData?.isSuppressed ? DATA_SUPPRESSED : NO_DATA_MESSAGE
        }`
      }
      const formattedValue = formatMetricValue(
        mapData.value as number,
        metricConfig,
      )
      const label = tooltipLabel
        ? `${tooltipLabel} ${formattedValue}`
        : formattedValue
      return `${namePlace}: ${label}`
    })
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
    renderedFipsIds,
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
