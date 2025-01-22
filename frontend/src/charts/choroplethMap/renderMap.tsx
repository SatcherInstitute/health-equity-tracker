import * as d3 from 'd3'
import { Fips } from '../../data/utils/Fips'
import { het } from '../../styles/DesignTokens'
import { getCountyAddOn } from '../mapHelperFunctions'
import { getFillColor } from './mapHelpers'
import { createUnknownLegend } from './mapLegendUtils'
import { getTooltipContent } from './tooltipUtils'
import type { InitializeSvgProps, RenderMapProps, TooltipPairs } from './types'

const { darkBlue: DARK_BLUE, redOrange: RED_ORANGE } = het
const STROKE_WIDTH = 0.5
const TOOLTIP_OFFSET = { x: 10, y: 10 }

export const renderMap = (props: RenderMapProps) => {
  const { features, projection } = props.geoData
  const geographyType = getCountyAddOn(props.fips, props.showCounties)
  const { colorScale, height, width, svgRef, tooltipContainer } = props

  // Clear existing SVG content and initialize
  d3.select(svgRef.current).selectAll('*').remove()
  const { legendGroup, mapGroup } = initializeSvg({ svgRef, width, height })

  projection.fitSize([width * 0.9, height * 0.9], features)
  const path = d3.geoPath(projection)

  const dataMap = new Map(
    props.data.map((d) => [d.fips, d[props.metric.metricId]]),
  )

  // Draw map
  mapGroup
    .selectAll('path')
    .data(features.features)
    .join('path')
    .attr('d', (d) => path(d) || '')
    .attr('fill', (d) => getFillColor({ d, dataMap, colorScale }))
    .attr('stroke', '#fff')
    .attr('stroke-width', STROKE_WIDTH)
    .on('mouseover', (event, d) =>
      handleMouseEvent(
        'mouseover',
        event,
        d,
        props.tooltipPairs,
        props.colorScale,
        dataMap,
        tooltipContainer,
        geographyType,
      ),
    )
    .on('mousemove', (event, d) =>
      handleMouseEvent(
        'mousemove',
        event,
        d,
        props.tooltipPairs,
        props.colorScale,
        dataMap,
        tooltipContainer,
        geographyType,
      ),
    )
    .on('mouseout', (event, d) =>
      handleMouseEvent(
        'mouseout',
        event,
        d,
        props.tooltipPairs,
        props.colorScale,
        dataMap,
        tooltipContainer,
        geographyType,
      ),
    )
    .on('click', (event, d) => handleMapClick(d, props.updateFipsCallback))

  if (!props.hideLegend) {
    createUnknownLegend(legendGroup, {
      width,
      colorScale,
      title: '% unknown',
      isPct: true,
    })
  }
}

const initializeSvg = (props: InitializeSvgProps) => {
  const margin = { top: 20, right: 20, bottom: 20, left: 20 }
  const svg = d3
    .select(props.svgRef.current)
    .attr('width', props.width)
    .attr('height', props.height)

  return {
    svg,
    legendGroup: svg
      .append('g')
      .attr('class', 'legend-container')
      .attr('transform', `translate(${margin.left}, ${margin.top})`),
    mapGroup: svg
      .append('g')
      .attr('class', 'map-container')
      .attr('transform', `translate(${margin.left}, ${margin.top + 30})`),
  }
}

const handleMouseEvent = (
  type: 'mouseover' | 'mousemove' | 'mouseout',
  event: any,
  d: any,
  tooltipPairs: TooltipPairs,
  colorScale: d3.ScaleSequential<string>,
  dataMap?: Map<string, number>,
  tooltipContainer?: d3.Selection<HTMLDivElement, unknown, HTMLElement, any>,
  geographyType?: string,
) => {
  if (type === 'mouseover' && d && dataMap) {
    const value = dataMap.get(d.id as string)
    d3.select(event.currentTarget)
      .attr('fill', value !== undefined ? DARK_BLUE : RED_ORANGE)
      .style('cursor', 'pointer')
    tooltipContainer
      ?.style('visibility', 'visible')
      .html(getTooltipContent(d, value, tooltipPairs, geographyType))
  } else if (type === 'mousemove') {
    tooltipContainer
      ?.style('top', `${event.pageY + TOOLTIP_OFFSET.y}px`)
      .style('left', `${event.pageX + TOOLTIP_OFFSET.x}px`)
  } else if (type === 'mouseout' && d && dataMap) {
    d3.select(event.currentTarget).attr(
      'fill',
      getFillColor({ d, dataMap, colorScale }),
    )
    tooltipContainer?.style('visibility', 'hidden').html('')
  }
}

const handleMapClick = (d: any, updateFipsCallback: (fips: Fips) => void) => {
  const clickedFips = d.id as string
  if (clickedFips) {
    updateFipsCallback(new Fips(clickedFips))
    location.hash = '#unknown-demographic-map'
  }
}
