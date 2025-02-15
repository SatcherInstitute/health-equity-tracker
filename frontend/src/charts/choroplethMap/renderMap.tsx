import * as d3 from 'd3'
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
  const { features, projection } = geoData
  const geographyType = getCountyAddOn(fips, showCounties)

  d3.select(svgRef.current).selectAll('*').remove()
  const { legendGroup, mapGroup } = initializeSvg({
    svgRef,
    width,
    height,
    isMobile,
    isUnknownsMap,
  })

  projection.fitSize([width, isUnknownsMap ? height * 0.8 : height], features)
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

  // Draw map
  mapGroup
    .selectAll('path')
    .data(features.features)
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
      }),
    )
    .on('click', signalListeners.click)

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

const initializeSvg = ({
  svgRef,
  width,
  height,
  isMobile,
  isUnknownsMap,
}: InitializeSvgProps) => {
  let { left, top } = MARGIN
  if (isUnknownsMap) {
    top = 20
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
