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
import { createEventHandler, createMouseEventProps } from './mouseEventHandlers'
import { getTooltipLabel, hideTooltips } from './tooltipUtils'
import type { InitializeSvgProps, RenderMapProps } from './types'

const { white: WHITE, borderColor: BORDER_GREY } = het
const MARGIN = { top: 0, right: 0, bottom: 0, left: 0 }

export const renderMap = (props: RenderMapProps) => {
  d3.select(props.svgRef.current).selectAll('*').remove()

  const territoryHeight = props.fips.isUsa()
    ? TERRITORIES.marginTop + TERRITORIES.radius * 2
    : 0
  const mapHeight = props.height - territoryHeight

  const { mapGroup } = initializeSvg({
    svgRef: props.svgRef,
    width: props.width,
    height: props.height,
    mapHeight,
    isMobile: props.isMobile,
    isUnknownsMap: props.isUnknownsMap,
  })

  const { features, projection } = props.geoData
  const geographyType = getCountyAddOn(props.fips, props.showCounties)

  projection.fitSize(
    [props.width, props.isUnknownsMap ? mapHeight * 0.8 : mapHeight],
    features,
  )
  const path = d3.geoPath(projection)

  const tooltipLabel = getTooltipLabel(
    props.isUnknownsMap,
    props.metricConfig,
    props.activeDemographicGroup,
    props.demographicType,
  )
  const numeratorPhrase = getNumeratorPhrase(
    props.isCawp,
    props.countColsMap,
    props.demographicType,
    props.activeDemographicGroup,
  )
  const denominatorPhrase = getDenominatorPhrase(
    props.isCawp,
    props.countColsMap,
    props.demographicType,
    props.activeDemographicGroup,
  )

  const dataMap = createDataMap(
    props.dataWithHighestLowest,
    tooltipLabel,
    props.metricConfig,
    numeratorPhrase,
    denominatorPhrase,
    props.countColsMap,
  )

  const mouseEventProps = createMouseEventProps(props, dataMap, geographyType)

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
        (f) =>
          f.id && (!props.fips.isUsa() || !TERRITORY_CODES[f.id.toString()]),
      ),
    )
    .join('path')
    .attr('d', (d) => path(d) || '')
    .attr('fill', (d) =>
      getFillColor({
        d,
        dataMap,
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
        typeof props.signalListeners.click === 'function'
      ) {
        props.signalListeners.click(event, d)
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

const initializeSvg = (props: ExtendedInitializeSvgProps) => {
  const { left, top } = MARGIN

  const svg = d3
    .select(props.svgRef.current)
    .attr('width', props.width)
    .attr('height', props.height)

  return {
    mapGroup: svg
      .append('g')
      .attr('class', 'map-container')
      .attr(
        'transform',
        `translate(${left}, ${props.isMobile ? top + 10 : top})`,
      ),
  }
}
